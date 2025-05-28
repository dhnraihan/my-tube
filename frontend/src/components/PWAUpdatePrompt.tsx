import React, { useEffect, useState } from 'react';
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';

const PWAUpdatePrompt: React.FC = () => {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: registration => {
        setShowReload(true);
        setWaitingWorker(registration.waiting);
      }
    });
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    window.location.reload();
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 z-50">
      <p>A new version is available!</p>
      <button
        onClick={reloadPage}
        className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
      >
        Update
      </button>
    </div>
  );
};

export default PWAUpdatePrompt; 