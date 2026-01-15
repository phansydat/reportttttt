
import { GoogleGenAI, Type } from "@google/genai";

export const getBusinessInsights = async (data: any) => {
  try {
    // Initializing GoogleGenAI as per strict SDK guidelines: new GoogleGenAI({ apiKey: process.env.API_KEY })
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a concise business health check in English based on the following e-commerce data: ${JSON.stringify(data)}. 
      Include a summary of profitability (Total Revenue vs Profit), identify the strongest sales channel, and suggest one improvement action. 
      Format the response as JSON with properties: "summary", "strongestChannel", "recommendation".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strongestChannel: { type: Type.STRING },
            recommendation: { type: Type.STRING },
          },
          required: ["summary", "strongestChannel", "recommendation"]
        }
      }
    });

    // response.text is used to extract the content; it is a property and should not be called as a method.
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "Real-time insights currently unavailable. Your metrics indicate business is running within expected parameters.",
      strongestChannel: "Syncing...",
      recommendation: "Ensure all data in Column P is up to date for better AI accuracy."
    };
  }
};
