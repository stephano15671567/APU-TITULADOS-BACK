import mysql from 'mysql2/promise';
import dbConfig from '../database/connection.js'; 
import writeXlsxFile from 'write-excel-file/node';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Create database connection
const createConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

// Generate Excel report
export const generateReport = async (req, res) => {
  try {
    const connection = await createConnection();

    // Perform JOIN query to fetch student data with their corresponding guide and informant professors
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
LEFT JOIN asiganciones_profesores AS asig_guia ON alumnos.RUT = asig_guia.alumno_RUT AND asig_guia.rol = 'guia'
LEFT JOIN profesores AS p_guia ON asig_guia.profesor_id = p_guia.profesor_id
LEFT JOIN asiganciones_profesores AS asig_informante ON alumnos.RUT = asig_informante.alumno_RUT AND asig_informante.rol = 'informante'
LEFT JOIN profesores AS p_informante ON asig_informante.profesor_id = p_informante.profesor_id
LEFT JOIN asiganciones_profesores AS asig_secretario ON alumnos.RUT = asig_secretario.alumno_RUT AND asig_secretario.rol = 'secretario'
LEFT JOIN profesores AS p_secretario ON asig_secretario.profesor_id = p_secretario.profesor_id
LEFT JOIN asiganciones_profesores AS asig_presidente ON alumnos.RUT = asig_presidente.alumno_RUT AND asig_presidente.rol = 'presidente'
LEFT JOIN profesores AS p_presidente ON asig_presidente.profesor_id = p_presidente.profesor_id
LEFT JOIN notas ON alumnos.RUT = notas.alumno_RUT;
          `);

    // Close the database connection
    await connection.end();

    // Define the data for the Excel file
    const data = [
      // Headers for the report
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
        { value: 'Tesis', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Guía', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Informante', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Promedio (Nota Tesis)', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'N.EX:ORAL', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' },
        { value: 'Nota Final', fontWeight: 'bold', fontColor: 'FFFFFF', fill: '4286f4' }
      ],
      // Student data with their guide and informant professors
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
        { value: row.Tesis },
        { value: row['Nota Guía'] },
        { value: row['Nota Informante'] },
        { value: row['Promedio (Nota Tesis)'] },
        { value: row['N.EX:ORAL'] },
        { value: row['Nota Final'] }
      ])
    ];

    // Generate a temporary file path
    const tempFilePath = path.join(os.tmpdir(), 'reporte.xlsx');

    // Create the Excel file on the server
    await writeXlsxFile(data, {
      filePath: tempFilePath,
      columns: [
        { width: 15 }, // Alumno
        { width: 15 }, // RUT
        { width: 15 }, // Codigo
        { width: 15 }, // Año Ingreso
        { width: 15 }, // Año Egreso
        { width: 15 }, // Número Resolución
        { width: 15 }, // Fecha Examen
        { width: 15 }, // Hora
        { width: 35 }, // Email
        { width: 25 }, // Profesor Guía
        { width: 25 }, // Profesor Informante
        { width: 25 }, // Secretario
        { width: 25 },  // Presidente
        { width: 20 }, // Tesis
        { width: 15 }, // Nota Guía
        { width: 15 }, // Nota Informante
        { width: 20 }, // Promedio (Nota Tesis)
        { width: 15 }, // N.EX:ORAL
        { width: 15 }  // Nota Final
      ],
      rows: [{ height: 30 }, ...Array(data.length - 1).fill({ height: 25 })], // Set row height
      border: 'thin' // Set border thickness
    });

    // Send the file to the client
    res.download(tempFilePath, 'reporte.xlsx', (error) => {
      if (error) {
        console.error('Error when sending the file:', error);
        return res.status(500).json({ message: 'Error when sending the file' });
      }

      // Attempt to delete the temporary file after the response has been sent
      res.on('finish', () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error('Error when deleting the temporary file:', err);
        }
      });
    });

  } catch (error) {
    console.error('Error when generating the report:', error);
    res.status(500).json({ message: 'Error when generating the report' });
  }
};
