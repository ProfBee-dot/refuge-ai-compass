import { usePWA } from '@/contexts/PWAContext';
import { useState } from 'react';

export const InstallDialog = () => {
    const [isOfferOpen, setOfferOpen] = useState(true);
    const { isInstalled } = usePWA();

    return (
        !isInstalled &&
            
        <div className="anime-start fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Install Refugee Support App</h2>
                <p className="text-gray-700 mb-6">
                Install the Refugee Support app to access real-time updates, resources, and support for refugees globally.
                </p>
                <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                    Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Install
                </button>
                </div>
            </div>
        </div>
    );
}

export const InstallDialogTrigger = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleInstallClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Install App
      </button>
      {isDialogOpen && <InstallDialog />}
    </>
  );
}