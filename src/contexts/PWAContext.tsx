import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';

interface PWAContextProps {
  isInstalled: boolean;
  canBeInstalled: boolean;
  promptInstall: () => Promise<PromptResponse | null>;
}

interface PromptResponse {
  outcome: 'accepted' | 'dismissed';
  platform: string;
}

const defaultContext: PWAContextProps = {
  isInstalled: false,
  canBeInstalled: false,
  promptInstall: async () => null,
};

export const PWAContext = createContext<PWAContextProps>(defaultContext);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canBeInstalled, setCanBeInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setCanBeInstalled(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // @ts-ignore for Safari
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    );
    window.addEventListener('appinstalled', handleAppInstalled);
    checkInstalled();

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<PromptResponse | null> => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const result = await installPromptEvent.userChoice;
      setInstallPromptEvent(null);
      setCanBeInstalled(false);
      return result;
    }
    return null;
  };

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        canBeInstalled,
        promptInstall,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};



export const usePWA = (): PWAContextProps => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};


// types/global.d.ts (or somewhere in your project)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}
