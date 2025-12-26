const CAREERS_DATA = [
    {
        id: "senior-frontend-developer",
        title: "Senior Frontend Developer",
        department: "Engineering",
        location: "Bangalore, India",
        type: "Full-time",
        experience: "2-5 years",
        postedDate: "2023-12-26",
        deadline: "Open until filled",
        description: "Seeking an experienced frontend developer with 2-5 years of experience and Computer Science Engineering background to build modern, scalable web applications using cutting-edge technologies.",
        fullDescription: `
            <p>Seeking an experienced frontend developer with 2-5 years of experience and Computer Science Engineering background to build modern, scalable web applications using cutting-edge technologies.</p>

            <h3 class="mt-4">Core Technology Requirements</h3>
            <ul class="mb-4">
                <li><strong>React 19:</strong> Concurrent features, Server/Client Components, hook, React Compiler optimization</li>
                <li><strong>TypeScript:</strong> Advanced types, generics, strict mode, comprehensive type definitions, discriminated unions</li>
                <li><strong>Vite:</strong> Fast build tool and Dev server, Build optimization, environment configuration</li>
                <li><strong>Material-UI:</strong> MUI v5+, custom theming, prop styling, responsive design</li>
                <li><strong>Redux Toolkit:</strong> State Management, entity adapters</li>
                <li><strong>React Router:</strong> Client-side routing, lazy loading, protected routes, nested routing</li>
            </ul>

            <h3 class="mt-4">Development Standards</h3>
            
            <h5 class="mt-3">Code Architecture</h5>
            <ul>
                <li>Feature-based folder structure with co-located tests</li>
                <li>PascalCase components, camelCase utilities, strict TypeScript interfaces for all props</li>
                <li>JSDoc comments for complex components, exported prop types for composition</li>
            </ul>

            <h5 class="mt-3">Testing & Quality</h5>
            <ul>
                <li>Vitest with Testing Library</li>
                <li>Query by accessible roles, userEvent for interactions, custom render utilities with providers</li>
                <li>ESLint + Prettier</li>
            </ul>

            <h5 class="mt-3">Git Workflow</h5>
            <ul>
                <li>Branch format: feature/TICKET-123-description, bugfix/TICKET-123-description, hotfix/critical-fix</li>
                <li>Conventional commits: feat:, fix:, refactor:, test:, docs:</li>
                <li>Husky hooks: pre-commit (lint-staged, type check), pre-push (full test suite)</li>
            </ul>

            <h5 class="mt-3">CI/CD & DevSecOps</h5>
            <ul>
                <li>Automated build/test on every PR, preview environments, staging auto-deploy, manual prod approval</li>
                <li>OWASP Top 10 knowledge, dependency scanning, secret management</li>
                <li>Understanding Microsoft's cloud tools (VS Code, Azure DevOps, CLI) to build, deploy, and manage apps using services like App Service, Micro-frontend architectures, Web Assembly, PWA experience</li>
            </ul>

            <h3 class="mt-4">Qualifications</h3>
            
            <h5 class="mt-3">Required</h5>
            <ul>
                <li>Bachelor's in Computer Science Engineering</li>
                <li>2-5 years professional frontend development experience</li>
                <li>Portfolio of production React applications</li>
                <li>Agile/Scrum development experience</li>
            </ul>

            <h5 class="mt-3">Preferred</h5>
            <ul>
                <li>Open-source contributions, Next.js experience</li>
                <li>GraphQL/Apollo Client, Docker/Kubernetes knowledge</li>
                <li>Micro-frontend architectures, WebAssembly</li>
            </ul>
        `
    },
    {
        id: "software-engineer-security-cryptography",
        title: "Software Engineer (Security / Integrations – Cryptography & Cloud)",
        department: "Engineering",
        location: "Remote (U.S. required)",
        type: "Full-Time",
        experience: "5+ years",
        postedDate: "2023-12-26",
        deadline: "Open until filled",
        description: "Experienced Software Engineer with a strong security background to help build the next generation of automated cryptographic-security tooling.",
        fullDescription: `
            <p class="lead"><strong>About Us</strong></p>
            <p>Quantum Solutions is an early-stage cybersecurity company focused on one of the most critical challenges facing modern digital infrastructure: cryptographic risks posed by quantum computing.</p>
            <p>Founded in 2025, our mission is to automate the technical complexity of post-quantum cryptography adoption and cryptographic agility enabling organizations to protect systems today against harvest-now, decrypt-later threats while remaining adaptable to evolving cryptographic standards, compliance requirements, and regulatory mandates.</p>
            <p>We help organizations discover cryptographic assets, assess risk, remediate using customer-owned, PQC-enabled infrastructure-as-code, and continuously monitor cryptographic telemetry across complex enterprise environments.</p>

            <h3 class="mt-4">About the Role</h3>
            <p>We are looking for an experienced Software Engineer with a strong security background to help build the next generation of automated cryptographic-security tooling.</p>
            <p>In this role, you will design, architect, and implement backend services and integrations operating across cloud platforms and enterprise environments. You'll work across service logic, APIs, data models, and CI/CD pipelines, contributing production-grade code to a platform built for security- and compliance-sensitive contexts.</p>
            <p>You will collaborate closely with the founding team owning core system components and influencing foundational architectural design decisions as the platform scales.</p>

            <h3 class="mt-4">What You’ll Work On</h3>
            <ul>
                <li>Design and implement a scalable cryptographic asset discovery and inventory engine</li>
                <li>Build primarily agentless discovery workflows, with support for optional agent-based modules</li>
                <li>Integrate with cloud providers and enterprise platforms, including:
                    <ul>
                        <li>AWS, Azure, and GCP</li>
                        <li>CMDBs such as ServiceNow</li>
                        <li>Security tools such as Tanium, Tenable, and CrowdStrike</li>
                    </ul>
                </li>
                <li>Develop backend services and APIs for cryptographic analysis, telemetry, and lifecycle workflows</li>
                <li>Contribute to AI-driven risk scoring and prioritization models</li>
                <li>Build and maintain CI/CD pipelines, automated testing, and deployment workflows</li>
                <li>Support certificate, key, and protocol lifecycle visibility & management across distributed systems</li>
            </ul>

            <h3 class="mt-4">Qualifications</h3>
            
            <h5 class="mt-3">Required</h5>
            <ul>
                <li>5+ years of professional software engineering experience, with a focus on security-sensitive systems</li>
                <li>Strong proficiency in Python for backend services, integrations, and automation</li>
                <li>Experience with Node.js, NestJS, or similar backend frameworks</li>
                <li>Solid understanding of networking, TLS/SSL, PKI, and cryptographic protocols</li>
                <li>Experience building and integrating security tooling such as scanners, asset discovery systems, SIEM pipelines, and IaC-driven deployments</li>
                <li>Hands-on experience building applications in Azure (e.g., Functions, App Service, AKS, ACR, WAF, storage, monitoring)</li>
                <li>Experience working with relational data models in production systems</li>
                <li>Familiarity with Docker, Kubernetes, and GitHub-based workflows</li>
            </ul>

            <h5 class="mt-3">Preferred</h5>
            <ul>
                <li>Experience with Rust</li>
                <li>Experience with graph databases</li>
                <li>Familiarity with NIST PQC standards (ML-KEM, ML-DSA, SPHINCS+, FN-DSA)</li>
                <li>Experience training or deploying AI/ML models in production systems</li>
                <li>Hands-on experience with OpenSSL, liboqs, or other cryptographic libraries</li>
                <li>Familiarity with Tanium, Tenable, or CrowdStrike APIs and SDKs</li>
            </ul>

            <h3 class="mt-4">How You’ll Work</h3>
            <ul>
                <li>Collaborate closely with the founding team to define feature scope and technical direction</li>
                <li>Design and automate quantum-safe cryptographic migration workflows across SaaS and IaC models</li>
                <li>Work in fast, focused Agile cycles, delivering production-ready features</li>
                <li>Operate independently while communicating clearly in a distributed, remote-first team</li>
            </ul>

            <h3 class="mt-4">Why Join</h3>
            <ul>
                <li>Work on foundational infrastructure for the global transition to post-quantum security</li>
                <li>High autonomy and meaningful technical ownership from day one</li>
                <li>Direct access to leadership and influence over core architectural decisions</li>
                <li>Modern, Azure-first cloud and security stack</li>
            </ul>

            <h3 class="mt-4">Company Traction</h3>
            <ul>
                <li>Recently closed a pre-seed funding round, providing runway and operational stability</li>
                <li>Supported by an advisory board of experienced C-suite executives and venture partners</li>
                <li>Actively engaged in a design partnership with a large, globally distributed enterprise to shape production deployments</li>
            </ul>
        `
    }
];
