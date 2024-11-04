import mysql2 from "mysql2/promise";
import db from "../database/connection.js"; // Asegúrate de que la ruta sea correcta

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

const incompatibleRolesMap = {
  guia: ['informante'],
  informante: ['guia'],
  presidente: ['secretario'],
  secretario: ['presidente'],
};

const checkForIncompatibleRoles = async (connection, alumnoId, newProfesorId, newRol, existingAssignmentId = null) => {
  // Fetch existing assignments excluding the current one (if updating)
  const [existingAssignments] = await connection.execute(
    "SELECT * FROM asignaciones_profesores WHERE alumno_RUT = ?" + (existingAssignmentId ? " AND asignacion_id != ?" : ""),
    existingAssignmentId ? [alumnoId, existingAssignmentId] : [alumnoId]
  );

  // Check if the new role is incompatible with any of the existing roles for this student
  for (const existingAssignment of existingAssignments) {
    if (
      existingAssignment.profesor_id === newProfesorId &&
      incompatibleRolesMap[newRol]?.includes(existingAssignment.rol)
    ) {
      throw new Error("Invalid role combination for the professor and student.");
    }
  }
};

export const assignProfessorToStudent = async (req, res) => {
  const { alumnoId, profesorId, rol } = req.body;
  const connection = await createConnection();

  try {
    await connection.beginTransaction();

    // Check for incompatible roles before inserting a new assignment
    await checkForIncompatibleRoles(connection, alumnoId, profesorId, rol);

    // Insert the new assignment with fechaAsignacion
    const [result] = await connection.execute(
      "INSERT INTO asignaciones_profesores (alumno_RUT, profesor_id, rol, fechaAsignacion) VALUES (?, ?, ?, NOW())",
      [alumnoId, profesorId, rol]
    );

    await connection.commit(); // Commit the transaction if everything is fine
    await connection.end();

    // Obtener asignacion_id y fechaAsignacion
    const asignacion_id = result.insertId;
    const fechaAsignacion = new Date().toISOString(); // Fecha y hora actuales

    res.status(201).json({
      message: "Assignment created successfully.",
      asignacion_id,
      fechaAsignacion,
    });
  } catch (error) {
    await connection.rollback(); // Roll back the transaction in case of an error
    await connection.end();
    res.status(500).json({ message: "Error creating the assignment.", error: error.message });
  }
};

export const modifyAssignment = async (req, res) => {
  const { id } = req.params;
  const { profesorId, rol, alumnoId } = req.body;
  const connection = await createConnection();
  try {
    await checkForIncompatibleRoles(connection, alumnoId, profesorId, rol, id);

    // Proceed with updating the assignment if no incompatible roles found
    const [results] = await connection.execute(
      "UPDATE asignaciones_profesores SET profesor_id = ?, rol = ? WHERE asignacion_id = ?",
      [profesorId, rol, id]
    );

    await connection.end();
    res.status(200).json({ message: "Assignment modified successfully.", data: results });
  } catch (error) {
    await connection.end();
    res.status(500).json({ message: "Error modifying the assignment.", error: error.message });
  }
};

export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  const connection = await createConnection();

  try {
    // Eliminar la asignación directamente sin intentar actualizar la tabla alumnos
    await connection.execute(
      "DELETE FROM asignaciones_profesores WHERE asignacion_id = ?",
      [id]
    );

    await connection.end();
    res.status(200).json({ message: "Asignación eliminada con éxito." });
  } catch (error) {
    await connection.end();
    res.status(500).json({ message: "Error al eliminar la asignación.", error: error.message });
  }
};

// Obtener todas las asignaciones de un alumno
export const getAssignmentsByStudent = async (req, res) => {
  const { alumnoId } = req.params;
  let connection;
  try {
    connection = await createConnection();
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
  let connection;
  try {
    connection = await createConnection();
    const [results] = await connection.query(
      "SELECT asi.profesor_id, asi.asignacion_id, a.nombre as alumno_nombre, a.RUT as alumno_RUT, p.nombre as nombre_profesor, asi.rol, asi.fechaAsignacion FROM alumnos as a INNER JOIN asignaciones_profesores as asi ON a.RUT = asi.alumno_RUT INNER JOIN profesores as p ON asi.profesor_id = p.profesor_id;"
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
