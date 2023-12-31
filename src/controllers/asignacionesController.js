import mysql2 from "mysql2/promise";
import db from '../database/connection.js'; // Asegúrate de que la ruta sea correcta

const createConnection = async () => {
    return await mysql2.createConnection(db);
};

export const assignProfessorToStudent = async (req, res) => {
    const connection = await createConnection();
    const { alumnoId, profesorId, rol } = req.body;
    try {
      
      const [results] = await connection.execute(
        'INSERT INTO asignaciones_profesores (alumno_RUT, profesor_id, rol) VALUES (?, ?, ?)',
        [alumnoId, profesorId, rol]
      );
      res.status(201).json({ message: 'Asignación creada con éxito.', data: results });
    } catch (error) {
      if (connection) await connection.end();
      res.status(500).json({ message: 'Error al crear la asignación.', error: error.message });
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
            'SELECT * FROM asignaciones_profesores WHERE alumno_RUT = ?',
            [alumnoId]
        );
        await connection.end();
        res.json(results);
    } catch (error) {
        if (connection) await connection.end();
        res.status(500).json({ message: 'Error al obtener las asignaciones.', error: error.message });
    }
};





