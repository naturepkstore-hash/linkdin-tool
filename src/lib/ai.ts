export interface GeneratePostOptions {
  topic: string;
  goal?: string;
  tone?: string;
  audience?: string;
  length?: 'Short' | 'Medium' | 'Long';
  cta?: string;
  customInstructions?: string;
}

export interface ImprovePostOptions {
  content: string;
  action:
    | 'improve'
    | 'shorten'
    | 'expand'
    | 'professional'
    | 'conversational'
    | 'add_hook'
    | 'add_cta'
    | 'hashtags';
}

export function getTopicSpecificPoints(topic: string): string[] {
  const normalizedTopic = topic.toLowerCase();

  if (/informational.*commercial|commercial.*informational/.test(normalizedTopic)) {
    return [
      `1. Separate learning from buying\nInformational searches ask for an explanation; commercial searches compare options before a decision.`,
      `2. Read the wording for intent\n“How,” “what,” and “guide” often signal learning, while “best,” “review,” and “pricing” suggest evaluation.`,
      `3. Match the page to the decision stage\nTeach first for informational queries; use clear comparisons and proof for commercial ones.`,
      `4. Measure the right outcome\nTrack useful engagement for learning pages and qualified enquiries or sales for commercial pages.`,
      `5. Give each intent its own page\nA tutorial and a product comparison solve different problems; do not force both into one weak page.`,
      `6. Connect the journey naturally\nLink an educational page to a relevant comparison so readers can continue when they are ready.`,
    ];
  }

  if (/search intent/.test(normalizedTopic)) {
    return [
      `1. Identify what the searcher wants\nClassify the query as learning, finding a site, comparing options, or taking action.`,
      `2. Check the current results page\nUse the ranking page types and formats as evidence of what satisfies that query.`,
      `3. Match one page to that need\nGive the searcher the expected answer instead of forcing an unrelated format.`,
      `4. Recheck intent when results shift\nA different mix of results can signal that searchers' needs have changed.`,
      `5. Look for the next question\nStrong pages answer the main query and help readers take a useful next step.`,
      `6. Measure satisfaction, not just rank\nReview relevant clicks and engagement to see whether the page actually serves the intent.`,
    ];
  }

  if (/technical|crawl|index|mobile|speed|schema|website|site health/.test(normalizedTopic)) {
    return [
      `1. Check whether search engines can access the important pages\nReview robots rules, sitemap coverage, canonical URLs, and index status for the pages related to ${topic}.`,
      `2. Test the page experience\nOpen key pages on mobile, follow their main links, and note anything that makes the content difficult to use.`,
      `3. Fix the issue that blocks discovery first\nPrioritize broken paths or duplicate signals before spending time on smaller technical details.`,
      `4. Verify the change\nRecheck the affected URLs and record what improved so the same issue is easier to catch next time.`,
      `5. Check page speed in context\nTest key templates on mobile and address slow resources that delay useful content.`,
      `6. Review internal paths\nMake sure important pages can be reached through working, descriptive links.`,
    ];
  }

  if (/keyword|search intent|search volume|query|serp/.test(normalizedTopic)) {
    return [
      `1. Start with the searcher's goal\nWrite down what someone searching about ${topic} is actually trying to learn, compare, or buy.`,
      `2. Inspect the results page\nLook at the formats and subtopics Google already shows, then decide whether your page can satisfy that intent.`,
      `3. Map the query to one useful page\nAvoid making several pages compete for the same purpose; give each target query a clear home.`,
      `4. Judge value beyond volume\nTrack relevant clicks and meaningful actions, not just how many times a keyword is searched.`,
      `5. Group close variations\nBuild one strong page for queries with the same intent instead of creating thin duplicates.`,
      `6. Prioritize a realistic opportunity\nBalance intent, business value, competition, and the authority your site can earn.`,
    ];
  }

  if (/content|blog|writing|editorial|refresh|article|topic cluster/.test(normalizedTopic)) {
    return [
      `1. Identify the reader's unanswered question\nBe specific about what someone needs to understand after reading about ${topic}.`,
      `2. Put the useful answer first\nOrganize the page so readers can find the main explanation before supporting detail.`,
      `3. Add evidence and practical detail\nUse accurate examples, current information, and links that help readers take the next step.`,
      `4. Review the page against its purpose\nRemove sections that do not help the reader and update details that are no longer reliable.`,
      `5. Make the structure easy to scan\nUse descriptive headings and examples that explain one clear point at a time.`,
      `6. Refresh facts with care\nVerify dates, claims, and references before changing content that readers already trust.`,
    ];
  }

  if (/analytics|measure|track|report|performance|progress|result|traffic/.test(normalizedTopic)) {
    return [
      `1. Choose one question to answer\nDecide what you need to learn from ${topic} before opening a report or changing a page.`,
      `2. Set a baseline\nRecord the relevant pages, dates, and metrics so later comparisons are fair.`,
      `3. Separate signal from noise\nCompare similar time periods and look for changes that align with the work you actually did.`,
      `4. Turn the finding into a next step\nDocument what you will keep, change, or investigate instead of collecting numbers without a decision.`,
      `5. Segment the results\nCompare pages and query groups separately to find where the change actually happened.`,
      `6. Allow time for evidence\nCheck a meaningful period after implementation before deciding whether the work helped.`,
    ];
  }

  if (/local|e-commerce|ecommerce|product|service business/.test(normalizedTopic)) {
    return [
      `1. Use the language customers use\nCollect the real questions and descriptions people use when looking for ${topic}.`,
      `2. Make the relevant details easy to verify\nKeep service, product, location, and contact information accurate wherever customers encounter it.`,
      `3. Create a useful page for each real need\nExplain what is offered, who it is for, and what the next step looks like without repeating near-identical pages.`,
      `4. Check the customer journey\nTest the path from search result to useful information to contact or purchase.`,
      `5. Add proof customers can trust\nUse accurate availability, service details, reviews, and policies to support a confident decision.`,
      `6. Keep local signals consistent\nCheck that business name, location, hours, and contact details agree across key listings.`,
    ];
  }

  if (/mistake|myth|wrong|lesson|wish i knew|afraid/.test(normalizedTopic)) {
    return [
      `1. State the assumption behind ${topic}\nBe clear about what you believed or expected before you had enough evidence.`,
      `2. Show what challenged that assumption\nUse a specific observation, result, or question rather than relying on a broad claim.`,
      `3. Explain the adjustment\nDescribe what you would do differently and why it better serves the reader or business.`,
      `4. Make the lesson actionable\nGive beginners one small way to check the same assumption in their own work.`,
      `5. Separate evidence from guesses\nUse Search Console, analytics, and the actual page to confirm what happened.`,
      `6. Share the next step\nExplain how you will apply the lesson on the next project or content update.`,
    ];
  }

  if (/learn|journey|career|skill|routine|roadmap|practice|foundation/.test(normalizedTopic)) {
    return [
      `1. Turn ${topic} into a small exercise\nChoose one real page, query, or site and apply the idea instead of only collecting notes.`,
      `2. Write down what you expected\nA clear hypothesis makes it easier to tell whether the exercise taught you something.`,
      `3. Compare expectation with evidence\nReview what happened, what surprised you, and what still needs to be learned.`,
      `4. Keep one lesson for the next session\nRecord the next practical action so learning continues through repeated work.`,
      `5. Save a real example\nKeep the page, query, and result together so the lesson has useful context later.`,
      `6. Repeat with a new challenge\nBuild confidence by applying the same skill to a different site or search.`,
    ];
  }

  return [
    `1. Define what ${topic} means in practice\nConnect the idea to a specific page, search, or audience need rather than treating it as a vague SEO term.`,
    `2. Examine one real example\nCheck what is already working and where a reader or search engine might get stuck.`,
    `3. Make one focused improvement\nChoose a change that directly addresses the issue you found instead of changing several things at once.`,
    `4. Review the outcome\nRecord what changed and what you would test next before drawing a conclusion.`,
    `5. Check the reader's perspective\nMake sure the result is clear, credible, and useful to the person who needs it.`,
    `6. Document your reasoning\nKeep the evidence and decision together so future improvements build on what you learned.`,
  ];
}

