import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAndSaveAssets() {
  const prompts = [
    { id: 'spark_package', prompt: "A luxurious bronze-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, minimalist aesthetic." },
    { id: 'velvet_package', prompt: "A luxurious silver and velvet-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, deep textures." },
    { id: 'ecstasy_package', prompt: "A luxurious gold-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, opulent details." },
    { id: 'platinum_package', prompt: "A luxurious platinum and diamond-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, ultimate luxury." },
    { id: 'hero_romantic', prompt: "A romantic couple enjoying a luxury date night at home, warm lighting, elegant atmosphere, Byond Intima experience, high-end photography style, 4k, cinematic composition." }
  ];

  for (const item of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: item.prompt }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
      });
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part) {
        console.log(`IMAGE_DATA:${item.id}:data:image/png;base64,${part.inlineData.data}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
