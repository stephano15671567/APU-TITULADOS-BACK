import express from 'express';
import { subirArchivo, descargar } from '../controllers/archivosController.js';

const router = express.Router();

router.post('/:id', subirArchivo);
router.get('/:rut', descargar); 

export default router;





