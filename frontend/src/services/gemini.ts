// We now communicate with our secure backend instead of hitting Gemini directly
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/travel';

export async function getTravelAdvice(prompt: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.advice;
  } catch (error) {
    console.error("Backend API Error:", error);
    return "I'm having trouble connecting to my travel brain right now. Please try again!";
  }
}

export async function getStructuredDestinations(prompt: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.destinations;
  } catch (error) {
    console.error("Backend API Error:", error);
    return null;
  }
}

export async function generatePivotItinerary(itinerary: any[], disruption: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/pivot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary, disruption })
    });
    const data = await response.json();
    return data.itinerary;
  } catch (error) {
    console.error("Backend API Error:", error);
    return null;
  }
}