export function getTopicSpecificTakeaways(topic: string): string[] {
  return getTopicSpecificPoints(topic)
    .slice(0, 6)
    .map((point) => {
      const [heading, detail] = point.split(/\r?\n/, 2);
      const takeaway = `${heading.replace(/^\d+[.)]\s*/, '')}: ${detail || ''}`;
      if (takeaway.length <= 160) return takeaway;

      const truncated = takeaway.slice(0, 159);
      return `${truncated.slice(0, truncated.lastIndexOf(' '))}…`;
    });
}

/**
 * Generates an original LinkedIn post using the modular prompt engine
 */
export async function generateLinkedInPost(options: GeneratePostOptions): Promise<{
  content: string;
  hashtags: string[];
  suggestedHook: string;
}> {
  const {
    topic,
    goal = 'Personal Brand',
    tone = 'Professional',
    audience = 'General LinkedIn Audience',
    length = 'Medium',
    cta = '',
  } = options;

  // If user configured OpenAI / external AI key in env
  const apiKey = process.env.AI_API_KEY;
  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an elite LinkedIn ghostwriter and content strategist.
Write high-converting, viral, clean LinkedIn posts that provide actionable insights.
Formatting rules:
- Strong 1-2 line opening hook.
- Single sentence line breaks for skimming.
- Bullet points (•, 💡, 🚀) for clarity.
- 3-5 relevant hashtags at the bottom.
- Avoid corporate jargon, fluff, or excessive emojis.`,
            },
            {
              role: 'user',
              content: `Topic: ${topic}
Goal: ${goal}
Tone: ${tone}
Target Audience: ${audience}
Desired Length: ${length}
Call To Action: ${cta || 'Ask an engaging question'}`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const output = data.choices[0]?.message?.content || '';
        const extractedHashtags = output.match(/#[a-zA-Z0-9_]+/g) || [];
        const lines = output.split('\n').filter((l: string) => l.trim().length > 0);
        return {
          content: output,
          hashtags: extractedHashtags,
          suggestedHook: lines[0] || topic,
        };
      }
    } catch (e) {
      console.warn('OpenAI API call failed, using intelligent built-in generator:', e);
    }
  }

  // High-performance intelligent prompt synthesizer
  const hookVariations: Record<string, string[]> = {
    'Personal Brand': [
      `Most people believe ${topic} takes years to master.\n\nHere's what I learned in 6 months of intense execution:`,
      `I used to struggle with ${topic}.\n\nUntil I realized this 1 mindset shift that changed everything:`,
      `If you want to stand out in today's crowded market, you can't ignore ${topic}.`,
    ],
    'SEO Tips': [
      `90% of websites fail at ${topic} because of this one overlooked mistake.\n\nHere is how to fix it step-by-step:`,
      `Here is the exact SEO framework we used to grow organic traffic using ${topic}:`,
      `Stop doing outdated SEO.\n\nHere is what is actually moving the needle with ${topic} right now:`,
    ],
    'Lead Generation': [
      `Want to generate high-intent pipeline with ${topic}?\n\nHere is the exact 4-step playbook:`,
      `The fastest way to attract your ideal clients isn't cold outreach.\n\nIt's mastering ${topic}.`,
    ],
    'Educational': [
      `A masterclass on ${topic} in under 2 minutes (save this for later 📌):`,
      `Everything you need to know about ${topic} broken down into simple, actionable steps:`,
    ],
  };

  const defaultHooks = [
    `The secret to succeeding with ${topic} is simpler than you think:`,
    `If you're looking to elevate your game with ${topic}, here is the breakdown:`,
    `Here is a realistic framework for ${topic} that actually delivers results:`,
  ];

  const pool = hookVariations[goal] || defaultHooks;
  const chosenHook = pool[Math.floor(Math.random() * pool.length)];

  const bodyPoints = getTopicSpecificPoints(topic);

  let selectedPoints = bodyPoints.slice(0, 3);
  if (length === 'Long') {
    selectedPoints = bodyPoints;
  } else if (length === 'Short') {
    selectedPoints = [bodyPoints[0], bodyPoints[1]];
  }

  const ctaLine = cta
    ? `\n👉 ${cta}`
    : `\nWhat has been your biggest takeaway with ${topic}? Drop your perspective below 👇`;

  const tagTopic = topic.replace(/[^a-zA-Z0-9]/g, '');
  const hashtags = [
    `#${tagTopic || 'Growth'}`,
    `#${goal.replace(/[^a-zA-Z0-9]/g, '') || 'LinkedIn'}`,
    '#ProfessionalDevelopment',
    '#Strategy',
    '#Success',
  ].slice(0, 4);

  const fullPost = `${chosenHook}\n\n${selectedPoints.join('\n\n')}\n\nKey Takeaway:\nA useful ${topic.toLowerCase()} decision starts with evidence, addresses the real reader need, and is measured after implementation.\n${ctaLine}\n\n${hashtags.join(' ')}`;

  return {
    content: fullPost,
    hashtags,
    suggestedHook: chosenHook.split('\n')[0],
  };
}

