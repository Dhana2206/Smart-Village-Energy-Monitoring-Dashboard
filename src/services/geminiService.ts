
import { GoogleGenAI } from "@google/genai";
import { VillageStats } from "../types";

export const getEnergySuggestions = async (stats: VillageStats): Promise<string> => {
  try {
    // Always initialize GoogleGenAI inside the function to use the latest API key from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Analyze the current electricity data for GreenWillow Village and provide 3-4 actionable energy-saving suggestions.
      Current Stats:
      - Total Daily Usage: ${stats.totalUsage} kWh
      - Peak Usage: ${stats.peakUsage} kWh at ${stats.peakHour}
      - Area Breakdown: ${JSON.stringify(stats.areaBreakdown)}
    `;

    // Use systemInstruction for defining the persona as per Google GenAI SDK best practices
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a Smart City Energy Consultant. Provide advice in a bulleted list. Focus on peak-shaving, infrastructure optimization, and community habits.",
        temperature: 0.7,
        topP: 0.9,
      }
    });

    // Directly access the text property of the response (do not call text() as a method)
    return response.text || "Unable to generate suggestions at this time. Please check your network.";
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return "The smart advisor is currently offline. Basic Tip: Encourage residents to switch to LED bulbs and avoid heavy machinery during peak hours.";
  }
};
