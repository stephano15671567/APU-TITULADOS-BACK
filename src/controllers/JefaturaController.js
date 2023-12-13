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
      const [rows] = await connection.query('SELECT * FROM jefatura WHERE correo = ?', [correo]);
      const jefatura = rows[0];
      if (!jefatura) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
      

      const contraseñaValida = await bcrypt.compare(contraseña, jefatura.contraseña);
      //$2a$05$IMA9FyZvbZX66MkJG9CfS.5ZOP1t4z9qU6h2hwGq2pUdYKuq2HKeC
      if (!contraseñaValida) {
        return res.status(401).json({ message: 'Credenciales incorrectas' });
      }
    
      // If password is valid, generate a token
      const token = jwt.sign({ id: jefatura.id }, process.env.SECRET, {
        expiresIn: '1h'
      });
    
      return res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
