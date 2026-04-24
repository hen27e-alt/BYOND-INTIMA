import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Book, Trophy, Star, Lock, ChevronRight, PlusCircle, Download, Heart, Zap, Lightbulb, Image as ImageIcon, ExternalLink, LogIn, RefreshCw, Mic, Play, Search, Sparkles, Film, Utensils, Map, HelpCircle, Calendar, Wine, Volume2, Pause, Loader2, X, Gamepad2, User as UserIcon, LogOut, Trash2, Check, Music, Disc, BookOpen, MessageCircle, ClipboardCheck, ListTodo, Activity, PiggyBank, Clock, Shield, Dices, BarChart3, Smile, Home, Gift, Moon, MessageSquareWarning, Flag, Flame, Brain, Mail, MapPin, Coffee } from 'lucide-react';
import { KitchenCards } from '../components/KitchenCards';
import { EditableText } from '../components/EditableText';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlert } from '../components/AlertModal';
import { db, handleFirestoreError, OperationType, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { PlaceInteractionsFeed } from '../components/PlaceInteractionsFeed';
import { PartnerLink } from '../components/dashboard/PartnerLink';
import { DailyMotivationCard } from '../components/MotivationModal';
import { DailySpark } from '../components/DailySpark';

import { ProfileHeader } from '../components/dashboard/ProfileHeader';
import { JourneyProgress } from '../components/dashboard/JourneyProgress';
import { DashboardModeToggle } from '../components/dashboard/DashboardModeToggle';
import { QuickActions } from '../components/dashboard/QuickActions';
import { navCategories, EXPERIENCE_ITEMS } from '../constants/dashboardNav';

import { ViewToggle } from '../components/dashboard/ViewToggle';
import { ProfileView } from '../components/dashboard/ProfileView';
import { CodeEntry } from '../components/dashboard/CodeEntry';
import { CelebrationOverlay } from '../components/dashboard/CelebrationOverlay';
import { MissionConfirmationModal } from '../components/dashboard/MissionConfirmationModal';


const specialOffers = [
  {
    title: 'Weekend Getaway Package',
    desc: 'A curated 2-night escape to a luxury boutique hotel, including a private dinner and spa treatments designed for two.',
    icon: Map,
    color: 'bg-blue-50'
  },
  {
    title: 'Virtual Romance Workshop',
    desc: 'Join our expert-led online session to discover new ways to communicate, connect, and deepen your emotional intimacy from home.',
    icon: Volume2,
    color: 'bg-purple-50'
  },
  {
    title: 'Personalized Connection Kit',
    desc: 'A bespoke collection of physical tools and digital guides tailored to your unique relationship dynamic and goals.',
    icon: Sparkles,
    color: 'bg-amber-50'
  }
];

import { DateGenerator } from '../components/DateGenerator';
import { ConversationCards } from '../components/ConversationCards';
import { MemoryWall } from '../components/MemoryWall';
import { WeeklyChallenges } from '../components/WeeklyChallenges';
import { LoveLanguageQuiz } from '../components/LoveLanguageQuiz';
import { BucketList } from '../components/BucketList';
import { ConnectionPulse } from '../components/ConnectionPulse';
import { TimeCapsule } from '../components/TimeCapsule';
import { SecretMissions } from '../components/SecretMissions';
import { WeeklyRecipe } from '../components/WeeklyRecipe';
import { KnowledgeHub } from '../components/KnowledgeHub';
import { DateNightRoulette } from '../components/DateNightRoulette';
import { MonthlyStats } from '../components/MonthlyStats';
import { RelationshipMap } from '../components/RelationshipMap';
import { OurStory } from '../components/OurStory';
import { CollaborativeLists } from '../components/CollaborativeLists';
import { VoiceNotes } from '../components/VoiceNotes';
import { GameCodeSection } from '../components/dashboard/GameCodeSection';
import { AiPlaylistGenerator } from '../components/dashboard/AiPlaylistGenerator';
import { FridgeScanner } from '../components/dashboard/FridgeScanner';
import { JournalEntry } from '../components/dashboard/JournalEntry';
import { LoveLetterGenerator } from '../components/dashboard/LoveLetterGenerator';
import { AIAssistant } from '../components/AIAssistant';
import { VisionBoard } from '../components/VisionBoard';

import { NotificationCenter } from '../components/NotificationCenter';
import { Achievements } from '../components/Achievements';
import { OnboardingModal } from '../components/OnboardingModal';
import { CoupleMissions } from '../components/CoupleMissions';
import { ImageGenerator } from '../components/ImageGenerator';
import { ExperienceModules } from '../components/ExperienceModules';
import { CoupleTips } from '../components/CoupleTips';
import { IntimacyProfile } from '../components/IntimacyProfile';
import { VirtualGuide } from '../components/VirtualGuide';
import { MoodPlaylists } from '../components/MoodPlaylists';
import { AstrologyInsights } from '../components/AstrologyInsights';
import { SavingsGoal } from '../components/SavingsGoal';
import { LiveCounselor } from '../components/LiveCounselor';
import { EscapeRoom } from '../components/EscapeRoom';
import { SiteMap } from '../components/SiteMap';
import { CoupleBookClub } from '../components/CoupleBookClub';
import { RelationshipDynamicsSimulator } from '../components/RelationshipDynamicsSimulator';
import { CoupleTrivia } from '../components/CoupleTrivia';
import { MilestoneTracker } from '../components/MilestoneTracker';
import { ContentFeedback } from '../components/ContentFeedback';
import { BeyondCalendar } from '../components/BeyondCalendar';
import { SommelierBar } from '../components/SommelierBar';
import { RewardsBoutique } from '../components/RewardsBoutique';

import { Journal } from '../components/dashboard/Journal';
import { WeeklyCheckIn } from '../components/dashboard/WeeklyCheckIn';
import { DatingGoals } from '../components/dashboard/DatingGoals';
import { GamificationHub } from '../components/dashboard/GamificationHub';
import { TreasureHunt } from '../components/dashboard/TreasureHunt';
import { MobileDashboard } from '../components/dashboard/MobileDashboard';
import { DesktopDashboard } from '../components/dashboard/DesktopDashboard';
import { MissionsTab } from '../components/dashboard/MissionsTab';
import { CustomPlaylistModal } from '../components/dashboard/CustomPlaylistModal';

import { FitnessDashboard } from '../components/FitnessDashboard';

import { SuggestionsTab } from '../components/dashboard/SuggestionsTab';
import { Login } from './Login';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { t, language } = useLanguage();
  const { user, profile, loading, signIn, logout, updateProfile } = useFirebase();
  const [activeTab, setActiveTab] = React.useState('feed');
  const [dashboardMode, setDashboardMode] = React.useState<'experience' | 'lounge'>(user ? 'experience' : 'lounge');
  const [isCodeVerified, setIsCodeVerified] = React.useState(true); // Forced for testing phase to bypass code entry screen
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force experience mode for everyone in the testing phase
  React.useEffect(() => {
    if (user && dashboardMode === 'lounge') {
      setDashboardMode('experience');
    }
  }, [user]);

  const isAdmin = user?.email === 'hen27e@gmail.com';
  const isConnected = true; // Forced for testing phase to open all features

  const isLockedItem = (itemOpen: boolean) => {
    // All items are unlocked for the testing phase
    return false;
  };



  const [isGamesUnlocked, setIsGamesUnlocked] = React.useState(false);
  const [selectedGame, setSelectedGame] = React.useState<string | null>(null);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [celebratedMission, setCelebratedMission] = React.useState<any>(null);
  const [playlists, setPlaylists] = React.useState([
    { 
      id: '1', 
      title: 'Romantic Evenings', 
      platform: 'Spotify', 
      url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX76W9Srh67vR', 
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=400', 
      tracks: ['Perfect - Ed Sheeran', 'All of Me - John Legend', 'Thinking Out Loud - Ed Sheeran', 'Say You Won\'t Let Go - James Arthur', 'A Thousand Years - Christina Perri'] 
    },
    { 
      id: '2', 
      title: 'Chill & Connect', 
      platform: 'YouTube Music', 
      url: 'https://www.youtube.com/embed/videoseries?list=PLMC9KNkIncKtPojQ-nIu67bb6VXVICWzL', 
      thumbnail: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=400', 
      tracks: ['Weightless - Marconi Union', 'Sunset Lover - Petit Biscuit', 'River Flows in You - Yiruma', 'Lullaby - Low', 'Sparks - Coldplay'] 
    },
    { 
      id: '3', 
      title: 'Deep Conversations', 
      platform: 'Spotify', 
      url: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWsp6KmOR3', 
      thumbnail: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?auto=format&fit=crop&q=80&w=400', 
      tracks: ['Fix You - Coldplay', 'Landslide - Fleetwood Mac', 'Hallelujah - Jeff Buckley', 'The Night We Met - Lord Huron', 'Skinny Love - Bon Iver'] 
    },
    { 
      id: '4', 
      title: 'Elegant Dinner', 
      platform: 'Apple Music', 
      url: 'https://embed.music.apple.com/us/playlist/dinner-party/pl.u-mJy81v4uN6D1P', 
      thumbnail: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=400', 
      tracks: ['Fly Me To The Moon - Frank Sinatra', 'L-O-V-E - Nat King Cole', 'Feeling Good - Nina Simone', 'Beyond - Leon Bridges', 'Coming Home - Leon Bridges'] 
    },
  ]);

  const [connectedPlatforms, setConnectedPlatforms] = React.useState<string[]>([]);
  const [libraryView, setLibraryView] = React.useState<'main' | 'recipes' | 'movies' | 'fridge' | 'sommelier'>('main');
  const [missionView, setMissionView] = React.useState<'list' | 'kitchen-cards'>('list');

  const [missionImage, setMissionImage] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showCustomPlaylistModal, setShowCustomPlaylistModal] = React.useState(false);

  
  // Progress derived from Firebase profile
  const cookedCount = profile?.progress?.cookedCount || 0;
  const watchedMoviesCount = profile?.progress?.watchedMoviesCount || 0;
  const solvedRiddlesCount = profile?.progress?.solvedRiddlesCount || 0;

  const [currentOffer, setCurrentOffer] = React.useState(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [confirmMission, setConfirmMission] = React.useState<any>(null);
  const [selectedMissionCategory, setSelectedMissionCategory] = React.useState<string>('All');
  const [activeMedal, setActiveMedal] = React.useState<any>(null);
  const [playlistToDelete, setPlaylistToDelete] = React.useState<any>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [showForceReload, setShowForceReload] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('Dashboard State:', { 
      loading, 
      user: !!user, 
      profile: !!profile, 
      isCodeVerified,
      dashboardMode,
      activeTab
    });
  }, [loading, user, profile, isCodeVerified, dashboardMode, activeTab]);

  // Loading timeout
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setShowForceReload(true);
        console.warn('Dashboard loading timeout reached');
      }, 10000); // 10 seconds
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const funLevel = Math.min(
    (cookedCount * 5) + (watchedMoviesCount * 5) + (solvedRiddlesCount * 10),
    100
  );

  const [enteredCode, setEnteredCode] = React.useState('');
  const [codeError, setCodeError] = React.useState(false);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.toUpperCase() === 'LOVE2026') {
      setIsCodeVerified(true);
      localStorage.setItem('isCodeVerified', 'true');
      setCodeError(false);
    } else {
      setCodeError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 text-center max-w-xs">
          <Loader2 className="animate-spin text-brand-gold" size={48} />
          <div className="space-y-2">
            <p className="text-brand-black/40 font-serif italic text-lg">טוען את המרחב האישי שלכם...</p>
            {showForceReload && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
              >
                <p className="text-xs text-brand-black/30 mb-4">נראה שהטעינה לוקחת קצת זמן. ייתכן שיש בעיית חיבור.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-brand-black text-white text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all"
                >
                  נסה לרענן את העמוד
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const generateAudioOverview = async () => {
    if (isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const summaryText = `שלום יונתן ודנה. הנה סיכום השבוע שלכם ב-Byond Intima. 
      השבוע בישלתם ${cookedCount} מתכונים חדשים, ופתרתם ${solvedRiddlesCount} חידות יחד. 
      פתרתם ${solvedRiddlesCount} חידות במטמון הדיגיטלי והגעתם לרמת הנאה של ${funLevel} אחוזים.
      ביומן שלכם ציינתם שהפסטה כמהין הייתה הצלחה גדולה ושהיה לכם זמן איכות מדהים יחד. 
      הנושא החם שלכם השבוע היה זוגיות וקריירה. 
      המשיכו להשקיע בזמן האיכות שלכם, אתם בדרך הנכונה למדליית המאסטר. שיהיה לכם שבוע נפלא!`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully in Hebrew: ${summaryText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is good for Hebrew
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const blob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play();
          setIsPlayingAudio(true);
        }
      }
    } catch (error) {
      console.error("Error generating audio overview:", error);
      showAlert("מצטערים, חלה שגיאה ביצירת מדריך השמע. אנא נסו שוב מאוחר יותר.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };



  const handleSetMissionDueDate = async (missionTitle: string, dueDate: string) => {
    if (!profile) return;
    const updatedDueDates = {
      ...(profile.missionDueDates || {}),
      [missionTitle]: dueDate
    };
    await updateProfile({ missionDueDates: updatedDueDates });
  };



  const toggleAudioPlayback = () => {
    if (!audioUrl) {
      generateAudioOverview();
      return;
    }

    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const medals = [
    { id: 'bronze', name: 'מדליית ארד (המתחיל)', icon: Award, desc: 'הוענקה על השלמת 3 משימות ראשונות', unlocked: true },
    { id: 'silver', name: 'מדליית כסף (המנוסה)', icon: Trophy, desc: 'הוענקה על צבירת 500 נקודות זהב', unlocked: true },
    { id: 'gold', name: 'מדליית זהב (מאסטר)', icon: Star, desc: 'הוענקה על פתיחת כל סוגי המארזים (כולל הפלטינום)', unlocked: false },
    { id: 'romantic', name: 'הרומנטיקן', icon: Heart, desc: 'הוענקה על ביצוע מחוות קטנות ומפתיעות', unlocked: true },
    { id: 'researcher', name: 'החוקר הפנימי', icon: Search, desc: 'הוענקה על ניתוח תובנות עמוק מהיומן האישי', unlocked: false },
  ];

  const handleCompleteMission = async () => {
    if (!confirmMission || !profile || !user) return;
    
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (missionImage) {
        const storageRef = ref(storage, `missions/${user.uid}/${Date.now()}_${missionImage.name}`);
        const snapshot = await uploadBytes(storageRef, missionImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const currentPoints = profile.progress?.totalPoints || 0;
      const newPoints = currentPoints + confirmMission.points;
      
      // Store the completed mission in a subcollection for history
      await addDoc(collection(db, 'users', user.uid, 'completedMissions'), {
        missionTitle: confirmMission.title,
        points: confirmMission.points,
        imageUrl: imageUrl,
        completedAt: serverTimestamp()
      });

      await updateProfile({
        progress: {
          ...profile.progress,
          totalPoints: newPoints
        }
      });
      
      setCelebratedMission(confirmMission);
      setShowCelebration(true);
      setConfirmMission(null);
      setMissionImage(null);
      
      // Auto-hide celebration after 4 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 4000);
    } catch (error) {
      console.error("Error completing mission:", error);
      showAlert("שגיאה בסיום המשימה. אנא נסו שוב.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDeletePlaylist = () => {
    if (playlistToDelete) {
      setPlaylists(playlists.filter(p => p.id !== playlistToDelete.id));
      setPlaylistToDelete(null);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    try {
      const endpoint = platform === 'Spotify' ? '/api/auth/spotify/url' : '/api/auth/apple-music/url';
      const response = await fetch(endpoint);
      const { url } = await response.json();

      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        showAlert('Please allow popups to connect your account.');
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const platform = event.data.platform;
        if (!connectedPlatforms.includes(platform)) {
          setConnectedPlatforms(prev => [...prev, platform]);
        }
        showAlert(`חשבון ה-${platform} שלך חובר בהצלחה!`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [connectedPlatforms]);



  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!profile?.coupleId) return;
    const q = query(
      collection(db, 'couple_missions'),
      where('coupleId', '==', profile.coupleId),
      where('completionStatus', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const missions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const upcoming = missions.filter((m: any) => {
        if (!m.deadline) return false;
        const deadline = m.deadline.toDate ? m.deadline.toDate() : new Date(m.deadline);
        const diff = deadline.getTime() - new Date().getTime();
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // Next 3 days
      });
      setNotifications(upcoming);
    });
  }, [profile?.coupleId]);

  const dashboardProps = {
    user,
    profile,
    language,
    dashboardMode,
    setDashboardMode,
    activeTab,
    setActiveTab,
    isLockedItem,
    funLevel,
    cookedCount,
    solvedRiddlesCount,
    watchedMoviesCount,
    signIn,
    logout,
    updateProfile,
    showAlert,
    navigate,
    isCodeVerified,
    enteredCode,
    setEnteredCode,
    handleVerifyCode,
    codeError,
    notificationCount: notifications.length
  };

  const renderTabContent = () => {
    if (dashboardMode === 'experience' && !isCodeVerified && profile?.role !== 'admin') {
      return (
        <CodeEntry 
          enteredCode={enteredCode}
          setEnteredCode={setEnteredCode}
          handleVerifyCode={handleVerifyCode}
          codeError={codeError}
        />
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            switch (activeTab) {
              case 'missions':
                return (
                  <MissionsTab 
                    profile={profile}
                    selectedMissionCategory={selectedMissionCategory}
                    setSelectedMissionCategory={setSelectedMissionCategory}
                    handleSetMissionDueDate={handleSetMissionDueDate}
                    setMissionView={setMissionView}
                    setConfirmMission={setConfirmMission}
                  />
                );
              case 'journal':
                return <Journal />;
              case 'suggestions':
                return <SuggestionsTab />;
              case 'fitness':
                return <FitnessDashboard />;
              case 'weekly-checkin':
                return <WeeklyCheckIn />;
              case 'dating-goals':
                return <DatingGoals />;
              case 'gamification':
                return <GamificationHub />;
              case 'treasure-hunt':
                return <TreasureHunt />;
              case 'vision-board':
                return <VisionBoard />;
              case 'live-counselor':
                return <AIAssistant />;
              case 'profile':
                return <ProfileView profile={profile} updateProfile={updateProfile} logout={logout} setActiveTab={setActiveTab} notifications={notifications} />;
              case 'feed':
                return null; // Feed is handled in MobileDashboard/DesktopDashboard
              default:
                return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4">
                      <Lock className="text-brand-gold" size={32} />
                    </div>
                    <h3 className="text-xl font-serif mb-2">התוכן בדרך...</h3>
                    <p className="text-brand-black/60 max-w-xs">אנחנו עובדים על שדרוג החוויה שלכם. בקרוב תוכלו ליהנות מכל התכונות החדשות!</p>
                  </div>
                );
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] pt-16 md:pt-20">
      <OnboardingModal />
      
      <div className="max-w-7xl mx-auto px-4">
        {(activeTab === 'feed' || activeTab === 'profile') && (
          <ViewToggle activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>

      {isMobile ? (
        <MobileDashboard {...dashboardProps} renderTabContent={renderTabContent} />
      ) : (
        <DesktopDashboard {...dashboardProps} renderTabContent={renderTabContent} />
      )}











      {/* Celebration Overlay */}
      <CelebrationOverlay showCelebration={showCelebration} celebratedMission={celebratedMission} />

      <CustomPlaylistModal 
        isOpen={showCustomPlaylistModal} 
        onClose={() => setShowCustomPlaylistModal(false)} 
        onSave={(playlist) => {
          setPlaylists([
            {
              id: Date.now().toString(),
              title: playlist.title,
              platform: playlist.platform,
              url: '', // Custom playlists don't have a URL yet
              thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400",
              tracks: playlist.tracks
            },
            ...playlists
          ]);
          showAlert('הפלייליסט המותאם אישית נוצר בהצלחה!');
        }} 
      />

      {/* Confirmation Modal */}
      <MissionConfirmationModal 
        confirmMission={confirmMission}
        setConfirmMission={setConfirmMission}
        missionImage={missionImage}
        setMissionImage={setMissionImage}
        handleCompleteMission={handleCompleteMission}
        isUploading={isUploading}
      />
    </div>
  );
};
