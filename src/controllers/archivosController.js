import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken"; 

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const subirArchivo = async (req, res) => {
    const files = req.files.file.name;
    console.log(files)
    return res.json({ message: "Archivo subido correctamente", status: 200});
}
