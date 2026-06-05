/**
 * Wisdom Knowledge Base
 * 
 * Comprehensive collection of principles from multiple books across 6 categories
 * Each principle is designed to help users discover insights and take micro-actions
 * 
 * Structure:
 * - 6 main categories
 * - 6-8 books per category
 * - 6-8 principles per book
 * - ~280+ total principles
 * 
 * Purpose: Maximum coverage for diverse audience needs
 */

export interface WisdomPrinciple {
  id: string;
  bookId: string;
  bookTitle: string;
  author: string;
  category: string;
  principleId: string;
  principleTitle: string;
  
  // Core content
  description: string;
  coreConcept: string;
  coreQuote?: string;
  whyItMatters: string;
  
  // When to apply
  applicableWhen: string[];
  applicableScenarios: string[];
  
  // How to use
  simpleExplanation: string;
  microAction: string;
  timeToImplement: string;
  
  // Safety considerations
  cautionsWhen?: string[];
  notApplicableFor?: string[];
  
  // Supporting info
  relatedPrinciples?: string[];
  energyLevel?: "low" | "medium" | "high";
  difficulty?: "easy" | "medium" | "hard";

  /**
   * RAG retrieval: when true, this principle is downweighted unless the user's answers
   * share strong keyword overlap with applicableWhen / applicableScenarios (avoids
   * broad philosophy matching vague distress).
   */
  ragRequiresStrongOverlap?: boolean;

  /**
   * RAG: principle is strongly context-specific (e.g. sleep/evening).
   * If set, at least one phrase must match user answers or retrieval score is reduced.
   */
  ragAnchorPhrases?: string[];
}

export interface WisdomBook {
  bookId: string;
  bookTitle: string;
  author: string;
  category: string;
  principleCount: number;
  principles: WisdomPrinciple[];
}

// ============================================================
// CATEGORY 1: MENTAL & EMOTIONAL HEALTH
// ============================================================

const mentalHealthPrinciples: WisdomPrinciple[] = [
  // Emotional Intelligence - Daniel Goleman
  {
    id: "ei-01",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "self-awareness-emotions",
    principleTitle: "Self-Awareness: Name It to Manage It",
    description:
      "You cannot manage emotions you don't recognize. The first step to emotional control is identifying what you're feeling with precision.",
    coreConcept: "Specific emotion identification enables emotional management",
    whyItMatters: "Vague emotions ('I feel bad') paralyze you. Specific emotions ('I feel frustrated because...') give you power to act.",
    applicableWhen: [
      "overwhelmed",
      "anxious",
      "can't explain mood",
      "stuck in feelings",
      "emotional numbness",
      "reactive behavior",
    ],
    applicableScenarios: [
      "Waking up anxious but unsure why",
      "Snapping at someone but confused about trigger",
      "Feeling 'off' all day",
      "Physical symptoms (chest tightness, stomach) without emotion name",
    ],
    simpleExplanation:
      "Stop and ask: 'What am I actually feeling? Angry? Sad? Scared? Disappointed?' Use specific words, not 'stressed'.",
    microAction:
      "Next time you feel 'bad', stop for 60 seconds. Write 3 specific emotions you might be feeling. Pick the truest one.",
    timeToImplement: "1-2 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ei-02",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "emotional-regulation",
    principleTitle: "Emotional Regulation: You Can't Control Feelings, Only Responses",
    description:
      "Emotions are automatic reactions, not choices. But your response to emotions IS a choice. This is where your power lives.",
    coreConcept: "Emotions arise automatically; responses are chosen",
    whyItMatters: "Fighting emotions makes them stronger. Accepting them while choosing your response gives you freedom.",
    applicableWhen: [
      "angry and reactive",
      "anxious and paralyzed",
      "sad and withdrawn",
      "feel at mercy of emotions",
      "act impulsively",
    ],
    applicableScenarios: [
      "Boss criticizes work, you want to quit immediately",
      "Partner says something hurtful, you want to leave",
      "Fear arises, you want to avoid the situation",
    ],
    simpleExplanation:
      "Feel the emotion (it will pass). Choose your action (slowly). Example: Feel anger → Breathe → Respond thoughtfully.",
    microAction:
      "Next time you feel a strong emotion, pause for 10 seconds. Name the emotion. Then choose ONE small action (not reaction).",
    timeToImplement: "10 seconds in moment",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ei-03",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "intrinsic-motivation",
    principleTitle: "Intrinsic Motivation: Meaning Matters More Than Reward",
    description:
      "People driven by internal purpose (contribution, growth, values) are more resilient and satisfied than those chasing external rewards.",
    coreConcept: "Purpose > External rewards for sustainable motivation",
    whyItMatters: "Money, praise, and status are temporary highs. Meaning sustains you through challenges.",
    applicableWhen: [
      "feel stuck in job",
      "lost motivation",
      "chasing wrong goals",
      "empty despite success",
      "don't know why you're doing this",
    ],
    applicableScenarios: [
      "Making good money but feel empty",
      "Achieved goal but no satisfaction",
      "Working toward something that doesn't matter to you",
    ],
    simpleExplanation:
      "Ask: 'Why does THIS work matter to me personally?' Not: 'Will this get me money/praise?' Move toward meaning.",
    microAction:
      "Write: 'I do this because...' (not for money). If you can't complete it honestly, it's time to reassess.",
    timeToImplement: "5-10 minutes reflection",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ei-04",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "empathy-understanding",
    principleTitle: "Empathy: Seeing the Emotion Behind Behavior",
    description:
      "When someone acts out of character, there's always an emotion driving it. Understanding that emotion changes everything.",
    coreConcept: "Behavior is symptom; emotion is root",
    whyItMatters: "Conflict dissolves when you address the emotion, not the behavior. This works for others AND yourself.",
    applicableWhen: [
      "relationship conflict",
      "misunderstanding others",
      "judging self harshly",
      "can't connect with others",
      "resentment building",
    ],
    applicableScenarios: [
      "Partner is distant; you assume they don't care (actually: scared of rejection)",
      "Friend cancels plans; you think they don't like you (actually: overwhelmed)",
      "You're harsh to yourself; assuming you're lazy (actually: scared of failure)",
    ],
    simpleExplanation:
      "When behavior seems wrong, ask: 'What emotion is driving this? What are they actually afraid of/need?'",
    microAction:
      "Next conflict: pause. Ask other person (or yourself): 'What are you really feeling right now?' Listen without fixing.",
    timeToImplement: "5-10 minutes conversation",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ei-05",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "social-awareness",
    principleTitle: "Social Awareness: Read the Room, Read the Person",
    description:
      "Most people are unaware of how they're actually landing on others. Emotional intelligence includes noticing how your emotions affect others.",
    coreConcept: "Your emotional state ripples to others; awareness lets you choose that ripple",
    whyItMatters: "Leaders, parents, partners with social awareness create safer spaces. People want to be around them.",
    applicableWhen: [
      "relationships feel tense",
      "don't know why people distance",
      "blamed for 'the mood'",
      "anxious about how you're perceived",
      "want to lead/influence others",
    ],
    applicableScenarios: [
      "You're stressed, family walks on eggshells around you",
      "You're quiet, people think you're angry at them",
      "You're critical, people become defensive",
    ],
    simpleExplanation:
      "Notice: Are people relaxed or tense around you? Is it your mood? Can you shift to create safety?",
    microAction:
      "Today, notice ONE person's reaction to YOUR mood. Ask yourself: 'Is my emotional state helping or hurting this conversation?'",
    timeToImplement: "1-2 minutes observation",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ei-06",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "relationship-management",
    principleTitle: "Relationship Management: Influence Comes From Trust",
    description:
      "You cannot influence someone you don't understand. Build understanding through emotional awareness, then trust makes you influential.",
    coreConcept: "Understanding + Consistency = Trust = Influence",
    whyItMatters: "People follow leaders/partners they trust. Trust comes from feeling understood and safe.",
    applicableWhen: [
      "can't get buy-in",
      "people won't listen",
      "feel powerless",
      "relationships are transactional",
      "want to lead",
    ],
    applicableScenarios: [
      "Kids won't listen to you",
      "Team doesn't follow your vision",
      "Partner dismisses your needs",
      "Can't convince someone of your perspective",
    ],
    simpleExplanation:
      "First: Understand THEM (their fears, needs, values). Then: Be consistent. Then: They'll trust you. Then: Influence happens naturally.",
    microAction:
      "Pick one relationship where you want influence. This week, ask 3 questions to understand THEIR perspective first.",
    timeToImplement: "10-15 minutes conversation",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ei-07",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "conflict-navigation",
    principleTitle: "Conflict Navigation: Disagreement Doesn't Mean Disconnect",
    description:
      "High EQ people see conflict as information, not threat. They disagree without attacking, listen without defending.",
    coreConcept: "Conflict is dialogue, not battle",
    whyItMatters:
      "Avoiding conflict = festering resentment. Fighting about it = damage. Navigating it = growth and deeper connection.",
    applicableWhen: [
      "conflict feels dangerous",
      "avoid disagreement",
      "become aggressive in conflict",
      "after-fight silence",
      "relationships fractured by misunderstanding",
    ],
    applicableScenarios: [
      "Afraid to tell partner what you really think",
      "Shut down when criticized",
      "Counterattack when disagreed with",
      "Unable to repair after argument",
    ],
    simpleExplanation:
      "In conflict: Stay curious, not defensive. 'Help me understand your view' > 'You're wrong'. This keeps connection alive.",
    microAction:
      "Next disagreement: Stop. Ask: 'Can you help me understand why this matters to you?' Listen fully before responding.",
    timeToImplement: "5-10 minutes",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "ei-08",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "resilience-through-connection",
    principleTitle: "Resilience Through Connection: You Recover Faster With Support",
    description:
      "Isolated people struggle longer with adversity. Connected people bounce back faster. EQ includes knowing when to reach out.",
    coreConcept: "Vulnerability in adversity builds resilience",
    whyItMatters: "Shame says 'handle it alone'. Connection says 'you're not alone'. Connection wins.",
    applicableWhen: [
      "going through hard time",
      "isolating yourself",
      "feel ashamed to ask for help",
      "recovering from loss/failure",
      "depressed and withdrawn",
    ],
    applicableScenarios: [
      "Lost a job, hiding from friends",
      "Failed at something, won't talk about it",
      "Relationship ended, pulling away from support",
      "Grieving, thinking you should 'be strong' alone",
    ],
    simpleExplanation:
      "Hard times are when connection matters most. Text ONE person: 'I'm struggling. I need support.' Most people WANT to help.",
    microAction:
      "If struggling: Call/text ONE trusted person. Say: 'I'm having a hard time. Can we talk?' Most people will say yes.",
    timeToImplement: "5 minutes to reach out",
    energyLevel: "low",
    difficulty: "hard",
    cautionsWhen: ["In acute crisis - seek professional help"],
  },

  // Man's Search for Meaning - Viktor Frankl
  {
    id: "msm-01",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "freedom-to-choose-response",
    principleTitle: "Freedom to Choose: Your Response is Always Your Own",
    description:
      "In the worst circumstances (concentration camps), Frankl discovered the one freedom that can never be taken: your response. You can't control what happens, but you can control how you respond.",
    coreConcept: "Between stimulus and response, there is freedom of choice",
    whyItMatters:
      "This reframe moves you from victim to agent. 'What happened to me' matters less than 'what I do about it'.",
    applicableWhen: [
      "feel powerless",
      "blaming circumstances",
      "anxious about things outside control",
      "victim mentality",
      "paralyzed by past",
    ],
    applicableScenarios: [
      "Anxious about economy (can't control it)",
      "Angry about childhood (can't change it)",
      "Resentful about loss (can't undo it)",
      "Stuck because 'the situation' won't change",
    ],
    simpleExplanation:
      "You can't control the event. You CAN control: your attitude about it, what you learn, what you do next.",
    microAction:
      "Write something you're powerless over. Under it, write: 'I CAN control...' (my effort, my attitude, my next step).",
    timeToImplement: "5-10 minutes reflection",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "msm-02",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "meaning-in-suffering",
    principleTitle: "Suffering Transformed: Finding Meaning in Pain",
    description:
      "Suffering itself cannot be avoided in a meaningful life. But meaningless suffering breaks people. Meaningful suffering connects people to their purpose.",
    coreConcept: "Same suffering + meaning = bearable. Same suffering + no meaning = unbearable",
    whyItMatters:
      "You can't eliminate pain, but you can transform it by connecting it to meaning. This changes everything.",
    applicableWhen: [
      "going through pain",
      "struggling with illness/loss",
      "wondering why you're suffering",
      "pain feels pointless",
      "depressed by circumstances",
    ],
    applicableScenarios: [
      "Caregiver exhaustion from caring for sick parent",
      "Grief from loss feels meaningless",
      "Chronic pain with no purpose",
      "Sacrifice for others feels too heavy",
    ],
    simpleExplanation:
      "Ask: 'If I MUST go through this, what meaning can I find in it?' (helping others learn, building strength, deeper compassion).",
    microAction:
      "Current struggle: 'What meaning COULD this have if I chose to see it?' Write 3 possible meanings.",
    timeToImplement: "10-15 minutes reflection",
    energyLevel: "medium",
    difficulty: "hard",
    ragRequiresStrongOverlap: true,
    ragAnchorPhrases: [
      "meaning",
      "meaningless",
      "purpose",
      "suffering",
      "pain",
      "grief",
      "loss",
      "illness",
      "caregiver",
      "chronic",
      "pointless",
      "why am i",
      "why me",
      "point of",
    ],
  },
  {
    id: "msm-03",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "will-to-meaning",
    principleTitle: "Will to Meaning: Purpose Sustains You More Than Happiness",
    description:
      "People don't primarily seek happiness. They seek meaning. Happiness is a byproduct of meaningful living. Purpose keeps people alive.",
    coreConcept: "Meaning > Happiness for human resilience",
    whyItMatters:
      "Someone with meaning but struggle often outlasts someone with comfort but no purpose. Purpose is survival fuel.",
    applicableWhen: [
      "feel empty despite comfort",
      "successful but unfulfilled",
      "lost sense of purpose",
      "don't know why you're doing this",
      "struggling but need motivation",
    ],
    applicableScenarios: [
      "Making good money but want to quit",
      "Comfortable life but feel pointless",
      "Having things but no direction",
      "Facing hardship but drawn to meaningful work",
    ],
    simpleExplanation:
      "Your life needs a 'why'. Not happiness, but purpose. 'I do this because it matters' gives you energy.",
    microAction:
      "Ask yourself: 'What's my why? What meaning am I living for?' Write it. If blank, that's your work.",
    timeToImplement: "15-30 minutes deep reflection",
    energyLevel: "high",
    difficulty: "hard",
    ragRequiresStrongOverlap: true,
    ragAnchorPhrases: [
      "meaning",
      "purpose",
      "meaningful",
      "fulfillment",
      "fulfilled",
      "unfulfilled",
      "calling",
      "passion",
      "my why",
      "why am i",
      "why i'm",
      "pointless",
      "no purpose",
      "what's the point",
      "useless",
      "successful but",
      "empty despite",
      "lost sense",
      "no direction",
    ],
  },
  {
    id: "msm-04",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "tragic-triad-acceptance",
    principleTitle: "Tragic Triad: Pain, Guilt, Death Are Part of Life (Accept Them)",
    description:
      "Frankl calls it the 'tragic triad': pain, guilt, and death. These are universal. Accepting them as part of life (not as failures) brings peace.",
    coreConcept: "Accepting life's hardships as normal, not exceptional",
    whyItMatters:
      "Fighting pain/guilt/mortality exhausts you. Accepting them as part of human experience frees you.",
    applicableWhen: [
      "anxious about death/illness",
      "guilty about past mistakes",
      "angry that life includes pain",
      "avoiding mortality",
      "perfectionist (can't accept failure/limits)",
    ],
    applicableScenarios: [
      "Anxiety about aging/health",
      "Shame about something you did",
      "Resentment that life is hard",
      "Trying to avoid all pain (makes anxiety worse)",
    ],
    simpleExplanation:
      "Life includes: pain sometimes, guilt sometimes, death eventually. Resisting makes it worse. Accepting makes it bearable.",
    microAction:
      "What do you most resist accepting? (pain, aging, limits, mistakes). This week, say: 'This is part of being human.'",
    timeToImplement: "Ongoing mindset",
    energyLevel: "low",
    difficulty: "hard",
    ragRequiresStrongOverlap: true,
    ragAnchorPhrases: [
      "death",
      "die",
      "dying",
      "mortality",
      "mortal",
      "aging",
      "illness",
      "life is hard",
      "part of life",
      "avoid mortality",
      "past mistakes",
      "resent",
      "resentment",
      "can't accept failure",
      "accept aging",
      "meaning of suffering",
      "why life",
      "life includes pain",
    ],
  },
  {
    id: "msm-05",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "three-paths-to-meaning",
    principleTitle: "Three Paths to Meaning: Create, Experience, or Endure",
    description:
      "Meaning comes from: (1) Creating something (work, art, ideas), (2) Experiencing something (love, nature, beauty), (3) Choosing your attitude in what you can't change.",
    coreConcept: "Meaning is available in every circumstance",
    whyItMatters: "Even if you can't create or experience, you can choose your attitude. Meaning is never unavailable.",
    applicableWhen: [
      "can't find purpose",
      "limited by circumstances",
      "illness/disability preventing work",
      "can't pursue dreams",
      "feeling useless",
    ],
    applicableScenarios: [
      "Restricted mobility (but can still experience/choose attitude)",
      "Can't work (but can create something small, or experience connection)",
      "Facing death (but can choose how to face it)",
    ],
    simpleExplanation:
      "You might not be able to create big things. But you can: experience connection, appreciate beauty, choose your attitude.",
    microAction:
      "Pick ONE path available to you today: Create something (even small). Experience something. Or choose a better attitude.",
    timeToImplement: "Varies",
    energyLevel: "medium",
    difficulty: "medium",
    ragRequiresStrongOverlap: true,
    ragAnchorPhrases: [
      "meaning",
      "purpose",
      "meaningful",
      "fulfillment",
      "fulfilled",
      "unfulfilled",
      "calling",
      "passion",
      "pointless",
      "no purpose",
      "what's the point",
      "useless",
      "why am i",
      "direction",
      "sense of purpose",
    ],
  },
  {
    id: "msm-06",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "existential-freedom",
    principleTitle: "Existential Freedom: You Are Responsible For Your Life",
    description:
      "No one can give you meaning. No circumstance can take your responsibility. You are radically free to choose your response. With that freedom comes responsibility.",
    coreConcept: "Ultimate responsibility is both burden and liberation",
    whyItMatters: "Blaming circumstances keeps you stuck. Owning responsibility empowers you to change.",
    applicableWhen: [
      "blaming others",
      "victim mindset",
      "stuck and can't change",
      "waiting for permission",
      "external locus of control",
    ],
    applicableScenarios: [
      "'My parents messed me up' (true, AND you can choose now)",
      "'The economy made me poor' (true, AND you can choose next)",
      "'My boss won't let me' (true, AND you can choose response)",
    ],
    simpleExplanation:
      "Yes, things happened to you. AND you are still responsible for how you respond. Both are true. Own the second.",
    microAction:
      "Situation you're stuck in: Write: 'I can't control X. I CAN control...' (list your actual choices).",
    timeToImplement: "10-15 minutes reflection",
    energyLevel: "medium",
    difficulty: "medium",
  },

  // The Body Keeps the Score - Bessel van der Kolk
  {
    id: "bks-01",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "somatic-awareness",
    principleTitle: "Somatic Awareness: Your Body is Sending Messages",
    description:
      "Trauma and stress live in the body. Anxiety manifests as physical sensations (tightness, racing heart, trembling). Listening to your body is crucial.",
    coreConcept: "Body sensations = nervous system communication",
    whyItMatters:
      "You can't think your way out of body sensations. You must listen, understand, and work with your body.",
    applicableWhen: [
      "anxiety in body",
      "chronic tension",
      "panic attacks",
      "dissociation",
      "can't relax",
      "physical symptoms without diagnosis",
    ],
    applicableScenarios: [
      "Chest tightness when anxious",
      "Stomach knots before stress",
      "Shakiness you can't control",
      "Numbness or disconnection from body",
    ],
    simpleExplanation:
      "Pause. Scan your body: Where do you feel your anxiety/stress? What does it feel like? Naming it = first step to changing it.",
    microAction:
      "Next anxiety: Close eyes. Scan body. Where is it? (chest, stomach, shoulders). Breathe INTO that spot for 1 minute.",
    timeToImplement: "1-2 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "bks-02",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "nervous-system-regulation",
    principleTitle: "Nervous System Regulation: Your System Needs to Feel Safe First",
    description:
      "Your nervous system is constantly scanning for safety/danger. If it feels unsafe, all your logic fails. Regulation (feeling safe) comes first.",
    coreConcept: "Safety enables thinking, learning, growth",
    whyItMatters: "You can't logic your way out of nervous system activation. You must regulate first, then think.",
    applicableWhen: [
      "can't calm down",
      "overwhelmed by advice",
      "panic attacks",
      "hypervigilance",
      "reactive behavior",
      "can't focus",
    ],
    applicableScenarios: [
      "Someone tells you 'just relax' but you can't",
      "You know logically you're safe, but still anxious",
      "Can't think clearly when stressed",
      "Advice doesn't help because you're activated",
    ],
    simpleExplanation:
      "First: Calm the nervous system (breathing, movement, safety cues). Then: Think and problem-solve.",
    microAction:
      "When activated: Put hands on heart. Slow breath (in for 4, out for 6). Feel yourself in this moment. THEN think.",
    timeToImplement: "2-3 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "bks-03",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "movement-releases-stress",
    principleTitle: "Movement: Releasing Stress From the Body",
    description:
      "Stress hormones (adrenaline, cortisol) prepare you for fight/flight. But modern threats aren't physical. Movement completes the cycle and releases trapped energy.",
    coreConcept: "Physical activity = stress hormone discharge",
    whyItMatters: "Stress trapped in body = chronic anxiety/pain. Movement releases it naturally.",
    applicableWhen: [
      "chronic anxiety",
      "restless energy",
      "can't sit still",
      "stress symptoms",
      "low mood",
      "scattered thoughts",
    ],
    applicableScenarios: [
      "Worried but no outlet",
      "After stressful event, still activated",
      "Energy stuck in body",
      "Depression making you immobile",
    ],
    simpleExplanation:
      "Your body prepared to fight/flight but didn't. Move it: walk, dance, run, yoga. Let the stress release.",
    microAction:
      "Anxious? Move for 10 minutes (walk, dance, anything). Let your body shake it out. Notice the shift.",
    timeToImplement: "10-15 minutes",
    energyLevel: "high",
    difficulty: "easy",
  },
  {
    id: "bks-04",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "vagal-tone-breathing",
    principleTitle: "Vagal Tone: The Vagus Nerve Governs Rest/Digest",
    description:
      "The vagus nerve activates your calming system (rest/digest). Breathing exercises, especially longer exhales, stimulate it directly.",
    coreConcept: "Slow breathing activates calm via vagus nerve",
    whyItMatters: "You have direct access to your nervous system through breath. This is free, always available.",
    applicableWhen: [
      "racing thoughts",
      "can't sleep",
      "tense muscles",
      "panic symptoms",
      "overwhelmed",
      "need to calm down",
    ],
    applicableScenarios: [
      "Anxiety spiraling",
      "Can't fall asleep",
      "After conflict, still fired up",
      "Midday stress peak",
    ],
    simpleExplanation:
      "Long exhale activates your calm system. Breathe: In for 4, Out for 6 (or longer exhale than inhale). Your body will shift.",
    microAction:
      "3x daily (morning, midday, evening): 2 minutes of long exhales. In 4, Out 6. Notice what happens.",
    timeToImplement: "2 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "bks-05",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "trauma-integration",
    principleTitle: "Integration: Trauma Heals Through Connection (Body + Mind + Emotion)",
    description:
      "Healing isn't about 'getting over it' or 'thinking better thoughts'. It's about integrating what happened into your whole self and finding safety again.",
    coreConcept: "Fragmented = suffering. Integrated = healing",
    whyItMatters: "Talking alone doesn't work. Body-based therapies (yoga, somatic work, movement) + connection = healing.",
    applicableWhen: [
      "stuck in old trauma",
      "talking therapy not working",
      "body tension tied to past",
      "disconnected from self",
      "can't move forward",
    ],
    applicableScenarios: [
      "Old fear still controls you despite understanding it rationally",
      "Body reacts to triggers despite knowing you're safe",
      "Trauma therapy isn't helping",
    ],
    simpleExplanation:
      "Your body remembers. Work with it through: movement, yoga, somatic therapy, trusted relationships. Not just thinking.",
    microAction:
      "Try ONE body-based practice: yoga, tai chi, dance, or swimming. Weekly for 4 weeks. Notice what shifts.",
    timeToImplement: "30-60 minutes, weekly",
    energyLevel: "medium",
    difficulty: "medium",
    cautionsWhen: ["Severe trauma - work with professional"],
  },
  {
    id: "bks-06",
    bookId: "body-keeps-score",
    bookTitle: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    category: "mental-health",
    principleId: "voice-singing-presence",
    principleTitle: "Your Voice: Singing, Speaking, Breathing Activate Healing",
    description:
      "Suppressed trauma often silences people. Reclaiming your voice through humming, singing, or speaking activates the vagus nerve and reconnects you.",
    coreConcept: "Vocalization = nervous system reset + self-presence",
    whyItMatters: "Trauma silences. Reclaiming your voice is reclaiming yourself.",
    applicableWhen: [
      "can't speak up",
      "voice feels small",
      "can't express yourself",
      "suppressed feelings",
      "difficulty with presence",
    ],
    applicableScenarios: [
      "Afraid to share opinion",
      "Can't ask for what you need",
      "Singing feels like breaking down barriers",
    ],
    simpleExplanation:
      "Humming, singing, chanting = powerful nervous system reset. Speak your needs out loud, even alone.",
    microAction:
      "Sing (badly, alone) for 2-3 minutes daily for a week. Hum during anxiety. Notice how it calms you.",
    timeToImplement: "2-5 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },

  // Feeling Good - David Burns
  {
    id: "fg-01",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "cognitive-distortions",
    principleTitle: "Cognitive Distortions: Your Thoughts Create Your Feelings",
    description:
      "Depression and anxiety aren't about what's true. They're about distorted thinking patterns (all-or-nothing, catastrophizing, mind-reading). Changing thoughts changes feelings.",
    coreConcept: "Distorted thought → Negative feeling. Accurate thought → Accurate feeling",
    whyItMatters:
      "You can't always change circumstances, but you can change how you think about them. This changes how you feel.",
    applicableWhen: [
      "depressed",
      "anxious",
      "catastrophizing",
      "black-and-white thinking",
      "self-critical",
      "stuck in negative loop",
    ],
    applicableScenarios: [
      "One mistake = 'I'm a failure'",
      "Awkward moment = 'Everyone thinks I'm weird'",
      "Rejection = 'I'll never find love'",
      "Bad day = 'Life is terrible'",
    ],
    simpleExplanation:
      "Notice your thought. Is it true? Is it the whole truth? What's a more accurate thought? Try it.",
    microAction:
      "Next negative thought: Write it down. Ask: 'Is this 100% true? What's the evidence against it? What's a balanced version?'",
    timeToImplement: "5-10 minutes per thought",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "fg-02",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "all-or-nothing-thinking",
    principleTitle: "All-or-Nothing Thinking: The Perfectionist Trap",
    description:
      "Life isn't pass/fail, success/failure, perfect/failure. It's a spectrum. All-or-nothing thinking = depression + paralysis.",
    coreConcept: "Everything exists on a spectrum, not binary",
    whyItMatters:
      "If imperfection = failure, you'll never start. Embracing the spectrum = freedom to try.",
    applicableWhen: [
      "perfectionist",
      "procrastinating",
      "afraid to start",
      "giving up easily",
      "all-or-nothing approach",
      "depressed by 'failure'",
    ],
    applicableScenarios: [
      "Won't go to gym because can't do full workout",
      "Won't write because it won't be perfect",
      "Won't try because might fail",
      "One mistake = whole thing is ruined",
    ],
    simpleExplanation:
      "Replace 'perfect or fail' with 'I'll do what I can'. 50% effort > 0% effort. Done > perfect.",
    microAction:
      "Pick something you've been avoiding (writing, exercise, project). Do 50% or 'bad' version. Notice it's still progress.",
    timeToImplement: "Varies",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "fg-03",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "behavioral-activation",
    principleTitle: "Behavioral Activation: Action Changes Mood, Not Just Vice Versa",
    description:
      "You don't have to feel like doing something to do it. Often, action comes first and mood follows. Movement breaks the depression cycle.",
    coreConcept: "Behavior → Mood, not just Mood → Behavior",
    whyItMatters:
      "Waiting to feel motivated keeps you stuck. Moving first (even slightly) shifts mood and creates motivation.",
    applicableWhen: [
      "depressed",
      "low motivation",
      "can't get started",
      "paralyzed",
      "waiting to feel like it",
      "stuck in bed",
    ],
    applicableScenarios: [
      "Too depressed to shower, but shower activates mood shift",
      "Don't want to exercise, but movement energizes",
      "Can't see friends, but connection improves mood",
    ],
    simpleExplanation:
      "Don't wait to feel like it. Do it anyway (even 5 min). Mood follows action.",
    microAction:
      "Name ONE thing that usually improves your mood. Do it TODAY, even for 5 minutes. Don't wait to feel like it.",
    timeToImplement: "5-30 minutes",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "fg-04",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "thought-records",
    principleTitle: "Thought Records: Writing Makes Thoughts Less Powerful",
    description:
      "Thoughts feel true and permanent inside your head. Writing them down externalizes them, making them less powerful and easier to challenge.",
    coreConcept: "Externalized thoughts = less control over you",
    whyItMatters:
      "Recursive thinking (same thought looping) feeds depression/anxiety. Writing breaks the cycle.",
    applicableWhen: [
      "anxiety spiraling",
      "overthinking",
      "rumination",
      "can't shut brain off",
      "same thought repeating",
    ],
    applicableScenarios: [
      "3am worry loop",
      "Replaying embarrassing moment over and over",
      "Catastrophizing a future event",
    ],
    simpleExplanation:
      "Write: 'This is what I'm thinking.' Then: 'Is this thought helpful? True? What's a better thought?' Writing = breaking the loop.",
    microAction:
      "Next anxiety/worry: Write it down. Read it. Ask 'Is this ACTUALLY true?' Usually, external view changes it.",
    timeToImplement: "10 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "fg-05",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "should-statements",
    principleTitle: "'Should' Statements: The Voice of Guilt and Shame",
    description:
      "'I should...', 'I must...', 'I ought to...' create guilt and shame, not motivation. They're usually internalized voices of others.",
    coreConcept: "'Should' = guilt. 'Could' = choice. 'Want to' = values",
    whyItMatters:
      "Shoulds paralyze through guilt. Choosing what you actually want motivates you authentically.",
    applicableWhen: [
      "guilt-driven",
      "people-pleasing",
      "resentful",
      "burned out",
      "living others' expectations",
      "can't say no",
    ],
    applicableScenarios: [
      "'I should visit family' (but resentful)",
      "'I should be further in life'",
      "'I should want this'",
      "'I should be able to handle this'",
    ],
    simpleExplanation:
      "Replace 'should' with 'could' or 'want'. Does it feel different? 'I could visit' vs 'I should'.",
    microAction:
      "Notice your 'shoulds' today. For each one, ask: 'Do I actually want this? Or am I doing it from guilt?'",
    timeToImplement: "Ongoing awareness",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "ei-26",
    bookId: "emotional-intelligence",
    bookTitle: "Emotional Intelligence",
    author: "Daniel Goleman",
    category: "mental-health",
    principleId: "emotional-numbness-protection",
    principleTitle: "Numbness: When You Can't Feel Anything",
    description:
      "Numbness (dissociation, disconnection from feelings) is a protective mechanism. Your nervous system learned: 'Feeling is dangerous. Shut down.' This kept you safe once. But now it's keeping you stuck—unable to feel joy, connection, or even pain. Numbness isn't laziness or depression, it's a freeze response. Healing requires gently (not forcefully) reconnecting to your body and emotions through safe practices: movement, cold water, touch, presence.",
    coreConcept: "Numbness is protection, but staying numb keeps you trapped",
    coreQuote: "You can't heal what you can't feel. But you can gently defrost.",
    applicableWhen: [
      "can't feel emotions",
      "dissociation",
      "watching life from outside yourself",
      "disconnected from body",
      "can't access joy or sadness",
      "flat affect",
    ],
    applicableScenarios: [
      "Something bad happened and you just... don't feel it",
      "You're going through life on autopilot",
      "Others feel things intensely; you feel nothing",
      "You watch yourself as if from outside",
      "You can't connect even with people you love",
    ],
    simpleExplanation:
      "Numbness isn't weakness. It's your nervous system protecting you from being overwhelmed. The problem: protection that worked once now limits you. Healing is gradual: (1) Notice: 'I'm numb', (2) Get curious (not critical): 'What is my body protecting me from?', (3) Gently reconnect through: cold water on face, shaking/movement, slow breathing, safe touch. Defrosting takes time. Be patient.",
    microAction:
      "Try one safe reconnection practice: Cold water on face for 30 sec, dance to one song, shake your body, or deep breathing. Notice any small shift in sensation.",
    timeToImplement: "5 minutes",
    energyLevel: "low",
    difficulty: "hard",
    cautionsWhen: [
      "Don't force feeling—that re-traumatizes",
      "Therapy may be needed for deep dissociation",
    ],
    whyItMatters:
      "You can't move forward while numb. Gentle reconnection to feeling is the first step to healing.",
  },
  {
    id: "msm-07",
    bookId: "mans-search-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "mental-health",
    principleId: "grief-acceptance-integration",
    principleTitle: "Grief: The Price of Love Is Loss",
    description:
      "Grief isn't a problem to fix. It's love with nowhere to go. The deeper you loved, the deeper you grieve. Fighting grief (staying numb, distracting, rushing through it) prolongs suffering. Accepting grief means: acknowledging the loss, feeling the pain, and honoring what was. The goal isn't to 'move on' or 'get over it.' It's to carry the loss forward while still living. Grief softens with time, not because you cared less, but because your nervous system integrates the loss.",
    coreConcept: "Grief is the tax paid by love. Welcome it, don't fight it.",
    coreQuote: "The only way out of grief is through it.",
    applicableWhen: [
      "grieving loss",
      "death of loved one",
      "end of relationship",
      "loss of identity or role",
      "stuck in grief",
      "unable to move forward",
    ],
    applicableScenarios: [
      "Someone died and you're 'supposed to' be over it",
      "A relationship ended and you're stuck",
      "You lost your job and lost your identity",
      "You're told 'they're in a better place' (not helpful)",
      "Years later, grief still hits unexpectedly",
    ],
    simpleExplanation:
      "Grief isn't depression—it's love. Your brain is literally reorganizing: removing the person from 'present' to 'memory.' This takes time (much longer than society pretends). The path: (1) Feel it (cry, journal, talk), (2) Honor them (remember, tell stories), (3) Integrate (find meaning in the loss), (4) Live forward (not over it, but with it). Grief softens. You won't feel this way forever.",
    microAction:
      "Spend 15 minutes with your grief (journal, cry, sit with it). Don't try to fix it. Just feel it and acknowledge: 'This loss matters. My love matters.'",
    timeToImplement: "15 minutes",
    energyLevel: "high",
    difficulty: "hard",
    cautionsWhen: [
      "Complicated grief may need professional support",
      "'Move on' advice is harmful—you carry grief forward",
    ],
    whyItMatters:
      "Grief unprocessed becomes depression. Grief honored becomes wisdom.",
  },
  // --- Adult self-help synthesis (18+): avoidance, compassion, evening stress ---
  {
    id: "mh-flex-01",
    bookId: "psychological-flexibility-notes",
    bookTitle: "Psychological Flexibility Skills",
    author: "Evidence-informed synthesis",
    category: "mental-health",
    principleId: "experiential-avoidance-cost",
    principleTitle: "Experiential Avoidance: Relief Now, Cost Later",
    description:
      "Trying not to feel an emotion often works for minutes—and trains your brain to fear the feeling even more. Distraction (scrolling, overwork, staying busy) buys short-term relief but keeps the emotion unprocessed. Willingness doesn't mean liking the feeling; it means stopping the endless escape loop long enough to stay present at a tolerable dose.",
    coreConcept: "Short-term avoidance increases long-term sensitivity",
    whyItMatters:
      "When avoidance becomes your default, anxiety feels like danger and rest feels unsafe—because rest is when the feeling shows up.",
    applicableWhen: [
      "scrolling to numb",
      "working late to avoid feelings",
      "can't sit still with emotions",
      "overwhelmed when things get quiet",
      "distracting instead of feeling",
      "using phone to escape anxiety",
    ],
    applicableScenarios: [
      "You reach for your phone the moment discomfort appears",
      "You stay busy so you don't have to feel low",
      "At night, when it's quiet, anxiety gets louder",
      "You feel guilty after wasting time escaping",
      "You fear stopping because the feeling might flood you",
    ],
    simpleExplanation:
      "Name the move in your own words (e.g. 'I'm pouring into work so I don't feel this,' or 'I'm on my phone so I don't feel this'). Then choose a tiny pause: 60 seconds with the feeling—breathe, notice where it lives in your body—before you decide to distract again. You're building tolerance, not torture.",
    microAction:
      "Next time you move into your usual escape (work, tasks, phone, scrolling—whatever yours is), set a 60-second timer first: feet on floor, slow exhale, name the feeling in one sentence. Then choose whether to continue—not on autopilot.",
    timeToImplement: "60–90 seconds",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "If distress is overwhelming or unsafe, prioritize grounding and professional support—not willpower alone",
    ],
  },
  {
    id: "mh-comp-01",
    bookId: "self-compassion-public-domain-style",
    bookTitle: "Self-Compassion in Practice",
    author: "Educational synthesis",
    category: "mental-health",
    principleId: "shame-loop-self-kindness",
    principleTitle: "Breaking the Shame Spiral With Self-Kindness",
    description:
      "Self-criticism often follows emotional pain—you feel bad, then beat yourself up for feeling bad or for 'wasting time.' That doubles the suffering. Self-compassion isn't letting yourself off the hook; it's refusing to abuse yourself while you're already hurting. Adults can learn to speak to themselves with the same decency they'd offer a friend.",
    coreConcept: "Pain + self-attack = a trap; pain + kindness = room to move",
    whyItMatters:
      "If every difficult emotion triggers shame, you'll keep escaping emotions—and never learn what they're asking for.",
    applicableWhen: [
      "guilt after procrastinating",
      "ashamed of anxiety or low mood",
      "harsh inner critic",
      "feel broken compared to others",
      "beat myself up for coping poorly",
    ],
    applicableScenarios: [
      "You call yourself lazy after struggling emotionally",
      "You feel ashamed for scrolling or avoiding",
      "You believe anxious means you're defective",
      "You spiral: feel bad → shame → more avoidance",
    ],
    simpleExplanation:
      "Try one sentence swap: instead of 'I'm broken,' try 'I'm human and this is hard.' Then ask: 'What would I say to someone I care about in this situation?' Say that out loud—awkwardness is normal at first.",
    microAction:
      "Write one harsh sentence you tell yourself. Rewrite it in a firm-but-kind voice (no fake cheer). Read it once before bed.",
    timeToImplement: "2–3 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "mh-night-01",
    bookId: "sleep-stress-literacy",
    bookTitle: "Sleep and Stress Literacy",
    author: "Educational synthesis",
    category: "mental-health",
    principleId: "evening-arousal-loop",
    principleTitle: "The Evening Loop: Quiet, Arousal, and Escape",
    description:
      "Night anxiety is common: the day stops, stimulation drops, and your nervous system finally processes what you postponed. Phones add fake stimulation—cheap dopamine—that postpones processing again. You're not failing; you're caught between tired and wired. Small wind-down rituals reduce the mismatch between body tired and mind alert.",
    coreConcept: "Quiet reveals backlog; screens borrow tomorrow's calm",
    whyItMatters:
      "If you only interpret night distress as 'something wrong with me,' you miss the predictable pattern—and miss helpful fixes.",
    applicableWhen: [
      "anxiety worse at night",
      "quiet makes feelings louder",
      "can't wind down",
      "late-night scrolling",
      "wired but exhausted",
      "guilty about wasting evening time",
    ],
    applicableScenarios: [
      "You're fine until you're alone at night",
      "You scroll in bed until you're numb",
      "Your mind races when the house is quiet",
      "You feel low when the day ends",
    ],
    simpleExplanation:
      "Pick one non-phone wind-down anchor for 10 minutes: dim lights, shower, stretch, paper journal, or slow music—before you decide whether to scroll. Goal is signal to your body: we're shifting gears.",
    microAction:
      "After dinner, put the phone on charge outside the bedroom once. If that's too hard, move it across the room before your usual scroll window.",
    timeToImplement: "10 minutes routine",
    energyLevel: "low",
    difficulty: "easy",
    cautionsWhen: [
      "Persistent sleep disturbance may need medical evaluation—this is habit education, not treatment",
    ],
    ragAnchorPhrases: [
      "night",
      "evening",
      "sleep",
      "bed",
      "bedtime",
      "insomnia",
      "before bed",
      "late at night",
      "at night",
      "can't sleep",
      "couldn't sleep",
      "wake up at",
      "tired at night",
    ],
  },
  {
    id: "mh-cbt-02",
    bookId: "feeling-good",
    bookTitle: "Feeling Good",
    author: "David Burns",
    category: "mental-health",
    principleId: "catastrophizing-handle-control",
    principleTitle: "Catastrophizing: 'I Can't Handle It' Is a Thought, Not a Fact",
    description:
      "When you're scared feelings will overwhelm you, your mind jumps to worst-case certainty: 'I'll fall apart.' That's a catastrophizing thought—treating a scary prediction as if it's already true. The antidote isn't toxic positivity; it's specificity. What would 'handling it' look like at 10%? What evidence do you have that you've survived difficult feelings before?",
    coreConcept: "Fear of feelings inflates suffering; specificity shrinks it",
    whyItMatters:
      "If you believe you can't handle emotions, avoidance becomes rational—so you never update the belief with disconfirming experience.",
    applicableWhen: [
      "fear of being overwhelmed",
      "afraid to stop distracting",
      "afraid to feel the emotion",
      "predicting disaster if you feel fully",
      "all-or-nothing predictions",
      "terror of losing control",
    ],
    applicableScenarios: [
      "You believe letting the feeling in would prove you're broken",
      "You imagine collapsing if you let yourself feel angry or low",
      "You assume uncomfortable feelings mean you're failing",
    ],
    simpleExplanation:
      "Write the scary prediction: 'If I let myself feel this (anger, fear, shame), ______.' Rate how true it feels 0–100. Then list two times you felt awful and still got through—even badly counts.",
    microAction:
      "Take one feared sentence and add: '…and I could tolerate it for 90 seconds.' Practice one slow exhale while saying it quietly.",
    timeToImplement: "3–5 minutes",
    energyLevel: "low",
    difficulty: "medium",
  },
];

