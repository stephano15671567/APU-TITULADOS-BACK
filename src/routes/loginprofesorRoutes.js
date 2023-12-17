import express from 'express';

import {login, asignarNotaGuia} from '../controllers/loginprofesoresController.js';
import { verifyToken } from '../controllers/middleware.js';
  
const router = express.Router();

router.post('/logins', login);

router.post('/asignar-nota-guia', verifyToken, asignarNotaGuia);

export default router;