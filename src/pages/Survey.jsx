/**
 * Survey Page Component
 * Allows students to participate in school surveys
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, isDemoMode, getDemoState } from '../lib/supabaseClient'
import { DEMO_SURVEYS } from '../lib/demoData'
import Navbar from '../components/Layout/Navbar'
import { Button, Alert } from '../components/UI'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Star,
  Send,
  BarChart3
} from 'lucide-react'
import { formatDistanceToNow } from '../utils/formatters'

export default function Survey() {
  const { user, id: userId } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    setLoading(true)
    try {
      if (isDemoMode) {
        setSurveys(DEMO_SURVEYS)
      } else {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setSurveys(data || [])
      }
    } catch (err) {
      console.error('Error loading surveys:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenSurvey = (survey) => {
    setSelectedSurvey(survey)
    setResponses({})
    setSubmitted(false)
    setError('')
  }

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unanswered = selectedSurvey.questions.filter(q => !responses[q.id])
    if (unanswered.length > 0) {
      setError('Vui lòng trả lời tất cả các câu hỏi')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      if (!isDemoMode) {
        await supabase.from('survey_responses').insert({
          survey_id: selectedSurvey.id,
          user_id: userId,
          responses: responses,
          created_at: new Date().toISOString()
        })
      }
      
      setSubmitted(true)
      
      // Update local survey response count
      setSurveys(prev => prev.map(s => 
        s.id === selectedSurvey.id 
          ? { ...s, responses_count: (s.responses_count || 0) + 1 }
          : s
      ))
    } catch (err) {
      console.error('Error submitting survey:', err)
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question, index) => {
    const value = responses[question.id]

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{question.scale?.labels?.[0] || '1'}</span>
              <span>{question.scale?.labels?.[question.scale.labels.length - 1] || '5'}</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: question.scale?.max || 5 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => handleResponseChange(question.id, num)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    value === num
                      ? 'bg-teal-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            {question.scale?.labels && (
              <div className="flex justify-between text-xs text-gray-400 px-2">
                {question.scale.labels.map((label, i) => (
                  <span key={i} className="text-center" style={{ width: `${100 / question.scale.labels.length}%` }}>
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <button
                key={i}
                onClick={() => handleResponseChange(question.id, option)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  value === option
                    ? 'bg-teal-50 border-2 border-teal-500 text-teal-700'
                    : 'bg-gray-50 border-2 border-transparent text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-32"
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-animated-gradient">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-animated-gradient relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="floating-orb floating-orb-1"></div>
        <div className="floating-orb floating-orb-2"></div>
        <div className="floating-orb floating-orb-3"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-teal-700 mb-4 border border-teal-100">
            <ClipboardList size={16} />
            <span>Khảo sát & Góp ý</span>
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Khảo sát Ý kiến
          </h1>
          <p className="text-gray-600">
            Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ
          </p>
        </header>

        {/* Survey Detail View */}
        {selectedSurvey ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Survey Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
              <button
                onClick={() => setSelectedSurvey(null)}
                className="text-white/80 hover:text-white text-sm mb-3 flex items-center gap-1"
              >
                ← Quay lại danh sách
              </button>
              <h2 className="text-2xl font-semibold mb-2">{selectedSurvey.title}</h2>
              <p className="text-white/90">{selectedSurvey.description}</p>
            </div>

            {/* Survey Content */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-teal-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Cảm ơn bạn đã tham gia!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ý kiến của bạn đã được ghi nhận.
                  </p>
                  <Button onClick={() => setSelectedSurvey(null)}>
                    Quay lại danh sách
                  </Button>
                </div>
              ) : (
                <>
                  {error && <Alert variant="error" className="mb-4">{error}</Alert>}
                  
                  <div className="space-y-8">
                    {selectedSurvey.questions?.map((question, index) => (
                      <div key={question.id} className="space-y-3">
                        <h3 className="font-medium text-gray-800">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-teal-100 text-teal-600 rounded-full text-sm mr-2">
                            {index + 1}
                          </span>
                          {question.question}
                        </h3>
                        {renderQuestion(question, index)}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={submitting}
                      size="lg"
                      className="w-full"
                      icon={Send}
                    >
                      Gửi câu trả lời
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Survey List */
          <div className="space-y-4">
            {surveys.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-12 text-center">
                <ClipboardList size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Chưa có khảo sát nào
                </h3>
                <p className="text-gray-500">
                  Các khảo sát mới sẽ xuất hiện tại đây
                </p>
              </div>
            ) : (
              surveys.map(survey => (
                <button
                  key={survey.id}
                  onClick={() => handleOpenSurvey(survey)}
                  className="w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                      <ClipboardList size={24} className="text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
                        {survey.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {survey.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Hạn: {new Date(survey.deadline).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 size={14} />
                          {survey.responses_count || 0} lượt tham gia
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
