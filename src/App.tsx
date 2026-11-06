import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { AIChat } from './components/AIChat';
import { AccessibilityMenu } from './components/AccessibilityMenu';
import { FirebaseProvider, useFirebase } from './contexts/FirebaseContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { EditModeProvider } from './components/EditableText';
import { UIProvider } from './contexts/UIContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertProvider } from './components/AlertModal';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePushNotifications } from './hooks/usePushNotifications';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CookieConsent } from './components/CookieConsent';
import { TutorialOverlay } from './components/TutorialOverlay';
import { BRANDING } from './constants/branding';

// Lazy load pages for performance optimization
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Experience = React.lazy(() => import('./pages/Experience').then(module => ({ default: module.Experience })));
const TheJourney = React.lazy(() => import('./pages/TheJourney').then(module => ({ default: module.TheJourney })));
const Boutique = React.lazy(() => import('./pages/Boutique').then(module => ({ default: module.Boutique })));
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Games = React.lazy(() => import('./pages/Games').then(module => ({ default: module.Games })));
const RecipeDetail = React.lazy(() => import('./pages/RecipeDetail').then(module => ({ default: module.RecipeDetail })));
const About = React.lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const Admin = React.lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const NightHome = React.lazy(() => import('./pages/NightHome').then(module => ({ default: module.NightHome })));
const MissionCards = React.lazy(() => import('./pages/MissionCards').then(module => ({ default: module.MissionCards })));
const AdminTools = React.lazy(() => import('./pages/AdminTools').then(module => ({ default: module.AdminTools })));
const DateRecommendations = React.lazy(() => import('./pages/DateRecommendations'));
const CardDecks = React.lazy(() => import('./pages/CardDecks').then(module => ({ default: module.CardDecks })));
const DeckDetail = React.lazy(() => import('./pages/DeckDetail').then(module => ({ default: module.DeckDetail })));
const HealthyRelationships = React.lazy(() => import('./pages/HealthyRelationships'));
const IntimacyGuide = React.lazy(() => import('./pages/IntimacyGuide'));
const KnowledgeHub = React.lazy(() => import('./pages/KnowledgeHub'));
const EmotionalIntelligence = React.lazy(() => import('./pages/EmotionalIntelligence'));
const MarriageGuide = React.lazy(() => import('./pages/MarriageGuide'));
const WeddingPlanning = React.lazy(() => import('./pages/WeddingPlanning'));
const DateNightIdeas = React.lazy(() => import('./pages/DateNightIdeas'));
const CouplesTherapyGuide = React.lazy(() => import('./pages/CouplesTherapyGuide'));
const RelationshipTips = React.lazy(() => import('./pages/RelationshipTips'));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Orders = React.lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation').then(module => ({ default: module.OrderConfirmation })));
const Contact = React.lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const FitnessDashboard = React.lazy(() => import('./components/FitnessDashboard').then(module => ({ default: module.FitnessDashboard })));
const Updates = React.lazy(() => import('./pages/Updates'));
const Legal = React.lazy(() => import('./pages/Legal'));
const AIConsultant = React.lazy(() => import('./pages/AIConsultant'));
const Together = React.lazy(() => import('./pages/Together').then(module => ({ default: module.Together })));
const Sitemap = React.lazy(() => import('./pages/Sitemap').then(module => ({ default: module.Sitemap })));
const SpaceObservatory = React.lazy(() => import('./pages/SpaceObservatory').then(module => ({ default: module.SpaceObservatory })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-cream">
    <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
  </div>
);

const PageTitleUpdater = () => {
  const location = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    const path = location.pathname;
    let pageName = '';
    const he = language === 'he';

    switch (path) {
      case '/': pageName = t('nav.home'); break;
      case '/experience': pageName = t('nav.experience'); break;
      case '/journey': pageName = t('nav.journey'); break;
      case '/decks': pageName = t('nav.decks'); break;
      case '/contact': pageName = he ? 'צרו קשר' : 'Contact'; break;
      case '/login': pageName = he ? 'כניסה' : 'Sign in'; break;
      case '/dashboard': pageName = t('nav.dashboard'); break;
      case '/profile': pageName = t('nav.profile'); break;
      case '/about': pageName = he ? 'עלינו' : 'About'; break;
      case '/updates': pageName = t('nav.updates'); break;
      case '/legal': pageName = he ? 'תקנון ומדיניות' : 'Terms & policies'; break;
      case '/admin': pageName = he ? 'פאנל ניהול' : 'Admin'; break;
      case '/admin/tools': pageName = he ? 'כלי ניהול' : 'Admin tools'; break;
      case '/boutique': pageName = he ? 'הבוטיק' : 'Boutique'; break;
      case '/cards': pageName = he ? 'קלפי המשימה' : 'Mission cards'; break;
      case '/checkout': pageName = he ? 'קופה' : 'Checkout'; break;
      case '/orders': pageName = he ? 'ההזמנות שלי' : 'My orders'; break;
      case '/order-confirmation': pageName = he ? 'ההזמנה התקבלה' : 'Order received'; break;
      case '/ai-consultant': pageName = t('nav.ai_consultant'); break;
      case '/together': pageName = 'Beyond Together'; break;
      default: 
        if (path.startsWith('/decks/')) pageName = t('home.decks.details');
        else pageName = path.split('/').filter(Boolean).pop() || '';
    }

    document.title = `${BRANDING.name} | ${pageName}`;
  }, [location, t, language]);

  return null;
};

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <main className="flex-grow">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <MobileBottomNav />
      <AIChat />
      <AccessibilityMenu />
      <CookieConsent />
      <TutorialOverlay />
      <Footer />
    </div>
  );
};

