
import express from 'express';
import {
  getAllNotas,
  getNotasAlumno,
  upsertNota,
  deleteNota
} from '../controllers/notasController.js';

const router = express.Router();

// Ruta para obtener todas las notas
router.get('/', getAllNotas);

// Ruta para obtener las notas de un alumno específico
router.get('/:alumno_RUT', getNotasAlumno);

// Ruta para crear o actualizar una nota
router.post('/upsert', upsertNota);

// Ruta para eliminar una nota
router.delete('/:nota_id', deleteNota);

export default router;

