"use client";

import React, { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Close tooltip if clicked exactly outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.info-tooltip-container')) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Hit backend root on load
  React.useEffect(() => {
    const pingBackend = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        await fetch(apiUrl);
        console.log("Backend pinged successfully");
      } catch (err) {
        console.error("Failed to ping backend:", err);
      }
    };
    pingBackend();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiUrl}/api/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err) {
      setError("Error processing image. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-slate-950 text-slate-200 p-4 sm:p-6 font-sans transition-colors duration-300 flex flex-col justify-center">
      <div className="max-w-6xl w-full mx-auto flex flex-col h-full max-h-[90vh]">
        <header className="mb-4 flex flex-col items-center text-center shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Image Processor
              </h1>
              
              <div className="relative info-tooltip-container flex items-center mt-1">
                {/* Info Icon SVG */}
                <span 
                  onClick={() => setShowTooltip(!showTooltip)}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="cursor-pointer flex items-center justify-center bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 w-6 h-6 rounded-full transition-colors shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                
                {/* Tooltip Content */}
                <div 
                  className={`absolute top-10 left-1/2 -translate-x-1/2 w-64 p-3 bg-slate-800 text-xs text-slate-300 rounded-xl shadow-2xl transition-all duration-300 z-50 border border-slate-700 pointer-events-none before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-slate-800 text-left ${
                    showTooltip ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <p className="font-semibold text-white mb-1.5 pb-1.5 border-b border-slate-700 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    What is Image Processing?
                  </p>
                  <div className="space-y-1">
                    <p>It is converting RGB colored images into grayscale.</p>
                    <p>It's used in computer vision, simplifying processing.</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1 font-light">Elevate your imagery with classic intelligent filters.</p>
        </header>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex-1 flex flex-col min-h-0">
          {/* subtle background glow */}
          <div className="absolute top-0 right-0 -m-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -m-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative mb-4 text-center max-w-lg mx-auto w-full shrink-0">
            <label className="block text-xs font-medium text-slate-300 mb-2">Upload your canvas</label>
            <div className="group rounded-xl p-1 bg-slate-800 border border-slate-700 flex items-center overflow-hidden transition-all hover:border-slate-500">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-slate-400 mx-auto
                  file:mr-3 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-xs file:font-semibold
                  file:bg-slate-700 file:text-emerald-400
                  hover:file:bg-slate-600 hover:file:text-emerald-300
                  transition-all cursor-pointer file:cursor-pointer
                "
              />
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-center flex-1 min-h-0">
            {/* Original Image */}
            <div className="w-full lg:w-5/12 flex items-center justify-center h-full min-h-0">
              <div className="w-full h-full relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                {originalImage ? (
                  <>
                    <img src={originalImage} alt="Original" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">Original</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-8 w-8 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Awaiting image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="w-full lg:w-2/12 flex flex-col items-center justify-center py-2 lg:py-0 relative shrink-0">
              <button
                onClick={handleProcess}
                disabled={!selectedFile || loading}
                className={`relative px-6 py-3 w-full sm:w-auto lg:w-full rounded-xl font-bold text-sm text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl ${!selectedFile || loading
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-br from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Transform <span className="hidden sm:inline">→</span>
                  </span>
                )}
              </button>
              {error && <p className="mt-2 text-rose-400 text-[10px] text-center px-3 py-1.5 rounded-lg bg-rose-400/10 border border-rose-400/20">{error}</p>}
            </div>

            {/* Processed Image */}
            <div className="w-full lg:w-5/12 flex items-center justify-center h-full min-h-0">
              <div className="w-full h-full relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                {processedImage ? (
                  <>
                    <img src={processedImage} alt="Processed" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-300">Grayscale Result</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <svg className="mx-auto h-8 w-8 text-slate-800 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-xs text-slate-600 font-medium">Result ready</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
