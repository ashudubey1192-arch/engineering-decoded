const base=process.env.VITE_NEON_AUTH_URL;
for (const path of ['/sign-in/email-otp','/email-otp/send-verification-otp','/get-session']) {
 try {
  const r=await fetch(base+path,{method:path==='/get-session'?'GET':'POST',headers:{'Content-Type':'application/json',Origin:'http://localhost:5175'},...(path==='/get-session'?{}:{body:JSON.stringify({})})});
  const data=await r.json().catch(()=>({}));
  console.log(JSON.stringify({path,status:r.status,code:data.code,message:data.message}));
 } catch(e) {console.log({path,error:e.name});}
}
