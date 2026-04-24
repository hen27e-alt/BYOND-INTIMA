import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, Save, ArrowLeft, Camera, Heart, Star, Globe, MapPin, LogOut, Trash2, ExternalLink, Sparkles, Clock, MessageCircle, Gift, HandMetal, Award, X, Bell, ShoppingBag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EditableText } from '../components/EditableText';
import { LoveLanguageQuiz } from '../components/LoveLanguageQuiz';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';

const TIMEZONES = [
  'UTC',
  'Israel (GMT+2/3)',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney'
];

export const Profile = () => {
  const { user, profile, updateProfile, logout } = useFirebase();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loveLanguage, setLoveLanguage] = useState('');
  const [dateStyle, setDateStyle] = useState('');
  const [timezone, setTimezone] = useState('Israel (GMT+2/3)');
  const [location, setLocation] = useState<{lat: number, lng: number} | string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'users', user.uid, 'saved_places'),
        orderBy('savedAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setSavedPlaces(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setEmail(profile.email || '');
      setPartnerName(profile.partnerName || '');
      setPartnerEmail(profile.partnerEmail || '');
      setLoveLanguage(profile.loveLanguage || '');
      setDateStyle(profile.preferences?.dateStyle || '');
      setNotificationsEnabled(profile.preferences?.notificationsEnabled !== false);
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Israel (GMT+2/3)');
      setLocation(profile.location || null);
    }
  }, [profile]);

  const detectLocation = () => {
    setIsDetecting(true);
    // Temporarily disabled geolocation
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTz) setTimezone(detectedTz);
    
    setIsDetecting(false);
    setSuccessMessage(language === 'he' ? 'אזור הזמן זוהה בהצלחה' : 'Timezone detected successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    
    try {
      await updateProfile({ 
        displayName,
        partnerName,
        partnerEmail,
        loveLanguage,
        timezone,
        location,
        preferences: {
          ...profile?.preferences,
          dateStyle,
          notificationsEnabled
        }
      });
      setSuccessMessage(language === 'he' ? 'הפרופיל עודכן בהצלחה' : 'Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedPlace = async (placeId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'saved_places', placeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/saved_places/${placeId}`);
    }
  };

  const getLoveLanguageSuggestions = (lang: string) => {
    const suggestions: Record<string, { dates: string[], missions: string[] }> = {
      'words': {
        dates: ['ערב כתיבת מכתבי אהבה', 'דייט בבית קפה שקט לשיחה עמוקה'],
        missions: ['שלחו הודעת הערכה מפתיעה באמצע היום', 'כתבו 5 דברים שאתם אוהבים בפרטנר על המראה']
      },
      'time': {
        dates: ['פיקניק בטבע ללא טלפונים', 'סדנת בישול משותפת'],
        missions: ['קבעו שעה של "זמן מקודש" ללא מסכים הערב', 'צאו לטיול רגלי של 20 דקות רק שניכם']
      },
      'gifts': {
        dates: ['סיבוב בשוק פשפשים למציאת אוצרות', 'דייט "קנייה אחד לשנייה" בתקציב מוגבל'],
        missions: ['הפתיעו עם המאכל האהוב עליהם בדרך הביתה', 'הכינו משהו קטן בעבודת יד']
      },
      'acts': {
        dates: ['יום התנדבות משותף', 'דייט "סידור הבית" בכיף עם מוזיקה'],
        missions: ['קחו על עצמכם מטלה שהפרטנר לא אוהב לעשות', 'הכינו להם קפה או תה בדיוק איך שהם אוהבים']
      },
      'touch': {
        dates: ['סדנת עיסוי זוגית', 'ערב סרטים מכורבלים תחת שמיכה'],
        missions: ['תנו חיחיבוק של 20 שניות כשאתם נפגשים', 'החזיקו ידיים לאורך כל ארוחת הערב']
      }
    };
    
    // Map the Hebrew/English labels to keys
    const key = lang.toLowerCase().includes('words') ? 'words' :
                lang.toLowerCase().includes('time') ? 'time' :
                lang.toLowerCase().includes('gifts') ? 'gifts' :
                lang.toLowerCase().includes('acts') ? 'acts' :
                lang.toLowerCase().includes('touch') ? 'touch' : '';
                
    return suggestions[key] || null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
        <EditableText 
          contentId={`profile_login_required_${language}`}
          defaultText={language === 'he' ? 'אנא התחברו כדי לצפות בפרופיל' : 'Please log in to view your profile'}
          as="p"
          className="text-brand-black/40 font-serif italic"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-32 pb-20 px-6" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-black/40 hover:text-brand-gold transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className={cn("transition-transform", language === 'he' || language === 'ar' ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1")} />
          <EditableText 
            contentId={`profile_back_btn_${language}`}
            defaultText={language === 'he' ? 'חזרה' : 'Back'}
            as="span"
            className="text-[10px] uppercase tracking-widest"
          />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-brand-gold/10 p-8 text-center sticky top-32">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    alt="" 
                    className="w-full h-full rounded-full object-cover bg-brand-cream border border-brand-gold/20" 
                  />
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-brand-gold text-brand-black rounded-full hover:bg-brand-black hover:text-brand-gold transition-all shadow-lg">
                  <Camera size={16} />
                </button>
              </div>
              
              <h2 className="text-2xl font-serif mb-2">{displayName || (language === 'he' ? 'משתמש חדש' : 'New User')}</h2>
              <p className="text-[10px] text-brand-black/40 uppercase tracking-widest mb-8">
                {profile?.experienceLevel || 'The Velvet Experience'}
              </p>

              <div className="mt-8 pt-8 border-t border-brand-gold/10 space-y-6">
                {/* Gold Points Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-gradient-to-br from-brand-black to-[#1a1a1a] p-6 rounded-2xl border border-brand-gold/30 shadow-xl group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/10 blur-3xl -mr-12 -mt-12 group-hover:bg-brand-gold/20 transition-all duration-700" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center mb-3 border border-brand-gold/20">
                      <Star className="text-brand-gold fill-brand-gold/20" size={20} />
                    </div>
                    <EditableText 
                      contentId={`profile_gold_points_label_${language}`}
                      defaultText={language === 'he' ? 'נקודות זהב' : 'Gold Points'}
                      as="span"
                      className="text-[9px] uppercase tracking-[0.2em] text-brand-gold/60 mb-1"
                    />
                    <div className="flex items-baseline gap-1">
                      <motion.span 
                        key={profile?.progress?.totalPoints}
                        initial={{ scale: 1.5, color: '#fff' }}
                        animate={{ scale: 1, color: '#C9A96E' }}
                        className="text-4xl font-serif text-brand-gold"
                      >
                        {profile?.progress?.totalPoints || 0}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>

                {/* My Orders Link */}
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/20 flex justify-between items-center group hover:bg-brand-gold hover:text-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center group-hover:bg-white/20">
                      <ShoppingBag className="text-brand-gold group-hover:text-white" size={14} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold">
                      {language === 'he' ? 'ההזמנות שלי' : 'My Orders'}
                    </span>
                  </div>
                  <ChevronRight size={14} className={cn("transition-transform", language === 'he' || language === 'ar' ? "rotate-180" : "")} />
                </button>

                {/* Medals Summary */}
                <div className="bg-brand-cream/30 p-4 rounded-xl border border-brand-gold/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-gold/10 rounded-full flex items-center justify-center">
                      <Shield className="text-brand-gold" size={14} />
                    </div>
                    <EditableText 
                      contentId={`profile_medals_label_${language}`}
                      defaultText={language === 'he' ? 'מדליות' : 'Medals'}
                      as="span"
                      className="text-[10px] uppercase tracking-widest text-brand-black/60"
                    />
                  </div>
                  <span className="font-serif text-brand-gold text-lg">
                    {profile?.medals?.filter(m => m.unlocked).length || 0}
                    <span className="text-brand-black/20 text-xs ml-1">/ 15</span>
                  </span>
                </div>

                {/* Mobile Only: Settings */}
                <div className="lg:hidden pt-8 border-t border-brand-gold/10 space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase tracking-widest text-brand-black/40 text-right">שפת ממשק (Language)</label>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {['he', 'en', 'ru', 'ar'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                            language === lang 
                              ? "bg-brand-gold border-brand-gold text-white" 
                              : "bg-white border-brand-gold/10 text-brand-black/60"
                          )}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-500 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-red-100 transition-all"
                  >
                    <LogOut size={16} />
                    <span>התנתקות מהמערכת</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-brand-gold/10 p-6 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <Shield size={20} className="text-brand-gold" />
                  <EditableText 
                    contentId={`profile_account_details_title_${language}`}
                    defaultText={language === 'he' ? 'פרטי חשבון' : 'Account Details'}
                    as="span"
                  />
                </h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[10px] uppercase tracking-widest text-brand-gold hover:text-brand-black transition-colors border-b border-brand-gold/20 pb-1"
                >
                  {isEditing ? (
                    <EditableText contentId={`profile_cancel_edit_${language}`} defaultText={language === 'he' ? 'ביטול עריכה' : 'Cancel Edit'} as="span" />
                  ) : (
                    <EditableText contentId={`profile_edit_profile_${language}`} defaultText={language === 'he' ? 'ערוך פרופיל' : 'Edit Profile'} as="span" />
                  )}
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-2">
                  <EditableText 
                    contentId={`profile_label_name_${language}`}
                    defaultText={language === 'he' ? 'שם מלא' : 'Full Name'}
                    as="label"
                    className="text-[10px] uppercase tracking-widest text-brand-black/40 block"
                  />
                  <div className="relative">
                    <User className={`${language === 'he' || language === 'ar' ? 'right-0' : 'left-0'} absolute top-1/2 -translate-y-1/2 text-brand-gold/40`} size={18} />
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full bg-transparent border-b border-brand-gold/20 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} focus:outline-none focus:border-brand-gold transition-all font-serif text-lg ${!isEditing ? 'cursor-not-allowed text-brand-black/60' : ''}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <EditableText 
                    contentId={`profile_label_email_${language}`}
                    defaultText={language === 'he' ? 'אימייל' : 'Email'}
                    as="label"
                    className="text-[10px] uppercase tracking-widest text-brand-black/40 block"
                  />
                  <div className="relative">
                    <Mail className={`${language === 'he' || language === 'ar' ? 'right-0' : 'left-0'} absolute top-1/2 -translate-y-1/2 text-brand-gold/40`} size={18} />
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className={`w-full bg-transparent border-b border-brand-gold/10 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} text-brand-black/30 cursor-not-allowed font-serif text-lg`}
                    />
                  </div>
                  <EditableText 
                    contentId={`profile_email_hint_${language}`}
                    defaultText={language === 'he' ? 'לא ניתן לשנות את כתובת האימייל המקושרת לחשבון' : 'Email address cannot be changed'}
                    as="p"
                    className="text-[9px] text-brand-black/30 italic"
                  />
                </div>

                <div className="space-y-2">
                  <EditableText 
                    contentId={`profile_label_timezone_${language}`}
                    defaultText={language === 'he' ? 'אזור זמן' : 'Timezone'}
                    as="label"
                    className="text-[10px] uppercase tracking-widest text-brand-black/40 block"
                  />
                  <div className="flex flex-col gap-4">
                    <div className="relative flex-1">
                      <Globe className={`${language === 'he' || language === 'ar' ? 'right-0' : 'left-0'} absolute top-1/2 -translate-y-1/2 text-brand-gold/40`} size={18} />
                      {isEditing ? (
                        <select 
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className={`w-full bg-transparent border-b border-brand-gold/20 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} focus:outline-none focus:border-brand-gold transition-all font-serif text-lg`}
                        >
                          {TIMEZONES.map(tz => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={timezone}
                          disabled
                          className={`w-full bg-transparent border-b border-brand-gold/10 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} text-brand-black/60 cursor-not-allowed font-serif text-lg`}
                        />
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={isDetecting}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-[9px] uppercase tracking-widest hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50"
                      >
                        <MapPin size={12} />
                        {isDetecting ? (language === 'he' ? 'מזהה...' : 'Detecting...') : (language === 'he' ? 'זהה מיקום אוטומטית' : 'Detect Location Automatically')}
                      </button>
                    )}
                  </div>
                  {location && (
                    <p className="text-[9px] text-emerald-600 italic flex items-center gap-1">
                      <MapPin size={10} />
                      {language === 'he' 
                        ? `מיקום זוהה: ${typeof location === 'object' && location !== null ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : location}` 
                        : `Location detected: ${typeof location === 'object' && location !== null ? `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : location}`}
                    </p>
                  )}
                </div>

                <div className="pt-8 border-t border-brand-gold/10">
                  <h4 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Heart size={16} className="text-brand-gold" />
                    <EditableText 
                      contentId={`profile_partner_details_title_${language}`}
                      defaultText={language === 'he' ? 'פרטי בן/בת הזוג' : 'Partner Details'}
                      as="span"
                    />
                  </h4>
                  
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <EditableText 
                        contentId={`profile_label_partner_name_${language}`}
                        defaultText={language === 'he' ? 'שם בן/בת הזוג' : 'Partner Name'}
                        as="label"
                        className="text-[10px] uppercase tracking-widest text-brand-black/40 block"
                      />
                      <div className="relative">
                        <User className={`${language === 'he' || language === 'ar' ? 'right-0' : 'left-0'} absolute top-1/2 -translate-y-1/2 text-brand-gold/40`} size={18} />
                        <input 
                          type="text" 
                          value={partnerName}
                          onChange={(e) => setPartnerName(e.target.value)}
                          disabled={!isEditing}
                          placeholder={language === 'he' ? 'הכנס שם' : 'Enter name'}
                          className={`w-full bg-transparent border-b border-brand-gold/20 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} focus:outline-none focus:border-brand-gold transition-all font-serif text-lg ${!isEditing ? 'cursor-not-allowed text-brand-black/60' : ''}`}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <EditableText 
                        contentId={`profile_label_partner_email_${language}`}
                        defaultText={language === 'he' ? 'אימייל בן/בת הזוג' : 'Partner Email'}
                        as="label"
                        className="text-[10px] uppercase tracking-widest text-brand-black/40 block"
                      />
                      <div className="relative">
                        <Mail className={`${language === 'he' || language === 'ar' ? 'right-0' : 'left-0'} absolute top-1/2 -translate-y-1/2 text-brand-gold/40`} size={18} />
                        <input 
                          type="email" 
                          value={partnerEmail}
                          onChange={(e) => setPartnerEmail(e.target.value)}
                          disabled={!isEditing}
                          placeholder="partner@example.com"
                          className={`w-full bg-transparent border-b border-brand-gold/20 py-3 ${language === 'he' || language === 'ar' ? 'pr-8' : 'pl-8'} focus:outline-none focus:border-brand-gold transition-all font-serif text-lg ${!isEditing ? 'cursor-not-allowed text-brand-black/60' : ''}`}
                        />
                      </div>
                      <EditableText 
                        contentId={`profile_partner_email_hint_${language}`}
                        defaultText={language === 'he' ? 'הוספת אימייל תאפשר בעתיד לחבר בין החשבונות שלכם' : 'Adding email will allow connecting accounts in the future'}
                        as="p"
                        className="text-[9px] text-brand-black/40 italic"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-8">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-3 bg-brand-black text-white px-8 py-4 text-[10px] uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50"
                    >
                      <Save size={16} />
                      <EditableText 
                        contentId={`profile_save_btn_${language}`}
                        defaultText={isSaving ? (language === 'he' ? 'שומר...' : 'Saving...') : (language === 'he' ? 'שמירת שינויים' : 'Save Changes')}
                        as="span"
                      />
                    </button>
                    
                    {successMessage && (
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-4 text-emerald-600 text-[10px] uppercase tracking-widest font-bold"
                      >
                        {successMessage}
                      </motion.p>
                    )}
                  </div>
                )}
              </form>

              <div className="mt-20 pt-12 border-t border-brand-gold/10">
                <h3 className="text-xl font-serif mb-8 flex items-center gap-3">
                  <Star size={20} className="text-brand-gold" />
                  <EditableText 
                    contentId={`profile_preferences_title_${language}`}
                    defaultText={language === 'he' ? 'העדפות זוגיות' : 'Relationship Preferences'}
                    as="span"
                  />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-brand-cream/50 border border-brand-gold/5">
                    <Heart size={20} className="text-brand-gold/40 mb-4" />
                    <EditableText 
                      contentId={`profile_love_language_title_${language}`}
                      defaultText={language === 'he' ? 'שפת האהבה שלכם' : 'Your Love Language'}
                      as="h4"
                      className="text-sm font-serif mb-2"
                    />
                    <div className="space-y-4">
                      {isEditing ? (
                        <select 
                          value={loveLanguage}
                          onChange={(e) => setLoveLanguage(e.target.value)}
                          className="w-full bg-transparent border-b border-brand-gold/20 py-2 focus:outline-none focus:border-brand-gold transition-all font-serif text-sm"
                        >
                          <option value="">{language === 'he' ? 'בחרו שפת אהבה' : 'Choose love language'}</option>
                          <option value="מילות חיזוק (Words of Affirmation)">{language === 'he' ? 'מילות חיזוק (Words of Affirmation)' : 'Words of Affirmation'}</option>
                          <option value="זמן איכות (Quality Time)">{language === 'he' ? 'זמן איכות (Quality Time)' : 'Quality Time'}</option>
                          <option value="קבלת מתנות (Receiving Gifts)">{language === 'he' ? 'קבלת מתנות (Receiving Gifts)' : 'Receiving Gifts'}</option>
                          <option value="מעשי שירות (Acts of Service)">{language === 'he' ? 'מעשי שירות (Acts of Service)' : 'Acts of Service'}</option>
                          <option value="מגע פיזי (Physical Touch)">{language === 'he' ? 'מגע פיזי (Physical Touch)' : 'Physical Touch'}</option>
                        </select>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-brand-black/60 uppercase tracking-widest">
                            {loveLanguage || (language === 'he' ? 'טרם הוגדר' : 'Not defined yet')}
                          </p>
                          <button 
                            onClick={() => setShowQuiz(true)}
                            className="text-[9px] text-brand-gold font-bold uppercase tracking-widest hover:underline"
                          >
                            {language === 'he' ? 'בצעו שאלון' : 'Take Quiz'}
                          </button>
                        </div>
                      )}

                      {loveLanguage && !isEditing && (
                        <div className="mt-4 pt-4 border-t border-brand-gold/10 space-y-4">
                          {getLoveLanguageSuggestions(loveLanguage) && (
                            <>
                              <div className="space-y-2">
                                <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">הצעות לדייטים:</p>
                                <ul className="text-[10px] text-brand-black/60 space-y-1">
                                  {getLoveLanguageSuggestions(loveLanguage)?.dates.map((d, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-brand-gold rounded-full" />
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">משימות מומלצות:</p>
                                <ul className="text-[10px] text-brand-black/60 space-y-1">
                                  {getLoveLanguageSuggestions(loveLanguage)?.missions.map((m, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-brand-gold rounded-full" />
                                      {m}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 bg-brand-cream/50 border border-brand-gold/5">
                    <Star size={20} className="text-brand-gold/40 mb-4" />
                    <EditableText 
                      contentId={`profile_date_style_title_${language}`}
                      defaultText={language === 'he' ? 'סגנון דייטים מועדף' : 'Preferred Date Style'}
                      as="h4"
                      className="text-sm font-serif mb-2"
                    />
                    {isEditing ? (
                      <select 
                        value={dateStyle}
                        onChange={(e) => setDateStyle(e.target.value)}
                        className="w-full bg-transparent border-b border-brand-gold/20 py-2 focus:outline-none focus:border-brand-gold transition-all font-serif text-sm"
                      >
                        <option value="">{language === 'he' ? 'בחרו סגנון' : 'Choose style'}</option>
                        <option value="romantic">{language === 'he' ? 'רומנטי ושקט (מסעדות, יין)' : 'Romantic & Quiet'}</option>
                        <option value="adventurous">{language === 'he' ? 'הרפתקני (טיולים, אקסטרים)' : 'Adventurous'}</option>
                        <option value="chill">{language === 'he' ? 'רגוע בבית (סרטים, בישול)' : 'Chill at Home'}</option>
                        <option value="cultural">{language === 'he' ? 'תרבותי (הופעות, מוזיאונים)' : 'Cultural'}</option>
                        <option value="spontaneous">{language === 'he' ? 'ספונטני (מה שזורם)' : 'Spontaneous'}</option>
                      </select>
                    ) : (
                      <p className="text-[10px] text-brand-black/60 uppercase tracking-widest">
                        {dateStyle ? (
                          dateStyle === 'romantic' ? (language === 'he' ? 'רומנטי ושקט' : 'Romantic & Quiet') :
                          dateStyle === 'adventurous' ? (language === 'he' ? 'הרפתקני' : 'Adventurous') :
                          dateStyle === 'chill' ? (language === 'he' ? 'רגוע בבית' : 'Chill at Home') :
                          dateStyle === 'cultural' ? (language === 'he' ? 'תרבותי' : 'Cultural') :
                          dateStyle === 'spontaneous' ? (language === 'he' ? 'ספונטני' : 'Spontaneous') : dateStyle
                        ) : (language === 'he' ? 'טרם הוגדר' : 'Not defined yet')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div className="mt-20 pt-12 border-t border-brand-gold/10">
                <h3 className="text-xl font-serif mb-8 flex items-center gap-3">
                  <Bell size={24} className="text-brand-gold" />
                  <EditableText 
                    contentId={`profile_settings_title_${language}`}
                    defaultText={language === 'he' ? 'הגדרות' : 'Settings'}
                    as="span"
                  />
                </h3>
                <div className="bg-white rounded-3xl p-8 border border-brand-gold/10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <h4 className="text-sm font-serif mb-1">
                        {language === 'he' ? 'התראות דפדפן' : 'Browser Notifications'}
                      </h4>
                      <p className="text-[10px] text-brand-black/60 uppercase tracking-widest">
                        {language === 'he' ? 'קבלו עדכונים על משימות חדשות ודדליינים' : 'Get updates on new missions and deadlines'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        notificationsEnabled ? "bg-brand-gold" : "bg-brand-black/10"
                      )}
                    >
                      <motion.div
                        animate={{ x: notificationsEnabled ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Saved Places Section */}
              <div className="mt-20 pt-12 border-t border-brand-gold/10">
                <h3 className="text-xl font-serif mb-8 flex items-center gap-3">
                  <MapPin size={20} className="text-brand-gold" />
                  <EditableText 
                    contentId={`profile_saved_places_title_${language}`}
                    defaultText={language === 'he' ? 'מקומות ששמרתם' : 'Saved Places'}
                    as="span"
                  />
                </h3>
                
                {savedPlaces.length === 0 ? (
                  <div className="text-center py-12 bg-brand-cream/20 border border-dashed border-brand-gold/20 rounded-3xl">
                    <MapPin className="mx-auto mb-4 text-brand-gold/20" size={32} />
                    <p className="text-xs text-brand-black/40 italic">טרם שמרתם מקומות. תוכלו לשמור המלצות מהמפה!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPlaces.map((place) => (
                      <div key={place.id} className="bg-white border border-brand-gold/10 p-4 rounded-2xl flex gap-4 group hover:shadow-md transition-all">
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <img 
                            src={place.image_url || `https://picsum.photos/seed/${place.name}/200/200`} 
                            alt={place.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm truncate">{place.name}</h4>
                          <p className="text-[10px] text-brand-black/40 truncate mb-2">{place.address}</p>
                          <div className="flex gap-2">
                            <a 
                              href={place.maps_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-white transition-all"
                            >
                              <ExternalLink size={12} />
                            </a>
                            <button 
                              onClick={() => handleDeleteSavedPlace(place.id)}
                              className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Love Language Quiz Modal */}
      <AnimatePresence>
        {showQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-2xl relative">
              <button 
                onClick={() => setShowQuiz(false)}
                className="absolute -top-12 right-0 text-white hover:text-brand-gold transition-colors p-2"
              >
                <X size={32} />
              </button>
              <LoveLanguageQuiz />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
