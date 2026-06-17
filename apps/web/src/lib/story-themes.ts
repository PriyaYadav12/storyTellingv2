export interface StoryTheme {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  tags: string[];
  sample: string;
  color: string;
  bg: string;
  // Landing page fields
  metaTitle: string;
  metaDescription: string;
  headline: string;
  subheadline: string;
  description: string;
  lessons: { title: string; body: string }[];
  whoItsFor: string;
  faqs: { q: string; a: string }[];
}

export const STORY_THEMES: StoryTheme[] = [
  {
    slug: "adventure-quest",
    emoji: "🗺️",
    title: "The Adventure Quest",
    tagline: "Brave journeys into unknown lands",
    tags: ["courage", "exploration", "friendship"],
    sample:
      "Arjun raced through the whispering forest, Lalli by his side. 'The golden key must be here,' Fafa squeaked from Arjun's pocket...",
    color: "var(--lf-sunshine)",
    bg: "rgba(249,199,0,0.1)",
    metaTitle: "Adventure Stories for Children — The Adventure Quest | Lalli Fafa",
    metaDescription:
      "Personalised adventure bedtime stories for children aged 3–8. Your child joins Lalli and Fafa on a brave journey into unknown lands — fully illustrated and narrated in English or Hindi.",
    headline: "The Adventure Quest",
    subheadline: "Brave journeys into unknown lands — with your child as the hero.",
    description:
      "Every Adventure Quest story begins the moment your child steps into it. Alongside Lalli, who knows exactly what to do, and Fafa, who accidentally starts the whole thing, your child races through whispering forests, crosses rope bridges above river gorges, and unlocks doors that no one else could find. The adventure changes every time — but your child is always the one who makes it possible.",
    lessons: [
      {
        title: "Courage in the face of the unknown",
        body: "Adventure stories work by putting your child in genuinely uncertain situations — not dangerous, but genuinely novel — and showing them figuring it out. The confidence from doing that in a story carries into real life.",
      },
      {
        title: "Problem-solving and resourcefulness",
        body: "Every Adventure Quest has a moment where the obvious path is blocked. Your child has to think. Lalli helps, Fafa offers a suggestion that is wrong in a funny way, and your child finds the answer. That process is the lesson.",
      },
      {
        title: "The joy of exploration",
        body: "Curiosity is a skill. Children who are encouraged to explore and discover — even in stories — become children who ask more questions and fear fewer answers.",
      },
    ],
    whoItsFor:
      "Best for children aged 4–8 who love exploration, treasure hunts, maps, and the thrill of not knowing what comes next. Also wonderful for children who need a gentle confidence push — hearing themselves described as brave in a story is one of the most effective ways to build bravery in real life.",
    faqs: [
      {
        q: "What happens in an Adventure Quest story?",
        a: "Your child, alongside Lalli and Fafa, sets off into an unknown world — a whispering forest, a hidden island, a mountain pass with a secret at the top. Fafa usually starts the adventure by finding something strange; Lalli figures out the plan; and your child is the one who makes the key decision that saves the day. Every story ends with the adventure resolved, a small lesson discovered along the way, and your child feeling like someone who can handle whatever comes next.",
      },
      {
        q: "What age is the Adventure Quest theme best for?",
        a: "The Adventure Quest works well from age 3 upwards, but it tends to land hardest for children aged 4 to 8. At this age, children are developmentally drawn to heroes, journeys, and problem-solving — the narrative mirrors exactly what their brain is practicing. Younger children enjoy the excitement; older children engage with the strategy and the choices their character makes.",
      },
      {
        q: "Can the adventure story be narrated in Hindi?",
        a: "Yes — every Lalli Fafa story is available in both English and Hindi. The Hindi narration is built natively into the story, not translated from English, so it carries the same warmth and pacing. For bilingual families, hearing an adventure story in Hindi — one where your child's name is woven into every scene — has a particular magic that English alone cannot replicate.",
      },
    ],
  },
  {
    slug: "kindness-mission",
    emoji: "🤝",
    title: "The Kindness Mission",
    tagline: "Small acts that change everything",
    tags: ["kindness", "empathy", "sharing"],
    sample:
      "Aanya noticed the little bird sitting alone. 'Everyone deserves a friend,' she told Lalli. Together, they built the most wonderful nest...",
    color: "var(--lf-teal)",
    bg: "var(--lf-mint)",
    metaTitle: "Kindness Stories for Children — The Kindness Mission | Lalli Fafa",
    metaDescription:
      "Personalised kindness bedtime stories for children aged 2–8. Your child discovers the power of sharing, empathy, and small acts of care — alongside Lalli and Fafa, in English or Hindi.",
    headline: "The Kindness Mission",
    subheadline: "Small acts that change everything — starting with your child.",
    description:
      "Kindness Mission stories follow your child through a moment where they notice something — a friend left out, an animal in need, a neighbour who could use help — and decide what to do about it. Lalli cheers them on. Fafa, who always means well, helps in his own wonderfully chaotic way. And your child is the one who chooses kindness, feels what that choice costs, and discovers what it gives back.",
    lessons: [
      {
        title: "Empathy — noticing how others feel",
        body: "Before a child can be kind, they have to notice that someone else needs it. Kindness Mission stories slow down that moment of noticing — the bird sitting alone, the friend who was left out — and let your child practice it at a safe distance, in a story.",
      },
      {
        title: "Sharing as strength, not sacrifice",
        body: "The most common mistake in kindness stories is making sharing look like loss. Kindness Mission stories frame generosity the way the Panchatantra always did — as intelligent, as the choice that leads to more. The character who shares ends up with more warmth, more friends, more belonging.",
      },
      {
        title: "Kindness as identity",
        body: "When a child repeatedly hears themselves described as the one who noticed, who helped, who cared — that becomes part of how they see themselves. Not as a rule they follow, but as who they are.",
      },
    ],
    whoItsFor:
      "Ideal for children aged 2–7, and particularly powerful for children working on sharing, handling conflict with friends, or developing awareness of others' feelings. Also wonderful for families navigating a new sibling, a move, or any situation where a child needs a story about connection.",
    faqs: [
      {
        q: "How do kindness stories help children's behaviour?",
        a: "They work through a mechanism psychologists call narrative transportation — when a child becomes absorbed in a story, their brain processes the fictional events as if they were real. A child who inhabits the experience of choosing kindness at personal cost creates an emotional memory of that choice. Emotional memories shape behaviour far more powerfully than rules do. This is why 'be kind' rarely changes anything, but a story where kindness costs something real — and feels good anyway — often does.",
      },
      {
        q: "My child struggles with sharing. Will a Kindness Mission story help?",
        a: "It is one of the most effective tools for exactly this. The key is that the story doesn't lecture — it shows. Your child, as the protagonist, faces a real choice about sharing in a situation that feels genuine, experiences the temptation not to, and then feels what it is like to choose generosity anyway. That complete emotional arc — struggle, choice, resolution — is what creates lasting change. One or two stories won't do it, but regular listening builds something real.",
      },
      {
        q: "What age is the Kindness Mission best for?",
        a: "Kindness stories work from age 2 upwards, but the mechanism varies. For children aged 2–3, the most effective kindness stories involve simple physical acts — sharing a toy, being gentle with an animal. From age 4, children can engage with more subtle empathy — noticing a friend feels left out, understanding why honesty matters even when it's hard. By age 6–7, children can appreciate kindness that requires real courage, and those stories tend to be the most powerful.",
      },
    ],
  },
  {
    slug: "everyday-wonder",
    emoji: "🌟",
    title: "The Everyday Wonder",
    tagline: "Magic hiding in plain sight",
    tags: ["curiosity", "wonder", "imagination"],
    sample:
      "Rohan thought ordinary days were boring. Until Fafa pointed up. 'Look!' Between the clouds — a whole world Rohan had never seen...",
    color: "var(--lf-mango)",
    bg: "rgba(255,107,53,0.08)",
    metaTitle: "Imagination Stories for Children — The Everyday Wonder | Lalli Fafa",
    metaDescription:
      "Personalised imagination and curiosity stories for children. Your child discovers that magic hides in ordinary moments — alongside Lalli and Fafa, in English or Hindi.",
    headline: "The Everyday Wonder",
    subheadline: "Magic was hiding in the ordinary, all along — your child just had to look.",
    description:
      "Everyday Wonder stories begin in the most unremarkable places: a quiet afternoon, a rainy window, a patch of garden that has always been there. But Fafa notices something. And once Fafa notices, everything changes. Your child follows Lalli and Fafa into the hidden world behind the ordinary — the secret life of a puddle, the language the trees are using, the star that only comes out when no one is watching — and discovers that the world is much stranger and richer than it looked.",
    lessons: [
      {
        title: "Curiosity as a way of seeing",
        body: "Everyday Wonder stories don't invent magic — they reveal it. The magic in these stories is always something real: the way light moves through glass, the reason the sky changes colour, the fact that ants have their own roads. Children who hear these stories start noticing more in their own lives.",
      },
      {
        title: "Imagination as a skill",
        body: "Imaginative engagement — the mental work of constructing images, sounds, and worlds from words — is strongly linked to vocabulary development, creative thinking, and emotional intelligence. Everyday Wonder stories ask a lot of this from children, in the best possible way.",
      },
      {
        title: "Gratitude for the present",
        body: "A child who finds a whole world in a cloudy afternoon is a child who has been taught to receive what is already there. That receptiveness — to small pleasures, ordinary moments, the goodness that doesn't announce itself — is one of the most durable gifts a story can give.",
      },
    ],
    whoItsFor:
      "Wonderful for naturally curious children aged 3–7 who ask 'why' about everything, and also for children who seem bored or understimulated — sometimes what looks like restlessness is a child who hasn't yet learned to look. Also beautiful for families who want stories with a quieter, more contemplative quality — less adventure, more wonder.",
    faqs: [
      {
        q: "What makes an Everyday Wonder story different from a regular adventure story?",
        a: "Where an adventure story takes your child out of the ordinary world into something extraordinary, an Everyday Wonder story stays right where you are — and shows your child that the extraordinary was always there. The setting might be a familiar garden, a rainy afternoon, a kitchen window. The magic is not in a faraway land; it is in the thing that was sitting right there, unnoticed, until Fafa pointed at it. These stories tend to be quieter in energy, richer in imagery, and particularly good for bedtime.",
      },
      {
        q: "How do imagination stories benefit young children?",
        a: "Research on imaginative engagement in children — what researchers call mental imagery vividness — links it strongly to vocabulary development, creative thinking, and emotional intelligence. When a child listens to a story without visuals and has to construct the scene entirely in their mind, that active construction is itself a developmental process. Everyday Wonder stories are particularly rich in imagery for exactly this reason — they ask your child to imagine worlds in great sensory detail.",
      },
      {
        q: "What age is the Everyday Wonder theme best for?",
        a: "The Everyday Wonder tends to work particularly well from age 3 to 7. Younger children in this range are naturally animistic — they believe the world around them has feelings and intention — so stories that confirm this feel true rather than fanciful. Older children in this range are beginning to understand that the world is more complex than it seems, and Wonder stories meet that curiosity exactly. The theme can also work beautifully for older children who are especially imaginative or creative.",
      },
    ],
  },
  {
    slug: "courage-stars",
    emoji: "🦁",
    title: "Courage Under Stars",
    tagline: "Face your fears, find your strength",
    tags: ["bravery", "self-belief", "growth"],
    sample:
      "Maya was scared of the dark. But tonight was different. Lalli whispered, 'Darkness isn't empty. It's just waiting for your light...'",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    metaTitle: "Courage Stories for Children — Courage Under Stars | Lalli Fafa",
    metaDescription:
      "Personalised courage bedtime stories for children facing fears or new challenges. Your child finds their strength alongside Lalli and Fafa — illustrated and narrated in English or Hindi.",
    headline: "Courage Under Stars",
    subheadline: "For children who are learning that being scared and being brave are the same moment.",
    description:
      "Courage Under Stars stories are built around one idea: real courage isn't the absence of fear. It's the decision to do the thing anyway, while the fear is still there. Your child — as the story's hero — faces something genuinely difficult. Not a monster, not a danger, but something real: the dark, a new place, a moment where they don't know what to do. And Lalli, who has been afraid before, is there to say: this is exactly the kind of thing you can handle.",
    lessons: [
      {
        title: "Courage is not the absence of fear",
        body: "The single most important thing a courage story can teach a child is that being afraid is not the same as being unable to act. Stories where the character is visibly scared — where the fear is real and specific — and acts anyway are the ones children carry with them into frightening moments of their own.",
      },
      {
        title: "Self-belief built through narrative evidence",
        body: "When a child hears themselves described as the one who was scared but didn't run — the one who held Fafa's hand in the dark part, the one who opened the door even though they didn't know what was behind it — those descriptions become part of how they see themselves. Not as praise. As evidence.",
      },
      {
        title: "The safety of a known ending",
        body: "Courage Under Stars stories always resolve. The fear is real, but the ending is safe. This is developmentally important: children who can experience the tension of a frightening story from the safety of their bed are practicing emotional regulation — learning that scary feelings pass, that the dark part of the story is not the whole story.",
      },
    ],
    whoItsFor:
      "Ideal for children aged 3–8 who are navigating a specific fear — the dark, new places, unfamiliar people, starting school, a new sibling. Also powerful for children who describe themselves as 'not brave' or who avoid challenge. Hearing a character with their name and their characteristics described as brave — even once — can shift a self-perception in ways that reassurance cannot.",
    faqs: [
      {
        q: "Can a bedtime story help a child who is scared of the dark?",
        a: "Yes — and it is one of the most evidence-backed approaches. Stories that feature a child-like character facing and overcoming a specific fear create what psychologists call a vicarious emotional experience: the child inhabits the experience of being afraid and managing it, in the safety of a story. Over time, this builds an emotional memory of having handled fear — a memory the child can draw on in real situations. For fear of the dark specifically, a story where the dark is reframed — as quiet rather than threatening, as waiting for your light rather than hiding something terrible — can genuinely shift how a child experiences it.",
      },
      {
        q: "My child is starting school soon. Is Courage Under Stars the right theme?",
        a: "It is one of the best choices for this transition. Stories about starting something new — a new place, new faces, not knowing the rules yet — work powerfully for children approaching school because they offer a rehearsal. Your child gets to experience a version of themselves navigating the unfamiliar, feeling the nerves, and coming out the other side. That narrative rehearsal builds real confidence. Lalli is particularly good in these stories: she has been the new person before, and she knows what it feels like.",
      },
      {
        q: "What is the difference between a courage story and a story that just tells a child to be brave?",
        a: "Everything. A story that tells a child to be brave delivers an instruction. A courage story delivers an experience. The character — your child — is genuinely afraid. The fear is specific and real. And the choice to act despite it costs something. That complete emotional arc — fear, choice, action, resolution — is what creates an emotional memory. Instructions go in one ear; emotional memories shape who we become.",
      },
    ],
  },
  {
    slug: "big-dream",
    emoji: "🎯",
    title: "The Big Dream",
    tagline: "Every great journey starts with one step",
    tags: ["perseverance", "goals", "belief"],
    sample:
      "Dev wanted to be the best kite-flyer in all of India. Fafa had a plan. 'We'll need string, courage, and one really windy day...'",
    color: "var(--lf-sunshine)",
    bg: "rgba(249,199,0,0.1)",
    metaTitle: "Perseverance Stories for Children — The Big Dream | Lalli Fafa",
    metaDescription:
      "Personalised perseverance and growth mindset stories for children. Your child discovers that big dreams take small steps — alongside Lalli and Fafa, in English or Hindi.",
    headline: "The Big Dream",
    subheadline: "Every big dream starts small. Your child's story starts tonight.",
    description:
      "Big Dream stories follow your child through the full arc of trying something hard: the excitement at the start, the moment it gets harder than expected, the temptation to give up, and the discovery — not of instant success, but of what it feels like to keep going. Lalli has goals of her own and understands exactly how this feels. Fafa tries something wildly ambitious with full confidence and fails in a way that is funny and kind. And your child learns that the trying is the point.",
    lessons: [
      {
        title: "Growth mindset — effort over outcome",
        body: "Big Dream stories deliberately show the character failing partway through. Not dramatically, not catastrophically, but genuinely — the kite crashes, the tower falls, the plan doesn't work. The story then shows what happens next: the character adjusts, tries differently, keeps going. That sequence is the lesson. Psychologists call it growth mindset; children just call it a good story.",
      },
      {
        title: "The value of specific, small goals",
        body: "Every Big Dream story breaks a large ambition into concrete steps. Your child's character doesn't just 'want to be the best kite-flyer' — they learn to hold the string at a certain angle, they practice in the wind, they get one thing right at a time. The satisfaction of small, specific progress is itself a lesson that transfers to school, sport, and life.",
      },
      {
        title: "Resilience as a learnable skill",
        body: "Children who hear stories about characters who bounce back from setbacks — who see failure as information rather than verdict — develop resilience as a narrative expectation. Not 'I never fail' but 'failing is part of the story, not the end of it.'",
      },
    ],
    whoItsFor:
      "Wonderful for children aged 4–8 who give up easily, who say 'I can't do it' quickly, or who are afraid to try things they might not succeed at. Also powerful before any new challenge: a new instrument, a new sport, a competitive situation. The Big Dream theme is particularly loved by parents who want to nurture a growth mindset without using the phrase 'growth mindset.'",
    faqs: [
      {
        q: "How do stories teach children to persevere?",
        a: "Through the character's journey, not through instruction. The most effective perseverance stories show the character failing, feeling the frustration of that, and then making a specific choice to try again differently. That emotional arc — effort, setback, adjustment, renewed effort — gives the child a narrative template for their own hard moments. When they hit a wall in real life, they have a story they have already lived through in their imagination, showing them what 'try again' looks like.",
      },
      {
        q: "My child gives up the moment something gets hard. Will this help?",
        a: "Stories are one of the most effective tools for exactly this pattern. The reason it helps is that it works through identity rather than instruction. When a child repeatedly hears a character with their name and their characteristics choosing to keep going — when that persistence is framed not as virtue but as simply what that character does — it starts to feel like who they are. The shift from 'I should try again' to 'I'm the kind of person who tries again' is the shift that sticks.",
      },
      {
        q: "What age is The Big Dream theme best for?",
        a: "The Big Dream works from around age 4, when children begin to understand goals and sequences — the idea that you want something, you work toward it, and the work has steps. The theme is particularly powerful for children aged 5 to 8, who are old enough to feel the genuine frustration of things not working out, and young enough that a story can still shape how they interpret that frustration. Younger children aged 3 to 4 enjoy the energy and enthusiasm of Big Dream stories even if the deeper lesson lands less explicitly.",
      },
    ],
  },
  {
    slug: "natures-secret",
    emoji: "💚",
    title: "Nature's Secret",
    tagline: "The earth has stories to tell",
    tags: ["nature", "environment", "wonder"],
    sample:
      "Isha planted a tiny seed. 'Will it grow?' she asked. Lalli smiled. 'Everything that matters starts small. Just like you did...'",
    color: "var(--lf-teal)",
    bg: "var(--lf-mint)",
    metaTitle: "Nature Stories for Children — Nature's Secret | Lalli Fafa",
    metaDescription:
      "Personalised nature bedtime stories for children. Your child discovers the magic of the natural world alongside Lalli and Fafa — illustrated and narrated in English or Hindi.",
    headline: "Nature's Secret",
    subheadline: "The earth has been telling stories for thousands of years. This one is yours.",
    description:
      "Nature's Secret stories place your child at the centre of the natural world — not observing it from a distance, but in relationship with it. A river that needs help. A tree that remembers things. An animal that has been trying to say something for weeks but nobody stopped to listen. Lalli knows how to listen to the natural world; Fafa talks to it directly (and is sometimes answered). Your child is the one who understands what the natural world is asking, and finds a way to help.",
    lessons: [
      {
        title: "The natural world as a community, not a backdrop",
        body: "Nature's Secret stories treat rivers, trees, and animals as characters — not as decoration. When a child grows up hearing stories where the natural world has feelings, needs, and voices, they develop a relationship with nature that no classroom lesson can replicate. India's storytelling tradition has always known this: the Panchatantra's wisdom lives in animals, not abstractions.",
      },
      {
        title: "Care for the environment through empathy",
        body: "Environmental awareness in children comes most durably from empathy, not information. A child who has heard a story about a river that needs help, told in a voice they love, from the perspective of a character who is them, will carry that empathy into adult decisions. The story is the seed; the years grow the tree.",
      },
      {
        title: "Patience and the rhythms of the natural world",
        body: "Nature moves slowly. Seeds take time. Rivers take long routes. Nature's Secret stories have a different pace from adventure stories — quieter, more patient, more attentive to small changes. That quality of attention is itself a lesson in a world that rewards speed.",
      },
    ],
    whoItsFor:
      "Wonderful for children aged 3–8 who love animals, plants, and the outdoors — children who stop to look at insects, who ask why leaves change colour, who want to keep every creature they find. Also powerful for families wanting to nurture environmental care and a sense of responsibility toward the natural world, or for children who are drawn to quieter, more contemplative stories at bedtime.",
    faqs: [
      {
        q: "How do nature stories build environmental awareness in children?",
        a: "Through empathy rather than information. A child who hears a story about a river that needs help — told from the perspective of a character who is them, in a voice they trust — develops an emotional relationship with that river. That emotional relationship is far more durable than any factual lesson about the environment. India's storytelling tradition has always understood this: the Panchatantra teaches values through animals because moral lessons land deeper when they are felt rather than explained.",
      },
      {
        q: "Do the Nature's Secret stories connect to Indian landscapes and traditions?",
        a: "Yes — this is central to how they are written. Indian mythology and folk tradition have always placed the natural world at the heart of story: sacred rivers, divine trees, animals as vehicles for gods, forests as places of wisdom. Nature's Secret stories draw on this tradition, placing your child in relationship with the natural world as Indian storytelling has always done — not as an observer, but as a participant. The neem tree, the monsoon, the night sky over a village — these are the settings your child belongs in.",
      },
      {
        q: "What age is Nature's Secret best for?",
        a: "Nature's Secret works beautifully from age 3 upwards. Young children aged 3 to 5 are naturally animistic — they believe the world around them has feelings and intentions — so stories that treat trees and rivers as characters feel intuitively true rather than fanciful. Older children aged 6 to 8 can engage with more nuanced ideas about care and responsibility. The theme tends to appeal particularly to children who are sensitive, observant, and drawn to quiet and beauty.",
      },
    ],
  },
];

export function getStoryTheme(slug: string): StoryTheme | undefined {
  return STORY_THEMES.find((t) => t.slug === slug);
}
