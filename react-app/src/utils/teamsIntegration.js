import axios from 'axios';

// Configuration for Teams integration
const TEAMS_API_ENDPOINT = process.env.REACT_APP_TEAMS_API_ENDPOINT || '/api/teams';

/**
 * Sends a case study to a specific Microsoft Teams channel folder
 * 
 * @param {Object} caseStudyData - The case study content and metadata
 * @param {string} caseStudyData.title - The title of the case study
 * @param {string} caseStudyData.author - The author of the case study
 * @param {string} caseStudyData.content - The content of the case study
 * @param {string} teamId - The Microsoft Teams team ID (optional if set on server)
 * @param {string} channelId - The channel ID within the team (optional if set on server)
 * @param {string} folderId - The folder ID within the channel (optional if set on server)
 * @returns {Promise<Object>} - Response from the API
 */
export const sendToTeams = async (caseStudyData, teamId, channelId, folderId) => {
  try {
    // Convert case study to appropriate format (docx/pdf content as base64 or markdown)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${caseStudyData.title.replace(/[^\w\s]/gi, '')}_${timestamp}.docx`;
    
    // Send request to your backend API that handles Teams integration
    const response = await axios.post(TEAMS_API_ENDPOINT, {
      caseStudyData,
      fileName,
      teamId,
      channelId,
      folderId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending to Teams:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to send to Microsoft Teams';
    if (error.response) {
      // The request was made and the server responded with an error status
      errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from server';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get available Teams, channels, and folders for the current user
 * This can be used to populate selection dropdowns
 * 
 * @returns {Promise<Object>} - Object containing teams, channels, and folders data
 */
export const getTeamsDestinations = async () => {
  try {
    const response = await axios.get(`${TEAMS_API_ENDPOINT}/destinations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Teams destinations:', error);
    throw new Error('Failed to fetch Microsoft Teams destinations');
  }
}; 