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
    const notaField = rol === "guia" ? "nota_guia" : "nota_informante";
    const parsedNota = parseFloat(nota).toFixed(2);
    console.log(alumno_RUT, parsedNota)
    // Ensure proper formatting and parameter passing for the SELECT query
    const [existing] = await connection.execute(
      `SELECT n.nota_id
       FROM notas n
       INNER JOIN asigancionesprofesores ap ON n.alumno_RUT = ap.alumno_RUT
       WHERE n.alumno_RUT = ? AND ap.profesor_id = ?`,
      [alumno_RUT, profesor_id]
    );

    if (existing.length > 0) {
      // Update the existing note
      await connection.execute(
        `UPDATE notas SET ${notaField} = ? WHERE nota_id = ?`,
        [parsedNota, existing[0].nota_id]
      );
    } else {
      // Insert a new note if necessary
      await connection.execute(
        `INSERT INTO notas (alumno_RUT, ${notaField}) VALUES (?, ?)`,
        [alumno_RUT, parsedNota]
      );
    }

    await connection.end();
    res.status(200).json({ message: "Nota actualizada con éxito" });
  } catch (error) {
    console.log(error);
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
    res
      .status(500)
      .json({ message: "Error al eliminar la nota: " + error.message });
  }
};

export const upsertNotaDefensa = async (req, res) => {
  const { alumno_RUT, nota_defensa } = req.body;
  try {
    const connection = await createConnection();
    const [existing] = await connection.execute(
      "SELECT nota_id FROM notas WHERE alumno_RUT = ?",
      [alumno_RUT]
    );

    if (existing.length > 0) {
      // Update the existing note
      await connection.execute(
        "UPDATE notas SET nota_examen_oral = ? WHERE alumno_RUT = ?",
        [nota_defensa, alumno_RUT]
      );
    } else {
      // Insert a new note
      await connection.execute(
        "INSERT INTO notas (alumno_RUT, nota_examen_oral) VALUES (?, ?)",
        [alumno_RUT, nota_defensa]
      );
    }
    await connection.end();
    res.status(200).json({ message: "Nota de defensa actualizada con éxito" });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la nota de defensa: " + error.message,
    });
  }
};
