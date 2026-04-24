import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Star, Lock, CheckCircle, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tasks: { id: string; title: string; description: string }[];
}

const modules: Module[] = [
  {
    id: 'spark',
    title: 'THE SPARK (הניצוץ)',
    description: 'הציתו מחדש את הסקרנות וההתרגשות הראשונית.',
    icon: Sparkles,
    color: 'text-amber-500',
    tasks: [
      { id: 's1', title: 'שאלון היכרות מחודשת', description: 'ענו על 10 שאלות מפתיעות אחד על השנייה.' },
      { id: 's2', title: 'אתגר בישול קליל', description: 'הכינו יחד ארוחת ערב פשוטה וטעימה עם טוויסט.' },
      { id: 's3', title: 'ערב ללא מסכים', description: 'הקדישו שעה שלמה לשיחה ללא טלפונים או טלוויזיה.' }
    ]
  },
  {
    id: 'velvet',
    title: 'THE VELVET (הקטיפה)',
    description: 'העמיקו את האינטימיות והחיבור הרגשי.',
    icon: Heart,
    color: 'text-rose-500',
    tasks: [
      { id: 'v1', title: 'מכתב אהבה', description: 'כתבו מכתב אהבה קצר אחד לשנייה והקריאו אותו בקול.' },
      { id: 'v2', title: 'עיסוי מפנק', description: 'העניקו אחד לשנייה עיסוי מרגיע של 15 דקות.' },
      { id: 'v3', title: 'שיתוף פנטזיות', description: 'שתפו פנטזיה או חלום שתמיד רציתם להגשים יחד.' }
    ]
  },
  {
    id: 'ecstasy',
    title: 'THE ECSTASY (האקסטזה)',
    description: 'חוויה יוקרתית ובלתי נשכחת לחיבור עמוק במיוחד.',
    icon: Star,
    color: 'text-purple-500',
    tasks: [
      { id: 'e1', title: 'דייט יוקרתי בבית', description: 'התלבשו יפה, הכינו ארוחת גורמה ויצרו אווירה רומנטית.' },
      { id: 'e2', title: 'משימה אינטימית מורחבת', description: 'הקדישו ערב שלם לחקירה אינטימית וחיבור פיזי.' },
      { id: 'e3', title: 'תכנון עתיד משותף', description: 'שבו יחד ותכננו את החלומות והיעדים שלכם ל-5 השנים הבאות.' }
    ]
  }
];

export const ExperienceModules = () => {
  const { profile, user } = useFirebase();
  const [expandedModule, setExpandedModule] = useState<string | null>('spark');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.completedModuleTasks) {
      setCompletedTasks(profile.completedModuleTasks);
    }
  }, [profile]);

  const toggleTask = async (taskId: string) => {
    if (!user) return;
    
    const isCompleted = completedTasks.includes(taskId);
    const newCompletedTasks = isCompleted 
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
      
    setCompletedTasks(newCompletedTasks);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        completedModuleTasks: newCompletedTasks
      });
    } catch (error) {
      console.error("Error updating module progress:", error);
      // Revert state on error
      setCompletedTasks(completedTasks);
    }
  };

  const calculateProgress = (moduleTasks: any[]) => {
    if (moduleTasks.length === 0) return 0;
    const completed = moduleTasks.filter(task => completedTasks.includes(task.id)).length;
    return Math.round((completed / moduleTasks.length) * 100);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-serif text-brand-black mb-4">חוויות מודרכות</h2>
        <p className="text-brand-black/60 italic">מסע זוגי מובנה בשלושה שלבים לחיבור עמוק יותר.</p>
      </div>

      <div className="space-y-6">
        {modules.map((module, index) => {
          const isExpanded = expandedModule === module.id;
          const progress = calculateProgress(module.tasks);
          const isLocked = false; // Unlocked for testing phase

          return (
            <motion.div 
              key={module.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                isLocked ? 'border-brand-black/10 opacity-75' : 'border-brand-gold/20 shadow-lg'
              }`}
            >
              <div 
                className={`p-6 cursor-pointer flex items-center justify-between ${isLocked ? 'bg-brand-cream/30' : 'hover:bg-brand-cream/10'}`}
                onClick={() => !isLocked && setExpandedModule(isExpanded ? null : module.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${isLocked ? 'bg-brand-black/5 text-brand-black/30' : 'bg-brand-cream text-brand-gold'}`}>
                    {isLocked ? <Lock size={24} /> : <module.icon size={24} className={module.color} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-brand-black">{module.title}</h3>
                    <p className="text-sm text-brand-black/60">{module.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {!isLocked && (
                    <div className="text-right hidden md:block">
                      <div className="text-xs uppercase tracking-widest text-brand-black/40 mb-1">התקדמות</div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-brand-cream rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-brand-gold"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="text-sm font-bold text-brand-gold">{progress}%</span>
                      </div>
                    </div>
                  )}
                  {isLocked ? (
                    <span className="text-xs text-brand-black/40 italic">השלימו את השלב הקודם</span>
                  ) : (
                    isExpanded ? <ChevronUp size={20} className="text-brand-black/40" /> : <ChevronDown size={20} className="text-brand-black/40" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && !isLocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-brand-gold/10 bg-brand-cream/5"
                  >
                    <div className="p-6 space-y-4">
                      {module.tasks.map((task) => {
                        const isCompleted = completedTasks.includes(task.id);
                        return (
                          <div 
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              isCompleted 
                                ? 'bg-brand-gold/5 border-brand-gold/30' 
                                : 'bg-white border-brand-black/5 hover:border-brand-gold/20'
                            }`}
                          >
                            <button className={`mt-1 shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-brand-black/20 hover:text-brand-gold'}`}>
                              <CheckCircle size={24} className={isCompleted ? 'fill-current text-white' : ''} />
                            </button>
                            <div>
                              <h4 className={`font-bold mb-1 ${isCompleted ? 'text-brand-black/60 line-through' : 'text-brand-black'}`}>
                                {task.title}
                              </h4>
                              <p className="text-sm text-brand-black/60">{task.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
