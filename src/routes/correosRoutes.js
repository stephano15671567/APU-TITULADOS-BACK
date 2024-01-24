import express from 'express';

import { mail, notification } from '../controllers/correosController.js';

const router = express.Router();

router.post('/:rut', mail);
router.post('/notificar/:assign', notification)
export default router;
