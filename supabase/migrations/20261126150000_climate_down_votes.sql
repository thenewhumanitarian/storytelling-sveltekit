-- Up and down votes. A reactor's single row per thought now has weight -1 (down), 1 (up) or
-- 2 (golden boost). The wall shows the net score; each visitor sees their own vote.
-- Requires 20261125200000_climate_reaction_boost.sql.

alter table climate_private.reactions drop constraint reactions_weight_check;
alter table climate_private.reactions
    add constraint reactions_weight_check check (weight in (-1, 1, 2));

drop function public.climate_wall_with_reactions(text);

create function public.climate_wall_with_reactions(p_reactor_key text default null)
returns table (
    id uuid, topic text, body text, reactions integer, reacted boolean, boosted boolean,
    downvoted boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
    select contribution.id, contribution.topic, contribution.body,
           reaction.total, reaction.reacted, reaction.boosted, reaction.downvoted
    from public.climate_wall() with ordinality as contribution
    cross join lateral (
        select coalesce(sum(item.weight), 0)::integer as total,
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight > 0), false)
                   as reacted,
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = 2), false)
                   as boosted,
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = -1), false)
                   as downvoted
        from climate_private.reactions as item
        where item.contribution_id = contribution.id
    ) as reaction
    order by contribution.ordinality;
$$;

drop function public.climate_react_weighted(uuid, text, text, smallint);

-- p_weight: -1 down, 0 removes your vote, 1 up, 2 golden boost.
create function public.climate_react_weighted(
    p_contribution_id uuid, p_reactor_key text, p_client_key text, p_weight smallint
)
returns table (outcome text, reactions integer, reacted boolean, boosted boolean, downvoted boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
    current_weight smallint;
begin
    if p_weight is null or p_weight not in (-1, 0, 1, 2) then
        raise exception 'Reaction weight must be -1, 0, 1 or 2';
    end if;

    perform pg_advisory_xact_lock(hashtextextended('climate-react:' || p_contribution_id::text, 0));

    if not exists (
        select 1 from climate_private.contributions as contribution
        where contribution.id = p_contribution_id
          and contribution.visibility = 'public' and contribution.status = 'published'
    ) then
        return query select 'unavailable'::text, 0, false, false, false;
        return;
    end if;

    select item.weight into current_weight
    from climate_private.reactions as item
    where item.contribution_id = p_contribution_id and item.reactor_key = p_reactor_key;

    if p_weight <> 0 and current_weight is distinct from p_weight then
        if not climate_private.allow_request('react', p_client_key) then
            return query select 'rate_limited'::text, 0, false, false, false;
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
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight > 0), false),
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = 2), false),
               coalesce(bool_or(item.reactor_key = p_reactor_key and item.weight = -1), false)
        from climate_private.reactions as item
        where item.contribution_id = p_contribution_id;
end;
$$;

revoke all on function public.climate_wall_with_reactions(text) from public, anon, authenticated;
revoke all on function public.climate_react_weighted(uuid, text, text, smallint)
    from public, anon, authenticated;
grant execute on function public.climate_wall_with_reactions(text) to service_role;
grant execute on function public.climate_react_weighted(uuid, text, text, smallint) to service_role;
