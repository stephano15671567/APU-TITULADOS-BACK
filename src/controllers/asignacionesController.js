import mysql2 from "mysql2/promise";
import db from "../database/connection.js"; // Asegúrate de que la ruta sea correcta

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const modifyAssignment = async (req, res) => {
  const { id } = req.params;
  const { profesorId, rol, alumnoId } = req.body;
  const connection = await createConnection();
  console.log(req.body)
  try {
     const [rev] = await connection.execute(
      "SELECT * FROM asignaciones_profesores WHERE alumno_RUT = ?",
      [alumnoId]
    );
    for (const element of rev) {
      if (element.profesor_id === profesorId && element.rol === rol) {
        await connection.end();
        return res.status(500).json({ message: "No se puede asignar a un mismo profesor" });
      }
    }
    
    const [results] = await connection.execute(
      "UPDATE asignaciones_profesores SET profesor_id = ?, rol = ? WHERE asignacion_id = ?",
      [profesorId, rol, id]
    );
    res.status(200).json({ message: "Asignación modificada con éxito." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Error al modificar la asignación.",
        error: error.message,
      });
  }
};

export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  const connection = await createConnection();
  try {
    const [results] = await connection.execute(
      "DELETE FROM asignaciones_profesores WHERE `asignaciones_profesores`.`asignacion_id` = ?",
      [id]
    );
    res.status(200).json({ message: "Asignación eliminada con éxito." });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error al eliminar la asignación.",
        error: error.message,
      });
  }
};

export const assignProfessorToStudent = async (req, res) => {
  const connection = await createConnection();
  const { alumnoId, profesorId, rol } = req.body;
  console.log(alumnoId, profesorId, rol);
  try {
    //Ese alumno ya fue asignado a ese profesor
    const [rev] = await connection.execute(
      "SELECT * FROM asignaciones_profesores WHERE alumno_RUT = ? AND profesor_id = ? ",
      [alumnoId, profesorId]
    );

    console.log(rev);
    if (rev[0]) {
      return res.status(409).json({
        message: "El alumno ya fue asignado a ese profesor.",
        data: rev,
      });
    }

    const [results] = await connection.execute(
      "INSERT INTO asignaciones_profesores (alumno_RUT, profesor_id, rol) VALUES (?, ?, ?)",
      [alumnoId, profesorId, rol]
    );

    res
      .status(201)
      .json({ message: "Asignación creada con éxito.", data: results });
  } catch (error) {
    if (connection) await connection.end();
    res
      .status(500)
      .json({ message: "Error al crear la asignación.", error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener todas las asignaciones de un alumno
export const getAssignmentsByStudent = async (req, res) => {
  const { alumnoId } = req.params;
  try {
    const connection = await createConnection();
    const [results] = await connection.query(
      "SELECT * FROM asignaciones_profesores WHERE alumno_RUT = ?",
      [alumnoId]
    );
    await connection.end();
    res.json(results);
  } catch (error) {
    if (connection) await connection.end();
    res.status(500).json({
      message: "Error al obtener las asignaciones.",
      error: error.message,
    });
  }
};
export const getGuiaAssignmentsByProfessor = async (req, res) => {
  const { profesorId } = req.params;
  const connection = await createConnection();
  try {
    const [guiaAssignments] = await connection.query(
      'SELECT * FROM asignaciones_profesores WHERE profesor_id = ? AND rol = "guia"',
      [profesorId]
    );
    res.json(guiaAssignments);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las asignaciones como guía.",
      error: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

export const getInformanteAssignmentsByProfessor = async (req, res) => {
  const { profesorId } = req.params;
  const connection = await createConnection();
  try {
    const [informanteAssignments] = await connection.query(
      'SELECT * FROM asignaciones_profesores WHERE profesor_id = ? AND rol = "informante"',
      [profesorId]
    );
    res.json(informanteAssignments);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener las asignaciones como informante.",
      error: error.message,
    });
  } finally {
    if (connection) await connection.end();
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const connection = await createConnection();
    const [results] = await connection.query(
      "SELECT asi.profesor_id, asi.asignacion_id, a.nombre as alumno_nombre, a.rut as alumno_RUT, p.nombre as nombre_profesor, asi.rol FROM alumnos as a INNER JOIN asignaciones_profesores as asi ON a.RUT = asi.alumno_RUT INNER JOIN profesores as p ON asi.profesor_id = p.profesor_id;        "
    );
    await connection.end();
    res.status(200).json(results);
  } catch (error) {
    if (connection) await connection.end();
    res.status(500).json({
      message: "Error al obtener las asignaciones.",
      error: error.message,
    });
  }
};
/* SELECT asi.asignacion_id, a.nombre, p.nombre, asi.rol FROM alumnos as a INNER JOIN asignaciones_profesores as asi ON a.RUT = asi.alumno_RUT INNER JOIN profesores as p ON asi.profesor_id = p.profesor_id; */
