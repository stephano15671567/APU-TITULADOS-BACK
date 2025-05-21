import mysql from 'mysql2/promise';
import dbConfig from '../database/connection.js';
import writeXlsxFile from 'write-excel-file/node';
import fs from 'fs';
import path from 'path';
import os from 'os';
import jwt from 'jsonwebtoken';

const createConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

export const generateReport = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("🔐 Token no enviado o mal formado:", authHeader);
      return res.status(401).json({ message: "Token no enviado o mal formado" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("❌ Token inválido:", err.message);
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    if (decoded.rol !== "secretaria") {
      console.warn("🔒 Acceso denegado para rol:", decoded.rol);
      return res.status(403).json({ message: "No autorizado" });
    }

    const connection = await createConnection();

    const [results] = await connection.query(`
      SELECT
        alumnos.nombre AS Alumno,
        alumnos.RUT AS RUT,
        alumnos.CODIGO AS Codigo,
        alumnos.ANO_INGRESO AS 'Año Ingreso',
        alumnos.ANO_EGRESO AS 'Año Egreso',
        alumnos.n_resolucion AS 'Número Resolución',
        alumnos.fecha_examen AS 'Fecha Examen',
        alumnos.hora AS Hora,
        alumnos.mail AS Email,
        p_guia.nombre AS 'Profesor Guía',
        p_informante.nombre AS 'Profesor Informante',
        p_secretario.nombre AS 'Secretario',
        p_presidente.nombre AS 'Presidente',
        notas.nota_guia AS 'Nota Guía',
        notas.nota_informante AS 'Nota Informante',
        notas.nota_tesis AS 'Promedio (Nota Tesis)',
        notas.nota_examen_oral AS 'N.EX:ORAL',
        notas.nota_final AS 'Nota Final'
      FROM alumnos
      LEFT JOIN asignaciones_profesores AS asig_guia ON alumnos.RUT = asig_guia.alumno_RUT AND asig_guia.rol = 'guia'
      LEFT JOIN profesores AS p_guia ON asig_guia.profesor_id = p_guia.profesor_id
      LEFT JOIN asignaciones_profesores AS asig_informante ON alumnos.RUT = asig_informante.alumno_RUT AND asig_informante.rol = 'informante'
      LEFT JOIN profesores AS p_informante ON asig_informante.profesor_id = p_informante.profesor_id
      LEFT JOIN asignaciones_profesores AS asig_secretario ON alumnos.RUT = asig_secretario.alumno_RUT AND asig_secretario.rol = 'secretario'
      LEFT JOIN profesores AS p_secretario ON asig_secretario.profesor_id = p_secretario.profesor_id
      LEFT JOIN asignaciones_profesores AS asig_presidente ON alumnos.RUT = asig_presidente.alumno_RUT AND asig_presidente.rol = 'presidente'
      LEFT JOIN profesores AS p_presidente ON asig_presidente.profesor_id = p_presidente.profesor_id
      LEFT JOIN notas ON alumnos.RUT = notas.alumno_RUT;
    `);

    await connection.end();

    const data = [
      [
        { value: 'Alumno', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'RUT', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Codigo', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Año Ingreso', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Año Egreso', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Número Resolución', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Fecha Examen', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Hora', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Email', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Profesor Guía', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Profesor Informante', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Secretario', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Presidente', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Guía', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Informante', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Promedio (Nota Tesis)', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'N.EX:ORAL', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Final', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' }
      ],
      ...results.map(row => [
        { value: row.Alumno },
        { value: row.RUT },
        { value: row.Codigo },
        { value: row['Año Ingreso'] },
        { value: row['Año Egreso'] },
        { value: row['Número Resolución'] },
        { value: row['Fecha Examen'] instanceof Date ? row['Fecha Examen'].toLocaleDateString() : row['Fecha Examen'] },
        { value: row.Hora ? row.Hora.toString() : '' },
        { value: row.Email },
        { value: row['Profesor Guía'] },
        { value: row['Profesor Informante'] },
        { value: row.Secretario },
        { value: row.Presidente },
        { value: row['Nota Guía'] },
        { value: row['Nota Informante'] },
        { value: row['Promedio (Nota Tesis)'] },
        { value: row['N.EX:ORAL'] },
        { value: row['Nota Final'] }
      ])
    ];

    const tempFilePath = path.join(os.tmpdir(), 'reporte.xlsx');

    await writeXlsxFile(data, {
      filePath: tempFilePath,
      columns: [
        { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
        { width: 15 }, { width: 15 }, { width: 15 }, { width: 35 }, { width: 25 },
        { width: 25 }, { width: 25 }, { width: 25 }, { width: 15 }, { width: 15 },
        { width: 20 }, { width: 15 }, { width: 15 }
      ],
      rows: [{ height: 30 }, ...Array(data.length - 1).fill({ height: 25 })],
      border: 'thin'
    });

    res.download(tempFilePath, 'reporte.xlsx', (error) => {
      if (error) {
        console.error('Error al enviar el archivo:', error);
        return res.status(500).json({ message: 'Error al enviar el archivo' });
      }

      res.on('finish', () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error('Error al eliminar el archivo temporal:', err);
        }
      });
    });

  } catch (error) {
    console.error('❗ Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
};
