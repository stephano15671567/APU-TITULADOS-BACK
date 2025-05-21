import express from 'express';
import { generateReport } from '../controllers/generateReportController.js';




const router = express.Router();


router.get('/download-report', generateReport);

export default router;
