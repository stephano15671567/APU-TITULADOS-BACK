import XLSX from "xlsx";
import mysql2 from "mysql2/promise";
import db from "../database/connection.js";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

const uploadFile = async (req, res) => {
  try {
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
    const insertQuery = "INSERT INTO alumnos_titulados (id, alumno, rut, codigo, ano_ingreso, ano_egreso, num_resolucion, fecha_examen, hora, mail, guia, profesor_guia, informante, secretario, tesis, guia_nota, informante_nota, promedio_nota_tesis, examen_oral_nota, seminario_titulo_nota, nota_final_egreso) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    const insertPromises = data.map((elemento, index) => {
      const elemento_exacto = [
        index + 1,
        elemento["Alumno"] || null,
        elemento["RUT"] || null,
        elemento["CODIGO"] || null,
        elemento["AÑO INGRSO"] || null,
        elemento["AÑO/EGRESO"] || null,
        elemento["Nº RESOLUCION"] || null,
        elemento["Fecha EXAMEN"] || null,
        elemento["Hora"] || null,
        elemento["Mail"] || null,
        elemento["Guia"] || null,
        elemento["Profesor Guia"] || null,
        elemento["Informante"] || null,
        elemento["Presidente"] || null,
        elemento["Secretario"] || null,
        elemento["Tesis"] || null,
        elemento["GUIA"] || null,
        elemento["INFORMANTE"] || null,
        elemento["PROMEDIO (NOTA DE TESIS)"] || null,
        elemento["N.EX.ORAL (EXAMEN DE GRADO)"] || null,
        elemento["N.FINAL (SEMINARIO DE TITULO)"] || null,
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
