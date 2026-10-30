"use client";

import { useState } from "react";
import {
  primaryButton,
  secondaryButton,
} from "./ui/styles";

type Props = {
  proxies: string[];
  error: string;
  onError: (message: string) => void;
};

export default function ProxyResults({
  proxies,
  error,
  onError,
}: Props) {
  const [copied, setCopied] = useState(false);
  const proxyText = proxies.join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(proxyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      onError("Could not copy to clipboard");
    }
  }

  function handleDownload() {
    const blob = new Blob([proxyText + "\n"], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "proxies.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-6/12 rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Results
      </h2>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : proxies.length > 0 ? (
        <>
          <p className="mb-2 text-xs text-gray-500">
            {proxies.length}{" "}
            {proxies.length === 1 ? "proxy" : "proxies"}
          </p>
          <ul className="max-h-80 space-y-1 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800">
            {proxies.map((proxy, i) => (
              <li
                key={i}
                className="break-all">
                {proxy}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleCopy}
              className={primaryButton}>
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className={secondaryButton}>
              Download .txt
            </button>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-400">
          Your proxies will appear here after you submit the
          form.
        </p>
      )}
    </div>
  );
}
