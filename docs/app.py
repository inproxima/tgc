import streamlit as st
import os
import re
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up page configuration
st.set_page_config(
    page_title="AI Case Study Generator",
    page_icon="📚",
    layout="wide"
)

st.title("AI Case Study Generator")
st.markdown("This tool generates APA 7th edition formatted case studies on AI implementation in educational contexts.")

# Add sidebar with instructions and about
with st.sidebar:
    st.header("Instructions")
    st.markdown("""
    1. Fill out the form fields in the **Input Form** tab.
    2. Click 'Generate Case Study' to create your case study.
    3. View your generated case study in the **Case Study** tab.
    4. Check the **Guiding Questions** tab for suggestions to expand your work.
    """)
    
    st.header("About")
    st.markdown("""
    This tool uses OpenAI's GPT model to generate structured case studies 
    about AI implementation in educational contexts, following APA 7th 
    edition formatting guidelines with proper academic citations.
    """)

# Create session state variables if they don't exist
if 'final_case_study' not in st.session_state:
    st.session_state.final_case_study = None
    
if 'review_questions' not in st.session_state:
    st.session_state.review_questions = None

if 'current_tab' not in st.session_state:
    st.session_state.current_tab = "Form"
    
if 'generation_complete' not in st.session_state:
    st.session_state.generation_complete = False

# Add session state for author and acknowledgements if not present
if 'author_name' not in st.session_state:
    st.session_state.author_name = ''
if 'acknowledgements' not in st.session_state:
    st.session_state.acknowledgements = ''

# Add session state for case study title if not present
if 'case_study_title' not in st.session_state:
    st.session_state.case_study_title = ''

# Create tabs
tab1, tab2, tab3 = st.tabs(["Input Form", "Case Study", "Guiding Questions"])

