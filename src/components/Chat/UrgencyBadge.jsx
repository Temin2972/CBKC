/**
 * UrgencyBadge Component
 * Displays the urgency level of a chat room
 */
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, CheckCircle2 } from 'lucide-react'
import { URGENCY_LEVELS, URGENCY_LABELS } from '../../hooks/useChatRoom'

export default function UrgencyBadge({ level, size = 'md', showLabel = true }) {
    const info = URGENCY_LABELS[level] || URGENCY_LABELS[URGENCY_LEVELS.NORMAL]

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    }

    const colorClasses = {
        gray: 'bg-gray-100 text-gray-700 border-gray-200',
        green: 'bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-100 text-orange-700 border-orange-200',
        red: 'bg-red-100 text-red-700 border-red-200'
    }

    const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16

    const Icon = () => {
        switch (level) {
            case URGENCY_LEVELS.COMPLETED:
                return <CheckCircle2 size={iconSize} />
            case URGENCY_LEVELS.CRITICAL:
                return <AlertOctagon size={iconSize} className="animate-pulse" />
            case URGENCY_LEVELS.URGENT:
                return <AlertTriangle size={iconSize} />
            case URGENCY_LEVELS.ATTENTION:
                return <AlertCircle size={iconSize} />
            default:
                return <CheckCircle size={iconSize} />
        }
    }

    // Don't show badge for normal level unless explicitly requested
    if (level === URGENCY_LEVELS.NORMAL && !showLabel) {
        return null
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${sizeClasses[size]}
        ${colorClasses[info.color]}
      `}
        >
            <Icon />
            {showLabel && <span>{info.label}</span>}
        </span>
    )
}
