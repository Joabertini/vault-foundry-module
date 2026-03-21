// ============================================================
// Bertini's Vault — D&D 5e 2014 Data
// All static game data: classes, subclasses, races, backgrounds,
// equipment proficiencies, armor, weapons, feats, spell slots
// ============================================================

export const SUBCLASSES = {
  'Bárbaro':    ['Sin subclase aún','Path of the Berserker','Path of the Totem Warrior','Path of the Ancestral Guardian','Path of the Battlerager','Path of the Beast','Path of the Storm Herald','Path of the Zealot','Path of Wild Magic','Path of the Giant'],
  'Bardo':      ['Sin subclase aún','College of Lore','College of Valor','College of Creation','College of Eloquence','College of Glamour','College of Swords','College of Whispers','College of Spirits'],
  'Clérigo':    ['Sin subclase aún','Life Domain','Light Domain','Trickery Domain','Knowledge Domain','Nature Domain','Tempest Domain','War Domain','Death Domain','Arcana Domain','Forge Domain','Grave Domain','Order Domain','Peace Domain','Twilight Domain'],
  'Druida':     ['Sin subclase aún','Circle of the Land','Circle of the Moon','Circle of Dreams','Circle of the Shepherd','Circle of Spores','Circle of Stars','Circle of Wildfire'],
  'Explorador': ['Sin subclase aún','Beast Master','Hunter','Gloom Stalker','Horizon Walker','Monster Slayer','Fey Wanderer','Swarmkeeper','Drakewarden'],
  'Guerrero':   ['Sin subclase aún','Battle Master','Champion','Eldritch Knight','Arcane Archer','Cavalier','Echo Knight','Psi Warrior','Rune Knight','Samurai','Purple Dragon Knight'],
  'Hechicero':  ['Sin subclase aún','Draconic Bloodline','Wild Magic','Storm Sorcery','Divine Soul','Shadow Magic','Aberrant Mind','Clockwork Soul','Lunar Sorcery'],
  'Mago':       ['Sin subclase aún','School of Abjuration','School of Conjuration','School of Divination','School of Enchantment','School of Evocation','School of Illusion','School of Necromancy','School of Transmutation','Bladesinging','Order of Scribes','Chronurgy Magic','Graviturgy Magic'],
  'Monje':      ['Sin subclase aún','Way of the Open Hand','Way of Shadow','Way of the Four Elements','Way of the Sun Soul','Way of the Kensei','Way of the Drunken Master','Way of the Astral Self','Way of Mercy','Way of the Ascendant Dragon'],
  'Paladín':    ['Sin subclase aún','Oath of Devotion','Oath of the Ancients','Oath of Vengeance','Oath of Conquest','Oath of Redemption','Oath of Glory','Oath of the Watchers','Oathbreaker'],
  'Pícaro':     ['Sin subclase aún','Thief','Assassin','Arcane Trickster','Inquisitive','Mastermind','Scout','Swashbuckler','Phantom','Soulknife'],
  'Brujo':      ['Sin subclase aún','The Archfey','The Fiend','The Great Old One','The Celestial','The Hexblade','The Fathomless','The Genie','The Undead','The Undying'],
  'Artífice':   ['Sin subclase aún','Alchemist','Armorer','Artillerist','Battle Smith'],
};

