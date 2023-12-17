import bcrypt from 'bcryptjs';
import db from '../database/connection.js';
import mysql2 from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const login = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const connection = await createConnection();
    // Intentar encontrar el usuario en la tabla 'guias'
    let [rows] = await connection.query('SELECT * FROM guias WHERE correo = ?', [correo]);
    let usuario = rows[0];

    // Si no se encuentra en 'guias', intentar en 'informantes'
    if (!usuario) {
      [rows] = await connection.query('SELECT * FROM informantes WHERE correo = ?', [correo]);
      usuario = rows[0];
    }

    // Si no se encuentra en ninguna de las dos tablas, devolver un error
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Comprobar la contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Si la contraseña es válida, generar un token
    const token = jwt.sign({ id: usuario.id }, process.env.SECRET, {
      expiresIn: '1h'
    });

    return res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const asignarNotaGuia = async (req, res) => {
  const { idAlumno, nota } = req.body;
  const idGuia = req.user.id; // Asumiendo que el ID del guía está en la sesión del usuario

  try {
    const connection = await createConnection();
    const [result] = await connection.execute(
        'UPDATE alumnos_titulados SET guia_nota = ? WHERE id = ? AND guia_id = ?',
        [nota, idAlumno, idGuia]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Nota del guía actualizada con éxito' });
    } else {
      res.status(404).json({ message: 'Alumno no encontrado o guía no coincide' });
    }
  } catch (error) {
    console.error('Error al asignar nota del guía:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
  
