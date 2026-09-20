import os
import sys

try:
    import pptx
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
    from pptx.dml.color import RGBColor
    from pptx.enum.shapes import MSO_SHAPE
except ImportError:
    os.system(f"{sys.executable} -m pip install python-pptx")
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
    from pptx.dml.color import RGBColor
    from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5) # 4:3 standard aspect ratio matching the template

    # Define color palette matching template
    NAVY = RGBColor(27, 54, 93)      # Header/Title Navy
    RED = RGBColor(180, 30, 30)      # Logo/Header Red
    DARK_BLUE = RGBColor(16, 44, 87) # Frame/Text dark blue
    TEXT_DARK = RGBColor(40, 40, 40)
    BG_WHITE = RGBColor(255, 255, 255)
    GRAY_LINE = RGBColor(180, 180, 180)
    BOX_BG = RGBColor(245, 247, 250)

    blank_layout = prs.slide_layouts[6]

    def add_base_template(slide, title_text="", slide_num=1, show_header_logo=False):
        # Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_WHITE

        # Draw outer border rectangle
        border = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.3), Inches(0.3), Inches(9.4), Inches(6.9)
        )
        border.fill.background()
        border.line.color.rgb = DARK_BLUE
        border.line.width = Pt(1.5)

        if show_header_logo:
            # Top Header for Title Slide
            header_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9.0), Inches(1.5))
            tf = header_box.text_frame
            tf.word_wrap = True
            tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
            
            p1 = tf.paragraphs[0]
            p1.text = "SATHYABAMA"
            p1.font.bold = True
            p1.font.size = Pt(28)
            p1.font.color.rgb = RED
            p1.alignment = PP_ALIGN.CENTER

            p2 = tf.add_paragraph()
            p2.text = "INSTITUTE OF SCIENCE AND TECHNOLOGY\n(DEEMED TO BE UNIVERSITY)"
            p2.font.bold = True
            p2.font.size = Pt(12)
            p2.font.color.rgb = RED
            p2.alignment = PP_ALIGN.CENTER

            p3 = tf.add_paragraph()
            p3.text = "CATEGORY - 1 UNIVERSITY BY UGC\nAccredited with 'A++' grade by NAAC | Approved by AICTE\nwww.sathyabama.ac.in"
            p3.font.size = Pt(9)
            p3.font.color.rgb = DARK_BLUE
            p3.alignment = PP_ALIGN.CENTER

            # Divider line under logo header
            line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(2.0), Inches(9.2), Inches(0.02))
            line.fill.solid()
            line.fill.fore_color.rgb = RED
            line.line.fill.background()
        elif title_text:
            # Standard Slide Title
            title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9.0), Inches(0.8))
            tf = title_box.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = title_text
            p.font.bold = True
            p.font.size = Pt(24)
            p.font.color.rgb = NAVY
            p.alignment = PP_ALIGN.CENTER

            # Line under slide title
            line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(1.3), Inches(9.2), Inches(0.02))
            line.fill.solid()
            line.fill.fore_color.rgb = NAVY
            line.line.fill.background()

        # Footer
        footer_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(6.8), Inches(9.2), Inches(0.01))
        footer_line.fill.solid()
        footer_line.fill.fore_color.rgb = GRAY_LINE
        footer_line.line.fill.background()

        footer_box = slide.shapes.add_textbox(Inches(0.5), Inches(6.85), Inches(9.0), Inches(0.35))
        tf_f = footer_box.text_frame
        tf_f.word_wrap = True
        
        p_f1 = tf_f.paragraphs[0]
        p_f1.text = "20 September 2026"
        p_f1.font.size = Pt(9)
        p_f1.font.color.rgb = GRAY_LINE

        # Middle footer
        p_f2 = tf_f.add_paragraph()
        p_f2.text = "School of Computing - CSE"
        p_f2.font.size = Pt(9)
        p_f2.font.color.rgb = GRAY_LINE
        p_f2.alignment = PP_ALIGN.CENTER
        
        # Right footer (slide number)
        num_box = slide.shapes.add_textbox(Inches(8.5), Inches(6.85), Inches(1.0), Inches(0.35))
        p_num = num_box.text_frame.paragraphs[0]
        p_num.text = str(slide_num)
        p_num.font.size = Pt(9)
        p_num.font.color.rgb = GRAY_LINE
        p_num.alignment = PP_ALIGN.RIGHT

    # -------------------------------------------------------------
    # Slide 1: Title Slide
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    add_base_template(slide1, slide_num=1, show_header_logo=True)

    body_box1 = slide1.shapes.add_textbox(Inches(0.5), Inches(2.2), Inches(9.0), Inches(4.5))
    tf1 = body_box1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER

    p = tf1.add_paragraph()
    p.text = "Professional Training I"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_DARK
    p.alignment = PP_ALIGN.CENTER

    p = tf1.add_paragraph()
    p.text = "AI INTERVIEW COACH AGENT"
    p.font.bold = True
    p.font.size = Pt(22)
    p.font.color.rgb = DARK_BLUE
    p.alignment = PP_ALIGN.CENTER

    p = tf1.add_paragraph()
    p.text = "A Voice-Based Local AI Platform for Interactive Mock Interviews and Personalised Performance Coaching"
    p.font.italic = True
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK
    p.alignment = PP_ALIGN.CENTER

    # Student and Guide details box
    st_box = slide1.shapes.add_textbox(Inches(0.6), Inches(5.0), Inches(4.2), Inches(1.6))
    tf_st = st_box.text_frame
    tf_st.word_wrap = True
    p = tf_st.paragraphs[0]
    p.text = "PROJECT STUDENT"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = NAVY

    p = tf_st.add_paragraph()
    p.text = "DALTA THARUN SAI, 43110253"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK

    gd_box = slide1.shapes.add_textbox(Inches(5.0), Inches(5.0), Inches(4.4), Inches(1.6))
    tf_gd = gd_box.text_frame
    tf_gd.word_wrap = True
    p = tf_gd.paragraphs[0]
    p.text = "GUIDE"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = NAVY

    p = tf_gd.add_paragraph()
    p.text = "Dr. D. Saravanan, M.E., Ph.D.,"
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK

    p = tf_gd.add_paragraph()
    p.text = "Associate Professor, CSE"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_DARK

    # -------------------------------------------------------------
    # Slide 2: AGENDA
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    add_base_template(slide2, title_text="AGENDA", slide_num=2)

    ag_box = slide2.shapes.add_textbox(Inches(1.5), Inches(1.6), Inches(7.0), Inches(5.0))
    tf2 = ag_box.text_frame
    tf2.word_wrap = True

    agenda_items = [
        "Certificate",
        "Abstract",
        "Introduction",
        "Objective",
        "System Architecture / Ideation Map",
        "Module Implementation",
        "Results and Discussions",
        "Conclusion",
        "References"
    ]

    for i, item in enumerate(agenda_items):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"•   {item}"
        p.font.size = Pt(18)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)

    # -------------------------------------------------------------
    # Slide 3: COURSE CERTIFICATE
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    add_base_template(slide3, title_text="COURSE CERTIFICATE", slide_num=3)

    cert_frame = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.5), Inches(1.8), Inches(7.0), Inches(4.5))
    cert_frame.fill.solid()
    cert_frame.fill.fore_color.rgb = BOX_BG
    cert_frame.line.color.rgb = GRAY_LINE

    tf_c = cert_frame.text_frame
    tf_c.word_wrap = True
    p = tf_c.paragraphs[0]
    p.text = "[ Course Certificate Placeholder ]\n\nAttach Course Completion Certificate Here"
    p.font.size = Pt(16)
    p.font.color.rgb = GRAY_LINE
    p.alignment = PP_ALIGN.CENTER

    # -------------------------------------------------------------
    # Slide 4: ABSTRACT
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    add_base_template(slide4, title_text="ABSTRACT", slide_num=4)

    ab_box = slide4.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(8.4), Inches(5.0))
    tf4 = ab_box.text_frame
    tf4.word_wrap = True

    abstract_paras = [
        "• The AI Interview Coach Agent is an intelligent, voice-interactive mock interview platform designed to provide automated technical interview practice and personalized feedback.",
        "• Built using Python, Streamlit, SQLite, and Ollama with a local LLM, the system operates entirely locally on a laptop, eliminating expensive cloud API dependencies and guaranteeing user data privacy.",
        "• The candidate interacts through a Streamlit UI while laptop microphone and camera record spoken responses and simulate a real interview setup. Audio is processed via Speech-to-Text (STT) into textual answers.",
        "• The local AI model evaluates answers across 5 dimensions: Relevance, Technical Correctness, Completeness, Communication Clarity, and Specific Areas for Improvement.",
        "• The application generates real-time question scores, detailed coaching advice, final performance reports, and persistent progress tracking via SQLite to enable continuous candidate growth."
    ]

    for i, para in enumerate(abstract_paras):
        p = tf4.paragraphs[0] if i == 0 else tf4.add_paragraph()
        p.text = para
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(12)

    # -------------------------------------------------------------
    # Slide 5: INTRODUCTION
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    add_base_template(slide5, title_text="INTRODUCTION", slide_num=5)

    intro_box = slide5.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf5 = intro_box.text_frame
    tf5.word_wrap = True

    intro_bullets = [
        ("Background & Motivation:", "Technical job interviews require domain proficiency, quick problem solving, and effective verbal communication. Practicing in realistic scenarios is critical for student success."),
        ("Key Challenges in Existing Solutions:", "Human mock interviews are difficult to schedule and costly. Most online platforms provide static quiz formats without verbal interaction or deep feedback."),
        ("Proposed AI Solution:", "An autonomous, voice-driven AI Interview Coach Agent that acts as a personalized interviewer and mentor directly on the user's laptop."),
        ("Local AI Advantage:", "Utilizes Ollama with open-weight LLMs (e.g., Llama/Mistral), allowing full offline execution without recurring API fees or privacy risks."),
        ("Core Capabilities:", "Dynamic question generation, voice answer evaluation, actionable coaching suggestions, and historical progress tracking over multiple practice sessions.")
    ]

    for i, (heading, desc) in enumerate(intro_bullets):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        run1 = p.add_run()
        run1.text = f"•  {heading} "
        run1.font.bold = True
        run1.font.size = Pt(13)
        run1.font.color.rgb = NAVY

        run2 = p.add_run()
        run2.text = desc
        run2.font.size = Pt(13)
        run2.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)

    # -------------------------------------------------------------
    # Slide 6: OBJECTIVE
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    add_base_template(slide6, title_text="OBJECTIVE", slide_num=6)

    obj_box = slide6.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf6 = obj_box.text_frame
    tf6.word_wrap = True

    p = tf6.paragraphs[0]
    p.text = "Primary Goal:"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = NAVY

    p = tf6.add_paragraph()
    p.text = "To design and implement a standalone, voice-enabled AI Mock Interviewer & Performance Coach that provides real-time evaluation and continuous training recommendations for engineering students."
    p.font.size = Pt(14)
    p.font.color.rgb = TEXT_DARK
    p.space_after = Pt(14)

    p = tf6.add_paragraph()
    p.text = "Specific Technical Objectives:"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = NAVY
    p.space_after = Pt(6)

    objectives = [
        "1. Interactive Web Interface: Build a lightweight, intuitive front-end using Streamlit for candidate details and interview setup.",
        "2. Role-Based Question Generation: Leverage Ollama and local LLMs to generate contextual technical questions based on chosen role and skill level.",
        "3. Realistic Multimodal Interaction: Embed laptop webcam stream and microphone input with Speech-to-Text (STT) conversion.",
        "4. Automated Multi-Criteria Evaluation: Analyze answers for relevance, technical correctness, completeness, and clarity.",
        "5. SQLite Persistence & Progress Tracking: Store session logs, responses, scores, and track score improvement over multiple attempts."
    ]

    for obj in objectives:
        p = tf6.add_paragraph()
        p.text = f"• {obj}"
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(8)

    # -------------------------------------------------------------
    # Slide 7: SYSTEM ARCHITECTURE - End-to-End Flow
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    add_base_template(slide7, title_text="SYSTEM ARCHITECTURE / IDEATION MAP", slide_num=7)

    steps = [
        ("1. Student Input", "Name, Role, Skill Level, Interview Type"),
        ("2. Streamlit UI", "Web front-end interface"),
        ("3. Session Manager", "Creates unique Session ID in SQLite"),
        ("4. Camera + Mic", "Captures candidate video & spoken audio"),
        ("5. Speech-to-Text", "Converts spoken answer to text"),
        ("6. Ollama Local LLM", "Evaluates answer & generates feedback"),
        ("7. SQLite DB", "Stores Q&A, scores, and reports"),
        ("8. Progress Dashboard", "Displays performance trend & coaching tips")
    ]

    box_width = Inches(4.0)
    box_height = Inches(1.0)

    for idx, (title, desc) in enumerate(steps):
        col = idx % 2
        row = idx // 2

        left = Inches(0.8 + col * 4.6)
        top = Inches(1.6 + row * 1.25)

        shape = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, box_width, box_height)
        shape.fill.solid()
        shape.fill.fore_color.rgb = BOX_BG
        shape.line.color.rgb = NAVY
        shape.line.width = Pt(1.5)

        tf = shape.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.05)

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.bold = True
        p1.font.size = Pt(12)
        p1.font.color.rgb = NAVY

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_DARK

    # -------------------------------------------------------------
    # Slide 8: SYSTEM ARCHITECTURE - Controller & Hardware Mapping
    # -------------------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    add_base_template(slide8, title_text="SYSTEM ARCHITECTURE (CONTROLLER HIERARCHY)", slide_num=8)

    arch_box = slide8.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf8 = arch_box.text_frame
    tf8.word_wrap = True

    p = tf8.paragraphs[0]
    p.text = "Central Controller: Python Application Logic"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    components = [
        ("Streamlit Front-End", "Renders Home, Setup form, Live Camera feed, Question view, Instant Feedback, and Dashboard."),
        ("Ollama AI Engine", "Runs local LLM (e.g. Llama-3/Mistral) for question synthesis and structured answer evaluation."),
        ("SQLite Storage Engine", "Maintains relational schema (`users`, `sessions`, `questions`, `answers`, `performance`)."),
        ("Hardware Interfacing", "Integrates laptop webcam video stream and laptop microphone audio capture via STT pipeline."),
        ("Controller Orchestration", "Python coordinates session state, turn switching, score aggregation, and report generation.")
    ]

    for name, desc in components:
        p = tf8.add_paragraph()
        run1 = p.add_run()
        run1.text = f"•  {name}: "
        run1.font.bold = True
        run1.font.size = Pt(13)
        run1.font.color.rgb = DARK_BLUE

        run2 = p.add_run()
        run2.text = desc
        run2.font.size = Pt(13)
        run2.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)

    # -------------------------------------------------------------
    # Slide 9: MODULE IMPLEMENTATION - 1. User Interface
    # -------------------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    add_base_template(slide9, title_text="MODULE IMPLEMENTATION: 1. USER INTERFACE", slide_num=9)

    m1_box = slide9.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf9 = m1_box.text_frame
    tf9.word_wrap = True

    p = tf9.paragraphs[0]
    p.text = "Module 1: Streamlit Front-End Interface"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    m1_points = [
        "• Purpose: Serves as the primary user touchpoint for configuration, interview participation, and progress viewing.",
        "• Setup Parameters Captured:",
        "    - Student Name (e.g., Charan)",
        "    - Target Job Role (e.g., Python Developer, Data Analyst, Java Developer)",
        "    - Candidate Skill Level (Beginner / Intermediate / Advanced)",
        "    - Interview Type (Technical / HR / Mixed)",
        "    - Question Limit (Default: 5 questions per session)",
        "• Clean UI Workflow: Replaces complex web stacks with pure Python + Streamlit controls, rendering dynamic widgets and instant page transitions."
    ]

    for pt in m1_points:
        p = tf9.add_paragraph()
        p.text = pt
        p.font.size = Pt(13) if not pt.startswith("    -") else Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(6)

    # -------------------------------------------------------------
    # Slide 10: MODULE IMPLEMENTATION - 2 & 3. Interview & Question
    # -------------------------------------------------------------
    slide10 = prs.slides.add_slide(blank_layout)
    add_base_template(slide10, title_text="MODULE IMPLEMENTATION: 2 & 3. INTERVIEW & QUESTION GENERATION", slide_num=10)

    m2_box = slide10.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf10 = m2_box.text_frame
    tf10.word_wrap = True

    p = tf10.paragraphs[0]
    p.text = "Module 2: Interview Management"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    m2_points = [
        "• Creates unique Session ID (e.g. Session #1001) in SQLite upon clicking 'START INTERVIEW'.",
        "• Activates laptop webcam container for realistic video presence during the session.",
        "• Controls audio recording via laptop microphone and triggers Speech-to-Text conversion."
    ]
    for pt in m2_points:
        p = tf10.add_paragraph()
        p.text = pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    p = tf10.add_paragraph()
    p.text = "\nModule 3: Question Generation"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    m3_points = [
        "• Constructs prompt combining Job Role + Skill Level and queries Ollama local LLM.",
        "• Dynamically synthesizes 5 progressive technical questions tailored to candidate level.",
        "• Demonstration Sequence: Q1: Python Basics -> Q2: Data Types -> Q3: List vs Tuple -> Q4: Functions -> Q5: Exception Handling."
    ]
    for pt in m3_points:
        p = tf10.add_paragraph()
        p.text = pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    # -------------------------------------------------------------
    # Slide 11: MODULE IMPLEMENTATION - 4 & 5. Answer Analysis & Coaching
    # -------------------------------------------------------------
    slide11 = prs.slides.add_slide(blank_layout)
    add_base_template(slide11, title_text="MODULE IMPLEMENTATION: 4 & 5. ANSWER ANALYSIS & COACHING", slide_num=11)

    m4_box = slide11.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf11 = m4_box.text_frame
    tf11.word_wrap = True

    p = tf11.paragraphs[0]
    p.text = "Module 4: Answer Analysis (Ollama Local AI)"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    p = tf11.add_paragraph()
    p.text = "• Evaluates candidate's spoken text answer against question prompt across 5 parameters:"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_DARK

    params = [
        "1. Relevance (Did student directly answer question?)",
        "2. Correctness (Is technical explanation accurate?)",
        "3. Completeness (Were essential concepts covered?)",
        "4. Communication (Is explanation clear and structured?)",
        "5. Improvement Areas (What key aspects were missing?)"
    ]
    for param in params:
        p = tf11.add_paragraph()
        p.text = f"    - {param}"
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_DARK

    p = tf11.add_paragraph()
    p.text = "\nModule 5: Feedback & Coaching Engine"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    m5_points = [
        "• Generates instant score (e.g. 8/10), verified strengths, areas to improve, and practical tips.",
        "• Transforms standard questioning into an interactive coaching session before moving to Next Question."
    ]
    for pt in m5_points:
        p = tf11.add_paragraph()
        p.text = pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    # -------------------------------------------------------------
    # Slide 12: MODULE IMPLEMENTATION - 6 & 7. Performance & Data Management
    # -------------------------------------------------------------
    slide12 = prs.slides.add_slide(blank_layout)
    add_base_template(slide12, title_text="MODULE IMPLEMENTATION: 6 & 7. PERFORMANCE & DATA MANAGEMENT", slide_num=12)

    m6_box = slide12.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf12 = m6_box.text_frame
    tf12.word_wrap = True

    p = tf12.paragraphs[0]
    p.text = "Module 6: Performance Management & Reporting"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    m6_points = [
        "• Compiles Final Interview Performance Report after all 5 questions complete.",
        "• Computes Overall Percentage (e.g. 78%), Technical Knowledge (8/10), Answer Quality (7/10), and Communication (8/10).",
        "• Generates personalized Training Recommendations (e.g. 'Practice Python Data Structures', 'Explain with examples')."
    ]
    for pt in m6_points:
        p = tf12.add_paragraph()
        p.text = pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    p = tf12.add_paragraph()
    p.text = "\nModule 7: Data Management (SQLite Database)"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY

    m7_points = [
        "• Database File: `interview_coach.db` created locally in project folder.",
        "• Stores users, sessions, questions, answers, scores, feedback, and performance history.",
        "• Enables historical comparisons and continuous progress tracking across practice attempts."
    ]
    for pt in m7_points:
        p = tf12.add_paragraph()
        p.text = pt
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(4)

    # -------------------------------------------------------------
    # Slide 13: DATABASE SCHEMA
    # -------------------------------------------------------------
    slide13 = prs.slides.add_slide(blank_layout)
    add_base_template(slide13, title_text="SQLITE DATABASE SCHEMA", slide_num=13)

    db_box = slide13.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf13 = db_box.text_frame
    tf13.word_wrap = True

    p = tf13.paragraphs[0]
    p.text = "Relational Structure of `interview_coach.db`:"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)

    tables = [
        ("users", "user_id (PK), name, created_at"),
        ("interview_sessions", "session_id (PK), user_id (FK), job_role, skill_level, interview_type, start_time, end_time, overall_score"),
        ("questions", "question_id (PK), session_id (FK), question_number, question_text"),
        ("answers", "answer_id (PK), question_id (FK), answer_text, score, feedback, suggestion"),
        ("performance", "performance_id (PK), session_id (FK), strengths, weaknesses, recommendations, overall_score")
    ]

    for tbl_name, fields in tables:
        p = tf13.add_paragraph()
        run1 = p.add_run()
        run1.text = f"•  Table `{tbl_name}`: "
        run1.font.bold = True
        run1.font.size = Pt(12)
        run1.font.color.rgb = DARK_BLUE

        run2 = p.add_run()
        run2.text = fields
        run2.font.size = Pt(12)
        run2.font.color.rgb = TEXT_DARK
        p.space_after = Pt(6)

    # -------------------------------------------------------------
    # Slide 14: RESULTS AND DISCUSSIONS - Sample Question Analysis
    # -------------------------------------------------------------
    slide14 = prs.slides.add_slide(blank_layout)
    add_base_template(slide14, title_text="RESULTS & DISCUSSIONS: SAMPLE INTERVIEW SESSION", slide_num=14)

    box_l = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(4.0), Inches(4.8))
    box_l.fill.solid()
    box_l.fill.fore_color.rgb = BOX_BG
    box_l.line.color.rgb = NAVY

    tf_l = box_l.text_frame
    tf_l.word_wrap = True
    p = tf_l.paragraphs[0]
    p.text = "Question & Student Response"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = NAVY

    p = tf_l.add_paragraph()
    p.text = "\nQuestion 1 of 5:\n\"What is Python?\""
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = DARK_BLUE

    p = tf_l.add_paragraph()
    p.text = "\nSpoken Answer (Transcribed):\n\"Python is a high-level programming language. It is easy to read and supports object-oriented programming.\""
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_DARK

    box_r = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.1), Inches(1.6), Inches(4.1), Inches(4.8))
    box_r.fill.solid()
    box_r.fill.fore_color.rgb = BOX_BG
    box_r.line.color.rgb = NAVY

    tf_r = box_r.text_frame
    tf_r.word_wrap = True
    p = tf_r.paragraphs[0]
    p.text = "AI Feedback Output"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = NAVY

    fb_text = (
        "Score: 8 / 10\n\n"
        "Strengths:\n"
        "✓ Correct definition\n"
        "✓ Relevant explanation\n"
        "✓ Good fundamental understanding\n\n"
        "Areas to Improve:\n"
        "• Mention Python's dynamic typing\n"
        "• Explain one practical use case\n\n"
        "Coaching Suggestion:\n"
        "Include 2–3 key language features when explaining introductory concepts."
    )
    p = tf_r.add_paragraph()
    p.text = fb_text
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_DARK

    # -------------------------------------------------------------
    # Slide 15: RESULTS AND DISCUSSIONS - Final Performance Report
    # -------------------------------------------------------------
    slide15 = prs.slides.add_slide(blank_layout)
    add_base_template(slide15, title_text="RESULTS & DISCUSSIONS: PERFORMANCE REPORT", slide_num=15)

    rep_box = slide15.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf15 = rep_box.text_frame
    tf15.word_wrap = True

    p = tf15.paragraphs[0]
    p.text = "Sample Candidate Performance Summary (Session #1001 - Charan):"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY
    p.space_after = Pt(8)

    rep_details = [
        ("Overall Score:", "78%"),
        ("Technical Knowledge:", "8 / 10"),
        ("Answer Quality:", "7 / 10"),
        ("Communication:", "8 / 10"),
        ("Identified Strengths:", "Good Python fundamentals, relevant responses, solid grasp of basic syntax."),
        ("Areas to Improve:", "Data structures depth, detailed technical explanations, structured formatting."),
        ("Training Action Plan:", "1. Practice Python data structures (Lists, Tuples, Dicts, Sets).\n2. Practice explaining concepts with practical code examples.\n3. Take follow-up mock interview.")
    ]

    for label, val in rep_details:
        p = tf15.add_paragraph()
        run1 = p.add_run()
        run1.text = f"•  {label} "
        run1.font.bold = True
        run1.font.size = Pt(12)
        run1.font.color.rgb = DARK_BLUE

        run2 = p.add_run()
        run2.text = val
        run2.font.size = Pt(12)
        run2.font.color.rgb = TEXT_DARK
        p.space_after = Pt(5)

    # -------------------------------------------------------------
    # Slide 16: RESULTS AND DISCUSSIONS - Progress Dashboard
    # -------------------------------------------------------------
    slide16 = prs.slides.add_slide(blank_layout)
    add_base_template(slide16, title_text="RESULTS & DISCUSSIONS: PROGRESS DASHBOARD", slide_num=16)

    dash_box = slide16.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf16 = dash_box.text_frame
    tf16.word_wrap = True

    p = tf16.paragraphs[0]
    p.text = "Continuous Learning & Progress Tracking:"
    p.font.bold = True
    p.font.size = Pt(14)
    p.font.color.rgb = NAVY
    p.space_after = Pt(10)

    p = tf16.add_paragraph()
    p.text = "• Candidate Attempt Progress over successive practice sessions:"
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_DARK

    attempts = [
        ("Attempt 1:", "62% - Initial Baseline"),
        ("Attempt 2:", "70% - Improved Basics"),
        ("Attempt 3:", "78% - Better Explanation Structure"),
        ("Attempt 4:", "84% - Target Proficiency Reached")
    ]
    for att, res in attempts:
        p = tf16.add_paragraph()
        p.text = f"    - {att} {res}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK

    p = tf16.add_paragraph()
    p.text = "\n• Analytics Insights:"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = NAVY

    insights = [
        "Best Score Achieved: 84%",
        "Strongest Technical Area: Python Fundamentals",
        "Focus Area for Further Practice: Advanced Data Structures & Memory Management"
    ]
    for ins in insights:
        p = tf16.add_paragraph()
        p.text = f"    - {ins}"
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK

    # -------------------------------------------------------------
    # Slide 17: CONCLUSION
    # -------------------------------------------------------------
    slide17 = prs.slides.add_slide(blank_layout)
    add_base_template(slide17, title_text="CONCLUSION", slide_num=17)

    conc_box = slide17.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf17 = conc_box.text_frame
    tf17.word_wrap = True

    conclusions = [
        ("Project Summary:", "Successfully developed a fully functional, local AI Interview Coach Agent combining Streamlit UI, Ollama LLM, SQLite storage, and Speech-to-Text audio processing."),
        ("Key Contribution:", "Provides students with an accessible, zero-cost, privacy-preserving mock interview coach that delivers personalized multi-criteria feedback and actionable training suggestions."),
        ("System Strengths:", "100% local execution, real-time voice response evaluation, continuous progress tracking, and interactive user experience."),
        ("Future Enhancements:", "1. Implement Text-to-Speech (TTS) for voice-spoken questions.\n2. Optional Computer Vision features (facial presence, eye tracking, attention cues).\n3. Expand multi-domain question repositories and mock coding environments.")
    ]

    for title, body in conclusions:
        p = tf17.add_paragraph()
        run1 = p.add_run()
        run1.text = f"•  {title}\n   "
        run1.font.bold = True
        run1.font.size = Pt(13)
        run1.font.color.rgb = NAVY

        run2 = p.add_run()
        run2.text = body
        run2.font.size = Pt(12)
        run2.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)

    # -------------------------------------------------------------
    # Slide 18: REFERENCES
    # -------------------------------------------------------------
    slide18 = prs.slides.add_slide(blank_layout)
    add_base_template(slide18, title_text="REFERENCES", slide_num=18)

    ref_box = slide18.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(8.4), Inches(5.2))
    tf18 = ref_box.text_frame
    tf18.word_wrap = True

    references = [
        "[1] Streamlit Inc., \"Streamlit Documentation and Web Application Framework,\" 2024. [Online]. Available: https://docs.streamlit.io",
        "[2] Ollama Team, \"Ollama: Get up and running with Llama 3, Mistral, and other large language models locally,\" 2024. [Online]. Available: https://ollama.com",
        "[3] SQLite Development Team, \"SQLite Database Engine Official Documentation and Python Integration Guide,\" 2024. [Online]. Available: https://sqlite.org",
        "[4] Python Software Foundation, \"SpeechRecognition Library and Audio Processing in Python Environment,\" Python 3.10+ Documentation, 2024.",
        "[5] Vaswani et al., \"Attention Is All You Need,\" Advances in Neural Information Processing Systems (NeurIPS), 2017."
    ]

    for ref in references:
        p = tf18.add_paragraph()
        p.text = ref
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(14)

    # -------------------------------------------------------------
    # Slide 19: THANK YOU
    # -------------------------------------------------------------
    slide19 = prs.slides.add_slide(blank_layout)
    add_base_template(slide19, title_text="THANK YOU", slide_num=19)

    ty_box = slide19.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(8.4), Inches(3.5))
    tf19 = ty_box.text_frame
    tf19.word_wrap = True

    p = tf19.paragraphs[0]
    p.text = "We thank God, Our Department, Guide, Panel Members, Supportive Professors and all Technical and non Technical staff who helped us in our Project."
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER
    p.space_after = Pt(20)

    output_path = r"c:\Users\yashc\OneDrive\Desktop\virtual tryon\AI_Interview_Coach_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
