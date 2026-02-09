/**
 * useAppointments Hook
 * Manages appointment booking requests
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { analyzeAppointmentUrgency } from '../lib/aiTriage'
import { createNotification } from './useNotifications'

// Time slot options
export const TIME_SLOTS = [
    { value: 'monday_11', label: 'Thứ 2, 11h00 - 12h00' },
    { value: 'tuesday_11', label: 'Thứ 3, 11h00 - 12h00' },
    { value: 'wednesday_11', label: 'Thứ 4, 11h00 - 12h00' },
    { value: 'thursday_11', label: 'Thứ 5, 11h00 - 12h00' },
    { value: 'friday_11', label: 'Thứ 6, 11h00 - 12h00' },
    { value: 'other', label: 'Khác (tự điền)' }
]

// Appointment status
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
}

export const STATUS_CONFIG = {
    [APPOINTMENT_STATUS.PENDING]: { label: 'Chờ xử lý', color: 'yellow', icon: '🟡' },
    [APPOINTMENT_STATUS.ACCEPTED]: { label: 'Đã nhận', color: 'blue', icon: '🔵' },
    [APPOINTMENT_STATUS.COMPLETED]: { label: 'Hoàn thành', color: 'green', icon: '🟢' },
    [APPOINTMENT_STATUS.CANCELLED]: { label: 'Đã hủy', color: 'gray', icon: '⚪' }
}

export function useAppointments(userRole = null) {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const isStaff = userRole === 'counselor' || userRole === 'admin'

    const fetchAppointments = useCallback(async () => {
        console.log('fetchAppointments called, isStaff:', isStaff, 'userRole:', userRole)
        if (!isStaff) {
            console.log('Not staff, skipping fetch')
            setLoading(false)
            return
        }

        try {
            console.log('Fetching appointments...')
            const { data, error } = await supabase
                .from('appointment_requests')
                .select('*')
                .order('urgency_level', { ascending: false })
                .order('created_at', { ascending: false })

            console.log('Appointments result:', { data, error })
            if (error) throw error
            setAppointments(data || [])
        } catch (err) {
            console.error('Error fetching appointments:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [isStaff, userRole])

    useEffect(() => {
        fetchAppointments()

        if (isStaff) {
            // Subscribe to changes
            const channel = supabase
                .channel('appointments-changes')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'appointment_requests'
                }, () => {
                    fetchAppointments()
                })
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [fetchAppointments, isStaff])

    /**
     * Submit a new appointment request (can be guest)
     */
    const submitAppointment = async (formData, userId = null) => {
        try {
            // Get time slot display text
            let timeSlotDisplay = formData.time_slot
            if (formData.time_slot === 'other') {
                timeSlotDisplay = formData.custom_time_slot || 'Khác'
            } else {
                const slot = TIME_SLOTS.find(s => s.value === formData.time_slot)
                timeSlotDisplay = slot?.label || formData.time_slot
            }

            // Analyze urgency with AI (only if issues provided)
            let urgencyLevel = 0
            let reasoning = ''
            if (formData.issues && formData.issues.trim()) {
                const analysis = await analyzeAppointmentUrgency(formData.issues)
                urgencyLevel = analysis.urgencyLevel
                reasoning = analysis.reasoning
            }

            // Insert appointment
            const { data, error } = await supabase
                .from('appointment_requests')
                .insert({
                    student_id: userId || null,
                    full_name: formData.full_name,
                    email: formData.email,
                    class_name: formData.class_name,
                    dorm_room: formData.dorm_room,
                    time_slot: formData.time_slot === 'other' ? `other:${formData.custom_time_slot}` : formData.time_slot,
                    time_slot_display: timeSlotDisplay,
                    issues: formData.issues || null,
                    urgency_level: urgencyLevel,
                    ai_analysis: reasoning || null,
                    status: APPOINTMENT_STATUS.PENDING
                })
                .select()
                .single()

            if (error) throw error

            // Notify all counselors (only if user is logged in, skip for guests)
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData?.session?.user) {
                const { data: counselors } = await supabase
                    .from('users')
                    .select('id')
                    .in('role', ['counselor', 'admin'])

                if (counselors) {
                    for (const counselor of counselors) {
                        await createNotification(
                            counselor.id,
                            'appointment_request',
                            `📅 Yêu cầu đặt lịch mới${urgencyLevel >= 2 ? ' (Khẩn cấp!)' : ''}`,
                            `${formData.full_name} yêu cầu đặt lịch tư vấn: ${timeSlotDisplay}`,
                            '/appointments',
                            { appointment_id: data.id, urgency_level: urgencyLevel }
                        )
                    }
                }
            }

            return { data, error: null }
        } catch (err) {
            console.error('Error submitting appointment:', err)
            return { data: null, error: err }
        }
    }

    /**
     * Update appointment status
     */
    const updateStatus = async (appointmentId, status, counselorId) => {
        try {
            const { error } = await supabase
                .from('appointment_requests')
                .update({
                    status,
                    handled_by: counselorId
                })
                .eq('id', appointmentId)

            if (error) throw error
            return { error: null }
        } catch (err) {
            return { error: err }
        }
    }

    /**
     * Create chat room from appointment
     */
    const createChatFromAppointment = async (appointment, counselorId) => {
        try {
            // Check if student_id exists
            if (!appointment.student_id) {
                // Guest booking - can't create chat room
                return { error: new Error('Không thể tạo phòng chat với khách. Hãy liên hệ qua email.') }
            }

            // Check if chat room already exists
            const { data: existing } = await supabase
                .from('chat_rooms')
                .select('id')
                .eq('student_id', appointment.student_id)
                .single()

            let chatRoomId = existing?.id

            if (!chatRoomId) {
                // Create new chat room
                const { data: newRoom, error: createError } = await supabase
                    .from('chat_rooms')
                    .insert({
                        student_id: appointment.student_id,
                        counselor_id: counselorId,
                        urgency_level: appointment.urgency_level,
                        status: 'active'
                    })
                    .select()
                    .single()

                if (createError) throw createError
                chatRoomId = newRoom.id
            }

            // Update appointment with chat room reference
            await supabase
                .from('appointment_requests')
                .update({
                    chat_room_id: chatRoomId,
                    status: APPOINTMENT_STATUS.ACCEPTED,
                    handled_by: counselorId
                })
                .eq('id', appointment.id)

            // Send initial message
            await supabase
                .from('chat_messages')
                .insert({
                    chat_room_id: chatRoomId,
                    sender_id: counselorId,
                    content: `Xin chào ${appointment.full_name}! Tôi đã nhận được yêu cầu đặt lịch của bạn về vấn đề: "${appointment.issues.substring(0, 100)}...". Mình có thể bắt đầu tư vấn ngay bây giờ hoặc hẹn lúc ${appointment.time_slot_display}. Bạn muốn như thế nào?`
                })

            return { chatRoomId, error: null }
        } catch (err) {
            console.error('Error creating chat from appointment:', err)
            return { chatRoomId: null, error: err }
        }
    }

    /**
     * Add counselor notes to appointment
     */
    const addNotes = async (appointmentId, notes) => {
        try {
            const { error } = await supabase
                .from('appointment_requests')
                .update({ counselor_notes: notes })
                .eq('id', appointmentId)

            if (error) throw error
            return { error: null }
        } catch (err) {
            return { error: err }
        }
    }

    // Filter helpers
    const pendingAppointments = appointments.filter(a => a.status === APPOINTMENT_STATUS.PENDING)
    const getPendingCount = () => pendingAppointments.length

    return {
        appointments,
        pendingAppointments,
        loading,
        error,
        submitAppointment,
        updateStatus,
        createChatFromAppointment,
        addNotes,
        getPendingCount,
        refetch: fetchAppointments,
        TIME_SLOTS,
        APPOINTMENT_STATUS,
        STATUS_CONFIG
    }
}
