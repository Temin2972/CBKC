# Mental Health Platform - Tâm Lý Học Đường

A secure, anonymous mental health counseling platform for students and counselors built with React, Supabase, and Tailwind CSS.

## Features

- 🔐 Secure authentication with email/password
- 💬 Real-time chat between students and counselors
- 👥 Anonymous community posts
- 🖼️ Image upload for posts
- 🎨 Beautiful, colorful UI with Tailwind CSS
- 📱 Fully responsive design
- 🔒 Row-Level Security (RLS) for data privacy

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel / Cloudflare Pages

## Quick Start

### 1. Clone & Install

\`\`\`bash
git clone https://github.com/yourusername/mental-health-platform.git
cd mental-health-platform
npm install
\`\`\`

### 2. Set up Supabase

1. Create account at https://supabase.com
2. Create new project
3. Run the SQL from `DEPLOYMENT.md` to create tables
4. Enable Authentication > Email Provider
5. Create Storage buckets: avatars, post-images

### 3. Configure Environment

\`\`\`bash
cp .env.example .env
\`\`\`

Add your Supabase credentials to `.env`:

\`\`\`
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open http://localhost:3000

### 5. Build for Production

\`\`\`bash
npm run build
\`\`\`

## Deployment

See `DEPLOYMENT.md` for complete deployment instructions to Vercel or Cloudflare Pages.

## Project Structure

\`\`\`
src/
├── components/     # Reusable React components
├── hooks/          # Custom React hooks (auth, chat, posts)
├── lib/            # Supabase client configuration
├── pages/          # Page components (Login, Home, Chat, etc.)
└── styles/         # Global CSS and Tailwind
\`\`\`

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
\`\`\`
