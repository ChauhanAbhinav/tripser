import { Request, Response } from 'express';
import { getTravelAdvice, getStructuredDestinations, generatePivotItinerary, generateTravelProfileAnalysis } from '../services/geminiService.js';

export const getAdvice = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const advice = await getTravelAdvice(prompt);
    res.json({ advice });
  } catch (error) {
    console.error('[TravelController] getAdvice Error:', error);
    res.status(500).json({ error: 'Failed to fetch travel advice' });
  }
};

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const destinations = await getStructuredDestinations(prompt);
    res.json({ destinations });
  } catch (error) {
    console.error('[TravelController] getDestinations Error:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
};

export const pivotItinerary = async (req: Request, res: Response) => {
  try {
    const { itinerary, disruption } = req.body;
    const newItinerary = await generatePivotItinerary(itinerary, disruption);
    res.json({ itinerary: newItinerary });
  } catch (error) {
    console.error('[TravelController] pivotItinerary Error:', error);
    res.status(500).json({ error: 'Failed to pivot itinerary' });
  }
};

export const analyzeProfile = async (req: Request, res: Response) => {
  try {
    const { travelData } = req.body;
    const analysis = await generateTravelProfileAnalysis(travelData);
    res.json({ analysis });
  } catch (error) {
    console.error('[TravelController] analyzeProfile Error:', error);
    res.status(500).json({ error: 'Failed to analyze profile' });
  }
};