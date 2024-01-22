// notasController.js
import mysql2 from "mysql2/promise";
import db from "../database/connection.js";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

// Obtener todas las notas
export const getAllNotas = async (req, res) => {
  try {
    const connection = await createConnection();
    const [results] = await connection.query("SELECT * FROM notas");
    await connection.end();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener las notas de un alumno específico
export const getNotasAlumno = async (req, res) => {
  const { alumno_RUT } = req.params;
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      "SELECT * FROM notas WHERE alumno_RUT = ?",
      [alumno_RUT]
    );
    await connection.end();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// Crear o actualizar una nota
export const upsertNota = async (req, res) => {
  const { alumno_RUT, profesor_id, nota, rol } = req.body;
  try {
    const connection = await createConnection();
    const notaField = rol === 'guia' ? 'nota_guia' : 'nota_informante';

    // This assumes that there's a relationship between the notas and asignaciones_profesores tables
    const [existing] = await connection.execute(
      `SELECT n.nota_id
       FROM notas n
       INNER JOIN asignaciones_profesores ap ON n.alumno_RUT = ap.alumno_RUT
       WHERE n.alumno_RUT = ? AND ap.profesor_id = ?`,
      [alumno_RUT, profesor_id]
    );

    if (existing.length > 0) {
      // Update the existing note
      await connection.execute(
        `UPDATE notas SET ${notaField} = ? WHERE nota_id = ?`,
        [nota, existing[0].nota_id]
      );
    } else {
      // Insert a new note if necessary
      // You'll need the appropriate INSERT statement here
    }
    await connection.end();
    res.status(200).json({ message: "Nota actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  

// Eliminar una nota
export const deleteNota = async (req, res) => {
  const { nota_id } = req.params;
  try {
    const connection = await createConnection();
    await connection.execute("DELETE FROM notas WHERE nota_id = ?", [nota_id]);
    await connection.end();
    res.status(200).json({ message: "Nota eliminada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la nota: " + error.message });
  }
};