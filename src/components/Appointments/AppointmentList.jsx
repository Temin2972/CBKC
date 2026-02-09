/**
 * AppointmentList Component
 * Counselor view of all appointment requests
 */
import { useState } from 'react'
import {
    Calendar, Filter, Search, Loader2,
    RefreshCw, Bell, Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppointments, APPOINTMENT_STATUS } from '../../hooks/useAppointments'
import { useAuth } from '../../hooks/useAuth'
import AppointmentCard from './AppointmentCard'

export default function AppointmentList() {
    const navigate = useNavigate()
    const { user, role } = useAuth()
    const {
        appointments,
        loading,
        updateStatus,
        createChatFromAppointment,
        refetch
    } = useAppointments(role)

    const [filter, setFilter] = useState('pending')
    const [searchQuery, setSearchQuery] = useState('')
    const [processingId, setProcessingId] = useState(null)

    // Filter appointments
    const filteredAppointments = appointments.filter(apt => {
        // Status filter
        if (filter !== 'all' && apt.status !== filter) return false

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                apt.full_name.toLowerCase().includes(query) ||
                apt.email.toLowerCase().includes(query) ||
                apt.issues.toLowerCase().includes(query)
            )
        }

        return true
    })

    const handleAccept = async (appointment) => {
        setProcessingId(appointment.id)
        await updateStatus(appointment.id, APPOINTMENT_STATUS.ACCEPTED, user.id)
        setProcessingId(null)
    }

    const handleCreateChat = async (appointment) => {
        setProcessingId(appointment.id)
        const { chatRoomId, error } = await createChatFromAppointment(appointment, user.id)
        setProcessingId(null)

        if (error) {
            alert(error.message)
        } else if (chatRoomId) {
            navigate(`/chat/${chatRoomId}`)
        }
    }

    const handleCancel = async (appointment) => {
        if (confirm('Bạn có chắc muốn hủy yêu cầu này?')) {
            setProcessingId(appointment.id)
            await updateStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED, user.id)
            setProcessingId(null)
        }
    }

    // Count by status
    const pendingCount = appointments.filter(a => a.status === APPOINTMENT_STATUS.PENDING).length
    const urgentCount = appointments.filter(a =>
        a.status === APPOINTMENT_STATUS.PENDING && a.urgency_level >= 2
    ).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="text-purple-500" size={28} />
                        Yêu cầu đặt lịch
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý các yêu cầu tư vấn từ học sinh
                    </p>
                </div>

                <button
                    onClick={refetch}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Làm mới"
                >
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Chờ xử lý</div>
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Cần gấp</div>
                    <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Đã nhận</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {appointments.filter(a => a.status === APPOINTMENT_STATUS.ACCEPTED).length}
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <div className="text-sm text-gray-500">Tổng cộng</div>
                    <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Status filter */}
                <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
                    {[
                        { value: 'pending', label: 'Chờ xử lý', count: pendingCount },
                        { value: 'accepted', label: 'Đã nhận' },
                        { value: 'completed', label: 'Hoàn thành' },
                        { value: 'all', label: 'Tất cả' }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === option.value
                                    ? 'bg-purple-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {option.label}
                            {option.count !== undefined && option.count > 0 && (
                                <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                                    {option.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm theo tên, email, nội dung..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-purple-500" size={32} />
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border">
                    <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                        {filter === 'pending' ? 'Không có yêu cầu nào đang chờ' : 'Không tìm thấy kết quả'}
                    </h3>
                    <p className="text-gray-500">
                        {filter === 'pending'
                            ? 'Các yêu cầu mới sẽ xuất hiện ở đây'
                            : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.map(appointment => (
                        <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onAccept={handleAccept}
                            onCreateChat={handleCreateChat}
                            onCancel={handleCancel}
                            isProcessing={processingId === appointment.id}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
