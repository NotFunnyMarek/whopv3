-- Add discord_access property to modules JSON
UPDATE whops
SET modules = CASE
    WHEN modules IS NULL OR modules = '' THEN '{"discord_access":false}'
    WHEN JSON_VALID(modules) THEN
        CASE
            WHEN JSON_EXTRACT(modules, '$.discord_access') IS NULL THEN
                JSON_INSERT(modules, '$.discord_access', false)
            ELSE modules
        END
    ELSE modules
END;
