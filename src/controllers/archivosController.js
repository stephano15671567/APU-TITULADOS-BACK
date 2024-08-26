import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as nodemailer from "nodemailer";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

const user = "titulacionapu@uv.cl";
const pass = "Escapu2024";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${user}`,
    pass: `${pass}`,
  },
});

export const subirArchivo = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ message: "No se ha subido ningún archivo" });
  }

  let file = req.files.file;
  const name = req.params.id;
  let uploadPath = path.join(
    __dirname,
    "../public/fichas_tesis",
    `${name}.docx`
  );

  file.mv(uploadPath, async (err) => {
    if (err) {
      console.error("Error al subir el archivo:", err);
      return res
        .status(500)
        .send({ message: "No se ha podido subir el archivo" });
    } else {
      try {
        // Enviar notificación por correo a todos los correos de la secretaría
        const connection = await createConnection();
        const [results] = await connection.query("SELECT mail FROM secretaria");
        await connection.end();

        const mailList = results.map((row) => row.mail);

        const data = await transporter.sendMail({
          from: ' "Futuro sistema de seminario de titulación UV" <titulacionapu@uv.cl>',
          to: mailList.join(","),
          subject: "Nueva ficha de inscripción subida",
          text: `Se ha subido una nueva ficha de inscripción para el alumno con RUT ${name}.`,
          html: `<h5>Se ha subido una nueva ficha de inscripción para el alumno con RUT ${name}.</h5>`,
          attachments: [
            {
              filename: `Ficha_de_inscripcion-${name}.docx`,
              path: uploadPath,
            },
          ],
        });
        res.status(200).send({
          message: "Archivo subido con éxito y notificación enviada.",
        });
      } catch (e) {
        console.error("Error al enviar la notificación:", e);
        res.status(500).send({
          message:
            "Archivo subido con éxito, pero no se pudo enviar la notificación.",
        });
      }
    }
  });
};

export const descargar = async (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/fichas_tesis",
    `${req.params.rut}.docx`
  );
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      } else {
        console.log("Archivo descargado con éxito");
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
    });
  }
};

export const descargarRubricaGuía = async (req, res) => {
  const filePath = path.join(__dirname, "../public/rubricas/guia", `guia.docx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `guia.docx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
    });
  }
};

export const descargarRubricaInformante = async (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/rubricas/Informante",
    `FORMATO PROFESOR INFORMANTE.xlsx`
  );
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
      message: "Archivo no encontrado.",
    });
  }
};

export const subirRubricaInformante = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(
    __dirname,
    "../public/rubricas/Informante2",
    `${alumnoRUT}.xlsx`
  );
  //Módulo de notificación
  const connection = await createConnection();
  const [results] = await connection.query("SELECT mail FROM secretaria");
  const alumno = await connection.query(
    "SELECT nombre FROM alumnos WHERE RUT=?",
    [alumnoRUT]
  );
  const nombre = alumno[0][0].nombre;
  try {
    const mailList = results.map((row) => row.mail);

    const data = await transporter.sendMail({
      from: ' "Futuro sistema de seminario de titulación UV" <titulacionapu@uv.cl>',
      to: mailList.join(","),
      subject: "Nueva rúbrica de informante subida",
      text: `Se ha subido una rúbrica de informante para el alumno: ${nombre}`,
      html: `<h5>Una nueva rúbrica de informante se ha subido para el alumno rut: ${alumnoRUT}, de nombre <h4>${nombre}<h4/></h5>`,
    });
  } catch (e) {
    res.status(500).send({
      message:
        "Archivo subido con éxito, pero no se pudo enviar la notificación.",
    });
  }
  //Fin módulo de notificación

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error al subir la rúbrica del informante:", err);
      return res
        .status(500)
        .send({ message: "No se ha podido subir el archivo" });
    }
    res.send({
      message: "La rúbrica del informante ha sido subida correctamente.",
    });
  });
};

export const subirRubricaGuia = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(
    __dirname,
    "../public/rubricas/Guia2",
    `${alumnoRUT}.pdf`
  );
  //Módulo de notificación
  const connection = await createConnection();
  const [results] = await connection.query("SELECT mail FROM secretaria");
  const alumno = await connection.query(
    "SELECT nombre FROM alumnos WHERE RUT=?",
    [alumnoRUT]
  );
  const nombre = alumno[0][0].nombre;
  try {
    const mailList = results.map((row) => row.mail);

    const data = await transporter.sendMail({
      from: ' "Futuro sistema de seminario de titulación UV" <titulacionapu@uv.cl>',
      to: mailList.join(","),
      subject: "Nueva rúbrica de guía subida",
      text: `Se ha subido una rúbrica de guía para el alumno: ${nombre}`,
      html: `<h5>Una nueva rúbrica de guía se ha subido para el alumno rut: ${alumnoRUT}, de nombre <h4>${nombre}<h4/></h5>`,
    });
  } catch (e) {
    res.status(500).send({
      message:
        "Archivo subido con éxito, pero no se pudo enviar la notificación.",
    });
  }
  //Fin módulo de notificación
  file.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error al subir la rúbrica del guía:", err);
      return res
        .status(500)
        .send({ message: "No se ha podido subir el archivo" });
    }
    res.send({ message: "La rúbrica del guía ha sido subida correctamente." });
  });
};

export const descargarRubricaGuiaConNotas = async (req, res) => {
  const rut = req.params.rut;
  const filePath = path.join(
    __dirname,
    "../public/rubricas/Guia2",
    `${rut}.pdf`
  );
  const filename = `Rubrica_Guia_Con_Notas_${rut}.pdf`;

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
    });
  }
};

export const verificarArchivosAlumno = async (req, res) => {
  const rut = req.params.rut;

  const archivos = {
    ficha: fs.existsSync(
      path.join(__dirname, "../public/fichas_tesis", `${rut}.docx`)
    )
      ? 1
      : 0,
    tesis: fs.existsSync(path.join(__dirname, "../public/tesis", `${rut}.pdf`))
      ? 1
      : 0,
    acta: fs.existsSync(path.join(__dirname, "../public/Acta", `${rut}.docx`))
      ? 1
      : 0,
    guia: fs.existsSync(
      path.join(__dirname, "../public/rubricas/Guia2", `${rut}.pdf`)
    )
      ? 1
      : 0,
    informante: fs.existsSync(
      path.join(__dirname, "../public/rubricas/Informante2", `${rut}.xlsx`)
    )
      ? 1
      : 0,
  };

  res.json(archivos);
};

export const descargarRubricaInformanteConNotas = async (req, res) => {
  const rut = req.params.rut;

  const filePath = path.join(
    __dirname,
    "../public/rubricas/Informante2",
    `${rut}.xlsx`
  );
  const filename = `Rubrica_Informante_Con_Notas_${rut}.xlsx`;

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      } else {
        console.log("Archivo descargado con éxito");
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
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
      p_inf.nombre AS nombre_profesor_informante,
      p_pres.nombre AS nombre_profesor_presidente,  
      p_sec.nombre AS nombre_secretario  
    FROM alumnos al
    LEFT JOIN notas n ON al.RUT = n.alumno_RUT
    LEFT JOIN asigancionesprofesores asig_guia ON al.RUT = asig_guia.alumno_RUT AND asig_guia.rol = 'guia'
    LEFT JOIN profesores p_guia ON asig_guia.profesor_id = p_guia.profesor_id
    LEFT JOIN asigancionesprofesores asig_inf ON al.RUT = asig_inf.alumno_RUT AND asig_inf.rol = 'informante'
    LEFT JOIN profesores p_inf ON asig_inf.profesor_id = p_inf.profesor_id
    LEFT JOIN asigancionesprofesores asig_pres ON al.RUT = asig_pres.alumno_RUT AND asig_pres.rol = 'presidente'
    LEFT JOIN profesores p_pres ON asig_pres.profesor_id = p_pres.profesor_id
    LEFT JOIN asigancionesprofesores asig_sec ON al.RUT = asig_sec.alumno_RUT AND asig_sec.rol = 'secretario'
    LEFT JOIN profesores p_sec ON asig_sec.profesor_id = p_sec.profesor_id
    WHERE al.RUT = ?;
  `;

  const connection = await mysql2.createConnection(db);
  const [results] = await connection.execute(query, [rut]);
  await connection.end();

  if (results.length === 0) {
    throw new Error("No se encontró el alumno con el RUT proporcionado");
  }

  return results[0];
}


