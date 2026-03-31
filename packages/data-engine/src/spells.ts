import { normalizeLabel, slugifyId } from "./normalize.js";

export type SpellCatalogEntry = {
  id: string;
  label: string;
  level: number;
  classes: string[];
  aliases: string[];
  school?: string;
  castingTime?: { type: string; value: number | null; label: string };
  range?: { value: number | null; units: string; label: string };
  duration?: { units: string; value: string; label: string };
  components?: Array<"vocal" | "somatic" | "material">;
  materials?: string;
  summary?: string;
  source?: { book?: string; page?: string };
  plutonium?: {
    source?: string;
    page?: string;
    hash?: string;
    propDroppable?: string;
  };
};

function spell(entry: Omit<SpellCatalogEntry, "id"> & { id?: string }): SpellCatalogEntry {
  return { id: entry.id ?? slugifyId(entry.label), ...entry };
}

export const spellCatalog: SpellCatalogEntry[] = [
  spell({ label: "Acid Splash", level: 0, classes: ["artificer", "sorcerer", "wizard"], aliases: ["salpicadura acida"], school: "con", summary: "Burbujas de acido alcanzan hasta dos objetivos cercanos." }),
  spell({ label: "Blade Ward", level: 0, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["guardia de cuchillas"], school: "abj", summary: "Resistencia breve contra dano fisico de armas." }),
  spell({ label: "Chill Touch", level: 0, classes: ["sorcerer", "warlock", "wizard"], aliases: ["toque helado"], school: "nec", summary: "La mano esqueletica inflige dano necrotico e impide curacion." }),
  spell({ label: "Dancing Lights", level: 0, classes: ["artificer", "bard", "sorcerer", "wizard"], aliases: ["luces danzantes"], school: "evo", summary: "Creas hasta cuatro luces moviles." }),
  spell({ label: "Druidcraft", level: 0, classes: ["druid"], aliases: ["druidismo"], school: "trs", summary: "Pequenos efectos naturales y presagios climaticos." }),
  spell({ id: "eldritch-blast", label: "Eldritch Blast", level: 0, classes: ["warlock"], aliases: ["estallido sobrenatural"], school: "evo", summary: "Descarga arcana que escala en numero de rayos." }),
  spell({ id: "fire-bolt", label: "Fire Bolt", level: 0, classes: ["artificer", "sorcerer", "wizard"], aliases: ["rayo de fuego"], school: "evo", summary: "Proyectil de fuego de largo alcance." }),
  spell({ label: "Light", level: 0, classes: ["artificer", "bard", "cleric", "sorcerer", "wizard"], aliases: ["luz"], school: "evo", summary: "Un objeto emite luz brillante y tenue." }),
  spell({ label: "Mage Hand", level: 0, classes: ["artificer", "bard", "sorcerer", "warlock", "wizard"], aliases: ["mano de mago"], school: "con", summary: "Una mano espectral manipula objetos a distancia." }),
  spell({ label: "Message", level: 0, classes: ["artificer", "bard", "sorcerer", "wizard"], aliases: ["mensaje"], school: "trs", summary: "Envias un susurro magico y recibes respuesta." }),
  spell({ id: "minor-illusion", label: "Minor Illusion", level: 0, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["ilusion menor"], school: "ill", summary: "Creas una imagen o sonido simple." }),
  spell({ label: "Poison Spray", level: 0, classes: ["artificer", "druid", "sorcerer", "warlock", "wizard"], aliases: ["rocio venenoso"], school: "con", summary: "Una bocanada toxica exige salvacion de Constitucion." }),
  spell({ label: "Prestidigitation", level: 0, classes: ["artificer", "bard", "sorcerer", "warlock", "wizard"], aliases: ["prestidigitacion"], school: "trs", summary: "Pequenos efectos magicos utilitarios." }),
  spell({ label: "Produce Flame", level: 0, classes: ["druid"], aliases: ["producir llama"], school: "con", summary: "Invocas una llama en la mano o la lanzas." }),
  spell({ id: "ray-of-frost", label: "Ray of Frost", level: 0, classes: ["artificer", "sorcerer", "wizard"], aliases: ["rayo de escarcha"], school: "evo", summary: "Rayo helado que reduce velocidad." }),
  spell({ label: "Resistance", level: 0, classes: ["artificer", "cleric", "druid"], aliases: ["resistencia"], school: "abj", summary: "El objetivo suma 1d4 a una salvacion." }),
  spell({ label: "Sacred Flame", level: 0, classes: ["cleric"], aliases: ["llama sagrada"], school: "evo", summary: "Llamarada radiante contra un objetivo." }),
  spell({ label: "Shocking Grasp", level: 0, classes: ["artificer", "sorcerer", "wizard"], aliases: ["agarre electrizante"], school: "evo", summary: "Descarga electrica que impide reacciones." }),
  spell({ label: "Spare the Dying", level: 0, classes: ["cleric"], aliases: ["perdonar a los moribundos"], school: "nec", summary: "Estabilizas a una criatura moribunda." }),
  spell({ label: "Thaumaturgy", level: 0, classes: ["cleric"], aliases: ["taumaturgia"], school: "trs", summary: "Pequenos portentos divinos." }),
  spell({ label: "Thorn Whip", level: 0, classes: ["druid"], aliases: ["latigo de espinas"], school: "trs", summary: "Latigo vegetal que atrae al objetivo." }),
  spell({ label: "Vicious Mockery", level: 0, classes: ["bard"], aliases: ["burla cruel"], school: "enc", summary: "Insulto magico con dano psiquico." }),
  spell({ label: "Armor of Agathys", level: 1, classes: ["warlock"], aliases: ["armadura de agathys"], school: "abj", summary: "Puntos temporales y dano frio de represalia." }),
  spell({ label: "Bless", level: 1, classes: ["cleric", "paladin"], aliases: ["bendecir"], school: "enc", summary: "Aliados suman 1d4 a ataques y salvaciones." }),
  spell({ label: "Charm Person", level: 1, classes: ["bard", "druid", "sorcerer", "warlock", "wizard"], aliases: ["encantar persona"], school: "enc", summary: "Un humanoide te ve como conocido amistoso." }),
  spell({ label: "Chromatic Orb", level: 1, classes: ["sorcerer", "wizard"], aliases: ["orbe cromatico"], school: "evo", summary: "Orbe elemental con dano a eleccion." }),
  spell({ label: "Command", level: 1, classes: ["cleric", "paladin"], aliases: ["orden"], school: "enc", summary: "Una orden de una palabra fuerza obediencia breve." }),
  spell({ label: "Cure Wounds", level: 1, classes: ["artificer", "bard", "cleric", "druid", "paladin", "ranger"], aliases: ["curar heridas"], school: "evo", summary: "Recuperacion directa de puntos de golpe." }),
  spell({ label: "Detect Magic", level: 1, classes: ["artificer", "bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "wizard"], aliases: ["detectar magia"], school: "div", summary: "Percibes magia y su escuela en el entorno." }),
  spell({ label: "Entangle", level: 1, classes: ["druid", "ranger"], aliases: ["enredar"], school: "con", summary: "Vegetacion brota y restringe criaturas en un area." }),
  spell({ label: "Disguise Self", level: 1, classes: ["artificer", "bard", "sorcerer", "wizard"], aliases: ["disfrazarse"], school: "ill", summary: "Alteras temporalmente tu apariencia." }),
  spell({ label: "Feather Fall", level: 1, classes: ["bard", "sorcerer", "wizard"], aliases: ["caida de pluma"], school: "trs", summary: "Hasta cinco criaturas descienden lentamente." }),
  spell({ label: "Faerie Fire", level: 1, classes: ["artificer", "bard", "druid"], aliases: ["fuego feerico"], school: "evo", summary: "El resplandor revela invisibles y concede ventaja para impactar." }),
  spell({ label: "Find Familiar", level: 1, classes: ["wizard"], aliases: ["encontrar familiar"], school: "con", summary: "Invocas un espiritu familiar." }),
  spell({ label: "Goodberry", level: 1, classes: ["druid", "ranger"], aliases: ["bayas buenas"], school: "trs", summary: "Creas bayas magicas que nutren y curan levemente." }),
  spell({ label: "Grease", level: 1, classes: ["artificer", "wizard"], aliases: ["grasa"], school: "con", summary: "Cubre el suelo de grasa resbaladiza y puede derribar enemigos." }),
  spell({ label: "Healing Word", level: 1, classes: ["bard", "cleric", "druid"], aliases: ["palabra sanadora"], school: "evo", summary: "Curacion a distancia con accion bonus." }),
  spell({ label: "Hellish Rebuke", level: 1, classes: ["warlock"], aliases: ["reprension infernal"], school: "evo", summary: "Una represalia ardiente castiga a quien te hiere." }),
  spell({ label: "Heroism", level: 1, classes: ["bard", "paladin"], aliases: ["heroismo"], school: "enc", summary: "La valentia magica protege del miedo y concede vigor temporal." }),
  spell({ label: "Hunter's Mark", level: 1, classes: ["ranger"], aliases: ["marca del cazador"], school: "div", summary: "Marcas a una presa para infligir dano adicional y seguirle el rastro." }),
  spell({ label: "Hex", level: 1, classes: ["warlock"], aliases: ["maldicion"], school: "enc", summary: "Maldices al objetivo y le impones desventaja." }),
  spell({ label: "Identify", level: 1, classes: ["artificer", "bard", "wizard"], aliases: ["identificar"], school: "div", summary: "Revelas propiedades magicas." }),
  spell({ label: "Inflict Wounds", level: 1, classes: ["cleric"], aliases: ["infligir heridas"], school: "nec", summary: "Toque necrotico de alto dano." }),
  spell({ label: "Magic Weapon", level: 2, classes: ["paladin", "ranger", "wizard"], aliases: ["arma magica"], school: "trs", summary: "Un arma no magica gana bonificador y se vuelve magica." }),
  spell({ label: "Mage Armor", level: 1, classes: ["sorcerer", "wizard"], aliases: ["armadura de mago"], school: "abj", summary: "AC base 13 + DEX sin armadura." }),
  spell({ label: "Magic Missile", level: 1, classes: ["sorcerer", "wizard"], aliases: ["misil magico"], school: "evo", summary: "Dardos automaticos de energia." }),
  spell({ label: "Protection from Evil and Good", level: 1, classes: ["cleric", "paladin", "warlock", "wizard"], aliases: ["proteccion contra el bien y el mal"], school: "abj", summary: "Proteges a un objetivo frente a ciertos tipos sobrenaturales." }),
  spell({ label: "Sanctuary", level: 1, classes: ["cleric"], aliases: ["santuario"], school: "abj", summary: "Los enemigos dudan antes de atacar al objetivo protegido." }),
  spell({ label: "Shield", level: 1, classes: ["artificer", "sorcerer", "wizard"], aliases: ["escudo"], school: "abj", summary: "Barrera invisible de +5 AC." }),
  spell({ label: "Sleep", level: 1, classes: ["bard", "sorcerer", "wizard"], aliases: ["dormir"], school: "enc", summary: "Ola magica que duerme criaturas." }),
  spell({ label: "Speak with Animals", level: 1, classes: ["bard", "druid", "ranger"], aliases: ["hablar con animales"], school: "div", summary: "Puedes comunicarte de forma limitada con bestias." }),
  spell({ label: "Thunderwave", level: 1, classes: ["bard", "druid", "sorcerer", "wizard"], aliases: ["onda atronadora"], school: "evo", summary: "Explosion sonora que empuja criaturas." }),
  spell({ label: "Aid", level: 2, classes: ["cleric", "paladin"], aliases: ["ayuda"], school: "abj", summary: "Aumentas puntos de golpe maximos y actuales de varios aliados." }),
  spell({ label: "Animal Messenger", level: 2, classes: ["bard", "druid", "ranger"], aliases: ["mensajero animal"], school: "enc", summary: "Un animal transporta un mensaje a una ubicacion designada." }),
  spell({ label: "Arcane Lock", level: 2, classes: ["artificer", "wizard"], aliases: ["cerradura arcana"], school: "abj", summary: "Aseguras magicamente puertas, cofres u otras entradas." }),
  spell({ label: "Augury", level: 2, classes: ["cleric", "druid", "wizard"], aliases: ["augurio"], school: "div", summary: "Recibes una lectura sobrenatural sobre un plan inmediato." }),
  spell({ label: "Barkskin", level: 2, classes: ["druid", "ranger"], aliases: ["piel de corteza"], school: "trs", summary: "La piel del objetivo se vuelve tan dura como la corteza." }),
  spell({ label: "Blur", level: 2, classes: ["artificer", "sorcerer", "wizard"], aliases: ["desenfoque"], school: "ill", summary: "Tu forma se vuelve borrosa y dificulta que te golpeen." }),
  spell({ label: "Find Steed", level: 2, classes: ["paladin"], aliases: ["encontrar montura"], school: "con", summary: "Invocas una montura espiritual leal e inteligente." }),
  spell({ label: "Hold Person", level: 2, classes: ["bard", "cleric", "druid", "sorcerer", "warlock", "wizard"], aliases: ["inmovilizar persona"], school: "enc", summary: "Paralizas a un humanoide." }),
  spell({ label: "Invisibility", level: 2, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["invisibilidad"], school: "ill", summary: "Una criatura se vuelve invisible." }),
  spell({ label: "Lesser Restoration", level: 2, classes: ["bard", "cleric", "druid", "paladin", "ranger"], aliases: ["restablecimiento menor"], school: "abj", summary: "Eliminas enfermedad o ciertas condiciones." }),
  spell({ label: "Levitate", level: 2, classes: ["artificer", "sorcerer", "wizard"], aliases: ["levitar"], school: "trs", summary: "Elevas a una criatura u objeto y controlas su altura." }),
  spell({ label: "Locate Object", level: 2, classes: ["bard", "cleric", "druid", "paladin", "ranger", "wizard"], aliases: ["localizar objeto"], school: "div", summary: "Percibes la direccion del objeto conocido mas cercano." }),
  spell({ label: "Mirror Image", level: 2, classes: ["bard", "sorcerer", "wizard"], aliases: ["imagen multiple"], school: "ill", summary: "Tres duplicados ilusorios te protegen." }),
  spell({ label: "Misty Step", level: 2, classes: ["sorcerer", "warlock", "wizard"], aliases: ["paso brumoso"], school: "con", summary: "Teletransporte corto como accion bonus." }),
  spell({ label: "Moonbeam", level: 2, classes: ["druid"], aliases: ["rayo lunar"], school: "evo", summary: "Cilindro de luz radiante persistente." }),
  spell({ label: "Pass without Trace", level: 2, classes: ["druid", "ranger"], aliases: ["pasar sin dejar rastro"], school: "abj", summary: "Un velo de sombras mejora el sigilo del grupo." }),
  spell({ label: "Scorching Ray", level: 2, classes: ["sorcerer", "wizard"], aliases: ["rayo abrasador"], school: "evo", summary: "Tres rayos de fuego dirigibles." }),
  spell({ label: "Shatter", level: 2, classes: ["artificer", "bard", "sorcerer", "warlock", "wizard"], aliases: ["quebrantar"], school: "evo", summary: "Detonacion atronadora en area." }),
  spell({ label: "Silence", level: 2, classes: ["bard", "cleric", "ranger"], aliases: ["silencio"], school: "ill", summary: "Creas una zona donde ningun sonido puede entrar o salir." }),
  spell({ label: "Spike Growth", level: 2, classes: ["druid", "ranger"], aliases: ["crecimiento de espinas"], school: "trs", summary: "El terreno se cubre de espinas ocultas que frenan y hieren." }),
  spell({ label: "Spiritual Weapon", level: 2, classes: ["cleric"], aliases: ["arma espiritual"], school: "evo", summary: "Arma flotante que ataca con accion bonus." }),
  spell({ label: "Suggestion", level: 2, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["sugestion"], school: "enc", summary: "Implantas una orden razonable y duradera." }),
  spell({ label: "Zone of Truth", level: 2, classes: ["bard", "cleric", "paladin"], aliases: ["zona de verdad"], school: "enc", summary: "Un area magica dificulta decir mentiras deliberadas." }),
  spell({ label: "Web", level: 2, classes: ["artificer", "sorcerer", "wizard"], aliases: ["telarana"], school: "con", summary: "Area de telaranas pegajosas y restrictivas." }),
  spell({ label: "Call Lightning", level: 3, classes: ["druid"], aliases: ["llamar relampagos"], school: "con", summary: "Invocas una tormenta que descarga rayos repetidos." }),
  spell({ label: "Counterspell", level: 3, classes: ["sorcerer", "warlock", "wizard"], aliases: ["contraconjuro"], school: "abj", summary: "Interrumpes el conjuro de otra criatura." }),
  spell({ label: "Crusader's Mantle", level: 3, classes: ["paladin"], aliases: ["manto del cruzado"], school: "evo", summary: "Un aura sagrada hace que las armas aliadas inflijan dano radiante extra." }),
  spell({ label: "Dispel Magic", level: 3, classes: ["bard", "cleric", "druid", "paladin", "sorcerer", "warlock", "wizard"], aliases: ["disipar magia"], school: "abj", summary: "Terminas un efecto magico activo." }),
  spell({ label: "Glyph of Warding", level: 3, classes: ["bard", "cleric", "wizard"], aliases: ["glifo custodio"], school: "abj", summary: "Inscribes una trampa magica con explosiones o conjuros almacenados." }),
  spell({ label: "Fear", level: 3, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["miedo"], school: "ill", summary: "Cono aterrador que hace huir a los objetivos." }),
  spell({ label: "Fireball", level: 3, classes: ["sorcerer", "wizard"], aliases: ["bola de fuego"], school: "evo", summary: "Explosion de fuego en gran area." }),
  spell({ label: "Fly", level: 3, classes: ["sorcerer", "warlock", "wizard"], aliases: ["volar"], school: "trs", summary: "Otorgas velocidad de vuelo al objetivo." }),
  spell({ label: "Haste", level: 3, classes: ["sorcerer", "wizard"], aliases: ["prisa"], school: "trs", summary: "Gran mejora de velocidad, defensa y acciones." }),
  spell({ label: "Hunger of Hadar", level: 3, classes: ["warlock"], aliases: ["hambre de hadar"], school: "con", summary: "Una esfera de oscuridad famelica ciega, hiere y obstaculiza." }),
  spell({ label: "Hypnotic Pattern", level: 3, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["patron hipnotico"], school: "ill", summary: "Patron ilusorio que incapacita en area." }),
  spell({ label: "Lightning Bolt", level: 3, classes: ["sorcerer", "wizard"], aliases: ["rayo"], school: "evo", summary: "Rayo lineal de dano electrico severo." }),
  spell({ label: "Plant Growth", level: 3, classes: ["bard", "druid", "ranger"], aliases: ["crecimiento vegetal"], school: "trs", summary: "La vegetacion se vuelve densa o crece rapidamente en un area." }),
  spell({ label: "Revivify", level: 3, classes: ["artificer", "cleric", "paladin"], aliases: ["revivificar"], school: "nec", summary: "Devuelves la vida a una criatura recien fallecida." }),
  spell({ label: "Spirit Shroud", level: 3, classes: ["paladin", "warlock", "wizard"], aliases: ["manto espiritual"], school: "nec", summary: "Espiritus cercanos potencian tus ataques y entorpecen la curacion enemiga." }),
  spell({ label: "Spirit Guardians", level: 3, classes: ["cleric"], aliases: ["guardianes espirituales"], school: "con", summary: "Espiritus protectores danan y ralentizan enemigos." }),
  spell({ label: "Banishment", level: 4, classes: ["cleric", "paladin", "sorcerer", "warlock", "wizard"], aliases: ["destierro"], school: "abj", summary: "Intentas expulsar a una criatura a otro plano." }),
  spell({ label: "Death Ward", level: 4, classes: ["cleric", "paladin"], aliases: ["guardia contra la muerte"], school: "abj", summary: "Previenes que el objetivo caiga a 0 pg una vez." }),
  spell({ label: "Dimension Door", level: 4, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["puerta dimensional"], school: "con", summary: "Teletransporte de largo alcance para ti y un acompanante." }),
  spell({ label: "Freedom of Movement", level: 4, classes: ["bard", "cleric", "druid", "ranger"], aliases: ["libertad de movimiento"], school: "abj", summary: "El objetivo ignora restricciones comunes al movimiento durante horas." }),
  spell({ label: "Greater Invisibility", level: 4, classes: ["bard", "sorcerer", "wizard"], aliases: ["invisibilidad superior"], school: "ill", summary: "Invisibilidad que persiste aunque ataques o lances conjuros." }),
  spell({ label: "Ice Storm", level: 4, classes: ["druid", "sorcerer", "wizard"], aliases: ["tormenta de hielo"], school: "evo", summary: "Granizada helada que inflige dano en area y dificulta el terreno." }),
  spell({ label: "Stoneskin", level: 4, classes: ["druid", "ranger", "sorcerer", "wizard"], aliases: ["piel de piedra"], school: "abj", summary: "La carne del objetivo se endurece frente a armas no magicas." }),
  spell({ label: "Polymorph", level: 4, classes: ["bard", "druid", "sorcerer", "wizard"], aliases: ["polimorfia"], school: "trs", summary: "Transformas a una criatura en otra forma bestial." }),
  spell({ label: "Cone of Cold", level: 5, classes: ["sorcerer", "wizard"], aliases: ["cono de frio"], school: "evo", summary: "Un gran cono helado inflige dano de frio masivo." }),
  spell({ label: "Flame Strike", level: 5, classes: ["cleric"], aliases: ["golpe flamigero"], school: "evo", summary: "Columna de fuego y radiancia castiga a los enemigos en un area." }),
  spell({ label: "Greater Restoration", level: 5, classes: ["bard", "cleric", "druid"], aliases: ["restablecimiento mayor"], school: "abj", summary: "Eliminas efectos debilitantes de alto nivel." }),
  spell({ label: "Hold Monster", level: 5, classes: ["bard", "sorcerer", "warlock", "wizard"], aliases: ["inmovilizar monstruo"], school: "enc", summary: "Paralizas a una criatura de cualquier tipo." }),
  spell({ label: "Mass Cure Wounds", level: 5, classes: ["bard", "cleric", "druid"], aliases: ["curacion en masa"], school: "evo", summary: "Varias criaturas recuperan puntos de golpe a la vez." }),
  spell({ label: "Scrying", level: 5, classes: ["bard", "cleric", "druid", "warlock", "wizard"], aliases: ["escrutinio"], school: "div", summary: "Observas a una criatura a distancia mediante un sensor invisible." }),
  spell({ label: "Wall of Force", level: 5, classes: ["wizard"], aliases: ["muro de fuerza"], school: "evo", summary: "Creas una barrera invisible casi imposible de atravesar." }),
];

const spellAliasMap = new Map<string, string>();

for (const entry of spellCatalog) {
  spellAliasMap.set(normalizeLabel(entry.id), entry.id);
  spellAliasMap.set(normalizeLabel(entry.label), entry.id);
  for (const alias of entry.aliases) spellAliasMap.set(normalizeLabel(alias), entry.id);
}

export function getSpellClasses(spellId: string): string[] {
  return spellCatalog.find((entry) => entry.id === spellId)?.classes ?? [];
}

export function getSpellsForClass(classId: string): SpellCatalogEntry[] {
  return spellCatalog.filter((entry) => entry.classes.includes(classId));
}

export function resolveSpellId(value: string): string {
  return spellAliasMap.get(normalizeLabel(value)) ?? slugifyId(value);
}

export function getSpellCatalogEntry(value: string): SpellCatalogEntry | undefined {
  const resolvedId = resolveSpellId(value);
  return spellCatalog.find((entry) => entry.id === resolvedId);
}
