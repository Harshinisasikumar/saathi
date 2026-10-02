import { createContext, useContext, useState, type ReactNode } from 'react';
import { LanguageNames } from '../i18n';
import type { Lang } from '../types';

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  other: Lang;
}

const Ctx = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('saathi_lang') === 'ta' ? 'ta' : 'en'));
  const update = (l: Lang) => {
    setLang(l);
    localStorage.setItem('saathi_lang', l);
  };
  return (
    <Ctx.Provider
      value={{
        lang,
        setLang: update,
        toggle: () => update(lang === 'en' ? 'ta' : 'en'),
        other: lang === 'en' ? 'ta' : 'en',
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}

export { LanguageNames };