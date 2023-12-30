import express from 'express';
import {
  assignProfessorToStudent,
  getAssignmentsByStudent,
  } from '../controllers/asignacionesController.js';

const router = express.Router();

// Ruta para asignar un profesor a un alumno
router.post('/', assignProfessorToStudent);

// Ruta para obtener todas las asignaciones de un alumno específico
router.get('/:alumnoId', getAssignmentsByStudent);



export default router;
