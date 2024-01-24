import mysql2 from "mysql2/promise";
import db from '../database/connection.js';
import jwt from "jsonwebtoken"; 

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

export const authAcademico = async (req, res) => {
  try {
    const connection = await createConnection();
    const { token } = req.body;
    const token_dec = jwt.decode(token);
    const [user] = await connection.execute(
      "SELECT mail FROM profesores WHERE mail = ?",
      [token_dec.email]
    );
    let [id] = await connection.execute(
      "SELECT profesor_id FROM profesores WHERE mail = ?",
      [token_dec.email]
    );
    const {profesor_id} = id[0]
    if (user.length == 0) { //Situación donde no existe profesor dentro de la bd
      await connection.end();
      return res
        .status(401)
        .json({ message: "Profesor no perteneciente", status: false });
    } else {
      try { //Situación donde existe profesor dentro de la bd
        await connection.execute(
          "UPDATE profesores SET Gtoken = ? WHERE mail = ? ",
          [token, token_dec.email]
        );
      } catch (e) {
        console.log(e);
        return res
          .status(500) //Error de sv
          .json({ message: "Profesor no autenticado", status: false });
      }
      
      await connection.end(); //Situación donde existe profesor dentro de la bdssss
      const payload = {
        status: true,
        rol: "profesor",
        email: token_dec.email,
        id: profesor_id
      };
      
      console.log(payload)
      const token_enc = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res
        .status(200)
        .json(token_enc);  //GENERAR CORREO ENCRIPTADO PARA DESPUÉS
    }
  } catch (e) { //Error de sv
    console.log("error: ", e);
    return res
      .status(500)
      .json({ message: "Profesor no autenticado", status: false });
  }
};

export const verifyToken = async (req, res) => {
  try{
    const connection = await createConnection();
    if (req.headers.authorization === null) {
      return res.status(401).json({status: false, message: "Token no válido"})
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = jwt.decode(token);
    if (decoded.rol === "profesor"){
      return res.status(200).json({status: true, rol: "profesor",message: "Token verificado", id: user.id, token: req.headers.authorization.split(" ")[1]})
    }
    return res.status(401).json({message: "Token vencido o inválido"})
  }catch(e){
    console.log(e)
    return res.status(401).json({status: false, message: "Token no verificado"})
  }
};

export const updateNota = async (req, res) => {
  const connection = await createConnection();
  const { estudianteId, nota } = req.body;

  try {
      await connection.query(
          'INSERT INTO notas (alumno_RUT, nota_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE nota_guia = ?',
          [estudianteId, nota, nota]
      );
      res.status(200).json({ message: 'Nota actualizada exitosamente' });
  } catch (error) {
      console.error('Error al actualizar la nota:', error);
      res.status(500).send('Error al actualizar la nota');
  } finally {
      await connection.end();
  }
};




/* Consultas a la base de datos
const [asignacionesGuia] = await connection.query(
  'SELECT a.nombre, a.RUT, a.mail FROM alumnos a ' +
  'INNER JOIN asignaciones_profesores ap ON a.RUT = ap.alumno_RUT ' +
  'WHERE ap.profesor_id = ? AND ap.rol = "Guia"', 
  [profesorId]
);

const [asignacionesInformante] = await connection.query(
  'SELECT a.nombre, a.RUT, a.mail FROM alumnos a ' +
  'INNER JOIN asignaciones_profesores ap ON a.RUT = ap.alumno_RUT ' +
  'WHERE ap.profesor_id = ? AND ap.rol = "Informante"',
  [profesorId]
);

// Cerrar la conexión a la base de datos
await connection.end();

// Enviar los resultados como respuesta
res.json({
  guia: asignacionesGuia,
  informante: asignacionesInformante
});
*/
