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
  {
    slug: "text-to-video", eyebrow: "Text to video",
    title: "Text to Video AI – Turn Words into YouTube Videos | Vydora",
    description: "Type a sentence or paste a script and Vydora's text to video AI creates scenes, images, voiceover, captions and music, ready for YouTube.",
    h1: "Text to video AI that makes full YouTube videos",
    intro: "Write an idea or paste your own script. Vydora breaks it into scenes, creates a picture for each one, records a voiceover and adds captions and music so you get a complete video, not just a clip.",
    steps: [
      { title: "Write or paste text", text: "A one-line idea, a rough outline or a finished script all work." },
      { title: "Shape the scenes", text: "Edit any scene's words or picture, pick a voice, accent and speed." },
      { title: "Download", text: "Preview the whole video in your browser, then download it with no watermark." },
    ],
    sections: [
      { heading: "More than a short clip", paras: [
        "Many text to video tools make a few seconds of footage. Vydora builds a whole narrated video with a beginning, middle and end, the format that works on YouTube.",
        "Every scene gets camera motion, and you can add free stock B-roll or animate a scene with AI for extra movement.",
      ]},
      { heading: "You stay in control", paras: [
        "Nothing is final until you say so. Rewrite a line and only that scene's voiceover is remade. Swap an image you don't like, or upload your own from My Library.",
      ]},
    ],
    faqs: [
      ["Can I use my own script?", "Yes. Paste it in and Vydora splits it into scenes for you."],
      ["What voices are available?", "Several natural AI voices, with accent and speed you can change per video."],
      ["Do I own the videos?", "Yes. You can publish what you make, including on monetised channels."],
    ],
    cta: { label: "Try text to video free", to: "/auth?mode=signup" },
  },
  {
    slug: "youtube-series-generator", eyebrow: "Series generator",
    title: "AI YouTube Series Generator – Plan Episodes | Vydora",
    description: "Plan a full YouTube series with AI: episode titles, hooks and a shared visual style, then turn each episode into a finished video.",
    h1: "Plan and make a whole YouTube series in one go",
    intro: "Give Vydora a theme and it plans a run of connected episodes, each with its own title and angle. Every episode shares the same visual style, so your channel looks like one brand.",
    steps: [
      { title: "Choose a theme", text: "For example “unsolved mysteries of the ocean” or “money mistakes in your 20s”." },
      { title: "Review the plan", text: "Rename, reorder or remove episodes before anything is made." },
      { title: "Create episodes", text: "Turn each episode into a full video whenever you're ready." },
    ],
    sections: [
      { heading: "Why series grow channels", paras: [
        "Viewers who enjoy one episode often watch the next. A planned series gives you a steady upload schedule and makes playlists easy.",
        "Planning the series is free. You only use credits when you create an episode.",
      ]},
    ],
    faqs: [
      ["How many episodes can I plan?", "You choose the number when you plan the series."],
      ["Do episodes look the same?", "They share a visual style so they feel connected, while each has its own scenes."],
    ],
    cta: { label: "Plan a series free", to: "/auth?mode=signup" },
  },
  {
    slug: "history-documentary-video-maker", eyebrow: "History & documentary",
    title: "AI History & Documentary Video Maker – Vydora",
    description: "Make history, mystery and documentary-style YouTube videos with AI. Real-facts mode searches the web and lists sources you can check.",
    h1: "Make history and documentary videos with sources you can check",
    intro: "Documentary channels live or die on accuracy. Turn on “Use real facts” and Vydora searches the web while it writes, then saves the sources with your video so you can check every claim.",
    steps: [
      { title: "Pick an event or mystery", text: "The fall of Rome, the Dyatlov Pass incident, the space race." },
      { title: "Check the facts", text: "Read the script and the sources Vydora used. Fix anything before you continue." },
      { title: "Set the mood", text: "Choose a calm narrator and atmospheric music, then download." },
    ],
    sections: [
      { heading: "Accuracy builds trust", paras: [
        "AI can make mistakes, so Vydora shows where its facts came from. Add the links to your video description to show viewers your research.",
        "Pictures are AI-made illustrations, not historical photos. Say so in your description where it matters.",
      ]},
    ],
    faqs: [
      ["Are facts guaranteed correct?", "No. Real-facts mode helps, but always check the sources before you publish."],
      ["Can I make long documentaries?", "Video length depends on your plan. See the pricing page for each plan's limit."],
    ],
    cta: { label: "Make a documentary free", to: "/auth?mode=signup" },
  },
  {
    slug: "youtube-autopilot", eyebrow: "YouTube autopilot",
    title: "YouTube Autopilot – Plan & Schedule AI Videos | Vydora",
    description: "Plan AI YouTube videos ahead with saved settings and schedule releases with YouTube's own scheduled publishing. Planning is free.",
    h1: "Put your YouTube channel on autopilot, keep full control",
    intro: "Plan a month of videos in one sitting, make them when they're due and schedule each release on YouTube. You never miss an upload day, and no credits are spent without you pressing the button.",
    steps: [
      { title: "Plan your topics", text: "Add topics with a make-it date, an optional go-live date and all your usual video settings." },
      { title: "Make the video", text: "On the day, press Make video. Your saved settings open ready to go." },
      { title: "Schedule on YouTube", text: "Choose Schedule for later and YouTube publishes it at your chosen time." },
    ],
    sections: [
      { heading: "Scheduling that works while you sleep", paras: [
        "Scheduled releases use YouTube's own scheduled publishing. The video uploads as private, then YouTube makes it public on time, even if Vydora and your browser are closed.",
      ]},
      { heading: "No surprise credit spend", paras: [
        "Plans are free. Credits are only used when you choose to make a video, so your balance never drains unattended.",
      ]},
    ],
    faqs: [
      ["Does Autopilot cost credits?", "Planning and scheduling are free. Making a video costs the usual credits."],
      ["Do I need to keep my computer on?", "No. Once scheduled, YouTube publishes the video itself."],
      ["How far ahead can I schedule?", "From a few minutes up to six months ahead."],
    ],
    cta: { label: "Open Autopilot", to: "/autopilot" },
  },
  {
    slug: "ai-product-ads", eyebrow: "Product ads",
    title: "AI Product Video Ad Maker – Website to Video Ad | Vydora",
    description: "Turn your website link or product photos into a narrated video ad for YouTube, Shorts, TikTok and Reels with proven ad frameworks.",
    h1: "Turn your website or product photos into a video ad",
    intro: "Paste your product page or describe your product, add your photos and pick an ad style. Vydora writes a persuasive script with a fast hook and your call to action, then builds the narrated video.",
    steps: [
      { title: "Add your product", text: "Paste a website link or type a short description, and upload product photos or screenshots." },
      { title: "Pick an ad style", text: "Problem → Solution, Feature tour, Launch offer or Before & after, plus your own call to action." },
      { title: "Edit and export", text: "Review the script in the editor, then download or publish in 16:9 or 9:16." },
    ],
    sections: [
      { heading: "Your real product on screen", paras: [
        "Uploaded photos and screenshots go on the first scenes in order, so viewers see exactly what you sell. AI creates visuals for the rest.",
      ]},
      { heading: "Copy based on your own page", paras: [
        "The script uses the features and prices from your page or description and is told not to make up reviews or prices. You can edit every line before anything is generated.",
      ]},
    ],
    faqs: [
      ["How much does an ad cost?", "The same credits as a normal video of the same length."],
      ["Which formats are supported?", "16:9 for YouTube and websites, and 9:16 for Shorts, TikTok and Reels."],
      ["Can I use my own photos?", "Yes, upload product photos or website screenshots and they're used in your scenes."],
    ],
    cta: { label: "Make a product ad", to: "/ads" },
  },
];

export const findFeaturePage = (slug: string) => FEATURE_PAGES.find((p) => p.slug === slug);
