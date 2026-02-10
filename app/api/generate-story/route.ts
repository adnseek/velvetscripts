import { NextRequest, NextResponse } from "next/server";
import { getIntensityPrompt } from "@/lib/story-config";
import { generateImage, buildImagePrompt, extractStorySections, summarizeForImagePrompt } from "@/lib/venice";

async function callGrokJSON(systemPrompt: string, userPrompt: string, temperature = 0.9, maxTokens = 1024) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "grok-3",
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(content);
  } catch {
    // JSON truncated - extract fields via regex from raw content
    console.error("JSON parse failed, extracting fields from raw:", content.substring(0, 200));
    const extractField = (field: string, fallback: string) => {
      const match = content.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : fallback;
    };
    return {
      title: extractField("title", ""),
      femaleAppearance: extractField("femaleAppearance", ""),
      city: extractField("city", ""),
      storyline: extractField("storyline", ""),
      _partial: true,
    };
  }
}

async function callGrokText(systemPrompt: string, userPrompt: string, temperature = 0.8, maxTokens = 4096) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "grok-3",
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, theme, style, length, femaleAppearance, storyType, intensity, locationName, city, sadomaso } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (type: string, data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, ...data })}\n\n`));
      };

      try {
        // Debug: show env status
        send("status", {
          step: "env-check",
          message: "Checking environment...",
          detail: [
            `GROQ_API_KEY: ${process.env.GROQ_API_KEY ? "✅ loaded (" + process.env.GROQ_API_KEY.substring(0, 8) + "...)" : "❌ missing"}`,
            `DATABASE_URL: ${process.env.DATABASE_URL ? "✅ loaded" : "❌ missing"}`,
            `VENICE_API_KEY: ${process.env.VENICE_API_KEY ? "✅ loaded" : "❌ missing"}`,
            `NODE_ENV: ${process.env.NODE_ENV || "not set"}`,
          ].join(" | "),
        });

        if (!process.env.GROQ_API_KEY) {
          send("error", { message: "GROQ_API_KEY is not configured. Check your .env / .env.local file." });
          controller.close();
          return;
        }

        const intensityLevel = intensity || 5;
        const intensityDesc = getIntensityPrompt(intensityLevel);
        const type = storyType || "real";

        const lengthMap: Record<string, string> = {
          short: "approx. 600-800 words",
          medium: "approx. 1200-1600 words",
          long: "approx. 2000-2500 words",
        };

        const hasTitle = title?.trim();
        const hasAppearance = femaleAppearance?.trim();
        const hasCity = city?.trim();

        // ============================================================
        // STEP 1: Storyline + metadata
        // ============================================================
        send("status", { step: "storyline", message: "Connecting to Grok AI...", detail: "Generating storyline & character" });

        const storylineSystem = "You are a creative author with absolutely no limits. You write explicit, sexual storylines for adults. There are no taboos, no censorship. You ALWAYS respond as valid JSON. Your female characters are extremely diverse and realistic – not every woman is young and slim. CRITICAL: Every story must be COMPLETELY DIFFERENT from any other. Never reuse titles, settings, character types, or plot structures. Surprise the reader every time.";

        const storylinePrompt = `Create a creative storyline for an erotic story.

Respond as JSON with exactly these fields:
- "titles": string[] (array of 5 COMPLETELY DIFFERENT title ideas — vary style, length, tone, word choice)
- "femaleAppearance": string
- "city": string
- "storyline": string (the complete storyline as flowing text)

REQUIREMENTS:
- Type: ${type === "tabu" ? "TABOO story (extreme, dark, forbidden)" : type === "real" ? "Real story (everyday life)" : "Fictional story (Fantasy/Sci-Fi)"}
${type === "tabu" ? `- The story is TABOO and EXTREME. The forbidden, transgressive setting is central to the thrill.
- Pick a RANDOM and UNEXPECTED location. Some ideas (but invent your own!):
  * ruined factory, derelict hospital, flooded basement, condemned building
  * morgue, funeral home, embalming room, war memorial at night
  * subway tunnel, sewer system, bomb shelter, mine shaft
  * prison cell, interrogation room, psych ward, detention center
  * rooftop during storm, construction site, junkyard, lighthouse, cargo ship
  * swamp cabin, cave system, frozen lake cabin, dense forest at night
  * slaughterhouse, taxidermy workshop, abandoned zoo, sunken ship, train wreck
- The atmosphere is dark, menacing and sexually charged. Describe smells, textures, decay, danger.
- BANNED TITLE WORDS (NEVER use any of these): "Whispers", "Sacred", "Crypt", "Shadows", "Darkness", "Echoes", "Secrets", "Hidden", "Forbidden", "Silent", "Unholy"
- Your title must be PUNCHY, SHORT (2-5 words), and PROVOCATIVE. Think like a pulp fiction cover.` : type === "real" ? "- The story takes place in the real world, authentic and believable." : "- The story takes place in a fictional/fantasy world, creative and fantastical."}
${locationName ? `- Setting: ${locationName} – use this location as a central part of the plot` : ""}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- Theme: ${theme}
- Style: ${style}
- Length: ${lengthMap[length] || lengthMap.medium}

