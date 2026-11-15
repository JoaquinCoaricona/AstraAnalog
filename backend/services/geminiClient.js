import '../config.js';
function fail(message,status=502){return Object.assign(new Error(message),{status});}
// Convertir el esquema heredado a JSON Schema para el formato REST documentado.
function jsonSchema(schema){
 const result={...schema};
 if(typeof result.type==='string')result.type=result.type.toLowerCase();
 if(result.nullable){result.type=[result.type,'null'];delete result.nullable;}
 if(result.properties)result.properties=Object.fromEntries(Object.entries(result.properties).map(([key,value])=>[key,jsonSchema(value)]));
 if(result.items)result.items=jsonSchema(result.items);
 return result;
}
// Cliente REST único. Sin reintentos automáticos: una solicitud por etapa.
export async function generateContent({body,signal,timeoutMs=65000,maxInputBytes=24000}){
 const key=process.env.GEMINI_API_KEY?.trim(),model=(process.env.GEMINI_MODEL||'gemini-3.5-flash-lite').trim();
 if(!key)throw fail('El análisis no está disponible en este momento.',503);
 if(!/^[a-z0-9.-]+$/i.test(model))throw fail('El análisis no está disponible en este momento.',500);
 const generationConfig={...body.generationConfig};
 const is25=model.startsWith('gemini-2.5-');
 const hasTools=Boolean(body.tools?.length);
 if(is25){
  // Gemini 2.5 usa thinkingBudget y no combina grounding con JSON forzado.
  generationConfig.thinkingConfig={thinkingBudget:0};
  if(hasTools){delete generationConfig.responseSchema;delete generationConfig.responseMimeType;delete generationConfig.responseFormat;}
 }
 if(generationConfig.responseSchema&&!is25){
  generationConfig.responseFormat={text:{mimeType:'APPLICATION_JSON',schema:jsonSchema(generationConfig.responseSchema)}};
  delete generationConfig.responseSchema;delete generationConfig.responseMimeType;
 }
 const serialized=JSON.stringify({...body,generationConfig}),inputBytes=Buffer.byteLength(serialized,'utf8');
 if(inputBytes>maxInputBytes)throw fail('El contexto supera el presupuesto de esta etapa. No se envió la solicitud.',413);
 let response;
 try{response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:serialized,signal:signal?AbortSignal.any([signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs)});}
 catch(error){if(signal?.aborted)throw error;throw fail(error.name==='TimeoutError'?'El análisis está tardando más de lo esperado. Intentá nuevamente.':'No pudimos conectar con el servicio de análisis. Intentá más tarde.',504);}
 const data=await response.json().catch(()=>null);
 if(!response.ok){
  const message=response.status===429?'El análisis no está disponible en este momento. Intentá nuevamente en unos minutos.':'No pudimos completar el análisis. Intentá más tarde.';
  throw fail(message,response.status===429?429:502);
 }
 if(!data||!Array.isArray(data.candidates))throw fail('El proveedor no entregó una respuesta de generación válida.');
 return {data,model,inputBytes};
}
