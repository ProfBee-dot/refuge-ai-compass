import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useUser } from "@/hooks/useUserContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { LoginModal } from "./LoginModal";
import { useState } from "react";
import { Badge } from "./ui/badge";


const devMode = import.meta.env.DEV;

export const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isLoggedIn } = useUser();
  
  const currentLang =  document.getElementsByTagName("html")[0].getAttribute("lang") ?? "en";
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang || "en");

  const languages = [
    { code: "en", name: "English" },
    { code: "ar", name: "العربية" },
    { code: "fa", name: "فارسی" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm w-full border-b border-blue-100 px-6 py-4 sticky top-0 z-50 animate-fade-in">
      <div className="flex items-center justify-between w-full mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
            {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div> */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-lg transition-all duration-300">
              <img src="/logo.png" alt="RefugeeAid Logo" style={{objectFit: "cover"}} className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              RefugeeAid
            </h1>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors animate-pulse">
            Global Relief Network
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          
          <label className="hidden md:flex items-center space-x-2 text-primary hover:scale-105 transition-all duration-300">
            <Globe className="w-4 h-4 mr-2" />
            {/* <Languages className="w-4 h-4 text-gray-500" /> */}
            <select 
              value={selectedLanguage} 
              onChange={(e) => changeLanguage(e.target.value)}
              className="text-sm border rounded-md px-2 py-1"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name.toUpperCase()}</option>
              ))}
            </select>
          </label>
          
          {isLoggedIn ? (
            <UserProfileDropdown />
          ) : (
            <Button 
              onClick={() => setIsLoginOpen(true)}
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Sign In
            </Button>
    
          )}
        </div>
      </div>
      
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );

  function changeLanguage(newLang: string){
    localStorage.setItem("selectedLanguage", selectedLanguage);
    // Optionally, you can also trigger a page reload or update the UI to reflect the language change
    setSelectedLanguage(newLang);
    // doesnt work in dev mode
    if (devMode) {
      document.getElementsByTagName("html")[0].setAttribute("lang", newLang);
      alert(`Language changed to ${newLang.toUpperCase()}. This feature is not available in development mode.`);

    } else {
      // Redirect to Google Translate with the selected language
      translatePage(newLang);
    }
  }
};


const host = import.meta.env.VITE_HOST || "https://refuge-ai-compass-47.vercel.app";

function translatePage(languageCode: string) {
  const url = new URL(host + window.location.pathname);
  url.searchParams.set('hl', languageCode);
  
  // Redirect to Google Translate with the selected language
  window.location.href = `https://translate.google.com/translate?sl=auto&tl=${languageCode}&u=${encodeURIComponent(url.toString())}`;
}