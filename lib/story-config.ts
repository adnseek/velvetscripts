/**
 * Story configuration: types, locations, intensity levels
 */

// --- Story Types ---
export const STORY_TYPES = [
  { value: "real", label: "Real / Alltag" },
  { value: "fictional", label: "Fiktional / Fantasy" },
  { value: "tabu", label: "Tabu / Extrem" },
] as const;

export type StoryType = typeof STORY_TYPES[number]["value"];

// --- Intensity Scale (1-10) ---
export const INTENSITY_LEVELS = [
  { value: 1, label: "1 – Zärtlich", description: "Sanfte Berührungen, Küsse, romantische Stimmung" },
  { value: 2, label: "2 – Romantisch", description: "Liebevoll, intim, emotionale Nähe" },
  { value: 3, label: "3 – Sinnlich", description: "Erotische Spannung, Verführung, langsames Entkleiden" },
  { value: 4, label: "4 – Leidenschaftlich", description: "Intensives Vorspiel, offene Beschreibungen" },
  { value: 5, label: "5 – Explizit", description: "Detaillierte sexuelle Szenen, direkte Sprache" },
  { value: 6, label: "6 – Freizügig", description: "Grafische Details, verschiedene Stellungen" },
  { value: 7, label: "7 – Dirty", description: "Vulgäre Sprache, Dirty Talk, hemmungslos" },
  { value: 8, label: "8 – Hardcore", description: "Extrem explizit, keine Tabus, alle Details" },
  { value: 9, label: "9 – Extrem", description: "Grenzenlos, fetischistisch, maximale Intensität" },
  { value: 10, label: "10 – Absolut No Limits", description: "Alles erlaubt, keine Grenzen, maximale Härte" },
] as const;

