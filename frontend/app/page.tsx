"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Image Processor</h1>

      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <label className="block mb-4 text-lg font-medium">Upload an Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
          {/* Original Image */}
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Original</h2>
            <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
              {originalImage ? (
                <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-gray-400">No image selected</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center pt-12">
            <button
              onClick={handleProcess}
              disabled={!selectedFile || loading}
              className={`px-8 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 ${!selectedFile || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl"
                }`}
            >
              {loading ? "Processing..." : "Process Image →"}
            </button>
            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          </div>

          {/* Processed Image */}
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">Processed (Grayscale)</h2>
            <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
              {processedImage ? (
                <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-gray-400">Result will appear here</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
