create table climate_private.reactions (
    contribution_id uuid not null references climate_private.contributions (id) on delete cascade,
    reactor_key text not null check (reactor_key ~ '^[0-9a-f]{64}$'),
    created_at timestamptz not null default now(),
    primary key (contribution_id, reactor_key)
);

alter table climate_private.reactions enable row level security;
revoke all on table climate_private.reactions from public, anon, authenticated;
grant select (contribution_id, reactor_key), insert (contribution_id, reactor_key), delete
    on climate_private.reactions to service_role;

alter table climate_private.rate_limits drop constraint rate_limits_form_name_check;
alter table climate_private.rate_limits add check (form_name in ('contribute', 'subscribe', 'react'));

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
        where limits.attempts < case when p_form_name = 'react' then 120 else 6 end
    returning true into allowed;

    return coalesce(allowed, false);
end;
$$;

create function public.climate_wall_with_reactions(p_reactor_key text default null)
returns table (id uuid, topic text, body text, reactions integer, reacted boolean)
language sql
stable
security invoker
set search_path = ''
as $$
    select contribution.id, contribution.topic, contribution.body, reaction.total, reaction.reacted
    from public.climate_wall() with ordinality as contribution
    cross join lateral (
        select count(*)::integer as total,
               coalesce(bool_or(item.reactor_key = p_reactor_key), false) as reacted
        from climate_private.reactions as item
        where item.contribution_id = contribution.id
    ) as reaction
    order by contribution.ordinality;
$$;

create function public.climate_react(
    p_contribution_id uuid, p_reactor_key text, p_client_key text, p_liked boolean
)
returns table (outcome text, reactions integer, reacted boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    already_liked boolean;
begin
    -- Serialize reactions to an entry so each successful caller receives the committed total.
    perform pg_advisory_xact_lock(hashtextextended('climate-react:' || p_contribution_id::text, 0));

    if not exists (
        select 1 from climate_private.contributions as contribution
        where contribution.id = p_contribution_id
          and contribution.visibility = 'public' and contribution.status = 'published'
    ) then
        return query select 'unavailable'::text, 0, false;
        return;
    end if;

    select exists (
        select 1 from climate_private.reactions as item
        where item.contribution_id = p_contribution_id and item.reactor_key = p_reactor_key
    ) into already_liked;

    if p_liked and not already_liked then
        if not climate_private.allow_request('react', p_client_key) then
            return query select 'rate_limited'::text, 0, false;
            return;
        end if;

        insert into climate_private.reactions (contribution_id, reactor_key)
        select contribution.id, p_reactor_key
        from climate_private.contributions as contribution
        where contribution.id = p_contribution_id
          and contribution.visibility = 'public' and contribution.status = 'published'
        on conflict (contribution_id, reactor_key) do nothing;

        if not found then
            return query select 'unavailable'::text, 0, false;
            return;
        end if;
    elsif not p_liked and already_liked then
        delete from climate_private.reactions as item
        using climate_private.contributions as contribution
        where contribution.id = p_contribution_id
          and contribution.visibility = 'public' and contribution.status = 'published'
          and item.contribution_id = contribution.id
          and item.reactor_key = p_reactor_key;

        if not found then
            return query select 'unavailable'::text, 0, false;
            return;
        end if;
    end if;

    return query
        select 'accepted'::text, count(*)::integer,
               coalesce(bool_or(item.reactor_key = p_reactor_key), false)
        from climate_private.reactions as item
        where item.contribution_id = p_contribution_id;
end;
$$;

revoke all on function public.climate_wall_with_reactions(text) from public, anon, authenticated;
revoke all on function public.climate_react(uuid, text, text, boolean) from public, anon, authenticated;
grant execute on function public.climate_wall_with_reactions(text) to service_role;
grant execute on function public.climate_react(uuid, text, text, boolean) to service_role;