// --- Real Locations ---
export const REAL_LOCATIONS = [
  // Zuhause
  { name: "Schlafzimmer", slug: "schlafzimmer", description: "Das klassische Schlafzimmer – intim und vertraut" },
  { name: "Badezimmer", slug: "badezimmer", description: "Dampfende Dusche oder entspannendes Bad" },
  { name: "Küche", slug: "kueche", description: "Zwischen Herd und Küchentisch" },
  { name: "Wohnzimmer", slug: "wohnzimmer", description: "Auf dem Sofa oder vor dem Kamin" },
  { name: "Keller", slug: "keller", description: "Dunkel, geheim und verboten" },
  { name: "Dachboden", slug: "dachboden", description: "Versteckt unter dem Dach" },
  { name: "Garage", slug: "garage", description: "Zwischen Werkzeug und Autos" },
  { name: "Garten", slug: "garten", description: "Unter freiem Himmel im eigenen Garten" },
  { name: "Pool", slug: "pool", description: "Im oder am Swimmingpool" },
  { name: "Sauna", slug: "sauna", description: "Heiß und dampfig in der Sauna" },
  { name: "Balkon", slug: "balkon", description: "Draußen mit Risiko gesehen zu werden" },

  // Natur
  { name: "Wald", slug: "wald", description: "Versteckt zwischen den Bäumen" },
  { name: "Strand", slug: "strand", description: "Sand, Meer und Sonnenuntergang" },
  { name: "Berghütte", slug: "berghuette", description: "Abgelegen in den Bergen" },
  { name: "See", slug: "see", description: "Am oder im See" },
  { name: "Wiese", slug: "wiese", description: "Auf einer abgelegenen Wiese" },
  { name: "Kuhwiese", slug: "kuhwiese", description: "Ländlich, auf der Weide" },
  { name: "Weinberg", slug: "weinberg", description: "Zwischen den Reben" },
  { name: "Heuboden", slug: "heuboden", description: "Im Heu auf dem Bauernhof" },
  { name: "Feldweg", slug: "feldweg", description: "Auf einem einsamen Feldweg" },
  { name: "Wasserfall", slug: "wasserfall", description: "Unter einem versteckten Wasserfall" },

  // Öffentlich
  { name: "Schwimmbad", slug: "schwimmbad", description: "Im öffentlichen Schwimmbad oder Freibad" },
  { name: "Umkleidekabine", slug: "umkleidekabine", description: "In der engen Umkleidekabine" },
  { name: "Parkhaus", slug: "parkhaus", description: "Im dunklen Parkhaus" },
  { name: "Aufzug", slug: "aufzug", description: "Zwischen den Stockwerken steckengeblieben" },
  { name: "Bibliothek", slug: "bibliothek", description: "Zwischen den Bücherregalen" },
  { name: "Kino", slug: "kino", description: "In der letzten Reihe im dunklen Kino" },
  { name: "Nachtclub", slug: "nachtclub", description: "Auf der Tanzfläche oder in der VIP-Lounge" },
  { name: "Restaurant", slug: "restaurant", description: "Unter dem Tisch oder im Hinterzimmer" },
  { name: "Park", slug: "park", description: "Auf einer Parkbank bei Nacht" },
  { name: "Friedhof", slug: "friedhof", description: "Gruselig und verboten bei Nacht" },
  { name: "Kirche", slug: "kirche", description: "Verboten und tabu – in der Kirche" },

  // Arbeit
  { name: "Büro", slug: "buero", description: "Nach Feierabend im Büro" },
  { name: "Chefbüro", slug: "chefbuero", description: "Auf dem Schreibtisch des Chefs" },
  { name: "Lagerraum", slug: "lagerraum", description: "Versteckt im Lagerraum" },
  { name: "Fabrikhalle", slug: "fabrikhalle", description: "In der verlassenen Fabrikhalle" },
  { name: "Baustelle", slug: "baustelle", description: "Auf der Baustelle nach Feierabend" },
  { name: "Arztpraxis", slug: "arztpraxis", description: "Auf der Behandlungsliege" },
  { name: "Friseursalon", slug: "friseursalon", description: "Nach Ladenschluss im Salon" },
  { name: "Fitnessstudio", slug: "fitnessstudio", description: "In der Umkleide oder auf der Matte" },

  // Transport
  { name: "Auto", slug: "auto", description: "Auf dem Rücksitz oder an der Raststätte" },
  { name: "Zug", slug: "zug", description: "Im Schlafwagen oder auf der Zugtoilette" },
  { name: "Flugzeug", slug: "flugzeug", description: "Mile High Club in der Flugzeugtoilette" },
  { name: "Schiff", slug: "schiff", description: "Auf einem Boot oder Kreuzfahrtschiff" },
  { name: "Wohnmobil", slug: "wohnmobil", description: "Im engen Wohnmobil auf Reisen" },
  { name: "Taxi", slug: "taxi", description: "Auf dem Rücksitz des Taxis" },

  // Bauernhof / Ländlich
  { name: "Pferdestall", slug: "pferdestall", description: "Im Heu neben den Pferden" },
  { name: "Scheune", slug: "scheune", description: "In der alten Scheune" },
  { name: "Bauernhof", slug: "bauernhof", description: "Auf dem Bauernhof" },
  { name: "Mühle", slug: "muehle", description: "In der alten Windmühle" },
  { name: "Gewächshaus", slug: "gewaechshaus", description: "Warm und feucht im Gewächshaus" },

  // Urlaub / Reise
  { name: "Hotelzimmer", slug: "hotelzimmer", description: "Im anonymen Hotelzimmer" },
  { name: "Ferienwohnung", slug: "ferienwohnung", description: "In der gemieteten Ferienwohnung" },
  { name: "Campingplatz", slug: "campingplatz", description: "Im Zelt auf dem Campingplatz" },
  { name: "Skihütte", slug: "skihuette", description: "Eingeschneit in der Skihütte" },
  { name: "Strandbar", slug: "strandbar", description: "Hinter der Strandbar bei Sonnenuntergang" },
  { name: "Therme", slug: "therme", description: "In der heißen Therme" },
  { name: "Kreuzfahrtschiff", slug: "kreuzfahrtschiff", description: "Auf hoher See" },
] as const;

