import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  useMediaQuery
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// יבוא הקומפוננטות שניצור בהמשך
import FileUploader from './components/FileUploader';
import MessageTemplate from './components/MessageTemplate';
import PreviewTable from './components/PreviewTable';
import ExportButton from './components/ExportButton';

function App() {
  // מצב האפליקציה
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState<string>('');
  const [phoneColumn, setPhoneColumn] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  // שמירת היסטוריה מקומית
  const [savedTemplates, setSavedTemplates] = useState<{name: string, template: string}[]>([]);
  
  // טעינת היסטוריה מקומית בעת טעינת האפליקציה
  useEffect(() => {
    const savedTemplatesFromStorage = localStorage.getItem('savedTemplates');
    if (savedTemplatesFromStorage) {
      setSavedTemplates(JSON.parse(savedTemplatesFromStorage));
    }
  }, []);
  
  // העדפת מצב כהה או בהיר לפי העדפות המשתמש
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // יצירת ערכת נושא דינמית
  const theme = React.useMemo(
    () =>
      createTheme({
        direction: 'rtl',
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#25D366', // צבע וואטסאפ
          },
          secondary: {
            main: '#128C7E', // צבע וואטסאפ משני
          },
        },
        typography: {
          fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
          יוצר רשימות תפוצה לוואטסאפ
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <FileUploader 
              setFileData={setFileData} 
              setHeaders={setHeaders} 
              setPhoneColumn={setPhoneColumn} 
            />
          </Paper>
          
          {headers.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <MessageTemplate 
                headers={headers} 
                messageTemplate={messageTemplate} 
                setMessageTemplate={setMessageTemplate} 
                phoneColumn={phoneColumn}
                setPhoneColumn={setPhoneColumn}
                savedTemplates={savedTemplates}
                setSavedTemplates={setSavedTemplates}
              />
            </Paper>
          )}
          
          {fileData.length > 0 && messageTemplate && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <PreviewTable 
                fileData={fileData} 
                messageTemplate={messageTemplate} 
                phoneColumn={phoneColumn}
                setPreviewData={setPreviewData}
              />
            </Paper>
          )}
          
          {previewData.length > 0 && (
            <Paper elevation={3} sx={{ p: 3 }}>
              <ExportButton previewData={previewData} phoneColumn={phoneColumn} />
            </Paper>
          )}
        </Box>
      </Container>
      <ToastContainer position="bottom-left" rtl />
    </ThemeProvider>
  );
}

export default App;
