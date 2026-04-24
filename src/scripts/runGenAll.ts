import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const prompts = [
    { id: 'spark_package', prompt: "A luxurious bronze-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, minimalist aesthetic." },
    { id: 'velvet_package', prompt: "A luxurious silver and velvet-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, deep textures." },
    { id: 'ecstasy_package', prompt: "A luxurious gold-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, opulent details." },
    { id: 'platinum_package', prompt: "A luxurious platinum and diamond-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, ultimate luxury." },
    { id: 'hero_romantic', prompt: "A romantic couple enjoying a luxury date night at home, warm lighting, elegant atmosphere, Byond Intima experience, high-end photography style, 4k, cinematic composition." },
    { id: 'the_journey', prompt: "A digital abstract representation of a couple's emotional journey, glowing paths, ethereal atmosphere, luxury aesthetic, 4k, artistic composition." },
    { id: 'kitchen_cards', prompt: "A set of elegant recipe cards for couples, high-end kitchen setting, fresh ingredients, soft lighting, 4k, lifestyle photography." },
    { id: 'daily_spark', prompt: "A beautiful deck of conversation cards for couples, elegant design, soft lighting, cozy home atmosphere, 4k, lifestyle photography." },
    { id: 'boutique_header', prompt: "A curated collection of luxury lifestyle products, silk robes, crystal glasses, candles, elegant arrangement, 4k, studio lighting." }
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
        console.log(`RESULT:${item.id}:${part.inlineData.data}`);
      }
    } catch (e) {
      console.error(`FAILED:${item.id}`, e);
    }
  }
}
run();