// --- Fictional Locations ---
export const FICTIONAL_LOCATIONS = [
  // Fantasy
  { name: "Mittelerde", slug: "mittelerde", description: "In der Welt von Herr der Ringe" },
  { name: "Auenland", slug: "auenland", description: "Bei den Hobbits im Auenland" },
  { name: "Rohan", slug: "rohan", description: "In den Reiterställen von Rohan" },
  { name: "Rivendell", slug: "rivendell", description: "Im Elbenreich Bruchtal" },
  { name: "Hogwarts", slug: "hogwarts", description: "In der Zauberschule Hogwarts" },
  { name: "Narnia", slug: "narnia", description: "Hinter dem Kleiderschrank in Narnia" },
  { name: "Westeros", slug: "westeros", description: "In den Sieben Königslanden" },
  { name: "Schlumpfhausen", slug: "schlumpfhausen", description: "Im Dorf der Schlümpfe" },
  { name: "Nimmerland", slug: "nimmerland", description: "Im Land von Peter Pan" },
  { name: "Oz", slug: "oz", description: "Im Land von Oz" },
  { name: "Wunderland", slug: "wunderland", description: "In Alice's Wunderland" },
  { name: "Elfenwald", slug: "elfenwald", description: "Im magischen Elfenwald" },
  { name: "Drachenhorst", slug: "drachenhorst", description: "In der Höhle des Drachen" },
  { name: "Zwergenmine", slug: "zwergenmine", description: "Tief in der Zwergenmine" },
  { name: "Feenreich", slug: "feenreich", description: "Im verzauberten Feenreich" },
  { name: "Hexenturm", slug: "hexenturm", description: "Im Turm der Hexe" },
  { name: "Vampirschloss", slug: "vampirschloss", description: "Im düsteren Vampirschloss" },

  // Sci-Fi
  { name: "Planet Antares", slug: "planet-antares", description: "Auf dem fernen Planeten Antares" },
  { name: "Raumstation", slug: "raumstation", description: "Auf einer Raumstation im Orbit" },
  { name: "Mars-Kolonie", slug: "mars-kolonie", description: "In der Mars-Kolonie" },
  { name: "Raumschiff", slug: "raumschiff", description: "An Bord eines Raumschiffs" },
  { name: "Cyberspace", slug: "cyberspace", description: "In der virtuellen Realität" },
  { name: "Unterwasserstadt", slug: "unterwasserstadt", description: "In einer Stadt unter dem Meer" },
  { name: "Zeitmaschine", slug: "zeitmaschine", description: "Auf Reisen durch die Zeit" },
  { name: "Alienplanet", slug: "alienplanet", description: "Auf einem fremden Alienplaneten" },
  { name: "Holodeck", slug: "holodeck", description: "Im Holodeck – alles ist möglich" },
  { name: "Dystopie", slug: "dystopie", description: "In einer düsteren Zukunftswelt" },

  // Märchen / Mythologie
  { name: "Olymp", slug: "olymp", description: "Bei den griechischen Göttern auf dem Olymp" },
  { name: "Walhalla", slug: "walhalla", description: "In der Halle der gefallenen Krieger" },
  { name: "Atlantis", slug: "atlantis", description: "In der versunkenen Stadt Atlantis" },
  { name: "Märchenwald", slug: "maerchenwald", description: "Im dunklen Märchenwald" },
  { name: "Wolkenkuckucksheim", slug: "wolkenkuckucksheim", description: "Hoch oben in den Wolken" },
  { name: "Unterwelt", slug: "unterwelt", description: "In der griechischen Unterwelt" },
  { name: "Schlaraffenland", slug: "schlaraffenland", description: "Im Land wo Milch und Honig fließen" },
  { name: "Geisterschloss", slug: "geisterschloss", description: "Im verwunschenen Geisterschloss" },

  // Anime / Pop Culture
  { name: "Tokio Neo", slug: "tokio-neo", description: "Im futuristischen Neo-Tokio" },
  { name: "Gotham City", slug: "gotham-city", description: "In den dunklen Gassen von Gotham" },
  { name: "Bikini Bottom", slug: "bikini-bottom", description: "Unter dem Meer in Bikini Bottom" },
  { name: "Springfield", slug: "springfield", description: "In der Stadt der Simpsons" },
  { name: "Entenhausen", slug: "entenhausen", description: "In Entenhausen bei Donald & Co." },
] as const;

