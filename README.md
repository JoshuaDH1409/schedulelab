# ScheduleLab

Herramienta sencilla para **importar maestros desde un archivo Excel (.xlsx)** hacia **Microsoft SQL Server** y consultar la lista resultante desde una interfaz web mínima.

> Antes se llamaba *GeneradorHorarios*. Este repositorio se presenta como proyecto de portafolio bajo el nombre **ScheduleLab**.

## Qué hace

1. Sirve una UI estática (`public/`) para subir un Excel y ver maestros.
2. `POST /upload` — recibe el `.xlsx`, lo parsea con **ExcelJS** e inserta filas en la tabla `Maestros`.
3. `GET /maestros` — devuelve el listado desde SQL Server (`mssql`).

El servidor HTTP está en `server.js` (Node nativo; Express está en dependencias pero no se usa en el servidor actual).

## Stack

- **Node.js** (HTTP nativo)
- **mssql** — conexión a SQL Server
- **ExcelJS** — lectura de `.xlsx`
- **formidable** — multipart / upload
- **dotenv** — variables de entorno

## Requisitos

- Node.js 18+ recomendado
- **SQL Server** accesible con una tabla `Maestros` (columnas esperadas: `nombre`, `horas_disponibles`)
- Credenciales de base de datos en un archivo `.env` local (no se versiona)

## Cómo ejecutar

```bash
npm install
cp .env.example .env
# Edita .env con DB_USER, DB_PASS, DB_SERVER y DB_NAME
node server.js
```

Abre [http://localhost:3000](http://localhost:3000).

Variables en `.env.example`:

```
DB_USER=
DB_PASS=
DB_SERVER=
DB_NAME=
```

## Formato del Excel

| nombre   | horas |
|----------|-------|
| Ana Ruiz | 20    |
| …        | …     |

La primera fila es encabezado; se omiten.

## Estructura

```
├── server.js           # Servidor HTTP + estáticos + API
├── config/db.js        # Configuración mssql vía .env
├── utils/importExcel.js
├── public/index.html   # UI ScheduleLab
├── uploads/            # Archivos temporales (ignorados en git)
├── .env.example
└── package.json
```

## Limitaciones (honestas)

- Necesita un **SQL Server** real; sin él, `/maestros` y la importación fallan.
- Es un prototipo de importación, no un generador completo de horarios.
- No incluye autenticación ni validación avanzada del Excel.

## Licencia

MIT
