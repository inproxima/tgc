import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Tab as MuiTab, 
  Tabs as MuiTabs, 
  Alert, 
  CircularProgress,
  Paper,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  CssBaseline,
  Divider
} from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NoteIcon from '@mui/icons-material/Note';
import EditNoteIcon from '@mui/icons-material/EditNote';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import './App.css';
import InputForm from './components/InputForm';
import CaseStudyDisplay from './components/CaseStudyDisplay';
import GuidingQuestions from './components/GuidingQuestions';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import { 
  generateCaseStudy, 
  enhanceCitations, 
  integrateCitations, 
  generateGuidingQuestions 
} from './utils/openaiService';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3949ab', // indigo[600] - professional but vibrant
      light: '#6f74dd',
      dark: '#00227b',
    },
    secondary: {
      main: '#26a69a', // teal[400] - refreshing and balanced
      light: '#64d8cb',
      dark: '#00766c',
    },
    text: {
      primary: '#1c2536', // Dark blue-gray for primary text
      secondary: '#4b5563', // Medium gray for secondary text
      disabled: '#9ca3af', // Light gray for disabled text
      hint: '#6b7280', // Hint text color
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    divider: 'rgba(57, 73, 171, 0.12)', // Light indigo for dividers
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#1c2536', // Consistent dark text color
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#3949ab', // Primary color for secondary headings
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1c2536', // Consistent dark text color
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#3949ab', // Primary color for smaller headings
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1c2536', // Consistent dark text color
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#3949ab', // Primary color for smallest headings
    },
    subtitle1: {
      fontSize: '1rem',
      color: '#4b5563', // Medium gray for subtitles
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#4b5563', // Medium gray for subtitles
    },
    body1: {
      fontSize: '1rem',
      color: '#1c2536', // Dark text for body
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4b5563', // Medium gray for secondary body text
    },
    button: {
      textTransform: 'none', // No all caps for buttons
      fontWeight: 600,
    },
    caption: {
      fontSize: '0.75rem',
      color: '#6b7280', // Gray for captions
    },
    overline: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      fontWeight: 500,
      color: '#6b7280', // Gray for overlines
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#303f9f', // Slightly darker on hover
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#00897b', // Slightly darker on hover
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            color: '#4b5563', // Consistent label color
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#3949ab', // Primary color when focused
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          '&.Mui-selected': {
            color: '#3949ab', // Primary color for selected tab
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#3949ab', // Primary color for icons
          minWidth: 36,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(57, 73, 171, 0.12)', // Light indigo for dividers
        },
      },
    },
  },
});

// Styled components
const drawerWidth = 320;

const StyledTabs = styled(MuiTabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled((props) => <MuiTab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: 'none',
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(16),
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
    '&.Mui-focusVisible': {
      backgroundColor: 'rgba(100, 95, 228, 0.32)',
    },
  }),
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