export const generarYDescargarActa = async (req, res) => {
  const rut = req.params.rut;

  try {
    // Obtener los datos necesarios para llenar la plantilla del acta
    const datosActa = await obtenerDatosParaActa(rut);

    // Cargar la plantilla de documento Word (DOCX)
    const templatePath = path.resolve(
      __dirname,
      "../public/Acta/ACTA NOTA FINAL Y DE EXAMEN DE TITULO.docx"
    );
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Rellenar la plantilla con los datos obtenidos
    doc.render({
      nombre_alumno: datosActa.nombre_alumno,
      nota_profesor_guia: datosActa.nota_profesor_guia,
      nota_profesor_informante: datosActa.nota_profesor_informante,
      nota_tesis: datosActa.nota_tesis,
      nombre_profesor_guia: datosActa.nombre_profesor_guia,
      nombre_profesor_informante: datosActa.nombre_profesor_informante,
      nombre_profesor_presidente: datosActa.nombre_profesor_presidente, // Nuevo campo
      nombre_secretario: datosActa.nombre_secretario // Nuevo campo
    });

    // Generar el documento DOCX
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Enviar el documento para su descarga
    const filename = `Acta-${rut}.docx`;
    res.setHeader("Content-Disposition", "attachment; filename=" + filename);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buf);
  } catch (error) {
    console.error("Error al generar el acta:", error);
    res.status(500).send("Error al generar el acta");
  }
};