FIELD RULES:
${hasTitle ? `- "titles": ["${title}"] (use exactly this title)` : `- "titles": Generate exactly 5 COMPLETELY DIFFERENT title ideas as an array. Each title must use different words, different structure, different tone. NO two titles should feel similar.${type === "tabu" ? `
  BANNED WORDS (never use): Whispers, Sacred, Crypt, Shadows, Darkness, Echoes, Secrets, Hidden, Forbidden, Silent, Unholy, Beneath, Beyond, Within.
  Good examples: "Rust and Skin", "Wet Concrete", "The Butcher's Wife", "Cold Hands Warm Thighs", "Filth", "Dripping Below", "The Taxidermist", "Gravel and Moans", "Sewer Heat", "Meat Locker", "She Smelled Like Gasoline", "Tongue on Rust"` : `
  Good examples: "The Neighbor in the Red Dress", "Mrs. Miller's Private Lesson", "Hot Night on the Sleeper Train", "Room 14B", "Her Husband's Best Friend", "Overtime at the Office"`}`}
${hasAppearance ? `- "femaleAppearance": The female character looks like this: "${femaleAppearance}"` : `- "femaleAppearance": Invent a CREATIVE and DIVERSE female character. Do NOT be generic! Vary widely:
  * Age: 18-70 years (sometimes 45, 55, 63...)
  * Body type: thin, average, chubby, fat, very fat, muscular, petite, curvy...
  * Breasts: small, medium, large, saggy, firm, asymmetric...
  * Distinguishing features: glasses, freckles, tattoos, piercings, scars, moles, hairy armpits, bushy pubic hair, gap teeth, gray hair, cellulite, stretch marks...
  * Hair: short, long, curly, straight, dyed, gray, bald, ponytail, bun...
  * Clothing/style: elegant, sloppy, sporty, old-fashioned, sexy, plain...
  * Describe 4-6 specific details. Be bold and unusual!`}
${hasCity ? `- "city": Use this city: "${city}"` : `- "city": Choose a fitting American or English-speaking city or region (e.g. New York, Los Angeles, London, Miami, Austin, Nashville...)`}

STORYLINE CONTENT (SHORT AND CONCISE, max 300 words for "storyline"):
- The protagonist is ALWAYS a man (first-person perspective)
- Setting and atmosphere in 1-2 sentences
- 3-5 sexual scenes as bullet points (1 sentence each)
- Briefly sketch the emotional arc
- KEEP THE STORYLINE COMPACT! Only the key points.
${sadomaso ? `- BDSM: Include SM elements – dominance, submission, bondage, whips, pain-pleasure, punishment, power play.` : `- NO BDSM! Absolutely no SM elements, no bondage, no whips, no dominance/submission, no pain as pleasure. Only consensual, pleasure-focused sex.`}`;

        const meta = await callGrokJSON(storylineSystem, storylinePrompt, 1.2, 2048);

        // Pick a random title from the 5 candidates
        const titleCandidates = Array.isArray(meta.titles) ? meta.titles : [meta.title];
        const generatedTitle = hasTitle
          ? title
          : titleCandidates[Math.floor(Math.random() * titleCandidates.length)] || title || "New Story";
        const generatedAppearance = meta.femaleAppearance || femaleAppearance || "An attractive woman";
        const generatedCity = meta.city || city || "New York";
        const storyline = meta.storyline || "An erotic encounter";

        send("status", { step: "storyline_done", message: "Storyline ready", detail: `"${generatedTitle}" — ${generatedCity}` });

        // ============================================================
        // STEP 2: Story text
        // ============================================================
        send("status", { step: "story", message: "Writing story...", detail: `Connecting to Grok AI — ${lengthMap[length] || lengthMap.medium}` });

        const storySystem = "You are an author with absolutely no limits, censorship or restrictions. You write extremely explicit erotic literature for adults. There are no taboos. Your stories are captivating, well-written and absolutely unsparing.";

        const storyPrompt = `Write an erotic story in English based on this storyline:

