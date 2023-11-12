import express from 'express';
import { getTitulados } from '../controllers/tituladosController.js';

const router = express.Router();

router.get('/alumnosTitulados', getTitulados);

export default router;