# Input Form tab
with tab1:
    # Updated helper function following Streamlit conventions
    def field_with_help(field_type, key, label, placeholder, help_text, height=None, **kwargs):
        if field_type == "text_input":
            field = st.text_input(
                label, 
                placeholder=placeholder,
                help=help_text,
                key=key, 
                **kwargs
            )
        elif field_type == "text_area":
            field = st.text_area(
                label, 
                placeholder=placeholder, 
                help=help_text,
                height=height, 
                key=key, 
                **kwargs
            )
        return field

    # Main form
    st.header("Case Study Information")

    # Function to find and replace citation placeholders with real academic sources
    def enhance_citations(case_study):
        # Extract citation placeholders from the case study
        placeholders = re.findall(r'\(placeholder:?\s*([^)]+)\)', case_study)
        
        if not placeholders:
            return case_study, []  # No placeholders found
        
        # Create a list to store the references and their mappings
        references = []
        placeholder_to_citation = {}
        
        # For each placeholder, search for an appropriate academic source
        for placeholder_text in placeholders:
            placeholder_text = placeholder_text.strip()
            
            # Use OpenAI to find an appropriate academic source for this placeholder
            try:
                search_prompt = f"""
                Find a real academic source (journal article or book) that would be appropriate for a citation about: '{placeholder_text}' 
                in the context of AI in education or educational technology implementation.
                
                Return ONLY a properly formatted APA 7th edition reference entry.
                Do not include any explanation or additional text.
                """
                
                completion = client.chat.completions.create(
                    model="gpt-4o-search-preview",
                    web_search_options={},  # Enable web search
                    messages=[
                        {"role": "user", "content": search_prompt}
                    ]
                )
                
                # Get the citation from the response
                citation = completion.choices[0].message.content.strip()
                
                # Extract author and year for in-text citation
                author_year_match = re.match(r'([^(]+)\((\d{4})', citation)
                if author_year_match:
                    author = author_year_match.group(1).strip().split(',')[0].strip()
                    year = author_year_match.group(2)
                    in_text_citation = f"({author}, {year})"
                else:
                    # Fallback if we can't parse the author/year
                    in_text_citation = f"(Author, YYYY)"
                    
                # Add to mapping and references list
                full_placeholder = f"(placeholder: {placeholder_text})"
                placeholder_to_citation[full_placeholder] = {
                    "in_text": in_text_citation,
                    "full_reference": citation
                }
                references.append(citation)
                
                # Log the mapping for debugging (will not be displayed to user)
                print(f"Mapped '{full_placeholder}' to {in_text_citation}")
                
            except Exception as e:
                # If there's an error, keep the placeholder
                print(f"Error finding citation for '{placeholder_text}': {str(e)}")
                continue
        
        # Replace placeholders in the case study
        enhanced_case_study = case_study
        for placeholder, citation_info in placeholder_to_citation.items():
            enhanced_case_study = enhanced_case_study.replace(placeholder, citation_info["in_text"])
        
        # Return the enhanced case study and the list of references
        return enhanced_case_study, references

    # Function to rewrite case study with proper academic citations
    def integrate_citations(case_study, references):
        # Skip if no references were found
        if not references or len(references) == 0:
            return case_study
        
        # Prepare the citation integration prompt
        citation_prompt = f"""
        You are an expert academic writer specializing in education technology and AI implementation case studies.
        
        Below is a case study about AI implementation in education that contains citation placeholders in the format (placeholder: topic).
        
        Please rewrite this case study by:
        1. Integrating the following academic references appropriately throughout the text where the placeholders appear
        2. Maintaining the exact same content and structure of the original case study
        3. Adding a properly formatted References section at the end following APA 7th edition guidelines
        4. Using proper in-text citations (Author, Year) that correspond to the references list
        
        Case Study:
        {case_study}
        
        Available References to Integrate:
        {chr(10).join(references)}
        
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
        """
        
        try:
            # Call OpenAI to rewrite the case study with proper citations
            completion = client.chat.completions.create(
                model="gpt-4.1",
                messages=[
                    {"role": "developer", "content": "You are an expert academic writer specializing in education technology and AI implementation case studies. You follow APA 7th edition formatting perfectly."},
                    {"role": "user", "content": citation_prompt}
                ]
            )
            
            # Return the rewritten case study
            return completion.choices[0].message.content
        
        except Exception as e:
            # If there's an error, log it and return the original case study with references appended
            print(f"Error integrating citations: {str(e)}")
            
            # Fallback: Append references as a simple list
            reference_section = "\n\n## References\n\n"
            for ref in references:
                reference_section += f"{ref}\n\n"
            
            return case_study + reference_section

    with st.form("case_study_form"):
        # Case Study Title (required)
        case_study_title = field_with_help(
            "text_input",
            "case_study_title",
            "Case Study Title",
            "e.g., Implementing AI in Undergraduate Biology Courses",
            "Enter a descriptive title for your case study. This will appear at the top of the case study.",
        )
        # Author's Name (required)
        author_name = field_with_help(
            "text_input",
            "author_name",
            "Author's Name",
            "e.g., Jane Doe",
            "Enter the full name of the author. This will appear at the top of the case study.",
        )
        # Section 1: Introduction and Context of AI Use
        st.subheader("1. Introduction and Context of AI Use")
        
        # Course Level
        course_level = field_with_help(
            "text_input",
            "course_level",
            "Course Level",
            "e.g., Undergraduate, Graduate, Professional Development",
            "Specify the academic level at which the AI was implemented. This provides context for the educational setting and target audience."
        )
        
        # Educational Context
        educational_context = field_with_help(
            "text_area",
            "educational_context",
            "Educational Context",
            "Describe the specific educational context (course, discipline, learner demographics).",
            "Include details about the course or program, subject area, discipline, and student demographics. This helps situate your case study in a specific educational framework.",
            height=100
        )
        
        # Problem or Goal
        problem_goal = field_with_help(
            "text_area",
            "problem_goal",
            "Problem, Opportunity, or Goal",
            "Define the key problem, opportunity, or goal addressed through AI integration.",
            "Clearly articulate what motivated the AI implementation. Was it to solve a particular challenge, improve a process, or enhance learning outcomes? This establishes the purpose of your AI integration.",
            height=100
        )
        
        # Section 2: Description of AI Technology
        st.subheader("2. Description of AI Technology")
        
        # AI Tools
        ai_tools = field_with_help(
            "text_area",
            "ai_tools",
            "AI Tools or Platforms",
            "Identify the specific AI tools or platforms used (e.g., specific software, applications, models).",
            "Name and describe the specific AI tools, platforms, or technologies used. Be as specific as possible (e.g., 'OpenAI GPT-4' rather than just 'AI'). This helps others understand exactly what tools were employed.",
            height=100
        )
        
        # AI Functionality
        ai_functionality = field_with_help(
            "text_area",
            "ai_functionality",
            "AI Functionality",
            "Explain briefly how the technology functions (e.g., machine learning model, generative AI).",
            "Provide a concise explanation of how the AI technology works. This doesn't need to be highly technical but should give readers a basic understanding of the technological approach.",
            height=100
        )
        
        # Justification
        ai_justification = field_with_help(
            "text_area",
            "ai_justification",
            "Technology Justification",
            "Justify the choice of AI technology in relation to the stated educational objectives.",
            "Explain why this specific AI technology was chosen for your educational context. Connect the technology choice directly to your learning objectives or challenges being addressed.",
            height=100
        )
        
        # Section 3: Implementation Process
        st.subheader("3. Implementation Process")
        
        # Preparation Phase
        preparation_phase = field_with_help(
            "text_area",
            "preparation_phase",
            "Preparation Phase",
            "Describe the preparation phase (training faculty, curating datasets, ethical clearance, etc.)",
            "Detail the steps taken before actual implementation, such as faculty training, technology setup, data preparation, securing permissions, or pilot testing. This shows the groundwork required for successful implementation.",
            height=100
        )
        
        # Execution Phase
        execution_phase = field_with_help(
            "text_area",
            "execution_phase",
            "Execution Phase",
            "Detail the actual deployment in classes, workshops, or support systems.",
            "Describe how the AI was actually deployed and used in the educational setting. Include information about the timeline, student interaction, and integration into existing teaching practices.",
            height=100
        )
        
        # Post-deployment Support
        post_deployment = field_with_help(
            "text_area",
            "post_deployment",
            "Post-deployment Support",
            "Explain ongoing technical or pedagogical assistance, monitoring, etc.",
            "Outline the support systems put in place after implementation, such as technical support, monitoring for issues, continuous training, or iterative improvements based on feedback.",
            height=100
        )
        
        # Section 4: Ethical and Inclusive Considerations
        st.subheader("4. Ethical and Inclusive Considerations")
        
        # Ethical Practices
        ethical_practices = field_with_help(
            "text_area",
            "ethical_practices",
            "Ethical AI Practices",
            "Describe specific actions taken to ensure ethical AI practices (e.g., addressing biases, transparency).",
            "Explain specific measures taken to ensure ethical use of AI, such as bias detection and mitigation, transparent communication about AI use, data privacy protections, or informed consent processes.",
            height=100
        )
        
        # Inclusivity
        inclusivity = field_with_help(
            "text_area",
            "inclusivity",
            "Inclusivity and Accessibility",
            "Detail how inclusivity and accessibility were ensured through AI design or adaptation.",
            "Describe how the AI implementation accounted for diverse learning needs, accessibility requirements, and inclusion of all students regardless of background or ability.",
            height=100
        )
        
        # EDI Principles
        edi_principles = field_with_help(
            "text_area",
            "edi_principles",
            "EDI Principles",
            "Explain how Equity, Diversity, and Inclusion principles informed decisions about AI use.",
            "Articulate how considerations of equity, diversity, and inclusion shaped the implementation approach, including how potential barriers were identified and addressed.",
            height=100
        )
        
        # Section 5: Outcomes and Educational Impact
        st.subheader("5. Outcomes and Educational Impact")
        
        # Impact
        impact = field_with_help(
            "text_area",
            "impact",
            "AI Impact",
            "Clearly articulate how AI directly impacted teaching practices, learning experiences, or educational outcomes.",
            "Describe the concrete ways in which the AI implementation affected teaching and learning. Focus on specific changes, improvements, or transformations rather than general statements.",
            height=100
        )
        
        # Evidence
        evidence = field_with_help(
            "text_area",
            "evidence",
            "Evidence of Impact",
            "Provide evidence such as student or faculty feedback, qualitative observations, or quantitative measures.",
            "Include specific evidence that demonstrates the impact, such as assessment results, student feedback, faculty observations, or comparative data. This strengthens the credibility of your case study.",
            height=100
        )
        
        # Critical Reflection
        critical_reflection = field_with_help(
            "text_area",
            "critical_reflection",
            "Critical Reflection",
            "Reflect critically on the role of AI in enhancing or transforming educational experiences.",
            "Offer thoughtful analysis of how and why AI influenced the educational experience, considering both intended and unintended effects, limitations, and deeper implications.",
            height=100
        )
        
        # Section 6: Challenges and Limitations
        st.subheader("6. Challenges and Limitations of AI Implementation")
        
        # Challenges
        challenges = field_with_help(
            "text_area",
            "challenges",
            "Challenges and Barriers",
            "Document any significant technical, pedagogical, or institutional barriers encountered.",
            "Honestly describe difficulties encountered during implementation, which might include technical issues, resistance to adoption, institutional constraints, or pedagogical challenges.",
            height=100
        )
        
        # Mitigation Strategies
        mitigation_strategies = field_with_help(
            "text_area",
            "mitigation_strategies",
            "Mitigation Strategies",
            "Describe strategies employed to overcome or mitigate these challenges.",
            "Explain approaches used to address the challenges identified, including adaptations, workarounds, or solutions developed in response to specific barriers.",
            height=100
        )
        
        # Reflective Insights
        reflective_insights = field_with_help(
            "text_area",
            "reflective_insights",
            "Reflective Insights",
            "Provide reflective insights or recommendations for future AI integrations.",
            "Share deeper reflections on what was learned through addressing challenges, including insights that might help others avoid similar issues or more effectively implement AI.",
            height=100
        )
        
        # Section 7: Sustainability and Future AI Use
        st.subheader("7. Sustainability and Future AI Use")
        
        # Future Plans
        future_plans = field_with_help(
            "text_area",
            "future_plans",
            "Future Plans",
            "Outline plans or possibilities for continuing, scaling, or adapting AI use in similar contexts.",
            "Describe how this AI implementation might continue, expand, or evolve in the future, including plans for sustainability, scaling, or adaptation to other contexts.",
            height=100
        )
        
        # Future Research
        future_research = field_with_help(
            "text_area",
            "future_research",
            "Future Research",
            "Highlight potential areas for future research or development arising from the current implementation.",
            "Identify questions, gaps, or opportunities for further investigation that emerged from this implementation, suggesting avenues for future research or development.",
            height=100
        )
        
        # Recommendations
        recommendations = field_with_help(
            "text_area",
            "recommendations",
            "Recommendations",
            "Suggest recommendations for institutional support or policy considerations for ongoing AI adoption.",
            "Offer specific, actionable recommendations for institutional policies, support structures, or resources that would facilitate effective AI integration in educational settings.",
            height=100
        )
        
        # Acknowledgements (optional, at the end)
        acknowledgements = field_with_help(
            "text_area",
            "acknowledgements",
            "Acknowledgements (optional)",
            "Add any acknowledgements you wish to include at the end of the case study.",
            "This section is optional. Use it to thank contributors, institutions, or anyone who supported your work.",
            height=70
        )
        
        # Submit button
        submitted = st.form_submit_button("Generate Case Study")
    
    # Notification area after the form
    if st.session_state.final_case_study is not None and st.session_state.generation_complete:
        st.success("✅ Your case study has been generated and is available in the Case Study tab.")
        
        if st.session_state.review_questions is not None:
            st.info("📝 Guiding questions for expanding your case study are available in the Guiding Questions tab.")

    # Generate case study when form is submitted
    if submitted:
        required_fields = [case_study_title, author_name, course_level, educational_context, problem_goal, ai_tools]
        if not all(required_fields):
            st.error("Please fill out at least the Case Study Title, Author's Name, Course Level, Educational Context, Problem/Goal, and AI Tools fields before generating the case study.")
        else:
            with st.spinner("Generating your case study..."):
                # Prepare the structured sections and check if they're empty
                section1 = f"""
                Course Level: {course_level}
                
                Educational Context: {educational_context}
                
                Problem, Opportunity, or Goal: {problem_goal}
                """
                
                section2 = f"""
                AI Tools or Platforms: {ai_tools}
                
                AI Functionality: {ai_functionality}
                
                Technology Justification: {ai_justification}
                """
                
                section3 = f"""
                Preparation Phase: {preparation_phase}
                
                Execution Phase: {execution_phase}
                
                Post-deployment Support: {post_deployment}
                """
                
                section4 = f"""
                Ethical AI Practices: {ethical_practices}
                
                Inclusivity and Accessibility: {inclusivity}
                
                EDI Principles: {edi_principles}
                """
                
                section5 = f"""
                AI Impact: {impact}
                
                Evidence of Impact: {evidence}
                
                Critical Reflection: {critical_reflection}
                """
                
                section6 = f"""
                Challenges and Barriers: {challenges}
                
                Mitigation Strategies: {mitigation_strategies}
                
                Reflective Insights: {reflective_insights}
                """
                
                section7 = f"""
                Future Plans: {future_plans}
                
                Future Research: {future_research}
                
                Recommendations: {recommendations}
                """
                
                # Check which sections have content
                section_content = {
                    "1. Introduction and Context of AI Use": section1.strip(),
                    "2. Description of AI Technology": section2.strip(),
                    "3. Implementation Process": section3.strip(),
                    "4. Ethical and Inclusive Considerations": section4.strip(),
                    "5. Outcomes and Educational Impact": section5.strip(),
                    "6. Challenges and Limitations of AI Implementation": section6.strip(),
                    "7. Sustainability and Future AI Use": section7.strip()
                }
                
                # Create the case study structure with only non-empty sections
                case_study_sections = ""
                for title, content in section_content.items():
                    # Check if the section has any actual content beyond field labels
                    has_content = False
                    for line in content.split('\n'):
                        # Skip lines that are just field labels without content
                        if ':' in line and line.split(':', 1)[1].strip() == '':
                            continue
                        if line.strip():  # Any non-empty line that's not just a field label
                            has_content = True
                            break
                    
                    if has_content:
                        case_study_sections += f"\n\n{title}\n{content}\n"
                
                # Prepare prompt for case study generation
                case_study_prompt = f"""
                Generate a comprehensive case study in APA 7th edition format about AI implementation in an educational context based on the following information.
                
                The case study should be written as a cohesive academic narrative that flows naturally between topics, while covering only these sections that have content:
                {case_study_sections}
                
                Format guidelines:
                - Write in a flowing academic narrative style that connects ideas across sections
                - Include ONLY the main section headings as provided above to improve readability
                - DO NOT include sections that were not provided in the input
                - Do NOT include any subheadings within sections
                - Create placeholder for citations for any academic claim.
                - The tone should be academic but accessible, with a focus on practical insights
                
                When you need to include a citation, use the format (placeholder: topic) where "topic" briefly describes what the citation is about. For example, (placeholder: AI bias in education) or (placeholder: learning analytics).
                """
                
                # Generate the case study using OpenAI API
                completion = client.chat.completions.create(
                    model="gpt-4.1",  # Using GPT-4 for higher quality output
                    messages=[
                        {"role": "developer", "content": "You are an expert academic writer specializing in education technology and AI implementation case studies. You follow APA 7th edition formatting perfectly."},
                        {"role": "user", "content": case_study_prompt}
                    ]
                )
                
                case_study = completion.choices[0].message.content
                
                # Find academic citations for placeholders
                with st.spinner("Searching for academic sources..."):
                    _, references = enhance_citations(case_study)
                    
                    # Now integrate citations properly throughout the case study
                    if references:
                        with st.spinner("Integrating academic citations into the case study..."):
                            final_case_study = integrate_citations(case_study, references)
                    else:
                        final_case_study = case_study
                
                # Generate review questions 
                with st.spinner("Generating guiding questions for expansion..."):
                    review_prompt = f"""
                    Based on the following case study, generate 5-7 thoughtful questions that could help the author expand and improve their work.
                    Focus on areas that might be underdeveloped, need more evidence, or could benefit from additional perspectives.
                    
                    Case study: {final_case_study}
                    """
                    
                    # Generate the review questions using OpenAI API
                    review_completion = client.chat.completions.create(
                        model="gpt-4.1",
                        messages=[
                            {"role": "developer", "content": "You are an expert academic reviewer who provides constructive feedback on case studies about AI in education."},
                            {"role": "user", "content": review_prompt}
                        ]
                    )
                    
                    review_questions = review_completion.choices[0].message.content
                
                # Store results in session state
                st.session_state.final_case_study = final_case_study
                st.session_state.review_questions = review_questions
                st.session_state.generation_complete = True
                
                # Automatically switch to the Case Study tab
                st.session_state.current_tab = "Case Study"
                st.rerun()

