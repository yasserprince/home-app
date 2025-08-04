import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇩🇿' },
];

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
  variant?: 'full' | 'compact';
  className?: string;
}

export function LanguageSelector({ 
  currentLanguage = 'en', 
  onLanguageChange,
  variant = 'compact',
  className = ""
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  
  const currentLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];
  
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageChange?.(languageCode);
    // Store in localStorage for persistence and reload page to apply changes
    localStorage.setItem('preferredLanguage', languageCode);
    window.location.reload();
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-white hover:bg-white/10 px-2 ${className}`}
          >
            <span className="text-lg mr-1">{currentLang.flag}</span>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-2 cursor-pointer ${
                selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {languages.map((language) => (
        <Button
          key={language.code}
          variant={selectedLanguage === language.code ? "default" : "ghost"}
          size="sm"
          onClick={() => handleLanguageChange(language.code)}
          className={`flex items-center gap-1 text-white hover:bg-white/10 ${
            selectedLanguage === language.code ? 'bg-white/20' : ''
          }`}
        >
          <span className="text-sm">{language.flag}</span>
          <span className="text-xs">{language.name}</span>
        </Button>
      ))}
    </div>
  );
}