import XLSX from "xlsx";
import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import e from "express";

const createConnection = async () => {
  return await mysql2.createConnection(db);
};

const uploadFile = async (req, res) => {
  try {
    const connection = await createConnection();

    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send("No files were uploaded.");
      return;
    }

    let file = req.files.archivo;
    let path = "./src/public/" + file.name;
    file.mv(path, function (err) {
      if (err) return res.status(500).send(err);
    });

    let workbook = XLSX.readFile(path);
    const data = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    const insertQuery =
      "INSERT INTO alumnos_titulados (`id`, `alumno`, `rut`, `codigo`, `ano_ingreso`, `ano_egreso`, `num_resolucion`, `fecha_examen`, `hora`, `mail`, `guia`, `profesor_guia`, `presidente`, `secretario`, `tesis`, `guia_nota`, `informante_nota`, `promedio_nota_tesis`, `examen_oral_nota`, `seminario_titulo_nota`, `nota_final_egreso`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    console.log(data);
    data.forEach(async (elemento, index) => {
      let elemento_exacto = [
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
      
      await connection.execute(insertQuery, elemento_exacto);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
  res.status(200).send("File uploaded!");
};
export { uploadFile };
