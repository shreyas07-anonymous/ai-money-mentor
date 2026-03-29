
# AI Money Mentor: ET Intelligence Edition
### Winning Submission for ET Gen Hackathon Round 2 | Team: **The Logic Layers**

> 🚀 **[Live Demo →](https://ai--money--mentor.vercel.app/)**

**AI Money Mentor** is a sophisticated, context-aware financial planning agent designed specifically for the Indian demographic. It bridges the gap between complex financial regulations and the everyday saver, making HNI-grade financial advice accessible to 450M+ Indian earners.

---

## 🏗 System Architecture

The project follows a **Layered Logic Architecture**, separating raw user data from financial intelligence and AI-driven mentoring.

### 1. The Data Layer (Context Provider)
* **UserProfileContext:** The "Single Source of Truth." It stores income, expenses, loan types, and life goals.
* **Derived Intelligence:** Automatically calculates real-time metrics like Savings Rate, Debt-to-Income ratio, and Tax Bracket without external API calls, ensuring zero-latency personalization.

### 2. The Logic Layer (Financial Engines)
* **Tax Engine:** Implements Income Tax Act 1961 logic (Section 80C, 80D, 80CCD) to provide an Old vs. New regime break-even analysis.
* **FIRE Engine:** A compound interest simulator factoring in Indian inflation rates and asset-class-specific growth (Equity/Debt).
* **Health Scorer:** A multi-dimensional evaluator that benchmarks users against SEBI-recommended financial safety standards.

### 3. The Agent Layer (AI Mentor)
* **Contextual Insight Engine:** Instead of generic LLM responses, the AI Mentor scans the user's "Logic Layer" results to generate proactive alerts (e.g., "You're leaving ₹46,800 on the table in tax savings").
* **ET Intelligence Integration:** A simulated real-time feed that maps global news (RBI Repo Rates, Market Highs) to individual portfolio impacts.

### 4. The Presentation Layer (UX)
* **Vite + React + TS:** Optimized for speed and type safety.
* **Shadcn UI:** High-fidelity, trustworthy fintech interface.
* **Indian Shorthand Parser:** Custom input logic handling "Lakhs (L)", "Crores (Cr)", and "Thousands (K)".

---

## 🔌 ET Services Integration Strategy

To scale **AI Money Mentor** within the Times Internet / Economic Times ecosystem, we propose the following integration points:

| ET Service | Integration Method | Value Add |
| :--- | :--- | :--- |
| **ET Prime** | Single Sign-On (SSO) | Use existing subscriber data to pre-fill the "Money Health Score" onboarding. |
| **ET Portfolio** | API Data Sync | Pull real-time MF/Stock holdings to provide instant "X-Ray" rebalancing advice. |
| **ET News Feed** | Semantic Mapping | Tag news articles with "Personal Impact" chips (e.g., "This Budget update saves YOU ₹12,000"). |
| **ET Markets** | Transactional Layer | One-click execution of "Tax Wizard" recommendations (e.g., Buy ELSS via ET Markets). |

---

## 📈 Impact Model (The Business Logic)

**Problem:** Financial Advisors cost ₹25k+ annually. 95% of Indians have no plan.  
**Solution:** AI Money Mentor reduces the cost of a financial plan to nearly ₹0.

### Assumptions
1. **Target:** 1 Million ET active users.
2. **Current State:** 70% of users don't maximize 80C/80D tax deductions.
3. **Time Saved:** Professional planning takes 4–6 hours over 3 meetings. Our AI takes 5 minutes.

### Quantified Estimates
* **Tax Recovery:** At an average tax saving of ₹15,000 per user (via optimized regime selection), the tool could "recover" **₹1,500 Crores** in disposable income for 1M users.
* **Operational Efficiency:** 98% reduction in "Time-to-Plan" (from 360 mins to 5 mins).
* **Revenue Growth for ET:** Potential 15–20% increase in lead conversion for ET's partner financial products (Insurance/SIPs) due to high-intent, AI-verified recommendations.

---

## 🛠 Setup & Installation

### Prerequisites
* Node.js (v18+)
* npm or Bun

### Steps

1. **Clone the Repo:**
```bash
   git clone https://github.com/shreyas07-anonymous/ai-money-mentor.git
   cd ai-money-mentor
```

2. **Install Dependencies:**
```bash
   npm install
   # OR
   bun install
```

3. **Run Development Server:**
```bash
   npm run dev
```

4. **Build for Production:**
```bash
   npm run build
```



**Developed by The Logic Layers**  
*Shreyas Patankar / Aditya Thakur / Swaraj Shinde / Dheeraj Muwal | ET Gen Hackathon 2026*
````
