import AddressInput from "./components/AddressInput";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-neutral-950 text-neutral-100 selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">
            SmartWallet <span className="text-neutral-400 font-normal">Reputation</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Ethereum & Base
          </span>
        </div>
      </header>

      {/* Main Hero with Large Centered Search Bar */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full text-center">
        {/* Top Tagline / Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Web3 Security Investigation Platform
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Wallet & Contract <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
            Reputation Explorer
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-neutral-400 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
          Inspect active token allowances, smart contract interactions, and discover potential security exposures with explainable evidence.
        </p>

        {/* Large Centered Search Bar */}
        <AddressInput />

        {/* Feature Highlights / Pillars */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
            <div className="text-blue-400 font-medium text-sm mb-1">Active Approvals</div>
            <div className="text-xs text-neutral-400 leading-normal">
              Scan unlimited allowances and authorizations given to external contracts.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
            <div className="text-cyan-400 font-medium text-sm mb-1">Contract Security</div>
            <div className="text-xs text-neutral-400 leading-normal">
              Detect verified contracts, audit signals, and known risk indicators.
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/60 backdrop-blur-xs">
            <div className="text-emerald-400 font-medium text-sm mb-1">Evidence Chain</div>
            <div className="text-xs text-neutral-400 leading-normal">
              Clear explainability tracing from wallet to contract to security signal.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-neutral-800/60 py-6 text-center text-xs text-neutral-500">
        <p>SmartWallet Reputation &bull; Built for Web3 Security</p>
      </footer>
    </div>
  );
}
