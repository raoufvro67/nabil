import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { T, type Lang, type Translations } from './i18n';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangCtx>({ lang: 'fr', setLang: () => {}, t: T.fr });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang | null) ?? 'fr'
  );

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.dir  = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  useEffect(() => {
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] as Translations }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
