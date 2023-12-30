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
      return res.status(200).json({message: "Token verificado", token: req.headers.authorization.split(" ")[1]})
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
      "SELECT mail FROM alumnos WHERE mail = ?",
      [token_dec.email]
    );
    if (user.length == 0) { //Situación donde no existe alumno dentro de la bd
      await connection.end();
      return res
        .status(401)
        .json({ message: "Alumno no perteneciente", status: false });
    } else {
      try { //Situación donde existe alumno dentro de la bd
        await connection.execute(
          "UPDATE alumnos SET Gtoken = ? WHERE mail = ? ",
          [token, token_dec.email]
        );
      } catch (e) {
        console.log(e);
        return res
          .status(500) //Error de sv
          .json({ message: "Alumno no autenticado", status: false });
      }

      await connection.end(); //Situación donde existe alumno dentro de la bd

      const payload = {
        status: true,
        rol: "alumno",
        email: token_dec.email,
      };
      
      const token_enc = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res
        .status(200)
        .json(token_enc);  //GENERAR CORREO ENCRIPTADO PARA DESPUÉS
    }
  } catch (e) { //Error de sv
    console.log("error: ", e);
    return res
      .status(500)
      .json({ message: "Alumno no autenticado", status: false });
  }
};

// Crear un alumno
export const createAlumno = async (req, res) => {
  const {
    nombre,
    RUT,
    CODIGO,
    ANO_INGRESO,
    ANO_EGRESO,
    n_resolucion,
    hora,
    fecha_examen,
    ficha_inscripcion,
    tesis,
    mail,
    Gtoken,
  } = req.body;
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      "INSERT INTO alumnos (nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, hora, fecha_examen, ficha_inscripcion, tesis, mail, Gtoken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        nombre,
        RUT,
        CODIGO,
        ANO_INGRESO,
        ANO_EGRESO,
        n_resolucion,
        hora,
        fecha_examen,
        ficha_inscripcion,
        tesis,
        mail,
        Gtoken,
      ]
    );
    await connection.end();
    res
      .status(201)
      .json({ message: `Alumno creado con RUT: ${results.insertId}` });
  } catch (error) {
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
    ficha_inscripcion,
    tesis,
    mail,
    Gtoken,
  } = req.body;
  try {
    const connection = await createConnection();
    const [results] = await connection.execute(
      "UPDATE alumnos SET nombre = ?, CODIGO = ?, ANO_INGRESO = ?, ANO_EGRESO = ?, n_resolucion = ?, hora = ?, fecha_examen = ?, ficha_inscripcion = ?, tesis = ?, mail = ?, Gtoken = ? WHERE RUT = ?",
      [
        nombre,
        CODIGO,
        ANO_INGRESO,
        ANO_EGRESO,
        n_resolucion,
        hora,
        fecha_examen,
        ficha_inscripcion,
        tesis,
        mail,
        Gtoken,
        RUT,
      ]
    );
    await connection.end();
    res.json({ message: "Alumno actualizado" });
  } catch (error) {
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
