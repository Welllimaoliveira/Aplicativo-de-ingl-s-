const http=require('http');
const PORT=Number(process.env.PORT||8787);
const API_KEY=process.env.GEMINI_API_KEY||'';
const MODEL=process.env.GEMINI_MODEL||'gemini-3.6-flash';
const APP_TOKEN=process.env.APP_ACCESS_TOKEN||'';
const MOCK=process.env.MOCK_AI==='1';

function send(res,status,obj){
  res.writeHead(status,{
    'Content-Type':'application/json; charset=utf-8',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type, X-App-Token',
    'Access-Control-Allow-Methods':'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(obj))
}
function readJson(req){
  return new Promise((resolve,reject)=>{
    let data='';
    req.on('data',c=>{data+=c;if(data.length>2000000){reject(new Error('Payload muito grande'));req.destroy()}});
    req.on('end',()=>{try{resolve(data?JSON.parse(data):{})}catch(e){reject(new Error('JSON inválido'))}});
    req.on('error',reject)
  })
}
function authorized(req){if(!APP_TOKEN)return true;return req.headers['x-app-token']===APP_TOKEN}
function parseGemini(data){
  let raw=(data?.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('').trim();
  raw=raw.replace(/^```json\s*|```$/g,'').trim();
  try{return JSON.parse(raw)}catch(e){throw new Error('A IA retornou um formato inesperado.')}
}
async function gemini(system,contents,temperature=.45){
  if(MOCK)return mockReply(system,contents);
  if(!API_KEY)throw new Error('GEMINI_API_KEY não configurada no servidor.');
  let ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),50000);
  try{
    let r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,{
      method:'POST',
      headers:{'Content-Type':'application/json','x-goog-api-key':API_KEY},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:system}]},
        contents,
        generationConfig:{temperature,responseMimeType:'application/json'}
      }),
      signal:ctrl.signal
    });
    let data=await r.json();
    if(!r.ok)throw new Error(data?.error?.message||`Gemini HTTP ${r.status}`);
    return parseGemini(data)
  }finally{clearTimeout(timer)}
}
function levelText(l){return l==='beginner'?'A1 beginner':l==='intermediate'?'A2-B1 intermediate':'B2-C1 advanced'}
function topicText(t){return({free:'any everyday topic chosen naturally by the learner',daily:'daily life and routines',travel:'travel, airports, hotels and tourism',work:'workplace and professional situations',restaurant:'restaurants and ordering food',interview:'job interview practice',technology:'technology and artificial intelligence'})[t]||'general conversation'}

async function conversation(body){
  let level=levelText(body.level),topic=topicText(body.topic);
  let system=`You are Fala Real AI, a friendly English conversation tutor for a Brazilian Portuguese speaker. Learner level: ${level}. Topic: ${topic}. Keep the conversation NATURAL and in English, usually 1-3 short sentences plus a follow-up question. Correct only important mistakes. Return JSON ONLY: {"reply":"...","correction":{"corrected":null or "better English sentence","explanationPt":null or "short explanation in Brazilian Portuguese"}}.`;
  let hist=Array.isArray(body.history)?body.history.slice(-16):[];
  let contents=hist.map(h=>({role:h.role==='model'?'model':'user',parts:[{text:String(h.text||'')}]}));
  if(body.action==='start'&&!contents.length)contents.push({role:'user',parts:[{text:'Start the conversation with a friendly opening question appropriate to the topic and level.'}]});
  return gemini(system,contents,.6)
}

async function conversationReport(body){
  let system=`You are an English speaking examiner coaching a Brazilian Portuguese learner. Analyze the TRANSCRIPTS. Recognition confidence is only a proxy, not a true acoustic pronunciation score. Return JSON ONLY with: overall 0-100, cefr A1-C2, grammar 0-100, vocabulary 0-100, fluency 0-100, naturalness 0-100, pronunciationProxy 0-100, summaryPt, strengths array Portuguese, corrections array max 8 {said,better,whyPt}, recurrentErrors array Portuguese, studyPlan 3-6 items Portuguese. Do not invent errors not present.`;
  return gemini(system,[{role:'user',parts:[{text:JSON.stringify(body)}]}],.25)
}

async function essayReview(body){
  let lang=body.language==='pt'?'Portuguese':'English',review=body.reviewLanguage==='en'?'English':'Brazilian Portuguese';
  let system=`You are Banca Real, a rigorous but pedagogical writing examiner. Essay language: ${lang}. Feedback language: ${review}. Evaluate the full text for task fulfillment, argument quality, structure, coherence, grammar, spelling, punctuation, vocabulary, style and naturalness. IMPORTANT: correctedText MUST remain entirely in the SAME LANGUAGE as the original essay (${lang}) and must contain the full corrected essay. Return JSON ONLY: {"score":0-100,"cefr":"A1-C2 or N/A","criteria":{"task":0-20,"organization":0-15,"coherence":0-15,"grammar":0-20,"vocabulary":0-15,"spelling":0-15},"summaryPt":"...","summaryEn":"...","strengths":["..."],"priorities":["..."],"corrections":[{"original":"exact excerpt","corrected":"corrected excerpt in essay language","explanationPt":"...","explanationEn":"..."}],"correctedText":"full corrected essay in original language"}.`;
  return gemini(system,[{role:'user',parts:[{text:JSON.stringify(body)}]}],.25)
}

