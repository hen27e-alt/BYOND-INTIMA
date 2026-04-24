import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Droplets, 
  Utensils, 
  Target, 
  TrendingUp, 
  Plus, 
  ChevronRight, 
  Apple, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Footprints,
  Calendar,
  Settings,
  ArrowLeft,
  Info,
  Users,
  User as UserIcon,
  Bell,
  Camera,
  Image as ImageIcon,
  Heart,
  Zap,
  Loader2,
  BookOpen
} from 'lucide-react';
import { ContentFeedback } from '../components/ContentFeedback';
import { useFirebase } from '../contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useAlert } from '../components/AlertModal';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
}

interface DayMealPlan {
  day: string;
  meals: Meal[];
}

interface Workout {
  type: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  date: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  dietaryPreference?: string[];
}

interface Micronutrients {
  vitaminD: number;
  omega3: number;
  iron: number;
  calcium: number;
}

interface FoodItem {
  name: string;
  calories: number;
  giScore: number;
  isFavorite?: boolean;
}

interface GITracking {
  mealName: string;
  giScore: number;
  date: string;
}

interface PersonalRecords {
  maxRunDistance: number;
  maxPushups: number;
  maxPlankTime: number;
}

interface PainFatigueLog {
  date: string;
  painScore: number;
  fatigueScore: number;
}

interface SleepLog {
  date: string;
  hours: number;
  quality: number;
}

interface Achievement {
  id: string;
  title: string;
  dateEarned: string;
}

interface FitnessProfile {
  userId: string;
  height: number;
  targetWeight: number;
  currentWeight: number;
  dailyWaterGoal: number;
  currentWaterIntake: number;
  dailyStepGoal: number;
  currentSteps: number;
  caloriesBurned: number;
  mealPlan: DayMealPlan[];
  workouts: Workout[];
  healthAppConnected: boolean;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  favoriteRecipes?: string[];
  lastSync?: string;
  micronutrients?: Micronutrients;
  foodLibrary?: FoodItem[];
  giTracking?: GITracking[];
  workoutSchedule?: string[];
  personalRecords?: PersonalRecords;
  painFatigueLogs?: PainFatigueLog[];
  stravaConnected?: boolean;
  sleepLogs?: SleepLog[];
  achievements?: Achievement[];
  streakCount?: number;
  lastLoginDate?: string;
  coachAccessCode?: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  credit: string;
  category: 'lifestyle' | 'nutrition';
  image: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'כוחה של הידרציה',
    excerpt: 'למה שתיית מים היא הבסיס לכל תוכנית כושר מוצלחת.',
    content: 'שתיית מים מספקת חיונית לכל תפקודי הגוף, מרמות אנרגיה ועד בריאות העור. מים עוזרים להוביל חומרים מזינים לתאים, לשמן מפרקים ולווסת את טמפרטורת הגוף. מומלץ לשתות לפחות 8 כוסות מים ביום, ויותר אם אתם פעילים גופנית.',
    credit: 'Healthline',
    category: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1548919973-5dea5846f669?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'אכילה מודעת לעיכול טוב יותר',
    excerpt: 'איך להקשיב לגוף שלכם ולשפר את הבריאות המטבולית.',
    content: 'אכילה מודעת היא תרגול של תשומת לב מלאה לחוויית האכילה. זה כולל הקשבה לאותות הרעב והשובע של הגוף, התענגות על הטעמים והימנעות מהסחות דעת בזמן הארוחה. זה יכול לעזור במניעת אכילת יתר ולשפר את העיכול.',
    credit: 'Harvard Health',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'היתרונות של אימוני כוח לאריכות ימים',
    excerpt: 'למה משקולות הן לא רק לשרירים, אלא גם לבריאות העצם והלב.',
    content: 'בניית מסת שריר עוזרת לשמור על חילוף חומרים תקין, מחזקת את העצמות ומשפרת את שיווי המשקל. אימוני כוח פעמיים בשבוע יכולים להפחית משמעותית את הסיכון למחלות כרוניות ולשפר את איכות החיים בגיל מבוגר.',
    credit: 'Mayo Clinic',
    category: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'שינה: הגיבור הלא מושר של הכושר',
    excerpt: 'איך איכות השינה משפיעה על הביצועים וההתאוששות שלכם.',
    content: 'ללא שינה מספקת, הגוף לא יכול להשתקם כראוי מאימונים או לבנות שריר. שינה של 7-9 שעות בלילה חיונית לוויסות הורמונלי, לריכוז ולמניעת פציעות. חוסר שינה עלול להוביל לעלייה ברמות הקורטיזול ולפגיעה בחילוף החומרים.',
    credit: 'Sleep Foundation',
    category: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    title: 'הבנת מאקרו-נוטריינטים',
    excerpt: 'המדריך המלא לחלבונים, פחמימות ושומנים.',
    content: 'האיזון בין חלבונים, פחמימות ושומנים הוא המפתח להשגת יעדי כושר. חלבונים בונים שריר, פחמימות מספקות אנרגיה, ושומנים חיוניים לספיגת ויטמינים ובריאות המוח. הבנת היחסים ביניהם תעזור לכם לבנות תפריט מנצח.',
    credit: 'Precision Nutrition',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    title: 'צום לסירוגין: מיתוסים מול עובדות',
    excerpt: 'האם זה באמת עובד? כל מה שצריך לדעת על חלונות אכילה.',
    content: 'צום לסירוגין יכול להיות כלי יעיל לירידה במשקל ושיפור הרגישות לאינסולין, אך הוא לא מתאים לכולם. חשוב להתמקד באיכות המזון הנצרך בחלונות האכילה ולהקשיב לתגובת הגוף.',
    credit: 'Johns Hopkins Medicine',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '7',
    title: 'תפקיד הסיבים בתזונה בריאה',
    excerpt: 'למה אתם צריכים יותר ירקות ודגנים מלאים בצלחת.',
    content: 'סיבים תזונתיים חיוניים לבריאות הלב, העיכול ושמירה על רמות סוכר יציבות. הם עוזרים לתחושת שובע לאורך זמן ויכולים לסייע בניהול משקל תקין. נסו לשלב קטניות, פירות וירקות בכל ארוחה.',
    credit: 'WebMD',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '8',
    title: 'איך לשמור על מוטיבציה לכושר לטווח ארוך',
    excerpt: 'טיפים פסיכולוגיים להתמדה והנאה מהתהליך.',
    content: 'הצבת יעדים קטנים ומדידים, מציאת פעילות שאתם באמת אוהבים וגיוון באימונים הם המפתח להתמדה. אל תחכו למוטיבציה שתגיע - צרו הרגלים שיהפכו את הכושר לחלק בלתי נפרד מהיום שלכם.',
    credit: 'Verywell Fit',
    category: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '9',
    title: 'השפעת הסוכר על הגוף שלך',
    excerpt: 'למה כדאי להפחית בסוכר מעובד ואיך לעשות זאת נכון.',
    content: 'צריכה מוגזמת של סוכר מעובד קשורה למחלות לב, סוכרת והשמנה. סוכר גורם לעליות וירידות חדות ברמות האנרגיה. העדיפו סוכרים טבעיים מפירות והפחיתו בהדרגה משקאות ממותקים ומזון מעובד.',
    credit: 'American Heart Association',
    category: 'nutrition',
    image: 'https://images.unsplash.com/photo-1584013321612-3a33347701f0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '10',
    title: 'התאוששות לאחר אימון: שיטות עבודה מומלצות',
    excerpt: 'מה לעשות אחרי האימון כדי למקסם תוצאות ולמנוע כאבים.',
    content: 'מתיחות, תזונה נכונה העשירה בחלבון ופחמימות, ומנוחה הן חלק בלתי נפרד מכל תוכנית אימונים. הקפדה על התאוששות נכונה תאפשר לכם להתאמן בעצימות גבוהה יותר לאורך זמן ולמנוע פציעות.',
    credit: 'ACE Fitness',
    category: 'lifestyle',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
  }
];

