/*
======================================================
SSOP Toolkit Professional Edition V3.7.1
Copyright © 2026 PCMC By Kimhan
All Rights Reserved.
======================================================
*/
const state={file:null,fileName:'',originalText:'',doc:null,activeSection:'',originalDoc:null,selected:new Set()};
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('splashScreen')?.classList.add('hide'),900);loadDocumentLinks();const page=new URLSearchParams(location.search).get('page');if(page==='knowledge'){showPage('knowledgePage');loadKnowledge('','ALL');}else if(page==='editor'){showPage('cancerPage');}});
const aboutModal=document.getElementById('aboutModal');
document.querySelectorAll('[data-open-about]').forEach(btn=>btn.addEventListener('click',()=>{aboutModal.classList.add('show');aboutModal.setAttribute('aria-hidden','false')}));
document.getElementById('aboutClose').addEventListener('click',()=>{aboutModal.classList.remove('show');aboutModal.setAttribute('aria-hidden','true')});
aboutModal.addEventListener('click',e=>{if(e.target===aboutModal){aboutModal.classList.remove('show');aboutModal.setAttribute('aria-hidden','true')}});
function showPage(pageId){
 document.getElementById('homePage').classList.add('hidden-page');
 document.querySelectorAll('.module-page').forEach(p=>p.classList.remove('active'));
 document.getElementById(pageId)?.classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}
function goHome(){
 document.querySelectorAll('.module-page').forEach(p=>p.classList.remove('active'));
 document.getElementById('homePage')?.classList.remove('hidden-page');
 const cleanUrl=`${window.location.origin}${window.location.pathname}`;
 window.history.replaceState({},'',cleanUrl);
 window.scrollTo({top:0,behavior:'smooth'});
}
function openModule(name){
 if(name==='cancer'){showPage('registryPage');loadRegistry();return;}
 if(name==='knowledge'){showPage('knowledgePage');loadKnowledge('','ALL');return;}
 if(name==='editor'){showPage('cancerPage');return;}
 const names={main:'ประกันสังคม Main',cross:'ประกันสังคมข้ามเขต',cpap:'ประกันสังคม CPAP',sleep:'ประกันสังคม Sleep Test'};
 showDialog('เตรียมพัฒนา',`${names[name]||'โมดูลนี้'} ถูกเตรียมปุ่มและโครงสร้างไว้แล้ว
จะเพิ่ม Parser และกฎตรวจสอบเฉพาะงานในเวอร์ชันถัดไป`,'info');
}
document.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.module)));
document.getElementById('backHomeBtn').onclick=goHome;
document.getElementById('registryBackHomeBtn')?.addEventListener('click',goHome);
document.getElementById('openCancerEditorBtn')?.addEventListener('click',()=>showPage('cancerPage'));
document.getElementById('knowledgeBackHomeBtn').onclick=goHome;
function toast(title,message,type='info',duration=3600){const stack=document.getElementById('toastStack'),el=document.createElement('div');const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};el.className=`toast ${type}`;el.innerHTML=`<div class="toast-icon">${icons[type]||icons.info}</div><div><div class="toast-title">${escapeHtml(title)}</div><div class="toast-msg">${escapeHtml(message)}</div></div>`;stack.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(-8px)';setTimeout(()=>el.remove(),220)},duration)}
function showDialog(title,message,type='info',buttons=[{text:'ตกลง',value:true,className:'primary'}]){return new Promise(resolve=>{const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};document.getElementById('dialogIcon').textContent=icons[type]||icons.info;document.getElementById('dialogTitle').textContent=title;document.getElementById('dialogMessage').textContent=message;const actions=document.getElementById('dialogActions');actions.innerHTML='';buttons.forEach(btn=>{const b=document.createElement('button');b.textContent=btn.text;b.className=btn.className||'soft';b.onclick=()=>{document.getElementById('dialogOverlay').classList.remove('show');resolve(btn.value)};actions.appendChild(b)});document.getElementById('dialogOverlay').classList.add('show')})}

const fieldMeta={
 BILLTRAN:[
  ['Station','หมายเลขเครื่องหรือจุดบริการ'],['AuthCode','รหัสอนุมัติสิทธิหรือรหัสโครงการที่ผู้ใช้ต้องตรวจสอบก่อนส่ง','SSOCAC','important'],['DTTran','วันเวลาที่เกิดธุรกรรม'],['Hcode','รหัสสถานพยาบาล 5 หลัก'],['InvNo','เลขที่ใบแจ้งหนี้ และเป็นคีย์เชื่อมโยงไฟล์อื่น'],['BillNo','เลขที่ใบเสร็จรับเงิน'],['HN','เลขประจำตัวผู้ป่วยของโรงพยาบาล'],['MemberNo','Case Number ของผู้ป่วยที่ได้รับอนุมัติในระบบ SSO Cancer Care','Case Number','important'],['Amount','จำนวนเงินรวมสุทธิ'],['Paid','จำนวนเงินที่ผู้ป่วยจ่ายจริง'],['VerCode','รหัส Protocol/รหัสตรวจสอบที่ผู้ใช้ต้องตรวจสอบให้ตรงตามประเภทการเบิก','เช่น C0113','important'],['Tflag','ประเภทการส่งข้อมูล ต้องเลือกค่าให้ถูกต้องตามรอบและประเภทการส่ง','เช่น A หรือ E ตามระบบต้นทาง','important'],['PID','เลขบัตรประชาชนผู้ป่วย'],['Name','ชื่อผู้รับบริการ'],['Hmain','รหัสสถานพยาบาลหลัก'],['PayPlan','รหัสแผนการจ่าย/สิทธิ'],['ClaimAmt','ยอดเงินที่ขอเบิก'],['OtherPay','ยอดชำระจากแหล่งอื่น'],['AdditionalField','ฟิลด์เพิ่มเติมตามรุ่นของไฟล์ต้นฉบับ']
 ],
 BillItems:[
  ['InvNo','เลขที่ใบแจ้งหนี้ ต้องตรงกับ BILLTRAN'],['SvDate','วันที่ให้บริการ'],['BillMuad','รหัสหมวดค่ารักษาพยาบาล เช่น 3 หรือ 5 สำหรับยา'],['LCCode','รหัสรายการภายใน/รหัสค่าใช้จ่ายของสถานพยาบาล'],['STDCode','รหัสมาตรฐานกลางตามที่กองทุนกำหนด'],['Description','ชื่อรายการค่ารักษาพยาบาล'],['Quantity','จำนวนชิ้นหรือปริมาณที่ใช้'],['UnitPrice','ราคาต่อหน่วย'],['ChargeAmt','จำนวนเงินที่เรียกเก็บจริง'],['ClaimUP','ราคาต่อหน่วยที่ขอเบิก'],['ClaimAmount','จำนวนเงินรวมที่ขอเบิก'],['SvRefID','รหัสอ้างอิงบริการ'],['ClaimCat','รายการที่เบิกเพิ่มในโครงการ SSOCAC ต้องระบุ OPR','OPR','important']
 ],
 Dispensing:[
  ['ProviderID','รหัสสถานพยาบาลผู้ให้บริการ'],['DispID','เลขที่ใบสั่งยา/เลขอ้างอิงชุดการจ่ายยา'],['InvNo','เลขที่ใบแจ้งหนี้ ใช้เชื่อมโยง BILLTRAN'],['HN','เลขประจำตัวผู้ป่วยของโรงพยาบาล'],['PID','เลขบัตรประชาชน 13 หลัก'],['PrescDate','วันเวลาสั่งยา'],['DispDate','วันเวลาจ่ายยา'],['PrescBy','รหัสผู้สั่งยา'],['DispBy','รหัสผู้จ่ายยา'],['ChargeAmt','ยอดรวมราคาขายของรายการยา'],['ClaimAmt','ยอดรวมที่ขอเบิกหมวดยา'],['Paid','ยอดที่ผู้ป่วยจ่าย'],['OtherPay','ยอดชำระจากแหล่งอื่น'],['Reimburser','ผู้เบิกค่ารักษา เช่น HP'],['BenefitPlan','สิทธิที่ใช้เบิก เช่น SS'],['DispeStat','สถานะการจ่ายยา เช่น 1 = รับยาแล้ว'],['SvID','รหัสอ้างอิงบริการใน OPServices'],['DayCover','ระยะเวลาที่ใบสั่งยาครอบคลุม เช่น 30D']
 ],
 DispensedItems:[
  ['DispID','เลขที่ใบสั่งยา อ้างอิงจาก Dispensing.DispID'],['PrdCat','ประเภทยาและเวชภัณฑ์'],['HospDrgID','รหัสยาที่โรงพยาบาลกำหนด (Local Code)'],['DrgID','รหัสยาอ้างอิงมาตรฐาน TMT'],['dfsCode','รหัส dose, form และ strength'],['dfsText','ชื่อ dose, form และ strength'],['Packsize','ขนาดบรรจุ'],['sigCode','รหัสวิธีใช้ยา'],['sigText','ข้อความแสดงวิธีใช้ยา'],['Quantity','ปริมาณยาที่จ่าย'],['UnitPrice','ราคาขายต่อหน่วย'],['ChargeAmt','รวมราคาขาย = Quantity × UnitPrice'],['ReimbPrice','ราคาต่อหน่วยที่เบิกได้จาก BenefitPlan'],['ReimbAmt','ยอดเบิกได้ = Quantity × ReimbPrice'],['PrdSeCode','รหัสการจ่ายยา Generic แทนตามที่ผู้สั่งยากำหนด'],['ClaimCont','เงื่อนไขกำกับการเบิก'],['ClaimCat','ประเภทบัญชีการเบิก; ยามะเร็งที่ สปส.จ่ายเพิ่มต้องเป็น OPR','OPR','important'],['MultiDisp','การจ่ายยาหลายครั้ง'],['SupplyFor','ระยะเวลาที่ผู้ป่วยใช้ยารายการนี้ เช่น 30D']
 ],
 OPServices:[
  ['InvNo','เลขที่ใบแจ้งหนี้'],['SvID','รหัสอ้างอิงบริการ'],['Class','ประเภทข้อมูลบริการ'],['Hcode','รหัสสถานพยาบาล'],['HN','เลขประจำตัวผู้ป่วย'],['PID','เลขบัตรประชาชน'],['CareAccount','ลำดับ/บัญชีบริการ'],['TypeServ','ประเภทบริการ'],['Clinic','คลินิก'],['SubClinic','คลินิกย่อย'],['DateField','วันที่ตามโครงสร้างต้นทาง'],['Provider','ผู้ให้บริการ'],['ProviderType','ประเภทผู้ให้บริการ'],['BegDT','วันเวลาเริ่มบริการ'],['EndDT','วันเวลาสิ้นสุดบริการ'],['LCCode','รหัสบริการภายใน'],['CodeSet','ชุดรหัส'],['STDCode','รหัสมาตรฐาน'],['ChargeAmt','ยอดค่าใช้จ่าย'],['Completion','สถานะความสมบูรณ์'],['PrdSeCode','รหัสโครงการ สำหรับ SSOCAC ต้องเป็น SSOCAC','SSOCAC','important'],['ClaimCat','หมวดการเบิก']
 ],
 OPDx:[
  ['Class','ประเภทข้อมูลบริการ'],['SvID','รหัสอ้างอิงบริการ'],['Sequence','ลำดับวินิจฉัย'],['CodeSet','ชุดรหัสวินิจฉัย'],['DiagnosisCode','รหัสวินิจฉัย'],['VerCode','รหัส Protocol การรักษามะเร็งตามอนุมัติ เช่น C0111','C0111','important']
 ]
};

const documentState={ANNOUNCEMENT:null,PROTOCOL:null};
const fieldGuideState={overrides:new Map(),dirty:new Map()};
function fieldGuideKey(section,fieldName){return `${String(section).trim().toUpperCase()}|${String(fieldName).trim().toUpperCase()}`;}
function getConditionExample(section,meta){const key=fieldGuideKey(section,meta[0]);return fieldGuideState.overrides.has(key)?fieldGuideState.overrides.get(key):String(meta[2]||'');}

const labels=Object.fromEntries(Object.entries(fieldMeta).map(([k,v])=>[k,v.map(x=>x[0])]));
const sectionInfo={
 BILLTRAN:{title:'ข้อมูลธุรกรรมทางการเงินและการพิสูจน์ตัวตน',desc:'ข้อมูลสรุปภาพรวมของใบแจ้งหนี้',format:'Station | AuthCode | DTTran | Hcode | InvNo | BillNo | HN | MemberNo | Amount | Paid | VerCode | Tflag | …',important:['AuthCode, MemberNo, VerCode และ Tflag เป็นจุดที่ผู้ใช้ต้องตรวจสอบก่อนส่ง'],importantCols:[1,7,10,11]},
 BillItems:{title:'รายการค่ารักษาพยาบาลย่อย',desc:'แจกแจงค่าใช้จ่ายทุกรายการภายใต้ใบแจ้งหนี้',format:'InvNo | SvDate | BillMuad | LCCode | STDCode | Description | Quantity | UnitPrice | ChargeAmt | ClaimUP | ClaimAmount | SvRefID | ClaimCat',important:['รายการที่สำนักงานประกันสังคมจ่ายเพิ่มต้องระบุ ClaimCat เป็น OPR'],importantCols:[12]},
 Dispensing:{title:'ข้อมูลสรุปชุดการจ่ายยา',desc:'เชื่อมโยงไปยังรายการยารายบรรทัด',format:'ProviderID | DispID | InvNo | HN | PID | PrescDate | DispDate | …',important:['แฟ้มนี้ใช้เมื่อมีการจ่ายยากลุ่มที่เกี่ยวข้องกับการเบิก'],importantCols:[]},
 DispensedItems:{title:'รายการรายละเอียดตัวยาที่จ่าย',desc:'รายการยารายบรรทัดภายใต้ Dispensing',format:'DispID | PrdCat | HospDrgID | DrgID | dfsCode | dfsText | … | ClaimCat | MultiDisp | SupplyFor',important:['ยามะเร็งที่เบิกเพิ่มต้องระบุ ClaimCat เป็น OPR'],importantCols:[16]},
 OPServices:{title:'ข้อมูลบริการผู้ป่วยนอก',desc:'ข้อมูลบริการที่เชื่อมโยง Visit และ Invoice',format:'แสดงตามลำดับฟิลด์ในไฟล์ต้นฉบับ',important:['PrdSeCode ต้องระบุเป็น SSOCAC'],importantCols:[20]},
 OPDx:{title:'ข้อมูลการวินิจฉัย',desc:'ข้อมูลวินิจฉัยที่เชื่อมโยงกับบริการ',format:'Class | SvID | Sequence | CodeSet | DiagnosisCode | VerCode',important:['VerCode ต้องเป็น Protocol Code เช่น C0111'],importantCols:[5]}
};
const fileInput=document.getElementById('fileInput'),dropZone=document.getElementById('dropZone');
fileInput.addEventListener('change',e=>e.target.files[0]&&loadFile(e.target.files[0]));
['dragenter','dragover'].forEach(x=>dropZone.addEventListener(x,e=>{e.preventDefault();dropZone.style.background='#eefaf6'}));
['dragleave','drop'].forEach(x=>dropZone.addEventListener(x,e=>{e.preventDefault();dropZone.style.background=''}));
dropZone.addEventListener('drop',e=>e.dataTransfer.files[0]&&loadFile(e.dataTransfer.files[0]));

