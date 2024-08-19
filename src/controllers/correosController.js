import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const correo_SST = "titulacionapu@uv.cl";

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

export const mail = async (req, res) => {
  const rut = req.params.rut;
  console.log(rut);
  try {
    const info = await transporter.sendMail({
      from: ' "Futuro sistema de seminario de titulación UV" <titulacionapu@uv.cl>',
      to: `${correo_SST}`,
      subject: "Testing",
      text: "Testing",
      html: "<h5>Nueva ficha!</h5>",
      attachments: [
        {
          filename: `Ficha_de_inscripcion-${rut}.docx`,
          path: `./src/public/fichas_tesis/${rut}.docx`,
        },
      ],
    });

    console.log("MENSAJE: %s", info.messageId);
  } catch (e) {
    console.log(e);
    res.status(500);
    return res.json({ message: "Mensaje no enviado!!" });
  }
  res.status(200);
  return res.json({ message: "Mensaje enviado!!" });
};

export const notification = async (req, res) => {
  try {
    console.log(req.params);
    const connection = await createConnection();
    const [results] = await connection.query(
      "SELECT p.mail, asi.profesor_id, asi.asignacion_id, a.nombre as alumno_nombre, a.rut as alumno_RUT, p.nombre as nombre_profesor, asi.rol FROM alumnos as a INNER JOIN asignaciones_profesores as asi ON a.RUT = asi.alumno_RUT INNER JOIN profesores as p ON asi.profesor_id = p.profesor_id WHERE asignacion_id = ?;",
      [req.params.assign]
    );
    await connection.end();
    console.log(results);
    try {
      const attachments = [
        {
          filename: `Ficha_de_inscripcion-${results[0].alumno_RUT}.docx`,
          path: `./src/public/fichas_tesis/${results[0].alumno_RUT}.docx`,
        }
      ];

      if (results[0].rol === "informante") {
        attachments.push({
          filename: `Tesis-${results[0].alumno_RUT}.pdf`,
          path: path.join(__dirname, '../public/tesis', `${results[0].alumno_RUT}.pdf`),
        });
      }

      const info = await transporter.sendMail({
        from: ` "Futuro sistema de seminario de titulación UV" <${correo_SST}>`,
        to: `${results[0].mail}`,
        cc: `${results[0].mail}`,
        subject: "Asignación",
        text: `Asignación con rol de ${results[0].rol}`,
        html: `<h5>Asignación a profesor ${results[0].nombre_profesor} a cargo de la tesis de ${results[0].alumno_nombre} con rol de ${results[0].rol}</h5>`,
        attachments: attachments,
      });

      res.status(200);
      return res.json({ message: "Mensaje enviado!!" });

    } catch (e) {
      console.log(e);
      res.status(500);
      return res.json({ message: "Mensaje no enviado!!" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las asignaciones.",
      error: error.message,
    });
  }
};