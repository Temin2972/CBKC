/**
 * Info Page Component
 * About us information
 */
import Navbar from '../components/Layout/Navbar'
import Footer from '../components/Layout/Footer'
import { Heart, Users, Shield, Target, Award, Sparkles } from 'lucide-react'

const TEAM_VALUES = [
  {
    icon: Heart,
    title: 'Tận tâm',
    description: 'Luôn đặt sức khỏe tâm lý học sinh lên hàng đầu'
  },
  {
    icon: Shield,
    title: 'Bảo mật',
    description: 'Cam kết bảo vệ thông tin và quyền riêng tư'
  },
  {
    icon: Users,
    title: 'Kết nối',
    description: 'Xây dựng cầu nối giữa học sinh và chuyên gia'
  },
  {
    icon: Sparkles,
    title: 'Sáng tạo',
    description: 'Ứng dụng công nghệ vào hỗ trợ tâm lý học đường'
  }
]

export default function Info() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-4">
              <Heart size={16} />
              Về chúng tôi
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              S-Net - Mạng lưới Sức khỏe Tâm lý
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nền tảng hỗ trợ sức khỏe tâm lý học đường, kết nối học sinh THPT FPT Hà Nội với các chuyên gia tâm lý.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-teal-100 rounded-xl">
                <Target className="text-teal-600" size={24} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Sứ mệnh</h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              S-Net được xây dựng với mục tiêu tạo ra một không gian an toàn, nơi mọi học sinh 
              có thể chia sẻ, được lắng nghe và nhận hỗ trợ kịp thời. Chúng tôi tin rằng sức khỏe 
              tâm lý là nền tảng quan trọng cho sự phát triển toàn diện của mỗi cá nhân.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {TEAM_VALUES.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg">
                    <value.icon className="text-white" size={20} />
                  </div>
                  <h3 className="font-semibold text-gray-800">{value.title}</h3>
                </div>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-semibold">CBKC Team</h2>
            </div>
            <p className="text-teal-100 text-lg leading-relaxed mb-4">
              S-Net được phát triển bởi đội ngũ CBKC - những học sinh đam mê công nghệ và 
              mong muốn đóng góp cho cộng đồng. Dự án là sự kết hợp giữa kỹ năng lập trình 
              và tâm huyết vì sức khỏe tâm lý học đường.
            </p>
            <p className="text-teal-200 text-sm">
              Trường THPT FPT Hà Nội - Khu Công nghệ cao Hòa Lạc
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
