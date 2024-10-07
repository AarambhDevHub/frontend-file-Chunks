# Next.js File Upload and Download in Chunks

## Overview

This project showcases a Next.js frontend that interacts with a Rust Axum backend to perform file upload and download operations in chunks. The application provides a user-friendly interface for managing large file uploads and downloads, ensuring a smooth user experience.

## Features

- **File Upload**: Allows users to upload files in chunks, improving performance for large files.
- **File Download**: Users can download files in manageable segments, enhancing reliability.
- **Progress Indicators**: Visual feedback on the progress of uploads and downloads.

## Technologies Used

- **Next.js**: A React framework for server-side rendering and static site generation.
- **React**: A JavaScript library for building user interfaces.
- **Axios**: A promise-based HTTP client for making requests to the backend.

## Getting Started

### Prerequisites

- Install [Node.js](https://nodejs.org/) (which comes with npm).
- Ensure you have the Rust Axum backend running and accessible.

### Clone the Repository

```bash
git clone https://github.com/AarambhDevHub/frontend-file-Chunks.git
cd frontend-file-Chunks
```

### Install Dependencies

Run the following command to install the required packages:

```
npm install
```

### Run the Development Server
Start the Next.js development server:

```
npm run dev
```

The application will be available at http://localhost:3000.

### Code Example
Below is a simplified example of how to implement the file upload and download functionalities:

```
import React, { useState } from 'react';
import axios from 'axios';

const FileUploadDownload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const uploadFile = async () => {
    const chunkSize = 1 * 1024 * 1024; // 1 MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const chunk = file.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize);
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);

      await axios.post('http://localhost:8000/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(percentCompleted);
        },
      });
    }
    alert('Upload complete!');
  };

  const downloadFile = async () => {
    const response = await axios.get(`http://localhost:8000/download?fileName=${fileName}&offset=0&chunkSize=1048576`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  return (
    <div>
      <h1>File Upload and Download</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>
      <div>Upload Progress: {progress}%</div>

      <input
        type="text"
        placeholder="Enter file name to download"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <button onClick={downloadFile}>Download</button>
    </div>
  );
};

export default FileUploadDownload;
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Donations

If you find this project useful and would like to support its continued development, you can make a donation via [Buy Me a Coffee](https://buymeacoffee.com/aarambhdevhub).

Thank you for your support!
