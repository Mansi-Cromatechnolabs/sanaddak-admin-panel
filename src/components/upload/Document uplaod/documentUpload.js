import React from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { Controller, useFormContext } from 'react-hook-form';

import { alpha } from '@mui/material/styles';
import { Box, Stack, IconButton, Typography, FormHelperText } from '@mui/material';

import UploadIllustration from 'src/assets/illustrations/upload-illustration';

import Iconify from 'src/components/iconify/iconify';

// Create a new component for document upload
export function DocumentUpload({ name, multiple, helperText, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DocumentUploadComponent
          multiple={multiple}
          files={field.value}
          error={!!error}
          helperText={helperText}
          onChange={(files) => field.onChange(files)}
          {...other}
        />
      )}
    />
  );
}

// Document upload component implementation
function DocumentUploadComponent({ multiple, files, error, helperText, onChange, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple,
    accept: {
      'application/pdf': [],
      // 'application/msword': [],
      // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
    },
    onDrop: (acceptedFiles) => onChange(acceptedFiles),
    ...other,
  });

  const hasFiles = multiple ? !!files?.length : !!files;
  const hasError = isDragReject || !!error;

  const renderPlaceholder = (
    <Stack spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
      <UploadIllustration sx={{ width: 1, maxWidth: 120 }} />
      <Typography variant="h6">Drop or Select file</Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Drop files here or click
        <Box
          component="span"
          sx={{
            mx: 0.5,
            color: 'primary.main',
            textDecoration: 'underline',
          }}
        >
          browse
        </Box>
        through your machine
      </Typography>
    </Stack>
  );

  const renderFileList = (
    <Box>
      {files?.map((file, index) => (
        <Box
          key={index}
          sx={{ mb: 2, position: 'relative', p: 2, border: '1px solid #ddd', borderRadius: 1 }}
        >
          <Typography variant="body2">{file.name}</Typography>
          <IconButton
            size="small"
            onClick={() => onChange(files.filter((_, i) => i !== index))}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'error.main',
            }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ width: 1, position: 'relative', ...sx }}>
      <Box
        {...getRootProps()}
        sx={{
          p: 2,
          outline: 'none',
          borderRadius: 1,
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          transition: (theme) => theme.transitions.create(['opacity', 'padding']),
          '&:hover': {
            opacity: 0.72,
          },
          ...(isDragActive && {
            opacity: 0.72,
          }),
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
          }),
        }}
      >
        <input {...getInputProps()} />

        {renderPlaceholder}
      </Box>

      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 2 }}>
          {error ? error?.message : helperText}
        </FormHelperText>
      )}

      <Box sx={{ mt: 2 }}>{hasFiles && renderFileList}</Box>
      {/* Display file rejection errors if any */}
      {fileRejections.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {fileRejections.map(({ file, errors }) => (
            <Typography key={file.path} color="error.main" variant="body2">
              {file.path} - {errors.map((e) => e.message).join(', ')}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

DocumentUpload.propTypes = {
  name: PropTypes.string.isRequired,
  multiple: PropTypes.bool,
  helperText: PropTypes.string,
};

DocumentUploadComponent.propTypes = {
  multiple: PropTypes.bool,
  files: PropTypes.array,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  sx: PropTypes.object,
};
