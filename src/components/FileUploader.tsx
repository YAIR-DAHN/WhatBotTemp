import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

interface FileUploaderProps {
  setFileData: React.Dispatch<React.SetStateAction<any[]>>;
  setHeaders: React.Dispatch<React.SetStateAction<string[]>>;
  setPhoneColumn: React.Dispatch<React.SetStateAction<string>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ setFileData, setHeaders, setPhoneColumn }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const data = await readExcelFile(file);
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        setAvailableHeaders(headers);
        setHeaders(headers);
        setFileData(data);
        
        // נסה למצוא עמודה שמכילה "טלפון" או "נייד" או "phone" באופן אוטומטי
        const phoneColumnGuess = headers.find(header => 
          header.toLowerCase().includes('טלפון') || 
          header.toLowerCase().includes('נייד') || 
          header.toLowerCase().includes('phone') ||
          header.toLowerCase().includes('mobile')
        );
        
        if (phoneColumnGuess) {
          setSelectedPhoneColumn(phoneColumnGuess);
          setPhoneColumn(phoneColumnGuess);
        }
        
        toast.success('הקובץ נטען בהצלחה!');
      } else {
        setError('הקובץ ריק או לא בפורמט הנכון');
        toast.error('הקובץ ריק או לא בפורמט הנכון');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError('שגיאה בעיבוד הקובץ. אנא ודא שהקובץ הוא בפורמט אקסל או CSV תקין.');
      toast.error('שגיאה בעיבוד הקובץ');
    } finally {
      setLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }
          
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const handlePhoneColumnChange = (event: any) => {
    setSelectedPhoneColumn(event.target.value);
    setPhoneColumn(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        טעינת קובץ
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          טען קובץ אקסל או CSV המכיל את רשימת אנשי הקשר והנתונים שלהם.
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFile />}
          disabled={loading}
        >
          {loading ? 'טוען...' : 'בחר קובץ'}
          <input
            type="file"
            hidden
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
        </Button>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {file && !loading && !error && (
          <Alert severity="success">
            הקובץ "{file.name}" נטען בהצלחה
          </Alert>
        )}
        
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        
        {availableHeaders.length > 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="phone-column-label">בחר עמודת מספר טלפון</InputLabel>
            <Select
              labelId="phone-column-label"
              value={selectedPhoneColumn}
              label="בחר עמודת מספר טלפון"
              onChange={handlePhoneColumnChange}
            >
              {availableHeaders.map((header) => (
                <MenuItem key={header} value={header}>
                  {header}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
    </Box>
  );
};

export default FileUploader; 