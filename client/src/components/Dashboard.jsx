import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function Dashboard() {
  const { logout, getToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocs = async () => {
    const token = await getToken();
    const res = await axios.get("http://localhost:5000/api/gallery", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDocs(res.data);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = await getToken();
      const res = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSelectedDoc(res.data);
      fetchDocs();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">OpenScan</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </header>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className="border-4 border-dashed border-gray-300 p-10 text-center cursor-pointer bg-white rounded-lg hover:bg-gray-50 transition"
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-blue-500 font-bold">
            Processing Scan... (CV Algorithm Running)
          </p>
        ) : (
          <p>Drag & drop a document image here, or click to select</p>
        )}
      </div>

      {/* Viewer */}
      {selectedDoc && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2">Original</h3>
            <img
              src={selectedDoc.originalUrl}
              alt="Original"
              className="w-full h-auto rounded"
            />
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-bold mb-2 text-green-600">
              Processed (Auto-Cropped)
            </h3>
            <img
              src={`${selectedDoc.processedUrl}?t=${new Date().getTime()}`}
              alt="Processed"
              className="w-full h-auto rounded border-2 border-green-500"
            />
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Your Scans</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="cursor-pointer group relative"
            >
              <img
                src={doc.processedUrl}
                className="w-full h-32 object-cover rounded border hover:opacity-75"
              />
              <div className="absolute bottom-0 bg-black bg-opacity-50 text-white text-xs p-1 w-full truncate">
                {new Date(doc.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
