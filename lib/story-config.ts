/**
 * Story configuration: types, locations, intensity levels
 */

// --- Story Types ---
export const STORY_TYPES = [
  { value: "real", label: "Real / Everyday" },
  { value: "fictional", label: "Fictional / Fantasy" },
  { value: "tabu", label: "Taboo / Extreme" },
] as const;

export type StoryType = typeof STORY_TYPES[number]["value"];

// --- Intensity Scale (1-10) ---
export const INTENSITY_LEVELS = [
  { value: 1, label: "1 – Tender", description: "Gentle touches, kisses, romantic mood" },
  { value: 2, label: "2 – Romantic", description: "Loving, intimate, emotional closeness" },
  { value: 3, label: "3 – Sensual", description: "Erotic tension, seduction, slow undressing" },
  { value: 4, label: "4 – Passionate", description: "Intense foreplay, open descriptions" },
  { value: 5, label: "5 – Explicit", description: "Detailed sexual scenes, direct language" },
  { value: 6, label: "6 – Graphic", description: "Graphic details, various positions" },
  { value: 7, label: "7 – Dirty", description: "Vulgar language, dirty talk, uninhibited" },
  { value: 8, label: "8 – Hardcore", description: "Extremely explicit, no taboos, all details" },
  { value: 9, label: "9 – Extreme", description: "Boundless, fetishistic, maximum intensity" },
  { value: 10, label: "10 – Absolute No Limits", description: "Everything allowed, no boundaries, maximum rawness" },
] as const;

