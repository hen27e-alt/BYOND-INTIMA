import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Play, Info, X, Heart, Star, CheckCircle, 
  ChevronLeft, ChevronRight, Filter, Clock, Calendar,
  MessageCircle, Pause, Zap, Award, Film, Sparkles
} from 'lucide-react';
import { GOLDEN_LIBRARY } from '../constants/movies';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  videos?: { key: string; site: string; type: string }[];
}

interface UserMovieData {
  movie_id: number;
  watched: boolean;
  rating: number;
  user_notes: string;
  watch_date: string;
  is_favorite: boolean;
}

// Custom Couple Layer Data (Mocked for demo, could be in DB)
const coupleInsights: Record<number, {
  why: string;
  question: string;
  pause_at?: string;
  depth: 1 | 2 | 3;
}> = {
  // Example IDs (will be matched dynamically or default)
  550: { why: "סרט שבוחן את גבולות המציאות והזהות, מעורר שיח על מה באמת חשוב בחיים.", question: "אם הייתם יכולים לשנות דבר אחד בעבר שלכם כזוג, מה זה היה?", depth: 3 },
  299534: { why: "אקשן סוחף שמראה שגם הגיבורים הכי גדולים צריכים אחד את השני.", question: "מי ה'גיבור' במערכת היחסים שלכם ברגעים קשים?", depth: 1 },
};

const getCoupleInsight = (movieId: number) => {
  return coupleInsights[movieId] || {
    why: "סרט המאפשר זמן איכות משותף וחיבור רגשי דרך סיפור סוחף.",
    question: "מה היה הרגע שהכי נגע בכם בסרט ולמה?",
    depth: 2
  };
};

