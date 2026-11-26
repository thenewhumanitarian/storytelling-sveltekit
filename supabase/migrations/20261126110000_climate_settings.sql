-- Runtime settings editors can change from /climate/admin without a redeploy.
-- Currently just auto_publish: whether AI-approved posts go straight onto the wall.

create table climate_private.settings (
    key text primary key check (key in ('auto_publish')),
    value jsonb not null,
    updated_at timestamptz not null default now()
);

alter table climate_private.settings enable row level security;
revoke all on table climate_private.settings from public, anon, authenticated;

insert into climate_private.settings (key, value) values ('auto_publish', 'true');

create function public.climate_settings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from climate_private.settings;
$$;

create function public.climate_admin_set_auto_publish(p_enabled boolean)
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
    values ('auto_publish', to_jsonb(p_enabled), now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
    return true;
end;
$$;

revoke all on function public.climate_settings() from public, anon, authenticated;
revoke all on function public.climate_admin_set_auto_publish(boolean) from public, anon, authenticated;
grant execute on function public.climate_settings() to service_role;
grant execute on function public.climate_admin_set_auto_publish(boolean) to service_role;
