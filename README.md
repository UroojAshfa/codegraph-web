#  CodeGraph 

> AI-powered code complexity analysis for JavaScript and TypeScript

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Status:**  Working locally |  Deployment in progress

[📖 Documentation](#features) • [ Demo](#demo) • [ Quick Start](#quick-start) • [ Issues](https://github.com/UroojAshfa/codegraph-web/issues)

---

##  What is CodeGraph?

CodeGraph is a modern web application that analyzes your JavaScript and TypeScript code to identify complexity issues, detect architectural patterns, and provide AI-powered refactoring suggestions. Upload your files and get instant, actionable insights.

###  Built For

- **Developers** reviewing code quality before merging
- **Teams** establishing code complexity standards
- **Students** learning what makes code maintainable
- **Educators** teaching software design principles

---

##  Demo

![CodeGraph Interface](docs/screenshots/demo.png)

### Key Features in Action:
-  **Instant Analysis** - Upload → Results in <3 seconds
-  **AI Insights** - Gemini-powered explanations and refactoring tips
-  **Visual Reports** - Interactive charts and sortable tables
-  **Export Options** - JSON, Markdown, PDF with AI insights included

---

##  Features

###  **Code Analysis**

#### Complexity Metrics
- **Cyclomatic Complexity** - Measures decision points (if/else, loops, etc.)
- **Entry Points** - Functions not called by others (potential API entry points)
- **Leaf Functions** - Functions that don't call others (utilities)
- **Circular Dependencies** - Detects problematic import cycles
- **Call Graph** - Visualizes function relationships

#### Architectural Insights
- Entry/Leaf function detection
- Code smell identification
- Refactoring priority rankings
- Complexity distribution analysis

---

###  **AI-Powered Features** (Gemini Pro)

#### Individual Analysis
Click **" AI Insights"** on any function to get:
- Plain English explanation of what the function does
- Specific code smells detected (God Functions, Long Methods, etc.)
- Actionable refactoring strategies with design patterns
- Severity assessment (Critical/High/Moderate/Low)

#### Batch Analysis
**"Analyze All"** button for top 5 most complex functions:
- Analyzes multiple functions in one click
- Progress bar with live updates
- Collapsible results for each function
- Results saved for exports

#### Smart Caching
- 24-hour cache for analyzed functions
- " Cached" indicator shows cached results
- Zero duplicate API calls = saves money
- Session-persistent

---

###  **Visualization**

- **Interactive Charts** - Color-coded complexity distribution
- **Sortable Tables** - Search and sort by complexity, name, or file
- **Complexity Badges** - Visual indicators ( Good →  Critical)
- **Dark Mode** - Beautiful dark theme with consistent styling

---

###  **Export Options**

#### JSON Export
```json
{
  "fileCount": 8,
  "functionCount": 58,
  "avgComplexity": 6.02,
  "topComplex": [...],
  "graph": {...}
}
```

#### Markdown Export
- Full analysis report
- Complexity distribution tables
- Top complex functions
- **AI insights included** (if batch analysis run)
- GitHub/Notion-ready formatting

#### PDF Export
- Professional multi-page report
- All metrics included
- **AI insights included** (if batch analysis run)
- Page numbers and footers
- Print-ready format

---

##  Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js
- **Icons:** Lucide React
- **UI Components:** Custom components

### Analysis Engine
- **Parser:** Tree-sitter (JavaScript/TypeScript)
- **Complexity Calculator:** Custom cyclomatic complexity implementation
- **Call Graph:** Custom graph implementation

### AI & Data Processing
- **AI Model:** Google Gemini Pro
- **PDF Generation:** jsPDF
- **Caching:** sessionStorage (client-side)

### Infrastructure
- **Hosting:** Vercel (deployment in progress)
- **Runtime:** Node.js 20+
- **Package Manager:** npm

---

##  Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- Google Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/UroojAshfa/codegraph-web.git
cd codegraph-web

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

##  Configuration

### Environment Variables

Create `.env.local` in the project root:

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key: https://makersuite.google.com/app/apikey

### File Limits

- **Max Files:** 100 per upload
- **Max File Size:** 10MB per file
- **Total Upload Size:** 50MB
- **Supported Formats:** `.js`, `.jsx`, `.ts`, `.tsx`

### AI Configuration

- **Model:** Gemini Pro
- **Rate Limit:** ~60 requests/minute (free tier)
- **Cache Duration:** 24 hours
- **Batch Analysis:** Top 5 functions
- **Cost:** ~$0.001 per analysis (free tier available)

---

##  How It Works

### Analysis Pipeline

```
User Upload → Parse with Tree-sitter → Extract Functions → 
Calculate Complexity → Build Call Graph → Generate Results →
(Optional) AI Analysis → Export Reports
```

### Complexity Calculation

```typescript
complexity = 1 + decisions + loops + conditions

where:
  decisions = if, else, switch, case, ternary (?:)
  loops = for, while, do-while, forEach, map
  conditions = &&, ||, ??
```

### AI Analysis Strategy

1. **Function Analysis:** Name pattern + complexity score + structural indicators
2. **Code Smell Detection:** God functions, long methods, feature envy, etc.
3. **Refactoring Suggestions:** Extract methods, guard clauses, design patterns
4. **Priority Assessment:** Critical (>20) → High (11-20) → Moderate (6-10) → Low (1-5)

---

##  Project Stats

- **Lines of Code:** ~6,500
- **Components:** 18
- **API Routes:** 2 (`/api/analyze`, `/api/ai-analyze`)
- **Dependencies:** 22
- **Build Time:** ~45 seconds
- **Bundle Size:** ~380KB (gzipped)

---

##  Known Issues & Status

### Current Status

 **Working Locally:**
- Full analysis functionality
- AI-powered insights
- All export options
- Dark mode
- Batch analysis

 **Deployment Challenges:**
- Tree-sitter native binary compilation on Vercel
- CLI integration in serverless environment
- Working on: Web-assembly approach or pre-compiled binaries

### Workarounds

**For Local Development:**
```bash
# If tree-sitter fails on Windows
npm install tree-sitter@0.21.1 --legacy-peer-deps
npm rebuild tree-sitter --update-binary
```

**For Production:**
- Currently investigating serverless-friendly solutions
- Considering: Web-tree-sitter (WASM) or Docker deployment

---

##  Roadmap

### v1.0 (Current - Local)
- [x] Core complexity analysis
- [x] AI-powered insights (individual + batch)
- [x] Export to JSON/Markdown/PDF
- [x] Smart caching
- [x] Dark mode
- [ ] Production deployment *(in progress)*

### v1.1 (Next)
- [ ] Production deployment to Vercel
- [ ] Historical complexity tracking
- [ ] Comparison mode (before/after)
- [ ] Custom complexity thresholds

### v2.0 (Future)
- [ ] GitHub integration (analyze PRs)
- [ ] VS Code extension
- [ ] Interactive call graph visualization
- [ ] Team dashboard

### v3.0 (Long-term)
- [ ] Multi-language support (Python, Java, Go)
- [ ] CI/CD integration
- [ ] Custom rules engine
- [ ] Public API

---

##  Contributing

Contributions welcome! This project is actively being developed.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/codegraph-web.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run dev

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Coding Standards

- **TypeScript:** Strict mode, no `any` types
- **Linting:** Run `npm run lint` before committing
- **Formatting:** Prettier with Tailwind plugin
- **Components:** One component per file
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/)

