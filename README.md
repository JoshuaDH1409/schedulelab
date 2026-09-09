# ScheduleLab

Carga masiva de maestros desde Excel hacia SQL Server, con listado inmediato en UI.

**Demo:** https://joshuadh1409.github.io/schedulelab/

<!-- screenshots -->
## Vista

![ScheduleLab](docs/screenshots/ui.png)

## Stack

- Node.js (HTTP nativo)
- ExcelJS · formidable
- mssql · dotenv

## Límites

Requiere SQL Server configurado; es importación de maestros, no un planificador completo de horarios.

## Ejecución local

```bash
npm install
cp .env.example .env
# DB_USER, DB_PASS, DB_SERVER, DB_NAME
node server.js
```

Abre http://localhost:3000

## Formato Excel

| nombre   | horas |
|----------|-------|
| Ana Ruiz | 20    |

Primera fila = encabezado. Endpoints: `POST /upload`, `GET /maestros`.

## Licencia

MIT