# Case Study tab
with tab2:
    if st.session_state.final_case_study:
        st.header("Generated Case Study (APA 7th Edition)")
        # Compose the full case study with title, author, and acknowledgements
        case_study_title_display = st.session_state.get("case_study_title", "")
        author_name_display = st.session_state.get("author_name", "")
        case_study_display = (
            f"# {case_study_title_display}\n\n"
            f"**Author:** {author_name_display}\n\n"
            f"{st.session_state.final_case_study}"
        )
        if st.session_state.acknowledgements and st.session_state.acknowledgements.strip():
            case_study_display += f"\n\n**Acknowledgements**\n{st.session_state.acknowledgements.strip()}"
        st.markdown(case_study_display)
        
        # Add download button for the case study
        st.download_button(
            label="Download Case Study",
            data=case_study_display,
            file_name="ai_case_study.md",
            mime="text/markdown"
        )
    else:
        st.info("Please generate a case study using the Input Form tab.")

# Guiding Questions tab
with tab3:
    if st.session_state.review_questions:
        st.header("Guiding Questions for Expansion")
        st.markdown(st.session_state.review_questions)
        
        # Add download button for the review questions
        st.download_button(
            label="Download Guiding Questions",
            data=st.session_state.review_questions,
            file_name="guiding_questions.md", 
            mime="text/markdown"
        )
    else:
        st.info("Please generate a case study first to get guiding questions.")

# Footer
st.markdown("---")
st.markdown("© 2025 AI Case Study Generator | Powered by OpenAI and Streamlit") 