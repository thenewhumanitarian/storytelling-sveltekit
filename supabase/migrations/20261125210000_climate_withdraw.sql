-- Authors can take their own public thought off the wall. TNH keeps the row (status 'removed',
-- withdrawn_at set) so editors still see it privately; it just stops being shown.
--
-- Proof of authorship is the submission key: an HMAC the server computed when the post was made and
-- handed only to the submitting browser. It is unguessable and identifies exactly one row.

alter table climate_private.contributions add column withdrawn_at timestamptz;

grant select (withdrawn_at), update (status, withdrawn_at)
    on climate_private.contributions to service_role;

create function public.climate_withdraw(p_submission_key text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if p_submission_key is null or p_submission_key !~ '^[0-9a-f]{64}$' then
        return false;
    end if;

    update climate_private.contributions
    set status = 'removed', withdrawn_at = now()
    where submission_key = p_submission_key
      and visibility = 'public'
      and status in ('pending', 'published');

    return found;
end;
$$;

revoke all on function public.climate_withdraw(text) from public, anon, authenticated;
grant execute on function public.climate_withdraw(text) to service_role;
