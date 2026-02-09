/**
 * Feedback Page Component
 * Website suggestions and session feedback
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, isDemoMode, getDemoState } from '../lib/supabaseClient'
import { DEMO_FEEDBACKS, DEMO_SUGGESTIONS, DEMO_USERS } from '../lib/demoData'
import Navbar from '../components/Layout/Navbar'
import { Button, Alert } from '../components/UI'
import { 
  MessageSquarePlus, 
  Star, 
  Send, 
  CheckCircle2,
  Lightbulb,
  Bug,
  ThumbsUp,
  MessageCircle,
  User,
  Trash2
} from 'lucide-react'

// Tab options
const TABS = [
  { id: 'session', label: 'Đánh giá phiên tư vấn', icon: MessageCircle },
  { id: 'suggestion', label: 'Góp ý website', icon: Lightbulb },
]

// Suggestion types
const SUGGESTION_TYPES = [
  { id: 'feature_request', label: 'Đề xuất tính năng', icon: Lightbulb },
  { id: 'bug_report', label: 'Báo lỗi', icon: Bug },
  { id: 'compliment', label: 'Khen ngợi', icon: ThumbsUp },
  { id: 'other', label: 'Khác', icon: MessageSquarePlus },
]

export default function Feedback() {
  const { user, id: userId, isCounselor } = useAuth()
  const [activeTab, setActiveTab] = useState('session')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  // Session feedback state
  const [selectedCounselor, setSelectedCounselor] = useState('')
  const [rating, setRating] = useState(0)
  const [effectiveness, setEffectiveness] = useState(0)
  const [problemResolved, setProblemResolved] = useState(null)
  const [sessionComment, setSessionComment] = useState('')
  
  // Suggestion state
  const [suggestionType, setSuggestionType] = useState('feature_request')
  const [suggestionContent, setSuggestionContent] = useState('')
  
  // Counselors list
  const [counselors, setCounselors] = useState([])
  
  // My feedbacks (for counselors)
  const [myFeedbacks, setMyFeedbacks] = useState([])
  
  // All suggestions (for counselors/admins)
  const [allSuggestions, setAllSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    loadCounselors()
    if (isCounselor) {
      loadMyFeedbacks()
      loadAllSuggestions()
    }
  }, [isCounselor])

  const loadCounselors = async () => {
    if (isDemoMode) {
      setCounselors([
        { id: DEMO_USERS.counselor1.id, name: DEMO_USERS.counselor1.user_metadata.full_name },
        { id: DEMO_USERS.counselor2.id, name: DEMO_USERS.counselor2.user_metadata.full_name },
      ])
    } else {
      const { data } = await supabase
        .from('users')
        .select('id, full_name')
        .in('role', ['counselor', 'admin'])
      
      if (data) {
        setCounselors(data.map(c => ({ id: c.id, name: c.full_name })))
      }
    }
  }

  const loadMyFeedbacks = async () => {
    if (isDemoMode) {
      const state = getDemoState()
      setMyFeedbacks(state?.feedbacks.filter(f => f.counselor_id === userId) || [])
    } else {
      const { data } = await supabase
        .from('feedbacks')
        .select('*')
        .eq('counselor_id', userId)
        .order('created_at', { ascending: false })
      
      if (data) setMyFeedbacks(data)
    }
  }

  const loadAllSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      if (isDemoMode) {
        const state = getDemoState()
        setAllSuggestions(state?.suggestions || DEMO_SUGGESTIONS)
      } else {
        const { data, error } = await supabase
          .from('suggestions')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setAllSuggestions(data || [])
      }
    } catch (err) {
      console.error('Error loading suggestions:', err)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const updateSuggestionStatus = async (suggestionId, status) => {
    try {
      if (!isDemoMode) {
        const { error } = await supabase
          .from('suggestions')
          .update({ status, responded_by: userId, responded_at: new Date().toISOString() })
          .eq('id', suggestionId)
        
        if (error) throw error
      }
      
      setAllSuggestions(prev => prev.map(s => 
        s.id === suggestionId ? { ...s, status, responded_by: userId } : s
      ))
    } catch (err) {
      console.error('Error updating suggestion:', err)
    }
  }

  const getSuggestionTypeInfo = (type) => {
    return SUGGESTION_TYPES.find(t => t.id === type) || SUGGESTION_TYPES[3]
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' }
      case 'reviewed':
        return { label: 'Đã xem', className: 'bg-blue-100 text-blue-700' }
      case 'implemented':
        return { label: 'Đã thực hiện', className: 'bg-green-100 text-green-700' }
      case 'rejected':
        return { label: 'Từ chối', className: 'bg-red-100 text-red-700' }
      default:
        return { label: status, className: 'bg-gray-100 text-gray-700' }
    }
  }

  const deleteSuggestion = async (suggestionId) => {
    if (!confirm('Bạn có chắc muốn xóa góp ý này?')) return
    
    try {
      if (!isDemoMode) {
        const { error } = await supabase
          .from('suggestions')
          .delete()
          .eq('id', suggestionId)
        
        if (error) throw error
      }
      
      setAllSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    } catch (err) {
      console.error('Error deleting suggestion:', err)
    }
  }

  const deleteSessionFeedback = async (feedbackId) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    
    try {
      if (!isDemoMode) {
        const { error } = await supabase
          .from('feedbacks')
          .delete()
          .eq('id', feedbackId)
        
        if (error) throw error
      }
      
      setMyFeedbacks(prev => prev.filter(f => f.id !== feedbackId))
    } catch (err) {
      console.error('Error deleting feedback:', err)
    }
  }

  const handleSubmitSessionFeedback = async () => {
    if (!selectedCounselor || rating === 0 || effectiveness === 0 || problemResolved === null) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    setError('')

    try {
      const feedbackData = {
        student_id: userId,
        counselor_id: selectedCounselor,
        rating,
        effectiveness,
        problem_resolved: problemResolved,
        comment: sessionComment,
        is_private: true,
        created_at: new Date().toISOString()
      }

      if (isDemoMode) {
        const state = getDemoState()
        state.feedbacks.push({ id: 'feedback-' + Date.now(), ...feedbackData })
      } else {
        await supabase.from('feedbacks').insert(feedbackData)
      }

      setSubmitted(true)
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSuggestion = async () => {
    if (!suggestionContent.trim()) {
      setError('Vui lòng nhập nội dung góp ý')
      return
    }

    setLoading(true)
    setError('')

    try {
      const suggestionData = {
        user_id: userId,
        type: suggestionType,
        content: suggestionContent,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      if (isDemoMode) {
        const state = getDemoState()
        state.suggestions.push({ id: 'suggestion-' + Date.now(), ...suggestionData })
      } else {
        await supabase.from('suggestions').insert(suggestionData)
      }

      setSubmitted(true)
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setSelectedCounselor('')
    setRating(0)
    setEffectiveness(0)
    setProblemResolved(null)
    setSessionComment('')
    setSuggestionContent('')
  }

  // Star rating component
  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`p-1 transition-all ${
              star <= value 
                ? 'text-amber-400 scale-110' 
                : 'text-gray-300 hover:text-amber-200'
            }`}
          >
            <Star size={32} fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-animated-gradient relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-teal-700 mb-4 border border-teal-100">
            <MessageSquarePlus size={16} />
            <span>Đánh giá & Góp ý</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Phản hồi của bạn
          </h1>
          <p className="text-gray-600">
            Giúp chúng tôi cải thiện chất lượng dịch vụ
          </p>
        </header>

        {/* Counselor view - My Feedbacks */}
        {isCounselor && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-amber-500" size={20} />
              Đánh giá từ học sinh
            </h2>
            {myFeedbacks.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Chưa có đánh giá nào</p>
            ) : (
              <div className="space-y-4">
                {myFeedbacks.map(fb => (
                  <div key={fb.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {[...Array(fb.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-amber-400 fill-current" />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteSessionFeedback(fb.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-700">{fb.comment || 'Không có nhận xét'}</p>
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>Hiệu quả: {fb.effectiveness}/5</span>
                      <span>Giải quyết vấn đề: {fb.problem_resolved ? 'Có' : 'Không'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Counselor view - Website Suggestions */}
        {isCounselor && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-6 mb-6">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="text-amber-500" size={20} />
              Góp ý từ người dùng ({allSuggestions.length})
            </h2>
            {loadingSuggestions ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : allSuggestions.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Chưa có góp ý nào</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allSuggestions.map(suggestion => {
                  const typeInfo = getSuggestionTypeInfo(suggestion.type)
                  const statusBadge = getStatusBadge(suggestion.status)
                  const TypeIcon = typeInfo.icon
                  
                  return (
                    <div key={suggestion.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            suggestion.type === 'bug_report' ? 'bg-red-100 text-red-600' :
                            suggestion.type === 'feature_request' ? 'bg-blue-100 text-blue-600' :
                            suggestion.type === 'compliment' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            <TypeIcon size={16} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">{typeInfo.label}</span>
                            <p className="text-xs text-gray-400">
                              {new Date(suggestion.created_at).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">{suggestion.content}</p>
                      
                      {/* Status Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => updateSuggestionStatus(suggestion.id, 'reviewed')}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            suggestion.status === 'reviewed' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          Đã xem
                        </button>
                        <button
                          onClick={() => updateSuggestionStatus(suggestion.id, 'implemented')}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            suggestion.status === 'implemented' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          Đã thực hiện
                        </button>
                        <button
                          onClick={() => updateSuggestionStatus(suggestion.id, 'rejected')}
                          className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                            suggestion.status === 'rejected' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => deleteSuggestion(suggestion.id)}
                          className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa góp ý"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSubmitted(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-white/70 text-gray-600 hover:bg-white'
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl p-6">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Cảm ơn bạn!
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'session' 
                  ? 'Đánh giá của bạn đã được gửi riêng tư đến tư vấn viên.' 
                  : 'Góp ý của bạn đã được ghi nhận.'}
              </p>
              <Button onClick={resetForm}>
                Gửi đánh giá khác
              </Button>
            </div>
          ) : (
            <>
              {error && <Alert variant="error" className="mb-4">{error}</Alert>}

              {activeTab === 'session' ? (
                /* Session Feedback Form */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn tư vấn viên
                    </label>
                    <select
                      value={selectedCounselor}
                      onChange={(e) => setSelectedCounselor(e.target.value)}
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    >
                      <option value="">-- Chọn tư vấn viên --</option>
                      {counselors.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <StarRating 
                    value={rating} 
                    onChange={setRating} 
                    label="Đánh giá chung về phiên tư vấn" 
                  />

                  <StarRating 
                    value={effectiveness} 
                    onChange={setEffectiveness} 
                    label="Mức độ hiệu quả của lời khuyên" 
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vấn đề của bạn có được giải quyết không?
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setProblemResolved(true)}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          problemResolved === true
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ✓ Có
                      </button>
                      <button
                        onClick={() => setProblemResolved(false)}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          problemResolved === false
                            ? 'bg-rose-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        ✗ Chưa
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét thêm (tuỳ chọn)
                    </label>
                    <textarea
                      value={sessionComment}
                      onChange={(e) => setSessionComment(e.target.value)}
                      placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                      className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-32"
                    />
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-gray-500 mb-4">
                      🔒 Đánh giá này sẽ được gửi riêng tư đến tư vấn viên, không ai khác có thể xem.
                    </p>
                    <Button
                      onClick={handleSubmitSessionFeedback}
                      loading={loading}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                      icon={Send}
                    >
                      Gửi đánh giá
                    </Button>
                  </div>
                </div>
              ) : (
                /* Website Suggestion Form */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Loại góp ý
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SUGGESTION_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setSuggestionType(type.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                            suggestionType === type.id
                              ? 'bg-teal-50 border-2 border-teal-500 text-teal-700'
                              : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <type.icon size={18} />
                          <span className="text-sm">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung góp ý
                    </label>
                    <textarea
                      value={suggestionContent}
                      onChange={(e) => setSuggestionContent(e.target.value)}
                      placeholder="Chia sẻ ý kiến, đề xuất hoặc báo lỗi của bạn..."
                      className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-40"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitSuggestion}
                    loading={loading}
                    disabled={loading}
                    size="lg"
                    className="w-full"
                    icon={Send}
                  >
                    Gửi góp ý
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
