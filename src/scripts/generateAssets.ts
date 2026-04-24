import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSiteImages() {
  const prompts = [
    {
      id: 'spark_package',
      prompt: "A luxurious bronze-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, minimalist aesthetic."
    },
    {
      id: 'velvet_package',
      prompt: "A luxurious silver and velvet-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, deep textures."
    },
    {
      id: 'ecstasy_package',
      prompt: "A luxurious gold-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, opulent details."
    },
    {
      id: 'platinum_package',
      prompt: "A luxurious platinum and diamond-themed gift box for couples, elegant packaging with 'Byond Intima' logo, soft romantic lighting, high-end photography style, 4k, studio lighting, ultimate luxury."
    },
    {
      id: 'hero_romantic',
      prompt: "A romantic couple enjoying a luxury date night at home, warm lighting, elegant atmosphere, Byond Intima experience, high-end photography style, 4k, cinematic composition."
    },
    {
      id: 'kitchen_cards',
      prompt: "A romantic couple cooking together in a high-end modern kitchen, warm lighting, intimate atmosphere, Byond Intima kitchen cards on the counter, high-end photography style, 4k."
    },
    {
      id: 'the_journey',
      prompt: "A conceptual image of a deep emotional journey for couples, symbolic path, warm lighting, intimate and profound atmosphere, high-end photography style, 4k."
    },
    {
      id: 'boutique_robes_black',
      prompt: 'Two luxury black silk satin robes for a couple, hanging on elegant hangers against a minimalist high-end spa background, 4k, professional photography, soft lighting.',
    },
    {
      id: 'boutique_robes_white',
      prompt: 'Two luxury white silk satin robes for a couple, hanging on elegant hangers against a minimalist high-end spa background, 4k, professional photography, soft lighting.',
    },
    {
      id: 'boutique_wine_glasses_set',
      prompt: 'A set of four large, elegant crystal wine glasses on a dark reflective surface, minimalist luxury aesthetic, subtle "BYOND" logo etched on the base, 4k, professional studio lighting.',
    },
    {
      id: 'boutique_whiskey_glasses_set',
      prompt: 'A set of four heavy crystal whiskey glasses next to a spherical ice mold and a luxurious deep blue velvet presentation box, 4k, professional product photography, moody lighting.',
    },
    {
      id: 'boutique_cocktail_set_branded',
      prompt: 'A professional 11-piece stainless steel cocktail shaker set with brass accents, "BYOND" brand logo subtly engraved, arranged on a dark marble bar top, 4k, cinematic lighting.',
    },
    {
      id: 'boutique_serving_tray_marble',
      prompt: 'A luxury serving tray made of white Carrara marble with gold handles, minimalist high-end kitchen setting, 4k, professional photography.',
    },
    {
      id: 'boutique_serving_tray_wood',
      prompt: 'A luxury serving tray made of dark walnut wood with brass handles, minimalist high-end kitchen setting, 4k, professional photography.',
    }
  ];

  const results: Record<string, string> = {};

  for (const item of prompts) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: item.prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          results[item.id] = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (error) {
      console.error(`Error generating ${item.id}:`, error);
    }
  }

  return results;
}
