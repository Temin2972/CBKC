# S-Net - Nền tảng website hỗ trợ tâm lý học đường

> From team CBKC

## 🌟 Tính năng

- 💬 **Chat riêng tư** giữa học sinh và các giáo viên tư vấn
- 👥 **Trang cộng đồng ẩn danh** hỗ trợ đăng bài và bình luận
- 🤖 **Hệ thống AI kiểm duyệt** nội dung tự động trước khi đăng lên trang cộng đồng
- 📅 **Đặt lịch tư vấn** trực tiếp với giáo viên
- 🔔 **Thông báo real-time** khi có tin nhắn mới

## 🛠️ Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | React 18 + Vite |
| **Backend** | Supabase (PostgreSQL + Real-time + Auth + Storage) |
| **AI System** | Google Gemini API |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

## 📁 Cấu trúc dự án

```
src/
├── components/           # React components
│   ├── Auth/            # Authentication components (LoginForm, RegisterForm)
│   ├── Chat/            # Chat-related components
│   ├── Community/       # Community/posts components
│   ├── Counselor/       # Counselor-specific components
│   ├── Layout/          # Layout components (Navbar, ProtectedRoute)
│   ├── Notifications/   # Notification components
│   └── UI/              # Reusable UI components (Button, Input, Modal, etc.)
├── constants/           # Application constants and messages
│   ├── index.js         # Main constants (routes, roles, settings)
│   └── messages.js      # Vietnamese text/labels
├── contexts/            # React contexts
│   └── AuthContext.jsx  # Authentication context provider
├── hooks/               # Custom React hooks
│   ├── useAuth.js       # Authentication hook (re-export)
│   ├── useForm.js       # Form state management
│   ├── useChatMessages.js
│   ├── useNotifications.js
│   └── ...
├── lib/                 # Library configurations
│   ├── supabaseClient.js
│   └── contentModeration.js
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Community.jsx
│   └── ...
├── styles/              # Global styles
│   └── globals.css
└── utils/               # Utility functions
    ├── formatters.js    # Date/text formatting
    ├── validation.js    # Form validation
    ├── helpers.js       # General helpers
    └── index.js         # Barrel export
```

## 🚀 Cài đặt và chạy

```bash
# Clone repository
git clone https://github.com/your-repo/s-net.git
cd s-net

# Cài đặt dependencies
npm install

# Tạo file .env với các biến môi trường
cp .env.example .env

# Chạy development server
npm run dev
```

## 📝 Biến môi trường

Tạo file `.env` với các biến sau:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 📖 Triển khai

Bất kỳ ai cũng có thể sử dụng nền tảng này để triển khai 1 trang web riêng của họ. Xem thêm tại [DEPLOYMENT.md](DEPLOYMENT.md).

## 🏗️ Kiến trúc mã nguồn

### UI Components

Các component UI tái sử dụng được trong `src/components/UI/`:

```jsx
import { Button, Input, Alert, Modal, Card } from '../components/UI'
```

### Authentication

Sử dụng `AuthContext` để quản lý trạng thái xác thực:

```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, signIn, signOut, isCounselor } = useAuth()
  // ...
}
```

### Form Handling

Sử dụng hook `useForm` để quản lý form:

```jsx
import { useForm, validators } from '../hooks/useForm'

const { values, errors, handleChange, validate } = useForm({
  email: '',
  password: '',
})
```

### Constants

Tất cả constants được tập trung trong `src/constants/`:

```jsx
import { ROUTES, USER_ROLES } from '../constants'
import { AUTH_MESSAGES, BUTTON_LABELS } from '../constants/messages'
```

## 📄 License

MIT License
