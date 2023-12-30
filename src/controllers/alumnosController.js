import mysql2 from "mysql2/promise";
import db from '../database/connection.js';

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

// Crear un alumno
export const createAlumno = async (req, res) => {
    const { nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken } = req.body;
    try {
        const connection = await createConnection();
        const [results] = await connection.execute(
            'INSERT INTO alumnos (nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken]
        );
        await connection.end();
        res.status(201).json({ message: `Alumno creado con RUT: ${results.insertId}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todos los alumnos
export const getAllAlumnos = async (req, res) => {
    try {
      const connection = await createConnection();
      const [results] = await connection.query('SELECT * FROM alumnos ');
      await connection.end();  
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Actualizar un alumno
export const updateAlumno = async (req, res) => {
    const { RUT } = req.params;
    const { nombre, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken } = req.body;
    try {
        const connection = await createConnection();
        const [results] = await connection.execute(
            'UPDATE alumnos SET nombre = ?, CODIGO = ?, ANO_INGRESO = ?, ANO_EGRESO = ?, n_resolucion = ?, hora = ?, fecha_examen = ?, ficha_inscripcion = ?, tesis = ?, mail = ?, Gtoken = ? WHERE RUT = ?',
            [nombre, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken, RUT]
        );
        await connection.end();
        res.json({ message: 'Alumno actualizado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un alumno
export const deleteAlumno = async (req, res) => {
    const { RUT } = req.params;
    try {
        const connection = await createConnection();
        await connection.execute('DELETE FROM alumnos WHERE RUT = ?', [RUT]);
        await connection.end();
        res.json({ message: 'Alumno eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
