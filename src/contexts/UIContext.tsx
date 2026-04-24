import React, { createContext, useContext, useState } from 'react';

interface AccessibilitySettings {
  fontSize: string;
  highContrast: boolean;
  grayscale: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
  largeCursor: boolean;
  fontFamily: 'serif' | 'sans' | 'mono' | 'dyslexic';
  baseSize: number;
}

interface UIContextType {
  isMoodMatcherOpen: boolean;
  setIsMoodMatcherOpen: (open: boolean) => void;
  isAIChatOpen: boolean;
  setIsAIChatOpen: (open: boolean) => void;
  isAccessibilityMenuOpen: boolean;
  setIsAccessibilityMenuOpen: (open: boolean) => void;
  isPurchaseMode: boolean;
  setIsPurchaseMode: (active: boolean) => void;
  accessibilitySettings: AccessibilitySettings;
  setAccessibilitySettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMoodMatcherOpen, setIsMoodMatcherOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);
  const [isPurchaseMode, setIsPurchaseMode] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    grayscale: false,
    underlineLinks: false,
    readableFont: false,
    largeCursor: false,
    fontFamily: 'serif',
    baseSize: 16,
  });

  return (
    <UIContext.Provider value={{ 
      isMoodMatcherOpen, 
      setIsMoodMatcherOpen,
      isAIChatOpen,
      setIsAIChatOpen,
      isAccessibilityMenuOpen,
      setIsAccessibilityMenuOpen,
      isPurchaseMode,
      setIsPurchaseMode,
      accessibilitySettings,
      setAccessibilitySettings
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
