import mysql2 from "mysql2/promise";
import db from "../database/connection.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const descargar = async (req, res) => {
  const filePath = path.join(__dirname, '../public/fichas_tesis', `${req.params.rut}.docx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      } else {
        console.log("Archivo descargado con éxito");
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaGuía = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Guía', `FORMATO PROFESOR GUÍA.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `FORMATO PROFESOR GUÍA.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaInformante = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Informante', `FORMATO PROFESOR INFORMANTE.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `FORMATO PROFESOR INFORMANTE.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const subirArchivo = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ message: "No se ha subido ningún archivo" });
  }
  
  let file = req.files.file;
  const name = req.params.id; 
  let uploadPath = path.join(__dirname, '../public/fichas_tesis', `${name}.docx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    } else {
      res.status(200).send({ message: "Archivo subido con éxito." });
    }
  });
};
















export const subirRubricaInformante = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(__dirname, '../public/rubricas/Informante2', `${alumnoRUT}.xlsx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir la rúbrica del informante:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    }
    res.send({ message: "La rúbrica del informante ha sido subida correctamente." });
  });
};

// Existing function for subirRubricaGuia with database interaction removed
export const subirRubricaGuia = async (req, res) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send({ message: "No se ha subido ningún archivo." });
  }

  const file = req.files.file;
  const alumnoRUT = req.params.rut;
  const uploadPath = path.join(__dirname, '../public/rubricas/Guia2', `${alumnoRUT}.xlsx`);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error('Error al subir la rúbrica del guía:', err);
      return res.status(500).send({ message: "No se ha podido subir el archivo" });
    }
    res.send({ message: "La rúbrica del guía ha sido subida correctamente." });
  });
};


export const descargarRubricaGuiaConNotas = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Guia2', `${req.params.rut}.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Rubrica_Guia_Con_Notas_${req.params.rut}.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};

export const descargarRubricaInformanteConNotas = async (req, res) => {
  const filePath = path.join(__dirname, '../public/rubricas/Informante2', `${req.params.rut}.xlsx`);
  if (fs.existsSync(filePath)) {
    res.download(filePath, `Rubrica_Informante_Con_Notas_${req.params.rut}.xlsx`, (err) => {
      if (err) {
        res.status(500).send({
          message: "No se pudo descargar el archivo. " + err,
        });
      }
    });
  } else {
    res.status(404).send({
      message: "Archivo no encontrado."
    });
  }
};