import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

function Sidebar() {
  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary.dark">
          Instructions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense sx={{ pl: 1 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <ArrowRightIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">
                Fill out the form fields in the <strong>Input Form</strong> tab
              </Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <ArrowRightIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">
                Click <strong>Generate Case Study</strong> to create your academic case study
              </Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <ArrowRightIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">
                View and download your generated case study in the <strong>Case Study</strong> tab
              </Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <ArrowRightIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">
                Explore the <strong>Guiding Questions</strong> for further development of your work
              </Typography>
            } />
          </ListItem>
        </List>
      </Box>
      
      <Box mb={4}>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary.dark">
          About
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" paragraph>
          This tool helps you craft academically rigorous case studies about AI implementation in educational contexts, based on your knowledge and expertise.
        </Typography>
        <Typography variant="body2" paragraph>
          The tool supports your work by structuring your input and providing formatting consistent with APA 7th edition standards.
        </Typography>
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom fontWeight={600} color="primary.dark">
          Features
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">Structured academic format</Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">APA 7th edition formatting</Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">Academic citations</Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">Word document export</Typography>
            } />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={
              <Typography variant="body2">Guiding questions for expansion</Typography>
            } />
          </ListItem>
        </List>
      </Box>
    </Box>
  );
}

export default Sidebar; 