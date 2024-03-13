import express from 'express';
import { descargarRubricaInformante,descargarRubricaGuía,subirArchivo, descargar, subirRubricaInformante, subirRubricaGuia} from '../controllers/archivosController.js';

const router = express.Router();

router.post('/:id', subirArchivo);
router.get('/:rut', descargar); 
router.post('/rubrica/:name', subirRubricaInformante, subirRubricaGuia)
router.get('/descargar/rubrica/informante', descargarRubricaInformante)
router.get('/descargar/rubrica/guia', descargarRubricaGuía)

export default router;





