const http = require('http');
const fs = require('fs');
const path = require('path');
const { formidable } = require('formidable');
const { importarMaestrosDesdeExcel } = require('./utils/importExcel');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Acceso denegado' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'Ruta no encontrada' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    const form = formidable({
      uploadDir: UPLOADS_DIR,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return sendJson(res, 400, { error: 'Error al procesar archivo' });
      }

      try {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file?.filepath) {
          return sendJson(res, 400, { error: 'No se recibió archivo' });
        }
        await importarMaestrosDesdeExcel(file.filepath);
        sendJson(res, 200, { message: 'Archivo importado correctamente' });
      } catch (e) {
        console.error(e);
        sendJson(res, 500, { error: 'Error al importar a la base de datos' });
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/maestros') {
    const { sql, config } = require('./config/db');
    sql
      .connect(config)
      .then((pool) => pool.request().query('SELECT * FROM Maestros'))
      .then((result) => sendJson(res, 200, result.recordset))
      .catch((err) => {
        console.error(err);
        sendJson(res, 500, { error: 'Error al obtener maestros' });
      });
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 404, { error: 'Ruta no encontrada' });
});

server.listen(PORT, () => {
  console.log(`ScheduleLab escuchando en http://localhost:${PORT}`);
});
