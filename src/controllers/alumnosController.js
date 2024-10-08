import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken"; 

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const verifyToken = async (req, res) => {
  try{
    if (req.headers.authorization === null) {
      return res.status(401).json({status: false, message: "Token no válido"})
    }
    
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol === "alumno"){
      return res.status(200).json({status: true, rol: "alumno", id: decoded.id, message: "Token verificado", token: req.headers.authorization.split(" ")[1]})
    }
    return res.status(401).json({message: "Token vencido o inválido"})
  }catch(e){
    console.log(e)
    return res.status(401).json({status: false, message: "Token no verificado"})
  }
};

export const authAlumno = async (req, res) => {
  try {
    const connection = await createConnection();
    const { token } = req.body;
    const token_dec = jwt.decode(token);
    const [user] = await connection.execute(
      "SELECT mail, RUT FROM alumnos WHERE mail = ?",
      [token_dec.email]
    );
    console.log(user)
    if (user.length == 0) { 
      await connection.end();
      return res
        .status(401)
        .json({ message: "Alumno no perteneciente", status: false });
    } else {
      try { 
        await connection.execute(
          "UPDATE alumnos SET Gtoken = ? WHERE mail = ? ",
          [token, token_dec.email]
        );
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .json({ message: "Alumno no autenticado", status: false });
      }

      await connection.end(); 

      const payload = {
        status: true,
        rol: "alumno",
        email: token_dec.email,
        id: user[0].RUT,
      };
      
      const token_enc = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res
        .status(200)
        .json(token_enc);
    }
  } catch (e) {
    console.log("error: ", e);
    return res
      .status(500)
      .json({ message: "Alumno no autenticado", status: false });
  }
};

// Crear un alumno
export const createAlumno = async (req, res) => {
  console.log(req.body)
  const {
    nombre,
    RUT,
    CODIGO,
    ANO_INGRESO,
    ANO_EGRESO,
    n_resolucion,
    hora,
    fecha_examen,
    mail,
    Gtoken = null ,
    secretario,
    presidente,
    tesis, // Agregar la propiedad tesis
  } = req.body;
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      "INSERT INTO alumnos (nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, mail, Gtoken, secretario, presidente, tesis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        nombre || null,
        RUT,
        CODIGO || null,
        ANO_INGRESO || null,
        ANO_EGRESO || null,
        n_resolucion || null,
        hora || null,
        fecha_examen || null,
        mail,
        Gtoken || null,
        secretario || null,
        presidente || null,
        tesis || null, // Agregar tesis
      ]
    );
    await connection.end();
    res
      .status(201)
      .json({ message: `Alumno creado con RUT: ${results.insertId}` });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los alumnos
export const getAllAlumnos = async (req, res) => {
  try {
    const connection = await createConnection();
    const [results] = await connection.query("SELECT * FROM alumnos ");
    await connection.end();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un alumno
export const updateAlumno = async (req, res) => {
  const { RUT } = req.params;
  const {
    nombre,
    CODIGO,
    ANO_INGRESO,
    ANO_EGRESO,
    n_resolucion,
    hora,
    fecha_examen,
    mail,
    Gtoken,
    secretario,
    presidente,
    tesis, // Agregar la propiedad tesis
  } = req.body;
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      "UPDATE alumnos SET nombre = ?, CODIGO = ?, ANO_INGRESO = ?, ANO_EGRESO = ?, n_resolucion = ?, hora = ?, fecha_examen = ?, mail = ?, Gtoken = ?, secretario = ?, presidente = ?, tesis = ? WHERE RUT = ?",
      [
        nombre,
        CODIGO,
        ANO_INGRESO,
        ANO_EGRESO,
        n_resolucion,
        hora,
        fecha_examen,
        mail,
        Gtoken,
        secretario,
        presidente,
        tesis, // Agregar tesis
        RUT,
      ]
    );
    await connection.end();
    res.json({ message: "Alumno actualizado" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un alumno
export const deleteAlumno = async (req, res) => {
  const { RUT } = req.params;
  try {
    const connection = await createConnection();
    await connection.execute("DELETE FROM alumnos WHERE RUT = ?", [RUT]);
    await connection.end();
    res.json({ message: "Alumno eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTesis = async (req, res) => {
  const { RUT } = req.params; // Obtener el RUT del parámetro de la URL
  const { tesis } = req.body; // Obtener el título de la tesis del cuerpo de la solicitud

  if (!tesis) {
    return res.status(400).json({ message: "El título de la tesis es obligatorio" });
  }

  try {
    const connection = await createConnection();
    // Actualizar solo el campo "tesis" del alumno con el RUT especificado
    const [results] = await connection.execute(
      "UPDATE alumnos SET tesis = ? WHERE RUT = ?",
      [tesis, RUT]
    );
    await connection.end();

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    res.json({ message: "Título de la tesis actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
