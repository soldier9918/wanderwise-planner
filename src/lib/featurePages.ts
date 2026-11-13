export type FeaturePage = {
  slug: string; title: string; description: string; eyebrow: string; h1: string; intro: string;
  steps: { title: string; text: string }[];
  sections: { heading: string; paras: string[] }[];
  faqs: [string, string][];
  cta: { label: string; to: string };
};

export const FEATURE_PAGES: FeaturePage[] = [
  {
    slug: "faceless-youtube-channel", eyebrow: "Faceless channels",
    title: "AI Faceless YouTube Channel Maker – Vydora",
    description: "Make faceless YouTube videos with AI: script, scene images, voiceover, captions and music from one idea. No camera, no editing.",
    h1: "Run a faceless YouTube channel without filming a thing",
    intro: "Vydora writes the script, makes an image for every scene, records a natural voiceover and puts it together with captions and music. You never appear on camera, and you never open an editor.",
    steps: [
      { title: "Pick a topic", text: "Type one sentence, like “the lost city of Atlantis” or “why the 2008 crash happened”." },
      { title: "Review the script", text: "Vydora splits it into scenes. Change any line, scene or voice before anything is made." },
      { title: "Generate and download", text: "Images, voiceover, captions and music are added. Preview it, then download the finished video." },
    ],
    sections: [
      { heading: "Niches that work well faceless", paras: [
        "History, mysteries and unsolved cases, science and space, finance explainers, tech news, top-10 lists and storytelling channels all suit narrated videos with strong visuals.",
        "Turn on “Use real facts” and Vydora searches the web while writing, then lists the sources it used so you can check them before you publish.",
      ]},
      { heading: "Keep a consistent look across uploads", paras: [
        "Add your own logo, intro and outro cards once and they follow you onto every video. Choose an accent and narration speed that fits your channel.",
        "Use the Series planner to map out a run of connected episodes that share the same visual style, so your channel feels like one brand.",
      ]},
      { heading: "Make it your own", paras: [
        "YouTube rewards original, valuable videos. Use Vydora for the heavy lifting, then add your angle: edit the script, swap scenes, redo voiceovers and pick your own music.",
      ]},
    ],
    faqs: [
      ["Do I need editing skills?", "No. Everything happens in your browser, and you edit scenes by typing."],
      ["Can I make long and short videos?", "Yes. Make standard landscape videos, then remix any of them into a vertical Short at no extra cost."],
      ["Is there a free plan?", "Yes. Free accounts get 30 credits every month, enough to try a short video."],
    ],
    cta: { label: "Start your channel free", to: "/auth?mode=signup" },
  },
  {
    slug: "article-to-video", eyebrow: "Article to video",
    title: "Turn Any Article or Blog Post into a Video – Vydora",
    description: "Paste a link to an article, blog post or news story and Vydora turns it into a narrated YouTube video with scenes, captions and sources.",
    h1: "Turn any article or blog post into a YouTube video",
    intro: "Paste a link and Vydora reads the page, writes a video script from it, and builds the scenes, voiceover and captions. The original link is saved with your video so you can credit it.",
    steps: [
      { title: "Paste a link", text: "Any public article, blog post, guide or news story." },
      { title: "Choose a style", text: "Pick length, tone and voice. Vydora rewrites the text as a spoken script." },
      { title: "Get your video", text: "Scenes, voiceover and captions are made for you, ready to preview and download." },
    ],
    sections: [
      { heading: "Repurpose what you've already written", paras: [
        "Bloggers, newsletter writers and marketers can give every post a second life on YouTube without recording or editing.",
        "Vydora writes for listening, not reading: short sentences, a hook at the start and a clear ending.",
      ]},
      { heading: "Sources stay attached", paras: [
        "The page you used is kept with the video, so you can add it to your description and keep viewers' trust.",
        "Only use articles you wrote or have the right to adapt, and add your own commentary where you can.",
      ]},
    ],
    faqs: [
      ["Which links work?", "Most public web pages. Pages behind a login or paywall can't be read."],
      ["Can I edit the script?", "Yes. Every scene's text, image and voiceover can be changed before you download."],
      ["Can I make a Short from it?", "Yes. Remix the finished video into a vertical Short with one click."],
    ],
    cta: { label: "Try Article to video", to: "/from-url" },
  },
  {
    slug: "youtube-shorts-maker", eyebrow: "YouTube Shorts",
    title: "AI YouTube Shorts Maker – Vertical Videos from Text | Vydora",
    description: "Make vertical 9:16 YouTube Shorts with AI: hook-first script, scene images, voiceover and bold captions. Remix long videos into Shorts for free.",
    h1: "Make YouTube Shorts from a single sentence",
    intro: "Vydora creates vertical 9:16 videos with a fast hook, quick scenes, voiceover and captions. Already made a long video? Remix it into a Short without paying again.",
    steps: [
      { title: "Type an idea", text: "One sentence is enough. Vydora writes a short, punchy script." },
      { title: "Fine-tune", text: "Change scenes, add B-roll, animate a moment or pick music." },
      { title: "Post it", text: "Download in vertical format, ready for Shorts, TikTok or Reels." },
    ],
    sections: [
      { heading: "Remix long videos into Shorts", paras: [
        "“Remix for Shorts” copies any video into a new vertical version that reuses the same images and voiceover, so it costs no credits and your original stays untouched.",
      ]},
      { heading: "Built for the scroll", paras: [
        "Captions on screen, camera motion on every image and optional sound effects keep viewers watching past the first second.",
        "Add free stock B-roll or animate a scene with AI for extra movement.",
      ]},
    ],
    faqs: [
      ["What size are the videos?", "Shorts are vertical 9:16. Standard videos are 16:9 landscape."],
      ["Is there a watermark?", "No. Downloads have no watermark on any plan."],
      ["Does remixing cost credits?", "No. Remixing reuses the media you already made."],
    ],
    cta: { label: "Make a Short free", to: "/auth?mode=signup" },
  },
];

export const findFeaturePage = (slug: string) => FEATURE_PAGES.find((p) => p.slug === slug);
