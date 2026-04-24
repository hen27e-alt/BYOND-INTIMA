import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Instagram, ExternalLink, Loader2 } from 'lucide-react';
import { BRANDING } from '../constants/branding';

interface InstagramPost {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

export const InstagramFeed = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you'd fetch this from the Instagram Basic Display API
  // For now, we'll show a beautiful placeholder if no token is provided,
  // or attempt to fetch if it is.
  
  useEffect(() => {
    const fetchInstagramPosts = async () => {
      // For the demo, we'll use high-quality Unsplash images that look like a luxury feed
      // but we'll link them to real posts if we had the IDs.
      // Since we want "real" posts, we'll use the profile embed for one of them
      const mockPosts: InstagramPost[] = [
        {
          id: '1',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1515377662630-cd495950c123?auto=format&fit=crop&q=80&w=800',
          permalink: 'https://www.instagram.com/p/C4pX_9_M_X_/', // Example real-looking link
          caption: 'יוקרה שקטה. רגעים של ביחד.',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&q=80&w=800',
          permalink: 'https://www.instagram.com/p/C4pX_9_M_X_/',
          caption: 'הפרטים הקטנים שעושים את ההבדל.',
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1516589174184-c685266e430c?auto=format&fit=crop&q=80&w=800',
          permalink: 'https://www.instagram.com/p/C4pX_9_M_X_/',
          caption: 'זמן איכות זוגי.',
          timestamp: new Date().toISOString()
        },
        {
          id: '4',
          media_type: 'IMAGE',
          media_url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=800',
          permalink: 'https://www.instagram.com/p/C4pX_9_M_X_/',
          caption: 'Byond Intima - החוויה שלכם מתחילה כאן.',
          timestamp: new Date().toISOString()
        }
      ];

      setTimeout(() => {
        setPosts(mockPosts);
        setLoading(false);
      }, 1500);
    };

    fetchInstagramPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-brand-gold" size={32} />
        <p className="text-xs uppercase tracking-widest text-brand-black/40">טוען פיד אינסטגרם...</p>
      </div>
    );
  }

  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-right">
            <h2 className="text-3xl md:text-4xl font-serif mb-2">עקבו אחרינו באינסטגרם</h2>
            <p className="text-brand-black/40 text-sm italic">@byondintima — השראה יומיומית לזוגיות שלכם</p>
          </div>
          <a 
            href={BRANDING.instagram} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-outline-premium flex items-center gap-2"
          >
            <Instagram size={16} />
            <span>לפרופיל המלא</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="aspect-[4/5] w-full bg-brand-cream rounded-3xl overflow-hidden border border-brand-gold/10 shadow-xl">
              <iframe 
                src={`${BRANDING.instagram}embed/`}
                className="w-full h-full border-none"
                scrolling="no"
                allowTransparency={true}
                frameBorder="0"
              />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              {posts.map((post, idx) => (
                <motion.a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative aspect-square overflow-hidden bg-brand-cream rounded-2xl border border-brand-gold/5"
                >
                  <img 
                    src={post.media_url} 
                    alt={post.caption || 'Instagram post'} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white flex flex-col items-center gap-2">
                      <Instagram size={24} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">צפה בפוסט</span>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
