import db from '../database/connection.js';
import mysql2 from "mysql2/promise";

// Create a new connection using MySQL 2
const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const getProfesoresGuias = async (req, res) => {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query('SELECT id, nombre FROM guias');
        res.json(rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const getProfesoresInformantes = async (req, res) => {
    try {
        const connection = await createConnection();
        const [rows] = await connection.query('SELECT id, nombre FROM informantes');
        res.json(rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const updateProfesorAsignado = async (req, res) => {
    const { tituladoId, profesorGuiaId, profesorInformanteId } = req.body;
    try {
        const connection = await createConnection();
        await connection.query('UPDATE alumnos_titulados SET guias = ?, informantes = ? WHERE id = ?', 
        [profesorGuiaId, profesorInformanteId, tituladoId]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).send('Server error');
    }
};
