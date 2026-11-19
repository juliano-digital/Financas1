/// <reference types="vite-plugin-pwa/client" />

import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isAppInstalled() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isAppInstalled);
  const [dismissed, setDismissed] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [installError, setInstallError] = useState(false);
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPrompt(installEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => setInstalled(isAppInstalled());

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    standaloneQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      standaloneQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      if (choice.outcome === 'accepted') setInstalled(true);
    } catch (error) {
      console.error('Não foi possível iniciar a instalação do aplicativo:', error);
      setInstallError(true);
    }
  };

  const showInstall = !installed && !dismissed && (installPrompt !== null || isIos);
  if (!showInstall && !needRefresh) return null;

  return (
    <aside
      className="fixed inset-x-3 top-3 z-[60] mx-auto max-w-lg rounded-xl border border-blue-100 bg-white p-4 shadow-lg"
      aria-live="polite"
    >
      {showInstall && (
        <section>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">Tenha o app no seu celular</h2>
              <p className="mt-1 text-sm text-gray-600">
                {isIos
                  ? 'No iPhone ou iPad, adicione o app à Tela de Início pelo Safari.'
                  : 'Instale o Controle de Gastos para abrir direto da tela inicial.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-sm text-gray-500 hover:text-gray-800"
              aria-label="Dispensar convite de instalação"
            >
              Fechar
            </button>
          </div>
          {installPrompt ? (
            <button
              type="button"
              onClick={handleInstall}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Instalar aplicativo
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setShowIosInstructions((visible) => !visible)}
                className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                aria-expanded={showIosInstructions}
              >
                Como instalar no iPhone
              </button>
              {showIosInstructions && (
                <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-gray-700">
                  <li>Abra esta página no Safari.</li>
                  <li>Toque em Compartilhar.</li>
                  <li>Selecione “Adicionar à Tela de Início”.</li>
                  <li>Confirme tocando em Adicionar.</li>
                </ol>
              )}
            </>
          )}
          {installError && (
            <p className="mt-2 text-sm text-red-700" role="alert">
              Não foi possível iniciar a instalação. Tente novamente pelo menu do navegador.
            </p>
          )}
        </section>
      )}

      {needRefresh && (
        <section className={showInstall ? 'mt-4 border-t border-gray-100 pt-4' : ''}>
          <p className="text-sm text-gray-700">
            Uma atualização está pronta. Salve alterações em andamento antes de atualizar.
          </p>
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Atualizar aplicativo
          </button>
        </section>
      )}
    </aside>
  );
}
