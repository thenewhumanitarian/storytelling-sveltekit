-- Moderation backend for /climate/admin: list every submission (public and private), move it
-- between queue / wall / hidden, edit the text shown on the wall, and delete it.
--
-- These run as SECURITY DEFINER so the admin can read private messages and moderation fields
-- without widening service_role's column grants. Only service_role may execute them, and the
-- app only calls them after checking the admin password session.

create function public.climate_admin_entries()
returns table (
    id uuid,
    created_at timestamptz,
    visibility text,
    status text,
    topic text,
    body text,
    published_body text,
    moderation_verdict text,
    moderation_categories text[],
    moderation_reason text,
    moderation_model text,
    moderation_term text,
    withdrawn_at timestamptz,
    reactions integer,
    boosts integer
)
language sql
stable
security definer
set search_path = ''
as $$
    select c.id, c.created_at, c.visibility, c.status, c.topic, c.body, c.published_body,
           c.moderation_verdict, c.moderation_categories, c.moderation_reason, c.moderation_model,
           c.moderation_term, c.withdrawn_at,
           coalesce(sum(r.weight), 0)::integer,
           count(r.*) filter (where r.weight = 2)::integer
    from climate_private.contributions as c
    left join climate_private.reactions as r on r.contribution_id = c.id
    group by c.id
    order by c.created_at desc;
$$;

-- p_status: 'pending' (queue), 'published' (on the wall) or 'removed' (hidden).
-- p_published_body: the text shown on the wall; defaults to the AI term, then the original.
create function public.climate_admin_update(p_id uuid, p_status text, p_published_body text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    entry climate_private.contributions;
    wall_text text;
begin
    if p_status not in ('pending', 'published', 'removed') then
        return 'invalid_status';
    end if;

    select * into entry from climate_private.contributions where id = p_id for update;
    if not found then
        return 'not_found';
    end if;

    if p_status = 'published' and entry.visibility <> 'public' then
        return 'private_cannot_publish';
    end if;

    wall_text := nullif(btrim(coalesce(p_published_body, '')), '');
    if p_status = 'published' then
        wall_text := coalesce(wall_text, entry.published_body, entry.moderation_term, btrim(entry.body));
        if char_length(wall_text) > 500 then
            return 'too_long';
        end if;
    end if;

    update climate_private.contributions
    set status = p_status,
        published_body = case
            when p_status = 'published' then wall_text
            when entry.visibility = 'public' then coalesce(wall_text, entry.published_body)
            else null
        end,
        withdrawn_at = case when p_status = 'published' then null else entry.withdrawn_at end
    where id = p_id;

    return 'ok';
end;
$$;

create function public.climate_admin_delete(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
    delete from climate_private.contributions where id = p_id;
    return found;
end;
$$;

revoke all on function public.climate_admin_entries() from public, anon, authenticated;
revoke all on function public.climate_admin_update(uuid, text, text) from public, anon, authenticated;
revoke all on function public.climate_admin_delete(uuid) from public, anon, authenticated;
grant execute on function public.climate_admin_entries() to service_role;
grant execute on function public.climate_admin_update(uuid, text, text) to service_role;
grant execute on function public.climate_admin_delete(uuid) to service_role;
