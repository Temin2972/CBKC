/**
 * Demo Data for Testing
 * Provides mock users, posts, messages, etc. for local testing without Supabase
 */

// Demo Users
export const DEMO_USERS = {
  student1: {
    id: 'demo-student-1',
    email: 'student1.student@mentalhealth.app',
    user_metadata: {
      username: 'student1',
      full_name: 'Nguyễn Văn An',
      role: 'student',
      avatar_preset: 1,
      created_at: '2025-01-01T00:00:00Z'
    }
  },
  student2: {
    id: 'demo-student-2',
    email: 'student2.student@mentalhealth.app',
    user_metadata: {
      username: 'student2',
      full_name: 'Trần Thị Bình',
      role: 'student',
      avatar_preset: 2,
      created_at: '2025-01-02T00:00:00Z'
    }
  },
  counselor1: {
    id: 'demo-counselor-1',
    email: 'counselor1@school.edu.vn',
    user_metadata: {
      username: 'counselor1',
      full_name: 'Thầy Lê Minh Hoàng',
      role: 'counselor',
      avatar_url: null,
      avatar_preset: 10,
      bio: 'Chuyên gia tâm lý học đường với 10 năm kinh nghiệm. Chuyên hỗ trợ các vấn đề về stress học tập và định hướng nghề nghiệp.',
      specialization: ['Stress học tập', 'Định hướng nghề nghiệp', 'Kỹ năng giao tiếp'],
      created_at: '2024-06-01T00:00:00Z'
    }
  },
  counselor2: {
    id: 'demo-counselor-2',
    email: 'counselor2@school.edu.vn',
    user_metadata: {
      username: 'counselor2',
      full_name: 'Cô Nguyễn Thu Hà',
      role: 'counselor',
      avatar_url: null,
      avatar_preset: 11,
      bio: 'Tâm lý gia với chuyên môn về trầm cảm tuổi teen và mối quan hệ gia đình. Luôn lắng nghe và thấu hiểu.',
      specialization: ['Trầm cảm', 'Mối quan hệ gia đình', 'Lo âu'],
      created_at: '2024-07-01T00:00:00Z'
    }
  },
  admin: {
    id: 'demo-admin-1',
    email: 'admin@school.edu.vn',
    user_metadata: {
      username: 'admin',
      full_name: 'Admin Hệ Thống',
      role: 'admin',
      avatar_preset: 20,
      created_at: '2024-01-01T00:00:00Z'
    }
  }
}

// Demo Credentials for easy testing
export const DEMO_CREDENTIALS = [
  { 
    username: 'student1', 
    password: '123456', 
    label: 'Học sinh 1 (Nguyễn Văn An)',
    role: 'student'
  },
  { 
    username: 'student2', 
    password: '123456', 
    label: 'Học sinh 2 (Trần Thị Bình)',
    role: 'student'
  },
  { 
    username: 'counselor1@school.edu.vn', 
    password: '123456', 
    label: 'Tư vấn viên 1 (Thầy Hoàng)',
    role: 'counselor'
  },
  { 
    username: 'counselor2@school.edu.vn', 
    password: '123456', 
    label: 'Tư vấn viên 2 (Cô Hà)',
    role: 'counselor'
  },
  { 
    username: 'admin@school.edu.vn', 
    password: '123456', 
    label: 'Admin',
    role: 'admin'
  },
]

// Demo Posts (Community)
export const DEMO_POSTS = [
  {
    id: 'post-1',
    user_id: 'demo-student-1',
    content: 'Mình cảm thấy rất áp lực với kỳ thi sắp tới. Ai có tips ôn thi hiệu quả không ạ? 😔',
    image_url: null,
    created_at: '2025-01-14T10:30:00Z',
    likes_count: 5,
    comments_count: 3,
    status: 'approved',
    flag_level: 1, // mild concern
    user_likes: ['demo-student-2', 'demo-counselor-1']
  },
  {
    id: 'post-2',
    user_id: 'demo-student-2',
    content: 'Hôm nay mình đã nói chuyện với thầy cô tư vấn và cảm thấy nhẹ nhõm hơn rất nhiều. Cảm ơn thầy cô! ❤️',
    image_url: null,
    created_at: '2025-01-13T15:20:00Z',
    likes_count: 12,
    comments_count: 5,
    status: 'approved',
    flag_level: 0,
    user_likes: ['demo-student-1', 'demo-counselor-1', 'demo-counselor-2']
  },
  {
    id: 'post-3',
    user_id: 'demo-student-1',
    content: 'Có ai cảm thấy không biết mình thực sự muốn gì trong tương lai không? Mình hay lo lắng về việc chọn ngành đại học...',
    image_url: null,
    created_at: '2025-01-12T09:00:00Z',
    likes_count: 8,
    comments_count: 7,
    status: 'approved',
    flag_level: 1,
    user_likes: []
  }
]