async function loadFile(file){
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());
  const text=new TextDecoder('windows-874').decode(bytes).replace(/\u0000/g,'');
  state.file=file;state.fileName=file.name;state.originalText=text;state.doc=parseDocument(text);state.originalDoc=JSON.parse(JSON.stringify(state.doc));
  state.activeSection=Object.keys(state.doc.sections)[0]||'';state.selected.clear();
  document.getElementById('fileName').textContent=file.name;
  document.getElementById('fileInfo').textContent=`${(file.size/1024).toFixed(1)} KB • ${state.doc.lineEnding==='\r\n'?'CRLF':'LF'} • ${Object.keys(state.doc.sections).join(', ')}`;
  document.getElementById('fileMeta').classList.remove('hidden');document.getElementById('workspace').classList.remove('hidden');
  document.getElementById('outputName').value=file.name;renderAll();updateChecksum();renderHealthDashboard([]);toast('อ่านไฟล์สำเร็จ',`${file.name} พร้อมแก้ไขแล้ว`,'success');
 }catch(err){showDialog('อ่านไฟล์ไม่สำเร็จ',err.message,'error')}
}
function parseDocument(text){
 const lineEnding=text.includes('\r\n')?'\r\n':'\n';
 const header={};['HCODE','HNAME','DATETIME','SESSNO','RECCOUNT'].forEach(tag=>{const m=text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));header[tag]=m?m[1]:''});
 const sections={};const re=/<(BILLTRAN|BillItems|Dispensing|DispensedItems|OPServices|OPDx)>\s*([\s\S]*?)\s*<\/\1>/g;let m;
 while((m=re.exec(text))){const body=m[2].trim();sections[m[1]]=body?body.split(/\r?\n/).filter(Boolean).map(line=>line.split('|')):[]}
 const claimOpen=(text.match(/<ClaimRec[^>]*>/)||['<ClaimRec System="OP" PayPlan="SS" Version="0.93" Prgs="HX">'])[0];
 return {lineEnding,claimOpen,header,sections};
}
function renderAll(){renderHeader();renderTabs();renderSectionNote();renderTable();validateSSOCAC();renderHealthDashboard([]);}
function renderHeader(){const g=document.getElementById('headerGrid');g.innerHTML='';Object.entries(state.doc.header).forEach(([k,v])=>{const d=document.createElement('div');d.className='field';d.innerHTML=`<label>${k}</label><input data-header="${k}" value="${escapeAttr(v)}">`;g.appendChild(d)});g.querySelectorAll('input').forEach(i=>i.addEventListener('input',e=>{state.doc.header[e.target.dataset.header]=e.target.value;markChanged();updateChecksum()}));}
function renderTabs(){const t=document.getElementById('tabs');t.innerHTML='';Object.keys(state.doc.sections).forEach(s=>{const b=document.createElement('button');b.className='tab '+(s===state.activeSection?'active':'');b.textContent=`${s} (${state.doc.sections[s].length})`;b.onclick=()=>{state.activeSection=s;state.selected.clear();renderTabs();renderSectionNote();renderTable()};t.appendChild(b)});}
function renderSectionNote(){
 const info=sectionInfo[state.activeSection]||{title:state.activeSection,desc:'',format:'',important:[],importantCols:[]};
 const important=info.important.length?`<div><b>จุดเน้นสำคัญสำหรับ SSOCAC:</b> ${info.important.map(x=>`<span class="important-text">${escapeHtml(x)}</span>`).join(' • ')}</div>`:'';
 document.getElementById('sectionNote').innerHTML=`<div><strong>${escapeHtml(info.title)}</strong>${info.desc?' — '+escapeHtml(info.desc):''}</div>${important}`;
}
function renderTable(){
 const rows=state.doc.sections[state.activeSection]||[],q=document.getElementById('searchInput').value.toLowerCase(),limit=+document.getElementById('pageSize').value;
 const indexed=rows.map((r,i)=>({r,i})).filter(x=>!q||x.r.join(' ').toLowerCase().includes(q)).slice(0,limit);
 const cols=Math.max(0,...rows.map(r=>r.length));const names=labels[state.activeSection]||[];
 const importantCols=(sectionInfo[state.activeSection]?.importantCols)||[];
 document.getElementById('tableHead').innerHTML='<tr><th class="rownum"><input type="checkbox" id="selectAll"></th>'+Array.from({length:cols},(_,i)=>{const meta=(fieldMeta[state.activeSection]||[])[i];const name=meta?.[0]||'คอลัมน์ '+(i+1);const desc=meta?.[1]||'ยังไม่มีคำอธิบายสำหรับฟิลด์นี้';const example=meta?getConditionExample(state.activeSection,meta):'';const imp=importantCols.includes(i)||meta?.[3]==='important';return `<th class="field-tip ${imp?'important-head':''}" data-tip-title="${escapeAttr(name)}" data-tip-desc="${escapeAttr(desc)}" data-tip-example="${escapeAttr(example)}"><span class="head-wrap">${escapeHtml(name)}${imp?'<span class="required-star">★</span>':''}<span class="tip-dot">i</span></span></th>`}).join('')+'</tr>';
 const body=document.getElementById('tableBody');body.innerHTML='';indexed.forEach(({r,i})=>{const tr=document.createElement('tr');tr.innerHTML=`<td class="rownum"><input type="checkbox" data-select="${i}" ${state.selected.has(i)?'checked':''}> ${i+1}</td>`+Array.from({length:cols},(_,c)=>`<td contenteditable="true" data-row="${i}" data-col="${c}">${escapeHtml(r[c]??'')}</td>`).join('');body.appendChild(tr)});
 body.querySelectorAll('td[contenteditable]').forEach(td=>td.addEventListener('input',e=>{const r=+e.target.dataset.row,c=+e.target.dataset.col;state.doc.sections[state.activeSection][r][c]=e.target.textContent;e.target.classList.add('changed');markChanged();updateChecksum()}));
 body.querySelectorAll('[data-select]').forEach(x=>x.onchange=e=>e.target.checked?state.selected.add(+e.target.dataset.select):state.selected.delete(+e.target.dataset.select));
 const sa=document.getElementById('selectAll');if(sa)sa.onchange=e=>{indexed.forEach(x=>e.target.checked?state.selected.add(x.i):state.selected.delete(x.i));renderTable()};
 document.getElementById('countText').textContent=`พบ ${indexed.length} จาก ${rows.length} แถว`;
 bindTooltips();
}
function buildText(){
 const le=state.doc.lineEnding,h=state.doc.header;let s=`<?xml version="1.0" encoding="windows-874"?>${le}${state.doc.claimOpen}${le}<Header>${le}`;
 ['HCODE','HNAME','DATETIME','SESSNO','RECCOUNT'].forEach(k=>s+=`<${k}>${h[k]??''}</${k}>${le}`);s+=`</Header>${le}`;
 Object.entries(state.doc.sections).forEach(([name,rows])=>{s+=`<${name}>${le}`+rows.map(r=>r.join('|')).join(le)+le+`</${name}>${le}`});s+=`</ClaimRec>${le}`;return s;
}
function cp874Bytes(str){const dec=new TextDecoder('windows-874');const map=new Map();for(let i=0;i<256;i++){const ch=dec.decode(Uint8Array.of(i));if(ch&&ch!==' ')map.set(ch,i)}const out=[];for(const ch of str){if(map.has(ch))out.push(map.get(ch));else if(ch.charCodeAt(0)<128)out.push(ch.charCodeAt(0));else out.push(63)}return new Uint8Array(out)}
function updateChecksum(){if(!state.doc)return;const bytes=cp874Bytes(buildText());document.getElementById('checksumPreview').value=md5(bytes);}
function downloadFile(){const base=buildText(),sum=md5(cp874Bytes(base)),full=base+`<?EndNote Checksum="${sum}"?>`+state.doc.lineEnding,blob=new Blob([cp874Bytes(full)],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=document.getElementById('outputName').value||state.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setStatus('ดาวน์โหลดไฟล์เรียบร้อย','ok');toast('ดาวน์โหลดสำเร็จ',a.download+' ถูกสร้างเรียบร้อย','success')}
function validate(){const problems=[];const ruleProblems=validateSSOCAC();Object.entries(state.doc.sections).forEach(([sec,rows])=>{if(!rows.length)problems.push(`${sec}: ไม่มีข้อมูล`);const n=rows[0]?.length||0;rows.forEach((r,i)=>{if(r.length!==n)problems.push(`${sec} แถว ${i+1}: จำนวนคอลัมน์ ${r.length} ไม่เท่ากับแถวแรก ${n}`)})});problems.push(...ruleProblems);renderHealthDashboard(problems);if(problems.length){setStatus(`พบ ${problems.length} จุด กรุณาตรวจสอบ`,'warn');showDialog('พบข้อมูลที่ต้องตรวจสอบ',problems.slice(0,30).map((x,i)=>`${i+1}. ${x}`).join('\n'),'warning')}else{setStatus('โครงสร้างข้อมูลปกติ พร้อมดาวน์โหลด','ok');showDialog('ตรวจสอบเรียบร้อย','ไม่พบข้อผิดพลาดตามกฎที่ตั้งไว้\nChecksum จะถูกสร้างใหม่อัตโนมัติ','success')}}
function renderHealthDashboard(problems=[]){const box=document.getElementById('healthDashboard');if(!box)return;const sections=Object.keys(state.doc?.sections||{});const checksum=document.getElementById('checksumPreview').value;const cards=[{t:'ไฟล์ที่โหลด',v:state.fileName||'-',c:'info'},{t:'ส่วนข้อมูล',v:`${sections.length} ส่วน`,c:'info'},{t:'ผลตรวจสอบ',v:problems.length?`พบ ${problems.length} จุด`:'ผ่าน',c:problems.length?'bad':'good'},{t:'Checksum',v:checksum?'พร้อมสร้าง':'รอข้อมูล',c:checksum?'good':'info'}];box.innerHTML=cards.map(x=>`<div class="health-card ${x.c}"><div class="health-title">${escapeHtml(x.t)}</div><div class="health-value">${escapeHtml(x.v)}</div></div>`).join('')}
function markChanged(){setStatus('มีข้อมูลถูกแก้ไข','warn')}function setStatus(t,c=''){const b=document.getElementById('statusBox');b.textContent=t;b.className='status '+c}
function escapeHtml(s){return String(s).replace(/[&<>]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[x]))}function escapeAttr(s){return escapeHtml(s).replace(/"/g,'&quot;')}
function clearAll(){state.file=null;state.fileName='';state.originalText='';state.doc=null;state.originalDoc=null;state.activeSection='';state.selected.clear();document.getElementById('fileInput').value='';document.getElementById('fileMeta').classList.add('hidden');document.getElementById('workspace').classList.add('hidden');toast('ล้างไฟล์แล้ว','พร้อมเลือกไฟล์ใหม่','info')}

document.getElementById('clearBtn').onclick=clearAll;document.getElementById('searchInput').oninput=renderTable;document.getElementById('pageSize').onchange=renderTable;
document.getElementById('addRowBtn').onclick=()=>{const rows=state.doc.sections[state.activeSection],n=rows[0]?.length||1;rows.push(Array(n).fill(''));renderTabs();renderTable();markChanged();updateChecksum()};
document.getElementById('deleteRowsBtn').onclick=async()=>{if(!state.selected.size){toast('ยังไม่ได้เลือกข้อมูล','กรุณาเลือกแถวที่ต้องการลบ','warning');return}const ok=await showDialog('ยืนยันการลบ',`ต้องการลบ ${state.selected.size} แถวใช่หรือไม่`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ลบข้อมูล',value:true,className:'danger'}]);if(!ok)return;state.doc.sections[state.activeSection]=state.doc.sections[state.activeSection].filter((_,i)=>!state.selected.has(i));state.selected.clear();renderTabs();renderTable();markChanged();updateChecksum();toast('ลบข้อมูลแล้ว','รายการที่เลือกถูกลบเรียบร้อย','success')};
document.getElementById('undoBtn').onclick=async()=>{const ok=await showDialog('ย้อนกลับทั้งหมด','ยกเลิกการแก้ไขทั้งหมดและกลับเป็นข้อมูลจากไฟล์เดิมใช่หรือไม่','warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ย้อนกลับ',value:true,className:'peach'}]);if(!ok)return;state.doc=JSON.parse(JSON.stringify(state.originalDoc));state.activeSection=Object.keys(state.doc.sections)[0]||'';renderAll();updateChecksum();setStatus('คืนค่าไฟล์เดิมแล้ว','ok');toast('คืนค่าเรียบร้อย','ข้อมูลกลับเป็นไฟล์ต้นฉบับแล้ว','success')};
document.getElementById('previewBtn').onclick=validate;document.getElementById('downloadBtn').onclick=downloadFile;


function bindTooltips(){
 const tip=document.getElementById('fieldTooltip');
 if(!tip)return;
 if(tip.parentElement!==document.body)document.body.appendChild(tip);
 document.querySelectorAll('.field-tip').forEach(el=>{
  const title=el.dataset.tipTitle||el.textContent.trim();
  const desc=el.dataset.tipDesc||'ยังไม่มีคำอธิบายสำหรับหัวข้อนี้';
  const example=el.dataset.tipExample||'';
  el.title=[title,desc,example?`ค่าที่แนะนำ: ${example}`:''].filter(Boolean).join(' — ');
  const show=e=>{tip.innerHTML=`<b>${escapeHtml(title)}</b><div>${escapeHtml(desc)}</div>${example?`<div class="tip-example">ค่าที่แนะนำ: ${escapeHtml(example)}</div>`:''}`;tip.classList.add('show');positionTip(e)};
  el.onmouseenter=show;el.onmousemove=positionTip;el.onmouseleave=()=>tip.classList.remove('show');
  el.onfocus=()=>{const r=el.getBoundingClientRect();show({clientX:r.left+r.width/2,clientY:r.bottom})};el.onblur=()=>tip.classList.remove('show');
  if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
 });
 function positionTip(e){const pad=14,w=380;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-pad)x=e.clientX-w-14;if(y+180>innerHeight-pad)y=e.clientY-180;tip.style.left=Math.max(pad,x)+'px';tip.style.top=Math.max(pad,y)+'px'}
}
function validateSSOCAC(){
 const p=[],results=[];
 const add=(ok,title,detail)=>results.push({ok,title,detail});
 const bill=state.doc.sections.BILLTRAN||[];
 if(bill.length){const missing=bill.filter(r=>!(r[7]||'').trim()).length;add(!missing,'BILLTRAN · MemberNo',missing?`ว่าง ${missing} แถว — ต้องใส่ Case Number`:'พบ Case Number ครบทุกแถว');if(missing)p.push(`BILLTRAN: MemberNo ว่าง ${missing} แถว`)}
 const bi=state.doc.sections.BillItems||[];
 if(bi.length){const bad=bi.filter(r=>{const muad=(r[2]||'').trim();return ['3','5'].includes(muad)&&(r[12]||'').trim().toUpperCase()!=='OPR'}).length;add(!bad,'BillItems · ClaimCat',bad?`พบหมวด 3/5 ที่ ClaimCat ไม่ใช่ OPR จำนวน ${bad} แถว`:'หมวด 3/5 ระบุ OPR ครบ');if(bad)p.push(`BillItems: หมวด 3/5 ที่ ClaimCat ไม่ใช่ OPR ${bad} แถว`)}
 const di=state.doc.sections.DispensedItems||[];
 if(di.length){const idx=(fieldMeta.DispensedItems||[]).findIndex(x=>x[0]==='ClaimCat');const bad=di.filter(r=>(r[idx]||'').trim().toUpperCase()!=='OPR').length;add(!bad,'DispensedItems · ClaimCat',bad?`ClaimCat ไม่ใช่ OPR จำนวน ${bad} แถว`:'ระบุ OPR ครบทุกแถว');if(bad)p.push(`DispensedItems: ClaimCat ไม่ใช่ OPR ${bad} แถว`)}
 const ops=state.doc.sections.OPServices||[];
 if(ops.length){const has=ops.every(r=>r.some(v=>(v||'').trim().toUpperCase()==='SSOCAC'));add(has,'OPServices · PrdSeCode',has?'พบค่า SSOCAC ในทุกแถว':'ยังไม่พบค่า SSOCAC ครบทุกแถว กรุณาตรวจตำแหน่ง PrdSeCode');if(!has)p.push('OPServices: ยังไม่พบค่า SSOCAC ครบทุกแถว')}
 const opdx=state.doc.sections.OPDx||[];
 if(opdx.length){const has=opdx.every(r=>r.some(v=>/^C\d{4}$/i.test((v||'').trim())));add(has,'OPDx · VerCode',has?'พบ Protocol Code รูปแบบ C#### ครบทุกแถว':'ยังไม่พบ Protocol Code รูปแบบ C#### ครบทุกแถว');if(!has)p.push('OPDx: ยังไม่พบ VerCode/Protocol Code รูปแบบ C#### ครบทุกแถว')}
 const box=document.getElementById('ruleResults');box.innerHTML=results.map(x=>`<div class="validation-item ${x.ok?'good':'bad'}"><b>${x.ok?'✓':'✕'} ${escapeHtml(x.title)}</b> — ${escapeHtml(x.detail)}</div>`).join('');
 return p;
}
function renderDictionary(){
 const order=['BILLTRAN','BillItems','Dispensing','DispensedItems','OPServices','OPDx'];
 document.getElementById('dictionaryBody').innerHTML=order.map(sec=>{const rows=fieldMeta[sec]||[];return `<div class="dict-section"><h3>${escapeHtml(sec)}</h3><table class="dict-table"><thead><tr><th style="width:50px">ลำดับ</th><th style="width:180px">ชื่อฟิลด์</th><th>ความหมาย</th><th style="width:250px">เงื่อนไข/ตัวอย่าง</th></tr></thead><tbody>${rows.map((m,i)=>`<tr><td>${i+1}</td><td class="${m[3]==='important'?'dict-important':''}">${escapeHtml(m[0])}${m[3]==='important'?' ★':''}</td><td>${escapeHtml(m[1]||'')}</td><td>${escapeHtml(String(m[2]||'-'))}</td></tr>`).join('')}</tbody></table></div>`}).join('');
}
const dictionaryModal=document.getElementById('dictionaryModal');const openDictionary=()=>{dictionaryModal.classList.add('show');dictionaryModal.setAttribute('aria-hidden','false');renderDictionary();};document.getElementById('dictionaryBtn').onclick=openDictionary;document.getElementById('registryDictionaryBtn')?.addEventListener('click',openDictionary);document.getElementById('dictionaryClose').onclick=()=>{dictionaryModal.classList.remove('show');dictionaryModal.setAttribute('aria-hidden','true')};dictionaryModal.onclick=e=>{if(e.target===dictionaryModal)document.getElementById('dictionaryClose').click()};document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('dictionaryClose').click()});
function md5(bytes){
 function cmn(q,a,b,x,s,t){return (((a+q+x+t)|0)<<s|((a+q+x+t)|0)>>>32-s)+b|0}function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t)}function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t)}function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t)}function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t)}
 const len=bytes.length,bit=len*8,n=((len+8>>6)+1)*16,w=new Int32Array(n);for(let i=0;i<len;i++)w[i>>2]|=bytes[i]<<((i%4)*8);w[len>>2]|=0x80<<((len%4)*8);w[n-2]=bit;
 let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
 for(let i=0;i<n;i+=16){let oa=a,ob=b,oc=c,od=d;
 a=ff(a,b,c,d,w[i],7,-680876936);d=ff(d,a,b,c,w[i+1],12,-389564586);c=ff(c,d,a,b,w[i+2],17,606105819);b=ff(b,c,d,a,w[i+3],22,-1044525330);a=ff(a,b,c,d,w[i+4],7,-176418897);d=ff(d,a,b,c,w[i+5],12,1200080426);c=ff(c,d,a,b,w[i+6],17,-1473231341);b=ff(b,c,d,a,w[i+7],22,-45705983);a=ff(a,b,c,d,w[i+8],7,1770035416);d=ff(d,a,b,c,w[i+9],12,-1958414417);c=ff(c,d,a,b,w[i+10],17,-42063);b=ff(b,c,d,a,w[i+11],22,-1990404162);a=ff(a,b,c,d,w[i+12],7,1804603682);d=ff(d,a,b,c,w[i+13],12,-40341101);c=ff(c,d,a,b,w[i+14],17,-1502002290);b=ff(b,c,d,a,w[i+15],22,1236535329);
 a=gg(a,b,c,d,w[i+1],5,-165796510);d=gg(d,a,b,c,w[i+6],9,-1069501632);c=gg(c,d,a,b,w[i+11],14,643717713);b=gg(b,c,d,a,w[i],20,-373897302);a=gg(a,b,c,d,w[i+5],5,-701558691);d=gg(d,a,b,c,w[i+10],9,38016083);c=gg(c,d,a,b,w[i+15],14,-660478335);b=gg(b,c,d,a,w[i+4],20,-405537848);a=gg(a,b,c,d,w[i+9],5,568446438);d=gg(d,a,b,c,w[i+14],9,-1019803690);c=gg(c,d,a,b,w[i+3],14,-187363961);b=gg(b,c,d,a,w[i+8],20,1163531501);a=gg(a,b,c,d,w[i+13],5,-1444681467);d=gg(d,a,b,c,w[i+2],9,-51403784);c=gg(c,d,a,b,w[i+7],14,1735328473);b=gg(b,c,d,a,w[i+12],20,-1926607734);
 a=hh(a,b,c,d,w[i+5],4,-378558);d=hh(d,a,b,c,w[i+8],11,-2022574463);c=hh(c,d,a,b,w[i+11],16,1839030562);b=hh(b,c,d,a,w[i+14],23,-35309556);a=hh(a,b,c,d,w[i+1],4,-1530992060);d=hh(d,a,b,c,w[i+4],11,1272893353);c=hh(c,d,a,b,w[i+7],16,-155497632);b=hh(b,c,d,a,w[i+10],23,-1094730640);a=hh(a,b,c,d,w[i+13],4,681279174);d=hh(d,a,b,c,w[i],11,-358537222);c=hh(c,d,a,b,w[i+3],16,-722521979);b=hh(b,c,d,a,w[i+6],23,76029189);a=hh(a,b,c,d,w[i+9],4,-640364487);d=hh(d,a,b,c,w[i+12],11,-421815835);c=hh(c,d,a,b,w[i+15],16,530742520);b=hh(b,c,d,a,w[i+2],23,-995338651);
 a=ii(a,b,c,d,w[i],6,-198630844);d=ii(d,a,b,c,w[i+7],10,1126891415);c=ii(c,d,a,b,w[i+14],15,-1416354905);b=ii(b,c,d,a,w[i+5],21,-57434055);a=ii(a,b,c,d,w[i+12],6,1700485571);d=ii(d,a,b,c,w[i+3],10,-1894986606);c=ii(c,d,a,b,w[i+10],15,-1051523);b=ii(b,c,d,a,w[i+1],21,-2054922799);a=ii(a,b,c,d,w[i+8],6,1873313359);d=ii(d,a,b,c,w[i+15],10,-30611744);c=ii(c,d,a,b,w[i+6],15,-1560198380);b=ii(b,c,d,a,w[i+13],21,1309151649);a=ii(a,b,c,d,w[i+4],6,-145523070);d=ii(d,a,b,c,w[i+11],10,-1120210379);c=ii(c,d,a,b,w[i+2],15,718787259);b=ii(b,c,d,a,w[i+9],21,-343485551);
 a=a+oa|0;b=b+ob|0;c=c+oc|0;d=d+od|0}
 return [a,b,c,d].map(x=>[0,8,16,24].map(s=>('0'+((x>>>s)&255).toString(16)).slice(-2)).join('')).join('').toUpperCase();
}

