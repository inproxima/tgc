// This service calls the backend API that handles OpenAI API requests
// The backend handles the actual OpenAI API calls securely

import axios from 'axios';

// API base URL - adjust if your server runs on a different port
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// Create an axios instance with error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Add a longer timeout as AI generation can take time
  timeout: 60000 // 60 seconds
});

/**
 * Generates a case study based on form data
 * @param {Object} formData - The form data collected from the input form
 * @returns {Promise<string>} - The generated case study text
 */
export const generateCaseStudy = async (formData) => {
  try {
    console.log('Sending case study generation request:', formData);
    const response = await apiClient.post('/generate-case-study', formData);
    console.log('Case study generation response received');
    return response.data.caseStudy;
  } catch (error) {
    console.error("Error generating case study:", error);
    console.error("Error response:", error.response?.data);
    
    // If we can't connect to the server, return a sample case study for testing
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.log("Using sample case study data since server appears to be offline");
      return getSampleCaseStudy(formData);
    }
    
    throw error;
  }
};

// Helper function to return sample case study when the server is not available
function getSampleCaseStudy(formData) {
  let caseStudy = `# ${formData.caseStudyTitle || "AI Case Study"}\n\n`;

  // Helper function to check if a field has content
  const hasContent = (field) => field && field.trim().length > 0;

  // 1. Introduction and Context of AI Use
  let introSection = "";
  if (hasContent(formData.courseLevel)) {
    introSection += `Course Level: ${formData.courseLevel}\n\n`;
  }
  if (hasContent(formData.educationalContext)) {
    introSection += `Educational Context: ${formData.educationalContext}\n\n`;
  }
  if (hasContent(formData.problemGoal)) {
    introSection += `Problem, Opportunity, or Goal: ${formData.problemGoal}\n\n`;
  }
  
  if (introSection) {
    caseStudy += `## 1. Introduction and Context of AI Use\n\n${introSection}`;
  }

  // 2. Description of AI Technology
  let techSection = "";
  if (hasContent(formData.aiTools)) {
    techSection += `AI Tools or Platforms: ${formData.aiTools}\n\n`;
  }
  if (hasContent(formData.aiFunctionality)) {
    techSection += `AI Functionality: ${formData.aiFunctionality}\n\n`;
  }
  if (hasContent(formData.aiJustification)) {
    techSection += `Technology Justification: ${formData.aiJustification}\n\n`;
  }
  
  if (techSection) {
    caseStudy += `## 2. Description of AI Technology\n\n${techSection}`;
  }

  // 3. Implementation Process
  let implSection = "";
  if (hasContent(formData.preparationPhase)) {
    implSection += `Preparation Phase: ${formData.preparationPhase}\n\n`;
  }
  if (hasContent(formData.executionPhase)) {
    implSection += `Execution Phase: ${formData.executionPhase}\n\n`;
  }
  if (hasContent(formData.postDeployment)) {
    implSection += `Post-deployment Support: ${formData.postDeployment}\n\n`;
  }
  
  if (implSection) {
    caseStudy += `## 3. Implementation Process\n\n${implSection}`;
  }

  // 4. Ethical and Inclusive Considerations
  let ethicsSection = "";
  if (hasContent(formData.ethicalPractices)) {
    ethicsSection += `Ethical AI Practices: ${formData.ethicalPractices}\n\n`;
  }
  if (hasContent(formData.inclusivity)) {
    ethicsSection += `Inclusivity and Accessibility: ${formData.inclusivity}\n\n`;
  }
  if (hasContent(formData.ediPrinciples)) {
    ethicsSection += `EDI Principles: ${formData.ediPrinciples}\n\n`;
  }
  
  if (ethicsSection) {
    caseStudy += `## 4. Ethical and Inclusive Considerations\n\n${ethicsSection}`;
  }

  // 5. Outcomes and Educational Impact
  let outcomesSection = "";
  if (hasContent(formData.impact)) {
    outcomesSection += `AI Impact: ${formData.impact}\n\n`;
  }
  if (hasContent(formData.evidence)) {
    outcomesSection += `Evidence of Impact: ${formData.evidence}\n\n`;
  }
  if (hasContent(formData.criticalReflection)) {
    outcomesSection += `Critical Reflection: ${formData.criticalReflection}\n\n`;
  }
  
  if (outcomesSection) {
    caseStudy += `## 5. Outcomes and Educational Impact\n\n${outcomesSection}`;
  }

  // 6. Challenges and Limitations
  let challengesSection = "";
  if (hasContent(formData.challenges)) {
    challengesSection += `Challenges and Barriers: ${formData.challenges}\n\n`;
  }
  if (hasContent(formData.mitigationStrategies)) {
    challengesSection += `Mitigation Strategies: ${formData.mitigationStrategies}\n\n`;
  }
  if (hasContent(formData.reflectiveInsights)) {
    challengesSection += `Reflective Insights: ${formData.reflectiveInsights}\n\n`;
  }
  
  if (challengesSection) {
    caseStudy += `## 6. Challenges and Limitations of AI Implementation\n\n${challengesSection}`;
  }

  // 7. Sustainability and Future Use
  let futureSection = "";
  if (hasContent(formData.futurePlans)) {
    futureSection += `Future Plans: ${formData.futurePlans}\n\n`;
  }
  if (hasContent(formData.futureResearch)) {
    futureSection += `Future Research: ${formData.futureResearch}\n\n`;
  }
  if (hasContent(formData.recommendations)) {
    futureSection += `Recommendations: ${formData.recommendations}\n\n`;
  }
  
  if (futureSection) {
    caseStudy += `## 7. Sustainability and Future AI Use\n\n${futureSection}`;
  }

  // Acknowledgements (optional section)
  if (hasContent(formData.acknowledgements)) {
    caseStudy += `## Acknowledgements\n\n${formData.acknowledgements}\n\n`;
  }

  return caseStudy;
}