/**
 * Improve, rewrite, or adjust an existing post
 */
export async function improveLinkedInPost(options: ImprovePostOptions): Promise<string> {
  const { content, action } = options;
  if (!content) return '';

  const lines = content.split('\n').filter(l => l.trim().length > 0);

  switch (action) {
    case 'add_hook':
      return `🔥 Stop scrolling. If you care about growth, read this:\n\n${content}`;
    case 'add_cta':
      return `${content}\n\n---\n💬 What's your take on this? Let me know in the comments below! 👇`;
    case 'shorten':
      return lines.slice(0, Math.max(3, Math.floor(lines.length * 0.6))).join('\n\n');
    case 'expand':
      return `${content}\n\nHere are 2 extra nuances to keep in mind:\n• Context always dictates execution.\n• Protect your focus against shiny object syndrome.\n\nKeep building! 🚀`;
    case 'professional':
      return content.replace(/hey guys|super cool|huge hack|mind blown/gi, 'notable strategic leverage');
    case 'conversational':
      return `Quick thought for today:\n\n${content}\n\nHope this gives you some food for thought!`;
    case 'hashtags':
      return `${content}\n\n#Leadership #LinkedInTips #Productivity #GrowthMindset #Strategy`;
    case 'improve':
    default:
      return `${content}\n\n📌 Save this post so you can reference it when planning your next sprint.`;
  }
}
