const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_API_KEY || '';
const CHATANYWHERE_API_KEY = process.env.CHATANYWHERE_API_KEY || 'sk-Nj9BwUPvlnKkPGct1XjWYO2x9Xe4Uch9q23iUYSQDatmfgPa';
const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/llama-3.1-nemotron-70b-instruct:free'
];
const PORT = 3000;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png'
};

const PROMPT = `You are a class content formatter. Convert the raw educational text into tagged format using ONLY these tags:

TITLE: (main heading of the class)
HEADER: (section heading, NOT for question solutions)
TEXT: (plain paragraph)
BOX: (important note or intro)
MATH: (formula or math content — standalone, not inside a question)
LIST: item1 | item2 | item3
Q: (question text only)
A: (FULL solution/explanation of the question — put ALL steps, methods, calculations here in one block)

CRITICAL Rules:
- Q must ALWAYS be immediately followed by A on the next line
- The ENTIRE solution of a question (all methods, all steps) must go inside A: — do NOT create separate MATH/HEADER/BOX sections for question solutions
- Multiple lines in A: are allowed — just keep writing after A: tag
- Use FRAC(num/den) for fractions. Example: 2/25 → FRAC(2/25)
- Use -> for arrow (→)
- Use => for therefore (∴)
- Use **text** for bold
- Use \n for line break within A: content
- Keep original language (Bengali/English mixed is fine)
- Output ONLY the tagged content, no extra explanation

Raw text:
`;

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // AI endpoint
  if (req.method === 'POST' && req.url === '/ai') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const { text } = JSON.parse(body);
      function tryModel(modelIndex) {
        if (modelIndex >= MODELS.length) {
          res.writeHead(500); res.end(JSON.stringify({ error: 'All models failed' })); return;
        }
        const payload = JSON.stringify({
          model: MODELS[modelIndex],
          messages: [{ role: 'user', content: PROMPT + text }]
        });
        const options = {
          hostname: 'openrouter.ai',
          path: '/api/v1/chat/completions',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        };
        const apiReq = https.request(options, apiRes => {
          let data = '';
          apiRes.on('data', d => data += d);
          apiRes.on('end', () => {
            try {
              const json = JSON.parse(data);
              if (json.error && json.error.code === 429) {
                console.log(`Model ${MODELS[modelIndex]} rate limited, trying next...`);
                setTimeout(() => tryModel(modelIndex + 1), 2000);
                return;
              }
              const result = json.choices[0].message.content;
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ result }));
            } catch (e) {
              res.writeHead(500); res.end(JSON.stringify({ error: data }));
            }
          });
        });
        apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
        apiReq.write(payload);
        apiReq.end();
      }
      tryModel(0);
    });
    return;
  }

  // AI Teacher endpoint
  if (req.method === 'POST' && req.url === '/ai-teacher') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const { messages } = JSON.parse(body);
      const payload = JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: 2000 });
      const options = {
        hostname: 'api.chatanywhere.tech',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHATANYWHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', d => data += d);
        apiRes.on('end', () => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        });
      });
      apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      apiReq.write(payload);
      apiReq.end();
    });
    return;
  }

  // AI Notebook endpoint (ChatAnywhere gpt-4o-mini)
  if (req.method === 'POST' && req.url === '/api/notebook-ai') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const { text, systemPrompt } = JSON.parse(body);
      const payload = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt || 'You are a notebook assistant. Format the student\'s learning into clean, structured notes in Bengali.' },
          { role: 'user', content: text }
        ],
        temperature: 0.20,
        max_tokens: 1024
      });
      const options = {
        hostname: 'api.chatanywhere.tech',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CHATANYWHERE_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      const apiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', d => data += d);
        apiRes.on('end', () => {
          try {
            const json = JSON.parse(data);
            const result = json.choices?.[0]?.message?.content || '';
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result }));
          } catch (e) {
            res.writeHead(500); res.end(JSON.stringify({ error: data }));
          }
        });
      });
      apiReq.on('error', e => { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); });
      apiReq.write(payload);
      apiReq.end();
    });
    return;
  }

  // Static file server
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    const cacheMaxAge = ext === '.html' ? 0 : 31536000;
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'text/plain',
      'Cache-Control': `public, max-age=${cacheMaxAge}`,
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
