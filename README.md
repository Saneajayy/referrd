# Referr'd

Referr'd is a full-stack platform designed to bridge the gap between talented job seekers and industry professionals willing to provide referrals. By replacing cold outreach with an AI-driven, structured matching system, the platform ensures that only high-quality candidates reach employees, streamlining the referral process for everyone.

---

## 🚀 The Problem

In today's competitive job market, getting a referral is often the key to getting an interview. However, the current process is broken:
- **Job Seekers** resort to sending hundreds of cold messages on LinkedIn, often resulting in low response rates and frustration.
- **Employees** are flooded with generic referral requests from candidates whose skills and experiences they cannot quickly verify or match against open roles.

## 💡 The Solution

Referr'd solves this by creating a verified, AI-filtered ecosystem:
1. **AI-Powered Screening**: Job seekers upload their resume, which is parsed and evaluated against specific job descriptions using the Google Gemini AI. Candidates must achieve a minimum match score (50%+) before they can even request a referral.
2. **Quality Control**: Employees only receive requests from candidates whose resumes have already been vetted by AI. The AI provides a quick summary of the candidate's strengths, gaps, and an overall match score, making the decision to refer much easier.
3. **Incentivization**: Employees earn points on the platform for every successful referral they give, creating a gamified system that encourages participation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS (Modern, Glassmorphism design system)
- **HTTP Client**: Axios (with JWT interceptors)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (with `pg` driver)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **File Storage**: Cloudinary (for storing PDF resumes)
- **AI Integration**: Google Gemini API (`@google/genai`) for resume-to-JD matching
- **Email Delivery**: Nodemailer (for OTP verification emails)
- **Background Jobs**: `node-cron` (auto-expiring stale requests)

---

## 📖 Summary of Features

### For Job Seekers
- Browse active job listings from verified companies.
- Upload and manage PDF resumes directly to Cloudinary.
- **AI Match Gate**: Apply for roles and instantly receive an AI-generated match score based on strengths and gaps.
- Select up to 3 verified employees from a company to request a direct referral.
- Track the status of referral requests in a dedicated dashboard.

### For Employees
- Secure registration requiring an OTP sent to a verified work email.
- Dedicated inbox for incoming referral requests, pre-sorted by AI match score.
- **Top Match Highlighting**: Instantly see the top 5 candidates for a given role.
- One-click actions to download resumes, Accept (Refer), or Decline requests.
- Gamified points system rewarding active referrers.

### For Admins
- Secure backend admin portal.
- Create and manage verified Companies and Job Postings.
- View platform-wide statistics (Total Users, Active Jobs, Referrals Given).
- Manually override and verify employee accounts.

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL running locally
- Cloudinary Account
- Google Gemini API Key

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your credentials.
4. Initialize the database schema:
   ```bash
   node utils/init-db.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.
