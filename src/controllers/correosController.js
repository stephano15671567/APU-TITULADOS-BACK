import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken"; 
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { info } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const correo_SST = 'maximiliano.aguirre@alumnos.uv.cl'

const createConnection = async () => {
  return await mysql2.createConnection(db);
};
const user = "";
const pass = "";
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{
        user: `${user}`,
        pass: `${pass}`,
    },
});


export const mail = async (req, res) => {
    const rut = req.params.rut;
    console.log(rut)
    const info = await transporter.sendMail({
        from: ' "Futuro sistema de seminario de prácticas UV" <maximiliano.aguirre@alumnos.uv.cl>',
        to: `${correo_SST}`,
        subject: 'Testing',
        text: 'Testing',
        html: '<h5>Nueva ficha!</h5>',
        attachments: [
            {
                filename: `Ficha_de_inscripcion-${rut}.word`,
                path: `./src/public/fichas_tesis/${rut}.word`
            }
        ]
    });
    console.log("MENSAJE: %s", info.messageId);
    return res.json({message: 'Mensaje enviado!!'})
}