/* ======================================================
   SSOCAC Reply Knowledge Builder V2.3.3
   ประมวลผลไฟล์ตอบกลับใน Browser และเก็บเฉพาะ Error Code
====================================================== */
const replyKnowledgeState={fileName:'',items:[]};
let knowledgeCache=[];
const ssocacSeedKnowledge={
  CD1:{description:'ไม่มีรหัสวินิจฉัยที่สอดคล้องกับ Protocol',cause:'ตรวจสอบรหัสวินิจฉัยและ Protocol ที่ใช้ในรายการ',solution:'ตรวจ OPDx และรหัส Protocol ให้สัมพันธ์กับเงื่อนไข SSOCAC'},
  CE3:{description:'มีการเบิก CAC แต่รหัส Protocol (Billtran.Vercode) ไม่ถูกต้อง',cause:'Billtran.VerCode ไม่ตรงกับ Protocol ที่ได้รับอนุมัติ',solution:'ตรวจและแก้ Billtran.VerCode ให้เป็น Protocol Code ที่ถูกต้อง'}
};
function decodeReplyFile(bytes){
  const decoders=['windows-874','utf-8'];
  for(const enc of decoders){try{const t=new TextDecoder(enc).decode(bytes).replace(/\u0000/g,'');if(t.includes('CheckCode')||t.includes('เอกสารตอบรับ'))return t}catch(e){}}
  return new TextDecoder('windows-874').decode(bytes).replace(/\u0000/g,'');
}
function parseSSOCACReplyKnowledge(text){
  const lines=text.replace(/\r/g,'').split('\n');
  const descriptions=new Map();
  let inCheckSection=false;
  for(const raw of lines){
    const line=raw.trim();
    if(/คำอธิบายรหัส\s*:\s*CheckCode/i.test(line)){inCheckSection=true;continue}
    if(inCheckSection){
      if(/^หมายเหตุ/.test(line))break;
      const m=line.match(/^([A-Z]{1,4}\d{1,4})\s*[:：]\s*(.+)$/i);
      if(m)descriptions.set(m[1].toUpperCase(),m[2].trim());
    }
  }
  const counts=new Map();
  const dataPart=text.split(/คำอธิบายรหัส\s*:\s*CheckCode/i)[0];
  const codeTokens=dataPart.match(/\b[A-Z]{1,4}\d{1,4}\b/g)||[];
  for(const code of codeTokens){
    const c=code.toUpperCase();
    if(/^C\d+$/.test(c) || /^S\d+$/.test(c) || /^R\d+$/.test(c) || /^CD\d+$/.test(c) || /^CE\d+$/.test(c)) counts.set(c,(counts.get(c)||0)+1);
  }
  for(const code of descriptions.keys())if(!counts.has(code))counts.set(code,1);
  return [...counts.entries()].map(([code,count])=>({
    module:'SSOCAC',code,count,
    description:descriptions.get(code)||ssocacSeedKnowledge[code]?.description||'ไม่พบคำอธิบายในไฟล์ตอบกลับ',
    cause:ssocacSeedKnowledge[code]?.cause||'',
    solution:ssocacSeedKnowledge[code]?.solution||'',
    dbStatus:'ยังไม่ได้ตรวจฐานข้อมูล', relatedFile:'', relatedField:'', tips:''
  })).sort((a,b)=>a.code.localeCompare(b.code));
}
async function analyzeSSOCACReply(){
  const input=document.getElementById('replyFileInput');
  const file=input?.files?.[0];
  if(!file){toast('ยังไม่ได้เลือกไฟล์','กรุณาเลือกไฟล์ตอบกลับ .BIL หรือ .txt','warning');return}
  try{
    const bytes=new Uint8Array(await file.arrayBuffer());
    const text=decodeReplyFile(bytes);
    if(!/SSOCAC/i.test(text)){
      const ok=await showDialog('ตรวจไม่พบคำว่า SSOCAC','ไฟล์นี้อาจไม่ใช่ไฟล์ตอบกลับ Cancer Care ต้องการวิเคราะห์ต่อหรือไม่','warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'วิเคราะห์ต่อ',value:true,className:'primary'}]);
      if(!ok)return;
    }
    replyKnowledgeState.fileName=file.name;
    replyKnowledgeState.items=parseSSOCACReplyKnowledge(text);
    renderReplyKnowledge();
    if(replyKnowledgeState.items.length){toast('วิเคราะห์สำเร็จ',`พบ Error Code ${replyKnowledgeState.items.length} รหัส โดยไม่จัดเก็บข้อมูลผู้ป่วย`,'success');await hydrateReplyKnowledgeFromDatabase();}
    else toast('ไม่พบ Error Code','ยังไม่พบรูปแบบ CheckCode ที่ระบบรองรับในไฟล์นี้','warning');
  }catch(err){showDialog('อ่านไฟล์ไม่สำเร็จ',err?.message||String(err),'error')}
}
function renderReplyKnowledge(){
  const items=replyKnowledgeState.items;
  const summary=document.getElementById('replySummary'),wrap=document.getElementById('replyKnowledgeWrap'),body=document.getElementById('replyKnowledgeBody');
  summary.classList.remove('hidden');wrap.classList.toggle('hidden',!items.length);
  const total=items.reduce((s,x)=>s+x.count,0),known=items.filter(x=>x.cause||x.solution).length;
  summary.innerHTML=`<div class="reply-summary-card"><div class="reply-stat"><b>${items.length}</b><span>Error Code ไม่ซ้ำ</span></div><div class="reply-stat"><b>${total}</b><span>จำนวนที่ตรวจพบ</span></div><div class="reply-stat"><b>${known}</b><span>มีแนวทางแก้เริ่มต้น</span></div></div>`;
  body.innerHTML=items.map((x,i)=>`<tr><td>${escapeHtml(x.code)}<div class="meta">SSOCAC</div></td><td>${escapeHtml(x.description)}</td><td><textarea data-reply-index="${i}" data-field="cause" placeholder="เพิ่มสาเหตุหรือข้อสังเกต...">${escapeHtml(x.cause)}</textarea></td><td><textarea data-reply-index="${i}" data-field="solution" placeholder="เพิ่มแนวทางแก้...">${escapeHtml(x.solution)}</textarea></td><td><input class="knowledge-inline-input" data-reply-index="${i}" data-field="relatedFile" placeholder="เช่น BILLTRAN" value="${escapeHtml(x.relatedFile||'')}"></td><td><input class="knowledge-inline-input" data-reply-index="${i}" data-field="relatedField" placeholder="เช่น VerCode" value="${escapeHtml(x.relatedField||'')}"></td><td>${x.count}</td><td><span class="db-badge ${x.dbStatus==='มีในฐานข้อมูล'?'ok':'pending'}">${escapeHtml(x.dbStatus)}</span></td></tr>`).join('');
  body.querySelectorAll('textarea, input[data-reply-index]').forEach(el=>el.addEventListener('input',()=>{const i=Number(el.dataset.replyIndex);replyKnowledgeState.items[i][el.dataset.field]=el.value}));
}
function csvCell(v){return `"${String(v??'').replace(/"/g,'""')}"`}
function exportReplyKnowledgeCSV(){
  if(!replyKnowledgeState.items.length){toast('ไม่มีข้อมูล','กรุณาวิเคราะห์ไฟล์ตอบกลับก่อน','warning');return}
  const headers=['Module','ErrorCode','Description','Cause','Solution','Count','SourceFile'];
  const rows=replyKnowledgeState.items.map(x=>[x.module,x.code,x.description,x.cause,x.solution,x.count,replyKnowledgeState.fileName]);
  const csv='\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`SSOCAC_Error_Knowledge_${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('ส่งออกแล้ว','ไฟล์ CSV มีเฉพาะ Error Code และองค์ความรู้ ไม่มีข้อมูลผู้ป่วย','success');
}

function getApiUrl(){return (window.SSOP_CONFIG?.apiUrl||'').trim();}
async function apiRequest(action,payload={}){
  const url=getApiUrl();
  if(!url || url.includes('PASTE_')) throw new Error('ยังไม่ได้ตั้งค่า Apps Script Web App URL ใน assets/js/config.js');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});
  if(!response.ok) throw new Error(`API ตอบกลับ ${response.status}`);
  const data=await response.json();
  if(!data.ok) throw new Error(data.message||'เกิดข้อผิดพลาดจากฐานข้อมูล');
  return data;
}
async function hydrateReplyKnowledgeFromDatabase(){
  try{
    const data=await apiRequest('getByCodes',{module:'SSOCAC',codes:replyKnowledgeState.items.map(x=>x.code)});
    const map=new Map((data.items||[]).map(x=>[String(x.ErrorCode||'').toUpperCase(),x]));
    replyKnowledgeState.items.forEach(item=>{
      const db=map.get(item.code.toUpperCase());
      if(db){
        item.description=db.Description||item.description;
        item.cause=db.Cause||item.cause;
        item.solution=db.Solution||item.solution;
        item.relatedFile=db.RelatedFile||'';
        item.relatedField=db.RelatedField||'';
        item.tips=db.Tips||'';
        item.dbStatus='มีในฐานข้อมูล';
      }else item.dbStatus='ยังไม่มีในฐานข้อมูล';
    });
    renderReplyKnowledge();
  }catch(err){
    replyKnowledgeState.items.forEach(x=>x.dbStatus='เชื่อมฐานข้อมูลไม่ได้');
    renderReplyKnowledge();
    toast('ยังไม่ได้เชื่อมฐานข้อมูล',err.message,'warning',5200);
  }
}
function openSaveKnowledgeModal(){
  if(!replyKnowledgeState.items.length){toast('ไม่มีข้อมูล','กรุณาวิเคราะห์ไฟล์ตอบกลับก่อน','warning');return;}
  const modal=document.getElementById('saveKnowledgeModal');
  document.getElementById('saveWritePin').value='';
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('saveUpdatedBy').focus(),80);
}
function closeSaveKnowledgeModal(){
  const modal=document.getElementById('saveKnowledgeModal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}
async function saveReplyKnowledge(){
  const updatedBy=document.getElementById('saveUpdatedBy').value.trim();
  const writePin=document.getElementById('saveWritePin').value.trim();
  if(!updatedBy){toast('กรอกชื่อผู้บันทึก','กรุณาระบุชื่อผู้บันทึกหรือผู้แก้ไข','warning');document.getElementById('saveUpdatedBy').focus();return;}
  if(!writePin){toast('กรอก PIN','กรุณากรอกรหัส PIN สำหรับบันทึก Knowledge','warning');document.getElementById('saveWritePin').focus();return;}
  const confirmBtn=document.getElementById('saveKnowledgeConfirm');
  confirmBtn.disabled=true;confirmBtn.textContent='กำลังบันทึก...';
  try{
    const items=replyKnowledgeState.items.map(x=>({
      Module:'SSOCAC',ErrorCode:x.code,Description:x.description,Cause:x.cause,Solution:x.solution,
      RelatedFile:x.relatedFile||'',RelatedField:x.relatedField||'',Tips:x.tips||'',UpdatedBy:updatedBy,Active:true
    }));
    const data=await apiRequest('upsertKnowledge',{items,writePin});
    replyKnowledgeState.items.forEach(x=>x.dbStatus='มีในฐานข้อมูล');
    renderReplyKnowledge();
    closeSaveKnowledgeModal();
    toast('บันทึกสำเร็จ',`เพิ่ม ${data.inserted||0} รายการ และอัปเดต ${data.updated||0} รายการ`,'success');
  }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6000);}
  finally{confirmBtn.disabled=false;confirmBtn.textContent='บันทึกข้อมูล';}
}
function knowledgeCard(item,index){
  return `<article class="knowledge-card" data-knowledge-index="${index}">
    <div class="knowledge-card-head"><div><strong>${escapeHtml(item.ErrorCode||'-')}</strong><span>${escapeHtml(item.Module||'-')}</span></div><span class="db-badge ok">${item.Active===false?'ปิดใช้งาน':'ใช้งาน'}</span></div>
    <h3>${escapeHtml(item.Description||'ยังไม่มีคำอธิบาย')}</h3>
    <div class="knowledge-grid">
      <div><b>สาเหตุ/ข้อสังเกต</b><p>${escapeHtml(item.Cause||'-')}</p></div>
      <div><b>แนวทางแก้</b><textarea class="knowledge-edit-textarea" data-k-index="${index}" data-k-field="Solution" placeholder="กรอกแนวทางแก้...">${escapeHtml(item.Solution||'')}</textarea></div>
      <div><b>ไฟล์ที่เกี่ยวข้อง</b><input class="knowledge-edit-input" data-k-index="${index}" data-k-field="RelatedFile" value="${escapeAttr(item.RelatedFile||'')}" placeholder="เช่น BILLTRAN" /></div>
      <div><b>ฟิลด์ที่เกี่ยวข้อง</b><input class="knowledge-edit-input" data-k-index="${index}" data-k-field="RelatedField" value="${escapeAttr(item.RelatedField||'')}" placeholder="เช่น VerCode" /></div>
    </div>
    ${item.Tips?`<div class="knowledge-tips"><b>Tips:</b> ${escapeHtml(item.Tips)}</div>`:''}
    <div class="knowledge-card-footer"><div class="meta">อัปเดต ${escapeHtml(item.UpdatedAt||'-')} โดย ${escapeHtml(item.UpdatedBy||'-')}</div><button class="primary knowledge-edit-save" data-k-save-index="${index}">💾 บันทึกการแก้ไข</button></div>
  </article>`;
}
async function loadKnowledge(query='',module='ALL'){
  const box=document.getElementById('knowledgeResults'),status=document.getElementById('knowledgeStatus');
  if(!box)return;
  box.innerHTML='<div class="knowledge-empty">กำลังโหลดข้อมูล...</div>';
  try{
    const data=await apiRequest('searchKnowledge',{query,module,limit:300});
    knowledgeCache=data.items||[];
    status.textContent=`เชื่อมต่อฐานข้อมูลแล้ว · พบ ${knowledgeCache.length} รายการ`;
    box.innerHTML=knowledgeCache.length?knowledgeCache.map((item,index)=>knowledgeCard(item,index)).join(''):'<div class="knowledge-empty">ไม่พบข้อมูลที่ค้นหา</div>'; bindKnowledgeEditors();
  }catch(err){
    status.textContent=err.message;
    box.innerHTML=`<div class="knowledge-empty error">${escapeHtml(err.message)}</div>`;
  }
}
function bindKnowledgeEditors(){
  document.querySelectorAll('[data-k-field]').forEach(el=>el.addEventListener('input',()=>{
    const index=Number(el.dataset.kIndex); const field=el.dataset.kField;
    if(knowledgeCache[index]) knowledgeCache[index][field]=el.value;
  }));
  document.querySelectorAll('[data-k-save-index]').forEach(btn=>btn.addEventListener('click',()=>openKnowledgeEditModal(Number(btn.dataset.kSaveIndex))));
}
function openKnowledgeEditModal(index){
  if(!knowledgeCache[index]) return;
  document.getElementById('knowledgeEditIndex').value=String(index);
  document.getElementById('knowledgeEditWritePin').value='';
  const modal=document.getElementById('knowledgeEditModal');modal.classList.add('show');modal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('knowledgeEditUpdatedBy').focus(),80);
}
function closeKnowledgeEditModal(){const modal=document.getElementById('knowledgeEditModal');modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
async function saveKnowledgeEdit(){
  const index=Number(document.getElementById('knowledgeEditIndex').value);
  const item=knowledgeCache[index];
  const updatedBy=document.getElementById('knowledgeEditUpdatedBy').value.trim();
  const writePin=document.getElementById('knowledgeEditWritePin').value.trim();
  if(!item){toast('ไม่พบรายการ','กรุณาค้นหาข้อมูลใหม่อีกครั้ง','error');return;}
  if(!updatedBy||!writePin){toast('ข้อมูลไม่ครบ','กรุณากรอกชื่อผู้แก้ไขและ PIN','warning');return;}
  const btn=document.getElementById('knowledgeEditConfirm');btn.disabled=true;btn.textContent='กำลังบันทึก...';
  try{
    const payload={Module:item.Module,ErrorCode:item.ErrorCode,Description:item.Description,Cause:item.Cause,Solution:item.Solution||'',RelatedFile:item.RelatedFile||'',RelatedField:item.RelatedField||'',Tips:item.Tips||'',UpdatedBy:updatedBy,Active:item.Active!==false};
    await apiRequest('upsertKnowledge',{items:[payload],writePin});
    item.UpdatedBy=updatedBy;item.UpdatedAt=new Date().toLocaleDateString('en-US');
    closeKnowledgeEditModal();toast('บันทึกสำเร็จ',`${item.ErrorCode} ได้รับการอัปเดตแล้ว`,'success');
    runKnowledgeSearch();
  }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500);}
  finally{btn.disabled=false;btn.textContent='บันทึกการแก้ไข';}
}
function runKnowledgeSearch(){loadKnowledge(document.getElementById('knowledgeSearchInput').value.trim(),document.getElementById('knowledgeModuleFilter').value);}

