export type Template = { id: string; label: string; emoji: string; tone: string; style: string; idea: string };
export const TEMPLATES: Template[] = [
  { id: "top10", label: "Faceless Top 10", emoji: "🔟", tone: "engaging", style: "Cinematic", idea: "Top 10 most mind-blowing facts about [your subject], counting down from 10 to 1 with a surprising number 1" },
  { id: "crime", label: "True Crime / Mystery", emoji: "🕵️", tone: "true-crime", style: "Film noir", idea: "The unsolved mystery of [case or event]: what happened, the key clues, the main theories and why it was never solved" },
  { id: "finance", label: "Finance & Crypto Explainer", emoji: "💹", tone: "educational", style: "Minimal flat", idea: "[Finance topic] explained simply: what it is, how it works, the risks, and what beginners should know" },
  { id: "history", label: "Historical Mini-Doc", emoji: "🏛️", tone: "history", style: "Oil painting", idea: "The rise and fall of [empire, person or event]: a short documentary from beginning to legacy" },
  { id: "stoic", label: "Stoic Motivation", emoji: "🗿", tone: "inspiring", style: "Photoreal", idea: "[Stoic idea, e.g. 'control what you can'] — lessons from Marcus Aurelius, Seneca and Epictetus for modern life" },
  { id: "scary", label: "Scary Story", emoji: "👻", tone: "horror", style: "Cinematic", idea: "A chilling true-style horror story about [setting], told slowly with a twist at the end" },
  { id: "science", label: "Science Explained", emoji: "🔬", tone: "educational", style: "3D render", idea: "What would happen if [science 'what if' question]? Explained step by step" },
  { id: "shorts", label: "Viral Shorts Hook", emoji: "⚡", tone: "hype", style: "Neon glow", idea: "One shocking fact about [topic] that most people don't know, in under a minute" },
];
