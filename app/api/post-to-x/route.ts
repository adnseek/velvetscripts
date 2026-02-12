import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TwitterApi } from "twitter-api-v2";
import { readFile } from "fs/promises";
import path from "path";

// Grok helper for generating teaser tweets
async function generateTeaserTweets(storyContent: string, characterName: string, quote: string, title: string): Promise<string[]> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY not set");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content: `You write short, provocative teaser tweets for an erotic story platform. Each tweet must be 1-2 sentences, max 250 characters. They should be mysterious, seductive, and make people curious to read more. Use the story content to pick the most tantalizing moments. Write in English. Do NOT use hashtags. Do NOT be explicit — hint and tease. Respond as a JSON array of exactly 3 strings.`,
        },
        {
          role: "user",
          content: `Story title: "${title}"
Character: ${characterName}
Quote: "${quote}"

Story excerpt (use this to find the most tantalizing teaser moments):
${storyContent.substring(0, 2000)}

Generate exactly 3 teaser tweets as a JSON array of strings. Each tweet should:
1. First tweet: Set the scene — who is she, what's her ordinary life like? Create intrigue.
2. Second tweet: Hint at the transformation — something is about to change. Build tension.
3. Third tweet: The most seductive tease — what happens behind closed doors? Make them NEED to know more.

Respond ONLY with a JSON array like: ["tweet1", "tweet2", "tweet3"]`,
        },
      ],
      temperature: 1.0,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content?.trim() || "[]";

  // Parse JSON array from response
  const match = content.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Could not parse teaser tweets from Grok response");

  const tweets: string[] = JSON.parse(match[0]);
  if (!Array.isArray(tweets) || tweets.length < 3) {
    throw new Error("Expected 3 teaser tweets");
  }

  return tweets.slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    const { storyId } = await request.json();
    if (!storyId) {
      return NextResponse.json({ error: "storyId is required" }, { status: 400 });
    }

    // Check X API credentials
    const appKey = process.env.X_APP_KEY;
    const appSecret = process.env.X_APP_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return NextResponse.json({
        error: "X/Twitter API credentials not configured. Set X_APP_KEY, X_APP_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET in .env",
      }, { status: 400 });
    }

    const story = await prisma.story.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const characterName = (story as any).characterName || "She";
    const quote = (story as any).quote || "";
    const storyUrl = `https://velvetscripts.com/stories/${story.slug}`;

    // 1. Generate teaser tweets via Grok
    const teaserTweets = await generateTeaserTweets(
      story.content,
      characterName,
      quote,
      story.title
    );

    // 2. Initialize Twitter client
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    // 3. Upload composite image
    const compositeJpgPath = path.join(
      process.cwd(), "public", "images", "stories", storyId, "x-composite.jpg"
    );

    let mediaId: string | undefined;
    try {
      const imageBuffer = await readFile(compositeJpgPath);
      mediaId = await client.v1.uploadMedia(imageBuffer, { mimeType: "image/jpeg" });
    } catch (e: any) {
      console.error("Image upload failed:", e.message);
      // Continue without image if upload fails
    }

    // 4. Post thread
    // Tweet 1: Composite image + quote
    const tweet1Text = quote
      ? `"${quote}"\n\n— ${characterName}`
      : `Meet ${characterName}. She has a secret.`;

    const tweet1Payload: any = { text: tweet1Text };
    if (mediaId) {
      tweet1Payload.media = { media_ids: [mediaId] };
    }

    const tweet1 = await client.v2.tweet(tweet1Payload);
    const tweet1Id = tweet1.data.id;

    // Tweet 2: Teaser 1
    const tweet2 = await client.v2.reply(teaserTweets[0], tweet1Id);
    const tweet2Id = tweet2.data.id;

    // Tweet 3: Teaser 2
    const tweet3 = await client.v2.reply(teaserTweets[1], tweet2Id);
    const tweet3Id = tweet3.data.id;

    // Tweet 4: Teaser 3
    const tweet4 = await client.v2.reply(teaserTweets[2], tweet3Id);
    const tweet4Id = tweet4.data.id;

    // Tweet 5: CTA with link
    const ctaTweet = `Read the full story on VelvetScripts 🔥\n\n${storyUrl}`;
    await client.v2.reply(ctaTweet, tweet4Id);

    return NextResponse.json({
      success: true,
      threadUrl: `https://x.com/i/status/${tweet1Id}`,
      tweets: [tweet1Text, ...teaserTweets, ctaTweet],
    });
  } catch (error: any) {
    console.error("Post to X failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post to X" },
      { status: 500 }
    );
  }
}