async function loadDocumentLinks(){
 try{const data=await apiRequest('getDocuments');(data.items||[]).forEach(x=>documentState[x.type]=x);}
 catch(err){console.warn('Document API:',err.message);}
}
async function openDocument(type){
 if(!documentState[type]) await loadDocumentLinks();
 const item=documentState[type];
 if(!item?.url){toast('ยังไม่พบไฟล์ PDF',type==='ANNOUNCEMENT'?'ยังไม่พบ CHI68-A02.pdf ในโฟลเดอร์':'ยังไม่พบ Protocol.pdf ในโฟลเดอร์','warning');return;}
 window.open(item.url,'_blank','noopener');
}
function openDocumentUploadModal(type){
 const names={ANNOUNCEMENT:['ประกาศ','CHI68-A02.pdf'],PROTOCOL:['รหัส Protocol','Protocol.pdf']};
 const cfg=names[type];if(!cfg)return;
 document.getElementById('documentUploadType').value=type;
 document.getElementById('documentUploadTitle').textContent=`⬆ อัปเดต${cfg[0]}`;
 document.getElementById('documentUploadHint').textContent=`ระบบจะบันทึกไฟล์ใหม่เป็น ${cfg[1]}`;
 document.getElementById('documentUploadFile').value='';document.getElementById('documentWritePin').value='';
 const modal=document.getElementById('documentUploadModal');modal.classList.add('show');modal.setAttribute('aria-hidden','false');
}
function closeDocumentUploadModal(){const modal=document.getElementById('documentUploadModal');modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
function fileToBase64(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]||'');r.onerror=()=>reject(new Error('อ่านไฟล์ PDF ไม่สำเร็จ'));r.readAsDataURL(file);});}
async function uploadDocument(){
 const type=document.getElementById('documentUploadType').value,file=document.getElementById('documentUploadFile').files[0],updatedBy=document.getElementById('documentUpdatedBy').value.trim(),writePin=document.getElementById('documentWritePin').value.trim();
 if(!file){toast('ยังไม่ได้เลือกไฟล์','กรุณาเลือกไฟล์ PDF ฉบับใหม่','warning');return;}if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){toast('ชนิดไฟล์ไม่ถูกต้อง','รองรับเฉพาะไฟล์ PDF','warning');return;}if(file.size>12*1024*1024){toast('ไฟล์ใหญ่เกินไป','รองรับไฟล์ PDF ไม่เกิน 12 MB','warning');return;}if(!updatedBy||!writePin){toast('ข้อมูลไม่ครบ','กรุณากรอกชื่อผู้ปรับปรุงและ PIN','warning');return;}
 const btn=document.getElementById('documentUploadConfirm');btn.disabled=true;btn.textContent='กำลังอัปโหลด...';
 try{const base64=await fileToBase64(file);const data=await apiRequest('uploadDocument',{documentType:type,base64,updatedBy,writePin});documentState[type]=data.item;closeDocumentUploadModal();toast('อัปเดตเอกสารสำเร็จ',`${data.item.fileName} พร้อมเปิดใช้งานแล้ว`,'success');}
 catch(err){toast('อัปโหลดไม่สำเร็จ',err.message,'error',6500);}finally{btn.disabled=false;btn.textContent='อัปโหลดและแทนที่';}
}

document.getElementById('knowledgeSearchBtn')?.addEventListener('click',runKnowledgeSearch);
document.getElementById('knowledgeReloadBtn')?.addEventListener('click',()=>loadKnowledge('','ALL'));
document.getElementById('knowledgeSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')runKnowledgeSearch();});
document.getElementById('saveKnowledgeBtn')?.addEventListener('click',openSaveKnowledgeModal);
document.getElementById('saveKnowledgeConfirm')?.addEventListener('click',saveReplyKnowledge);
document.getElementById('saveKnowledgeCancel')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeClose')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeModal')?.addEventListener('click',e=>{if(e.target.id==='saveKnowledgeModal')closeSaveKnowledgeModal();});
document.getElementById('saveWritePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')saveReplyKnowledge();});

document.getElementById('announcementBtn')?.addEventListener('click',()=>openDocument('ANNOUNCEMENT'));
document.getElementById('registryAnnouncementBtn')?.addEventListener('click',()=>openDocument('ANNOUNCEMENT'));
document.getElementById('protocolBtn')?.addEventListener('click',()=>openDocument('PROTOCOL'));
document.getElementById('registryProtocolBtn')?.addEventListener('click',()=>openDocument('PROTOCOL'));
document.getElementById('registryKnowledgeBtn')?.addEventListener('click',()=>{const w=window.open(`${location.origin}${location.pathname}?page=knowledge`,'ssopKnowledgeCenter');if(!w){showPage('knowledgePage');loadKnowledge('','SSOCAC');}});
document.querySelectorAll('[data-document-type]').forEach(btn=>btn.addEventListener('click',()=>openDocumentUploadModal(btn.dataset.documentType)));
document.getElementById('documentUploadConfirm')?.addEventListener('click',uploadDocument);
document.getElementById('documentUploadCancel')?.addEventListener('click',closeDocumentUploadModal);
document.getElementById('documentUploadClose')?.addEventListener('click',closeDocumentUploadModal);

document.getElementById('knowledgeEditConfirm')?.addEventListener('click',saveKnowledgeEdit);
document.getElementById('knowledgeEditCancel')?.addEventListener('click',closeKnowledgeEditModal);
document.getElementById('knowledgeEditClose')?.addEventListener('click',closeKnowledgeEditModal);
document.getElementById('knowledgeEditModal')?.addEventListener('click',e=>{if(e.target.id==='knowledgeEditModal')closeKnowledgeEditModal();});
document.getElementById('knowledgeEditWritePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')saveKnowledgeEdit();});

document.getElementById('analyzeReplyBtn')?.addEventListener('click',analyzeSSOCACReply);
document.getElementById('exportKnowledgeBtn')?.addEventListener('click',exportReplyKnowledgeCSV);


/* ======================================================
   Cancer Care Registry V3.2.0
====================================================== */
const registryState={items:[],filtered:[],page:1,pageSize:20,selected:null};
function thDate(v){if(!v)return '-';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return d.toLocaleDateString('th-TH',{year:'numeric',month:'2-digit',day:'2-digit'});}
function thDateTime(v){if(!v)return '-';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return d.toLocaleString('th-TH');}
async function loadRegistry(){
 const status=document.getElementById('registryStatus');if(!status)return;
 const searchInput=document.getElementById('registrySearch');if(searchInput)searchInput.value='';
 status.textContent='กำลังโหลดข้อมูล...';
 try{const data=await apiRequest('listCases',{module:'SSOCAC',limit:5000});registryState.items=data.items||[];applyRegistryFilter();status.textContent=`เชื่อมต่อฐานข้อมูลแล้ว · ${registryState.items.length} รายการ`;}
 catch(err){status.textContent=err.message;document.getElementById('registryBody').innerHTML=`<tr><td colspan="10" class="empty-row">${escapeHtml(err.message)}</td></tr>`;}
}
function registryDateValue(item){
 const raw=item?.Service_Date||item?.Created_At||item?.Updated_At||'';
 if(raw instanceof Date&&!Number.isNaN(raw.getTime()))return raw.getTime();
 const text=String(raw||'').trim();
 if(!text)return 0;
 const thai=text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+.*)?$/);
 if(thai){let year=Number(thai[3]);if(year>2400)year-=543;return new Date(year,Number(thai[2])-1,Number(thai[1])).getTime()||0;}
 const iso=text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
 if(iso){let year=Number(iso[1]);if(year>2400)year-=543;return new Date(year,Number(iso[2])-1,Number(iso[3])).getTime()||0;}
 const parsed=Date.parse(text);return Number.isNaN(parsed)?0:parsed;
}
function registryCaseSequence(item){
 const m=String(item?.Case_ID||'').match(/(\d+)$/);return m?Number(m[1]):0;
}
function registryMatchesStatus(item,filter){
 const status=String(item?.Case_Status||'').trim(),result=String(item?.Latest_Result||'').trim().toUpperCase();
 if(!filter||filter==='ALL')return true;
 if(filter==='PREPARING')return ['รอเตรียมข้อมูล','รอตรวจสอบ'].includes(status);
 if(filter==='READY')return ['พร้อมส่ง','พร้อมสร้างไฟล์','สร้างไฟล์แล้ว'].includes(status);
 if(filter==='SENT')return ['ส่งเบิกแล้ว','รอผลตอบกลับ'].includes(status);
 if(filter==='A')return result==='A'||status==='ผ่าน (A)';
 if(filter==='C')return result==='C'||status==='ติดแก้ไข (C)';
 return status===filter;
}
function syncRegistryStatusCards(){
 const value=document.getElementById('registryStatusFilter')?.value||'ALL';
 document.querySelectorAll('[data-registry-status]').forEach(card=>card.classList.toggle('active',card.dataset.registryStatus===value));
}
function applyRegistryFilter(){
 const q=(document.getElementById('registrySearch')?.value||'').trim().toLowerCase();
 const statusFilter=document.getElementById('registryStatusFilter')?.value||'ALL';
 const sort=document.getElementById('registrySort')?.value||'newest';
 registryState.filtered=registryState.items.filter(x=>registryMatchesStatus(x,statusFilter)&&(!q||[x.Case_ID,x.HN,x.VN,x.CID,x.Patient_Name,x.SSO_Case_No,x.Protocol_Code,x.Work_Order_No,x.Case_Status,x.Assigned_To].some(v=>String(v||'').toLowerCase().includes(q))));
 registryState.filtered.sort((a,b)=>{
  if(sort==='name')return String(a.Patient_Name||'').localeCompare(String(b.Patient_Name||''),'th',{sensitivity:'base'})||registryCaseSequence(a)-registryCaseSequence(b);
  const av=registryDateValue(a),bv=registryDateValue(b);
  if(av!==bv)return sort==='oldest'?av-bv:bv-av;
  const as=registryCaseSequence(a),bs=registryCaseSequence(b);
  return sort==='oldest'?as-bs:bs-as;
 });
 registryState.page=1;syncRegistryStatusCards();renderRegistry();
}
function renderRegistry(){
 const size=Number(document.getElementById('registryPageSize')?.value||20);registryState.pageSize=size;
 const total=registryState.filtered.length,pages=Math.max(1,Math.ceil(total/size));registryState.page=Math.min(registryState.page,pages);
 const start=(registryState.page-1)*size,rows=registryState.filtered.slice(start,start+size),body=document.getElementById('registryBody');
 const showCDetails=(document.getElementById('registryStatusFilter')?.value||'ALL')==='C';
 document.querySelectorAll('.registry-c-col').forEach(el=>el.classList.toggle('hidden',!showCDetails));
 body.innerHTML=rows.length?rows.map(x=>{const status=String(x.Case_Status||'').trim();const readyAction=status==='รอตรวจสอบ'?`<button class="primary compact-ready" data-case-ready="${escapeHtml(x.Case_ID)}">✓ พร้อมส่ง</button>`:'';const submittedAction=status==='พร้อมส่ง'?`<button class="primary compact-ready" data-case-submitted="${escapeHtml(x.Case_ID)}">📤 บันทึกส่งแล้ว</button>`:'';const reworkAction=(status==='ติดแก้ไข (C)'||x.Latest_Result==='C')?`<button class="primary compact-ready" data-case-rework="${escapeHtml(x.Case_ID)}">🔧 เริ่มแก้ไข</button>`:'';const cCells=showCDetails?`<td class="registry-c-col"><b class="error-text">${escapeHtml(x.Latest_Error_Code||'-')}</b></td><td class="registry-c-col registry-error-desc">${escapeHtml(x.Latest_Error_Description||'ยังไม่มีคำอธิบายใน Knowledge Base')}</td>`:'';return `<tr><td><div class="case-no">${escapeHtml(x.Case_ID||'-')}</div><div class="subline">ครั้งที่ ${escapeHtml(x.Current_Attempt_No||0)}</div></td><td><b>${escapeHtml(x.HN||'-')}</b><div class="subline">VN: ${escapeHtml(x.VN||'-')}</div></td><td><b>${escapeHtml(x.Patient_Name||'-')}</b><div class="subline">CID: ${escapeHtml(x.CID?String(x.CID).replace(/.(?=.{4})/g,'•'):'-')}</div></td><td>${thDate(x.Service_Date)}</td><td>${escapeHtml(x.SSO_Case_No||'-')}<div class="subline">${escapeHtml(x.Protocol_Code||'-')}</div></td><td>${escapeHtml(x.Work_Order_No||'-')}</td><td><span class="status-pill ${statusClassName(x.Case_Status)}">${escapeHtml(x.Case_Status||'รอเตรียมข้อมูล')}</span></td><td><span class="result-pill ${x.Latest_Result==='A'?'a':x.Latest_Result==='C'?'c':''}">${escapeHtml(x.Latest_Result||'-')}</span></td>${cCells}<td>${escapeHtml(x.Assigned_To||'-')}</td><td><div class="row-actions">${readyAction}${submittedAction}${reworkAction}<button class="soft" data-case-view="${escapeHtml(x.Case_ID)}">ดู</button><button class="soft" data-case-zip="${escapeHtml(x.Case_ID)}">แก้ไข ZIP</button><button class="soft" data-case-edit="${escapeHtml(x.Case_ID)}">แก้ไข</button></div></td></tr>`}).join(''):`<tr><td colspan="${showCDetails?12:10}" class="empty-row">ยังไม่มีข้อมูลทะเบียนงาน</td></tr>`;
 body.querySelectorAll('[data-case-view]').forEach(b=>b.onclick=()=>openCaseDetail(b.dataset.caseView));body.querySelectorAll('[data-case-zip]').forEach(b=>b.onclick=()=>openZipReader(b.dataset.caseZip));body.querySelectorAll('[data-case-edit]').forEach(b=>b.onclick=()=>openCaseModal(b.dataset.caseEdit));body.querySelectorAll('[data-case-ready]').forEach(b=>b.onclick=()=>markCaseReady(b.dataset.caseReady));body.querySelectorAll('[data-case-submitted]').forEach(b=>b.onclick=()=>markCaseSubmitted(b.dataset.caseSubmitted));body.querySelectorAll('[data-case-rework]').forEach(b=>b.onclick=()=>startCaseRework(b.dataset.caseRework));
 document.getElementById('registryCountText').textContent=total?`แสดง ${start+1}-${Math.min(start+size,total)} จาก ${total} รายการ`:'0 รายการ';
 const pageWrap=document.getElementById('registryPages');pageWrap.innerHTML='';for(let i=1;i<=pages;i++){if(pages>10&&Math.abs(i-registryState.page)>2&&i!==1&&i!==pages)continue;const b=document.createElement('button');b.textContent=i;b.className=i===registryState.page?'active':'';b.onclick=()=>{registryState.page=i;renderRegistry()};pageWrap.appendChild(b)}
 renderRegistryStats();
}
function statusClassName(status){const s=String(status||'รอเตรียมข้อมูล').trim();if(s==='รอเตรียมข้อมูล')return'preparing';if(s==='รอตรวจสอบ')return'review';if(['พร้อมส่ง','พร้อมสร้างไฟล์'].includes(s))return'ready';if(['สร้างไฟล์แล้ว','ส่งเบิกแล้ว','รอผลตอบกลับ'].includes(s))return'sent';if(s==='ผ่าน (A)')return'passed';if(s==='ติดแก้ไข (C)')return'fix';return'neutral'}
async function markCaseReady(caseId){
 const item=registryState.items.find(x=>x.Case_ID===caseId);if(!item)return;
 const ok=await showDialog('ยืนยันพร้อมส่ง',`ยืนยันว่าได้ตรวจสอบไฟล์ของ ${item.Patient_Name||caseId} แล้ว และพร้อมส่งข้อมูล?`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'พร้อมส่ง',value:true,className:'primary'}]);if(!ok)return;
 try{await apiRequest('markCaseReady',{caseId,user:item.Updated_By||'Kimhan'});item.Case_Status='พร้อมส่ง';applyRegistryFilter();toast('เปลี่ยนสถานะแล้ว',`${caseId} อยู่ในสถานะ “พร้อมส่ง”`,'success');}
 catch(err){toast('เปลี่ยนสถานะไม่สำเร็จ',err.message,'error',7000)}
}
async function markCaseSubmitted(caseId){
 const item=registryState.items.find(x=>String(x.Case_ID)===String(caseId));if(!item)return;
 const workOrder=String(item.Work_Order_No||'').trim();
 if(!workOrder){toast('ยังบันทึกส่งไม่ได้','ไม่พบ Work Order No. ของผู้ป่วยรายนี้ กรุณาตรวจสอบข้อมูลทะเบียนก่อน','warning',6500);return}
 const ok=await showDialog('ยืนยันบันทึกส่งแล้ว',`ยืนยันว่าได้ส่งไฟล์ของ ${item.Patient_Name||caseId} แล้ว?\nWork Order No.: ${workOrder}\nระบบจะเปลี่ยนสถานะเป็น “รอผลตอบกลับ”`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'บันทึกส่งแล้ว',value:true,className:'primary'}]);if(!ok)return;
 try{const data=await apiRequest('markCaseSubmitted',{caseId,user:item.Updated_By||'Kimhan'});item.Case_Status='รอผลตอบกลับ';applyRegistryFilter();toast('บันทึกการส่งแล้ว',`${caseId} เปลี่ยนเป็น “รอผลตอบกลับ”${data.generatedFileName?' · '+data.generatedFileName:''}`,'success',5200);}
 catch(err){toast('บันทึกการส่งไม่สำเร็จ',err.message,'error',7000)}
}