export const SUBRACES = {
  'Humano':     ['Humano Estándar','Humano Variante (con feat)'],
  'Elfo':       ['Alto Elfo (High Elf)','Elfo del Bosque (Wood Elf)','Drow (Dark Elf)','Shadar-kai','Sea Elf','Pallid Elf'],
  'Semi-elfo':  ['Semi-elfo (PHB)','High Half-Elf','Wood Half-Elf','Drow Half-Elf'],
  'Enano':      ['Enano de Colina (Hill Dwarf)','Enano de Montaña (Mountain Dwarf)','Duergar'],
  'Mediano':    ['Pies Ligeros (Lightfoot)','Robusto (Stout)','Ghostwise'],
  'Semiorco':   ['Semiorco (PHB)'],
  'Gnomo':      ['Gnomo de Roca (Rock Gnome)','Gnomo del Bosque (Forest Gnome)','Deep Gnome (Svirfneblin)'],
  'Tiefling':   ['Tiefling (PHB)','Tiefling Asmodeus','Tiefling Baalzebul','Tiefling Dispater','Tiefling Fierna','Tiefling Glasya','Tiefling Levistus','Tiefling Mammon','Tiefling Mephistopheles','Tiefling Zariel'],
  'Dracónido':  ['Dracónido (PHB)','Draconblood','Ravenite'],
  'Aasimar':    ['Protector Aasimar','Scourge Aasimar','Fallen Aasimar'],
  'Genasi':     ['Genasi de Aire','Genasi de Tierra','Genasi de Fuego','Genasi de Agua'],
  'Githyanki':  ['Githyanki (MTF)'],
  'Githzerai':  ['Githzerai (MTF)'],
  'Leonin':     ['Leonin (MOoT)'],
  'Satyr':      ['Satyr (MOoT)'],
  'Fairy':      ['Fairy (MPMM)'],
  'Owlfolk':    ['Owlfolk (MPMM)'],
  'Rabbitfolk': ['Rabbitfolk (MPMM)'],
};

export const BACKGROUNDS = [
  // PHB
  { value: 'Acólito',           source: "PHB",        feat: '' },
  { value: 'Charlatán',         source: "PHB",        feat: '' },
  { value: 'Criminal',          source: "PHB",        feat: '' },
  { value: 'Entretenido',       source: "PHB",        feat: '' },
  { value: 'Héroe del Pueblo',  source: "PHB",        feat: '' },
  { value: 'Artesano de Gremio',source: "PHB",        feat: '' },
  { value: 'Ermitaño',          source: "PHB",        feat: '' },
  { value: 'Noble',             source: "PHB",        feat: '' },
  { value: 'Forastero',         source: "PHB",        feat: '' },
  { value: 'Erudito',           source: "PHB",        feat: '' },
  { value: 'Marinero',          source: "PHB",        feat: '' },
  { value: 'Soldado',           source: "PHB",        feat: '' },
  { value: 'Urchin',            source: "PHB",        feat: '' },
  // SCAG
  { value: 'City Watch',        source: "SCAG",       feat: '' },
  { value: 'Clan Crafter',      source: "SCAG",       feat: '' },
  { value: 'Cloistered Scholar',source: "SCAG",       feat: '' },
  { value: 'Courtier',          source: "SCAG",       feat: '' },
  { value: 'Faction Agent',     source: "SCAG",       feat: '' },
  { value: 'Far Traveler',      source: "SCAG",       feat: '' },
  { value: 'Inheritor',         source: "SCAG",       feat: '' },
  { value: 'Mercenary Veteran', source: "SCAG",       feat: '' },
  { value: 'Urban Bounty Hunter',source:"SCAG",       feat: '' },
  // Strixhaven — otorgan feat automáticamente
  { value: 'Lorehold Student',    source: "SCC", feat: 'Strixhaven Initiate (Lorehold)' },
  { value: 'Prismari Student',    source: "SCC", feat: 'Strixhaven Initiate (Prismari)' },
  { value: 'Quandrix Student',    source: "SCC", feat: 'Strixhaven Initiate (Quandrix)' },
  { value: 'Silverquill Student', source: "SCC", feat: 'Strixhaven Initiate (Silverquill)' },
  { value: 'Witherbloom Student', source: "SCC", feat: 'Strixhaven Initiate (Witherbloom)' },
  // Dragonlance
  { value: 'Knight of Solamnia', source: "DSotDQ", feat: 'Squire of Solamnia' },
  { value: 'Mage of High Sorcery',source:"DSotDQ", feat: 'Initiate of High Sorcery' },
  // Spelljammer
  { value: 'Wildspacer',   source: "AAitSJ", feat: 'Tough' },
  { value: 'Gate Crasher', source: "AAitSJ", feat: 'Tavern Brawler' },
  // Planescape
  { value: 'Gate Warden',       source: "PaBTQ", feat: 'Scion of the Outer Planes' },
  { value: 'Planar Philosopher', source:"PaBTQ", feat: 'Scion of the Outer Planes' },
  // Bigby
  { value: 'Giant Foundling', source: "BGotG", feat: 'Strike of the Giants' },
  { value: 'Runecrafter',     source: "BGotG", feat: 'Rune Shaper' },
  // Custom
  { value: 'Otro (personalizado)', source: "custom", feat: '' },
];

