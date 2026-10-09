export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/** Curated Azure Translator-compatible language codes. Not locale-specific speech voices. */
export const LANGUAGES: readonly Language[] = [
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: 'ZA' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'SA' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: 'BD' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: 'BG' },
  { code: 'zh-Hans', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: 'CN' },
  { code: 'zh-Hant', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: 'TW' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: 'HR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: 'CZ' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: 'DK' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: 'NL' },
  { code: 'en', name: 'English', nativeName: 'English', flag: 'GB' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: 'EE' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: 'FI' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: 'DE' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: 'GR' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: 'IL' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'IN' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: 'HU' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: 'ID' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: 'IT' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: 'JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: 'KR' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: 'LV' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: 'LT' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: 'MY' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: 'NO' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: 'IR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: 'PL' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: 'PT' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: 'RO' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: 'RU' },
  { code: 'sr-Cyrl', name: 'Serbian (Cyrillic)', nativeName: 'Српски', flag: 'RS' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: 'SK' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: 'KE' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: 'SE' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: 'IN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: 'TH' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: 'TR' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: 'UA' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: 'PK' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: 'VN' },
] as const;

export const LANGUAGE_CODES = new Set<string>(LANGUAGES.map(language => language.code));
export const languageByCode = (code: string) => LANGUAGES.find(language => language.code.toLowerCase() === code.toLowerCase());
export const languageName = (code: string) => code === 'auto' ? 'Auto detect' : languageByCode(code)?.name ?? code;
export const TEXT_LIMIT = 5000;
