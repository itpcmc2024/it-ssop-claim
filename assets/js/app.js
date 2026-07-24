/*
======================================================
SSOP Toolkit Professional Edition V2.3.2
Copyright © 2026 PCMC By Kimhan
All Rights Reserved.
======================================================
*/
const state={file:null,fileName:'',originalText:'',doc:null,activeSection:'',originalDoc:null,selected:new Set()};
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('splashScreen')?.classList.add('hide'),900)});
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
 document.getElementById('homePage').classList.remove('hidden-page');
 window.scrollTo({top:0,behavior:'smooth'});
}
function openModule(name){
 if(name==='cancer'){showPage('cancerPage');return;}
 if(name==='knowledge'){showPage('knowledgePage');loadKnowledge('','ALL');return;}
 const names={main:'ประกันสังคม Main',cross:'ประกันสังคมข้ามเขต',cpap:'ประกันสังคม CPAP',sleep:'ประกันสังคม Sleep Test'};
 showDialog('เตรียมพัฒนา',`${names[name]||'โมดูลนี้'} ถูกเตรียมปุ่มและโครงสร้างไว้แล้ว
จะเพิ่ม Parser และกฎตรวจสอบเฉพาะงานในเวอร์ชันถัดไป`,'info');
}
document.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.module)));
document.getElementById('backHomeBtn').onclick=goHome;
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
  ['ProviderID','รหัสสถานพยาบาลผู้ให้บริการ'],['DispID','เลขอ้างอิงชุดการจ่ายยา'],['InvNo','เลขที่ใบแจ้งหนี้ ใช้เชื่อมโยง BILLTRAN'],['HN','เลขประจำตัวผู้ป่วยของโรงพยาบาล'],['PID','เลขบัตรประชาชน 13 หลัก'],['PrescDate','วันเวลาสั่งยา'],['DispDate','วันเวลาจ่ายยา'],['PrescBy','รหัสผู้สั่งยา'],['DispBy','รหัสผู้จ่ายยา/ข้อมูลผู้จ่ายตามโครงสร้างไฟล์'],['ChargeAmt','ยอดรวมค่าเรียกเก็บหมวดยา'],['ClaimAmt','ยอดรวมที่ขอเบิกหมวดยา'],['Paid','ยอดผู้ป่วยจ่าย'],['Reimbursement','ยอดหรือข้อมูลการชดเชย'],['Field14','ฟิลด์ตามรุ่นไฟล์'],['Field15','ฟิลด์ตามรุ่นไฟล์'],['Field16','ฟิลด์ตามรุ่นไฟล์'],['Field17','ฟิลด์ตามรุ่นไฟล์'],['Field18','ฟิลด์ตามรุ่นไฟล์']
 ],
 DispensedItems:[
  ['DispID','เลขอ้างอิงชุดการจ่ายยา ต้องตรงกับ Dispensing'],['PrdCat','ประเภทผลิตภัณฑ์'],['HospPrdCode','รหัสยาภายในโรงพยาบาล'],['DrugID','รหัสยามาตรฐาน/TMT ตามไฟล์ต้นทาง'],['RegNo','เลขทะเบียนตำรับยา ถ้ามี'],['PrdName','ชื่อทางการค้าของยา'],['Unit','หน่วยนับของยา'],['DrugDosageCode','รหัสวิธีใช้ยา'],['DrugDosage','ข้อความวิธีใช้ยาและความแรง'],['Quantity','จำนวนยาที่จ่าย'],['UnitPrice','ราคาต่อหน่วย'],['ChargeAmt','จำนวนเงินค่ายารายการนี้'],['ReimbPrice','ราคาต่อหน่วยที่ให้เบิกได้'],['ReimbAmt','จำนวนเงินค่ายาที่ขอเบิก'],['Paid','จำนวนเงินที่ผู้ป่วยจ่ายจริง'],['MultiDisp','เงื่อนไขการจ่ายยาแบบต่อเนื่อง'],['SupplyFor','จำนวนวันที่สั่งจ่ายยาครอบคลุม'],['AdditionalField','ฟิลด์เพิ่มเติมตามรุ่นไฟล์'],['ClaimCat','ยามะเร็งที่เบิกเพิ่มในโครงการ SSOCAC ต้องระบุ OPR','OPR','important']
 ],
 OPServices:[
  ['InvNo','เลขที่ใบแจ้งหนี้'],['SvID','รหัสอ้างอิงบริการ'],['Class','ประเภทข้อมูลบริการ'],['Hcode','รหัสสถานพยาบาล'],['HN','เลขประจำตัวผู้ป่วย'],['PID','เลขบัตรประชาชน'],['CareAccount','ลำดับ/บัญชีบริการ'],['TypeServ','ประเภทบริการ'],['Clinic','คลินิก'],['SubClinic','คลินิกย่อย'],['DateField','วันที่ตามโครงสร้างต้นทาง'],['Provider','ผู้ให้บริการ'],['ProviderType','ประเภทผู้ให้บริการ'],['BegDT','วันเวลาเริ่มบริการ'],['EndDT','วันเวลาสิ้นสุดบริการ'],['LCCode','รหัสบริการภายใน'],['CodeSet','ชุดรหัส'],['STDCode','รหัสมาตรฐาน'],['ChargeAmt','ยอดค่าใช้จ่าย'],['Completion','สถานะความสมบูรณ์'],['PrdSeCode','รหัสโครงการ สำหรับ SSOCAC ต้องเป็น SSOCAC','SSOCAC','important'],['ClaimCat','หมวดการเบิก']
 ],
 OPDx:[
  ['Class','ประเภทข้อมูลบริการ'],['SvID','รหัสอ้างอิงบริการ'],['Sequence','ลำดับวินิจฉัย'],['CodeSet','ชุดรหัสวินิจฉัย'],['DiagnosisCode','รหัสวินิจฉัย'],['VerCode','รหัส Protocol การรักษามะเร็งตามอนุมัติ เช่น C0111','C0111','important']
 ]
};
const labels=Object.fromEntries(Object.entries(fieldMeta).map(([k,v])=>[k,v.map(x=>x[0])]));
const sectionInfo={
 BILLTRAN:{title:'ข้อมูลธุรกรรมทางการเงินและการพิสูจน์ตัวตน',desc:'ข้อมูลสรุปภาพรวมของใบแจ้งหนี้',format:'Station | AuthCode | DTTran | Hcode | InvNo | BillNo | HN | MemberNo | Amount | Paid | VerCode | Tflag | …',important:['AuthCode, MemberNo, VerCode และ Tflag เป็นจุดที่ผู้ใช้ต้องตรวจสอบก่อนส่ง'],importantCols:[1,7,10,11]},
 BillItems:{title:'รายการค่ารักษาพยาบาลย่อย',desc:'แจกแจงค่าใช้จ่ายทุกรายการภายใต้ใบแจ้งหนี้',format:'InvNo | SvDate | BillMuad | LCCode | STDCode | Description | Quantity | UnitPrice | ChargeAmt | ClaimUP | ClaimAmount | SvRefID | ClaimCat',important:['รายการที่สำนักงานประกันสังคมจ่ายเพิ่มต้องระบุ ClaimCat เป็น OPR'],importantCols:[12]},
 Dispensing:{title:'ข้อมูลสรุปชุดการจ่ายยา',desc:'เชื่อมโยงไปยังรายการยารายบรรทัด',format:'ProviderID | DispID | InvNo | HN | PID | PrescDate | DispDate | …',important:['แฟ้มนี้ใช้เมื่อมีการจ่ายยากลุ่มที่เกี่ยวข้องกับการเบิก'],importantCols:[]},
 DispensedItems:{title:'รายการรายละเอียดตัวยาที่จ่าย',desc:'รายการยารายบรรทัดภายใต้ Dispensing',format:'DispID | PrdCat | HospPrdCode | DrugID | RegNo | PrdName | … | ClaimCat',important:['ยามะเร็งที่เบิกเพิ่มต้องระบุ ClaimCat เป็น OPR'],importantCols:[18]},
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
 document.getElementById('tableHead').innerHTML='<tr><th class="rownum"><input type="checkbox" id="selectAll"></th>'+Array.from({length:cols},(_,i)=>{const meta=(fieldMeta[state.activeSection]||[])[i];const name=meta?.[0]||'คอลัมน์ '+(i+1);const desc=meta?.[1]||'ยังไม่มีคำอธิบายสำหรับฟิลด์นี้';const example=meta?.[2]||'';const imp=importantCols.includes(i)||meta?.[3]==='important';return `<th class="field-tip ${imp?'important-head':''}" data-tip-title="${escapeAttr(name)}" data-tip-desc="${escapeAttr(desc)}" data-tip-example="${escapeAttr(example)}"><span class="head-wrap">${escapeHtml(name)}${imp?'<span class="required-star">★</span>':''}<span class="tip-dot">i</span></span></th>`}).join('')+'</tr>';
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
 document.querySelectorAll('.field-tip').forEach(el=>{
  el.onmouseenter=e=>{const title=el.dataset.tipTitle,desc=el.dataset.tipDesc,example=el.dataset.tipExample;tip.innerHTML=`<b>${escapeHtml(title)}</b><div>${escapeHtml(desc)}</div>${example?`<div class="tip-example">ค่าที่แนะนำ: ${escapeHtml(example)}</div>`:''}`;tip.classList.add('show');positionTip(e)};
  el.onmousemove=positionTip;el.onmouseleave=()=>tip.classList.remove('show');
 });
 function positionTip(e){const pad=14,w=340;let x=e.clientX+14,y=e.clientY+14;if(x+w>innerWidth-pad)x=e.clientX-w-14;if(y+150>innerHeight-pad)y=e.clientY-150;tip.style.left=Math.max(pad,x)+'px';tip.style.top=Math.max(pad,y)+'px'}
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
 document.getElementById('dictionaryBody').innerHTML=order.map(sec=>{const rows=fieldMeta[sec]||[];return `<div class="dict-section"><h3>${escapeHtml(sec)}</h3><table class="dict-table"><thead><tr><th style="width:50px">ลำดับ</th><th style="width:180px">ชื่อฟิลด์</th><th>ความหมาย</th><th style="width:170px">เงื่อนไข/ตัวอย่าง</th></tr></thead><tbody>${rows.map((m,i)=>`<tr><td>${i+1}</td><td class="${m[3]==='important'?'dict-important':''}">${escapeHtml(m[0])}${m[3]==='important'?' ★':''}</td><td>${escapeHtml(m[1]||'')}</td><td>${escapeHtml(m[2]||'-')}</td></tr>`).join('')}</tbody></table></div>`}).join('');
}
const dictionaryModal=document.getElementById('dictionaryModal');document.getElementById('dictionaryBtn').onclick=()=>{renderDictionary();dictionaryModal.classList.add('show');dictionaryModal.setAttribute('aria-hidden','false')};document.getElementById('dictionaryClose').onclick=()=>{dictionaryModal.classList.remove('show');dictionaryModal.setAttribute('aria-hidden','true')};dictionaryModal.onclick=e=>{if(e.target===dictionaryModal)document.getElementById('dictionaryClose').click()};document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('dictionaryClose').click()});
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
   SSOCAC Reply Knowledge Builder V2.3.2
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
function knowledgeCard(item){
  return `<article class="knowledge-card"><div class="knowledge-card-head"><div><strong>${escapeHtml(item.ErrorCode||'-')}</strong><span>${escapeHtml(item.Module||'-')}</span></div><span class="db-badge ok">${item.Active===false?'ปิดใช้งาน':'ใช้งาน'}</span></div><h3>${escapeHtml(item.Description||'ยังไม่มีคำอธิบาย')}</h3><div class="knowledge-grid"><div><b>สาเหตุ/ข้อสังเกต</b><p>${escapeHtml(item.Cause||'-')}</p></div><div><b>แนวทางแก้</b><p>${escapeHtml(item.Solution||'-')}</p></div><div><b>ไฟล์ที่เกี่ยวข้อง</b><p>${escapeHtml(item.RelatedFile||'-')}</p></div><div><b>ฟิลด์ที่เกี่ยวข้อง</b><p>${escapeHtml(item.RelatedField||'-')}</p></div></div>${item.Tips?`<div class="knowledge-tips"><b>Tips:</b> ${escapeHtml(item.Tips)}</div>`:''}<div class="meta">อัปเดต ${escapeHtml(item.UpdatedAt||'-')} โดย ${escapeHtml(item.UpdatedBy||'-')}</div></article>`;
}
async function loadKnowledge(query='',module='ALL'){
  const box=document.getElementById('knowledgeResults'),status=document.getElementById('knowledgeStatus');
  if(!box)return;
  box.innerHTML='<div class="knowledge-empty">กำลังโหลดข้อมูล...</div>';
  try{
    const data=await apiRequest('searchKnowledge',{query,module,limit:300});
    knowledgeCache=data.items||[];
    status.textContent=`เชื่อมต่อฐานข้อมูลแล้ว · พบ ${knowledgeCache.length} รายการ`;
    box.innerHTML=knowledgeCache.length?knowledgeCache.map(knowledgeCard).join(''):'<div class="knowledge-empty">ไม่พบข้อมูลที่ค้นหา</div>';
  }catch(err){
    status.textContent=err.message;
    box.innerHTML=`<div class="knowledge-empty error">${escapeHtml(err.message)}</div>`;
  }
}
function runKnowledgeSearch(){loadKnowledge(document.getElementById('knowledgeSearchInput').value.trim(),document.getElementById('knowledgeModuleFilter').value);}
document.getElementById('knowledgeSearchBtn')?.addEventListener('click',runKnowledgeSearch);
document.getElementById('knowledgeReloadBtn')?.addEventListener('click',()=>loadKnowledge('','ALL'));
document.getElementById('knowledgeSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')runKnowledgeSearch();});
document.getElementById('saveKnowledgeBtn')?.addEventListener('click',openSaveKnowledgeModal);
document.getElementById('saveKnowledgeConfirm')?.addEventListener('click',saveReplyKnowledge);
document.getElementById('saveKnowledgeCancel')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeClose')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeModal')?.addEventListener('click',e=>{if(e.target.id==='saveKnowledgeModal')closeSaveKnowledgeModal();});
document.getElementById('saveWritePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')saveReplyKnowledge();});

document.getElementById('analyzeReplyBtn')?.addEventListener('click',analyzeSSOCACReply);
document.getElementById('exportKnowledgeBtn')?.addEventListener('click',exportReplyKnowledgeCSV);
