// generateReportController.js

import mysql from 'mysql2/promise';
import dbConfig from '../database/connection.js'; // Asegúrate de que la ruta es correcta y de que se exporta el objeto de configuración de la base de datos
import writeXlsxFile from 'write-excel-file/node';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Crear conexión a la base de datos
const createConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

// Generar reporte Excel
export const generateReport = async (req, res) => {
  try {
    const connection = await createConnection();

    // Realiza las consultas a la base de datos según las necesidades del reporte
    const [alumnos] = await connection.query('SELECT * FROM alumnos');
    // ... puedes agregar más consultas si es necesario

    // Cerrar la conexión a la base de datos
    await connection.end();

    // Definir los datos para el archivo Excel
    const data = [
      // Encabezados para los alumnos
      [
        { value: 'Alumno', fontWeight: 'bold' },
        { value: 'RUT', fontWeight: 'bold' },
        { value: 'Codigo', fontWeight: 'bold' },
        { value: 'Año Ingreso', fontWeight: 'bold' },
        { value: 'Año Egreso', fontWeight: 'bold' },
        { value: 'n_resolución', fontWeight: 'bold' },
        { value: 'Fecha Examen', fontWeight: 'bold' },
        { value: 'Hora', fontWeight: 'bold' },
        { value: 'mail', fontWeight: 'bold' }
      ],
      // Datos de los alumnos
      ...alumnos.map(alumno => [
        { value: alumno.nombre },
        { value: alumno.RUT },
        { value: alumno.CODIGO},
        { value: alumno.ANO_INGRESO }, 
        { value: alumno.ANO_EGRESO},
        { value: alumno.n_resolucion},
        { value: alumno.fecha_examen ? alumno.fecha_examen.toLocaleDateString() : '' },
        { value: alumno.hora ? alumno.hora.toString() : '' },
        { value: alumno.mail },
        
      ]),
      []
      // ... puedes seguir agregando más secciones de datos si lo necesitas
    ];

    // Generar una ruta de archivo temporal
    const tempFilePath = path.join(os.tmpdir(), 'reporte.xlsx');

    // Crear el archivo Excel en el servidor
    await writeXlsxFile(data, {
      filePath: tempFilePath,
    });

    // Enviar el archivo al cliente
    res.download(tempFilePath, 'reporte.xlsx', (error) => {
      if (error) {
        console.error('Error al enviar el archivo:', error);
        return res.status(500).json({ message: 'Error al enviar el archivo' });
      }

      // Intenta eliminar el archivo temporal después de que la respuesta se haya enviado
      res.on('finish', () => {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error('Error al eliminar el archivo temporal:', err);
        }
      });
    });

  } catch (error) {
    console.error('Error al generar el reporte:', error);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
};
