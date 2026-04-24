import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { BRANDING } from '../constants/branding';

interface SiteConfig {
  globalAvatar?: string;
  siteName?: string;
  conciergeName?: string;
  greetingVideoUrl?: string;
}

interface SiteConfigContextType {
  config: SiteConfig;
  loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>({
    globalAvatar: BRANDING.avatarUrl,
    siteName: BRANDING.name,
    conciergeName: BRANDING.conciergeName,
    greetingVideoUrl: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'site_content', 'global_config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          globalAvatar: data.globalAvatar || BRANDING.avatarUrl,
          siteName: data.siteName || BRANDING.name,
          conciergeName: data.conciergeName || BRANDING.conciergeName,
          greetingVideoUrl: data.greetingVideoUrl || ''
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching site config:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