export const subirTesis = async (req, res) => {
  if (!req.files || !req.files.tesis) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const tesis = req.files.tesis;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(
    __dirname,
    "../public/tesis",
    `${alumnoRUT}.pdf`
  );
  const connection = await createConnection();
  const [results] = await connection.query("SELECT mail FROM secretaria");
  const alumno = await connection.query(
    "SELECT nombre FROM alumnos WHERE RUT=?",
    [alumnoRUT]
  );
  const nombre = alumno[0][0].nombre;
  console.log(nombre);
  await connection.end();
  try {
    const mailList = results.map((row) => row.mail);

    const data = await transporter.sendMail({
      from: ' "Futuro sistema de seminario de titulación UV" <titulacionapu@uv.cl>',
      to: mailList.join(","),
      subject: "Nueva tesis subida",
      text: `Se ha subido una nueva tesis del alumno ${nombre}`,
      html: `<h5>Se ha subido una nueva tesis para el alumno con rut ${alumnoRUT}, nombre <h4>${nombre}<h4/></h5>`,
    });
  } catch (e) {
    res.status(500).send({
      message:
        "Archivo subido con éxito, pero no se pudo enviar la notificación.",
    });
  }
  tesis.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error al subir la tesis:", err);
      return res
        .status(500)
        .send({ message: "No se ha podido subir la tesis" });
    }
    res.send({ message: "La tesis ha sido subida correctamente." });
  });
};

export const descargarTesis = async (req, res) => {
  const filePath = path.join(
    __dirname,
    "../public/tesis",
    `${req.params.rut}.pdf`
  );
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Tesis_${req.params.rut}.pdf`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar la tesis. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Tesis no encontrada.",
    });
  }
};

export const descargarArchivoWord = async (req, res) => {
  const filePath = path.join(__dirname, "../public/ficha_alumno", "ficha.docx");
  if (fs.existsSync(filePath)) {
    res.download(filePath, "archivo_word.docx", (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
    });
  }
};

export const descargarFicha = async (req, res) => {
  const rut = req.params.rut;
  const filePath = path.join(
    __dirname,
    "../public/fichas_tesis",
    `${rut}.docx`
  );
  console.log(filePath);
  const filename = `Ficha_tesis_${rut}.docx`;

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error al descargar el archivo:", err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado.",
    });
  }
};
