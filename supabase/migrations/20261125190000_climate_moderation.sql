-- Store the automated screening result with each submission so editors can sort the queue,
-- audit blocked posts for false positives, and optionally let clean posts publish immediately.

alter table climate_private.contributions
    add column moderation_verdict text check (moderation_verdict in ('allow', 'review', 'block')),
    add column moderation_categories text[] not null default '{}',
    add column moderation_reason text check (char_length(moderation_reason) <= 300),
    add column moderation_model text check (char_length(moderation_model) <= 120),
    -- The AI's 1–6 word condensation. Editors can publish it instead of the full text.
    add column moderation_term text check (char_length(moderation_term) <= 60);

-- Match the existing column-level grants: the server key may insert exactly these fields.
grant insert (
    status, published_body,
    moderation_verdict, moderation_categories, moderation_reason, moderation_model, moderation_term
) on climate_private.contributions to service_role;
grant select (
    moderation_verdict, moderation_categories, moderation_reason, moderation_model, moderation_term
)
    on climate_private.contributions to service_role;

create index climate_moderation_queue on climate_private.contributions (moderation_verdict, created_at desc)
    where visibility = 'public' and status = 'pending';

create function public.climate_contribute_moderated(
    p_body text,
    p_visibility text,
    p_topic text,
    p_submission_key text,
    p_client_key text,
    p_verdict text,
    p_categories text[],
    p_reason text,
    p_model text,
    p_term text,
    p_publish boolean
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
    publish boolean := p_publish and p_visibility = 'public' and p_verdict = 'allow';
begin
    if not climate_private.allow_request('contribute', p_client_key) then
        return false;
    end if;

    insert into climate_private.contributions (
        body, visibility, topic, submission_key, status, published_body,
        moderation_verdict, moderation_categories, moderation_reason, moderation_model, moderation_term
    )
    values (
        p_body, p_visibility, p_topic, p_submission_key,
        case when publish then 'published' when p_verdict = 'block' then 'removed' else 'pending' end,
        case when publish then coalesce(nullif(btrim(p_term), ''), btrim(p_body)) end,
        p_verdict, coalesce(p_categories, '{}'), left(p_reason, 300), left(p_model, 120),
        nullif(left(btrim(p_term), 60), '')
    )
    on conflict do nothing;

    return true;
end;
$$;

revoke all on function public.climate_contribute_moderated(
    text, text, text, text, text, text, text[], text, text, text, boolean
) from public, anon, authenticated;
grant execute on function public.climate_contribute_moderated(
    text, text, text, text, text, text, text[], text, text, text, boolean
) to service_role;
