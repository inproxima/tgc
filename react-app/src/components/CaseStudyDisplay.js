import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  Stack,
  useTheme 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';

function CaseStudyDisplay({ caseStudy, title, author, acknowledgements }) {
  const theme = useTheme();
  
  // If no case study, show empty state
  if (!caseStudy) {
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
        <ArticleIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
        <Typography variant="h5" gutterBottom>
          No Case Study Generated Yet
        </Typography>
        <Typography 
          color="text.secondary" 
          sx={{ maxWidth: 500, mb: 3 }}
        >
          Your generated case study will appear here once you complete the form and click "Generate Case Study".
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

  // Function to handle downloading the case study as markdown
  const handleMarkdownDownload = () => {
    // Format the markdown content
    const fullContent = `# ${title}\n\n**Author:** ${author}\n\n${caseStudy}${acknowledgements ? `\n\n**Acknowledgements**\n${acknowledgements}` : ''}`;
    
    // Create a blob with the content
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_case_study.md';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle downloading the case study as DOCX (Word)
  const handleWordDownload = async () => {
    try {
      // Parse the case study for content and sections
      // First, split the content by headings (lines that start with ##)
      const contentLines = caseStudy.split('\n');
      const docParagraphs = [];
      
      // Add title paragraphs
      docParagraphs.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: `Author: ${author}`,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: " ", // Empty paragraph for spacing
        })
      );
      
      // Process each line
      for (let i = 0; i < contentLines.length; i++) {
        const line = contentLines[i];
        
        // Check if it's a heading
        if (line.startsWith('# ')) {
          // Main title (already handled)
          continue;
        } else if (line.startsWith('## ')) {
          // Section heading
          docParagraphs.push(
            new Paragraph({
              text: line.replace('## ', ''),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 240, after: 120 }
            })
          );
        } else if (line.startsWith('### ')) {
          // Subsection heading
          docParagraphs.push(
            new Paragraph({
              text: line.replace('### ', ''),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            })
          );
        } else if (line.trim() === '') {
          // Empty line
          if (i > 0 && contentLines[i-1].trim() !== '') {
            // Only add spacing if previous line wasn't empty
            docParagraphs.push(new Paragraph({}));
          }
        } else {
          // Regular paragraph
          // Process inline formatting (bold, italics, etc.)
          const textRuns = [];
          let text = line;
          
          // First pass: Handle bold formatting
          const boldRegex = /\*\*(.*?)\*\*/g;
          let processedText = '';
          let lastIndex = 0;
          let match;
          let boldSegments = [];
          
          while ((match = boldRegex.exec(text)) !== null) {
            // Add text before the bold segment
            processedText += text.substring(lastIndex, match.index);
            // Add a placeholder for the bold segment
            const placeholder = `__BOLD_${boldSegments.length}__`;
            boldSegments.push(match[1]);
            processedText += placeholder;
            lastIndex = match.index + match[0].length;
          }
          
          // Add any remaining text
          if (lastIndex < text.length) {
            processedText += text.substring(lastIndex);
          }
          
          // Second pass: Handle italic formatting on the processed text
          const italicRegex = /\*(.*?)\*/g;
          lastIndex = 0;
          text = processedText;
          processedText = '';
          
          while ((match = italicRegex.exec(text)) !== null) {
            // Add text before the italic segment
            const beforeText = text.substring(lastIndex, match.index);
            processedSegment(beforeText, false, textRuns, boldSegments);
            
            // Add the italic segment
            processedSegment(match[1], true, textRuns, boldSegments);
            
            lastIndex = match.index + match[0].length;
          }
          
          // Add any remaining text
          if (lastIndex < text.length) {
            processedSegment(text.substring(lastIndex), false, textRuns, boldSegments);
          }
          
          // If no formatting was found, just add the whole line
          if (textRuns.length === 0) {
            textRuns.push(
              new TextRun({
                text: line
              })
            );
          }
          
          docParagraphs.push(
            new Paragraph({
              children: textRuns
            })
          );
        }
      }
      
      // Helper function to process text segments with bold/italic formatting
      function processedSegment(text, isItalic, textRuns, boldSegments) {
        // Check if the segment contains any bold placeholders
        const boldPlaceholderRegex = /__BOLD_(\d+)__/g;
        let lastIndex = 0;
        let match;
        
        while ((match = boldPlaceholderRegex.exec(text)) !== null) {
          // Add text before the placeholder
          if (match.index > lastIndex) {
            textRuns.push(
              new TextRun({
                text: text.substring(lastIndex, match.index),
                italic: isItalic
              })
            );
          }
          
          // Add the bold text
          const boldIndex = parseInt(match[1]);
          textRuns.push(
            new TextRun({
              text: boldSegments[boldIndex],
              bold: true,
              italic: isItalic
            })
          );
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add any remaining text
        if (lastIndex < text.length) {
          textRuns.push(
            new TextRun({
              text: text.substring(lastIndex),
              italic: isItalic
            })
          );
        }
      }
      
      // Add acknowledgements if present
      if (acknowledgements) {
        docParagraphs.push(
          new Paragraph({
            text: "Acknowledgements",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 }
          }),
          new Paragraph({
            text: acknowledgements
          })
        );
      }

      // Create the document with a single section containing all paragraphs
      const doc = new Document({
        title: title,
        creator: author,
        description: "AI Case Study generated with AI Case Study Generator",
        sections: [{
          properties: {},
          children: docParagraphs
        }]
      });

      // Generate and save docx file
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, "ai_case_study.docx");
      });
    } catch (error) {
      console.error("Error generating Word document:", error);
      alert("There was an error generating the Word document. Please try again.");
    }
  };

  return (
    <Box>
      <Paper 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: theme.shape.borderRadius, 
          boxShadow: theme.shadows[1] 
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2rem' }, 
            fontWeight: 700,
            color: theme.palette.primary.main,
            mt: 1
          }}
        >
          {title}
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          <strong>Author:</strong> {author}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box 
          sx={{ 
            typography: 'body1', 
            lineHeight: 1.8, 
            fontSize: '1.05rem',
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
            '& ul, & ol': {
              pl: 3,
              mb: 2
            }
          }}
        >
          <ReactMarkdown>{caseStudy}</ReactMarkdown>
        </Box>
        
        {acknowledgements && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Acknowledgements
            </Typography>
            <Typography variant="body1">
              {acknowledgements}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
        <Button 
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={handleMarkdownDownload}
          size="large"
        >
          Download as Markdown
        </Button>
        <Button 
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleWordDownload}
          size="large"
        >
          Download as Word Document
        </Button>
      </Stack>
    </Box>
  );
}

export default CaseStudyDisplay; 