function storyLevelText(l){return l==='advanced'?'B2-C1 advanced (richer vocabulary, longer sentences, some idioms)':l==='intermediate'?'A2-B1 intermediate (everyday vocabulary, simple past/future, connectors)':'A1 beginner (very simple present-tense sentences, common words, short clauses)'}
async function story(body){
  let theme=String(body.theme||'').trim().slice(0,200);
  if(!theme)throw new Error('Descreva um tema para a história.');
  let level=['beginner','intermediate','advanced'].includes(body.level)?body.level:'beginner';
  let system=`You are a children/adult-friendly English-learning story writer for Brazilian Portuguese speakers using the "Fala Real" app.
Write an ORIGINAL story (never copy an existing copyrighted text) inspired by the theme the learner gives you, at ${storyLevelText(level)} level.
Rules:
- At least 20 and at most 26 short segments (paragraphs), each 1-3 sentences in English.
- Every segment needs an accurate, natural Brazilian Portuguese translation.
- Content must be wholesome and appropriate for all ages: no violence, profanity, sexual content, drugs or real tragedy - even for dark/mythological/biblical/historical themes, tell it in a gentle, respectful, age-appropriate way.
- Keep vocabulary and grammar consistent with the requested level throughout.
- Pick one emoji that represents the story as its icon.
Return ONLY JSON in this exact shape:
{"title":"Short English title","description":"Uma frase em português descrevendo a história.","icon":"📖","segments":[["Tradução em português.","English sentence."], ...at least 20 items...]}`;
  let prompt=`Tema pedido pelo aluno: "${theme}". Nível: ${level}. Gere a história agora, com pelo menos 20 segmentos.`;
  let result=await gemini(system,[{role:'user',parts:[{text:prompt}]}],.5);
  let segments=Array.isArray(result?.segments)?result.segments.filter(s=>Array.isArray(s)&&s[0]&&s[1]):[];
  if(segments.length<12)throw new Error('A IA gerou uma história curta demais. Tente descrever o tema de outro jeito.');
  return {id:`ai-${Date.now()}`,level,icon:typeof result.icon==='string'&&result.icon?result.icon:'📖',title:String(result.title||theme).slice(0,120),description:String(result.description||'').slice(0,240),segments:segments.slice(0,30),generated:true};
}
async function dictionary(body){
  let system=`You are a concise English-Portuguese learner dictionary. Return JSON ONLY: {"word":"...","translation":"Brazilian Portuguese meaning(s)","example":"one simple English example sentence","tipPt":"one short Portuguese usage or pronunciation tip"}.`;
  return gemini(system,[{role:'user',parts:[{text:String(body.word||'').slice(0,80)}]}],.2)
}

function mockReply(system){
  let s=system.toLowerCase();
  if(s.includes('writing examiner'))return {
    score:82,cefr:'B1',
    criteria:{task:17,organization:12,coherence:12,grammar:16,vocabulary:13,spelling:12},
    summaryPt:'Texto claro, com alguns pontos de gramática e desenvolvimento.',
    summaryEn:'Clear text with some grammar and development points.',
    strengths:['Ideia central clara.','Boa tentativa de organização.'],
    priorities:['Aprofunde o segundo argumento.','Revise concordância e artigos.'],
    corrections:[{original:'I am agree',corrected:'I agree',explanationPt:'Agree é verbo.',explanationEn:'Agree is a verb.'}],
    correctedText:'I agree with the main idea. This is a corrected sample essay.'
  };
  if(s.includes('speaking examiner'))return {
    overall:78,cefr:'B1',grammar:74,vocabulary:76,fluency:80,naturalness:75,pronunciationProxy:82,
    summaryPt:'Você sustentou a conversa e comunicou suas ideias.',
    strengths:['Boa continuidade da conversa.','Vocabulário adequado ao tema.'],
    corrections:[{said:'I have 30 years',better:'I am 30 years old',whyPt:'Para idade, use o verbo to be.'}],
    recurrentErrors:['Preposições e estruturas fixas.'],
    studyPlan:['Treinar perguntas no passado.','Usar conectivos em respostas mais longas.','Repetir frases corrigidas em voz alta.']
  };
  if(s.includes('learner dictionary'))return {word:'example',translation:'exemplo',example:'This is an example.',tipPt:'O som inicial é /ɪg/.'};
  if(s.includes('story writer'))return {title:'A Small Adventure',description:'Uma pequena aventura de exemplo (modo simulado).',icon:'📖',segments:Array.from({length:20},(_,i)=>[`Parágrafo de exemplo número ${i+1} em português.`,`Sample paragraph number ${i+1} in English.`])};
  return {reply:'Great! Tell me a little more about that. What happened next?',correction:{corrected:null,explanationPt:null}}
}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS')return send(res,204,{});
  if(req.url==='/health'&&req.method==='GET')return send(res,200,{ok:true,aiConfigured:!!API_KEY||MOCK,model:MODEL,mock:MOCK});
  if(!authorized(req))return send(res,401,{error:'Código de acesso inválido.'});
  try{
    if(req.method!=='POST')return send(res,404,{error:'Rota não encontrada.'});
    let body=await readJson(req);
    if(req.url==='/api/conversation')return send(res,200,await conversation(body));
    if(req.url==='/api/conversation/report')return send(res,200,await conversationReport(body));
    if(req.url==='/api/essay/review')return send(res,200,await essayReview(body));
    if(req.url==='/api/dictionary')return send(res,200,await dictionary(body));
    if(req.url==='/api/story')return send(res,200,await story(body));
    return send(res,404,{error:'Rota não encontrada.'})
  }catch(e){
    console.error(e);
    return send(res,500,{error:e.name==='AbortError'?'Tempo limite ao consultar a IA.':e.message||'Erro interno.'})
  }
});
server.listen(PORT,()=>console.log(`Fala Real backend on :${PORT} model=${MODEL} mock=${MOCK}`));
