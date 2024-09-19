/* eslint-disable react/prop-types */
import React from 'react';

import { Delete, UploadFile } from '@mui/icons-material';
import { Box, Typography, IconButton } from '@mui/material';

const FileUpload = ({ value, onChange, label, error, removeError }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    onChange(file);
  };

  const handleRemoveFile = () => {
    onChange(null);
  };

  return (
    <Box
      sx={{
        border: '2px dashed #ddd',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        position: 'relative',
        mb: 2,
      }}
    >
      {value ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            border: '1px solid #ddd',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UploadFile sx={{ color: '#f44336', mr: 2 }} />
            <Box>
              <Typography variant="body1">{value.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {(value.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleRemoveFile}>
            <Delete />
          </IconButton>
        </Box>
      ) : (
        <label htmlFor={label} style={{ cursor: 'pointer', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              gap: 1,
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}
            >
              <UploadFile />
              <Typography variant="body2" color={error && 'error'}>
                {error || label}
              </Typography>
            </Box>
            <Typography variant="body1" color={(theme) => theme.palette.text.primary}>
              Browse
            </Typography>
          </Box>
          <input
            id={label}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      )}
    </Box>
  );
};

export default FileUpload;
