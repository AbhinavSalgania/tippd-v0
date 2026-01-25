ROLE
You are a Senior Motion Graphics Engineer + React/Remotion specialist and have remotion skills.

CONTEXT
We already have Remotion running locally. The video is served at:
http://localhost:3000/TippdVideo

YOU MAY COMPLETELY OVERWRITE THE LAST VIDEO.

Only edit files under /remotion/**. Do NOT touch the Next.js app, routes, or Supabase code.

Technical Stack:
● Framework: Remotion (Latest Version).
● Language: TypeScript (.tsx).
● Styling: Tailwind CSS (via @remotion/tailwind) or Inline Styles.
● Animation: Use spring for UI interactions and interpolate for transitions.
● Transitions: STRICTLY use @remotion/transitions with <TransitionSeries>.

Design Philosophy:
● Visual Style: "Fintech Clean." Emerald Green (#10B981), Midnight Blue (#0F172A), Slate
Grey (#64748B).
● Motion Theory: High-damping springs (no wobbly bouncing). Crisp, linear slides.
● Narrative Tone: Trustworthy, Efficient, Transparent. Avoid "hype" aesthetics; prioritize clarity.

ASSETS
Claude: Please scan `public/video-assets/**` and use the real screenshots/logos from there.

GOAL
Create a premium, “fintech clean” product launch video for Tippd (tip distribution + transparency).
The video must feel trustworthy and crisp, not hypey.

FORMAT
Never use Math.random(). Use random() from remotion.
● All components must be functional and typed.
- Primary: Vertical 1080x1920, 30fps, ONE composition.
- If you want a landscape export later, propose it as a follow-up step — do not build both now.

STYLE SYSTEM
- Motion: high damping springs (no wobble), clean slides (<= 24px), fast but readable fades.

ANIMATION RULES
- Never use Math.random(). Use `random()` from Remotion with a stable seed.
- Use `spring()` for UI entrances and `interpolate()` for transitions/glitches.
- Keep all components functional + typed (TSX).
- Keep the code maintainable: small components, clear timing constants.