export const MovieLibrary = () => {
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [romance, setRomance] = useState<Movie[]>([]);
  const [drama, setDrama] = useState<Movie[]>([]);
  const [action, setAction] = useState<Movie[]>([]);
  const [horror, setHorror] = useState<Movie[]>([]);
  const [goldenMovies, setGoldenMovies] = useState<Record<string, Movie[]>>({});
  const [dailyPick, setDailyPick] = useState<Movie | null>(null);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [userMovies, setUserMovies] = useState<Record<number, UserMovieData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    genre: '',
    depth: 0,
    watchedStatus: 'all' as 'all' | 'watched' | 'unwatched'
  });

  const userId = "demo-user"; // In real app, get from auth

  useEffect(() => {
    fetchInitialData();
    fetchUserMovies();
    fetchGoldenLibrary();
  }, []);

  const fetchGoldenLibrary = async () => {
    const categories = Object.keys(GOLDEN_LIBRARY);
    
    // Get Daily Pick
    const allMovies = Object.values(GOLDEN_LIBRARY).flat();
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const dailyTitle = allMovies[dayOfYear % allMovies.length];
    
    try {
      // Fetch Daily Pick
      const dailyRes = await fetch(`/api/movies/search?query=${encodeURIComponent(dailyTitle)}`);
      const dailyData = await dailyRes.json();
      if (dailyData.results && dailyData.results.length > 0) {
        setDailyPick(dailyData.results[0]);
      }

      // Parallelize fetching categories for better performance
      const categoryPromises = categories.map(async (cat) => {
        const titles = GOLDEN_LIBRARY[cat as keyof typeof GOLDEN_LIBRARY].slice(0, 5);
        const moviePromises = titles.map(async (title) => {
          try {
            const res = await fetch(`/api/movies/search?query=${encodeURIComponent(title)}`);
            const data = await res.json();
            return data.results && data.results.length > 0 ? data.results[0] : null;
          } catch (e) {
            return null;
          }
        });
        const movies = (await Promise.all(moviePromises)).filter((m): m is Movie => m !== null);
        return { cat, movies };
      });

      const resultsArray = await Promise.all(categoryPromises);
      const results: Record<string, Movie[]> = {};
      resultsArray.forEach(({ cat, movies }) => {
        results[cat] = movies;
      });
      
      setGoldenMovies(results);
    } catch (error) {
      console.error("Error fetching golden library:", error);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [pop, top, rom, dra, act, hor] = await Promise.all([
        fetch('/api/movies/popular').then(res => res.json()),
        fetch('/api/movies/top_rated').then(res => res.json()),
        fetch('/api/movies/genre/10749').then(res => res.json()), // Romance
        fetch('/api/movies/genre/18').then(res => res.json()),    // Drama
        fetch('/api/movies/genre/28').then(res => res.json()),    // Action
        fetch('/api/movies/genre/27').then(res => res.json())     // Horror
      ]);

      setPopular(pop.results || []);
      setTopRated(top.results || []);
      setRomance(rom.results || []);
      setDrama(dra.results || []);
      setAction(act.results || []);
      setHorror(hor.results || []);
      
      if (pop.results && pop.results.length > 0) {
        setHeroMovie(pop.results[0]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setIsLoading(false);
    }
  };

  const fetchUserMovies = async () => {
    try {
      const res = await fetch(`/api/user/movies?user_id=${userId}`);
      const data = await res.json();
      const movieMap: Record<number, UserMovieData> = {};
      data.forEach((m: any) => {
        movieMap[m.movie_id] = {
          movie_id: m.movie_id,
          watched: !!m.watched,
          rating: m.rating,
          user_notes: m.user_notes,
          watch_date: m.watch_date,
          is_favorite: !!m.is_favorite
        };
      });
      setUserMovies(movieMap);
    } catch (error) {
      console.error("Error fetching user movies:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const openMovieDetails = async (movieId: number) => {
    try {
      const res = await fetch(`/api/movies/details/${movieId}`);
      const data = await res.json();
      setSelectedMovie(data);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const updateUserMovie = async (movieId: number, updates: Partial<UserMovieData>) => {
    const current = userMovies[movieId] || {
      movie_id: movieId,
      watched: false,
      rating: 0,
      user_notes: '',
      watch_date: '',
      is_favorite: false
    };
    
    const updated = { ...current, ...updates };
    
    try {
      await fetch('/api/user/movies/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updated, user_id: userId })
      });
      setUserMovies(prev => ({ ...prev, [movieId]: updated }));
    } catch (error) {
      console.error("Error updating movie data:", error);
    }
  };

  const MovieRow = ({ title, movies }: { title: string, movies: Movie[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth } = scrollRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };

    const filteredMovies = movies.filter(m => {
      const userData = userMovies[m.id];
      if (activeFilters.watchedStatus === 'watched' && !userData?.watched) return false;
      if (activeFilters.watchedStatus === 'unwatched' && userData?.watched) return false;
      if (activeFilters.depth > 0 && getCoupleInsight(m.id).depth !== activeFilters.depth) return false;
      return true;
    });

    if (filteredMovies.length === 0) return null;

    return (
      <div className="mb-12 group/row relative">
        <h3 className="text-xl font-medium text-white/90 mb-4 px-4 md:px-12">{title}</h3>
        <div className="relative">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronLeft size={32} />
          </button>
          <div 
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          >
            {filteredMovies.map(movie => (
              <motion.div 
                key={movie.id}
                whileHover={{ scale: 1.05, zIndex: 20 }}
                onClick={() => openMovieDetails(movie.id)}
                className="flex-none w-40 md:w-56 aspect-[2/3] bg-zinc-900 rounded-sm overflow-hidden cursor-pointer relative group/card"
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <h4 className="text-white text-sm font-bold mb-1">{movie.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-brand-gold">
                    <span>{movie.release_date?.split('-')[0]}</span>
                    <span>•</span>
                    <span>{movie.vote_average.toFixed(1)} ⭐</span>
                  </div>
                  {userMovies[movie.id]?.watched && (
                    <div className="absolute top-2 right-2 bg-brand-gold text-black p-1 rounded-full">
                      <CheckCircle size={12} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black/50 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    );
  };

  const watchedCount = (Object.values(userMovies) as UserMovieData[]).filter(m => m.watched).length;
  
  useEffect(() => {
    localStorage.setItem('watchedMoviesCount', watchedCount.toString());
    window.dispatchEvent(new Event('storage'));
  }, [watchedCount]);

  const progressPercent = Math.min((watchedCount / 15) * 100, 100);

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-brand-gold/30">
      {/* Hero Section */}
      {heroMovie && !searchQuery && (
        <div className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
              alt={heroMovie.title}
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-8 md:p-24 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-7xl font-bold mb-4">{heroMovie.title}</h1>
              <p className="text-lg text-white/70 mb-8 line-clamp-3">{heroMovie.overview}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => openMovieDetails(heroMovie.id)}
                  className="bg-white text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/80 transition-colors"
                >
                  <Play size={20} fill="currentColor" /> צפייה בפרטים
                </button>
                <button 
                  onClick={() => openMovieDetails(heroMovie.id)}
                  className="bg-zinc-600/50 text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-zinc-600/80 transition-colors backdrop-blur-md"
                >
                  <Info size={20} /> מידע נוסף
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Daily Pick Section */}
      {dailyPick && !searchQuery && (
        <div className="px-4 md:px-12 py-8">
          <div className="bg-gradient-to-r from-brand-gold/20 to-zinc-900 rounded-2xl border border-brand-gold/30 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={120} className="text-brand-gold" />
            </div>
            
            <div className="w-48 md:w-64 aspect-[2/3] flex-none rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={`https://image.tmdb.org/t/p/w500${dailyPick.poster_path}`} 
                alt={dailyPick.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-grow space-y-4 text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-2 text-brand-gold text-xs uppercase tracking-[0.3em] font-bold">
                <Calendar size={14} /> הבחירה היומית שלנו
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">{dailyPick.title}</h2>
              <p className="text-white/70 line-clamp-3 max-w-2xl">{dailyPick.overview}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <button 
                  onClick={() => openMovieDetails(dailyPick.id)}
                  className="bg-brand-gold text-black px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white transition-colors"
                >
                  <Play size={18} fill="currentColor" /> צפו עכשיו
                </button>
                <button 
                  onClick={() => openMovieDetails(dailyPick.id)}
                  className="bg-white/10 text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Info size={18} /> פרטים נוספים
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation & Search */}
      <div className={`sticky top-0 z-40 transition-all duration-500 px-4 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4 ${heroMovie && !searchQuery ? 'bg-transparent' : 'bg-black shadow-2xl'}`}>
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-bold text-brand-gold tracking-tighter flex items-center gap-2">
            <Film className="text-brand-gold" /> BYOND CINEMA
          </h2>
          <div className="hidden md:flex gap-6 text-sm font-medium text-white/60">
            <button onClick={() => setSearchQuery('')} className="hover:text-white transition-colors">בית</button>
            <button className="hover:text-white transition-colors">סדרות</button>
            <button className="hover:text-white transition-colors">סרטים</button>
            <button className="hover:text-white transition-colors">הכי נצפים</button>
            <button className="hover:text-white transition-colors">הרשימה שלי</button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="חיפוש סרטים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900/80 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-gold/50 w-full md:w-64"
            />
          </form>
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-full bg-brand-gold flex items-center justify-center text-black font-bold text-xs">
               {watchedCount}
             </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-4 md:px-12 py-4 flex flex-wrap gap-4 items-center bg-zinc-900/30 border-b border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest">
          <Filter size={14} /> סינון:
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase">רמת עומק:</span>
          <select 
            value={activeFilters.depth}
            onChange={(e) => setActiveFilters(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
            className="bg-black border border-white/10 rounded px-3 py-1 text-xs focus:outline-none focus:border-brand-gold/50"
          >
            <option value="0">הכל</option>
            <option value="1">עומק 1 - קליל</option>
            <option value="2">עומק 2 - בינוני</option>
            <option value="3">עומק 3 - עמוק</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 uppercase">סטטוס צפייה:</span>
          <div className="flex bg-black border border-white/10 rounded overflow-hidden">
            {(['all', 'watched', 'unwatched'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilters(prev => ({ ...prev, watchedStatus: status }))}
                className={`px-3 py-1 text-[10px] uppercase transition-all ${
                  activeFilters.watchedStatus === status 
                    ? 'bg-brand-gold text-black font-bold' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'הכל' : status === 'watched' ? 'צפינו' : 'לא צפינו'}
              </button>
            ))}
          </div>
        </div>

        {(activeFilters.depth > 0 || activeFilters.watchedStatus !== 'all') && (
          <button 
            onClick={() => setActiveFilters({ genre: '', depth: 0, watchedStatus: 'all' })}
            className="text-[10px] uppercase tracking-widest text-brand-gold hover:text-white transition-colors"
          >
            איפוס מסננים
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 md:px-12 py-6">
        <div className="bg-zinc-900 p-6 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-gold/10 rounded-full">
              <Award className="text-brand-gold" size={24} />
            </div>
            <div>
              <h4 className="font-bold">התקדמות קולנוע זוגי</h4>
              <p className="text-xs text-white/40">צפו ב-15 סרטים כדי לזכות במדליית העומק</p>
            </div>
          </div>
          <div className="flex-grow max-w-md w-full">
            <div className="flex justify-between text-[10px] uppercase tracking-widest mb-2">
              <span>{watchedCount} סרטים</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {[3, 7, 15].map(milestone => (
              <div key={milestone} className={`w-10 h-10 rounded-full flex items-center justify-center border ${watchedCount >= milestone ? 'bg-brand-gold border-brand-gold text-black' : 'border-white/10 text-white/20'}`}>
                {milestone === 3 ? <Zap size={16} /> : milestone === 7 ? <Star size={16} /> : <Award size={16} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-24">
        {searchQuery ? (
          <div className="px-4 md:px-12 pt-8">
            <h3 className="text-2xl font-bold mb-8">תוצאות חיפוש עבור "{searchQuery}"</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults
                .filter(movie => {
                  const userData = userMovies[movie.id];
                  if (activeFilters.watchedStatus === 'watched' && !userData?.watched) return false;
                  if (activeFilters.watchedStatus === 'unwatched' && userData?.watched) return false;
                  if (activeFilters.depth > 0 && getCoupleInsight(movie.id).depth !== activeFilters.depth) return false;
                  return true;
                })
                .map(movie => (
                <motion.div 
                  key={movie.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => openMovieDetails(movie.id)}
                  className="aspect-[2/3] bg-zinc-900 rounded-sm overflow-hidden cursor-pointer relative group"
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <h4 className="text-white text-sm font-bold">{movie.title}</h4>
                    <p className="text-[10px] text-white/60">{movie.release_date?.split('-')[0]}</p>
                    {userMovies[movie.id]?.watched && (
                      <div className="absolute top-2 right-2 bg-brand-gold text-black p-1 rounded-full">
                        <CheckCircle size={12} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {searchResults.length > 0 && searchResults.filter(m => {
              const userData = userMovies[m.id];
              if (activeFilters.watchedStatus === 'watched' && !userData?.watched) return false;
              if (activeFilters.watchedStatus === 'unwatched' && userData?.watched) return false;
              if (activeFilters.depth > 0 && getCoupleInsight(m.id).depth !== activeFilters.depth) return false;
              return true;
            }).length === 0 && (
              <p className="text-white/40 text-center py-12">אין תוצאות התואמות את המסננים שנבחרו.</p>
            )}
          </div>
        ) : (
          <>
            <div className="mb-16">
              <div className="px-4 md:px-12 mb-8">
                <h2 className="text-3xl font-bold text-brand-gold flex items-center gap-3">
                  <Award /> ספריית הזהב: Beyond Cinema (Top Picks)
                </h2>
                <p className="text-white/40 text-sm mt-2">הסרטים הגדולים ביותר שנבחרו במיוחד עבורכם</p>
              </div>
              
              {goldenMovies.drama && <MovieRow title="🎭 דרמה - הנבחרים" movies={goldenMovies.drama} />}
              {goldenMovies.comedy && <MovieRow title="😂 קומדיה - הנבחרים" movies={goldenMovies.comedy} />}
              {goldenMovies.action && <MovieRow title="💥 פעולה - הנבחרים" movies={goldenMovies.action} />}
              {goldenMovies.romance && <MovieRow title="💕 רומנטיקה - הנבחרים" movies={goldenMovies.romance} />}
              {goldenMovies.horror && <MovieRow title="😱 אימה - הנבחרים" movies={goldenMovies.horror} />}
            </div>

            <MovieRow title="פופולרי עכשיו" movies={popular} />
            <MovieRow title="מומלץ לזוגות" movies={romance} />
            <MovieRow title="דירוג גבוה" movies={topRated} />
            <MovieRow title="דרמה ורגש" movies={drama} />
            <MovieRow title="פעולה ואקשן" movies={action} />
            <MovieRow title="אימה ומתח" movies={horror} />
          </>
        )}
      </div>

      {/* Movie Detail Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedMovie(null)} />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 relative z-10 shadow-2xl scrollbar-hide"
            >
              <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black transition-colors"
              >
                <X size={24} />
              </button>

              {/* Modal Header / Trailer */}
              <div className="aspect-video w-full bg-black relative">
                {selectedMovie.videos && selectedMovie.videos.length > 0 ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${selectedMovie.videos.find(v => v.type === 'Trailer')?.key || selectedMovie.videos[0].key}?autoplay=1&mute=1`}
                    className="w-full h-full"
                    title="Trailer"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <img 
                    src={`https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`} 
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-zinc-900 to-transparent" />
              </div>

              <div className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-12">
                  {/* Left Column: Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <h2 className="text-3xl md:text-5xl font-bold">{selectedMovie.title}</h2>
                      <div className="flex items-center gap-1 text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full text-sm font-bold">
                        <Star size={14} fill="currentColor" /> {selectedMovie.vote_average.toFixed(1)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-white/50 mb-8">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {selectedMovie.release_date}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> {selectedMovie.runtime} דק'</span>
                      <div className="flex gap-2">
                        {selectedMovie.genres?.map(g => (
                          <span key={g.id} className="border border-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">{g.name}</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-lg leading-relaxed text-white/80 mb-12">{selectedMovie.overview}</p>

                    {/* Couple Layer Section */}
                    <div className="space-y-8">
                      <div className="p-6 bg-brand-gold/5 border border-brand-gold/20 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Heart size={80} className="text-brand-gold" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 text-brand-gold mb-4">
                            <Zap size={20} />
                            <h4 className="text-sm tracking-[0.2em] uppercase font-bold">למה זה טוב לזוגיות?</h4>
                          </div>
                          <p className="text-white/90 italic leading-relaxed">
                            {getCoupleInsight(selectedMovie.id).why}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 bg-zinc-800/50 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3 text-white/60 mb-4">
                          <MessageCircle size={20} />
                          <h4 className="text-sm tracking-[0.2em] uppercase font-bold">שאלה לשיחה לאחר הצפייה</h4>
                        </div>
                        <p className="text-white/90 font-medium">
                          {getCoupleInsight(selectedMovie.id).question}
                        </p>
                      </div>

                      {getCoupleInsight(selectedMovie.id).pause_at && (
                        <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-white/5">
                          <Pause className="text-brand-gold" size={20} />
                          <span className="text-sm">עצירה מודרכת בדקה: <strong className="text-brand-gold">{getCoupleInsight(selectedMovie.id).pause_at}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: User Actions */}
                  <div className="w-full md:w-80 space-y-6">
                    <div className="bg-black/40 p-6 rounded-xl border border-white/5 space-y-6">
                      <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">הסטטוס שלכם</h4>
                      
                      <button 
                        onClick={() => updateUserMovie(selectedMovie.id, { watched: !userMovies[selectedMovie.id]?.watched, watch_date: new Date().toISOString().split('T')[0] })}
                        className={`w-full py-3 rounded-md font-bold flex items-center justify-center gap-2 transition-all ${userMovies[selectedMovie.id]?.watched ? 'bg-brand-gold text-black' : 'bg-white text-black hover:bg-brand-gold'}`}
                      >
                        {userMovies[selectedMovie.id]?.watched ? <><CheckCircle size={20} /> צפינו!</> : <><Play size={20} fill="currentColor" /> סמנו כנצפה</>}
                      </button>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">הדירוג שלכם</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button 
                              key={star}
                              onClick={() => updateUserMovie(selectedMovie.id, { rating: star })}
                              className="transition-transform hover:scale-125"
                            >
                              <Heart 
                                size={24} 
                                className={star <= (userMovies[selectedMovie.id]?.rating || 0) ? 'text-brand-gold fill-brand-gold' : 'text-white/20'} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-white/40">הערות זוגיות</p>
                        <textarea 
                          value={userMovies[selectedMovie.id]?.user_notes || ''}
                          onChange={(e) => updateUserMovie(selectedMovie.id, { user_notes: e.target.value })}
                          placeholder="כתבו כאן משהו שתרצו לזכור מהסרט..."
                          className="w-full bg-zinc-900 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:border-brand-gold/50 h-24 resize-none"
                        />
                      </div>

                      {userMovies[selectedMovie.id]?.watched && (
                        <div className="pt-4 border-t border-white/10 text-[10px] text-white/30 flex justify-between">
                          <span>תאריך צפייה:</span>
                          <span>{userMovies[selectedMovie.id]?.watch_date}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => updateUserMovie(selectedMovie.id, { is_favorite: !userMovies[selectedMovie.id]?.is_favorite })}
                        className={`flex-grow py-3 rounded-md border font-bold flex items-center justify-center gap-2 transition-all ${userMovies[selectedMovie.id]?.is_favorite ? 'border-brand-gold text-brand-gold bg-brand-gold/10' : 'border-white/20 text-white hover:border-white'}`}
                      >
                        <Heart size={18} fill={userMovies[selectedMovie.id]?.is_favorite ? "currentColor" : "none"} /> מועדפים
                      </button>
                      <button className="p-3 rounded-md border border-white/20 text-white hover:border-white">
                        <Filter size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
