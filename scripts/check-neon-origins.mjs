import { neon } from '@neondatabase/serverless';
try {
 const sql=neon(process.env.DATABASE_URL);
 console.log(JSON.stringify(await sql`SELECT table_schema,table_name FROM information_schema.tables WHERE table_schema IN ('app','neon_auth') ORDER BY table_schema,table_name`));
 for(const origin of ['https://engineeringdecoded.com','https://www.engineeringdecoded.com','http://localhost:5175']) {
  const r=await fetch(process.env.VITE_NEON_AUTH_URL+'/update-user',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});
  const d=await r.json().catch(()=>({}));
  console.log(JSON.stringify({origin,status:r.status,code:d.code,message:d.message}));
 }
} catch(e) {console.error('Diagnostic failed:',e.code||e.name);process.exitCode=1;}
