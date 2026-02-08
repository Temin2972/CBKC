/**
 * CounseledToggle Component
 * Toggle button for counselors to mark chat as handled
 * When completed, sets urgency_level to -1
 */
import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { URGENCY_LEVELS } from '../../hooks/useChatRoom'

export default function CounseledToggle({
    chatRoomId,
    isCounseled = false,
    previousUrgencyLevel = URGENCY_LEVELS.NORMAL,
    counselorId,
    onToggle,
    size = 'md'
}) {
    const [loading, setLoading] = useState(false)
    const [localCounseled, setLocalCounseled] = useState(isCounseled)

    // Sync with prop changes
    useEffect(() => {
        setLocalCounseled(isCounseled)
    }, [isCounseled])

    const handleToggle = async () => {
        setLoading(true)
        const newValue = !localCounseled

        try {
            const updateData = newValue
                ? {
                    is_counseled: true,
                    counseled_at: new Date().toISOString(),
                    counseled_by: counselorId,
                    urgency_level: URGENCY_LEVELS.COMPLETED // Set to -1 when completed
                }
                : {
                    is_counseled: false,
                    counseled_at: null,
                    counseled_by: null,
                    urgency_level: previousUrgencyLevel || URGENCY_LEVELS.NORMAL // Restore previous level
                }

            const { error } = await supabase
                .from('chat_rooms')
                .update(updateData)
                .eq('id', chatRoomId)

            if (error) throw error

            // If marking as completed, send feedback prompt message
            if (newValue) {
                await sendFeedbackPrompt(chatRoomId)
            }

            setLocalCounseled(newValue)
            onToggle?.(newValue, updateData.urgency_level)
        } catch (error) {
            console.error('Error toggling counseled status:', error)
        } finally {
            setLoading(false)
        }
    }

    // Send feedback prompt message to chat
    const sendFeedbackPrompt = async (roomId) => {
        try {
            const feedbackMessage = `✅ **Phiên tư vấn đã hoàn thành!**

Cảm ơn em đã tin tưởng và chia sẻ với chúng mình. Hy vọng buổi tư vấn đã giúp em phần nào.

💬 **Em có thể giúp chúng mình cải thiện dịch vụ bằng cách đánh giá phiên tư vấn:**

[👉 Đánh giá ngay](/feedback)

Mọi phản hồi của em đều rất quý giá với chúng mình! ❤️`

            await supabase.from('chat_messages').insert({
                chat_room_id: roomId,
                sender_id: null,
                content: feedbackMessage,
                is_system: true
            })
        } catch (error) {
            console.error('Error sending feedback prompt:', error)
        }
    }

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    }

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium transition-all
        ${sizeClasses[size]}
        ${localCounseled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
            title={localCounseled ? 'Bỏ đánh dấu đã tư vấn' : 'Đánh dấu đã tư vấn'}
        >
            {loading ? (
                <Loader2 size={iconSizes[size]} className="animate-spin" />
            ) : localCounseled ? (
                <CheckCircle size={iconSizes[size]} />
            ) : (
                <Circle size={iconSizes[size]} />
            )}
            <span>{localCounseled ? 'Đã tư vấn' : 'Đánh dấu đã tư vấn'}</span>
        </button>
    )
}
