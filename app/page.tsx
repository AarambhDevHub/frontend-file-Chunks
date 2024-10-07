"use client";

// pages/index.tsx
import { useState } from 'react';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const uploadFileInChunks = async () => {
        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        const chunkSize = 1 * 1024 * 1024; // 1 MB
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = Number(localStorage.getItem(file.name)) || 0;

        setProgress(0);
        setStatus('Uploading...');

        while (currentChunk < totalChunks) {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, file.size);
            const chunk = file.slice(start, end);
            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('fileName', file.name);
            formData.append('chunkNumber', currentChunk.toString());
            formData.append('totalChunks', totalChunks.toString());

            try {
                const response = await fetch('http://localhost:8000/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error('Chunk upload failed');

                currentChunk++;
                localStorage.setItem(file.name, currentChunk.toString());
                setProgress(parseInt(((currentChunk / totalChunks) * 100).toFixed(0)));
              } catch (error) {
                console.error(error);
                alert('An error occurred during upload.');
                return;
            }
        }

        localStorage.removeItem(file.name);
        setStatus('File uploaded successfully!');
    };

    const downloadFileInChunks = async (fileName: string) => {
        const chunkSize = 1 * 1024 * 1024; // 1 MB
        let offset = 0;
        let fileData: Uint8Array[] = [];

        while (true) {
            const response = await fetch(`http://localhost:8000/download?fileName=${fileName}&offset=${offset}&chunkSize=${chunkSize}`);

            if (response.status === 204) {
                break; // No content, means file download is complete
            }

            const chunk = new Uint8Array(await response.arrayBuffer());

            if (chunk.byteLength === 0) {
                break; // All chunks received
            }

            fileData.push(chunk);
            offset += chunkSize;

            // Update progress bar
            setProgress(Math.round((offset / chunkSize)));
        }

        // Combine all chunks into one blob
        const blob = new Blob(fileData);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url); // Clean up
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Chunked File Upload</h1>
            <input
                type="file"
                onChange={handleFileChange}
                className="mb-4 p-2 border border-gray-300 rounded"
            />
            <button
                onClick={uploadFileInChunks}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Upload
            </button>
            <progress value={progress} max="100" className="mt-4 w-full" />
            <p className="mt-2">{status}</p>

            <h1 className="text-2xl font-bold mt-8">Chunked File Download</h1>
            <button
                onClick={() => downloadFileInChunks('tokio.mov')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-4"
            >
                Download File
            </button>
        </div>
    );
}
