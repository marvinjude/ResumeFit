export interface SampleJobDescription {
  id: string;
  title: string;
  text: string;
}

export const SAMPLE_JOB_DESCRIPTIONS: SampleJobDescription[] = [
  {
    id: "jd_backend_mid",
    title: "Backend Engineer — Mid Level (Fintech)",
    text: `Backend Engineer — Payments Platform

We're a Series B fintech building the ledger and payments infrastructure that powers our marketplace. We're looking for a mid-level backend engineer to help us scale our transaction processing systems.

Responsibilities:
- Design, build, and own services in our Node.js/TypeScript backend, primarily around payments, ledger entries, and reconciliation.
- Work with Postgres for transactional data; write and review migrations for schema changes on tables with billions of rows.
- Participate in an on-call rotation and lead incident response for services you own.
- Collaborate with product and compliance teams to implement features that meet regulatory requirements (PCI-DSS, SOC 2).
- Write tests, review pull requests, and mentor junior engineers on the team.

Requirements:
- 3+ years of professional software engineering experience, with at least 2 years working on backend/API services in production.
- Strong proficiency in TypeScript or a similar statically-typed language, plus experience with relational databases.
- Experience with distributed systems concepts (idempotency, eventual consistency, message queues).
- Comfortable owning a service end-to-end: design, implementation, testing, deployment, and on-call support.
- Experience with AWS or another major cloud provider.

Nice to have:
- Experience in fintech, payments, or another regulated industry.
- Familiarity with Kafka, SQS, or similar message queues.
- Experience mentoring other engineers or leading small technical projects.`,
  },
  {
    id: "jd_frontend_senior",
    title: "Senior Frontend Engineer (React / Design Systems)",
    text: `Senior Frontend Engineer — Design Systems

Our product team is growing fast and we need a senior frontend engineer to help lead the evolution of our design system and the core React application it powers.

Responsibilities:
- Own the architecture of our shared component library (React, TypeScript, Storybook) used across 4 product surfaces.
- Drive frontend performance work: bundle size, rendering performance, Core Web Vitals.
- Partner closely with design to translate Figma specs into accessible, well-tested components.
- Set technical direction for state management, styling architecture, and testing strategy on the frontend team.
- Review PRs, mentor mid-level and junior frontend engineers, and run technical design reviews.

Requirements:
- 6+ years of professional frontend engineering experience, with deep expertise in React and TypeScript.
- Proven track record building and maintaining a component library or design system at scale.
- Strong understanding of web accessibility (WCAG) and a track record of shipping accessible UI.
- Experience with modern build tooling (Vite, Webpack) and CI/CD for frontend deployments.
- Excellent communication skills — this role works cross-functionally with design, product, and other engineering teams daily.

Nice to have:
- Experience with Next.js or another React meta-framework.
- Open source contributions to component libraries or accessibility tooling.
- Experience running a formal design system governance process (RFCs, contribution guidelines).`,
  },
  {
    id: "jd_ml_engineer",
    title: "ML Engineer — LLM Products",
    text: `Machine Learning Engineer — LLM Applications

We're building AI-powered products on top of large language models and are hiring an ML engineer to help design, evaluate, and ship these features.

Responsibilities:
- Design and implement LLM-powered features: prompt engineering, retrieval-augmented generation, structured output generation, and agentic workflows.
- Build evaluation pipelines to measure quality, latency, and cost of LLM-powered features before and after they ship.
- Fine-tune or evaluate open-weight models where appropriate, and compare tradeoffs against hosted model APIs.
- Own the full lifecycle of ML features: data collection, experimentation, deployment, and monitoring in production.
- Collaborate with product engineers to integrate ML systems into user-facing product surfaces.

Requirements:
- 3+ years of experience building and shipping machine learning or LLM-powered systems in production, not just research/coursework.
- Hands-on experience with LLM APIs (OpenAI, Anthropic, or similar) and prompt/context engineering techniques.
- Strong Python skills; comfortable working with ML frameworks (PyTorch, Hugging Face Transformers) and building evaluation harnesses.
- Experience with vector databases and retrieval-augmented generation (RAG) architectures.
- Solid software engineering fundamentals — this is a production engineering role, not a pure research role.

Nice to have:
- Experience with agentic or tool-use LLM architectures.
- Published research, open-source contributions to ML tooling, or a strong public portfolio of ML projects.
- Experience with model fine-tuning or distillation.`,
  },
];
