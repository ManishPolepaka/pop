/**
 * Sentence-level tap options per question (aligned with wisdom RAG vocabulary).
 * Balanced tones: struggle, mixed, steady, growth—plus a "next chapter" q6 per category.
 * Merged into questions via getCategoryQuestions().
 */

export type InsightChoiceRecord = Record<string, Record<string, { id: string; label: string }[]>>;

export const INSIGHT_CHOICES: InsightChoiceRecord = {
  "mental-health": {
    q1: [
      {
        id: "mh-q1-a",
        label:
          "Anxious, wired, or on edge—even when I can't point to a single cause.",
      },
      {
        id: "mh-q1-b",
        label:
          "Low, empty, or numb—I go flat or shut down more than I explode.",
      },
      {
        id: "mh-q1-c",
        label:
          "Angry, irritable, or resentful—I feel it but don't always know what to do with it.",
      },
      {
        id: "mh-q1-d",
        label:
          "Overwhelmed—too many feelings or thoughts at once; hard to sort.",
      },
      {
        id: "mh-q1-e",
        label:
          "Mostly steady lately—I'm reflecting on patterns, not in an acute storm.",
      },
    ],
    q2: [
      {
        id: "mh-q2-a",
        label:
          "I distract—phone, food, TV, scrolling—anything so I don't have to sit in it.",
      },
      {
        id: "mh-q2-b",
        label:
          "I pour into work or tasks so I don't have to feel it.",
      },
      {
        id: "mh-q2-c",
        label:
          "I withdraw from people or cancel—less visible, less risk.",
      },
      {
        id: "mh-q2-d",
        label:
          "I snap, argue, or vent—then often feel guilty after.",
      },
      {
        id: "mh-q2-e",
        label:
          "I pause, move my body, talk to someone, or journal—imperfect, but I'm building skills.",
      },
    ],
    q3: [
      {
        id: "mh-q3-a",
        label:
          "Relief is brief—the same feeling comes back pretty soon.",
      },
      {
        id: "mh-q3-b",
        label:
          "I feel numb or checked out instead of better.",
      },
      {
        id: "mh-q3-c",
        label:
          "Calm briefly, then shame or anxiety hits harder later.",
      },
      {
        id: "mh-q3-d",
        label:
          "Good enough that I repeat it—even though it isn't fixing the root.",
      },
      {
        id: "mh-q3-e",
        label:
          "Mixed—or I'm still learning to notice what happens next.",
      },
    ],
    q4: [
      {
        id: "mh-q4-a",
        label:
          "That I'd be swallowed by the feeling if I stopped running.",
      },
      {
        id: "mh-q4-b",
        label:
          "Judgment, rejection, or being \"too much\" for people I care about.",
      },
      {
        id: "mh-q4-c",
        label:
          "I'd have to face something I've avoided for a long time.",
      },
      {
        id: "mh-q4-d",
        label:
          "I'd lose control or say or do something I'd regret.",
      },
      {
        id: "mh-q4-e",
        label:
          "Less crisis—I'm naming tradeoffs, boundaries, or needs I haven't voiced.",
      },
    ],
    q5: [
      {
        id: "mh-q5-a",
        label:
          "Home growing up—what was modeled, shouted, or never talked about.",
      },
      {
        id: "mh-q5-b",
        label:
          "School, sports, or jobs—performance, punishment, praise.",
      },
      {
        id: "mh-q5-c",
        label:
          "Culture or identity messages—be strong, grateful, productive, fine.",
      },
      {
        id: "mh-q5-d",
        label:
          "A hard season—loss, burnout, betrayal—that rewired my baseline.",
      },
      {
        id: "mh-q5-e",
        label:
          "I'm still mapping it—therapy, books, or friends are helping me retell the story.",
      },
    ],
    q6: [
      {
        id: "mh-q6-a",
        label:
          "Safety first—stay regulated before I analyze myself.",
      },
      {
        id: "mh-q6-b",
        label:
          "Kindness toward myself—less harsh self-talk.",
      },
      {
        id: "mh-q6-c",
        label:
          "Naming feelings without drowning in them.",
      },
      {
        id: "mh-q6-d",
        label:
          "Connection—one honest conversation or steady support.",
      },
      {
        id: "mh-q6-e",
        label:
          "Honest pacing—small steps, not fixing everything at once.",
      },
    ],
  },
  relationships: {
    q1: [
      {
        id: "rel-q1-a",
        label:
          "How insecure or needy I feel—even when I seem fine on the outside.",
      },
      {
        id: "rel-q1-b",
        label:
          "Anger, jealousy, or resentment I don't know how to share cleanly.",
      },
      {
        id: "rel-q1-c",
        label:
          "Parts of my past I'm ashamed of or fear they'd judge.",
      },
      {
        id: "rel-q1-d",
        label:
          "Exhaustion from performing \"fine\" when I'm really not.",
      },
      {
        id: "rel-q1-e",
        label:
          "Things are mostly good—I'm still reflecting on old habits of hiding or hedging.",
      },
    ],
    q2: [
      {
        id: "rel-q2-a",
        label:
          "Distance—I go cold, busy, or pick friction.",
      },
      {
        id: "rel-q2-b",
        label:
          "Humor or topic change—I keep it light.",
      },
      {
        id: "rel-q2-c",
        label:
          "Overshare sideways—the real thing stays hidden.",
      },
      {
        id: "rel-q2-d",
        label:
          "Pursuit or reassurance—I ask for more than I wish I needed.",
      },
      {
        id: "rel-q2-e",
        label:
          "I'm practicing staying present—naming what's true more often.",
      },
    ],
    q3: [
      {
        id: "rel-q3-a",
        label:
          "They often feel me pull back or get defensive.",
      },
      {
        id: "rel-q3-b",
        label:
          "They lean in and that paradoxically scares me more.",
      },
      {
        id: "rel-q3-c",
        label:
          "Mixed signals—both of us unsure what just happened.",
      },
      {
        id: "rel-q3-d",
        label:
          "We glide past it—nothing really shifts.",
      },
      {
        id: "rel-q3-e",
        label:
          "We're learning repair—messy but not frozen.",
      },
    ],
    q4: [
      {
        id: "rel-q4-a",
        label:
          "Myself—from rejection if they saw all of me.",
      },
      {
        id: "rel-q4-b",
        label:
          "Them—from my \"messy\" truths—or so I believe.",
      },
      {
        id: "rel-q4-c",
        label:
          "An image I've invested in keeping up.",
      },
      {
        id: "rel-q4-d",
        label:
          "Peace—I fear honesty would blow things up.",
      },
      {
        id: "rel-q4-e",
        label:
          "Balance—I'm trying to protect honesty and repair, not only myself.",
      },
    ],
    q5: [
      {
        id: "rel-q5-a",
        label:
          "Family—how love, silence, and conflict were modeled.",
      },
      {
        id: "rel-q5-b",
        label:
          "Early friendships or bullying—what felt safe.",
      },
      {
        id: "rel-q5-c",
        label:
          "Past relationships that rewarded hiding or chasing.",
      },
      {
        id: "rel-q5-d",
        label:
          "Culture or gender rules about need, pride, and vulnerability.",
      },
      {
        id: "rel-q5-e",
        label:
          "I'm still piecing it together—mixed sources.",
      },
    ],
    q6: [
      {
        id: "rel-q6-a",
        label:
          "Emotional safety—I can say real things without catastrophe.",
      },
      {
        id: "rel-q6-b",
        label:
          "Honest pacing—timing and depth I can sustain.",
      },
      {
        id: "rel-q6-c",
        label:
          "Repair after rupture—not perfect peace only.",
      },
      {
        id: "rel-q6-d",
        label:
          "Depth without losing myself—closeness and boundaries both.",
      },
      {
        id: "rel-q6-e",
        label:
          "Warmth and play—not only processing hard stuff.",
      },
    ],
  },
  "work-purpose": {
    q1: [
      {
        id: "wp-q1-a",
        label:
          "A pivot, promotion, or project I've postponed for a long time.",
      },
      {
        id: "wp-q1-b",
        label:
          "Putting skills or work out there—applications, portfolio, visibility.",
      },
      {
        id: "wp-q1-c",
        label:
          "Protecting boundaries—or leaving what drains me.",
      },
      {
        id: "wp-q1-d",
        label:
          "Making something meaningful—not only fighting fires.",
      },
      {
        id: "wp-q1-e",
        label:
          "I'm actually moving—I'm reflecting on pace, doubt, or sustainability.",
      },
    ],
    q2: [
      {
        id: "wp-q2-a",
        label:
          "Busywork and \"I'll start tomorrow.\"",
      },
      {
        id: "wp-q2-b",
        label:
          "Safer tasks instead of the important one.",
      },
      {
        id: "wp-q2-c",
        label:
          "Endless prep—little shipping or deciding.",
      },
      {
        id: "wp-q2-d",
        label:
          "Talking without concrete next steps.",
      },
      {
        id: "wp-q2-e",
        label:
          "Steady progress with friction—I'm not frozen, just tuning.",
      },
    ],
    q3: [
      {
        id: "wp-q3-a",
        label:
          "Public failure—or looking foolish.",
      },
      {
        id: "wp-q3-b",
        label:
          "Success that raises the bar—I can't sustain expectations.",
      },
      {
        id: "wp-q3-c",
        label:
          "Finding out I'm not as capable as I hoped.",
      },
      {
        id: "wp-q3-d",
        label:
          "Losing stability if I rock the boat.",
      },
      {
        id: "wp-q3-e",
        label:
          "Naming what I want—that vulnerability itself.",
      },
    ],
    q4: [
      {
        id: "wp-q4-a",
        label:
          "That I'm not enough—talent, discipline, or luck.",
      },
      {
        id: "wp-q4-b",
        label:
          "That I wasted years on the wrong track.",
      },
      {
        id: "wp-q4-c",
        label:
          "That I can't trust my judgment about what's worth chasing.",
      },
      {
        id: "wp-q4-d",
        label:
          "Being remembered as someone who tried and fell short.",
      },
      {
        id: "wp-q4-e",
        label:
          "Less catastrophic—I'd adjust and keep going; I fear the disappointment in between.",
      },
    ],
    q5: [
      {
        id: "wp-q5-a",
        label:
          "Parents' messages about security, prestige, or struggle.",
      },
      {
        id: "wp-q5-b",
        label:
          "School and early jobs—what got praised or punished.",
      },
      {
        id: "wp-q5-c",
        label:
          "Mentors or managers who modeled one path.",
      },
      {
        id: "wp-q5-d",
        label:
          "Money pressure or caregiving—I didn't choose from pure preference.",
      },
      {
        id: "wp-q5-e",
        label:
          "Still unpacking—many voices shaped this.",
      },
    ],
    q6: [
      {
        id: "wp-q6-a",
        label:
          "Clarity—a smaller honest next step I can actually take.",
      },
      {
        id: "wp-q6-b",
        label:
          "Courage to ship something imperfect.",
      },
      {
        id: "wp-q6-c",
        label:
          "Sustainable pace—not only heroics.",
      },
      {
        id: "wp-q6-d",
        label:
          "Alignment—work that fits my values and energy.",
      },
      {
        id: "wp-q6-e",
        label:
          "Stability—building from a steady base, not constant revolution.",
      },
    ],
  },
  "self-identity": {
    q1: [
      {
        id: "si-q1-a",
        label:
          "I'm behind—late, slow, or ordinary compared to some story in my head.",
      },
      {
        id: "si-q1-b",
        label:
          "I'm lazy or weak when I struggle to keep up.",
      },
      {
        id: "si-q1-c",
        label:
          "I'm only liked if I'm useful or impressive.",
      },
      {
        id: "si-q1-d",
        label:
          "I'm lost under the roles I perform.",
      },
      {
        id: "si-q1-e",
        label:
          "I'm growing—old stories echo but I'm questioning them.",
      },
    ],
    q2: [
      {
        id: "si-q2-a",
        label:
          "I replay faults and shrink wins.",
      },
      {
        id: "si-q2-b",
        label:
          "I compare up and collect evidence I'm lacking.",
      },
      {
        id: "si-q2-c",
        label:
          "I assume judgment without checking.",
      },
      {
        id: "si-q2-d",
        label:
          "One bad stretch becomes \"that's who I am.\"",
      },
      {
        id: "si-q2-e",
        label:
          "I notice both—I try to widen the evidence I allow.",
      },
    ],
    q3: [
      {
        id: "si-q3-a",
        label:
          "Take risks I'd written off as \"not for someone like me.\"",
      },
      {
        id: "si-q3-b",
        label:
          "Rest without earning it.",
      },
      {
        id: "si-q3-c",
        label:
          "Speak up where I used to shrink.",
      },
      {
        id: "si-q3-d",
        label:
          "Choose fit over image.",
      },
      {
        id: "si-q3-e",
        label:
          "Already experimenting—small ways the story loosens.",
      },
    ],
    q4: [
      {
        id: "si-q4-a",
        label:
          "An excuse not to try—the familiar \"underdog\" comfort.",
      },
      {
        id: "si-q4-b",
        label:
          "Permission to stay small—\"that's just how I am.\"",
      },
      {
        id: "si-q4-c",
        label:
          "Bonds built on joking about how we're broken together.",
      },
      {
        id: "si-q4-d",
        label:
          "Illusion of control—if I'm the problem I don't have to change other things.",
      },
      {
        id: "si-q4-e",
        label:
          "Not sure—habits layered on this story for years.",
      },
    ],
    q5: [
      {
        id: "si-q5-a",
        label:
          "Caregivers—in words and what they modeled daily.",
      },
      {
        id: "si-q5-b",
        label:
          "Teachers, coaches, early bosses.",
      },
      {
        id: "si-q5-c",
        label:
          "Peers and exclusion.",
      },
      {
        id: "si-q5-d",
        label:
          "Partners or intense relationships.",
      },
      {
        id: "si-q5-e",
        label:
          "No single villain—culture, feeds, slow absorption.",
      },
    ],
    q6: [
      {
        id: "si-q6-a",
        label:
          "Self-respect—even on ordinary days.",
      },
      {
        id: "si-q6-b",
        label:
          "Fewer cruel absolutes in how I label myself.",
      },
      {
        id: "si-q6-c",
        label:
          "Trying things without needing a final verdict.",
      },
      {
        id: "si-q6-d",
        label:
          "Belonging that doesn't require performing.",
      },
      {
        id: "si-q6-e",
        label:
          "Coherence—actions that match what I say I value.",
      },
    ],
  },
  "habits-lifestyle": {
    q1: [
      {
        id: "hl-q1-a",
        label:
          "Late-night scrolling or sleep debt—revenge bedtime.",
      },
      {
        id: "hl-q1-b",
        label:
          "Food, drink, or numbing when I'm depleted.",
      },
      {
        id: "hl-q1-c",
        label:
          "Saying yes until I'm empty—I can't disappoint people.",
      },
      {
        id: "hl-q1-d",
        label:
          "Skipping movement, meals, or daylight when I'm slammed.",
      },
      {
        id: "hl-q1-e",
        label:
          "Spiraling thoughts—or a habit I'm honestly proud of improving.",
      },
    ],
    q2: [
      {
        id: "hl-q2-a",
        label:
          "\"I deserve this escape today.\"",
      },
      {
        id: "hl-q2-b",
        label:
          "\"I'll start Monday / after this week / when things calm down.\"",
      },
      {
        id: "hl-q2-c",
        label:
          "\"It's not that bad compared to others.\"",
      },
      {
        id: "hl-q2-d",
        label:
          "\"I don't have capacity for this habit right now.\"",
      },
      {
        id: "hl-q2-e",
        label:
          "\"I'm experimenting—cuts, swaps, support—imperfectly.\"",
      },
    ],
    q3: [
      {
        id: "hl-q3-a",
        label:
          "Mix of real stress and comfortable blur.",
      },
      {
        id: "hl-q3-b",
        label:
          "Mostly excuse—change scares me more than the habit.",
      },
      {
        id: "hl-q3-c",
        label:
          "Real exhaustion—life gives no off-ramp.",
      },
      {
        id: "hl-q3-d",
        label:
          "I haven't honestly tested the excuse.",
      },
      {
        id: "hl-q3-e",
        label:
          "I've tested it—parts of the story were wrong.",
      },
    ],
    q4: [
      {
        id: "hl-q4-a",
        label:
          "Loneliness, boredom, or emptiness I buffer.",
      },
      {
        id: "hl-q4-b",
        label:
          "Anxiety or harsh self-talk in stillness.",
      },
      {
        id: "hl-q4-c",
        label:
          "Anger or grief I'm not ready to face.",
      },
      {
        id: "hl-q4-d",
        label:
          "Bigger responsibility I'd own without the loop.",
      },
      {
        id: "hl-q4-e",
        label:
          "Mostly stress and defaults—not a deep void; still worth changing.",
      },
    ],
    q5: [
      {
        id: "hl-q5-a",
        label:
          "Halve the habit for three days—track what happens.",
      },
      {
        id: "hl-q5-b",
        label:
          "One minute of breath or walk at the first urge.",
      },
      {
        id: "hl-q5-c",
        label:
          "Tell one person I'm experimenting.",
      },
      {
        id: "hl-q5-d",
        label:
          "Log triggers without judgment.",
      },
      {
        id: "hl-q5-e",
        label:
          "Swap one round for something that actually restores me.",
      },
    ],
    q6: [
      {
        id: "hl-q6-a",
        label:
          "Energy—I need sustainable fuel, not spikes.",
      },
      {
        id: "hl-q6-b",
        label:
          "Simplicity—fewer decisions, clearer defaults.",
      },
      {
        id: "hl-q6-c",
        label:
          "Kindness to my body without shame loops.",
      },
      {
        id: "hl-q6-d",
        label:
          "Accountability that doesn't humiliate me.",
      },
      {
        id: "hl-q6-e",
        label:
          "Proof small change can stick—patience over heroics.",
      },
    ],
  },
  "money-finance": {
    q1: [
      {
        id: "mf-q1-a",
        label:
          "There's never enough—or if I relax financially, I'm afraid something bad will catch me.",
      },
      {
        id: "mf-q1-b",
        label:
          "People with money are greedy—or I'd dislike myself if I earned a lot without \"proving\" I'm good first.",
      },
      {
        id: "mf-q1-c",
        label:
          "Money is mostly practical—I want clarity and systems more than drama; I'm not attached to a shame story.",
      },
      {
        id: "mf-q1-d",
        label:
          "Money can be care, freedom, and generosity—I'm learning that it's okay to want stability and joy.",
      },
      {
        id: "mf-q1-e",
        label:
          "I'm still figuring it out—I hear mixed messages from family, culture, and my own hopes more than one fixed belief.",
      },
    ],
    q2: [
      {
        id: "mf-q2-a",
        label:
          "I impulse-spend or \"treat myself\" when I'm drained—it lifts me for a moment.",
      },
      {
        id: "mf-q2-b",
        label:
          "I tighten up—I hoard, check accounts a lot, or freeze spending even when some spending would be reasonable.",
      },
      {
        id: "mf-q2-c",
        label:
          "I postpone opening apps or bills until I feel calm—I need bandwidth before I face numbers.",
      },
      {
        id: "mf-q2-d",
        label:
          "I grind harder, chase overtime, or compare myself to others when I'm stressed.",
      },
      {
        id: "mf-q2-e",
        label:
          "I'm mostly steady—I have habits that still work when life gets messy; emotions don't usually hijack money.",
      },
    ],
    q3: [
      {
        id: "mf-q3-a",
        label:
          "Protecting people who depend on me if costs rise, health shifts, or something breaks.",
      },
      {
        id: "mf-q3-b",
        label:
          "Shame about past choices—or fear of looking irresponsible or \"behind\" compared to peers.",
      },
      {
        id: "mf-q3-c",
        label:
          "Building consistency—small wins and boundaries matter more than a perfect plan.",
      },
      {
        id: "mf-q3-d",
        label:
          "Choosing what matters—tradeoffs between lifestyle, savings, giving, and what looks good online.",
      },
      {
        id: "mf-q3-e",
        label:
          "Naming it is hard—the stress feels vague or I bounce between optimism and panic.",
      },
    ],
    q4: [
      {
        id: "mf-q4-a",
        label:
          "Rest, travel, or health—invest in my body and nervous system without bargaining with guilt.",
      },
      {
        id: "mf-q4-b",
        label:
          "Trade time I'd never get back—different work, caregiving, or creativity without money as the veto.",
      },
      {
        id: "mf-q4-c",
        label:
          "Help family or causes I care about—from a grounded place, not constant fear.",
      },
      {
        id: "mf-q4-d",
        label:
          "Build savings, skills, or a project I've been postponing—I want proof I'm moving.",
      },
      {
        id: "mf-q4-e",
        label:
          "A simpler, slower life—enough by design; less hustle and clearer yes/no.",
      },
    ],
    q5: [
      {
        id: "mf-q5-a",
        label:
          "Parents or caregivers—what they said about money or the silence while money stressed the household.",
      },
      {
        id: "mf-q5-b",
        label:
          "What we had or didn't have growing up—scarcity, comfort, or unpredictability.",
      },
      {
        id: "mf-q5-c",
        label:
          "Culture, faith, or stories about virtue, greed, and who \"deserves\" wealth.",
      },
      {
        id: "mf-q5-d",
        label:
          "A setback or crisis—job loss, debt, or a mistake that rewired how I think about risk.",
      },
      {
        id: "mf-q5-e",
        label:
          "Peers and media—comparison and lifestyle images when I was forming my story.",
      },
    ],
    q6: [
      {
        id: "mf-q6-a",
        label:
          "Safety first—buffer, basics covered, fewer surprises; I want to breathe.",
      },
      {
        id: "mf-q6-b",
        label:
          "Clarity—know what I earn, spend, and owe without avoiding the picture.",
      },
      {
        id: "mf-q6-c",
        label:
          "Peace with myself—less shame about earnings and fewer harsh comparisons.",
      },
      {
        id: "mf-q6-d",
        label:
          "Growth—earn more, invest in skills, or build something that compounds.",
      },
      {
        id: "mf-q6-e",
        label:
          "Alignment—money choices that match my values, relationships, and the life I actually want.",
      },
    ],
  },
};
