"use client";

import { useState } from "react";
import { isValidEvmAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Address Input (PRD §8 — Address Input)
//
// Security investigation command input.
// Technical JetBrains Mono font, mint focus state,
// thin borders, mechanical aesthetic.
// ─────────────────────────────────────────────────────────

const SAMPLE_ADDRESSES = [
  { label: "vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "Uniswap Permit2", address: "0x000000000022D473030F116dDEE9F6B43aC78BA3" },
  { label: "Tether (USDT)", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
];

type Props = {
  onAnalyze: (address: string) => void;
  isLoading?: boolean;
};

export default function AddressInput({ onAnalyze, isLoading = false }: Props) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Input required: Please enter a wallet or smart contract address.");
      return;
    }

    if (!isValidEvmAddress(trimmed)) {
      setError("Validation failed: EVM address must start with 0x and be 42 characters.");
      return;
    }

    setError(null);
    onAnalyze(trimmed);
  };

  const handleSelectSample = (sampleAddr: string) => {
    setAddress(sampleAddr);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fadeIn">
      <form onSubmit={handleSearch} className="w-full relative group">
        {/* Frame / Corner accents */}
        <div className={`absolute -inset-[1px] pointer-events-none transition-colors duration-300 ${isFocused ? 'border-mangaatha-mint/50' : 'border-mangaatha-border'} border`} />
        
        <div 
          className={`relative flex items-center w-full bg-mangaatha-surface/80 backdrop-blur-md transition-all duration-300 ${
            error 
              ? "border-mangaatha-exposure/50" 
              : isFocused 
                ? "border-mangaatha-mint" 
                : "border-transparent"
          }`}
        >
          {/* Prefix "0x" Indicator */}
          <div className="pl-5 pr-3 text-mangaatha-text-muted font-mono flex-shrink-0 flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${isFocused ? 'bg-mangaatha-mint animate-pulse' : 'bg-mangaatha-text-muted'}`} />
            <span>0x</span>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) setError(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter wallet or contract address"
            className="w-full py-5 px-0 bg-transparent text-mangaatha-text placeholder-mangaatha-text-muted/50 text-sm sm:text-base font-mono focus:outline-none"
            autoComplete="off"
            spellCheck="false"
            disabled={isLoading}
            aria-invalid={!!error}
            aria-describedby={error ? "address-error" : undefined}
          />

          {/* Clear Button */}
          {address && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setAddress("");
                setError(null);
              }}
              className="p-3 mr-1 text-mangaatha-text-muted hover:text-mangaatha-text transition-colors duration-200 focus-visible:outline-none focus-visible:text-mangaatha-mint"
              aria-label="Clear address input"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Analyze Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center h-full px-6 transition-all duration-300 border-l border-mangaatha-border disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:bg-mangaatha-mint/10 ${
              isFocused && !error && address 
                ? 'text-mangaatha-mint hover:bg-mangaatha-mint/10' 
                : 'text-mangaatha-text-sec hover:text-mangaatha-text hover:bg-mangaatha-surface-alt'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-mangaatha-border border-t-mangaatha-mint rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div id="address-error" role="alert" className="mt-3 flex items-start gap-2 text-mangaatha-exposure text-xs font-mono self-start w-full">
          <span className="mt-0.5">⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Quick Try Sample Chips */}
      {!isLoading && (
        <div className="mt-8 w-full">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px bg-mangaatha-border flex-1" />
            <span className="text-[10px] uppercase tracking-widest text-mangaatha-text-muted font-mono">Select Target</span>
            <div className="h-px bg-mangaatha-border flex-1" />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            {SAMPLE_ADDRESSES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSelectSample(sample.address)}
                className="group flex flex-col items-start px-3 py-2 bg-mangaatha-surface border border-mangaatha-border hover:border-mangaatha-text-muted transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:border-mangaatha-mint text-left min-w-[140px]"
              >
                <span className="text-xs font-medium text-mangaatha-text-sec group-hover:text-mangaatha-text transition-colors">
                  {sample.label}
                </span>
                <span className="text-[10px] font-mono text-mangaatha-text-muted truncate w-full mt-1">
                  {sample.address.slice(0,6)}...{sample.address.slice(-4)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
