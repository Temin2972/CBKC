/**
 * Survey Page Component
 * Allows students to participate in school surveys
 * Allows counselors/admins to create and manage surveys
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, isDemoMode, getDemoState } from '../lib/supabaseClient'
import { DEMO_SURVEYS } from '../lib/demoData'
import Navbar from '../components/Layout/Navbar'
import { Button, Alert, Modal } from '../components/UI'
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Star,
  Send,
  BarChart3,
  Plus,
  Trash2,
  GripVertical,
  Settings,
  X,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Eye,
  Users,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from '../utils/formatters'

export default function Survey() {
  const { user, id: userId, isCounselor } = useAuth()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSurvey, setSelectedSurvey] = useState(null)
  const [responses, setResponses] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  // Create/Edit survey state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState(null)
  const [surveyForm, setSurveyForm] = useState({
    title: '',
    description: '',
    questions: [],
    is_active: true,
    is_anonymous: true,
    deadline: ''
  })
  const [savingSurvey, setSavingSurvey] = useState(false)
  
  // View responses state
  const [showResponsesModal, setShowResponsesModal] = useState(false)
  const [viewingSurvey, setViewingSurvey] = useState(null)
  const [surveyResponses, setSurveyResponses] = useState([])
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [expandedResponse, setExpandedResponse] = useState(null)

  useEffect(() => {
    if (isCounselor) {
      loadAllSurveys()
    } else {
      loadSurveys()
    }
  }, [isCounselor])

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

  // Load all surveys for staff (including inactive)
  const loadAllSurveys = async () => {
    if (!isCounselor) return
    setLoading(true)
    try {
      if (isDemoMode) {
        setSurveys(DEMO_SURVEYS)
      } else {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setSurveys(data || [])
      }
    } catch (err) {
      console.error('Error loading all surveys:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset survey form
  const resetSurveyForm = () => {
    setSurveyForm({
      title: '',
      description: '',
      questions: [],
      is_active: true,
      is_anonymous: true,
      deadline: ''
    })
    setEditingSurvey(null)
  }

  // Open create modal
  const handleOpenCreateModal = () => {
    resetSurveyForm()
    setShowCreateModal(true)
  }

  // Open edit modal
  const handleEditSurvey = (survey, e) => {
    e.stopPropagation()
    setEditingSurvey(survey)
    setSurveyForm({
      title: survey.title,
      description: survey.description || '',
      questions: survey.questions || [],
      is_active: survey.is_active,
      is_anonymous: survey.is_anonymous ?? true,
      deadline: survey.deadline ? survey.deadline.split('T')[0] : ''
    })
    setShowCreateModal(true)
  }

  // Add question
  const addQuestion = (type) => {
    const newQuestion = {
      id: `q${Date.now()}`,
      type,
      question: '',
      ...(type === 'scale' && { 
        scale: { min: 1, max: 5, labels: ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'] }
      }),
      ...(type === 'multiple_choice' && { options: [''] })
    }
    setSurveyForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  // Update question
  const updateQuestion = (index, field, value) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  // Update scale labels
  const updateScaleLabels = (questionIndex, labelIndex, value) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q
        const newLabels = [...(q.scale?.labels || [])]
        newLabels[labelIndex] = value
        return { ...q, scale: { ...q.scale, labels: newLabels } }
      })
    }))
  }

  // Add option to multiple choice
  const addOption = (questionIndex) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }))
  }

  // Update option
  const updateOption = (questionIndex, optionIndex, value) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q
        const newOptions = [...(q.options || [])]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      })
    }))
  }

  // Remove option
  const removeOption = (questionIndex, optionIndex) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== questionIndex) return q
        return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
      })
    }))
  }

  // Remove question
  const removeQuestion = (index) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  // Save survey
  const handleSaveSurvey = async () => {
    // Validate
    if (!surveyForm.title.trim()) {
      setError('Vui lòng nhập tiêu đề khảo sát')
      return
    }
    if (surveyForm.questions.length === 0) {
      setError('Vui lòng thêm ít nhất một câu hỏi')
      return
    }
    const emptyQuestion = surveyForm.questions.find(q => !q.question.trim())
    if (emptyQuestion) {
      setError('Vui lòng nhập nội dung cho tất cả các câu hỏi')
      return
    }

    setSavingSurvey(true)
    setError('')

    try {
      if (isDemoMode) {
        // Demo mode - just update local state
        const newSurvey = {
          id: editingSurvey?.id || `survey-${Date.now()}`,
          ...surveyForm,
          deadline: surveyForm.deadline ? new Date(surveyForm.deadline).toISOString() : null,
          created_by: userId,
          created_at: editingSurvey?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          responses_count: editingSurvey?.responses_count || 0
        }

        if (editingSurvey) {
          setSurveys(prev => prev.map(s => s.id === editingSurvey.id ? newSurvey : s))
        } else {
          setSurveys(prev => [newSurvey, ...prev])
        }
      } else {
        const surveyData = {
          title: surveyForm.title.trim(),
          description: surveyForm.description.trim() || null,
          questions: surveyForm.questions,
          is_active: surveyForm.is_active,
          is_anonymous: surveyForm.is_anonymous,
          deadline: surveyForm.deadline ? new Date(surveyForm.deadline).toISOString() : null,
          created_by: userId
        }

        if (editingSurvey) {
          const { error } = await supabase
            .from('surveys')
            .update(surveyData)
            .eq('id', editingSurvey.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('surveys')
            .insert(surveyData)
          if (error) throw error
        }

        // Reload surveys
        if (isCounselor) {
          await loadAllSurveys()
        } else {
          await loadSurveys()
        }
      }

      setShowCreateModal(false)
      resetSurveyForm()
    } catch (err) {
      console.error('Error saving survey:', err)
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSavingSurvey(false)
    }
  }

  // Toggle survey active status
  const toggleSurveyActive = async (survey, e) => {
    e.stopPropagation()
    try {
      if (!isDemoMode) {
        const { error } = await supabase
          .from('surveys')
          .update({ is_active: !survey.is_active })
          .eq('id', survey.id)
        if (error) throw error
      }
      
      setSurveys(prev => prev.map(s => 
        s.id === survey.id ? { ...s, is_active: !s.is_active } : s
      ))
    } catch (err) {
      console.error('Error toggling survey:', err)
    }
  }

  // View survey responses (for counselors)
  const handleViewResponses = async (survey, e) => {
    e.stopPropagation()
    setViewingSurvey(survey)
    setShowResponsesModal(true)
    setLoadingResponses(true)
    setSurveyResponses([])
    setExpandedResponse(null)

    try {
      if (isDemoMode) {
        // Demo responses
        setSurveyResponses([
          {
            id: 'resp-1',
            created_at: new Date().toISOString(),
            responses: survey.questions.reduce((acc, q) => {
              if (q.type === 'scale') acc[q.id] = 4
              else if (q.type === 'multiple_choice') acc[q.id] = q.options?.[0]
              else acc[q.id] = 'Câu trả lời mẫu'
              return acc
            }, {})
          }
        ])
      } else {
        const { data, error } = await supabase
          .from('survey_responses')
          .select('*')
          .eq('survey_id', survey.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setSurveyResponses(data || [])
      }
    } catch (err) {
      console.error('Error loading responses:', err)
    } finally {
      setLoadingResponses(false)
    }
  }

  // Calculate response statistics for a question
  const getQuestionStats = (question) => {
    if (!surveyResponses.length) return null

    if (question.type === 'scale') {
      const values = surveyResponses
        .map(r => r.responses?.[question.id])
        .filter(v => typeof v === 'number')
      
      if (!values.length) return null
      
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      const distribution = {}
      for (let i = 1; i <= 5; i++) {
        distribution[i] = values.filter(v => v === i).length
      }
      
      return { average: avg.toFixed(1), distribution, total: values.length }
    }

    if (question.type === 'multiple_choice') {
      const distribution = {}
      question.options?.forEach(opt => {
        distribution[opt] = surveyResponses.filter(r => r.responses?.[question.id] === opt).length
      })
      return { distribution, total: surveyResponses.length }
    }

    if (question.type === 'text') {
      const textResponses = surveyResponses
        .map(r => r.responses?.[question.id])
        .filter(v => v && typeof v === 'string')
      return { responses: textResponses, total: textResponses.length }
    }

    return null
  }

  const handleOpenSurvey = async (survey) => {
    setSelectedSurvey(survey)
    setResponses({})
    setSubmitted(false)
    setError('')
    
    // Check if user has already responded (non-anonymous surveys)
    if (!isDemoMode && userId && !survey.is_anonymous) {
      try {
        const { data } = await supabase
          .from('survey_responses')
          .select('id')
          .eq('survey_id', survey.id)
          .eq('user_id', userId)
          .single()
        
        if (data) {
          setSubmitted(true) // Show "already submitted" state
        }
      } catch (err) {
        // No existing response, that's fine
      }
    }
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
        const { error } = await supabase.from('survey_responses').insert({
          survey_id: selectedSurvey.id,
          user_id: userId,
          responses: responses,
          created_at: new Date().toISOString()
        })
        
        // Handle duplicate submission (409 Conflict)
        if (error) {
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            setError('Bạn đã trả lời khảo sát này rồi!')
            setSubmitted(true)
            return
          }
          throw error
        }
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
          
          {/* Create Survey Button for Counselors */}
          {isCounselor && (
            <Button
              onClick={handleOpenCreateModal}
              icon={Plus}
              className="mt-4"
            >
              Tạo khảo sát mới
            </Button>
          )}
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
                <div
                  key={survey.id}
                  className={`w-full bg-white/70 backdrop-blur-sm rounded-2xl border p-5 text-left hover:shadow-lg transition-all group ${
                    survey.is_active ? 'border-gray-100 hover:border-teal-200' : 'border-orange-200 bg-orange-50/50'
                  }`}
                >
                  <button
                    onClick={() => handleOpenSurvey(survey)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        survey.is_active 
                          ? 'bg-teal-50 group-hover:bg-teal-100' 
                          : 'bg-orange-100'
                      }`}>
                        <ClipboardList size={24} className={survey.is_active ? 'text-teal-600' : 'text-orange-600'} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold group-hover:text-teal-600 transition-colors ${
                            survey.is_active ? 'text-gray-800' : 'text-gray-600'
                          }`}>
                            {survey.title}
                          </h3>
                          {!survey.is_active && (
                            <span className="px-2 py-0.5 bg-orange-200 text-orange-700 text-xs rounded-full">
                              Tạm dừng
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {survey.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {survey.deadline && (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Hạn: {new Date(survey.deadline).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <BarChart3 size={14} />
                            {survey.responses_count || 0} lượt tham gia
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                  
                  {/* Counselor Actions */}
                  {isCounselor && (
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => handleViewResponses(survey, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        Xem kết quả ({survey.responses_count || 0})
                      </button>
                      <button
                        onClick={(e) => handleEditSurvey(survey, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={(e) => toggleSurveyActive(survey, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          survey.is_active
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-teal-600 hover:bg-teal-50'
                        }`}
                      >
                        {survey.is_active ? (
                          <>
                            <ToggleRight size={14} />
                            Tạm dừng
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={14} />
                            Kích hoạt
                          </>
                        )}
                      </button>
                      <span className="ml-auto text-xs text-gray-400">
                        {survey.questions?.length || 0} câu hỏi
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Survey Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetSurveyForm()
          setError('')
        }}
        title={editingSurvey ? 'Chỉnh sửa khảo sát' : 'Tạo khảo sát mới'}
        size="xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {error && <Alert variant="error">{error}</Alert>}
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề khảo sát *
              </label>
              <input
                type="text"
                value={surveyForm.title}
                onChange={(e) => setSurveyForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="VD: Khảo sát Sức khỏe Tâm lý Học kỳ 1"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={surveyForm.description}
                onChange={(e) => setSurveyForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn về khảo sát..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Hạn chót (tùy chọn)
                </label>
                <input
                  type="date"
                  value={surveyForm.deadline}
                  onChange={(e) => setSurveyForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surveyForm.is_active}
                    onChange={(e) => setSurveyForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Kích hoạt ngay</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surveyForm.is_anonymous}
                    onChange={(e) => setSurveyForm(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                    className="w-4 h-4 text-teal-500 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Cho phép ẩn danh</span>
                </label>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">
                Câu hỏi ({surveyForm.questions.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => addQuestion('scale')}
                  className="px-3 py-1.5 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  + Thang điểm
                </button>
                <button
                  onClick={() => addQuestion('multiple_choice')}
                  className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  + Trắc nghiệm
                </button>
                <button
                  onClick={() => addQuestion('text')}
                  className="px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  + Tự luận
                </button>
              </div>
            </div>

            {surveyForm.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <ClipboardList size={32} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có câu hỏi nào</p>
                <p className="text-sm">Nhấn các nút bên trên để thêm câu hỏi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {surveyForm.questions.map((question, index) => (
                  <div 
                    key={question.id}
                    className={`p-4 rounded-xl border ${
                      question.type === 'scale' ? 'border-purple-200 bg-purple-50/50' :
                      question.type === 'multiple_choice' ? 'border-blue-200 bg-blue-50/50' :
                      'border-green-200 bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical size={16} />
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            question.type === 'scale' ? 'bg-purple-200 text-purple-700' :
                            question.type === 'multiple_choice' ? 'bg-blue-200 text-blue-700' :
                            'bg-green-200 text-green-700'
                          }`}>
                            {question.type === 'scale' ? 'Thang điểm' :
                             question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}
                          </span>
                        </div>
                        
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                          placeholder="Nhập câu hỏi..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 outline-none text-sm"
                        />

                        {/* Scale Options */}
                        {question.type === 'scale' && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">Nhãn thang điểm (1-5):</p>
                            <div className="grid grid-cols-5 gap-2">
                              {[0, 1, 2, 3, 4].map(i => (
                                <input
                                  key={i}
                                  type="text"
                                  value={question.scale?.labels?.[i] || ''}
                                  onChange={(e) => updateScaleLabels(index, i, e.target.value)}
                                  placeholder={`${i + 1}`}
                                  className="px-2 py-1 text-xs rounded border border-gray-200 focus:border-purple-400 outline-none text-center"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Multiple Choice Options */}
                        {question.type === 'multiple_choice' && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">Các lựa chọn:</p>
                            {question.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-5">{optIndex + 1}.</span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                  placeholder="Nhập lựa chọn..."
                                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-blue-400 outline-none"
                                />
                                {question.options.length > 1 && (
                                  <button
                                    onClick={() => removeOption(index, optIndex)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(index)}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              + Thêm lựa chọn
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => {
              setShowCreateModal(false)
              resetSurveyForm()
              setError('')
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSaveSurvey}
            loading={savingSurvey}
            disabled={savingSurvey}
            icon={editingSurvey ? CheckCircle2 : Plus}
          >
            {editingSurvey ? 'Cập nhật' : 'Tạo khảo sát'}
          </Button>
        </div>
      </Modal>

      {/* View Responses Modal */}
      <Modal
        isOpen={showResponsesModal}
        onClose={() => {
          setShowResponsesModal(false)
          setViewingSurvey(null)
          setSurveyResponses([])
        }}
        title={`Kết quả: ${viewingSurvey?.title || ''}`}
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {loadingResponses ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            </div>
          ) : surveyResponses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có câu trả lời nào</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Header */}
              <div className="bg-teal-50 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">{surveyResponses.length}</p>
                  <p className="text-sm text-teal-600">Tổng số câu trả lời</p>
                </div>
              </div>

              {/* Question Statistics */}
              {viewingSurvey?.questions?.map((question, qIndex) => {
                const stats = getQuestionStats(question)
                
                return (
                  <div key={question.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-teal-100 text-teal-600 rounded-full text-sm font-medium">
                        {qIndex + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{question.question}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          question.type === 'scale' ? 'bg-purple-100 text-purple-600' :
                          question.type === 'multiple_choice' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {question.type === 'scale' ? 'Thang điểm' :
                           question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}
                        </span>
                      </div>
                    </div>

                    {/* Scale Results */}
                    {question.type === 'scale' && stats && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-purple-600">{stats.average}</p>
                            <p className="text-xs text-gray-500">Điểm TB</p>
                          </div>
                          <div className="flex-1">
                            {[5, 4, 3, 2, 1].map(score => {
                              const count = stats.distribution[score] || 0
                              const percent = stats.total ? (count / stats.total * 100) : 0
                              return (
                                <div key={score} className="flex items-center gap-2 text-sm">
                                  <span className="w-4 text-gray-500">{score}</span>
                                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                    <div 
                                      className="bg-purple-400 h-full rounded-full transition-all"
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-xs text-gray-500">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        {question.scale?.labels && (
                          <div className="flex justify-between text-xs text-gray-400 pt-2 border-t">
                            <span>1 = {question.scale.labels[0]}</span>
                            <span>5 = {question.scale.labels[4]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Multiple Choice Results */}
                    {question.type === 'multiple_choice' && stats && (
                      <div className="space-y-2">
                        {question.options?.map((option, i) => {
                          const count = stats.distribution[option] || 0
                          const percent = stats.total ? (count / stats.total * 100) : 0
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">{option}</span>
                                <span className="text-gray-500">{count} ({percent.toFixed(0)}%)</span>
                              </div>
                              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div 
                                  className="bg-blue-400 h-full rounded-full transition-all"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Text Responses */}
                    {question.type === 'text' && stats && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">{stats.total} câu trả lời</p>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {stats.responses.map((resp, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                              "{resp}"
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Individual Responses (Expandable) */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setExpandedResponse(expandedResponse ? null : 'all')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600"
                >
                  {expandedResponse ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <FileText size={16} />
                  Xem từng câu trả lời chi tiết
                </button>
                
                {expandedResponse && (
                  <div className="mt-4 space-y-3">
                    {surveyResponses.map((response, idx) => (
                      <div key={response.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <span className="font-medium">Người trả lời #{idx + 1}</span>
                          <span>•</span>
                          <span>{new Date(response.created_at).toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="space-y-2">
                          {viewingSurvey?.questions?.map((q, qi) => (
                            <div key={q.id} className="flex gap-2 text-sm">
                              <span className="text-gray-400 w-6">{qi + 1}.</span>
                              <span className="text-gray-600">
                                {response.responses?.[q.id] ?? <em className="text-gray-400">Không trả lời</em>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={() => {
              setShowResponsesModal(false)
              setViewingSurvey(null)
              setSurveyResponses([])
            }}
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  )
}
