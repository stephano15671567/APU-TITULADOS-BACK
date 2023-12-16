import express from 'express';

import {login} from '../controllers/loginprofesoresController.js';
  
const router = express.Router();

router.post('/logins', login);

export default router;