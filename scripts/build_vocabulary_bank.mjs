import fs from 'node:fs';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) throw new Error('Use: node build_vocabulary_bank.mjs <en_50k.txt> <vocabulary-bank.js>');

const themes = {
  work: ['Trabalho','💼','office career job task meeting colleague manager employee employer salary deadline schedule shift team project report email interview resume promotion training feedback productivity workplace professional hire retire contract department assistant director leadership remote overtime vacation agenda assignment attendance benefit bonus boss break briefing calendar candidate conference cooperation coworker crew duty efficiency evaluation experience goal human resources instruction occupation organization payroll performance position presentation procedure qualification recruit recruitment responsibility role seminar staff supervisor target teamwork timetable union vacancy wage workshop workload workforce apprentice consultant coordinator designer operator planner technician specialist administration administrative approval archive document equipment facility headquarters policy process requirement'],
  travel: ['Viagens','✈️','travel trip journey tourism tourist passport visa airport airplane flight luggage baggage ticket hotel hostel reservation destination map route guide beach mountain abroad foreign departure arrival customs border suitcase adventure cruise train station platform taxi subway bus ferry accommodation airline aisle backpack boarding cabin cancellation capital city connection delay embassy excursion fare gate immigration itinerary landmark local motel passenger pilot railway resort sightseeing terminal transfer traveler traveller vacation voyage arrival lounge runway security seat shuttle stop tour translator guidebook highway rental checkin checkout currency downtown district monument neighborhood museum palace park pier port schedule souvenir temple tower traffic transit transportation vehicle village waterfall weekend'],
  business: ['Negócios','📊','business company market customer client service product sales profit revenue cost budget strategy brand competition partner supplier negotiation deal invoice payment commerce retail wholesale startup entrepreneur enterprise industry growth demand supply management executive investment shareholder accounting acquisition advertisement agreement asset audit balance branch capital cash commission consumer corporation credit delivery distribution economy employment export forecast import insurance inventory leadership logistics manufacturer marketing merger objective operation order ownership partnership portfolio proposal purchase quality quarter refund risk shipment stakeholder success tax trade trademark transaction value warehouse warranty annual commercial competitive corporate financial global launch margin network opportunity planning price production productivity resource return campaign negotiation negotiate advertise advertising analyst benchmark buyer seller founder innovation franchise'],
  art: ['Arte e cultura','🎨','art artist painting painter drawing sculpture museum gallery exhibition canvas color portrait landscape photography photograph camera design creative creativity music musician concert theater theatre cinema film movie actor actress dance dancer literature poem poetry novel writer author culture festival abstract animation architecture audience ballet band brush ceramic choir choreography classic collection comedy composer composition costume craft critic cultural curator documentary drama edition fashion fiction frame illustration instrument jazz masterpiece melody modern mural opera orchestra performance performer piano picture playwright pottery print rhythm scene singer song stage studio style symphony talent technique visual watercolor artwork biography character chapter cinema contemporary creativity exhibit folklore genre guitar harmony image literary lyric microphone narrative novelist photograph publishing reader recording screen script sketch soundtrack story tradition verse violin'],
  technology: ['Tecnologia','💻','technology computer software hardware internet website application app data database network server cloud digital device screen keyboard mouse code coding programmer developer algorithm artificial intelligence robot automation security password online virtual mobile smartphone download upload file folder'],
  engineering: ['Engenharia','⚙️','engineering engineer construction building structure design drawing project calculation material steel concrete cable pipe equipment machine motor energy electrical mechanical civil architecture blueprint measurement dimension load pressure system maintenance installation safety quality inspection'],
  science: ['Ciência','🔬','science scientist research experiment laboratory theory evidence analysis discovery physics chemistry biology astronomy space planet star galaxy atom molecule cell gene evolution climate environment observation method result hypothesis energy matter gravity temperature'],
  health: ['Saúde','🩺','health healthy doctor nurse hospital clinic medicine medical patient treatment disease illness symptom pain fever injury emergency surgery therapy exercise fitness diet nutrition mental stress sleep recovery pharmacy appointment diagnosis prevention'],
  food: ['Alimentação','🍽️','food meal breakfast lunch dinner restaurant kitchen cooking recipe ingredient bread rice pasta meat chicken fish egg milk cheese fruit vegetable apple banana orange coffee tea water juice sugar salt pepper dessert cake menu waiter order taste flavor'],
  finance: ['Finanças','💰','finance financial money bank account cash credit debit card loan debt interest tax income expense savings insurance pension investment stock share fund price value currency dollar euro payment bill budget wealth economy economic'],
  education: ['Educação','🎓','education school university college student teacher professor class lesson course study learning knowledge book notebook pencil exam test grade homework classroom library language English grammar vocabulary skill certificate degree scholarship'],
  home: ['Casa e cotidiano','🏠','home house apartment room bedroom bathroom kitchen living garden door window wall floor roof table chair bed sofa lamp key family neighbor cleaning laundry shower morning afternoon evening routine'],
  nature: ['Natureza','🌿','nature animal plant tree flower forest river lake ocean sea mountain valley island weather rain wind storm snow sun moon earth fire air wildlife bird dog cat horse insect farm garden'],
  sports: ['Esportes','⚽','sport sports football soccer basketball volleyball tennis swimming running cycling race game player team coach match championship score goal ball stadium training athlete competition medal victory defeat'],
  emotions: ['Emoções','😊','emotion feeling happy happiness sad sadness angry anger afraid fear surprised surprise excited excitement calm worried anxiety love hate hope trust confidence courage proud shame lonely tired bored joy'],
  society: ['Sociedade','🌍','society community people person citizen government public political politics election law rights freedom justice equality culture tradition religion history media news communication relationship population city country world'],
  hospitality: ['Hotelaria','🏨','hospitality hotel guest room reception receptionist booking reservation checkin checkout key service breakfast housekeeping towel bed lobby elevator restaurant concierge luggage comfort welcome'],
  transport: ['Transportes','🚗','transport transportation car vehicle truck bus train subway bicycle motorcycle road street highway traffic driver passenger station stop bridge tunnel fuel engine wheel parking'],
  shopping: ['Compras','🛍️','shopping shop store mall market buy sell price discount sale cashier receipt basket cart size clothes shoes gift return exchange delivery online customer'],
  communication: ['Comunicação','💬','communication speak talk say tell ask answer question conversation message call phone email letter meeting presentation explain describe discuss agree disagree listen read write translate'],
};

