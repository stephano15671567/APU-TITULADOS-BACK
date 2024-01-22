import express from 'express';
import {
  getProfesores,
  getProfesor,
  createProfesor,
  updateProfesor,
  deleteProfesor,
  authAcademico,
  verifyToken,
  updateNota
} from '../controllers/profesoresController.js';

const router = express.Router();

router.post('/ver', verifyToken);
router.post('/auth', authAcademico);
router.get('/', getProfesores);
router.get('/:id', getProfesor);
router.post('/', createProfesor);
router.put('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);
router.post('/updateNota', updateNota);

export default router;




