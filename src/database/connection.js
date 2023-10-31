import mysql from "mysql2";
import values from "../const/const.js";

const connectionConfig = {
  host: values.HOST,
  user: values.USER,
  password: "",
  database: values.DATABASE,
};

const tempConnection = mysql.createConnection({
  host: connectionConfig.host,
  user: connectionConfig.user,
  password: connectionConfig.password,
});

tempConnection.query(
  `CREATE DATABASE IF NOT EXISTS ${connectionConfig.database}`,
  (error) => {
    if (error) {
      console.error("Error al crear la base de datos: ", error);
      return;
    }

    console.log("Base de datos creada o ya existente");

    // Cerrar la conexión temporal
    tempConnection.end();
  }
);

// Crear la conexión real a la base de datos
const db = mysql.createConnection(connectionConfig).promise();

export default db;
