import express from 'express';
import {
  authSecretaria,
  verifyToken,
  } from '../controllers/secretariaController.js';

const router = express.Router();

router.post('/ver', verifyToken);
router.post('/auth', authSecretaria);

export default router;
