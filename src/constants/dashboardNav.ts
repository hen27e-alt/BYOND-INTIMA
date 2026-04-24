import { Home, Trophy, Gift, Map, Book, MapPin, Wine, Brain, Dices, Play, Lock, BookOpen, Utensils, Volume2, Clock, ImageIcon, Flag, MessageCircle, Heart, Moon, Mic, Calendar, Star, Shield, Lightbulb, MessageSquareWarning, ListTodo, PiggyBank, Award, ClipboardCheck, Target, Activity, Sparkles, User as UserIcon } from 'lucide-react';

export const EXPERIENCE_ITEMS = ['progress', 'missions', 'secret-missions', 'conv-cards', 'medals', 'milestones', 'timeline', 'boutique', 'game-code', 'games', 'vision-board'];

export interface NavItem {
  id: string;
  name: string;
  icon: any;
  open?: boolean;
}

export interface NavCategory {
  title: string;
  items: NavItem[];
}

export const navCategories: NavCategory[] = [
  {
    title: 'ראשי',
    items: [
      { id: 'feed', name: 'הפיד שלנו', icon: Home, open: true },
      { id: 'suggestions', name: 'הצעות והשראה', icon: Lightbulb, open: true },
      { id: 'profile', name: 'פרופיל אישי', icon: UserIcon, open: true },
      { id: 'progress', name: 'התקדמות המסע', icon: Trophy },
      { id: 'boutique', name: 'בוטיק ההטבות', icon: Gift },
      { id: 'sitemap', name: 'מפת האפליקציה', icon: Map },
    ]
  },
  {
    title: 'פעילות יומית',
    items: [
      { id: 'journal', name: 'יומן אישי ומשותף', icon: Book },
      { id: 'fitness', name: 'כושר ותזונה', icon: Activity, open: true },
      { id: 'weekly-checkin', name: 'צ\'ק-אין שבועי', icon: ClipboardCheck },
    ]
  },
  {
    title: 'זמן איכות',
    items: [
      { id: 'recommendations', name: 'המלצות לדייטים', icon: MapPin },
      { id: 'sommelier', name: 'בר וסומלייה', icon: Wine },
      { id: 'trivia', name: 'טריוויה זוגית', icon: Brain },
      { id: 'treasure-hunt', name: 'חיפוש המטמון', icon: Map },
      { id: 'roulette', name: 'רולטת דייטים', icon: Dices },
      { id: 'games', name: 'משחקים', icon: Play },
      { id: 'escape-room', name: 'חדר בריחה', icon: Lock },
      { id: 'book-club', name: 'מועדון קריאה', icon: BookOpen },
      { id: 'recipe', name: 'מתכון השבוע', icon: Utensils },
      { id: 'playlists', name: 'פלייליסטים', icon: Volume2 },
    ]
  },
  {
    title: 'חיבור עמוק',
    items: [
      { id: 'timeline', name: 'הסיפור שלנו', icon: Clock, open: true },
      { id: 'memory-wall', name: 'קיר זכרונות', icon: ImageIcon },
      { id: 'milestones', name: 'אבני דרך', icon: Flag },
      { id: 'vision-board', name: 'לוח חזון', icon: Sparkles, open: true },
      { id: 'conv-cards', name: 'קלפי שיח', icon: MessageCircle, open: true },
      { id: 'relationship-map', name: 'מפת הזיכרונות', icon: Map },
      { id: 'intimacy', name: 'פרופיל אינטימי', icon: Heart },
      { id: 'astrology', name: 'תובנות אסטרולוגיות', icon: Moon },
      { id: 'live-counselor', name: 'יועץ זוגי קולי', icon: Mic },
    ]
  },
  {
    title: 'התפתחות וחיים משותפים',
    items: [
      { id: 'calendar', name: 'יומן זוגי חכם', icon: Calendar },
      { id: 'dating-goals', name: 'יעדי דייטינג', icon: Target },
      { id: 'missions', name: 'משימות', icon: Star },
      { id: 'secret-missions', name: 'משימות סודיות', icon: Shield },
      { id: 'time-capsule', name: 'קפסולת זמן', icon: Clock },
      { id: 'gamification', name: 'מרכז ההישגים', icon: Award },
      { id: 'knowledge-hub', name: 'מרכז ידע', icon: BookOpen },
      { id: 'relationship-library', name: 'ספרייה לשיפור הזוגיות', icon: Book },
      { id: 'couple-tips', name: 'טיפים לזוגיות', icon: Lightbulb },
      { id: 'virtual-guide', name: 'מדריכת AI', icon: Play },
      { id: 'conflict-simulator', name: 'סימולטור קונפליקטים', icon: MessageSquareWarning },
      { id: 'collab-lists', name: 'רשימות משותפות', icon: ListTodo },
      { id: 'savings', name: 'יעדים פיננסיים', icon: PiggyBank },
    ]
  }
];
