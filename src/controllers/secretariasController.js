import bcrypt from 'bcryptjs';
import db from '../database/connection.js';
import mysql2 from "mysql2/promise";
import jwt from 'jsonwebtoken';
const createConnection = async () => {
    return await mysql2.createConnection(db);
  };
  
  export const login = async (req, res) => {
    const { correo, contraseña } = req.body;
    try {
      const connection = await createConnection();
      const [rows] = await connection.query('SELECT * FROM secretarias WHERE correo = ?', [correo]);
      const secretaria = rows[0];
      
      if (!secretaria) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
  
      const contraseñaValida = await bcrypt.compare(contraseña, secretaria.contraseña);
      if (!contraseñaValida) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
  
      const token = jwt.sign({ id: secretaria.id }, process.env.JWT_SECRET, {
        expiresIn: '1h' // Token expires in 1 hour
      });
  
      res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };

