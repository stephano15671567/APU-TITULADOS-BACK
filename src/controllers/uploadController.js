import XLSX from "xlsx";
import db from "../database/connection.js";

const uploadFile = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No se subió ningún archivo.");
  }

  let uploadedFile = req.files.myFile;
  const workbook = XLSX.read(uploadedFile.data, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  data.shift();
  let placeholders = data
    .map((row) => "(" + row.map(() => "?").join(",") + ")")
    .join(",");
  let flatValues = data.reduce((acc, row) => [...acc, ...row], []);

  const query = `
  INSERT INTO alumnos_titulados
    (alumno, rut, codigo, ano_ingreso, ano_egreso, num_resolucion, fecha_examen, hora, mail, guia, profesor_guia, presidente, secretario, tesis, guia_nota, informante_nota, promedio_nota_tesis, examen_oral_nota, seminario_titulo_nota, nota_final_egreso)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`;

  db.query(query, flatValues, (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error al procesar los datos");
    }
    res.send({
      message: "Datos cargados exitosamente",
      insertedRows: results.affectedRows,
    });
  });
};

export { uploadFile };
