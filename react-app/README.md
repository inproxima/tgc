# AI Case Study Generator (React Version)

This is a React-based application that generates APA 7th edition formatted case studies on AI implementation in educational contexts. It's a conversion of the original Python/Streamlit application.

## Features

- User-friendly form interface for inputting case study details
- Generates structured case studies following APA 7th edition format
- Provides guiding questions to help expand and improve the case study
- Download options for both case studies and guiding questions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. To use the AI generation capabilities, you need to set up environment variables:
   - Create a `.env` file in the root directory
   - Add your OpenAI API key: `REACT_APP_OPENAI_API_KEY=your_key_here`

### Running the App

To start the development server:

```bash
npm start
```

This will launch the app in development mode. Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

### Building for Production

To build the app for production:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## How to Use

1. Fill out the form fields in the Input Form tab
2. Click "Generate Case Study" to create your case study
3. View your generated case study in the Case Study tab
4. Check the Guiding Questions tab for suggestions to expand your work
5. Download your case study or guiding questions as needed

## Note on AI Integration

This version simulates AI responses for demo purposes. To connect to a real AI backend:

1. Implement a backend service with OpenAI API integration
2. Update the API calls in the React app to communicate with your backend
3. Ensure proper API key management and security

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Original Python/Streamlit version
- OpenAI for AI technology
- React community for frontend tools and libraries