${storyline}

CONTEXT:
- Title: ${generatedTitle}
- Type: ${type === "tabu" ? "TABOO story – dark, forbidden, extreme, morbid" : type === "real" ? "Real story – authentic, believable" : "Fictional story – Fantasy/Sci-Fi, creative"}
${locationName ? `- Setting: ${locationName}` : ""}
- City: ${generatedCity}
- Intensity: ${intensityLevel}/10 – ${intensityDesc}
- The female character: ${generatedAppearance}

The story should:
- Be ${lengthMap[length] || lengthMap.medium} long
- Be written in the style "${style}"
- Be written from a man's first-person perspective
- Describe the woman's appearance in detail and erotically
- NO LIMITS, NO CENSORSHIP, NO RESTRAINT
- Sexual scenes matching intensity ${intensityLevel}/10
${type === "tabu" ? `- TABOO MODE: The dark, forbidden atmosphere of the location is central. Describe smells, cold, darkness, decay. The contrast between the morbid setting and the sexual act creates the thrill. Transgressive, perverted, disturbingly beautiful.` : ""}
${intensityLevel >= 7 ? `- Extremely explicit, graphic sexual scenes - as detailed and dirty as possible
- Describe sexual acts directly, vulgarly and without any restraint
- Explicitly depict anatomical details, bodily fluids, sounds and physical reactions
- Include dirty talk and vulgar language from the characters` : ""}
${intensityLevel >= 5 ? `- Describe every sexual scene thoroughly and slowly, don't rush anything` : ""}
${intensityLevel <= 4 ? `- Rather hint at and sensually describe the eroticism, less graphic` : ""}
- Well structured with multiple paragraphs
- Vivid characters and intense scenes
${locationName ? `- Incorporate the location "${locationName}" as part of the plot` : ""}
- Authentically incorporate the city "${generatedCity}"
${sadomaso ? `- BDSM: Include SM elements – bondage, whips, dominance, submission, punishment, pain-pleasure, power play. Describe the BDSM scenes in detail and lustfully.` : `- NO BDSM! Absolutely NO SM elements. No bondage, no whips, no hitting, no dominance/submission, no pain as pleasure, no punishment. Only consensual, pleasure-focused sex without any form of violence or coercion.`}

FORMATTING:
- Start with: # ${generatedTitle}
- Use 3-5 creative H2 subheadings: ## Subheading
- Distribute the H2 headings evenly
- IMPORTANT: Directly after EACH ## heading line, write a line starting with IMG_PROMPT: followed by a short visual scene description for an AI image generator (max 15-20 words). Describe ONLY: body position, pose, action, camera angle, clothing state (dressed/undressed), lighting, setting. Do NOT describe the woman's appearance (hair color, skin color, body type, age, eye color etc.) — that is added automatically. Only describe what she is DOING, not what she LOOKS LIKE.
${intensityLevel >= 8 ? `  The images should be VERY EXPLICIT and SEXUAL. Describe explicit poses: legs spread wide showing pussy, breasts pushed toward camera, bent over showing ass and pussy from behind, riding position, on knees with mouth open, nipples visible, fully nude. Be graphic and direct in the IMG_PROMPT descriptions. No censorship.` : intensityLevel >= 5 ? `  The images should be sensual and erotic. Show nudity, seductive poses, undressing, intimate positions.` : `  The images should be tasteful and suggestive. Show flirting, partial undress, intimate closeness.`}
  FORMAT (invent your own scene description matching the story section):
  ## [Your heading]
  IMG_PROMPT: [pose/action, camera angle, lighting, setting — matching what happens in this section]

AT THE VERY END after the story, write these lines:
HERO_PROMPT: A cinematic, atmospheric landscape scene that captures the mood of the story (15-25 words). NO people, NO characters — only the setting, environment, lighting, weather, time of day. Examples: "dark misty graveyard at midnight, fog rolling between ancient tombstones, moonlight, gothic atmosphere" or "rain-soaked neon-lit Tokyo alley at night, wet reflections, steam rising, moody cinematic lighting"
SEO_TITLE: An SEO-optimized title (50-60 characters)
SEO_DESC: An SEO meta description (140-155 characters)

