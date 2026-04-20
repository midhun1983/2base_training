import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, getDocs, deleteDoc } from "firebase/firestore";

// Firebase configuration - REPLACE WITH YOUR PROJECT VALUES
const firebaseConfig = {
  apiKey: "AIzaSyDimpt1Jn0u-_Au8LZoj8jDLeVGidolsfU",
  authDomain: "bs-training.firebaseapp.com",
  projectId: "bs-training",
  storageBucket: "bs-training.firebasestorage.app",
  messagingSenderId: "197780060874",
  appId: "1:197780060874:web:8771b5b465c2733b8f5233"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Optional: Restrict to company domain only
const ALLOWED_DOMAIN = "2base.tech"; // Change to your company domain, or set to null to allow all

// Admin emails - ONLY these users can access admin dashboard
const ADMIN_EMAILS = [
  "midhun@2basetechnologies.com",
  // Add more admin emails here
];

const DAYS = [
  {
    day: 1,
    title: "Claude Foundations & Migration from ChatGPT",
    subtitle: "Why Claude, what makes it different, and making the switch",
    color: "#D4783C",
    sessions: [
      {
        session: "morning",
        title: "Understanding Claude vs ChatGPT",
        reading: [
          { text: "Learn what makes Claude different: longer context (200K tokens), better instruction following, artifacts for work products, computer use for web tasks", url: "https://docs.anthropic.com/en/docs/overview" },
          { text: "Understand Claude's strengths over ChatGPT: analysis depth, document handling, code generation, structured output, safety guardrails", url: null },
          { text: "Study the Claude interface: conversations, Projects, artifacts, voice mode, citations with search", url: null },
          { text: "Learn about Claude models: Opus (complex reasoning), Sonnet (balanced), Haiku (speed) and when to use each", url: null },
        ],
        project: "Create a comparison table documenting 10 common ChatGPT prompts you use. Rewrite each for Claude and test the quality difference. Document what works better and why.",
        skills: ["Model comparison", "Migration strategy", "Feature awareness"],
      },
      {
        session: "afternoon",
        title: "Prompt Engineering for Claude",
        reading: [
          { text: "Master the anatomy of Claude prompts: role, context, task, format, constraints, examples (XML tags for structure)", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
          { text: "Learn Claude-specific techniques: chain-of-thought prompting, prefill for format control, system prompts in Projects", url: null },
          { text: "Practice specificity: 'Analyze this code' vs 'You are a senior QA engineer. Review this Python function for edge cases, error handling, and test coverage. Output findings as a table with severity ratings'", url: null },
          { text: "Understand output formatting: markdown tables, JSON, XML, numbered lists, code blocks with syntax highlighting", url: null },
        ],
        project: "Write 15 domain-specific prompts for your role (BA: requirements analysis, QA: test planning, Delivery: project reporting, P&C: interview guides). Test each and iterate to 5-star quality.",
        skills: ["Prompt engineering", "Output formatting", "Role-specific templating"],
      },
    ],
  },
  {
    day: 2,
    title: "Claude Projects & Knowledge Management",
    subtitle: "Creating persistent AI workspaces with your team's context",
    color: "#3A7BE8",
    sessions: [
      {
        session: "morning",
        title: "Setting Up Claude Projects",
        reading: [
          { text: "Learn Claude Projects: persistent workspaces with uploaded docs, custom instructions, conversation history, and memory", url: "https://docs.claude.com" },
          { text: "Study how to structure Projects: one per major domain (QA standards, delivery templates, BA frameworks, P&C policies)", url: null },
          { text: "Practice uploading team documents: SOPs, templates, style guides, process docs, coding standards, quality rubrics", url: null },
          { text: "Understand Project custom instructions: pre-loading context so Claude always responds with your team's standards", url: null },
        ],
        project: "Create a Project for your domain. Upload 5-10 key documents (templates, SOPs, standards). Write custom instructions. Test 15 questions to verify Claude responds with your team's actual practices.",
        skills: ["Projects setup", "Knowledge upload", "Custom instructions"],
      },
      {
        session: "afternoon",
        title: "Document Analysis & Knowledge Extraction",
        reading: [
          { text: "Learn to upload and analyze PDFs, spreadsheets, Word docs: Claude can read, summarize, extract, compare, and synthesize", url: null },
          { text: "Practice multi-document analysis: 'Compare these 3 requirements docs and identify conflicts, gaps, and redundancies'", url: null },
          { text: "Study how to extract structured data from unstructured documents: meeting notes → action items, emails → decision log", url: null },
          { text: "Understand Claude's file size limits (10MB per file, 5 files at once) and workarounds for larger datasets", url: null },
        ],
        project: "Upload 3-5 work documents (requirements, test plans, project reports, interview notes). Ask Claude to create: summary table, gaps analysis, action items, and synthesized recommendations. Verify accuracy.",
        skills: ["Document analysis", "Data extraction", "Multi-file synthesis"],
      },
    ],
  },
  {
    day: 3,
    title: "Advanced Features: Artifacts, Voice & Computer Use",
    subtitle: "Claude's unique capabilities for work product creation",
    color: "#2EAD6B",
    sessions: [
      {
        session: "morning",
        title: "Artifacts for Work Products",
        reading: [
          { text: "Learn artifacts: Claude creates interactive work products (documents, code, charts, diagrams) in a reusable sidebar", url: null },
          { text: "Practice creating artifacts: 'Create a requirements template with all sections', 'Build a test case matrix for this feature', 'Generate a project status dashboard'", url: null },
          { text: "Study how to iterate artifacts: Claude can edit, extend, and refine artifacts across multiple prompts", url: null },
          { text: "Understand artifact types: documents (markdown), code (React, Python, etc), SVG diagrams, Mermaid charts, interactive HTML", url: null },
        ],
        project: "Create 5 artifacts relevant to your role: a requirements template, test plan template, project report template, decision log, or interview scorecard. Iterate each to production quality.",
        skills: ["Artifact creation", "Template building", "Iterative refinement"],
      },
      {
        session: "afternoon",
        title: "Claude Computer Use (Advanced)",
        reading: [
          { text: "Learn Claude's computer use: it can browse websites, fill forms, interact with web apps, extract data from live sites", url: null },
          { text: "Practice web research tasks: 'Find the top 10 competitor products and build a comparison table with pricing, features, and reviews'", url: null },
          { text: "Study Claude's limitations: cannot access internal systems, requires public URLs, works best with well-structured sites", url: null },
          { text: "Understand safety: always review before Claude submits forms, approves transactions, or shares data", url: null },
        ],
        project: "Assign Claude 5 web research tasks: competitive analysis, technology comparison, pricing research, vendor evaluation, or candidate background research. Review accuracy and time saved.",
        skills: ["Computer use", "Web research", "Data extraction automation"],
      },
    ],
  },
  {
    day: 4,
    title: "Domain-Specific Applications for Leadership",
    subtitle: "BA, QA, Delivery & P&C use cases",
    color: "#9B59B6",
    sessions: [
      {
        session: "morning",
        title: "Business Analysis & Requirements",
        reading: [
          { text: "Learn to use Claude for requirements elicitation: generating interview questions, user story templates, acceptance criteria", url: null },
          { text: "Practice requirements analysis: 'Review these requirements for completeness, testability, and conflicts. Output as a findings table with severity'", url: null },
          { text: "Study how Claude can create BRDs, FRDs, and process flows from rough notes or stakeholder interviews", url: null },
          { text: "Understand Claude's use for gap analysis, impact assessment, and traceability matrix generation", url: null },
        ],
        project: "BA-focused: Create requirements artifacts from a project brief. Generate: user stories, acceptance criteria, traceability matrix, stakeholder questions, and a risk assessment.",
        skills: ["Requirements engineering", "BA documentation", "Gap analysis"],
      },
      {
        session: "afternoon",
        title: "QA, Testing & Delivery Management",
        reading: [
          { text: "Learn to use Claude for test planning: generating test cases, test data, edge cases, regression scenarios", url: null },
          { text: "Practice QA tasks: 'Review this code for bugs, security issues, and edge cases. Create a test plan with priority levels'", url: null },
          { text: "Study delivery management: project status reports, risk registers, dependency analysis, timeline estimation, retrospective facilitation", url: null },
          { text: "Understand Claude for DevSecOps: analyzing logs, troubleshooting deployment issues, security review, infrastructure documentation", url: null },
        ],
        project: "QA/Delivery-focused: Use Claude to create a test plan, project status report, risk register, and retrospective summary for a current or past project. Verify Claude catches real issues you know about.",
        skills: ["Test planning", "Project reporting", "Risk analysis"],
      },
    ],
  },
  {
    day: 5,
    title: "People Management & Coaching with Claude",
    subtitle: "1:1s, feedback, hiring, and team development",
    color: "#C0392B",
    sessions: [
      {
        session: "morning",
        title: "1:1 Preparation & Performance Coaching",
        reading: [
          { text: "Learn to use Claude for 1:1 prep: 'Help me plan a 1:1 with a senior developer who is struggling with code quality. I need talking points that balance empathy and accountability'", url: null },
          { text: "Practice generating development plans: career progression paths, skill gap analysis, learning roadmaps for team members", url: null },
          { text: "Study how Claude can help with performance feedback: constructive, specific, behavior-focused (not personality), with actionable next steps", url: null },
          { text: "Understand coaching conversation scripts: difficult conversations, promotion discussions, performance improvement, conflict resolution", url: null },
        ],
        project: "Prepare Claude-assisted 1:1 plans for 3 team member scenarios: high performer ready for promotion, struggling contributor with specific issues, solid performer who needs growth challenges. Include talking points and development actions.",
        skills: ["1:1 preparation", "Coaching", "Performance feedback"],
      },
      {
        session: "afternoon",
        title: "Hiring, Onboarding & Culture",
        reading: [
          { text: "Learn to use Claude for hiring: job description writing, interview question banks, candidate evaluation rubrics, offer letter drafts", url: null },
          { text: "Practice onboarding content: 30-60-90 day plans, role-specific training paths, company culture docs, team handbooks", url: null },
          { text: "Study how Claude can help with culture initiatives: team values articulation, feedback templates, recognition programs, engagement surveys", url: null },
          { text: "Understand Claude for policy writing: HR policies, remote work guidelines, leave policies, code of conduct, diversity statements", url: null },
        ],
        project: "P&C-focused: Create a hiring kit for a role you're hiring for: job description, 15 interview questions with scoring rubric, candidate evaluation template, and 30-60-90 day onboarding plan.",
        skills: ["Hiring", "Onboarding", "Policy creation"],
      },
    ],
  },
  {
    day: 6,
    title: "Communication & Stakeholder Management",
    subtitle: "Executive updates, client comms, and meeting productivity",
    color: "#E67E22",
    sessions: [
      {
        session: "morning",
        title: "Executive & Client Communication",
        reading: [
          { text: "Learn to use Claude for executive updates: project status for leadership, board updates, investor communications, quarterly reviews", url: null },
          { text: "Practice client communication: proposal drafting, status reports, SOW generation, contract summaries, change requests", url: null },
          { text: "Study tone calibration: Claude can rewrite messages for different audiences (technical → executive, formal → casual, direct → diplomatic)", url: null },
          { text: "Understand multi-audience messaging: one source document → tailored versions for exec, client, team, stakeholders", url: null },
        ],
        project: "Take a current project. Generate: executive summary (200 words), client status update (detailed), board slide deck outline, and team communication. Test each for clarity and completeness.",
        skills: ["Executive communication", "Client messaging", "Multi-audience writing"],
      },
      {
        session: "afternoon",
        title: "Meeting Productivity & Decision Documentation",
        reading: [
          { text: "Learn to use Claude for meeting prep: agenda generation from topics, pre-read creation, discussion guide, decision framework", url: null },
          { text: "Practice post-meeting tasks: convert raw notes → structured minutes, extract action items with owners and deadlines, decision log", url: null },
          { text: "Study retrospective facilitation: Claude can analyze team feedback, identify patterns, generate improvement proposals", url: null },
          { text: "Understand decision documentation: architecture decision records (ADRs), design docs, trade-off analysis, RFC templates", url: null },
        ],
        project: "For your next meeting: use Claude to generate the agenda, facilitate notes during the meeting, then convert notes to minutes with action items. Measure time saved and quality improvement.",
        skills: ["Meeting productivity", "Decision documentation", "Action tracking"],
      },
    ],
  },
  {
    day: 7,
    title: "Process Improvement & Automation",
    subtitle: "SOPs, workflow design, and automation ideation",
    color: "#16A085",
    sessions: [
      {
        session: "morning",
        title: "Process Documentation & SOP Generation",
        reading: [
          { text: "Learn to use Claude to document processes: convert tribal knowledge → structured SOPs, create workflow diagrams, build decision trees", url: null },
          { text: "Practice SOP generation: 'Document our code review process as an SOP with roles, steps, tools, quality gates, and escalation paths'", url: null },
          { text: "Study how Claude identifies documentation gaps: feed it an existing process doc and ask for missing sections, ambiguities, improvements", url: null },
          { text: "Understand creating RACI matrices, escalation procedures, handoff protocols, and operational runbooks with Claude", url: null },
        ],
        project: "Choose 3 undocumented processes in your domain. Use Claude to generate complete SOPs for each: scope, roles, steps, decision points, tools, success criteria, and review schedule.",
        skills: ["Process documentation", "SOP creation", "Gap identification"],
      },
      {
        session: "afternoon",
        title: "Automation & Workflow Optimization",
        reading: [
          { text: "Learn to use Claude for automation ideation: identify repetitive tasks, evaluate automation potential, suggest tools/approaches", url: null },
          { text: "Practice workflow design: 'Analyze our deployment process. Suggest automation opportunities ranked by ROI. Provide specs for the top 3'", url: null },
          { text: "Study how Claude can generate workflow specs, integration requirements, tool evaluations, and implementation roadmaps", url: null },
          { text: "Understand Claude for RCA (root cause analysis): 5-Why analysis, fishbone diagrams, corrective actions, preventive measures", url: null },
        ],
        project: "Document your top 10 manual processes. Have Claude rank automation potential, suggest approaches (no-code, scripting, platform features), and draft implementation specs for top 3.",
        skills: ["Automation ideation", "Workflow optimization", "ROI analysis"],
      },
    ],
  },
  {
    day: 8,
    title: "Data Analysis & Reporting",
    subtitle: "Turning data into insights and executive narratives",
    color: "#8E44AD",
    sessions: [
      {
        session: "morning",
        title: "Data Analysis with Claude",
        reading: [
          { text: "Learn to upload CSV/Excel data to Claude: project metrics, team velocity, bug reports, client feedback, survey results", url: null },
          { text: "Practice data analysis prompts: 'Analyze this project data. Identify trends, outliers, and risks. Output as a summary with 5 key insights'", url: null },
          { text: "Study how Claude creates visualizations: it can generate chart specifications, table summaries, and data narratives", url: null },
          { text: "Understand Claude's math limitations: it approximates calculations — always verify critical numbers independently", url: null },
        ],
        project: "Upload project or team data (velocity, quality metrics, time tracking, etc). Ask Claude to generate: trend analysis, performance summary, risk identification, and improvement recommendations. Verify all numbers.",
        skills: ["Data analysis", "Trend identification", "Insight generation"],
      },
      {
        session: "afternoon",
        title: "Report & Dashboard Generation",
        reading: [
          { text: "Learn to create executive reports: Claude can convert raw data → narrative insights → formatted reports with sections, tables, charts", url: null },
          { text: "Practice dashboard design: 'From this project data, design a weekly executive dashboard. Specify metrics, visualizations, thresholds, and KPIs'", url: null },
          { text: "Study comparative analysis: quarter-over-quarter performance, team A vs team B, before/after process changes, tool evaluations", url: null },
          { text: "Understand Claude for business cases: ROI analysis, cost-benefit comparison, impact projections, risk assessment", url: null },
        ],
        project: "Create a complete reporting package: weekly executive summary, monthly metrics dashboard spec, quarterly trend report, and annual planning data analysis. Use real or representative project data.",
        skills: ["Report generation", "Dashboard design", "Business case creation"],
      },
    ],
  },
  {
    day: 9,
    title: "Advanced Techniques & Power User Skills",
    subtitle: "Multi-step workflows, chaining, and expert-level prompting",
    color: "#2C3E50",
    sessions: [
      {
        session: "morning",
        title: "Advanced Prompting & Chaining",
        reading: [
          { text: "Learn multi-step prompt chains: Step 1 → analyze data, Step 2 → identify patterns, Step 3 → generate recommendations, Step 4 → create action plan", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/chain-of-thought" },
          { text: "Practice XML-tagged prompts for structure: <context>, <task>, <format>, <constraints>, <examples> for precise control", url: null },
          { text: "Study prefill technique: start Claude's response for format enforcement ('Here is the analysis table:\\n| Metric | Value | Change |')", url: null },
          { text: "Understand system prompts in Projects: persistent instructions that apply to every conversation in that Project", url: null },
        ],
        project: "Build a 5-step prompt chain for a complex workflow in your domain (sprint planning, release readiness, requirements validation, etc). Test end-to-end and measure quality vs manual approach.",
        skills: ["Prompt chaining", "XML structure", "System prompts"],
      },
      {
        session: "afternoon",
        title: "Claude API & Integration (Optional Deep Dive)",
        reading: [
          { text: "Learn Claude API basics: programmatic access to Claude for automation, custom integrations, batch processing", url: "https://docs.anthropic.com/en/api/getting-started" },
          { text: "Study use cases: automated report generation, bulk document analysis, workflow automation, custom tooling", url: null },
          { text: "Practice API prompt engineering: same techniques as UI, but with structured JSON requests and responses", url: null },
          { text: "Understand rate limits, pricing, token management, and when API makes sense vs UI usage", url: null },
        ],
        project: "If you have development background: create a simple Claude API script for a repetitive task (batch analysis, template generation, data processing). Non-developers: design the workflow and spec it for your dev team.",
        skills: ["API awareness", "Automation design", "Integration thinking"],
      },
    ],
  },
  {
    day: 10,
    title: "Team Adoption & Governance",
    subtitle: "Rolling out Claude, creating team standards, and measuring impact",
    color: "#C0392B",
    sessions: [
      {
        session: "morning",
        title: "Building Your Team's Claude Standards",
        reading: [
          { text: "Learn to create a prompt library: curate tested prompts for common team tasks, tag by role/use case, maintain version control", url: null },
          { text: "Practice building team Projects: shared knowledge bases, standard templates, approved processes, quality rubrics", url: null },
          { text: "Study governance: data classification (what can/cannot be shared), quality review requirements, approval workflows for AI outputs", url: null },
          { text: "Understand change management: training approach, adoption metrics, feedback loops, iteration based on team usage", url: null },
        ],
        project: "Create a team enablement kit: 30+ prompt library (categorized by role/task), Claude Project template, governance guidelines, quick-reference card, and training session plan.",
        skills: ["Team enablement", "Governance", "Change management"],
      },
      {
        session: "afternoon",
        title: "Measuring Impact & Continuous Improvement",
        reading: [
          { text: "Learn to measure AI adoption: time saved per task, output quality improvement, team satisfaction, cost impact, workflow efficiency", url: null },
          { text: "Practice ROI calculation: quantify time savings, multiply by hourly rate, compare to subscription cost, factor in quality improvement", url: null },
          { text: "Study common pitfalls: over-reliance without verification, sharing sensitive data, accepting hallucinations, poor prompt quality", url: null },
          { text: "Understand continuous improvement: feedback collection, prompt refinement, Project updates, team training iteration", url: null },
        ],
        project: "Build your capstone: a complete Claude adoption plan for your team. Include: use case catalog, prompt library, governance framework, training program, success metrics, ROI analysis, and a leadership brief on AI's impact.",
        skills: ["Impact measurement", "ROI analysis", "Continuous improvement"],
      },
    ],
  },
];

const ALL_SESSIONS = DAYS.flatMap((d) => d.sessions.map((s) => ({ ...s, day: d.day, dayTitle: d.title, dayColor: d.color })));

function ProgressRing({ percent, size = 48, stroke = 4, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e3df" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

function LoginScreen({ onLogin }) {
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Optional: Check domain restriction
      if (ALLOWED_DOMAIN) {
        const email = result.user.email;
        const domain = email.split('@')[1];
        if (domain !== ALLOWED_DOMAIN) {
          await signOut(auth);
          setError(`Only ${ALLOWED_DOMAIN} email addresses are allowed`);
          return;
        }
      }
      
      onLogin(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f8f6", padding: 24, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#fff", borderRadius: 16, padding: "40px 32px", border: "1px solid #e5e3df", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* 2Base Logo Placeholder - Replace with actual logo */}
          <div style={{ width: 80, height: 80, margin: "0 auto 20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff" }}>
            2B
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px", color: "#1a1a1a" }}>Claude Mastery for 2Base</h1>
        </div>
        
        <button onClick={handleGoogleSignIn} style={{ width: "100%", padding: "14px 20px", background: "#fff", border: "1px solid #dadce0", borderRadius: 8, fontSize: 15, fontWeight: 500, color: "#3c4043", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, transition: "all 0.2s" }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
          Sign in with Google
        </button>
        
        {error && <div style={{ marginTop: 16, padding: 12, background: "#fef0f0", border: "1px solid #fcd3d3", borderRadius: 6, color: "#c0392b", fontSize: 13 }}>{error}</div>}
        
        <div style={{ marginTop: 24, padding: "16px 20px", background: "#f9f8f6", borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: "#666" }}>
          <strong style={{ color: "#1a1a1a" }}>Access requirements:</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
            <li>Use your 2Base Technologies email</li>
            {ALLOWED_DOMAIN && <li>Only @{ALLOWED_DOMAIN} addresses allowed</li>}
            <li>Progress syncs across all your devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, dayColor, progress, onToggleReading, onToggleProject, onAddNote, isExpanded, onToggle }) {
  const wp = progress || { reading: [], projectDone: false, notes: "" };
  const doneReading = (wp.reading || []).filter(Boolean).length;
  const totalReading = session.reading.length;
  const isDone = doneReading === totalReading && wp.projectDone;
  const sessionPercent = Math.round(((doneReading + (wp.projectDone ? 1 : 0)) / (totalReading + 1)) * 100);

  return (
    <div style={{ marginBottom: 18, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div onClick={onToggle} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s", background: isExpanded ? `${dayColor}08` : "transparent" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <ProgressRing percent={sessionPercent} size={40} stroke={4} color={dayColor} />
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: dayColor }}>{sessionPercent}%</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
            <span>{session.title}</span>
            {isDone && <span style={{ fontSize: 10, background: `${dayColor}20`, color: dayColor, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>COMPLETE</span>}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>{session.session === "morning" ? "Morning" : "Afternoon"} session · {totalReading} learning items · 1 hands-on project</div>
        </div>
        <span style={{ fontSize: 18, color: "var(--text-secondary)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </div>

      {isExpanded && (
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Learning Checklist ({doneReading}/{totalReading})</div>
            {session.reading.map((r, i) => (
              <div key={i} style={{ marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <input type="checkbox" checked={wp.reading[i] || false} onChange={() => onToggleReading(i)} style={{ marginTop: 4, cursor: "pointer", width: 16, height: 16, accentColor: dayColor }} />
                <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, fontWeight: 400 }}>
                  {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: dayColor, textDecoration: "none", borderBottom: `1px dotted ${dayColor}` }}>{r.text}</a> : r.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16, padding: 14, background: `${dayColor}08`, border: `1px dashed ${dayColor}40`, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <input type="checkbox" checked={wp.projectDone || false} onChange={onToggleProject} style={{ cursor: "pointer", width: 18, height: 18, accentColor: dayColor }} />
              <div style={{ fontSize: 11, color: dayColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Hands-On Project</div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, paddingLeft: 28, fontWeight: 400 }}>{session.project}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Session Notes</div>
            <textarea value={wp.notes || ""} onChange={(e) => onAddNote(e.target.value)} placeholder="Capture key takeaways, experiments, questions, or deliverable links..." style={{ width: "100%", minHeight: 80, padding: 10, fontSize: 13, lineHeight: 1.6, border: "1px solid var(--border)", borderRadius: 6, resize: "vertical", background: "var(--card-bg)", color: "var(--text)", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }} />
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>
            <strong>Skills Built:</strong> {session.skills.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ onBack, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin
  const isAdmin = ADMIN_EMAILS.includes(currentUser.email);

  useEffect(() => {
    if (!isAdmin) return;
    
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        
        const userData = snapshot.docs.map(doc => {
          const data = doc.data();
          const progress = data.progress || {};
          
          const totalItems = ALL_SESSIONS.reduce((s, sess) => s + sess.reading.length + 1, 0);
          const doneItems = ALL_SESSIONS.reduce((s, sess) => {
            const key = `${sess.day}-${sess.session}`;
            const wp = progress[key] || {};
            return s + (wp.reading || []).filter(Boolean).length + (wp.projectDone ? 1 : 0);
          }, 0);
          const percent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
          
          return {
            id: doc.id,
            email: data.email,
            name: data.name,
            lastActive: data.lastActive?.toDate?.() || new Date(),
            progress: percent,
            sessionsComplete: ALL_SESSIONS.filter(sess => {
              const key = `${sess.day}-${sess.session}`;
              const wp = progress[key] || {};
              return (wp.reading || []).filter(Boolean).length + (wp.projectDone ? 1 : 0) === sess.reading.length + 1;
            }).length
          };
        });
        
        userData.sort((a, b) => b.progress - a.progress);
        setUsers(userData);
      } catch (err) {
        console.error("Error loading users:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [isAdmin]);

  const resetUserProgress = async (userId) => {
    if (!confirm("Reset this user's progress? This cannot be undone.")) return;
    
    try {
      await setDoc(doc(db, "users", userId), {
        progress: {},
        lastActive: new Date()
      }, { merge: true });
      
      // Reload users
      window.location.reload();
    } catch (err) {
      alert("Error resetting progress: " + err.message);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!confirm(`Delete user ${userEmail}? They can rejoin later. This cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, "users", userId));
      // Reload users
      window.location.reload();
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>Access Denied</h1>
        <p style={{ color: "#666", marginBottom: 24 }}>You don't have admin permissions.</p>
        <button onClick={onBack} style={{ padding: "10px 20px", background: "#2EAD6B", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Back to Training
        </button>
      </div>
    );
  }

  const avgProgress = users.length > 0 ? Math.round(users.reduce((s, u) => s + u.progress, 0) / users.length) : 0;
  const completedUsers = users.filter(u => u.progress === 100).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @media (prefers-color-scheme: dark) { :root { --text: #e8e6e1; --text-secondary: #a8a5a0; --card-bg: #1e1e1c; --border: #333330; } }
      `}</style>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>Admin Dashboard</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, fontWeight: 400 }}>Team progress overview · real-time sync</p>
        </div>
        <button onClick={onBack} style={{ padding: "10px 20px", background: "#2EAD6B", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Back to Training
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ padding: "20px 24px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#2EAD6B", marginBottom: 4 }}>{users.length}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>Active Participants</div>
        </div>
        <div style={{ padding: "20px 24px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#3A7BE8", marginBottom: 4 }}>{avgProgress}%</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>Average Progress</div>
        </div>
        <div style={{ padding: "20px 24px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#9B59B6", marginBottom: 4 }}>{completedUsers}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 400 }}>Completed Program</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Loading team data...</div>
      ) : (
        <div style={{ background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f8f6", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "14px 18px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Participant</th>
                <th style={{ padding: "14px 18px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Progress</th>
                <th style={{ padding: "14px 18px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Sessions</th>
                <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Last Active</th>
                <th style={{ padding: "14px 18px", textAlign: "right", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <td style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2, color: "var(--text)" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 100, height: 6, background: "#e5e3df", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${user.progress}%`, height: "100%", background: user.progress === 100 ? "#2EAD6B" : "#3A7BE8", transition: "width 0.3s ease" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: user.progress === 100 ? "#2EAD6B" : "var(--text)" }}>{user.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{user.sessionsComplete}/{ALL_SESSIONS.length}</span>
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "right", fontSize: 12, color: "var(--text-secondary)", fontWeight: 400 }}>
                    {user.lastActive.toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 18px", textAlign: "right" }}>
                    <button onClick={() => resetUserProgress(user.id)} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500, background: "#FFA500", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", marginRight: 8 }}>
                      Reset
                    </button>
                    <button onClick={() => deleteUser(user.id, user.email)} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 500, background: "#C0392B", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ClaudeLearningPlan2BaseFirebase() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [expandedDay, setExpandedDay] = useState(0);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [progress, setProgress] = useState({});

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Optional: domain check
        if (ALLOWED_DOMAIN) {
          const email = currentUser.email;
          const domain = email.split('@')[1];
          if (domain !== ALLOWED_DOMAIN) {
            await signOut(auth);
            setLoading(false);
            return;
          }
        }
        
        setUser(currentUser);
        await loadUserProgress(currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProgress = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setProgress(userDoc.data().progress || {});
      } else {
        // Create user doc
        await setDoc(doc(db, "users", uid), {
          email: auth.currentUser.email,
          name: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
          createdAt: new Date(),
          lastActive: new Date(),
          progress: {}
        });
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  };

  const saveProgress = useCallback(async (newProgress) => {
    if (!user) return;
    
    setProgress(newProgress);
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        lastActive: new Date(),
        progress: newProgress
      }, { merge: true });
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  }, [user]);

  const toggleSession = (key) => setExpandedSessions((p) => ({ ...p, [key]: !p[key] }));
  const toggleReading = (key, ri) => {
    const wp = progress[key] || { reading: [], projectDone: false, notes: "" };
    const nr = [...(wp.reading || [])]; nr[ri] = !nr[ri];
    saveProgress({ ...progress, [key]: { ...wp, reading: nr } });
  };
  const toggleProject = (key) => {
    const wp = progress[key] || { reading: [], projectDone: false, notes: "" };
    saveProgress({ ...progress, [key]: { ...wp, projectDone: !wp.projectDone } });
  };
  const updateNote = (key, note) => {
    const wp = progress[key] || { reading: [], projectDone: false, notes: "" };
    saveProgress({ ...progress, [key]: { ...wp, notes: note } });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  const totalItems = ALL_SESSIONS.reduce((s, sess) => s + sess.reading.length + 1, 0);
  const doneItems = ALL_SESSIONS.reduce((s, sess) => {
    const key = `${sess.day}-${sess.session}`;
    const wp = progress[key] || {};
    return s + (wp.reading || []).filter(Boolean).length + (wp.projectDone ? 1 : 0);
  }, 0);
  const overallPercent = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
  const sessionsCompleted = ALL_SESSIONS.filter((sess) => {
    const key = `${sess.day}-${sess.session}`;
    const wp = progress[key] || {};
    return (wp.reading || []).filter(Boolean).length + (wp.projectDone ? 1 : 0) === sess.reading.length + 1;
  }).length;
  const getDayPercent = (d) => {
    const daySessions = ALL_SESSIONS.filter(s => s.day === d.day);
    const mt = daySessions.reduce((s, sess) => s + sess.reading.length + 1, 0);
    const md = daySessions.reduce((s, sess) => {
      const key = `${sess.day}-${sess.session}`;
      const wp = progress[key] || {};
      return s + (wp.reading || []).filter(Boolean).length + (wp.projectDone ? 1 : 0);
    }, 0);
    return mt > 0 ? Math.round((md / mt) * 100) : 0;
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#888" }}>Loading...</div>;
  }

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (showAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} currentUser={user} />;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "var(--text)", "--text": "#1a1a1a", "--text-secondary": "#555", "--card-bg": "#fafaf8", "--border": "#e5e3df" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @media (prefers-color-scheme: dark) { :root { --text: #e8e6e1; --text-secondary: #a8a5a0; --card-bg: #1e1e1c; --border: #333330; } }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 6px", letterSpacing: -0.5 }}>Claude Mastery for 2Base</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, fontWeight: 400 }}>Self-paced · BA · QA · Delivery · P&C · DevSecOps</p>
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ProgressRing percent={overallPercent} size={56} stroke={5} color="#2EAD6B" />
            <span style={{ position: "absolute", fontSize: 13, fontWeight: 600, color: "#2EAD6B" }}>{overallPercent}%</span>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, padding: "10px 16px", background: "#f0f8ff", borderRadius: 8, border: "1px solid #d1e7ff" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3A7BE8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600 }}>
            {user.displayName?.[0] || user.email[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{user.displayName || user.email.split('@')[0]}</div>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 400 }}>{user.email}</div>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAdmin(true)} style={{ padding: "6px 14px", background: "#fff", border: "1px solid #dadce0", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Admin
            </button>
          )}
          <button onClick={handleSignOut} style={{ padding: "6px 14px", background: "#fff", border: "1px solid #dadce0", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 14, padding: "12px 16px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{sessionsCompleted}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>of {ALL_SESSIONS.length} sessions</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{doneItems}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>of {totalItems} items</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{DAYS.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>learning days</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
        {DAYS.map((d, i) => {
          const dp = getDayPercent(d);
          return (
            <button key={i} onClick={() => setExpandedDay(i)} style={{ flex: "1 1 calc(20% - 6px)", minWidth: 68, padding: "10px 6px 12px", background: expandedDay === i ? d.color : `${d.color}15`, color: expandedDay === i ? "#fff" : d.color, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s", position: "relative", overflow: "hidden" }}>
              <div>Day {d.day}</div>
              <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>{dp}%</div>
              <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, width: `${dp}%`, background: expandedDay === i ? "#fff" : d.color, opacity: 0.6, borderRadius: "0 2px 0 0", transition: "width 0.4s ease" }} />
            </button>
          );
        })}
      </div>

      {DAYS.map((d, i) => expandedDay === i && (
        <div key={i}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>DAY {d.day}</span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>{getDayPercent(d)}% complete</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 2px" }}>{d.title}</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, fontStyle: "italic", fontWeight: 400 }}>{d.subtitle}</p>
          </div>
          {d.sessions.map((s) => {
            const key = `${d.day}-${s.session}`;
            return (
              <SessionCard key={key} session={s} dayColor={d.color} progress={progress[key]} onToggleReading={(idx) => toggleReading(key, idx)} onToggleProject={() => toggleProject(key)} onAddNote={(note) => updateNote(key, note)} isExpanded={!!expandedSessions[key]} onToggle={() => toggleSession(key)} />
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: 24, padding: "14px 18px", background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)", fontWeight: 400 }}>
        <strong style={{ color: "var(--text)", fontWeight: 500 }}>Progress syncs automatically.</strong> Your progress is saved to the cloud in real-time and accessible from any device. Signed in as {user.email}.
      </div>
    </div>
  );
}
