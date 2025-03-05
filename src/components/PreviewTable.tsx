import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Pagination,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface PreviewTableProps {
  fileData: any[];
  messageTemplate: string;
  phoneColumn: string;
  setPreviewData: React.Dispatch<React.SetStateAction<any[]>>;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ 
  fileData, 
  messageTemplate, 
  phoneColumn,
  setPreviewData
}) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  
  // פונקציה להחלפת משתנים בתבנית ההודעה
  const replaceVariables = (template: string, rowData: any) => {
    let result = template;
    
    // החלפת כל המשתנים בערכים המתאימים
    Object.keys(rowData).forEach(key => {
      const value = rowData[key]?.toString() || '';
      result = result.replace(new RegExp(`<${key}>`, 'g'), value);
    });
    
    // טיפול בתווים מיוחדים
    result = result.replace(/"/g, '\\"').replace(/'/g, "\\'");
    
    // חשוב: אין להחליף את התו \n כדי שיישאר בהודעה המיוצאת
    return result;
  };
  
  // עדכון הנתונים המסוננים בכל פעם שהנתונים, התבנית או החיפוש משתנים
  useEffect(() => {
    if (fileData.length > 0 && messageTemplate) {
      let filtered = [...fileData];
      
      // סינון לפי מונח חיפוש אם קיים
      if (searchTerm) {
        filtered = filtered.filter(row => {
          return Object.values(row).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      
      // יצירת מערך הנתונים לתצוגה מקדימה וייצוא
      const previewDataWithMessages = filtered.map(row => {
        const phone = row[phoneColumn]?.toString() || '';
        const message = replaceVariables(messageTemplate, row);
        
        return {
          phone,
          message,
          originalData: { ...row }
        };
      });
      
      setFilteredData(previewDataWithMessages);
      setPreviewData(previewDataWithMessages);
    }
  }, [fileData, messageTemplate, phoneColumn, searchTerm, setPreviewData]);
  
  // חישוב מספר העמודים
  const pageCount = Math.ceil(filteredData.length / rowsPerPage);
  
  // שינוי עמוד
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // הנתונים שיוצגו בעמוד הנוכחי
  const currentPageData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  // פונקציה להצגת תצוגה מקדימה של ההודעה עם שבירות שורה
  const formatMessagePreview = (message: string) => {
    // רק לצורך תצוגה, מחליף את \n בתגית <br>
    return message.split('\\n').map((line, index, array) => (
      <React.Fragment key={index}>
        {line}
        {index < array.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        תצוגה מקדימה
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          להלן תצוגה מקדימה של ההודעות שיישלחו. ניתן לחפש ולסנן את הרשימה.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          שים לב: בקובץ המיוצא, שבירות השורה יישמרו כ-\n כנדרש.
        </Typography>
      </Box>
      
      <TextField
        fullWidth
        margin="normal"
        label="חיפוש"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />
      
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מספר טלפון</TableCell>
              <TableCell>הודעה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-line' }}>
                    {formatMessagePreview(row.message)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  אין נתונים להצגה
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default PreviewTable; 