import { useTheme } from './contexts/ThemeContext';

const ProfileSync = () => {
  const { profile } = useFirebase();
  const { setLanguage } = useLanguage();
  const { setFontSize } = useTheme();

  useEffect(() => {
    if (profile) {
      if (profile.language) setLanguage(profile.language as any);
      // The season design has one palette; an old saved 'dark' choice is ignored.
      if (profile.fontSize) setFontSize(profile.fontSize as any);
    }
  }, [profile, setLanguage, setFontSize]);

  return null;
};

const AppContent = () => {
  const { loading } = useFirebase();
  usePushNotifications();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Router>
      <ProfileSync />
      <PageTitleUpdater />
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/journey" element={<TheJourney />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Navigate to="/dashboard#profile" replace />} />
            <Route path="/games" element={<Games />} />
            <Route path="/decks" element={<CardDecks />} />
            <Route path="/decks/:id" element={<DeckDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/fitness" element={<FitnessDashboard />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/recipe" element={<RecipeDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/tools" element={<AdminTools />} />
            <Route path="/cards" element={<MissionCards />} />
            <Route path="/preview/night" element={<NightHome />} />
            <Route path="/date-recommendations" element={<DateRecommendations />} />
            <Route path="/healthy-relationships" element={<HealthyRelationships />} />
            <Route path="/relationship-tips" element={<RelationshipTips />} />
            <Route path="/intimacy-guide" element={<IntimacyGuide />} />
            <Route path="/knowledge-hub" element={<KnowledgeHub />} />
            <Route path="/emotional-intelligence" element={<EmotionalIntelligence />} />
            <Route path="/marriage-guide" element={<MarriageGuide />} />
            <Route path="/wedding-planning" element={<WeddingPlanning />} />
            <Route path="/date-night-ideas" element={<DateNightIdeas />} />
            <Route path="/couples-therapy" element={<CouplesTherapyGuide />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/together" element={<Together />} />
            <Route path="/ai-consultant" element={<AIConsultant />} />
            <Route path="/concierge" element={<AIConsultant />} />
            <Route path="/observatory" element={<SpaceObservatory />} />
            <Route path="/sitemap" element={<Sitemap />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AlertProvider>
        <ThemeProvider>
          <LanguageProvider>
            <FirebaseProvider>
              <SiteConfigProvider>
                <EditModeProvider>
                  <CartProvider>
                    <UIProvider>
                      <AppContent />
                    </UIProvider>
                  </CartProvider>
                </EditModeProvider>
              </SiteConfigProvider>
            </FirebaseProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AlertProvider>
    </ErrorBoundary>
  );
}
