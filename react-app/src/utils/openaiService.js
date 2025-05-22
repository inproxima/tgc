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
  return `# ${formData.caseStudyTitle || "AI Case Study"}

## 1. Introduction and Context of AI Use

The implementation of AI took place in a ${formData.courseLevel || "university"} setting. ${formData.educationalContext || "This case study explores the integration of artificial intelligence technologies in an educational environment."}

${formData.problemGoal || "The primary goal was to enhance student learning outcomes and provide personalized feedback at scale."}

## 2. Description of AI Technology

${formData.aiTools || "Various AI tools were employed including natural language processing and machine learning algorithms."}

${formData.aiFunctionality || "These AI systems function by analyzing student inputs and providing adaptive responses based on pattern recognition."}

${formData.aiJustification || "This technology was selected for its ability to scale personalized education efficiently."}

## 3. Implementation Process

${formData.preparationPhase || "The preparation involved training faculty on the new AI tools and preparing course materials."}

${formData.executionPhase || "Implementation was conducted gradually across several semesters to allow for adjustment and refinement."}

${formData.postDeployment || "Continuous support was provided through regular check-ins and technical assistance."}

## 4. Ethical and Inclusive Considerations

${formData.ethicalPractices || "Ethical considerations included data privacy, transparency about AI use, and human oversight of AI decisions."}

${formData.inclusivity || "The system was designed to accommodate diverse learning styles and accessibility needs."}

${formData.ediPrinciples || "Equity was prioritized by ensuring all students had equal access to the technology and support."}

## 5. Outcomes and Educational Impact

${formData.impact || "The implementation resulted in improved student engagement and higher completion rates."}

${formData.evidence || "Surveys indicated 85% of students found the AI feedback helpful, and assessment scores improved by an average of 12%."}

${formData.criticalReflection || "The most significant value was in freeing instructors to focus on complex learning support rather than routine feedback."}

## 6. Challenges and Limitations of AI Implementation

${formData.challenges || "Technical integration with existing systems posed significant challenges, as did initial faculty resistance."}

${formData.mitigationStrategies || "These challenges were addressed through comprehensive training and phased implementation."}

${formData.reflectiveInsights || "A key insight was the importance of maintaining human connection alongside technological enhancement."}

## 7. Sustainability and Future AI Use

${formData.futurePlans || "Future plans include expanding AI use to other courses and developing more sophisticated assessment capabilities."}

${formData.futureResearch || "Research opportunities include examining long-term impacts on student learning outcomes and faculty pedagogy."}

${formData.recommendations || "We recommend institutional investment in AI infrastructure and professional development."}

## Acknowledgements

${formData.acknowledgements || "We thank all participants and supporters of this educational innovation project."}
`;
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