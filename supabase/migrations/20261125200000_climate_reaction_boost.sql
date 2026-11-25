-- Hidden easter egg: double-clicking a thought "boosts" it, counting as +2 instead of +1.
-- Each reactor still has at most one row per contribution; the row now carries a weight.

alter table climate_private.reactions
    add column weight smallint not null default 1 check (weight between 1 and 2);

grant select (weight), insert (weight), update (weight) on climate_private.reactions to service_role;

drop function public.climate_wall_with_reactions(text);

create function public.climate_wall_with_reactions(p_reactor_key text default null)
returns table (id uuid, topic text, body text, reactions integer, reacted boolean, boosted boolean)
language sql
stable
security invoker
set search_path = ''
as $$
    select contribution.id, contribution.topic, contribution.body,
           reaction.total, reaction.reacted, reaction.boosted
    from public.climate_wall() with ordinality as contribution
    cross join lateral (
        select coalesce(sum(item.weight), 0)::integer as total,
               coalesce(bool_or(item.reactor_key = p_reactor_key), false) as reacted,
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = 2), false) as boosted
        from climate_private.reactions as item
        where item.contribution_id = contribution.id
    ) as reaction
    order by contribution.ordinality;
$$;

-- p_weight: 0 removes the reaction, 1 is a +1, 2 is a boost.
create function public.climate_react_weighted(
    p_contribution_id uuid, p_reactor_key text, p_client_key text, p_weight smallint
)
returns table (outcome text, reactions integer, reacted boolean, boosted boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    current_weight smallint;
begin
    if p_weight is null or p_weight not between 0 and 2 then
        raise exception 'Reaction weight must be 0, 1 or 2';
    end if;

    perform pg_advisory_xact_lock(hashtextextended('climate-react:' || p_contribution_id::text, 0));

    if not exists (
        select 1 from climate_private.contributions as contribution
        where contribution.id = p_contribution_id
          and contribution.visibility = 'public' and contribution.status = 'published'
    ) then
        return query select 'unavailable'::text, 0, false, false;
        return;
    end if;

    select item.weight into current_weight
    from climate_private.reactions as item
    where item.contribution_id = p_contribution_id and item.reactor_key = p_reactor_key;

    if p_weight > 0 and current_weight is distinct from p_weight then
        if not climate_private.allow_request('react', p_client_key) then
            return query select 'rate_limited'::text, 0, false, false;
            return;
        end if;

        insert into climate_private.reactions as item (contribution_id, reactor_key, weight)
        values (p_contribution_id, p_reactor_key, p_weight)
        on conflict (contribution_id, reactor_key) do update set weight = excluded.weight;
    elsif p_weight = 0 and current_weight is not null then
        delete from climate_private.reactions as item
        where item.contribution_id = p_contribution_id and item.reactor_key = p_reactor_key;
    end if;

    return query
        select 'accepted'::text, coalesce(sum(item.weight), 0)::integer,
               coalesce(bool_or(item.reactor_key = p_reactor_key), false),
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = 2), false)
        from climate_private.reactions as item
        where item.contribution_id = p_contribution_id;
end;
$$;

revoke all on function public.climate_wall_with_reactions(text) from public, anon, authenticated;
revoke all on function public.climate_react_weighted(uuid, text, text, smallint)
    from public, anon, authenticated;
grant execute on function public.climate_wall_with_reactions(text) to service_role;
grant execute on function public.climate_react_weighted(uuid, text, text, smallint) to service_role;