// Demo Comments
export const DEMO_COMMENTS = [
  {
    id: 'comment-1',
    post_id: 'post-1',
    user_id: 'demo-counselor-1',
    content: 'Chào em! Stress trước kỳ thi là điều bình thường. Em có thể thử chia nhỏ bài học và nghỉ ngơi đều đặn. Nếu cần hỗ trợ thêm, em có thể chat với thầy cô nhé! 💪',
    created_at: '2025-01-14T11:00:00Z'
  },
  {
    id: 'comment-2',
    post_id: 'post-1',
    user_id: 'demo-student-2',
    content: 'Mình cũng đang như bạn! Cùng cố gắng nhé 🤝',
    created_at: '2025-01-14T11:30:00Z'
  },
  {
    id: 'comment-3',
    post_id: 'post-2',
    user_id: 'demo-counselor-2',
    content: 'Cô rất vui vì em cảm thấy tốt hơn! Hãy luôn chia sẻ khi cần nhé em ❤️',
    created_at: '2025-01-13T16:00:00Z'
  }
]

// Demo Chat Rooms
export const DEMO_CHAT_ROOMS = [
  {
    id: 'room-1',
    student_id: 'demo-student-1',
    counselor_id: null, // Public room - all counselors can see
    created_at: '2025-01-10T08:00:00Z',
    is_active: true,
    status: 'active',
    last_message_at: '2025-01-15T09:30:00Z'
  },
  {
    id: 'room-2',
    student_id: 'demo-student-2',
    counselor_id: 'demo-counselor-2', // Private room with specific counselor
    created_at: '2025-01-12T14:00:00Z',
    is_active: true,
    status: 'active',
    last_message_at: '2025-01-15T10:00:00Z'
  }
]

// Demo Chat Messages
export const DEMO_MESSAGES = [
  {
    id: 'msg-1',
    chat_room_id: 'room-1',
    sender_id: 'demo-student-1',
    content: '👋 Xin chào! Em cần được tư vấn. Mong các thầy/cô hỗ trợ em ạ!',
    created_at: '2025-01-10T08:00:00Z',
    is_read: true,
    read_by: ['demo-student-1', 'demo-counselor-1']
  },
  {
    id: 'msg-2',
    chat_room_id: 'room-1',
    sender_id: 'demo-counselor-1',
    content: 'Chào em! Thầy Hoàng đây. Em có thể chia sẻ với thầy nhé.',
    created_at: '2025-01-10T08:05:00Z',
    is_read: true,
    read_by: ['demo-student-1', 'demo-counselor-1']
  },
  {
    id: 'msg-3',
    chat_room_id: 'room-1',
    sender_id: 'demo-student-1',
    content: 'Dạ thầy, em đang lo lắng về kỳ thi sắp tới ạ. Em không biết ôn như thế nào cho hiệu quả.',
    created_at: '2025-01-10T08:10:00Z',
    is_read: true,
    read_by: ['demo-student-1', 'demo-counselor-1']
  },
  {
    id: 'msg-4',
    chat_room_id: 'room-1',
    sender_id: 'demo-counselor-1',
    content: 'Thầy hiểu em. Đầu tiên, em có thể chia sẻ với thầy em đang ôn những môn nào và thời gian còn lại là bao lâu không?',
    created_at: '2025-01-10T08:15:00Z',
    is_read: false,
    read_by: ['demo-counselor-1']
  },
  // Private room messages
  {
    id: 'msg-5',
    chat_room_id: 'room-2',
    sender_id: 'demo-student-2',
    content: '🔒 Xin chào cô Hà! Em muốn được tư vấn riêng với cô ạ.',
    created_at: '2025-01-12T14:00:00Z',
    is_read: true,
    read_by: ['demo-student-2', 'demo-counselor-2']
  },
  {
    id: 'msg-6',
    chat_room_id: 'room-2',
    sender_id: 'demo-counselor-2',
    content: 'Chào em! Cô sẵn sàng lắng nghe. Em cứ chia sẻ những gì em muốn nhé.',
    created_at: '2025-01-12T14:05:00Z',
    is_read: true,
    read_by: ['demo-student-2', 'demo-counselor-2']
  }
]

// Demo Notifications
export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-1',
    user_id: 'demo-student-1',
    type: 'new_message',
    title: '💬 Tin nhắn mới',
    message: 'Thầy Hoàng đã trả lời tin nhắn của bạn',
    link: '/chat',
    is_read: false,
    created_at: '2025-01-15T09:30:00Z'
  },
  {
    id: 'notif-2',
    user_id: 'demo-student-1',
    type: 'comment',
    title: '💬 Bình luận mới',
    message: 'Có người đã bình luận bài viết của bạn',
    link: '/community',
    is_read: true,
    created_at: '2025-01-14T11:00:00Z'
  }
]

