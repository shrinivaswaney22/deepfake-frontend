"use client";

import { useState, useRef } from "react";
import axios from "axios";

export default function Home() {
  const [videoFile, setVideoFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const dropRef = useRef();

  // Handle file choosing or drop
  const handleFile = (file) => {
    if (!file) return;
    setVideoFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setResult(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
    dropRef.current.classList.remove("border-blue-400");
  };

  const onDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add("border-blue-400");
  };

  const onDragLeave = () => {
    dropRef.current.classList.remove("border-blue-400");
  };

  const handleUpload = async () => {
    if (!videoFile) {
      alert("Please select or drop a video file.");
      return;
    }

    setLoading(true);
    setStatus("Processing video…");
    setResult(null);

    const formData = new FormData();
    formData.append("video", videoFile);

    try {
      const response = await axios.post(
        "http://localhost:8000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setStatus(`Uploading… ${percent}%`);
          },
        }
      );

      setStatus("Completed");
      setResult(response.data);
    } catch (err) {
      setStatus("Error");
      setResult(err.response?.data || err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl p-10 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          Deepfake Detector
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Upload a video to check if it is REAL or FAKE using our Fusion Model.
        </p>

        {/* Drag & Drop */}
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all rounded-xl p-8 text-center cursor-pointer mb-6"
        >
          <p className="text-gray-600 mb-2">Drag & drop your video here</p>
          <p className="text-gray-400 text-sm">or click below</p>

          <input
            type="file"
            accept="video/*"
            className="mt-4 text-black flex items-center justify-center mx-auto border border-gray-300 rounded-lg px-4 py-2 cursor-pointer"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {/* Video Preview */}
        {previewURL && (
          <div className="mt-4 mb-6">
            <video
              src={previewURL}
              controls
              className="rounded-xl w-full shadow-sm"
            ></video>
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium text-lg transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing…" : "Upload & Analyze"}
        </button>

        {/* Status */}
        {status && (
          <div className="mt-6 text-center text-gray-700 font-medium">
            {status}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 bg-gray-100 p-6 rounded-xl text-center shadow-inner">
            {"prediction" in result ? (
              <>
                <div className="text-xl font-semibold text-black">
                  Result:{" "}
                  <span
                    className={
                      result.prediction === "FAKE"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {result.prediction}
                  </span>
                </div>
                <div className="text-gray-700 mt-2 text-lg">
                  Confidence Score:{" "}
                  <strong>{result.score.toFixed(3)}</strong>
                </div>
              </>
            ) : (
              <pre className="text-red-600 mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </main>
  );
}