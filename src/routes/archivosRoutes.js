import express from 'express';
import {
  descargarRubricaInformanteConNotas,
  descargarRubricaGuiaConNotas,
  descargarRubricaInformante,
  descargarRubricaGuía,
  subirArchivo,
  descargar,
  subirRubricaInformante,
  subirRubricaGuia,
  generarYDescargarActa,
  subirTesis,
  descargarTesis,
  descargarArchivoWord,
  
} from '../controllers/archivosController.js';
const router = express.Router();

router.post('/:id', subirArchivo);
router.get('/:rut', descargar); 

router.get('/descargar/rubrica/informante', descargarRubricaInformante)
router.get('/descargar/rubrica/guia', descargarRubricaGuía)
router.post('/subir/rubrica/informante/:rut', subirRubricaInformante);
router.post('/subir/rubrica/guia/:rut', subirRubricaGuia);
router.get('/descargar/rubrica/guia/con-notas/:rut', descargarRubricaGuiaConNotas);
router.get('/descargar/rubrica/informante/con-notas/:rut', descargarRubricaInformanteConNotas);;
router.get('/descargar/acta/:rut', generarYDescargarActa);
router.post('/subir/tesis/:rut', subirTesis);
router.get('/descargar/tesis/:rut', descargarTesis);
router.get('/descargar/archivo-word', descargarArchivoWord);
export default router;





