export interface QualityAnalysis {
  overallScore: number; // 0 - 100
  hookScore: 'Excellent' | 'Good' | 'Needs Improvement' | 'Missing';
  readabilityScore: 'Easy' | 'Moderate' | 'Complex';
  ctaScore: 'Present' | 'Missing';
  characterCount: number;
  wordCount: number;
  lengthStatus: 'Optimal' | 'Short' | 'Long';
  hashtagCount: number;
  hashtagStatus: 'Optimal (3-5)' | 'Too Few' | 'Excessive';
  suggestions: string[];
}

export function analyzeContentQuality(text: string): QualityAnalysis {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      overallScore: 0,
      hookScore: 'Missing',
      readabilityScore: 'Easy',
      ctaScore: 'Missing',
      characterCount: 0,
      wordCount: 0,
      lengthStatus: 'Short',
      hashtagCount: 0,
      hashtagStatus: 'Too Few',
      suggestions: ['Write or generate your post to see quality insights.'],
    };
  }

  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  const words = trimmed.split(/\s+/).filter(Boolean);
  const charCount = trimmed.length;
  const wordCount = words.length;

  const suggestions: string[] = [];

  // 1. Hook Analysis (First line examination)
  let hookScore: QualityAnalysis['hookScore'] = 'Missing';
  if (lines.length > 0) {
    const firstLine = lines[0].toLowerCase();
    const hookTriggers = [
      'how to', 'the secret', 'stop doing', 'why most', 'here is why', 'here is what',
      '3 ways', '5 steps', 'i spent', 'mistake', 'framework', 'lesson',
      'unpopular opinion', '90%', '80%', '🚨', '💡', '🔥', '👇', '🎯'
    ];
    const hasTrigger = hookTriggers.some(t => firstLine.includes(t));
    
    if (lines[0].length >= 8 && lines[0].length <= 130 && (hasTrigger || firstLine.endsWith('?') || firstLine.endsWith(':'))) {
      hookScore = 'Excellent';
    } else if (lines[0].length >= 8 && lines[0].length <= 160) {
      hookScore = 'Good';
    } else {
      hookScore = 'Needs Improvement';
      suggestions.push('Make your first line punchier to capture attention before the "...see more" cutoff.');
    }
  } else {
    suggestions.push('Add an engaging hook in the first sentence.');
  }

  // 2. CTA Analysis
  const ctaKeywords = [
    'comment', 'share your thoughts', 'let me know', 'what do you think',
    'link in comments', 'link in bio', 'repost', 'follow me', 'subscribe',
    'dm me', 'save this', 'drop a comment', 'drop it below', 'agree or disagree',
    'drop your perspective', 'drop your'
  ];
  const hasCtaKeyword = ctaKeywords.some(k => trimmed.toLowerCase().includes(k));
  const hasQuestionInEnd = lines.length >= 2 && lines.slice(-3).some(l => l.includes('?'));
  const hasCta = hasCtaKeyword || hasQuestionInEnd;

  const ctaScore: QualityAnalysis['ctaScore'] = hasCta ? 'Present' : 'Missing';
  if (!hasCta && charCount > 100) {
    suggestions.push('Add a Call-To-Action (CTA) at the end to drive comments and engagement.');
  }

  // 3. Hashtag Count
  const hashtags = trimmed.match(/#[a-zA-Z0-9_]+/g) || [];
  const hashtagCount = hashtags.length;
  let hashtagStatus: QualityAnalysis['hashtagStatus'] = 'Optimal (3-5)';
  if (hashtagCount === 0) {
    hashtagStatus = 'Too Few';
    suggestions.push('Include 3 to 5 targeted hashtags for wider LinkedIn reach.');
  } else if (hashtagCount > 6) {
    hashtagStatus = 'Excessive';
    suggestions.push('Avoid hashtag stuffing. Limit to 3-5 relevant hashtags.');
  }

  // 4. Length Analysis (LinkedIn sweet spot ~ 400 - 1800 chars)
  let lengthStatus: QualityAnalysis['lengthStatus'] = 'Optimal';
  if (charCount < 150) {
    lengthStatus = 'Short';
  } else if (charCount > 2800) {
    lengthStatus = 'Long';
    suggestions.push('Post is nearing the 3,000 character LinkedIn limit.');
  }

  // 5. Readability (Average sentence / line structure)
  const avgSentenceLength = words.length / Math.max(1, lines.length);
  let readabilityScore: QualityAnalysis['readabilityScore'] = 'Easy';
  if (avgSentenceLength > 25) {
    readabilityScore = 'Complex';
    suggestions.push('Break down long paragraphs with whitespace for better mobile readability.');
  } else if (avgSentenceLength > 15) {
    readabilityScore = 'Moderate';
  }

  // Compute Overall Score (0-100)
  let score = 20;
  if (hookScore === 'Excellent') score += 25;
  else if (hookScore === 'Good') score += 15;
  if (ctaScore === 'Present') score += 20;
  if (hashtagStatus === 'Optimal (3-5)') score += 15;
  if (lengthStatus === 'Optimal') score += 10;
  if (readabilityScore === 'Easy') score += 10;

  if (charCount < 50) {
    score = Math.min(score, 30);
  }

  score = Math.min(100, Math.max(0, score));

  return {
    overallScore: score,
    hookScore,
    readabilityScore,
    ctaScore,
    characterCount: charCount,
    wordCount,
    lengthStatus,
    hashtagCount,
    hashtagStatus,
    suggestions,
  };
}
