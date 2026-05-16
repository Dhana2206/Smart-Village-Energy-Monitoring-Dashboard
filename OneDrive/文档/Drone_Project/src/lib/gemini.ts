import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface Fault {
  type: string;
  confidence: number;
  description: string;
  severity: 'low' | 'medium' | 'critical';
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
}

export interface InspectionResult {
  summary: string;
  faults: Fault[];
}

export async function analyzeDroneImage(base64Image: string): Promise<InspectionResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert electrical infrastructure inspector. 
    Analyze this drone-captured image of power lines, towers, or transformers.
    
    Detect specific faults from this list:
    - Broken insulators
    - Wire damage (fraying, snapping)
    - Tower rust/corrosion
    - Pole leaning/structural instability
    - Cracks in concrete towers
    - Vegetation interference (trees touching lines)
    - Transformer damage (leaks, burns)
    - Bird nests near critical components
    
    For each fault found, provide:
    1. Fault type
    2. Confidence score (0.0 to 1.0)
    3. Brief technical description
    4. Severity level:
       - 'low': cosmetic or non-urgent maintenance (minor rust, small nest)
       - 'medium': structural wear requiring scheduled repair (cracks, leaning)
       - 'critical': immediate hazard (broken insulator, tree touching wire, sparking)
    5. 2D bounding box in [ymin, xmin, ymax, xmax] format (normalized 0 to 1000)
    
    Also provide a brief overall summary of the inspection.
    
    Return the result in valid JSON format only.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            faults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["low", "medium", "critical"] },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER }
                  }
                },
                required: ["type", "confidence", "description", "severity", "box_2d"]
              }
            }
          },
          required: ["summary", "faults"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as InspectionResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
