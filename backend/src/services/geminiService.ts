import { GoogleGenAI } from "@google/genai";
import { searchHiddenGems } from './vectorService.js';

const apiKey = process.env.GEMINI_API_KEY || "";
export const ai = new GoogleGenAI({ apiKey });

export async function getTravelAdvice(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are 'Seamless AI', a professional travel agent and safety expert. Your goal is to provide hyper-personalized, safe, and efficient travel advice. Focus on hidden gems, safety for solo women, and accessibility. Keep responses concise and actionable.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my travel brain right now. Please try again!";
  }
}

export async function getStructuredDestinations(prompt: string) {
  try {
    // 1. Perform Vector Search to find real Hidden Gems from our database
    const vectorContext = await searchHiddenGems(prompt);
    const contextString = vectorContext.length 
      ? `Use these factual verified places in your response: ${JSON.stringify(vectorContext)}`
      : `Rely on your general knowledge to suggest safe, accessible places.`;

    // 2. Generate the structured response using Gemini (RAG pattern)
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Based on the user's request: "${prompt}". \nContext: ${contextString}\n\nSuggest 3 travel destinations. Return ONLY a valid JSON array where each object has these properties: id (number), name (string), image (string, placeholder URL), price (string like '$1,200'), safety (number out of 10), accessibility (number out of 10), sensory (number out of 10), tags (array of 3 strings), and description (short string).`,
      config: {
        systemInstruction: "You are a travel data generation API. Output raw JSON only.",
        responseMimeType: "application/json",
      },
    });
    
    if (response.text) {
      try {
        // Clean potential markdown blocks before parsing
        const cleanJson = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini", e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function generatePivotItinerary(itinerary: any[], disruption: string) {
  try {
    const prompt = `Given this travel itinerary: ${JSON.stringify(itinerary)}. A disruption occurred: "${disruption}". Please re-route and adjust the itinerary times logically, keeping the same location context but shifting times. Add an urgent 'alert' type item at the beginning of the array explaining the adjustment. Return ONLY a valid JSON array of the updated itinerary objects. Each object must have: id (string), type ('flight'|'hotel'|'food'|'alert'|'transit'), time (string, e.g. '11:00 AM'), title (string), location (string), status (string, e.g. 'Action Required' or 'Re-scheduled').`;
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are an agentic travel assistant capable of real-time re-routing. Output raw JSON only.",
        responseMimeType: "application/json",
      },
    });
    
    if (response.text) {
      try {
        // Clean potential markdown blocks before parsing
        const cleanJson = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON from Gemini Pivot", e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
}

export async function generateTravelProfileAnalysis(travelData: any) {
  try {
    const prompt = `Analyze the following travel data for a user: ${JSON.stringify(travelData)}.
    Generate a personalized "Travel DNA" profile and a "Travel Storybook" summary of their trips.
    Return ONLY a valid JSON object matching exactly this structure:
    {
      "dna": {
        "icon": "emoji",
        "title": "Short catchy title (e.g., Street Food Hunter)",
        "subtitle": "2-3 words (e.g., Authentic & Local)",
        "description": "1 sentence describing their travel style based on data"
      },
      "storybook": {
        "title": "e.g., Your Rome Story",
        "subtitle": "e.g., 5 Days • 12 Places Visited",
        "season": "e.g., 🌸 Spring",
        "favoriteMoment": "A specific memorable moment based on their expenses/packing",
        "growthDiscovery": "e.g., +8",
        "growthImmersion": "e.g., +12"
      }
    }`;
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert travel behavioral analyst. Output raw JSON only.",
        responseMimeType: "application/json",
      },
    });
    
    if (response.text) {
      const cleanJson = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error in analyze:", error);
    return null;
  }
}