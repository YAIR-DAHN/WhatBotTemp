import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Delete as DeleteIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface MessageTemplateProps {
  headers: string[];
  messageTemplate: string;
  setMessageTemplate: React.Dispatch<React.SetStateAction<string>>;
  phoneColumn: string;
  setPhoneColumn: React.Dispatch<React.SetStateAction<string>>;
  savedTemplates: {name: string, template: string}[];
  setSavedTemplates: React.Dispatch<React.SetStateAction<{name: string, template: string}[]>>;
}

const MessageTemplate: React.FC<MessageTemplateProps> = ({ 
  headers, 
  messageTemplate, 
  setMessageTemplate,
  phoneColumn,
  setPhoneColumn,
  savedTemplates,
  setSavedTemplates
}) => {
  const [templateName, setTemplateName] = useState<string>('');
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [openLoadDialog, setOpenLoadDialog] = useState<boolean>(false);
  
  // שמירת תבניות בלוקל סטורג' בכל פעם שהן משתנות
  useEffect(() => {
    localStorage.setItem('savedTemplates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  const handleInsertVariable = (variable: string) => {
    setMessageTemplate((prev) => `${prev}<${variable}>`);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('אנא הזן שם לתבנית');
      return;
    }
    
    if (!messageTemplate.trim()) {
      toast.error('אנא הזן תוכן להודעה');
      return;
    }
    
    const newTemplate = { name: templateName, template: messageTemplate };
    setSavedTemplates((prev) => [...prev, newTemplate]);
    setTemplateName('');
    setOpenSaveDialog(false);
    toast.success('התבנית נשמרה בהצלחה');
  };

  const handleLoadTemplate = (template: string) => {
    setMessageTemplate(template);
    setOpenLoadDialog(false);
    toast.success('התבנית נטענה בהצלחה');
  };

  const handleDeleteTemplate = (index: number) => {
    setSavedTemplates((prev) => prev.filter((_, i) => i !== index));
    toast.success('התבנית נמחקה בהצלחה');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(messageTemplate);
    toast.success('ההודעה הועתקה ללוח');
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        ניסוח הודעה
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          נסח את ההודעה שתישלח. הוסף משתנים מהקובץ על ידי לחיצה על השבבים למטה.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          שים לב: לשבירת שורה השתמש ב-\n
        </Typography>
      </Box>
      
      <TextField
        fullWidth
        multiline
        rows={6}
        label="תוכן ההודעה"
        value={messageTemplate}
        onChange={(e) => setMessageTemplate(e.target.value)}
        placeholder="לדוגמה: שלום <שם>,\n\nרצינו להזכיר לך ש<פרטים>.\n\nבברכה,\nהצוות"
        sx={{ mb: 3, direction: 'rtl' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleCopyToClipboard} edge="end">
                <CopyIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <Typography variant="subtitle1" gutterBottom>
        הוסף משתנים להודעה:
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {headers
          .filter(header => header !== phoneColumn)
          .map((header) => (
            <Chip
              key={header}
              label={header}
              onClick={() => handleInsertVariable(header)}
              color="primary"
              variant="outlined"
              clickable
            />
          ))}
      </Box>
      
      <Grid container spacing={2}>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setOpenSaveDialog(true)}
          >
            שמור תבנית
          </Button>
        </Grid>
        
        <Grid item>
          <Button
            variant="outlined"
            onClick={() => setOpenLoadDialog(true)}
            disabled={savedTemplates.length === 0}
          >
            טען תבנית
          </Button>
        </Grid>
      </Grid>
      
      {/* דיאלוג שמירת תבנית */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>שמירת תבנית</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם התבנית"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>ביטול</Button>
          <Button onClick={handleSaveTemplate} variant="contained">
            שמור
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* דיאלוג טעינת תבנית */}
      <Dialog
        open={openLoadDialog}
        onClose={() => setOpenLoadDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>בחר תבנית</DialogTitle>
        <DialogContent>
          <List>
            {savedTemplates.map((template, index) => (
              <React.Fragment key={index}>
                <ListItem
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteTemplate(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={template.name}
                    secondary={template.template.length > 50 
                      ? `${template.template.substring(0, 50)}...` 
                      : template.template}
                    onClick={() => handleLoadTemplate(template.template)}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItem>
                {index < savedTemplates.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoadDialog(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageTemplate; 