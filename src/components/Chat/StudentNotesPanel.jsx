/**
 * StudentNotesPanel Component
 * Panel for counselor notes about students - shared across all counselors
 */
import { useState, useEffect } from 'react'
import {
    ChevronRight, ChevronLeft, Save, Loader2,
    StickyNote, Clock, User, X, RefreshCw
} from 'lucide-react'
import { useStudentNotes } from '../../hooks/useStudentNotes'

export default function StudentNotesPanel({
    studentId,
    studentName = 'Học sinh',
    counselorId,
    defaultCollapsed = true,
    onClose = null,  // If provided, shows close button instead of collapse
    inline = false   // If true, doesn't use fixed positioning
}) {
    const {
        content,
        saving,
        loading,
        lastUpdatedBy,
        lastUpdatedAt,
        saveNotes,
        refetch
    } = useStudentNotes(studentId)

    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [localContent, setLocalContent] = useState('')
    const [hasChanges, setHasChanges] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        setLocalContent(content)
    }, [content])

    useEffect(() => {
        setHasChanges(localContent !== content)
    }, [localContent, content])

    // Auto-refresh periodically to catch AI updates (since realtime might be unreliable)
    useEffect(() => {
        if (!studentId || isCollapsed) return
        
        const interval = setInterval(() => {
            refetch()
        }, 10000) // Refresh every 10 seconds
        
        return () => clearInterval(interval)
    }, [studentId, isCollapsed, refetch])

    const handleSave = async () => {
        await saveNotes(localContent, counselorId)
        setHasChanges(false)
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await refetch()
        setTimeout(() => setIsRefreshing(false), 500)
    }

    // Collapsed view (only for non-inline mode)
    if (isCollapsed && !inline && !onClose) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed right-0 top-1/2 -translate-y-1/2 bg-purple-500 text-white p-2 rounded-l-lg shadow-lg hover:bg-purple-600 transition-colors z-40"
                title="Mở ghi chú"
            >
                <div className="flex flex-col items-center gap-1">
                    <ChevronLeft size={18} />
                    <StickyNote size={16} />
                </div>
            </button>
        )
    }

    return (
        <div className={`bg-white flex flex-col h-full ${inline ? '' : 'w-80 border-l shadow-lg'}`}>
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StickyNote size={18} className="text-purple-500" />
                    <div>
                        <h3 className="font-semibold text-gray-900">Ghi chú học sinh</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {studentName}
                        </p>
                    </div>
                </div>
                {onClose ? (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleRefresh}
                            className={`p-1.5 text-gray-400 hover:text-purple-600 hover:bg-white rounded ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Làm mới"
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded"
                            title="Đóng ghi chú"
                        >
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleRefresh}
                            className={`p-1.5 text-gray-400 hover:text-purple-600 hover:bg-white rounded ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Làm mới"
                            disabled={isRefreshing}
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-purple-500" size={24} />
                    </div>
                ) : (
                    <>
                        <textarea
                            value={localContent}
                            onChange={(e) => setLocalContent(e.target.value)}
                            placeholder="Thêm ghi chú về học sinh này...&#10;&#10;Ví dụ:&#10;- Tình trạng gia đình&#10;- Vấn đề học tập&#10;- Lịch sử tư vấn&#10;- Điều cần lưu ý"
                            className="flex-1 w-full p-3 border rounded-lg resize-none text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[200px]"
                        />

                        {/* Last updated info */}
                        {lastUpdatedAt && (
                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(lastUpdatedAt).toLocaleString('vi-VN')}
                                </span>
                                {lastUpdatedBy && (
                                    <span className="flex items-center gap-1">
                                        <User size={12} />
                                        {lastUpdatedBy}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${hasChanges && !saving
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            {hasChanges ? 'Lưu ghi chú' : 'Đã lưu'}
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-2">
                    📌 Ghi chú được lưu vĩnh viễn và chia sẻ với các tư vấn viên khác
                </p>
            </div>
        </div>
    )
}
