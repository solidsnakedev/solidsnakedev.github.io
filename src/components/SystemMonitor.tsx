export default function SystemMonitor() {
  return (
    <div className="font-mono text-base border-2 border-amber-500/50 p-6 bg-black/30 h-fit">
      <h3 className="text-amber-500 text-xl mb-4 border-b border-amber-500/50 pb-2">HIGHLIGHTS</h3>

      <div className="space-y-3">
        <div className="grid grid-cols-[116px_1fr] gap-2 items-start">
          <span className="text-amber-500">FOCUS:</span>
          <span className="text-white">Cardano • Midnight • eUTXO</span>
        </div>

        <div className="grid grid-cols-[116px_1fr] gap-2 items-start">
          <span className="text-amber-500">BUILDING:</span>
          <span className="text-white">Smart contracts • privacy-first apps</span>
        </div>

        <div className="grid grid-cols-[116px_1fr] gap-2 items-start">
          <span className="text-amber-500">STRENGTHS:</span>
          <span className="text-white">Protocol thinking • audits • tooling</span>
        </div>

        <div className="grid grid-cols-[116px_1fr] gap-2 items-center">
          <span className="text-amber-500">STATUS:</span>
          <span className="text-green-500">● READY FOR COLLABS</span>
        </div>

        <div className="grid grid-cols-[116px_1fr] gap-2 items-center">
          <span className="text-amber-500">CONTACT:</span>
          <a href="/contact" className="text-amber-500 hover:text-white transition-colors">
            /contact
          </a>
        </div>
      </div>
    </div>
  );
}