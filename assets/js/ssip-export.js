(function(){'use strict';
 let reverse874=null;
 function getReverse874(){if(reverse874)return reverse874;reverse874=new Map();let dec;try{dec=new TextDecoder('windows-874')}catch(_){dec=new TextDecoder('utf-8')}for(let i=0;i<256;i++){const ch=dec.decode(Uint8Array.of(i));if(ch&&!ch.includes('\uFFFD')&&!reverse874.has(ch))reverse874.set(ch,i)}return reverse874}
 function encode874(text){const map=getReverse874(),out=[];for(const ch of String(text||'')){const cp=ch.codePointAt(0);if(cp<128){out.push(cp);continue}if(map.has(ch)){out.push(map.get(ch));continue}out.push(63)}return new Uint8Array(out)}
 function rootPayload(xml){const noPi=window.SSIPParser.stripEndNote(xml);const m=noPi.match(/<(AIPN|CIPN)\b[\s\S]*<\/\1>\s*$/i);if(!m)throw new Error('ไม่พบ Root AIPN/CIPN สำหรับคำนวณ HMAC');return m[0].replace(/\s*$/,'')+'\r\n'}
 function withEndNote(xml){if(!window.SparkMD5)throw new Error('ไม่พบ SparkMD5');const clean=window.SSIPParser.stripEndNote(xml);const payload=rootPayload(clean);const bytes=encode874(payload);const hash=SparkMD5.ArrayBuffer.hash(bytes.buffer);return clean.replace(/\s*$/,'')+'\r\n<?EndNote HMAC="'+hash+'" ?>\r\n'}
 function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
 async function buildZip(state){const zip=new JSZip();for(const e of state.entries){if(e.isXml){const finalText=withEndNote(e.text);zip.file(e.path,encode874(finalText));}else zip.file(e.path,e.bytes)}return zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}})}
 window.SSIPExport={encode874,withEndNote,downloadBlob,buildZip};
})();
