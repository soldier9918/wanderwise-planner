# Fact-checked scripts for real events

## Short answer
Right now, not reliably. The script writer works only from what the AI already knows. It does not look anything up, so:
- Very recent events (the last few months) may be missing or out of date.
- For well-known cases like MH370, the main facts are usually right. But it can make up small details, like quotes, exact times or names, and say them confidently.

## Proposed feature: "Use real facts" toggle
1. Add a **Use real facts** switch under Video idea on the New video screen.
2. When it's on, Vydora first searches the web for the topic and collects key facts with their sources.
3. The script is then written only from those facts, and the AI is told not to invent quotes, numbers or names. Where something is unknown (like MH370's final location), it says so.
4. The video page shows a **Sources** list so you can check the facts before publishing.

## Technical details
- Web research step in the `generate-script` function, using a web search connector (Perplexity or Firecrawl) when the toggle is on.
- Facts and source URLs go into the script prompt with strict instructions to stay grounded. Sources are saved in a new `sources` column on `videos`.
- If search fails, show an error instead of quietly writing an unchecked script.
- Each fact-checked video costs a little more because of the extra search.
