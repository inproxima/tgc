import React from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';

function GuidingQuestions({ questions }) {
  const theme = useTheme();
  
  // If no questions, show empty state
  if (!questions) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 3,
          textAlign: 'center',
          bgcolor: 'background.default',
          borderRadius: 2,
        }}
      >
        <LiveHelpIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          No Guiding Questions Generated Yet
        </Typography>
        <Typography 
          color="text.secondary" 
          sx={{ maxWidth: 500, mb: 3 }}
        >
          Guiding questions will appear here after you generate a case study. These questions can help you expand and refine your work.
        </Typography>
        <Button 
          variant="contained"
          onClick={() => document.querySelectorAll('button[role="tab"]')[0].click()}
        >
          Go to Input Form
        </Button>
      </Box>
    );
  }

  // Function to handle downloading the questions
  const handleDownload = () => {
    // Create a blob with the content
    const blob = new Blob([questions], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guiding_questions.md';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          mt: 2,
          fontWeight: 600,
          color: theme.palette.text.primary
        }}
      >
        Guiding Questions for Expansion
      </Typography>
      
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[1]
        }}
      >
        <Box
          sx={{
            typography: 'body1',
            lineHeight: 1.8,
            '& h2': {
              fontSize: '1.5rem',
              fontWeight: 600,
              mt: 4,
              mb: 2,
              color: theme.palette.text.primary
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 500,
              mt: 3,
              mb: 2,
              color: theme.palette.text.primary
            },
            '& p': {
              mb: 2
            },
            '& ol, & ul': {
              pl: 3,
              mb: 2
            },
            '& li': {
              mb: 1.5
            }
          }}
        >
          <ReactMarkdown>{questions}</ReactMarkdown>
        </Box>
      </Paper>
      
      <Button
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        size="large"
        sx={{ mt: 2 }}
      >
        Download Guiding Questions
      </Button>
    </Box>
  );
}

export default GuidingQuestions; 