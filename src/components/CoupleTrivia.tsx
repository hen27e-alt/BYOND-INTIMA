import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Trophy, Loader2, CheckCircle, XCircle, Users, Play, Sparkles, Heart, Star, ChevronRight, Timer } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, onSnapshot, updateDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { useAlert } from '../components/AlertModal';

interface TriviaGame {
  id: string;
  coupleId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentQuestionIndex: number;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    user1Answer?: number;
    user2Answer?: number;
  }[];
  user1Id: string;
  user2Id?: string;
  user1Score: number;
  user2Score: number;
  createdAt: any;
}

export const CoupleTrivia = () => {
  const { user, profile, loading: firebaseLoading } = useFirebase();
  const { showAlert } = useAlert();
  const [game, setGame] = useState<TriviaGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!profile?.coupleId || !user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'trivia_games'),
      where('coupleId', '==', profile.coupleId),
      where('status', 'in', ['waiting', 'playing'])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const gameDoc = snapshot.docs[0];
        setGame({ id: gameDoc.id, ...gameDoc.data() } as TriviaGame);
      } else {
        setGame(null);
      }
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'trivia_games');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.coupleId, user]);

  const startNewGame = async () => {
    console.log("startNewGame triggered", { userUid: user?.uid, coupleId: profile?.coupleId });
    
    if (!user) {
      showAlert('עליך להיות מחובר כדי לשחק', 'שגיאה');
      return;
    }
    
    if (!profile?.coupleId) {
      console.log("Missing coupleId in profile:", profile);
      showAlert('עליך להיות מחובר לבן/בת זוג כדי לשחק בטריוויה. וודא שהגדרת בן/בת זוג בפרופיל.', 'שגיאה');
      return;
    }
    
    setIsGenerating(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("מפתח ה-API של Gemini חסר. אנא בדוק את הגדרות המערכת.");
      }

      console.log("Initializing AI...");
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `Generate 10 fun, deep, and romantic trivia questions for a couple to play. 
      The questions should be about relationships, love languages, or general fun couple scenarios. 
      Return ONLY a valid JSON array of objects with 'question' (string), 'options' (array of 4 strings), and 'correctAnswer' (number 0-3).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a relationship expert creating a fun trivia game. Output only in Hebrew. Make the questions engaging and romantic."
        }
      });

      console.log("AI Response received");

      if (!response.text) {
        throw new Error("לא התקבלה תשובה מהבינה המלאכותית");
      }

      let text = response.text.trim();
      console.log("AI Text:", text);
      
      // Clean markdown if present
      if (text.includes('```')) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const sanitizedText = jsonMatch ? jsonMatch[0] : text;
      
      let questions;
      try {
        questions = JSON.parse(sanitizedText);
      } catch (e) {
        console.error("Failed to parse AI JSON:", e);
        throw new Error("תשובת הבינה המלאכותית אינה בפורמט תקין");
      }
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("לא נוצרו שאלות תקינות");
      }

      console.log("Creating game in Firestore...");
      const gameRef = doc(collection(db, 'trivia_games'));
      await setDoc(gameRef, {
        coupleId: profile.coupleId,
        status: 'waiting',
        currentQuestionIndex: 0,
        questions,
        user1Id: user.uid,
        user1Score: 0,
        user2Score: 0,
        createdAt: serverTimestamp()
      });
      console.log("Game created successfully with ID:", gameRef.id);
    } catch (error: any) {
      console.error("Error generating trivia:", error);
      showAlert(`לא הצלחנו לייצר שאלות כרגע: ${error.message || 'שגיאה לא ידועה'}`, 'שגיאה');
    } finally {
      setIsGenerating(false);
    }
  };

  const joinGame = async () => {
    if (!game || !user) return;
    try {
      await updateDoc(doc(db, 'trivia_games', game.id), {
        user2Id: user.uid,
        status: 'playing'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trivia_games/${game.id}`);
    }
  };

  const submitAnswer = async (optionIndex: number) => {
    if (!game || !user || selectedOption !== null) return;
    
    setSelectedOption(optionIndex);
    const isUser1 = user.uid === game.user1Id;
    const currentQuestion = game.questions[game.currentQuestionIndex];
    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    const updates: any = {};
    if (isUser1) {
      updates[`questions.${game.currentQuestionIndex}.user1Answer`] = optionIndex;
      if (isCorrect) updates.user1Score = game.user1Score + 1;
    } else {
      updates[`questions.${game.currentQuestionIndex}.user2Answer`] = optionIndex;
      if (isCorrect) updates.user2Score = game.user2Score + 1;
    }

    try {
      await updateDoc(doc(db, 'trivia_games', game.id), updates);
      
      // Check if both answered
      const updatedGame = { ...game, ...updates }; // Local optimistic check
      const bothAnswered = isUser1 
        ? currentQuestion.user2Answer !== undefined 
        : currentQuestion.user1Answer !== undefined;

      if (bothAnswered) {
        setShowFeedback(true);
        setTimeout(async () => {
          setShowFeedback(false);
          setSelectedOption(null);
          
          if (game.currentQuestionIndex < game.questions.length - 1) {
            await updateDoc(doc(db, 'trivia_games', game.id), {
              currentQuestionIndex: game.currentQuestionIndex + 1
            });
          } else {
            await updateDoc(doc(db, 'trivia_games', game.id), {
              status: 'finished'
            });
          }
        }, 3000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `trivia_games/${game.id}`);
    }
  };

  if (isLoading || firebaseLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-brand-gold" size={40} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <Brain size={48} className="text-brand-gold" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-serif text-brand-black">טריוויה זוגית</h2>
          <p className="text-brand-black/60 text-lg">
            כמה אתם באמת מכירים אחד את השני? בואו נבדוק בטריוויה זוגית רומנטית וכיפית.
          </p>
        </div>
        <button
          onClick={startNewGame}
          disabled={isGenerating}
          className="px-12 py-5 bg-brand-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl flex items-center gap-3 mx-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" />
              מייצר שאלות...
            </>
          ) : (
            <>
              <Play />
              התחל משחק חדש
            </>
          )}
        </button>
      </div>
    );
  }

  if (game.status === 'waiting') {
    const isUser1 = user?.uid === game.user1Id;
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12 bg-white rounded-[40px] shadow-2xl border border-brand-gold/20 p-12">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Users size={40} className="text-brand-gold" />
        </div>
        <h3 className="text-3xl font-serif text-brand-black">מחכים לבן/בת הזוג...</h3>
        <p className="text-brand-black/60">
          המשחק נוצר! ברגע שהפרטנר יצטרף, נתחיל בטריוויה.
        </p>
        {!isUser1 && (
          <button
            onClick={joinGame}
            className="px-12 py-5 bg-brand-gold text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-black transition-all shadow-xl"
          >
            הצטרף למשחק
          </button>
        )}
      </div>
    );
  }

  const currentQuestion = game.questions[game.currentQuestionIndex];
  const user1Answered = currentQuestion.user1Answer !== undefined;
  const user2Answered = currentQuestion.user2Answer !== undefined;
  const isUser1 = user?.uid === game.user1Id;
  const hasAnswered = isUser1 ? user1Answered : user2Answered;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Game Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-lg border border-brand-gold/10">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-brand-black/40 font-bold">את/ה</p>
            <p className="text-2xl font-serif text-brand-gold">{isUser1 ? game.user1Score : game.user2Score}</p>
          </div>
          <div className="h-8 w-px bg-brand-gold/20" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-brand-black/40 font-bold">פרטנר</p>
            <p className="text-2xl font-serif text-brand-black/40">{isUser1 ? game.user2Score : game.user1Score}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brand-gold">שאלה {game.currentQuestionIndex + 1} מתוך {game.questions.length}</span>
          <div className="flex gap-1">
            {game.questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all ${
                  i === game.currentQuestionIndex ? 'bg-brand-gold w-4' : i < game.currentQuestionIndex ? 'bg-brand-gold/40' : 'bg-brand-gold/10'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={game.currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-[40px] p-12 shadow-2xl border border-brand-gold/20 text-center space-y-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold/10" />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-brand-gold/5 rounded-full flex items-center justify-center mx-auto text-brand-gold">
              <Sparkles size={32} />
            </div>
            <h3 className="text-3xl md:text-4xl font-serif text-brand-black leading-tight">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index || (isUser1 ? currentQuestion.user1Answer === index : currentQuestion.user2Answer === index);
              const isCorrect = index === currentQuestion.correctAnswer;
              
              let bgColor = 'bg-brand-cream/30 hover:bg-brand-gold/10 border-brand-gold/10';
              if (isSelected) bgColor = 'bg-brand-gold text-white border-brand-gold shadow-lg';
              if (showFeedback && isCorrect) bgColor = 'bg-emerald-500 text-white border-emerald-500 shadow-lg';
              if (showFeedback && isSelected && !isCorrect) bgColor = 'bg-rose-500 text-white border-rose-500 shadow-lg';

              return (
                <button
                  key={index}
                  disabled={hasAnswered || showFeedback}
                  onClick={() => submitAnswer(index)}
                  className={`p-6 rounded-2xl border-2 text-lg font-bold transition-all flex items-center justify-between group ${bgColor}`}
                >
                  <span className="text-right flex-1">{option}</span>
                  {showFeedback && isCorrect && <CheckCircle size={24} className="shrink-0 ml-4" />}
                  {showFeedback && isSelected && !isCorrect && <XCircle size={24} className="shrink-0 ml-4" />}
                  {!showFeedback && !hasAnswered && <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              );
            })}
          </div>

          {hasAnswered && !showFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 text-brand-gold font-bold bg-brand-gold/5 py-4 rounded-2xl"
            >
              <Timer className="animate-pulse" />
              מחכים לתשובה של הפרטנר...
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Finished State */}
      {game.status === 'finished' && (
        <div className="fixed inset-0 z-50 bg-brand-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[50px] p-12 max-w-lg w-full text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold" />
            <Trophy size={80} className="text-brand-gold mx-auto" />
            <div className="space-y-2">
              <h3 className="text-4xl font-serif text-brand-black">המשחק הסתיים!</h3>
              <p className="text-brand-black/60">איזה קרב צמוד... אתם פשוט צוות מנצח.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-brand-gold/10">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-brand-black/40 font-bold">הניקוד שלך</p>
                <p className="text-5xl font-serif text-brand-gold">{isUser1 ? game.user1Score : game.user2Score}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-brand-black/40 font-bold">הניקוד של הפרטנר</p>
                <p className="text-5xl font-serif text-brand-black/40">{isUser1 ? game.user2Score : game.user1Score}</p>
              </div>
            </div>

            <button
              onClick={() => deleteDoc(doc(db, 'trivia_games', game.id))}
              className="w-full py-5 bg-brand-black text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl"
            >
              סגור וחזור לדאשבורד
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