const blocked = new Set('fuck fucking fucked shit bullshit bitch bastard asshole porn porno sex sexy dick pussy rape nazi cocaine heroin marijuana'.split(' '));
const themeLookup = new Map();
for (const [id,[label,icon,words]] of Object.entries(themes)) {
  for (const word of words.toLowerCase().split(/\s+/)) if (!themeLookup.has(word)) themeLookup.set(word,id);
}

const frequencyWords = fs.readFileSync(inputPath,'utf8').split(/\r?\n/).map(line=>line.split(/\s+/)[0].toLowerCase());
const all = [];
const seen = new Set();
function add(word, theme = 'general') {
  if (!/^[a-z][a-z'-]{2,17}$/.test(word) || blocked.has(word) || seen.has(word)) return;
  seen.add(word); all.push([word,theme]);
}
for (const [word,theme] of themeLookup) add(word,theme);
for (const word of frequencyWords) add(word,themeLookup.get(word)||'general');
const selected = all.slice(0,3600);
if (selected.length < 3200) throw new Error(`Banco insuficiente: ${selected.length}`);

const themeMeta = [['all','Todos os temas','🌐'],['general','Vocabulário geral','🧠'],...Object.entries(themes).map(([id,[label,icon]])=>[id,label,icon])];
const header = `/* Banco com ${selected.length} palavras. Frequências derivadas de hermitdave/FrequencyWords (conteúdo CC BY-SA 4.0). Gerado automaticamente; edite scripts/build_vocabulary_bank.mjs. */\n`;
const output = `${header}window.WORD_THEMES=${JSON.stringify(themeMeta)};\nwindow.WORD_BANK=${JSON.stringify(selected)};\n`;
fs.writeFileSync(outputPath,output,'utf8');
console.log(`Geradas ${selected.length} palavras em ${themeMeta.length} opções temáticas.`);