// --- Tabu Locations ---
export const TABU_LOCATIONS = [
  // Tod & Dunkelheit
  { name: "Friedhof", slug: "friedhof-tabu", description: "Zwischen den Gräbern bei Nacht" },
  { name: "Gruft", slug: "gruft", description: "In einer alten, feuchten Gruft" },
  { name: "Leichenhalle", slug: "leichenhalle", description: "Im kalten Licht der Leichenhalle" },
  { name: "Krematorium", slug: "krematorium", description: "Neben den Öfen des Krematoriums" },
  { name: "Katakomben", slug: "katakomben", description: "In den unterirdischen Katakomben" },
  { name: "Mausoleum", slug: "mausoleum", description: "Im verfallenen Mausoleum" },

  // Verlassene Orte
  { name: "Verlassene Psychiatrie", slug: "verlassene-psychiatrie", description: "In einer verlassenen Nervenheilanstalt" },
  { name: "Ruine", slug: "ruine", description: "In einer verfallenen Ruine" },
  { name: "Verlassenes Krankenhaus", slug: "verlassenes-krankenhaus", description: "In einem verlassenen Krankenhaus" },
  { name: "Abrisshaus", slug: "abrisshaus", description: "In einem zum Abriss freigegebenen Haus" },
  { name: "Verlassene Fabrik", slug: "verlassene-fabrik", description: "In einer rostigen, verlassenen Fabrik" },
  { name: "Bunker", slug: "bunker", description: "In einem alten Weltkriegsbunker" },
  { name: "Verlassener Freizeitpark", slug: "verlassener-freizeitpark", description: "In einem verlassenen, verrotteten Freizeitpark" },
  { name: "Geisterstadt", slug: "geisterstadt", description: "In einer verlassenen Geisterstadt" },

  // Religiös / Verboten
  { name: "Kirche", slug: "kirche-tabu", description: "Am Altar einer Kirche" },
  { name: "Kloster", slug: "kloster", description: "In den verbotenen Zellen eines Klosters" },
  { name: "Beichtstuhl", slug: "beichtstuhl", description: "Im engen Beichtstuhl" },
  { name: "Moschee", slug: "moschee", description: "In einer verlassenen Moschee" },
  { name: "Tempel", slug: "tempel", description: "In einem heidnischen Tempel" },
  { name: "Kapelle", slug: "kapelle", description: "In einer abgelegenen Kapelle" },

  // Extrem & Underground
  { name: "Abwasserkanal", slug: "abwasserkanal", description: "In der Kanalisation unter der Stadt" },
  { name: "Schlachthaus", slug: "schlachthaus", description: "Im verlassenen Schlachthaus" },
  { name: "Darkroom", slug: "darkroom", description: "Im stockdunklen Darkroom" },
  { name: "Sexkino", slug: "sexkino", description: "Im schäbigen Sexkino" },
  { name: "Swinger-Club", slug: "swinger-club", description: "Im Hinterzimmer des Swinger-Clubs" },
  { name: "SM-Keller", slug: "sm-keller", description: "Im ausgestatteten SM-Keller" },
  { name: "Bordell", slug: "bordell", description: "In einem heruntergekommenen Bordell" },
  { name: "Stripclub", slug: "stripclub", description: "Hinter der Bühne im Stripclub" },

  // Gefahr & Risiko
  { name: "Gefängnis", slug: "gefaengnis", description: "In einer Gefängniszelle" },
  { name: "Verhörraum", slug: "verhoerraum", description: "Im Verhörraum der Polizei" },
  { name: "Hochhausdach", slug: "hochhausdach", description: "Auf dem Dach eines Hochhauses" },
  { name: "U-Bahn-Tunnel", slug: "u-bahn-tunnel", description: "In einem verlassenen U-Bahn-Tunnel" },
  { name: "Autobahnbrücke", slug: "autobahnbruecke", description: "Unter einer Autobahnbrücke" },
  { name: "Schrottplatz", slug: "schrottplatz", description: "Zwischen den Wracks auf dem Schrottplatz" },
  { name: "Müllhalde", slug: "muellhalde", description: "Auf einer stinkenden Müllhalde" },

  // Historisch / Gruselig
  { name: "Folterkammer", slug: "folterkammer", description: "In einer mittelalterlichen Folterkammer" },
  { name: "Kerker", slug: "kerker", description: "Im feuchten Kerker einer Burg" },
  { name: "Hexenverbrennungsplatz", slug: "hexenverbrennungsplatz", description: "Am historischen Scheiterhaufen" },
  { name: "Spukhaus", slug: "spukhaus", description: "In einem Haus, in dem es spukt" },
  { name: "Geheimgang", slug: "geheimgang", description: "In einem geheimen Tunnel unter der Stadt" },
  { name: "Opferstätte", slug: "opferstaette", description: "An einer alten heidnischen Opferstätte" },
] as const;

export function getLocationsForType(storyType: string) {
  if (storyType === "fictional") return FICTIONAL_LOCATIONS;
  if (storyType === "tabu") return TABU_LOCATIONS;
  return REAL_LOCATIONS;
}

export function getIntensityPrompt(intensity: number): string {
  if (intensity <= 2) return "Zärtlich und romantisch. Sanfte Berührungen, Küsse, emotionale Nähe. Keine expliziten sexuellen Beschreibungen.";
  if (intensity <= 4) return "Sinnlich und leidenschaftlich. Erotische Spannung, Verführung, angedeutete Intimität. Mäßig explizit.";
  if (intensity <= 6) return "Explizit und freizügig. Detaillierte sexuelle Szenen, direkte Sprache, verschiedene Stellungen.";
  if (intensity <= 8) return "Hardcore und hemmungslos. Vulgäre Sprache, Dirty Talk, extrem explizite Beschreibungen, keine Zurückhaltung.";
  return "Absolut keine Limits. Maximale Härte, alle Tabus gebrochen, fetischistisch, grenzenlos explizit. Alles ist erlaubt.";
}