// ============================================================
// CATEGORY 2: RELATIONSHIPS & COMMUNICATION
// ============================================================

const relationshipsPrinciples: WisdomPrinciple[] = [
  // Attached - Levine & Heller
  {
    id: "att-01",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "attachment-styles-awareness",
    principleTitle: "Know Your Attachment Style: It Shapes Your Relationships",
    description:
      "Attachment styles (secure, anxious, avoidant) are patterns from childhood that repeat in adult relationships. Understanding yours is the first step to changing patterns.",
    coreConcept: "Attachment style = blueprint for relationship patterns",
    whyItMatters: "You can't change what you don't see. Recognizing your pattern is liberation.",
    applicableWhen: [
      "relationship struggles repeat",
      "can't understand your needs",
      "partner misunderstands you",
      "conflict patterns recurring",
      "wondering why you pick certain partners",
    ],
    applicableScenarios: [
      "Always date emotionally unavailable people",
      "You pursue, they distance",
      "Can't commit despite wanting to",
      "Cycle of arguments and reconciliation",
    ],
    simpleExplanation:
      "Attachment: Secure = comfortable with intimacy + independence. Anxious = need reassurance. Avoidant = distance and independence. Which is you?",
    microAction:
      "Read about the 3 styles. Which sounds like you? Which sounds like your past patterns? Write it down.",
    timeToImplement: "10-15 minutes reflection",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "att-02",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "pursue-withdraw-cycle",
    principleTitle: "Pursue-Withdraw Cycle: Breaking the Dance",
    description:
      "When anxious partners pursue (seeking reassurance) and avoidant partners withdraw (needing space), both feel rejected. Understanding the dynamic breaks it.",
    coreConcept: "The pattern isn't about them/you, it's about the system",
    whyItMatters: "Once you see the dance, you can step off it and break the cycle.",
    applicableWhen: [
      "pursue-withdraw dynamic",
      "needy/distant roles",
      "can't communicate needs",
      "distance growing",
      "feel like you're chasing or running",
    ],
    applicableScenarios: [
      "You text, they don't respond, you get anxious, they feel smothered",
      "You pull away, they pursue harder",
      "Cycle of distance, pursuit, distance",
    ],
    simpleExplanation:
      "One pursues (feels rejected), one withdraws (feels suffocated). Both are right. Break the cycle by: pursuer gives space, withdrawer initiates.",
    microAction:
      "Identify your role (pursuer or withdrawer). Next time, do the opposite impulse. Pursuer: give space. Withdrawer: reach out.",
    timeToImplement: "In the moment",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "att-03",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "secure-base-havens",
    principleTitle: "Secure Base & Haven: Partners Should Feel Safe With You",
    description:
      "Healthy relationships provide two things: a safe haven (comfort when stressed) and a secure base (support for growth). Both are essential.",
    coreConcept: "Relationships = emotional security + growth support",
    whyItMatters: "Without these, relationships feel either suffocating or unsupported.",
    applicableWhen: [
      "relationship doesn't feel safe",
      "afraid to be vulnerable",
      "don't know what partner needs",
      "relationship stalled",
      "can't grow together",
    ],
    applicableScenarios: [
      "Partner can't comfort you (haven missing)",
      "Partner doesn't support your dreams (base missing)",
      "Feel judged instead of supported",
      "Can't be yourself",
    ],
    simpleExplanation:
      "Ask partner: 'When you're struggling, do you feel safe coming to me?' 'When you have dreams, do you feel I support you?'",
    microAction:
      "One conversation: 'How can I be a better safe haven for you?' + 'How can I better support your growth?'",
    timeToImplement: "15-20 minutes conversation",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "att-04",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "communication-signals",
    principleTitle: "Communication: Say What You Need Clearly",
    description:
      "Anxious people hint; avoidant people stay silent. Secure people ask directly. Your partner can't meet needs they don't know about.",
    coreConcept: "Clear ask > hints/silence > disappointment",
    whyItMatters: "Your partner isn't mind reader. Clear communication prevents resentment.",
    applicableWhen: [
      "resentful partner doesn't 'get it'",
      "hinting doesn't work",
      "assume they should know",
      "expecting mind-reading",
      "conflict from miscommunication",
    ],
    applicableScenarios: [
      "You need reassurance but don't ask",
      "You want time alone but don't say it",
      "You need help but expect them to notice",
    ],
    simpleExplanation:
      "Say it plainly: 'I need X' (reassurance, space, help). Not hints. Not silence. Direct ask.",
    microAction:
      "Think of something you want from partner but haven't asked. Ask it clearly this week.",
    timeToImplement: "5 minutes conversation",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "att-05",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "deactivating-strategies",
    principleTitle: "Deactivating Strategies: When You Push Away What You Want",
    description:
      "When anxious about relationships, avoidant people unconsciously sabotage (create distance, find flaws, pull away). Recognizing this is key.",
    coreConcept: "Self-sabotage = fear of intimacy",
    whyItMatters: "Without awareness, you'll keep pushing away good relationships.",
    applicableWhen: [
      "find fault in every partner",
      "pull away when close",
      "run from relationships",
      "unconscious sabotage",
      "can't commit",
    ],
    applicableScenarios: [
      "Perfect partner shows up, suddenly they annoy you",
      "Things get intimate, you need space",
      "Everything's good, you're looking for exit",
    ],
    simpleExplanation:
      "Notice when you're sabotaging. Pause. Ask: 'Am I running from them, or from intimacy?' Big difference.",
    microAction:
      "If you see yourself sabotaging, pause. Tell partner: 'I'm getting scared and distant. It's not about you.'",
    timeToImplement: "In the moment",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "att-06",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "anxious-protest-behaviors",
    principleTitle: "Protest Behaviors: Anxiety Masked as Anger",
    description:
      "When anxious, people 'protest' through anger, criticism, demands. It feels like anger but it's really: 'Are you there? Do you care? Don't leave me.'",
    coreConcept: "Protest behaviors = hidden bids for connection",
    whyItMatters: "Understanding this transforms arguments from 'you're attacking' to 'you're scared'.",
    applicableWhen: [
      "criticize partner",
      "pick fights",
      "seem angry when really anxious",
      "partner says you're hostile",
      "conflict escalates",
    ],
    applicableScenarios: [
      "Partner doesn't text back, you explode",
      "You criticize their choices, it's really 'pay attention to me'",
      "Arguments that feel out of proportion",
    ],
    simpleExplanation:
      "Anger protest = 'I'm scared you don't care.' Address the fear, not the anger.",
    microAction:
      "Next protest impulse: Pause. Ask yourself: 'Am I actually angry? Or am I scared?' Tell partner the truth.",
    timeToImplement: "5-10 minutes",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "att-07",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "interdependence-not-independence",
    principleTitle: "Interdependence: Healthy Love Isn't Independence",
    description:
      "Modern culture says 'never need anyone'. But secure attachment is MUTUAL interdependence. Needing your partner isn't weakness.",
    coreConcept: "Secure = comfortable depending AND being depended on",
    whyItMatters: "Denying needs creates distance. Admitting them creates connection.",
    applicableWhen: [
      "afraid to need",
      "independence = worth",
      "can't ask for help",
      "distance from partner",
      "loneliness despite having partner",
    ],
    applicableScenarios: [
      "Won't admit you need their support (it seems weak)",
      "Do everything alone to prove strength",
      "Partner feels kept at distance",
    ],
    simpleExplanation:
      "Secure love = 'I can do things AND I want to do some with you.' 'I have you AND you can have me when needed.'",
    microAction:
      "Tell partner something you need help with or support with. Notice what happens to closeness.",
    timeToImplement: "10 minutes conversation",
    energyLevel: "low",
    difficulty: "hard",
  },

  // Nonviolent Communication - Rosenberg
  {
    id: "nvc-01",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "observations-vs-judgments",
    principleTitle: "Observations vs. Judgments: Facts vs. Stories",
    description:
      "Most conflicts come from judgments ('You're selfish') vs. observations ('You didn't help when I asked'). Observations open dialogue. Judgments close it.",
    coreConcept: "Observation = fact. Judgment = story. Choose observation.",
    whyItMatters: "Judgments trigger defense. Observations enable understanding.",
    applicableWhen: [
      "conflict",
      "blame language",
      "defensive responses",
      "judgmental",
      "can't be heard",
    ],
    applicableScenarios: [
      "Say: 'You're lazy' (judgment), partner defends. vs. 'I see dishes in sink' (observation), discussion possible.",
      "Say: 'You don't care' vs. 'You didn't ask how my day was'",
    ],
    simpleExplanation:
      "Instead of judgment, describe what you observe: 'When X happened, I felt Y.' No 'you always' or 'you never'.",
    microAction:
      "Next conflict: Catch a judgment. Rephrase as observation. Notice if it opens or closes dialogue.",
    timeToImplement: "In the moment",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "nvc-02",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "feelings-vs-thoughts",
    principleTitle: "Feelings vs. Thoughts: 'I Feel' Doesn't Mean It's a Feeling",
    description:
      "Most 'I feel' statements are actually thoughts ('I feel abandoned' = 'I think they don't care'). True feelings: mad, sad, glad, scared. Distinguish them.",
    coreConcept: "Feeling = emotion. 'I feel that...' = thought",
    whyItMatters: "Real feelings invite empathy. Thoughts disguised as feelings trigger debate.",
    applicableWhen: [
      "communication not working",
      "conversations become arguments",
      "can't express feelings",
      "getting dismissed",
      "not being heard",
    ],
    applicableScenarios: [
      "'I feel abandoned' (thought) vs. 'I feel lonely' (feeling)",
      "'I feel like you don't care' (thought) vs. 'I feel sad' (feeling)",
    ],
    simpleExplanation:
      "Actual feeling = mad, sad, glad, scared, hurt, confused, etc. Say that. Not: 'I feel that...'",
    microAction:
      "Next time you want to say 'I feel...', pause. What's the actual feeling? (mad? sad? scared?). Use that word.",
    timeToImplement: "In the moment",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "nvc-03",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "needs-identification",
    principleTitle: "Needs Underneath Requests: What Do You Really Need?",
    description:
      "Requests ('Take out trash') often hide deeper needs (order, partnership, respect). Identifying needs opens real dialogue.",
    coreConcept: "Surface request > deeper need. Address the need.",
    whyItMatters: "Demanding behaviors, then demands just repeat. Understanding needs enables solutions.",
    applicableWhen: [
      "demands not met",
      "nagging",
      "feels transactional",
      "surface conflict masks real issue",
      "partner doesn't cooperate",
    ],
    applicableScenarios: [
      "'Take out trash' really = 'I need partnership/shared responsibility'",
      "'Stop working late' really = 'I need connection/time together'",
      "'Help with kids' really = 'I need support/not to feel alone'",
    ],
    simpleExplanation:
      "Behind the request: What do I really need? (support, respect, partnership, peace, growth). Address that, not just the task.",
    microAction:
      "Pick a recurring request (yours or partner's). Under it, ask: 'What need is really there?' Talk about the need.",
    timeToImplement: "10-15 minutes conversation",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "nvc-04",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "empathy-before-strategy",
    principleTitle: "Empathy First: Understand Before Solving",
    description:
      "People need to be heard before they can hear. Lead with empathy (understanding their world), then strategize together.",
    coreConcept: "Empathy enables cooperation. Advice blocks it.",
    whyItMatters: "Jumping to solutions feels dismissive. Understanding first creates safety.",
    applicableWhen: [
      "partner won't listen",
      "arguments go nowhere",
      "feel misunderstood",
      "advice doesn't help",
      "conflict unresolved",
    ],
    applicableScenarios: [
      "Partner's upset, you try to solve it, they get angrier",
      "You suggest solutions, they resist",
      "Conversation never feels complete",
    ],
    simpleExplanation:
      "First: Listen fully. Say back what you understand: 'So you felt X because Y? Is that right?' THEN: problem-solve together.",
    microAction:
      "Next conflict: Don't try to solve it. Just listen. Say back: 'What I hear is... Is that right?' Do ONLY that.",
    timeToImplement: "10-15 minutes",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "nvc-05",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "requests-not-demands",
    principleTitle: "Requests, Not Demands: Give Permission to Say No",
    description:
      "Demands create resentment. Requests with genuine openness to 'no' create cooperation. 'Will you help?' > 'You have to help.'",
    coreConcept: "Request = openness to no. Demand = coercion",
    whyItMatters: "People who feel trapped comply unwillingly. People with choice cooperate willingly.",
    applicableWhen: [
      "partner seems resentful",
      "compliance without enthusiasm",
      "feels like you're forcing",
      "relationship transactional",
      "cooperation lacking",
    ],
    applicableScenarios: [
      "Demanding vs. requesting differently shifts energy",
      "Partner more willing when they have real choice",
    ],
    simpleExplanation:
      "Ask genuinely: 'Would you be willing to help?' Be okay if they say no. That creates real cooperation.",
    microAction:
      "This week, make 3 requests (not demands). Be okay with 'no'. Notice the shift in their response.",
    timeToImplement: "Ongoing practice",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "nvc-06",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "universal-human-needs",
    principleTitle: "Universal Human Needs: Connection, Autonomy, Meaning, Safety",
    description:
      "All human conflict comes down to different unmet needs. Everyone wants: safety, autonomy, connection, meaning, growth. Recognizing this creates compassion.",
    coreConcept: "Conflict = different unmet needs. Not bad people.",
    whyItMatters: "Once you see needs, people become understandable. Compassion follows.",
    applicableWhen: [
      "resentful of partner",
      "judgmental",
      "relationship conflict",
      "can't understand them",
      "seeing only worst in them",
    ],
    applicableScenarios: [
      "Partner seems selfish (actually needs autonomy)",
      "Partner seems controlling (actually needs safety)",
      "Partner seems distant (actually needs understanding)",
    ],
    simpleExplanation:
      "What need is REALLY being met by their behavior? (Safety? Autonomy? Control? Connection?) Once you see it, it's less offensive.",
    microAction:
      "Next conflict: Ask yourself: 'What need is driving their behavior?' Not to excuse it, but to understand.",
    timeToImplement: "5-10 minutes reflection",
    energyLevel: "low",
    difficulty: "medium",
  },

  // The 5 Love Languages (summary principles - will add more books)
  {
    id: "5ll-01",
    bookId: "five-love-languages",
    bookTitle: "The 5 Love Languages",
    author: "Gary Chapman",
    category: "relationships",
    principleId: "different-love-expression",
    principleTitle: "Love Languages: Different Ways to Give and Receive Love",
    description:
      "People experience love differently: words, acts, time, touch, gifts. Giving love in partner's language = feels loved. Your language might be different.",
    coreConcept: "Love language mismatch = feeling unloved despite effort",
    whyItMatters:
      "Your partner might be trying to love you in a language you don't speak. Learning theirs changes everything.",
    applicableWhen: [
      "feel unloved",
      "partner 'doesn't get' you",
      "doing nice things they don't appreciate",
      "disconnection despite effort",
      "taking each other for granted",
    ],
    applicableScenarios: [
      "You need words of affirmation, partner shows love through acts",
      "You give gifts, partner needs quality time",
      "You need physical touch, partner gives words",
    ],
    simpleExplanation:
      "5 languages: Words, Acts, Time, Touch, Gifts. What makes YOU feel loved? What about your partner?",
    microAction:
      "Identify your top 2 love languages. Identify partner's. Ask: 'What makes you feel loved?' Do one thing in THEIR language.",
    timeToImplement: "15 minutes conversation",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "at-08",
    bookId: "attached",
    bookTitle: "Attached",
    author: "Amir Levine & Rachel Heller",
    category: "relationships",
    principleId: "vulnerability-strength-connection",
    principleTitle: "Vulnerability: Strength, Not Weakness",
    description:
      "Most people confuse vulnerability with weakness. It's the opposite. Vulnerability (letting someone see your real self, needs, and fears) is courageous and requires strength. Secure people are vulnerable—they show their full selves. Avoidant people hide. When you let someone see you fully and they love you anyway, that's secure attachment. The wall you built to protect yourself is now the thing keeping love out.",
    coreConcept: "Vulnerability is not weakness; it's the only path to real connection",
    coreQuote: "The same vulnerability that makes you afraid is what makes you brave.",
    applicableWhen: [
      "afraid of being seen",
      "showing your real self",
      "afraid partner will leave if they know you",
      "maintaining a facade",
      "hiding needs from partner",
    ],
    applicableScenarios: [
      "You want to be close but the mask stays on",
      "Your partner asks 'what's wrong' and you say 'nothing'",
      "You're afraid if they know the real you, they'll leave",
      "You keep your feelings hidden to maintain control",
      "You won't let anyone see you cry or struggle",
    ],
    simpleExplanation:
      "The walls we build around our hearts protect us from pain—but they also block love. Real intimacy happens when both people show their true selves. This is terrifying if you grew up around rejection or chaos. But secure people do it anyway. They say: 'This is me, all of me. If you stay, that's love. If you go, at least I was real.' Try tiny vulnerabilities: Share a fear. Ask for help. Cry. Notice the other person doesn't leave.",
    microAction:
      "Tell your partner ONE true thing you usually hide: a fear, a need, a insecurity. Notice: they likely respond with compassion, not rejection.",
    timeToImplement: "5 minutes conversation",
    energyLevel: "high",
    difficulty: "hard",
    cautionsWhen: [
      "Vulnerability with unsafe people = re-traumatization. Choose wisely.",
      "Start small. Build trust gradually.",
    ],
    whyItMatters:
      "Intimacy is impossible without vulnerability. The walls that protected you will ultimately isolate you.",
  },
  {
    id: "nvc-07",
    bookId: "nonviolent-communication",
    bookTitle: "Nonviolent Communication",
    author: "Marshall Rosenberg",
    category: "relationships",
    principleId: "boundaries-self-respect",
    principleTitle: "Boundaries: Saying No Without Guilt",
    description:
      "Boundaries aren't selfish. They're how you take care of yourself so you can show up fully for others. A boundary is: 'I need X to feel respected.' 'I can't lend money,' 'I need alone time,' 'That comment hurts me.' People with poor boundaries over-give, become resentful, then explode. People with healthy boundaries say no clearly, stay connected, and relationships are stronger. Saying no is an act of care—for yourself AND the other person (honesty beats resentment).",
    coreConcept: "Boundaries = self-respect communicated clearly",
    coreQuote: "No is a complete sentence.",
    applicableWhen: [
      "over-giving in relationships",
      "difficulty saying no",
      "people-pleasing",
      "resentment building",
      "feeling violated",
      "can't express needs",
    ],
    applicableScenarios: [
      "Your partner wants something you can't give and you say yes anyway",
      "Family asks for money/time/emotional labor and you comply out of guilt",
      "You're angry but won't say why (boundary violation, not expressed)",
      "You say yes to everything and burn out",
      "You give and give until you're resentful",
    ],
    simpleExplanation:
      "Healthy boundaries are clear, kind, and honest. 'No' doesn't mean 'I don't care about you.' It means 'I care about myself enough to be honest.' Model: (1) State boundary clearly: 'I can't lend money', (2) Explain why: 'I need to secure my own finances', (3) Offer alternatives if possible: 'But I can help you make a budget'. People respect boundaries. They don't respect over-givers who then explode.",
    microAction:
      "Identify ONE boundary you need to set. Write it: 'I need ___ because ___'. Practice saying it to the person.",
    timeToImplement: "15 minutes",
    energyLevel: "medium",
    difficulty: "hard",
    cautionsWhen: [
      "Boundaries may trigger guilt (yours or theirs)—that's normal",
      "Real relationships can handle boundaries",
    ],
    whyItMatters:
      "Weak boundaries lead to resentment. Resentment kills relationships. Boundaries protect love.",
  },
  {
    id: "gt-01",
    bookId: "seven-principles-making-marriage-work",
    bookTitle: "The Seven Principles for Making Marriage Work",
    author: "John Gottman",
    category: "relationships",
    principleId: "turn-toward-bids",
    principleTitle: "Turn Toward Bids: Small Moments Build Connection",
    description:
      "Partners constantly make bids for attention—a comment, a touch, sharing something small. Turning toward means noticing and responding with interest. Turning away or against erodes trust over years. Happy couples miss many bids too; what matters is the ratio of turning toward over time, not perfection.",
    coreConcept: "Connection is built in micro-moments, not only big talks",
    applicableWhen: [
      "feeling distant in a close relationship",
      "same fights on repeat",
      "want more warmth without heavy conversations only",
      "busy schedules eroding intimacy",
    ],
    applicableScenarios: [
      "Partner mentions something mundane; you grunt at your phone instead of answering",
      "You realize you haven't laughed together in weeks",
    ],
    simpleExplanation:
      "For three days, when your person makes a small bid (story, joke, worry), pause and engage for 60 seconds—eye contact, real answer. Notice what shifts.",
    microAction:
      "Tonight: ask one genuine follow-up question after something they share—no fixing, just curiosity.",
    timeToImplement: "Daily for 3 days",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Most relationship drift isn't from betrayal—it's from accumulated missed bids.",
  },
  {
    id: "gt-02",
    bookId: "seven-principles-making-marriage-work",
    bookTitle: "The Seven Principles for Making Marriage Work",
    author: "John Gottman",
    category: "relationships",
    principleId: "repair-after-conflict",
    principleTitle: "Repair Attempts: Fix the Rupture Early",
    description:
      "Conflict happens. What distinguishes stable couples isn't avoiding fights—it's repairing: humor, apology, taking a break, asking what hurt. Repairs de-escalate before contempt sets in. Learning a few repair phrases changes the arc of arguments.",
    coreConcept: "Repair > winning the fight",
    applicableWhen: [
      "arguments escalate fast",
      "silent treatment after fights",
      "want to fight fairer",
      "fear saying sorry makes you weak",
    ],
    applicableScenarios: [
      "Small disagreements become day-long cold wars",
      "You win the point but lose closeness",
    ],
    simpleExplanation:
      "Agree on one repair line you both accept (e.g., 'I'm getting harsh—pause 10 minutes?'). Use it at the next spike—before insults.",
    microAction:
      "After the next tense moment: say one specific apology for your part—even 10%—without demanding theirs first.",
    timeToImplement: "In the moment",
    energyLevel: "medium",
    difficulty: "hard",
    whyItMatters:
      "Without repair skills, couples stockpile resentment until connection feels unsafe.",
  },
  {
    id: "hj-01",
    bookId: "hold-me-tight",
    bookTitle: "Hold Me Tight",
    author: "Dr. Sue Johnson",
    category: "relationships",
    principleId: "negative-cycle-not-enemy",
    principleTitle: "You're Not Each Other's Enemy—the Cycle Is",
    description:
      "Most painful patterns are demon dances: pursue vs. withdraw, criticize vs. defend. Underneath are attachment fears: 'Are you there for me?' Naming the cycle—and the fears beneath it—shifts blame from character to pattern. You're allies against the loop.",
    coreConcept: "Identify the dance, then slow it together",
    applicableWhen: [
      "pursuer-distancer dynamic",
      "same fight different content",
      "want to stop blaming partner as 'the problem'",
    ],
    applicableScenarios: [
      "One chases reassurance; the other shuts down; both feel abandoned",
      "You argue about chores but it's really about feeling unseen",
    ],
    simpleExplanation:
      "Together (or solo first): draw your cycle in three steps—trigger, move A, move B. Name it like weather: 'There's our spiral again.'",
    microAction:
      "Next spiral: one person says 'We're in our cycle—pause?' Then each names one softer feeling under anger (scared, alone).",
    timeToImplement: "Next conflict",
    energyLevel: "high",
    difficulty: "hard",
    cautionsWhen: [
      "If there's coercion or fear, safety first—professional support may be needed",
    ],
    whyItMatters:
      "Seeing the pattern reduces contempt and opens space for vulnerability.",
  },
  {
    id: "per-01",
    bookId: "mating-in-captivity",
    bookTitle: "Mating in Captivity",
    author: "Esther Perel",
    category: "relationships",
    principleId: "security-and-novelty",
    principleTitle: "Security and Novelty: Both Matter in Long-Term Desire",
    description:
      "Long relationships need safety—but desire often needs space, curiosity, and individuation. Collapsing entirely into roles ('only parents,' 'only coworkers') can dull erotic and playful energy. Small separateness—projects, friends, mystery—can fuel closeness rather than threaten it.",
    coreConcept: "Too much merger can flatten desire; healthy distance can restore spark",
    applicableWhen: [
      "feeling more like roommates than lovers",
      "guilt about wanting space",
      "life stage crunch (kids, caregiving)",
    ],
    applicableScenarios: [
      "You coordinate logistics only—no flirtation or play",
      "Either partner feels smothered or unseen",
    ],
    simpleExplanation:
      "Schedule one non-logistics hour weekly: walk, date, or solo recharge—no problem-solving talk. Protect it like a bill.",
    microAction:
      "Each names one thing that made them feel attractive or alive this year—no judgment. Brainstorm one tiny way to bring that energy back.",
    timeToImplement: "1 hour weekly",
    energyLevel: "medium",
    difficulty: "medium",
    cautionsWhen: [
      "Not an excuse for avoidance—address breaches of trust directly",
    ],
    whyItMatters:
      "Reconnecting isn't only processing problems—it's creating room for aliveness.",
  },
  {
    id: "5ll-02",
    bookId: "five-love-languages",
    bookTitle: "The 5 Love Languages",
    author: "Gary Chapman",
    category: "relationships",
    principleId: "love-language-bids",
    principleTitle: "Ask for Love in Their Language, Not Only Yours",
    description:
      "Many couples assume effort equals impact. But effort in the wrong language can miss emotionally. Love grows when each person learns the other's top language and gives small, repeatable bids in that form.",
    coreConcept: "Intent matters, but translation matters too",
    applicableWhen: [
      "both trying but feeling disconnected",
      "good intentions landing flat",
      "frequent complaint of feeling unseen",
      "romantic effort not felt",
    ],
    applicableScenarios: [
      "One gives gifts, the other longs for quality time",
      "One offers advice, the other needs affirmation",
    ],
    simpleExplanation:
      "Ask directly: 'This week, what would make you feel loved in a concrete way?' Then do that exact thing once.",
    microAction:
      "Each partner names top two love languages and one specific action for each. Try one action daily for 7 days.",
    timeToImplement: "7-day experiment",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Small translated acts reduce unnecessary resentment quickly.",
  },
  {
    id: "hfw-01",
    bookId: "how-to-win-friends",
    bookTitle: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    category: "relationships",
    principleId: "curiosity-before-criticism",
    principleTitle: "Be Interested Before Being Impressive",
    description:
      "Connection deepens when people feel seen. Asking sincere questions, listening fully, and reflecting back what matters to them builds trust faster than self-presentation or persuasion.",
    coreConcept: "Curiosity creates closeness; performance creates distance",
    applicableWhen: [
      "awkward conversations",
      "networking fatigue",
      "friendships feel one-sided",
      "struggle building rapport",
    ],
    applicableScenarios: [
      "You dominate conversation when anxious",
      "You want better relationships at work but feel transactional",
    ],
    simpleExplanation:
      "Use 70/30 listening: ask two follow-up questions before sharing your own view.",
    microAction:
      "In your next two conversations, ask: 'What has been most challenging this week?' Reflect one sentence before responding.",
    timeToImplement: "Immediate practice",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "People remember how understood they felt more than what you said.",
  },
  {
    id: "hfw-02",
    bookId: "how-to-win-friends",
    bookTitle: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    category: "relationships",
    principleId: "appreciation-over-criticism",
    principleTitle: "Specific Appreciation Beats General Criticism",
    description:
      "Criticism usually triggers defense, not change. Specific appreciation and respectful requests make cooperation more likely because they protect dignity while still naming needs.",
    coreConcept: "Influence grows from respect, not pressure",
    applicableWhen: [
      "repeated criticism cycle",
      "feedback ignored",
      "defensive partner or coworker",
      "resentment in communication",
    ],
    applicableScenarios: [
      "You correct constantly and intimacy drops",
      "Team hears only what is wrong and disengages",
    ],
    simpleExplanation:
      "Start feedback with one true, specific appreciation. Then make one clear, behavior-level request.",
    microAction:
      "Replace one complaint this week with: 'I appreciate X; could we try Y next time?'",
    timeToImplement: "In conversation",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Respectful influence sustains connection while improving behavior.",
  },
  {
    id: "hj-02",
    bookId: "hold-me-tight",
    bookTitle: "Hold Me Tight",
    author: "Dr. Sue Johnson",
    category: "relationships",
    principleId: "reach-and-respond",
    principleTitle: "Reach and Respond: Emotional Safety Through Responsiveness",
    description:
      "Secure bonds are built when one person reaches with vulnerability and the other responds with presence, not dismissal. Repeated responsiveness lowers defensiveness and makes conflict less threatening.",
    coreConcept: "Responsiveness is the foundation of emotional safety",
    applicableWhen: [
      "partner feels unheard",
      "conflict quickly escalates",
      "fear of being too much",
      "distance after tough talks",
    ],
    applicableScenarios: [
      "One partner shares pain; the other solves or withdraws",
      "Arguments are really bids for reassurance",
    ],
    simpleExplanation:
      "When your partner shares emotion, first respond with presence: 'I'm here. I get why that hurt.' Solve later.",
    microAction:
      "In the next hard moment, ask and answer two questions: 'What are you most afraid of right now?' and 'What do you need from me?'",
    timeToImplement: "Next conflict",
    energyLevel: "medium",
    difficulty: "hard",
    whyItMatters:
      "People calm down faster when they feel emotionally held, not analyzed.",
  },
  {
    id: "glw-01",
    bookId: "getting-the-love-you-want",
    bookTitle: "Getting the Love You Want",
    author: "Harville Hendrix",
    category: "relationships",
    principleId: "childhood-pattern-repetition",
    principleTitle: "Old Wounds, New Partner: Notice the Pattern Replay",
    description:
      "Adult relationship triggers often connect to earlier unmet needs or old pain. Recognizing the replay pattern helps you respond intentionally instead of repeating protective reactions from the past.",
    coreConcept: "Awareness of old scripts reduces automatic reactivity",
    applicableWhen: [
      "same relationship conflict repeats",
      "strong reactions feel disproportionate",
      "fear of rejection or abandonment spikes",
      "attraction to familiar but painful dynamics",
    ],
    applicableScenarios: [
      "You feel unseen and react as if nothing has changed since childhood",
      "Current conflict activates old shame quickly",
    ],
    simpleExplanation:
      "When triggered, ask: 'How old does this feeling feel?' Separate past pain from present facts before responding.",
    microAction:
      "After your next trigger, write two columns: 'What happened now' vs 'What this reminds me of from before.'",
    timeToImplement: "10 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Naming pattern replay interrupts inherited conflict loops.",
  },
  {
    id: "abr-01",
    bookId: "adult-in-relationships",
    bookTitle: "How to Be an Adult in Relationships",
    author: "David Richo",
    category: "relationships",
    principleId: "five-as-being-love",
    principleTitle: "Practice Adult Love: Attention, Acceptance, Appreciation, Affection, Allowing",
    description:
      "Mature love is less about intensity and more about steady relational behaviors: giving attention, accepting differences, appreciating contributions, offering affection, and allowing autonomy. These five practices reduce control and increase trust.",
    coreConcept: "Relational maturity is built through repeatable behaviors",
    applicableWhen: [
      "love feels conditional",
      "control struggles",
      "resentment over differences",
      "wanting healthier long-term connection",
    ],
    applicableScenarios: [
      "You love each other but criticize each other's personality",
      "Closeness collapses when one person needs space",
    ],
    simpleExplanation:
      "Pick one of the five A's per day and practice it deliberately in one interaction.",
    microAction:
      "For 5 days, rotate one A daily (attention, acceptance, appreciation, affection, allowing) and journal what changes.",
    timeToImplement: "5-day practice",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Consistent mature behaviors stabilize relationships more than occasional grand gestures.",
  },
];

