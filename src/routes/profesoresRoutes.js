import express from 'express';
import { getProfesoresGuias, getProfesoresInformantes, updateProfesorAsignado } from '../controllers/profesoresController.js';




const router = express.Router();

router.get('/guias', getProfesoresGuias);
router.get('/informantes', getProfesoresInformantes);
router.post('/asignacion', updateProfesorAsignado);

export default router;
