const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
const allowedReactAppOrigin = process.env.CORS_ORIGIN_REACT_APP || 'http://localhost:3000';

app.use(cors({
  origin: allowedReactAppOrigin,
  methods: ['GET', 'POST'], // Adjust methods as needed by your API
  credentials: true // If you use cookies or sessions
}));
app.use(bodyParser.json());

// Check if OpenAI API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set in the .env file');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Generate case study endpoint
app.post('/api/generate-case-study', async (req, res) => {
  try {
    console.log('Received case study generation request');
    const formData = req.body;
    
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('ERROR: OPENAI_API_KEY is not set in the environment');
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured',
        details: 'The server is missing the OPENAI_API_KEY environment variable' 
      });
    }
    
    // Prepare the case study sections
    const caseStudySections = prepareSections(formData);
    console.log('Prepared case study sections');
    
    // Create the case study prompt
    const caseStudyPrompt = `
    Generate a comprehensive case study in APA 7th edition format about AI implementation in an educational context based on the following information.
    
    The case study should be written as a cohesive academic narrative that flows naturally between topics, while covering only these sections that have content:
    ${caseStudySections}
    
    Format guidelines:
    - Write in a flowing academic narrative style that connects ideas across sections
    - Include ONLY the main section headings as provided above to improve readability
    - DO NOT include sections that were not provided in the input
    - Do NOT include any subheadings within sections
    - Create placeholder for citations for any academic claim.
    - The tone should be academic but accessible, with a focus on practical insights
    
    When you need to include a citation, use the format (placeholder: topic) where "topic" briefly describes what the citation is about. For example, (placeholder: AI bias in education) or (placeholder: learning analytics).
    `;
    
    console.log('Calling OpenAI API...');
    
    try {
      // Call OpenAI to generate the case study
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert academic writer specializing in education technology and AI implementation case studies. You follow APA 7th edition formatting perfectly." 
          },
          { role: "user", content: caseStudyPrompt }
        ]
      });
      
      const caseStudy = completion.choices[0].message.content;
      console.log('Successfully generated case study');
      
      res.status(200).json({ caseStudy });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      console.error('Error details:', openaiError.response?.data || 'No detailed error data');
      res.status(500).json({ 
        error: 'OpenAI API error', 
        details: openaiError.message,
        openaiError: openaiError.response?.data
      });
    }
  } catch (error) {
    console.error('Error generating case study:', error);
    res.status(500).json({ error: 'Failed to generate case study', details: error.message });
  }
});

// Enhance citations endpoint
app.post('/api/enhance-citations', async (req, res) => {
  try {
    const { caseStudy } = req.body;
    
    // Extract citation placeholders from the case study
    const placeholderRegex = /\(placeholder:?\s*([^)]+)\)/g;
    const matches = [...caseStudy.matchAll(placeholderRegex)];
    
    if (matches.length === 0) {
      return res.status(200).json({ 
        enhancedCaseStudy: caseStudy, 
        references: [] 
      });
    }
    
    // Create arrays to store references and their mappings
    const references = [];
    const placeholderMap = {};
    
    // Extract unique placeholders
    const placeholders = [...new Set(matches.map(match => match[0]))];
    
    // For each placeholder, find an appropriate academic source
    for (const placeholder of placeholders) {
      const topic = placeholder.match(/\(placeholder:?\s*([^)]+)\)/)[1].trim();
      
      try {
        // Use OpenAI to find an appropriate academic source for this placeholder
        const searchPrompt = `
        Find a real academic source (journal article or book) that would be appropriate for a citation about: '${topic}' 
        in the context of AI in education or educational technology implementation.
        
        Return ONLY a properly formatted APA 7th edition reference entry.
        Do not include any explanation or additional text.
        `;
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: searchPrompt }]
        });
        
        // Get the citation from the response
        const citation = completion.choices[0].message.content.trim();
        
        // Extract author and year for in-text citation
        const authorYearMatch = citation.match(/^([^(]+)\((\d{4})/);
        let inTextCitation = "(Author, YYYY)";
        
        if (authorYearMatch) {
          const author = authorYearMatch[1].trim().split(',')[0].trim();
          const year = authorYearMatch[2];
          inTextCitation = `(${author}, ${year})`;
        }
        
        // Add to mapping and references list
        placeholderMap[placeholder] = {
          inText: inTextCitation,
          fullReference: citation
        };
        
        references.push(citation);
        
      } catch (error) {
        console.error(`Error finding citation for '${topic}':`, error);
        continue;
      }
    }
    
    // Replace placeholders in the case study
    let enhancedCaseStudy = caseStudy;
    for (const [placeholder, citation] of Object.entries(placeholderMap)) {
      enhancedCaseStudy = enhancedCaseStudy.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
        citation.inText
      );
    }
    
    res.status(200).json({
      enhancedCaseStudy,
      references
    });
  } catch (error) {
    console.error('Error enhancing citations:', error);
    res.status(500).json({ 
      error: 'Failed to enhance citations', 
      details: error.message 
    });
  }
});

