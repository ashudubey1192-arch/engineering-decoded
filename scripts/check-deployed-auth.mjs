import {neon} from '@neondatabase/serverless';
try {
 const sql=neon(process.env.DATABASE_URL);
 console.log(JSON.stringify(await sql`SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='neon_auth' AND table_name='project_config'`));
 const page=await fetch('https://engineeringdecoded.com/account');const html=await page.text();
 const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>m[1]);
 for(const script of scripts){const text=await (await fetch(new URL(script,page.url))).text();console.log(JSON.stringify({script,authUrls:[...new Set(text.match(/https:\/\/[^\s"'`<>]*neonauth[^\s"'`<>]*/g)||[])]}));}
} catch(e){console.error(e.code||e.name);process.exitCode=1;}