/**
 * Find and enhance citations in the case study
 * @param {string} caseStudy - The case study text with placeholders
 * @returns {Promise<Object>} - The enhanced case study and references
 */
export const enhanceCitations = async (caseStudy) => {
  try {
    console.log('Sending citation enhancement request');
    const response = await apiClient.post('/enhance-citations', { caseStudy });
    console.log('Citation enhancement response received');
    return {
      enhancedCaseStudy: response.data.enhancedCaseStudy,
      references: response.data.references
    };
  } catch (error) {
    console.error("Error enhancing citations:", error);
    console.error("Error response:", error.response?.data);
    
    // Fallback to sample citation data if server is unavailable
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.log("Using sample citation data since server appears to be offline");
      return getSampleCitations(caseStudy);
    }
    
    // Fallback to returning the original case study without enhancements
    return { enhancedCaseStudy: caseStudy, references: [] };
  }
};

// Sample citations helper
function getSampleCitations(caseStudy) {
  // Add some sample citations
  const enhancedCaseStudy = caseStudy.replace(/\(placeholder:[^)]+\)/g, '(Smith, 2022)');
  
  const references = [
    "Smith, J. (2022). Artificial intelligence in education: A comprehensive review. Journal of Educational Technology, 45(2), 112-128.",
    "Johnson, A. & Brown, B. (2021). Implementing AI in higher education: Opportunities and challenges. Educational Innovation Quarterly, 18(3), 45-61.",
    "Lee, M. (2023). Ethical considerations in educational AI applications. International Journal of Learning Science, 10(4), 89-102."
  ];
  
  return { enhancedCaseStudy, references };
}

/**
 * Integrate citations properly throughout the case study
 * @param {string} caseStudy - The case study with citation placeholders
 * @param {Array<string>} references - The list of academic references
 * @returns {Promise<string>} - The case study with properly integrated citations
 */
export const integrateCitations = async (caseStudy, references) => {
  try {
    if (!references || references.length === 0) {
      return caseStudy;
    }
    
    console.log('Sending citation integration request');
    const response = await apiClient.post('/integrate-citations', { 
      caseStudy, 
      references 
    });
    console.log('Citation integration response received');
    
    return response.data.integratedCaseStudy;
  } catch (error) {
    console.error("Error integrating citations:", error);
    console.error("Error response:", error.response?.data);
    
    // If server is unavailable, return case study with references appended
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.log("Using simple citation integration since server appears to be offline");
      // Append references as a simple list
      const referenceSection = "\n\n## References\n\n" + references.join("\n\n");
      return caseStudy + referenceSection;
    }
    
    // Fallback: Append references as a simple list
    const referenceSection = "\n\n## References\n\n" + references.join("\n\n");
    return caseStudy + referenceSection;
  }
};

/**
 * Generate guiding questions based on the case study
 * @param {string} caseStudy - The completed case study
 * @returns {Promise<string>} - The guiding questions
 */
export const generateGuidingQuestions = async (caseStudy) => {
  try {
    console.log('Sending guiding questions request');
    const response = await apiClient.post('/generate-questions', { caseStudy });
    console.log('Guiding questions response received');
    return response.data.questions;
  } catch (error) {
    console.error("Error generating guiding questions:", error);
    console.error("Error response:", error.response?.data);
    
    // If server is unavailable, return sample questions
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.log("Using sample guiding questions since server appears to be offline");
      return getSampleGuidingQuestions();
    }
    
    throw error;
  }
};

// Sample guiding questions
function getSampleGuidingQuestions() {
  return `
## Guiding Questions for Review and Improvement

1. **Implementation Details**: How might you expand on the specific steps taken during the preparation phase to ensure faculty were adequately prepared to use the AI tools?

2. **Student Experience**: What methods were used to gather student feedback about their experience with the AI system, and how might this feedback process be improved?

3. **Ethical Considerations**: Can you elaborate on any specific ethical challenges that emerged during implementation and how they were addressed?

4. **Quantitative Impact**: What specific metrics beyond assessment scores were tracked to measure the effectiveness of the AI implementation?

5. **Inclusivity Verification**: How did you confirm that the AI system was truly accessible to all students, including those with disabilities or limited technology access?

6. **Scalability Considerations**: What infrastructure or resource limitations might affect the scalability of this AI implementation to other courses or institutions?

7. **Long-term Support**: What ongoing maintenance and update procedures have been established to ensure the sustainability of the AI system beyond the initial implementation?
`;
} 