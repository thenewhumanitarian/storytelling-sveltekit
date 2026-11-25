create schema climate_private;

revoke all on schema climate_private from public, anon, authenticated;
grant usage on schema climate_private to service_role;

create table climate_private.contributions (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    body text not null,
    visibility text not null check (visibility in ('private', 'public')),
    topic text check (topic in ('water', 'land', 'rebuilding', 'adaptation')),
    submission_key text not null unique check (submission_key ~ '^[0-9a-f]{64}$'),
    status text not null default 'pending' check (status in ('pending', 'published', 'removed')),
    published_body text,
    check (char_length(btrim(body)) between 1 and
        case when visibility = 'public' then 500 else 1000 end),
    check (visibility = 'public' or (status <> 'published' and published_body is null)),
    check (status <> 'published' or
        (published_body is not null and char_length(btrim(published_body)) between 1 and 500))
);

create index climate_wall_created_at on climate_private.contributions (created_at desc, id)
    where visibility = 'public' and status = 'published';

create table climate_private.subscriptions (
    email text primary key check (
        email = lower(btrim(email))
        and char_length(email) between 3 and 254
        and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    ),
    consented_at timestamptz not null default now(),
    consent_version text not null default 'climate-updates-v1'
);

create table climate_private.rate_limits (
    window_id bigint not null,
    form_name text not null check (form_name in ('contribute', 'subscribe')),
    client_key text not null check (client_key ~ '^[0-9a-f]{64}$'),
    attempts integer not null check (attempts > 0),
    primary key (window_id, form_name, client_key)
);

alter table climate_private.contributions enable row level security;
alter table climate_private.subscriptions enable row level security;
alter table climate_private.rate_limits enable row level security;
revoke all on all tables in schema climate_private from public, anon, authenticated;

grant insert (body, visibility, topic, submission_key) on climate_private.contributions to service_role;
grant select (id, created_at, published_body, visibility, topic, status)
    on climate_private.contributions to service_role;
grant insert (email) on climate_private.subscriptions to service_role;
grant select, insert, update, delete on climate_private.rate_limits to service_role;

-- Moderators may edit the public copy or withdraw it. The original choice cannot be upgraded.
create function climate_private.keep_submission_visibility()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if new.visibility is distinct from old.visibility then
        raise exception 'Submission visibility is immutable';
    end if;
    return new;
end;
$$;

revoke all on function climate_private.keep_submission_visibility() from public, anon, authenticated;

create trigger climate_submission_visibility
before update of visibility on climate_private.contributions
for each row execute function climate_private.keep_submission_visibility();

create function climate_private.allow_request(p_form_name text, p_client_key text)
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
        where limits.attempts < 6
    returning true into allowed;

    return coalesce(allowed, false);
end;
$$;

revoke all on function climate_private.allow_request(text, text) from public, anon, authenticated;
grant execute on function climate_private.allow_request(text, text) to service_role;

create function public.climate_contribute(
    p_body text, p_visibility text, p_topic text, p_submission_key text, p_client_key text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if not climate_private.allow_request('contribute', p_client_key) then
        return false;
    end if;

    insert into climate_private.contributions (body, visibility, topic, submission_key)
    values (p_body, p_visibility, p_topic, p_submission_key)
    on conflict do nothing;

    return true;
end;
$$;

create function public.climate_subscribe(p_email text, p_client_key text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if not climate_private.allow_request('subscribe', p_client_key) then
        return false;
    end if;

    insert into climate_private.subscriptions (email)
    values (p_email)
    on conflict do nothing;

    return true;
end;
$$;

create function public.climate_wall()
returns table (id uuid, topic text, body text)
language sql
stable
security invoker
set search_path = ''
as $$
    select contribution.id, contribution.topic, contribution.published_body
    from climate_private.contributions as contribution
    where contribution.visibility = 'public' and contribution.status = 'published'
    order by contribution.created_at desc, contribution.id
    limit 30;
$$;

revoke all on function public.climate_contribute(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.climate_subscribe(text, text) from public, anon, authenticated;
revoke all on function public.climate_wall() from public, anon, authenticated;
grant execute on function public.climate_contribute(text, text, text, text, text) to service_role;
grant execute on function public.climate_subscribe(text, text) to service_role;
grant execute on function public.climate_wall() to service_role;