---



---

## Acknowledgments

- **[Tree-sitter](https://tree-sitter.github.io/)** - Incremental parsing system
- **[Google Gemini](https://ai.google.dev/)** - AI model for code analysis
- **[Next.js Team](https://nextjs.org/)** - React framework
- **[Vercel](https://vercel.com)** - Deployment platform
- **[Anthropic Claude](https://www.anthropic.com/)** - Development assistance

---

##  Contact

**Urooj Ashfaq**

- GitHub: [@UroojAshfa](https://github.com/UroojAshfa)
- LinkedIn: [Urooj Ashfaq](https://www.linkedin.com/in/urooj-ashfaq-491159339/)
- Email: uroojashfaq8@gmail.com

### Support This Project

-  **Star this repo** if you find it useful
-  **Report bugs** via [Issues](https://github.com/UroojAshfa/codegraph-web/issues)
-  **Suggest features** via [Discussions](https://github.com/UroojAshfa/codegraph-web/discussions)
-  **Contribute** via Pull Requests

---

##  Development Journey

This project was built as part of a **30-day coding challenge** (#buildinpublic).

**Key Learnings:**
- Tree-sitter integration in Next.js
- AI prompt engineering for code analysis
- Serverless architecture challenges
- PDF generation in the browser
- Complexity metrics implementation

**Challenges Faced:**
- Native binary compilation across platforms
- Tree-sitter in serverless environments
- Real-time AI analysis performance
- Caching strategy for cost optimization

**Read the full journey:** [LinkedIn Posts]((https://www.linkedin.com/in/urooj-ashfaq-491159339/))

---

##  FAQ

<details>
<summary><strong>Is my code stored anywhere?</strong></summary>

No. Files are uploaded to server memory, analyzed immediately, and deleted. Nothing is persisted to disk or database.
</details>

<details>
<summary><strong>How accurate is the complexity calculation?</strong></summary>

CodeGraph uses cyclomatic complexity, a well-established metric that counts decision points. It's accurate for measuring branching logic but doesn't capture cognitive complexity or nesting depth.
</details>

<details>
<summary><strong>How much does AI analysis cost?</strong></summary>

~$0.001 per function with Gemini Pro. Free tier includes 60 requests/minute. Smart caching reduces duplicate calls significantly.
</details>

<details>
<summary><strong>Why isn't it deployed yet?</strong></summary>

Tree-sitter requires native binary compilation, which has proven challenging in serverless environments. Currently investigating web-assembly alternatives or containerized deployment.
</details>

<details>
<summary><strong>Can I use this for production code reviews?</strong></summary>

Yes! The local version is production-ready. Many developers use it for code reviews and refactoring decisions.
</details>

<details>
<summary><strong>What languages are supported?</strong></summary>

Currently: JavaScript, JSX, TypeScript, TSX. Python, Java, and Go support planned for future versions.
</details>

---

<div align="center">

**Built with ❤️ by [Urooj Ashfaq](https://github.com/UroojAshfa)**

If this project helped you, please give it a ⭐!

[⬆ Back to Top](#-codegraph-web)

</div>
