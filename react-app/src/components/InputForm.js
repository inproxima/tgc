import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';

function InputForm({ onSubmit, isGenerating, isGenerationComplete }) {
  // Use refs for form fields instead of state
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Collect form data from DOM elements
    const formData = {
      caseStudyTitle: e.target.caseStudyTitle.value,
      authorName: e.target.authorName.value,
      courseLevel: e.target.courseLevel.value,
      educationalContext: e.target.educationalContext.value,
      problemGoal: e.target.problemGoal.value,
      aiTools: e.target.aiTools.value,
      aiFunctionality: e.target.aiFunctionality.value,
      aiJustification: e.target.aiJustification.value,
      preparationPhase: e.target.preparationPhase.value,
      executionPhase: e.target.executionPhase.value,
      postDeployment: e.target.postDeployment.value,
      ethicalPractices: e.target.ethicalPractices.value,
      inclusivity: e.target.inclusivity.value,
      ediPrinciples: e.target.ediPrinciples.value,
      impact: e.target.impact.value,
      evidence: e.target.evidence.value,
      criticalReflection: e.target.criticalReflection.value,
      challenges: e.target.challenges.value,
      mitigationStrategies: e.target.mitigationStrategies.value,
      reflectiveInsights: e.target.reflectiveInsights.value,
      futurePlans: e.target.futurePlans.value,
      futureResearch: e.target.futureResearch.value,
      recommendations: e.target.recommendations.value,
      acknowledgements: e.target.acknowledgements.value
    };
    
    onSubmit(formData);
  };

  // Section component for better organization
  const FormSection = ({ title, children }) => (
    <Box 
      mb={4} 
      sx={{
        backgroundColor: 'background.default',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box 
        sx={{ 
          backgroundColor: 'primary.light',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" color="white" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );

  // Field label component
  const FieldLabel = ({ label, required }) => (
    <Typography variant="body2" fontWeight={500} gutterBottom>
      {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
    </Typography>
  );

  // Apply the same grid layout to ensure consistent full width
  const renderTextField = (label, name, placeholder, required = false, multiline = false, rows = 1) => {
    return (
    <Box sx={{ mb: 2, width: '100%' }}>
      <FieldLabel label={label} required={required} />
        {multiline ? (
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
        required={required}
        rows={rows}
            defaultValue=""
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #c4c4c4',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '16px',
              resize: 'vertical',
              backgroundColor: '#fff',
              marginBottom: '8px'
            }}
          />
        ) : (
          <input
            type="text"
        id={name}
        name={name}
        placeholder={placeholder}
            required={required}
            defaultValue=""
            style={{
            width: '100%',
              padding: '12px',
              border: '1px solid #c4c4c4',
              borderRadius: '4px',
              fontFamily: 'inherit',
              fontSize: '16px',
              backgroundColor: '#fff',
              marginBottom: '8px',
              boxSizing: 'border-box'
        }}
      />
        )}
    </Box>
  );
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <FormSection title="Case Study Information">
        {renderTextField("Case Study Title", "caseStudyTitle", "e.g., Implementing AI in Undergraduate Biology Courses", true)}
        {renderTextField("Author's Name", "authorName", "e.g., Jane Doe", true)}
      </FormSection>
      
      <FormSection title="1. Introduction and Context of AI Use">
        {renderTextField("Course Level", "courseLevel", "e.g., Undergraduate, Graduate, Professional Development", true)}
        {renderTextField("Educational Context", "educationalContext", "Describe the specific educational context (course, discipline, learner demographics).", true, true, 3)}
        {renderTextField("Problem, Opportunity, or Goal", "problemGoal", "Define the key problem, opportunity, or goal addressed through AI integration.", true, true, 3)}
      </FormSection>
      
      <FormSection title="2. Description of AI Technology">
        {renderTextField("AI Tools or Platforms", "aiTools", "Identify the specific AI tools or platforms used (e.g., specific software, applications, models).", true, true, 3)}
        
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={6} sx={{ width: '100%' }}>
            {renderTextField("AI Functionality", "aiFunctionality", "Explain briefly how the technology functions (e.g., machine learning model, generative AI).", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ width: '100%' }}>
            {renderTextField("Technology Justification", "aiJustification", "Justify the choice of AI technology in relation to the stated educational objectives.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="3. Implementation Process">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Preparation Phase", "preparationPhase", "Describe the preparation phase (training faculty, curating datasets, ethical clearance, etc.)", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Execution Phase", "executionPhase", "Detail the actual deployment in classes, workshops, or support systems.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Post-deployment Support", "postDeployment", "Explain ongoing technical or pedagogical assistance, monitoring, etc.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="4. Ethical and Inclusive Considerations">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Ethical AI Practices", "ethicalPractices", "Describe specific actions taken to ensure ethical AI practices (e.g., addressing biases, transparency).", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Inclusivity and Accessibility", "inclusivity", "Detail how inclusivity and accessibility were ensured through AI design or adaptation.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("EDI Principles", "ediPrinciples", "Explain how Equity, Diversity, and Inclusion principles informed decisions about AI use.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="5. Outcomes and Educational Impact">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("AI Impact", "impact", "Clearly articulate how AI directly impacted teaching practices, learning experiences, or educational outcomes.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Evidence of Impact", "evidence", "Provide evidence such as student or faculty feedback, qualitative observations, or quantitative measures.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Critical Reflection", "criticalReflection", "Reflect critically on the role of AI in enhancing or transforming educational experiences.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="6. Challenges and Limitations of AI Implementation">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Challenges and Barriers", "challenges", "Document any significant technical, pedagogical, or institutional barriers encountered.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Mitigation Strategies", "mitigationStrategies", "Describe strategies employed to overcome or mitigate these challenges.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Reflective Insights", "reflectiveInsights", "Provide reflective insights or recommendations for future AI integrations.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="7. Sustainability and Future AI Use">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Future Plans", "futurePlans", "Outline plans or possibilities for continuing, scaling, or adapting AI use in similar contexts.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Future Research", "futureResearch", "Highlight potential areas for future research or development arising from the current implementation.", false, true, 3)}
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ width: '100%' }}>
            {renderTextField("Recommendations", "recommendations", "Suggest recommendations for institutional support or policy considerations for ongoing AI adoption.", false, true, 3)}
          </Grid>
        </Grid>
      </FormSection>
      
      <FormSection title="Acknowledgements">
        {renderTextField("Acknowledgements (optional)", "acknowledgements", "Add any acknowledgements you wish to include at the end of the case study.", false, true, 3)}
      </FormSection>
      
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'center',
        mt: 2,
        backgroundColor: 'background.default',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Button 
          type="submit" 
          variant="contained" 
          size="medium"
          disabled={isGenerating}
          sx={{ 
            borderRadius: 1,
            textTransform: 'none',
            px: 6,
            py: 1.5,
            fontSize: '1rem',
            minWidth: 250
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Case Study'}
        </Button>
      </Box>
    </form>
  );
}

export default InputForm; 