function App() {
  const [finalCaseStudy, setFinalCaseStudy] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [caseStudyTitle, setCaseStudyTitle] = useState('');
  const [acknowledgements, setAcknowledgements] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (event, newValue) => {
    // Only switch tabs if the user explicitly clicks on a tab
    if (event.type === 'click') {
    setTabIndex(newValue);
    }
  };

  const handleSubmit = async (formData) => {
    setIsGenerating(true);
    setIsGenerationComplete(false);
    
    // Save form data
    setAuthorName(formData.authorName);
    setCaseStudyTitle(formData.caseStudyTitle);
    setAcknowledgements(formData.acknowledgements);
    
    try {
      // Step 1: Generate case study
      setGenerationStatus('Generating case study...');
      const caseStudy = await generateCaseStudy(formData);
      
      // Step 2: Enhance citations
      setGenerationStatus('Searching for academic sources...');
      const { enhancedCaseStudy, references } = await enhanceCitations(caseStudy);
      
      // Step 3: Integrate citations
      setGenerationStatus('Integrating academic citations...');
      const finalStudy = await integrateCitations(enhancedCaseStudy, references);
      setFinalCaseStudy(finalStudy);
      
      // Step 4: Generate guiding questions
      setGenerationStatus('Generating guiding questions...');
      const questions = await generateGuidingQuestions(finalStudy);
      setReviewQuestions(questions);
      
      // Complete the process
      setIsGenerating(false);
      setIsGenerationComplete(true);
      setTabIndex(1); // Switch to Case Study tab
    } catch (error) {
      console.error('Error generating case study:', error);
      setIsGenerating(false);
      
      // Display more informative error message if available
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          'An error occurred while generating the case study.';
      
      alert(`${errorMessage} Please check the console for more details.`);
    }
  };

  const drawer = (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MenuBookIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2" color="primary.main" fontWeight={600}>
          How to Make an AI Case Study
        </Typography>
      </Box>
      <Sidebar />
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile app bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            backgroundColor: 'background.paper',
            color: 'text.primary',
            display: { md: 'none' },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              AI Case Study Generator
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: 'background.paper',
              },
            }}
          >
            {drawer}
          </Drawer>
          
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                borderRight: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: { xs: 8, md: 0 },
            maxWidth: '1000px',
            mx: 'auto',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '1.75rem', md: '2.25rem' },
                mb: 1,
                color: 'primary.main',
                fontWeight: 700,
                display: 'inline-block',
              }}
            >
              AI Case Study Studio
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
              
            </Typography>
          </Box>

          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <StyledTabs 
                value={tabIndex} 
                onChange={handleTabChange} 
                variant="fullWidth"
                // Prevent potential focus issues by avoiding unnecessary re-renders
                TabIndicatorProps={{ 
                  style: { transitionDuration: '0ms' } 
                }}
              >
                <StyledTab 
                  label="Input Form" 
                  icon={<EditNoteIcon />} 
                  iconPosition="start" 
                  {...a11yProps(0)} 
                />
                <StyledTab 
                  label="Case Study" 
                  icon={<NoteIcon />} 
                  iconPosition="start" 
                  {...a11yProps(1)} 
                />
                <StyledTab 
                  label="Guiding Questions" 
                  icon={<HelpOutlineIcon />} 
                  iconPosition="start" 
                  {...a11yProps(2)} 
                />
                <StyledTab 
                  label="Upload File" 
                  icon={<DescriptionIcon />} 
                  iconPosition="start" 
                  {...a11yProps(3)} 
                />
              </StyledTabs>
            </Box>

            <TabPanel value={tabIndex} index={0}>
              <InputForm 
                onSubmit={handleSubmit} 
                isGenerating={isGenerating}
                isGenerationComplete={isGenerationComplete}
              />
              {isGenerating && (
                <Alert 
                  severity="info" 
                  icon={<CircularProgress size={20} />}
                  sx={{ mt: 3 }}
                >
                  {generationStatus}
                </Alert>
              )}
              {isGenerationComplete && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  Your case study has been generated and is available in the Case Study tab.
                </Alert>
              )}
            </TabPanel>
            
            <TabPanel value={tabIndex} index={1}>
              <CaseStudyDisplay 
                caseStudy={finalCaseStudy}
                title={caseStudyTitle}
                author={authorName}
                acknowledgements={acknowledgements}
              />
            </TabPanel>
            
            <TabPanel value={tabIndex} index={2}>
              <GuidingQuestions questions={reviewQuestions} />
            </TabPanel>
            
            <TabPanel value={tabIndex} index={3}>
              <FileUpload uploadEndpoint={process.env.REACT_APP_FILE_UPLOAD_URL || "http://localhost:5001/upload"} />
            </TabPanel>
          </Paper>
          
          <Box component="footer" sx={{ py: 3, mt: 4, textAlign: 'center' }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              © 2025 EduCaseAI Studio | Powered by React and OpenAI
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
