import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as PdfIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { TaxEntity } from '../types';
import { taxAPI } from '../services/api';

interface TaxReturnUploadProps {
  entities: TaxEntity[];
  onUploadSuccess: () => void;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: any;
}

const TaxReturnUpload: React.FC<TaxReturnUploadProps> = ({
  entities,
  onUploadSuccess,
}) => {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [taxYear, setTaxYear] = useState('2023-24');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        status: 'pending' as const,
        progress: 0
      }));
      setUploadFiles(prev => [...prev, ...newFiles]);
    }
  });

  const handleUpload = async () => {
    if (!selectedEntity || uploadFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      
      if (uploadFile.status !== 'pending') continue;

      try {
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'uploading', progress: 10 } : f
        ));

        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress: 30 } : f
        ));

        const result = await taxAPI.uploadTaxReturn(
          uploadFile.file,
          selectedEntity,
          taxYear
        );

        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'processing', 
            progress: 70 
          } : f
        ));

        await new Promise(resolve => setTimeout(resolve, 1000));

        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'success', 
            progress: 100,
            result
          } : f
        ));

      } catch (error: any) {
        setUploadFiles(prev => prev.map((f, idx) => 
          idx === i ? { 
            ...f, 
            status: 'error', 
            progress: 0,
            error: error.message || 'Upload failed'
          } : f
        ));
      }
    }

    setIsUploading(false);
    onUploadSuccess();
  };

  const clearFiles = () => {
    setUploadFiles([]);
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PdfIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'uploading':
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ready to upload';
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing with AI...';
      case 'success':
        return 'Complete';
      case 'error':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Tax Returns
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Entity</InputLabel>
            <Select
              value={selectedEntity}
              label="Select Entity"
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              {entities.map((entity) => (
                <MenuItem key={entity.id} value={entity.id}>
                  {entity.name} ({entity.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Tax Year"
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value)}
            sx={{ width: 150 }}
          />
        </Box>

        {entities.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please create at least one entity before uploading tax returns.
          </Alert>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              backgroundColor: isDragActive ? 'action.hover' : 'background.default',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to select files
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Only PDF files are supported (max 10MB each)
            </Typography>
          </Paper>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Files to Upload ({uploadFiles.length})</Typography>
              <Box>
                <Button onClick={clearFiles} disabled={isUploading} sx={{ mr: 1 }}>
                  Clear All
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleUpload}
                  disabled={!selectedEntity || isUploading || uploadFiles.every(f => f.status === 'success')}
                  startIcon={<UploadIcon />}
                >
                  {isUploading ? 'Processing...' : 'Upload & Process'}
                </Button>
              </Box>
            </Box>

            <List>
              {uploadFiles.map((uploadFile, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {getStatusIcon(uploadFile.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={uploadFile.file.name}
                    secondary={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={getStatusText(uploadFile.status)}
                            color={getStatusColor(uploadFile.status) as any}
                            size="small"
                          />
                          <Typography variant="caption">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                          </Typography>
                        </Box>
                        
                        {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                          <LinearProgress 
                            variant="determinate" 
                            value={uploadFile.progress} 
                            sx={{ mt: 1 }}
                          />
                        )}
                        
                        {uploadFile.error && (
                          <Typography variant="caption" color="error">
                            {uploadFile.error}
                          </Typography>
                        )}
                        
                        {uploadFile.result && (
                          <Typography variant="caption" color="success.main">
                            Extracted income: ${uploadFile.result.incomeData?.totalIncome?.toLocaleString() || 0} 
                            (Confidence: {Math.round((uploadFile.result.aiConfidence || 0) * 100)}%)
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {uploadFile.status === 'pending' && (
                    <Button onClick={() => removeFile(index)} size="small">
                      Remove
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TaxReturnUpload;