const COUPLE_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'סלמון בתנור עם עשבי תיבול',
    description: 'מנה בריאה, קלה להכנה ומרשימה לדייט ביתי.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    prepTime: '25 דקות',
    difficulty: 'easy',
    dietaryPreference: ['paleo', 'high-protein']
  },
  {
    id: '2',
    title: 'פסטה פסטו ביתית עם עגבניות שרי',
    description: 'איטליה אצלכם במטבח. פשוט, טעים ורומנטי.',
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800',
    prepTime: '20 דקות',
    difficulty: 'easy',
    dietaryPreference: ['vegetarian']
  },
  {
    id: '3',
    title: 'קערת בודהה צבעונית',
    description: 'שילוב מושלם של דגנים, קטניות וירקות טריים.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    prepTime: '30 דקות',
    difficulty: 'medium',
    dietaryPreference: ['vegan', 'gluten-free']
  },
  {
    id: '4',
    title: 'סטייק טופו במרינדת אסיה',
    description: 'מנה עשירה בטעמים ובחלבון מהצומח.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    prepTime: '35 דקות',
    difficulty: 'medium',
    dietaryPreference: ['vegan']
  },
  {
    id: '5',
    title: 'סלט קינואה וחמוציות',
    description: 'קליל, מרענן ומלא באנרגיה.',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800',
    prepTime: '15 דקות',
    difficulty: 'easy',
    dietaryPreference: ['vegetarian', 'gluten-free']
  },
  {
    id: '6',
    title: 'בוריטו קערה מקסיקנית',
    description: 'ארוחה משביעה, צבעונית ומלאה בחלבון.',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800',
    prepTime: '20 דקות',
    difficulty: 'easy',
    dietaryPreference: ['high-protein', 'gluten-free']
  },
  {
    id: '7',
    title: 'לזניה צמחונית עשירה',
    description: 'מנה מנחמת ומושלמת לארוחת ערב זוגית מושקעת.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
    prepTime: '50 דקות',
    difficulty: 'hard',
    dietaryPreference: ['vegetarian']
  },
  {
    id: '8',
    title: 'שיפודי עוף במרינדת לימון',
    description: 'פליאו במיטבו - קל, טעים ובריא.',
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=800',
    prepTime: '30 דקות',
    difficulty: 'medium',
    dietaryPreference: ['paleo', 'high-protein']
  }
];

