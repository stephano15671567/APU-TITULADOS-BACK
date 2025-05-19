import mysql from 'mysql2/promise';
import dbConfig from '../database/connection.js';
import ExcelJS from 'exceljs';

// Crear conexión a la base de datos
const createConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

// Generar y enviar reporte Excel
export const generateReport = async (req, res) => {
  try {
    const connection = await createConnection();

    // Consulta con JOINs para obtener datos
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

    // Crear workbook y worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Titulados');

    // Definir columnas con encabezados y anchos
    worksheet.columns = [
      { header: 'Alumno', key: 'Alumno', width: 25 },
      { header: 'RUT', key: 'RUT', width: 15 },
      { header: 'Codigo', key: 'Codigo', width: 15 },
      { header: 'Año Ingreso', key: 'AñoIngreso', width: 12 },
      { header: 'Año Egreso', key: 'AñoEgreso', width: 12 },
      { header: 'Número Resolución', key: 'NumeroResolucion', width: 18 },
      { header: 'Fecha Examen', key: 'FechaExamen', width: 15 },
      { header: 'Hora', key: 'Hora', width: 10 },
      { header: 'Email', key: 'Email', width: 30 },
      { header: 'Profesor Guía', key: 'ProfesorGuia', width: 25 },
      { header: 'Profesor Informante', key: 'ProfesorInformante', width: 25 },
      { header: 'Secretario', key: 'Secretario', width: 25 },
      { header: 'Presidente', key: 'Presidente', width: 25 },
      { header: 'Promedio (Nota Tesis)', key: 'NotaTesis', width: 18 },
      { header: 'Nota Guía', key: 'NotaGuia', width: 12 },
      { header: 'Nota Informante', key: 'NotaInformante', width: 15 },
      { header: 'N.EX:ORAL', key: 'NotaExamenOral', width: 12 },
      { header: 'Nota Final', key: 'NotaFinal', width: 12 },
    ];

    // Agregar filas con validaciones
    results.forEach(row => {
      worksheet.addRow({
        Alumno: row.Alumno || '',
        RUT: row.RUT || '',
        Codigo: row.Codigo || '',
        AñoIngreso: row['Año Ingreso'] || '',
        AñoEgreso: row['Año Egreso'] || '',
        NumeroResolucion: row['Número Resolución'] || '',
        FechaExamen: row['Fecha Examen']
          ? (row['Fecha Examen'] instanceof Date
            ? row['Fecha Examen'].toLocaleDateString()
            : row['Fecha Examen'])
          : '',
        Hora: row.Hora ? row.Hora.toString() : '',
        Email: row.Email || '',
        ProfesorGuia: row['Profesor Guía'] || '',
        ProfesorInformante: row['Profesor Informante'] || '',
        Secretario: row.Secretario || '',
        Presidente: row.Presidente || '',
        NotaTesis: row['Promedio (Nota Tesis)'] || '',
        NotaGuia: row['Nota Guía'] || '',
        NotaInformante: row['Nota Informante'] || '',
        NotaExamenOral: row['N.EX:ORAL'] || '',
        NotaFinal: row['Nota Final'] || '',
      });
    });

    // Opcional: aplicar estilo al encabezado
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4286F4' },
    };

    // Enviar el archivo al cliente directamente sin crear archivo físico
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ message: 'Error generando reporte' });
  }
};
