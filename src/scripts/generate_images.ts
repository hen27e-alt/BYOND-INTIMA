import { GoogleGenAI } from "@google/genai";

async function generatePackageImages() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompts = [
    "A luxury black gift box with a minimalist gold logo 'BYOND INTIMA' on top, elegant studio lighting, high-end product photography, black silk ribbon, premium texture.",
    "A medium-sized luxury black gift box with a minimalist gold logo 'BYOND INTIMA' on top, elegant studio lighting, high-end product photography, black silk ribbon, premium texture.",
    "A large premium luxury black gift box with a minimalist gold logo 'BYOND INTIMA' on top, elegant studio lighting, high-end product photography, black silk ribbon, premium texture."
  ];

  const results = [];
  for (const prompt of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }
  return results;
}
