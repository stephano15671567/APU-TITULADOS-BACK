import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import jwt from "jsonwebtoken";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

export const authSecretaria = async (req, res) => {
  try {
    const connection = await createConnection();
    const { token } = req.body;
    const token_dec = jwt.decode(token);
    const [user] = await connection.execute(
      "SELECT mail FROM secretaria WHERE mail = ?",
      [token_dec.email]
    );
    if (user.length == 0) {
      //Situación donde no existe alumno dentro de la bd
      await connection.end();
      return res
        .status(401)
        .json({ message: "Secretaria no perteneciente", status: false });
    } else {
      try {
        //Situación donde existe alumno dentro de la bd
        await connection.execute(
          "UPDATE secretaria SET Gtoken = ? WHERE mail = ? ",
          [token, token_dec.email]
        );
      } catch (e) {
        console.log(e);
        return res
          .status(500) //Error de sv
          .json({ message: "Secretaria no autenticado", status: false });
      }

      await connection.end(); //Situación donde existe alumno dentro de la bdssss
      const payload = {
        status: true,
        rol: "secretaria",
        email: token_dec.email,
      };

      const token_enc = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.status(200).json(token_enc); //GENERAR CORREO ENCRIPTADO PARA DESPUÉS
    }
  } catch (e) {
    //Error de sv
    console.log("error: ", e);
    return res
      .status(500)
      .json({ message: "secretaria no autenticado", status: false });
  }
};

export const verifyToken = async (req, res) => {
  try {
    if (req.headers.authorization === null) {
      return res
        .status(401)
        .json({ status: false, message: "Token no válido" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol === "secretaria") {
      return res
        .status(200)
        .json({
          status: true,
          rol: "secretaria",
          message: "Token verificado",
          token: req.headers.authorization.split(" ")[1],
        });
    }
    return res.status(401).json({ message: "Token vencido o inválido" });
  } catch (e) {
    console.log(e);
    return res
      .status(401)
      .json({ status: false, message: "Token no verificado" });
  }
};
