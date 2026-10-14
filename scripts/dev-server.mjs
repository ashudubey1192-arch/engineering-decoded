// Local full-stack harness: runs the same API handler deployed by Vercel.
import { createServer as createHttpServer } from 'node:http';
import { createServer as createViteServer } from 'vite';
import handler from '../api/index.js';
const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createHttpServer(async (req, res) => {
  if (!new URL(req.url, 'http://localhost').pathname.startsWith('/api/')) return vite.middlewares(req,res);
  res.status = code => { res.statusCode = code; return res; };
  res.json = value => { res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res; };
  try {
    let body='';
    for await (const chunk of req) {
      body += chunk;
      if (Buffer.byteLength(body)>1000000) return res.status(413).json({error:'Request too large'});
    }
    req.body=body ? JSON.parse(body) : {};
    await handler(req,res);
  } catch { if (!res.headersSent) res.status(400).json({error:'Invalid request'}); }
});
server.listen(5175,'127.0.0.1',()=>console.log('Full-stack local app: http://127.0.0.1:5175'));
