import React, { useState } from 'react';
import { RefreshCw, ChefHat, Loader2, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { useNavigate } from 'react-router-dom';

export const FridgeScanner = ({ onCooked, cookedCount }: { onCooked: () => void, cookedCount: number }) => {
  const navigate = useNavigate();
  const [fridgeIngredients, setFridgeIngredients] = useState('');
  const [cookingLevel, setCookingLevel] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const handleGenerateRecipe = async () => {
    if (!fridgeIngredients) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a romantic couples recipe using these ingredients: ${fridgeIngredients}. 
        Cooking level: ${cookingLevel}/3 (1=easy, 2=medium, 3=hard).
        Return ONLY a JSON object with this structure:
        {
          "title": "Recipe Name",
          "time": "e.g., 30 דקות",
          "difficulty": "e.g., קל",
          "tags": ["tag1", "tag2"],
          "ingredients": ["ing1", "ing2"],
          "instructions": ["step1", "step2"],
          "couplesActivity": "A fun mini-activity to do together while cooking"
        }`,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const data = JSON.parse(response.text);
      setGeneratedRecipe(data);
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-brand-gold/10 p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center text-brand-gold">
          <RefreshCw size={24} />
        </div>
        <div>
          <h4 className="text-xl font-serif">מה יש לכם במקרר?</h4>
          <p className="text-xs text-brand-black/40 uppercase tracking-widest">צרו מתכון זוגי ממה שיש בבית</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-black/40 mb-3">מרכיבים שיש לכם (מופרדים בפסיק)</label>
          <textarea 
            value={fridgeIngredients}
            onChange={(e) => setFridgeIngredients(e.target.value)}
            placeholder="למשל: עגבניות, ביצים, גבינה צהובה, בצל..."
            className="w-full h-32 bg-brand-cream/30 border border-brand-gold/10 p-4 font-serif text-lg outline-none focus:border-brand-gold transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['עוף', 'פסטה', 'אורז', 'תפוחי אדמה', 'שמנת', 'פטריות'].map(item => (
            <button 
              key={item}
              onClick={() => setFridgeIngredients(prev => prev ? `${prev}, ${item}` : item)}
              className="px-3 py-1 border border-brand-gold/10 text-[10px] uppercase tracking-widest hover:bg-brand-gold/5"
            >+ {item}</button>
          ))}
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-brand-black/40 mb-3">רמת קושי מבוקשת</label>
          <div className="flex gap-4">
            {[1, 2, 3].map(level => (
              <button 
                key={level}
                onClick={() => setCookingLevel(level)}
                className={`flex-1 py-3 border text-[10px] uppercase tracking-widest transition-all ${cookingLevel === level ? 'bg-brand-gold border-brand-gold text-black' : 'border-brand-gold/20 hover:border-brand-gold/50'}`}
              >
                {level === 1 ? 'קל ומהיר' : level === 2 ? 'בינוני' : 'שף פרטי'}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleGenerateRecipe}
          disabled={!fridgeIngredients || isGenerating}
          className="w-full bg-brand-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
          {isGenerating ? 'השף חושב...' : 'צור מתכון'}
        </button>

        {generatedRecipe && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-brand-cream/20 border border-brand-gold/20"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h5 className="font-serif text-2xl mb-2">{generatedRecipe.title}</h5>
                <div className="flex gap-4 text-xs text-brand-black/60">
                  <span>⏱️ {generatedRecipe.time}</span>
                  <span>🍳 {generatedRecipe.difficulty}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/recipe', { state: { recipe: generatedRecipe } })}
                className="w-10 h-10 bg-brand-gold text-white rounded-full flex items-center justify-center hover:bg-brand-black transition-colors"
              >
                <Utensils size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium">המשימה הזוגית שלכם:</p>
              <p className="text-sm text-brand-black/70 italic bg-white p-4 border-l-2 border-brand-gold">
                {generatedRecipe.couplesActivity}
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-brand-gold/10 flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onCooked();
                }}
                className="px-12 py-4 bg-brand-black text-white uppercase tracking-widest text-xs hover:bg-brand-gold transition-all"
              >
                בישלנו
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