// ============================================================
// CATEGORY 3: WORK & PURPOSE
// ============================================================

const workPrinciples: WisdomPrinciple[] = [
  // Essentialism - Greg McKeown
  {
    id: "ess-01",
    bookId: "essentialism",
    bookTitle: "Essentialism",
    author: "Greg McKeown",
    category: "work-purpose",
    principleId: "saying-no-essential",
    principleTitle: "The Power of No: Clarity Through Elimination",
    description:
      "The most successful people don't do more. They do less, but deliberately. Every yes is a no to something else. Choose consciously.",
    coreConcept: "Strategic no > enthusiastic yes to everything",
    whyItMatters: "Saying yes to everything means nothing gets full attention. Focus comes from elimination.",
    applicableWhen: [
      "overwhelmed",
      "too many projects",
      "stretched thin",
      "quality suffering",
      "constantly busy but unproductive",
      "saying yes to things you resent",
    ],
    applicableScenarios: [
      "Doing everything = doing nothing well",
      "Projects half-done, all mediocre",
      "Can't focus because too many things",
      "Resentful commitments",
    ],
    simpleExplanation:
      "Every yes is a no. Choose your 3-5 essential things. No to everything else. Quality beats quantity.",
    microAction:
      "List all your current projects/commitments. Pick TOP 3. Say no to others (or delegate).",
    timeToImplement: "30-45 minutes",
    energyLevel: "high",
    difficulty: "hard",
  },
  {
    id: "ess-02",
    bookId: "essentialism",
    bookTitle: "Essentialism",
    author: "Greg McKeown",
    category: "work-purpose",
    principleId: "playbook-clarity",
    principleTitle: "Crystal Clear Priorities: The Essentialist's Playbook",
    description:
      "Essentialists know exactly what matters. They have a playbook (clear 3-5 priorities). Unclear priorities = everything feels urgent.",
    coreConcept: "Clarity of priorities eliminates decision paralysis",
    whyItMatters:
      "Without clear priorities, every request feels important. With them, you can say no easily.",
    applicableWhen: [
      "can't say no",
      "everything feels urgent",
      "decision paralysis",
      "overwhelmed by requests",
      "don't know what matters",
    ],
    applicableScenarios: [
      "Boss assigns 5 things, all feel essential",
      "Can't prioritize, so do nothing or surface everything",
      "Distracted by urgent but unimportant",
    ],
    simpleExplanation:
      "Write your 3-5 essentials (for month/year). When asked to do something, ask: 'Does this fit my essentials?'",
    microAction:
      "Write your 3-5 essentials for this year. Put it where you see it. Use it to filter new requests.",
    timeToImplement: "30 minutes",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "ess-03",
    bookId: "essentialism",
    bookTitle: "Essentialism",
    author: "Greg McKeown",
    category: "work-purpose",
    principleId: "progress-over-perfection",
    principleTitle: "Progress Over Perfection: Done Beats Perfect",
    description:
      "Perfectionists get stuck. Essentialists progress. Small progress on important things beats perfect execution of minor things.",
    coreConcept: "Done and good > perfect and stuck",
    whyItMatters: "Progress creates momentum. Perfection creates paralysis.",
    applicableWhen: [
      "perfectionist",
      "procrastinating",
      "can't finish",
      "quality paralyzed",
      "waiting for perfect conditions",
    ],
    applicableScenarios: [
      "Won't ship project until it's perfect",
      "Rewrites same section 10 times",
      "Waiting for right time/tools/budget",
    ],
    simpleExplanation:
      "Publish 80% done. Get feedback. Iterate. Beats waiting for 100% that never ships.",
    microAction:
      "Something you've been perfecting: Ship it at 80%. Notice what happens. Better or worse than expected?",
    timeToImplement: "Varies",
    energyLevel: "high",
    difficulty: "hard",
  },
  {
    id: "ess-04",
    bookId: "essentialism",
    bookTitle: "Essentialism",
    author: "Greg McKeown",
    category: "work-purpose",
    principleId: "trade-off-clarity",
    principleTitle: "Trade-Offs: Everything Has a Cost",
    description:
      "You can't have everything. Every choice costs something. Successful people acknowledge the cost consciously, not try to have it all.",
    coreConcept: "Honesty about trade-offs enables better choices",
    whyItMatters:
      "Pretending there's no cost leads to resentment. Owning costs enables peace with choices.",
    applicableWhen: [
      "trying to have it all",
      "resentful of choices",
      "pursuing conflicting goals",
      "burned out",
      "can't be satisfied",
    ],
    applicableScenarios: [
      "Want career success AND lots of free time (choose)",
      "Want stability AND adventure (choose)",
      "Want to help everyone AND have boundaries (choose)",
    ],
    simpleExplanation:
      "Say it: 'If I do X, I can't do Y.' Be honest about the cost. Then choose with eyes open.",
    microAction:
      "Current choice you're facing: Write the trade-off clearly. 'If I choose A, I give up B.' Choose with that clarity.",
    timeToImplement: "10-15 minutes",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ess-05",
    bookId: "essentialism",
    bookTitle: "Essentialism",
    author: "Greg McKeown",
    category: "work-purpose",
    principleId: "sleep-essential",
    principleTitle: "Rest is Productive: Sleep Enables Better Work",
    description:
      "Essentialists protect sleep. It's not lazy; it's strategic. Well-rested people make better decisions, work faster, create better.",
    coreConcept: "Rest > hustle for real productivity",
    whyItMatters: "Sleep deprivation mimics intoxication. You're worse at thinking, not tougher.",
    applicableWhen: [
      "burned out",
      "can't think clearly",
      "making poor decisions",
      "grinding but unproductive",
      "tired but can't stop",
    ],
    applicableScenarios: [
      "Work late, feel productive, but next day unproductive",
      "Sleep debt catching up to you",
      "Grinding = not working smarter",
    ],
    simpleExplanation:
      "7-8 hours = investment in better performance, not time wasted. Protect sleep.",
    microAction:
      "This week, prioritize 8 hours sleep for 3 nights. Track productivity difference.",
    timeToImplement: "Lifestyle change",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "wo-03",
    bookId: "work-discovery",
    bookTitle: "The Start-Up of You",
    author: "Reid Hoffman & Ben Casnocha",
    category: "work-purpose",
    principleId: "career-discovery-experimentation",
    principleTitle: "Career Discovery: Experiment Before Committing",
    description:
      "Your career isn't fixed. It's a series of experiments. Instead of paralyzed by 'what should I do?', run small experiments: Try a project in that field. Talk to people doing it. Volunteer. Take a class. Do a side project. Each experiment teaches you something without requiring total commitment. This is how you discover what actually fits, not what you think should fit.",
    coreConcept: "Careers are discovered through small experiments, not grand decisions",
    coreQuote: "Act your way into clarity, don't think your way into it.",
    applicableWhen: [
      "unsure about career direction",
      "paralyzed by indecision",
      "thinking about change but afraid",
      "don't know what you want",
      "exploring options",
    ],
    applicableScenarios: [
      "You want to change careers but don't know if it's right",
      "You have a hunch but no real experience",
      "You're scared to make a big leap",
      "You need to know before committing",
      "You have multiple interests but can't choose",
    ],
    simpleExplanation:
      "Don't try to figure out your perfect career in your head. That's impossible. Instead, run small experiments: read books, shadow someone, take a course, do a project. Each experiment answers one question. After 3-5 experiments, you'll know way more than thinking alone. You're discovering through doing, not predicting.",
    microAction:
      "Pick ONE experiment you can run this month (talk to someone, take a class, volunteer, side project). Run it. Learn. Then pick the next one.",
    timeToImplement: "Varies (depends on experiment)",
    energyLevel: "medium",
    difficulty: "easy",
    cautionsWhen: [
      "Experiments aren't failures, they're data",
      "You don't need certainty before starting",
    ],
    whyItMatters:
      "Thinking indefinitely leads nowhere. Small experiments lead to clarity.",
  },
  {
    id: "wo-04",
    bookId: "work-discovery",
    bookTitle: "The Start-Up of You",
    author: "Reid Hoffman & Ben Casnocha",
    category: "work-purpose",
    principleId: "fear-failure-reframe",
    principleTitle: "Fear of Failure: Reframe It as Information",
    description:
      "Fear of failure stops most people from trying. But failure is information, not judgment. When something doesn't work, it teaches you what doesn't fit. That's valuable. Every successful person has failed repeatedly. The difference: they reframed failure as 'that didn't work, so now I know...' instead of 'I failed, so I'm a failure.' Failure is a point in a trajectory, not an identity.",
    coreConcept: "Failure = data. It's only judgment if you make it one.",
    coreQuote: "You miss 100% of the shots you don't take.",
    applicableWhen: [
      "fear of failure preventing action",
      "perfectionism blocking change",
      "afraid of looking bad",
      "afraid of wasting time",
      "afraid things won't work out",
    ],
    applicableScenarios: [
      "You want to try something but 'what if it doesn't work?'",
      "You're scared to pursue a dream",
      "You won't start because you might fail",
      "You catastrophize: 'If this fails, I'll be stuck'",
      "You need guarantees before trying",
    ],
    simpleExplanation:
      "Failure is just feedback. Your brain treats it as judgment ('I'm bad'), but it's actually just 'that approach didn't work.' Separate the two: (1) Information: 'I tried X and learned Y', (2) Identity: 'I am still capable and worthy.' One is true. The other is a story. Start collecting failures as data points in your journey.",
    microAction:
      "List 3 past 'failures'. For each, write: 'I learned ___' (extract the information). Notice: you're still here, still capable.",
    timeToImplement: "15 minutes reflection",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Failure IS painful, and that's okay",
      "Feeling bad doesn't mean you're bad",
    ],
    whyItMatters:
      "Fear of failure kills more dreams than actual failure. Reframing fear as curiosity unlocks action.",
  },
  {
    id: "wo-05",
    bookId: "work-meaning",
    bookTitle: "Designing Your Life",
    author: "Bill Burnett & Dave Evans",
    category: "work-purpose",
    principleId: "uncertainty-opportunity-growth",
    principleTitle: "Uncertainty Is Not Your Enemy: It's Your Ally",
    description:
      "Most people treat uncertainty as something to eliminate. 'I'll feel better when I know.' But uncertainty is where possibility lives. If you're uncertain about your career, that means multiple futures are still open. Instead of fighting uncertainty, explore it. Ask: 'What if this worked? What if I tried X?' Uncertainty isn't a problem to solve. It's an open canvas to paint on.",
    coreConcept: "Uncertainty = freedom to explore, not threat to escape",
    coreQuote: "Certainty is boring. Uncertainty is where growth happens.",
    applicableWhen: [
      "anxious about not knowing",
      "uncomfortable with ambiguity",
      "wanting guarantees before moving",
      "stuck in analysis paralysis",
      "multiple possible futures",
    ],
    applicableScenarios: [
      "You could stay at your job or leave, but don't know which",
      "You have options but can't decide",
      "The 'right' answer isn't clear",
      "You want to wait until it's certain",
      "You're spending months thinking instead of acting",
    ],
    simpleExplanation:
      "Uncertainty feels bad because your brain wants predictability. But uncertainty is actually freedom. It means you're not locked into one path. Instead of fighting it ('I need to know!'), befriend it ('I'm free to explore'). Write down all the possible futures. What excites you? What scares you? That excitement and fear are your compass.",
    microAction:
      "Write: 3 possible career futures (even ones you think are unrealistic). For each, write: 'If this happened, I'd feel ___'. Notice which one activates you most.",
    timeToImplement: "20 minutes",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Uncertainty doesn't mean inaction—take small steps anyway",
      "You don't need perfect clarity before moving",
    ],
    whyItMatters:
      "People spend years stuck in uncertainty. Befriending it moves you forward.",
  },
  {
    id: "nw-01",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "work-purpose",
    principleId: "deep-work-blocks",
    principleTitle: "Deep Work: Protect Uninterrupted Blocks for What Matters",
    description:
      "Shallow work—email, meetings, notifications—fills the day and feels productive. Deep work—focused, cognitively demanding effort that creates new value—is what builds skill and career capital. Most knowledge jobs default to shallow unless you defend depth. That means scheduling blocks, turning off inputs, and accepting that busyness is not the same as impact.",
    coreConcept: "Depth produces rare value; shallow work is infinite",
    coreQuote: "Clarity about what matters is useless without clarity about what doesn't.",
    applicableWhen: [
      "constant interruptions at work",
      "busy all day but little to show for it",
      "hard to focus on hard projects",
      "meetings and email eat the calendar",
      "want to build skill or deliver quality work",
    ],
    applicableScenarios: [
      "You answer Slack all day and never touch the hard project",
      "You plan to write or code but the morning disappears to coordination",
      "Deep tasks keep sliding to 'later'",
      "You feel productive but aren't advancing what you care about",
    ],
    simpleExplanation:
      "Pick one daily or weekly block where you go offline and work on one hard thing only. Start small (60–90 minutes). Treat it like a meeting you can't miss.",
    microAction:
      "This week: block two 60-minute deep-work sessions on your calendar. No email or chat during the block. One concrete deliverable each time.",
    timeToImplement: "Ongoing",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Careers and crafts advance through sustained attention—not through being always available.",
  },
  {
    id: "nw-02",
    bookId: "so-good-they-cant-ignore-you",
    bookTitle: "So Good They Can't Ignore You",
    author: "Cal Newport",
    category: "work-purpose",
    principleId: "career-capital-rare-valuable",
    principleTitle: "Career Capital: Build Rare, Valuable Skills First",
    description:
      "Follow your passion is incomplete advice if you have no leverage. What creates fulfilling work is career capital: rare and valuable skills that you deliberately build. Passion often follows mastery and autonomy—not the reverse. Invest in becoming uniquely good at something the market values; then negotiate toward control and mission.",
    coreConcept: "Rare skill + proof > vague passion",
    applicableWhen: [
      "unsure which career path to pursue",
      "passion doesn't match income yet",
      "considering job change without clear leverage",
      "want more autonomy at work",
      "building a craft or freelance path",
    ],
    applicableScenarios: [
      "You want to pivot but have no differentiated skill yet",
      "You envy creative jobs but haven't built a portfolio",
      "You ask for flexibility before you've earned trust",
    ],
    simpleExplanation:
      "Name one capability that would make you harder to replace. Spend 5 hours this week practicing or shipping something that proves that skill.",
    microAction:
      "List skills you have vs. skills that are rare in your field. Pick one gap. One project or credential that closes it in the next 60 days.",
    timeToImplement: "1 hour planning + ongoing practice",
    energyLevel: "high",
    difficulty: "hard",
    whyItMatters:
      "Control and meaning usually come after you've built something employers or clients can't easily substitute.",
  },
  {
    id: "ep-01",
    bookId: "range",
    bookTitle: "Range",
    author: "David Epstein",
    category: "work-purpose",
    principleId: "breadth-before-specialization",
    principleTitle: "Sampling Matters: Breadth Before Late Specialization",
    description:
      "Many fulfilling paths aren't straight lines. Trying different domains builds analogies and adaptability—especially in creative and complex work. Early sampling isn't wasted time if you extract patterns and transfer skills. Don't confuse 'still exploring' with failure when you're gathering range.",
    coreConcept: "Match quality improves with informed sampling",
    applicableWhen: [
      "multiple interests",
      "worried you started too late",
      "career change after years in one field",
      "comparing yourself to early specialists",
      "exploring before committing",
    ],
    applicableScenarios: [
      "You fear you're behind peers who chose one lane early",
      "You want to combine fields but feel scattered",
      "You're mid-career and pivoting",
    ],
    simpleExplanation:
      "Write three things you've learned from different roles or hobbies. Pick one transferable skill and use it deliberately in your current goal this month.",
    microAction:
      "Schedule two conversations with people in adjacent fields. Ask what surprised them—harvest patterns, not just titles.",
    timeToImplement: "2–3 hours",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Innovation often comes from connecting worlds—range is an asset when you integrate it intentionally.",
  },
  {
    id: "tb-01",
    bookId: "thinking-in-bets",
    bookTitle: "Thinking in Bets",
    author: "Annie Duke",
    category: "work-purpose",
    principleId: "probabilistic-decisions",
    principleTitle: "Think in Bets: Separate Decisions from Outcomes",
    description:
      "Good decisions can have bad outcomes and vice versa. Judging yourself only by results discourages smart risk-taking. Reframe: Did I use a sound process given what I knew? What would I repeat? What probability would I assign next time? That mindset reduces all-or-nothing shame about career bets.",
    coreConcept: "Process quality ≠ single outcomes",
    applicableWhen: [
      "regret after a career gamble",
      "perfectionism about choosing the right path",
      "fear of reversible decisions",
      "evaluating whether to leave a job or take an offer",
    ],
    applicableScenarios: [
      "You took a risk that didn't pan out and blame your judgment",
      "You're frozen because no option feels certain",
    ],
    simpleExplanation:
      "Pick one past work decision. Write: what you knew then, what was uncertain, and what you'd decide again with the same information. Notice outcome bias.",
    microAction:
      "Before your next big work decision, write down three scenarios (good / OK / bad) with rough odds. Decide what you'll do in each—reduces panic when reality lands.",
    timeToImplement: "30 minutes",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Careers require bets under uncertainty; compassion for process keeps you moving.",
  },
  {
    id: "pk-01",
    bookId: "drive",
    bookTitle: "Drive",
    author: "Daniel Pink",
    category: "work-purpose",
    principleId: "motivation-autonomy-mastery-purpose",
    principleTitle: "Motivation 3.0: Autonomy, Mastery, Purpose",
    description:
      "External rewards alone rarely sustain complex creative work. Lasting motivation clusters around autonomy (some control over task, time, technique), mastery (getting better at something that matters), and purpose (connected to something larger than yourself). When work feels flat, often one of these is missing—not because you're lazy.",
    coreConcept: "Intrinsic drivers outperform carrots and sticks for knowledge work",
    applicableWhen: [
      "burnout despite good pay",
      "disengaged at work",
      "considering entrepreneurship or mission-driven move",
      "micromanagement draining you",
      "want sustainable motivation",
    ],
    applicableScenarios: [
      "Bonus didn't fix your dread of Mondays",
      "You're skilled but your work feels pointless",
      "More money didn't increase satisfaction",
    ],
    simpleExplanation:
      "Score your current role 1–10 on autonomy, mastery growth, and purpose. Pick the lowest score; one small change or conversation that improves it this month.",
    microAction:
      "Ask your manager for one autonomy experiment (e.g., owning a slice of a project) tied to a skill you want to grow.",
    timeToImplement: "1 conversation",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Aligning how you work with how motivation actually works prevents chronic resentment.",
  },
  {
    id: "lm-01",
    bookId: "the-practice",
    bookTitle: "The Practice",
    author: "Seth Godin",
    category: "work-purpose",
    principleId: "shipping-as-practice",
    principleTitle: "The Practice: Ship Work on Schedule, Not on Mood",
    description:
      "Creative or leadership work compounds through consistent practice, not inspiration. Professionals show up, produce volume, and edit toward quality. Waiting until you feel ready guarantees delay. Commitment to the practice—not confidence—is what moves careers.",
    coreConcept: "Consistency of output beats waiting for perfect clarity",
    applicableWhen: [
      "waiting for motivation to start",
      "perfectionism blocking shipping",
      "side project stalled",
      "creative or leadership goals",
    ],
    applicableScenarios: [
      "You rewrite the same deck instead of presenting",
      "Your portfolio has one piece from three years ago",
    ],
    simpleExplanation:
      "Define a minimum weekly deliverable (e.g., one post, one prototype touch, one stakeholder update). Hit it for four weeks regardless of quality judgment day-to-day.",
    microAction:
      "Put a recurring 2-hour 'ship block' on your calendar. Ship something small at the end of each block—no exceptions for 'not inspired.'",
    timeToImplement: "4 weeks trial",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Trust and opportunity follow visible, repeated proof—not intentions.",
  },
  {
    id: "swy-01",
    bookId: "start-with-why",
    bookTitle: "Start With Why",
    author: "Simon Sinek",
    category: "work-purpose",
    principleId: "clarify-why-before-what",
    principleTitle: "Start With Why: Purpose Drives Sustainable Effort",
    description:
      "When work choices are driven only by titles, pressure, or comparison, motivation collapses under stress. A clear why (what impact you care about) gives direction when plans change. Why is not a slogan; it is a decision filter for projects, teams, and opportunities.",
    coreConcept: "Purpose first, then strategy",
    applicableWhen: [
      "career feels successful but empty",
      "unclear direction",
      "burnout despite external progress",
      "multiple options and no conviction",
    ],
    applicableScenarios: [
      "You can do many things but don't know what is worth your energy",
      "You keep saying yes to opportunities that don't feel meaningful",
    ],
    simpleExplanation:
      "Write one sentence: 'The impact I want my work to create is ___.' Use it to reject one misaligned request this week.",
    microAction:
      "Before your next big decision, score each option 1-10 on alignment with your why. Choose the highest aligned option, not just the safest one.",
    timeToImplement: "20 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Without why, discipline feels forced; with why, hard work feels chosen.",
  },
  {
    id: "swy-02",
    bookId: "start-with-why",
    bookTitle: "Start With Why",
    author: "Simon Sinek",
    category: "work-purpose",
    principleId: "communicate-purpose-first",
    principleTitle: "Lead With Why in Communication",
    description:
      "People commit faster when they understand meaning before mechanics. In teams, pitches, and interviews, leading with purpose creates trust and coherence. If you jump straight to tasks and metrics, others may comply but not connect.",
    coreConcept: "Meaning before method increases buy-in",
    applicableWhen: [
      "hard to get team buy-in",
      "projects stall despite good plans",
      "interviewing or pitching",
      "managing change",
    ],
    applicableScenarios: [
      "Your team hears tasks but not the purpose behind them",
      "Stakeholders resist because they only see cost, not impact",
    ],
    simpleExplanation:
      "In your next update: 1 sentence on why this matters, then what to do, then how you'll do it.",
    microAction:
      "Rewrite one recurring meeting or status update using Why -> What -> How format for one week and note engagement changes.",
    timeToImplement: "1 week trial",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Clarity of purpose reduces friction, confusion, and passive resistance.",
  },
  {
    id: "gtd-01",
    bookId: "getting-things-done",
    bookTitle: "Getting Things Done",
    author: "David Allen",
    category: "work-purpose",
    principleId: "capture-open-loops",
    principleTitle: "Capture Everything: Your Brain Is for Thinking, Not Storage",
    description:
      "Mental clutter comes from open loops, not only workload. When tasks, worries, and commitments stay in your head, attention fragments and stress rises. A trusted capture system externalizes commitments so your mind can focus on execution.",
    coreConcept: "External system reduces cognitive load",
    applicableWhen: [
      "overwhelm from too many tasks",
      "forgetting commitments",
      "constant mental noise",
      "can't focus because of background stress",
    ],
    applicableScenarios: [
      "You keep remembering random tasks while trying to do deep work",
      "You feel busy all day but still miss key follow-ups",
    ],
    simpleExplanation:
      "Carry one inbox (app or notebook). Capture every task, idea, and commitment immediately.",
    microAction:
      "Do a 15-minute mind sweep now: write every open loop. Do not organize yet, just collect.",
    timeToImplement: "15 minutes + ongoing",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Clear headspace improves decision quality and follow-through.",
  },
  {
    id: "gtd-02",
    bookId: "getting-things-done",
    bookTitle: "Getting Things Done",
    author: "David Allen",
    category: "work-purpose",
    principleId: "next-action-clarity",
    principleTitle: "Next Action Thinking: Define the Very Next Physical Step",
    description:
      "Projects stall when tasks are vague ('work on proposal'). Progress starts when you define the next visible action ('draft opening paragraph'). Ambiguity creates avoidance; concrete next actions reduce resistance.",
    coreConcept: "Specific next steps defeat procrastination",
    applicableWhen: [
      "procrastination",
      "stuck projects",
      "avoidance of important work",
      "analysis paralysis",
    ],
    applicableScenarios: [
      "Big goals feel too heavy to start",
      "You postpone tasks because you don't know where to begin",
    ],
    simpleExplanation:
      "Convert every stuck item into one physical action that takes less than 20 minutes to begin.",
    microAction:
      "Pick one delayed project. Write: 'Next action is ___.' Start it for 10 minutes today.",
    timeToImplement: "10-20 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Motion begins when uncertainty is removed from the first step.",
  },
  {
    id: "gtd-03",
    bookId: "getting-things-done",
    bookTitle: "Getting Things Done",
    author: "David Allen",
    category: "work-purpose",
    principleId: "weekly-review-reset",
    principleTitle: "Weekly Review: Reset Before Chaos Compounds",
    description:
      "Systems decay without maintenance. A weekly review clears inboxes, updates project lists, and reconnects daily tasks to real priorities. This prevents drift into reactive firefighting and restores control.",
    coreConcept: "Regular review keeps execution aligned",
    applicableWhen: [
      "always reactive",
      "projects slipping silently",
      "unclear priorities by midweek",
      "task systems stop working after a few days",
    ],
    applicableScenarios: [
      "You work hard but miss deadlines because plans are outdated",
      "Your task app becomes a graveyard after a busy week",
    ],
    simpleExplanation:
      "Block one non-negotiable weekly review to clean, update, and re-prioritize your system.",
    microAction:
      "Schedule a 45-minute Friday review: clear inbox, update projects, choose top 3 outcomes for next week.",
    timeToImplement: "45 minutes weekly",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Consistent review turns productivity from bursts into a reliable system.",
  },
];

