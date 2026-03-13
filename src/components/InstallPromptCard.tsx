interface InstallPromptCardProps {
  onInstall: () => Promise<unknown>;
}

export function InstallPromptCard({ onInstall }: InstallPromptCardProps) {
  return (
    <section className="soft-card rounded-[28px] border border-sage-100/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Installation PWA
          </p>
          <h2 className="mt-2 font-display text-2xl text-ink">Ajoute-la à ton écran d’accueil</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Idéal sur Android: lancement rapide, plein écran et fonctionnement hors ligne après installation.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void onInstall();
          }}
          className="min-h-14 rounded-full bg-sage-500 px-5 text-base font-semibold text-white transition hover:bg-sage-500/92"
        >
          Installer
        </button>
      </div>
    </section>
  );
}
