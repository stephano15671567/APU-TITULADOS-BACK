import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken"; 
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const descargar = async (req, res) => {  
  const filePath = './src/public/fichas_tesis/' + req.params.rut + ".word";
  res.download(filePath, (err) => {
    if (err) {
      // Log the error, but don't send another response
      console.error('Error al descargar el archivo:', err);
    } else {
      // Log success, no need to send another response
      console.log("Archivo descargado con éxito");
    }
  });
};


export const subirArchivo = async (req, res) => {
    let file;

    const {id} = req.params;
    console.log(req.files.file)
    console.log(id)
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }
    //File es el nombre con el que se manda el archivo desde el front Y TAMBIÉN HAY QUE ASEGURARSE LUEGO DE LA EXTENSIÓN SOLO SEA WORD OJITO CON LA DROGA
    file = req.files.file;
    let path = './src/public/fichas_tesis/' + id + ".word";
    file.mv(path, (err) => {
      if (err) {
        return res.status(500).json({ message: "No se ha podido subir el archivo" });
      }
    });
    res.status(200).json({ message: "Archivo subido con éxito." });
}
