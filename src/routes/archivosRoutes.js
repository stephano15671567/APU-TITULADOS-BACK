import express from 'express';
import { subirArchivo } from '../controllers/archivosController.js';

const router = express.Router();
router.post('/', subirArchivo);

export default router;