// ============================================================
// CATEGORY 4: SELF & IDENTITY
// ============================================================

const selfIdentityPrinciples: WisdomPrinciple[] = [
  // Mindset - Carol Dweck
  {
    id: "mnd-01",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "growth-mindset",
    principleTitle: "Growth Mindset: Abilities Develop Through Effort",
    description:
      "Fixed mindset: abilities are fixed (I'm not good at math). Growth mindset: abilities develop with effort (I'm not good at math YET). The mindset changes everything.",
    coreConcept: "YET is the most powerful word in learning",
    whyItMatters:
      "Fixed mindset = avoidance + stagnation. Growth mindset = challenge + progress.",
    applicableWhen: [
      "avoid challenges",
      "give up easily",
      "compare to others",
      "think you're 'not that person'",
      "limited self-belief",
      "stuck",
    ],
    applicableScenarios: [
      "'I'm not a writer' (yet). 'I'm not good with people' (yet). 'I can't do math' (yet).",
      "See others succeed, think 'that's just them', not 'they practiced'",
    ],
    simpleExplanation:
      "Replace 'I can't' with 'I can't YET.' Replace 'I failed' with 'I learned.'",
    microAction:
      "What skill do you think you lack? Reframe: 'I can't do this YET.' Take one small action on it.",
    timeToImplement: "Ongoing",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "mnd-02",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "effort-is-not-failure",
    principleTitle: "Effort is Not Failure: Struggle Means You're Growing",
    description:
      "Fixed mindset: struggle = not good at it. Growth mindset: struggle = skill developing. Same situation, different interpretation.",
    coreConcept: "Difficulty = learning zone, not failure zone",
    whyItMatters: "If struggle = failing, you'll avoid hard things. If struggle = growing, you'll seek them.",
    applicableWhen: [
      "avoid challenges",
      "think hard = bad",
      "quit when frustrated",
      "need everything easy",
      "low confidence",
    ],
    applicableScenarios: [
      "Task is hard, think 'I'm not good at this', quit",
      "See others struggle, judge them as incompetent",
      "Can't handle discomfort",
    ],
    simpleExplanation:
      "Hard = growing. Easy = not learning. Seek the hard things. Embrace struggle.",
    microAction:
      "Pick something moderately hard. Work on it for 15 minutes daily for 2 weeks. Notice the growth.",
    timeToImplement: "2 weeks practice",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "mnd-03",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "praising-process-not-trait",
    principleTitle: "Praise Process, Not Talent: 'You Worked Hard' > 'You're Smart'",
    description:
      "Talent praise creates pressure (have to stay smart). Process praise creates growth (work on improvement). This applies to yourself too.",
    coreConcept: "Praising effort > praising talent",
    whyItMatters:
      "Talent praise creates fixed mindset. Process praise creates growth mindset.",
    applicableWhen: [
      "perfectionist",
      "afraid of being exposed",
      "avoid challenges to protect image",
      "praise-seeking",
      "confidence fragile",
    ],
    applicableScenarios: [
      "'You're so smart' = pressure. 'You worked hard' = motivation",
      "Talent praise = afraid to fail and lose the label",
    ],
    simpleExplanation:
      "Praise effort: 'You worked hard.' 'You tried different approaches.' Not: 'You're smart.' Or say it to yourself.",
    microAction:
      "Notice how you praise yourself. Shift to process: 'I worked hard on that.' Not 'I'm talented at this.'",
    timeToImplement: "Ongoing",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "mnd-04",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "failure-feedback-not-identity",
    principleTitle: "Failure is Feedback, Not Identity",
    description:
      "Fixed: I failed = I am a failure. Growth: I failed = here's information. Same event, completely different meaning.",
    coreConcept: "Failure = data for growth, not definition of self",
    whyItMatters:
      "If failure defines you, you'll hide from it. If failure informs you, you'll learn from it.",
    applicableWhen: [
      "shame about failure",
      "can't bounce back",
      "perfectionist",
      "failure identity",
      "stuck in past mistakes",
    ],
    applicableScenarios: [
      "Failed project = 'I'm a failure' (identity) vs. 'This didn't work, what can I learn?' (data)",
      "Relationship ended = 'I'm unlovable' vs. 'What did I learn about myself?'",
    ],
    simpleExplanation:
      "Failing ≠ being a failure. Failed attempt = feedback. Use it. Move on.",
    microAction:
      "Recent failure: What's the data? What can you learn? Write it. Move on.",
    timeToImplement: "15-20 minutes reflection",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "mnd-05",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "love-of-learning",
    principleTitle: "Love of Learning: Growth Mindset is About Becoming",
    description:
      "Growth mindset isn't about being the best. It's about becoming better than you were. The journey, not the destination.",
    coreConcept: "Becoming > having. Learning > achieving.",
    whyItMatters:
      "Goals end. Learning is infinite. Growth-oriented people are more satisfied long-term.",
    applicableWhen: [
      "goal-dependent",
      "empty after achievement",
      "always chasing next",
      "can't enjoy the process",
      "restless",
    ],
    applicableScenarios: [
      "Achieved goal, felt empty",
      "Another goal appears, not satisfied",
      "Can't enjoy the learning",
    ],
    simpleExplanation:
      "Stop chasing endpoints. Start loving the process of becoming. That's lasting satisfaction.",
    microAction:
      "Pick a skill. Love learning it for 30 days. Not to be perfect, just to develop. Feel the difference.",
    timeToImplement: "Ongoing practice",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "mnd-06",
    bookId: "mindset",
    bookTitle: "Mindset",
    author: "Carol Dweck",
    category: "self-identity",
    principleId: "brain-plasticity",
    principleTitle: "Brain Plasticity: Your Brain Physically Changes with Use",
    description:
      "Your brain isn't fixed. With practice, neural connections strengthen. You literally rewire your brain through effort.",
    coreConcept: "Neurons that fire together wire together",
    whyItMatters:
      "This isn't motivational. It's biological. Your practice literally changes your brain structure.",
    applicableWhen: [
      "feel stuck",
      "think habits are permanent",
      "overwhelmed by change",
      "feel hopeless",
      "want to believe in growth",
    ],
    applicableScenarios: [
      "Learning new skill = rewiring brain",
      "Breaking habit = creating new neural pathways",
      "You're not broken, you're in process",
    ],
    simpleExplanation:
      "Practice a skill for weeks. Your brain physically changes. This is proven. You're literally building new capacity.",
    microAction:
      "Practice one skill daily for 4 weeks. Know you're rewiring your brain. Notice the change.",
    timeToImplement: "4 weeks daily practice",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "md-01",
    bookId: "self-identity",
    bookTitle: "The Values in Action Inventory",
    author: "Christopher Peterson & Martin Seligman",
    category: "self-identity",
    principleId: "values-clarification-authenticity",
    principleTitle: "Values: Know What Actually Matters to You (Not Society)",
    description:
      "Most people don't know their actual values. They have adopted values from parents, culture, social media ('I should want success, money, appearance'). But when you live by someone else's values, you're living someone else's life. Your real values (what matters to YOU when no one's watching) are your compass. Discovering them takes reflection. But once you know them—freedom. Suddenly decisions are easy: 'Does this align with my values?' Yes = pursue. No = release.",
    coreConcept: "Living by someone else's values = living their life, not yours",
    coreQuote: "The question isn't what do you want to do? It's who do you want to be?",
    applicableWhen: [
      "unclear about life direction",
      "living by shoulds",
      "feeling inauthentic",
      "decisions feel random",
      "empty despite achievement",
    ],
    applicableScenarios: [
      "You achieved the goal but don't feel fulfilled",
      "You're successful by society's standards but unhappy",
      "You don't know what you actually want",
      "You're living the life someone else chose",
      "Every choice feels exhausting",
    ],
    simpleExplanation:
      "Values are what matters to you. Safety, creativity, connection, growth, helping, excellence—different for each person. Yours might be: 'connection + growth'. Someone else's: 'independence + achievement.' Neither is right. When you live YOUR values, life clicks into place. When you live someone else's, you're always slightly off. Discovering yours: Write what you admire in others (often their values). Write your best day (hints to values). Write: 'I feel most myself when ___' (your values).",
    microAction:
      "Write 3 things you genuinely care about (not 'should' care about). Now: Are you living them? What could shift?",
    timeToImplement: "20 minutes reflection",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Family/society may challenge your values—that's expected",
      "Your values may shift over time—that's fine",
    ],
    whyItMatters:
      "Living by your values is the difference between existing and thriving.",
  },
  {
    id: "md-02",
    bookId: "self-identity",
    bookTitle: "Transitions: Making Sense of Life's Changes",
    author: "William Bridges",
    category: "self-identity",
    principleId: "identity-evolution-life-transitions",
    principleTitle: "Identity Evolution: You're Not the Same Person Annually",
    description:
      "Your identity changes. You're not the same person at 20, 30, 50. But most people cling to old identities ('I'm the ambitious one', 'I'm the caretaker') even when they no longer fit. This creates rigidity and suffering. Real wisdom: You are a work in progress. Who you were informed who you are. Who you are now can inform who you become. Let old identities go gracefully. Grieve the version of you that served you but is ending. Welcome the new version emerging. This cycle repeats your whole life.",
    coreConcept: "Identity evolution isn't crisis; it's maturation",
    coreQuote: "The butterfly is not broken because it's not a caterpillar anymore.",
    applicableWhen: [
      "life stage change (college, marriage, parenthood, retirement)",
      "identity no longer fits",
      "grieving past identity",
      "scared of who you're becoming",
      "role change (career, relationship, age)",
    ],
    applicableScenarios: [
      "You were 'the helper' but you're tired of that role",
      "You had your kids and thought: 'Wait, I don't want to do this'",
      "Retirement = loss of 'the hard worker' identity",
      "You're aging and struggling with 'not young anymore'",
      "You achieved the dream and realized it's not actually what you want",
    ],
    simpleExplanation:
      "Identity transitions hurt because you're losing part of yourself. That's real grief. But on the other side: freedom. The version of you that was needed (ambitious, caretaker, employee) can rest. A new version emerges. The task: mourn the old, welcome the new, integrate both into 'you got me here, now I'm going there.' This happens multiple times in a lifetime. Each time is an opportunity to become more whole.",
    microAction:
      "Reflect: 'Who was I 5 years ago? Who am I now? Who am I becoming?' Notice the grief + possibility.",
    timeToImplement: "30 minutes reflection",
    energyLevel: "medium",
    difficulty: "hard",
    cautionsWhen: [
      "Identity shifts can trigger anxiety—normal and temporary",
      "Your old identity still matters; you're not erasing it",
    ],
    whyItMatters:
      "Fighting identity evolution is like fighting time. Surrendering to it is how you age with grace.",
  },
  {
    id: "bb-01",
    bookId: "braving-the-wilderness",
    bookTitle: "Braving the Wilderness",
    author: "Brené Brown",
    category: "self-identity",
    principleId: "belonging-vs-fitting-in",
    principleTitle: "Belonging vs. Fitting In: True Belonging Doesn't Require Betraying Yourself",
    description:
      "Fitting in means adjusting who you are to be accepted. Belonging means being accepted for who you are—or finding people with whom your real self is welcome. Chronic editing of yourself creates loneliness even in crowds. Belonging sometimes requires tolerating discomfort of standing apart before you find true fit.",
    coreConcept: "Self-abandonment is the price of false belonging",
    applicableWhen: [
      "people-pleasing across contexts",
      "lonely despite social life",
      "afraid to voice real opinions",
      "changing yourself for each room you're in",
    ],
    applicableScenarios: [
      "You silence values at work or family to keep peace",
      "You envy people who seem 'themselves' everywhere",
    ],
    simpleExplanation:
      "Name one place this week where you'll voice a small truth (preference, boundary, opinion) that's kind and honest. Notice who responds with respect.",
    microAction:
      "Write one sentence: 'I belong when I ___' vs 'I fit in when I ___.' Compare. Pick one alignment experiment.",
    timeToImplement: "20 minutes reflection + 1 action",
    energyLevel: "medium",
    difficulty: "hard",
    whyItMatters:
      "Long-term wellbeing tracks belonging to self first—then chosen communities.",
  },
  {
    id: "sg-01",
    bookId: "flourish",
    bookTitle: "Flourish",
    author: "Martin Seligman",
    category: "self-identity",
    principleId: "perma-wellbeing",
    principleTitle: "PERMA: Well-Being Has Five Pillars",
    description:
      "Lasting life satisfaction isn't only mood. Seligman's PERMA model: Positive emotion, Engagement (flow), Relationships, Meaning, Accomplishment. Weakness in one area can drag the whole felt sense of life—even if one pillar looks great on paper. Naming which pillar is thin helps targeted action.",
    coreConcept: "Fix the bottleneck pillar, not generic 'happiness'",
    applicableWhen: [
      "successful but empty",
      "can't pinpoint what's missing",
      "recovery from burnout",
      "life audit season",
    ],
    applicableScenarios: [
      "Career strong but relationships hollow",
      "Happy moments but no sense of meaning",
    ],
    simpleExplanation:
      "Score 1–10 each: mood, flow activities, relationships, meaning, accomplishment. Lowest score gets one experiment this month.",
    microAction:
      "Pick your lowest PERMA pillar. One scheduled activity this week that feeds only that pillar (coffee with a friend, volunteer hour, focused hobby block).",
    timeToImplement: "30 minutes audit",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Targeting dimension-specific gaps beats vague 'try to be happier.'",
  },
  {
    id: "cr-01",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "self-identity",
    principleId: "identity-based-change",
    principleTitle: "Identity Vote: Each Action Is a Vote for Who You're Becoming",
    description:
      "Goals are outcomes; identity is direction. Every small behavior is a vote for 'I'm the kind of person who…' Voting matters more than occasional heroics—two misses don't erase you, but patterns accumulate. Useful when changing habits tied to self-concept.",
    coreConcept: "Behavior change sticks when it matches who you believe you are",
    applicableWhen: [
      "starting habits that feel 'not me'",
      "relapsing after identity slip",
      "want change without self-punishment framing",
    ],
    applicableScenarios: [
      "You miss the gym once and declare you're lazy",
      "You want to be 'a reader' but don't read",
    ],
    simpleExplanation:
      "Finish: 'I'm someone who ___' with one trait. Today, cast two tiny votes for it (5 minutes counts).",
    microAction:
      "Track votes for 7 days: each evening check—did I cast at least one vote for the identity I want? No shame tally, just data.",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Identity framing turns streak breaks into noise instead of verdicts.",
  },
  {
    id: "alc-01",
    bookId: "the-alchemist",
    bookTitle: "The Alchemist",
    author: "Paulo Coelho",
    category: "self-identity",
    principleId: "personal-legend-direction",
    principleTitle: "Personal Legend: Follow the Truer Pull, Not Only the Safe Path",
    description:
      "Identity confusion often comes from living by expectations instead of inner direction. Your 'personal legend' is not fantasy—it is the deeper path that keeps returning despite fear. You do not need a dramatic life reset; you need steady alignment with what feels alive and meaningful.",
    coreConcept: "Repeated inner pull is data, not noise",
    applicableWhen: [
      "feeling successful but off-track",
      "living by others' expectations",
      "avoiding what you really want",
      "identity drift",
    ],
    applicableScenarios: [
      "You keep postponing the same meaningful goal",
      "You perform well but feel disconnected from yourself",
    ],
    simpleExplanation:
      "Ask: 'What desire has followed me for years?' Give it one concrete hour this week—no grand promises, just movement.",
    microAction:
      "Write two lists: 'Expected life' and 'Alive life.' Choose one small step from the Alive list and schedule it this week.",
    timeToImplement: "30 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Alignment grows identity clarity; chronic self-betrayal creates numbness.",
  },
  {
    id: "msm-01",
    bookId: "mans-search-for-meaning",
    bookTitle: "Man's Search for Meaning",
    author: "Viktor Frankl",
    category: "self-identity",
    principleId: "meaning-through-responsibility",
    principleTitle: "Meaning Through Responsibility: Choose Your Stance",
    description:
      "When pain, uncertainty, or limits cannot be removed immediately, identity strengthens through chosen response. Meaning is often discovered in responsibility: how you face difficulty, what you serve, and how you carry suffering without collapsing into cynicism.",
    coreConcept: "You may not choose conditions, but you can choose stance",
    applicableWhen: [
      "identity crisis during hardship",
      "hopelessness",
      "feeling life is pointless",
      "stuck in 'why me' loops",
    ],
    applicableScenarios: [
      "A painful season makes you question who you are",
      "You feel powerless and disconnected from purpose",
    ],
    simpleExplanation:
      "Ask daily: 'What is life asking of me today?' Pick one meaningful responsibility and complete it with care.",
    microAction:
      "For 7 days, end your day with one line: 'Today I honored meaning by ___.'",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Meaning stabilizes identity when certainty and comfort are unavailable.",
  },
  {
    id: "us-01",
    bookId: "untethered-soul",
    bookTitle: "The Untethered Soul",
    author: "Michael A. Singer",
    category: "self-identity",
    principleId: "witness-consciousness",
    principleTitle: "You Are the Witness, Not the Mental Noise",
    description:
      "Thought loops, inner criticism, and emotional spikes feel like identity because they are loud and repetitive. A deeper practice is to notice them as events in awareness, not as self-definition. This creates space between trigger and reaction.",
    coreConcept: "Awareness observes thoughts; it is not trapped inside them",
    applicableWhen: [
      "overthinking",
      "inner critic dominance",
      "identity fused with mood",
      "reactive spirals",
    ],
    applicableScenarios: [
      "You believe every harsh thought as truth",
      "One bad emotion defines your whole day",
    ],
    simpleExplanation:
      "When a harsh thought appears, say: 'I am noticing a thought that ___.' That phrasing creates healthy distance.",
    microAction:
      "Set two 60-second pauses daily: notice thoughts, label them, and return to your body or breath.",
    timeToImplement: "2 minutes daily",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Distance from mental noise makes identity more stable and less fear-driven.",
  },
  {
    id: "pn-01",
    bookId: "power-of-now",
    bookTitle: "The Power of Now",
    author: "Eckhart Tolle",
    category: "self-identity",
    principleId: "present-identity-grounding",
    principleTitle: "Presence Interrupts Ego Loops About Past and Future",
    description:
      "Identity pain often lives in mental time travel: regret from the past, fear from the future. Present-moment grounding does not erase responsibility; it restores agency by reducing narrative overwhelm and bringing you back to what can be done now.",
    coreConcept: "Presence reduces identity distortion from rumination",
    applicableWhen: [
      "rumination",
      "future anxiety",
      "past shame",
      "can't settle nervous system",
    ],
    applicableScenarios: [
      "You replay old mistakes as proof of who you are",
      "You forecast worst-case futures and freeze",
    ],
    simpleExplanation:
      "Use a 5-4-3-2-1 sensory reset or three slow breaths to return to now before making identity conclusions.",
    microAction:
      "Each time you catch 'always/never' self-talk, pause and name 3 things you can sense right now.",
    timeToImplement: "Under 1 minute",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Most self-judgment weakens when you return to the present moment.",
  },
  {
    id: "gi-01",
    bookId: "gifts-of-imperfection",
    bookTitle: "The Gifts of Imperfection",
    author: "Brené Brown",
    category: "self-identity",
    principleId: "authenticity-over-approval",
    principleTitle: "Authenticity Over Approval: Belonging Starts With Self-Acceptance",
    description:
      "Perfectionism and people-pleasing promise safety but produce disconnection from self. Wholehearted living means accepting imperfection, practicing self-compassion, and choosing values over image management.",
    coreConcept: "Worthiness is practiced, not earned through performance",
    applicableWhen: [
      "perfectionism",
      "approval addiction",
      "shame after mistakes",
      "fear of being seen",
    ],
    applicableScenarios: [
      "You edit yourself to avoid criticism",
      "You feel lovable only when productive or polished",
    ],
    simpleExplanation:
      "Replace one perfection-driven behavior with a values-driven one this week, even if it feels vulnerable.",
    microAction:
      "Write: 'If I believed I was already worthy, I would ___ today.' Do that one action.",
    timeToImplement: "10-20 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Authenticity grows durable identity; perfectionism keeps identity fragile.",
  },
  {
    id: "gi-02",
    bookId: "gifts-of-imperfection",
    bookTitle: "The Gifts of Imperfection",
    author: "Brené Brown",
    category: "self-identity",
    principleId: "self-compassion-shame-resilience",
    principleTitle: "Shame Resilience: Name It, Normalize It, Move With It",
    description:
      "Shame says 'I am bad' and drives hiding, numbing, or over-performing. Resilience begins by naming shame, sharing with safe people, and answering it with self-compassion instead of self-attack.",
    coreConcept: "Shame shrinks in language and connection",
    applicableWhen: [
      "shame spiral",
      "withdrawal after mistakes",
      "harsh self-talk",
      "fear of judgment",
    ],
    applicableScenarios: [
      "After a setback you hide and isolate",
      "You punish yourself to avoid feeling exposed",
    ],
    simpleExplanation:
      "Use the sequence: notice shame -> name it -> reality-check with a trusted person -> choose one kind next step.",
    microAction:
      "Create a 3-line shame script for the next spiral: 'I feel shame because ___. This is human. My next kind action is ___.'",
    timeToImplement: "5 minutes",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Shame resilience protects identity from collapsing after imperfection.",
  },
];

