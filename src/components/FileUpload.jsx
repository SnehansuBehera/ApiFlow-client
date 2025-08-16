import React, { useState, useRef } from "react";

export default function FileUpload({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;

    setError("");
    setLoading(true);
    console.log(file)
    try {
      const formData = new FormData();
      formData.append("project", file);
      console.log(formData)
      const res = await fetch("http://localhost:5000/api/scan/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onUploadComplete(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadFile(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`mt-6 border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer 
        ${dragging ? "border-blue-500 bg-blue-900/20" : "border-gray-600 bg-gray-800/40"}`}
    >
      {loading ? (
        <p className="text-blue-400 animate-pulse">
          Uploading & Building Graph...
        </p>
      ) : (
        <p className="text-gray-300">
          Click or Drag & Drop a <span className="text-blue-400">.zip</span> or
          file here
        </p>
      )}
      {error && <p className="text-red-400 mt-2">{error}</p>}

      {/* Hidden input for click */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
