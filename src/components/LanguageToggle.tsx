import { useI18n, Lang } from '../lib/i18n';

const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'ta', label: 'Tamil', native: 'த' },
  { code: 'hi', label: 'Hindi', native: 'हि' },
  { code: 'kn', label: 'Kannada', native: 'ಕ' },
];

export const LanguageToggle = () => {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center gap-1 bg-agri-earth-100 p-0.5 rounded-xl">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.label}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-agri-green-600 text-white shadow-sm'
              : 'text-agri-earth-500 hover:text-agri-earth-800'
          }`}
        >
          {l.native}
        </button>
      ))}
    </div>
  );
};
