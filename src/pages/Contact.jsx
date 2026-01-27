/**
 * Contact Page Component
 * Contact information and form
 */
import { useState } from 'react'
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import { Button, Alert } from '../components/UI'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  Facebook,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'
import { EXTERNAL_LINKS } from '../constants'

const CONTACT_METHODS = [
  {
    icon: Phone,
    title: 'Hotline Tâm lý',
    value: '1800 599 920',
    note: 'Miễn phí 24/7',
    href: 'tel:1800599920',
    color: 'from-green-400 to-emerald-500'
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'support@snet.fpt.edu.vn',
    note: 'Phản hồi trong 24h',
    href: 'mailto:support@snet.fpt.edu.vn',
    color: 'from-blue-400 to-indigo-500'
  },
  {
    icon: Facebook,
    title: 'Facebook',
    value: 'Bức Thư Chiều Thứ 6',
    note: 'Fanpage chính thức',
    href: EXTERNAL_LINKS.FACEBOOK_FANPAGE,
    external: true,
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Clock,
    title: 'Giờ làm việc',
    value: '8:00 - 17:00',
    note: 'Thứ 2 - Thứ 6',
    color: 'from-amber-400 to-orange-500'
  }
]

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-4">
              <MessageCircle size={16} />
              Liên hệ
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bạn cần hỗ trợ hoặc có câu hỏi? Hãy liên hệ với chúng tôi qua các kênh dưới đây.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {CONTACT_METHODS.map((method, index) => (
              <a
                key={index}
                href={method.href}
                target={method.external ? '_blank' : undefined}
                rel={method.external ? 'noopener noreferrer' : undefined}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <method.icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  {method.title}
                  {method.external && <ExternalLink size={14} className="text-gray-400" />}
                </h3>
                <p className="text-teal-600 font-medium">{method.value}</p>
                <p className="text-gray-500 text-sm">{method.note}</p>
              </a>
            ))}
          </div>

          {/* Contact Form & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gửi tin nhắn</h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} className="text-teal-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Đã gửi thành công!</h3>
                  <p className="text-gray-600">Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    size="lg"
                    className="w-full"
                    icon={Send}
                  >
                    Gửi tin nhắn
                  </Button>
                </form>
              )}
            </div>

            {/* Map / Address */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="text-teal-500" size={24} />
                Địa chỉ
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800">Phòng Tâm lý Học đường</h3>
                  <p className="text-gray-600">Trường THPT FPT Hà Nội</p>
                </div>
                <div className="text-gray-600">
                  <p>Khu Công nghệ cao Hòa Lạc</p>
                  <p>Thạch Thất, Hà Nội</p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin size={40} className="mx-auto mb-2 text-gray-300" />
                  <p>Bản đồ sẽ được thêm sau</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