// Demo Surveys
export const DEMO_SURVEYS = [
  {
    id: 'survey-1',
    title: 'Khảo sát Sức khỏe Tâm lý Học kỳ 1',
    description: 'Khảo sát định kỳ về tình trạng sức khỏe tâm lý của học sinh',
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'Trong tuần qua, bạn cảm thấy áp lực học tập ở mức độ nào?',
        scale: { min: 1, max: 5, labels: ['Rất nhẹ', 'Nhẹ', 'Trung bình', 'Cao', 'Rất cao'] }
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'Bạn thường xử lý stress bằng cách nào?',
        options: ['Nghe nhạc', 'Tập thể dục', 'Nói chuyện với bạn bè', 'Chơi game', 'Ngủ', 'Khác']
      },
      {
        id: 'q3',
        type: 'text',
        question: 'Bạn mong muốn nhà trường hỗ trợ gì thêm về mặt tâm lý?'
      }
    ],
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    deadline: '2025-01-31T23:59:59Z',
    responses_count: 45
  },
  {
    id: 'survey-2',
    title: 'Đánh giá Sự kiện Tâm lý Week',
    description: 'Góp ý cho sự kiện Tuần lễ Sức khỏe Tâm lý vừa qua',
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'Bạn đánh giá sự kiện ở mức độ nào?',
        scale: { min: 1, max: 5, labels: ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'] }
      },
      {
        id: 'q2',
        type: 'text',
        question: 'Bạn có góp ý gì cho sự kiện tiếp theo không?'
      }
    ],
    is_active: true,
    created_at: '2025-01-10T00:00:00Z',
    deadline: '2025-01-20T23:59:59Z',
    responses_count: 23
  }
]

// Demo Feedbacks (Session reviews)
export const DEMO_FEEDBACKS = [
  {
    id: 'feedback-1',
    student_id: 'demo-student-2',
    counselor_id: 'demo-counselor-2',
    chat_room_id: 'room-2',
    rating: 5,
    effectiveness: 5,
    problem_resolved: true,
    comment: 'Cô Hà rất tận tình và thấu hiểu. Em cảm thấy tốt hơn rất nhiều sau khi nói chuyện.',
    created_at: '2025-01-14T16:00:00Z',
    is_private: true
  }
]

// Demo Suggestions (Website feedback)
export const DEMO_SUGGESTIONS = [
  {
    id: 'suggestion-1',
    user_id: 'demo-student-1',
    type: 'feature_request',
    content: 'Mong muốn có thêm tính năng đặt lịch hẹn trực tiếp với thầy cô',
    status: 'pending',
    created_at: '2025-01-13T10:00:00Z'
  },
  {
    id: 'suggestion-2',
    user_id: 'demo-student-2',
    type: 'bug_report',
    content: 'Thông báo đôi khi không hiện ngay',
    status: 'reviewing',
    created_at: '2025-01-12T14:30:00Z'
  }
]

// Demo Flagged Content (For counselor review)
export const DEMO_FLAGGED_CONTENT = [
  {
    id: 'flag-1',
    user_id: 'demo-student-1',
    content_type: 'post',
    content_id: null,
    content: 'Mình thấy cuộc sống này thật vô nghĩa...',
    flag_level: 2, // Immediate attention
    category: 'depression',
    keywords: ['vô nghĩa', 'cuộc sống'],
    reasoning: 'Nội dung thể hiện dấu hiệu trầm cảm, cần quan tâm',
    is_resolved: false,
    created_at: '2025-01-14T08:00:00Z'
  }
]

// Avatar Presets (Array format for easy mapping)
export const AVATAR_PRESETS = [
  { id: 1, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=cat&backgroundColor=b6e3f4', name: 'Mèo xanh' },
  { id: 2, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=bear&backgroundColor=ffdfbf', name: 'Gấu hồng' },
  { id: 3, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=rabbit&backgroundColor=c0aede', name: 'Thỏ trắng' },
  { id: 4, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=fox&backgroundColor=ffd5dc', name: 'Cáo cam' },
  { id: 5, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=bird&backgroundColor=d1f4d1', name: 'Chim xanh' },
  { id: 6, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=owl&backgroundColor=b6e3f4', name: 'Cú mèo' },
  { id: 7, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=koala&backgroundColor=ffdfbf', name: 'Koala' },
  { id: 8, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=panda&backgroundColor=c0aede', name: 'Gấu trúc' },
  { id: 9, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=dog&backgroundColor=ffd5dc', name: 'Cún con' },
  { id: 10, url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=teacher&backgroundColor=d1f4d1', name: 'Thầy giáo' },
]

// Quotes for display
export const DEMO_QUOTES = [
  {
    id: 1,
    content: 'Bạn không cần phải kiểm soát mọi thứ. Chỉ cần đừng để mọi thứ kiểm soát bạn.',
    author: 'Khuyết danh',
    is_active: true
  },
  {
    id: 2,
    content: 'Hãy đối xử với bản thân như cách bạn đối xử với người bạn thân nhất của mình.',
    author: 'Khuyết danh',
    is_active: true
  },
  {
    id: 3,
    content: 'Chia sẻ gánh nặng sẽ giúp nó nhẹ đi một nửa.',
    author: 'Tục ngữ',
    is_active: true
  },
  {
    id: 4,
    content: 'Hôm nay có thể khó khăn, nhưng ngày mai sẽ là một cơ hội mới.',
    author: 'Khuyết danh',
    is_active: true
  },
  {
    id: 5,
    content: 'Bạn đã đủ tốt, đủ đẹp, đủ thông minh. Hãy tin vào bản thân.',
    author: 'Khuyết danh',
    is_active: true
  }
]
