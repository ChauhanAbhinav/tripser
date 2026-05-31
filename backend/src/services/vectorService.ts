import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Initialize Pinecone client
const pineconeApiKey = process.env.PINECONE_API_KEY || '';
const pinecone = pineconeApiKey ? new Pinecone({ apiKey: pineconeApiKey }) : null;

export async function getVectorEmbeddings(text: string) {
  try {
    // Generate text embeddings using Gemini's embedding model
    const response = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    return response.embeddings?.[0]?.values || [];
  } catch (error) {
    console.error("Embedding Error:", error);
    return [];
  }
}

export async function searchHiddenGems(query: string) {
  const embedding = await getVectorEmbeddings(query);
  if (!embedding.length) return [];

  if (!pinecone) {
    console.log(`[Vector Search] Simulated embedding search for: "${query}" (No PINECONE_API_KEY found)`);
    return []; 
  }

  try {
    // Target your specific index containing travel data
    const index = pinecone.index('tripser-hidden-gems');
    const results = await index.query({ vector: embedding, topK: 3, includeMetadata: true });
    
    return results.matches.map(match => match.metadata);
  } catch (error) {
    console.error("Pinecone Search Error:", error);
    return [];
  }
}