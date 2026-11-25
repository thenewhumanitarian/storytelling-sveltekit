-- climate_withdraw finds the author's row by submission_key. Postgres needs SELECT on every column
-- an UPDATE's WHERE clause reads, and service_role was only granted SELECT on the public-safe
-- columns, so withdrawing failed with "permission denied for table contributions".

grant select (submission_key) on climate_private.contributions to service_role;