export const CLASS_PROFS = {
  'Bárbaro':    { armor: ['light','medium','shields'], weapons: ['simple','martial'] },
  'Bardo':      { armor: ['light'],                    weapons: ['simple','hand crossbow','longsword','rapier','shortsword'] },
  'Clérigo':    { armor: ['light','medium','shields'], weapons: ['simple'] },
  'Druida':     { armor: ['light','medium','shields'], weapons: ['clubs','daggers','darts','javelins','maces','quarterstaffs','scimitars','sickles','slings','spears'] },
  'Explorador': { armor: ['light','medium','shields'], weapons: ['simple','martial'] },
  'Guerrero':   { armor: ['light','medium','heavy','shields'], weapons: ['simple','martial'] },
  'Hechicero':  { armor: [],                           weapons: ['daggers','darts','slings','quarterstaffs','light crossbows'] },
  'Mago':       { armor: [],                           weapons: ['daggers','darts','slings','quarterstaffs','light crossbows'] },
  'Monje':      { armor: [],                           weapons: ['simple','shortswords'] },
  'Paladín':    { armor: ['light','medium','heavy','shields'], weapons: ['simple','martial'] },
  'Pícaro':     { armor: ['light'],                    weapons: ['simple','hand crossbow','longsword','rapier','shortsword'] },
  'Brujo':      { armor: ['light'],                    weapons: ['simple'] },
  'Artífice':   { armor: ['light','medium','shields'], weapons: ['simple'] },
};

export const ARMOR_OPTIONS = [
  { name: 'Sin armadura',                    types: [],          formula: '10+DEX' },
  { name: 'Armadura de cuero (CA 11+DEX)',   types: ['light'],   formula: '11+DEX' },
  { name: 'Cuero tachonado (CA 12+DEX)',     types: ['light'],   formula: '12+DEX' },
  { name: 'Cota de escamas (CA 14+DEX≤2)',   types: ['medium'],  formula: '14+DEX2' },
  { name: 'Piel de lobo (CA 13+DEX≤2)',      types: ['medium'],  formula: '13+DEX2' },
  { name: 'Media armadura (CA 15+DEX≤2)',    types: ['medium'],  formula: '15+DEX2' },
  { name: 'Cota de malla (CA 16)',           types: ['heavy'],   formula: '16' },
  { name: 'Cota de bandas (CA 17)',          types: ['heavy'],   formula: '17' },
  { name: 'Armadura completa (CA 18)',       types: ['heavy'],   formula: '18' },
  { name: 'Armadura natural (CA 17 — Tortle)',types: [],         formula: '17',   special: 'tortle' },
  { name: 'Mage Armor (CA 13+DEX)',          types: [],          formula: '13+DEX', special: 'spell' },
  { name: 'Unarmored Defense',               types: [],          formula: 'special', special: 'class' },
];

