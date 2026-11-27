UjuziLink — Skills without borders.
Recognize skills. Build trust. Unlock opportunities.

UjuziLink is a hackathon MVP designed to help displaced and underserved professionals document their experience, identify competencies, obtain evidence-backed human review, and discover relevant opportunities. It addresses the theme Unlocking Displaced Talent: Pathways for Skilled Refugees.
Problem and solution
Professional experience does not disappear when people are displaced, but credentials, references, networks and access to employers may be disrupted. UjuziLink connects self-reported experience to a structured skills catalogue, human-reviewed evidence and a shareable digital Skills Passport. A private readiness checklist and transparent skill matching help candidates plan their next steps. The platform does not grant legal work authorization or official accreditation.
Product capabilities
Role	Core workflow
Candidate	Profile, experience and education; manual, keyword and AI-assisted skill discovery; evidence upload; private readiness checklist; published passport; opportunity discovery, bookmarks and applications
Reviewer	Review submitted evidence and record approval/rejection with feedback
Employer	Create and publish opportunities, review applications, verify voluntarily shared passports
Administrator	Aggregate analytics, user directory, controlled role assignment, listing moderation and audited privileged changes


AI suggestions are not verified skills. Candidates explicitly consent to external AI analysis and confirm suggestions. Server-issued, expiring receipts protect AI-source provenance; new skills remain unverified until supporting evidence is approved. Standard keyword mapping is available without an external AI request (still requires database connectivity).
Architecture

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, Recharts, Lucide and QR code rendering.
- Backend: Supabase Auth, PostgreSQL, Row Level Security (RLS), controlled RPC functions, private Storage and Edge Functions.
- AI: OpenAI Responses API with structured output and catalogue validation; provider credential stays server-side.
- Hosting: Vercel is the intended frontend deployment target; Supabase hosts backend services.
Run locally
Prerequisites: Node.js compatible with the project's Vite version, npm and a configured Supabase project.
git clone https://github.com/duolgT/Talentbridge-ai.git
cd Talentbridge-ai
npm ci
Create .env.local in the project root:
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
Configure the database schema, triggers, grants, RLS, RPCs and private evidence-documents bucket (PDF/JPEG/PNG, 5 MB) in Supabase. Apply the project's SQL migrations in order where available; the complete migration history must be included before a fresh backend can be reproduced. Create dedicated reviewer, employer and administrator test accounts through authorized onboarding. Deploy extract-skills with OPENAI_API_KEY and OPENAI_MODEL in Edge Function secrets, never in the frontend. The trusted receipt-writing client uses the server-only Supabase credential. Configure authentication redirects for local and production origins.
npm run dev
npm run lint
npm run build
npm run preview
Demo and repository
- Repository: https://github.com/duolgT/Talentbridge-ai (legacy repository name; product is UjuziLink).
- Live demo: [insert verified deployment URL before submission].
- Demo credentials: use dedicated fictional accounts; share privately with judges only if required.
- See demo-script.md for the walkthrough and UjuziLink_Pitch.pptx for the pitch.
Trust, privacy and limitations
Private evidence is not exposed by public passport verification. Published passports disclose selected professional data and verified skill summaries via a share token; candidates can unpublish and rotate the token. Downloaded copies cannot be revoked. AI analysis excludes raw evidence files and account credentials, but free-text descriptions may contain personal information despite redaction. Use synthetic data for the demo. Role checks, RLS and controlled transactions enforce authorization; frontend route guards are not the security boundary.

The administrator modules and initial AI backend were reported working during development. Final receipt integration, global AI quotas, consent logging, cross-account regression testing and live deployment need confirmation before submission. Do not claim production readiness, external accreditation, confirmed placements or partner endorsements. Demo opportunities must remain clearly labelled and non-applicable. Remove or isolate test records from public discovery.
Proposed impact and sustainability
Track verified competencies, published passports, relevant applications and confirmed placements separately, with consent and appropriate safeguards. Proposed sustainability: institutional onboarding and verification workflow services, employer tools and NGO partnerships; keep core candidate access free. Validate demand and willingness to pay through pilots rather than assuming revenue. Potential alignment: SDGs 4, 8, 10, 16 and 17.
Next steps
Pilot with vetted reviewers and partner organizations; strengthen consent preview/redaction, reviewer accountability, role revocation, evidence malware screening, accessibility, quota abuse protection and data retention controls. Validate local employment pathways with qualified partners. Measure actual outcomes before expanding.
