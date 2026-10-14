import { neon } from '@neondatabase/serverless';
try {
 const url = new URL(process.env.DATABASE_URL);
 url.pathname='/neondb';
 const sql=neon(url.toString());
 const [result]=await sql`SELECT current_database() AS database, to_regclass('neon_auth.user') IS NOT NULL AS auth_enabled`;
 console.log(JSON.stringify(result));
} catch(e) { console.log('Auth database inspection failed:', e.code || e.name); process.exitCode=1; }
