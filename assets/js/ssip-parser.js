(function(){'use strict';
 const SECTION_ORDER=['Header','ClaimAuth','IPADT','IPDx','IPOp','Invoices','Coinsurance','Raw XML'];
 const SCHEMAS={
  Header:{title:'Header — ข้อมูลส่วนหัวเอกสาร',fields:[
   {name:'DocClass',req:'R',format:'CV',def:'หมวดเอกสาร ระบบเบิกผู้ป่วยใน; ตาม CIPN กำหนดค่า IPClaim'},
   {name:'DocSysID',req:'R',format:'CV',def:'รหัสระบบเอกสาร เช่น CIPN; กรณีเอกสารแก้ไขอาจต่อท้าย SubmType'},
   {name:'serviceEvent',req:'R',format:'CV',def:'หมวดการบริการ; ADT = admission / discharge / transfer'},
   {name:'authorID',req:'R',format:'ID9',def:'รหัสผู้ทำเอกสาร 5 หลัก ใช้รหัสสถานพยาบาล'},
   {name:'authorName',req:'R',format:'ST',def:'ชื่อผู้ทำเอกสาร/ชื่อสถานพยาบาลที่ให้การรักษาและให้ข้อมูล'},
   {name:'effectiveTime',req:'R',format:'DT',def:'วันเวลาที่ออกเอกสาร หรือวันที่จัดทำเอกสารแล้วเสร็จ'}]},
  ClaimAuth:{title:'ClaimAuth — ข้อมูลแจ้ง/ขออนุมัติรับผู้ป่วยใน',fields:[
   {name:'AuthCode',req:'R',format:'ST',def:'รหัสตอบรับจากระบบแจ้ง/ขออนุมัติการรับผู้ป่วยใน'},
   {name:'AuthDT',req:'R',format:'DT',def:'วันที่และเวลาที่ได้รับ AuthCode ตอบรับจากระบบ'},
   {name:'UPayPlan',req:'R',format:'CV',def:'รหัสแบบแผนหรือบัญชีที่ใช้การเบิกจ่ายครั้งนี้'},
   {name:'ServiceType',req:'R',format:'CV',def:'รหัสประเภทบริการผู้ป่วยใน เช่น IP ผู้ป่วยในปกติ, OS, DS'},
   {name:'ProjectCode',req:'C',format:'CV',def:'รหัสโครงการเบิกพิเศษหรือเฉพาะกิจ'},
   {name:'EventCode',req:'C',format:'CV',def:'รหัสเบิกกรณีเหตุการณ์หรืออุบัติการณ์พิเศษ'},
   {name:'UserReserve',req:'O',format:'ST',def:'ข้อมูลสำรองสำหรับสถานพยาบาลใช้'}]},
  IPADT:{title:'IPADT — ข้อมูลผู้ป่วย การรับและจำหน่าย',fields:[
   ['AN','R','IDX','เลขรับผู้ป่วยใน (Admission Number) ขนาด 7–9 หลัก'],
   ['HN','R','IDX','เลขประจำตัวผู้รับบริการ ขนาด 7 หลักขึ้นไป'],
   ['IDTYPE','R','CV','ประเภทบัตร: 0 ประชาชน/ปกส., 1 ต่างด้าว, 2 ใบอนุญาตฯ, 3 Passport, 9 อื่น ๆ'],
   ['PIDPAT','R','ID9','เลขที่บัตรประชาชน/ปกส./ต่างด้าว/หนังสือเดินทาง/อื่น ๆ'],
   ['TITLE','O','CV','คำนำหน้าชื่อ เช่น นาย นาง นส. ดช. ดญ.'],
   ['NAMEPAT','R','ST','ชื่อ-นามสกุลผู้ป่วย'],
   ['DOB','R','D','วันเดือนปีเกิดของผู้ป่วย'],
   ['SEX','R','CV','เพศ: 1 ชาย, 2 หญิง'],
   ['MARRIAGE','R','CV','สถานภาพสมรส: 1 โสด, 2 สมรส, 3 หม้าย/หย่า, 4 อื่น ๆ'],
   ['CHANGWAT','O','CD','รหัสจังหวัดตามกระทรวงมหาดไทย'],
   ['AMPHUR','O','CD','รหัสอำเภอตามกระทรวงมหาดไทย'],
   ['NATION','O','CV','รหัสสัญชาติ'],
   ['AdmType','R','CV','ประเภทการรับ Admit: A accident, E emergency, C elective, L labor, N newborn, U urgent, O other'],
   ['AdmSource','R','CV','แหล่งที่รับ Admit เช่น O OPD, E Emergency, T ย้ายจาก รพ.อื่น, R Refer'],
   ['DTAdm','R','DT','วันที่และเวลาที่รับไว้ในโรงพยาบาล (Admit)'],
   ['DTDisch','R','DT','วันที่และเวลาที่จำหน่ายจากโรงพยาบาล (Discharge)'],
   ['LeaveDay','C','NI','จำนวนรวมวันลากลับบ้าน หน่วยเป็นวัน'],
   ['DischStat','R','CV','สถานภาพการจำหน่าย เช่น recovery / improved / dead'],
   ['DischType','R','CV','ประเภทการจำหน่าย เช่น with approval / transfer / dead'],
   ['AdmWt','C','ND','น้ำหนักตัวแรกรับ หน่วยกิโลกรัม; เด็กแรกเกิดต้องทศนิยม 3 ตำแหน่ง'],
   ['DischWard','R','ST','หอผู้ป่วยเมื่อจำหน่าย ใช้รหัสตามโรงพยาบาลกำหนด'],
   ['Dept','R','CV','แผนกที่รักษาผู้ป่วยเป็นหลัก']].map(x=>({name:x[0],req:x[1],format:x[2],def:x[3]}))},
  IPDx:{title:'IPDx — ข้อมูลการวินิจฉัย',fields:[
   ['sequence','R','NI','ลำดับรายการวินิจฉัย เริ่ม 1,2,3,… และไม่ซ้ำ'],
   ['DxType','R','CV','ชนิดวินิจฉัย: 1 principal, 2 comorbidity, 3 complication, 4 other, 5 external cause'],
   ['CodeSys','R','CS','ระบบรหัส เช่น ICD-10 หรือ ICD-10-TM'],
   ['Code','R','CD','รหัสการวินิจฉัยตาม CodeSys'],
   ['DiagTerm','R','ST','คำวินิจฉัยของแพทย์ที่บันทึกในเวชระเบียน'],
   ['DR','O|R','DR1','รหัสแพทย์ผู้วินิจฉัย; DxType=1 ต้องมี'],
   ['DateDiag','O','D','วันที่วินิจฉัย ถ้าระบุได้']].map(x=>({name:x[0],req:x[1],format:x[2],def:x[3]}))},
  IPOp:{title:'IPOp — ข้อมูลการผ่าตัด/หัตถการ',fields:[
   ['sequence','R','NI','ลำดับการผ่าตัด/หัตถการ เริ่ม 1,2,3,… และไม่ซ้ำ'],
   ['CodeSys','R','CS','ระบบรหัสหัตถการ เช่น ICD9CM, ICD-10-TM, ICD10PCS'],
   ['Code','R','CD','รหัสหัตถการตาม CodeSys'],
   ['ProcTerm','O','ST','ข้อความการผ่าตัด/หัตถการตามที่บันทึกในเอกสาร'],
   ['DR','R','DR1','แพทย์หรือผู้ประกอบวิชาชีพเวชกรรมผู้ทำหัตถการ'],
   ['DateIn','R','DT','วันเวลาเริ่มทำหัตถการ'],
   ['DateOut','C','DT','วันเวลาที่หัตถการสิ้นสุด; บางกรณีเว้นได้'],
   ['Location','O','CV','ห้องผ่าตัด/ทำหัตถการ หรือรหัสจุดบริการ']].map(x=>({name:x[0],req:x[1],format:x[2],def:x[3]}))},
  Invoices:{title:'Invoices — รายการแจ้งค่าใช้จ่าย',fields:[
   {name:'InvNumber',req:'R',format:'IDX',def:'ID ของ Invoice ต้องไม่ซ้ำกับชุดอื่น'},
   {name:'InvDT',req:'R',format:'DT',def:'วันเวลาที่ออก Invoice'},
   {name:'BillItems',req:'R',format:'records',def:'รายการค่าใช้จ่ายทั้งหมด ระบุจำนวนใน Reccount'},
   {name:'InvAddDiscount',req:'R',format:'NM',def:'ส่วนลดรวมที่อยู่นอกส่วนลดใน BillItems'},
   {name:'DRGCharge',req:'R',format:'NM',def:'ยอดค่าใช้จ่ายส่วนที่ใช้กับ DRG ตาม specification = sum(ChargeAmt-Discount) ของ ClaimCat D'},
   {name:'XDRGClaim',req:'R',format:'NM',def:'ยอดค่าใช้จ่ายเบิกนอก DRG ตาม specification ของ ClaimCat T'}]},
  BillItems:{title:'BillItems — รายการค่าใช้จ่าย',fields:[
   ['sequence','R','NI','ลำดับรายการเรียกเก็บ เริ่ม 1,2,3,…'],
   ['ServDate','R','DT','วันที่ให้/ใช้บริการหรือทรัพยากร'],
   ['BillGr','R','CD','หมวดค่าใช้จ่ายระบบของโรงพยาบาล'],
   ['LCCode','R','CD','รหัสรายการค่าบริการของโรงพยาบาล'],
   ['Descript','R','ST','ชื่อรายการ รวมหน่วยนับ/เรียกถ้ามี'],
   ['QTY','R','ND','จำนวนหน่วยที่ใช้'],
   ['UnitPrice','R','NM','ราคาต่อหน่วยของโรงพยาบาล'],
   ['ChargeAmt','R','NM','จำนวนเงินเรียกเก็บ = QTY × UnitPrice'],
   ['Discount','R','NM','ส่วนลดในรายการ; จำนวนสุทธิ = ChargeAmt − Discount'],
   ['ProcedureSeq','O','NI','sequence ของ IPOp ที่เกี่ยวข้อง'],
   ['DiagnosisSeq','O','NI','sequence ของ IPDx ที่เกี่ยวข้อง'],
   ['ClaimSys','R','CV','ระบบประกันสุขภาพที่ขอเบิก เช่น CS, SS, UC, UCEP'],
   ['BillGrCS','R','CV','หมวดค่าใช้จ่ายตาม ClaimSys; 03/04 ยา, 07 LAB'],
   ['CSCode','C','CD','รหัสรายการตามระบบประกันสุขภาพใน ClaimSys'],
   ['CodeSys','C','CS','ระบบรหัสที่ใช้กับ STDCode เช่น TMT/TMLT'],
   ['STDCode','C','CD','รหัสมาตรฐานที่ระบบเบิกกำหนด'],
   ['ClaimCat','R','CV','ประเภทการเบิกตาม specification: T=Tariff, D=DRG, X=Exempt; กฎผู้ป่วยปกติของหน่วยงานนี้กำหนดให้ D'],
   ['DateRev','C','D','วันที่ล่าสุดของการปรับปรุงรายการ'],
   ['ClaimUP','C','NM','อัตราเบิกได้ของรายการ; ClaimCat D ให้ระบุ 0.00'],
   ['ClaimAmt','C','NM','QTY × ClaimUP']].map(x=>({name:x[0],req:x[1],format:x[2],def:x[3]}))},
  Coinsurance:{title:'Coinsurance — ข้อมูลการร่วมจ่ายจากสิทธิอื่น',fields:[
   {name:'InsTypeCode',req:'R',format:'CV',def:'ประเภทประกันสุขภาพผู้ร่วมจ่าย เช่น CSMBS, SSEC, RTAA, MSSDLV, PRIV, OTHER'},
   {name:'InsTotal',req:'R',format:'NM',def:'ค่ารักษาทั้งหมดที่เบิกได้ = InsRoomBoard + InsProfFee + InsOther'},
   {name:'InsRoomBoard',req:'C',format:'NM',def:'ค่าห้องและอาหารที่เบิกได้'},
   {name:'InsProfFee',req:'C',format:'NM',def:'ค่าธรรมเนียมแพทย์ที่เบิกได้'},
   {name:'InsOther',req:'C',format:'NM',def:'ค่ารักษาอื่นที่เบิกได้'}]}
 };
 const decoder874=()=>{try{return new TextDecoder('windows-874')}catch(_){return new TextDecoder('utf-8')}};
 function decodeBytes(bytes){return decoder874().decode(bytes)}
 function stripEndNote(text){return String(text||'').replace(/\s*<\?EndNote\s+HMAC\s*=\s*["'][^"']*["']\s*\?>\s*$/i,'').trimEnd()}
 function parseXml(text){const clean=stripEndNote(text);const doc=new DOMParser().parseFromString(clean,'application/xml');const err=doc.querySelector('parsererror');if(err)throw new Error('XML ไม่สมบูรณ์: '+err.textContent.slice(0,180));const root=doc.documentElement;if(!root)throw new Error('ไม่พบ Root Element');return {doc,root,kind:String(root.nodeName||'').toUpperCase()}}
 function directChildren(el){return el?[...el.children]:[]}
 function directByName(root,name){return directChildren(root).find(x=>x.nodeName.toLowerCase()===String(name).toLowerCase())||null}
 function schema(name){return SCHEMAS[name]||null}
 function fieldMeta(section,nameOrIndex){const s=schema(section);if(!s)return null;if(typeof nameOrIndex==='number')return s.fields[nameOrIndex]||null;return s.fields.find(f=>f.name.toLowerCase()===String(nameOrIndex).toLowerCase())||null}
 function leafFields(el,sectionName){if(!el)return[];const attrs=[...el.attributes].map(a=>({name:'@'+a.name,value:a.value,attr:true,meta:null}));const children=directChildren(el);if(!children.length)return attrs.concat([{name:'#text',value:el.textContent||'',text:true,meta:fieldMeta(sectionName,'#text')}]);return attrs.concat(children.filter(c=>!c.children.length).map(c=>({name:c.nodeName,value:c.textContent||'',node:c,meta:fieldMeta(sectionName,c.nodeName)})))}
 function delimitedInfo(el,sectionName){if(!el)return null;const raw=el.textContent||'';const text=raw.trim();if(!text||!text.includes('|'))return null;const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const s=schema(sectionName);const expected=s?.fields?.length||0;return {section:sectionName,lines,rows:lines.map((line,i)=>({id:i,values:line.split('|')})),maxCols:Math.max(expected,0,...lines.map(l=>l.split('|').length)),schema:s}}
 function billItems(root){const inv=directByName(root,'Invoices');return inv?directByName(inv,'BillItems'):null}
 function summary(parsed,name){const root=parsed.root;const header=directByName(root,'Header');const docSys=header?directByName(header,'DocSysID')?.textContent.trim():'';const ipadt=directByName(root,'IPADT');const adt=delimitedInfo(ipadt,'IPADT');const row=adt?.rows?.[0]?.values||[];return {name,kind:(docSys||parsed.kind).replace(/-.*/,''),rootKind:parsed.kind,an:row[0]||'',hn:row[1]||'',pid:row[3]||'',patient:row[5]||'',sections:SECTION_ORDER.filter(x=>x==='Raw XML'||directByName(root,x))}}
 async function readZip(file){if(!window.JSZip)throw new Error('ไม่พบ JSZip');const zip=await JSZip.loadAsync(file);const entries=[];for(const [path,zf] of Object.entries(zip.files)){if(zf.dir)continue;const bytes=new Uint8Array(await zf.async('arraybuffer'));const preview=decodeBytes(bytes).slice(0,300);const isXml=/\.xml$/i.test(path)||/^\s*<\?xml|^\s*<(AIPN|CIPN)/i.test(preview);if(!isXml){entries.push({path,bytes,isXml:false,dirty:false});continue}try{const text=decodeBytes(bytes);const parsed=parseXml(text);entries.push({path,bytes,text,originalText:text,parsed,isXml:true,dirty:false,history:[],validationIssues:[],summary:summary(parsed,path)})}catch(error){entries.push({path,bytes,text:decodeBytes(bytes),originalText:decodeBytes(bytes),isXml:true,dirty:false,history:[],validationIssues:[],error:error.message,summary:{name:path,kind:'XML ERROR',sections:['Raw XML']}})}}return {fileName:file.name,zip,entries,xmlEntries:entries.filter(e=>e.isXml)}}
 function serialize(doc){let xml=new XMLSerializer().serializeToString(doc).replace(/\r?\n/g,'\r\n');if(!/^\s*<\?xml\b/i.test(xml))xml='<?xml version="1.0" encoding="windows-874"?>\r\n'+xml;else xml=xml.replace(/^\s*<\?xml[^?]*\?>/i,'<?xml version="1.0" encoding="windows-874"?>');return xml}
 function refresh(entry){entry.parsed=parseXml(entry.text);entry.summary=summary(entry.parsed,entry.path);entry.error=''}
 window.SSIPParser={SECTION_ORDER,SCHEMAS,schema,fieldMeta,decodeBytes,stripEndNote,parseXml,directByName,directChildren,leafFields,delimitedInfo,billItems,summary,readZip,serialize,refresh};
})();
