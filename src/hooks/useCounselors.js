import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCounselors() {
  const [counselors, setCounselors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCounselors()
  }, [])

  const fetchCounselors = async () => {
    try {
      setLoading(true)
      
      // Lấy danh sách tư vấn viên và admin (cả hai đều có thể tư vấn)
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, specialty, avatar_url, role, bio')
        .in('role', ['counselor', 'admin'])
        .order('full_name', { ascending: true })

      if (error) throw error

      // Format data để dễ sử dụng
      const formattedCounselors = (data || []).map(counselor => ({
        ...counselor,
        displayName: counselor.full_name || 'Tư vấn viên',
        description: counselor.specialty || 'Tư vấn tâm lý học đường',
        // Tạo avatar color dựa trên id để consistent
        avatarColor: getAvatarColor(counselor.id)
      }))

      setCounselors(formattedCounselors)
    } catch (err) {
      console.error('Error fetching counselors:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Tạo màu avatar consistent dựa trên ID
  const getAvatarColor = (id) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-purple-400',
      'from-pink-400 to-rose-400',
      'from-teal-400 to-green-400',
      'from-yellow-400 to-orange-400'
    ]
    
    // Sử dụng hash đơn giản từ ID để chọn màu
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return {
    counselors,
    loading,
    error,
    refetch: fetchCounselors
  }
}