// --- Real Locations ---
export const REAL_LOCATIONS = [
  // Home
  { name: "Bedroom", slug: "bedroom", description: "The classic bedroom – intimate and familiar" },
  { name: "Bathroom", slug: "bathroom", description: "Steamy shower or relaxing bath" },
  { name: "Kitchen", slug: "kitchen", description: "Between the stove and the kitchen table" },
  { name: "Living Room", slug: "living-room", description: "On the couch or by the fireplace" },
  { name: "Basement", slug: "basement", description: "Dark, secret and forbidden" },
  { name: "Attic", slug: "attic", description: "Hidden under the roof" },
  { name: "Garage", slug: "garage", description: "Between tools and cars" },
  { name: "Garden", slug: "garden", description: "Under the open sky in the backyard" },
  { name: "Pool", slug: "pool", description: "In or by the swimming pool" },
  { name: "Sauna", slug: "sauna", description: "Hot and steamy in the sauna" },
  { name: "Balcony", slug: "balcony", description: "Outside with the risk of being seen" },

  // Nature
  { name: "Forest", slug: "forest", description: "Hidden among the trees" },
  { name: "Beach", slug: "beach", description: "Sand, ocean and sunset" },
  { name: "Mountain Cabin", slug: "mountain-cabin", description: "Remote in the mountains" },
  { name: "Lake", slug: "lake", description: "At or in the lake" },
  { name: "Meadow", slug: "meadow", description: "On a secluded meadow" },
  { name: "Pasture", slug: "pasture", description: "Rural, out in the fields" },
  { name: "Vineyard", slug: "vineyard", description: "Between the vines" },
  { name: "Hayloft", slug: "hayloft", description: "In the hay on the farm" },
  { name: "Country Road", slug: "country-road", description: "On a lonely country road" },
  { name: "Waterfall", slug: "waterfall", description: "Under a hidden waterfall" },

  // Public
  { name: "Public Pool", slug: "public-pool", description: "At the public swimming pool" },
  { name: "Changing Room", slug: "changing-room", description: "In the tight changing room" },
  { name: "Parking Garage", slug: "parking-garage", description: "In the dark parking garage" },
  { name: "Elevator", slug: "elevator", description: "Stuck between floors" },
  { name: "Library", slug: "library", description: "Between the bookshelves" },
  { name: "Movie Theater", slug: "movie-theater", description: "In the back row of the dark cinema" },
  { name: "Nightclub", slug: "nightclub", description: "On the dance floor or in the VIP lounge" },
  { name: "Restaurant", slug: "restaurant", description: "Under the table or in the back room" },
  { name: "Park", slug: "park", description: "On a park bench at night" },
  { name: "Cemetery", slug: "cemetery", description: "Creepy and forbidden at night" },
  { name: "Church", slug: "church", description: "Forbidden and taboo – inside a church" },

  // Work
  { name: "Office", slug: "office", description: "After hours at the office" },
  { name: "Boss's Office", slug: "boss-office", description: "On the boss's desk" },
  { name: "Storage Room", slug: "storage-room", description: "Hidden in the storage room" },
  { name: "Factory Floor", slug: "factory-floor", description: "In the abandoned factory hall" },
  { name: "Construction Site", slug: "construction-site", description: "At the construction site after hours" },
  { name: "Doctor's Office", slug: "doctors-office", description: "On the examination table" },
  { name: "Hair Salon", slug: "hair-salon", description: "After closing time at the salon" },
  { name: "Gym", slug: "gym", description: "In the locker room or on the mat" },

  // Transport
  { name: "Car", slug: "car", description: "In the backseat or at the rest stop" },
  { name: "Train", slug: "train", description: "In the sleeper car or the train bathroom" },
  { name: "Airplane", slug: "airplane", description: "Mile High Club in the airplane bathroom" },
  { name: "Boat", slug: "boat", description: "On a boat or cruise ship" },
  { name: "RV", slug: "rv", description: "In the cramped RV on the road" },
  { name: "Taxi", slug: "taxi", description: "In the backseat of the taxi" },

  // Farm / Rural
  { name: "Horse Stable", slug: "horse-stable", description: "In the hay next to the horses" },
  { name: "Barn", slug: "barn", description: "In the old barn" },
  { name: "Farmhouse", slug: "farmhouse", description: "On the farm" },
  { name: "Windmill", slug: "windmill", description: "In the old windmill" },
  { name: "Greenhouse", slug: "greenhouse", description: "Warm and humid in the greenhouse" },

  // Vacation / Travel
  { name: "Hotel Room", slug: "hotel-room", description: "In the anonymous hotel room" },
  { name: "Vacation Rental", slug: "vacation-rental", description: "In the rented vacation home" },
  { name: "Campsite", slug: "campsite", description: "In a tent at the campsite" },
  { name: "Ski Lodge", slug: "ski-lodge", description: "Snowed in at the ski lodge" },
  { name: "Beach Bar", slug: "beach-bar", description: "Behind the beach bar at sunset" },
  { name: "Hot Springs", slug: "hot-springs", description: "In the hot thermal springs" },
  { name: "Cruise Ship", slug: "cruise-ship", description: "On the open sea" },
] as const;