async function startCaseRework(caseId){
 const item=registryState.items.find(x=>String(x.Case_ID)===String(caseId));if(!item)return;
 const codes=String(item.Latest_Error_Code||'').trim();
 const ok=await showDialog('เริ่มแก้ไขผล C',`เริ่มรอบแก้ไขของ ${item.Patient_Name||caseId}?${codes?'\nError Code: '+codes:''}\nระบบจะเปลี่ยนสถานะเป็น “รอตรวจสอบ” โดยคงผลตอบกลับเดิมไว้ในประวัติ`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'เริ่มแก้ไข',value:true,className:'primary'}]);if(!ok)return;
 try{await apiRequest('startCaseRework',{caseId,user:item.Updated_By||'Kimhan'});item.Case_Status='รอตรวจสอบ';applyRegistryFilter();toast('เริ่มรอบแก้ไขแล้ว',`${caseId} เปลี่ยนเป็น “รอตรวจสอบ” และยังคง Error Code เดิมไว้`,'success',5200);}
 catch(err){toast('เริ่มแก้ไขไม่สำเร็จ',err.message,'error',6500)}
}

function renderRegistryStats(){const all=registryState.items;const set=(id,n)=>{const el=document.getElementById(id);if(el)el.textContent=n};set('statAll',all.length);set('statPreparing',all.filter(x=>['รอเตรียมข้อมูล','รอตรวจสอบ'].includes(x.Case_Status)).length);set('statReady',all.filter(x=>['พร้อมส่ง','พร้อมสร้างไฟล์','สร้างไฟล์แล้ว'].includes(x.Case_Status)).length);set('statSent',all.filter(x=>['ส่งเบิกแล้ว','รอผลตอบกลับ'].includes(x.Case_Status)).length);set('statA',all.filter(x=>x.Latest_Result==='A'||x.Case_Status==='ผ่าน (A)').length);set('statC',all.filter(x=>x.Latest_Result==='C'||x.Case_Status==='ติดแก้ไข (C)').length)}
function openCaseModal(id=''){
 const x=id?registryState.items.find(r=>r.Case_ID===id):null;registryState.selected=x||null;document.getElementById('caseModalTitle').textContent=x?'แก้ไขงาน Cancer Care':'เพิ่มงาน Cancer Care';
 const fields={caseId:x?.Case_ID||'',caseHN:x?.HN||'',caseVN:x?.VN||'',caseCID:x?.CID||'',casePatientName:x?.Patient_Name||'',caseServiceDate:x?.Service_Date?String(x.Service_Date).slice(0,10):'',caseCoverage:x?.Coverage||'ประกันสังคม',caseSsoNo:x?.SSO_Case_No||'',caseProtocol:x?.Protocol_Code||'',caseWorkOrder:x?.Work_Order_No||'',caseChemo:x?.Chemo_Drug||'',caseAssigned:x?.Assigned_To||'',caseStatus:x?.Case_Status||'รอเตรียมข้อมูล',caseRemark:x?.Remark||'',caseUpdatedBy:x?.Updated_By||'Kimhan'};Object.entries(fields).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v});const m=document.getElementById('caseModal');m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function closeCaseModal(){const m=document.getElementById('caseModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
async function saveCase(){
 const get=id=>document.getElementById(id).value.trim();const payload={Case_ID:get('caseId'),HN:get('caseHN'),VN:get('caseVN'),CID:get('caseCID'),Patient_Name:get('casePatientName'),Service_Date:get('caseServiceDate'),Coverage:get('caseCoverage'),Case_Status:get('caseStatus'),Assigned_To:get('caseAssigned'),Updated_By:get('caseUpdatedBy'),SSO_Case_No:get('caseSsoNo'),Protocol_Code:get('caseProtocol'),Chemo_Drug:get('caseChemo'),Remark:get('caseRemark')};
 if(!payload.HN||!payload.Patient_Name||!payload.Service_Date){toast('ข้อมูลไม่ครบ','กรุณากรอก HN ชื่อผู้ป่วย และวันที่รับบริการ','warning');return}const btn=document.getElementById('caseSaveBtn');btn.disabled=true;btn.textContent='กำลังบันทึก...';try{await apiRequest('saveCase',{item:payload});closeCaseModal();toast('บันทึกสำเร็จ',payload.Case_ID?'แก้ไขทะเบียนงานแล้ว':'สร้างทะเบียนงานใหม่แล้ว','success');await loadRegistry()}catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500)}finally{btn.disabled=false;btn.textContent='บันทึก'}
}
async function openCaseDetail(id){
 try{
  const data=await apiRequest('getCase',{caseId:id}),x=data.item||{};
  document.getElementById('caseDetailTitle').textContent=`รายละเอียด ${x.Case_ID||''}`;
  document.getElementById('caseDetailSub').textContent=`${x.Patient_Name||''} · สถานะ ${x.Case_Status||'-'}`;
  const pairs=[['HN',x.HN],['VN',x.VN],['ชื่อผู้ป่วย',x.Patient_Name],['วันที่รับบริการ',thDate(x.Service_Date)],['สิทธิ',x.Coverage],['สถานะ',x.Case_Status],['Case Number',x.SSO_Case_No],['Protocol',x.Protocol_Code],['Work Order No.',x.Work_Order_No],['ยา Chemo',x.Chemo_Drug],['ผู้รับผิดชอบ',x.Assigned_To],['ผลล่าสุด',x.Latest_Result],['Error ล่าสุด',x.Latest_Error_Code],['หมายเหตุ',x.Remark]];
  document.getElementById('caseDetailGrid').innerHTML=pairs.map(([k,v])=>`<div class="detail-item"><label>${escapeHtml(k)}</label><strong>${escapeHtml(v||'-')}</strong></div>`).join('');
  const attempts=data.attempts||[];
  document.getElementById('caseAttemptBody').innerHTML=attempts.length?attempts.map(a=>`<tr><td><b>${escapeHtml(a.Attempt_No||'-')}</b></td><td>${thDateTime(a.Created_At)}<div class="subline">ส่ง: ${thDateTime(a.Submit_Date)}</div></td><td>${escapeHtml(a.Work_Order_No||x.Work_Order_No||'-')}<div class="subline">${escapeHtml(a.Period_Key||'-')}</div></td><td>${escapeHtml(a.Generated_File_Name||a.Submission_File_Name||'-')}</td><td>${escapeHtml(a.Reply_File_Name||'-')}<div class="subline">${escapeHtml(a.Reply_BIL_Name||'')}</div></td><td><span class="result-pill ${a.Result_Code==='A'?'a':a.Result_Code==='C'?'c':''}">${escapeHtml(a.Result_Code||a.Submission_Status||'-')}</span>${a.Error_Codes?`<div class="subline error-text">${escapeHtml(a.Error_Codes)}</div>`:''}</td></tr>`).join(''):`<tr><td colspan="6" class="empty-row">ยังไม่มีประวัติการส่งไฟล์</td></tr>`;
  const codes=data.errorCodes||[],knowledge=data.knowledge||[],knowledgeMap={};knowledge.forEach(k=>knowledgeMap[String(k.ErrorCode||'').trim().toUpperCase()]=k);
  document.getElementById('caseErrorKnowledge').innerHTML=codes.length?codes.map(code=>{const k=knowledgeMap[String(code).toUpperCase()];return `<article class="knowledge-detail-card"><div class="knowledge-code">${escapeHtml(code)}</div>${k?`<div><b>${escapeHtml(k.Description||'พบคำแนะนำใน Knowledge Base')}</b><p><strong>สาเหตุ:</strong> ${escapeHtml(k.Cause||'-')}</p><p><strong>แนวทางแก้:</strong> ${escapeHtml(k.Solution||'-')}</p>${k.Tips?`<p><strong>ข้อควรระวัง:</strong> ${escapeHtml(k.Tips)}</p>`:''}${k.RelatedFile||k.RelatedField?`<div class="subline">ไฟล์/ฟิลด์: ${escapeHtml([k.RelatedFile,k.RelatedField].filter(Boolean).join(' · '))}</div>`:''}<button type="button" class="soft case-kb-add-btn" data-case-kb-code="${escapeAttr(code)}">✏️ แก้ไข Knowledge</button></div>`:`<div><b>ยังไม่มีคำแนะนำใน Knowledge Base</b><p class="meta">รหัสนี้ถูกบันทึกไว้ในผลตอบกลับ แต่ยังไม่มีแนวทางแก้ในคลังความรู้</p><button type="button" class="soft case-kb-add-btn" data-case-kb-code="${escapeAttr(code)}">➕ เพิ่มเข้า Knowledge Base</button></div>`}</article>`}).join(''):'<div class="meta empty-knowledge">ไม่พบ Error Code ในประวัติเคสนี้</div>';
  document.getElementById('caseTimeline').innerHTML=(data.timeline||[]).length?(data.timeline||[]).map(t=>`<div class="timeline-item"><b>${escapeHtml(t.Detail||t.Action_Type||'-')}</b><small>${thDateTime(t.Action_Date||t.Created_At)} · ${escapeHtml(t.Performed_By||'-')}</small>${t.Old_Value||t.New_Value?`<div class="subline">${escapeHtml(t.Old_Value||'-')} → ${escapeHtml(t.New_Value||'-')}</div>`:''}</div>`).join(''):'<div class="meta">ยังไม่มี Timeline</div>';
  const m=document.getElementById('caseDetailModal');m.classList.add('show');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  m.querySelectorAll('[data-case-kb-code]').forEach(btn=>btn.addEventListener('click',()=>{const code=btn.dataset.caseKbCode,k=knowledgeMap[String(code).toUpperCase()]||null;openCaseKnowledgeModal(code,id,'',k)}));
 }catch(err){toast('เปิดรายละเอียดไม่สำเร็จ',err.message,'error')}
}

function closeCaseDetail(){
 const m=document.getElementById('caseDetailModal');if(!m)return;
 m.classList.remove('show');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
}
function openCaseKnowledgeModal(code,caseId,fileDescription='',existing=null){
 const modal=document.getElementById('caseKnowledgeModal');if(!modal)return;
 const parent=[...document.querySelectorAll('.modal.show')].reverse().find(x=>x.id!=='caseKnowledgeModal');
 if(parent){parent.classList.add('suspended');modal.dataset.parentModal=parent.id}else delete modal.dataset.parentModal;
 const item=existing||null,isEdit=Boolean(item);
 document.getElementById('caseKnowledgeTitle').textContent=isEdit?'แก้ไขข้อมูลใน Knowledge Base':'เพิ่มข้อมูลเข้า Knowledge Base';
 document.getElementById('caseKnowledgeCode').value=String(code||item?.ErrorCode||'').trim().toUpperCase();
 document.getElementById('caseKnowledgeCaseId').value=caseId||'';
 const draftDescription=String(item?.Description||fileDescription||'').trim()||`พบ Error Code ${String(code||item?.ErrorCode||'').trim().toUpperCase()} จากไฟล์ตอบกลับ SSOCAC`;
 document.getElementById('caseKnowledgeDescription').value=draftDescription;
 document.getElementById('caseKnowledgeCause').value=item?.Cause||'';
 document.getElementById('caseKnowledgeSolution').value=item?.Solution||'';
 document.getElementById('caseKnowledgeRelatedFile').value=item?.RelatedFile||'SOCDBIL / Reply BIL';
 document.getElementById('caseKnowledgeRelatedField').value=item?.RelatedField||'Error Code';
 document.getElementById('caseKnowledgeUpdatedBy').value=item?.UpdatedBy||'Kimhan';
 document.getElementById('caseKnowledgeWritePin').value='';
 modal.dataset.mode=isEdit?'edit':'create';
 const pinField=document.getElementById('caseKnowledgePinField');
 if(pinField)pinField.classList.toggle('hidden',!isEdit);
 modal.classList.add('show');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
 setTimeout(()=>document.getElementById(item?.Description?'caseKnowledgeCause':'caseKnowledgeDescription')?.focus(),80);
}
function closeCaseKnowledgeModal(){
 const modal=document.getElementById('caseKnowledgeModal');if(!modal)return;
 modal.classList.remove('show');modal.setAttribute('aria-hidden','true');
 const parentId=modal.dataset.parentModal;if(parentId)document.getElementById(parentId)?.classList.remove('suspended');delete modal.dataset.parentModal;
 if(!document.querySelector('.modal.show'))document.body.classList.remove('modal-open');
}
async function saveCaseKnowledge(){
 const get=id=>document.getElementById(id)?.value.trim()||'';
 const code=get('caseKnowledgeCode').toUpperCase(),description=get('caseKnowledgeDescription'),cause=get('caseKnowledgeCause'),solution=get('caseKnowledgeSolution'),relatedFile=get('caseKnowledgeRelatedFile'),relatedField=get('caseKnowledgeRelatedField'),updatedBy=get('caseKnowledgeUpdatedBy'),writePin=get('caseKnowledgeWritePin'),caseId=get('caseKnowledgeCaseId');
 if(!description){toast('ข้อมูลไม่ครบ','กรุณากรอกความหมายของ Error Code','warning');return;}
 if(!updatedBy){toast('ข้อมูลไม่ครบ','กรุณากรอกชื่อผู้บันทึก','warning');return;}
 const isEdit=document.getElementById('caseKnowledgeModal')?.dataset.mode==='edit';
 if(isEdit&&!writePin){toast('กรอก PIN','กรุณากรอก PIN สำหรับแก้ไข Knowledge Base','warning');return;}
 const btn=document.getElementById('caseKnowledgeSave');btn.disabled=true;btn.textContent='กำลังบันทึก...';
 try{
  await apiRequest('upsertKnowledge',{items:[{Module:'SSOCAC',ErrorCode:code,Description:description,Cause:cause,Solution:solution,RelatedFile:relatedFile,RelatedField:relatedField,Tips:'',UpdatedBy:updatedBy,Active:true}],writePin,createWithoutPin:!isEdit});
  closeCaseKnowledgeModal();toast('บันทึกสำเร็จ',`${code} ถูกบันทึกใน Knowledge Base แล้ว`,'success');
  if(caseId)await openCaseDetail(caseId);if(document.getElementById('replyImportModal')?.classList.contains('show')){await hydrateReplyImportKnowledge();renderReplyImport();}
 }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500)}finally{btn.disabled=false;btn.textContent='บันทึก Knowledge';}
}

