import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Experience } from './pages/Experience';
import { TheJourney } from './pages/TheJourney';
import { Dashboard } from './pages/Dashboard';
import { RecipeDetail } from './pages/RecipeDetail';
import { About } from './pages/About';
import { ScrollToTop } from './components/ScrollToTop';
import { DisclaimerModal } from './components/DisclaimerModal';
import { AIChat } from './components/AIChat';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <DisclaimerModal />
      <div className="min-h-screen flex flex-col selection:bg-brand-gold/20">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/journey" element={<TheJourney />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recipe" element={<RecipeDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <AIChat />
        <Footer />
      </div>
    </Router>
  );
}
