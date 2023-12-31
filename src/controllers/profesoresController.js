import mysql2 from "mysql2/promise";
import db from '../database/connection.js';

const createConnection = async () => {
    return await mysql2.createConnection(db);
  };

//obtener profesores
export const getProfesores = async (req, res) => {
  const connection = await createConnection();
  try {
    const [rows] = await connection.query('SELECT * FROM profesores');
    res.json(rows);
  } catch (error) {
    console.error('Error getting profesores:', error);
    res.status(500).send('Server error');
  } finally {
    await connection.end();
  }
};

//obtener profesores por id
export const getProfesor = async (req, res) => {
  const connection = await createConnection();
  const { id } = req.params;
  try {
    const [rows] = await connection.query('SELECT * FROM profesores WHERE profesor_id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting profesor:', error);
    res.status(500).send('Server error');
  } finally {
    await connection.end();
  }
};

//crear profesores
export const createProfesor = async (req, res) => {
  const connection = await createConnection();
  const { nombre, mail} = req.body;
  try {
    const [result] = await connection.query('INSERT INTO profesores (nombre, mail) VALUES (?, ?)', [nombre, mail]);
    res.json(result);
  } catch (error) {
    console.error('Error creating profesor:', error);
    res.status(500).send('Server error');
  } finally {
    await connection.end();
  }
};

//agregar profesor
export const updateProfesor = async (req, res) => {
  const connection = await createConnection();
  const { id } = req.params;
  const { nombre, mail} = req.body;
  try {
    const [result] = await connection.query('UPDATE profesores SET nombre = ?, mail = ? WHERE profesor_id = ?', [nombre, mail, id]);
    res.json(result);
  } catch (error) {
    console.error('Error updating profesor:', error);
    res.status(500).send('Server error');
  } finally {
    await connection.end();
  }
};

//eliminar profesor
export const deleteProfesor = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await createConnection();
    await connection.execute('DELETE FROM profesores WHERE profesor_id = ?', [id]);
    await connection.end();
    res.send('Profesor deleted successfully');
  } catch (error) {
        res.status(500).send('Server error');
  } 
};

