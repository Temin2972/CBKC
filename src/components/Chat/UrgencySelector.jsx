/**
 * UrgencySelector Component
 * Allows counselors to set urgency level for a chat
 */
import { useState } from 'react'
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { URGENCY_LEVELS, URGENCY_LABELS } from '../../hooks/useChatRoom'

export default function UrgencySelector({
    currentLevel = URGENCY_LEVELS.NORMAL,
    onSelect,
    disabled = false,
    compact = false,
    showCompleted = false // Whether to show COMPLETED option
}) {
    const [isOpen, setIsOpen] = useState(false)

    const allLevels = [
        { level: URGENCY_LEVELS.COMPLETED, Icon: CheckCircle2 },
        { level: URGENCY_LEVELS.NORMAL, Icon: CheckCircle },
        { level: URGENCY_LEVELS.ATTENTION, Icon: AlertCircle },
        { level: URGENCY_LEVELS.URGENT, Icon: AlertTriangle },
        { level: URGENCY_LEVELS.CRITICAL, Icon: AlertOctagon }
    ]

    // Filter out COMPLETED if not showing it
    const levels = showCompleted 
        ? allLevels 
        : allLevels.filter(l => l.level !== URGENCY_LEVELS.COMPLETED)

    const colorClasses = {
        gray: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200',
        green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
        yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200',
        orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
        red: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
    }

    const currentInfo = URGENCY_LABELS[currentLevel] || URGENCY_LABELS[URGENCY_LEVELS.NORMAL]
    const CurrentIcon = allLevels.find(l => l.level === currentLevel)?.Icon || CheckCircle

    const handleSelect = (level) => {
        onSelect(level)
        setIsOpen(false)
    }

    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
            p-2 rounded-lg border transition-colors
            ${colorClasses[currentInfo.color]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                    title={`Mức độ: ${currentInfo.label}`}
                >
                    <CurrentIcon size={18} />
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-1 z-20 bg-white rounded-lg shadow-lg border overflow-hidden">
                            {levels.map(({ level, Icon }) => {
                                const info = URGENCY_LABELS[level]
                                return (
                                    <button
                                        key={level}
                                        onClick={() => handleSelect(level)}
                                        className={`
                      w-full flex items-center gap-2 px-4 py-2 text-sm
                      ${level === currentLevel ? 'bg-gray-100' : 'hover:bg-gray-50'}
                    `}
                                    >
                                        <span className={`text-${info.color}-500`}>
                                            <Icon size={16} />
                                        </span>
                                        <span>{info.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
          ${colorClasses[currentInfo.color]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <CurrentIcon size={16} />
                <span className="text-sm font-medium">{currentInfo.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 mt-1 z-20 w-48 bg-white rounded-lg shadow-lg border overflow-hidden">
                        <div className="p-2 border-b bg-gray-50">
                            <span className="text-xs font-medium text-gray-500">Chọn mức độ ưu tiên</span>
                        </div>
                        {levels.map(({ level, Icon }) => {
                            const info = URGENCY_LABELS[level]
                            return (
                                <button
                                    key={level}
                                    onClick={() => handleSelect(level)}
                                    className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-sm
                    ${level === currentLevel ? 'bg-purple-50' : 'hover:bg-gray-50'}
                  `}
                                >
                                    <span className={`p-1 rounded ${
                                        info.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                                        info.color === 'green' ? 'bg-green-100 text-green-600' :
                                            info.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                                info.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-red-100 text-red-600'
                                        }`}>
                                        <Icon size={14} />
                                    </span>
                                    <div className="text-left">
                                        <div className="font-medium">{info.icon} {info.label}</div>
                                    </div>
                                    {level === currentLevel && (
                                        <span className="ml-auto text-purple-500">✓</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
