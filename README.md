# 🧬 Curalink — AI Medical Research Assistant

Curalink is a full-stack AI-powered medical research platform that retrieves, ranks, and synthesizes biomedical literature and clinical trials into structured, evidence-based insights.

It is designed to help researchers, clinicians, and students quickly navigate large-scale medical data and extract actionable knowledge.

---


## 🧠 Problem Statement

Medical research is scattered across multiple sources:

* PubMed (biomedical papers)
* OpenAlex (academic datasets)
* ClinicalTrials.gov (ongoing trials)

Finding relevant, up-to-date insights requires:

* searching multiple platforms
* filtering hundreds of results
* manually synthesizing findings

👉 This process is slow, fragmented, and inefficient.

---

## 💡 Solution — Curalink

Curalink solves this by:

1. Expanding user queries using medical context
2. Retrieving 100–180 research papers across sources
3. Applying hybrid ranking (semantic + keyword + recency)
4. Extracting top insights using an open-source LLM
5. Presenting structured, citation-backed results

---

## ✨ Key Features

### 🔍 Intelligent Query Expansion

* Enhances queries using disease-specific terms and synonyms
* Improves recall across multiple research databases

---

### 📚 Multi-Source Retrieval

* PubMed API → biomedical research papers
* OpenAlex API → academic literature
* ClinicalTrials API → ongoing and completed trials

---

### 🧠 Hybrid Ranking Engine

Combines:

* semantic relevance
* keyword matching
* recency scoring

Ensures high-quality, relevant results.

---

### 🤖 AI-Powered Research Synthesis

* Uses **open-source LLM (Mixtral via Groq)**
* Generates:

  * overview summaries
  * research insights
  * clinical implications
  * gaps & limitations

---

### 💬 Context-Aware Chat

* Maintains conversation history
* Infers disease context across queries

---

### 📊 Structured Output

Every response includes:

* top publications
* clinical trials
* insights with citations
* metadata (processing time, sources)

---

### 🎨 Modern Research Dashboard

* Dark-themed clinical UI
* Interactive results panels
* Smooth animations and loading pipeline

---

## 🏗️ Architecture

```
User Query
   ↓
Query Expansion
   ↓
Parallel Data Fetch
(PubMed + OpenAlex + ClinicalTrials)
   ↓
Hybrid Ranking Engine
   ↓
LLM Synthesis (Groq - Mixtral)
   ↓
Structured Response
   ↓
Frontend Dashboard
```

---

## ⚙️ Tech Stack

### Frontend

* React (Vite)
* TailwindCSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Atlas)

### APIs

* PubMed API
* OpenAlex API
* ClinicalTrials.gov API

### LLM

* Mixtral (open-source)
* Served via Groq API (cloud inference)

---

## 🔐 Environment Variables

### Backend `.env`

```
PORT=5000
MONGO_URI=your_mongodb_uri

# LLM
GROQ_API_KEY=your_api_key
LLM_PROVIDER=groq
LLM_MODEL=mixtral-8x7b-32768

# Optional
NCBI_API_KEY=
CACHE_TTL_SECONDS=300
```

---

## 🛠️ Local Setup

### 1. Clone Repository

```
git clone https://github.com/YOUR_USERNAME/curalink.git
cd curalink
```

---

### 2. Setup Backend

```
cd backend
npm install
npm run dev
```

Runs on:

```
http://localhost:5000
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

## 🌐 Deployment

### Frontend (Vercel)

* Root: `/frontend`
* Build: `npm run build`
* Output: `dist`

### Backend (Render)

* Root: `/backend`
* Start: `node server.js`

---

## 🧪 Example Query

```
Disease: Lung Cancer  
Query: Latest treatment options
```

### Output includes:

* Research overview
* Top findings with citations
* Active clinical trials
* Clinical implications

---

## 📈 Performance

* Processes ~100–180 research papers per query
* Parallel API fetching
* Smart fallback if LLM fails
* Average response time: 20–80 seconds

---

## ⚠️ Limitations

* LLM responses depend on provided data only
* No real-time clinical validation
* Performance depends on external APIs

---

## 🚀 Future Improvements

* Streaming responses (real-time typing)
* Semantic embeddings for better ranking
* User authentication & saved sessions
* Export reports (PDF / CSV)
* Real-time collaboration

---

## 🙌 Acknowledgements

* PubMed (NCBI)
* OpenAlex
* ClinicalTrials.gov
* Groq (LLM inference)
