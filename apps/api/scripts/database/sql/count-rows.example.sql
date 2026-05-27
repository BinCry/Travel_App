-- Copy to counts.sql (do not commit real secrets inside SQL files).
-- Run from psql or any PostgreSQL client against your project DB.

SELECT 'Place' AS table_name, COUNT(*)::bigint FROM "Place"
UNION ALL
SELECT 'User', COUNT(*)::bigint FROM "User"
UNION ALL
SELECT 'Review', COUNT(*)::bigint FROM "Review";
