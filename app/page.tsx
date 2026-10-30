"use client";

import ProxyForm from "@/components/ProxyForm";
import ProxyResults from "@/components/ProxyResults";
import { useProxyGenerator } from "@/hooks/useProxyGenerator";

export default function Home() {
  const { proxies, error, setError, generate } =
    useProxyGenerator();

  return (
    <main className="w-screen h-screen bg-linear-to-tr from-byteful-blue-purple to-byteful-lavender flex flex-row justify-center items-center">
      <div className="flex flex-col w-9/12 h-11/12 bg-byteful-grey text-black items-center justify-between rounded-xl p-4">
        <h1 className="text-2xl font-bold">
          Byteful Proxy Generator
        </h1>
        <div className="flex flex-row w-full h-full gap-4">
          <div className="flex flex-col items-center w-6/12">
            <ProxyForm onSubmit={generate} />
          </div>
          <ProxyResults
            proxies={proxies}
            error={error}
            onError={setError}
          />
        </div>
      </div>
    </main>
  );
}
