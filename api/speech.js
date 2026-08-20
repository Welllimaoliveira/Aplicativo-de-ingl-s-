import { authorize, json, setCors } from "../lib/gemini.js";
const TTS_MODEL=process.env.GEMINI_TTS_MODEL||"gemini-3.1-flash-tts-preview";
const VOICES=new Set(["Kore","Puck","Achird","Aoede","Charon","Leda","Sulafat","Iapetus"]);
export default async function handler(req,res){
  setCors(res);if(req.method==="OPTIONS")return res.status(204).end();if(req.method!=="POST")return json(res,405,{error:"Método não permitido."});if(!authorize(req))return json(res,401,{error:"Código de acesso inválido."});
  const key=process.env.GEMINI_API_KEY||"",text=String(req.body?.text||"").trim();if(!key)return json(res,503,{error:"GEMINI_API_KEY não configurada no Vercel."});if(!text||text.length>1600)return json(res,400,{error:"Informe um texto entre 1 e 1600 caracteres."});
  const voice=VOICES.has(req.body?.voice)?req.body.voice:"Achird",language=["en-US","en-GB","pt-BR","es-ES","fr-FR"].includes(req.body?.language)?req.body.language:"en-US",style=String(req.body?.style||"natural, warm, patient teacher, clear pronunciation").slice(0,180),ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),50000);
  try{
    const models=[...new Set([TTS_MODEL,"gemini-3.1-flash-tts-preview","gemini-2.5-flash-preview-tts"])];let lastError="A Gemini não retornou áudio.";
    for(const model of models){
      const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:"POST",signal:ctrl.signal,headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{parts:[{text:`Read the exact text below. Style: ${style}. Do not add or remove words.\n\n${text}`}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{languageCode:language,voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){lastError=data?.error?.message||`Gemini TTS HTTP ${response.status}`;if([404,429,503].includes(response.status))continue;return json(res,response.status,{error:lastError})}
      const part=(data?.candidates?.[0]?.content?.parts||[]).find(p=>p.inlineData?.data);
      if(part)return json(res,200,{ok:true,audio:part.inlineData.data,mimeType:part.inlineData.mimeType||"audio/L16;rate=24000",sampleRate:24000,voice,model});
    }
    return json(res,502,{error:lastError});
  }catch(error){return json(res,500,{error:error?.name==="AbortError"?"A geração de voz excedeu o tempo limite.":String(error?.message||error)});}finally{clearTimeout(timer)}
}