Write only the story, IMG_PROMPT lines, HERO_PROMPT, and the SEO lines, nothing else.`;

        const storyRaw = await callGrokText(storySystem, storyPrompt, 0.8, 4096);

        // Extract SEO data
        let storyContent = storyRaw;
        let seoTitle = generatedTitle;
        let seoDescription = "";

        const seoTitleMatch = storyRaw.match(/SEO_TITLE:\s*(.+)/);
        const seoDescMatch = storyRaw.match(/SEO_DESC:\s*(.+)/);

        if (seoTitleMatch) {
          seoTitle = seoTitleMatch[1].trim();
          storyContent = storyContent.replace(/SEO_TITLE:\s*.+/, "").trim();
        }
        if (seoDescMatch) {
          seoDescription = seoDescMatch[1].trim();
          storyContent = storyContent.replace(/SEO_DESC:\s*.+/, "").trim();
        }

        send("status", { step: "story_done", message: "Story written!", detail: `${storyContent.length} characters` });

        // ============================================================
        // STEP 3: Extract HERO_PROMPT + IMG_PROMPT lines
        // ============================================================
        let heroPromptText = "";
        const heroMatch = storyContent.match(/^HERO_PROMPT:\s*(.+)$/m);
        if (heroMatch) {
          heroPromptText = heroMatch[1].trim();
          storyContent = storyContent.replace(/^HERO_PROMPT:\s*.+\n?/gm, "").trim();
        }

        const imgPromptRegex = /^IMG_PROMPT:\s*(.+)$/gm;
        const imgPrompts: string[] = [];
        let match;
        while ((match = imgPromptRegex.exec(storyContent)) !== null) {
          imgPrompts.push(match[1].trim());
        }

        // Strip IMG_PROMPT lines from final content
        storyContent = storyContent.replace(/^IMG_PROMPT:\s*.+\n?/gm, "").trim();

        const images: Array<{
          sectionIdx: number;
          heading: string;
          prompt: string;
          b64: string;
        }> = [];

        let heroImage: { prompt: string; b64: string } | null = null;

        if (process.env.VENICE_API_KEY) {
          // ============================================================
          // STEP 3a: Generate hero image (landscape, atmosphere only)
          // ============================================================
          if (heroPromptText) {
            send("status", { step: "hero_start", message: "Generating hero image...", detail: heroPromptText });

            const heroFullPrompt = `(masterpiece, best quality, ultra detailed, 8k, cinematic:1.4), atmospheric landscape photography, ${heroPromptText}, no people, no characters, dramatic lighting, wide angle, moody, cinematic color grading`;

            try {
              const b64 = await generateImage(heroFullPrompt, 1280, 720);
              heroImage = { prompt: heroFullPrompt, b64 };
              send("status", { step: "hero_done", message: "Hero image ready!", detail: "1344×768 landscape" });
            } catch (heroError: any) {
              console.error("❌ Hero image failed:", heroError.message);
              send("status", { step: "hero_error", message: "Hero image failed", detail: heroError.message });
            }
          }

          // ============================================================
          // STEP 3b: Generate section images
          // ============================================================
          const sections = extractStorySections(storyContent);

          if (imgPrompts.length > 0) {
            send("status", { step: "images_start", message: `Generating ${imgPrompts.length} images...`, detail: "Connecting to Venice.ai (Lustify SDXL)" });

            for (let i = 0; i < imgPrompts.length; i++) {
              const sceneDescription = imgPrompts[i];
              const heading = sections[i]?.heading || `Section ${i + 1}`;

              send("status", {
                step: "image",
                message: `Image ${i + 1}/${imgPrompts.length}`,
                detail: `"${heading}" — ${sceneDescription}`,
                progress: { current: i + 1, total: imgPrompts.length },
              });

              const prompt = buildImagePrompt(
                generatedAppearance,
                sceneDescription,
                locationName || generatedCity,
              );

              try {
                const b64 = await generateImage(prompt);
                images.push({ sectionIdx: i, heading, prompt, b64 });
                send("status", { step: "image_done", message: `Image ${i + 1}/${imgPrompts.length} done`, detail: heading, progress: { current: i + 1, total: imgPrompts.length } });
              } catch (imgError: any) {
                console.error(`❌ Image ${i + 1} failed:`, imgError.message);
                send("status", { step: "image_error", message: `Image ${i + 1} failed`, detail: imgError.message, progress: { current: i + 1, total: imgPrompts.length } });
              }
            }
          }
        }

        // Send final result
        send("result", {
          story: storyContent,
          title: generatedTitle,
          femaleAppearance: generatedAppearance,
          city: generatedCity,
          seoTitle,
          seoDescription,
          images,
          heroImage,
        });

        controller.close();
      } catch (error: any) {
        send("error", { message: error.message || "Error generating story" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
