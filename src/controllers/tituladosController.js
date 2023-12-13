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
export const updateNota = async (req, res) => {
  const { id, nota } = req.body;

  // Validar la nota
  if (nota < 1 || nota > 7) {
      return res.status(400).send({ message: 'Nota inválida.' });
  }

  try {
      const connection = await createConnection();
      await connection.query('UPDATE alumnos_titulados SET nota = ? WHERE id = ?', [nota, id]);
      res.send({ message: 'Nota actualizada correctamente.' });
  } catch (error) {
      res.status(500).send({ message: 'Error al actualizar la nota.', error: error.message });
  }
};



