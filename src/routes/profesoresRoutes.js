import express from 'express';
import {
  getProfesores,
  getProfesor,
  createProfesor,
  updateProfesor,
  deleteProfesor
} from '../controllers/profesoresController.js';

const router = express.Router();

router.get('/', getProfesores);
router.get('/:id', getProfesor);
router.post('/', createProfesor);
router.put('/:id', updateProfesor);
router.delete('/:id', deleteProfesor);

export default router;