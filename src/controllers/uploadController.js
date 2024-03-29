import XLSX from "xlsx";
import mysql2 from "mysql2/promise";
import db from "../database/connection.js";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

const uploadFile = async (req, res) => {
  try {
    console.log(req.files)
    // Crear la conexión con la base de datos
    const connection = await createConnection();

    // Verificar si se ha subido un archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    let file = req.files.archivo;
    let path = "./src/public/" + file.name;

    // Mover el archivo subido al directorio deseado
    await new Promise((resolve, reject) => {
      file.mv(path, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Leer y procesar el archivo Excel
    const workbook = XLSX.readFile(path);
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

    // Preparar y ejecutar las consultas de inserción para cada fila
    const insertQuery = "INSERT INTO alumnos (nombre, RUT, CODIGO, ANO_INGRESO, ANO_EGRESO, n_resolucion, fecha_examen, hora, mail) VALUES (?,?,?,?,?,?,?,?,?);";
    const insertPromises = data.map((elemento) => {
    const elemento_exacto = [
    elemento["Alumno"] || null,  
    elemento["RUT"] || null,
    elemento["CODIGO"] || null,
    elemento["AÑO INGRESO"] || null,
    elemento["AÑO/EGRESO"] || null,
    elemento["Nº RESOLUCION"] || null,
    elemento["Fecha EXAMEN"] || null,
    elemento["Hora"] || null,
    elemento["Mail"] || null,
  ];
  
  return connection.execute(insertQuery, elemento_exacto);
});

    // Esperar a que todas las inserciones se completen
    await Promise.all(insertPromises);

    // Enviar la respuesta de éxito
    res.status(200).send("File uploaded successfully!");
  } catch (error) {
    console.error(error);

    // Enviar la respuesta de error solo si no se ha enviado una respuesta previamente
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};


export { uploadFile };
