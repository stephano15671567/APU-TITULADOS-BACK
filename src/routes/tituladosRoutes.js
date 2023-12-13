import express from 'express';
import { getTitulados,updateNota } from '../controllers/tituladosController.js';

const router = express.Router();

router.get('/alumnosTitulados', getTitulados);
router.put('/updateNota', updateNota);

export default router;