// --- Fictional Locations ---
export const FICTIONAL_LOCATIONS = [
  // Fantasy
  { name: "Middle-earth", slug: "middle-earth", description: "In the world of Lord of the Rings" },
  { name: "The Shire", slug: "the-shire", description: "Among the Hobbits in the Shire" },
  { name: "Rohan", slug: "rohan", description: "In the stables of Rohan" },
  { name: "Rivendell", slug: "rivendell", description: "In the Elven realm of Rivendell" },
  { name: "Hogwarts", slug: "hogwarts", description: "At the Hogwarts School of Witchcraft" },
  { name: "Narnia", slug: "narnia", description: "Through the wardrobe into Narnia" },
  { name: "Westeros", slug: "westeros", description: "In the Seven Kingdoms" },
  { name: "Smurf Village", slug: "smurf-village", description: "In the village of the Smurfs" },
  { name: "Neverland", slug: "neverland", description: "In the land of Peter Pan" },
  { name: "Oz", slug: "oz", description: "In the Land of Oz" },
  { name: "Wonderland", slug: "wonderland", description: "In Alice's Wonderland" },
  { name: "Elven Forest", slug: "elven-forest", description: "In the magical Elven forest" },
  { name: "Dragon's Lair", slug: "dragons-lair", description: "In the cave of the dragon" },
  { name: "Dwarven Mine", slug: "dwarven-mine", description: "Deep in the Dwarven mine" },
  { name: "Fairy Realm", slug: "fairy-realm", description: "In the enchanted Fairy realm" },
  { name: "Witch's Tower", slug: "witchs-tower", description: "In the tower of the witch" },
  { name: "Vampire Castle", slug: "vampire-castle", description: "In the dark Vampire castle" },

  // Sci-Fi
  { name: "Planet Antares", slug: "planet-antares", description: "On the distant planet Antares" },
  { name: "Space Station", slug: "space-station", description: "On a space station in orbit" },
  { name: "Mars Colony", slug: "mars-colony", description: "In the Mars colony" },
  { name: "Spaceship", slug: "spaceship", description: "Aboard a spaceship" },
  { name: "Cyberspace", slug: "cyberspace", description: "In virtual reality" },
  { name: "Underwater City", slug: "underwater-city", description: "In a city beneath the sea" },
  { name: "Time Machine", slug: "time-machine", description: "Traveling through time" },
  { name: "Alien Planet", slug: "alien-planet", description: "On a strange alien world" },
  { name: "Holodeck", slug: "holodeck", description: "On the Holodeck – anything is possible" },
  { name: "Dystopia", slug: "dystopia", description: "In a dark future world" },

  // Mythology / Fairy Tales
  { name: "Mount Olympus", slug: "mount-olympus", description: "Among the Greek gods on Olympus" },
  { name: "Valhalla", slug: "valhalla", description: "In the hall of fallen warriors" },
  { name: "Atlantis", slug: "atlantis", description: "In the sunken city of Atlantis" },
  { name: "Enchanted Forest", slug: "enchanted-forest", description: "In the dark enchanted forest" },
  { name: "Cloud Castle", slug: "cloud-castle", description: "High up in the clouds" },
  { name: "Underworld", slug: "underworld", description: "In the Greek Underworld" },
  { name: "Land of Plenty", slug: "land-of-plenty", description: "In the land of milk and honey" },
  { name: "Haunted Castle", slug: "haunted-castle", description: "In the haunted castle" },

  // Anime / Pop Culture
  { name: "Neo Tokyo", slug: "neo-tokyo", description: "In the futuristic Neo Tokyo" },
  { name: "Gotham City", slug: "gotham-city", description: "In the dark alleys of Gotham" },
  { name: "Bikini Bottom", slug: "bikini-bottom", description: "Under the sea in Bikini Bottom" },
  { name: "Springfield", slug: "springfield", description: "In the town of the Simpsons" },
  { name: "Duckburg", slug: "duckburg", description: "In Duckburg with Donald & Co." },
] as const;

