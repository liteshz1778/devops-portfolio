// GET /api/error?code=503
//
// Returns a real HTTP response with the requested status code, body set to
// the matching themed error page from /errors/<code>.html.
//
// Use this to actually test each status (curl -i, browser devtools Network
// tab) since static .html files always serve as 200 on their own — only a
// function like this can set the real response code. It also doubles as
// the pattern to reuse if you add real API routes later: catch the error,
// pick the right code, call sendError(res, code).

const fs = require('fs');
const path = require('path');

const SUPPORTED_CODES = ['400', '401', '403', '404', '429', '500', '501', '502', '503', '504'];

module.exports = (req, res) => {
  const requested = String(req.query.code || '503');
  const code = SUPPORTED_CODES.includes(requested) ? requested : '503';

  const filePath = path.join(process.cwd(), 'errors', `${code}.html`);

  try {
    const html = fs.readFileSync(filePath, 'utf8');
    res.status(Number(code)).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    // Fallback if the file is somehow missing — still return the real code.
    res.status(Number(code)).setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(`${code} — service unavailable. Please check back again later.`);
  }
};
