import { createContext, useContext, useState, type FC, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'he' | 'en';

interface AppContextType {
  theme: Theme;
  language: Language;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  language: 'he',
  setTheme: () => {},
  setLanguage: () => {},
});

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('he');

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  };

  return (
    <AppContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppSettings = () => useContext(AppContext);
