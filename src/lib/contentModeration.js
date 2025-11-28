// Content Moderation using Google AI Studio API (Gemini)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// Flag levels
export const FLAG_LEVELS = {
  NORMAL: 0,        // No issues detected
  MILD: 1,          // Mild negative language - post allowed but flagged
  IMMEDIATE: 2,     // Suicide/self-harm/depression - needs immediate attention
  BLOCKED: 3,       // Aggressive/violent - auto-blocked
  PENDING: 4        // API unavailable - pending counselor review
}

// Moderation result types
export const MODERATION_ACTIONS = {
  ALLOW: 'allow',           // Content is fine, post normally
  FLAG_MILD: 'flag_mild',   // Post but flag for review
  REJECT: 'reject',         // Don't post, notify counselors, suggest chat
  BLOCK: 'block',           // Don't post, content is aggressive/harmful
  PENDING: 'pending'        // API down - hold for counselor review
}

const MODERATION_PROMPT = `You are a content moderation AI for a mental health support platform for students. Analyze the following content and categorize it.

IMPORTANT: Respond ONLY with a valid JSON object, no other text.

Categories:
1. "safe" - Normal content, no concerns
2. "mild_negative" - Mild negative emotions, sadness, stress, frustration (but not dangerous)
3. "severe_distress" - Severe emotional distress, hopelessness, but no explicit self-harm
4. "depression" - Clear signs of depression, persistent sadness, loss of interest
5. "self_harm" - Mentions of self-harm, cutting, hurting oneself
6. "suicide" - Suicidal ideation, thoughts of ending life, wanting to die
7. "aggressive" - Violent intentions, threats, bullying, hate speech, harmful to others

Response format:
{
  "category": "one of the categories above",
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation",
  "keywords_detected": ["list", "of", "concerning", "words"]
}

Content to analyze:
"""
{CONTENT}
"""

Remember: Only output the JSON object, nothing else.`

/**
 * Analyze content using Google AI Studio (Gemini)
 * @param {string} content - The text content to analyze
 * @returns {Promise<{action: string, flagLevel: number, category: string, reasoning: string, keywords: string[]}>}
 */
export async function analyzeContent(content) {
  // Result when API fails - content goes to pending review
  const pendingResult = {
    action: MODERATION_ACTIONS.PENDING,
    flagLevel: FLAG_LEVELS.PENDING,
    category: 'pending',
    reasoning: 'API unavailable - pending counselor review',
    keywords: []
  }

  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured, content pending review')
    return pendingResult
  }

  if (!content || content.trim().length === 0) {
    return {
      action: MODERATION_ACTIONS.ALLOW,
      flagLevel: FLAG_LEVELS.NORMAL,
      category: 'safe',
      reasoning: 'Empty content',
      keywords: []
    }
  }

  try {
    const prompt = MODERATION_PROMPT.replace('{CONTENT}', content)

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500
        }
      })
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return pendingResult
    }

    const data = await response.json()
    
    // Extract the text response
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!textResponse) {
      console.error('No response from Gemini')
      return pendingResult
    }

    // Parse JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Could not parse JSON from response:', textResponse)
      return pendingResult
    }

    const analysis = JSON.parse(jsonMatch[0])
    
    // Map category to action and flag level
    return mapCategoryToAction(analysis)

  } catch (error) {
    console.error('Content moderation error:', error)
    return pendingResult
  }
}

/**
 * Map the AI analysis category to moderation action and flag level
 */
function mapCategoryToAction(analysis) {
  const { category, confidence, reasoning, keywords_detected } = analysis
  
  const result = {
    category,
    reasoning: reasoning || '',
    keywords: keywords_detected || [],
    confidence: confidence || 0
  }

  switch (category) {
    case 'safe':
      return {
        ...result,
        action: MODERATION_ACTIONS.ALLOW,
        flagLevel: FLAG_LEVELS.NORMAL
      }

    case 'mild_negative':
    case 'severe_distress':
      // Mild concerns - post but flag for counselor review
      return {
        ...result,
        action: MODERATION_ACTIONS.FLAG_MILD,
        flagLevel: FLAG_LEVELS.MILD
      }

    case 'depression':
    case 'self_harm':
    case 'suicide':
      // Immediate attention needed - reject post, notify counselors
      return {
        ...result,
        action: MODERATION_ACTIONS.REJECT,
        flagLevel: FLAG_LEVELS.IMMEDIATE
      }

    case 'aggressive':
      // Block aggressive content
      return {
        ...result,
        action: MODERATION_ACTIONS.BLOCK,
        flagLevel: FLAG_LEVELS.BLOCKED
      }

    default:
      // Unknown category, default to allow
      return {
        ...result,
        action: MODERATION_ACTIONS.ALLOW,
        flagLevel: FLAG_LEVELS.NORMAL
      }
  }
}

/**
 * Get Vietnamese message for moderation result
 */
export function getModerationMessage(action, category) {
  switch (action) {
    case MODERATION_ACTIONS.BLOCK:
      return {
        title: 'Nội dung không được phép',
        message: 'Bài viết của bạn chứa nội dung không phù hợp và không thể được đăng.',
        showChatSuggestion: false
      }

    case MODERATION_ACTIONS.REJECT:
      return {
        title: 'Chúng tôi quan tâm đến bạn',
        message: 'Chúng tôi nhận thấy bạn có thể đang trải qua giai đoạn khó khăn. Bài viết này không thể được đăng công khai, nhưng chúng tôi khuyến khích bạn trò chuyện trực tiếp với tư vấn viên để được hỗ trợ tốt hơn.',
        showChatSuggestion: true
      }

    case MODERATION_ACTIONS.PENDING:
      return {
        title: 'Đang chờ duyệt',
        message: 'Bài viết của bạn đã được gửi và đang chờ tư vấn viên xem xét. Bạn sẽ được thông báo khi bài viết được duyệt.',
        showChatSuggestion: false
      }

    case MODERATION_ACTIONS.FLAG_MILD:
      return {
        title: 'Đã đăng bài',
        message: 'Bài viết của bạn đã được đăng. Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với tư vấn viên.',
        showChatSuggestion: false
      }

    default:
      return {
        title: 'Đã đăng bài',
        message: 'Bài viết của bạn đã được đăng thành công.',
        showChatSuggestion: false
      }
  }
}

/**
 * Get flag level label in Vietnamese
 */
export function getFlagLevelLabel(level) {
  switch (level) {
    case FLAG_LEVELS.IMMEDIATE:
      return 'Cần chú ý ngay'
    case FLAG_LEVELS.MILD:
      return 'Theo dõi'
    case FLAG_LEVELS.BLOCKED:
      return 'Đã chặn'
    case FLAG_LEVELS.PENDING:
      return 'Chờ duyệt'
    default:
      return 'Bình thường'
  }
}

/**
 * Get category label in Vietnamese
 */
export function getCategoryLabel(category) {
  const labels = {
    'safe': 'An toàn',
    'mild_negative': 'Tiêu cực nhẹ',
    'severe_distress': 'Căng thẳng nghiêm trọng',
    'depression': 'Trầm cảm',
    'self_harm': 'Tự gây thương tích',
    'suicide': 'Ý định tự tử',
    'aggressive': 'Hung hăng/Bạo lực'
  }
  return labels[category] || category
}
