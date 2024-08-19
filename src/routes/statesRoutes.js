import express from 'express';
import { getStates, addState, updateState, getStateSpecific } from '../controllers/statesController.js';
const router = express.Router();

router.get('/:state', getStateSpecific);
router.get('/', getStates);
router.post('/', addState);
router.patch('/', updateState);

export default router;