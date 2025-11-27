import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useQuotes() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRandomQuote()
  }, [])

  const fetchRandomQuote = async () => {
    try {
      setLoading(true)

      // Get count of active quotes
      const { count, error: countError } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      if (countError) throw countError

      if (!count || count === 0) {
        console.log('No quotes found in database')
        setQuote(null)
        return
      }

      // Get a random offset
      const randomOffset = Math.floor(Math.random() * count)

      // Fetch one quote at random offset
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('is_active', true)
        .range(randomOffset, randomOffset)
        .single()

      if (error) throw error

      console.log('Fetched random quote:', data)
      setQuote(data)
    } catch (error) {
      console.error('Error fetching quote:', error)
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  return {
    quote,
    loading,
    refetch: fetchRandomQuote
  }
}
