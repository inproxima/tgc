import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';

function FileUpload({ uploadEndpoint }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      setSuccessMessage('File uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setErrorMessage('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Upload a File</Typography>
      <Paper
        elevation={isDragging ? 6 : 1}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          backgroundColor: isDragging ? 'primary.lighter' : 'background.paper',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Typography variant="body1" color="text.secondary">
          Drag and drop a PDF or DOCX file here, or <Button variant="text">Choose File</Button>
        </Typography>
        {selectedFile && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            Selected file: <strong>{selectedFile.name}</strong>
          </Typography>
        )}
      </Paper>
      <Button
        variant="contained"
        color="primary"
        disabled={!selectedFile || isUploading}
        onClick={handleUpload}
        sx={{ minWidth: 180 }}
      >
        {isUploading ? <CircularProgress size={24} /> : 'Upload File'}
      </Button>
      {successMessage && <Alert severity="success" sx={{ mt: 3 }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mt: 3 }}>{errorMessage}</Alert>}
    </Box>
  );
}

export default FileUpload; 