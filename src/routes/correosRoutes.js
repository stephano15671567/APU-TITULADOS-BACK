import express from 'express';

import { mail } from '../controllers/correosController.js';

const router = express.Router();

router.post('/:rut', mail);

export default router;
