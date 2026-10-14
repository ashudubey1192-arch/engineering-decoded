import { neon } from '@neondatabase/serverless';
try {
 const sql = neon(process.env.DATABASE_URL);
 const [result] = await sql`SELECT current_database() AS database, to_regclass('neon_auth.user') IS NOT NULL AS auth_enabled, to_regclass('app.users') IS NOT NULL AS app_ready`;
 console.log(JSON.stringify(result));
} catch(error) { console.error('Connection check failed:', error.code || error.name); process.exitCode=1; }
