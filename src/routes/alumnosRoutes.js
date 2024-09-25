import express from 'express';
import { createAlumno, getAllAlumnos, updateAlumno, deleteAlumno, authAlumno, verifyToken, updateTesis } from '../controllers/alumnosController.js';

const router = express.Router();
router.post('/ver', verifyToken);
router.post('/auth', authAlumno);
router.post('/', createAlumno);
router.get('/', getAllAlumnos);
router.put('/:RUT', updateAlumno);
router.delete('/:RUT', deleteAlumno);
router.patch('/:RUT/tesis', updateTesis);

export default router;





