import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT ?? 3001);
const sitesPath = fileURLToPath(new URL('./data/sites.json', import.meta.url));

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (request.method !== 'GET') {
    response.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (request.url === '/api/health') {
    response.writeHead(200).end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.url === '/api/sites') {
    try {
      const sites = await readFile(sitesPath, 'utf8');
      response.writeHead(200).end(sites);
    } catch {
      response.writeHead(500).end(JSON.stringify({ error: 'Could not load sites' }));
    }
    return;
  }

  response.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, () => {
  console.log(`LuNav API listening on http://localhost:${port}`);
});