export const WEAPON_OPTIONS = [
  // Simple melee
  { name: 'Club',          types: ['simple'], dmg: '1d4',    dmgType: 'bludgeoning' },
  { name: 'Dagger',        types: ['simple'], dmg: '1d4',    dmgType: 'piercing' },
  { name: 'Greatclub',     types: ['simple'], dmg: '1d8',    dmgType: 'bludgeoning' },
  { name: 'Handaxe',       types: ['simple'], dmg: '1d6',    dmgType: 'slashing' },
  { name: 'Javelin',       types: ['simple'], dmg: '1d6',    dmgType: 'piercing' },
  { name: 'Light Hammer',  types: ['simple'], dmg: '1d4',    dmgType: 'bludgeoning' },
  { name: 'Mace',          types: ['simple'], dmg: '1d6',    dmgType: 'bludgeoning' },
  { name: 'Quarterstaff',  types: ['simple'], dmg: '1d6',    dmgType: 'bludgeoning', versatile: '1d8' },
  { name: 'Scimitar',      types: ['simple','martial'], dmg: '1d6', dmgType: 'slashing' },
  { name: 'Shortsword',    types: ['simple','martial'], dmg: '1d6', dmgType: 'piercing' },
  { name: 'Sickle',        types: ['simple'], dmg: '1d4',    dmgType: 'slashing' },
  { name: 'Spear',         types: ['simple'], dmg: '1d6',    dmgType: 'piercing', versatile: '1d8' },
  // Simple ranged
  { name: 'Light Crossbow',types: ['simple'], dmg: '1d8',    dmgType: 'piercing' },
  { name: 'Shortbow',      types: ['simple'], dmg: '1d6',    dmgType: 'piercing' },
  { name: 'Dart',          types: ['simple'], dmg: '1d4',    dmgType: 'piercing' },
  { name: 'Sling',         types: ['simple'], dmg: '1d4',    dmgType: 'bludgeoning' },
  // Martial melee
  { name: 'Battleaxe',     types: ['martial'], dmg: '1d8',   dmgType: 'slashing',     versatile: '1d10' },
  { name: 'Flail',         types: ['martial'], dmg: '1d8',   dmgType: 'bludgeoning' },
  { name: 'Glaive',        types: ['martial'], dmg: '1d10',  dmgType: 'slashing',     reach: true },
  { name: 'Greataxe',      types: ['martial'], dmg: '1d12',  dmgType: 'slashing' },
  { name: 'Greatsword',    types: ['martial'], dmg: '2d6',   dmgType: 'slashing' },
  { name: 'Halberd',       types: ['martial'], dmg: '1d10',  dmgType: 'slashing',     reach: true },
  { name: 'Longsword',     types: ['martial'], dmg: '1d8',   dmgType: 'slashing',     versatile: '1d10' },
  { name: 'Maul',          types: ['martial'], dmg: '2d6',   dmgType: 'bludgeoning' },
  { name: 'Morningstar',   types: ['martial'], dmg: '1d8',   dmgType: 'piercing' },
  { name: 'Pike',          types: ['martial'], dmg: '1d10',  dmgType: 'piercing',     reach: true },
  { name: 'Rapier',        types: ['martial'], dmg: '1d8',   dmgType: 'piercing' },
  { name: 'Trident',       types: ['martial'], dmg: '1d6',   dmgType: 'piercing',     versatile: '1d8' },
  { name: 'War Pick',      types: ['martial'], dmg: '1d8',   dmgType: 'piercing' },
  { name: 'Warhammer',     types: ['martial'], dmg: '1d8',   dmgType: 'bludgeoning',  versatile: '1d10' },
  { name: 'Whip',          types: ['martial'], dmg: '1d4',   dmgType: 'slashing',     reach: true },
  // Martial ranged
  { name: 'Hand Crossbow', types: ['martial'], dmg: '1d6',   dmgType: 'piercing' },
  { name: 'Heavy Crossbow',types: ['martial'], dmg: '1d10',  dmgType: 'piercing' },
  { name: 'Longbow',       types: ['martial'], dmg: '1d8',   dmgType: 'piercing' },
];

