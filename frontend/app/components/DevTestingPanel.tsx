"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
 * TEMPORARY TESTING COMPONENT
 * Branch: backend-core
 * Purpose: Allows the team to test backend health, live Alchemy calls, and API
 *          endpoints directly from the browser during incremental development.
 * NOTE: Remove or comment out this component before merging to 'main'.
 * ───────────────────────────────────────────────────────────────────────────── */

type AlchemyResult = {
  chain: string;
  provider: string;
  notice?: string | null;
  blockNumber: number;
  blockNumberHex: string;
  rawRpcResponse?: Record<string, unknown>;
  error?: string;
};

export default function DevTestingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activePort, setActivePort] = useState<number>(4000);

  // Alchemy RPC state
  const [alchemyData, setAlchemyData] = useState<AlchemyResult | null>(null);
  const [isTestingAlchemy, setIsTestingAlchemy] = useState(false);

  // /api/analyze test state
  const [testAddress, setTestAddress] = useState(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
  );
  const [analyzeResponse, setAnalyzeResponse] = useState<Record<string, unknown> | null>(null);
  const [isTestingAnalyze, setIsTestingAnalyze] = useState(false);

  // Milestone 4: Activity test state
  const [activityData, setActivityData] = useState<Record<string, unknown> | null>(null);
  const [isTestingActivity, setIsTestingActivity] = useState(false);

  // Milestone 5: Approvals test state
  const [approvalsData, setApprovalsData] = useState<Record<string, unknown> | null>(null);
  const [isTestingApprovals, setIsTestingApprovals] = useState(false);

  // Check backend health periodically
  const checkHealth = async () => {
    for (const port of [4000, 4001]) {
      try {
        const res = await fetch(`http://localhost:${port}/api/health`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "ok") {
            setBackendOnline(true);
            setActivePort(port);
            return;
          }
        }
      } catch {
        // try next port
      }
    }
    setBackendOnline(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const testAlchemy = async (chain = "ethereum") => {
    setIsTestingAlchemy(true);
    setAlchemyData(null);
    try {
      const res = await fetch(
        `http://localhost:${activePort}/api/test/alchemy?chain=${chain}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setAlchemyData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAlchemyData({
        chain,
        provider: "Failed",
        blockNumber: 0,
        blockNumberHex: "",
        error: msg,
      });
    } finally {
      setIsTestingAlchemy(false);
    }
  };

  const testAnalyzeEndpoint = async () => {
    setIsTestingAnalyze(true);
    setAnalyzeResponse(null);
    try {
      const res = await fetch(`http://localhost:${activePort}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: testAddress.trim() }),
      });
      const data = await res.json();
      setAnalyzeResponse(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalyzeResponse({ error: `Connection failed: ${msg}` });
    } finally {
      setIsTestingAnalyze(false);
    }
  };

  const testWalletActivity = async () => {
    setIsTestingActivity(true);
    setActivityData(null);
    try {
      const res = await fetch(
        `http://localhost:${activePort}/api/test/activity?address=${testAddress.trim()}&chain=ethereum&count=5`,
        { cache: "no-store" }
      );
      const isJson = res.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        throw new Error(
          `Backend returned HTML (${res.status} Not Found). Your backend process is running old code in memory. Please restart your backend server: press Ctrl+C in the backend terminal, then run npm run dev.`
        );
      }
      const data = await res.json();
      setActivityData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActivityData({ error: msg });
    } finally {
      setIsTestingActivity(false);
    }
  };

  const testApprovals = async () => {
    setIsTestingApprovals(true);
    setApprovalsData(null);
    try {
      const res = await fetch(
        `http://localhost:${activePort}/api/test/approvals?address=${testAddress.trim()}&chain=ethereum`,
        { cache: "no-store" }
      );
      const isJson = res.headers.get("content-type")?.includes("application/json");
      if (!isJson) {
        throw new Error(
          `Backend returned non-JSON (${res.status}). Please restart your backend server: press Ctrl+C, then run npm run dev.`
        );
      }
      const data = await res.json();
      setApprovalsData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApprovalsData({ error: msg });
    } finally {
      setIsTestingApprovals(false);
    }
  };

  return (
    <aside
      aria-label="Backend Dev Panel"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end"
    >
      {/* Collapsed Status Pill */}
      <div className="flex items-center gap-2 bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md px-3.5 py-2 rounded-full shadow-2xl text-xs font-mono">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            backendOnline === true
              ? "bg-emerald-400 animate-pulse"
              : backendOnline === false
              ? "bg-red-400"
              : "bg-amber-400"
          }`}
        />
        <span className="text-neutral-200">
          Backend: {backendOnline === true ? `:${activePort} (Live)` : "Offline"}
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-2 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer transition"
        >
          {isOpen ? "Close Panel" : "View Live APIs"}
        </button>
      </div>

      {/* Expanded Dev Panel */}
      {isOpen && (
        <section
          aria-label="Backend Test Controls"
          className="mt-2 w-96 max-h-[85vh] overflow-y-auto p-4 rounded-2xl bg-neutral-950/95 border border-neutral-800 shadow-2xl backdrop-blur-xl text-xs space-y-4 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div>
              <span className="font-semibold text-neutral-100">
                🛠️ Backend Dev Panel
              </span>
              <span className="ml-2 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                Test Branch
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Section 1: Server Status */}
          <div className="bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Endpoint:</span>
              <span className="font-mono text-emerald-400">
                http://localhost:{activePort}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-neutral-800/40">
              <span className="text-neutral-400">Status:</span>
              <span className={backendOnline ? "text-emerald-400" : "text-red-400"}>
                {backendOnline ? "Connected & Online" : "Server not running"}
              </span>
            </div>
          </div>

          {/* Section 2: Alchemy Live Results */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300">
                1. Test Alchemy RPC:
              </span>
              <span className="text-[10px] text-neutral-500">Live JSON</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => testAlchemy("ethereum")}
                disabled={!backendOnline || isTestingAlchemy}
                className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition cursor-pointer"
              >
                {isTestingAlchemy ? "Querying..." : "Ethereum (Alchemy)"}
              </button>
              <button
                type="button"
                onClick={() => testAlchemy("base")}
                disabled={!backendOnline || isTestingAlchemy}
                className="flex-1 py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg font-medium transition cursor-pointer"
              >
                Base Network
              </button>
            </div>

            {alchemyData && (
              <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-400">Provider:</span>
                  <span className="text-blue-400 font-semibold">
                    {alchemyData.provider}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-400">Block Height:</span>
                  <span className="text-emerald-400 font-bold">
                    #{alchemyData.blockNumber?.toLocaleString()}
                  </span>
                </div>
                {alchemyData.notice && (
                  <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-tight">
                    💡 {alchemyData.notice}
                  </div>
                )}
                {alchemyData.rawRpcResponse && (
                  <div>
                    <div className="text-[10px] text-neutral-500 mt-1 mb-0.5">
                      Raw JSON-RPC Response:
                    </div>
                    <pre className="p-2 rounded bg-black/70 border border-neutral-800/80 font-mono text-[10px] text-neutral-300 overflow-x-auto max-h-32">
                      {JSON.stringify(alchemyData.rawRpcResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: /api/analyze Test */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <span className="font-medium text-neutral-300 block">
              2. Test POST /api/analyze:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 py-1 px-2 rounded bg-neutral-900 border border-neutral-700 font-mono text-[11px] text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={testAnalyzeEndpoint}
                disabled={!backendOnline || isTestingAnalyze}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium transition cursor-pointer"
              >
                Send
              </button>
            </div>
            {analyzeResponse && (
              <pre className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-300 overflow-x-auto max-h-28">
                {JSON.stringify(analyzeResponse, null, 2)}
              </pre>
            )}
          </div>

          {/* Section 4: Live Wallet Activity (Milestone 4) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300 block">
                3. Live Wallet Activity (Milestone 4):
              </span>
              <button
                type="button"
                onClick={testWalletActivity}
                disabled={!backendOnline || isTestingActivity}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded font-medium transition cursor-pointer"
              >
                {isTestingActivity ? "Fetching..." : "Fetch Transfers"}
              </button>
            </div>
            {activityData && (
              <div className="space-y-1">
                <div className="text-[10px] text-neutral-400">
                  Transfers found: {Array.isArray(activityData.transfers) ? activityData.transfers.length : 0}
                </div>
                <pre className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-300 overflow-x-auto max-h-36">
                  {JSON.stringify(activityData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Section 5: Live Token Approvals (Milestone 5) */}
          <div className="space-y-2 pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300 block">
                4. Token Approvals (Milestone 5):
              </span>
              <button
                type="button"
                onClick={testApprovals}
                disabled={!backendOnline || isTestingApprovals}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded font-medium transition cursor-pointer"
              >
                {isTestingApprovals ? "Scanning..." : "Scan Approvals"}
              </button>
            </div>
            {approvalsData && (
              <div className="space-y-1">
                <div className="text-[10px] text-neutral-400">
                  Approvals discovered: {Array.isArray(approvalsData.approvals) ? approvalsData.approvals.length : 0}
                </div>
                <pre className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-300 overflow-x-auto max-h-36">
                  {JSON.stringify(approvalsData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
            Branch: <span className="text-neutral-400">backend-core</span> &bull;
            No git push will occur without explicit instruction.
          </div>
        </section>
      )}
    </aside>
  );
}
