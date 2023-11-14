import express from 'express';
// Make sure this path is correct
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', uploadFile);

export default router;