// ASI levels per class
export const FEAT_ASI_LEVELS = {
  'Bárbaro':    [4,8,12,16,19],
  'Bardo':      [4,8,12,16,19],
  'Clérigo':    [4,8,12,16,19],
  'Druida':     [4,8,12,16,19],
  'Explorador': [4,8,10,16,19],
  'Guerrero':   [4,6,8,12,14,16,19],
  'Hechicero':  [4,8,12,16,19],
  'Mago':       [4,8,12,16,19],
  'Monje':      [4,8,12,16,19],
  'Paladín':    [4,8,12,16,19],
  'Pícaro':     [4,8,10,12,16,18,19],
  'Brujo':      [4,8,12,16,19],
  'Artífice':   [4,8,12,16,19],
};

// Proficiency bonus by level
export const PB_BY_LEVEL = [0,2,2,2,2,3,3,3,3,4,4,4,4,4,5,5,5,5,6,6,6];

// Hit dice by class
export const HIT_DICE = {
  'Bárbaro': 12, 'Guerrero': 10, 'Paladín': 10, 'Explorador': 10,
  'Bardo': 8, 'Clérigo': 8, 'Druida': 8, 'Monje': 8, 'Pícaro': 8, 'Brujo': 8,
  'Artífice': 8, 'Hechicero': 6, 'Mago': 6,
};

// Spellcasting ability by class
export const SPELL_ABILITY = {
  'Bardo': 'cha', 'Clérigo': 'wis', 'Druida': 'wis', 'Paladín': 'cha',
  'Explorador': 'wis', 'Hechicero': 'cha', 'Brujo': 'cha', 'Mago': 'int',
  'Artífice': 'int',
};

// Spellcasting progression
export const SPELL_PROGRESSION = {
  'Bardo': 'full', 'Clérigo': 'full', 'Druida': 'full', 'Mago': 'full', 'Hechicero': 'full',
  'Paladín': 'half', 'Explorador': 'half', 'Artífice': 'half',
  'Brujo': 'pact',
  'Bárbaro': 'none', 'Guerrero': 'none', 'Monje': 'none', 'Pícaro': 'none',
};

// Spell slots table [level][slotLevel] — full casters
export const SPELL_SLOTS_FULL = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
};

// Feats without prerequisites (valid for DM bonus feat)
export const FEATS_NO_PREREQ = [
  'Alert','Athlete','Actor','Chef','Crusher','Dual Wielder','Dungeon Delver','Durable',
  'Eldritch Adept','Fey Touched','Gift of Alacrity','Healer','Inspiring Leader',
  'Keen Mind','Linguist','Lucky','Magic Initiate (Bard)','Magic Initiate (Cleric)',
  'Magic Initiate (Druid)','Magic Initiate (Sorcerer)','Magic Initiate (Warlock)',
  'Magic Initiate (Wizard)','Metamagic Adept','Observant','Piercer','Poisoner',
  'Resilient (CON)','Resilient (DEX)','Resilient (WIS)','Resilient (STR)',
  'Shadow Touched','Skill Expert','Skilled','Slasher','Tavern Brawler',
  'Telekinetic','Telepathic','Tough','War Caster','Crusher','Mounted Combatant',
];

// All feats (for ASI replacement)
export const ALL_FEATS = [
  ...FEATS_NO_PREREQ,
  'Crossbow Expert','Elven Accuracy','Great Weapon Master','Heavily Armored',
  'Heavy Armor Master','Lightly Armored','Mage Slayer','Medium Armor Master',
  'Moderately Armored','Polearm Master','Ritual Caster','Savage Attacker',
  'Sentinel','Sharpshooter','Shield Master','Spell Sniper','Warcaster',
  'Weapon Master','Charger','Dragon Fear','Dragon Hide','Fade Away',
  'Fey Teleportation','Flames of Phlegethos','Infernal Constitution',
  'Orcish Fury','Prodigy','Second Chance','Squat Nimbleness',
  'Wood Elf Magic',
];

// Point buy cost table
export const PB_COST = {8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9};
export const PB_MAX_POINTS = 27;
export const PB_MIN = 8;
export const PB_MAX = 15;
