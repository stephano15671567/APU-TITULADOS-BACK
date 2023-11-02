import express from 'express';
import multer from 'multer';
import db from '../database/connection.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/uploadTesis', upload.single('tesis'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).send('No se subió ningún archivo');
    }

    const userId = req.user.id;

    await db.query('INSERT INTO tesis (nombre, ruta, usuario_google_id) VALUES (?, ?, ?)', [
      file.originalname,
      file.path,
      userId,
    ]);

    res.send('Archivo subido con éxito');
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/uploadFicha', upload.single('ficha'), async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).send('No se subió ningún archivo');
    }

    const userId = req.user.id;

    await db.query('INSERT INTO fichas_inscripcion (nombre, ruta, usuario_google_id) VALUES (?, ?, ?)', [
      file.originalname,
      file.path,
      userId,
    ]);

    res.send('Archivo subido con éxito');
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
