import express from 'express';

import {login} from '../controllers/JefaturaController.js';
  
const router = express.Router();

router.post('/logins', login);

export default router;