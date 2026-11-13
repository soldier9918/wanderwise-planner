export type Guide = {
  slug: string; title: string; description: string; h1: string; intro: string; readMins: number;
  sections: { heading: string; paras: string[]; list?: string[] }[];
  related: { label: string; to: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "youtube-monetization-faceless-ai-channels", readMins: 7,
    title: "Can You Monetise a Faceless AI YouTube Channel? (2026 Guide) – Vydora",
    description: "How YouTube's Partner Program treats AI and faceless videos, what 'reused' and 'inauthentic' content means, and how to stay eligible.",
    h1: "Can you monetise a faceless AI YouTube channel?",
    intro: "Yes, faceless channels can join the YouTube Partner Program. What matters is not whether you show your face or use AI, but whether your videos are original and add value. Here's what that means in practice.",
    sections: [
      { heading: "The basic eligibility rules", paras: [
        "To apply for the YouTube Partner Program you need to meet YouTube's subscriber and watch-time thresholds, follow the community guidelines and have two-step verification on. YouTube updates these numbers, so always check the official YouTube Help page before planning around them.",
      ]},
      { heading: "What YouTube means by reused or inauthentic content", paras: [
        "YouTube can refuse or remove monetisation for channels that mostly upload content that is copied, mass-produced or repetitive with little change between videos. Using AI is not banned; uploading near-identical template videos at high volume is the risk.",
      ], list: [
        "Avoid re-uploading other people's videos or reading out other people's articles word for word.",
        "Avoid dozens of videos that differ only by a swapped keyword.",
        "Do add your own angle, research, structure and opinions.",
      ]},
      { heading: "How to make AI videos that count as original", paras: [
        "Treat AI as your production team, not your writer of record. Edit the script so it sounds like you, cut weak scenes, and add facts you checked yourself.",
        "With Vydora you can rewrite any scene, switch on real-facts mode to get sources, choose your own voice and music, and add intro and outro cards so every video carries your brand.",
      ]},
      { heading: "Disclose realistic AI content", paras: [
        "YouTube asks creators to label realistic altered or synthetic content that viewers could mistake for real people, places or events. Illustrated scenes and obviously stylised visuals usually don't need it, but when in doubt, tick the disclosure box in YouTube Studio.",
      ]},
    ],
    related: { label: "Start a faceless channel", to: "/faceless-youtube-channel" },
  },
  {
    slug: "best-faceless-youtube-niches", readMins: 6,
    title: "Best Faceless YouTube Niches in 2026 – Ideas That Work | Vydora",
    description: "Faceless YouTube niche ideas that suit narrated videos: history, mysteries, science, finance explainers, tech and storytelling, with tips for each.",
    h1: "The best faceless YouTube niches (and how to pick yours)",
    intro: "The best niche is one you can make lots of good videos about, that people actively search for, and that suits narration over visuals. Here are the niches that fit faceless channels best.",
    sections: [
      { heading: "1. History and forgotten stories", paras: ["Evergreen topics that keep getting views years later. Strong hooks come from surprising details. Use real-facts mode and cite your sources."] },
      { heading: "2. Mysteries and unsolved cases", paras: ["Suspense keeps people watching. Structure each video as a question you answer at the end, and avoid making claims about real living people you can't back up."] },
      { heading: "3. Science and space", paras: ["Huge curiosity-driven audience. Explain one idea per video clearly, using visuals to show scale."] },
      { heading: "4. Personal finance explainers", paras: ["Advertisers value finance audiences. Stick to education, not personal advice, and add a short disclaimer."] },
      { heading: "5. Tech and AI news", paras: ["Fast-moving and searchable. Speed matters, so a quick workflow helps you publish while a topic is hot."] },
      { heading: "6. Top-10 lists and comparisons", paras: ["Easy to binge and easy to turn into Shorts. Make each item genuinely useful rather than padding."] },
      { heading: "7. Storytelling and fiction", paras: ["Original short stories, myths and folklore. Your writing is the product, so spend time on the script."] },
      { heading: "How to choose", paras: ["Write down 20 video ideas for a niche. If that feels hard, pick another. Then make three videos and see which one viewers watch longest in YouTube Analytics."] },
    ],
    related: { label: "Start a faceless channel", to: "/faceless-youtube-channel" },
  },
  {
    slug: "youtube-shorts-hooks", readMins: 5,
    title: "How to Hook Viewers in the First 3 Seconds of a YouTube Short – Vydora",
    description: "Practical hook formulas, pacing and caption tips to stop the scroll on YouTube Shorts, TikTok and Reels.",
    h1: "How to hook viewers in the first 3 seconds of a Short",
    intro: "On Shorts, viewers decide almost instantly whether to keep watching. Your first line and first image do most of the work. These formulas help.",
    sections: [
      { heading: "Five hook formulas", paras: ["Start with one of these and cut any greeting or intro:"], list: [
        "The surprising fact: “This island has more cats than people.”",
        "The question: “Why do planes never fly over the Pacific?”",
        "The promise: “Three money habits that save you £1,000 a year.”",
        "The mistake: “You've been boiling pasta wrong.”",
        "The countdown: “Number one will surprise you.” Then deliver.",
      ]},
      { heading: "Pacing", paras: ["Change the picture every two to three seconds. Keep sentences short. End on a strong line or loop back to the opening so viewers rewatch."] },
      { heading: "Captions and motion", paras: ["Many people watch Shorts with the sound low. Big on-screen captions and moving visuals keep them hooked. Vydora adds both automatically."] },
      { heading: "Turn long videos into Shorts", paras: ["Your best long-form moments make great Shorts. In Vydora, “Remix for Shorts” copies a video into vertical format without using more credits."] },
    ],
    related: { label: "Make a Short", to: "/youtube-shorts-maker" },
  },
  {
    slug: "turn-blog-posts-into-youtube-videos", readMins: 5,
    title: "How to Turn Blog Posts into YouTube Videos (Step by Step) – Vydora",
    description: "Repurpose blog posts, newsletters and articles into narrated YouTube videos: rewriting for speech, structure, visuals and crediting sources.",
    h1: "How to turn blog posts into YouTube videos",
    intro: "If you already write blog posts or newsletters, you're sitting on a library of video ideas. Repurposing them reaches people who'd rather watch than read.",
    sections: [
      { heading: "1. Pick posts that already perform", paras: ["Start with articles that get steady search traffic. If people search for it on Google, they often search YouTube too."] },
      { heading: "2. Rewrite for listening", paras: ["Written text is dense. Spoken scripts need shorter sentences, a hook in the first line and a clear payoff. Vydora's Article to Video does this rewrite for you, and you can edit every line."] },
      { heading: "3. One idea per scene", paras: ["Split the script so each scene shows one point. That keeps visuals relevant and pacing tight."] },
      { heading: "4. Link both ways", paras: ["Put the article link in the video description and embed the video in the article. Both pages benefit."] },
      { heading: "5. Respect copyright", paras: ["Only repurpose content you wrote or have permission to adapt. For news stories, add your own commentary and credit the source."] },
    ],
    related: { label: "Try Article to Video", to: "/article-to-video" },
  },
  {
    slug: "how-to-plan-a-youtube-series", readMins: 5,
    title: "How to Plan a YouTube Series People Binge – Vydora",
    description: "How to plan a YouTube series: choosing a theme, episode structure, consistent visuals, playlists and upload schedules.",
    h1: "How to plan a YouTube series people binge-watch",
    intro: "A series turns one-time viewers into returning subscribers. When each episode leads naturally to the next, YouTube has more reasons to recommend your channel.",
    sections: [
      { heading: "Choose a theme with depth", paras: ["A good series theme has at least six strong episodes in it. “Lost civilisations” works; “the colour blue” might not."] },
      { heading: "Give every episode the same shape", paras: ["Use a recognisable structure: a cold open, the story, a twist and a teaser for the next episode. Viewers learn what to expect and stay longer."] },
      { heading: "Keep the look consistent", paras: ["Use the same intro card, music mood and visual style across episodes. Vydora's Series generator gives every episode a shared visual motif."] },
      { heading: "Use playlists and end screens", paras: ["Put the series in a playlist and point each end screen to the next episode."] },
      { heading: "Stick to a schedule", paras: ["Weekly is realistic for most creators. Planning the whole series up front makes it much easier to keep."] },
    ],
    related: { label: "Plan a series", to: "/youtube-series-generator" },
  },
];