// ============================================================
// CATEGORY 5: HABITS & LIFESTYLE
// ============================================================

const habitsLifestylePrinciples: WisdomPrinciple[] = [
  // Atomic Habits - James Clear
  {
    id: "ah-01",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "small-changes-compound",
    principleTitle: "Atomic Habits: Small Changes Compound Exponentially",
    description:
      "1% better daily = 37x better yearly. 1% worse daily = nearly 0 yearly. Tiny changes seem insignificant until you realize they're not.",
    coreConcept: "Consistency > intensity. Small > zero.",
    whyItMatters:
      "Big changes feel impossible. Tiny changes feel easy. Tiny consistent changes create massive results.",
    applicableWhen: [
      "want big change",
      "overwhelmed",
      "need motivation",
      "all-or-nothing",
      "unsustainable changes",
    ],
    applicableScenarios: [
      "Can't commit to 1 hour gym, so do nothing. Try 2 min push-ups instead.",
      "Can't write a book, write 100 words daily",
      "Can't meditate 30 min, meditate 1 min",
    ],
    simpleExplanation:
      "Start tiny. Build consistency. Watch the exponential curve later.",
    microAction:
      "Pick a habit you want. Make it 2% of your goal (not 100%). Do it daily for 2 weeks.",
    timeToImplement: "Ongoing, tiny time",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ah-02",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "habit-stacking",
    principleTitle: "Habit Stacking: Anchor New Habits to Existing Ones",
    description:
      "New habits fail because they're isolated. Stack them to existing habits: After coffee (existing), I do 5 push-ups (new).",
    coreConcept: "New habit + established routine = success",
    whyItMatters: "Existing habits are automatic. New habits need scaffolding. Stack them.",
    applicableWhen: [
      "can't build habit",
      "forget new habit",
      "new habit feels unnatural",
      "habit fails after week",
      "no routine",
    ],
    applicableScenarios: [
      "After coffee: 5 push-ups",
      "Before bed: journaling",
      "After lunch: 10-minute walk",
    ],
    simpleExplanation:
      "Find an existing routine. Add your new habit right after/before. Anchor it.",
    microAction:
      "Pick new habit. Find existing routine. Stack it. Do this daily for 2 weeks.",
    timeToImplement: "2 weeks",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ah-03",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "identity-shifts-behavior",
    principleTitle: "Identity-Based Habits: Become Who You Want to Be",
    description:
      "Outcome-based: 'I want to be fit.' Identity-based: 'I am a fit person.' Identity drives sustainable behavior change.",
    coreConcept: "Identity > goal for lasting change",
    whyItMatters:
      "Goals end. Identity lasts. If you're 'a fit person', you go to the gym. If it's just a goal, you quit.",
    applicableWhen: [
      "habit fails after achieving goal",
      "can't sustain behavior change",
      "motivation fades",
      "short-term change only",
      "yo-yo cycling",
    ],
    applicableScenarios: [
      "'I want to be fit' (goal ends) vs. 'I am a fit person' (identity lasts)",
      "'I should write' vs. 'I am a writer'",
      "'I want to exercise' vs. 'I am someone who moves daily'",
    ],
    simpleExplanation:
      "What identity do you want? Then: what does that person do? Do it to become them.",
    microAction:
      "Write the identity: 'I am a [person who...].' What does that person do daily? Do it.",
    timeToImplement: "Ongoing",
    energyLevel: "medium",
    difficulty: "hard",
  },
  {
    id: "ah-04",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "environment-shapes-behavior",
    principleTitle: "Environment is Destiny: Design Your Space for Success",
    description:
      "You're not weak, your environment is wrong. Remove friction from good habits. Add friction to bad ones.",
    coreConcept: "Environment > willpower",
    whyItMatters: "Willpower fails. Environment wins. Design your world.",
    applicableWhen: [
      "willpower dependent",
      "unhealthy choices easy",
      "good choices hard",
      "fighting environment",
      "struggling with consistency",
    ],
    applicableScenarios: [
      "Junk food visible = eat junk. Hidden = don't",
      "Phone on table = distracted. In other room = focused",
      "Running shoes visible = go running. Hidden = stay sedentary",
    ],
    simpleExplanation:
      "Good habit hard? Remove friction (lay clothes out). Bad habit easy? Add friction (delete app).",
    microAction:
      "Good habit: reduce friction by 1 step (prep the night before). Bad habit: increase friction by 1 step.",
    timeToImplement: "30 minutes setup",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ah-05",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "habit-loop-mastery",
    principleTitle: "The Habit Loop: Cue, Routine, Reward (Understand Your Triggers)",
    description:
      "Habits have structure: Cue (trigger) → Routine (behavior) → Reward (payoff). Change the routine, keep cue and reward.",
    coreConcept: "Understanding the loop lets you modify it",
    whyItMatters:
      "You can't eliminate cues. But you can change the routine and/or reward.",
    applicableWhen: [
      "bad habit looping",
      "don't understand triggers",
      "habit feels automatic",
      "can't break cycle",
      "nervous system driven",
    ],
    applicableScenarios: [
      "Stress (cue) → eat junk (routine) → feel better (reward). Keep cue/reward, change routine to: exercise",
      "Bored (cue) → doom scroll (routine) → entertainment (reward). Change to: call friend",
    ],
    simpleExplanation:
      "What triggers your bad habit? What reward do you get? Find a new routine that gives same reward.",
    microAction:
      "Bad habit: Write cue, routine, reward. Find new routine with same reward. Try for 1 week.",
    timeToImplement: "1-2 weeks",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "ah-06",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "progress-tracking-motivation",
    principleTitle: "Tracking: What Gets Measured Gets Managed",
    description:
      "Visible progress = motivation. Tracking doesn't have to be fancy (✓ on calendar works). See the chain grow.",
    coreConcept: "Measuring = motivation",
    whyItMatters: "Progress is invisible until you track it. Tracking makes it visible.",
    applicableWhen: [
      "low motivation",
      "can't see progress",
      "unsustainable",
      "habit lacks feedback",
      "unclear if it's working",
    ],
    applicableScenarios: [
      "Exercise without tracking = feels pointless",
      "Check mark daily = satisfying, keeps going",
      "Data shows progress = motivating",
    ],
    simpleExplanation:
      "Track daily (any method). See the chain grow. Don't break it.",
    microAction:
      "Pick habit. Track it daily (checkmark calendar, app, spreadsheet). Do for 30 days.",
    timeToImplement: "30 days tracking",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "ah-07",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "two-day-rule-consistency",
    principleTitle: "Starting From Zero: The Two-Day Rule",
    description:
      "Most habit failures happen not on day 1 (you start strong), but on day 3 when motivation fades. The Two-Day Rule: Never miss twice. Miss a day? Okay. Miss twice? The pattern is broken. This removes perfectionism. You're not aiming for 100% consistency (impossible). You're aiming for: Show up most days. When you miss, get back the next day. This is how habits actually form: imperfect consistency, not perfect performance.",
    coreConcept: "Habits form through imperfect persistence, not perfect compliance",
    coreQuote: "You don't need to be perfect. You need to be consistent.",
    applicableWhen: [
      "starting a new habit",
      "perfectionism blocking action",
      "all-or-nothing thinking",
      "motivation not sustaining",
      "expecting 100% compliance",
    ],
    applicableScenarios: [
      "You start strong then miss a day and quit the whole thing",
      "You expect to exercise 7 days/week, miss one, give up",
      "You start meditation, miss day 3, think 'I'm not someone who meditates'",
      "You try to change overnight and crash",
      "You need permission to be imperfect at habit-building",
    ],
    simpleExplanation:
      "Habits work through repetition, not perfection. Your brain needs the pattern repeated: cue → response → reward. If you miss a day, that's life. If you miss twice, the pattern breaks. The rule: Never let it become 'I don't do this' through two misses. One miss = speed bump. Two misses = identity shift (bad). The strategy: Make the habit so small you can't fail (walk 5 min, not 30 min). That way, motivation doesn't matter. Just show up.",
    microAction:
      "Pick ONE habit. Commit to 66 days minimum (the research timeframe). Missing is okay. Missing twice in a row: restart counter. That's it.",
    timeToImplement: "Varies",
    energyLevel: "medium",
    difficulty: "medium",
    cautionsWhen: [
      "Two-day rule means discipline, not punishment",
      "If you miss frequently, habit might be too ambitious",
    ],
    whyItMatters:
      "Perfectionism kills habits. Permission to be imperfect builds them.",
  },
  {
    id: "ah-08",
    bookId: "atomic-habits",
    bookTitle: "Atomic Habits",
    author: "James Clear",
    category: "habits-lifestyle",
    principleId: "energy-management-adaptation",
    principleTitle: "Energy Management: Same Habits, Different Seasons",
    description:
      "You're not lazy. You're just operating with different energy in different seasons. Winter, stress, grief, illness, hormonal cycles—all shift your available energy. Instead of fighting it ('I should exercise even though I have no energy'), work with it. Winter = movement practice, not performance. Stress = breathing, not optimization. Illness = rest, not guilt. Grief = gentle movement, not pushing. The wisdom: Your habits flex with your life. The core stays (move, eat well, sleep), but the intensity shifts. This is how you sustain habits long-term.",
    coreConcept: "Habits adapt with seasons; they're not one-size-fits-all",
    coreQuote: "Wisdom is adjusting your approach to your current reality.",
    applicableWhen: [
      "seasonal energy shifts",
      "life stress changing capacity",
      "guilt about reduced habits",
      "stuck in rigid routines",
      "burnout from unsustainable habits",
    ],
    applicableScenarios: [
      "Winter hits and you're depressed about not running; walk instead",
      "Big project at work; you reduce gym from 5x to 2x and feel guilty",
      "Grieving someone; you can barely get out of bed, but 10-min walk helps",
      "Hormonal shifts; your energy changes monthly and you fight it",
      "You expect same output year-round despite changing seasons/life",
    ],
    simpleExplanation:
      "Habits aren't rigid. They're containers that adapt. The habit: 'I move daily.' In summer: 45 min runs. In winter: 15 min walks. Both are moving. Both count. The habit: 'I eat well.' In summer: salads. In winter: warm foods. Both are nourishment. Same habit, different expression. This removes guilt and keeps you connected to the practice even when life shifts. You're working WITH your system, not against it.",
    microAction:
      "Map your current season (energy level, stress, hormones, weather). Adjust ONE habit to match your season (not abandon it). Notice ease increases.",
    timeToImplement: "10 minutes planning",
    energyLevel: "low",
    difficulty: "easy",
    cautionsWhen: [
      "Flexible doesn't mean excuse to stop—still show up, just adapted",
      "Notice patterns; some seasons are consistently harder",
    ],
    whyItMatters:
      "Rigid habits break. Flexible ones sustain. Longevity beats intensity.",
  },
  {
    id: "tf-01",
    bookId: "tiny-habits",
    bookTitle: "Tiny Habits",
    author: "BJ Fogg",
    category: "habits-lifestyle",
    principleId: "anchor-habit-stack",
    principleTitle: "Tiny Habits: Anchor New Behavior to an Existing Routine",
    description:
      "Motivation spikes and crashes; anchors are steady. After I [existing habit], I will [tiny new habit]. Keep the new behavior so small it's almost silly—seconds, not hours. Success breeds expansion; shame from oversized goals kills repetition.",
    coreConcept: "Design for easy wins, then grow",
    applicableWhen: [
      "failed big resolutions",
      "want new habit without willpower roulette",
      "starting exercise, journaling, flossing",
    ],
    applicableScenarios: [
      "You've tried '30 minutes meditation' and quit repeatedly",
      "Morning routines collapse when life gets busy",
    ],
    simpleExplanation:
      "Pick anchor (after coffee, after bathroom, after shoes off). Pair 30-second version of goal habit. Celebrate immediately (fist pump, smile)—Fogg's reinforcement.",
    microAction:
      "Write one ABC: After I ___, I will ___, for ___ seconds. Do it daily for 7 days—no enlarging until it's automatic.",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Chains that start tiny survive long enough to rewrite identity.",
  },
  {
    id: "sw-01",
    bookId: "why-we-sleep",
    bookTitle: "Why We Sleep",
    author: "Matthew Walker",
    category: "habits-lifestyle",
    principleId: "sleep-regularity-consistency",
    principleTitle: "Sleep Regularity Beats Weekend Catch-Up",
    description:
      "Sleep isn't only duration—timing and consistency matter for mood, memory, and impulse control. Wildly shifting bed/wake times confuse circadian rhythms. Anchoring wake time (even when tired) often stabilizes the whole arc more than sporadic marathon sleeps.",
    coreConcept: "Consistent schedule > occasional perfect nights",
    applicableWhen: [
      "social jetlag weekdays vs weekends",
      "insomnia anxiety",
      "relying on caffeine and naps unpredictably",
      "mood and focus swings",
    ],
    applicableScenarios: [
      "Sleep 6 hours weeknights then 12 Saturday",
      "Brain fog despite 'enough' hours sometimes",
    ],
    simpleExplanation:
      "Pick fixed wake time for 14 days (+/- 30 min). Light first thing; heavy meals and screens earlier before bed incrementally.",
    microAction:
      "Set one alarm time for every day—including weekends. Wind-down alarm 45 minutes before bed 5 nights this week.",
    timeToImplement: "14-day experiment",
    energyLevel: "medium",
    difficulty: "medium",
    cautionsWhen: [
      "Clinical sleep disorders deserve medical evaluation",
    ],
    whyItMatters:
      "Sleep is foundational infrastructure—everything else compounds from it.",
  },
  {
    id: "dm-01",
    bookId: "digital-minimalism",
    bookTitle: "Digital Minimalism",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "intentional-phone-use",
    principleTitle: "Digital Minimalism: Schedule Technology, Don't Fight It Forever",
    description:
      "Willpower against every app fails long-term. Minimalism means choosing supported values (focus, presence, creativity) and batching/distancing tech that dilutes them. Substitute missing rewards with richer offline anchors instead of raw abstinence.",
    coreConcept: "Technology serves values you name explicitly",
    applicableWhen: [
      "hourly compulsive checking",
      "attention shredded by notifications",
      "want presence without constant discipline battles",
    ],
    applicableScenarios: [
      "Phone is first and last thing daily",
      "Work bleeds into evenings through Slack/email",
    ],
    simpleExplanation:
      "List top 3 values this month. For each, one tech rule (e.g., no phone in bedroom, batch social at lunch only). Review weekly.",
    microAction:
      "Remove one social app from phone for 7 days (use desktop if needed). Replace scroll slot with 10-minute walk or paper book.",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Defaults beat intentions—environment design wins over streak-of-strength.",
  },
  {
    id: "ey-01",
    bookId: "indistractable",
    bookTitle: "Indistractable",
    author: "Nir Eyal",
    category: "habits-lifestyle",
    principleId: "traction-vs-distraction",
    principleTitle: "Traction vs. Distraction: Match Internal Triggers",
    description:
      "Distraction moves you away from what you intend; traction moves you toward it. Many escapes are emotional regulation—boredom, anxiety, loneliness. Noting the internal trigger before reaching for the phone builds choice. Timeboxing focused work + scheduled distraction reduces guilt loops.",
    coreConcept: "Name the discomfort, then choose",
    applicableWhen: [
      "procrastination cycles",
      "shame about screen time",
      "avoiding hard tasks with micro-diversions",
    ],
    applicableScenarios: [
      "Open laptop; twenty minutes later still in feeds",
      "Can't start until 'just checking' something",
    ],
    simpleExplanation:
      "When you catch distraction mid-flight: pause—what feeling am I escaping? Label it. Then 10-minute timer on intended task.",
    microAction:
      "Keep a sticky: last three distractions—what emotion preceded each? Once daily for a week.",
    timeToImplement: "1 week awareness",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Self-control isn't infinite—understanding triggers lets you plan traction.",
  },

  // The 7 Habits of Highly Effective People — Stephen Covey (paraphrased principles)
  {
    id: "syh-01",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "be-proactive",
    principleTitle: "Be Proactive: Choose Your Response",
    description:
      "Between what happens and what you do lies a gap—your freedom. Proactive people act from values and commitment, not only mood or conditions. Reactive living blames circumstance; proactive living expands what you can influence (your behavior, preparation, boundaries) while accepting what you cannot.",
    coreConcept: "Focus energy on influence, not helpless complaint",
    whyItMatters:
      "Habit change stalls when everything feels outside your control. Naming one lever you actually hold restores agency.",
    applicableWhen: [
      "victim mindset",
      "blaming circumstances",
      "waiting for motivation",
      "everything feels forced",
      "giving up after setbacks",
    ],
    applicableScenarios: [
      "Skipping workouts because schedule is chaotic",
      "Late nights blamed entirely on phone, never on bedtime choice",
      "Skipping meal prep because others don't help",
    ],
    simpleExplanation:
      "Catch one reactive sentence this week ('I can't because…'). Rewrite as: 'I choose ___ given my constraint.' Pick one tiny action anyway.",
    microAction:
      "Tonight: note one habit slip. Separate facts from story. Write one proactive next step you can take within 24 hours.",
    timeToImplement: "10 minutes reflection",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "syh-02",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "begin-with-end-in-mind",
    principleTitle: "Begin With the End in Mind: Align Daily Habits With Values",
    description:
      "Clarity about who you want to be and what matters changes which habits feel worth defending. Without a destination, every distraction wins. With one—health, presence, craft—you can judge tradeoffs (evening scroll vs sleep) against that picture.",
    coreConcept: "Identity and values steer behavior more than willpower",
    applicableWhen: [
      "unclear priorities",
      "conflicting goals",
      "every habit feels optional",
      "why bother moments",
    ],
    applicableScenarios: [
      "Scrolling because no compelling reason to stop",
      "Exercise feels pointless without a north star",
    ],
    simpleExplanation:
      "Finish: 'In twelve months I want to trust myself about ___.' Pick one habit that visibly serves that sentence.",
    microAction:
      "Write a one-line personal mission for health this quarter. Tape it where you slip (nightstand, fridge). Read before evening routine.",
    timeToImplement: "15 minutes once",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "syh-03",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "first-things-first",
    principleTitle: "Put First Things First: Protect Important, Not-Just-Urgent",
    description:
      "Quadrant I (urgent+important) screams; Quadrant IV (neither) seduces. Quadrant II—important preparation, relationships, health, deep work—builds life quality but doesn't nag. Scheduling movement, sleep, planning before inboxes fills the calendar with what you'd regret skipping.",
    coreConcept: "Schedule priorities or others' urgencies consume you",
    applicableWhen: [
      "always busy",
      "health deferred",
      "planning others first",
      "no time for basics",
    ],
    applicableScenarios: [
      "Exercise only when crisis hits",
      "Sleep sacrificed for email",
    ],
    simpleExplanation:
      "Block two non-negotiable Quadrant II slots this week (movement, cooking, sleep wind-down). Treat like fixed meetings.",
    microAction:
      "Calendar 3×30-minute blocks labeled 'health non-negotiable.' Decline one optional demand that would erase them.",
    timeToImplement: "20 minutes scheduling",
    energyLevel: "low",
    difficulty: "medium",
  },
  {
    id: "syh-04",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "think-win-win",
    principleTitle: "Think Win-Win: Agreements That Sustain Habits",
    description:
      "Lasting habit change often involves households and workplaces. Win-win means seeking outcomes where your sleep, boundaries, or food choices aren't secretly resentful bargains. Negotiate support and tradeoffs instead of secretly bending until you explode or quit.",
    coreConcept: "Mutual benefit beats silent martyrdom or dominance",
    applicableWhen: [
      "family pushes against new routines",
      "habits cause conflict",
      "people-pleasing",
      "resentment about sacrifice",
    ],
    applicableScenarios: [
      "Partner expects late screens together",
      "Kids resist earlier dinner",
      "Coworkers interrupt protected focus blocks",
    ],
    simpleExplanation:
      "Name one habit tension with someone close. Ask: 'What would make this workable for both of us?' Propose one concrete swap.",
    microAction:
      "Schedule a 15-minute conversation: share your health goal and invite their constraint—write one shared agreement.",
    timeToImplement: "30 minutes",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "syh-05",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "seek-first-to-understand",
    principleTitle: "Seek First to Understand: Listen Before Fixing",
    description:
      "People resist advice until they feel heard. Whether coaching yourself through resistance or asking someone for accountability, empathy lowers defensiveness. Reflect back the emotion before offering solutions—your inner critic included.",
    coreConcept: "Understanding builds safety; premature fixing triggers resistance",
    applicableWhen: [
      "support systems clash",
      "accountability feels judgmental",
      "self-talk is harsh",
      "teen or partner shuts down",
    ],
    applicableScenarios: [
      "You lecture yourself after a binge instead of asking what drove it",
      "Friend offers tips before acknowledging how hard it is",
    ],
    simpleExplanation:
      "After a slip: two sentences of validation ('That was rough because…') before any plan for tomorrow.",
    microAction:
      "Journal one habit struggle using only empathic phrases first; second half page = one adjustment.",
    timeToImplement: "15 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "syh-06",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "synergize",
    principleTitle: "Synergize: Combine Strengths for Better Systems",
    description:
      "Creative cooperation beats compromise when both parties bring different gifts—one plans meals, other shops; one walks mornings, other handles kids. Synergy builds environments where good habits are easier together than alone.",
    coreConcept: "1+1 > 2 when differences become complementary",
    applicableWhen: [
      "solo willpower exhausted",
      "household routines clash",
      "want creative partnership",
    ],
    applicableScenarios: [
      "Both want health but different schedules",
      "Roommate chaos undermines cooking",
    ],
    simpleExplanation:
      "Identify one habit where someone else's strength could pair with yours. Propose a split that uses both.",
    microAction:
      "Co-design one weekly rhythm (food, movement, or sleep) with a household member—write it on the fridge.",
    timeToImplement: "45 minutes",
    energyLevel: "medium",
    difficulty: "medium",
  },
  {
    id: "syh-07",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "sharpen-the-saw",
    principleTitle: "Sharpen the Saw: Renew Body, Mind, Heart, Spirit",
    description:
      "Sustainable productivity isn't grinding harder—it's preserving the asset (you). Physical renewal (sleep, movement), mental (learning, reflection), social/emotional (connection), and spiritual (meaning, nature, values) refill the tank bad habits drain.",
    coreConcept: "Maintain the machine that produces results",
    applicableWhen: [
      "burnout",
      "all discipline no recovery",
      "habits feel punitive",
      "running on empty",
    ],
    applicableScenarios: [
      "Training hard with no rest days",
      "Dieting with zero joy or social meals",
    ],
    simpleExplanation:
      "Score renewal in four areas 1–5. Lowest gets one scheduled replenishing activity this week—not another chore.",
    microAction:
      "Book one non-negotiable recovery block (walk without podcast, bath, friend call, quiet coffee). Protect it.",
    timeToImplement: "20 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "syh-08",
    bookId: "seven-habits",
    bookTitle: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    category: "habits-lifestyle",
    principleId: "production-production-capability",
    principleTitle: "Balance Production With Production Capability",
    description:
      "P (results) and PC (ability to produce results) both matter. Starving sleep to work more raises short-term P but destroys PC. Same for skipping meals to grind, or abandoning relationships that actually stabilize you. Invest in capacity, not only output.",
    coreConcept: "Short-term gains that erode capacity backfire",
    applicableWhen: [
      "overtraining",
      "undersleeping for hustle",
      "neglecting relationships that support health",
      "crash dieting",
    ],
    applicableScenarios: [
      "Using stimulants to mask exhaustion",
      "Skipping therapy or rest to 'save time'",
    ],
    simpleExplanation:
      "Name one habit that boosts today's output but weakens next week's energy. Swap one instance for a PC move (sleep, fuel, connection).",
    microAction:
      "This week cut one 'hero hour' that borrows from sleep—replace with 30 minutes extra rest and measure mood.",
    timeToImplement: "Ongoing awareness",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Not an excuse to avoid hard work—balance, not avoidance",
    ],
    whyItMatters:
      "Habits last when they don't cannibalize the energy and relationships that sustain them.",
  },

  // The Power of Habit — Charles Duhigg (paraphrased principles)
  {
    id: "poh-01",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "habit-loop-cue-routine-reward",
    principleTitle: "The Habit Loop: Cue, Routine, Reward",
    description:
      "Habits automate because the brain chunks cue → routine → reward. The cue predicts the reward; the routine is what got associated. Changing life means mapping each part instead of willing yourself through vague 'willpower.'",
    coreConcept: "Behaviors persist because they deliver something the brain learned to expect",
    applicableWhen: [
      "automatic behaviors",
      "don't know why you repeat",
      "breaking loops",
      "mindless scrolling",
      "stress eating",
    ],
    applicableScenarios: [
      "Same snack after work every day",
      "Phone in bed triggers hour-long scroll",
    ],
    simpleExplanation:
      "Pick one unwanted habit. Write one column each: trigger, what you do, payoff (calm, distraction, taste).",
    microAction:
      "Log three loops this week—same structure. Circle the payoff you actually need.",
    timeToImplement: "3×10 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "You can't uninstall a habit until you see what job it's doing.",
  },
  {
    id: "poh-02",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "golden-rule-change-routine",
    principleTitle: "Keep Cue and Reward, Swap the Routine",
    description:
      "You rarely delete cues (stress, time of day). You can substitute a better routine that still delivers a similar reward—walk instead of vape for relief, tea ritual instead of wine for wind-down.",
    coreConcept: "Substitution beats elimination when craving stays real",
    applicableWhen: [
      "cold turkey fails",
      "same trigger daily",
      "want harm reduction",
    ],
    applicableScenarios: [
      "Afternoon slump → sugar",
      "Loneliness → social media",
    ],
    simpleExplanation:
      "After mapping cue and reward, brainstorm three alternative routines that could honestly satisfy the same need.",
    microAction:
      "Choose one substitute routine. Run it for five repetitions after the usual cue—note reward match.",
    timeToImplement: "1–2 weeks trial",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Fighting the craving head-on exhausts you; redirecting it uses the same neural shortcut.",
  },
  {
    id: "poh-03",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "keystone-habits",
    principleTitle: "Keystone Habits: One Shift That Pulls Others Along",
    description:
      "Some habits disproportionately reorganize life—regular sleep, meal planning, exercise, weekly planning. They create small wins and identity shifts that make other behaviors easier without tackling everything at once.",
    coreConcept: "Find the domino habit, not the longest list",
    applicableWhen: [
      "too many goals",
      "overwhelm",
      "want ripple effects",
      "nothing sticks",
    ],
    applicableScenarios: [
      "Better sleep improves mood and snacks without dieting six rules",
      "Morning walk leads to earlier bedtimes",
    ],
    simpleExplanation:
      "Ask: which single habit—if consistent—would make tomorrow easier ethically and energetically?",
    microAction:
      "Pick one keystone for 30 days only. Ignore secondary habits unless they collapse—protect the keystone.",
    timeToImplement: "30-day focus",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Ripple beats scatter—proof builds belief for the next loop.",
  },
  {
    id: "poh-04",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "small-wins-belief",
    principleTitle: "Small Wins Build Belief",
    description:
      "Large change often starts with modest proof you can influence outcomes. Recording wins—even tiny—fuels conviction that bigger change is possible, especially after failure spirals.",
    coreConcept: "Belief follows evidence as much as the reverse",
    applicableWhen: [
      "learned helplessness",
      "past failures",
      "need momentum",
      "shame loops",
    ],
    applicableScenarios: [
      "Quit diets after slips—belief collapses",
      "One full week of walks restores hope",
    ],
    simpleExplanation:
      "Define 'win' so small it's almost unfair (five-minute walk). Stack seven and read the list aloud.",
    microAction:
      "End each day with one line: evidence I'm not stuck. Review Sundays.",
    timeToImplement: "Daily 2 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Your brain updates identity from receipts, not intentions.",
  },
  {
    id: "poh-05",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "willpower-muscle",
    principleTitle: "Willpower Fatigue: Budget It Like Energy",
    description:
      "Self-control draws on a shared mental budget—stress, hunger, and decision load deplete it. Relying on white-knuckling at 10 p.m. after a chaotic day sets you up to fail. Structure and defaults preserve willpower for when it matters.",
    coreConcept: "Design beats heroic resistance at low fuel",
    applicableWhen: [
      "evening failures",
      "decision fatigue",
      "stressful seasons",
      "late-night slips",
    ],
    applicableScenarios: [
      "Healthy morning, collapse at night",
      "Diet breaks after hard workdays",
    ],
    simpleExplanation:
      "Move hardest habits earlier or simplify evening environment (food prep, phone outside bedroom).",
    microAction:
      "Identify your lowest-willpower window. Remove one temptation from that window this week—no extra goals.",
    timeToImplement: "One-time setup",
    energyLevel: "low",
    difficulty: "easy",
    cautionsWhen: [
      "Chronic exhaustion may need medical support—not only habit design",
    ],
    whyItMatters:
      "Blaming character at hour eleven ignores physiology and load.",
  },
  {
    id: "poh-06",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "craving-drives-loop",
    principleTitle: "Craving Powers the Habit Loop",
    description:
      "Rewards land because anticipation develops—your brain begins craving the relief or buzz before the behavior. Noticing craving early (body tension, mental movie of the habit) is the cue to insert a pause or substitute.",
    coreConcept: "Interrupt anticipation, not only behavior",
    applicableWhen: [
      "anticipation builds",
      "urge surfing",
      "addictive apps",
      "emotional pulls",
    ],
    applicableScenarios: [
      "Hand moves toward phone before conscious choice",
      "Mouth waters before opening pantry",
    ],
    simpleExplanation:
      "When craving rises, name it aloud. Count 90 seconds breathing—then choose substitute or delay.",
    microAction:
      "Track three cravings this week: time, body sensation, thought. Note what happened if you waited 10 minutes.",
    timeToImplement: "1 week practice",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "You train flexibility in the anticipatory phase—where freedom actually lives.",
  },
  {
    id: "poh-07",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "social-contagion-habits",
    principleTitle: "Social Context Shapes What's 'Normal'",
    description:
      "Groups reinforce norms—who you eat, walk, or scroll with shifts what's acceptable. Changing habits often means shifting identity within a circle or finding peers where your target behavior is ordinary.",
    coreConcept: "Belonging cues beat solo discipline long-term",
    applicableWhen: [
      "peer pressure",
      "culture of excess",
      "need accountability",
      "lonely change",
    ],
    applicableScenarios: [
      "Office snacks vs your meal plan",
      "Friends bond over drinking",
    ],
    simpleExplanation:
      "List three people or communities where your desired habit is normal. Increase exposure modestly.",
    microAction:
      "Join one group or partnership (class, chat, walking buddy) aligned with your habit—show up twice this month.",
    timeToImplement: "2–4 hours/month",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Environment includes people—use tribes that pull you forward.",
  },
  {
    id: "poh-08",
    bookId: "power-of-habit",
    bookTitle: "The Power of Habit",
    author: "Charles Duhigg",
    category: "habits-lifestyle",
    principleId: "if-then-plans",
    principleTitle: "Plan If-Then Responses to Predictable Cues",
    description:
      "Implementation intentions ('If it's 8 p.m. and I'm restless, then I stretch ten minutes') automate decisions before willpower dips. They pair known cues with concrete behaviors so you don't negotiate in the hot moment.",
    coreConcept: "Pre-decide the script for high-risk moments",
    applicableWhen: [
      "same triggers repeat",
      "negotiation fatigue",
      "need structure",
    ],
    applicableScenarios: [
      "Thursday drinks after work",
      "Kids to bed then dessert craving",
    ],
    simpleExplanation:
      "Write two if-then statements for your top habit triggers. Read them morning and night for a week.",
    microAction:
      "Post if-then card on fridge and lock screen. Rate follow-through nightly (yes/no—no shame).",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Clarity in the cold moment beats inspiration in the calm moment.",
  },

  // The One Thing — Gary Keller & Jay Papasan (paraphrased principles)
  {
    id: "otk-01",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "focusing-question",
    principleTitle: "The Focusing Question: One Domino at a Time",
    description:
      "Instead of endless improvement lists, ask what single action makes other health or lifestyle actions easier or unnecessary. That's your lead domino—protect it before optimizing ten small things.",
    coreConcept: "Sequential priority beats scattered multitasking",
    applicableWhen: [
      "too many goals",
      "paralyzed by options",
      "busy but stuck",
      "overcomplicated routines",
    ],
    applicableScenarios: [
      "Ten new habits January 1",
      "Tracking seven apps and burning out",
    ],
    simpleExplanation:
      "Finish: 'What's the ONE thing I can do for my health such that by doing it everything else is easier?' Pick one answer this month.",
    microAction:
      "Cross off every goal but one for the next four weeks. Calendar daily touch on that domino first.",
    timeToImplement: "30 minutes planning",
    energyLevel: "low",
    difficulty: "easy",
    cautionsWhen: [
      "Basic safety and clinical needs still come first—one thing doesn't erase emergencies",
    ],
    whyItMatters:
      "Depth on one lever often collapses noise elsewhere.",
  },
  {
    id: "otk-02",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "time-block-one-thing",
    principleTitle: "Time-Block Your One Thing First",
    description:
      "Willpower and attention peak early for many people. Moving your lead habit or project into a defended morning or early block reduces competition from urgency and distraction.",
    coreConcept: "Calendar the priority before the world schedules you",
    applicableWhen: [
      "days escape",
      "important habit always last",
      "morning clarity",
    ],
    applicableScenarios: [
      "Exercise always 'later' then skipped",
      "Creative health prep buried under email",
    ],
    simpleExplanation:
      "Identify your best energy hour this week. Block it for your one thing before accepting meetings or Slack.",
    microAction:
      "Three mornings: protect first 60 minutes for lead habit—phone in another room until done.",
    timeToImplement: "3-day experiment",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Later rarely arrives—first wins the day.",
  },
  {
    id: "otk-03",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "willpower-is-timing",
    principleTitle: "Willpower Is Highest When Fresh",
    description:
      "Decision quality decays with fatigue, hunger, and overload. Heavy negotiating with yourself at midnight stacks the deck against change. Stack important behaviors when cognitive and emotional reserves are highest.",
    coreConcept: "Match difficult habits to peak capacity windows",
    applicableWhen: [
      "evening sabotage",
      "decision fatigue",
      "always tired at night",
    ],
    applicableScenarios: [
      "Meal prep Sunday vs exhausted weekday",
      "Hard conversations after sleep not at 2 a.m.",
    ],
    simpleExplanation:
      "Chart one week: when do you break promises to yourself? Shift one demanding habit earlier or simplify evening.",
    microAction:
      "Move one critical habit into your identified peak window—or halve evening version only after morning win.",
    timeToImplement: "1 week observation",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Timing isn't cheating—it's alignment with biology.",
  },
  {
    id: "otk-04",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "say-no-to-protect-one",
    principleTitle: "Say No to Protect the Yes",
    description:
      "Every yes to distraction is a no to your lead priority. Boundaries—declining meetings, batches, optional tasks—create space for the domino habit. Guilt eases when the no serves a visible yes.",
    coreConcept: "Discipline is choosing pain of focus over pain of drift",
    applicableWhen: [
      "overcommitted",
      "can't say no",
      "people pleasing",
      "calendar full",
    ],
    applicableScenarios: [
      "Volunteer asks eat workout time",
      "Social plans erase sleep debt recovery",
    ],
    simpleExplanation:
      "Write your one thing on paper. Next time you hesitate on a request, ask: does this steal from that line?",
    microAction:
      "Decline or defer two non-essential commitments this week—script: 'I’m focused on ___ through [date].'",
    timeToImplement: "Ongoing",
    energyLevel: "medium",
    difficulty: "hard",
    whyItMatters:
      "Your calendar shows your real priorities—audit it ruthlessly once.",
  },
  {
    id: "otk-05",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "purpose-priority-productivity",
    principleTitle: "Purpose → Priority → Productivity",
    description:
      "Productivity without priority is motion without direction. Connect daily habits to a longer purpose (why health matters to you) so saying no and showing up feel meaningful, not punitive.",
    coreConcept: "Meaning stabilizes priority when motivation wobbles",
    applicableWhen: [
      "empty checkbox days",
      "burnout on routines",
      "lost why",
    ],
    applicableScenarios: [
      "Tracking metrics without caring",
      "Fitness for aesthetics that don't move you",
    ],
    simpleExplanation:
      "Write five sentences: purpose this year, priority habit this quarter, tomorrow's block tied to both.",
    microAction:
      "Read purpose aloud before starting one thing block—30 seconds, seven days.",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Purpose answers why the struggle is worth it.",
  },
  {
    id: "otk-06",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "multitasking-myth",
    principleTitle: "Multitasking Dilutes Results",
    description:
      "Rapid switching carries attention residue—each hop leaves mental debris. Sequential focus on one task or habit block usually beats parallel juggling for quality and calm.",
    coreConcept: "Single-tasking is a performance strategy, not laziness",
    applicableWhen: [
      "constant context switching",
      "half-done workouts while answering messages",
      "distracted meals",
    ],
    applicableScenarios: [
      "Cooking while on calls—burns and blur",
      "Gym between emails—neither gets full presence",
    ],
    simpleExplanation:
      "Pick one daily stretch where you refuse parallel habits (meal without screen, walk without podcast once).",
    microAction:
      "Use a 25-minute timer: one health task only—no tabs, no texts. Note completion feeling.",
    timeToImplement: "Daily trial",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Depth trains satisfaction; scattered effort trains anxiety.",
  },
  {
    id: "otk-07",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "four-thieves-productivity",
    principleTitle: "Watch the Thieves of Your Block (Health Edition)",
    description:
      "Inability to say no, fear of chaos, poor health habits, and environment that doesn't match goals steal your block. Diagnose which thief shows up when your one thing slides.",
    coreConcept: "Name the leakage before blaming discipline",
    applicableWhen: [
      "missed blocks",
      "excuses vary",
      "need diagnosis",
    ],
    applicableScenarios: [
      "Can't say no (thief 1)",
      "Can't tolerate messy house so you clean not walk (thief 2)",
    ],
    simpleExplanation:
      "After three missed blocks, write which thief fired—plan one environmental or boundary fix.",
    microAction:
      "List two thieves active this month. One concrete fix each (auto-decline, cleaner shortcut, earlier sleep).",
    timeToImplement: "30 minutes",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Precision beats shame—fix systems, not character first.",
  },
  {
    id: "otk-08",
    bookId: "the-one-thing",
    bookTitle: "The One Thing",
    author: "Gary Keller",
    category: "habits-lifestyle",
    principleId: "success-list-survival-list",
    principleTitle: "Success List vs Survival List",
    description:
      "Survival lists keep you afloat (email, chores). Success lists build the future—often Quadrant II health, learning, relationships. Move one success item into prime time before survival consumes the day.",
    coreConcept: "Invest blocks in success work, not only urgent maintenance",
    applicableWhen: [
      "always reactive",
      "health last",
      "never strategic",
    ],
    applicableScenarios: [
      "Evenings only chores",
      "Weekends only errands—no training",
    ],
    simpleExplanation:
      "Split today's list: survival vs success. Do one success task before opening survival apps.",
    microAction:
      "Morning: complete one 20-minute success habit before inbox—four workdays.",
    timeToImplement: "1 workweek",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Survival mode forever starves the life you meant to build.",
  },

  // Deep Work — Cal Newport (habits & focus lifestyle; complements work-purpose entries)
  {
    id: "dwh-01",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "depth-as-skill",
    principleTitle: "Deep Work Is a Trainable Skill",
    description:
      "Sustained attention isn't fixed—it strengthens with progressive overload like fitness. Short, distraction-free blocks, gradually lengthened, build tolerance for boredom and difficulty that shallow habits erode.",
    coreConcept: "Capacity for focus grows with deliberate practice",
    applicableWhen: [
      "can't read longform",
      "restless without phone",
      "want concentration back",
    ],
    applicableScenarios: [
      "Books abandoned after pages",
      "Workouts only with endless podcasts",
    ],
    simpleExplanation:
      "Daily 25-minute no-phone focus on one task—add five minutes weekly if stable.",
    microAction:
      "Four sessions this week: timer + phone in drawer—note urge spikes without acting.",
    timeToImplement: "1 week",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Attention is the substrate of every other habit quality.",
  },
  {
    id: "dwh-02",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "attention-residue",
    principleTitle: "Attention Residue: Switching Has a Hangover",
    description:
      "Switching tasks leaves part of your mind on the previous task—quality and calm drop. Batching shallow tasks and protecting contiguous blocks reduces residue that makes healthy routines feel harder.",
    coreConcept: "Fewer transitions = clearer head for what matters",
    applicableWhen: [
      "constant multitasking",
      "frazzled evenings",
      "can't wind down",
    ],
    applicableScenarios: [
      "Email between exercise sets",
      "Cooking while half in work chat",
    ],
    simpleExplanation:
      "Group shallow tasks into one window; separate movement or meals from work contexts.",
    microAction:
      "Pick one hour daily: no task switching—single stream (walk, cook, read). Note calm after.",
    timeToImplement: "7 days",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Residual attention steals presence from recovery habits.",
  },
  {
    id: "dwh-03",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "embrace-boredom",
    principleTitle: "Embrace Boredom: Don't Train Constant Novelty",
    description:
      "If every idle second hits the feed, your brain learns to demand stimulation. Practicing tolerated boredom (queue, walking, dishes without audio) restores baseline attention for harder habits.",
    coreConcept: "Comfort with stillness supports deep habits",
    applicableWhen: [
      "phone fills every gap",
      "can't sit still",
      "need stimulation",
    ],
    applicableScenarios: [
      "Elevator → phone reflex",
      "Can't eat without content",
    ],
    simpleExplanation:
      "Choose two daily pauses to be stimulus-free up to five minutes—breathe, notice, no scroll.",
    microAction:
      "Replace one scroll slot with staring out a window or slow tea—track discomfort 1–10 fading by day five.",
    timeToImplement: "5 days",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "High-threshold stimulation shrinks your attention span for everything else.",
  },
  {
    id: "dwh-04",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "rhythmic-philosophy",
    principleTitle: "Rhythm: Same Depth Window Daily",
    description:
      "A fixed daily or weekday start for deep work creates automaticity—brain anticipates focus like morning coffee. Same window beats waiting for inspiration.",
    coreConcept: "Consistency of timing trains neural readiness",
    applicableWhen: [
      "irregular schedules",
      "waiting for mood",
      "chaotic mornings",
    ],
    applicableScenarios: [
      "Writing or learning only when inspired",
      "Exercise random times—always bumped",
    ],
    simpleExplanation:
      "Anchor one 60–90 minute block same clock time Mon–Fri—non-negotiable barring crisis.",
    microAction:
      "Set recurring calendar hold + phone automation for that slot—follow two weeks.",
    timeToImplement: "2 weeks",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Rhythm removes negotiation—you show up because it's that time.",
  },
  {
    id: "dwh-05",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "shutdown-ritual",
    principleTitle: "Shutdown Ritual: Close Open Loops for Recovery",
    description:
      "Carrying unfinished professional loops into evening spikes stress and steals sleep. A quick capture—plan tomorrow's top task, inbox zero for urgent only—signals 'closed' so nervous system can shift to rest and social habits.",
    coreConcept: "Explicit end to work protects night routines",
    applicableWhen: [
      "revenge bedtime",
      "rumination",
      "can't disconnect",
    ],
    applicableScenarios: [
      "Checking email in bed",
      "Sunday scaries without closure Friday",
    ],
    simpleExplanation:
      "Last 10 minutes of workday: list top three tomorrow, voice memo worries, literal phrase 'shutdown complete.'",
    microAction:
      "Five-day streak of shutdown checklist before evening walk or dinner—no work apps after.",
    timeToImplement: "10 minutes daily",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Sleep and movement habits need a brain that isn't still debugging work.",
  },
  {
    id: "dwh-06",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "productive-meditation",
    principleTitle: "Productive Meditation: Walk With One Problem",
    description:
      "During physical activity without inputs, hold one well-defined professional or personal problem in mind—iterate solutions. Builds focus muscle and pairs movement with depth.",
    coreConcept: "Low-stimulation movement + structured thinking",
    applicableWhen: [
      "want walking habit to feel useful",
      "need thinking time",
    ],
    applicableScenarios: [
      "Walks always podcasts—try silent problem-solving",
      "Stuck on life decision during cardio",
    ],
    simpleExplanation:
      "Twice weekly: 30-minute walk, one question only—when attention drifts, return gently.",
    microAction:
      "Schedule one productive meditation walk—note one insight before shower.",
    timeToImplement: "30 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Pairs keystone movement with cognitive depth.",
  },
  {
    id: "dwh-07",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "shallow-work-budget",
    principleTitle: "Cap Shallow Work: Protect Depth Budget",
    description:
      "Email, messaging, and coordination expand infinitely. Giving them a ceiling (batch windows, count limits) preserves hours for training, cooking, sleep prep, or creative health activities.",
    coreConcept: "Finite budget for infinite shallow demand",
    applicableWhen: [
      "days eaten by coordination",
      "no time for health blocks",
    ],
    applicableScenarios: [
      "Slack always on",
      "Meetings fill every gap",
    ],
    simpleExplanation:
      "Choose max shallow hours per day—track one week. Move excess to batches.",
    microAction:
      "Set chat/email to two windows only—mute outside. Replace freed 30 minutes with movement.",
    timeToImplement: "1 week experiment",
    energyLevel: "low",
    difficulty: "hard",
    whyItMatters:
      "Depth and health blocks need reclaimed calendar mass.",
  },
  {
    id: "dwh-08",
    bookId: "deep-work",
    bookTitle: "Deep Work",
    author: "Cal Newport",
    category: "habits-lifestyle",
    principleId: "metrics-that-matter",
    principleTitle: "Measure Depth, Not Busyness",
    description:
      "Hours busy ≠ hours that build capability or wellbeing. Track blocks of uninterrupted focus or key health behaviors—not tabs open or reply speed.",
    coreConcept: "Lag metrics over vanity metrics",
    applicableWhen: [
      "feel productive but hollow",
      "optimizing wrong numbers",
    ],
    applicableScenarios: [
      "Long workdays, zero workouts",
      "High step count from pacing stressed, not training",
    ],
    simpleExplanation:
      "Weekly: count deep blocks and workouts completed—not hours online.",
    microAction:
      "Sunday review: three numbers only—deep hours, sleep average, workouts. Trend four weeks.",
    timeToImplement: "15 minutes weekly",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "What you measure shapes what you reinforce.",
  },
];

