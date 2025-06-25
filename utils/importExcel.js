async function importarMaestrosDesdeExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];

  const pool = await sql.connect(config);

  try {
    sheet.eachRow((row, index) => {
      if (index === 1) return; // Saltar encabezado

      const nombre = row.getCell(1).value;
      const horas = row.getCell(2).value;

      if (!nombre || isNaN(horas)) {
        throw new Error(`Datos inválidos en fila ${index + 1}`);
      }
      console.log(`Fila ${index + 1}: nombre=${nombre}, horas=${horas}`);

      pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('horas', sql.Int, horas)
        .query('INSERT INTO Maestros (nombre, horas_disponibles) VALUES (@nombre, @horas)');
    });
  } catch (err) {
    console.error("❌ Error al procesar el archivo:", err.message);
    throw err;
  } finally {
    await sql.close();
  }
}
