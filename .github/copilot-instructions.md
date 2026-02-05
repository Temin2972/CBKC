# Copilot Instructions for S-Net

Vietnamese school mental health support platform built with React 18 + Vite, Supabase (PostgreSQL/real-time/auth), and Google Gemini AI.

## Architecture Overview

**Frontend:** React SPA with feature-based component organization. Pages in `src/pages/`, domain components in `src/components/{Auth,Chat,Community,Counselor}/`, reusable UI in `src/components/UI/`.

**Backend:** Supabase handles auth, database, real-time subscriptions, and storage. All DB logic lives in `src/lib/supabaseClient.js` (480+ lines with full demo mode fallback).

**AI Systems:** Two Gemini-powered modules:
- `src/lib/contentModeration.js` - Content moderation for community posts (profanity/spam/crisis detection)
- `src/lib/aiTriage.js` - "Tâm An" AI counselor assistant with student assessment

**Demo Mode:** When env vars are missing, the app runs entirely from mock data in `src/lib/demoData.js`. Check `isDemoMode` flag in supabaseClient.

## Code Patterns

### Imports & Exports
Use barrel exports from index files:
```jsx
import { Button, Modal, Card } from '../components/UI'
import { useAuth, useForm, validators } from '../hooks'
import { ROUTES, USER_ROLES } from '../constants'
import { AUTH_MESSAGES } from '../constants/messages'
```

### Custom Hooks
All data fetching uses custom hooks in `src/hooks/`. Pattern: `use{Resource}` returns `{ data, loading, error, actions }`.
```jsx
const { messages, loading, sendMessage } = useChatMessages(roomId, userId)
```

### Form Handling
Use `useForm` hook with `validators` for all forms:
```jsx
const { values, errors, handleChange, validate } = useForm({ email: '', password: '' })
const isValid = validate({
  email: [validators.required(), validators.email()],
  password: [validators.required(), validators.minLength(6)]
})
```

### UI Components
UI components accept `variant`, `size` props with Tailwind styling. See [Button.jsx](src/components/UI/Button.jsx) for the pattern:
- Variants: `primary`, `secondary`, `danger`, `ghost`, `success`, `outline`
- Sizes: `sm`, `md`, `lg`, `xl`

### Role-Based Logic
Three roles: `student`, `counselor`, `admin`. Access via `useAuth()`:
```jsx
const { user, role, isCounselor } = useAuth()
if (role === USER_ROLES.STUDENT) { /* student-only logic */ }
```

## Key Conventions

1. **Vietnamese UI text:** All user-facing strings in `src/constants/messages.js`. Never hardcode Vietnamese text in components.

2. **Real-time subscriptions:** Use Supabase channels pattern from `useChatMessages.js`. Always cleanup with `supabase.removeAllChannels()` in effect cleanup.

3. **Content moderation:** Community posts go through `analyzeContent()` before publishing. Results include `FLAG_LEVELS` and `MODERATION_ACTIONS`.

4. **Date formatting:** Use functions from `src/utils/formatters.js` (`formatMessageTime`, `formatDistanceToNow`) - all output Vietnamese locale.

5. **Validation:** Use functions from `src/utils/validation.js` which wrap security utilities from `src/lib/security.js`.

## Database Schema

Migrations in `supabase/migrations/`. Key tables:
- `users` - Profiles with `role` column
- `chat_rooms` - Has `urgency_level`, `is_counseled`, `ai_triage_complete` fields
- `chat_messages` - With `sender_id` foreign key to users
- `posts`, `comments` - Community content with moderation fields
- `student_notes` - Counselor notes per student (RLS: staff-only)

## Security Patterns

**Input sanitization:** All user input goes through `src/lib/security.js`:
- `sanitizeHTML(text)` - XSS protection, allows only `<b>`, `<i>`, `<em>`, `<strong>`, `<br>`
- `sanitizeText(text)` - Strip all HTML completely
- `sanitizeURL(url)` - Validate and allow only `http:`/`https:` protocols

**Row Level Security:** Supabase RLS policies in `supabase/security-policies.sql`. Key rules:
- `student_notes` - Staff-only access (counselor/admin)
- Users can only read/update their own profile data
- Chat messages filtered by room membership

**Client-side rate limiting:** Built into `security.js` for API calls.

## Commands

```bash
npm run dev      # Start dev server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
```

**Testing:** Not yet implemented. No test framework configured.

## AI Triage System

The "Tâm An" AI assistant in `src/components/Chat/ChatInterface.jsx` has specific behavior:
- **60-second delay**: AI only introduces itself after `AI_RESPONSE_DELAY` (60 seconds) following the student's first message
- **Stops when counselor replies**: Once a counselor sends a message, AI stops responding
- **Requires API key**: If `VITE_GEMINI_API_KEY` is not set, AI returns a fallback "technical issue" message

Key functions in `src/lib/aiTriage.js`:
- `generateAIResponse()` - Generates conversational response + assessment
- `shouldAIRespond(chatRoom)` - Checks if AI should still respond (no counselor reply yet)
- `URGENCY_LEVELS` - 0 (normal) to 3 (critical/self-harm)

## Deployment

Deployed on **Vercel**. Config in `vercel.json`:
- Framework: Vite
- Output: `dist/`
- SPA routing: All paths rewrite to `/index.html`

Set environment variables in Vercel dashboard:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GEMINI_API_KEY=...  # For AI moderation and triage
```

Without these, the app runs in demo mode with test accounts logged to console.
