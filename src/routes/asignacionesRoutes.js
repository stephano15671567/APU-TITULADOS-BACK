import express from 'express';
import {
  assignProfessorToStudent,
  getAssignmentsByStudent,
  getGuiaAssignmentsByProfessor,
  getInformanteAssignmentsByProfessor, 
  getAllAssignments
  } from '../controllers/asignacionesController.js';

 

const router = express.Router();

// Ruta para asignar un profesor a un alumno
router.post('/', assignProfessorToStudent);

// Ruta para obtener todas las asignaciones de un alumno específico
router.get('/:alumnoId', getAssignmentsByStudent);





router.get('/guia/:profesorId', getGuiaAssignmentsByProfessor);
router.get('/informante/:profesorId', getInformanteAssignmentsByProfessor);
router.get('/', getAllAssignments)




export default router;