// Integrate citations endpoint
app.post('/api/integrate-citations', async (req, res) => {
  try {
    const { caseStudy, references } = req.body;
    
    if (!references || references.length === 0) {
      return res.status(200).json({ 
        integratedCaseStudy: caseStudy 
      });
    }
    
    // Prepare the citation integration prompt
    const citationPrompt = `
    You are an expert academic writer specializing in education technology and AI implementation case studies.
    
    Below is a case study about AI implementation in education that contains citation placeholders in the format (placeholder: topic).
    
    Please rewrite this case study by:
    1. Integrating the following academic references appropriately throughout the text where the placeholders appear
    2. Maintaining the exact same content and structure of the original case study
    3. Adding a properly formatted References section at the end following APA 7th edition guidelines
    4. Using proper in-text citations (Author, Year) that correspond to the references list
    
    Case Study:
    ${caseStudy}
    
    Available References to Integrate:
    ${references.join('\n')}
    
    Important instructions:
    - Preserve the academic narrative flow of the case study
    - Maintain the EXACT same section structure as the original case study - do not add or remove any sections
    - Keep all section headings exactly as they are in the original
    - Do NOT add any subheadings
    - Maintain all original content and insights
    - Only modify the citation placeholders to use proper academic citations
    - Use each reference where it is most relevant to the topic being discussed
    - Ensure every reference is used at least once in the text
    - Add a properly formatted References section at the end
    `;
    
    // Call OpenAI to rewrite the case study with proper citations
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are an expert academic writer specializing in education technology and AI implementation case studies. You follow APA 7th edition formatting perfectly." 
        },
        { role: "user", content: citationPrompt }
      ]
    });
    
    const integratedCaseStudy = completion.choices[0].message.content;
    
    res.status(200).json({ integratedCaseStudy });
  } catch (error) {
    console.error('Error integrating citations:', error);
    
    // Fallback: Append references as a simple list
    const referenceSection = "\n\n## References\n\n" + req.body.references.join("\n\n");
    const fallbackCaseStudy = req.body.caseStudy + referenceSection;
    
    res.status(200).json({ 
      integratedCaseStudy: fallbackCaseStudy,
      warning: 'Error occurred during citation integration. Using fallback format.'
    });
  }
});

// Generate guiding questions endpoint
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { caseStudy } = req.body;
    
    // Prepare review prompt
    const reviewPrompt = `
    Based on the following case study, generate 5-7 thoughtful questions that could help the author expand and improve their work.
    Focus on areas that might be underdeveloped, need more evidence, or could benefit from additional perspectives.
    
    Case study: ${caseStudy}
    `;
    
    // Call OpenAI to generate guiding questions
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are an expert academic reviewer who provides constructive feedback on case studies about AI in education." 
        },
        { role: "user", content: reviewPrompt }
      ]
    });
    
    const questions = completion.choices[0].message.content;
    
    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error generating guiding questions:', error);
    res.status(500).json({ 
      error: 'Failed to generate guiding questions', 
      details: error.message 
    });
  }
});

// Helper function to prepare sections from form data
function prepareSections(formData) {
  const sections = {
    "1. Introduction and Context of AI Use": {
      "Course Level": formData.courseLevel,
      "Educational Context": formData.educationalContext,
      "Problem, Opportunity, or Goal": formData.problemGoal
    },
    "2. Description of AI Technology": {
      "AI Tools or Platforms": formData.aiTools,
      "AI Functionality": formData.aiFunctionality,
      "Technology Justification": formData.aiJustification
    },
    "3. Implementation Process": {
      "Preparation Phase": formData.preparationPhase,
      "Execution Phase": formData.executionPhase,
      "Post-deployment Support": formData.postDeployment
    },
    "4. Ethical and Inclusive Considerations": {
      "Ethical AI Practices": formData.ethicalPractices,
      "Inclusivity and Accessibility": formData.inclusivity,
      "EDI Principles": formData.ediPrinciples
    },
    "5. Outcomes and Educational Impact": {
      "AI Impact": formData.impact,
      "Evidence of Impact": formData.evidence,
      "Critical Reflection": formData.criticalReflection
    },
    "6. Challenges and Limitations of AI Implementation": {
      "Challenges and Barriers": formData.challenges,
      "Mitigation Strategies": formData.mitigationStrategies,
      "Reflective Insights": formData.reflectiveInsights
    },
    "7. Sustainability and Future AI Use": {
      "Future Plans": formData.futurePlans,
      "Future Research": formData.futureResearch,
      "Recommendations": formData.recommendations
    }
  };
  
  let caseStudySections = "";
  
  for (const [sectionTitle, fields] of Object.entries(sections)) {
    // Check if this section has any non-empty fields
    const nonEmptyFields = {};
    let hasContent = false;
    
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      // Check if field has actual content (not just whitespace)
      if (fieldValue && fieldValue.trim().length > 0) {
        nonEmptyFields[fieldName] = fieldValue.trim();
        hasContent = true;
      }
    }
    
    // Only include the section if it has at least one non-empty field
    if (hasContent) {
      caseStudySections += `\n\n${sectionTitle}\n`;
      
      // Add only the non-empty fields
      for (const [fieldName, fieldValue] of Object.entries(nonEmptyFields)) {
        caseStudySections += `\n${fieldName}: ${fieldValue}\n`;
      }
    }
  }
  
  return caseStudySections;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 