import db from '../database/connection.js';

export const getTitulados = async (req, res) => {
  try {
    const [titulados] = await db.query('SELECT * FROM alumnos_titulados');

    res.json(titulados);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

