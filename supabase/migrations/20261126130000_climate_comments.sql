-- Comment threads on wall thoughts. Same moderation model as posts: an AI verdict is stored with
-- each comment, AI-approved comments publish straight away when auto-publish is on, borderline ones
-- wait for an editor, and blocked ones are kept hidden so an editor can unblock a false positive.
--
-- Editors can switch comments off from /climate/admin: existing comments are kept but hidden and new
-- ones are refused, enforced here in the database. Requires 20261126110000_climate_settings.sql.

alter table climate_private.settings drop constraint settings_key_check;
alter table climate_private.settings add check (key in ('auto_publish', 'comments_enabled'));
insert into climate_private.settings (key, value) values ('comments_enabled', 'true')
on conflict (key) do nothing;

create function climate_private.comments_on()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select coalesce(
        (select value = 'true'::jsonb from climate_private.settings where key = 'comments_enabled'),
        true
    );
$$;

revoke all on function climate_private.comments_on() from public, anon, authenticated;

create function public.climate_admin_set_comments(p_enabled boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_enabled is null then
        return false;
    end if;
    insert into climate_private.settings (key, value, updated_at)
    values ('comments_enabled', to_jsonb(p_enabled), now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
    return true;
end;
$$;

revoke all on function public.climate_admin_set_comments(boolean) from public, anon, authenticated;
grant execute on function public.climate_admin_set_comments(boolean) to service_role;

alter table climate_private.rate_limits drop constraint rate_limits_form_name_check;
alter table climate_private.rate_limits
    add check (form_name in ('contribute', 'subscribe', 'react', 'comment'));

-- Same limiter as before, with a roomier allowance for comments (20 per 10 minutes).
create or replace function climate_private.allow_request(p_form_name text, p_client_key text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
    current_window bigint := floor(extract(epoch from now()) / 600);
    allowed boolean := false;
begin
    delete from climate_private.rate_limits where window_id < current_window - 12;

    insert into climate_private.rate_limits as limits (window_id, form_name, client_key, attempts)
    values (current_window, p_form_name, p_client_key, 1)
    on conflict (window_id, form_name, client_key) do update
        set attempts = limits.attempts + 1
        where limits.attempts < case p_form_name
            when 'react' then 120
            when 'comment' then 20
            else 6
        end
    returning true into allowed;

    return coalesce(allowed, false);
end;
$$;

create table climate_private.comments (
    id uuid primary key default gen_random_uuid(),
    contribution_id uuid not null
        references climate_private.contributions (id) on delete cascade,
    created_at timestamptz not null default now(),
    body text not null check (char_length(btrim(body)) between 1 and 300),
    status text not null default 'pending' check (status in ('pending', 'published', 'removed')),
    submission_key text not null unique check (submission_key ~ '^[0-9a-f]{64}$'),
    moderation_verdict text check (moderation_verdict in ('allow', 'review', 'block')),
    moderation_categories text[] not null default '{}',
    moderation_reason text check (char_length(moderation_reason) <= 300),
    moderation_model text check (char_length(moderation_model) <= 120)
);

create index climate_comments_thread on climate_private.comments (contribution_id, created_at)
    where status = 'published';

alter table climate_private.comments enable row level security;
revoke all on table climate_private.comments from public, anon, authenticated;

-- Published comments on a thought that is itself live on the wall.
create function public.climate_comments(p_contribution_id uuid)
returns table (id uuid, created_at timestamptz, body text)
language sql
stable
security definer
set search_path = ''
as $$
    select c.id, c.created_at, c.body
    from climate_private.comments as c
    join climate_private.contributions as t on t.id = c.contribution_id
    where c.contribution_id = p_contribution_id
      and c.status = 'published'
      and t.visibility = 'public' and t.status = 'published'
      and climate_private.comments_on()
    order by c.created_at;
$$;

create function public.climate_comment_counts()
returns table (contribution_id uuid, comments integer)
language sql
stable
security definer
set search_path = ''
as $$
    select c.contribution_id, count(*)::integer
    from climate_private.comments as c
    where c.status = 'published' and climate_private.comments_on()
    group by c.contribution_id;
$$;

-- Returns 'ok', 'rate_limited', 'disabled' (comments switched off) or 'unavailable' (the thought
-- isn't live on the wall).
create function public.climate_add_comment(
    p_contribution_id uuid,
    p_body text,
    p_submission_key text,
    p_client_key text,
    p_verdict text,
    p_categories text[],
    p_reason text,
    p_model text,
    p_publish boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not climate_private.comments_on() then
        return 'disabled';
    end if;

    if not exists (
        select 1 from climate_private.contributions
        where id = p_contribution_id and visibility = 'public' and status = 'published'
    ) then
        return 'unavailable';
    end if;

    if not climate_private.allow_request('comment', p_client_key) then
        return 'rate_limited';
    end if;

    insert into climate_private.comments (
        contribution_id, body, status, submission_key,
        moderation_verdict, moderation_categories, moderation_reason, moderation_model
    )
    values (
        p_contribution_id,
        btrim(p_body),
        case
            when p_verdict = 'block' then 'removed'
            when p_publish and p_verdict = 'allow' then 'published'
            else 'pending'
        end,
        p_submission_key,
        p_verdict, coalesce(p_categories, '{}'), left(p_reason, 300), left(p_model, 120)
    )
    on conflict do nothing;

    return 'ok';
end;
$$;

create function public.climate_admin_comments()
returns table (
    id uuid,
    contribution_id uuid,
    created_at timestamptz,
    body text,
    status text,
    moderation_verdict text,
    moderation_categories text[],
    moderation_reason text
)
language sql
stable
security definer
set search_path = ''
as $$
    select id, contribution_id, created_at, body, status,
           moderation_verdict, moderation_categories, moderation_reason
    from climate_private.comments
    order by created_at;
$$;

create function public.climate_admin_update_comment(p_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_status not in ('pending', 'published', 'removed') then
        return false;
    end if;
    update climate_private.comments set status = p_status where id = p_id;
    return found;
end;
$$;

create function public.climate_admin_delete_comment(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    delete from climate_private.comments where id = p_id;
    return found;
end;
$$;

revoke all on function public.climate_comments(uuid) from public, anon, authenticated;
revoke all on function public.climate_comment_counts() from public, anon, authenticated;
revoke all on function public.climate_add_comment(uuid, text, text, text, text, text[], text, text, boolean)
    from public, anon, authenticated;
revoke all on function public.climate_admin_comments() from public, anon, authenticated;
revoke all on function public.climate_admin_update_comment(uuid, text) from public, anon, authenticated;
revoke all on function public.climate_admin_delete_comment(uuid) from public, anon, authenticated;

grant execute on function public.climate_comments(uuid) to service_role;
grant execute on function public.climate_comment_counts() to service_role;
grant execute on function public.climate_add_comment(uuid, text, text, text, text, text[], text, text, boolean)
    to service_role;
grant execute on function public.climate_admin_comments() to service_role;
grant execute on function public.climate_admin_update_comment(uuid, text) to service_role;
grant execute on function public.climate_admin_delete_comment(uuid) to service_role;
