import { useLanguage, getLanguageName, type Language } from '@/lib/i18n';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact' | 'button';
}

export function LanguageSelector({ className = '', variant = 'default' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  
  const languages: Language[] = ['en', 'fr', 'ar'];
  
  if (variant === 'button') {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className={`w-auto px-3 py-2 h-10 bg-primary border border-primary rounded-lg font-semibold text-white hover:bg-primary/90 transition-colors ${className}`}>
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue>
            {getLanguageName(language)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {getLanguageName(lang)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  
  if (variant === 'compact') {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className={`w-16 h-8 p-1 text-white border-white/20 ${className}`}>
          <SelectValue>
            {language.toUpperCase()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-40">
          <SelectValue>
            {getLanguageName(language)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {getLanguageName(lang)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}