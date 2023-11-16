import db from '../database/connection.js';
import mysql2 from "mysql2/promise";
const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const getTitulados = async (req, res) => {
  try {
    const connection = await createConnection();
    const [titulados] = await connection.query('SELECT * FROM alumnos_titulados');

    res.json(titulados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