export const FitnessDashboard = () => {
  const { user, profile } = useFirebase();
  const { showAlert } = useAlert();
  const { sendNotification } = usePushNotifications();
  const [fitnessData, setFitnessData] = useState<FitnessProfile | null>(null);
  const [partnerFitnessData, setPartnerFitnessData] = useState<FitnessProfile | null>(null);
  const [viewMode, setViewMode] = useState<'me' | 'partner'>('me');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'workouts' | 'couple' | 'analysis' | 'articles'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState<{ type: 'before' | 'after', url: string } | null>(null);
  const [editData, setEditData] = useState({
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    dailyWaterGoal: 2500,
    dailyStepGoal: 10000
  });
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [showAddPainLog, setShowAddPainLog] = useState(false);
  const [showPRUpdate, setShowPRUpdate] = useState(false);
  const [showMicronutrientModal, setShowMicronutrientModal] = useState(false);
  const [aiCoachMessage, setAiCoachMessage] = useState<string | null>(null);
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);
  const [aiWorkout, setAiWorkout] = useState<string | null>(null);
  const [aiMealPlan, setAiMealPlan] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedDiet, setSelectedDiet] = useState<string>('all');

  useEffect(() => {
    // Generate some mock chart data based on current stats for visualization
    const data = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        name: format(date, 'dd/MM'),
        steps: Math.floor(Math.random() * 5000) + 5000,
        water: Math.floor(Math.random() * 1000) + 1500,
        calories: Math.floor(Math.random() * 500) + 1800,
      };
    });
    setChartData(data);
  }, []);
  const [newFood, setNewFood] = useState<FoodItem>({
    name: '',
    calories: 0,
    giScore: 50,
    isFavorite: false
  });
  const [newSleep, setNewSleep] = useState<SleepLog>({
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    quality: 4
  });
  const [newPainLog, setNewPainLog] = useState<PainFatigueLog>({
    date: new Date().toISOString(),
    painScore: 0,
    fatigueScore: 0
  });
  const [newWorkout, setNewWorkout] = useState<Workout>({
    type: 'ריצה',
    duration: 30,
    intensity: 'medium',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user) return;

    // Listen to my fitness profile
    const myFitnessRef = doc(db, 'fitness_profiles', user.uid);
    const unsubscribeMe = onSnapshot(myFitnessRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FitnessProfile;
        
        // Update streak if needed
        const today = new Date().toISOString().split('T')[0];
        if (data.lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = data.streakCount || 0;
          if (data.lastLoginDate === yesterdayStr) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }

          setDoc(myFitnessRef, {
            userId: user.uid,
            streakCount: newStreak,
            lastLoginDate: today,
            updatedAt: serverTimestamp()
          }, { merge: true }).catch(err => console.error("Error updating streak:", err));
        }

        // Check for goal achievements and notify
        if (profile?.preferences?.notificationsEnabled !== false) {
          if (fitnessData && data.currentWaterIntake >= data.dailyWaterGoal && (fitnessData.currentWaterIntake || 0) < data.dailyWaterGoal) {
            sendNotification('כל הכבוד!', 'הגעת ליעד שתיית המים היומי שלך!');
          }
          if (fitnessData && data.currentSteps >= data.dailyStepGoal && (fitnessData.currentSteps || 0) < data.dailyStepGoal) {
            sendNotification('מדהים!', 'הגעת ליעד הצעדים היומי שלך!');
          }
        }

        setFitnessData(data);
        setEditData({
          height: data.height || 170,
          currentWeight: data.currentWeight || 70,
          targetWeight: data.targetWeight || 65,
          dailyWaterGoal: data.dailyWaterGoal || 2500,
          dailyStepGoal: data.dailyStepGoal || 10000
        });
      } else {
        // Initialize default profile
        const initialData: FitnessProfile = {
          userId: user.uid,
          height: 170,
          targetWeight: 75,
          currentWeight: 80,
          dailyWaterGoal: 2500,
          currentWaterIntake: 0,
          dailyStepGoal: 10000,
          currentSteps: 0,
          caloriesBurned: 0,
          mealPlan: [
            {
              day: 'ראשון',
              meals: [
                { type: 'breakfast', description: 'שיבולת שועל עם פירות', calories: 350 },
                { type: 'lunch', description: 'חזה עוף עם אורז וירקות', calories: 600 },
                { type: 'dinner', description: 'סלט יווני עם טונה', calories: 400 }
              ]
            }
          ],
          workouts: [],
          healthAppConnected: false
        };
        setDoc(myFitnessRef, {
          ...initialData,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `fitness_profiles/${user.uid}`));
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `fitness_profiles/${user.uid}`);
      setLoading(false);
    });

    // Listen to partner's fitness profile if connected
    let unsubscribePartner: (() => void) | null = null;
    if (profile?.partnerId) {
      const partnerFitnessRef = doc(db, 'fitness_profiles', profile.partnerId);
      unsubscribePartner = onSnapshot(partnerFitnessRef, (docSnap) => {
        if (docSnap.exists()) {
          setPartnerFitnessData(docSnap.data() as FitnessProfile);
        }
      }, (err) => {
        console.warn("Could not load partner fitness data:", err);
      });
    }

    return () => {
      unsubscribeMe();
      if (unsubscribePartner) unsubscribePartner();
    };
  }, [user, profile?.partnerId]);

  const updateWater = async (amount: number) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      await setDoc(fitnessRef, {
        currentWaterIntake: Math.max(0, fitnessData.currentWaterIntake + amount),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const updateSteps = async (amount: number) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      await setDoc(fitnessRef, {
        currentSteps: Math.max(0, fitnessData.currentSteps + amount),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const toggleFavoriteRecipe = async (recipeId: string) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      const currentFavorites = fitnessData.favoriteRecipes || [];
      const newFavorites = currentFavorites.includes(recipeId)
        ? currentFavorites.filter(id => id !== recipeId)
        : [...currentFavorites, recipeId];
      
      await setDoc(fitnessRef, {
        favoriteRecipes: newFavorites,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const connectHealthApp = () => {
    if (viewMode === 'partner') return;
    setIsSyncing(true);
    // Simulate connection logic
    setTimeout(async () => {
      if (!user) return;
      const fitnessRef = doc(db, 'fitness_profiles', user.uid);
      await setDoc(fitnessRef, {
        healthAppConnected: true,
        currentSteps: 8432,
        caloriesBurned: 450,
        lastSync: new Date().toISOString(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsSyncing(false);
      showAlert('התחברות ל-Apple Health בוצחה בהצלחה!', 'חיבור כושר');
    }, 2000);
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      await setDoc(fitnessRef, {
        ...editData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowSettings(false);
      showAlert('הגדרות הפרופיל עודכנו בהצלחה!', 'עדכון פרופיל');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const generateAICoach = async () => {
    if (!fitnessData || isGeneratingCoach) return;
    setIsGeneratingCoach(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a professional fitness coach for a couple on the "Beyond Together" platform. 
        Based on the following user data, provide a short, motivating morning message (2-3 sentences) in Hebrew. 
        Include a small tip for the day AND a "Couple Fitness Challenge" for today (e.g., "Do 20 squats together", "Go for a 15-minute walk holding hands").
        Data:
        - Current Steps: ${fitnessData.currentSteps} / Goal: ${fitnessData.dailyStepGoal}
        - Current Water: ${fitnessData.currentWaterIntake} / Goal: ${fitnessData.dailyWaterGoal}
        - Weight: ${fitnessData.currentWeight} / Target: ${fitnessData.targetWeight}
        - Recent Workouts: ${JSON.stringify(fitnessData.workouts?.slice(-3))}
        - Streak: ${fitnessData.streakCount} days`
      });
      const response = await model;
      setAiCoachMessage(response.text);
    } catch (err) {
      console.error("Error generating AI coach message:", err);
      setAiCoachMessage("בוקר טוב! היום הוא יום מצוין להשקיע בעצמך ובזוגיות שלך. זכרו לשתות מים, להישאר פעילים ולעשות משהו קטן יחד למען הבריאות שלכם!");
    } finally {
      setIsGeneratingCoach(false);
    }
  };

  const generateAIWorkout = async () => {
    if (!fitnessData || isGeneratingWorkout) return;
    setIsGeneratingWorkout(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a personalized 20-minute home workout plan in Hebrew for a user with these goals:
        - Current Weight: ${fitnessData.currentWeight}kg, Target: ${fitnessData.targetWeight}kg
        - Recent activity level: ${fitnessData.workouts?.length || 0} workouts this week.
        Format it as a clear list of exercises with durations/reps. Keep it encouraging.`
      });
      const response = await model;
      setAiWorkout(response.text);
    } catch (err) {
      console.error("Error generating AI workout:", err);
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const generateAIMealPlan = async () => {
    if (!fitnessData || isGeneratingMealPlan) return;
    setIsGeneratingMealPlan(true);
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const model = genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a healthy daily meal plan (Breakfast, Lunch, Dinner, Snack) in Hebrew for a user with these goals:
        - Current Weight: ${fitnessData.currentWeight}kg, Target: ${fitnessData.targetWeight}kg
        - Daily Water Goal: ${fitnessData.dailyWaterGoal}ml
        Focus on high-protein, low-GI foods. Keep it simple and delicious.`
      });
      const response = await model;
      setAiMealPlan(response.text);
    } catch (err) {
      console.error("Error generating AI meal plan:", err);
    } finally {
      setIsGeneratingMealPlan(false);
    }
  };

  useEffect(() => {
    if (fitnessData && !aiCoachMessage && activeTab === 'analysis') {
      generateAICoach();
    }
  }, [activeTab, fitnessData]);

  const updateMicronutrients = async (nutrients: Partial<Micronutrients>) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      await setDoc(fitnessRef, {
        micronutrients: { ...(fitnessData.micronutrients || { vitaminD: 0, omega3: 0, iron: 0, calcium: 0 }), ...nutrients },
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const addFoodToLibrary = async (food: FoodItem) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      const updatedLibrary = [...(fitnessData.foodLibrary || []), food];
      await setDoc(fitnessRef, {
        foodLibrary: updatedLibrary,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowAddFood(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const addSleepLog = async (log: SleepLog) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      const updatedLogs = [...(fitnessData.sleepLogs || []), log];
      await setDoc(fitnessRef, {
        sleepLogs: updatedLogs,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowAddSleep(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const addPainLog = async (log: PainFatigueLog) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      const updatedLogs = [...(fitnessData.painFatigueLogs || []), log];
      await setDoc(fitnessRef, {
        painFatigueLogs: updatedLogs,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowAddPainLog(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const updatePR = async (prs: Partial<PersonalRecords>) => {
    if (!user || !fitnessData || viewMode === 'partner') return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    try {
      await setDoc(fitnessRef, {
        personalRecords: { ...(fitnessData.personalRecords || { maxRunDistance: 0, maxPushups: 0, maxPlankTime: 0 }), ...prs },
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowPRUpdate(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  const connectStrava = () => {
    if (viewMode === 'partner') return;
    setIsSyncing(true);
    setTimeout(async () => {
      if (!user) return;
      const fitnessRef = doc(db, 'fitness_profiles', user.uid);
      await setDoc(fitnessRef, {
        stravaConnected: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsSyncing(false);
      showAlert('חיבור ל-Strava בוצע בהצלחה!');
    }, 1500);
  };

  const generateCoachCode = async () => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    await setDoc(fitnessRef, {
      coachAccessCode: code,
      updatedAt: serverTimestamp()
    }, { merge: true });
    showAlert(`קוד הגישה למאמן שלך הוא: ${code}. שתף אותו עם המאמן שלך.`);
  };

  const handleUploadPhoto = async (url: string) => {
    if (!user || !showPhotoUpload) return;
    const fitnessRef = doc(db, 'fitness_profiles', user.uid);
    const field = showPhotoUpload.type === 'before' ? 'beforePhotoUrl' : 'afterPhotoUrl';
    try {
      await setDoc(fitnessRef, {
        [field]: url,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setShowPhotoUpload(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `fitness_profiles/${user.uid}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Activity className="animate-spin text-brand-gold" size={48} />
      </div>
    );
  }

  const currentData = viewMode === 'me' ? fitnessData : partnerFitnessData;
  const currentProfile = viewMode === 'me' ? profile : { displayName: profile?.partnerName || 'בן/בת זוג' };

  const waterProgress = currentData ? (currentData.currentWaterIntake / currentData.dailyWaterGoal) * 100 : 0;
  const stepsProgress = currentData ? (currentData.currentSteps / currentData.dailyStepGoal) * 100 : 0;

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmiValue = currentData ? calculateBMI(currentData.currentWeight, currentData.height) : 0;
  const bmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'תת משקל', color: 'text-blue-500' };
    if (bmi < 25) return { label: 'משקל תקין', color: 'text-emerald-500' };
    if (bmi < 30) return { label: 'עודף משקל', color: 'text-orange-500' };
    return { label: 'השמנה', color: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-brand-cream pb-24">
      {/* Header */}
      <div className="bg-brand-black text-white p-8 rounded-b-[40px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif">הכושר {viewMode === 'me' ? 'שלי' : 'של ' + currentProfile?.displayName}</h1>
            <div className="flex gap-2">
              {profile?.partnerId && (
                <button 
                  onClick={() => setViewMode(viewMode === 'me' ? 'partner' : 'me')}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2 px-3"
                >
                  {viewMode === 'me' ? <Users size={18} /> : <UserIcon size={18} />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {viewMode === 'me' ? 'בן/בת זוג' : 'אני'}
                  </span>
                </button>
              )}
              {viewMode === 'me' && (
                <button 
                  onClick={() => setShowSettings(true)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Settings size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30">
              <Activity className="text-brand-gold" size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif">{currentProfile?.displayName || 'מתאמן/ת'}</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-white/60 text-xs">גובה: {currentData?.height} ס"מ</p>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <p className="text-white/60 text-xs">יעד: {currentData?.targetWeight} ק"ג</p>
              </div>
            </div>
            {currentData && (
              <div className="text-right">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">BMI</p>
                <p className={cn("text-lg font-serif", bmiCategory(Number(bmiValue)).color)}>
                  {bmiValue}
                </p>
              </div>
            )}
          </div>

          {/* Health App Connection */}
          {viewMode === 'me' && (
            !currentData?.healthAppConnected ? (
              <button 
                onClick={connectHealthApp}
                disabled={isSyncing}
                className="w-full py-4 bg-brand-gold text-brand-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all transform active:scale-95"
              >
                {isSyncing ? (
                  <Activity className="animate-spin" size={18} />
                ) : (
                  <>
                    <Apple size={18} />
                    <span>חבר ל-Apple Health / Google Fit</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-emerald-400" size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">מחובר לאפליקציית כושר</span>
                </div>
                <span className="text-[10px] text-white/40">סונכרן לאחרונה: {currentData.lastSync ? new Date(currentData.lastSync).toLocaleTimeString('he-IL') : 'מעולם לא'}</span>
              </div>
            )
          )}

          {viewMode === 'partner' && !currentData && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
              <p className="text-xs text-white/60">בן/בת הזוג טרם הגדירו פרופיל כושר</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 -mt-6 relative z-20">
        <div className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
          {(['overview', 'nutrition', 'workouts', 'analysis', 'couple', 'articles'] as const).map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-brand-black text-white shadow-lg" 
                  : "text-brand-black/40 hover:bg-brand-gold/10"
              )}
            >
              {tab === 'overview' ? 'סקירה' : tab === 'nutrition' ? 'תזונה' : tab === 'workouts' ? 'אימונים' : tab === 'analysis' ? 'ניתוח AI' : tab === 'couple' ? 'זוגי' : 'מאמרים'}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && currentData && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Streak & Achievements */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-black text-white p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center"
                >
                  <Flame className="text-orange-500 mb-2" size={32} />
                  <span className="text-3xl font-serif">{currentData.streakCount || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">ימי רצף (Streak)</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10 flex flex-col items-center justify-center text-center"
                >
                  <Target className="text-brand-gold mb-2" size={32} />
                  <span className="text-3xl font-serif">{currentData.achievements?.length || 0}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">הישגים</span>
                </motion.div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                      <Droplets size={20} />
                    </div>
                    <span className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">מים</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-serif text-brand-black">{currentData.currentWaterIntake}</span>
                    <span className="text-xs text-brand-black/40 ml-1">/ {currentData.dailyWaterGoal} מ"ל</span>
                  </div>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, waterProgress)}%` }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  {viewMode === 'me' && (
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateWater(250)} 
                          className="flex-1 py-2 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-bold"
                        >
                          +250
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateWater(500)} 
                          className="flex-1 py-2 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-bold"
                        >
                          +500
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="הזנה ידנית (מ״ל)"
                          className="flex-1 bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-blue-300"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value);
                              if (!isNaN(val)) {
                                updateWater(val);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                      <Footprints size={20} />
                    </div>
                    <span className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">צעדים</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-serif text-brand-black">{currentData.currentSteps.toLocaleString()}</span>
                    <span className="text-xs text-brand-black/40 ml-1">/ {currentData.dailyStepGoal.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, stepsProgress)}%` }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                  {viewMode === 'me' && (
                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSteps(500)} 
                          className="flex-1 py-2 bg-orange-50 text-orange-500 rounded-lg text-[10px] font-bold"
                        >
                          +500
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateSteps(1000)} 
                          className="flex-1 py-2 bg-orange-50 text-orange-500 rounded-lg text-[10px] font-bold"
                        >
                          +1000
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="הזנה ידנית (צעדים)"
                          className="flex-1 bg-orange-50/50 border border-orange-100 rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-orange-300"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value);
                              if (!isNaN(val)) {
                                updateSteps(val);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-brand-black/40 mt-4">עוד {Math.max(0, currentData.dailyStepGoal - currentData.currentSteps)} צעדים ליעד</p>
                </motion.div>
              </div>

              <div className="mt-12 pt-12 border-t border-brand-gold/10">
                <ContentFeedback pageId="fitness" sectionId="overview" />
              </div>
            </motion.div>
          )}

          {activeTab === 'nutrition' && currentData && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif">תפריט יומי מומלץ</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAddFood(true)}
                    className="p-2 bg-brand-black text-white rounded-xl hover:bg-brand-gold transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  {viewMode === 'me' && (
                    <button className="text-brand-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={16} />
                      <span>שנה תפריט</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Net Calories & Micronutrients */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-brand-black/40">קלוריות נטו</h4>
                    <span className="text-xs font-bold text-emerald-500">נשארו: {2000 - (currentData.mealPlan[0]?.meals.reduce((acc, m) => acc + m.calories, 0) || 0) + (currentData.caloriesBurned || 0)} קל'</span>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div className="flex-1">
                      <p className="text-lg font-serif">{currentData.mealPlan[0]?.meals.reduce((acc, m) => acc + m.calories, 0) || 0}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">נצרכו</p>
                    </div>
                    <div className="w-px bg-brand-gold/10" />
                    <div className="flex-1">
                      <p className="text-lg font-serif">{currentData.caloriesBurned || 0}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">נשרפו</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-brand-black/40">מיקרו-נוטריינטים</h4>
                    <button 
                      onClick={() => setShowMicronutrientModal(true)}
                      className="text-brand-gold hover:text-brand-black transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'ויטמין D', value: currentData.micronutrients?.vitaminD || 0, unit: 'mcg', goal: 15 },
                      { label: 'אומגה 3', value: currentData.micronutrients?.omega3 || 0, unit: 'mg', goal: 1000 },
                      { label: 'ברזל', value: currentData.micronutrients?.iron || 0, unit: 'mg', goal: 18 },
                      { label: 'סידן', value: currentData.micronutrients?.calcium || 0, unit: 'mg', goal: 1000 }
                    ].map((nut, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{nut.label}</span>
                          <span>{nut.value} / {nut.goal} {nut.unit}</span>
                        </div>
                        <div className="h-1 bg-brand-cream rounded-full overflow-hidden">
                          <div className="h-full bg-brand-gold" style={{ width: `${Math.min(100, (nut.value / nut.goal) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Food Library & GI Tracking */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-brand-black/40 mb-4">ספריית מזון מועדפת</h4>
                  <div className="space-y-2">
                    {currentData.foodLibrary?.filter(f => f.isFavorite).map((food, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-brand-cream rounded-xl">
                        <div>
                          <p className="text-sm font-bold">{food.name}</p>
                          <p className="text-[10px] opacity-40">{food.calories} קל' | GI: {food.giScore}</p>
                        </div>
                        <button className="text-brand-gold"><Plus size={16} /></button>
                      </div>
                    ))}
                    {(!currentData.foodLibrary || currentData.foodLibrary.filter(f => f.isFavorite).length === 0) && (
                      <p className="text-[10px] opacity-40 text-center py-2">אין מזונות מועדפים עדיין</p>
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-brand-black/40 mb-4">מעקב אינדקס גליקמי (GI)</h4>
                  <div className="space-y-2">
                    {currentData.giTracking?.slice(-3).map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="opacity-60">{log.mealName}</span>
                        <span className={cn(
                          "font-bold px-2 py-1 rounded-lg",
                          log.giScore < 55 ? "bg-emerald-100 text-emerald-700" : 
                          log.giScore < 70 ? "bg-orange-100 text-orange-700" : 
                          "bg-red-100 text-red-700"
                        )}>
                          {log.giScore}
                        </span>
                      </div>
                    ))}
                    {(!currentData.giTracking || currentData.giTracking.length === 0) && (
                      <p className="text-[10px] opacity-40 text-center py-2">אין נתוני GI להצגה</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentData.mealPlan[0]?.meals.map((meal, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                        {meal.type === 'breakfast' && <Clock size={20} />}
                        {meal.type === 'lunch' && <Utensils size={20} />}
                        {meal.type === 'dinner' && <TrendingUp size={20} />}
                        {meal.type === 'snack' && <Apple size={20} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">
                          {meal.type === 'breakfast' ? 'ארוחת בוקר' : meal.type === 'lunch' ? 'ארוחת צהריים' : meal.type === 'dinner' ? 'ארוחת ערב' : 'נשנוש'}
                        </p>
                        <h4 className="text-sm font-serif text-brand-black">{meal.description}</h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-black">{meal.calories} קל'</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recipe Suggestions */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                  <h3 className="text-xl font-serif text-brand-black">השראה זוגית למטבח</h3>
                  
                  {/* Dietary Filters */}
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {['all', 'vegan', 'vegetarian', 'gluten-free', 'paleo', 'high-protein'].map((diet) => (
                      <button
                        key={diet}
                        onClick={() => setSelectedDiet(diet)}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                          selectedDiet === diet 
                            ? "bg-brand-gold border-brand-gold text-brand-black shadow-md" 
                            : "bg-white border-brand-gold/20 text-brand-black/40 hover:border-brand-gold/60"
                        )}
                      >
                        {diet === 'all' ? 'הכל' :
                         diet === 'vegan' ? 'טבעוני' :
                         diet === 'vegetarian' ? 'צמחוני' :
                         diet === 'gluten-free' ? 'ללא גלוטן' :
                         diet === 'paleo' ? 'פליאו' : 'חלבון גבוה'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {COUPLE_RECIPES
                    .filter(r => selectedDiet === 'all' || r.dietaryPreference?.includes(selectedDiet))
                    .map((recipe) => (
                    <motion.div 
                      key={recipe.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-brand-gold/10 group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button 
                          onClick={() => toggleFavoriteRecipe(recipe.id)}
                          className={cn(
                            "absolute top-4 left-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-colors",
                            currentData.favoriteRecipes?.includes(recipe.id) 
                              ? "bg-red-500 text-white" 
                              : "bg-white/20 text-white hover:bg-white/40"
                          )}
                        >
                          <Heart size={20} fill={currentData.favoriteRecipes?.includes(recipe.id) ? "currentColor" : "none"} />
                        </button>
                        <div className="absolute bottom-4 right-4 text-white">
                          <h4 className="text-xl font-serif">{recipe.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                              <Clock size={12} />
                              {recipe.prepTime}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                              <TrendingUp size={12} />
                              {recipe.difficulty === 'easy' ? 'קל' : recipe.difficulty === 'medium' ? 'בינוני' : 'מאתגר'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-brand-black/70 leading-relaxed mb-4">{recipe.description}</p>
                        <button className="w-full py-3 bg-brand-cream text-brand-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-colors">
                          צפה במתכון המלא
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-gold/10 p-6 rounded-3xl border border-brand-gold/20">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="text-brand-gold" size={18} />
                  <h4 className="text-sm font-bold text-brand-black">טיפ תזונה יומי</h4>
                </div>
                <p className="text-xs text-brand-black/60 leading-relaxed">
                  הקפידו על צריכת חלבון מספקת לאחר האימון כדי לעזור לשרירים להשתקם ולגדול.
                </p>
              </div>

              {/* Micronutrient Modal */}
              <AnimatePresence>
                {showMicronutrientModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowMicronutrientModal(false)}
                      className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8"
                    >
                      <h3 className="text-2xl font-serif mb-6">עדכון מיקרו-נוטריינטים</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'vitaminD', label: 'ויטמין D (mcg)', icon: <Zap size={16} /> },
                          { key: 'omega3', label: 'אומגה 3 (mg)', icon: <Heart size={16} /> },
                          { key: 'iron', label: 'ברזל (mg)', icon: <Activity size={16} /> },
                          { key: 'calcium', label: 'סידן (mg)', icon: <TrendingUp size={16} /> }
                        ].map((nut) => (
                          <div key={nut.key}>
                            <label className="flex items-center gap-2 text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">
                              {nut.icon}
                              {nut.label}
                            </label>
                            <input 
                              type="number"
                              defaultValue={currentData.micronutrients?.[nut.key as keyof Micronutrients] || 0}
                              onBlur={(e) => updateMicronutrients({ [nut.key]: Number(e.target.value) })}
                              className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none focus:border-brand-gold transition-colors"
                            />
                          </div>
                        ))}
                        <button 
                          onClick={() => setShowMicronutrientModal(false)}
                          className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs mt-4 hover:bg-brand-gold transition-colors"
                        >
                          סגור
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <div className="mt-12 pt-12 border-t border-brand-gold/10">
                <ContentFeedback pageId="fitness" sectionId="nutrition" />
              </div>
            </motion.div>
          )}

          {activeTab === 'workouts' && currentData && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* PRs & Pain Logs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">שיאים אישיים (PR)</h4>
                    <button onClick={() => setShowPRUpdate(true)} className="text-brand-gold"><Plus size={14} /></button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="opacity-60">ריצה:</span>
                      <span className="font-bold">{currentData.personalRecords?.maxRunDistance || 0} ק"מ</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="opacity-60">שכיבות סמיכה:</span>
                      <span className="font-bold">{currentData.personalRecords?.maxPushups || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-black/40">כאב ועייפות</h4>
                    <button onClick={() => setShowAddPainLog(true)} className="text-brand-gold"><Plus size={14} /></button>
                  </div>
                  {currentData.painFatigueLogs?.length ? (
                    <div className="flex gap-4 text-center">
                      <div className="flex-1">
                        <p className="text-lg font-serif text-red-500">{currentData.painFatigueLogs[currentData.painFatigueLogs.length - 1].painScore}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">כאב</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-serif text-orange-500">{currentData.painFatigueLogs[currentData.painFatigueLogs.length - 1].fatigueScore}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">עייפות</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-40">אין נתונים</p>
                  )}
                </div>
              </div>

              {/* Workouts Section */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif">תכנית אימונים</h3>
                {viewMode === 'me' && (
                  <button 
                    onClick={() => setShowAddWorkout(true)}
                    className="p-3 bg-brand-black text-white rounded-2xl shadow-lg hover:bg-brand-gold transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>

              {currentData.workouts.length === 0 ? (
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-brand-gold/10 text-center">
                  <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="text-brand-gold" size={40} />
                  </div>
                  <h4 className="text-lg font-serif mb-2">עוד לא הוספת אימון היום</h4>
                  <p className="text-xs text-brand-black/40 mb-8 max-w-[200px] mx-auto">התחילו אימון חדש או סנכרנו נתונים מהשעון החכם שלכם.</p>
                  {viewMode === 'me' && (
                    <button 
                      onClick={() => setShowAddWorkout(true)}
                      className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                    >
                      התחל אימון חדש
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {currentData.workouts.map((workout, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-gold/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">{workout.type}</p>
                          <h4 className="text-sm font-serif text-brand-black">{workout.duration} דקות • עצימות {workout.intensity === 'high' ? 'גבוהה' : workout.intensity === 'medium' ? 'בינונית' : 'נמוכה'}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-brand-black/40">{new Date(workout.date).toLocaleDateString('he-IL')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-12 pt-12 border-t border-brand-gold/10">
                <ContentFeedback pageId="fitness" sectionId="workouts" />
              </div>

              {/* Add Workout Modal */}
              <AnimatePresence>
                {showAddWorkout && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAddWorkout(false)}
                      className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl p-8"
                    >
                      <h3 className="text-2xl font-serif mb-6">הוספת אימון</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">סוג אימון</label>
                          <select 
                            value={newWorkout.type}
                            onChange={(e) => setNewWorkout({...newWorkout, type: e.target.value})}
                            className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none"
                          >
                            <option value="ריצה">ריצה</option>
                            <option value="יוגה">יוגה</option>
                            <option value="פילאטיס">פילאטיס</option>
                            <option value="אימון כוח">אימון כוח</option>
                            <option value="שחייה">שחייה</option>
                            <option value="אופניים">אופניים</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">משך (דקות)</label>
                          <input 
                            type="number"
                            value={newWorkout.duration}
                            onChange={(e) => setNewWorkout({...newWorkout, duration: Number(e.target.value)})}
                            className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">עצימות</label>
                          <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map(intensity => (
                              <button
                                key={intensity}
                                onClick={() => setNewWorkout({...newWorkout, intensity})}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                                  newWorkout.intensity === intensity ? "bg-brand-black text-white border-brand-black" : "border-brand-gold/20 text-brand-black/40"
                                )}
                              >
                                {intensity === 'low' ? 'נמוכה' : intensity === 'medium' ? 'בינונית' : 'גבוהה'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={async () => {
                            if (!user || !fitnessData) return;
                            const fitnessRef = doc(db, 'fitness_profiles', user.uid);
                            const updatedWorkouts = [...(fitnessData.workouts || []), newWorkout];
                            await setDoc(fitnessRef, {
                              workouts: updatedWorkouts,
                              updatedAt: serverTimestamp()
                            }, { merge: true });
                            setShowAddWorkout(false);
                            showAlert('האימון נוסף בהצלחה!');
                          }}
                          className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs mt-4"
                        >
                          שמור אימון
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-black/40 uppercase tracking-widest px-2">אימונים אחרונים</h4>
                {[
                  { type: 'ריצה', duration: 45, date: 'אתמול', calories: 320 },
                  { type: 'יוגה', duration: 30, date: 'לפני יומיים', calories: 150 }
                ].map((workout, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-brand-gold/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-brand-black/40">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-serif">{workout.type}</h5>
                        <p className="text-[10px] text-brand-black/40">{workout.date} • {workout.duration} דקות</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-gold">{workout.calories} קל'</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && currentData && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Steps Analysis */}
                <div className="glass-card-dark p-8 rounded-3xl border-brand-gold/10">
                  <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
                    <Footprints className="text-brand-gold" />
                    ניתוח צעדים שבועי
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #C5A05930',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="steps" 
                          stroke="#C5A059" 
                          fillOpacity={1} 
                          fill="url(#colorSteps)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Water Intake Analysis */}
                <div className="glass-card-dark p-8 rounded-3xl border-brand-gold/10">
                  <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
                    <Droplets className="text-blue-400" />
                    צריכת מים יומית
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #60a5fa30',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Bar dataKey="water" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.water >= 2000 ? '#60a5fa' : '#3b82f680'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Calories Burned */}
                <div className="glass-card-dark p-8 rounded-3xl border-brand-gold/10 lg:col-span-2">
                  <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-3">
                    <Flame className="text-orange-500" />
                    שריפת קלוריות שבועית
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#ffffff40" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            border: '1px solid #f9731630',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Line 
                          type="stepAfter" 
                          dataKey="calories" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#1a1a1a' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI Coach */}
              <div className="bg-brand-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center">
                        <Activity className="text-brand-gold" size={20} />
                      </div>
                      <h3 className="text-xl font-serif">המאמן האישי שלך</h3>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={generateAIWorkout}
                        disabled={isGeneratingWorkout}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        {isGeneratingWorkout ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                        תוכנית אימון
                      </button>
                      <button 
                        onClick={generateAIMealPlan}
                        disabled={isGeneratingMealPlan}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        {isGeneratingMealPlan ? <Loader2 size={12} className="animate-spin" /> : <Utensils size={12} />}
                        תוכנית תזונה
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {isGeneratingCoach ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 py-4"
                      >
                        <Loader2 className="animate-spin text-brand-gold" size={24} />
                        <p className="text-white/60 italic">מנתח את הנתונים שלך...</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <p className="text-lg font-light leading-relaxed italic text-balance">
                          "{aiCoachMessage || 'לחץ כדי לקבל את תכנית היום המותאמת עבורך.'}"
                        </p>

                        {!aiCoachMessage && (
                          <button 
                            onClick={generateAICoach}
                            className="px-6 py-2 bg-brand-gold text-brand-black rounded-xl text-[10px] font-bold uppercase tracking-widest"
                          >
                            קבל תכנית
                          </button>
                        )}

                        {(aiWorkout || aiMealPlan) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            {aiWorkout && (
                              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h4 className="text-brand-gold font-serif mb-3 flex items-center gap-2">
                                  <Zap size={16} /> תוכנית אימון יומית
                                </h4>
                                <div className="text-sm text-white/80 whitespace-pre-wrap font-light leading-relaxed">
                                  {aiWorkout}
                                </div>
                              </div>
                            )}
                            {aiMealPlan && (
                              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <h4 className="text-brand-gold font-serif mb-3 flex items-center gap-2">
                                  <Utensils size={16} /> תוכנית תזונה מומלצת
                                </h4>
                                <div className="text-sm text-white/80 whitespace-pre-wrap font-light leading-relaxed">
                                  {aiMealPlan}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sleep Analysis */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-gold/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="text-indigo-500" size={24} />
                    <h3 className="text-xl font-serif">ניתוח שינה</h3>
                  </div>
                  <button onClick={() => setShowAddSleep(true)} className="p-2 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-100 transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                {currentData.sleepLogs?.length ? (
                  <div className="space-y-6">
                    <div className="flex items-end gap-2 h-32">
                      {currentData.sleepLogs.slice(-7).map((log, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-indigo-500 rounded-t-lg" style={{ height: `${(log.hours / 12) * 100}%` }} />
                          <span className="text-[8px] font-bold opacity-40">{log.date.split('-').slice(1).join('/')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        <strong>תובנת AI:</strong> נראה שיש קשר ישיר בין 8 שעות שינה לביצועי הריצה שלך. כשישנת פחות מ-6 שעות, קצב הריצה ירד ב-12%.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm opacity-40">טרם הוזנו נתוני שינה</p>
                  </div>
                )}
              </div>

              {/* Goal Prediction */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-brand-gold/10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="text-emerald-500" size={24} />
                  <h3 className="text-xl font-serif">תחזית הגעה ליעד</h3>
                </div>
                <div className="space-y-6">
                  <div className="relative h-48 border-b border-l border-brand-gold/10">
                    <svg className="w-full h-full overflow-visible">
                      <motion.path
                        d="M 0 150 L 100 120 L 200 100 L 300 80 L 400 40"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2 }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#fbbf24" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute top-0 right-0 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">תאריך יעד משוער</p>
                      <p className="text-lg font-serif text-emerald-900">15 במאי, 2026</p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-black/60 text-center">לפי הקצב הנוכחי שלך (ירידה של 0.5 ק"ג בשבוע)</p>
                </div>
              </div>

              <div className="mt-12 pt-12 border-t border-brand-gold/10">
                <ContentFeedback pageId="fitness" sectionId="analysis" />
              </div>
            </motion.div>
          )}

          {activeTab === 'couple' && (
            <motion.div
              key="couple"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Side by Side Progress */}
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-brand-gold/10">
                <div className="flex items-center gap-3 mb-8">
                  <Heart className="text-brand-gold" size={24} />
                  <h3 className="text-xl font-serif">התקדמות זוגית</h3>
                </div>

                <div className="space-y-8">
                  {/* Steps Comparison */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">צעדים יומיים</span>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-black" />
                          <span className="text-[10px] font-bold text-brand-black/60">אני</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-brand-gold" />
                          <span className="text-[10px] font-bold text-brand-black/60">{profile?.partnerName || 'בן/בת זוג'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 h-32 items-end">
                      <div className="relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(100, (fitnessData?.currentSteps || 0) / (fitnessData?.dailyStepGoal || 10000) * 100)}%` }}
                          className="w-full bg-brand-black rounded-t-2xl relative"
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{fitnessData?.currentSteps}</span>
                        </motion.div>
                      </div>
                      <div className="relative group">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min(100, (partnerFitnessData?.currentSteps || 0) / (partnerFitnessData?.dailyStepGoal || 10000) * 100)}%` }}
                          className="w-full bg-brand-gold rounded-t-2xl relative"
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold">{partnerFitnessData?.currentSteps || 0}</span>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Water Comparison */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-brand-black/40 uppercase tracking-widest">שתיית מים</span>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span>אני</span>
                          <span>{fitnessData?.currentWaterIntake} / {fitnessData?.dailyWaterGoal} מ"ל</span>
                        </div>
                        <div className="h-2 bg-brand-cream rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (fitnessData?.currentWaterIntake || 0) / (fitnessData?.dailyWaterGoal || 2500) * 100)}%` }}
                            className="h-full bg-brand-black"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span>{profile?.partnerName || 'בן/בת זוג'}</span>
                          <span>{partnerFitnessData?.currentWaterIntake || 0} / {partnerFitnessData?.dailyWaterGoal || 2500} מ"ל</span>
                        </div>
                        <div className="h-2 bg-brand-cream rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (partnerFitnessData?.currentWaterIntake || 0) / (partnerFitnessData?.dailyWaterGoal || 2500) * 100)}%` }}
                            className="h-full bg-brand-gold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Before & After Photos */}
              <div className="space-y-6">
                <h3 className="text-xl font-serif px-2">תהליך שינוי (לפני ואחרי)</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* My Photos */}
                  <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-gold/10">
                    <h4 className="text-sm font-bold text-brand-black/40 uppercase tracking-widest mb-4">התהליך שלי</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        onClick={() => setShowPhotoUpload({ type: 'before', url: fitnessData?.beforePhotoUrl || '' })}
                        className="aspect-[3/4] bg-brand-cream rounded-2xl border-2 border-dashed border-brand-gold/20 flex flex-col items-center justify-center overflow-hidden cursor-pointer group"
                      >
                        {fitnessData?.beforePhotoUrl ? (
                          <img src={fitnessData.beforePhotoUrl} alt="Before" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Camera className="text-brand-gold/40 mb-2" size={24} />
                            <span className="text-[10px] font-bold text-brand-black/40">לפני</span>
                          </>
                        )}
                      </div>
                      <div 
                        onClick={() => setShowPhotoUpload({ type: 'after', url: fitnessData?.afterPhotoUrl || '' })}
                        className="aspect-[3/4] bg-brand-cream rounded-2xl border-2 border-dashed border-brand-gold/20 flex flex-col items-center justify-center overflow-hidden cursor-pointer group"
                      >
                        {fitnessData?.afterPhotoUrl ? (
                          <img src={fitnessData.afterPhotoUrl} alt="After" className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Camera className="text-brand-gold/40 mb-2" size={24} />
                            <span className="text-[10px] font-bold text-brand-black/40">אחרי</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Partner Photos */}
                  {profile?.partnerId && (
                    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-brand-gold/10">
                      <h4 className="text-sm font-bold text-brand-black/40 uppercase tracking-widest mb-4">התהליך של {profile.partnerName}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-[3/4] bg-brand-cream rounded-2xl border border-brand-gold/10 flex flex-col items-center justify-center overflow-hidden">
                          {partnerFitnessData?.beforePhotoUrl ? (
                            <img src={partnerFitnessData.beforePhotoUrl} alt="Partner Before" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <>
                              <ImageIcon className="text-brand-gold/20 mb-2" size={24} />
                              <span className="text-[10px] font-bold text-brand-black/20">לפני</span>
                            </>
                          )}
                        </div>
                        <div className="aspect-[3/4] bg-brand-cream rounded-2xl border border-brand-gold/10 flex flex-col items-center justify-center overflow-hidden">
                          {partnerFitnessData?.afterPhotoUrl ? (
                            <img src={partnerFitnessData.afterPhotoUrl} alt="Partner After" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <>
                              <ImageIcon className="text-brand-gold/20 mb-2" size={24} />
                              <span className="text-[10px] font-bold text-brand-black/20">אחרי</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'articles' && (
            <motion.div
              key="articles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif">מאמרים ומדריכים</h3>
                <BookOpen className="text-brand-gold" size={24} />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {ARTICLES.map((article) => (
                  <div 
                    key={article.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-gold/10 group hover:shadow-md transition-all"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-brand-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                        {article.category === 'lifestyle' ? 'שיפור חיים' : 'תזונה נכונה'}
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h4 className="text-lg font-serif text-brand-black">{article.title}</h4>
                      <p className="text-xs text-brand-black/60 leading-relaxed">{article.excerpt}</p>
                      <div className="pt-4 border-t border-brand-gold/10">
                        <p className="text-[10px] text-brand-black/40 mb-4">{article.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                            קרדיט: {article.credit}
                          </span>
                          <button className="p-2 bg-brand-cream text-brand-black rounded-full hover:bg-brand-gold hover:text-white transition-all">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-brand-gold/10">
                <ContentFeedback pageId="fitness" sectionId="articles" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for Water */}
      {viewMode === 'me' && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateWater(250)}
          className="fixed bottom-28 left-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-white"
        >
          <Droplets size={24} />
        </motion.button>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <h3 className="text-2xl font-serif mb-6 text-brand-black">הגדרות פרופיל כושר</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">גובה (ס"מ)</label>
                    <input 
                      type="number"
                      value={editData.height}
                      onChange={(e) => setEditData({ ...editData, height: Number(e.target.value) })}
                      className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">משקל נוכחי (ק"ג)</label>
                    <input 
                      type="number"
                      value={editData.currentWeight}
                      onChange={(e) => setEditData({ ...editData, currentWeight: Number(e.target.value) })}
                      className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">משקל יעד (ק"ג)</label>
                    <input 
                      type="number"
                      value={editData.targetWeight}
                      onChange={(e) => setEditData({ ...editData, targetWeight: Number(e.target.value) })}
                      className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">יעד מים יומי (מ"ל)</label>
                    <input 
                      type="number"
                      value={editData.dailyWaterGoal}
                      onChange={(e) => setEditData({ ...editData, dailyWaterGoal: Number(e.target.value) })}
                      className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-black/40 uppercase tracking-widest mb-2">יעד צעדים יומי</label>
                    <input 
                      type="number"
                      value={editData.dailyStepGoal}
                      onChange={(e) => setEditData({ ...editData, dailyStepGoal: Number(e.target.value) })}
                      className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 focus:outline-none focus:border-brand-gold text-brand-black font-serif"
                    />
                  </div>

                  <div className="pt-6 border-t border-brand-gold/10 space-y-4">
                    <h4 className="text-xs font-bold text-brand-black/40 uppercase tracking-widest">חיבורים ושיתוף</h4>
                    <button 
                      onClick={connectStrava}
                      disabled={isSyncing}
                      className={cn(
                        "w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all",
                        fitnessData?.stravaConnected 
                          ? "bg-orange-100 text-orange-600 border border-orange-200" 
                          : "bg-orange-500 text-white hover:bg-orange-600"
                      )}
                    >
                      <Activity size={18} />
                      <span>{fitnessData?.stravaConnected ? 'Strava מחובר' : 'חבר ל-Strava'}</span>
                    </button>
                    <button 
                      onClick={generateCoachCode}
                      className="w-full py-4 bg-brand-cream text-brand-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                    >
                      <Users size={18} />
                      <span>שתף נתונים עם מאמן</span>
                    </button>
                    {fitnessData?.coachAccessCode && (
                      <p className="text-center text-[10px] font-bold text-brand-gold">קוד פעיל: {fitnessData.coachAccessCode}</p>
                    )}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="flex-1 py-4 bg-brand-cream text-brand-black rounded-2xl font-bold uppercase tracking-widest text-xs"
                    >
                      ביטול
                    </button>
                    <button 
                      onClick={handleSaveSettings}
                      className="flex-1 py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-brand-gold transition-colors"
                    >
                      שמירה
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Photo Upload Modal */}
      {/* Add Food Modal */}
      <AnimatePresence>
        {showAddFood && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddFood(false)} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-6">הוספת מזון</h3>
              <div className="space-y-4">
                <input type="text" placeholder="שם המזון" value={newFood.name} onChange={e => setNewFood({...newFood, name: e.target.value})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <input type="number" placeholder="קלוריות" value={newFood.calories} onChange={e => setNewFood({...newFood, calories: Number(e.target.value)})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <input type="number" placeholder="אינדקס גליקמי (GI)" value={newFood.giScore} onChange={e => setNewFood({...newFood, giScore: Number(e.target.value)})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <button onClick={() => addFoodToLibrary(newFood)} className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs">שמור מזון</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Sleep Modal */}
      <AnimatePresence>
        {showAddSleep && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddSleep(false)} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-6">מעקב שינה</h3>
              <div className="space-y-4">
                <input type="date" value={newSleep.date} onChange={e => setNewSleep({...newSleep, date: e.target.value})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <input type="number" placeholder="שעות שינה" value={newSleep.hours} onChange={e => setNewSleep({...newSleep, hours: Number(e.target.value)})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(q => (
                    <button key={q} onClick={() => setNewSleep({...newSleep, quality: q})} className={cn("flex-1 py-2 rounded-xl text-xs font-bold", newSleep.quality === q ? "bg-indigo-500 text-white" : "bg-indigo-50 text-indigo-500")}>{q}</button>
                  ))}
                </div>
                <button onClick={() => addSleepLog(newSleep)} className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs">שמור שינה</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Pain Log Modal */}
      <AnimatePresence>
        {showAddPainLog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddPainLog(false)} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-6">מעקב כאב ועייפות</h3>
              <div className="space-y-4">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">רמת כאב (0-10)</label>
                <input type="range" min="0" max="10" value={newPainLog.painScore} onChange={e => setNewPainLog({...newPainLog, painScore: Number(e.target.value)})} className="w-full" />
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">רמת עייפות (0-10)</label>
                <input type="range" min="0" max="10" value={newPainLog.fatigueScore} onChange={e => setNewPainLog({...newPainLog, fatigueScore: Number(e.target.value)})} className="w-full" />
                <button onClick={() => addPainLog(newPainLog)} className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs">שמור מדדים</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PR Update Modal */}
      <AnimatePresence>
        {showPRUpdate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPRUpdate(false)} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-6">עדכון שיאים אישיים</h3>
              <div className="space-y-4">
                <input type="number" placeholder='ריצה (ק"מ)' onChange={e => updatePR({maxRunDistance: Number(e.target.value)})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <input type="number" placeholder="שכיבות סמיכה" onChange={e => updatePR({maxPushups: Number(e.target.value)})} className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" />
                <button onClick={() => setShowPRUpdate(false)} className="w-full py-4 bg-brand-cream text-brand-black rounded-2xl font-bold uppercase tracking-widest text-xs">סגור</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoUpload && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPhotoUpload(null)} className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8">
              <h3 className="text-2xl font-serif mb-6">העלאת תמונת {showPhotoUpload.type === 'before' ? 'לפני' : 'אחרי'}</h3>
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-brand-cream rounded-2xl border-2 border-dashed border-brand-gold/20 flex flex-col items-center justify-center overflow-hidden">
                  {showPhotoUpload.url ? (
                    <img src={showPhotoUpload.url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera className="text-brand-gold/40" size={48} />
                  )}
                </div>
                <input 
                  type="text" 
                  placeholder="הכנס URL של התמונה" 
                  defaultValue={showPhotoUpload.url}
                  onBlur={(e) => setShowPhotoUpload({ ...showPhotoUpload, url: e.target.value })}
                  className="w-full p-4 bg-brand-cream rounded-2xl border border-brand-gold/20 outline-none" 
                />
                <button 
                  onClick={() => handleUploadPhoto(showPhotoUpload.url)} 
                  className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  שמור תמונה
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
