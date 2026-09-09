const ExcelJS = require('exceljs');
const { sql, config } = require('../config/db');

async function importarMaestrosDesdeExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const pool = await sql.connect(config);

  try {
    const inserts = [];
    sheet.eachRow((row, index) => {
      if (index === 1) return; // Saltar encabezado

      const nombre = row.getCell(1).value;
      const horas = row.getCell(2).value;

      if (!nombre || isNaN(horas)) {
        throw new Error(`Datos inválidos en fila ${index}`);
      }
      console.log(`Fila ${index}: nombre=${nombre}, horas=${horas}`);

      inserts.push(
        pool
          .request()
          .input('nombre', sql.NVarChar, String(nombre))
          .input('horas', sql.Int, Number(horas))
          .query(
            'INSERT INTO Maestros (nombre, horas_disponibles) VALUES (@nombre, @horas)'
          )
      );
    });
    await Promise.all(inserts);
  } catch (err) {
    console.error('Error al procesar el archivo:', err.message);
    throw err;
  } finally {
    await sql.close();
  }
}

module.exports = { importarMaestrosDesdeExcel };