// ============================================================
// CATEGORY 6: MONEY & FINANCE
// ============================================================

const moneyFinancePrinciples: WisdomPrinciple[] = [
  // Profit First - Mike Michalowicz
  {
    id: "pf-01",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "profit-first-mentality",
    principleTitle: "Profit First: Treat Profit Like a Bill",
    description:
      "Most people: Revenue - Expenses = Profit. Profit First: Revenue - Profit = Expenses. Take your profit FIRST.",
    coreConcept: "Profit is priority, not afterthought",
    whyItMatters: "Without this mindset, profit gets spent. Protect profit actively.",
    applicableWhen: [
      "make money but have none",
      "don't pay yourself",
      "money disappears",
      "unclear where money goes",
      "business owner without personal income",
    ],
    applicableScenarios: [
      "Business does great, bank account empty",
      "Revenue high, personal account low",
      "Don't know where profits are",
    ],
    simpleExplanation:
      "Open separate account. Put % of revenue there first (for you/profit). Then operate on remainder.",
    microAction:
      "If self-employed/business: Calculate 10% of revenue. Put it in separate account first. Each deposit.",
    timeToImplement: "Setup 30 min",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-02",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "separate-accounts-clarity",
    principleTitle: "Separate Accounts: Money Segregation Creates Clarity",
    description:
      "One account = chaos. Multiple accounts (operating, profit, tax, personal) = clarity. Each account has a job.",
    coreConcept: "Segregation = visibility + discipline",
    whyItMatters: "You can't manage what you can't see. Separate accounts make money visible.",
    applicableWhen: [
      "confusion with money",
      "don't know what's available",
      "overspending",
      "forgetting taxes",
      "no business/personal separation",
      "want clarity on what you earn spend and owe",
      "avoid opening banking apps or bills until you feel calm",
      "postpone facing the full financial picture",
      "money feels fuzzy until you sort accounts",
    ],
    applicableScenarios: [
      "Single account: is this for taxes or spending?",
      "Multiple accounts: each account clear purpose",
      "You delay checking balances even though you want clarity",
      "Need to see earning spending and owing without shame spiral first",
    ],
    simpleExplanation:
      "Operating account (expenses), Profit account (yours), Tax account (save for taxes). Transfer to each. Clarity.",
    microAction:
      "Open 3-4 accounts (if not already). Label: Operating, Profit, Tax, Personal. Set up transfers.",
    timeToImplement: "30 minutes",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-03",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "pay-yourself-first",
    principleTitle: "Pay Yourself First: You're Not Last Priority",
    description:
      "Employee gets paycheck first. Owner pays themselves last (if anything). Flip it. Pay yourself first as owner.",
    coreConcept: "You come first, not last",
    whyItMatters:
      "Paying yourself last = burnout. You're doing all the work, earning nothing. Unsustainable.",
    applicableWhen: [
      "own business, make no income",
      "everyone gets paid but you",
      "burned out unpaid work",
      "questioning why you started business",
      "no personal income despite revenue",
    ],
    applicableScenarios: [
      "Business makes $100k, owner makes $0",
      "Employees paid, owner unpaid",
      "Reinvesting everything",
    ],
    simpleExplanation:
      "As owner, give yourself salary/draw. Like you're an employee. Commit to it.",
    microAction:
      "Calculate: What should I pay myself? Set up automatic transfer. Pay yourself like you're your first employee.",
    timeToImplement: "30 minutes setup",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-04",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "business-not-personal-account",
    principleTitle: "Business Money ≠ Personal Money: Keep Them Apart",
    description:
      "Mixing business and personal money creates chaos. Different accounts, different rules. Business account = business only.",
    coreConcept: "Separation = simplicity",
    whyItMatters: "Mixed accounts create impossible bookkeeping. Separate = clear taxes, clear income.",
    applicableWhen: [
      "business/personal confused",
      "tax time messy",
      "spending personal on business or vice versa",
      "accountant frustrated",
      "don't know real income",
    ],
    applicableScenarios: [
      "Can't tell if money is for business or personal",
      "Tax time: hours sorting transactions",
      "Personal spending through business account",
    ],
    simpleExplanation:
      "Strict rule: Business income → business account. Personal income → personal account. Never mix.",
    microAction:
      "If mixed: Open separate accounts. Move business income to business account. Personal to personal. New rule: never mix.",
    timeToImplement: "30 minutes setup",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-05",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "plan-for-taxes",
    principleTitle: "Plan for Taxes: Save Now, Pay Later",
    description:
      "Business owner trap: make income, spend it, tax bill comes, no money. Solution: Save % for taxes monthly.",
    coreConcept: "Tax liability ≠ cash in hand",
    whyItMatters:
      "Waiting until tax time = crisis. Saving monthly = easy payment. Mathematics, not surprise.",
    applicableWhen: [
      "self-employed",
      "business owner",
      "tax bill came as shock",
      "couldn't pay taxes",
      "quarterly taxes overwhelming",
    ],
    applicableScenarios: [
      "Made $50k, spent $50k (thinking it was profit), tax bill $15k due",
      "Self-employed: 25-30% to taxes",
    ],
    simpleExplanation:
      "Calculate tax %. Save that % monthly in separate account. Tax bill arrives, payment ready.",
    microAction:
      "Calculate: What % of income goes to taxes? (15-30% typically). Set aside monthly in tax account.",
    timeToImplement: "30 minutes calculation",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-06",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "seasonal-business-planning",
    principleTitle: "Seasonal Accounts: Level Cash Flow",
    description:
      "Seasonal businesses swing high/low. Create account for low months during high months. Sustainability through planning.",
    coreConcept: "Save for the lean times during abundance",
    whyItMatters: "Without planning, lean months = crisis. With planning, lean months = expected.",
    applicableWhen: [
      "seasonal business",
      "cash flow swings",
      "abundance then crisis",
      "can't predict money",
      "surviving, not planning",
    ],
    applicableScenarios: [
      "Summer busy, winter dead",
      "Holiday rush, then quiet",
      "High months pay for low months",
    ],
    simpleExplanation:
      "During high months, save %. During low months, draw from savings. Smooth out the swings.",
    microAction:
      "If seasonal: Calculate average monthly need. During high months, save difference. Create buffer.",
    timeToImplement: "30 minutes planning",
    energyLevel: "low",
    difficulty: "easy",
  },
  {
    id: "pf-07",
    bookId: "profit-first",
    bookTitle: "Profit First",
    author: "Mike Michalowicz",
    category: "money-finance",
    principleId: "worthiness-deservingness",
    principleTitle: "Worthiness: You Must Believe You Deserve Money",
    description:
      "Your money outcomes reflect your deepest beliefs about whether you deserve financial reward. If you subconsciously believe successful people are selfish, or that wanting money makes you bad, you will sabotage your own wealth. Examine: What story did your family teach you about money and people who have it? Do you believe wealthy people are better than you, or do you deserve what they have?",
    coreConcept: "Money beliefs = Money reality",
    coreQuote: "You cannot earn more than you believe you deserve.",
    applicableWhen: [
      "guilt about earning",
      "self-sabotage pattern",
      "inherited money shame",
      "feelings of unworthiness",
      "difficulty accepting raises",
      "imposter syndrome with income",
    ],
    applicableScenarios: [
      "You get a promotion and immediately find ways to fail",
      "You earn good money but immediately spend it (guilt spending)",
      "You feel guilty when others are struggling financially",
      "Success triggers self-sabotage",
      "Family criticizes you for ambition",
    ],
    simpleExplanation:
      "Your beliefs about money come from your family. If they believed rich people were selfish, greedy, or evil, you inherited that belief. Your subconscious protects you by preventing wealth (so you won't become 'bad'). To earn more, you must first believe you deserve it—not because you'll become selfish, but because you can use money for good.",
    microAction:
      "Write: 'I deserve _____ [specific income]. I can have money and be a good person because _____'. Reread daily for 2 weeks. Notice what feelings arise.",
    timeToImplement: "5 minutes daily",
    energyLevel: "low",
    difficulty: "hard",
    cautionsWhen: [
      "Deep shame may require therapy, not just belief work",
      "Validate the fear before changing it",
    ],
    whyItMatters:
      "Without addressing worthiness, you'll self-sabotage even with perfect systems. Your beliefs are more powerful than your budgets.",
  },
  {
    id: "mp-01",
    bookId: "money-patterns",
    bookTitle: "Money Patterns: Breaking Generational Cycles",
    author: "Ramit Sethi & Kathleen Daley",
    category: "money-finance",
    principleId: "inherited-money-patterns",
    principleTitle: "Inherited Money Patterns: You're Not Broke, You're Programmed",
    description:
      "Your relationship with money was programmed before age 12. You watched your parents (or guardians) handle money. Their anxieties became your anxieties. Their shame became your shame. Their scarcity became your scarcity. Until you identify the specific pattern you inherited, you'll repeat it—no matter your income. The pattern might be: hoarding, reckless spending, hiding money, fighting over money, never discussing money, or feeling ashamed.",
    coreConcept: "Family patterns run deep; awareness breaks them",
    coreQuote: "We're not doomed to repeat our parents' financial patterns, but we must see them first.",
    applicableWhen: [
      "money stress similar to parents",
      "repeating parent's financial mistakes",
      "family money secrets",
      "generational trauma around money",
      "conflicting money messages from parents",
    ],
    applicableScenarios: [
      "Your parents fought about money; you and your partner do too",
      "Your parent hoarded money (never spent); you do the same despite abundance",
      "Your parent spent recklessly; you swing between extreme thrift and binges",
      "One parent said 'money is evil'; other parent chased wealth",
      "Money was never discussed; you feel ashamed talking about it",
    ],
    simpleExplanation:
      "Money patterns are inherited like accents or values. Your parents' relationship with money taught you how to relate to money. Until you notice the pattern and name it, you'll automatically repeat it—even if you consciously don't want to. The goal isn't to blame them, but to interrupt the pattern through awareness.",
    microAction:
      "Interview: Write your parents'/guardians' money story. How did they earn? How did they feel about money? What was forbidden to discuss? What was the family money rule? Notice patterns in yourself.",
    timeToImplement: "30 minutes reflection",
    energyLevel: "medium",
    difficulty: "hard",
    cautionsWhen: [
      "Expect emotions—this may trigger grief or anger",
      "This is exploration, not judgment of parents",
    ],
    whyItMatters:
      "You can't change what you don't see. Inherited patterns are invisible until named. Once visible, you can choose differently.",
  },
  {
    id: "mp-02",
    bookId: "money-patterns",
    bookTitle: "Money Patterns: Breaking Generational Cycles",
    author: "Ramit Sethi & Kathleen Daley",
    category: "money-finance",
    principleId: "enough-sufficiency-clarity",
    principleTitle: "Enough: Define Sufficiency Before Guilt Takes Over",
    description:
      "Guilt about having money (when others have less) is a form of scarcity belief. It says: 'Your abundance means someone else's scarcity.' This is false. The problem isn't that you have enough—it's that you never defined what 'enough' means. So you never feel secure. And you never allow yourself to enjoy what you have. Define your 'enough' number: How much money would make you feel safe? Once you hit it, you can earn more guilt-free, because you're not chasing; you're secure.",
    coreConcept: "Guilt is often unexamined scarcity masked as morality",
    coreQuote: "It's not selfish to define your own enough. It's clarity.",
    applicableWhen: [
      "guilt about earning more than others",
      "never feeling like 'enough'",
      "perpetual scarcity feeling despite abundance",
      "emotional difficulty enjoying money",
      "impostor syndrome about success",
    ],
    applicableScenarios: [
      "You earn good money but feel guilty, so you spend it compulsively",
      "You won't ask for a raise because 'there are people with less'",
      "You feel selfish for wanting financial security",
      "You earn more than family; family makes you feel guilty",
      "You never feel 'done' earning, even with plenty",
    ],
    simpleExplanation:
      "Enough is personal. Your enough number might be $50k/year or $500k/year—it depends on your values and goals. Until you name it, you're chasing infinite growth. That creates perpetual guilt: 'Am I taking too much? Do I deserve this?' Once you define enough, you can hit it and feel secure. THEN you can earn above it without guilt, because you're not desperate.",
    microAction:
      "Write: 'I would feel financially secure with _____ per year. That covers: housing, food, healthcare, joy, and helping others.' Get specific. Put it somewhere visible.",
    timeToImplement: "20 minutes",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Enough can shift over time—revisit annually",
      "This isn't about limiting yourself, it's about clarity",
    ],
    whyItMatters:
      "Guilt is the enemy of wealth-building. Clarity about enough transforms guilt into direction.",
  },
  {
    id: "hs-01",
    bookId: "the-psychology-of-money",
    bookTitle: "The Psychology of Money",
    author: "Morgan Housel",
    category: "money-finance",
    principleId: "behavior-over-spreadsheets",
    principleTitle: "Behavior Beats Spreadsheets: Wealth Is What You Don't See",
    description:
      "Financial outcomes depend less on IQ or credentials than on patience, humility, and time horizon. Doing reasonable things longer beats brilliant moves followed by panic. Building wealth is largely managing behavior around greed, fear, and social comparison—not picking the perfect chart.",
    coreConcept: "Consistency and temperament compound more than optimization",
    applicableWhen: [
      "shame about not knowing finance jargon",
      "comparing portfolio returns to others",
      "swinging between aggressive and fearful moves",
      "steady income but slow wealth building",
    ],
    applicableScenarios: [
      "Sold low in a panic after headlines",
      "Skipped boring automatic savings for sexier bets",
    ],
    simpleExplanation:
      "Automate one boring good behavior (recurring transfer to savings or index contribution). Ignore peers' performance stories for one quarter.",
    microAction:
      "Write your investing/saving rules on one index card. When urge to deviate hits, read card once before acting.",
    timeToImplement: "Ongoing",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Markets reward time in more than timing—behavior is the bottleneck.",
  },
  {
    id: "hs-02",
    bookId: "the-psychology-of-money",
    bookTitle: "The Psychology of Money",
    author: "Morgan Housel",
    category: "money-finance",
    principleId: "save-rate-vs-income",
    principleTitle: "Your Savings Rate Matters More Than Income Alone",
    description:
      "High income with high expenses builds less freedom than moderate income with margin. Saving is the gap between ego and income—raising lifestyle as fast as salary erases advantage. Freedom dates from assets vs. spending, not salary bragging rights.",
    coreConcept: "Gap between earning and wanting drives wealth",
    applicableWhen: [
      "raises disappear into lifestyle",
      "feel stuck despite good job",
      "want financial runway",
    ],
    applicableScenarios: [
      "Every promotion upgrades car or rent automatically",
      "Can't name percentage saved monthly",
    ],
    simpleExplanation:
      "Calculate save rate last 3 months (saved ÷ after-tax income). Bump it 2% via one recurring cut or automatic transfer.",
    microAction:
      "Cancel or downgrade one subscription this week; redirect exact amount auto-transfer same day.",
    timeToImplement: "45 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Compounding needs capital left invested—spending steals the exponent.",
  },
  {
    id: "jl-01",
    bookId: "the-simple-path-to-wealth",
    bookTitle: "The Simple Path to Wealth",
    author: "JL Collins",
    category: "money-finance",
    principleId: "index-simplicity-long-term",
    principleTitle: "Keep Investing Simple: Broad Index Funds and Patience",
    description:
      "Most investors underperform because they trade emotions and fees. Low-cost broad index funds capture market returns without stock-picking theater. Simplicity reduces mistakes; time does the heavy lifting.",
    coreConcept: "Boring diversified passive beats clever busy",
    applicableWhen: [
      "analysis paralysis on investing",
      "too many apps or stock tips",
      "want set-and-forget growing wealth",
    ],
    applicableScenarios: [
      "Cash pile from fear of choosing wrong investment",
      "Trading often during volatility",
    ],
    simpleExplanation:
      "Pick one diversified stock index + bond split matching your timeline. Automate monthly buy. Ignore news for a year.",
    microAction:
      "Open brokerage if needed; set automatic monthly investment at fixed date—equal amount regardless of headlines.",
    timeToImplement: "2 hours setup",
    energyLevel: "low",
    difficulty: "easy",
    cautionsWhen: [
      "Match stock/bond mix to horizon and sleep-at-night comfort",
    ],
    whyItMatters:
      "Fees and churn silently destroy returns—simple defaults preserve edge.",
  },
  {
    id: "rs-02",
    bookId: "i-will-teach-you-to-be-rich",
    bookTitle: "I Will Teach You to Be Rich",
    author: "Ramit Sethi",
    category: "money-finance",
    principleId: "conscious-spending-plan",
    principleTitle: "Conscious Spending: Splurge Openly on What You Love",
    description:
      "Budgets fail when they're only denial. Conscious spending means cutting ruthlessly on low-joy categories so you can spend extravagantly on what you value—guilt-free. Automate fixed costs and savings first; decide what's 'enough' fun money.",
    coreConcept: "Spend lavishly on priorities; mercilessly cut the rest",
    applicableWhen: [
      "guilt about spending on hobbies",
      "death by small subscriptions",
      "want joy without blowing goals",
    ],
    applicableScenarios: [
      "Feel deprived on tight budgets then binge spend",
      "Can't travel but daily coffee adds up unnoticed",
    ],
    simpleExplanation:
      "List top 2 loves worth premium spend. Cut two low-care categories 50% next month. Automate savings before fun wallet.",
    microAction:
      "Audit last 90 days spending into love meh hate. Cancel two 'meh' recurring charges today.",
    timeToImplement: "90 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Alignment reduces shame—you're not overspending randomly; you're choosing.",
  },
  {
    id: "vyf-01",
    bookId: "your-money-or-your-life",
    bookTitle: "Your Money or Your Life",
    author: "Vicki Robin & Joe Dominguez",
    category: "money-finance",
    principleId: "life-energy-money",
    principleTitle: "Money Is Life Energy: Track What Work Really Costs",
    description:
      "Every dollar spent is hours of life traded after taxes and commute. Tracking real hourly wage after costs clarifies purchases: 'Is this worth that slice of my life?' Pair with clarity on enough so work becomes a conscious exchange, not endless treadmill.",
    coreConcept: "Spending = hours of life you won't get back",
    applicableWhen: [
      "mindless consumption",
      "golden handcuffs job",
      "wondering if purchase is worth it",
    ],
    applicableScenarios: [
      "Big house long commute draining invisible hours",
      "Impulse buys you'd skip if translated to work hours",
    ],
    simpleExplanation:
      "Compute real hourly wage (income minus work costs ÷ real hours including prep/commute). Next three purchases—convert price to hours. Buy or skip consciously.",
    microAction:
      "Spreadsheet: income, taxes, work expenses, weekly hours including commute. True hourly rate. Stick note on monitor.",
    timeToImplement: "1 hour once",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Reframing spend as life energy slows waste without joyless austerity.",
  },
  {
    id: "rdpd-01",
    bookId: "rich-dad-poor-dad",
    bookTitle: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "money-finance",
    principleId: "assets-vs-liabilities-thinking",
    principleTitle: "Assets vs Liabilities: Buy Income-Producing Before Status",
    description:
      "Financial stress often comes from buying obligations first (EMIs, upgrades, status spending) and calling them progress. The core shift is to prioritize assets that produce cash flow or long-term value before discretionary liabilities.",
    coreConcept: "Cash-flow-producing assets create freedom over time",
    applicableWhen: [
      "income rises but wealth doesn't",
      "high lifestyle costs",
      "confused about good debt vs bad spending",
      "want financial independence",
    ],
    applicableScenarios: [
      "Promotion leads to bigger car payment, not higher net worth",
      "Most savings consumed by depreciating purchases",
    ],
    simpleExplanation:
      "Before a big purchase, ask: does this put money in monthly or take money out monthly? Prioritize in-flow first.",
    microAction:
      "Audit your top 5 monthly outflows and label each as asset-building, neutral, or liability-heavy. Move one liability expense toward asset contribution this month.",
    timeToImplement: "45 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Wealth direction changes when your default purchase order changes.",
  },
  {
    id: "rdpd-02",
    bookId: "rich-dad-poor-dad",
    bookTitle: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "money-finance",
    principleId: "pay-yourself-first-cashflow",
    principleTitle: "Pay Yourself First Through Automated Investing",
    description:
      "Discipline is easier when the system moves money before lifestyle expands. Paying yourself first means automating saving/investing as a fixed commitment, not a leftover decision at month end.",
    coreConcept: "Automation beats willpower for wealth habits",
    applicableWhen: [
      "save whatever is left at month end",
      "inconsistent investing",
      "salary increase disappears quickly",
    ],
    applicableScenarios: [
      "Good intentions to invest but no recurring setup",
      "Unexpected spending eats all monthly margin",
    ],
    simpleExplanation:
      "Set one fixed auto-transfer on salary day toward long-term goals before discretionary spend starts.",
    microAction:
      "Create auto-transfer equal to at least 10% of income to investment/savings account this week.",
    timeToImplement: "20 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Consistency creates compounding; leftovers rarely do.",
  },
  {
    id: "tii-01",
    bookId: "the-intelligent-investor",
    bookTitle: "The Intelligent Investor",
    author: "Benjamin Graham",
    category: "money-finance",
    principleId: "investor-vs-speculator",
    principleTitle: "Investor vs Speculator: Define Your Game Before You Play",
    description:
      "Many people speculate emotionally while believing they are investing. Investing requires process, margin of safety, and long time horizon; speculation chases short-term movement and stories.",
    coreConcept: "Clarity of method protects you from emotional drift",
    applicableWhen: [
      "frequent portfolio changes",
      "headline-driven decisions",
      "fear of missing out",
      "no written strategy",
    ],
    applicableScenarios: [
      "Buying because social media says it's the next winner",
      "Selling quality assets during volatility panic",
    ],
    simpleExplanation:
      "Write your investing policy in one page: goal, horizon, allocation, rebalance rule, and what you will not do.",
    microAction:
      "Before any trade this month, check it against your written policy. If it violates policy, wait 24 hours.",
    timeToImplement: "1 hour",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "A stable process prevents expensive emotional mistakes.",
  },
  {
    id: "tii-02",
    bookId: "the-intelligent-investor",
    bookTitle: "The Intelligent Investor",
    author: "Benjamin Graham",
    category: "money-finance",
    principleId: "mr-market-emotional-discipline",
    principleTitle: "Mr. Market: Use Volatility, Don't Obey It",
    description:
      "Market mood swings are offers, not commands. Emotional discipline means using volatility to your advantage through pre-set allocation and rebalancing instead of panic buying/selling.",
    coreConcept: "Price movement is information, not instruction",
    applicableWhen: [
      "anxiety during market drops",
      "panic selling",
      "greed during rallies",
      "checking portfolio obsessively",
    ],
    applicableScenarios: [
      "Sell after a drawdown and miss recovery",
      "Overconcentrate after a streak of gains",
    ],
    simpleExplanation:
      "Predefine your rebalance bands and contribution plan so market mood doesn't control your behavior.",
    microAction:
      "Set a quarterly rebalance reminder and stop checking portfolio daily for 30 days.",
    timeToImplement: "15 minutes setup",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Most investors are hurt more by reaction than by returns.",
  },
  {
    id: "bogle-01",
    bookId: "common-sense-investing",
    bookTitle: "The Little Book of Common Sense Investing",
    author: "John C. Bogle",
    category: "money-finance",
    principleId: "low-cost-index-discipline",
    principleTitle: "Low Cost Wins: Keep Fees Tiny, Stay Broad, Stay Long",
    description:
      "Investment complexity often increases costs and errors. Low-cost broad index investing improves odds by minimizing fees, turnover, and style-chasing.",
    coreConcept: "What you keep matters more than flashy gross returns",
    applicableWhen: [
      "too many funds or products",
      "high expense ratios",
      "performance chasing",
      "confused by investment options",
    ],
    applicableScenarios: [
      "Frequent fund switching based on recent returns",
      "Paying high fees for underperforming active products",
    ],
    simpleExplanation:
      "Simplify to a low-cost diversified core and hold it through cycles.",
    microAction:
      "Review your top holdings and note expense ratios. Reduce one high-fee position into a lower-cost broad fund this quarter.",
    timeToImplement: "1-2 hours",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Fees and churn are reliable drags; simplicity is a durable edge.",
  },
  {
    id: "mm-01",
    bookId: "secrets-of-the-millionaire-mind",
    bookTitle: "Secrets of the Millionaire Mind",
    author: "T. Harv Eker",
    category: "money-finance",
    principleId: "money-blueprint-awareness",
    principleTitle: "Money Blueprint: Your Beliefs Quietly Set Your Ceiling",
    description:
      "Unexamined beliefs about deserving, safety, and wealth often shape earning and spending more than plans do. Noticing your default money story helps you stop self-sabotage patterns.",
    coreConcept: "Belief patterns influence financial behavior repeatedly",
    applicableWhen: [
      "self-sabotage after progress",
      "guilt around earning more",
      "avoidance of money conversations",
      "income ceiling pattern",
    ],
    applicableScenarios: [
      "Earn more then quickly undo progress with reactive spending",
      "Underpricing work due to hidden worthiness beliefs",
    ],
    simpleExplanation:
      "Identify one recurring money sentence in your head and test whether it is useful or inherited noise.",
    microAction:
      "Write: 'My current money belief is ___. Evidence for it: ___. Evidence against it: ___.' Replace with one practical belief for 30 days.",
    timeToImplement: "25 minutes",
    energyLevel: "low",
    difficulty: "medium",
    whyItMatters:
      "Behavior changes become easier when the hidden script is visible.",
  },
  {
    id: "mm-02",
    bookId: "secrets-of-the-millionaire-mind",
    bookTitle: "Secrets of the Millionaire Mind",
    author: "T. Harv Eker",
    category: "money-finance",
    principleId: "income-bucket-discipline",
    principleTitle: "Bucket Discipline: Give Every Rupee a Job",
    description:
      "Intentional money buckets (needs, long-term investing, learning, giving, fun) reduce impulsive leakage and decision fatigue. Structure turns discipline into routine.",
    coreConcept: "Clear allocation reduces emotional overspending",
    applicableWhen: [
      "money disappears quickly",
      "no clear monthly structure",
      "impulse spending under stress",
      "inconsistent saving",
    ],
    applicableScenarios: [
      "End of month confusion despite decent income",
      "Savings goals repeatedly delayed",
    ],
    simpleExplanation:
      "Pre-allocate percentages to fixed buckets right after income arrives.",
    microAction:
      "Set 4-5 bucket percentages for next month and automate transfers within 24 hours of payday.",
    timeToImplement: "30 minutes",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "Simple structure protects long-term goals from short-term mood.",
  },
  {
    id: "rmb-01",
    bookId: "richest-man-in-babylon",
    bookTitle: "The Richest Man in Babylon",
    author: "George S. Clason",
    category: "money-finance",
    principleId: "pay-yourself-first-tenth",
    principleTitle: "Pay Yourself First: Keep a Fixed Portion of Every Income",
    description:
      "Wealth starts by keeping part of what you earn before spending decisions expand. A fixed saving percentage builds a base for freedom and investing discipline, even at modest income levels.",
    coreConcept: "Automatic saving comes before lifestyle inflation",
    applicableWhen: [
      "income arrives and disappears quickly",
      "saving is inconsistent",
      "want to build first financial buffer",
      "living month to month despite stable earnings",
    ],
    applicableScenarios: [
      "Raises vanish into new spending habits",
      "Savings happen only in 'good months'",
    ],
    simpleExplanation:
      "Choose a fixed save-first rate (start with 10% if possible). Treat it as non-negotiable, like rent.",
    microAction:
      "Set an automatic transfer on payday for your chosen save-first percentage into a separate account.",
    timeToImplement: "15 minutes setup",
    energyLevel: "low",
    difficulty: "easy",
    whyItMatters:
      "No wealth plan works if nothing is consistently kept.",
  },
  {
    id: "rmb-02",
    bookId: "richest-man-in-babylon",
    bookTitle: "The Richest Man in Babylon",
    author: "George S. Clason",
    category: "money-finance",
    principleId: "guard-principal-seek-counsel",
    principleTitle: "Guard Principal: Invest With Understanding, Not Hype",
    description:
      "Money should be invested where principal is protected and returns are realistic. Chasing exciting stories without competence or trusted counsel often destroys savings.",
    coreConcept: "Capital protection and informed decisions beat speculation",
    applicableWhen: [
      "tempted by quick-return schemes",
      "uncertain about investment choices",
      "following tips without due diligence",
      "fear of missing out on trends",
    ],
    applicableScenarios: [
      "Friends recommend high-risk opportunities you don't understand",
      "You invest based on social proof, then panic",
    ],
    simpleExplanation:
      "Only invest in instruments you can explain simply, and prefer diversified long-term approaches over hot tips.",
    microAction:
      "Before any new investment, write one-page checklist: risk, liquidity, time horizon, and downside case. Skip if unclear.",
    timeToImplement: "30 minutes per decision",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Protecting principal keeps compounding alive.",
  },
  {
    id: "rmb-03",
    bookId: "richest-man-in-babylon",
    bookTitle: "The Richest Man in Babylon",
    author: "George S. Clason",
    category: "money-finance",
    principleId: "debt-discipline-repay-plan",
    principleTitle: "Avoid Consumer Debt Traps and Repay Existing Debt With a Plan",
    description:
      "Unplanned debt steals future income and narrows choices. Debt discipline means avoiding unnecessary borrowing and using a structured repayment approach to regain control.",
    coreConcept: "Cash-flow freedom grows as toxic debt falls",
    applicableWhen: [
      "credit balances growing",
      "minimum-payment cycle",
      "stress about monthly obligations",
      "using debt for lifestyle spending",
    ],
    applicableScenarios: [
      "Income is decent but debt payments block progress",
      "You borrow to maintain image or short-term relief",
    ],
    simpleExplanation:
      "Stop adding new lifestyle debt and follow a visible payoff plan with fixed extra payments.",
    microAction:
      "List all debts by balance and interest. Choose one payoff method (avalanche or snowball) and schedule automatic extra payment this month.",
    timeToImplement: "45 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    whyItMatters:
      "Debt control restores agency faster than income growth alone.",
  },
  {
    id: "wo-01",
    bookId: "work-meaning",
    bookTitle: "Ikigai: The Japanese Concept of Finding Purpose",
    author: "Héctor García & Francesc Miralles",
    category: "work-purpose",
    principleId: "ikigai-purpose-intersection",
    principleTitle: "Ikigai: Your 'Reason for Being' at Work",
    description:
      "Ikigai is the intersection of: (1) what you love, (2) what you're good at, (3) what the world needs, (4) what pays. Most people live in one or two: They love something they're not paid for. Or they're good at something they hate. Or they fill a need but hate it. True fulfillment happens only at the intersection—where all four meet. This isn't always possible, but moving closer increases meaning dramatically.",
    coreConcept: "Fulfillment = intersection of passion, skill, need, and income",
    coreQuote: "Your ikigai is your reason to get out of bed.",
    applicableWhen: [
      "career dissatisfaction",
      "work feels meaningless",
      "strong skills but no passion",
      "passion but no income",
      "considering career change",
      "burnout from misaligned work",
    ],
    applicableScenarios: [
      "You're good at coding but hate it; your passion (art) doesn't pay",
      "You love helping people but undercharge and feel resentful",
      "You have job security but wake up dreading work",
      "You know you want a change but can't articulate the direction",
      "You're successful but feel empty—nobody really needs what you do",
    ],
    simpleExplanation:
      "Draw a circle with 4 sections: Love, Good At, World Needs, Pays. Plot your current work: Is it in all 4 sections? Probably not. Now ask: What small change could move me closer to the center? Maybe it's finding the impact angle in current work. Or moving to a company whose mission you believe in. Or taking unpaid work you love alongside paid work. The goal is moving closer to ikigai, not waiting for perfect alignment.",
    microAction:
      "Draw your ikigai circle (4 overlapping circles). Plot current work. Identify ONE move that brings you closer to center. Small step only.",
    timeToImplement: "30 minutes",
    energyLevel: "medium",
    difficulty: "medium",
    cautionsWhen: [
      "Perfect ikigai is rare—progress, not perfection",
      "Sometimes you must accept trade-offs",
    ],
    whyItMatters:
      "Work is where you spend 80,000+ hours in your lifetime. Finding meaning matters more than salary.",
  },
  {
    id: "wo-02",
    bookId: "work-meaning",
    bookTitle: "Transitions: Making Sense of Life's Changes",
    author: "William Bridges",
    category: "work-purpose",
    principleId: "career-transition-phases",
    principleTitle: "Career Transitions: The 3 Phases Everyone Skips",
    description:
      "Career changes fail when people jump from one job to another without processing the ending. There are 3 phases: (1) ENDING—grieve the old identity, (2) NEUTRAL ZONE—sit with uncertainty, questions, no clear path, (3) NEW BEGINNING—step into new identity. Most people rush from ending to beginning and get stuck in limbo. They're ambiguous, unmotivated, making mistakes. They didn't actually end the old thing. Give yourself permission for all three phases.",
    coreConcept: "Transitions require endings, not just new beginnings",
    coreQuote: "You can't start something new while still holding the old one.",
    applicableWhen: [
      "changing careers",
      "leaving a job",
      "identity shift in work",
      "lost or changing role",
      "starting own business",
      "major role promotion",
      "feeling stuck mid-transition",
    ],
    applicableScenarios: [
      "You quit your corporate job to start a business, but you're sabotaging the new one (still grieving)",
      "You got promoted but feel like an impostor (haven't embodied new identity)",
      "Career change doesn't feel right; you're caught between identities",
      "New role, but old perfectionism/habits don't fit; you feel stuck",
      "You're one foot in, one foot out—can't commit to either path",
    ],
    simpleExplanation:
      "Transitions have three natural phases. Most people only experience them unconsciously, which makes transitions painful and slow. If you NAME the phases: (1) What am I leaving? (2) What is uncertain? (3) What am I becoming? Then you can move through each intentionally. The neutral zone is uncomfortable but necessary—it's where you actually change.",
    microAction:
      "Name your transition phase: Ending, Neutral Zone, or New Beginning. Write what you're grieving, what's uncertain, or what you're becoming. Spend 1 week in that phase before rushing to next.",
    timeToImplement: "Varies (weeks to months)",
    energyLevel: "high",
    difficulty: "hard",
    cautionsWhen: [
      "Don't rush the neutral zone—that's where transformation happens",
      "Discomfort is normal and healthy, not a sign you're failing",
    ],
    whyItMatters:
      "Most failed career changes happen because people didn't actually end the old thing. Honoring all three phases makes transitions successful.",
  },
  {
    id: "si-07",
    bookId: "self-identity",
    bookTitle: "Self-Compassion: The Proven Power of Being Kind to Yourself",
    author: "Kristin Neff",
    category: "self-identity",
    principleId: "self-compassion-kindness",
    principleTitle: "Self-Compassion: You Need It When You Fail (Not When You Succeed)",
    description:
      "Most people beat themselves up when they fail. They believe the pain will motivate them to do better. Research proves the opposite: self-criticism demotivates and triggers shame spirals. Self-compassion—treating yourself with the same kindness you'd give a friend—actually increases motivation AND resilience. It's not self-pity. It's recognition: 'I'm human. I struggle. That's normal. Now what do I need?' Self-compassion has 3 parts: mindfulness (seeing clearly), self-kindness (treating gently), common humanity (knowing others struggle too).",
    coreConcept: "Kindness to self ≠ weakness; it's strength through challenge",
    coreQuote: "You can't shame yourself into being better. You can only motivate yourself through compassion.",
    applicableWhen: [
      "shame spiral after failure",
      "perfectionism-driven exhaustion",
      "self-criticism limiting growth",
      "fear of failure preventing trying",
      "imposter syndrome",
      "feeling like you're not enough",
    ],
    applicableScenarios: [
      "You fail at something and berate yourself for weeks instead of learning",
      "You're so afraid of imperfection that you don't start projects",
      "Mistakes trigger shame spirals where you're 'bad' for a week",
      "You expect perfection from yourself but kindness from others",
      "You won't try new things because failure feels catastrophic",
    ],
    simpleExplanation:
      "Self-compassion is not self-pity. It's responding to struggle (yours) with the same care you'd give to a struggling friend. When you fail: (1) Notice without judgment ('I tried and it didn't work'), (2) Treat yourself kindly ('This is hard; I deserve support'), (3) Remember others fail too ('Everyone struggles; I'm not alone'). This calms your nervous system and opens your thinking to learning, not just shame.",
    microAction:
      "Next time you fail or struggle: Say to yourself what you'd say to a friend. Out loud. Notice the shift from shame to openness.",
    timeToImplement: "1 minute in-the-moment",
    energyLevel: "low",
    difficulty: "medium",
    cautionsWhen: [
      "Not permission to avoid responsibility—still make changes",
      "Not the same as low standards—you can want improvement AND be kind",
    ],
    whyItMatters:
      "Self-criticism creates shame. Shame creates avoidance. Avoidance creates stagnation. Self-compassion creates the safety to grow.",
  },
];

