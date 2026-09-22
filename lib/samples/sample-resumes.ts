export interface SampleResume {
  id: string;
  title: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: "resume_junior",
    title: "Junior Full-Stack Engineer (1 yr experience)",
    text: `Alex Rivera
Full-Stack Software Engineer

EXPERIENCE

Junior Software Engineer — Brightpath Labs (Aug 2025 – Present)
- Built CRUD features for an internal admin dashboard using React and a Node/Express API.
- Fixed bugs reported by QA and implemented small UI features from Figma designs.
- Wrote unit tests for new endpoints using Jest.
- Participated in code review and daily standups.

Software Engineering Intern — Brightpath Labs (Jun 2024 – Aug 2024)
- Built a to-do list clone and a small weather app as onboarding projects.
- Shadowed senior engineers during sprint planning and code reviews.

EDUCATION
B.S. Computer Science, State University, 2025

SKILLS
JavaScript, React, Node.js, Express, PostgreSQL, Git, Jest, HTML/CSS`,
  },
  {
    id: "resume_backend_fintech",
    title: "Backend Engineer — Fintech/Payments (strong match)",
    text: `Morgan Reyes
Backend Software Engineer

EXPERIENCE

Backend Engineer — Ledger Platform, Vantia Pay (2022 – Present, 3.5 yrs)
- Own the ledger and reconciliation services (Node.js, TypeScript, Postgres) that post every transaction on the platform, processing ~200k transactions/day across tables with billions of rows.
- Designed an idempotent event-processing layer using SQS and eventual-consistency patterns so retried webhooks and duplicate payment events never double-post to the ledger.
- Wrote and reviewed dozens of Postgres migrations on high-traffic tables, including a zero-downtime backfill of a new reconciliation column across a 2B-row table.
- Led incident response as primary on-call for the payments team; wrote the postmortem and follow-up fixes for two P1 outages.
- Partnered with the compliance team to implement PCI-DSS and SOC 2 controls for how payment data is stored, logged, and accessed.
- Mentored two junior engineers and led a small project to migrate legacy payment webhooks onto the new event pipeline.
- Deployed services to AWS (ECS, RDS, SQS) and own their CI/CD pipeline end-to-end.

Software Engineer — Vantia Pay (2021 – 2022, 1 yr)
- Built internal REST APIs for the support team to look up transaction and dispute history.
- Wrote integration tests and contributed to the team's on-call runbook.

EDUCATION
B.S. Computer Science, Lakeshore University, 2021

SKILLS
TypeScript, Node.js, PostgreSQL, AWS (ECS, RDS, SQS), Kafka, Docker, Jest, CI/CD, PCI-DSS/SOC 2 compliance`,
  },
  {
    id: "resume_mid",
    title: "Mid-level Backend Engineer (4 yrs)",
    text: `Jordan Kim
Backend Software Engineer

EXPERIENCE

Software Engineer II — Northbeam Systems (2022 – Present, 3 yrs)
- Own the order-processing service (Node.js/TypeScript, Postgres) handling ~50k transactions/day.
- Designed and shipped an idempotent retry system for failed payment webhooks, reducing duplicate charges to near zero.
- Led the migration of a legacy monolith module into a standalone service with zero downtime.
- On-call rotation for the payments team; led incident response for two P1 outages.
- Mentored two junior engineers through their first six months.

Software Engineer — Northbeam Systems (2021 – 2022, 1 yr)
- Built REST APIs for the internal reporting tool using Express and PostgreSQL.
- Wrote integration tests and improved CI pipeline speed by 40%.

EDUCATION
B.S. Computer Science, Riverside Tech University, 2021

SKILLS
TypeScript, Node.js, PostgreSQL, AWS (ECS, SQS, RDS), Docker, Kafka, Jest, CI/CD`,
  },
  {
    id: "resume_senior",
    title: "Senior ML/Backend Engineer (8+ yrs)",
    text: `Priya Natarajan
Senior Software Engineer — ML & Backend Systems

EXPERIENCE

Staff Engineer — Solace AI (2023 – Present, 2 yrs)
- Lead architecture for our LLM-powered document analysis product: RAG pipeline over a vector database (Pinecone), structured output generation via tool-calling, and a custom evaluation harness comparing quality/cost/latency across model providers.
- Designed and shipped an agentic workflow system that lets the product autonomously chain multiple LLM calls with tool use, cutting manual review time by 60%.
- Own model-serving infrastructure (Python, FastAPI, GPU autoscaling) processing 2M+ requests/month.
- Mentor a team of 4 engineers; run technical design reviews across the ML platform org.

Senior Software Engineer — DataForge (2019 – 2023, 4 yrs)
- Built and scaled a real-time data pipeline (Kafka, Spark, Python) processing 500M events/day.
- Designed the company's first ML feature store, used by 6 downstream teams.
- Fine-tuned open-weight models for internal classification tasks, improving accuracy by 12% over the baseline vendor API.
- Led migration from a monolith to microservices architecture; wrote the internal RFC and drove adoption.

Software Engineer — DataForge (2017 – 2019, 2 yrs)
- Built backend services in Python/Django for the core product.
- Contributed to an internal open-source Python library for data validation, later adopted company-wide.

EDUCATION
M.S. Computer Science, Machine Learning track, Coastal Institute of Technology, 2017
B.S. Computer Science, Coastal Institute of Technology, 2015

SKILLS
Python, TypeScript, PyTorch, Hugging Face Transformers, FastAPI, Kafka, Spark, AWS/GCP, Kubernetes, Vector databases (Pinecone, pgvector), LLM APIs (OpenAI, Anthropic)`,
  },
];
