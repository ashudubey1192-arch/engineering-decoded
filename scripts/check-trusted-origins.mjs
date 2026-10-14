import {neon} from '@neondatabase/serverless';
try {const sql=neon(process.env.DATABASE_URL);console.log(JSON.stringify(await sql`SELECT endpoint_id,trusted_origins,allow_localhost FROM neon_auth.project_config`));}catch(e){console.error(e.code||e.name);process.exitCode=1;}