// ============================================================
// Export combined array
export const wisdomKnowledgeBase: WisdomPrinciple[] = [
  ...mentalHealthPrinciples,
  ...relationshipsPrinciples,
  ...workPrinciples,
  ...selfIdentityPrinciples,
  ...habitsLifestylePrinciples,
  ...moneyFinancePrinciples,
];

/**
 * Get all principles for a category
 */
export const getPrinciplesByCategory = (categoryId: string): WisdomPrinciple[] => {
  return wisdomKnowledgeBase.filter((p) => p.category === categoryId);
};

/**
 * Search principles by keywords
 */
export const searchPrinciples = (
  categoryId: string,
  keywords: string[]
): WisdomPrinciple[] => {
  const categoryPrinciples = getPrinciplesByCategory(categoryId);

  return categoryPrinciples.filter((principle) => {
    const allText = [
      principle.principleTitle,
      principle.description,
      principle.coreConcept,
      ...(principle.applicableWhen || []),
      ...(principle.applicableScenarios || []),
    ]
      .join(" ")
      .toLowerCase();

    return keywords.some((keyword) => allText.includes(keyword.toLowerCase()));
  });
};

/**
 * Get principle by ID
 */
export const getPrincipleById = (principleId: string): WisdomPrinciple | null => {
  return wisdomKnowledgeBase.find((p) => p.id === principleId) || null;
};

/**
 * Get all books (deduplicated)
 */
export const getAllBooks = (): WisdomBook[] => {
  const booksMap = new Map<string, WisdomBook>();

  wisdomKnowledgeBase.forEach((principle) => {
    if (!booksMap.has(principle.bookId)) {
      booksMap.set(principle.bookId, {
        bookId: principle.bookId,
        bookTitle: principle.bookTitle,
        author: principle.author,
        category: principle.category,
        principleCount: 0,
        principles: [],
      });
    }

    const book = booksMap.get(principle.bookId)!;
    book.principles.push(principle);
    book.principleCount = book.principles.length;
  });

  return Array.from(booksMap.values());
};

/**
 * Get books by category
 */
export const getBooksByCategory = (categoryId: string): WisdomBook[] => {
  const books = getAllBooks();
  return books.filter((b) => b.category === categoryId);
};
