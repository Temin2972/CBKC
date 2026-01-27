# Security Configuration Guide for S-Net

## 🔐 Overview

This document outlines the security measures implemented in S-Net and provides setup instructions for production deployment.

---

## 📁 Security Files Created

### Frontend Security

1. **`src/lib/security.js`** - Core security utilities
   - Input sanitization (XSS prevention)
   - Rate limiting (client-side)
   - CSRF protection
   - Password strength validation
   - Session timeout management
   - Secure storage utilities
   - Audit logging

2. **`src/hooks/useSecurity.js`** - React security hooks
   - `useSecurity()` - Session management
   - `useRateLimit()` - Action rate limiting
   - `useSecureForm()` - Secure form handling
   - `useSecurityLog()` - Event logging
   - `useProtectedAction()` - Role-based action protection

3. **`src/components/Security/`**
   - `SessionTimeoutModal.jsx` - Session expiry warning
   - `PasswordStrength.jsx` - Password strength indicator

### Backend Security (Supabase)

4. **`supabase/security-policies.sql`** - Database security
   - Row Level Security (RLS) policies
   - Rate limiting functions
   - Audit log tables
   - Input validation triggers
   - Security indexes

---

## 🛡️ Security Features

### 1. Authentication Security

- **Password Requirements**:
  - Minimum 8 characters
  - Recommended: uppercase, lowercase, numbers, special characters
  - Common pattern detection
  - Visual strength indicator

- **Session Management**:
  - 30-minute inactivity timeout
  - 5-minute warning before expiry
  - Auto-logout on timeout
  - Activity tracking

### 2. Input Validation & Sanitization

- **XSS Prevention**: All user input sanitized with DOMPurify
- **Content Validation**: Length limits, pattern validation
- **URL Validation**: Only http/https protocols allowed
- **Username Validation**: Reserved words blocked

### 3. Rate Limiting

| Action | Max Attempts | Window |
|--------|--------------|--------|
| Login | 5 | 60 seconds |
| Post creation | 10 | 60 seconds |
| Comments | 20 | 60 seconds |
| Password reset | 3 | 300 seconds |

### 4. Row Level Security (RLS)

- Users can only access their own data
- Counselors can access student data they're assigned to
- Admins have full access
- Chat rooms respect privacy settings

### 5. Audit Logging

- All security events logged
- Failed login attempts tracked
- Sensitive actions recorded
- 90-day retention policy

---

## 🚀 Production Setup

### Step 1: Supabase Configuration

1. **Enable RLS on all tables**:
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy contents of supabase/security-policies.sql
   ```

2. **Configure Authentication**:
   - Go to Authentication > Policies
   - Enable email confirmation
   - Set password minimum length to 8
   - Enable rate limiting

3. **Set up SSL**:
   - Go to Settings > Database
   - Ensure "Enforce SSL" is enabled

4. **Configure CORS**:
   - Go to Settings > API
   - Add only your production domain

### Step 2: Environment Variables

```env
# .env.production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GEMINI_API_KEY=your_gemini_key

# Never commit these to git!
```

### Step 3: Deployment Checklist

- [ ] All environment variables set
- [ ] RLS policies applied to database
- [ ] SSL enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Email confirmation enabled
- [ ] Backup configured
- [ ] Monitoring set up

---

## 🔧 Usage Examples

### Rate Limiting

```jsx
import { useRateLimit } from '../hooks/useSecurity'

function PostForm() {
  const { isLimited, remainingTime, checkLimit } = useRateLimit('create_post', {
    maxAttempts: 10,
    windowMs: 60000
  })

  const handleSubmit = () => {
    if (!checkLimit()) {
      alert(`Vui lòng đợi ${remainingTime} giây`)
      return
    }
    // Submit post...
  }

  return (
    <button disabled={isLimited}>
      {isLimited ? `Đợi ${remainingTime}s` : 'Đăng bài'}
    </button>
  )
}
```

### Input Sanitization

```jsx
import { sanitizeText, validateInput } from '../lib/security'

// Sanitize user input
const cleanContent = sanitizeText(userInput)

// Validate with options
const { isValid, value, error } = validateInput(userInput, {
  minLength: 10,
  maxLength: 1000,
  required: true
})
```

### Session Timeout

```jsx
import { useSecurity } from '../hooks/useSecurity'
import SessionTimeoutModal from '../components/Security/SessionTimeoutModal'

function App() {
  const { sessionExpiring, extendSession } = useSecurity()
  const { signOut } = useAuth()

  return (
    <>
      <SessionTimeoutModal
        isOpen={sessionExpiring}
        onExtend={extendSession}
        onLogout={signOut}
      />
      {/* App content */}
    </>
  )
}
```

### Password Strength

```jsx
import PasswordStrength from '../components/Security/PasswordStrength'

function RegisterForm() {
  const [password, setPassword] = useState('')

  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrength password={password} />
    </div>
  )
}
```

### Protected Actions

```jsx
import { useProtectedAction } from '../hooks/useSecurity'

function AdminPanel() {
  const { execute, canPerform } = useProtectedAction({
    requireAuth: true,
    requireRole: 'admin',
    rateLimitAction: 'admin_action'
  })

  const handleDelete = async () => {
    try {
      await execute(async () => {
        // Delete action...
      })
    } catch (error) {
      alert(error.message)
    }
  }

  const check = canPerform()
  if (!check.allowed) {
    return <p>{check.reason}</p>
  }

  return <button onClick={handleDelete}>Delete</button>
}
```

---

## ⚠️ Security Best Practices

1. **Never store sensitive data in localStorage** - Use secure session storage
2. **Always validate on both client and server** - Never trust client-side validation alone
3. **Keep dependencies updated** - Regularly run `npm audit`
4. **Use HTTPS only** - Never transmit data over HTTP
5. **Implement proper error handling** - Don't expose internal errors to users
6. **Log security events** - Monitor for suspicious activity
7. **Regular security audits** - Review access logs and permissions

---

## 📞 Emergency Contacts

If you discover a security vulnerability:
1. Do not disclose publicly
2. Contact the development team immediately
3. Document the issue with steps to reproduce

---

*Last updated: January 2026*
*Version: 1.0.0*
