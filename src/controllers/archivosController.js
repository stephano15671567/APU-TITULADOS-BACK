import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const descargar = async (req, res) => {
  const filePath = path.join(__dirname, '../public/fichas_tesis', `${req.params.rut}.docx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      } else {
        console.log("Archivo descargado con éxito");
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaGuía = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Guía', `FORMATO PROFESOR GUÍA.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `FORMATO PROFESOR GUÍA.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaInformante = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Informante', `FORMATO PROFESOR INFORMANTE.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `FORMATO PROFESOR INFORMANTE.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const subirArchivo = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ message: "No se ha subido ningún archivo" });
  }
  
  let file = req.files.file;
  const name = req.params.id; 
  let uploadPath = path.join(__dirname, '../public/fichas_tesis', `${name}.docx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    } else {
      res.status(200).send({ message: "Archivo subido con éxito." });
    }
  });
};


export const subirRubricaInformante = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(__dirname, '../public/rubricas/Informante2', `${alumnoRUT}.xlsx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir la rúbrica del informante:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    }
    res.send({ message: "La rúbrica del informante ha sido subida correctamente." });
  });
};

// Existing function for subirRubricaGuia with database interaction removed
export const subirRubricaGuia = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(__dirname, '../public/rubricas/Guia2', `${alumnoRUT}.xlsx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir la rúbrica del guía:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    }
    res.send({ message: "La rúbrica del guía ha sido subida correctamente." });
  });
};


export const descargarRubricaGuiaConNotas = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Guia2', `${req.params.rut}.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Rubrica_Guia_Con_Notas_${req.params.rut}.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaInformanteConNotas = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Informante2', `${req.params.rut}.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Rubrica_Informante_Con_Notas_${req.params.rut}.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};
async function obtenerDatosParaActa(rut) {
  const query = `
    SELECT 
      al.nombre AS nombre_alumno,
      n.nota_guia AS nota_profesor_guia,
      n.nota_informante AS nota_profesor_informante,
      n.nota_final AS nota_tesis,
      p_guia.nombre AS nombre_profesor_guia,
      p_inf.nombre AS nombre_profesor_informante
    FROM alumnos al
    LEFT JOIN notas n ON al.RUT = n.alumno_RUT
    LEFT JOIN asignaciones_profesores asig_guia ON al.RUT = asig_guia.alumno_RUT AND asig_guia.rol = 'guia'
    LEFT JOIN profesores p_guia ON asig_guia.profesor_id = p_guia.profesor_id
    LEFT JOIN asignaciones_profesores asig_inf ON al.RUT = asig_inf.alumno_RUT AND asig_inf.rol = 'informante'
    LEFT JOIN profesores p_inf ON asig_inf.profesor_id = p_inf.profesor_id
    WHERE al.RUT = ?;
  `;

  const connection = await mysql2.createConnection(db);
  const [results] = await connection.execute(query, [rut]);
  await connection.end();

  if (results.length === 0) {
    throw new Error('No se encontró el alumno con el RUT proporcionado');
  }

  return results[0];
}

export const generarYDescargarActa = async (req, res) => {
  const rut = req.params.rut;

  try {
    // Obtener los datos necesarios para llenar la plantilla del acta
    const datosActa = await obtenerDatosParaActa(rut);
    
    // Cargar la plantilla de documento Word (DOCX)
    const templatePath = path.resolve(__dirname, '../public/Acta/ACTA NOTA FINAL Y DE EXAMEN DE TITULO.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Rellenar la plantilla con los datos obtenidos
    doc.render(datosActa);

    // Generar el documento DOCX
    const buf = doc.getZip().generate({ type: 'nodebuffer' });

    // Enviar el documento para su descarga
    const filename = `Acta-${rut}.docx`;
    res.setHeader('Content-Disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);

  } catch (error) {
    console.error('Error al generar el acta:', error);
    res.status(500).send('Error al generar el acta');
  }
};

export const subirTesis = async (req, res) => {
  if (!req.files || !req.files.tesis) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const tesis = req.files.tesis;
  const alumnoRUT = req.params.rut; // Asegúrate de que el parámetro en la ruta sea 'rut'
  const uploadPath = path.join(__dirname, '../public/tesis', `${alumnoRUT}.docx`);

  tesis.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir la tesis:', err);
      return res.status(500).send({ message: "No se ha podido subir la tesis" });
    }
    res.send({ message: "La tesis ha sido subida correctamente." });
  });
};

export const descargarTesis = async (req, res) => {
  const filePath = path.join(__dirname, '../public/tesis', `${req.params.rut}.docx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Tesis_${req.params.rut}.docx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar la tesis. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Tesis no encontrada."
    });
  }
};

export const descargarArchivoWord = async (req, res) => {
  const filePath = path.join(__dirname, '../public/ficha_alumno', 'Formulario Inscripción Seminario de Título V2.docx');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'archivo_word.docx', (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};