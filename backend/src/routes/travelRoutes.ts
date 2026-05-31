import { Router } from 'express';
import { getAdvice, getDestinations, pivotItinerary } from '../controllers/travelController.js';

const router = Router();

// Travel AI Endpoints
router.post('/advice', getAdvice);
router.post('/destinations', getDestinations);
router.post('/pivot', pivotItinerary);

export default router;