// --- Taboo Locations ---
export const TABU_LOCATIONS = [
  // Death & Darkness
  { name: "Graveyard", slug: "graveyard", description: "Among the graves at night" },
  { name: "Crypt", slug: "crypt", description: "In an old, damp crypt" },
  { name: "Morgue", slug: "morgue", description: "In the cold light of the morgue" },
  { name: "Crematorium", slug: "crematorium", description: "Next to the furnaces of the crematorium" },
  { name: "Catacombs", slug: "catacombs", description: "In the underground catacombs" },
  { name: "Mausoleum", slug: "mausoleum", description: "In the crumbling mausoleum" },

  // Abandoned Places
  { name: "Abandoned Asylum", slug: "abandoned-asylum", description: "In an abandoned mental institution" },
  { name: "Ruins", slug: "ruins", description: "In crumbling ruins" },
  { name: "Abandoned Hospital", slug: "abandoned-hospital", description: "In an abandoned hospital" },
  { name: "Condemned House", slug: "condemned-house", description: "In a house condemned for demolition" },
  { name: "Abandoned Factory", slug: "abandoned-factory", description: "In a rusty, abandoned factory" },
  { name: "Bunker", slug: "bunker", description: "In an old war bunker" },
  { name: "Abandoned Theme Park", slug: "abandoned-theme-park", description: "In an abandoned, rotting theme park" },
  { name: "Ghost Town", slug: "ghost-town", description: "In an abandoned ghost town" },

  // Religious / Forbidden
  { name: "Church", slug: "church-taboo", description: "At the altar of a church" },
  { name: "Monastery", slug: "monastery", description: "In the forbidden cells of a monastery" },
  { name: "Confessional", slug: "confessional", description: "In the tight confessional booth" },
  { name: "Mosque", slug: "mosque", description: "In an abandoned mosque" },
  { name: "Temple", slug: "temple", description: "In a pagan temple" },
  { name: "Chapel", slug: "chapel", description: "In a remote chapel" },

  // Extreme & Underground
  { name: "Sewer", slug: "sewer", description: "In the sewers beneath the city" },
  { name: "Slaughterhouse", slug: "slaughterhouse", description: "In the abandoned slaughterhouse" },
  { name: "Darkroom", slug: "darkroom", description: "In the pitch-black darkroom" },
  { name: "Adult Cinema", slug: "adult-cinema", description: "In the seedy adult cinema" },
  { name: "Swinger Club", slug: "swinger-club", description: "In the back room of the swinger club" },
  { name: "BDSM Dungeon", slug: "bdsm-dungeon", description: "In the fully equipped BDSM dungeon" },
  { name: "Brothel", slug: "brothel", description: "In a run-down brothel" },
  { name: "Strip Club", slug: "strip-club", description: "Backstage at the strip club" },

  // Danger & Risk
  { name: "Prison", slug: "prison", description: "In a prison cell" },
  { name: "Interrogation Room", slug: "interrogation-room", description: "In the police interrogation room" },
  { name: "Rooftop", slug: "rooftop", description: "On the roof of a skyscraper" },
  { name: "Subway Tunnel", slug: "subway-tunnel", description: "In an abandoned subway tunnel" },
  { name: "Highway Overpass", slug: "highway-overpass", description: "Under a highway overpass" },
  { name: "Junkyard", slug: "junkyard", description: "Among the wrecks at the junkyard" },
  { name: "Landfill", slug: "landfill", description: "On a stinking landfill" },

  // Historical / Creepy
  { name: "Torture Chamber", slug: "torture-chamber", description: "In a medieval torture chamber" },
  { name: "Dungeon", slug: "dungeon", description: "In the damp dungeon of a castle" },
  { name: "Burning Stake", slug: "burning-stake", description: "At the historic burning stake" },
  { name: "Haunted House", slug: "haunted-house", description: "In a house that's haunted" },
  { name: "Secret Passage", slug: "secret-passage", description: "In a secret tunnel beneath the city" },
  { name: "Sacrificial Site", slug: "sacrificial-site", description: "At an ancient pagan sacrificial site" },
] as const;

export function getLocationsForType(storyType: string) {
  if (storyType === "fictional") return FICTIONAL_LOCATIONS;
  if (storyType === "tabu") return TABU_LOCATIONS;
  return REAL_LOCATIONS;
}

export function getIntensityPrompt(intensity: number): string {
  if (intensity <= 2) return "Tender and romantic. Gentle touches, kisses, emotional closeness. No explicit sexual descriptions.";
  if (intensity <= 4) return "Sensual and passionate. Erotic tension, seduction, implied intimacy. Moderately explicit.";
  if (intensity <= 6) return "Explicit and graphic. Detailed sexual scenes, direct language, various positions.";
  if (intensity <= 8) return "Hardcore and uninhibited. Vulgar language, dirty talk, extremely explicit descriptions, no restraint.";
  return "Absolute no limits. Maximum rawness, all taboos broken, fetishistic, boundlessly explicit. Everything is allowed.";
}
