import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { unparse } from 'papaparse';
import { toast } from 'react-toastify';

interface ExportButtonProps {
  previewData: any[];
  phoneColumn: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ previewData, phoneColumn }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('whatsapp_list');
  const [includeOriginalData, setIncludeOriginalData] = useState<boolean>(false);
  
  const handleExport = () => {
    if (previewData.length === 0) {
      toast.error('אין נתונים לייצוא');
      return;
    }
    
    setLoading(true);
    
    try {
      // הכנת הנתונים לייצוא
      const exportData = previewData.map(row => {
        const baseData = {
          phone: row.phone,
          message: row.message
        };
        
        // אם נבחר לכלול את הנתונים המקוריים, הוסף אותם
        if (includeOriginalData) {
          return {
            ...baseData,
            ...row.originalData
          };
        }
        
        return baseData;
      });
      
      // יצירת ה-CSV
      const csv = unparse(exportData, {
        header: true
      });
      
      // יצירת Blob עם קידוד UTF-8 עם BOM
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      
      // יצירת קישור להורדה
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('הקובץ יוצא בהצלחה!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('אירעה שגיאה בייצוא הקובץ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        ייצוא לקובץ CSV
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          ייצא את רשימת התפוצה לקובץ CSV בפורמט UTF-8 לשימוש בתוסף השליחה האוטומטית.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          הקובץ יכיל את מספרי הטלפון ואת ההודעות המותאמות אישית עם שבירות שורה (\n).
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px' }}>
        <TextField
          fullWidth
          label="שם הקובץ"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          helperText="שם הקובץ ללא סיומת .csv"
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={includeOriginalData}
              onChange={(e) => setIncludeOriginalData(e.target.checked)}
            />
          }
          label="כלול את כל הנתונים המקוריים בקובץ המיוצא"
        />
        
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={loading || previewData.length === 0}
          sx={{ mt: 2 }}
        >
          {loading ? 'מייצא...' : 'ייצא לקובץ CSV'}
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          הקובץ המיוצא יכיל עמודת טלפון ועמודת הודעה, כאשר שבירות השורה מיוצגות כ-\n.
        </Typography>
      </Box>
    </Box>
  );
};

export default ExportButton; 