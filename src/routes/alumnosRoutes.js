import express from 'express';
import { createAlumno, getAllAlumnos, updateAlumno, deleteAlumno, authAlumno } from '../controllers/alumnosController.js';

const router = express.Router();

router.post('/auth', authAlumno);
router.post('/', createAlumno);
router.get('/', getAllAlumnos);
router.put('/:RUT', updateAlumno);
router.delete('/:RUT', deleteAlumno);

export default router;





