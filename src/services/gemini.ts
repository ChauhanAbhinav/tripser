import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function getTravelAdvice(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
