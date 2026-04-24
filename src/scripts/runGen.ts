import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const prompts = [
    { id: 'spark_package', prompt: "A luxurious bronze-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, minimalist aesthetic." },
    { id: 'velvet_package', prompt: "A luxurious silver and velvet-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, deep textures." },
    { id: 'ecstasy_package', prompt: "A luxurious gold-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, opulent details." },
    { id: 'platinum_package', prompt: "A luxurious platinum and diamond-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, ultimate luxury." }
  ];

  for (const item of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: [{ text: item.prompt }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (part) {
      console.log(`RESULT:${item.id}:${part.inlineData.data}`);
    }
  }
}
run();