function exportRegistryCsv(){
 const rows=registryState.filtered||[];
 if(!rows.length){toast('ไม่มีข้อมูล','ไม่พบรายการตามตัวกรองที่เลือก','warning');return}
 const headers=['เลขงาน','ครั้งที่','HN','VN','CID','ชื่อผู้ป่วย','วันที่รับบริการ','Case Number','Protocol','Work Order No.','สถานะ','ผลล่าสุด','Error Code','ความหมาย Error','สาเหตุ','แนวทางแก้','ผู้รับผิดชอบ'];
 const data=rows.map(x=>[
  x.Case_ID||'',x.Current_Attempt_No||'',x.HN||'',x.VN||'',x.CID||'',x.Patient_Name||'',thDate(x.Service_Date),x.SSO_Case_No||'',x.Protocol_Code||'',x.Work_Order_No||'',x.Case_Status||'',x.Latest_Result||'',x.Latest_Error_Code||'',x.Latest_Error_Description||'',x.Latest_Error_Cause||'',x.Latest_Error_Solution||'',x.Assigned_To||''
 ]);
 const csv='\uFEFF'+[headers,...data].map(r=>r.map(csvCell).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=`SSOCAC_Registry_Filtered_${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast('ส่งออกแล้ว',`ส่งออก ${rows.length} รายการตามผลการค้นหาและตัวกรองปัจจุบัน`,'success');
}

document.getElementById('registryReloadBtn')?.addEventListener('click',loadRegistry);document.getElementById('addCaseBtn')?.addEventListener('click',()=>openCaseModal());document.getElementById('registrySearch')?.addEventListener('input',applyRegistryFilter);document.getElementById('registryStatusFilter')?.addEventListener('change',applyRegistryFilter);document.querySelectorAll('[data-registry-status]').forEach(card=>card.addEventListener('click',()=>{const select=document.getElementById('registryStatusFilter');if(select)select.value=card.dataset.registryStatus||'ALL';applyRegistryFilter()}));document.getElementById('registryResetFilterBtn')?.addEventListener('click',()=>{const search=document.getElementById('registrySearch'),status=document.getElementById('registryStatusFilter'),sort=document.getElementById('registrySort');if(search)search.value='';if(status)status.value='ALL';if(sort)sort.value='newest';applyRegistryFilter()});document.getElementById('registrySort')?.addEventListener('change',applyRegistryFilter);document.getElementById('registryPageSize')?.addEventListener('change',renderRegistry);document.getElementById('registryCsvBtn')?.addEventListener('click',exportRegistryCsv);document.getElementById('caseModalClose')?.addEventListener('click',closeCaseModal);document.getElementById('caseModalCancel')?.addEventListener('click',closeCaseModal);document.getElementById('caseSaveBtn')?.addEventListener('click',saveCase);document.getElementById('caseKnowledgeCancel')?.addEventListener('click',closeCaseKnowledgeModal);document.getElementById('caseKnowledgeSave')?.addEventListener('click',saveCaseKnowledge);document.getElementById('caseDetailModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeCaseDetail()});document.getElementById('caseKnowledgeModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeCaseKnowledgeModal()});document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const kb=document.getElementById('caseKnowledgeModal');if(kb?.classList.contains('show')){closeCaseKnowledgeModal();return;}const detail=document.getElementById('caseDetailModal');if(detail?.classList.contains('show'))closeCaseDetail();});



/* ZIP Reader V3.2.1 — แยกข้อมูลเป็นคอลัมน์ตามโครงสร้าง SSOP */
const zipReaderState={zip:null,file:null,entries:[],selected:null,rows:[],headers:[],sections:{},activeSection:'',caseItem:null,dirty:false};
function openZipReader(caseId=''){
 zipReaderState.caseItem=caseId?registryState.items.find(x=>x.Case_ID===caseId)||null:null;
 const label=document.getElementById('zipReaderCaseText');
 label.textContent=zipReaderState.caseItem?`${zipReaderState.caseItem.Case_ID} · HN ${zipReaderState.caseItem.HN||'-'} · ${zipReaderState.caseItem.Patient_Name||''}`:'อ่านไฟล์ ZIP ภายใน Browser โดยไม่อัปโหลดไฟล์ผู้ป่วยขึ้นฐานข้อมูล';
 resetZipReader();const m=document.getElementById('zipReaderModal');m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function closeZipReader(){const m=document.getElementById('zipReaderModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
function resetZipReader(){zipReaderState.zip=null;zipReaderState.file=null;zipReaderState.entries=[];zipReaderState.selected=null;zipReaderState.rows=[];zipReaderState.headers=[];zipReaderState.sections={};zipReaderState.activeSection='';zipReaderState.dirty=false;const i=document.getElementById('zipFileInput');if(i)i.value='';document.getElementById('zipChooseStep')?.classList.remove('hidden');document.getElementById('zipWorkspace')?.classList.add('hidden');document.getElementById('zipSectionTabs')?.replaceChildren()}
function baseName(path){return String(path||'').split('/').filter(Boolean).pop()||path}
function classifySsopFile(name){const n=baseName(name).toUpperCase().replace(/\.[^.]+$/,'');if(n.includes('BILLTRAN'))return'BILLTRAN / BillItems';if(n.includes('BILLDISP')||n.includes('BILLITEM'))return'Dispensing / DispensedItems';if(n.includes('OPSERVICE'))return'OPServices / OPDx';if(n.includes('OPDX'))return'OPDx';if(n.includes('DISPENS'))return'DispensedItems';return'ไฟล์อื่น'}
function decodeSsopBuffer(buf){const bytes=new Uint8Array(buf);for(const enc of ['windows-874','utf-8']){try{const t=new TextDecoder(enc,{fatal:enc==='utf-8'}).decode(bytes);if(t&&t.replace(/\uFFFD/g,'').length/t.length>.95)return t}catch(e){}}return new TextDecoder('utf-8').decode(bytes)}
function detectDelimiter(line){const opts=['|','\t',',',';'];return opts.map(d=>[d,(line.split(d).length-1)]).sort((a,b)=>b[1]-a[1])[0][1]>0?opts.map(d=>[d,(line.split(d).length-1)]).sort((a,b)=>b[1]-a[1])[0][0]:null}
function parseSsopText(text){const lines=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim()!=='');if(!lines.length)return{headers:[],rows:[]};const delimiter=detectDelimiter(lines[0]);if(!delimiter)return{headers:['ข้อความ'],rows:lines.map(x=>[x])};const split=l=>l.split(delimiter).map(v=>v.trim());let headers=split(lines[0]);let start=1;const looksHeader=headers.some(x=>/[A-Za-zก-๙]/.test(x));if(!looksHeader){headers=headers.map((_,i)=>`คอลัมน์ ${i+1}`);start=0}const rows=lines.slice(start).map(split);const width=Math.max(headers.length,...rows.map(r=>r.length));while(headers.length<width)headers.push(`คอลัมน์ ${headers.length+1}`);return{headers,rows}}
function parseZipSsopSections(text){
 const sections={};const re=/<(BILLTRAN|BillItems|Dispensing|DispensedItems|OPServices|OPDx)>\s*([\s\S]*?)\s*<\/\1>/g;let m;
 while((m=re.exec(String(text||'')))){const body=m[2].trim();sections[m[1]]=body?body.split(/\r?\n/).filter(line=>line.trim()!=='').map(line=>line.split('|').map(v=>v.trim())):[]}
 return sections;
}
function sectionHeaders(section,rows){const width=Math.max(0,...rows.map(r=>r.length));const known=labels[section]||[];return Array.from({length:width},(_,i)=>known[i]||`คอลัมน์ ${i+1}`)}
async function markZipLoadedForCase(fileName){
 if(!zipReaderState.caseItem)return null;
 const result=await apiRequest('markCaseZipLoaded',{Case_ID:zipReaderState.caseItem.Case_ID,Source_ZIP_Name:fileName||'',updatedBy:'ZIP EDITOR'});
 if(result?.changed){
  zipReaderState.caseItem.Case_Status='รอตรวจสอบ';
  const local=registryState.items.find(x=>x.Case_ID===zipReaderState.caseItem.Case_ID);if(local)local.Case_Status='รอตรวจสอบ';
  applyRegistryFilter();renderRegistryStats();
  toast('อัปโหลด ZIP แล้ว','เปลี่ยนสถานะเป็น “รอตรวจสอบ” อัตโนมัติ','success',4500);
 }
 return result;
}
async function handleZipFile(file){if(!file)return;if(!window.JSZip){toast('เปิด ZIP ไม่ได้','ไม่พบไลบรารี JSZip กรุณาตรวจสอบอินเทอร์เน็ต','error');return}if(!/\.zip$/i.test(file.name)){toast('ชนิดไฟล์ไม่ถูกต้อง','กรุณาเลือกไฟล์ .zip','warning');return}try{
 const summary=document.getElementById('zipSummary');document.getElementById('zipChooseStep').classList.add('hidden');document.getElementById('zipWorkspace').classList.remove('hidden');summary.innerHTML='<div class="zip-loading">กำลังอ่านและแยกโครงสร้าง SSOP...</div>';
 const zip=await JSZip.loadAsync(file);const rawEntries=Object.values(zip.files).filter(e=>!e.dir);const entries=[];const logicalPresent=new Set();
 for(const e of rawEntries){let logicalSections=[];try{const buf=await e.async('arraybuffer');const text=decodeSsopBuffer(buf);logicalSections=Object.keys(parseZipSsopSections(text));logicalSections.forEach(x=>logicalPresent.add(x))}catch(_e){}
  entries.push({name:e.name,size:e._data?.uncompressedSize||0,type:classifySsopFile(e.name),logicalSections,entry:e,text:null,originalText:null,sections:null,modified:false,autoChangedCells:{}});
 }
 zipReaderState.zip=zip;zipReaderState.file=file;zipReaderState.entries=entries;
 const expected=['BILLTRAN','BillItems','Dispensing','DispensedItems','OPServices','OPDx'];const missing=expected.filter(x=>!logicalPresent.has(x));
 summary.innerHTML=`<div class="summary-card"><span>ชื่อ ZIP</span><strong>${escapeHtml(file.name)}</strong></div><div class="summary-card"><span>จำนวนไฟล์</span><strong>${entries.length}</strong></div><div class="summary-card"><span>ส่วนข้อมูลที่อ่านได้</span><strong>${logicalPresent.size}</strong></div><div class="summary-card ${missing.length?'warn':''}"><span>ส่วนข้อมูลที่ยังไม่พบ</span><strong>${missing.length?escapeHtml(missing.join(', ')):'พบส่วนข้อมูลมาตรฐานครบ'}</strong></div>`;
 renderZipFileList();if(entries.length)await selectZipEntry(entries[0].name);
 if(zipReaderState.caseItem){markZipLoadedForCase(file.name).catch(err=>{console.warn('markCaseZipLoaded failed',err);toast('อ่าน ZIP สำเร็จ','เปิดข้อมูลได้แล้ว แต่ยังอัปเดตสถานะทะเบียนไม่สำเร็จ: '+(err.message||'กรุณาลองสร้าง ZIP อีกครั้ง'),'warning',7000)})}
 }catch(err){resetZipReader();toast('อ่าน ZIP ไม่สำเร็จ',err.message||'ไฟล์ ZIP อาจเสียหายหรือมีรหัสผ่าน','error',7000)}}
function renderZipFileList(){const wrap=document.getElementById('zipFileList');wrap.innerHTML=zipReaderState.entries.length?zipReaderState.entries.map(e=>`<button class="zip-file-item ${zipReaderState.selected===e.name?'active':''}" data-zip-entry="${escapeHtml(e.name)}"><span class="zip-file-icon">📄</span><span class="grow"><b>${escapeHtml(baseName(e.name))}</b><small>${escapeHtml(e.logicalSections.length?e.logicalSections.join(' + '):e.type)} · ${(e.size/1024).toFixed(1)} KB</small></span></button>`).join(''):'<div class="empty-row">ไม่พบไฟล์ภายใน ZIP</div>';wrap.querySelectorAll('[data-zip-entry]').forEach(b=>b.onclick=()=>selectZipEntry(b.dataset.zipEntry))}
async function selectZipEntry(name){const item=zipReaderState.entries.find(e=>e.name===name);if(!item)return;zipReaderState.selected=name;renderZipFileList();document.getElementById('zipPreviewTitle').textContent=baseName(name);document.getElementById('zipPreviewMeta').textContent=`${item.type} · กำลังอ่านข้อมูล...`;document.getElementById('zipPreviewBody').innerHTML='<tr><td class="empty-row">กำลังอ่านไฟล์...</td></tr>';try{const buf=await item.entry.async('arraybuffer');const text=item.text??decodeSsopBuffer(buf);if(item.text===null){item.text=text;item.originalText=text}const sections=item.sections??parseZipSsopSections(text);item.sections=sections;zipReaderState.sections=sections;zipReaderState.dirty=!!item.modified;updateZipEditStatus();const names=Object.keys(sections);const search=document.getElementById('zipTableSearch');search.disabled=false;search.value='';if(names.length){zipReaderState.activeSection=names[0];renderZipSectionTabs();selectZipSection(names[0])}else{const parsed=parseSsopText(text);zipReaderState.activeSection='';zipReaderState.headers=parsed.headers;zipReaderState.rows=parsed.rows;renderZipSectionTabs();document.getElementById('zipPreviewMeta').textContent=`${item.type} · ${parsed.rows.length.toLocaleString('th-TH')} แถว · ${parsed.headers.length} คอลัมน์`;renderZipPreview()}}catch(err){document.getElementById('zipPreviewBody').innerHTML=`<tr><td class="empty-row">อ่านไฟล์ไม่ได้: ${escapeHtml(err.message)}</td></tr>`}}
function renderZipSectionTabs(){const wrap=document.getElementById('zipSectionTabs');if(!wrap)return;const names=Object.keys(zipReaderState.sections||{});wrap.innerHTML=names.map(name=>`<button class="zip-section-tab ${zipReaderState.activeSection===name?'active':''}" data-zip-section="${escapeHtml(name)}">${escapeHtml(name)} <span>${zipReaderState.sections[name].length}</span></button>`).join('');wrap.querySelectorAll('[data-zip-section]').forEach(b=>b.onclick=()=>selectZipSection(b.dataset.zipSection))}
function selectZipSection(section){zipReaderState.activeSection=section;const rows=zipReaderState.sections[section]||[];zipReaderState.rows=rows;zipReaderState.headers=sectionHeaders(section,rows);renderZipSectionTabs();const info=sectionInfo[section];document.getElementById('zipPreviewMeta').textContent=`${info?.title||section} · ${rows.length.toLocaleString('th-TH')} แถว · ${zipReaderState.headers.length} คอลัมน์`;renderZipPreview()}
function renderZipPreview(){const q=(document.getElementById('zipTableSearch')?.value||'').trim().toLowerCase();const all=zipReaderState.rows;const indexed=all.map((r,i)=>({r,i}));const filtered=q?indexed.filter(x=>x.r.some(v=>String(v||'').toLowerCase().includes(q))):indexed;const rows=filtered.slice(0,500);const importantCols=(sectionInfo[zipReaderState.activeSection]?.importantCols)||[];document.getElementById('zipPreviewHead').innerHTML=`<tr><th>#</th>${zipReaderState.headers.map((h,i)=>{const meta=(fieldMeta[zipReaderState.activeSection]||[])[i];const desc=meta?.[1]||'ยังไม่มีคำอธิบายสำหรับหัวข้อนี้';const example=meta?getConditionExample(zipReaderState.activeSection,meta):'';return `<th class="field-tip ${importantCols.includes(i)?'important-head':''}" data-tip-title="${escapeAttr(h)}" data-tip-desc="${escapeAttr(desc)}" data-tip-example="${escapeAttr(example)}"><span class="head-wrap">${escapeHtml(h)}${importantCols.includes(i)?' ★':''}<span class="tip-dot">i</span></span></th>`}).join('')}</tr>`;bindTooltips();const body=document.getElementById('zipPreviewBody');body.innerHTML=rows.length?rows.map(x=>`<tr><td>${x.i+1}</td>${zipReaderState.headers.map((_,c)=>`<td contenteditable="true" data-zip-row="${x.i}" data-zip-col="${c}" class="zip-edit-cell ${importantCols.includes(c)?'important-cell':''} ${currentZipItem()?.autoChangedCells?.[zipReaderState.activeSection]?.has(`${x.i}|${c}`)?'auto-filled':''}" title="${escapeAttr(x.r[c]??'')}">${escapeHtml(x.r[c]??'')}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${zipReaderState.headers.length+1}" class="empty-row">ไม่พบข้อมูล</td></tr>`;body.querySelectorAll('[data-zip-row]').forEach(td=>td.addEventListener('input',()=>{const r=+td.dataset.zipRow,c=+td.dataset.zipCol;zipReaderState.rows[r][c]=td.textContent;const item=currentZipItem();if(item){item.modified=true;item.sections=zipReaderState.sections}zipReaderState.dirty=true;td.classList.add('changed');updateZipEditStatus()}));if(filtered.length>500){const meta=document.getElementById('zipPreviewMeta');meta.textContent+=` · แสดง 500 จาก ${filtered.length.toLocaleString('th-TH')} แถว`}}
function currentZipItem(){return zipReaderState.entries.find(e=>e.name===zipReaderState.selected)||null}
function updateZipEditStatus(text){const el=document.getElementById('zipEditStatus');if(!el)return;el.textContent=text||(zipReaderState.dirty?'มีข้อมูลแก้ไข':'พร้อมตรวจสอบ');el.className='status '+(zipReaderState.dirty?'warn':'ok')}
function rebuildZipEntry(item){let text=item.originalText||item.text||'';for(const [sec,rows] of Object.entries(item.sections||{})){const body=rows.map(r=>r.join('|')).join('\r\n');const re=new RegExp(`(<${sec}>)[\s\S]*?(</${sec}>)`);text=text.replace(re,`$1\r\n${body}\r\n$2`)}text=text.replace(/<\?EndNote\s+CheckSum="[^"]*"\?>\s*$/i,'').replace(/<\?EndNote\s+Checksum="[^"]*"\?>\s*$/i,'');const ending=text.includes('\r\n')?'\r\n':'\n';text=text.replace(/\s+$/,'')+ending;const sum=md5(cp874Bytes(text));return text+`<?EndNote Checksum="${sum}"?>`+ending}
function normalizeDrugText(v){return String(v||'').toLowerCase().replace(/[()\[\]{}]/g,' ').replace(/[^a-z0-9ก-๙]+/g,' ').replace(/\s+/g,' ').trim()}
function chemoDrugTerms(){
 const raw=String(zipReaderState.caseItem?.Chemo_Drug||'');
 const stop=new Set(['mg','ml','tab','tablet','cap','capsule','inj','injection','vial','amp','ampule']);
 const chunks=raw.split(/[\n,;+/|]+/).map(normalizeDrugText).filter(Boolean),terms=new Set();
 chunks.forEach(chunk=>{if(chunk.length>=3)terms.add(chunk);chunk.split(' ').forEach(word=>{if(word.length>=3&&!stop.has(word))terms.add(word)})});
 return [...terms].sort((a,b)=>b.length-a.length);
}
function rowMatchesChemo(row,cols,terms){if(!terms.length)return false;const text=normalizeDrugText(cols.map(i=>row[i]||'').join(' '));return terms.some(term=>text.includes(term)||term.includes(text))}

function markZipAutoChanged(item,section,row,col){
 if(!item.autoChangedCells)item.autoChangedCells={};
 if(!item.autoChangedCells[section])item.autoChangedCells[section]=new Set();
 item.autoChangedCells[section].add(`${row}|${col}`);
}
function setZipAutoValue(item,section,row,col,value,stats,label){
 const rows=item.sections?.[section]||[];
 if(!rows[row])return false;
 while(rows[row].length<=col)rows[row].push('');
 const next=String(value??'').trim();
 if(String(rows[row][col]??'').trim()===next)return false;
 rows[row][col]=next;item.modified=true;markZipAutoChanged(item,section,row,col);
 stats[label]=(stats[label]||0)+1;return true;
}
async function autoFillZipFromCase(){
 const c=zipReaderState.caseItem;
 if(!c){toast('ยังไม่ได้ผูกกับทะเบียน','กรุณาเปิด ZIP จากปุ่ม “แก้ไข ZIP” ในแถวผู้ป่วย','warning',6000);return;}
 const required=[['Case Number',c.SSO_Case_No],['Protocol Code',c.Protocol_Code],['TFlag',c.TFlag]];
 const missing=required.filter(([,v])=>!String(v||'').trim()).map(([k])=>k);
 if(missing.length){const ok=await showDialog('ข้อมูลทะเบียนยังไม่ครบ',`ไม่พบ ${missing.join(', ')} ในทะเบียน Case_SSOCAC\nระบบจะปรับปรุงเฉพาะข้อมูลที่มีอยู่ ต้องการดำเนินการต่อหรือไม่`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ดำเนินการต่อ',value:true,className:'primary'}]);if(!ok)return;}
 const stats={AuthCode:0,MemberNo:0,VerCode:0,TFlag:0,ClaimCat:0};
 const terms=chemoDrugTerms();
 for(const item of zipReaderState.entries){
  if(item.text===null){try{const buf=await item.entry.async('arraybuffer');item.text=decodeSsopBuffer(buf);item.originalText=item.text;}catch(_e){continue;}}
  if(!item.sections)item.sections=parseZipSsopSections(item.text||'');
  const bill=item.sections.BILLTRAN||[];
  bill.forEach((_,r)=>{
   setZipAutoValue(item,'BILLTRAN',r,1,'SSOCAC',stats,'AuthCode');
   if(String(c.SSO_Case_No||'').trim())setZipAutoValue(item,'BILLTRAN',r,7,c.SSO_Case_No,stats,'MemberNo');
   if(String(c.Protocol_Code||'').trim())setZipAutoValue(item,'BILLTRAN',r,10,c.Protocol_Code,stats,'VerCode');
   if(String(c.TFlag||'').trim())setZipAutoValue(item,'BILLTRAN',r,11,c.TFlag,stats,'TFlag');
  });
  const items=item.sections.BillItems||[];
  items.forEach((row,r)=>{if(rowMatchesChemo(row,[3,4,5],terms))setZipAutoValue(item,'BillItems',r,12,'OPR',stats,'ClaimCat');});
 }
 const current=currentZipItem();
 if(current){zipReaderState.sections=current.sections||{};zipReaderState.dirty=!!current.modified;const active=zipReaderState.activeSection;if(active&&zipReaderState.sections[active])selectZipSection(active);else{const names=Object.keys(zipReaderState.sections);if(names.length)selectZipSection(names[0]);}}
 const total=Object.values(stats).reduce((a,b)=>a+b,0);
 updateZipEditStatus(total?`ปรับปรุงอัตโนมัติ ${total} จุด`:'ข้อมูลตรงกับทะเบียนแล้ว');
 const lines=[`AuthCode: ${stats.AuthCode} จุด`,`MemberNo: ${stats.MemberNo} จุด`,`VerCode: ${stats.VerCode} จุด`,`TFlag: ${stats.TFlag} จุด`,`ClaimCat: ${stats.ClaimCat} จุด`];
 const drugNote=terms.length?'':'\nหมายเหตุ: ไม่พบชื่อยา Chemo ในทะเบียน จึงไม่ได้ปรับ ClaimCat';
 showDialog(total?'ปรับปรุงข้อมูลอัตโนมัติแล้ว':'ข้อมูลตรงกับทะเบียนแล้ว',lines.join('\n')+drugNote,total?'success':'info');
}
function validateZipActive(){const sec=zipReaderState.sections||{},problems=[];const bill=sec.BILLTRAN||[];if(bill.some(r=>!(r[7]||'').trim()))problems.push('BILLTRAN: MemberNo/Case Number ว่าง');const terms=chemoDrugTerms(),chemoLabel=zipReaderState.caseItem?.Chemo_Drug||'';if(terms.length){const bi=sec.BillItems||[],matchedBi=bi.filter(r=>rowMatchesChemo(r,[3,4,5],terms)),badBi=matchedBi.filter(r=>(r[12]||'').trim().toUpperCase()!=='OPR');if(badBi.length)problems.push(`BillItems: รายการยา “${chemoLabel}” ที่ตรงกับทะเบียน ยังไม่ได้ระบุ ClaimCat = OPR จำนวน ${badBi.length} แถว`);const di=sec.DispensedItems||[],matchedDi=di.filter(r=>rowMatchesChemo(r,[2,3,5],terms)),badDi=matchedDi.filter(r=>(r[16]||'').trim().toUpperCase()!=='OPR');if(badDi.length)problems.push(`DispensedItems: รายการยา “${chemoLabel}” ที่ตรงกับทะเบียน ยังไม่ได้ระบุ ClaimCat = OPR จำนวน ${badDi.length} แถว`)}const ops=sec.OPServices||[];if(ops.some(r=>!r.some(v=>String(v||'').trim().toUpperCase()==='SSOCAC')))problems.push('OPServices: ไม่พบ SSOCAC ครบทุกแถว');const dx=sec.OPDx||[];if(dx.some(r=>!r.some(v=>/^C\d{4}$/i.test(String(v||'').trim()))))problems.push('OPDx: ไม่พบ Protocol C#### ครบทุกแถว');updateZipEditStatus(problems.length?`พบ ${problems.length} จุด`:'ตรวจผ่าน');showDialog(problems.length?'พบข้อมูลที่ต้องตรวจสอบ':'ตรวจสอบเรียบร้อย',problems.length?problems.join('\n'):'ข้อมูลตรงกับทะเบียนผู้ป่วย และไม่พบข้อผิดพลาดตามกฎ SSOCAC ที่ตั้งไว้ ระบบจะสร้าง Checksum ใหม่ให้ทุกไฟล์ที่แก้ไข',problems.length?'warning':'success')}
async function undoZipEntry(){const item=currentZipItem();if(!item)return;item.text=item.originalText;item.sections=parseZipSsopSections(item.originalText||'');item.modified=false;item.autoChangedCells={};zipReaderState.sections=item.sections;zipReaderState.dirty=false;const names=Object.keys(item.sections);if(names.length)selectZipSection(names[0]);updateZipEditStatus('คืนค่าไฟล์เดิมแล้ว')}
function extractPeriodKeyFromName(name){
  const base=String(name||'').replace(/\.[^.]+$/,'');
  const m=base.match(/(\d{4}_\d{2}_\d{8}-\d{6})/);
  return m?m[1]:base;
}
async function recordGeneratedZip(caseItem,fileName){
  if(!caseItem?.Case_ID)return null;
  return apiRequest('recordGeneratedSubmission',{Case_ID:caseItem.Case_ID,Period_Key:extractPeriodKeyFromName(fileName),Work_Order_No:caseItem.Work_Order_No||'',Source_ZIP_Name:zipReaderState.file?.name||fileName,Submission_File_Name:zipReaderState.file?.name||fileName,Generated_File_Name:fileName,updatedBy:'ZIP EDITOR'});
}
async function downloadEditedZip(){if(!zipReaderState.zip||!zipReaderState.file)return;try{updateZipEditStatus('กำลังสร้าง ZIP...');for(const item of zipReaderState.entries){if(item.modified){const rebuilt=rebuildZipEntry(item);zipReaderState.zip.file(item.name,cp874Bytes(rebuilt));item.text=rebuilt}}const blob=await zipReaderState.zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=zipReaderState.file.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);let tracked=false;if(zipReaderState.caseItem){await recordGeneratedZip(zipReaderState.caseItem,a.download);tracked=true;zipReaderState.caseItem.Case_Status='รอตรวจสอบ';const local=registryState.items.find(x=>x.Case_ID===zipReaderState.caseItem.Case_ID);if(local)local.Case_Status='รอตรวจสอบ';applyRegistryFilter();renderRegistryStats()}updateZipEditStatus('สร้าง ZIP เรียบร้อย');toast('สร้าง ZIP สำเร็จ',tracked?`ดาวน์โหลด ${a.download} และบันทึกชื่อไฟล์/งวดส่งในประวัติแล้ว`:`ดาวน์โหลด ${a.download} แล้ว แต่ยังไม่ได้ผูกกับทะเบียน กรุณาเปิดจากปุ่ม “แก้ไข ZIP” ในแถวผู้ป่วยเพื่อบันทึกประวัติ`,'success',7000)}catch(err){updateZipEditStatus('สร้าง ZIP ไม่สำเร็จ');toast('สร้าง ZIP ไม่สำเร็จ',err.message,'error',7000)}}
document.getElementById('zipChooseBtn')?.addEventListener('click',()=>document.getElementById('zipFileInput').click());document.getElementById('zipFileInput')?.addEventListener('change',e=>handleZipFile(e.target.files?.[0]));document.getElementById('zipChangeBtn')?.addEventListener('click',resetZipReader);document.getElementById('zipTableSearch')?.addEventListener('input',renderZipPreview);document.getElementById('zipAutoFillBtn')?.addEventListener('click',autoFillZipFromCase);document.getElementById('zipValidateBtn')?.addEventListener('click',validateZipActive);document.getElementById('zipUndoBtn')?.addEventListener('click',undoZipEntry);document.getElementById('zipDownloadBtn')?.addEventListener('click',downloadEditedZip);const zipDrop=document.getElementById('zipDropZone');if(zipDrop){['dragenter','dragover'].forEach(ev=>zipDrop.addEventListener(ev,e=>{e.preventDefault();zipDrop.classList.add('dragover')}));['dragleave','drop'].forEach(ev=>zipDrop.addEventListener(ev,e=>{e.preventDefault();zipDrop.classList.remove('dragover')}));zipDrop.addEventListener('drop',e=>handleZipFile(e.dataTransfer.files?.[0]))}

/* Excel Import V3.1.1 */
const excelImportState={file:null,rows:[],duplicates:{},fileName:'',sheetName:''};
const EXCEL_HEADERS=['วันที่มารับบริการ','HN','vn','เลขบัตรประชาชน','ชื่อ-นามสกุล','สิทธิการรักษา','ยา Chemo','Case No.','Protocal','TFlag','Session','Station','JobNo'];
function openExcelImport(){resetExcelImport();const m=document.getElementById('excelImportModal');m.classList.add('show');m.setAttribute('aria-hidden','false')}
function closeExcelImport(){const m=document.getElementById('excelImportModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
function resetExcelImport(){excelImportState.file=null;excelImportState.rows=[];excelImportState.duplicates={};document.getElementById('excelImportFile').value='';showImportStep('choose')}
function showImportStep(step){['Choose','Preview','Result'].forEach(n=>document.getElementById('import'+n+'Step')?.classList.toggle('hidden',n.toLowerCase()!==step))}
function cleanText(v){return String(v??'').replace(/\s+/g,' ').trim()}
function excelDateToIso(v){
 if(v===null||v===undefined||v==='')return'';
 if(typeof v==='number'&&window.XLSX?.SSF){const d=XLSX.SSF.parse_date_code(v);if(d)return `${String(d.y).padStart(4,'0')}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`}
 const t=cleanText(v),m=t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);if(m){let y=Number(m[3]);if(y>2400)y-=543;return `${String(y).padStart(4,'0')}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}
 const d=new Date(t);return isNaN(d)?'':d.toISOString().slice(0,10)
}
function mapCancerExcelRow(r,index){const item={_row:index+2,Module_Code:'SSOCAC',Service_Date:excelDateToIso(r['วันที่มารับบริการ']),HN:cleanText(r['HN']),VN:cleanText(r['vn']??r['VN']),CID:cleanText(r['เลขบัตรประชาชน']),Patient_Name:cleanText(r['ชื่อ-นามสกุล']),Coverage:cleanText(r['สิทธิการรักษา']),Chemo_Drug:cleanText(r['ยา Chemo']),SSO_Case_No:cleanText(r['Case No.']),Protocol_Code:cleanText(r['Protocal']??r['Protocol']),TFlag:cleanText(r['TFlag']),Session:cleanText(r['Session']),Station:cleanText(r['Station']),Work_Order_No:cleanText(r['JobNo']),Case_Status:'รอเตรียมข้อมูล',Updated_By:'IMPORT EXCEL'};item._key=item.VN?`SSOCAC|${item.HN}|${item.VN}`:`SSOCAC|${item.HN}|${item.Service_Date}|${item.SSO_Case_No}|${item.Session}|${item.Station}`;item._errors=[];if(!item.Service_Date)item._errors.push('วันที่ไม่ถูกต้อง');if(!item.HN)item._errors.push('ไม่มี HN');if(!item.Patient_Name)item._errors.push('ไม่มีชื่อผู้ป่วย');return item}
async function handleExcelFile(file){
 if(!file)return;if(!window.XLSX){toast('เปิดไฟล์ไม่ได้','ไม่สามารถโหลดไลบรารีอ่าน Excel กรุณาตรวจอินเทอร์เน็ต','error');return}
 try{excelImportState.file=file;excelImportState.fileName=file.name;const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false,raw:false});const sheetName=wb.SheetNames.includes('DATA')?'DATA':wb.SheetNames[0];excelImportState.sheetName=sheetName;const ws=wb.Sheets[sheetName];const raw=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});const actual=(XLSX.utils.sheet_to_json(ws,{header:1,range:0,blankrows:false})[0]||[]).map(cleanText);const missing=EXCEL_HEADERS.filter(h=>!actual.includes(h));if(missing.length)throw new Error('หัวคอลัมน์ไม่ครบ: '+missing.join(', '));const rows=raw.map(mapCancerExcelRow).filter(x=>Object.values(x).some(v=>cleanText(v)));if(!rows.length)throw new Error('ไม่พบข้อมูลในไฟล์');excelImportState.rows=rows;document.getElementById('importFileName').textContent=file.name;document.getElementById('importSheetName').textContent=`ชีต ${sheetName} · ${rows.length} รายการ`;showImportStep('preview');renderImportPreview(true);const dup=await apiRequest('checkImportDuplicates',{module:'SSOCAC',rows:rows.map(stripImportMeta)});excelImportState.duplicates=dup.duplicates||{};rows.forEach(x=>{x._duplicate=excelImportState.duplicates[x._key]||null;x._action=x._duplicate?'skip':'new'});renderImportPreview(false)}catch(err){toast('อ่าน Excel ไม่สำเร็จ',err.message,'error',8000);resetExcelImport()}
}
function stripImportMeta(x){const o={};Object.keys(x).forEach(k=>{if(!k.startsWith('_'))o[k]=x[k]});o._key=x._key;return o}
function renderImportPreview(checking){const rows=excelImportState.rows,dup=rows.filter(x=>x._duplicate).length,invalid=rows.filter(x=>x._errors.length).length,ready=rows.length-invalid;document.getElementById('importSummary').innerHTML=`<div><span>ทั้งหมด</span><strong>${rows.length}</strong></div><div><span>พร้อมนำเข้า</span><strong>${ready}</strong></div><div><span>พบข้อมูลซ้ำ</span><strong>${checking?'…':dup}</strong></div><div><span>ข้อมูลไม่ครบ</span><strong>${invalid}</strong></div>`;document.getElementById('importPreviewBody').innerHTML=rows.map((x,i)=>{const status=x._errors.length?`<span class="import-badge invalid">${escapeHtml(x._errors.join(', '))}</span>`:checking?'<span class="import-badge checking">กำลังตรวจซ้ำ</span>':x._duplicate?`<span class="import-badge duplicate">ซ้ำกับ ${escapeHtml(x._duplicate.Case_ID)}</span>`:'<span class="import-badge new">รายการใหม่</span>';const action=x._errors.length?'<span class="meta">นำเข้าไม่ได้</span>':x._duplicate?`<select class="dup-action" data-import-index="${i}"><option value="skip" ${x._action==='skip'?'selected':''}>ข้ามรายการ</option><option value="update" ${x._action==='update'?'selected':''}>อัปเดตรายการเดิม</option><option value="new" ${x._action==='new'?'selected':''}>นำเข้าเป็นงานใหม่</option></select>`:'<span class="meta">นำเข้าเป็นงานใหม่</span>';return `<tr><td>${x._row}</td><td>${status}</td><td>${thDate(x.Service_Date)}</td><td><b>${escapeHtml(x.HN||'-')}</b><div class="subline">${escapeHtml(x.VN||'-')}</div></td><td>${escapeHtml(x.Patient_Name||'-')}</td><td>${escapeHtml(x.SSO_Case_No||'-')}<div class="subline">${escapeHtml(x.Protocol_Code||'-')}</div></td><td>${action}</td></tr>`}).join('');document.querySelectorAll('[data-import-index]').forEach(el=>el.onchange=()=>{excelImportState.rows[Number(el.dataset.importIndex)]._action=el.value});document.getElementById('importConfirmBtn').disabled=checking||ready===0}
async function confirmExcelImport(){const valid=excelImportState.rows.filter(x=>!x._errors.length);if(!valid.length)return;const btn=document.getElementById('importConfirmBtn');btn.disabled=true;btn.textContent='กำลังนำเข้า...';try{const data=await apiRequest('importCases',{module:'SSOCAC',sourceFileName:excelImportState.fileName,rows:valid.map(x=>({...stripImportMeta(x),duplicateAction:x._action||'new'}))});document.getElementById('importResultBox').innerHTML=`<div class="result-icon">✅</div><h3>นำเข้า Excel เรียบร้อย</h3><div class="result-grid"><div><span>สำเร็จ</span><strong>${data.imported||0}</strong></div><div><span>อัปเดต</span><strong>${data.updated||0}</strong></div><div><span>ข้าม</span><strong>${data.skipped||0}</strong></div><div><span>ผิดพลาด</span><strong>${data.failed||0}</strong></div></div><p>รหัสชุดนำเข้า: ${escapeHtml(data.batchId||'-')}</p>`;showImportStep('result');await loadRegistry()}catch(err){toast('นำเข้าไม่สำเร็จ',err.message,'error',8000)}finally{btn.disabled=false;btn.textContent='ยืนยันนำเข้า'}}
document.getElementById('importCancelBtn')?.addEventListener('click',closeExcelImport);document.getElementById('importDoneBtn')?.addEventListener('click',closeExcelImport);document.getElementById('importChangeFileBtn')?.addEventListener('click',resetExcelImport);document.getElementById('excelChooseBtn')?.addEventListener('click',()=>document.getElementById('excelImportFile').click());document.getElementById('excelImportFile')?.addEventListener('change',e=>handleExcelFile(e.target.files[0]));document.getElementById('importConfirmBtn')?.addEventListener('click',confirmExcelImport);const drop=document.getElementById('excelDropZone');if(drop){['dragenter','dragover'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>handleExcelFile(e.dataTransfer.files[0]))}


/* ======================================================
   Central Reply Import V3.4.0 (Revised from real .BIL)
   จับคู่ด้วย CID + วันที่บริการ และเชื่อม Period Key
====================================================== */
const replyImportState={file:null,zip:null,matches:[],unmatched:[],sourceFiles:[],meta:{},descriptions:{},knowledgeByCode:{},knowledgeKnown:0,knowledgeUnknown:0};
function openReplyImport(){resetReplyImport();const m=document.getElementById('replyImportModal');m.classList.add('show');m.setAttribute('aria-hidden','false')}
function closeReplyImport(){const m=document.getElementById('replyImportModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
function resetReplyImport(){replyImportState.file=null;replyImportState.zip=null;replyImportState.matches=[];replyImportState.unmatched=[];replyImportState.sourceFiles=[];replyImportState.meta={};replyImportState.descriptions={};replyImportState.knowledgeByCode={};replyImportState.knowledgeKnown=0;replyImportState.knowledgeUnknown=0;const i=document.getElementById('replyImportFile');if(i)i.value='';document.getElementById('replyImportChoose')?.classList.remove('hidden');document.getElementById('replyImportWorkspace')?.classList.add('hidden')}
function normalizeReplyText(text){return String(text||'').replace(/\u0000/g,'').replace(/\r\n?/g,'\n')}
function normalizeDigits(v){return String(v||'').replace(/\D/g,'')}
function normalizeThaiDateKey(v){
  const x=String(v||'').trim();
  let m=x.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m){let y=+m[3];if(y>2400)y-=543;return `${String(y).padStart(4,'0')}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`}
  m=x.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  return '';
}
function parseReplyMeta(text,fileName){
  const get=re=>{const m=String(text||'').match(re);return m?m[1].trim():''};
  return {Reply_Zip_Name:fileName||'',Period_Key:get(/งวดส่งของ\s*ร\.พ\.\s*=\s*([^\r\n]+)/i),Reply_No:get(/เลขที่ตอบรับ\s*=\s*([^\s\r\n]+)/i),Reply_Date:get(/วันที่ออกเลขตอบรับ\s*=\s*([^\r\n]+)/i),Station:get(/สถานี\s*:\s*([^\r\n]+)/i),Hospital_Code:get(/รหัส\s*ร\.พ\.\s*=\s*([^\r\n]+)/i)};
}
function parseReplyCheckCodeDescriptions(text){
  const out={};let inSection=false;
  for(const raw of normalizeReplyText(text).split('\n')){
    const line=raw.trim();
    if(/คำอธิบายรหัส\s*:\s*CheckCode/i.test(line)){inSection=true;continue;}
    if(!inSection)continue;
    if(/^หมายเหตุ/.test(line)||/^\*\*=/.test(line))break;
    const m=line.match(/^[*•\-\s]*([A-Z]{1,4}\d{1,4})\s*(?:[:：=－–—-])\s*(.+)$/i);
    if(m)out[m[1].toUpperCase()]=m[2].trim();
  }
  return out;
}
function knowledgeIsComplete(k){
  if(!k)return false;
  const d=String(k.Description||'').trim(),c=String(k.Cause||'').trim(),sol=String(k.Solution||'').trim();
  return Boolean(d && !/^พบรหัสจากไฟล์ตอบกลับ/.test(d) && (c && !/^รอวิเคราะห์/.test(c) || sol && !/^รอบันทึก/.test(sol)));
}
function parseSocdBilRows(text,sourceName,meta){
  const rows=[];
  for(const raw of normalizeReplyText(text).split('\n')){
    const line=raw.trim();if(!line.startsWith('*|'))continue;
    const parts=line.split('|');if(parts.length<2)continue;
    const fields=parts[1].trim().split(',').map(x=>x.trim());if(fields.length<10)continue;
    const stat=(fields[0]||'').split(/\s+/)[0].toUpperCase();if(!['A','C'].includes(stat))continue;
    const tail=(parts.slice(2).join('|')||'').replace(/[,\s]+$/,'').trim();
    const codes=[...new Set((tail.match(/\b[A-Z]\d{2,4}\b/g)||[]))];
    rows.push({Result_Code:stat,Station:(fields[0]||'').replace(/^\w\s*/,'' ).trim()||fields[1]||meta.Station||'',Line_No:fields[1]||'',Hcode:fields[2]||'',Hmain:fields[3]||'',AuthCode:fields[4]||'',Service_Date:fields[5]||'',InvNo:fields[6]||'',CID:normalizeDigits(fields[7]||''),Benefit_Package:fields[8]||'',Amount:fields[9]||'',Claim_Amt:fields[10]||'',Error_Codes:codes.join(','),Source_Entry:sourceName,Period_Key:meta.Period_Key||'',Reply_No:meta.Reply_No||'',Reply_Date:meta.Reply_Date||''});
  }
  return rows;
}
function matchReplyRow(row){
  const cid=normalizeDigits(row.CID),dateKey=normalizeThaiDateKey(row.Service_Date);
  const candidates=registryState.items.filter(x=>normalizeDigits(x.CID)===cid);
  let exact=candidates.filter(x=>normalizeThaiDateKey(x.Service_Date)===dateKey);
  if(exact.length===1)return {item:exact[0],score:150,label:'CID + วันที่บริการ'};
  if(candidates.length===1)return {item:candidates[0],score:90,label:'CID'};
  return null;
}
async function handleReplyImportFile(file){
  if(!file)return;if(!/\.zip$/i.test(file.name)){toast('ชนิดไฟล์ไม่ถูกต้อง','กรุณาเลือกไฟล์ ZIP ผลตอบกลับ','warning');return}
  if(!window.JSZip){toast('เปิด ZIP ไม่ได้','ไม่พบไลบรารี JSZip','error');return}
  try{
    if(!registryState.items.length)await loadRegistry();
    const zip=await JSZip.loadAsync(file),entries=Object.values(zip.files).filter(x=>!x.dir),docs=[],allRows=[];let mainMeta={};
    for(const e of entries){if(!/\.bil$/i.test(e.name))continue;const buf=await e.async('arraybuffer'),text=normalizeReplyText(decodeSsopBuffer(buf)),name=baseName(e.name),meta=parseReplyMeta(text,file.name);docs.push({name,text,meta});Object.assign(replyImportState.descriptions,parseReplyCheckCodeDescriptions(text));if(/_SOCDBIL_/i.test(name)){mainMeta=meta;allRows.push(...parseSocdBilRows(text,name,meta))}}
    if(!docs.length)throw new Error('ไม่พบไฟล์ .BIL ภายใน ZIP');
    if(!allRows.length)throw new Error('ไม่พบรายการผล A/C ในไฟล์ SOCDBIL');
    const matches=[],unmatched=[];
    allRows.forEach(row=>{const hit=matchReplyRow(row);if(!hit){unmatched.push(`${row.CID || '-'} · ${row.Service_Date || '-'} · InvNo ${row.InvNo||'-'}`);return}matches.push({...row,Case_ID:hit.item.Case_ID,HN:hit.item.HN,VN:hit.item.VN,Patient_Name:hit.item.Patient_Name,Work_Order_No:hit.item.Work_Order_No||'',Match_Score:hit.score,Match_Label:hit.label,Reply_File_Name:file.name,selected:true})});
    replyImportState.file=file;replyImportState.zip=zip;replyImportState.matches=matches;replyImportState.sourceFiles=docs.map(x=>x.name);replyImportState.unmatched=unmatched;replyImportState.meta=mainMeta;await hydrateReplyImportKnowledge();renderReplyImport();
  }catch(err){toast('อ่านผลตอบกลับไม่สำเร็จ',err.message||String(err),'error',7000)}
}

async function hydrateReplyImportKnowledge(){
  const codes=[...new Set(replyImportState.matches.flatMap(x=>String(x.Error_Codes||'').split(',').map(v=>v.trim().toUpperCase()).filter(Boolean)))];
  replyImportState.knowledgeByCode={};replyImportState.knowledgeKnown=0;replyImportState.knowledgeUnknown=0;
  if(!codes.length)return;
  try{
    const data=await apiRequest('getByCodes',{module:'SSOCAC',codes});
    (data.items||[]).forEach(x=>replyImportState.knowledgeByCode[String(x.ErrorCode||'').toUpperCase()]=x);
  }catch(err){console.warn('Knowledge lookup failed',err)}
  replyImportState.knowledgeKnown=codes.filter(c=>replyImportState.knowledgeByCode[c]).length;
  replyImportState.knowledgeUnknown=codes.length-replyImportState.knowledgeKnown;
}
function replyKnowledgeHtml(errorCodes){
  const codes=String(errorCodes||'').split(',').map(v=>v.trim().toUpperCase()).filter(Boolean);
  if(!codes.length)return '<span class="knowledge-none">ไม่มีรหัสแจ้งเตือน</span>';
  return codes.map(code=>{
    const k=replyImportState.knowledgeByCode[code],fileDesc=replyImportState.descriptions[code]||'';
    if(!k)return `<div class="reply-knowledge-item unknown"><b>${escapeHtml(code)}</b><span>${escapeHtml(fileDesc||'ยังไม่มีคำอธิบายใน Knowledge Base')}</span><button type="button" class="soft reply-kb-save" data-reply-kb-code="${escapeAttr(code)}">💾 บันทึกเข้าฐานความรู้</button></div>`;
    const desc=k.Description||fileDesc||'มีข้อมูลใน Knowledge Base',sol=k.Solution||k.Tips||'',complete=knowledgeIsComplete(k);
    return `<div class="reply-knowledge-item known ${complete?'':'incomplete'}"><b>${escapeHtml(code)}</b><span>${escapeHtml(desc)}</span>${sol?`<small>แนวทาง: ${escapeHtml(sol)}</small>`:''}<small>${complete?'✓ มีในฐานความรู้แล้ว':'มีแล้ว แต่ยังรอเติมวิธีแก้'}</small><button type="button" class="soft reply-kb-edit" data-reply-kb-code="${escapeAttr(code)}">✏️ แก้ไข</button></div>`;
  }).join('');
}

function renderReplyImport(){
  const items=replyImportState.matches,file=replyImportState.file,m=replyImportState.meta||{};
  document.getElementById('replyImportChoose')?.classList.add('hidden');document.getElementById('replyImportWorkspace')?.classList.remove('hidden');
  document.getElementById('replyImportFileName').textContent=file?.name||'';
  document.getElementById('replyImportMeta').textContent=`งวดส่ง ${m.Period_Key||'-'} · เลขตอบรับ ${m.Reply_No||'-'} · ไฟล์ภายใน ${replyImportState.sourceFiles.length} ไฟล์ · จับคู่ ${items.length} รายการ`;
  const a=items.filter(x=>x.Result_Code==='A').length,c=items.filter(x=>x.Result_Code==='C').length;
  document.getElementById('replyImportSummary').innerHTML=`<div><b>${items.length}</b><span>จับคู่ได้</span></div><div><b>${a}</b><span>ผล A</span></div><div><b>${c}</b><span>ผล C</span></div><div><b>${replyImportState.unmatched.length}</b><span>ยังจับคู่ไม่ได้</span></div><div><b>${replyImportState.knowledgeKnown}</b><span>Knowledge พร้อมใช้</span></div><div><b>${replyImportState.knowledgeUnknown}</b><span>รหัสใหม่</span></div>`;
  const body=document.getElementById('replyImportBody');body.innerHTML=items.length?items.map((x,i)=>`<tr><td>${i+1}</td><td><b>${escapeHtml(x.Case_ID)}</b><div class="subline">${escapeHtml(x.Patient_Name||'-')}</div></td><td>${escapeHtml(x.HN||'-')}<div class="subline">CID: ${escapeHtml(x.CID||'-')}</div></td><td><select data-reply-result="${i}"><option value="A" ${x.Result_Code==='A'?'selected':''}>A</option><option value="C" ${x.Result_Code==='C'?'selected':''}>C</option></select></td><td><input data-reply-codes="${i}" value="${escapeAttr(x.Error_Codes||'')}" placeholder="เช่น W07,C03"></td><td class="reply-knowledge-cell">${replyKnowledgeHtml(x.Error_Codes)}</td><td>${escapeHtml(x.Period_Key||'-')}<div class="subline">${escapeHtml(x.Source_Entry||'-')}</div></td><td><label class="reply-match-check"><input type="checkbox" data-reply-select="${i}" ${x.selected?'checked':''}> ยืนยัน</label><div class="subline">${escapeHtml(x.Match_Label||'')} · ${x.Match_Score}</div></td></tr>`).join(''):`<tr><td colspan="8" class="empty-row">ยังจับคู่ผู้ป่วยไม่ได้</td></tr>`;
  body.querySelectorAll('[data-reply-result]').forEach(el=>el.onchange=()=>replyImportState.matches[Number(el.dataset.replyResult)].Result_Code=el.value);body.querySelectorAll('[data-reply-codes]').forEach(el=>el.onchange=async()=>{replyImportState.matches[Number(el.dataset.replyCodes)].Error_Codes=el.value.trim();await hydrateReplyImportKnowledge();renderReplyImport()});body.querySelectorAll('[data-reply-select]').forEach(el=>el.onchange=()=>replyImportState.matches[Number(el.dataset.replySelect)].selected=el.checked);body.querySelectorAll('[data-reply-kb-code]').forEach(btn=>btn.onclick=()=>{const code=btn.dataset.replyKbCode,k=replyImportState.knowledgeByCode[code]||null;openCaseKnowledgeModal(code,'',replyImportState.descriptions[code]||'',k)});
  const un=document.getElementById('replyImportUnmatched');un.classList.toggle('hidden',!replyImportState.unmatched.length);un.innerHTML=replyImportState.unmatched.length?`<b>รายการที่ยังจับคู่ไม่ได้:</b><br>${replyImportState.unmatched.map(escapeHtml).join('<br>')}`:'';
}
async function saveReplyImport(){
  const items=replyImportState.matches.filter(x=>x.selected);if(!items.length){toast('ยังไม่มีรายการยืนยัน','กรุณาติ๊กรายการที่ต้องการบันทึก','warning');return}
  const btn=document.getElementById('replyImportSaveBtn');btn.disabled=true;btn.textContent='กำลังบันทึก...';
  try{const data=await apiRequest('importReplyResults',{items,replyFileName:replyImportState.file?.name||'',replyEntryNames:replyImportState.sourceFiles,periodKey:replyImportState.meta?.Period_Key||'',replyNo:replyImportState.meta?.Reply_No||'',replyDate:replyImportState.meta?.Reply_Date||'',updatedBy:'IMPORT REPLY'});closeReplyImport();toast('บันทึกผลตอบกลับสำเร็จ',`อัปเดต ${data.updated||0} รายการ · เชื่อม Attempt เดิม ${data.linked||0} · ผล A ${data.resultA||0} · ผล C ${data.resultC||0} · Knowledge ${replyImportState.knowledgeKnown} รหัส · รหัสใหม่ ${replyImportState.knowledgeUnknown}`,'success',7500);await loadRegistry()}catch(err){toast('บันทึกผลไม่สำเร็จ',err.message,'error',7000)}finally{btn.disabled=false;btn.textContent='ยืนยันบันทึกผล'}
}
document.getElementById('replyImportCancelBtn')?.addEventListener('click',closeReplyImport);document.getElementById('replyImportChooseBtn')?.addEventListener('click',()=>document.getElementById('replyImportFile')?.click());document.getElementById('replyImportFile')?.addEventListener('change',e=>handleReplyImportFile(e.target.files?.[0]));document.getElementById('replyImportChangeBtn')?.addEventListener('click',resetReplyImport);document.getElementById('replyImportSaveBtn')?.addEventListener('click',saveReplyImport);document.getElementById('replyImportKnowledgeBtn')?.addEventListener('click',()=>{closeReplyImport();showPage('knowledgePage');const q=[...new Set(replyImportState.matches.flatMap(x=>String(x.Error_Codes||'').split(',').map(v=>v.trim()).filter(Boolean)))].join(' ');const input=document.getElementById('knowledgeSearchInput');if(input)input.value=q;loadKnowledge(q,'SSOCAC')});
