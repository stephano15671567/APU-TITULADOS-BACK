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
        a.nombre AS Alumno,
        a.RUT AS RUT,
        a.CODIGO AS Codigo,
        a.ANO_INGRESO AS 'Año Ingreso',
        a.ANO_EGRESO AS 'Año Egreso',
        a.n_resolucion AS 'Número Resolución',
        a.fecha_examen AS 'Fecha Examen',
        a.hora AS Hora,
        a.mail AS Email,
        MAX(CASE WHEN ap.rol = 'guia' THEN p.nombre END) AS 'Profesor Guía',
        MAX(CASE WHEN ap.rol = 'informante' THEN p.nombre END) AS 'Profesor Informante',
        MAX(CASE WHEN ap.rol = 'secretario' THEN p.nombre END) AS 'Secretario',
        MAX(CASE WHEN ap.rol = 'presidente' THEN p.nombre END) AS 'Presidente',
        MAX(n.nota_guia) AS 'Nota Guía',
        MAX(n.nota_informante) AS 'Nota Informante',
        MAX(n.nota_tesis) AS 'Promedio (Nota Tesis)',
        MAX(n.nota_examen_oral) AS 'N.EX:ORAL',
        MAX(n.nota_final) AS 'Nota Final'
      FROM alumnos AS a
      LEFT JOIN asignaciones_profesores AS ap ON a.RUT = ap.alumno_RUT
      LEFT JOIN profesores AS p ON ap.profesor_id = p.profesor_id
      LEFT JOIN notas AS n ON a.RUT = n.alumno_RUT
      GROUP BY a.RUT;
    `);

    await connection.end();

    const data = [
      [
        { value: 'Alumno', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'RUT', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Codigo', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Año Ingreso', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Año Egreso', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Número Resolución', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Fecha Examen', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Hora', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Email', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Profesor Guía', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Profesor Informante', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Secretario', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Presidente', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Nota Guía', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Nota Informante', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Promedio (Nota Tesis)', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'N.EX:ORAL', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' },
        { value: 'Nota Final', fontWeight: 'bold', color: '#FFFFFF', backgroundColor: '#4286f4' }
      ],
      ...results.map(row => [
        { type: String, value: row.Alumno },
        { type: String, value: row.RUT },
        { type: String, value: row.Codigo },
        { type: Number, value: row['Año Ingreso'] ? parseFloat(row['Año Ingreso']) : null },
        { type: Number, value: row['Año Egreso'] ? parseFloat(row['Año Egreso']) : null },
        { type: String, value: row['Número Resolución'] },
        // --- CORRECCIÓN FINAL: Se convierte la cadena de texto a un objeto Date ---
        { type: Date, value: row['Fecha Examen'] ? new Date(row['Fecha Examen']) : null, format: 'dd/mm/yyyy' },
        { type: String, value: row.Hora ? row.Hora.toString() : '' },
        { type: String, value: row.Email },
        { type: String, value: row['Profesor Guía'] },
        { type: String, value: row['Profesor Informante'] },
        { type: String, value: row.Secretario },
        { type: String, value: row.Presidente },
        { type: Number, value: row['Nota Guía'] ? parseFloat(row['Nota Guía']) : null },
        { type: Number, value: row['Nota Informante'] ? parseFloat(row['Nota Informante']) : null },
        { type: Number, value: row['Promedio (Nota Tesis)'] ? parseFloat(row['Promedio (Nota Tesis)']) : null },
        { type: Number, value: row['N.EX:ORAL'] ? parseFloat(row['N.EX:ORAL']) : null },
        { type: Number, value: row['Nota Final'] ? parseFloat(row['Nota Final']) : null }
      ])
    ];

    const tempFilePath = path.join(os.tmpdir(), `reporte_${Date.now()}.xlsx`);

    await writeXlsxFile(data, {
      filePath: tempFilePath
    });

    res.download(tempFilePath, 'reporte.xlsx', (error) => {
      if (error) {
        console.error('Error al enviar el archivo:', error);
      }
      fs.unlink(tempFilePath, (err) => {
        if (err) {
          console.error('Error al eliminar el archivo temporal:', err);
        }
      });
    });

  } catch (error) {
    console.error('❗ Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
};