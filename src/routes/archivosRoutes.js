import express from 'express';
import { subirArchivo, descargar, subirRubrica } from '../controllers/archivosController.js';

const router = express.Router();

router.post('/:id', subirArchivo);
router.get('/:rut', descargar); 
router.post('/rubrica/:name', subirRubrica)

export default router;





