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
    "jung", "junge", "junges", "teenager", "teen", "studentin", "18", "19", "20", "21", "22",
    "mädchen", "schülerin", "azubi", "auszubildende",
  ],
  "gc_23_to_29": [
    "twenties", "zwanziger", "23", "24", "25", "26", "27", "28", "29",
    "junge frau", "kollegin", "nachbarin",
  ],
  "gc_30_to_49": [
    "milf", "reife", "reif", "30", "35", "40", "45", "mittleren alters",
    "erfahren", "erfahrene", "verheiratet", "verheiratete", "ehefrau", "mutter",
  ],
  "gc_50_plus": [
    "älter", "ältere", "alt", "alte", "oma", "granny", "großmutter", "omi",
    "50", "55", "60", "65", "70", "mature", "gilf", "rentnerin", "seniorin",
    "tante", "schwiegermutter",
  ],
};

const ETHNICITY_KEYWORDS: Record<string, string[]> = {
  "arab": [
    "arabisch", "arabische", "arab", "orientalisch", "orientalische",
    "türkisch", "türkische", "türkin", "persisch", "persische",
    "marokkanisch", "marokkanische", "libanesisch", "libanesische",
    "nahöstlich", "kopftuch", "hijab",
  ],
  "asian": [
    "asiatisch", "asiatische", "asiatin", "japanisch", "japanische", "japanerin",
    "chinesisch", "chinesische", "chinesin", "koreanisch", "koreanische", "koreanerin",
    "thai", "thailändisch", "vietnamesisch", "filipina",
  ],
  "ebony": [
    "schwarz", "schwarze", "dunkelhäutig", "dunkelhäutige", "afrikanisch", "afrikanische",
    "ebony", "karibisch", "karibische",
  ],
  "latina": [
    "latina", "lateinamerikanisch", "lateinamerikanische", "brasilianisch", "brasilianische",
    "brasilianerin", "mexikanisch", "mexikanische", "kolumbianisch", "kolumbianische",
    "spanisch", "spanierin", "südamerikanisch",
  ],
  "white": [
    "weiß", "weiße", "europäisch", "europäische", "blond", "blonde",
    "rothaarig", "rothaarige", "skandinavisch", "skandinavische",
    "russisch", "russische", "russin", "polnisch", "polnische", "polin",
    "tschechisch", "tschechische", "deutsch", "deutsche",
  ],
  "indian": [
    "indisch", "indische", "inderin", "pakistanisch", "pakistanische",
    "sri-lankisch", "bengalisch", "bengalische",
  ],
};

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  "langdeutsch": [
    "deutsch", "deutsche", "deutschland", "berlin", "münchen", "hamburg",
    "österreich", "österreichisch", "schweiz", "schweizer",
  ],
  "langenglish": [
    "englisch", "englische", "amerikanisch", "amerikanische", "britisch", "britische",
    "english", "american", "british", "usa", "london", "new york",
  ],
  "langfrench": [
    "französisch", "französische", "französin", "paris", "frankreich",
  ],
  "langspanish": [
    "spanisch", "spanische", "spanierin", "madrid", "barcelona", "spanien",
  ],
  "langitalian": [
    "italienisch", "italienische", "italienerin", "rom", "italien", "mailand",
  ],
  "langrussian": [
    "russisch", "russische", "russin", "russland", "moskau",
  ],
  "langportuguese": [
    "portugiesisch", "portugiesische", "brasilianisch", "brasilianerin", "brasilien",
  ],
  "langturkish": [
    "türkisch", "türkische", "türkin", "türkei", "istanbul", "ankara",
  ],
  "langarabic": [
    "arabisch", "arabische", "arab", "marokko", "ägypten", "dubai",
  ],
};

