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




// Update the assigned 'profesor_guia' and 'profesor_informante' for a 'titulado'
export const updateProfesorAsignado = async (req, res) => {
    const { tituladoId, profesorGuiaId, profesorInformanteId } = req.body;
    try {
        const connection = await createConnection();

        // Retrieve the guide name
        const [guiaRows] = await connection.query('SELECT nombre FROM guias WHERE id = ?', [profesorGuiaId]);
        const guiaNombre = guiaRows[0]?.nombre || null;

        // Retrieve the informant name
        const [informanteRows] = await connection.query('SELECT nombre FROM informantes WHERE id = ?', [profesorInformanteId]);
        const informanteNombre = informanteRows[0]?.nombre || null;

        // Update the alumnos_titulados table with the new guia_id, informante_id, and their names
        await connection.query('UPDATE alumnos_titulados SET guia_id = ?, informante_id = ?, guia = ?, informante = ? WHERE id = ?', 
        [profesorGuiaId, profesorInformanteId, guiaNombre, informanteNombre, tituladoId]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get detailed information for 'alumnos_titulados' including guide and informant names
export const getAlumnosTituladosWithDetails = async (req, res) => {
    try {
        const connection = await createConnection();
        const query = `
            SELECT at.*, g.nombre AS nombre_guia, i.nombre AS nombre_informante
            FROM alumnos_titulados at
            LEFT JOIN guias g ON at.guia_id = g.id
            LEFT JOIN informantes i ON at.informante_id = i.id;
        `;
        const [rows] = await connection.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


