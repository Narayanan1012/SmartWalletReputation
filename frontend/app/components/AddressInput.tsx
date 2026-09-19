"use client";

import { useState } from "react";

const SAMPLE_ADDRESSES = [
  { label: "vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
  { label: "Uniswap Permit2", address: "0x000000000022D473030F116dDEE9F6B43aC78BA3" },
  { label: "Tether (USDT)", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
];

export default function AddressInput() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidEvmAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr.trim());

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
    // Placeholder feedback for testing
    alert(`Analyzing address: ${trimmed}`);
  };

  const handleSelectSample = (sampleAddr: string) => {
    setAddress(sampleAddr);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <form onSubmit={handleSearch} className="w-full">
        <div className="relative flex items-center w-full rounded-2xl bg-neutral-900/80 border border-neutral-700/60 shadow-2xl backdrop-blur-md transition-all duration-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 hover:border-neutral-600">
          {/* Search Icon */}
          <div className="pl-5 pr-2 text-neutral-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Large Input Field */}
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter wallet or contract address (0x...)"
            className="w-full py-4 sm:py-5 px-2 bg-transparent text-white placeholder-neutral-500 text-base sm:text-lg font-mono focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          {address && (
            <button
              type="button"
              onClick={() => {
                setAddress("");
                setError(null);
              }}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Clear address input"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Analyze Button */}
          <div className="pr-2 sm:pr-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm sm:text-base shadow-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
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
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm self-start pl-2">
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
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400">
        <span className="text-neutral-500">Try sample:</span>
        {SAMPLE_ADDRESSES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => handleSelectSample(sample.address)}
            className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-neutral-300 border border-neutral-700/40 transition-colors cursor-pointer"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