const TAG_KEYWORDS: Record<string, string[]> = {
  "big tits": [
    "große brüste", "grosse brüste", "großen brüsten", "grossen brüsten", "big tits",
    "riesige brüste", "üppige brüste", "pralle brüste", "vollbusig", "busig",
    "doppel-d", "dd", "große oberweite", "grosse oberweite", "üppiger busen",
    "schwere brüste", "massive brüste",
  ],
  "small tits": [
    "kleine brüste", "flache brust", "zierliche brüste", "small tits",
    "kaum busen", "a-körbchen", "kleine oberweite",
  ],
  "big ass": [
    "großer hintern", "grosser hintern", "großen arsch", "grossen arsch", "big ass",
    "dicker arsch", "runder po", "breite hüften", "üppiger hintern", "knackiger arsch",
    "praller arsch", "breiter hintern", "voluminöser po",
  ],
  "blond hair": [
    "blond", "blonde", "blondes haar", "blonden haare", "blondine",
    "platinblond", "honigblond", "aschblond", "strohblond",
  ],
  "brunette": [
    "brünett", "brünette", "braune haare", "braunem haar", "braunhaarig",
    "kastanienbraun", "dunkelbraun", "schokobraun",
  ],
  "redhead": [
    "rothaarig", "rothaarige", "rote haare", "rotem haar", "kupferrot",
    "feuerrot", "rotschopf",
  ],
  "dirty talk": [
    "dirty talk", "vulgär", "vulgäre", "versaut", "versaute", "schmutzig",
    "schmutzige", "dreckig", "dreckige", "obszön", "obszöne",
    "stöhnen", "stöhnt", "schreit", "schreien",
  ],
  "milf": [
    "milf", "mutter", "mutti", "mama", "reife frau", "reife mutter",
    "erfahrene frau", "verheiratete",
  ],
  "mature": [
    "mature", "reif", "reife", "älter", "ältere", "erfahren", "erfahrene",
    "50", "55", "60", "65", "granny", "oma", "seniorin",
  ],
  "bbw": [
    "bbw", "dick", "dicke", "fett", "fette", "mollig", "mollige",
    "übergewichtig", "übergewichtige", "kurvige", "kurvig", "voluminös",
    "füllig", "füllige", "rundlich", "rundliche", "stämmig",
    "sehr dick", "adipös", "wuchtig",
  ],
  "skinny": [
    "dünn", "dünne", "schlank", "schlanke", "zierlich", "zierliche",
    "mager", "magere", "skinny", "schmal", "schmale",
  ],
  "hairy": [
    "behaart", "behaarte", "buschig", "buschige", "haarig", "haarige",
    "schamhaare", "achselhaare", "naturbelassen", "unrasiert",
    "behaarte muschi", "buschige muschi",
  ],
  "tattoo": [
    "tattoo", "tattoos", "tätowiert", "tätowierte", "tätowierung",
    "tätowierungen", "gestochen",
  ],
  "piercing": [
    "piercing", "piercings", "gepierct", "gepiercte", "nippelpiercing",
    "bauchnabelpiercing", "intimpiercing",
  ],
  "glasses": [
    "brille", "brillenträgerin", "lesebrille", "nerdbrille",
    "mit brille", "glasses",
  ],
  "squirt": [
    "squirt", "squirten", "abspritzen", "fontäne", "spritzen",
  ],
  "anal": [
    "anal", "analsex", "arschfick", "hintern", "po-sex",
  ],
  "feet": [
    "füße", "fuß", "zehen", "fußfetisch", "feet", "nylons", "strümpfe",
    "strumpfhose", "high heels",
  ],
  "lesbian": [
    "lesbisch", "lesbische", "lesben", "frau und frau", "lesbian",
    "tribbing", "strap-on",
  ],
  "couples": [
    "paar", "paare", "couple", "couples", "gemeinsam", "zu zweit",
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
    // Default: ältere, deutsche Frauen
    return {
      ages: ["gc_50_plus"],
      ethnicities: [],
      languages: ["langdeutsch"],
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
    languages: languages.length > 0 ? [languages[0]] : ["langdeutsch"],
    genders: ["f", "f"],
    tags: tags.slice(0, 3),
  };
}
