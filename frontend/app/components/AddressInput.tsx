"use client";

import { useState } from "react";
import { isValidEvmAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Address Input (PRD §P0 — Address Input)
//
// Accepts an EVM address, validates, and calls onAnalyze.
// Supports Enter key and button click.
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Please enter a wallet or smart contract address.");
      return;
    }

    if (!isValidEvmAddress(trimmed)) {
      setError("Invalid EVM address format. Address must start with 0x and be 42 characters.");
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
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form onSubmit={handleSearch} className="w-full">
        <div className={`relative flex items-center w-full rounded-lg bg-neutral-900 border transition-colors duration-150 ${error ? "border-red-500/50" : "border-neutral-800 focus-within:border-blue-500"}`}>
          {/* Search Icon */}
          <div className="pl-4 pr-2 text-neutral-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter wallet or contract address (0x...)"
            className="w-full py-4 sm:py-4.5 px-2 bg-transparent text-white placeholder-neutral-500 text-sm sm:text-base font-mono focus:outline-none"
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
              className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Clear address input"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Analyze Button */}
          <div className="pr-2">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Analyzing</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <svg
                    className="w-4 h-4 hidden sm:inline-block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div id="address-error" role="alert" className="mt-3 flex items-center gap-2 text-red-400 text-sm self-start pl-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Quick Try Sample Chips */}
      {!isLoading && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400">
          <span className="text-neutral-500">Try sample:</span>
          {SAMPLE_ADDRESSES.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample.address)}
              className="px-2.5 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
