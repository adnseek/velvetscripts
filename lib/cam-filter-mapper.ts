/**
 * Maps story femaleAppearance text + title to CrackRevenue filter parameters.
 * Analyzes keywords in the description to determine age, ethnicity, and language filters.
 */

export interface CamFilters {
  ages: string[];
  ethnicities: string[];
  languages: string[];
  genders: string[];
  tags: string[];
}

const AGE_KEYWORDS: Record<string, string[]> = {
  "gc_18_to_22": [
    "young", "teenager", "teen", "student", "college", "18", "19", "20", "21", "22",
    "girl", "schoolgirl", "coed", "freshman",
  ],
  "gc_23_to_29": [
    "twenties", "twenty", "23", "24", "25", "26", "27", "28", "29",
    "young woman", "colleague", "neighbor",
  ],
  "gc_30_to_49": [
    "milf", "mature", "30", "35", "40", "45", "middle-aged",
    "experienced", "married", "wife", "mother", "mom",
  ],
  "gc_50_plus": [
    "older", "elderly", "old", "granny", "grandmother", "grandma",
    "50", "55", "60", "65", "70", "gilf", "retired", "senior",
    "aunt", "mother-in-law",
  ],
};

const ETHNICITY_KEYWORDS: Record<string, string[]> = {
  "arab": [
    "arab", "arabian", "oriental", "middle eastern",
    "turkish", "persian", "iranian",
    "moroccan", "lebanese",
    "hijab", "headscarf",
  ],
  "asian": [
    "asian", "japanese", "chinese", "korean",
    "thai", "vietnamese", "filipina", "filipino",
  ],
  "ebony": [
    "black", "dark-skinned", "dark skinned", "african",
    "ebony", "caribbean",
  ],
  "latina": [
    "latina", "latin american", "brazilian",
    "mexican", "colombian",
    "spanish", "south american",
  ],
  "white": [
    "white", "caucasian", "european", "blonde", "blond",
    "redhead", "red-haired", "scandinavian",
    "russian", "polish", "czech", "german",
  ],
  "indian": [
    "indian", "pakistani",
    "sri lankan", "bengali",
  ],
};

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  "langenglish": [
    "english", "american", "british", "usa", "london", "new york",
    "australia", "canadian",
  ],
  "langdeutsch": [
    "german", "germany", "berlin", "munich", "hamburg",
    "austria", "austrian", "swiss", "switzerland",
  ],
  "langfrench": [
    "french", "paris", "france",
  ],
  "langspanish": [
    "spanish", "madrid", "barcelona", "spain",
  ],
  "langitalian": [
    "italian", "rome", "italy", "milan",
  ],
  "langrussian": [
    "russian", "russia", "moscow",
  ],
  "langportuguese": [
    "portuguese", "brazilian", "brazil",
  ],
  "langturkish": [
    "turkish", "turkey", "istanbul", "ankara",
  ],
  "langarabic": [
    "arabic", "arab", "morocco", "egypt", "dubai",
  ],
};

const TAG_KEYWORDS: Record<string, string[]> = {
  "big tits": [
    "big tits", "big breasts", "large breasts", "huge breasts",
    "busty", "voluptuous", "ample bosom", "double-d", "dd",
    "heavy breasts", "massive breasts", "well-endowed",
  ],
  "small tits": [
    "small tits", "small breasts", "flat chest", "petite breasts",
    "a-cup", "tiny breasts",
  ],
  "big ass": [
    "big ass", "big butt", "large behind", "thick ass",
    "round butt", "wide hips", "curvy behind", "plump ass",
    "juicy ass", "booty",
  ],
  "blond hair": [
    "blond", "blonde", "blonde hair", "golden hair",
    "platinum blonde", "honey blonde", "ash blonde", "strawberry blonde",
  ],
  "brunette": [
    "brunette", "brown hair", "dark hair", "brown-haired",
    "chestnut", "dark brown", "chocolate brown",
  ],
  "redhead": [
    "redhead", "red-haired", "red hair", "ginger",
    "copper hair", "fiery red", "auburn",
  ],
  "dirty talk": [
    "dirty talk", "vulgar", "naughty", "filthy",
    "dirty", "obscene",
    "moaning", "moans", "screaming", "screams",
  ],
  "milf": [
    "milf", "mother", "mom", "mommy", "mature woman", "mature mother",
    "experienced woman", "married woman",
  ],
  "mature": [
    "mature", "older", "experienced",
    "50", "55", "60", "65", "granny", "grandma", "senior",
  ],
  "bbw": [
    "bbw", "fat", "chubby", "plump", "plus-size", "plus size",
    "overweight", "curvy", "voluptuous", "full-figured",
    "thick", "heavy-set", "rubenesque",
  ],
  "skinny": [
    "thin", "slim", "slender", "petite",
    "skinny", "lean", "narrow",
  ],
  "hairy": [
    "hairy", "bushy", "furry",
    "pubic hair", "unshaved", "natural",
    "hairy pussy", "bush",
  ],
  "tattoo": [
    "tattoo", "tattoos", "tattooed", "inked",
  ],
  "piercing": [
    "piercing", "piercings", "pierced", "nipple piercing",
    "belly button piercing", "intimate piercing",
  ],
  "glasses": [
    "glasses", "spectacles", "reading glasses", "nerdy glasses",
    "with glasses",
  ],
  "squirt": [
    "squirt", "squirting", "gushing", "fountain",
  ],
  "anal": [
    "anal", "anal sex", "butt", "backdoor",
  ],
  "feet": [
    "feet", "foot", "toes", "foot fetish", "nylons", "stockings",
    "pantyhose", "high heels",
  ],
  "lesbian": [
    "lesbian", "lesbians", "girl on girl", "woman on woman",
    "tribbing", "strap-on",
  ],
  "couples": [
    "couple", "couples", "together", "pair",
  ],
};

function matchKeywords(text: string, keywordMap: Record<string, string[]>): string[] {
  const lower = text.toLowerCase();
  const matches: { key: string; count: number }[] = [];

  for (const [key, keywords] of Object.entries(keywordMap)) {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        count++;
      }
    }
    if (count > 0) {
      matches.push({ key, count });
    }
  }

  // Sort by match count descending, return keys
  matches.sort((a, b) => b.count - a.count);
  return matches.map(m => m.key);
}

export function mapAppearanceToCamFilters(
  femaleAppearance?: string | null,
  title?: string | null,
): CamFilters {
  const text = [femaleAppearance || "", title || ""].join(" ").trim();

  if (!text) {
    // Default: older, English-speaking women
    return {
      ages: ["gc_50_plus"],
      ethnicities: [],
      languages: ["langenglish"],
      genders: ["f", "f"],
      tags: [],
    };
  }

  const ages = matchKeywords(text, AGE_KEYWORDS);
  const ethnicities = matchKeywords(text, ETHNICITY_KEYWORDS);
  const languages = matchKeywords(text, LANGUAGE_KEYWORDS);
  const tags = matchKeywords(text, TAG_KEYWORDS);

  return {
    ages: ages.length > 0 ? [ages[0]] : ["gc_50_plus"],
    ethnicities: ethnicities.length > 0 ? [ethnicities[0]] : [],
    languages: languages.length > 0 ? [languages[0]] : ["langenglish"],
    genders: ["f", "f"],
    tags: tags.slice(0, 3),
  };
}
