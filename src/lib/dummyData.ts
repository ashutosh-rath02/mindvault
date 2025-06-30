import { Note } from '../types';

export const dummyNotes: Omit<Note, 'user_id'>[] = [
  // Work Category - Various emotions
  {
    id: 'note-1',
    title: 'Q4 Project Planning Meeting',
    content: `Had an incredibly productive meeting today with the entire product team. We outlined our roadmap for Q4 and I'm genuinely excited about the direction we're heading. The new feature set we discussed could be a game-changer for our users.

Key decisions made:
- Launch the mobile app by November
- Implement AI-powered recommendations
- Redesign the user dashboard
- Hire 3 new engineers

Everyone was so energetic and collaborative. Sarah's presentation on user analytics was particularly insightful. The data shows our retention rates have improved by 40% since the last update.

I feel confident about hitting our targets this quarter. The team chemistry is amazing right now.`,
    content_type: 'markdown',
    category: 'Work',
    importance: 8,
    sentiment: 'optimism',
    is_favorite: true,
    is_archived: false,
    word_count: 142,
    tags: ['planning', 'team', 'roadmap', 'mobile'],
    created_at: '2024-01-15T09:30:00Z',
    updated_at: '2024-01-15T09:30:00Z',
  },
  {
    id: 'note-2',
    title: 'Difficult Client Conversation',
    content: `The call with MegaCorp didn't go as planned. They're threatening to cancel their contract if we don't implement their custom integration by next month. I tried explaining our technical constraints, but they weren't having it.

Their CTO was particularly aggressive, interrupting me multiple times and questioning our competence. It was frustrating and honestly quite demoralizing. I've been working on this account for 8 months and this feels like a slap in the face.

Need to regroup with the team tomorrow and figure out if we can realistically deliver what they're asking for. The pressure is mounting and I'm starting to doubt whether we can pull this off.

Sometimes I wonder if this job is worth the stress.`,
    content_type: 'markdown',
    category: 'Work',
    importance: 9,
    sentiment: 'frustration',
    is_favorite: false,
    is_archived: false,
    word_count: 128,
    tags: ['client', 'stress', 'deadline', 'integration'],
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z',
  },
  {
    id: 'note-3',
    title: 'Team Building Success',
    content: `What an amazing day! Our team building event at the escape room was absolutely fantastic. Watching everyone work together to solve puzzles was incredible. Even the quieter team members really came out of their shells.

The highlight was when Jake and Maria figured out the final puzzle together - you could see the pure joy and excitement on their faces. We all cheered so loudly that other groups came to see what happened.

Afterwards, we went for dinner and the conversations flowed so naturally. People were sharing stories, laughing, and really connecting on a personal level. This is exactly what our team needed after the stressful few months we've had.

I'm so grateful to work with such wonderful people. Days like this remind me why I love what I do.`,
    content_type: 'markdown',
    category: 'Work',
    importance: 7,
    sentiment: 'joy',
    is_favorite: true,
    is_archived: false,
    word_count: 156,
    tags: ['team-building', 'collaboration', 'fun', 'relationships'],
    created_at: '2024-01-22T19:20:00Z',
    updated_at: '2024-01-22T19:20:00Z',
  },

  // Personal Category - Deep emotions
  {
    id: 'note-4',
    title: 'Mom\'s Birthday Celebration',
    content: `Today was Mom's 65th birthday and we threw her the most beautiful surprise party. The look of pure amazement on her face when she walked into the room filled with all her friends and family was priceless.

She started crying happy tears immediately, and of course that made me cry too. Seeing her surrounded by so much love and appreciation was overwhelming in the best way possible. 

Uncle Robert flew in from Seattle, which was a complete shock to her. They haven't seen each other in 3 years. The hug they shared was so emotional - you could feel decades of sibling love in that moment.

The photo slideshow we created brought back so many wonderful memories. Mom kept pointing at pictures and telling stories about each one. Her laughter filled the entire house.

I feel so blessed to have such an incredible mother and family. These moments are what life is really about.`,
    content_type: 'markdown',
    category: 'Personal',
    importance: 10,
    sentiment: 'love',
    is_favorite: true,
    is_archived: false,
    word_count: 168,
    tags: ['family', 'celebration', 'memories', 'gratitude'],
    created_at: '2024-01-20T21:15:00Z',
    updated_at: '2024-01-20T21:15:00Z',
  },
  {
    id: 'note-5',
    title: 'Relationship Struggles',
    content: `Alex and I had another big fight tonight. It started over something so trivial - whose turn it was to do the dishes - but it escalated into something much deeper. We ended up yelling about things that happened months ago.

I feel so disconnected from them lately. It's like we're living parallel lives in the same house. The spark that used to be there feels dimmed, and I don't know how to reignite it.

They accused me of being emotionally distant, and maybe they're right. Work has been consuming so much of my mental energy that I haven't been fully present at home. But their constant criticism isn't helping either.

We both went to bed angry, sleeping on opposite sides of the bed like strangers. The silence between us feels heavier than any argument.

I'm scared about where this is heading. We used to be so good together.`,
    content_type: 'markdown',
    category: 'Personal',
    importance: 8,
    sentiment: 'sadness',
    is_favorite: false,
    is_archived: false,
    word_count: 162,
    tags: ['relationship', 'conflict', 'communication', 'distance'],
    created_at: '2024-01-25T23:30:00Z',
    updated_at: '2024-01-25T23:30:00Z',
  },
  {
    id: 'note-6',
    title: 'Peaceful Morning Meditation',
    content: `Woke up early today and decided to meditate in the garden. The morning air was crisp and fresh, with just a hint of dew on the grass. I found my favorite spot under the oak tree and settled into stillness.

As I focused on my breathing, I could hear the gentle chirping of birds welcoming the new day. A soft breeze rustled through the leaves above me, creating a natural symphony that seemed to sync with my heartbeat.

For the first time in weeks, my mind felt truly quiet. No racing thoughts about work deadlines or personal worries - just pure, peaceful presence. I felt completely connected to the moment and to nature around me.

When I opened my eyes after 20 minutes, the world seemed brighter and more vivid. Colors appeared more saturated, sounds more crisp. This sense of calm and centeredness is exactly what I needed.

I want to make this a daily practice. These moments of serenity are precious.`,
    content_type: 'markdown',
    category: 'Personal',
    importance: 6,
    sentiment: 'serenity',
    is_favorite: true,
    is_archived: false,
    word_count: 178,
    tags: ['meditation', 'nature', 'mindfulness', 'peace'],
    created_at: '2024-01-28T07:00:00Z',
    updated_at: '2024-01-28T07:00:00Z',
  },

  // Ideas Category - Creative and innovative thoughts
  {
    id: 'note-7',
    title: 'Revolutionary App Concept: MoodSync',
    content: `Just had the most incredible idea for an app that could change how people manage their emotional well-being! Picture this: MoodSync - an AI-powered emotional intelligence companion that learns your patterns and helps optimize your mental state.

The app would track your mood throughout the day using various inputs:
- Voice tone analysis during phone calls
- Typing patterns and word choice in messages
- Sleep quality and exercise data
- Calendar events and their emotional impact
- Weather and environmental factors

But here's the revolutionary part - it wouldn't just track, it would predict and prevent emotional dips before they happen. Imagine getting a gentle notification: "Based on your patterns, you might feel overwhelmed around 3 PM today. Would you like me to schedule a 10-minute breathing exercise?"

The AI could suggest personalized interventions:
- Specific music playlists that boost your mood
- Optimal times for difficult conversations
- When to take breaks or go for walks
- Which friends to reach out to for support

This could be life-changing for people with anxiety, depression, or anyone wanting to optimize their emotional health. The market potential is enormous!`,
    content_type: 'markdown',
    category: 'Ideas',
    importance: 9,
    sentiment: 'excitement',
    is_favorite: true,
    is_archived: false,
    word_count: 198,
    tags: ['app-idea', 'AI', 'mental-health', 'innovation', 'startup'],
    created_at: '2024-01-16T14:20:00Z',
    updated_at: '2024-01-16T14:20:00Z',
  },
  {
    id: 'note-8',
    title: 'Sustainable City Design Concept',
    content: `Been thinking about urban planning and how we could design cities that are truly sustainable and human-centered. What if we reimagined cities as living ecosystems rather than concrete jungles?

Core principles:
- Vertical forests integrated into every building
- Underground pneumatic waste systems (no more garbage trucks!)
- Rooftop gardens and urban farms on every building
- Car-free zones with beautiful walking and cycling paths
- Renewable energy microgrids for each neighborhood
- Rainwater collection and greywater recycling systems

The most exciting part is the community aspect. Imagine neighborhoods designed around shared spaces - community kitchens, tool libraries, co-working spaces, and maker labs. People would naturally interact more, reducing isolation and building stronger communities.

We could use AI to optimize traffic flow, energy distribution, and resource allocation in real-time. Smart sensors could monitor air quality, noise levels, and even community happiness metrics.

This isn't just about environmental sustainability - it's about creating cities that nurture human flourishing. Cities that make people healthier, happier, and more connected.

Someone needs to build a prototype of this. Maybe start with a single neighborhood?`,
    content_type: 'markdown',
    category: 'Ideas',
    importance: 8,
    sentiment: 'anticipation',
    is_favorite: true,
    is_archived: false,
    word_count: 201,
    tags: ['urban-planning', 'sustainability', 'community', 'environment', 'future'],
    created_at: '2024-01-19T11:45:00Z',
    updated_at: '2024-01-19T11:45:00Z',
  },

  // Research Category - Academic and analytical content
  {
    id: 'note-9',
    title: 'Quantum Computing Impact on Cryptography',
    content: `Deep dive into the implications of quantum computing advancement on current cryptographic systems. The timeline for quantum supremacy in cryptography is accelerating faster than most experts predicted.

Current RSA and ECC encryption methods that protect our digital infrastructure could become obsolete within 10-15 years. This isn't just theoretical anymore - IBM, Google, and other tech giants are making significant breakthroughs.

Key concerns:
- Banking and financial systems vulnerability
- Government and military communications at risk
- Personal data protection challenges
- Blockchain and cryptocurrency implications

However, this also presents incredible opportunities. Post-quantum cryptography is emerging as a new field with fascinating mathematical foundations. Lattice-based cryptography, hash-based signatures, and multivariate cryptography are showing promise.

The race is on to develop quantum-resistant algorithms before quantum computers become powerful enough to break current systems. NIST is already standardizing post-quantum cryptographic algorithms.

This transition will be one of the most significant technological shifts in cybersecurity history. Organizations need to start preparing now, not waiting until quantum computers are already breaking their systems.

The implications extend far beyond technology - this could reshape geopolitical power dynamics and economic structures.`,
    content_type: 'markdown',
    category: 'Research',
    importance: 9,
    sentiment: 'apprehension',
    is_favorite: true,
    is_archived: false,
    word_count: 203,
    tags: ['quantum-computing', 'cryptography', 'cybersecurity', 'technology', 'future-risk'],
    created_at: '2024-01-17T13:30:00Z',
    updated_at: '2024-01-17T13:30:00Z',
  },
  {
    id: 'note-10',
    title: 'Neuroscience of Creativity and Flow States',
    content: `Fascinating research emerging on the neurological basis of creativity and flow states. Recent fMRI studies show that during peak creative moments, the brain exhibits a unique pattern of activity that's quite different from normal problem-solving.

The Default Mode Network (DMN) - usually associated with mind-wandering and self-referential thinking - shows decreased activity during flow states. Simultaneously, the Executive Attention Network becomes highly focused, creating a perfect balance between relaxed awareness and intense concentration.

Key findings:
- Alpha brain waves (8-12 Hz) increase significantly during creative insights
- The prefrontal cortex shows transient hypofrontality - temporary downregulation of the inner critic
- Dopamine, norepinephrine, and endorphins create a powerful neurochemical cocktail
- Time perception becomes distorted due to changes in the prefrontal cortex

This research has profound implications for education, workplace design, and personal development. We're learning that creativity isn't just a talent - it's a neurological state that can be cultivated and optimized.

Practical applications:
- Meditation and mindfulness practices enhance creative capacity
- Physical exercise primes the brain for creative insights
- Environmental factors (lighting, sound, space) significantly impact creative output
- Collaborative creativity shows different neural patterns than solo work

The intersection of neuroscience and creativity is opening up entirely new possibilities for human potential.`,
    content_type: 'markdown',
    category: 'Research',
    importance: 8,
    sentiment: 'amazement',
    is_favorite: true,
    is_archived: false,
    word_count: 234,
    tags: ['neuroscience', 'creativity', 'flow-state', 'brain-research', 'human-potential'],
    created_at: '2024-01-21T16:15:00Z',
    updated_at: '2024-01-21T16:15:00Z',
  },

  // Learning Category - Educational content
  {
    id: 'note-11',
    title: 'Mastering Spanish Conjugations',
    content: `Finally starting to understand the logic behind Spanish verb conjugations! What seemed like random memorization is actually following beautiful, systematic patterns.

The key insight: Spanish verbs change their endings to tell you WHO is doing the action and WHEN it's happening, all in one word. English needs separate words (I, you, he/she) and helping verbs (will, have, etc.), but Spanish packs it all into the verb itself.

Present tense patterns I've mastered:
- AR verbs: -o, -as, -a, -amos, -áis, -an
- ER verbs: -o, -es, -e, -emos, -éis, -en  
- IR verbs: -o, -es, -e, -imos, -ís, -en

The irregular verbs are starting to make sense too. "Ser" and "estar" both mean "to be" but express different types of existence - permanent vs. temporary states. This philosophical distinction built into the language is fascinating!

Practicing with my conversation partner María has been incredibly helpful. She's so patient when I stumble through sentences, and her encouragement keeps me motivated.

Next challenge: past tenses (preterite vs. imperfect). The concept of completed vs. ongoing past actions doesn't exist in English quite the same way.

¡Estoy emocionado por continuar aprendiendo!`,
    content_type: 'markdown',
    category: 'Learning',
    importance: 6,
    sentiment: 'interest',
    is_favorite: false,
    is_archived: false,
    word_count: 218,
    tags: ['spanish', 'language-learning', 'grammar', 'practice', 'progress'],
    created_at: '2024-01-23T20:30:00Z',
    updated_at: '2024-01-23T20:30:00Z',
  },
  {
    id: 'note-12',
    title: 'Photography Composition Breakthrough',
    content: `Had a major breakthrough in understanding photographic composition today! Spent the morning at the botanical garden practicing the rule of thirds, leading lines, and framing techniques.

The rule of thirds isn't just about placing subjects off-center - it's about creating visual tension and balance that draws the eye naturally through the image. When I positioned the fountain at the intersection of the grid lines, the entire photo came alive.

Leading lines are everywhere once you start looking for them:
- The curved pathway that draws you into the rose garden
- Tree branches that frame the gazebo perfectly
- Shadows that create geometric patterns on the ground
- Even the way flower petals spiral toward the center

But the real revelation was about negative space. That empty area isn't wasted space - it's breathing room that gives the subject power and presence. The photo of the single red tulip against the vast green lawn is so much more impactful than the cluttered shots I was taking before.

Light is everything. The golden hour shots have this magical quality that harsh midday sun just can't match. The way light filters through leaves, creates rim lighting on flower petals, and casts long dramatic shadows - it's like nature's own studio lighting.

I'm starting to see the world differently now, always noticing potential compositions and interesting light.`,
    content_type: 'markdown',
    category: 'Learning',
    importance: 7,
    sentiment: 'ecstasy',
    is_favorite: true,
    is_archived: false,
    word_count: 241,
    tags: ['photography', 'composition', 'art', 'technique', 'creativity'],
    created_at: '2024-01-26T15:45:00Z',
    updated_at: '2024-01-26T15:45:00Z',
  },

  // Health Category - Physical and mental wellness
  {
    id: 'note-13',
    title: 'Marathon Training Progress',
    content: `Week 12 of marathon training and I'm feeling stronger than ever! Today's 18-mile long run was challenging but incredibly rewarding. My pace has improved significantly since I started this journey.

The mental aspect of distance running is fascinating. Around mile 10, my mind wanted to quit, but I pushed through that wall and found a second wind. There's something almost meditative about the rhythm of footsteps and breathing over long distances.

Physical improvements I've noticed:
- Resting heart rate dropped from 72 to 58 bpm
- Can run 8-minute miles comfortably (started at 10-minute pace)
- Recovery time between runs has decreased dramatically
- Sleep quality has improved significantly
- Overall energy levels throughout the day are higher

The nutrition aspect has been a learning curve. Figuring out what to eat before long runs, how to fuel during the run, and optimal recovery meals. Sweet potatoes and quinoa have become my best friends!

My running group has been incredible support. We push each other through tough workouts and celebrate every milestone together. The camaraderie reminds me why I love this sport.

Only 8 weeks until race day. I'm nervous but confident that all this training will pay off. The goal is to finish under 4 hours - ambitious but achievable!`,
    content_type: 'markdown',
    category: 'Health',
    importance: 7,
    sentiment: 'vigilance',
    is_favorite: true,
    is_archived: false,
    word_count: 238,
    tags: ['marathon', 'running', 'fitness', 'training', 'goals'],
    created_at: '2024-01-24T18:00:00Z',
    updated_at: '2024-01-24T18:00:00Z',
  },
  {
    id: 'note-14',
    title: 'Anxiety Management Strategies',
    content: `Been working with my therapist on developing better strategies for managing anxiety, especially during high-stress periods at work. The techniques we've been practicing are actually starting to help.

The 4-7-8 breathing technique has been a game-changer. When I feel anxiety building, I breathe in for 4 counts, hold for 7, and exhale for 8. It activates the parasympathetic nervous system and creates an almost immediate calming effect.

Cognitive reframing is harder but powerful. Instead of "I'm going to fail this presentation," I practice thinking "This is an opportunity to share my knowledge and connect with colleagues." The shift from threat to opportunity changes everything.

Progressive muscle relaxation before bed has improved my sleep quality dramatically. Starting with my toes and working up to my head, tensing and releasing each muscle group. By the time I reach my face, my whole body feels heavy and relaxed.

The anxiety isn't gone - I don't think it ever will be completely - but I'm learning to work with it rather than against it. It's like having a sensitive alarm system that sometimes goes off unnecessarily, but I'm getting better at checking if there's actually a fire before panicking.

Small wins matter. Each time I use these tools successfully, I build confidence in my ability to handle difficult situations.`,
    content_type: 'markdown',
    category: 'Health',
    importance: 8,
    sentiment: 'acceptance',
    is_favorite: false,
    is_archived: false,
    word_count: 245,
    tags: ['anxiety', 'mental-health', 'therapy', 'coping-strategies', 'mindfulness'],
    created_at: '2024-01-27T21:45:00Z',
    updated_at: '2024-01-27T21:45:00Z',
  },

  // Finance Category - Money and investment thoughts
  {
    id: 'note-15',
    title: 'Investment Portfolio Rebalancing Strategy',
    content: `Time for quarterly portfolio review and rebalancing. The market volatility this year has created some interesting opportunities and challenges.

Current allocation vs. target:
- US Stocks: 45% (target 40%) - overweight due to strong performance
- International Stocks: 20% (target 25%) - underweight, good buying opportunity
- Bonds: 25% (target 30%) - underweight due to rising rates
- REITs: 10% (target 5%) - overweight, considering trimming

The tech sector has been particularly volatile. My individual stock picks in NVIDIA and Microsoft have performed well, but I'm concerned about concentration risk. Might be time to take some profits and diversify.

Bond strategy needs adjustment with rising interest rates. Shorter duration bonds and TIPS (Treasury Inflation-Protected Securities) might be better positioned for the current environment.

Dollar-cost averaging into international markets seems smart right now. European and emerging market valuations look attractive compared to US markets.

Emergency fund is fully funded (6 months expenses), so I can afford to be more aggressive with investment allocation. The key is staying disciplined and not making emotional decisions based on short-term market movements.

Long-term goal remains the same: financial independence by age 50. Current trajectory suggests this is achievable with consistent saving and reasonable market returns.`,
    content_type: 'markdown',
    category: 'Finance',
    importance: 8,
    sentiment: 'pensiveness',
    is_favorite: false,
    is_archived: false,
    word_count: 234,
    tags: ['investing', 'portfolio', 'rebalancing', 'strategy', 'financial-planning'],
    created_at: '2024-01-29T10:30:00Z',
    updated_at: '2024-01-29T10:30:00Z',
  },

  // Travel Category - Adventures and experiences
  {
    id: 'note-16',
    title: 'Magical Sunrise at Machu Picchu',
    content: `Woke up at 4 AM to catch the sunrise at Machu Picchu and it was absolutely worth every minute of lost sleep! The experience was nothing short of magical and deeply moving.

As we climbed the steep stone steps in the pre-dawn darkness, I could feel the anticipation building. The air was thin at this altitude, and each breath reminded me of how far we'd traveled to reach this sacred place.

When the first rays of sunlight began to illuminate the ancient citadel, I was completely overwhelmed with awe. The way the golden light slowly revealed the intricate stonework, the terraced gardens, and the dramatic mountain peaks surrounding us - it felt like watching the world being created.

The engineering marvel of this place is mind-blowing. How did the Incas transport these massive stones up the mountain and fit them together so precisely without modern tools? Each wall tells a story of incredible human ingenuity and determination.

But beyond the technical achievement, there's something deeply spiritual about this place. Standing where the Incas once lived, worked, and worshipped, I felt connected to something much larger than myself. The energy here is palpable.

Our guide shared stories about Inca astronomy, agriculture, and daily life. Learning about their sophisticated understanding of the cosmos and their harmony with nature was humbling.

This trip has changed my perspective on what humans can accomplish when they work in harmony with their environment.`,
    content_type: 'markdown',
    category: 'Travel',
    importance: 9,
    sentiment: 'awe',
    is_favorite: true,
    is_archived: false,
    word_count: 267,
    tags: ['peru', 'machu-picchu', 'travel', 'history', 'spirituality', 'adventure'],
    created_at: '2024-01-12T06:30:00Z',
    updated_at: '2024-01-12T06:30:00Z',
  },
  {
    id: 'note-17',
    title: 'Tokyo Food Adventure',
    content: `Three days in Tokyo and I'm already in love with the food culture here! Every meal has been an adventure in flavors, textures, and presentation that I never knew existed.

Started the day at Tsukiji Outer Market with the most incredible sushi breakfast. Watching the sushi master work was like observing a meditation in motion - every cut precise, every piece of rice perfectly seasoned and shaped. The tuna melted in my mouth like butter.

Lunch was at a tiny ramen shop with only 8 seats. The chef has been perfecting his tonkotsu broth for 30 years, and you can taste every hour of that dedication. The richness and depth of flavor was extraordinary. I watched him prepare each bowl with the same care and attention as if it were his first.

The attention to detail here is incredible. Even convenience store food is beautifully packaged and delicious. I had a bento box from 7-Eleven that was better than most restaurant meals back home.

Evening brought tempura at a restaurant that's been family-owned for four generations. The vegetables were so light and crispy, and the dipping sauce had layers of flavor that revealed themselves with each bite.

But it's not just about the food - it's about the respect for ingredients, the dedication to craft, and the way meals bring people together. Every restaurant feels like a temple to the art of cooking.

I need to learn to cook Japanese food when I get home. This trip is inspiring me to approach cooking with more mindfulness and respect.`,
    content_type: 'markdown',
    category: 'Travel',
    importance: 7,
    sentiment: 'admiration',
    is_favorite: true,
    is_archived: false,
    word_count: 289,
    tags: ['tokyo', 'japan', 'food', 'culture', 'culinary', 'travel'],
    created_at: '2024-01-14T19:20:00Z',
    updated_at: '2024-01-14T19:20:00Z',
  },

  // Additional notes for better testing
  {
    id: 'note-18',
    title: 'Disappointing Movie Experience',
    content: `Went to see the new superhero movie everyone's been raving about, but honestly, I left the theater feeling pretty let down. After all the hype and positive reviews, I expected something special, but it felt like the same formulaic plot we've seen a dozen times before.

The special effects were impressive, sure, but they can't carry a movie when the story is so predictable and the character development is practically non-existent. I found myself checking my phone multiple times, which is never a good sign.

The worst part was how loud and overwhelming everything was. Every action sequence felt like an assault on the senses rather than an engaging piece of storytelling. Whatever happened to building tension and emotional investment?

Maybe I'm just getting old and cynical, but I miss movies that trusted the audience to think and feel rather than just bombarding us with explosions and one-liners.

At least the popcorn was good.`,
    content_type: 'markdown',
    category: 'Personal',
    importance: 3,
    sentiment: 'disappointment',
    is_favorite: false,
    is_archived: false,
    word_count: 178,
    tags: ['movies', 'entertainment', 'criticism', 'expectations'],
    created_at: '2024-01-30T22:15:00Z',
    updated_at: '2024-01-30T22:15:00Z',
  },
  {
    id: 'note-19',
    title: 'Coding Breakthrough: Algorithm Optimization',
    content: `Finally cracked the performance issue that's been plaguing our search algorithm for weeks! The solution was so elegant once I saw it, but getting there required completely rethinking our approach.

The problem was that we were doing too many database queries in nested loops. Each search was triggering hundreds of individual queries, which was killing performance as our dataset grew.

The breakthrough came when I realized we could batch all the queries into a single complex join and then process the results in memory. Reduced query time from 2.3 seconds to 47 milliseconds - a 98% improvement!

The key insights:
- Sometimes the obvious solution isn't the optimal one
- Profiling tools are essential for finding real bottlenecks
- A little bit of extra memory usage can save massive amounts of time
- SQL optimization is still a crucial skill even in the age of ORMs

This reminded me why I love programming. There's something deeply satisfying about solving a complex puzzle and seeing immediate, measurable results. The moment when everything clicks and the code just works perfectly - that's pure joy.

Now I need to document this solution properly so the team can learn from it and we don't repeat the same mistakes in the future.`,
    content_type: 'markdown',
    category: 'Work',
    importance: 8,
    sentiment: 'ecstasy',
    is_favorite: true,
    is_archived: false,
    word_count: 234,
    tags: ['programming', 'optimization', 'algorithms', 'performance', 'breakthrough'],
    created_at: '2024-01-31T14:30:00Z',
    updated_at: '2024-01-31T14:30:00Z',
  },
];

export const addDummyData = async (userId: string, createNote: (note: any) => Promise<any>) => {
  console.log('Adding dummy data for user:', userId);
  
  for (const noteData of dummyNotes) {
    try {
      await createNote({
        ...noteData,
        user_id: userId,
      });
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error creating dummy note:', error);
    }
  }
  
  console.log(`Successfully added ${dummyNotes.length} dummy notes`);
};