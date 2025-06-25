const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable'); // manejar formularios
const { importarMaestrosDesdeExcel } = require('./utils/importExcel');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload') {
    const form = new formidable.IncomingForm({ uploadDir: './uploads', keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Error al procesar archivo' }));
      }

      try {
        const filePath = files.file[0].filepath;
        await importarMaestrosDesdeExcel(filePath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Archivo importado correctamente' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al importar a la base de datos' }));
      }
    });
  }

  // Para obtener maestros
  else if (req.method === 'GET' && req.url === '/maestros') {
    const { sql, config } = require('./config/db');
    sql.connect(config).then(pool => {
      return pool.request().query('SELECT * FROM Maestros');
    }).then(result => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.recordset));
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Error al obtener maestros' }));
    });
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

server.listen(3000, () => {
  console.log('Servidor sin Express escuchando en http://localhost:3000');
});
