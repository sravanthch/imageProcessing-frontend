"use client";

import React, { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [serverStatus, setServerStatus] = useState<"connecting" | "online" | "error">("connecting");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState(40);
  const [launchTimer, setLaunchTimer] = useState<number | null>(null);
  const [processingMessage, setProcessingMessage] = useState("Initializing...");

  const engagementMessages = [
    "Analyzing image structure...",
    "Scanning pixel data...",
    "Applying adaptive filters...",
    "Optimizing color channels...",
    "Generating grayscale map...",
    "Finalizing transformation...",
    "Verifying output quality...",
    "Almost there..."
  ];

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
      const startTime = Date.now();
      try {
        setServerStatus("connecting");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        
        // Attempt ping
        await fetch(apiUrl);
        const duration = Date.now() - startTime;
        
        setServerStatus("online");
        
        // If it's a warm start (responded in < 3s), trigger the 5s launch timer
        if (duration < 3000) {
          setLaunchTimer(5);
        }
      } catch (err) {
        setServerStatus("error");
        console.error("Failed to ping backend:", err);
      }
    };
    pingBackend();
  }, []);

  // Countdown & Launch Timer Logic
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (serverStatus === "connecting" && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (serverStatus === "connecting" && countdown === 0) {
      // Force 'online' state once countdown expires for smooth UX
      setServerStatus("online");
      setLaunchTimer(5);
    } else if (launchTimer !== null && launchTimer > 0) {
      timer = setInterval(() => setLaunchTimer(prev => prev !== null ? prev - 1 : null), 1000);
    } else if (launchTimer === 0) {
      // Only auto-dismiss for returning users (Warmup Overlay)
      if (!showOnboarding) {
        setShowOnboarding(false);
      }
      setLaunchTimer(null);
    }
    return () => clearInterval(timer);
  }, [serverStatus, countdown, launchTimer]);

  // Handle Onboarding Persistence
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding_v3");
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenOnboarding_v3", "true");
  };


  // Cycle processing messages
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      let index = 0;
      setProcessingMessage(engagementMessages[0]);
      interval = setInterval(() => {
        index = (index + 1) % engagementMessages.length;
        setProcessingMessage(engagementMessages[index]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setOriginalImage(null);
      setProcessedImage(null);
      setError(null);
      setUploadLoading(true);
      setTimeout(() => {
        setOriginalImage(objectUrl);
        setUploadLoading(false);
      }, 5000);
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
      
      // Ensure it takes at least 10 seconds to keep user engaged as requested
      const [response] = await Promise.all([
        fetch(`${apiUrl}/api/process`, {
          method: "POST",
          body: formData,
        }),
        new Promise(resolve => setTimeout(resolve, 10000))
      ]);

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
                {uploadLoading ? (
                  <div className="text-center p-4 flex flex-col items-center gap-3">
                    <svg className="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-slate-400 font-medium">Preparing image…</span>
                  </div>
                ) : originalImage ? (
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
                disabled={!selectedFile || loading || uploadLoading}
                className={`relative px-6 py-3 w-full sm:w-auto lg:w-full rounded-xl font-bold text-sm text-white transition-all transform hover:scale-105 active:scale-95 shadow-xl ${!selectedFile || loading || uploadLoading
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
              {loading && <p className="mt-2 text-emerald-400 text-[10px] text-center font-medium animate-pulse">{processingMessage}</p>}
              {error && <p className="mt-2 text-rose-400 text-[10px] text-center px-3 py-1.5 rounded-lg bg-rose-400/10 border border-rose-400/20">{error}</p>}
            </div>

            {/* Processed Image */}
            <div className="w-full lg:w-5/12 flex flex-col items-center justify-center gap-3 h-full min-h-0">
              <div className="w-full flex-1 relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner min-h-0">
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

              {/* Download button — flush below processed image */}
              {processedImage ? (
                <a
                  href={processedImage}
                  download={`processed-${selectedFile?.name ?? "image.png"}`}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 border border-emerald-400/30 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Result
                </a>
              ) : (
                <button
                  disabled
                  title="Process an image first"
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 text-slate-600 text-xs font-bold uppercase tracking-wider cursor-not-allowed border border-slate-700 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Result
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Engagement Modal (Onboarding or Warmup) */}
      {(showOnboarding || serverStatus === 'connecting' || launchTimer !== null) && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-700 animate-in fade-in ${
          !showOnboarding && serverStatus === 'online' && launchTimer === null ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}>
          <div className="relative max-w-lg w-full bg-slate-900/90 border border-slate-700/50 rounded-[2.5rem] p-4 sm:p-10 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            {/* Background decorative glows */}
            <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${
              !showOnboarding ? 'bg-blue-500/20' : 
              currentSlide === 0 ? 'bg-blue-500/30' : 'bg-purple-500/30'
            }`}></div>
            <div className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] transition-all duration-1000 ${
              !showOnboarding ? 'bg-emerald-500/20' :
              currentSlide === 0 ? 'bg-emerald-500/30' : 'bg-blue-500/30'
            }`}></div>

            <div className="relative z-10">
              {showOnboarding ? (
                /* Full Onboarding Flow */
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6" >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${currentSlide === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Onboarding</h2>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1].map((i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Slide Content */}
                  <div className="min-h-[280px] flex flex-col justify-center">
                    {currentSlide === 0 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h3 className="text-2xl font-extrabold text-white mb-2 leading-tight">What is Image Processing?</h3>
                        <p className="text-slate-300 text-sm leading-relaxed font-light mb-4">
                          It is the art of <span className="text-blue-400 font-medium">mathematically transforming</span> visual data — converting RGB color images into grayscale, preserving structural detail for AI analysis.
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { step: 1, text: "Upload your image to the canvas." },
                            { step: 2, text: "Click 'Transform' to process the pixels." },
                            { step: 3, text: "View the grayscale result side by side." },
                            { step: 4, text: "Download the processed image if needed." },
                          ].map((item) => (
                            <div key={item.step} className="flex items-center gap-3 bg-slate-800/40 px-4 py-3 rounded-2xl border border-slate-700/30">
                              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black border border-emerald-500/30">
                                {item.step}
                              </span>
                              <p className="text-slate-200 text-sm font-medium">{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSlide === 1 && (
                      <div className="animate-in slide-in-from-right-8 duration-500">
                        <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">Getting Ready</h3>
                        <p className="text-slate-300 text-lg leading-relaxed font-light mb-8">
                          We're warming up the processing server. This usually takes a few seconds — hang tight!
                        </p>
                        
                        <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 space-y-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-medium">Server Status</span>
                            {serverStatus === 'online' ? (
                              <span className="text-emerald-400 flex items-center gap-1.5 font-bold animate-in fade-in zoom-in">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                Online
                              </span>
                            ) : (
                              <span className="text-blue-400 flex items-center gap-1.5 font-bold italic">
                                Ready in {countdown}s
                              </span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ease-out ${
                                serverStatus === 'online' ? 'bg-emerald-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: serverStatus === 'online' ? '100%' : `${((40 - countdown) / 40) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4 mt-8">
                    {currentSlide > 0 && (
                      <button onClick={() => setCurrentSlide(prev => prev - 1)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all border border-slate-700">Back</button>
                    )}
                    <button
                      onClick={() => {
                        if (currentSlide < 1) setCurrentSlide(prev => prev + 1);
                        else if (serverStatus === 'online') closeOnboarding();
                      }}
                      disabled={currentSlide === 1 && serverStatus !== 'online'}
                      className={`flex-[2] py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] ${
                        currentSlide === 1 && serverStatus !== 'online' ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {currentSlide < 1 ? 'Continue' : serverStatus === 'online' ? 'Begin Session' : 'Warming Up Engine...'}
                    </button>
                  </div>
                </>
              ) : (
                /* Returning User Quick Warmup Overlay */
                <div className="animate-in fade-in zoom-in duration-500 text-center py-6">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 mx-auto mb-8 ${launchTimer !== null ? 'bg-emerald-500 shadow-emerald-500/20 scale-110' : 'bg-gradient-to-br from-blue-500 to-emerald-500 shadow-blue-500/20 animate-bounce'}`}>
                    {launchTimer !== null ? (
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-3xl font-extrabold text-white mb-3">
                    {launchTimer !== null ? 'System Ready' : 'Welcome Back'}
                  </h3>
                  <p className="text-slate-400 text-lg mb-10 font-light">
                    {launchTimer !== null ? `Launching session in ${launchTimer}s...` : 'Starting engine for your session...'}
                  </p>
                  
                  <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800 space-y-4 max-w-sm mx-auto shadow-inner">
                    <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest font-bold">
                      <span>{launchTimer !== null ? 'Finalizing' : 'Syncing'}</span>
                      <span className="text-blue-400">
                        {launchTimer !== null ? '100%' : `${countdown}s remaining`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-linear ${launchTimer !== null ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: launchTimer !== null ? '100%' : `${((40 - countdown) / 40) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
