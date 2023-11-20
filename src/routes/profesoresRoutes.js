import express from 'express';
import { getAlumnosTituladosWithDetails, getProfesoresGuias, getProfesoresInformantes, updateProfesorAsignado } from '../controllers/profesoresController.js';

const router = express.Router();

// Add the new route for getting 'alumnos_titulados' with guide and informant names
router.get('/titulados/detailed', getAlumnosTituladosWithDetails);

router.get('/guias', getProfesoresGuias);
router.get('/informantes', getProfesoresInformantes);
router.post('/asignacion', updateProfesorAsignado);

export default router;
