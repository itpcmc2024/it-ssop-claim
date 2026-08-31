/*
======================================================
PCMC-SSO Toolkit Professional Edition V4.5.6
Copyright © 2026 PCMC By Kimhan
All Rights Reserved.
======================================================
*/
const state={file:null,fileName:'',originalText:'',doc:null,activeSection:'',originalDoc:null,selected:new Set()};
const authState={token:localStorage.getItem('ssopSessionToken')||'',user:null};
let currentRegistryModule='SSOCAC';
let registryLoadToken=0;
function isViewer(){return String(authState.user?.Role||'').toUpperCase()==='VIEWER';}
function canWrite(){return !isViewer();}
const MODULE_ACCESS_MAP={cancer:'SSOCAC',main:'MAIN',cross:'CROSS',cpap:'STCPAP',sleep:'STSLEEP',editor:'EDITOR',aipncipn:'SSIP',knowledge:'KNOWLEDGE',admin:'ADMIN'};
const KNOWLEDGE_MODULES=['MAIN','CROSS','SSOCAC','STCPAP','STSLEEP','SSIP'];
function canonicalKnowledgeModule(v){const x=String(v||'').trim().toUpperCase();const aliases={CANCER:'SSOCAC','CANCER CARE':'SSOCAC',CPAP:'STCPAP','SLEEP TEST':'STSLEEP','SLEEPTEST':'STSLEEP',AIPN:'SSIP',CIPN:'SSIP','SSIP EDITOR':'SSIP'};return KNOWLEDGE_MODULES.includes(x)?x:(aliases[x]||'SSOCAC');}
function knowledgeModuleLabel(v){return ({MAIN:'Main',CROSS:'Cross',SSOCAC:'Cancer',STCPAP:'CPAP',STSLEEP:'Sleep Test',SSIP:'SSIP'})[canonicalKnowledgeModule(v)]||v;}
function allowedModuleSet(){
 const role=String(authState.user?.Role||'').toUpperCase();
 if(role==='ADMIN')return new Set(['ALL']);
 const raw=String(authState.user?.Allowed_Modules||'').trim().toUpperCase();
 const set=new Set(raw.split(/[;,|\s]+/).map(v=>v.trim()).filter(Boolean));
 set.add('EDITOR');
 set.add('SSIP');
 return set;
}
function hasModuleAccess(name){
 const code=MODULE_ACCESS_MAP[String(name||'').toLowerCase()]||String(name||'').toUpperCase();
 if(code==='EDITOR'||code==='SSIP')return true;
 if(code==='ADMIN')return String(authState.user?.Role||'').toUpperCase()==='ADMIN';
 const set=allowedModuleSet();
 return set.has('ALL')||set.has(code);
}
function moduleAccessLabel(name){const labels={cancer:'Cancer Care (SSOCAC)',main:'ประกันสังคม Main',cross:'ประกันสังคมข้ามเขต',cpap:'ประกันสังคม CPAP',sleep:'ประกันสังคม Sleep Test',editor:'SSOP Editor',knowledge:'SSO Knowledge Center',aipncipn:'SSIP Editor',admin:'จัดการระบบ'};return labels[name]||name;}
window.addEventListener('load',()=>{setTimeout(()=>document.getElementById('splashScreen')?.classList.add('hide'),700);initializeAuthentication();setTimeout(()=>{const p=new URLSearchParams(location.search);if(p.get('page')==='knowledge'){showPage('knowledgePage');const module=p.get('module')||'ALL',q=p.get('q')||'';const input=document.getElementById('knowledgeSearchInput');const sel=document.getElementById('knowledgeModuleFilter');if(input)input.value=q;if(sel&&[...sel.options].some(o=>o.value===module))sel.value=module;loadKnowledge(q,module);}},350);});
const aboutModal=document.getElementById('aboutModal');
document.querySelectorAll('[data-open-about]').forEach(btn=>btn.addEventListener('click',()=>{aboutModal.classList.add('show');aboutModal.setAttribute('aria-hidden','false')}));
document.getElementById('aboutClose').addEventListener('click',()=>{aboutModal.classList.remove('show');aboutModal.setAttribute('aria-hidden','true')});
aboutModal.addEventListener('click',e=>{if(e.target===aboutModal){aboutModal.classList.remove('show');aboutModal.setAttribute('aria-hidden','true')}});
function setActiveModuleCard(name){
 const key=String(name||'').toLowerCase();
 if(key)sessionStorage.setItem('ssopActiveModule',key);
 document.querySelectorAll('.module-card[data-module]').forEach(card=>{
   const active=card.dataset.module===key;
   card.classList.toggle('module-active',active);
   const badge=card.querySelector('.module-badge');
   if(!badge)return;
   if(active&&card.classList.contains('ready')){badge.dataset.originalText=badge.dataset.originalText||badge.textContent;badge.textContent='● กำลังใช้งาน';}
   else if(badge.dataset.originalText){badge.textContent=badge.dataset.originalText;}
 });
}
function restoreActiveModuleCard(){setActiveModuleCard(sessionStorage.getItem('ssopActiveModule')||'');}
function showPage(pageId){
 document.getElementById('homePage').classList.add('hidden-page');
 document.querySelectorAll('.module-page').forEach(p=>p.classList.remove('active'));
 document.getElementById(pageId)?.classList.add('active');
 window.scrollTo({top:0,behavior:'smooth'});
}
function goHome(){
 restoreActiveModuleCard();
 document.querySelectorAll('.module-page').forEach(p=>p.classList.remove('active'));
 document.getElementById('homePage')?.classList.remove('hidden-page');
 const cleanUrl=`${window.location.origin}${window.location.pathname}`;
 window.history.replaceState({},'',cleanUrl);
 window.scrollTo({top:0,behavior:'smooth'});
}
function openModule(name){
 if(name==='aipncipn'){showPage('ssipPage');window.SSIPEditor?.activate();return;}
 if(!hasModuleAccess(name)){toast('ไม่มีสิทธิ์',`บัญชีนี้ไม่มีสิทธิ์ใช้งานโมดูล ${moduleAccessLabel(name)}`,'warning',5200);return;}
 setActiveModuleCard(name);
 if(name==='cancer'){openRegistryModule('SSOCAC');return;}
 if(name==='cpap'){openRegistryModule('STCPAP');return;}
 if(name==='sleep'){openRegistryModule('STSLEEP');return;}
 if(name==='knowledge'){showPage('knowledgePage');loadKnowledge('','ALL');return;}
 if(name==='editor'){showPage('cancerPage');return;}
 if(name==='cross'){showPage('cancerPage');const sel=document.getElementById('editorModule');if(sel){sel.value='CROSS';syncEditorModuleUi();}return;}
 if(name==='admin'){if(authState.user?.Role!=='ADMIN'){toast('ไม่มีสิทธิ์','เมนูนี้สำหรับ Admin เท่านั้น','warning');return;}showPage('adminPage');loadAdminPage();return;}
 const names={main:'ประกันสังคม Main',cross:'ประกันสังคมข้ามเขต',cpap:'ประกันสังคม CPAP',sleep:'ประกันสังคม Sleep Test'};
 showDialog('เตรียมพัฒนา',`${names[name]||'โมดูลนี้'} ถูกเตรียมปุ่มและโครงสร้างไว้แล้ว
จะเพิ่ม Parser และกฎตรวจสอบเฉพาะงานในเวอร์ชันถัดไป`,'info');
}
document.querySelectorAll('[data-module]').forEach(b=>b.addEventListener('click',()=>openModule(b.dataset.module)));
document.getElementById('backHomeBtn').onclick=goHome;
document.getElementById('registryBackHomeBtn')?.addEventListener('click',goHome);
document.getElementById('openCancerEditorBtn')?.addEventListener('click',()=>showPage('cancerPage'));
document.getElementById('knowledgeBackHomeBtn').onclick=goHome;
document.getElementById('adminBackHomeBtn')?.addEventListener('click',goHome);
function toast(title,message,type='info',duration=3600){const stack=document.getElementById('toastStack'),el=document.createElement('div');const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};el.className=`toast ${type}`;el.innerHTML=`<div class="toast-icon">${icons[type]||icons.info}</div><div><div class="toast-title">${escapeHtml(title)}</div><div class="toast-msg">${escapeHtml(message)}</div></div>`;stack.appendChild(el);setTimeout(()=>{el.style.opacity='0';el.style.transform='translateY(-8px)';setTimeout(()=>el.remove(),220)},duration)}
function showDialog(title,message,type='info',buttons=[{text:'ตกลง',value:true,className:'primary'}]){return new Promise(resolve=>{const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};document.getElementById('dialogIcon').textContent=icons[type]||icons.info;document.getElementById('dialogTitle').textContent=title;document.getElementById('dialogMessage').textContent=message;const actions=document.getElementById('dialogActions');actions.innerHTML='';buttons.forEach(btn=>{const b=document.createElement('button');b.textContent=btn.text;b.className=btn.className||'soft';b.onclick=()=>{document.getElementById('dialogOverlay').classList.remove('show');resolve(btn.value)};actions.appendChild(b)});document.getElementById('dialogOverlay').classList.add('show')})}

const fieldMeta={
 BILLTRAN:[
  ['Station','หมายเลขเครื่องหรือจุดบริการ'],['AuthCode','รหัสอนุมัติสิทธิหรือรหัสโครงการที่ผู้ใช้ต้องตรวจสอบก่อนส่ง','SSOCAC','important'],['DTTran','วันเวลาที่เกิดธุรกรรม'],['Hcode','รหัสสถานพยาบาล 5 หลัก'],['InvNo','เลขที่ใบแจ้งหนี้ และเป็นคีย์เชื่อมโยงไฟล์อื่น'],['BillNo','เลขที่ใบเสร็จรับเงิน'],['HN','เลขประจำตัวผู้ป่วยของโรงพยาบาล'],['MemberNo','Case Number ของผู้ป่วยที่ได้รับอนุมัติในระบบ SSO Cancer Care','Case Number','important'],['Amount','จำนวนเงินรวมสุทธิ'],['Paid','จำนวนเงินที่ผู้ป่วยจ่ายจริง'],['VerCode','รหัส Protocol/รหัสตรวจสอบที่ผู้ใช้ต้องตรวจสอบให้ตรงตามประเภทการเบิก','เช่น C0113','important'],['Tflag','ประเภทการส่งข้อมูล ต้องเลือกค่าให้ถูกต้องตามรอบและประเภทการส่ง','เช่น A หรือ E ตามระบบต้นทาง','important'],['PID','เลขบัตรประชาชนผู้ป่วย'],['Name','ชื่อผู้รับบริการ'],['Hmain','รหัสสถานพยาบาลหลัก ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],['PayPlan','รหัสแผนการจ่าย/สิทธิ ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],['ClaimAmt','ยอดเงินที่ขอเบิก'],['OtherPay','ยอดชำระจากแหล่งอื่น'],['AdditionalField','ฟิลด์เพิ่มเติมตามรุ่นของไฟล์ต้นฉบับ']
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
  ['Class','ประเภทข้อมูลบริการ'],['SvID','รหัสอ้างอิงบริการ'],['Sequence','ลำดับวินิจฉัย'],['CodeSet','ชุดรหัสวินิจฉัย'],['DiagnosisCode','รหัสวินิจฉัย; สำหรับ Cancer ต้องพบ Z511 อย่างน้อย 1 รายการ','Z511','important'],['VerCode','รหัส Protocol การรักษามะเร็งตามอนุมัติ เช่น C0111','C0111','important']
 ]
};

const crossFieldMeta=(()=>{
 const clone={};Object.entries(fieldMeta).forEach(([sec,rows])=>clone[sec]=rows.map(x=>[...x]));
 const repl=(sec,name,desc,example='',flag='')=>{const row=(clone[sec]||[]).find(x=>String(x[0]).toUpperCase()===String(name).toUpperCase());if(row){row[1]=desc;row[2]=example;if(flag)row[3]=flag;}};
 repl('BILLTRAN','AuthCode','รหัสอนุมัติสิทธิ/โครงการตามธุรกรรม Cross ตรวจตามข้อมูลต้นทางและเงื่อนไขของกองทุน ไม่บังคับ SSOCAC','ตามข้อมูลจริง','');
 repl('BILLTRAN','MemberNo','เลขสมาชิก/ข้อมูลอ้างอิงตามชุดส่ง Cross ไม่ใช่ Case Number ของ Cancer','ตามข้อมูลต้นทาง','');
 repl('BILLTRAN','VerCode','รหัสตรวจสอบ/เวอร์ชันตามธุรกรรม Cross ไม่ใช่ Protocol Cancer','ตามข้อมูลต้นทาง','');
 repl('BillItems','ClaimCat','ประเภทบัญชีการเบิกของรายการ ตรวจตามหลักเกณฑ์ของรายการ ไม่บังคับ OPR','ตามรายการ','');
 repl('DispensedItems','ClaimCat','ประเภทบัญชีการเบิกของยา/เวชภัณฑ์ ตรวจตามหลักเกณฑ์ของรายการ ไม่บังคับ OPR','ตามรายการ','');
 repl('OPServices','PrdSeCode','รหัสโครงการ/การให้บริการตามข้อมูล Cross ไม่บังคับ SSOCAC','ตามข้อมูลจริง','');
 // โครงสร้าง SSOP 0.93 สำหรับ Main/Cross ตามแผนผัง สกส.
 clone.BILLTRAN[17][0]='OtherPayPlan'; clone.BILLTRAN[17][1]='รหัส/แผนผู้จ่ายอื่น';
 clone.BILLTRAN[18][0]='OtherPay'; clone.BILLTRAN[18][1]='ยอดชำระจากแหล่งอื่น';
 clone.OPServices[8][0]='TypeIn'; clone.OPServices[8][1]='ประเภทการเข้ารับบริการ';
 clone.OPServices[9][0]='TypeOut'; clone.OPServices[9][1]='ประเภทการสิ้นสุด/ออกจากบริการ';
 clone.OPServices[10][0]='DTAppoint'; clone.OPServices[10][1]='วันนัดครั้งต่อไป ใช้ตรวจ S14';
 clone.OPServices[11][0]='SvPID'; clone.OPServices[11][1]='เลขใบประกอบวิชาชีพผู้ให้บริการ';
 clone.OPServices[12][0]='Clinic'; clone.OPServices[12][1]='รหัสคลินิก';
 clone.OPDx[2][0]='SL'; clone.OPDx[2][1]='ลำดับการวินิจฉัย';
 clone.OPDx[4][0]='Code'; clone.OPDx[4][1]='รหัสวินิจฉัยตาม CodeSet ใช้ตรวจ S18';
 clone.OPDx[5][0]='Desc'; clone.OPDx[5][1]='คำอธิบายการวินิจฉัย';
 const set=(sec,name,desc,example='',flag='')=>{const row=(clone[sec]||[]).find(x=>String(x[0]).toUpperCase()===String(name).toUpperCase());if(row){row[1]=desc;if(example!==undefined)row[2]=example;if(flag)row[3]=flag;}};
 set('BILLTRAN','DTTran','วันเวลาที่เกิดธุรกรรม ใช้ตรวจสิทธิ ณ วันรักษา และเทียบกับ BillItems.SvDate','YYYY-MM-DD HH:mm:ss','important');
 set('BILLTRAN','Hcode','รหัสสถานพยาบาลผู้ส่งข้อมูล ต้องตรงกับ ProviderID/Hcode ในแฟ้มที่เชื่อมด้วย InvNo','รหัสสถานพยาบาล','important');
 set('BILLTRAN','InvNo','Primary key ของธุรกรรม ใช้เชื่อม BillItems, Dispensing และ OPServices และต้องไม่ซ้ำในชุดเดียวกัน','ต้องไม่ซ้ำ','important');
 set('BILLTRAN','HN','HN หลักของ InvNo ต้องตรงกับ Dispensing.HN และ OPServices.HN','ใช้ตรวจ S32','important');
 set('BILLTRAN','PID','PID หลักของ InvNo ต้องตรงกับ Dispensing.PID และ OPServices.PID','ใช้ตรวจ S33','important');
 set('BILLTRAN','Hmain','รหัสสถานพยาบาลหลักของผู้ประกันตน ณ วันรักษา ห้ามว่าง; การยืนยัน C07 เต็มรูปแบบต้องเทียบฐานสิทธิ ณ DTTran','5 หลัก','important');
 set('BILLTRAN','PayPlan','รหัสสิทธิ/แผนการจ่าย ห้ามว่าง และควรตรวจเทียบ master สิทธิล่าสุด','ต้องมีค่า','important');
 set('BILLTRAN','Amount','ยอดค่ารักษารวมของ InvNo ต้องเท่ากับผลรวม BillItems.ChargeAmt','ใช้ตรวจ T33','important');
 set('BILLTRAN','ClaimAmt','ยอดขอเบิกรวมของ InvNo ต้องเท่ากับผลรวม BillItems.ClaimAmount','ใช้ตรวจ T45','important');
 set('BillItems','SvDate','วันที่บริการของรายการ ต้องสัมพันธ์กับ BILLTRAN.DTTran ของ InvNo เดียวกัน','ใช้ตรวจ T42','important');
 set('BillItems','Quantity','จำนวนรายการ ต้องมากกว่า 0','ใช้ตรวจ T55','important');
 set('BillItems','ClaimUP','ราคาเบิกได้ต่อหน่วย ใช้คำนวณ ClaimAmount = ClaimUP × Quantity','ใช้ตรวจ T44','important');
 set('BillItems','ClaimAmount','ยอดขอเบิกรายการ ต้องเท่ากับ ClaimUP × Quantity และรวมกันต้องเท่ากับ BILLTRAN.ClaimAmt','ใช้ตรวจ T44/T45','important');
 set('BillItems','SvRefID','รหัสอ้างอิงบริการ โดยเฉพาะหมวด 3/5 ต้องสัมพันธ์กับ OPServices.SvID','ใช้ตรวจ T15','important');
 set('Dispensing','ProviderID','รหัสสถานพยาบาล ต้องตรงกับ BILLTRAN.Hcode ใน InvNo เดียวกัน','ใช้ตรวจ C08','important');
 set('Dispensing','HN','HN ต้องตรงกับ BILLTRAN.HN ใน InvNo เดียวกัน','ใช้ตรวจ S32','important');
 set('Dispensing','PID','PID ต้องตรงกับ BILLTRAN.PID ใน InvNo เดียวกัน','ใช้ตรวจ S33','important');
 set('Dispensing','ChargeAmt','ยอดรวมราคาขาย ต้องสัมพันธ์กับผลรวม DispensedItems.ChargeAmt ตาม DispID','ใช้ตรวจ R04','important');
 set('Dispensing','ClaimAmt','ยอดรวมขอเบิกยา ต้องสัมพันธ์กับ BillItems หมวดยาและผลรวม DispensedItems.ReimbAmt','ใช้ตรวจ R04/R33','important');
 set('DispensedItems','HospDrgID','รหัสยาของโรงพยาบาล ใช้เชื่อม Drugcatalog สำหรับตรวจช่วงราคาและ TMT','ใช้ตรวจ W04/W05/W07','important');
 set('DispensedItems','DrgID','รหัสยาอ้างอิงมาตรฐาน เช่น TMT ต้องตรงกับ Drugcatalog ของ HospDrgID','ใช้ตรวจ W07','important');
 set('DispensedItems','Quantity','จำนวนยาที่จ่าย ต้องมากกว่า 0','ใช้ตรวจ R60','important');
 set('OPServices','Hcode','รหัสสถานพยาบาล ต้องตรงกับ BILLTRAN.Hcode ใน InvNo เดียวกัน','ใช้ตรวจ C08','important');
 set('OPServices','HN','HN ต้องตรงกับ BILLTRAN.HN','ใช้ตรวจ S32','important');
 set('OPServices','PID','PID ต้องตรงกับ BILLTRAN.PID','ใช้ตรวจ S33','important');
 set('OPServices','DateField','DTAppoint/วันที่ตามโครงสร้าง ต้องเป็นรูปแบบถูกต้องและไม่ขัดกับช่วงบริการ','ใช้ตรวจ S14','important');
 set('OPServices','CodeSet','ชุดรหัสของหัตถการ/บริการ ต้องสัมพันธ์กับ STDCode/LCCode','ใช้ตรวจ S19/S41','important');
 set('OPServices','STDCode','รหัสมาตรฐานบริการ ต้องสัมพันธ์กับ CodeSet และชนิดบริการ','ใช้ตรวจ S19/S41','important');
 set('OPDx','CodeSet','ชุดรหัสวินิจฉัยต้องสัมพันธ์กับ DiagnosisCode','ใช้ตรวจ S18','important');
 set('OPDx','DiagnosisCode','รหัสวินิจฉัย ต้องอยู่ใน codeset ที่ยอมรับ; การยืนยันเต็มรูปแบบต้องเทียบฐาน ICD/codeset','ใช้ตรวจ S18','important');
 return clone;
})();

const cpapFieldMeta={
 BILLTRAN:[
  ['Station','หมายเลขลำดับสถานีในงวดส่ง ใช้จับคู่กับทะเบียนและชื่อ ZIP','เช่น 39','important'],
  ['AuthCode','รหัสโครงการสำหรับการเบิก CPAP และ Sleep Test','STCPAP','important'],
  ['DTTran','วันและเวลาที่เกิดธุรกรรมหรือวันที่รับบริการ'],
  ['Hcode','รหัสสถานพยาบาล 5 หลัก'],
  ['InvNo','เลขที่ใบแจ้งหนี้ ใช้เป็นคีย์เชื่อม BILLTRAN, BillItems, BILLDISP และ OPServices'],
  ['BillNo','เลขที่ใบเสร็จรับเงิน ถ้ามี'],
  ['HN','เลขประจำตัวผู้ป่วยของโรงพยาบาล ต้องตรงกับทะเบียน SSOCPAP'],
  ['MemberNo','เลขสมาชิกหรือเลขอ้างอิงตามรูปแบบแฟ้ม ถ้าไม่มีเงื่อนไขเฉพาะสามารถคงค่าเดิม'],
  ['Amount','ยอดค่าบริการรวม ต้องสัมพันธ์กับผลรวม BillItems.ChargeAmt'],
  ['Paid','จำนวนเงินที่ผู้ป่วยชำระจริง'],
  ['VerCode','รหัสอนุมัติหรือรหัสอ้างอิงเพิ่มเติม ถ้ามี'],
  ['Tflag','ประเภทการส่งข้อมูล ดึงจาก Excel/ทะเบียน และยังแก้ไขได้','A หรือ E','important'],
  ['PID','เลขบัตรประชาชน 13 หลัก ต้องตรงกับทะเบียน'],
  ['Name','ชื่อผู้รับบริการ'],
  ['Hmain','รหัสสถานพยาบาลหลัก ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],
  ['PayPlan','รหัสแผนการจ่ายหรือสิทธิ ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],
  ['ClaimAmt','ยอดเงินที่ขอเบิกรวม ต้องสัมพันธ์กับผลรวม BillItems.ClaimAmount'],
  ['OtherPay','ยอดชำระจากแหล่งอื่น'],
  ['AdditionalField','ฟิลด์เพิ่มเติมตามรุ่นของแฟ้มต้นฉบับ']
 ],
 BillItems:[
  ['InvNo','เลขที่ใบแจ้งหนี้ ต้องตรงกับ BILLTRAN.InvNo'],['SvDate','วันที่ให้บริการ'],['BillMuad','หมวดค่ารักษาพยาบาล'],['LCCode','รหัสรายการภายในสถานพยาบาล'],
  ['STDCode','รหัสมาตรฐานรายการ: 3012 เครื่อง CPAP, 3013 หน้ากาก CPAP','3012 / 3013','important'],['Description','ชื่อรายการค่ารักษาพยาบาลหรืออุปกรณ์'],['Quantity','จำนวน'],['UnitPrice','ราคาต่อหน่วย'],['ChargeAmt','ยอดเรียกเก็บจริง'],['ClaimUP','ราคาต่อหน่วยที่ขอเบิก'],['ClaimAmount','ยอดที่ขอเบิกรายการนั้น'],['SvRefID','รหัสอ้างอิงบริการ'],['ClaimCat','หาก STDCode เป็น 3012 หรือ 3013 ต้องระบุ OPF','OPF','important']
 ],
 Dispensing:fieldMeta.Dispensing,
 DispensedItems:fieldMeta.DispensedItems.map(m=>m[0]==='ClaimCat'?['ClaimCat','ประเภทบัญชีการเบิกของรายการยา/เวชภัณฑ์ ให้ตรวจตามหลักเกณฑ์ของรายการนั้น','ตรวจตามรายการ','important']:m),
 OPServices:[
  ['InvNo','เลขที่ใบแจ้งหนี้ ต้องตรงกับ BILLTRAN'],['SvID','รหัสอ้างอิงบริการ'],['Class','สำหรับการเบิกเครื่อง CPAP ต้องเป็น ED','ED','important'],['Hcode','รหัสสถานพยาบาล'],['HN','HN ต้องตรงกับทะเบียน'],['PID','เลขบัตรประชาชนต้องตรงกับทะเบียน'],['CareAccount','ลำดับหรือบัญชีบริการ'],['TypeServ','ประเภทบริการ'],['Clinic','คลินิก'],['SubClinic','คลินิกย่อย'],['DateField','วันที่ตามโครงสร้างต้นทาง'],['SvPID','เลขใบอนุญาตประกอบวิชาชีพแพทย์ (ว.แพทย์) ต้องมีในเคส CPAP','เช่น ว22858','important'],['ProviderType','ประเภทผู้ให้บริการ'],['BegDT','วันเวลาเริ่มบริการ'],['EndDT','วันเวลาสิ้นสุดบริการ'],['LCCode','รหัสบริการภายใน'],['CodeSet','ชุดรหัส'],['STDCode','รหัสมาตรฐาน'],['ChargeAmt','ยอดค่าใช้จ่าย'],['Completion','สถานะความสมบูรณ์'],['SvTxCode','เลขกำกับเบิก ดึงจากทะเบียน SSOCPAP','เช่น DTAECI','important'],['ClaimCat','หมวดการเบิก']
 ],
 OPDx:[
  ['Class','ต้องเป็น ED และตรงกับ OPServices.Class สำหรับเคส CPAP','ED','important'],['SvID','รหัสอ้างอิงบริการ ต้องพบใน OPServices.SvID'],['Sequence','ลำดับการวินิจฉัย'],['CodeSet','ชุดรหัสวินิจฉัย เช่น IT'],['DiagnosisCode','รหัสวินิจฉัย เช่น G473 สามารถเว้นว่างใน Excel แล้วกรอกหรือแก้ไขภายหลังได้','เช่น G473','important'],['VerCode','รหัสเพิ่มเติมตามโครงสร้างแฟ้ม ถ้ามี']
 ]
};

const sleepFieldMeta={
 BILLTRAN:[
  ['Station','หมายเลขลำดับสถานีในงวดส่ง ใช้จับคู่กับทะเบียนและชื่อ ZIP','เช่น 11','important'],
  ['AuthCode','รหัสโครงการสำหรับการเบิก Sleep Test','STCPAP','important'],
  ['DTTran','วันและเวลาที่เกิดธุรกรรมหรือวันที่รับบริการ'],['Hcode','รหัสสถานพยาบาล 5 หลัก'],['InvNo','เลขที่ใบแจ้งหนี้ ใช้เชื่อมโยงทุกแฟ้ม'],['BillNo','เลขที่ใบเสร็จรับเงิน ถ้ามี'],['HN','เลข HN ต้องตรงกับทะเบียน Sleep Test'],['MemberNo','เลขสมาชิกหรือเลขอ้างอิงตามโครงสร้างแฟ้ม'],['Amount','ยอดค่าบริการรวม ต้องสัมพันธ์กับ BillItems.ChargeAmt'],['Paid','จำนวนเงินที่ผู้ป่วยชำระจริง'],['VerCode','รหัสอนุมัติหรือรหัสอ้างอิงเพิ่มเติม ถ้ามี'],['Tflag','ประเภทการส่งข้อมูล ดึงจาก Excel/ทะเบียน','A หรือ E','important'],['PID','เลขบัตรประชาชน 13 หลัก'],['Name','ชื่อผู้รับบริการ'],['Hmain','รหัสสถานพยาบาลหลัก ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],['PayPlan','รหัสแผนการจ่ายหรือสิทธิ ห้ามเป็นค่าว่าง','ต้องมีค่า','important'],['ClaimAmt','ยอดเงินที่ขอเบิกรวม ต้องสัมพันธ์กับ BillItems.ClaimAmount'],['OtherPay','ยอดชำระจากแหล่งอื่น'],['AdditionalField','ฟิลด์เพิ่มเติมตามรุ่นของแฟ้มต้นฉบับ']
 ],
 BillItems:[
  ['InvNo','เลขที่ใบแจ้งหนี้ ต้องตรงกับ BILLTRAN.InvNo'],['SvDate','วันที่ให้บริการ'],['BillMuad','หมวดค่ารักษาพยาบาล'],['LCCode','รหัสรายการภายในสถานพยาบาล'],['STDCode','รหัสมาตรฐาน Sleep Test: 51120 ชนิดที่ 1, 51121 ชนิดที่ 2','51120 / 51121','important'],['Description','ชื่อรายการตรวจ Sleep Test'],['Quantity','จำนวน'],['UnitPrice','ราคาต่อหน่วย'],['ChargeAmt','ยอดเรียกเก็บจริง'],['ClaimUP','ราคาต่อหน่วยที่ขอเบิก'],['ClaimAmount','ยอดที่ขอเบิกรายการนั้น'],['SvRefID','รหัสอ้างอิงบริการ'],['ClaimCat','หาก STDCode เป็น 51120 หรือ 51121 ต้องระบุ OPF','OPF','important']
 ],
 Dispensing:fieldMeta.Dispensing,
 DispensedItems:fieldMeta.DispensedItems.map(m=>m[0]==='ClaimCat'?['ClaimCat','ประเภทบัญชีการเบิกของยา/เวชภัณฑ์ ให้ตรวจตามรายการ','ตรวจตามรายการ','important']:m),
 OPServices:[
  ['InvNo','เลขที่ใบแจ้งหนี้ ต้องตรงกับ BILLTRAN'],['SvID','รหัสอ้างอิงบริการ'],['Class','ประเภทบริการ Sleep Test ต้องตรงกับ OPDx.Class; ตัวอย่างแฟ้มจริงใช้ EC','EC','important'],['Hcode','รหัสสถานพยาบาล'],['HN','HN ต้องตรงกับทะเบียน'],['PID','เลขบัตรประชาชนต้องตรงกับทะเบียน'],['CareAccount','ลำดับหรือบัญชีบริการ'],['TypeServ','ประเภทบริการ'],['Clinic','คลินิก'],['SubClinic','คลินิกย่อย'],['DateField','วันที่ตามโครงสร้างต้นทาง'],['SvPID','เลขผู้ให้บริการตามแฟ้ม ถ้ามี'],['ProviderType','ประเภทผู้ให้บริการ'],['BegDT','วันเวลาเริ่มบริการ'],['EndDT','วันเวลาสิ้นสุดบริการ'],['LCCode','รหัสบริการภายใน'],['CodeSet','ชุดรหัส'],['STDCode','รหัสมาตรฐาน'],['ChargeAmt','ยอดค่าใช้จ่าย'],['Completion','สถานะความสมบูรณ์'],['SvTxCode','เลขกำกับเบิก ดึงจากทะเบียน Sleep Test','เช่น B3YPX6','important'],['ClaimCat','หมวดการเบิก']
 ],
 OPDx:[
  ['Class','ต้องตรงกับ OPServices.Class','เช่น EC','important'],['SvID','รหัสอ้างอิงบริการ ต้องพบใน OPServices.SvID'],['Sequence','ลำดับการวินิจฉัย'],['CodeSet','ชุดรหัสวินิจฉัย เช่น IT'],['DiagnosisCode','รหัสวินิจฉัย ดึงจาก PDx.ICD10 และแก้ไขได้','เช่น G473','important'],['VerCode','รหัสเพิ่มเติมตามโครงสร้างแฟ้ม ถ้ามี']
 ]
};
function selectedGuideModule(){const editor=document.getElementById('cancerPage')?.classList.contains('active');return editor?String(document.getElementById('editorModule')?.value||'SSOCAC').toUpperCase():String(currentRegistryModule||'SSOCAC').toUpperCase();}
function activeGuideMeta(){const m=selectedGuideModule();return m==='CROSS'?crossFieldMeta:m==='STCPAP'?cpapFieldMeta:m==='STSLEEP'?sleepFieldMeta:fieldMeta;}

const CPAP_ANNOUNCEMENT_URL='assets/docs/CHI67-A03.pdf';
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
async function loadUniversalEditorInput(file){
 if(!file)return;
 if(/\.zip$/i.test(file.name)){
  // Use the proven Unified ZIP Editor so every file inside the ZIP remains editable,
  // can be saved back, recalculated MD5 and exported under the original ZIP name.
  openZipReader('', activeEditorRuleModule());
  await handleZipFile(file);
  toast('เปิด ZIP ใน Unified Editor แล้ว','เลือกไฟล์ด้านซ้ายเพื่อแก้ไข เพิ่ม/ลบแถว บันทึก MD5 และสร้าง ZIP กลับชื่อเดิม','success',6500);
  return;
 }
 await loadFile(file);
}
fileInput.addEventListener('change',e=>e.target.files[0]&&loadUniversalEditorInput(e.target.files[0]));
['dragenter','dragover'].forEach(x=>dropZone.addEventListener(x,e=>{e.preventDefault();dropZone.style.background='#eefaf6'}));
['dragleave','drop'].forEach(x=>dropZone.addEventListener(x,e=>{e.preventDefault();dropZone.style.background=''}));
dropZone.addEventListener('drop',e=>e.dataTransfer.files[0]&&loadUniversalEditorInput(e.dataTransfer.files[0]));

function isRecognizedSsopText(text){
 const s=String(text||'');
 const hasClaim=/<ClaimRec\b/i.test(s);
 const recognized=/<(BILLTRAN|BillItems|Dispensing|DispensedItems|OPServices|OPDx)>[\s\S]*?<\/\1>/i.test(s);
 const looksXmlIpd=/<\/?(AIPN|CIPN)\b/i.test(s);
 return hasClaim&&recognized&&!looksXmlIpd;
}
async function loadFile(file){
 try{
  if(!/\.(txt|bil|rep)$/i.test(file?.name||''))throw new Error('SSOP Editor รองรับเฉพาะแฟ้มข้อความ SSOP (.txt/.BIL/.REP) หรือ ZIP SSOP');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const text=new TextDecoder('windows-874').decode(bytes).replace(/\u0000/g,'');
  if(!isRecognizedSsopText(text))throw new Error('ไฟล์นี้ไม่เข้าโครงสร้าง SSOP (BILLTRAN / BillItems / BILLDISP / OPServices) กรุณาเลือกไฟล์ที่ถูกต้อง');
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
function renderAll(){renderHeader();renderTabs();renderSectionNote();renderTable();validateEditorModuleRules();renderHealthDashboard([]);}
function renderHeader(){const g=document.getElementById('headerGrid');g.innerHTML='';Object.entries(state.doc.header).forEach(([k,v])=>{const d=document.createElement('div');d.className='field';d.innerHTML=`<label>${k}</label><input data-header="${k}" value="${escapeAttr(v)}">`;g.appendChild(d)});g.querySelectorAll('input').forEach(i=>i.addEventListener('input',e=>{state.doc.header[e.target.dataset.header]=e.target.value;markChanged();updateChecksum()}));}
function renderTabs(){const t=document.getElementById('tabs');t.innerHTML='';Object.keys(state.doc.sections).forEach(s=>{const b=document.createElement('button');b.className='tab '+(s===state.activeSection?'active':'');b.textContent=`${s} (${state.doc.sections[s].length})`;b.onclick=()=>{state.activeSection=s;state.selected.clear();renderTabs();renderSectionNote();renderTable()};t.appendChild(b)});}
function renderSectionNote(){
 const info=sectionInfo[state.activeSection]||{title:state.activeSection,desc:'',format:'',important:[],importantCols:[]};
 const moduleLabel=editorRuleProfileLabel(activeEditorRuleModule());
 const important=info.important.length?`<div><b>จุดเน้นสำคัญ (${escapeHtml(moduleLabel)}):</b> ${info.important.map(x=>`<span class="important-text">${escapeHtml(x)}</span>`).join(' • ')}</div>`:'';
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
function cp874Bytes(str){const dec=new TextDecoder('windows-874');const map=new Map();for(let i=0;i<256;i++){const ch=dec.decode(Uint8Array.of(i));if(ch&&ch!=='�')map.set(ch,i)}const out=[];for(const ch of str){if(map.has(ch))out.push(map.get(ch));else if(ch.charCodeAt(0)<128)out.push(ch.charCodeAt(0));else out.push(63)}return new Uint8Array(out)}
function updateChecksum(){if(!state.doc)return;const bytes=cp874Bytes(buildText());document.getElementById('checksumPreview').value=md5(bytes);}
function downloadFile(){const base=buildText(),sum=md5(cp874Bytes(base)),full=base+`<?EndNote Checksum="${sum}"?>`+state.doc.lineEnding,blob=new Blob([cp874Bytes(full)],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=document.getElementById('outputName').value||state.fileName;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);setStatus('ดาวน์โหลดไฟล์เรียบร้อย','ok');toast('ดาวน์โหลดสำเร็จ',a.download+' ถูกสร้างเรียบร้อย','success')}
function validate(){const problems=[];const ruleProblems=validateEditorModuleRules();Object.entries(state.doc.sections).forEach(([sec,rows])=>{if(!rows.length)problems.push(`${sec}: ไม่มีข้อมูล`);const n=rows[0]?.length||0;rows.forEach((r,i)=>{if(r.length!==n)problems.push(`${sec} แถว ${i+1}: จำนวนคอลัมน์ ${r.length} ไม่เท่ากับแถวแรก ${n}`)})});problems.push(...ruleProblems);renderHealthDashboard(problems);if(problems.length){setStatus(`พบ ${problems.length} จุด กรุณาตรวจสอบ`,'warn');showDialog('พบข้อมูลที่ต้องตรวจสอบ',problems.slice(0,30).map((x,i)=>`${i+1}. ${x}`).join('\n'),'warning')}else{setStatus('โครงสร้างข้อมูลปกติ พร้อมดาวน์โหลด','ok');showDialog('ตรวจสอบเรียบร้อย','ไม่พบข้อผิดพลาดตามกฎที่ตั้งไว้\nChecksum จะถูกสร้างใหม่อัตโนมัติ','success')}}
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
function activeEditorRuleModule(){return String(document.getElementById('editorModule')?.value||'SSOCAC').trim().toUpperCase();}
function editorRuleProfileLabel(module){return ({MAIN:'Main',CROSS:'Cross',SSOCAC:'Cancer Care',STCPAP:'CPAP',STSLEEP:'Sleep Test'})[String(module||'').toUpperCase()]||'SSOP';}
function editorMetaForModule(module){return module==='CROSS'?crossFieldMeta:module==='STCPAP'?cpapFieldMeta:module==='STSLEEP'?sleepFieldMeta:fieldMeta;}
function fieldIndexFor_(meta,section,name){return (meta?.[section]||[]).findIndex(x=>String(x?.[0]||'').toUpperCase()===String(name||'').toUpperCase());}
function cell_(row,idx){return idx>=0?String(row?.[idx]??'').trim():'';}
function num_(v){const n=Number(String(v??'').replace(/,/g,'').trim());return Number.isFinite(n)?n:0;}
function validateEditorModuleRules(){
 const module=activeEditorRuleModule(),meta=editorMetaForModule(module),p=[],results=[];
 const add=(ok,title,detail)=>results.push({ok,title,detail});
 const bill=state.doc?.sections?.BILLTRAN||[],bi=state.doc?.sections?.BillItems||[],ops=state.doc?.sections?.OPServices||[],opdx=state.doc?.sections?.OPDx||[];
 const bAuth=fieldIndexFor_(meta,'BILLTRAN','AuthCode'),bHmain=fieldIndexFor_(meta,'BILLTRAN','Hmain'),bPay=fieldIndexFor_(meta,'BILLTRAN','PayPlan'),bMember=fieldIndexFor_(meta,'BILLTRAN','MemberNo');
 const biStd=fieldIndexFor_(meta,'BillItems','STDCode'),biCat=fieldIndexFor_(meta,'BillItems','ClaimCat'),biCharge=fieldIndexFor_(meta,'BillItems','ChargeAmt');
 const opsClass=fieldIndexFor_(meta,'OPServices','Class'),opsSvPid=fieldIndexFor_(meta,'OPServices','SvPID'),opsSvTx=fieldIndexFor_(meta,'OPServices','SvTxCode');
 const dxClass=fieldIndexFor_(meta,'OPDx','Class'),dxCode=fieldIndexFor_(meta,'OPDx','DiagnosisCode');
 const requiredNonBlank=(rows,idx,title)=>{if(idx<0||!rows.length)return;const missing=rows.filter(r=>!cell_(r,idx)).length;add(!missing,title,missing?`ว่าง ${missing} แถว`:'พบข้อมูลครบ');if(missing)p.push(`${title}: ว่าง ${missing} แถว`)};
 if(module==='MAIN'||module==='CROSS'){
   add(true,'Rule Profile',`${editorRuleProfileLabel(module)} — ตรวจโครงสร้าง SSOP พื้นฐาน จำนวนคอลัมน์ และความสมบูรณ์ของ Section โดยไม่ใช้กฎ Cancer/CPAP/Sleep Test`);
   if(module==='CROSS'){requiredNonBlank(bill,bHmain,'BILLTRAN · Hmain');requiredNonBlank(bill,bPay,'BILLTRAN · PayPlan');}
 } else {
   const expectedAuth=module==='SSOCAC'?'SSOCAC':'STCPAP';
   if(bAuth>=0&&bill.length){const bad=bill.filter(r=>cell_(r,bAuth).toUpperCase()!==expectedAuth).length;add(!bad,'BILLTRAN · AuthCode',bad?`พบ ${bad} แถวที่ไม่ใช่ ${expectedAuth}`:`ถูกต้อง ${expectedAuth} ทุกแถว`);if(bad)p.push(`BILLTRAN: AuthCode ต้องเป็น ${expectedAuth} (${bad} แถว)`)}
   requiredNonBlank(bill,bHmain,'BILLTRAN · Hmain');
   requiredNonBlank(bill,bPay,'BILLTRAN · PayPlan');
 }
 if(module==='SSOCAC'){
   requiredNonBlank(bill,bMember,'BILLTRAN · MemberNo');
   if(dxCode>=0&&opdx.length){const found=opdx.some(r=>cell_(r,dxCode).toUpperCase()==='Z511');add(found,'OPDx · DiagnosisCode',found?'พบ Z511 อย่างน้อย 1 รายการ':'ไม่พบ Z511');if(!found)p.push('OPDx: Cancer Care ต้องมี DiagnosisCode Z511 อย่างน้อย 1 รายการ')}
   add(true,'BillItems · ClaimCat','ไม่บังคับ OPR ทุกแถว — ให้กำหนด OPR เฉพาะรายการที่เข้าเงื่อนไขมะเร็งจริง');
 }
 if(module==='STCPAP'){
   const targets={'3012':20000,'3013':4000};let catBad=0,rateBad=0,found=0;
   bi.forEach(r=>{const code=cell_(r,biStd);if(!(code in targets))return;found++;if(cell_(r,biCat).toUpperCase()!=='OPF')catBad++;if(biCharge>=0&&num_(cell_(r,biCharge))>targets[code])rateBad++;});
   add(!catBad,'BillItems · ClaimCat',catBad?`3012/3013 ที่ ClaimCat ไม่ใช่ OPF ${catBad} แถว`:`รายการ 3012/3013 ใช้ OPF ถูกต้อง${found?'':' (ยังไม่พบรายการ)'}`);if(catBad)p.push(`BillItems: 3012/3013 ต้องเป็น OPF (${catBad} แถว)`);
   add(!rateBad,'BillItems · อัตรา CPAP',rateBad?`พบราคาสูงกว่าเพดาน 3012=20,000 หรือ 3013=4,000 จำนวน ${rateBad} แถว`:'ไม่พบรายการเกินเพดาน');if(rateBad)p.push(`BillItems: พบราคา CPAP/หน้ากากเกินเพดาน ${rateBad} แถว`);
   requiredNonBlank(ops,opsSvTx,'OPServices · SvTxCode');requiredNonBlank(ops,opsSvPid,'OPServices · SvPID');
   if(opsClass>=0&&ops.length){const bad=ops.filter(r=>cell_(r,opsClass).toUpperCase()!=='ED').length;add(!bad,'OPServices · Class',bad?`ไม่ใช่ ED ${bad} แถว`:'เป็น ED ทุกแถว');if(bad)p.push(`OPServices: Class ต้องเป็น ED (${bad} แถว)`)}
   if(dxClass>=0&&opdx.length){const bad=opdx.filter(r=>cell_(r,dxClass).toUpperCase()!=='ED').length;add(!bad,'OPDx · Class',bad?`ไม่ใช่ ED ${bad} แถว`:'เป็น ED ทุกแถว');if(bad)p.push(`OPDx: Class ต้องเป็น ED (${bad} แถว)`)}
 }
 if(module==='STSLEEP'){
   const targets={'51120':7000,'51121':6000};let catBad=0,rateBad=0,found=0;
   bi.forEach(r=>{const code=cell_(r,biStd);if(!(code in targets))return;found++;if(cell_(r,biCat).toUpperCase()!=='OPF')catBad++;if(biCharge>=0&&num_(cell_(r,biCharge))>targets[code])rateBad++;});
   add(!catBad,'BillItems · ClaimCat',catBad?`51120/51121 ที่ ClaimCat ไม่ใช่ OPF ${catBad} แถว`:`รายการ 51120/51121 ใช้ OPF ถูกต้อง${found?'':' (ยังไม่พบรายการ)'}`);if(catBad)p.push(`BillItems: 51120/51121 ต้องเป็น OPF (${catBad} แถว)`);
   add(!rateBad,'BillItems · อัตรา Sleep Test',rateBad?`พบราคาสูงกว่าเพดาน 51120=7,000 หรือ 51121=6,000 จำนวน ${rateBad} แถว`:'ไม่พบรายการเกินเพดาน');if(rateBad)p.push(`BillItems: พบราคา Sleep Test เกินเพดาน ${rateBad} แถว`);
   requiredNonBlank(ops,opsSvTx,'OPServices · SvTxCode');
   if(opsClass>=0&&dxClass>=0&&ops.length&&opdx.length){const opClasses=new Set(ops.map(r=>cell_(r,opsClass).toUpperCase()).filter(Boolean));const bad=opdx.filter(r=>{const c=cell_(r,dxClass).toUpperCase();return c&&!opClasses.has(c)}).length;add(!bad,'OPDx ↔ OPServices · Class',bad?`Class ไม่สัมพันธ์กัน ${bad} แถว`:'Class สัมพันธ์กัน');if(bad)p.push(`Sleep Test: OPDx.Class ไม่ตรงกับ OPServices.Class ${bad} แถว`)}
 }
 const box=document.getElementById('ruleResults');if(box)box.innerHTML=`<div class="validation-profile"><b>Rule Profile: ${escapeHtml(editorRuleProfileLabel(module))}</b></div>`+results.map(x=>`<div class="validation-item ${x.ok?'good':'bad'}"><b>${x.ok?'✓':'✕'} ${escapeHtml(x.title)}</b> — ${escapeHtml(x.detail)}</div>`).join('');
 return p;
}
function renderDictionary(){
 const order=['BILLTRAN','BillItems','Dispensing','DispensedItems','OPServices','OPDx'];
 const metaSource=activeGuideMeta();
 document.getElementById('dictionaryBody').innerHTML=order.map(sec=>{const rows=metaSource[sec]||[];return `<div class="dict-section"><h3>${escapeHtml(sec)}</h3><table class="dict-table"><thead><tr><th style="width:50px">ลำดับ</th><th style="width:180px">ชื่อฟิลด์</th><th>ความหมาย</th><th style="width:250px">เงื่อนไข/ตัวอย่าง</th></tr></thead><tbody>${rows.map((m,i)=>`<tr><td>${i+1}</td><td class="${m[3]==='important'?'dict-important':''}">${escapeHtml(m[0])}${m[3]==='important'?' ★':''}</td><td>${escapeHtml(m[1]||'')}</td><td>${escapeHtml(String(m[2]||'-'))}</td></tr>`).join('')}</tbody></table></div>`}).join('');
}
const dictionaryModal=document.getElementById('dictionaryModal');const openDictionary=()=>{const gm=selectedGuideModule(),cross=gm==='CROSS',cpap=gm==='STCPAP',sleep=gm==='STSLEEP';const title=dictionaryModal.querySelector('.modal-head strong');const meta=dictionaryModal.querySelector('.modal-head .meta');if(title)title.textContent=cross?'📖 คู่มือฟิลด์ SSOP Cross':cpap?'📖 คู่มือฟิลด์ CPAP':sleep?'📖 คู่มือฟิลด์ Sleep Test':gm==='SSOCAC'?'📖 คู่มือฟิลด์ Cancer':'📖 คู่มือฟิลด์ SSOP';if(meta)meta.textContent=cross?'อ้างอิงโครงสร้าง SSOP และแนวทาง Error ของ สกส. พร้อมจุดเชื่อม InvNo / HN / PID / SvID / DispID สำหรับ Cross Preflight':cpap?'คำอธิบายฟิลด์ เงื่อนไขสำคัญ และตัวอย่างจริงสำหรับการเบิกเครื่อง CPAP/หน้ากาก':sleep?'คำอธิบายฟิลด์ เงื่อนไขสำคัญ และตัวอย่างจริงสำหรับ Sleep Test ชนิดที่ 1 และ 2':gm==='SSOCAC'?'คำอธิบายฟิลด์ เงื่อนไข และตัวอย่างสำหรับ Cancer':'คำอธิบายฟิลด์ SSOP พื้นฐานสำหรับ Main';dictionaryModal.classList.add('show');dictionaryModal.setAttribute('aria-hidden','false');renderDictionary();};document.getElementById('dictionaryBtn').onclick=openDictionary;
const replyModuleSelect=document.getElementById('replyModule');
const editorModuleSelect=document.getElementById('editorModule');
const EDITOR_RULE_SUMMARIES={
 MAIN:{title:'กฎตรวจสอบ SSOP — Main',items:[['โครงสร้าง SSOP','ตรวจ Section และจำนวนคอลัมน์ให้สอดคล้องกัน'],['ความสัมพันธ์แฟ้ม','ตรวจ InvNo / PID / HN และโครงสร้างอ้างอิงพื้นฐาน โดยไม่ใช้กฎเฉพาะโครงการ'],['Local Processing','แก้ไขและส่งออกกลับเครื่องผู้ใช้เท่านั้น']]},
 CROSS:{title:'กฎตรวจสอบ SSOP — Cross',items:[['โครงสร้าง SSOP','ตรวจ Section และจำนวนคอลัมน์มาตรฐาน 19/13/18/19/22/6'],['Hmain / PayPlan','ห้ามว่าง และเตือนรายการที่เสี่ยง T06'],['Cross Preflight','สแกน C07/C08, R04/R31/R33/R60, S14/S18/S19/S32/S33/S41, T01/T15/T31/T33/T42/T44/T45/T51/T55'],['Drugcatalog','W04/W05/W07 แสดงเป็นกฎที่ต้องเชื่อมฐานอ้างอิงก่อนยืนยัน'],['Local Processing','ตรวจ กรอง ชี้จุด และแก้ไขใน Browser โดยไม่อัปโหลดข้อมูลผู้ป่วย']]},
 SSOCAC:{title:'กฎตรวจสอบ SSOP — Cancer Care',items:[['BILLTRAN.AuthCode','ต้องเป็น SSOCAC'],['BILLTRAN.Hmain / PayPlan','ต้องมีค่า'],['OPDx.DiagnosisCode','ต้องพบ Z511 อย่างน้อย 1 รายการ'],['ClaimCat = OPR','ตรวจเฉพาะรายการมะเร็งที่เข้าเงื่อนไข ไม่บังคับทุก BillItems']]},
 STCPAP:{title:'กฎตรวจสอบ SSOP — CPAP',items:[['BILLTRAN.AuthCode','ต้องเป็น STCPAP'],['STDCode 3012 / 3013','เฉพาะรายการเป้าหมายต้อง ClaimCat = OPF'],['เพดานราคา','3012 ≤ 20,000 และ 3013 ≤ 4,000'],['OPServices','ตรวจ SvTxCode, SvPID และ Class = ED']]},
 STSLEEP:{title:'กฎตรวจสอบ SSOP — Sleep Test',items:[['BILLTRAN.AuthCode','ต้องเป็น STCPAP'],['STDCode 51120 / 51121','เฉพาะรายการเป้าหมายต้อง ClaimCat = OPF'],['เพดานราคา','51120 ≤ 7,000 และ 51121 ≤ 6,000'],['Class Relation','ตรวจ OPDx.Class ให้สัมพันธ์กับ OPServices.Class']]}
};
function syncEditorModuleUi(){
 const v=String(editorModuleSelect?.value||'SSOCAC').toUpperCase(),profile=EDITOR_RULE_SUMMARIES[v]||EDITOR_RULE_SUMMARIES.SSOCAC;
 const btn=document.getElementById('dictionaryBtn');if(btn){btn.dataset.guideModule=v;const labels={SSOCAC:'Cancer',STCPAP:'CPAP',STSLEEP:'Sleep Test',MAIN:'SSOP Main',CROSS:'SSOP Cross'};btn.textContent='📖 คู่มือฟิลด์ '+(labels[v]||'SSOP');}
 const reply=document.getElementById('replyModule');if(reply){reply.value=v;reply.disabled=true;reply.title='ล็อกตาม Rule Profile ของ SSOP Editor';}const replyLock=document.getElementById('replyModuleLockNote');if(replyLock)replyLock.textContent='🔒 ล็อกตาม '+editorRuleProfileLabel(v);
 const status=document.getElementById('editorProfileStatus');if(status)status.textContent=editorRuleProfileLabel(v);
 const title=document.getElementById('editorRuleTitle');if(title)title.textContent=profile.title;
 const grid=document.getElementById('editorRuleGrid');if(grid)grid.innerHTML=profile.items.map(x=>`<div class="rule-item"><div class="rule-icon">!</div><div><strong>${escapeHtml(x[0])}</strong><small>${escapeHtml(x[1])}</small></div></div>`).join('');
}
editorModuleSelect?.addEventListener('change',()=>{syncEditorModuleUi();if(state.doc){renderSectionNote();renderTable();const problems=validateEditorModuleRules();renderHealthDashboard(problems);setStatus('เปลี่ยน Rule Profile เป็น '+editorRuleProfileLabel(activeEditorRuleModule()),'ok');}});syncEditorModuleUi();document.getElementById('registryDictionaryBtn')?.addEventListener('click',openDictionary);document.getElementById('dictionaryClose').onclick=()=>{dictionaryModal.classList.remove('show');dictionaryModal.setAttribute('aria-hidden','true')};dictionaryModal.onclick=e=>{if(e.target===dictionaryModal)document.getElementById('dictionaryClose').click()};document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('dictionaryClose').click()});
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

async function confirmDialog(title,message,confirmText='ยืนยัน'){
  return await showDialog(title,message,'warning',[
    {text:'ยกเลิก',value:false,className:'soft'},
    {text:confirmText,value:true,className:'danger'}
  ]);
}

/* ======================================================
   SSOCAC Reply Knowledge Builder V2.3.3
   ประมวลผลไฟล์ตอบกลับใน Browser และเก็บเฉพาะ Error Code
====================================================== */
const replyKnowledgeState={fileName:'',items:[],module:'SSOCAC'};
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
function isValidReplyErrorCode(value){
  const code=String(value||'').trim().toUpperCase();
  // Accept only real SSOP CheckCode families. Field names such as ICD9 are excluded.
  return /^(?:CA|CD|CE|BP|R|S|T|W|L)\d{1,4}$/.test(code);
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
      if(m&&isValidReplyErrorCode(m[1]))descriptions.set(m[1].toUpperCase(),m[2].trim());
    }
  }
  const counts=new Map();
  const dataPart=text.split(/คำอธิบายรหัส\s*:\s*CheckCode/i)[0];
  const codeTokens=dataPart.match(/\b[A-Z]{1,4}\d{1,4}\b/g)||[];
  for(const code of codeTokens){
    const c=code.toUpperCase();
    if(isValidReplyErrorCode(c)) counts.set(c,(counts.get(c)||0)+1);
  }
  for(const code of descriptions.keys())if(!counts.has(code))counts.set(code,1);
  return [...counts.entries()].map(([code,count])=>({
    module:canonicalKnowledgeModule(replyKnowledgeState.module||'SSOCAC'),code,count,
    description:descriptions.get(code)||ssocacSeedKnowledge[code]?.description||'ไม่พบคำอธิบายในไฟล์ตอบกลับ',
    cause:ssocacSeedKnowledge[code]?.cause||'',
    solution:ssocacSeedKnowledge[code]?.solution||'',
    dbStatus:'ยังไม่ได้ตรวจฐานข้อมูล', relatedFile:'', relatedField:'', tips:''
  })).sort((a,b)=>a.code.localeCompare(b.code));
}
async function analyzeSSOCACReply(){
  const input=document.getElementById('replyFileInput'),file=input?.files?.[0],module=document.getElementById('replyModule')?.value||'SSOCAC';
  if(!file){toast('ยังไม่ได้เลือกไฟล์','กรุณาเลือกไฟล์ตอบกลับ .ZIP, .BIL หรือ .txt','warning');return}
  try{
    replyKnowledgeState.module=module;replyKnowledgeState.fileName=file.name;
    const merged=new Map();
    const consume=(text)=>parseSSOCACReplyKnowledge(text).forEach(x=>{x.module=module;const old=merged.get(x.code);if(old){old.count+=x.count;if(old.description==='ไม่พบคำอธิบายในไฟล์ตอบกลับ'&&x.description)old.description=x.description}else merged.set(x.code,x)});
    if(/\.zip$/i.test(file.name)){
      if(!window.JSZip)throw new Error('ไม่พบไลบรารี JSZip');const zip=await JSZip.loadAsync(file);let found=0;
      for(const entry of Object.values(zip.files)){if(entry.dir||!/(\.bil|\.txt)$/i.test(entry.name))continue;consume(decodeReplyFile(new Uint8Array(await entry.async('arraybuffer'))));found++;}
      if(!found)throw new Error('ไม่พบไฟล์ .BIL หรือ .txt ภายใน ZIP');
    }else consume(decodeReplyFile(new Uint8Array(await file.arrayBuffer())));
    replyKnowledgeState.items=[...merged.values()].sort((a,b)=>a.code.localeCompare(b.code));renderReplyKnowledge();
    if(replyKnowledgeState.items.length){toast('วิเคราะห์สำเร็จ',`พบ Error Code ${replyKnowledgeState.items.length} รหัส จาก ${module}`,'success');await hydrateReplyKnowledgeFromDatabase();}else toast('ไม่พบ Error Code','ยังไม่พบรูปแบบ CheckCode ที่ระบบรองรับ','warning');
  }catch(err){showDialog('อ่านไฟล์ไม่สำเร็จ',err?.message||String(err),'error')}
}
function renderReplyKnowledge(){
  const items=replyKnowledgeState.items;
  const summary=document.getElementById('replySummary'),wrap=document.getElementById('replyKnowledgeWrap'),body=document.getElementById('replyKnowledgeBody');
  summary.classList.remove('hidden');wrap.classList.toggle('hidden',!items.length);
  const total=items.reduce((s,x)=>s+x.count,0),known=items.filter(x=>x.cause||x.solution).length;
  summary.innerHTML=`<div class="reply-summary-card"><div class="reply-stat"><b>${items.length}</b><span>Error Code ไม่ซ้ำ</span></div><div class="reply-stat"><b>${total}</b><span>จำนวนที่ตรวจพบ</span></div><div class="reply-stat"><b>${known}</b><span>มีแนวทางแก้เริ่มต้น</span></div></div>`;
  body.innerHTML=items.map((x,i)=>{const locked=isViewer()&&x.dbStatus==='มีในฐานข้อมูล';return `<tr class="${locked?'viewer-kb-locked':''}"><td>${escapeHtml(x.code)}<div class="meta">${escapeHtml(x.module||replyKnowledgeState.module||'SSOCAC')}</div></td><td>${escapeHtml(x.description)}</td><td><textarea data-reply-index="${i}" data-field="cause" ${locked?'readonly title="VIEWER แก้ไขข้อมูลเดิมไม่ได้"':''} placeholder="เพิ่มสาเหตุหรือข้อสังเกต...">${escapeHtml(x.cause)}</textarea></td><td><textarea data-reply-index="${i}" data-field="solution" ${locked?'readonly title="VIEWER แก้ไขข้อมูลเดิมไม่ได้"':''} placeholder="เพิ่มแนวทางแก้...">${escapeHtml(x.solution)}</textarea></td><td><input class="knowledge-inline-input" data-reply-index="${i}" data-field="relatedFile" ${locked?'readonly':''} placeholder="เช่น BILLTRAN" value="${escapeHtml(x.relatedFile||'')}"></td><td><input class="knowledge-inline-input" data-reply-index="${i}" data-field="relatedField" ${locked?'readonly':''} placeholder="เช่น VerCode" value="${escapeHtml(x.relatedField||'')}"></td><td>${x.count}</td><td><span class="db-badge ${x.dbStatus==='มีในฐานข้อมูล'?'ok':'pending'}">${escapeHtml(x.dbStatus)}${locked?' · อ่านอย่างเดียว':''}</span></td></tr>`}).join('');
  body.querySelectorAll('textarea, input[data-reply-index]').forEach(el=>el.addEventListener('input',()=>{const i=Number(el.dataset.replyIndex);replyKnowledgeState.items[i][el.dataset.field]=el.value}));
}
function csvCell(v){return `"${String(v??'').replace(/"/g,'""')}"`}
function exportReplyKnowledgeCSV(){
  if(!replyKnowledgeState.items.length){toast('ไม่มีข้อมูล','กรุณาวิเคราะห์ไฟล์ตอบกลับก่อน','warning');return}
  const headers=['Module','ErrorCode','Description','Cause','Solution','Count','SourceFile'];
  const rows=replyKnowledgeState.items.map(x=>[x.module,x.code,x.description,x.cause,x.solution,x.count,replyKnowledgeState.fileName]);
  const csv='\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`${replyKnowledgeState.module||'SSOP'}_Error_Knowledge_${DateEngine.fileStamp()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('ส่งออกแล้ว','ไฟล์ CSV มีเฉพาะ Error Code และองค์ความรู้ ไม่มีข้อมูลผู้ป่วย','success');
}

function getApiUrl(){return (window.SSOP_CONFIG?.apiUrl||'').trim();}
async function apiRequest(action,payload={}){
  const url=getApiUrl();
  if(!url || url.includes('PASTE_')) throw new Error('ยังไม่ได้ตั้งค่า Apps Script Web App URL ใน assets/js/config.js');
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken:authState.token,...payload})});
  if(!response.ok) throw new Error(`API ตอบกลับ ${response.status}`);
  const data=await response.json();
  if(!data.ok){if(String(data.message||'').includes('SESSION_EXPIRED')){clearAuthentication();showLogin('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');}throw new Error(data.message||'เกิดข้อผิดพลาดจากฐานข้อมูล');}
  return data;
}
async function hydrateReplyKnowledgeFromDatabase(){
  try{
    const data=await apiRequest('getByCodes',{module:canonicalKnowledgeModule(replyKnowledgeState.module||'SSOCAC'),codes:replyKnowledgeState.items.map(x=>x.code)});
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
  const updatedBy=authState.user?.Display_Name||document.getElementById('saveUpdatedBy').value.trim();
  const writePin=document.getElementById('saveWritePin').value.trim();
  const sourceItems=isViewer()?replyKnowledgeState.items.filter(x=>x.dbStatus!=='มีในฐานข้อมูล'):replyKnowledgeState.items;
  if(!sourceItems.length){toast('ไม่มีรหัสใหม่','รหัสทั้งหมดมีอยู่ใน Knowledge Base แล้ว VIEWER ไม่สามารถแก้ไขข้อมูลเดิมได้','warning',6000);return;}
  const confirmBtn=document.getElementById('saveKnowledgeConfirm');
  confirmBtn.disabled=true;confirmBtn.textContent='กำลังบันทึก...';
  try{
    const items=sourceItems.map(x=>({
      Module:canonicalKnowledgeModule(replyKnowledgeState.module||'SSOCAC'),ErrorCode:x.code,Description:x.description,Cause:x.cause,Solution:x.solution,
      RelatedFile:x.relatedFile||'',RelatedField:x.relatedField||'',Tips:x.tips||'',UpdatedBy:updatedBy,Active:true
    }));
    const data=await apiRequest('upsertKnowledge',{items,writePin,createOnly:isViewer()});
    replyKnowledgeState.items.forEach(x=>x.dbStatus='มีในฐานข้อมูล');
    renderReplyKnowledge();
    closeSaveKnowledgeModal();
    toast('บันทึกสำเร็จ',`เพิ่ม ${data.inserted||0} รายการ และอัปเดต ${data.updated||0} รายการ`,'success');
  }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6000);}
  finally{confirmBtn.disabled=false;confirmBtn.textContent='บันทึกข้อมูล';}
}
function knowledgeCard(item,index){
 const complete=Boolean(String(item.Solution||'').trim());
 return `<details class="knowledge-compact-row ${complete?'complete':'incomplete'}" data-knowledge-index="${index}">
   <summary><label class="knowledge-select admin-only" onclick="event.stopPropagation()"><input type="checkbox" data-k-select="${index}"></label><span class="knowledge-code-badge">${escapeHtml(item.ErrorCode||'-')}</span><span class="knowledge-module-mini">${escapeHtml(knowledgeModuleLabel(item.Module||'-'))}</span><strong class="knowledge-description">${escapeHtml(item.Description||'ยังไม่มีคำอธิบาย')}</strong><span class="knowledge-status-mini">${complete?'✓ มีวิธีแก้':'รอเติมวิธีแก้'}</span><span class="knowledge-chevron">⌄</span></summary>
   <div class="knowledge-compact-detail"><div><b>สาเหตุ/ข้อสังเกต</b><textarea class="knowledge-edit-textarea knowledge-cause-textarea" data-k-index="${index}" data-k-field="Cause" placeholder="กรอกสาเหตุหรือข้อสังเกต...">${escapeHtml(item.Cause||'')}</textarea></div><div><b>แนวทางแก้</b><textarea class="knowledge-edit-textarea" data-k-index="${index}" data-k-field="Solution" placeholder="กรอกแนวทางแก้...">${escapeHtml(item.Solution||'')}</textarea></div><div><b>ไฟล์ที่เกี่ยวข้อง</b><input class="knowledge-edit-input" data-k-index="${index}" data-k-field="RelatedFile" value="${escapeAttr(item.RelatedFile||'')}" placeholder="เช่น BILLTRAN"></div><div><b>ฟิลด์ที่เกี่ยวข้อง</b><input class="knowledge-edit-input" data-k-index="${index}" data-k-field="RelatedField" value="${escapeAttr(item.RelatedField||'')}" placeholder="เช่น VerCode"></div></div>
   ${item.Tips?`<div class="knowledge-tips"><b>Tips:</b> ${escapeHtml(item.Tips)}</div>`:''}
   <div class="knowledge-card-footer"><div class="meta">อัปเดต ${escapeHtml(item.UpdatedAt||'-')} โดย ${escapeHtml(item.UpdatedBy||'-')}</div><button type="button" class="primary knowledge-edit-save" data-k-save-index="${index}">✏️ แก้ไข / บันทึก</button></div>
 </details>`;
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
  document.querySelectorAll('[data-k-save-index]').forEach(btn=>btn.addEventListener('click',()=>openKnowledgeEditModal(Number(btn.dataset.kSaveIndex))));document.querySelectorAll('[data-k-select]').forEach(el=>el.addEventListener('change',updateKnowledgeSelectedCount));
}
function openKnowledgeEditModal(index){
  if(!knowledgeCache[index]) return;
  document.getElementById('knowledgeEditIndex').value=String(index);
  document.getElementById('knowledgeEditModule').value=canonicalKnowledgeModule(knowledgeCache[index].Module);document.getElementById('knowledgeEditModule').disabled=authState.user?.Role!=='ADMIN';
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
    const sourceModule=canonicalKnowledgeModule(item.Module),targetModule=canonicalKnowledgeModule(document.getElementById('knowledgeEditModule').value);
    if(targetModule!==sourceModule){await apiRequest('moveKnowledge',{sourceModule,sourceCode:item.ErrorCode,targetModule,merge:false});item.Module=targetModule;}
    const payload={Module:targetModule,ErrorCode:item.ErrorCode,Description:item.Description,Cause:item.Cause,Solution:item.Solution||'',RelatedFile:item.RelatedFile||'',RelatedField:item.RelatedField||'',Tips:item.Tips||'',UpdatedBy:updatedBy,Active:item.Active!==false};
    await apiRequest('upsertKnowledge',{items:[payload],writePin});
    item.UpdatedBy=updatedBy;item.UpdatedAt=new Date().toLocaleDateString('en-US');
    closeKnowledgeEditModal();toast('บันทึกสำเร็จ',`${item.ErrorCode} ได้รับการอัปเดตแล้ว`,'success');
    runKnowledgeSearch();
  }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500);}
  finally{btn.disabled=false;btn.textContent='บันทึกการแก้ไข';}
}
function selectedKnowledgeItems(){return [...document.querySelectorAll('[data-k-select]:checked')].map(el=>knowledgeCache[Number(el.dataset.kSelect)]).filter(Boolean);}
function updateKnowledgeSelectedCount(){const n=selectedKnowledgeItems().length;const el=document.getElementById('knowledgeSelectedCount');if(el)el.textContent=`เลือก ${n} รายการ`;}
async function bulkMoveKnowledge(){const items=selectedKnowledgeItems(),targetModule=canonicalKnowledgeModule(document.getElementById('knowledgeBulkModule')?.value);if(!items.length){toast('ยังไม่ได้เลือกรายการ','กรุณาติ๊ก Error Code ที่ต้องการย้ายโมดูล','warning');return;}if(authState.user?.Role!=='ADMIN'){toast('ไม่มีสิทธิ์','เฉพาะ Admin เท่านั้นที่ย้ายโมดูลหลายรายการได้','error');return;}const btn=document.getElementById('knowledgeBulkMoveBtn');btn.disabled=true;btn.textContent='กำลังย้าย...';let moved=0,conflicts=[];try{for(const item of items){try{await apiRequest('moveKnowledge',{sourceModule:canonicalKnowledgeModule(item.Module),sourceCode:item.ErrorCode,targetModule,merge:false});moved++;}catch(e){conflicts.push(`${item.ErrorCode}: ${e.message}`);}}toast('ย้ายโมดูลเสร็จ',`ย้ายสำเร็จ ${moved} รายการ${conflicts.length?` · ข้าม ${conflicts.length} รายการที่ซ้ำ`:''}`,'success',6500);await runKnowledgeSearch();}finally{btn.disabled=false;btn.textContent='ย้ายโมดูลที่เลือก';}}
function runKnowledgeSearch(){return loadKnowledge(document.getElementById('knowledgeSearchInput').value.trim(),document.getElementById('knowledgeModuleFilter').value);}

async function loadDocumentLinks(){
 try{const data=await apiRequest('getDocuments');(data.items||[]).forEach(x=>documentState[x.type]=x);}
 catch(err){console.warn('Document API:',err.message);}
}
async function openDocument(type){
 if(type==='ANNOUNCEMENT'&&currentRegistryModule==='STCPAP'){window.open(CPAP_ANNOUNCEMENT_URL,'_blank','noopener');return;}
 if(!documentState[type]) await loadDocumentLinks();
 const item=documentState[type];
 if(!item?.url){toast('ยังไม่พบไฟล์ PDF',type==='ANNOUNCEMENT'?'ยังไม่พบไฟล์ประกาศในโฟลเดอร์':'ยังไม่พบ Protocol.pdf ในโฟลเดอร์','warning');return;}
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
document.getElementById('knowledgeSyncCrossBtn')?.addEventListener('click',syncCrossKnowledgeSeed_);document.getElementById('knowledgeReloadBtn')?.addEventListener('click',()=>loadKnowledge('','ALL'));document.getElementById('knowledgeBulkMoveBtn')?.addEventListener('click',bulkMoveKnowledge);
document.getElementById('knowledgeSearchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')runKnowledgeSearch();});
document.getElementById('saveKnowledgeBtn')?.addEventListener('click',openSaveKnowledgeModal);
document.getElementById('saveKnowledgeConfirm')?.addEventListener('click',saveReplyKnowledge);
document.getElementById('saveKnowledgeCancel')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeClose')?.addEventListener('click',closeSaveKnowledgeModal);
document.getElementById('saveKnowledgeModal')?.addEventListener('click',e=>{if(e.target.id==='saveKnowledgeModal')closeSaveKnowledgeModal();});
document.getElementById('saveWritePin')?.addEventListener('keydown',e=>{if(e.key==='Enter')saveReplyKnowledge();});

document.getElementById('announcementBtn')?.addEventListener('click',()=>openDocument('ANNOUNCEMENT'));
document.getElementById('registryAnnouncementBtn')?.addEventListener('click',()=>openDocument(currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP'?'CPAP_ANNOUNCEMENT':'ANNOUNCEMENT'));
document.getElementById('protocolBtn')?.addEventListener('click',()=>openDocument('PROTOCOL'));
document.getElementById('registryProtocolBtn')?.addEventListener('click',()=>openDocument('PROTOCOL'));
document.getElementById('registryKnowledgeBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const url=`${location.origin}${location.pathname}?page=knowledge&module=${encodeURIComponent(currentRegistryModule)}`;const w=window.open(url,'_blank','noopener,noreferrer');if(!w)toast('เบราว์เซอร์บล็อกแท็บใหม่','กรุณาอนุญาต Pop-up สำหรับเว็บไซต์นี้ แล้วกดฐานความรู้อีกครั้ง','warning',6000);});
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
const registryState={items:[],filtered:[],page:1,pageSize:20,selected:null,errorKnowledge:new Map(),activeErrorCode:'',highlightCaseId:''};
/* Core Stability V4.5.2: date-only values never pass through UTC. */
const DateEngine={
 parts(value){
  if(value===null||value===undefined||value==='')return null;
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return {y:value.getFullYear(),m:value.getMonth()+1,d:value.getDate()};
  const t=String(value).trim(); if(!t)return null;
  let m=t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if(m){let y=+m[1];if(y>2400)y-=543;return this.valid(y,+m[2],+m[3]);}
  m=t.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})(?:\s.*)?$/);
  if(m){let y=+m[3];if(y>2400)y-=543;return this.valid(y,+m[2],+m[1]);}
  return null;
 },
 valid(y,m,d){if(y<1900||y>2200||m<1||m>12||d<1||d>31)return null;const x=new Date(y,m-1,d,12,0,0);return x.getFullYear()===y&&x.getMonth()+1===m&&x.getDate()===d?{y,m,d}:null;},
 iso(value){const p=this.parts(value);return p?`${String(p.y).padStart(4,'0')}-${String(p.m).padStart(2,'0')}-${String(p.d).padStart(2,'0')}`:'';},
 thai(value,empty='-'){const p=this.parts(value);return p?`${String(p.d).padStart(2,'0')}/${String(p.m).padStart(2,'0')}/${p.y+543}`:(value?String(value):empty);},
 sortKey(value){const p=this.parts(value);return p?p.y*10000+p.m*100+p.d:0;},
 fileStamp(){const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;}
};
function thDate(v){return DateEngine.thai(v);}
function thDateTime(v){if(!v)return '-';const d=new Date(v);if(Number.isNaN(d.getTime()))return String(v);return d.toLocaleString('th-TH');}

function splitRegistryErrorCodes(value){
 const text=String(value||'').toUpperCase();
 return [...new Set(text.match(/\b[A-Z]{1,4}\d{1,4}\b/g)||[])];
}
function itemRegistryErrorCodes(item){
 const values=[item?.Latest_Error_Code,item?.All_Error_Codes,item?.Latest_Error_Description,item?.Latest_Error_Cause,item?.Latest_Error_Solution];
 // รองรับคอลัมน์ Error/CheckCode ที่อาจเพิ่มขึ้นในชีตหรือโมดูลถัดไป
 Object.entries(item||{}).forEach(([key,value])=>{if(/(?:error|check.?code)/i.test(key))values.push(value)});
 return [...new Set(values.flatMap(splitRegistryErrorCodes))];
}
function isCaseC(item){
 const result=String(item?.Latest_Result||'').trim().toUpperCase();
 const status=String(item?.Case_Status||'').trim();
 return result==='C'||/ติด.*\(C\)/i.test(status)||status==='ติด (C)';
}
function isWarningCode(code){return /^W/i.test(String(code||''));}
function knowledgeCompleteForCode(code){
 const k=registryState.errorKnowledge.get(String(code||'').toUpperCase());
 return Boolean(k && String(k.Solution||'').trim() && !/^รอ/i.test(String(k.Solution||'').trim()));
}
function buildErrorStats(){
 const map=new Map();
 registryState.items.filter(isCaseC).forEach(item=>itemRegistryErrorCodes(item).forEach(code=>{
  if(!map.has(code))map.set(code,{code,count:0,items:[],sessions:new Map()});
  const x=map.get(code);x.count++;x.items.push(item);
  const session=String(item.Session||'-');x.sessions.set(session,(x.sessions.get(session)||0)+1);
 }));
 return [...map.values()].sort((a,b)=>{
  const aw=isWarningCode(a.code),bw=isWarningCode(b.code);if(aw!==bw)return aw?1:-1;
  return b.count-a.count||a.code.localeCompare(b.code);
 });
}
async function hydrateRegistryErrorKnowledge(){
 const codes=[...new Set(registryState.items.filter(isCaseC).flatMap(itemRegistryErrorCodes))];
 registryState.errorKnowledge=new Map();
 if(!codes.length){renderErrorIntelligence();return;}
 try{const data=await apiRequest('getByCodes',{module:currentRegistryModule,codes});(data.items||[]).forEach(k=>registryState.errorKnowledge.set(String(k.ErrorCode||'').toUpperCase(),k));}
 catch(err){console.warn('Error intelligence knowledge:',err.message)}
 renderErrorIntelligence();
}
function errorCardClass(code){if(isWarningCode(code))return'warning';return knowledgeCompleteForCode(code)?'solved':'critical';}
function renderErrorIntelligence(){
 const wrap=document.getElementById('errorWorkQueue'),score=document.getElementById('knowledgeCoverage'),card=document.getElementById('errorIntelligenceCard');if(!wrap)return;
 const show=(document.getElementById('registryStatusFilter')?.value||'ALL')==='C';
 if(card)card.classList.toggle('hidden',!show);
 if(!show)return;
 const stats=buildErrorStats();const nonWarnings=stats.filter(x=>!isWarningCode(x.code));const complete=nonWarnings.filter(x=>knowledgeCompleteForCode(x.code)).length;
 const pct=nonWarnings.length?Math.round(complete/nonWarnings.length*100):100;if(score)score.textContent=`Knowledge ${pct}%`;
 wrap.innerHTML=stats.length?stats.map(x=>{
  const cls=errorCardClass(x.code),topSessions=[...x.sessions.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3);
  const status=isWarningCode(x.code)?'รหัสเตือน HIS':knowledgeCompleteForCode(x.code)?'✓ มีวิธีแก้แล้ว':'ยังไม่มีวิธีแก้';
  return `<button type="button" class="error-work-card ${cls}" data-error-queue="${escapeAttr(x.code)}"><div class="error-work-card-top"><strong>${escapeHtml(x.code)}</strong><b>${x.count} ราย</b></div><span>${escapeHtml(status)}</span><small>${topSessions.map(([s,n])=>`${escapeHtml(s)} (${n})`).join(' · ')||'ยังไม่มี Session'}</small></button>`;
 }).join(''):'<div class="knowledge-empty">ยังไม่พบ Error Code ในทะเบียนงาน</div>';
 wrap.querySelectorAll('[data-error-queue]').forEach(btn=>btn.onclick=()=>openErrorQueue(btn.dataset.errorQueue));
}
function openErrorQueue(code){
 const stat=buildErrorStats().find(x=>x.code===String(code).toUpperCase());if(!stat)return;
 registryState.activeErrorCode=stat.code;const k=registryState.errorKnowledge.get(stat.code);
 document.getElementById('errorQueueTitle').textContent=`${stat.code} · ${stat.count} ราย`;
 const itemDescription=stat.items.map(item=>{
  const parts=registryErrorDescriptions(item?.Latest_Error_Description||'');
  const matched=parts.find(part=>new RegExp('^'+stat.code+'\\s*[:：]','i').test(part));
  return matched?matched.replace(new RegExp('^'+stat.code+'\\s*[:：]\\s*','i'),'').trim():'';
 }).find(Boolean)||'';
 const desc=String(k?.Description||itemDescription||'ยังไม่มีคำอธิบายในฐานความรู้').trim();
 const solution=String(k?.Solution||'').trim();
 document.getElementById('errorQueueSub').innerHTML=`<span class="queue-description">${escapeHtml(desc)}</span>${solution?`<span class="queue-solution"><b>วิธีแก้ไข:</b> ${escapeHtml(solution)}</span>`:'<span class="queue-solution pending">ยังไม่มีวิธีแก้ไขที่บันทึกไว้</span>'}`;
 const list=document.getElementById('errorQueueList');list.innerHTML=stat.items.slice().sort((a,b)=>String(a.Session||'').localeCompare(String(b.Session||''))||String(a.Station||'').localeCompare(String(b.Station||''))).map(item=>`<article class="error-queue-row"><div><b>${escapeHtml(item.Session||'-')} : ${escapeHtml(item.Station||'-')}</b><span>Work ${escapeHtml(item.Work_Order_No||'-')}</span></div><div class="grow"><strong>${escapeHtml(item.Patient_Name||item.Case_ID||'-')}</strong><small>HN ${escapeHtml(item.HN||'-')} · ${escapeHtml(item.Case_ID||'-')} · VN ${escapeHtml(item.VN||'-')}</small></div><button class="soft" data-error-goto="${escapeAttr(item.Case_ID)}">ไปทะเบียน</button>${isViewer()?'':`<button class="primary" data-error-zip="${escapeAttr(item.Case_ID)}">แก้ไข ZIP</button>`}</article>`).join('');
 list.querySelectorAll('[data-error-goto]').forEach(b=>b.onclick=()=>focusRegistryCase(b.dataset.errorGoto,stat.code));
 list.querySelectorAll('[data-error-zip]').forEach(b=>b.onclick=()=>{closeErrorQueue();openZipReader(b.dataset.errorZip)});
 const m=document.getElementById('errorQueueModal');m.classList.add('show');m.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
}
function closeErrorQueue(){const m=document.getElementById('errorQueueModal');if(!m)return;m.classList.remove('show');m.setAttribute('aria-hidden','true');if(!document.querySelector('.modal.show'))document.body.classList.remove('modal-open');}
function filterRegistryByError(code){
 const search=document.getElementById('registrySearch'),status=document.getElementById('registryStatusFilter');if(search)search.value=code;if(status)status.value='C';closeErrorQueue();applyRegistryFilter();document.querySelector('.registry-table-wrap')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function focusRegistryCase(caseId,code){
 registryState.highlightCaseId=String(caseId||'');
 const search=document.getElementById('registrySearch'),status=document.getElementById('registryStatusFilter');
 if(search)search.value=code||'';if(status)status.value='C';
 closeErrorQueue();applyRegistryFilter();
 const index=registryState.filtered.findIndex(x=>String(x.Case_ID)===registryState.highlightCaseId);
 if(index>=0){registryState.page=Math.floor(index/registryState.pageSize)+1;renderRegistry();requestAnimationFrame(()=>{const tr=document.querySelector(`tr[data-registry-case-id="${CSS.escape(registryState.highlightCaseId)}"]`);tr?.scrollIntoView({behavior:'smooth',block:'center'});});}
 else toast('ไม่พบรายการ','ไม่พบเคสที่เลือกในผลกรองปัจจุบัน','warning');
}

function exportErrorQueueCsv(){
 const code=String(registryState.activeErrorCode||'').toUpperCase();
 const stat=buildErrorStats().find(x=>x.code===code);
 if(!stat?.items?.length){toast('ไม่มีข้อมูล','ยังไม่มีรายการสำหรับส่งออก','warning');return;}
 const headers=['Case_ID','Module_Code','HN','VN','CID','Patient_Name','Service_Date','Coverage','Chemo_Drug','SSO_Case_No','Protocol_Code','TFlag','Session : Station','Work_Order_No','Error_Code'];
 const rows=stat.items.map(x=>[x.Case_ID,x.Module_Code||'SSOCAC',x.HN,x.VN,x.CID,x.Patient_Name,thDate(x.Service_Date),x.Coverage,x.Chemo_Drug,x.SSO_Case_No,x.Protocol_Code,x.TFlag,`${x.Session||''} : ${x.Station||''}`,x.Work_Order_No,code]);
 const csv='\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=`SSOCAC_${code}_Work_Queue_${DateEngine.fileStamp()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast('ส่งออก CSV แล้ว',`${code} จำนวน ${rows.length} รายการ`,'success');
}


const REGISTRY_CACHE_TTL_MS=45000;
const registryModuleCache=new Map();
function getRegistryCache(moduleCode){
 const key=String(moduleCode||'').toUpperCase();
 const mem=registryModuleCache.get(key);
 if(mem&&Date.now()-mem.savedAt<REGISTRY_CACHE_TTL_MS)return mem.items;
 try{const raw=sessionStorage.getItem('ssopRegistryCache:'+key);if(!raw)return null;const parsed=JSON.parse(raw);if(!parsed||Date.now()-Number(parsed.savedAt||0)>=REGISTRY_CACHE_TTL_MS)return null;registryModuleCache.set(key,parsed);return parsed.items||null;}catch(_e){return null;}
}
function setRegistryCache(moduleCode,items){
 const key=String(moduleCode||'').toUpperCase(),entry={savedAt:Date.now(),items:items||[]};registryModuleCache.set(key,entry);
 try{sessionStorage.setItem('ssopRegistryCache:'+key,JSON.stringify(entry));}catch(_e){}
}
function clearRegistryCache(moduleCode){
 const key=String(moduleCode||'').toUpperCase();registryModuleCache.delete(key);try{sessionStorage.removeItem('ssopRegistryCache:'+key);}catch(_e){}
}
const REGISTRY_MODULE_CONFIG={
 SSOCAC:{title:'ทะเบียนงาน Cancer Care',subtitle:'ทะเบียนผู้ป่วยหลัง Discharge สำหรับเตรียมข้อมูลส่งเบิก SSOCAC',icon:'🎗️',footer:'PCMC-SSO Toolkit · Cancer Care Registry Version 4.5.6'},
 STCPAP:{title:'ทะเบียนงาน SSOCPAP',subtitle:'ทะเบียนผู้ป่วยสำหรับเตรียมข้อมูลส่งเบิกเครื่อง CPAP และหน้ากาก ตามกฎ STCPAP',icon:'🫁',footer:'PCMC-SSO Toolkit · SSOCPAP Registry Version 4.5.6'},
 STSLEEP:{title:'ทะเบียนงาน Sleep Test',subtitle:'ทะเบียนผู้ป่วยสำหรับเตรียมข้อมูลส่งเบิก Sleep Test ตามกฎ STCPAP',icon:'🌙',footer:'PCMC-SSO Toolkit · Sleep Test Registry Version 4.5.6'}
};
function openRegistryModule(moduleCode){
 currentRegistryModule=String(moduleCode||'SSOCAC').toUpperCase();registryState.items=[];registryState.filtered=[];registryState.page=1;applyRegistryModuleUi();showPage('registryPage');
 const cached=getRegistryCache(currentRegistryModule),body=document.getElementById('registryBody'),status=document.getElementById('registryStatus');
 if(cached?.length){registryState.items=cached;applyRegistryFilter();if(status)status.textContent=`แสดงข้อมูลล่าสุด ${cached.length} รายการ · กำลังตรวจสอบข้อมูลใหม่...`;}
 else if(body)body.innerHTML='<tr><td colspan="12" class="empty-row">กำลังโหลดข้อมูล...</td></tr>';
 loadRegistry({preserveCached:Boolean(cached?.length)});
}
function applyRegistryModuleUi(){
 const c=REGISTRY_MODULE_CONFIG[currentRegistryModule]||REGISTRY_MODULE_CONFIG.SSOCAC;const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
 set('registryModuleIcon',c.icon);set('registryModuleTitle',c.title);set('registryModuleSubtitle',c.subtitle);set('registryFooterTitle',c.footer);
 const cpap=currentRegistryModule==='STCPAP';const sleep=currentRegistryModule==='STSLEEP';set('caseModalTitle',cpap?'เพิ่มงาน SSOCPAP':sleep?'เพิ่มงาน Sleep Test':'เพิ่มงาน Cancer Care');set('caseModalSubtitle',cpap?'กรอกข้อมูลตั้งต้น CPAP เพื่อใช้จับคู่ ZIP และปรับปรุงฟิลด์อัตโนมัติ':sleep?'กรอกข้อมูลตั้งต้น Sleep Test เพื่อใช้จับคู่ ZIP และตรวจสอบฟิลด์':'กรอกข้อมูลผู้ป่วยหลัง Discharge เพื่อเตรียมส่งเบิก');set('caseSsoNoLabel',cpap?'เลขกำกับเบิก':'Case Number');set('caseProtocolLabel',cpap?'ประเภทบริการ':'Protocol Code');set('caseChemoLabel',cpap?'ว.แพทย์':'ชื่อยา Chemo');
 const annWrap=document.getElementById('registryAnnouncementBtn')?.closest('.split-doc-action');if(annWrap)annWrap.classList.remove('hidden');const protocolWrap=document.getElementById('registryProtocolBtn')?.closest('.split-doc-action');if(protocolWrap)protocolWrap.classList.toggle('hidden',cpap||sleep);const guide=document.getElementById('registryDictionaryBtn');if(guide)guide.textContent=cpap?'📖 คู่มือฟิลด์ CPAP':sleep?'📖 คู่มือฟิลด์ Sleep Test':'📖 คู่มือฟิลด์';const add=document.getElementById('addCaseBtn');if(add)add.textContent='+ เพิ่มเอง';
 ['registryReloadBtn','importExcelBtn','openZipReaderBtn','openReplyImportBtn','addCaseBtn'].forEach(id=>document.getElementById(id)?.classList.remove('hidden'));
 document.getElementById('errorIntelligenceCard')?.classList.toggle('hidden',cpap);
 const head=document.querySelector('.registry-table .case-protocol-col');if(head)head.innerHTML=cpap?'เลขกำกับเบิก /<br>ประเภทบริการ':'Case Number /<br>Protocol';
}
async function loadRegistry(options={}){
 const token=++registryLoadToken,moduleAtStart=currentRegistryModule,preserveCached=Boolean(options.preserveCached);
 const status=document.getElementById('registryStatus');if(!status)return;
 const searchInput=document.getElementById('registrySearch');if(searchInput&&!preserveCached)searchInput.value='';
 if(!preserveCached){registryState.items=[];registryState.filtered=[];registryState.page=1;const body=document.getElementById('registryBody');if(body)body.innerHTML='<tr><td colspan="12" class="empty-row">กำลังโหลดข้อมูล...</td></tr>';status.textContent='กำลังโหลดข้อมูล...';}
 try{
  const data=await apiRequest('listCases',{module:moduleAtStart,limit:5000});
  if(token!==registryLoadToken||moduleAtStart!==currentRegistryModule)return;
  registryState.items=data.items||[];setRegistryCache(moduleAtStart,registryState.items);applyRegistryFilter();
  status.textContent=`เชื่อมต่อฐานข้อมูลแล้ว · ${registryState.items.length} รายการ`;
  hydrateRegistryErrorKnowledge();
 }catch(err){
  if(token!==registryLoadToken||moduleAtStart!==currentRegistryModule)return;
  status.textContent=preserveCached?`แสดงข้อมูลล่าสุด · ตรวจสอบข้อมูลใหม่ไม่สำเร็จ: ${err.message}`:err.message;
  if(!preserveCached){const body=document.getElementById('registryBody');if(body)body.innerHTML=`<tr><td colspan="12" class="empty-row">${escapeHtml(err.message)}</td></tr>`;}
 }
}

function registryDateValue(item){return DateEngine.sortKey(item?.Service_Date||item?.Created_At||item?.Updated_At||'');}
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
 registryState.filtered=registryState.items.filter(x=>registryMatchesStatus(x,statusFilter)&&(!q||[x.Case_ID,x.HN,x.VN,x.CID,x.Patient_Name,x.SSO_Case_No,x.Protocol_Code,x.Claim_Control_No,x.Service_Type,x.Doctor_License,x.Diagnosis_Code,x.Session,x.Station,`${x.Session||''} : ${x.Station||''}`,x.Work_Order_No,x.Case_Status,x.Assigned_To,x.Latest_Result,x.Latest_Error_Code,x.Latest_Error_Description,x.Latest_Error_Cause,x.Latest_Error_Solution].some(v=>String(v||'').toLowerCase().includes(q))));
 registryState.filtered.sort((a,b)=>{
  if(sort==='name')return String(a.Patient_Name||'').localeCompare(String(b.Patient_Name||''),'th',{sensitivity:'base'})||registryCaseSequence(a)-registryCaseSequence(b);
  const av=registryDateValue(a),bv=registryDateValue(b);
  if(av!==bv)return sort==='oldest'?av-bv:bv-av;
  const as=registryCaseSequence(a),bs=registryCaseSequence(b);
  return sort==='oldest'?as-bs:bs-as;
 });
 registryState.page=1;syncRegistryStatusCards();renderRegistry();renderErrorIntelligence();
}
function registryErrorCodes(value){
 return [...new Set(String(value||'').split(/[|,;\s]+/).map(x=>x.trim().toUpperCase()).filter(Boolean))];
}
function registryErrorDescriptions(value){
 const text=String(value||'').replace(/\r/g,'').trim();
 if(!text)return ['ยังไม่มีคำอธิบายใน Knowledge Base'];
 // ทำให้คำอธิบายแต่ละรหัสแยกจากกัน แม้ข้อมูลเดิมจะคั่นด้วย |, ขึ้นบรรทัดใหม่
 // หรือถูกต่อกันโดยไม่มีตัวคั่นที่ชัดเจน
 const normalized=text
  .replace(/\n+/g,' | ')
  .replace(/\s*\|\s*/g,' | ')
  .replace(/\s+(?=[A-Z]{1,4}\d{1,4}\s*[:：])/gi,' | ');
 const parts=normalized.split(/\s*\|\s*/).map(x=>x.trim()).filter(Boolean);
 return parts.length?parts:[text];
}
function registryErrorTagsHtml(x){
 const codes=registryErrorCodes([x.Latest_Error_Code,x.All_Error_Codes].filter(Boolean).join(','));
 const descParts=registryErrorDescriptions(x.Latest_Error_Description);
 const descByCode=new Map();
 descParts.forEach(part=>{const m=part.match(/^([A-Z]{1,4}\d{1,4})\s*[:：]\s*(.*)$/i);if(m)descByCode.set(m[1].toUpperCase(),m[2].trim())});
 if(!codes.length)return '<span class="meta">-</span>';
 return codes.map(code=>{const cls=isWarningCode(code)?'warning':knowledgeCompleteForCode(code)?'solved':'critical';const hint=knowledgeCompleteForCode(code)?'มีวิธีแก้แล้ว · ':isWarningCode(code)?'รหัสเตือน · ':'';return `<button type="button" class="error-code-tag ${cls}" data-error-filter="${escapeAttr(code)}" title="${escapeAttr(hint+(descByCode.get(code)||'คลิกเพื่อกรองรหัส '+code))}">[${escapeHtml(code)}]</button>`}).join('');
}
function registryErrorDescriptionHtml(value){
 const parts=registryErrorDescriptions(value);
 return parts.map((part,index)=>`<div class="registry-error-line">${escapeHtml(part)}${index<parts.length-1?' <span class="error-separator">|</span>':''}</div>`).join('');
}
function renderRegistry(){
 const size=Number(document.getElementById('registryPageSize')?.value||20);registryState.pageSize=size;
 const total=registryState.filtered.length,pages=Math.max(1,Math.ceil(total/size));registryState.page=Math.min(registryState.page,pages);
 const start=(registryState.page-1)*size,rows=registryState.filtered.slice(start,start+size),body=document.getElementById('registryBody');
 const showCDetails=(document.getElementById('registryStatusFilter')?.value||'ALL')==='C';
 document.querySelectorAll('.registry-c-col').forEach(el=>el.classList.toggle('hidden',!showCDetails));
 body.innerHTML=rows.length?rows.map(x=>{const status=String(x.Case_Status||'').trim();const readyAction=status==='รอตรวจสอบ'?`<button class="primary compact-ready" data-case-ready="${escapeHtml(x.Case_ID)}">✓ พร้อมส่ง</button>`:'';const submittedAction=status==='พร้อมส่ง'?`<button class="primary compact-ready" data-case-submitted="${escapeHtml(x.Case_ID)}">📤 บันทึกส่งแล้ว</button>`:'';const reworkAction=(status==='ติดแก้ไข (C)'||x.Latest_Result==='C')?`<button class="primary compact-ready" data-case-rework="${escapeHtml(x.Case_ID)}">🔧 เริ่มแก้ไข</button>`:'';const cCells=showCDetails?`<td class="registry-c-col"><div class="error-code-tags">${registryErrorTagsHtml(x)}</div></td>`:'';const actionHtml=isViewer()?`<button class="soft" data-case-view="${escapeHtml(x.Case_ID)}">ดู</button>`:(currentRegistryModule==='STCPAP'?`<button class="soft" data-case-view="${escapeHtml(x.Case_ID)}">ดู</button><button class="soft" data-case-edit="${escapeHtml(x.Case_ID)}">แก้ไข</button><button class="soft" data-case-zip="${escapeHtml(x.Case_ID)}">แก้ไข ZIP</button>${readyAction}${submittedAction}${reworkAction}`:`<button class="soft" data-case-view="${escapeHtml(x.Case_ID)}">ดู</button><button class="soft" data-case-edit="${escapeHtml(x.Case_ID)}">แก้ไข</button><button class="soft" data-case-zip="${escapeHtml(x.Case_ID)}">แก้ไข ZIP</button>${readyAction}${submittedAction}${reworkAction}`);return `<tr data-registry-case-id="${escapeAttr(x.Case_ID||'')}" class="${String(x.Case_ID||'')===registryState.highlightCaseId?'registry-row-highlight':''}"><td><div class="case-no">${escapeHtml(x.Case_ID||'-')}</div><div class="subline">ครั้งที่ ${escapeHtml(x.Current_Attempt_No||0)}</div></td><td><b>${escapeHtml(x.HN||'-')}</b><div class="subline">VN: ${escapeHtml(x.VN||'-')}</div></td><td><b>${escapeHtml(x.Patient_Name||'-')}</b><div class="subline">CID: ${escapeHtml(x.CID?String(x.CID).replace(/.(?=.{4})/g,'•'):'-')}</div></td><td>${thDate(x.Service_Date)}</td><td>${escapeHtml((currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP')?(x.Claim_Control_No||'-'):(x.SSO_Case_No||'-'))}<div class="subline">${escapeHtml((currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP')?(x.Service_Type||'-'):(x.Protocol_Code||'-'))}</div></td><td class="session-station-col"><b>${escapeHtml(x.Session||'-')}</b> : <b>${escapeHtml(x.Station||'-')}</b></td><td class="work-no-col">${escapeHtml(x.Work_Order_No||'-')}</td><td><span class="status-pill ${statusClassName(x.Case_Status)}">${escapeHtml(displayCaseStatus(x.Case_Status))}</span></td><td><span class="result-pill ${x.Latest_Result==='A'?'a':x.Latest_Result==='C'?'c':''}">${escapeHtml(x.Latest_Result||'-')}</span></td>${cCells}<td>${escapeHtml(x.Assigned_To||'-')}</td><td><div class="row-actions">${actionHtml}</div></td></tr>`}).join(''):`<tr><td colspan="${showCDetails?12:11}" class="empty-row">ยังไม่มีข้อมูลทะเบียนงาน</td></tr>`;
 body.querySelectorAll('[data-case-view]').forEach(b=>b.onclick=()=>openCaseDetail(b.dataset.caseView));body.querySelectorAll('[data-case-zip]').forEach(b=>b.onclick=()=>openZipReader(b.dataset.caseZip));body.querySelectorAll('[data-case-edit]').forEach(b=>b.onclick=()=>openCaseModal(b.dataset.caseEdit));body.querySelectorAll('[data-case-ready]').forEach(b=>b.onclick=()=>markCaseReady(b.dataset.caseReady));body.querySelectorAll('[data-case-submitted]').forEach(b=>b.onclick=()=>markCaseSubmitted(b.dataset.caseSubmitted));body.querySelectorAll('[data-case-rework]').forEach(b=>b.onclick=()=>startCaseRework(b.dataset.caseRework));body.querySelectorAll('[data-error-filter]').forEach(b=>b.onclick=()=>{const search=document.getElementById('registrySearch'),status=document.getElementById('registryStatusFilter');if(search)search.value=b.dataset.errorFilter||'';if(status)status.value='C';applyRegistryFilter()});
 document.getElementById('registryCountText').textContent=total?`แสดง ${start+1}-${Math.min(start+size,total)} จาก ${total} รายการ · หน้า ${registryState.page} / ${pages}`:'0 รายการ · หน้า 1 / 1';
 const pageWrap=document.getElementById('registryPages');pageWrap.innerHTML='';for(let i=1;i<=pages;i++){if(pages>10&&Math.abs(i-registryState.page)>2&&i!==1&&i!==pages)continue;const b=document.createElement('button');b.textContent=i;b.className=i===registryState.page?'active':'';b.onclick=()=>{registryState.page=i;renderRegistry()};pageWrap.appendChild(b)}
 renderRegistryStats();
}
function displayCaseStatus(status){const s=String(status||'รอเตรียมข้อมูล').trim();return /ติด.*\(C\)/i.test(s)?'ติด (C)':s;}
function statusClassName(status){const s=String(status||'รอเตรียมข้อมูล').trim();if(s==='รอเตรียมข้อมูล')return'preparing';if(s==='รอตรวจสอบ')return'review';if(['พร้อมส่ง','พร้อมสร้างไฟล์'].includes(s))return'ready';if(['สร้างไฟล์แล้ว','ส่งเบิกแล้ว','รอผลตอบกลับ'].includes(s))return'sent';if(s==='ผ่าน (A)')return'passed';if(s==='ติดแก้ไข (C)')return'fix';return'neutral'}
async function markCaseReady(caseId){
 const item=registryState.items.find(x=>x.Case_ID===caseId);if(!item)return;
 const ok=await showDialog('ยืนยันพร้อมส่ง',`ยืนยันว่าได้ตรวจสอบไฟล์ของ ${item.Patient_Name||caseId} แล้ว และพร้อมส่งข้อมูล?`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'พร้อมส่ง',value:true,className:'primary'}]);if(!ok)return;
 try{await apiRequest('markCaseReady',{caseId,user:authState.user?.Display_Name||''});item.Case_Status='พร้อมส่ง';applyRegistryFilter();toast('เปลี่ยนสถานะแล้ว',`${caseId} อยู่ในสถานะ “พร้อมส่ง”`,'success');}
 catch(err){toast('เปลี่ยนสถานะไม่สำเร็จ',err.message,'error',7000)}
}
async function markCaseSubmitted(caseId){
 const item=registryState.items.find(x=>String(x.Case_ID)===String(caseId));if(!item)return;
 const workOrder=String(item.Work_Order_No||'').trim();
 if(!workOrder){toast('ยังบันทึกส่งไม่ได้','ไม่พบ Work Order No. ของผู้ป่วยรายนี้ กรุณาตรวจสอบข้อมูลทะเบียนก่อน','warning',6500);return}
 const ok=await showDialog('ยืนยันบันทึกส่งแล้ว',`ยืนยันว่าได้ส่งไฟล์ของ ${item.Patient_Name||caseId} แล้ว?\nWork Order No.: ${workOrder}\nระบบจะเปลี่ยนสถานะเป็น “รอผลตอบกลับ”`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'บันทึกส่งแล้ว',value:true,className:'primary'}]);if(!ok)return;
 try{const data=await apiRequest('markCaseSubmitted',{caseId,user:authState.user?.Display_Name||''});item.Case_Status='รอผลตอบกลับ';applyRegistryFilter();toast('บันทึกการส่งแล้ว',`${caseId} เปลี่ยนเป็น “รอผลตอบกลับ”${data.generatedFileName?' · '+data.generatedFileName:''}`,'success',5200);}
 catch(err){toast('บันทึกการส่งไม่สำเร็จ',err.message,'error',7000)}
}

async function startCaseRework(caseId){
 const item=registryState.items.find(x=>String(x.Case_ID)===String(caseId));if(!item)return;
 const codes=String(item.Latest_Error_Code||'').trim();
 const ok=await showDialog('เริ่มแก้ไขผล C',`เริ่มรอบแก้ไขของ ${item.Patient_Name||caseId}?${codes?'\nError Code: '+codes:''}\nระบบจะเปลี่ยนสถานะเป็น “รอตรวจสอบ” โดยคงผลตอบกลับเดิมไว้ในประวัติ`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'เริ่มแก้ไข',value:true,className:'primary'}]);if(!ok)return;
 try{await apiRequest('startCaseRework',{caseId,user:authState.user?.Display_Name||''});item.Case_Status='รอตรวจสอบ';applyRegistryFilter();toast('เริ่มรอบแก้ไขแล้ว',`${caseId} เปลี่ยนเป็น “รอตรวจสอบ” และยังคง Error Code เดิมไว้`,'success',5200);}
 catch(err){toast('เริ่มแก้ไขไม่สำเร็จ',err.message,'error',6500)}
}

function renderRegistryStats(){const all=registryState.items;const set=(id,n)=>{const el=document.getElementById(id);if(el)el.textContent=n};set('statAll',all.length);set('statPreparing',all.filter(x=>['รอเตรียมข้อมูล','รอตรวจสอบ'].includes(x.Case_Status)).length);set('statReady',all.filter(x=>['พร้อมส่ง','พร้อมสร้างไฟล์','สร้างไฟล์แล้ว'].includes(x.Case_Status)).length);set('statSent',all.filter(x=>['ส่งเบิกแล้ว','รอผลตอบกลับ'].includes(x.Case_Status)).length);set('statA',all.filter(x=>x.Latest_Result==='A'||x.Case_Status==='ผ่าน (A)').length);set('statC',all.filter(x=>x.Latest_Result==='C'||x.Case_Status==='ติดแก้ไข (C)').length)}
function openCaseModal(id=''){
 const x=id?registryState.items.find(r=>r.Case_ID===id):null;registryState.selected=x||null;const cpap=currentRegistryModule==='STCPAP';const sleep=currentRegistryModule==='STSLEEP';document.getElementById('caseModalTitle').textContent=x?(cpap?'แก้ไขงาน SSOCPAP':'แก้ไขงาน Cancer Care'):(cpap?'เพิ่มงาน SSOCPAP':'เพิ่มงาน Cancer Care');
 const fields={caseId:x?.Case_ID||'',caseHN:x?.HN||'',caseVN:x?.VN||'',caseCID:x?.CID||'',casePatientName:x?.Patient_Name||'',caseServiceDate:DateEngine.iso(x?.Service_Date),caseCoverage:x?.Coverage||'ประกันสังคม',caseSsoNo:cpap?(x?.Claim_Control_No||''):(x?.SSO_Case_No||''),caseProtocol:cpap?(x?.Service_Type||'CPAP'):(x?.Protocol_Code||''),caseSession:x?.Session||'',caseStation:x?.Station||'',caseWorkOrder:x?.Work_Order_No||'',caseChemo:cpap?(x?.Doctor_License||''):(x?.Chemo_Drug||''),caseDiagnosis:cpap?(x?.Diagnosis_Code||''):'',caseAssigned:x?.Assigned_To||'',caseStatus:x?.Case_Status||'รอเตรียมข้อมูล',caseRemark:x?.Remark||'',caseUpdatedBy:authState.user?.Display_Name||''};Object.entries(fields).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.value=v});const diagnosisField=document.getElementById('caseDiagnosisField');if(diagnosisField)diagnosisField.classList.toggle('hidden',!cpap);const m=document.getElementById('caseModal');m.classList.add('show');m.setAttribute('aria-hidden','false');
}
function closeCaseModal(){const m=document.getElementById('caseModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
async function saveCase(){
 const get=id=>document.getElementById(id).value.trim(),cpap=currentRegistryModule==='STCPAP';const payload={Case_ID:get('caseId'),Module_Code:currentRegistryModule,HN:get('caseHN'),VN:get('caseVN'),CID:get('caseCID'),Patient_Name:get('casePatientName'),Service_Date:get('caseServiceDate'),Coverage:get('caseCoverage'),Case_Status:get('caseStatus'),Assigned_To:get('caseAssigned'),Updated_By:get('caseUpdatedBy'),TFlag:registryState.selected?.TFlag||'',Session:get('caseSession'),Station:get('caseStation'),Work_Order_No:get('caseWorkOrder'),Remark:get('caseRemark')};
 if(cpap){payload.Claim_Control_No=get('caseSsoNo');payload.Service_Type=get('caseProtocol')||'CPAP';payload.Doctor_License=get('caseChemo');payload.Diagnosis_Code=get('caseDiagnosis')}else{payload.SSO_Case_No=get('caseSsoNo');payload.Protocol_Code=get('caseProtocol');payload.Chemo_Drug=get('caseChemo')}
 if(!payload.HN||!payload.Patient_Name||!payload.Service_Date){toast('ข้อมูลไม่ครบ','กรุณากรอก HN ชื่อผู้ป่วย และวันที่รับบริการ','warning');return}const btn=document.getElementById('caseSaveBtn');btn.disabled=true;btn.textContent='กำลังบันทึก...';try{await apiRequest('saveCase',{module:currentRegistryModule,item:payload});closeCaseModal();toast('บันทึกสำเร็จ',payload.Case_ID?'แก้ไขทะเบียนงานแล้ว':'สร้างทะเบียนงานใหม่แล้ว','success');clearRegistryCache(currentRegistryModule);await loadRegistry()}catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500)}finally{btn.disabled=false;btn.textContent='บันทึก'}
}
async function openCaseDetail(id){
 try{
  const data=await apiRequest('getCase',{caseId:id}),x=data.item||{};
  document.getElementById('caseDetailTitle').textContent=`รายละเอียด ${x.Case_ID||''}`;
  document.getElementById('caseDetailSub').textContent=`${x.Patient_Name||''} · สถานะ ${x.Case_Status||'-'}`;
  const pairs=currentRegistryModule==='STCPAP'?[['HN',x.HN],['VN',x.VN],['CID',x.CID],['ชื่อผู้ป่วย',x.Patient_Name],['วันที่รับบริการ',thDate(x.Service_Date)],['สิทธิ',x.Coverage],['สถานะ',x.Case_Status],['เลขกำกับเบิก',x.Claim_Control_No],['ประเภทบริการ',x.Service_Type],['TFlag',x.TFlag],['Session : Station',[x.Session||'-',x.Station||'-'].join(' : ')],['Work No.',x.Work_Order_No],['ว.แพทย์',x.Doctor_License],['Diagnosis',x.Diagnosis_Code],['ผู้รับผิดชอบ',x.Assigned_To],['หมายเหตุ',x.Remark]]:[['HN',x.HN],['VN',x.VN],['ชื่อผู้ป่วย',x.Patient_Name],['วันที่รับบริการ',thDate(x.Service_Date)],['สิทธิ',x.Coverage],['สถานะ',x.Case_Status],['Case Number',x.SSO_Case_No],['Protocol',x.Protocol_Code],['Session : Station',[x.Session||'-',x.Station||'-'].join(' : ')],['Work No.',x.Work_Order_No],['ยา Chemo',x.Chemo_Drug],['ผู้รับผิดชอบ',x.Assigned_To],['ผลล่าสุด',x.Latest_Result],['Error ล่าสุด',x.Latest_Error_Code],['หมายเหตุ',x.Remark]];
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
 const explicitModule=canonicalKnowledgeModule(item?.Module||zipReaderState.caseItem?.Module_Code||currentRegistryModule);document.getElementById('caseKnowledgeModule').value=explicitModule;document.getElementById('caseKnowledgeModule').disabled=isEdit&&authState.user?.Role!=='ADMIN';modal.dataset.sourceModule=canonicalKnowledgeModule(item?.Module||explicitModule);
 document.getElementById('caseKnowledgeCaseId').value=caseId||'';
 const draftDescription=String(item?.Description||fileDescription||'').trim()||`พบ Error Code ${String(code||item?.ErrorCode||'').trim().toUpperCase()} จากไฟล์ตอบกลับ ${knowledgeModuleLabel(explicitModule)}`;
 document.getElementById('caseKnowledgeDescription').value=draftDescription;
 document.getElementById('caseKnowledgeCause').value=item?.Cause||'';
 document.getElementById('caseKnowledgeSolution').value=item?.Solution||'';
 document.getElementById('caseKnowledgeRelatedFile').value=item?.RelatedFile||'SOCDBIL / Reply BIL';
 document.getElementById('caseKnowledgeRelatedField').value=item?.RelatedField||'Error Code';
 document.getElementById('caseKnowledgeUpdatedBy').value=authState.user?.Display_Name||'';
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
 const code=get('caseKnowledgeCode').toUpperCase(),module=canonicalKnowledgeModule(get('caseKnowledgeModule')),description=get('caseKnowledgeDescription'),cause=get('caseKnowledgeCause'),solution=get('caseKnowledgeSolution'),relatedFile=get('caseKnowledgeRelatedFile'),relatedField=get('caseKnowledgeRelatedField'),updatedBy=get('caseKnowledgeUpdatedBy'),writePin=get('caseKnowledgeWritePin'),caseId=get('caseKnowledgeCaseId');
 if(!description){toast('ข้อมูลไม่ครบ','กรุณากรอกความหมายของ Error Code','warning');return;}
 if(!updatedBy){toast('ข้อมูลไม่ครบ','กรุณากรอกชื่อผู้บันทึก','warning');return;}
 const isEdit=document.getElementById('caseKnowledgeModal')?.dataset.mode==='edit';
 if(isEdit&&!writePin){toast('กรอก PIN','กรุณากรอก PIN สำหรับแก้ไข Knowledge Base','warning');return;}
 const btn=document.getElementById('caseKnowledgeSave');btn.disabled=true;btn.textContent='กำลังบันทึก...';
 try{
  const sourceModule=canonicalKnowledgeModule(document.getElementById('caseKnowledgeModal')?.dataset.sourceModule||module);if(isEdit&&module!==sourceModule){await apiRequest('moveKnowledge',{sourceModule,sourceCode:code,targetModule:module,merge:false});}
  await apiRequest('upsertKnowledge',{items:[{Module:module,ErrorCode:code,Description:description,Cause:cause,Solution:solution,RelatedFile:relatedFile,RelatedField:relatedField,Tips:'',UpdatedBy:updatedBy,Active:true}],writePin:isEdit?writePin:'',createWithoutPin:!isEdit});
  closeCaseKnowledgeModal();toast('บันทึกสำเร็จ',`${code} ถูกบันทึกใน Knowledge Base แล้ว`,'success');
  replyImportState.knowledgeByCode[code]={Module:module,ErrorCode:code,Description:description,Cause:cause,Solution:solution,RelatedFile:relatedFile,RelatedField:relatedField,Active:true};
  replyImportState.knowledgeKnown=Object.keys(replyImportState.knowledgeByCode).length;replyImportState.knowledgeUnknown=Math.max(0,replyImportState.knowledgeUnknown-1);
  if(caseId)await openCaseDetail(caseId);if(document.getElementById('replyImportModal')?.classList.contains('show')){renderReplyImport();}
 }catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error',6500)}finally{btn.disabled=false;btn.textContent='บันทึก Knowledge';}
}

function exportRegistryCsv(){
 const rows=registryState.filtered||[];
 if(!rows.length){toast('ไม่มีข้อมูล','ไม่พบรายการตามตัวกรองที่เลือก','warning');return}
 const headers=['เลขงาน','ครั้งที่','HN','VN','CID','ชื่อผู้ป่วย','วันที่รับบริการ','Case Number','Protocol','Work Order No.','สถานะ','ผลล่าสุด','Error Code','ความหมาย Error','สาเหตุ','แนวทางแก้','ผู้รับผิดชอบ'];
 const data=rows.map(x=>[
  x.Case_ID||'',x.Current_Attempt_No||'',x.HN||'',x.VN||'',x.CID||'',x.Patient_Name||'',thDate(x.Service_Date),x.SSO_Case_No||'',x.Protocol_Code||'',x.Session||'',x.Station||'',x.Work_Order_No||'',x.Case_Status||'',x.Latest_Result||'',x.Latest_Error_Code||'',x.Latest_Error_Description||'',x.Latest_Error_Cause||'',x.Latest_Error_Solution||'',x.Assigned_To||''
 ]);
 const csv='\uFEFF'+[headers,...data].map(r=>r.map(csvCell).join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=`${currentRegistryModule}_Registry_Filtered_${DateEngine.fileStamp()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast('ส่งออกแล้ว',`ส่งออก ${rows.length} รายการตามผลการค้นหาและตัวกรองปัจจุบัน`,'success');
}

document.getElementById('registryReloadBtn')?.addEventListener('click',()=>{clearRegistryCache(currentRegistryModule);loadRegistry();});document.getElementById('addCaseBtn')?.addEventListener('click',()=>openCaseModal());document.getElementById('registrySearch')?.addEventListener('input',applyRegistryFilter);document.getElementById('registryStatusFilter')?.addEventListener('change',applyRegistryFilter);document.querySelectorAll('[data-registry-status]').forEach(card=>card.addEventListener('click',()=>{const select=document.getElementById('registryStatusFilter');if(select)select.value=card.dataset.registryStatus||'ALL';applyRegistryFilter()}));document.getElementById('registryResetFilterBtn')?.addEventListener('click',()=>{const search=document.getElementById('registrySearch'),status=document.getElementById('registryStatusFilter'),sort=document.getElementById('registrySort');if(search)search.value='';if(status)status.value='ALL';if(sort)sort.value='newest';registryState.highlightCaseId='';applyRegistryFilter()});document.getElementById('registrySort')?.addEventListener('change',applyRegistryFilter);document.getElementById('registryPageSize')?.addEventListener('change',renderRegistry);document.getElementById('registryCsvBtn')?.addEventListener('click',exportRegistryCsv);document.getElementById('caseModalClose')?.addEventListener('click',closeCaseModal);document.getElementById('caseModalCancel')?.addEventListener('click',closeCaseModal);document.getElementById('caseSaveBtn')?.addEventListener('click',saveCase);document.getElementById('caseKnowledgeCancel')?.addEventListener('click',closeCaseKnowledgeModal);document.getElementById('caseKnowledgeSave')?.addEventListener('click',saveCaseKnowledge);document.getElementById('caseDetailModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeCaseDetail()});document.getElementById('caseKnowledgeModal')?.addEventListener('click',e=>{if(e.target===e.currentTarget)closeCaseKnowledgeModal()});document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const kb=document.getElementById('caseKnowledgeModal');if(kb?.classList.contains('show')){closeCaseKnowledgeModal();return;}const detail=document.getElementById('caseDetailModal');if(detail?.classList.contains('show'))closeCaseDetail();});



/* ZIP Reader V3.2.1 — แยกข้อมูลเป็นคอลัมน์ตามโครงสร้าง SSOP */
const zipReaderState={zip:null,file:null,entries:[],selected:null,rows:[],headers:[],sections:{},activeSection:'',caseItem:null,moduleCode:'SSOCAC',profileLocked:true,dirty:false,rowSelections:{},columnFilters:{},filterPopover:null,saving:false,crossIssues:[],crossFocus:null,subsetSelected:new Set(),crossIssueHistory:{}};
function openZipReader(caseId='',explicitModule=''){
 zipReaderState.caseItem=caseId?registryState.items.find(x=>x.Case_ID===caseId)||null:null;
 const registryContext=document.getElementById('registryPage')?.classList.contains('active');
 const editorContext=document.getElementById('cancerPage')?.classList.contains('active');
 zipReaderState.moduleCode=String(explicitModule||zipReaderState.caseItem?.Module_Code||(registryContext?currentRegistryModule:(editorContext?activeEditorRuleModule():'SSOCAC'))||'SSOCAC').toUpperCase();
 zipReaderState.profileLocked=Boolean(zipReaderState.caseItem||registryContext||explicitModule);
 const label=document.getElementById('zipReaderCaseText'),moduleCode=zipReaderState.moduleCode;
 const names={SSOCAC:'Cancer Care',STCPAP:'CPAP',STSLEEP:'Sleep Test',MAIN:'Main',CROSS:'Cross'};
 const title=document.getElementById('zipReaderTitle');if(title)title.textContent=`🛠️ SSOP Editor — ${names[moduleCode]||'SSOP'}`;
 const profileLabel=document.getElementById('zipProfileLabel');if(profileLabel)profileLabel.textContent=names[moduleCode]||'SSOP';
 const profileLock=document.getElementById('zipProfileLock');if(profileLock)profileLock.textContent=zipReaderState.caseItem?'🔒 กำหนดจากทะเบียนผู้ป่วย':explicitModule?'🔒 กำหนดจาก Rule Profile':'🔒 กำหนดจากโมดูลทะเบียน';
 const validateBtn=document.getElementById('zipValidateBtn');if(validateBtn)validateBtn.textContent=`✓ ตรวจ ${names[moduleCode]||'SSOP'}`;const saveBtn=document.getElementById('zipSaveFileBtn');if(saveBtn)saveBtn.textContent='💾 บันทึกไฟล์ + MD5';const autoBtnLabel=document.getElementById('zipAutoFillBtn');if(autoBtnLabel)autoBtnLabel.textContent='✨ เติมข้อมูลจากทะเบียน';
 const dropTitle=document.getElementById('zipDropTitle'),dropHint=document.getElementById('zipDropHint');const multi=['CROSS','MAIN'].includes(moduleCode);if(dropTitle)dropTitle.textContent=multi?'ลาก ZIP SSOP (หลายผู้ป่วย) มาวางที่นี่':'ลาก ZIP ผู้ป่วยมาวางที่นี่';if(dropHint)dropHint.textContent=multi?'รองรับ ZIP SSOP ที่รวมผู้ป่วยหลายราย และสามารถสร้าง ZIP เฉพาะผู้ป่วยที่เลือกได้':'รองรับ 1 ZIP ต่อผู้ป่วย 1 ราย';
 label.textContent=zipReaderState.caseItem?`${zipReaderState.caseItem.Case_ID} · HN ${zipReaderState.caseItem.HN||'-'} · VN ${zipReaderState.caseItem.VN||'-'} · ${zipReaderState.caseItem.Patient_Name||''} · Session ${zipReaderState.caseItem.Session||'-'} : Station ${zipReaderState.caseItem.Station||'-'}`:`โหมด SSOP Editor ของ ${names[moduleCode]||'SSOP'} · เลือก ZIP ได้โดยไม่ผูกผู้ป่วย และ Rule Profile ถูกล็อกจากโมดูลทะเบียน`;
 resetZipReader();
 const autoBtn=document.getElementById('zipAutoFillBtn');if(autoBtn)autoBtn.classList.toggle('hidden',!zipReaderState.caseItem);document.querySelectorAll('.cross-only').forEach(el=>el.classList.toggle('hidden',!['CROSS','MAIN'].includes(moduleCode)));
 const m=document.getElementById('zipReaderModal');m.classList.add('show');m.setAttribute('aria-hidden','false');
}
async function closeZipReader(){
 const hasUnsaved=zipReaderState.entries.some(x=>x.modified);
 if(hasUnsaved){const ok=await confirmDialog('ยังมีข้อมูลไม่ได้บันทึก','มีข้อมูลที่แก้ไขแต่ยังไม่ได้กด “บันทึกไฟล์ + MD5” ต้องการปิดหน้าต่างและยกเลิกการแก้ไขที่ยังไม่บันทึกหรือไม่?','ปิดโดยไม่บันทึก');if(!ok)return;}
 const m=document.getElementById('zipReaderModal');m.classList.remove('show');m.setAttribute('aria-hidden','true');
}
function resetZipReader(){zipReaderState.zip=null;zipReaderState.file=null;zipReaderState.entries=[];zipReaderState.selected=null;zipReaderState.rows=[];zipReaderState.headers=[];zipReaderState.sections={};zipReaderState.activeSection='';zipReaderState.dirty=false;zipReaderState.rowSelections={};zipReaderState.saving=false;zipReaderState.crossIssues=[];zipReaderState.crossFocus=null;zipReaderState.crossIssueHistory={};const i=document.getElementById('zipFileInput');if(i)i.value='';document.getElementById('zipChooseStep')?.classList.remove('hidden');document.getElementById('zipWorkspace')?.classList.add('hidden');document.getElementById('zipSectionTabs')?.replaceChildren();document.getElementById('crossPreflight')?.classList.add('hidden');updateZipEditStatus('พร้อมตรวจสอบ')}
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
function sectionHeaders(section,rows){const width=Math.max(0,...rows.map(r=>r.length));const useStandard=['CROSS','MAIN'].includes(String(zipReaderState.moduleCode||'').toUpperCase());const known=(useStandard?(crossFieldMeta[section]||[]).map(x=>x[0]):labels[section])||[];return Array.from({length:width},(_,i)=>known[i]||`คอลัมน์ ${i+1}`)}
async function markZipLoadedForCase(fileName){
 if(!zipReaderState.caseItem)return null;
 const result=await apiRequest('markCaseZipLoaded',{Case_ID:zipReaderState.caseItem.Case_ID,Source_ZIP_Name:fileName||'',updatedBy:authState.user?.Display_Name||''});
 if(result?.changed){
  zipReaderState.caseItem.Case_Status='รอตรวจสอบ';
  const local=registryState.items.find(x=>x.Case_ID===zipReaderState.caseItem.Case_ID);if(local)local.Case_Status='รอตรวจสอบ';
  applyRegistryFilter();renderRegistryStats();
  toast('อัปโหลด ZIP แล้ว','เปลี่ยนสถานะเป็น “รอตรวจสอบ” อัตโนมัติ','success',4500);
 }
 return result;
}

function zipNormId(v,len=0){let t=String(v??'').trim().replace(/\.0$/,'');if(len&&/^\d+$/.test(t))t=t.padStart(len,'0');return t;}
function collectZipCaseSignals(rawItems){
 const out={hn:new Set(),cid:new Set(),session:new Set(),station:new Set(),allText:''};
 rawItems.forEach(x=>{
  const text=String(x.text||'');out.allText+='\n'+text;
  const sm=text.match(/<SESSNO>\s*([^<\r\n]+)\s*<\/SESSNO>/i);if(sm)out.session.add(zipNormId(sm[1]));
  const sec=x.sections||{};
  (sec.BILLTRAN||[]).forEach(r=>{if(r[0]!==undefined)out.station.add(zipNormId(r[0],2));if(r[6]!==undefined)out.hn.add(zipNormId(r[6],9));if(r[12]!==undefined)out.cid.add(zipNormId(r[12],13));});
  (sec.Dispensing||[]).forEach(r=>{if(r[3]!==undefined)out.hn.add(zipNormId(r[3],9));if(r[4]!==undefined)out.cid.add(zipNormId(r[4],13));});
  (sec.OPServices||[]).forEach(r=>{if(r[4]!==undefined)out.hn.add(zipNormId(r[4],9));if(r[5]!==undefined)out.cid.add(zipNormId(r[5],13));});
 });
 ['hn','cid','session','station'].forEach(k=>out[k].delete(''));return out;
}
function verifyZipAgainstSelectedCase(rawItems,fileName){
 const c=zipReaderState.caseItem;if(!c)return{ok:true,warnings:[],lines:[]};
 const sig=collectZipCaseSignals(rawItems),mismatch=[],warnings=[],lines=[];
 // HN / Session / Station are strict guards for a ZIP opened from a registry row.
 const strictChecks=[
  ['HN',zipNormId(c.HN,9),sig.hn],
  ['Session',zipNormId(c.Session),sig.session],
  ['Station',zipNormId(c.Station,2),sig.station]
 ];
 strictChecks.forEach(([label,expected,set])=>{
  if(!expected){mismatch.push(`${label}: ทะเบียนไม่มีค่า จึงไม่สามารถยืนยัน ZIP ได้`);return;}
  if(!set.size){mismatch.push(`${label}: ไม่พบค่าใน ZIP จึงไม่อนุญาตให้เปิดจากแถวทะเบียนนี้`);return;}
  if(!set.has(expected))mismatch.push(`${label}: ทะเบียน ${expected} แต่ ZIP พบ ${[...set].join(', ')}`);else lines.push(`${label}: ตรงกัน (${expected})`);
 });
 // CID is compared strictly when the registry contains it and the ZIP exposes it.
 const expectedCid=zipNormId(c.CID,13);
 if(expectedCid){
  if(sig.cid.size&&!sig.cid.has(expectedCid))mismatch.push(`CID: ทะเบียน ${expectedCid} แต่ ZIP พบ ${[...sig.cid].join(', ')}`);
  else if(sig.cid.has(expectedCid))lines.push(`CID: ตรงกัน (${expectedCid})`);
  else warnings.push('CID: ไม่พบค่าใน ZIP จึงใช้ HN / Session / Station เป็นตัวตรวจหลัก');
 }
 // VN is not present in every SSOP file. Compare it whenever it is actually present.
 const vn=zipNormId(c.VN);
 if(vn){const found=String(sig.allText).includes(vn);if(found)lines.push(`VN: พบ ${vn} ใน ZIP`);else warnings.push(`VN: ไม่พบ ${vn} ในเนื้อหา ZIP (แฟ้ม SSOP บางรูปแบบไม่มี VN)`);}
 const name=String(fileName||'');const fs=name.match(/_(\d{4})_(\d{1,3})_/);
 if(!fs)mismatch.push('ชื่อ ZIP: ไม่พบรูปแบบ Session_Station สำหรับยืนยันเคส');
 else{
  const fSession=zipNormId(fs[1]),fStation=zipNormId(fs[2],2);
  if(fSession!==zipNormId(c.Session))mismatch.push(`ชื่อ ZIP: Session ${fSession} ไม่ตรงทะเบียน ${zipNormId(c.Session)}`);else lines.push(`ชื่อ ZIP Session: ตรงกัน (${fSession})`);
  if(fStation!==zipNormId(c.Station,2))mismatch.push(`ชื่อ ZIP: Station ${fStation} ไม่ตรงทะเบียน ${zipNormId(c.Station,2)}`);else lines.push(`ชื่อ ZIP Station: ตรงกัน (${fStation})`);
 }
 return{ok:mismatch.length===0,mismatch,warnings,lines};
}
async function handleZipFile(file){if(!file)return;if(!window.JSZip){toast('เปิด ZIP ไม่ได้','ไม่พบไลบรารี JSZip กรุณาตรวจสอบอินเทอร์เน็ต','error');return}if(!/\.zip$/i.test(file.name)){toast('ชนิดไฟล์ไม่ถูกต้อง','กรุณาเลือกไฟล์ .zip','warning');return}try{
 const chooseStep=document.getElementById('zipChooseStep'),workspace=document.getElementById('zipWorkspace'),chooseBtn=document.getElementById('zipChooseBtn');
 if(chooseBtn){chooseBtn.disabled=true;chooseBtn.textContent='กำลังตรวจ ZIP...';}
 // Do not reveal the editor until identity checks pass.
 chooseStep?.classList.remove('hidden');workspace?.classList.add('hidden');
 const zip=await JSZip.loadAsync(file);const rawEntries=Object.values(zip.files).filter(e=>!e.dir);const entries=[];const logicalPresent=new Set(),verifyItems=[];
 for(const e of rawEntries){let logicalSections=[],text='';try{const buf=await e.async('arraybuffer');text=decodeSsopBuffer(buf);const parsed=parseZipSsopSections(text);logicalSections=Object.keys(parsed);logicalSections.forEach(x=>logicalPresent.add(x));verifyItems.push({name:e.name,text,sections:parsed});}catch(_e){}
  entries.push({name:e.name,size:e._data?.uncompressedSize||0,type:classifySsopFile(e.name),logicalSections,entry:e,text:text||null,originalText:text||null,sections:text?parseZipSsopSections(text):null,modified:false,saved:false,savedText:null,plainDelimiter:null,plainHasHeader:false,autoChangedCells:{},editedCells:{},editedRows:{},changeStats:{cells:0,added:0,deleted:0}});
 }
 const requiredSsop=['BILLTRAN','BillItems','OPServices'];
 const missingCore=requiredSsop.filter(x=>!logicalPresent.has(x));
 const hasBillDisp=logicalPresent.has('Dispensing')||logicalPresent.has('DispensedItems');
 if(missingCore.length||!hasBillDisp){
  const miss=[...missingCore];if(!hasBillDisp)miss.push('BILLDISP (Dispensing/DispensedItems)');
  throw new Error('ZIP นี้ไม่เข้าโครงสร้าง SSOP ที่รองรับ · ไม่พบ '+miss.join(', '));
 }
 const verified=verifyZipAgainstSelectedCase(verifyItems,file.name);
 if(!verified.ok){throw new Error('ZIP ไม่ตรงกับแถวผู้ป่วยที่เลือก\n'+verified.mismatch.join('\n'));}
 chooseStep?.classList.add('hidden');workspace?.classList.remove('hidden');
 const summary=document.getElementById('zipSummary');
 zipReaderState.zip=zip;zipReaderState.file=file;zipReaderState.entries=entries;
 const expected=['BILLTRAN','BillItems','Dispensing','DispensedItems','OPServices','OPDx'];const missing=expected.filter(x=>!logicalPresent.has(x));
 summary.innerHTML=`<div class="summary-card"><span>ชื่อ ZIP</span><strong>${escapeHtml(file.name)}</strong></div><div class="summary-card"><span>จำนวนไฟล์</span><strong>${entries.length}</strong></div><div class="summary-card"><span>ส่วนข้อมูลที่อ่านได้</span><strong>${logicalPresent.size}</strong></div><div class="summary-card ${missing.length?'warn':''}"><span>ส่วนข้อมูลที่ยังไม่พบ</span><strong>${missing.length?escapeHtml(missing.join(', ')):'พบส่วนข้อมูลมาตรฐานครบ'}</strong></div>`;
 renderZipFileList();if(entries.length)await selectZipEntry(entries[0].name);
 if(String(zipReaderState.moduleCode||'').toUpperCase()==='CROSS'){runCrossPreflight();}
 if(zipReaderState.caseItem){if(verified.warnings.length)toast('ตรวจเคสแล้ว มีข้อสังเกต',verified.warnings.join(' · '),'warning',8000);else toast('ตรวจสอบเคสตรงกัน',verified.lines.join(' · '),'success',5000);markZipLoadedForCase(file.name).catch(err=>{console.warn('markCaseZipLoaded failed',err);toast('อ่าน ZIP สำเร็จ','เปิดข้อมูลได้แล้ว แต่ยังอัปเดตสถานะทะเบียนไม่สำเร็จ: '+(err.message||'กรุณาลองสร้าง ZIP อีกครั้ง'),'warning',7000)})}
 }catch(err){resetZipReader();toast('ไม่อนุญาตให้เปิด ZIP',err.message||'ไฟล์ ZIP อาจเสียหายหรือไม่ตรงกับเคสที่เลือก','error',12000)}finally{const b=document.getElementById('zipChooseBtn');if(b){b.disabled=false;b.textContent='เลือกไฟล์ ZIP';}}}
function renderZipFileList(){const wrap=document.getElementById('zipFileList');wrap.innerHTML=zipReaderState.entries.length?zipReaderState.entries.map(e=>`<button class="zip-file-item ${zipReaderState.selected===e.name?'active':''}" data-zip-entry="${escapeHtml(e.name)}"><span class="zip-file-icon">📄</span><span class="grow"><b>${escapeHtml(baseName(e.name))}</b><small>${escapeHtml(e.logicalSections.length?e.logicalSections.join(' + '):e.type)} · ${(e.size/1024).toFixed(1)} KB ${e.modified?'· ✏️ แก้ไขแล้ว':e.saved?'· ✓ บันทึกในงานแล้ว':''}</small></span></button>`).join(''):'<div class="empty-row">ไม่พบไฟล์ภายใน ZIP</div>';wrap.querySelectorAll('[data-zip-entry]').forEach(b=>b.onclick=()=>selectZipEntry(b.dataset.zipEntry))}
async function selectZipEntry(name){const item=zipReaderState.entries.find(e=>e.name===name);if(!item)return;zipReaderState.selected=name;renderZipFileList();document.getElementById('zipPreviewTitle').textContent=baseName(name);document.getElementById('zipPreviewMeta').textContent=`${item.type} · กำลังอ่านข้อมูล...`;document.getElementById('zipPreviewBody').innerHTML='<tr><td class="empty-row">กำลังอ่านไฟล์...</td></tr>';try{const buf=await item.entry.async('arraybuffer');const text=item.text??decodeSsopBuffer(buf);if(item.text===null){item.text=text;item.originalText=text}const sections=item.sections??parseZipSsopSections(text);item.sections=sections;zipReaderState.sections=sections;zipReaderState.dirty=!!item.modified;updateZipEditStatus();const names=Object.keys(sections);const search=document.getElementById('zipTableSearch');search.disabled=false;search.value='';if(names.length){zipReaderState.activeSection=names[0];renderZipSectionTabs();selectZipSection(names[0])}else{const parsed=parseSsopText(text);const firstLine=String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).find(x=>x.trim()!=='')||'';item.plainDelimiter=detectDelimiter(firstLine)||'|';item.plainHasHeader=parsed.headers.some(h=>!/^คอลัมน์ \d+$/.test(h)&&h!=='ข้อความ');item.plainRows=parsed.rows;item.plainHeaders=parsed.headers;zipReaderState.activeSection='';zipReaderState.headers=item.plainHeaders;zipReaderState.rows=item.plainRows;renderZipSectionTabs();document.getElementById('zipPreviewMeta').textContent=`${item.type} · ${parsed.rows.length.toLocaleString('th-TH')} แถว · ${parsed.headers.length} คอลัมน์`;renderZipPreview()}}catch(err){document.getElementById('zipPreviewBody').innerHTML=`<tr><td class="empty-row">อ่านไฟล์ไม่ได้: ${escapeHtml(err.message)}</td></tr>`}}
function renderZipSectionTabs(){const wrap=document.getElementById('zipSectionTabs');if(!wrap)return;const names=Object.keys(zipReaderState.sections||{});wrap.innerHTML=names.map(name=>`<button class="zip-section-tab ${zipReaderState.activeSection===name?'active':''}" data-zip-section="${escapeHtml(name)}">${escapeHtml(name)} <span>${zipReaderState.sections[name].length}</span></button>`).join('');wrap.querySelectorAll('[data-zip-section]').forEach(b=>b.onclick=()=>selectZipSection(b.dataset.zipSection))}
function selectZipSection(section){zipReaderState.activeSection=section;const rows=zipReaderState.sections[section]||[];zipReaderState.rows=rows;zipReaderState.headers=sectionHeaders(section,rows);renderZipSectionTabs();const info=sectionInfo[section];document.getElementById('zipPreviewMeta').textContent=`${info?.title||section} · ${rows.length.toLocaleString('th-TH')} แถว · ${zipReaderState.headers.length} คอลัมน์`;renderZipPreview()}
function zipSelectionKey(){return `${zipReaderState.selected||''}::${zipReaderState.activeSection||'__PLAIN__'}`}
function currentZipSelection(){const key=zipSelectionKey();if(!zipReaderState.rowSelections[key])zipReaderState.rowSelections[key]=new Set();return zipReaderState.rowSelections[key]}
function updateZipRowTools(){
 const selected=currentZipSelection();const del=document.getElementById('zipDeleteRowsBtn');const add=document.getElementById('zipAddRowBtn');const count=document.getElementById('zipSelectedCount');
 if(del)del.disabled=selected.size===0;if(add)add.disabled=!zipReaderState.selected||(!zipReaderState.activeSection&&!currentZipItem()?.plainRows);if(count)count.textContent=`เลือก ${selected.size.toLocaleString('th-TH')} แถว`;
 const all=document.getElementById('zipSelectAllRows');if(all){const visible=[...document.querySelectorAll('[data-zip-select-row]')];all.checked=visible.length>0&&visible.every(x=>x.checked);all.indeterminate=visible.some(x=>x.checked)&&!all.checked}
}
function markCurrentZipModified(kind='cell'){const item=currentZipItem();if(item){item.modified=true;if(zipReaderState.activeSection)item.sections=zipReaderState.sections;else{item.plainRows=zipReaderState.rows;item.plainHeaders=zipReaderState.headers}item.changeStats=item.changeStats||{cells:0,added:0,deleted:0};if(kind==='cell')item.changeStats.cells++;if(kind==='add')item.changeStats.added++;if(kind==='delete')item.changeStats.deleted++}zipReaderState.dirty=true;updateZipEditStatus('ยังไม่ได้บันทึก')}
function addZipRow(){
 const item=currentZipItem();if(!zipReaderState.selected||!item){toast('ยังเพิ่มแถวไม่ได้','กรุณาเลือกไฟล์ก่อน','warning');return}
 const rows=zipReaderState.activeSection?(zipReaderState.sections[zipReaderState.activeSection]||[]):(item.plainRows||zipReaderState.rows||[]);const width=Math.max(zipReaderState.headers.length,(fieldMeta[zipReaderState.activeSection]||[]).length,1);rows.push(Array(width).fill(''));zipReaderState.rows=rows;if(zipReaderState.activeSection){zipReaderState.headers=sectionHeaders(zipReaderState.activeSection,rows)}else{item.plainRows=rows}markCurrentZipModified('add');renderZipSectionTabs();renderZipPreview();
 const tableWrap=document.querySelector('.zip-table-wrap');if(tableWrap)setTimeout(()=>{tableWrap.scrollTop=tableWrap.scrollHeight},0);toast('เพิ่มแถวแล้ว',`เพิ่มแถวว่างใน ${zipReaderState.activeSection||baseName(item.name)} กรุณากรอกข้อมูลให้ครบ`,'success',3500)
}
async function deleteSelectedZipRows(){
 const selected=currentZipSelection();if(!selected.size)return;const count=selected.size;
 const ok=await confirmDialog('ยืนยันการลบแถว',`ต้องการลบ ${count.toLocaleString('th-TH')} แถวที่เลือกจาก ${zipReaderState.activeSection||baseName(currentZipItem()?.name||'ไฟล์')} ใช่หรือไม่?\n\nสามารถกด “คืนค่าไฟล์นี้” เพื่อย้อนกลับเป็นไฟล์ต้นฉบับได้`,'ลบแถว');if(!ok)return;
 const item=currentZipItem();const rows=zipReaderState.activeSection?(zipReaderState.sections[zipReaderState.activeSection]||[]):(item?.plainRows||zipReaderState.rows||[]);[...selected].sort((a,b)=>b-a).forEach(i=>{if(i>=0&&i<rows.length)rows.splice(i,1)});selected.clear();zipReaderState.rows=rows;if(zipReaderState.activeSection)zipReaderState.headers=sectionHeaders(zipReaderState.activeSection,rows);else if(item)item.plainRows=rows;markCurrentZipModified('delete');renderZipSectionTabs();renderZipPreview();toast('ลบแถวแล้ว',`ลบ ${count.toLocaleString('th-TH')} แถวจาก ${zipReaderState.activeSection||baseName(item?.name||'ไฟล์')}`,'success',3500)
}
function zipModuleCode(){return String(zipReaderState.caseItem?.Module_Code||'').toUpperCase()}
function zipIsCpap(){return zipModuleCode()==='STCPAP'}
function zipIsSleep(){return zipModuleCode()==='STSLEEP'}
function zipFieldMeta(section,index){
 const base=(fieldMeta[section]||[])[index];
 if(zipIsCpap()){
  const overrides={
   BILLTRAN:{1:['AuthCode','รหัสโครงการสำหรับ CPAP ต้องเป็น STCPAP และระบบปรับให้อัตโนมัติ','STCPAP','important'],11:['Tflag','ประเภทการส่งข้อมูล ดึงจากทะเบียน SSOCPAP และยังแก้ไขเองได้','A หรือ E','important']},
   BillItems:{4:['STDCode','รหัสมาตรฐานรายการ CPAP/หน้ากาก เช่น 3012 หรือ 3013','3012 / 3013','important'],12:['ClaimCat','เมื่อ STDCode เป็น 3012 หรือ 3013 ต้องระบุ OPF','OPF','important']},
   OPServices:{2:['Class','ประเภทบริการ CPAP ต้องเป็น ED','ED','important'],11:['SvPID','เลขใบอนุญาตประกอบวิชาชีพแพทย์ (ว.แพทย์)','ว22858','important'],20:['SvTxCode','เลขกำกับเบิก ดึงจากทะเบียน SSOCPAP','เลขกำกับเบิก','important']},
   OPDx:{0:['Class','ประเภทข้อมูลวินิจฉัย CPAP ต้องเป็น ED และตรงกับ OPServices.Class','ED','important'],4:['DiagnosisCode','รหัสวินิจฉัย สามารถเว้นว่างใน Excel แล้วกรอกหรือแก้ไขภายหลังได้','เช่น G473','important']}
  };
  return overrides[section]?.[index]||base;
 }
 if(zipIsSleep()){
  const overrides={
   BILLTRAN:{1:['AuthCode','รหัสโครงการสำหรับ Sleep Test ต้องเป็น STCPAP และระบบปรับให้อัตโนมัติ','STCPAP','important'],11:['Tflag','ประเภทการส่งข้อมูล ดึงจากทะเบียน Sleep Test','A หรือ E','important']},
   BillItems:{4:['STDCode','รหัสมาตรฐาน Sleep Test: 51120 ชนิดที่ 1 หรือ 51121 ชนิดที่ 2','51120 / 51121','important'],12:['ClaimCat','เมื่อ STDCode เป็น 51120 หรือ 51121 ต้องระบุ OPF','OPF','important']},
   OPServices:{2:['Class','Class ของ OPServices ต้องตรงกับ OPDx.Class โดยคงค่าจากแฟ้มต้นฉบับ','ตัวอย่าง EC','important'],20:['SvTxCode','เลขกำกับเบิก ดึงจากทะเบียน Sleep Test','เลขกำกับเบิก','important']},
   OPDx:{0:['Class','Class ของ OPDx ต้องตรงกับ OPServices.Class','ตัวอย่าง EC','important'],4:['DiagnosisCode','รหัสวินิจฉัย ดึงจาก PDx.ICD10 ในทะเบียน และยังแก้ไขเองได้','เช่น G473','important']}
  };
  return overrides[section]?.[index]||base;
 }
 return base;
}
function zipImportantCols(section){
 if(zipIsCpap())return ({BILLTRAN:[1,11,14,15],BillItems:[4,12],OPServices:[2,11,20],OPDx:[0,4]})[section]||[];
 if(zipIsSleep())return ({BILLTRAN:[1,11,14,15],BillItems:[4,12],OPServices:[2,20],OPDx:[0,4]})[section]||[];
 const baseCols=(sectionInfo[section]?.importantCols)||[];
 if(section==='BILLTRAN')return [...new Set([...baseCols,1,14,15])];
 if(section==='OPDx')return [...new Set([...baseCols,4])];
 return baseCols;
}

function zipFilterKey(){const item=currentZipItem();return `${item?.name||''}::${zipReaderState.activeSection||''}`;}
function currentZipColumnFilters(){const key=zipFilterKey();if(!zipReaderState.columnFilters[key])zipReaderState.columnFilters[key]={};return zipReaderState.columnFilters[key];}
function zipFilteredIndexedRows(query=''){
  const q=String(query||'').trim().toLowerCase(), filters=currentZipColumnFilters();
  return zipReaderState.rows.map((r,i)=>({r,i})).filter(x=>{
    if(q&&!x.r.some(v=>String(v??'').toLowerCase().includes(q)))return false;
    return Object.entries(filters).every(([col,values])=>{
      if(!values||!values.length)return true;
      return values.includes(String(x.r[Number(col)]??''));
    });
  });
}
function closeZipColumnFilter(){document.getElementById('zipColumnFilterPopover')?.remove();zipReaderState.filterPopover=null;}
function openZipColumnFilter(col,anchor){
  closeZipColumnFilter();
  const values=[...new Set(zipReaderState.rows.map(r=>String(r[col]??'')))].sort((a,b)=>a.localeCompare(b,'th',{numeric:true}));
  const active=currentZipColumnFilters()[col]||[];
  const pop=document.createElement('div');pop.id='zipColumnFilterPopover';pop.className='zip-column-filter-popover';
  pop.innerHTML=`<div class="zip-filter-title"><b>${escapeHtml(zipReaderState.headers[col]||'คอลัมน์')}</b><button type="button" class="zip-filter-close">×</button></div>
  <input class="zip-filter-search" placeholder="ค้นหาค่า..." autocomplete="off">
  <label class="zip-filter-all"><input type="checkbox" data-filter-all ${active.length===0?'checked':''}> ทั้งหมด</label>
  <div class="zip-filter-values">${values.map((v,i)=>`<label><input type="checkbox" data-filter-value="${escapeAttr(v)}" ${active.includes(v)?'checked':''}> <span>${escapeHtml(v||'(ว่าง)')}</span></label>`).join('')}</div>
  <div class="zip-filter-actions"><button type="button" class="soft" data-filter-clear>ล้าง</button><button type="button" class="primary" data-filter-apply>ใช้ตัวกรอง</button></div>`;
  document.body.appendChild(pop);
  const rect=anchor.getBoundingClientRect(), w=300;
  pop.style.left=Math.max(8,Math.min(innerWidth-w-8,rect.left))+'px';
  pop.style.top=Math.min(innerHeight-pop.offsetHeight-8,rect.bottom+6)+'px';
  pop.querySelector('.zip-filter-close').onclick=closeZipColumnFilter;
  const search=pop.querySelector('.zip-filter-search');
  search.oninput=()=>{const q=search.value.toLowerCase();pop.querySelectorAll('.zip-filter-values label').forEach(l=>l.hidden=!l.textContent.toLowerCase().includes(q));};
  pop.querySelector('[data-filter-all]').onchange=e=>{if(e.target.checked)pop.querySelectorAll('[data-filter-value]').forEach(x=>x.checked=false);};
  pop.querySelectorAll('[data-filter-value]').forEach(x=>x.onchange=()=>{pop.querySelector('[data-filter-all]').checked=false;});
  pop.querySelector('[data-filter-clear]').onclick=()=>{delete currentZipColumnFilters()[col];closeZipColumnFilter();renderZipPreview();};
  pop.querySelector('[data-filter-apply]').onclick=()=>{
    const selected=[...pop.querySelectorAll('[data-filter-value]:checked')].map(x=>x.dataset.filterValue);
    if(pop.querySelector('[data-filter-all]').checked||selected.length===0)delete currentZipColumnFilters()[col];else currentZipColumnFilters()[col]=selected;
    closeZipColumnFilter();renderZipPreview();
  };
  setTimeout(()=>search.focus(),0);
}
function clearAllZipColumnFilters(){zipReaderState.columnFilters[zipFilterKey()]={};closeZipColumnFilter();renderZipPreview();}

function markZipUserEdited_(item,section,row,col){
 if(!item)return;if(!item.editedCells)item.editedCells={};if(!item.editedRows)item.editedRows={};const sec=section||'__PLAIN__';
 if(!item.editedCells[sec])item.editedCells[sec]=new Set();if(!item.editedRows[sec])item.editedRows[sec]=new Set();item.editedCells[sec].add(`${row}|${col}`);item.editedRows[sec].add(row);
}
function zipRowWasEdited_(entry,section,rowIndex){const item=zipReaderState.entries.find(x=>x.name===entry);return !!item?.editedRows?.[section||'__PLAIN__']?.has(rowIndex);}
function zipCellWasEdited_(item,section,row,col){return !!item?.editedCells?.[section||'__PLAIN__']?.has(`${row}|${col}`);}
const ZIP_MONEY_TOTAL_FIELDS=new Set(['Amount','ChargeAmt','ClaimAmt','ClaimAmount','Paid','OtherPay','ReimbAmt']);
function zipMoneyNumber_(value){const t=String(value??'').trim().replace(/,/g,'');if(!t)return null;const n=Number(t);return Number.isFinite(n)?n:null;}
function renderZipFilteredTotals_(filtered){
 const box=document.getElementById('zipFilteredTotals');if(!box)return;
 const moneyCols=zipReaderState.headers.map((h,i)=>({h:String(h||'').trim(),i})).filter(x=>ZIP_MONEY_TOTAL_FIELDS.has(x.h));
 if(!moneyCols.length){box.classList.add('hidden');box.innerHTML='';return;}
 const cards=moneyCols.map(x=>{let sum=0,valid=0;filtered.forEach(o=>{const n=zipMoneyNumber_(o.r[x.i]);if(n!==null){sum+=n;valid++;}});return `<div class="zip-total-card"><span>${escapeHtml(x.h)}</span><b>${sum.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2})}</b><small>${valid.toLocaleString('th-TH')} ค่า</small></div>`;});
 box.innerHTML=`<div class="zip-total-caption"><strong>∑ ผลรวมตามตัวกรอง</strong><span>คำนวณจาก ${filtered.length.toLocaleString('th-TH')} แถวทั้งหมดที่ตรงกับ Search/Filter (แม้ตารางแสดงสูงสุด 500 แถว)</span></div>${cards.join('')}`;
 box.classList.remove('hidden');
}
function renderZipPreview(){
 const q=(document.getElementById('zipTableSearch')?.value||'').trim().toLowerCase();
 const filtered=zipFilteredIndexedRows(q),rows=filtered.slice(0,500),filters=currentZipColumnFilters();
 renderZipFilteredTotals_(filtered);
 const importantCols=zipImportantCols(zipReaderState.activeSection),selected=currentZipSelection();
 document.getElementById('zipPreviewHead').innerHTML=`<tr><th class="zip-select-col"><input type="checkbox" id="zipSelectAllRows" aria-label="เลือกทุกแถวที่แสดง" title="เลือกทุกแถวที่แสดง"></th><th>#</th>${zipReaderState.headers.map((h,i)=>{const meta=zipFieldMeta(zipReaderState.activeSection,i),desc=meta?.[1]||'ยังไม่มีคำอธิบายสำหรับหัวข้อนี้',example=meta?getConditionExample(zipReaderState.activeSection,meta):'',active=Array.isArray(filters[i])&&filters[i].length;return `<th class="field-tip ${importantCols.includes(i)?'important-head':''} ${active?'zip-filter-active':''}" data-tip-title="${escapeAttr(h)}" data-tip-desc="${escapeAttr(desc)}" data-tip-example="${escapeAttr(example)}"><span class="head-wrap">${escapeHtml(h)}${importantCols.includes(i)?' ★':''}<span class="tip-dot">i</span><button type="button" class="zip-filter-btn" data-zip-filter-col="${i}" title="กรองคอลัมน์ ${escapeAttr(h)}">${active?'●':'▾'}</button></span></th>`}).join('')}</tr>`;
 bindTooltips();
 document.querySelectorAll('[data-zip-filter-col]').forEach(btn=>btn.onclick=e=>{e.stopPropagation();openZipColumnFilter(Number(btn.dataset.zipFilterCol),btn)});
 const body=document.getElementById('zipPreviewBody');
 body.innerHTML=rows.length?rows.map(x=>{const item=currentZipItem(),edited=zipRowWasEdited_(item?.name||'',zipReaderState.activeSection,x.i);return `<tr data-zip-row-index="${x.i}" class="${selected.has(x.i)?'zip-row-selected':''} ${edited?'zip-row-edited':''}"><td class="zip-select-col"><input type="checkbox" data-zip-select-row="${x.i}" ${selected.has(x.i)?'checked':''} aria-label="เลือกแถว ${x.i+1}"></td><td>${x.i+1}${edited?'<span class="edit-mark" title="มีการแก้ไขแล้ว">●</span>':''}</td>${zipReaderState.headers.map((_,c)=>`<td contenteditable="true" data-zip-row="${x.i}" data-zip-col="${c}" class="zip-edit-cell ${importantCols.includes(c)?'important-cell':''} ${item?.autoChangedCells?.[zipReaderState.activeSection]?.has(`${x.i}|${c}`)?'auto-filled':''} ${zipCellWasEdited_(item,zipReaderState.activeSection,x.i,c)?'user-edited':''}" title="${escapeAttr(x.r[c]??'')}">${escapeHtml(x.r[c]??'')}</td>`).join('')}</tr>`}).join(''):`<tr><td colspan="${zipReaderState.headers.length+2}" class="empty-row">ไม่พบข้อมูลตามตัวกรอง</td></tr>`;
 body.querySelectorAll('[data-zip-row]').forEach(td=>td.addEventListener('input',()=>{const r=+td.dataset.zipRow,c=+td.dataset.zipCol,item=currentZipItem();zipReaderState.rows[r][c]=td.textContent;markZipUserEdited_(item,zipReaderState.activeSection,r,c);markCurrentZipModified();td.classList.add('changed','user-edited');td.closest('tr')?.classList.add('zip-row-edited')}));
 body.querySelectorAll('[data-zip-select-row]').forEach(cb=>cb.addEventListener('change',()=>{const i=+cb.dataset.zipSelectRow;if(cb.checked)selected.add(i);else selected.delete(i);cb.closest('tr')?.classList.toggle('zip-row-selected',cb.checked);updateZipRowTools()}));
 const selectAll=document.getElementById('zipSelectAllRows');if(selectAll)selectAll.addEventListener('change',()=>{rows.forEach(x=>selectAll.checked?selected.add(x.i):selected.delete(x.i));renderZipPreview()});
 updateZipRowTools();
 const meta=document.getElementById('zipPreviewMeta');
 if(meta){const activeCount=Object.values(filters).filter(v=>v?.length).length;meta.textContent=`แสดง ${Math.min(filtered.length,500).toLocaleString('th-TH')} จาก ${filtered.length.toLocaleString('th-TH')} แถว${activeCount?` · กรอง ${activeCount} คอลัมน์`:''}`;}
}
function currentZipItem(){return zipReaderState.entries.find(e=>e.name===zipReaderState.selected)||null}
function updateZipEditStatus(text){const el=document.getElementById('zipEditStatus');if(!el)return;const current=currentZipItem();el.textContent=text||(current?.modified?'ยังไม่ได้บันทึก':current?.saved?'บันทึกแล้ว · MD5 ใหม่':'พร้อมแก้ไข');el.className='status '+(current?.modified||zipReaderState.dirty?'warn':'ok')}
function rebuildZipEntry(item){
 let text=item.originalText||item.text||'';const ending=text.includes('\r\n')?'\r\n':'\n';
 if(item.sections&&Object.keys(item.sections).length){
  for(const [sec,rows] of Object.entries(item.sections)){const body=rows.map(r=>r.join('|')).join(ending);const re=new RegExp(`(<${sec}>)[\\s\\S]*?(</${sec}>)`,'i');if(re.test(text))text=text.replace(re,`$1${ending}${body}${ending}$2`);}
 }else if(item.plainRows){
  const delimiter=item.plainDelimiter||'|';const lines=[];if(item.plainHasHeader&&item.plainHeaders?.length)lines.push(item.plainHeaders.join(delimiter));lines.push(...item.plainRows.map(r=>r.join(delimiter)));text=lines.join(ending);
 }
 text=text.replace(/<\?EndNote\s+CheckSum="[^"]*"\?>\s*$/i,'').replace(/<\?EndNote\s+Checksum="[^"]*"\?>\s*$/i,'');text=text.replace(/\s+$/,'')+ending;const sum=md5(cp874Bytes(text));return text+`<?EndNote Checksum="${sum}"?>`+ending;
}
async function saveZipItem(item,{silent=false}={}){
 if(!item||!item.modified)return false;const rebuilt=rebuildZipEntry(item);zipReaderState.zip.file(item.name,cp874Bytes(rebuilt));item.text=rebuilt;item.savedText=rebuilt;item.lastMd5=(rebuilt.match(/<\?EndNote\s+Checksum="([^"]+)"\?>/i)||[])[1]||'';item.saved=true;item.modified=false;item.entry=zipReaderState.zip.file(item.name);if(!silent)toast('บันทึกในพื้นที่ทำงานแล้ว',`${baseName(item.name)} สร้าง MD5 ${item.lastMd5||'-'} แล้วใน ZIP ที่กำลังแก้ไขภายใน Browser · ยังไม่ได้เขียนทับไฟล์ต้นฉบับบนเครื่อง ให้กด “บันทึก ZIP ลงเครื่อง...” เพื่อได้ไฟล์จริง`,'success',7500);return true;
}
async function saveCurrentZipFile(){
 const item=currentZipItem();if(!item){toast('ยังไม่ได้เลือกไฟล์','กรุณาเลือกไฟล์ภายใน ZIP ก่อน','warning');return;}if(!item.modified){updateZipEditStatus('บันทึกแล้ว · ไม่มีข้อมูลเปลี่ยนแปลง');toast('ไม่มีข้อมูลเปลี่ยนแปลง','ไฟล์ปัจจุบันตรงกับข้อมูลที่บันทึกแล้ว','info');return;}
 try{zipReaderState.saving=true;updateZipEditStatus('กำลังบันทึกและสร้าง MD5...');await saveZipItem(item);zipReaderState.dirty=zipReaderState.entries.some(x=>x.modified);updateZipEditStatus(`บันทึกในงานแล้ว · MD5 ${item.lastMd5||'พร้อมใช้'} · ยังไม่เขียนทับไฟล์ต้นฉบับ`);renderZipFileList();const note=document.getElementById('zipSaveLocationNote');if(note)note.textContent='✓ บันทึก MD5 ใน ZIP ที่กำลังแก้ไขภายใน Browser แล้ว · ต้องกด “บันทึก ZIP ลงเครื่อง...” เพื่อสร้างไฟล์บนเครื่อง';}catch(err){updateZipEditStatus('บันทึกไม่สำเร็จ');toast('บันทึกไฟล์ไม่สำเร็จ',err.message,'error',6500)}finally{zipReaderState.saving=false;}
}
async function saveAllModifiedZipFiles(){let count=0;for(const item of zipReaderState.entries){if(item.modified){await saveZipItem(item,{silent:true});count++;}}zipReaderState.dirty=false;return count;}
function zipChangeSummary(){return zipReaderState.entries.reduce((o,item)=>{const c=item.changeStats||{};o.cells+=c.cells||0;o.added+=c.added||0;o.deleted+=c.deleted||0;return o},{cells:0,added:0,deleted:0});}

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
 const moduleCode=String(c.Module_Code||'').toUpperCase();
 const cpap=moduleCode==='STCPAP',sleep=moduleCode==='STSLEEP';
 if(cpap||sleep){
  const required=cpap?[['TFlag',c.TFlag],['เลขกำกับเบิก',c.Claim_Control_No],['ว.แพทย์',c.Doctor_License]]:[['TFlag',c.TFlag],['เลขกำกับเบิก',c.Claim_Control_No]];
  const missing=required.filter(([,v])=>!String(v||'').trim()).map(([k])=>k);
  if(missing.length){const ok=await showDialog('ข้อมูลทะเบียนยังไม่ครบ',`ไม่พบ ${missing.join(', ')} ในทะเบียน ${cpap?'SSOCPAP':'Sleep Test'}
ระบบจะปรับปรุงเฉพาะข้อมูลที่มีอยู่ และทุกฟิลด์ยังแก้ไขเองได้ ต้องการดำเนินการต่อหรือไม่`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ดำเนินการต่อ',value:true,className:'primary'}]);if(!ok)return;}
  const stats={AuthCode:0,TFlag:0,ClaimCat:0,Class:0,SvPID:0,SvTxCode:0,Diagnosis:0};
  for(const item of zipReaderState.entries){
   if(item.text===null){try{const buf=await item.entry.async('arraybuffer');item.text=decodeSsopBuffer(buf);item.originalText=item.text;}catch(_e){continue;}}
   if(!item.sections)item.sections=parseZipSsopSections(item.text||'');
   (item.sections.BILLTRAN||[]).forEach((_,r)=>{setZipAutoValue(item,'BILLTRAN',r,1,'STCPAP',stats,'AuthCode');if(String(c.TFlag||'').trim())setZipAutoValue(item,'BILLTRAN',r,11,c.TFlag,stats,'TFlag');});
   (item.sections.BillItems||[]).forEach((row,r)=>{const std=String(row[4]||'').trim();const targets=cpap?['3012','3013']:['51120','51121'];if(targets.includes(std))setZipAutoValue(item,'BillItems',r,12,'OPF',stats,'ClaimCat');});
   (item.sections.OPServices||[]).forEach((row,r)=>{
    if(cpap){setZipAutoValue(item,'OPServices',r,2,'ED',stats,'Class');if(String(c.Doctor_License||'').trim())setZipAutoValue(item,'OPServices',r,11,c.Doctor_License,stats,'SvPID');}
    if(String(c.Claim_Control_No||'').trim())setZipAutoValue(item,'OPServices',r,20,c.Claim_Control_No,stats,'SvTxCode');
   });
   (item.sections.OPDx||[]).forEach((row,r)=>{
    if(cpap)setZipAutoValue(item,'OPDx',r,0,'ED',stats,'Class');
    if(sleep){const opClass=String((item.sections.OPServices||[])[0]?.[2]||'').trim();if(opClass)setZipAutoValue(item,'OPDx',r,0,opClass,stats,'Class');}
    if(String(c.Diagnosis_Code||'').trim())setZipAutoValue(item,'OPDx',r,4,c.Diagnosis_Code,stats,'Diagnosis');
   });
  }
  const current=currentZipItem();if(current){zipReaderState.sections=current.sections||{};zipReaderState.dirty=!!current.modified;const active=zipReaderState.activeSection;if(active&&zipReaderState.sections[active])selectZipSection(active);else{const names=Object.keys(zipReaderState.sections);if(names.length)selectZipSection(names[0]);}}
  const total=Object.values(stats).reduce((a,b)=>a+b,0);updateZipEditStatus(total?`ปรับปรุงอัตโนมัติ ${total} จุด`:'ข้อมูลตรงกับทะเบียนแล้ว');
  const lines=[`AuthCode: ${stats.AuthCode} จุด`,`TFlag: ${stats.TFlag} จุด`,`ClaimCat: ${stats.ClaimCat} จุด`,`Class: ${stats.Class} จุด`,`SvPID: ${stats.SvPID} จุด`,`SvTxCode: ${stats.SvTxCode} จุด`,`Diagnosis: ${stats.Diagnosis} จุด`];
  showDialog(total?`ปรับปรุงข้อมูล ${cpap?'CPAP':'Sleep Test'} อัตโนมัติแล้ว`:'ข้อมูลตรงกับทะเบียนแล้ว',lines.join('\n')+'\n\nทุกฟิลด์ยังสามารถแก้ไขเองได้ก่อนบันทึก',total?'success':'info');return;
 }
 const required=[['Case Number',c.SSO_Case_No],['Protocol Code',c.Protocol_Code],['TFlag',c.TFlag]];
 const missing=required.filter(([,v])=>!String(v||'').trim()).map(([k])=>k);
 if(missing.length){const ok=await showDialog('ข้อมูลทะเบียนยังไม่ครบ',`ไม่พบ ${missing.join(', ')} ในทะเบียน Case_SSOCAC
ระบบจะปรับปรุงเฉพาะข้อมูลที่มีอยู่ ต้องการดำเนินการต่อหรือไม่`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ดำเนินการต่อ',value:true,className:'primary'}]);if(!ok)return;}
 const stats={AuthCode:0,MemberNo:0,VerCode:0,TFlag:0,ClaimCat:0};const terms=chemoDrugTerms();
 for(const item of zipReaderState.entries){if(item.text===null){try{const buf=await item.entry.async('arraybuffer');item.text=decodeSsopBuffer(buf);item.originalText=item.text;}catch(_e){continue;}}if(!item.sections)item.sections=parseZipSsopSections(item.text||'');(item.sections.BILLTRAN||[]).forEach((_,r)=>{setZipAutoValue(item,'BILLTRAN',r,1,'SSOCAC',stats,'AuthCode');if(String(c.SSO_Case_No||'').trim())setZipAutoValue(item,'BILLTRAN',r,7,c.SSO_Case_No,stats,'MemberNo');if(String(c.Protocol_Code||'').trim())setZipAutoValue(item,'BILLTRAN',r,10,c.Protocol_Code,stats,'VerCode');if(String(c.TFlag||'').trim())setZipAutoValue(item,'BILLTRAN',r,11,c.TFlag,stats,'TFlag');});(item.sections.BillItems||[]).forEach((row,r)=>{if(rowMatchesChemo(row,[3,4,5],terms))setZipAutoValue(item,'BillItems',r,12,'OPR',stats,'ClaimCat');});}
 const current=currentZipItem();if(current){zipReaderState.sections=current.sections||{};zipReaderState.dirty=!!current.modified;const active=zipReaderState.activeSection;if(active&&zipReaderState.sections[active])selectZipSection(active);else{const names=Object.keys(zipReaderState.sections);if(names.length)selectZipSection(names[0]);}}
 const total=Object.values(stats).reduce((a,b)=>a+b,0);updateZipEditStatus(total?`ปรับปรุงอัตโนมัติ ${total} จุด`:'ข้อมูลตรงกับทะเบียนแล้ว');const lines=[`AuthCode: ${stats.AuthCode} จุด`,`MemberNo: ${stats.MemberNo} จุด`,`VerCode: ${stats.VerCode} จุด`,`TFlag: ${stats.TFlag} จุด`,`ClaimCat: ${stats.ClaimCat} จุด`];const drugNote=terms.length?'':'\nหมายเหตุ: ไม่พบชื่อยา Chemo ในทะเบียน จึงไม่ได้ปรับ ClaimCat';showDialog(total?'ปรับปรุงข้อมูลอัตโนมัติแล้ว':'ข้อมูลตรงกับทะเบียนแล้ว',lines.join('\n')+drugNote,total?'success':'info');
}


const CROSS_RULE_GUIDE={
 C07:{level:'Error',title:'Hmain อาจไม่ถูกต้อง',solution:'ตรวจ BILLTRAN.Hmain ให้เป็นรหัสสถานพยาบาลหลักที่ถูกต้อง ณ BILLTRAN.DTTran; ระบบตรวจค่าว่าง/รูปแบบได้ แต่การยืนยันสิทธิจริงต้องเทียบฐานสิทธิผู้ประกันตนตามวันรักษา'},
 C08:{level:'Error',title:'Hcode ใน InvNo เดียวกันไม่ตรงกัน',solution:'ใช้ InvNo เป็น key แล้วทำให้ BILLTRAN.Hcode, Dispensing.ProviderID และ OPServices.Hcode เป็นรหัสสถานพยาบาลเดียวกันตามข้อมูลจริง'},
 STRUCT:{level:'Error',title:'โครงสร้าง SSOP / จำนวนคอลัมน์ไม่ถูกต้อง',solution:'ตรวจ Section มาตรฐาน BILLTRAN, BillItems, Dispensing, DispensedItems, OPServices, OPDx และจำนวนคอลัมน์ให้เป็น 19, 13, 18, 19, 22, 6 ตามลำดับ ก่อนแก้ข้อมูลเชิงธุรกิจ'},
 R04:{level:'Error',title:'ยอด Dispensing / DispensedItems ไม่ตรงกัน',solution:'ใช้ DispID เดียวกัน: Dispensing.ChargeAmt ต้องเท่ากับผลรวม DispensedItems.ChargeAmt และ Dispensing.ClaimAmt ต้องเท่ากับผลรวม DispensedItems.ReimbAmt ตามโครงสร้าง SSOP. Auto Fix จะปรับยอดหัว Dispensing จากผลรวมรายการย่อยเท่านั้น และจะไม่ลบรายการที่ ReimbPrice/ReimbAmt เป็น 0 อัตโนมัติ เพราะรายการที่ไม่ขอเบิกอาจเป็นข้อมูลที่ถูกต้อง'},
 R31:{level:'Error',title:'มีการเบิกค่ายาแต่ไม่มี BILLDISP',solution:'ตรวจ InvNo ที่มี BillItems หมวดยา 3/5 แล้วเพิ่ม Dispensing และ DispensedItems ให้ครบ หรือยกเลิกรายการค่ายาที่ไม่ควรเบิก'},
 R33:{level:'Error',title:'ยอดเบิกยา BillItems ไม่เท่ากับ Dispensing',solution:'ใช้ InvNo เป็นตัวเชื่อม เปรียบเทียบผลรวม BillItems.ClaimAmount เฉพาะหมวด 3/5 กับ Dispensing.ClaimAmt แล้วแก้รายการ/ยอดให้ตรงกัน'},
 R60:{level:'Error',title:'Quantity รายการยาว่างหรือเป็นศูนย์',solution:'กรอก DispensedItems.Quantity ให้เป็นจำนวนที่จ่ายจริงมากกว่า 0 และตรวจยอด ChargeAmt/ReimbAmt หลังแก้'},
 S14:{level:'Error',title:'DTAppoint ไม่ถูกต้อง',solution:'ถ้ามีวันนัด ให้ใช้รูปแบบ YYYY-MM-DD และต้องไม่ก่อนวันให้บริการ BegDT; ถ้าไม่มีนัดให้คงค่าว่างตามข้อมูลต้นทาง'},
 S18:{level:'Error',title:'DiagnosisCode / CodeSet น่าสงสัย',solution:'ตรวจ OPDx.CodeSet และ DiagnosisCode ให้เป็นชุดรหัสที่กองทุนยอมรับ; ระบบตรวจรูปแบบเบื้องต้นได้ แต่การยืนยันรหัสจริงต้องเทียบฐาน ICD/codeset อ้างอิง'},
 S19:{level:'Error',title:'รหัสบริการ / CodeSet น่าสงสัย',solution:'ตรวจ OPServices.CodeSet และ STDCode/LCCode ให้สัมพันธ์กับประเภทบริการ; การยืนยันรหัสจริงต้องใช้ตาราง codeset อ้างอิง'},
 S32:{level:'Error',title:'HN ไม่ตรง BILLTRAN',solution:'ใช้ InvNo เป็น key แล้วแก้ HN ใน Dispensing/OPServices ให้ตรงกับ BILLTRAN.HN ของผู้ป่วยรายเดียวกัน'},
 S33:{level:'Error',title:'PID ไม่ตรง BILLTRAN',solution:'ใช้ InvNo เป็น key แล้วแก้ PID ใน Dispensing/OPServices ให้ตรงกับ BILLTRAN.PID และตรวจว่าเป็นผู้ป่วยคนเดียวกันก่อนบันทึก'},
 S41:{level:'Error',title:'Class เป็นหัตถการแต่ขาดรหัสบริการ',solution:'เมื่อ OPServices.Class เป็น OP/หัตถการ ต้องระบุรหัสหัตถการใน LCCode หรือ STDCode และ CodeSet ให้ครบ'},
 T01:{level:'Error',title:'InvNo ซ้ำใน BILLTRAN',solution:'ตรวจว่ารายการเป็นการส่งซ้ำหรือคนละ visit; ให้ InvNo ของ BILLTRAN ไม่ซ้ำภายในชุดส่งเดียวกัน และแก้ reference ในแฟ้มอื่นให้ตาม InvNo ใหม่ถ้ามีการเปลี่ยน'},
 T06:{level:'Error',title:'สิทธิประกันสุขภาพหลักต้องตรวจฐานอ้างอิง',solution:'ตรวจ PayPlan/Hmain กับสิทธิผู้ป่วยและรหัสกองทุนล่าสุด; ระบบเตือนค่าว่าง/รูปแบบผิดได้ แต่ต้องมี master สิทธิสำหรับยืนยัน T06 แบบเต็ม'},
 T15:{level:'Error',title:'SvRefID ไม่พบใน OPServices',solution:'สำหรับ BillItems หมวด 3/5 ให้ตรวจ SvRefID ว่าตรงกับ OPServices.SvID ของ visit/InvNo เดียวกัน; แก้ reference หรือเพิ่ม OPServices ที่ขาด'},
 T31:{level:'Error',title:'BILLTRAN ไม่มี BillItems',solution:'ใช้ InvNo เป็น key แล้วเพิ่ม BillItems ที่ขาด หรือเอา BILLTRAN ที่ไม่ควรส่งออกจากชุดข้อมูล'},
 T33:{level:'Error',title:'Amount ไม่ตรงผลรวม BillItems',solution:'รวม BillItems.ChargeAmt ตาม InvNo แล้วแก้ BILLTRAN.Amount หรือรายการ BillItems ให้เท่ากัน'},
 T42:{level:'Error',title:'SvDate ไม่สัมพันธ์กับ DTTran',solution:'ตรวจ BillItems.SvDate กับ BILLTRAN.DTTran ของ InvNo เดียวกัน โดยทั่วไปควรเป็นวันบริการเดียวกัน; ถ้าต่างวันให้ตรวจ visit/การลงวันที่ต้นทาง'},
 T44:{level:'Error',title:'ClaimAmount ไม่เท่ากับ ClaimUP × Quantity',solution:'คำนวณ ClaimUP × Quantity ใหม่และแก้ ClaimAmount หรือจำนวน/ราคาต่อหน่วยให้ถูกต้อง โดยระวังหลักการปัดเศษ'},
 T45:{level:'Error',title:'ผลรวม ClaimAmount ไม่เท่ากับ BILLTRAN.ClaimAmt',solution:'รวม BillItems.ClaimAmount ตาม InvNo แล้วแก้ BILLTRAN.ClaimAmt หรือรายการย่อยให้ยอดตรงกัน'},
 T51:{level:'Error',title:'ไม่มี OPServices ของ InvNo',solution:'เพิ่ม OPServices ที่สัมพันธ์กับ InvNo/ผู้ป่วย หรือเอา BILLTRAN ที่ไม่มีบริการจริงออกจากชุดส่ง'},
 T55:{level:'Error',title:'BillItems.Quantity ว่างหรือเป็นศูนย์',solution:'กรอก Quantity ให้มากกว่า 0 และตรวจ UnitPrice/ClaimUP/ChargeAmt/ClaimAmount ใหม่'},
 W04:{level:'Warning',title:'ช่วงวันราคายาต้องตรวจ Drugcatalog',solution:'ต้องมี Drugcatalog ที่ระบุ Effective/Expire date แล้วเทียบ BILLTRAN.DTTran/DispDate กับช่วงวันที่ราคายามีผล'},
 W05:{level:'Warning',title:'ราคายาต้องตรวจ Drugcatalog',solution:'ต้องเชื่อม HospDrgID/DrgID กับ Drugcatalog แล้วเทียบ UnitPrice/ReimbPrice กับราคาที่ประกาศใช้ในวันบริการ'},
 W07:{level:'Warning',title:'TMT ต้องตรง Drugcatalog',solution:'ต้องเชื่อม DispensedItems.HospDrgID กับ Drugcatalog แล้วตรวจ DrgID (TMT) ให้ตรงกัน หากไม่ตรงให้แก้ master drug หรือแฟ้มส่งตามข้อมูลจริง'}
};
function crossNum_(v){const n=Number(String(v??'').replace(/,/g,'').trim());return Number.isFinite(n)?n:null}
function crossDate_(v){const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})/);return m?m[1]:''}
function collectZipSectionsWithOrigin_(){
 const out={};
 zipReaderState.entries.forEach(item=>{
  const secs=item.sections||{};
  Object.entries(secs).forEach(([section,rows])=>{
   if(!out[section])out[section]=[];
   rows.forEach((row,index)=>out[section].push({row,index,section,entry:item.name}));
  });
 });
 return out;
}
function crossAddIssue_(issues,code,origin,detail,key='',extra={}){
 const rule=CROSS_RULE_GUIDE[code]||{level:'Warning',title:code,solution:'ตรวจข้อมูลตามเงื่อนไขของกองทุน'};
 issues.push({code,level:extra.level||rule.level,title:extra.title||rule.title,solution:extra.solution||rule.solution,detail,entry:origin?.entry||'',section:origin?.section||'',rowIndex:Number.isFinite(origin?.index)?origin.index:-1,key:String(key||''),targetCol:Number.isFinite(extra.targetCol)?extra.targetCol:null,custom:!!extra.custom});
}

const CROSS_CUSTOM_RULE_KEY='PCMC_SSO_CROSS_CUSTOM_RULES_V455';
const CROSS_KB_CACHE_KEY='PCMC_SSO_CROSS_KNOWLEDGE_CACHE_V456';
const crossKnowledgeLoaded=new Set();
function loadCrossKnowledgeCache_(){try{const o=JSON.parse(localStorage.getItem(CROSS_KB_CACHE_KEY)||'{}');return o&&typeof o==='object'?o:{}}catch(_e){return{}}}
function saveCrossKnowledgeCache_(o){try{localStorage.setItem(CROSS_KB_CACHE_KEY,JSON.stringify(o||{}))}catch(_e){}}
function crossKnowledgeForCode_(code){return loadCrossKnowledgeCache_()[String(code||'').trim().toUpperCase()]||null;}
function cacheCrossKnowledgeItems_(items){const cache=loadCrossKnowledgeCache_();(items||[]).forEach(k=>{const c=String(k?.ErrorCode||'').trim().toUpperCase();if(c)cache[c]=k;});saveCrossKnowledgeCache_(cache);}
async function hydrateCrossKnowledgeForCodes_(codes,force=false){
 const wanted=[...new Set((codes||[]).map(x=>String(x||'').trim().toUpperCase()).filter(Boolean))].filter(c=>force||!crossKnowledgeLoaded.has(c));if(!wanted.length)return[];
 try{const data=await apiRequest('getByCodes',{module:'CROSS',codes:wanted});const items=data.items||[];cacheCrossKnowledgeItems_(items);wanted.forEach(c=>crossKnowledgeLoaded.add(c));return items;}catch(_e){return[]}
}
function applyCrossKnowledgeToIssues_(issues){(issues||[]).forEach(x=>{const k=crossKnowledgeForCode_(x.code);if(!k)return;if(String(k.Description||'').trim())x.title=String(k.Description).trim();if(String(k.Solution||'').trim())x.solution=String(k.Solution).trim();x.knowledge=true;});return issues;}
function loadCrossCustomRules_(){try{const x=JSON.parse(localStorage.getItem(CROSS_CUSTOM_RULE_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_e){return[]}}
function saveCrossCustomRules_(rules){localStorage.setItem(CROSS_CUSTOM_RULE_KEY,JSON.stringify(rules||[]));}
function crossCustomRuleMatch_(value,rule){const v=String(value??''),x=String(rule.value??'');switch(rule.operator){case'EMPTY':return !v.trim();case'EQUALS':return v.trim()===x.trim();case'NOT_EQUALS':return v.trim()!==x.trim();case'REGEX':try{return new RegExp(x).test(v)}catch(_e){return false};case'NOT_REGEX':try{return !new RegExp(x).test(v)}catch(_e){return false};default:return false}}
function scanCrossCustomRules_(sec,issues){const rules=loadCrossCustomRules_().filter(r=>r&&r.enabled!==false&&r.code&&r.section&&r.field);for(const rule of rules){const rows=sec[rule.section]||[];const hdr=sectionHeaders(rule.section,rows.map(x=>x.row));const col=hdr.indexOf(rule.field);if(col<0)continue;const kb=crossKnowledgeForCode_(rule.code);rows.forEach(o=>{if(crossCustomRuleMatch_(o.row[col],rule))crossAddIssue_(issues,String(rule.code).toUpperCase(),o,`${rule.field} = ${String(o.row[col]??'(ว่าง)')}`,String(o.row[col]??''),{level:rule.level||'Warning',title:String(kb?.Description||rule.title||rule.code),solution:String(kb?.Solution||rule.solution||'ตรวจและแก้ค่าฟิลด์นี้ตามข้อมูลจริง'),targetCol:col,custom:true})})}}
function crossTargetForIssue_(issue){if(!issue||!issue.entry)return null;const {row}=findZipOrigin_(issue);if(!row)return null;if(Number.isFinite(issue.targetCol))return{col:issue.targetCol,field:sectionHeaders(issue.section,[row])[issue.targetCol]||`คอลัมน์ ${issue.targetCol+1}`};let col=-1;switch(issue.code){case'C07':col=issue.section==='BILLTRAN'?14:-1;break;case'T06':col=issue.section==='BILLTRAN'?(String(issue.detail).includes('PayPlan')?15:14):-1;break;case'C08':col=issue.section==='Dispensing'?0:issue.section==='OPServices'?3:-1;break;case'R04':col=issue.section==='Dispensing'?9:-1;break;case'R60':col=issue.section==='DispensedItems'?9:-1;break;case'S14':col=issue.section==='OPServices'?10:-1;break;case'S18':col=issue.section==='OPDx'?4:-1;break;case'S19':col=issue.section==='OPServices'?(String(row[17]||'').trim()?16:17):-1;break;case'S32':col=issue.section==='Dispensing'?3:issue.section==='OPServices'?4:-1;break;case'S33':col=issue.section==='Dispensing'?4:issue.section==='OPServices'?5:-1;break;case'S41':col=issue.section==='OPServices'?(String(row[17]||'').trim()?15:17):-1;break;case'T01':col=issue.section==='BILLTRAN'?4:-1;break;case'T15':col=issue.section==='BillItems'?11:-1;break;case'T33':col=issue.section==='BILLTRAN'?8:-1;break;case'T42':col=issue.section==='BillItems'?1:-1;break;case'T44':col=issue.section==='BillItems'?10:-1;break;case'T45':col=issue.section==='BILLTRAN'?16:-1;break;case'T55':col=issue.section==='BillItems'?6:-1;break;default:col=-1}return col>=0?{col,field:sectionHeaders(issue.section,[row])[col]||`คอลัมน์ ${col+1}`}:null}
function scanCrossZip_(){
 const sec=collectZipSectionsWithOrigin_(),issues=[];
 const bill=sec.BILLTRAN||[],bi=sec.BillItems||[],disp=sec.Dispensing||[],di=sec.DispensedItems||[],ops=sec.OPServices||[],dx=sec.OPDx||[];
 const expectedWidths={BILLTRAN:19,BillItems:13,Dispensing:18,DispensedItems:19,OPServices:22,OPDx:6};
 Object.entries(expectedWidths).forEach(([name,width])=>{const rows=sec[name]||[];if(!rows.length)crossAddIssue_(issues,'STRUCT',{section:name,index:-1,entry:''},`ไม่พบ Section ${name}`);rows.forEach(o=>{if(o.row.length!==width)crossAddIssue_(issues,'STRUCT',o,`${name} แถว ${o.index+1}: ${o.row.length} คอลัมน์ (ควรเป็น ${width})`);});});
 const by=(rows,idx)=>{const m=new Map();rows.forEach(o=>{const k=String(o.row[idx]||'').trim();if(!k)return;if(!m.has(k))m.set(k,[]);m.get(k).push(o)});return m};
 const billByInv=by(bill,4),biByInv=by(bi,0),dispByInv=by(disp,2),opsByInv=by(ops,0),diByDisp=by(di,0),opsBySv=by(ops,1);
 bill.forEach(o=>{const hmain=String(o.row[14]||'').trim();if(!hmain)crossAddIssue_(issues,'T06',o,'Hmain ว่าง',o.row[4]);if(!String(o.row[15]||'').trim())crossAddIssue_(issues,'T06',o,'PayPlan ว่าง',o.row[4]);if(!hmain||!/^\d{5}$/.test(hmain))crossAddIssue_(issues,'C07',o,`InvNo ${o.row[4]||'-'}: Hmain = ${hmain||'(ว่าง)'} ต้องตรวจรหัสสถานพยาบาลหลัก ณ วันรักษา`,o.row[4]);});
 billByInv.forEach((arr,inv)=>{if(arr.length>1)arr.forEach(o=>crossAddIssue_(issues,'T01',o,`InvNo ${inv} พบ ${arr.length} ครั้งใน BILLTRAN`,inv));});
 bill.forEach(o=>{
  const inv=String(o.row[4]||'').trim();const rows=biByInv.get(inv)||[];
  if(inv&&!rows.length)crossAddIssue_(issues,'T31',o,`InvNo ${inv} ไม่มี BillItems`,inv);
  if(rows.length){
   const amount=crossNum_(o.row[8]);const sumCharge=rows.reduce((a,x)=>a+(crossNum_(x.row[8])||0),0);
   if(amount!==null&&Math.abs(amount-sumCharge)>0.01)crossAddIssue_(issues,'T33',o,`InvNo ${inv}: BILLTRAN.Amount ${amount.toFixed(2)} ≠ BillItems.ChargeAmt รวม ${sumCharge.toFixed(2)}`,inv);
   const claim=crossNum_(o.row[16]);const sumClaim=rows.reduce((a,x)=>a+(crossNum_(x.row[10])||0),0);
   if(claim!==null&&Math.abs(claim-sumClaim)>0.01)crossAddIssue_(issues,'T45',o,`InvNo ${inv}: ClaimAmt ${claim.toFixed(2)} ≠ BillItems.ClaimAmount รวม ${sumClaim.toFixed(2)}`,inv);
  }
  if(inv&&!(opsByInv.get(inv)||[]).length)crossAddIssue_(issues,'T51',o,`InvNo ${inv} ไม่มี OPServices`,inv);
 });
 bi.forEach(o=>{
  const r=o.row,inv=String(r[0]||'').trim(),qty=crossNum_(r[6]),claimUp=crossNum_(r[9]),claimAmount=crossNum_(r[10]),muad=String(r[2]||'').trim().replace(/^0+/,'');
  if(qty===null||qty<=0)crossAddIssue_(issues,'T55',o,`InvNo ${inv}: Quantity = ${String(r[6]||'(ว่าง)')}`,inv);
  if(qty!==null&&claimUp!==null&&claimAmount!==null&&Math.abs(qty*claimUp-claimAmount)>0.01)crossAddIssue_(issues,'T44',o,`InvNo ${inv}: ${claimUp} × ${qty} = ${(claimUp*qty).toFixed(2)} แต่ ClaimAmount = ${claimAmount}`,inv);
  const b=(billByInv.get(inv)||[])[0];if(b){const sd=crossDate_(r[1]),dt=crossDate_(b.row[2]);if(sd&&dt&&sd!==dt)crossAddIssue_(issues,'T42',o,`InvNo ${inv}: SvDate ${sd} ≠ DTTran ${dt}`,inv);}
  if((muad==='3'||muad==='5')&&String(r[11]||'').trim()){
   const ref=String(r[11]||'').trim();if(!(opsBySv.get(ref)||[]).length)crossAddIssue_(issues,'T15',o,`InvNo ${inv}: SvRefID ${ref} ไม่พบใน OPServices.SvID`,inv);
  }
 });
 disp.forEach(o=>{
  const r=o.row,dispId=String(r[1]||'').trim(),inv=String(r[2]||'').trim(),items=diByDisp.get(dispId)||[];
  if(items.length){
   const charge=crossNum_(r[9]),claim=crossNum_(r[10]),sumCharge=items.reduce((a,x)=>a+(crossNum_(x.row[11])||0),0),sumClaim=items.reduce((a,x)=>a+(crossNum_(x.row[13])||0),0);
   if((charge!==null&&Math.abs(charge-sumCharge)>0.01)||(claim!==null&&Math.abs(claim-sumClaim)>0.01))crossAddIssue_(issues,'R04',o,`DispID ${dispId}: Charge ${charge??'-'} / รวมรายการ ${sumCharge.toFixed(2)}, Claim ${claim??'-'} / รวมรายการ ${sumClaim.toFixed(2)}`,inv||dispId);
  }
  const b=(billByInv.get(inv)||[])[0];if(b){if(String(r[0]||'').trim()&&String(b.row[3]||'').trim()&&String(r[0]).trim()!==String(b.row[3]).trim())crossAddIssue_(issues,'C08',o,`InvNo ${inv}: Dispensing.ProviderID ${r[0]} ≠ BILLTRAN.Hcode ${b.row[3]}`,inv);if(String(r[3]||'').trim()&&String(b.row[6]||'').trim()&&String(r[3]).trim()!==String(b.row[6]).trim())crossAddIssue_(issues,'S32',o,`InvNo ${inv}: Dispensing.HN ${r[3]} ≠ BILLTRAN.HN ${b.row[6]}`,inv);if(String(r[4]||'').trim()&&String(b.row[12]||'').trim()&&String(r[4]).trim()!==String(b.row[12]).trim())crossAddIssue_(issues,'S33',o,`InvNo ${inv}: Dispensing.PID ไม่ตรง BILLTRAN.PID`,inv);}
 });
 di.forEach(o=>{const q=crossNum_(o.row[9]);if(q===null||q<=0)crossAddIssue_(issues,'R60',o,`DispID ${o.row[0]}: Quantity = ${String(o.row[9]||'(ว่าง)')}`,o.row[0]);});
 bill.forEach(o=>{
  const inv=String(o.row[4]||'').trim(),drugRows=(biByInv.get(inv)||[]).filter(x=>['3','5'].includes(String(x.row[2]||'').trim().replace(/^0+/,''))),drugClaim=drugRows.reduce((a,x)=>a+(crossNum_(x.row[10])||0),0),drows=dispByInv.get(inv)||[];
  if(drugClaim>0&&!drows.length)crossAddIssue_(issues,'R31',o,`InvNo ${inv}: มี BillItems หมวดยา 3/5 ขอเบิก ${drugClaim.toFixed(2)} แต่ไม่มี Dispensing`,inv);
  if(drugClaim>0&&drows.length){const dclaim=drows.reduce((a,x)=>a+(crossNum_(x.row[10])||0),0);if(Math.abs(drugClaim-dclaim)>0.01)crossAddIssue_(issues,'R33',o,`InvNo ${inv}: BillItems ยา ${drugClaim.toFixed(2)} ≠ Dispensing.ClaimAmt ${dclaim.toFixed(2)}`,inv);}
 });
 ops.forEach(o=>{
  const r=o.row,inv=String(r[0]||'').trim(),b=(billByInv.get(inv)||[])[0];
  if(b){if(String(r[3]||'').trim()&&String(b.row[3]||'').trim()&&String(r[3]).trim()!==String(b.row[3]).trim())crossAddIssue_(issues,'C08',o,`InvNo ${inv}: OPServices.Hcode ${r[3]} ≠ BILLTRAN.Hcode ${b.row[3]}`,inv);if(String(r[4]||'').trim()&&String(b.row[6]||'').trim()&&String(r[4]).trim()!==String(b.row[6]).trim())crossAddIssue_(issues,'S32',o,`InvNo ${inv}: OPServices.HN ${r[4]} ≠ BILLTRAN.HN ${b.row[6]}`,inv);if(String(r[5]||'').trim()&&String(b.row[12]||'').trim()&&String(r[5]).trim()!==String(b.row[12]).trim())crossAddIssue_(issues,'S33',o,`InvNo ${inv}: OPServices.PID ไม่ตรง BILLTRAN.PID`,inv);}
  const dt=String(r[10]||'').trim();if(dt&&(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||(crossDate_(r[13])&&dt<crossDate_(r[13]))))crossAddIssue_(issues,'S14',o,`InvNo ${inv}: DTAppoint/DateField = ${dt} ไม่ถูกต้องหรือก่อนวันบริการ`,inv);
  const cls=String(r[2]||'').trim().toUpperCase();if(cls==='OP'&&!String(r[15]||'').trim()&&!String(r[17]||'').trim())crossAddIssue_(issues,'S41',o,`InvNo ${inv}: Class=OP แต่ LCCode/STDCode ว่าง`,inv);
  const codeSet=String(r[16]||'').trim(),std=String(r[17]||'').trim();if((codeSet&&!std)||(!codeSet&&std))crossAddIssue_(issues,'S19',o,`InvNo ${inv}: CodeSet=${codeSet||'(ว่าง)'} / STDCode=${std||'(ว่าง)'}`,inv);
 });
 dx.forEach(o=>{const cs=String(o.row[3]||'').trim(),code=String(o.row[4]||'').trim().toUpperCase();if((cs&&!code)||(!cs&&code)||(code&&!/^[A-Z][0-9A-Z.]{2,7}$/.test(code)))crossAddIssue_(issues,'S18',o,`SvID ${o.row[1]}: CodeSet=${cs||'(ว่าง)'} / DiagnosisCode=${code||'(ว่าง)'}`,o.row[1]);});
 ['W04','W05','W07'].forEach(code=>crossAddIssue_(issues,code,null,'กฎนี้ยังตรวจยืนยันไม่ได้จนกว่าจะเชื่อม Drugcatalog/ช่วงวันที่ราคา'));
 scanCrossCustomRules_(sec,issues);
 return issues;
}
const CROSS_AUTO_FIX_LOGIC={
 C08:{title:'ทำ Hcode ของ InvNo เดียวกันให้ตรงกับ BILLTRAN',steps:['อ่าน BILLTRAN.Hcode ของ InvNo นั้นเป็นค่าต้นทาง','แก้ Dispensing.ProviderID และ/หรือ OPServices.Hcode เฉพาะจุดที่ถูกตรวจเป็น C08','ไม่แก้ BILLTRAN.Hcode และไม่เปลี่ยน InvNo'],fields:'BILLTRAN.Hcode → Dispensing.ProviderID / OPServices.Hcode',safety:'เหมาะเมื่อ BILLTRAN เป็นข้อมูลอ้างอิงที่ถูกต้องของชุดส่ง'},
 S32:{title:'ทำ HN ให้ตรงกับ BILLTRAN ของ InvNo เดียวกัน',steps:['อ่าน BILLTRAN.HN ของ InvNo','แทน HN ใน Dispensing/OPServices ที่ไม่ตรง','ไม่แตะ PID หรือข้อมูลการเงิน'],fields:'BILLTRAN.HN → Dispensing.HN / OPServices.HN',safety:'ตรวจว่ารายการอ้างถึง InvNo เดียวกันก่อนทุกครั้ง'},
 S33:{title:'ทำ PID ให้ตรงกับ BILLTRAN ของ InvNo เดียวกัน',steps:['อ่าน BILLTRAN.PID ของ InvNo','แทน PID ใน Dispensing/OPServices ที่ไม่ตรง','ไม่แตะ HN หรือข้อมูลการเงิน'],fields:'BILLTRAN.PID → Dispensing.PID / OPServices.PID',safety:'ใช้เมื่อ BILLTRAN.PID เป็น PID ของผู้ป่วยรายนั้นจริง'},
 R04:{title:'คำนวณยอดหัว Dispensing จากรายการยาใน DispensedItems',steps:['รวม DispensedItems.ChargeAmt ของ DispID เดียวกัน','รวม DispensedItems.ReimbAmt ของ DispID เดียวกัน','ตั้ง Dispensing.ChargeAmt = ผลรวม ChargeAmt และ Dispensing.ClaimAmt = ผลรวม ReimbAmt','ไม่ลบแถว DispensedItems ที่ ReimbPrice/ReimbAmt เป็น 0 อัตโนมัติ'],fields:'DispensedItems.ChargeAmt → Dispensing.ChargeAmt; DispensedItems.ReimbAmt → Dispensing.ClaimAmt',safety:'ระบบแก้เฉพาะยอดหัวจากผลรวมรายการย่อย ผู้ใช้ต้องตรวจว่ารายการย่อยครบและถูกต้องก่อน'},
 T33:{title:'คำนวณ BILLTRAN.Amount จาก BillItems',steps:['รวม BillItems.ChargeAmt ตาม InvNo','ตั้ง BILLTRAN.Amount ให้เท่ากับผลรวม','ไม่แก้รายการ BillItems'],fields:'SUM(BillItems.ChargeAmt) → BILLTRAN.Amount',safety:'ใช้เมื่อรายการ BillItems เป็นรายการจริงที่ต้องส่งครบแล้ว'},
 T44:{title:'คำนวณ ClaimAmount รายการจาก ClaimUP × Quantity',steps:['อ่าน Quantity และ ClaimUP ของ BillItems แถวเดียวกัน','คำนวณ ClaimUP × Quantity','แทน BillItems.ClaimAmount ด้วยค่าที่คำนวณได้','ไม่แก้ Quantity หรือ ClaimUP'],fields:'BillItems.ClaimUP × BillItems.Quantity → BillItems.ClaimAmount',safety:'ใช้เมื่อ Quantity และ ClaimUP ถูกต้องแล้ว; หลังแก้ควรตรวจ T45 ต่อ'},
 T45:{title:'คำนวณ BILLTRAN.ClaimAmt จาก BillItems',steps:['รวม BillItems.ClaimAmount ตาม InvNo','ตั้ง BILLTRAN.ClaimAmt ให้เท่ากับผลรวม','ไม่แก้ ClaimAmount รายการย่อย'],fields:'SUM(BillItems.ClaimAmount) → BILLTRAN.ClaimAmt',safety:'ควรแก้ T44 และตรวจรายการ BillItems ให้ถูกต้องก่อน'}
};
function crossAutoFixExplanation_(code,count){const x=CROSS_AUTO_FIX_LOGIC[code];if(!x)return`พบ ${count} จุด ระบบจะใช้ Logic ที่กำหนดสำหรับ ${code}`;return [`พบ ${count} จุด`,``,`Logic: ${x.title}`,`ฟิลด์ที่ใช้: ${x.fields}`,'',...x.steps.map((v,i)=>`${i+1}. ${v}`),'',`ข้อควรระวัง: ${x.safety}`,'','หลัง Auto Fix ระบบจะตรวจ Cross ใหม่ทันที และยัง Undo ไฟล์แต่ละไฟล์ได้ก่อนบันทึก MD5/ZIP'].join('\n');}
const CROSS_BULK_FIXABLE=new Set(['C08','S32','S33','R04','T33','T44','T45']);
function findZipOrigin_(issue){const item=zipReaderState.entries.find(x=>x.name===issue.entry),rows=item?.sections?.[issue.section]||[];return {item,row:rows[issue.rowIndex]||null};}
function setCrossBulkCell_(item,section,row,col,value){if(!item||!row)return false;while(row.length<=col)row.push('');const next=String(value??'');if(String(row[col]??'')===next)return false;row[col]=next;item.modified=true;item.changeStats=item.changeStats||{cells:0,added:0,deleted:0};item.changeStats.cells=(item.changeStats.cells||0)+1;markZipUserEdited_(item,section,(item.sections?.[section]||[]).indexOf(row),col);return true;}
function crossSectionIndex_(){const sec=collectZipSectionsWithOrigin_(),by=(rows,idx)=>{const m=new Map();(rows||[]).forEach(o=>{const k=String(o.row[idx]||'').trim();if(!m.has(k))m.set(k,[]);m.get(k).push(o)});return m};return {sec,billByInv:by(sec.BILLTRAN,4),biByInv:by(sec.BillItems,0),diByDisp:by(sec.DispensedItems,0)};}
async function bulkFixSelectedCrossCode_(){const code=document.getElementById('crossIssueCodeFilter')?.value||'ALL';if(!CROSS_BULK_FIXABLE.has(code)){toast('ยังไม่รองรับการแก้อัตโนมัติทั้งหมด','เลือก Error Code ที่ระบบคำนวณค่าแก้ไขได้อย่างปลอดภัย เช่น C08, S32, S33, R04, T33, T44 หรือ T45','warning',6000);return;}const issues=(zipReaderState.crossIssues||[]).filter(x=>x.code===code&&x.entry);if(!issues.length)return;const ok=await showDialog(`Auto Fix ${code} · Logic วิธีแก้`,crossAutoFixExplanation_(code,issues.length),'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:`ยืนยัน Auto Fix ${code}`,value:true,className:'primary'}]);if(!ok)return;const ix=crossSectionIndex_();let changed=0;
 for(const issue of issues){const {item,row}=findZipOrigin_(issue);if(!item||!row)continue;const inv=String(issue.key||'').trim(),bill=(ix.billByInv.get(inv)||[])[0]?.row;
  if(code==='S32'&&bill){const col=issue.section==='Dispensing'?3:issue.section==='OPServices'?4:-1;if(col>=0&&setCrossBulkCell_(item,issue.section,row,col,bill[6]))changed++;}
  else if(code==='S33'&&bill){const col=issue.section==='Dispensing'?4:issue.section==='OPServices'?5:-1;if(col>=0&&setCrossBulkCell_(item,issue.section,row,col,bill[12]))changed++;}
  else if(code==='C08'&&bill){const col=issue.section==='Dispensing'?0:issue.section==='OPServices'?3:-1;if(col>=0&&setCrossBulkCell_(item,issue.section,row,col,bill[3]))changed++;}
  else if(code==='T33'&&issue.section==='BILLTRAN'){const sum=(ix.biByInv.get(inv)||[]).reduce((a,x)=>a+(crossNum_(x.row[8])||0),0);if(setCrossBulkCell_(item,'BILLTRAN',row,8,sum.toFixed(2)))changed++;}
  else if(code==='T45'&&issue.section==='BILLTRAN'){const sum=(ix.biByInv.get(inv)||[]).reduce((a,x)=>a+(crossNum_(x.row[10])||0),0);if(setCrossBulkCell_(item,'BILLTRAN',row,16,sum.toFixed(2)))changed++;}
  else if(code==='T44'&&issue.section==='BillItems'){const q=crossNum_(row[6]),up=crossNum_(row[9]);if(q!==null&&up!==null&&setCrossBulkCell_(item,'BillItems',row,10,(q*up).toFixed(2)))changed++;}
  else if(code==='R04'&&issue.section==='Dispensing'){const dispId=String(row[1]||'').trim(),items=ix.diByDisp.get(dispId)||[],charge=items.reduce((a,x)=>a+(crossNum_(x.row[11])||0),0),claim=items.reduce((a,x)=>a+(crossNum_(x.row[13])||0),0);if(setCrossBulkCell_(item,'Dispensing',row,9,charge.toFixed(2)))changed++;if(setCrossBulkCell_(item,'Dispensing',row,10,claim.toFixed(2)))changed++;}
 }
 zipReaderState.dirty=zipReaderState.entries.some(x=>x.modified);const current=currentZipItem();if(current){zipReaderState.sections=current.sections||{};zipReaderState.rows=zipReaderState.sections[zipReaderState.activeSection]||zipReaderState.rows;}runCrossPreflight();renderZipPreview();renderZipFileList();updateZipEditStatus(changed?`แก้ ${code} อัตโนมัติ ${changed} ช่อง · ยังไม่ได้บันทึก MD5`:'ไม่พบค่าที่เปลี่ยน');toast('แก้ Error Code ทั้งหมดแล้ว',`${code}: เปลี่ยน ${changed} ช่อง · ตรวจผล Preflight ใหม่แล้ว กรุณาตรวจความถูกต้องก่อนบันทึก`,'success',6500);
}
function crossIssuesForCode_(code){return (zipReaderState.crossIssues||[]).filter(x=>x.entry&&(code==='ALL'||x.code===code));}
function renderCrossValueReplace_(){
 const panel=document.getElementById('crossValueReplace'),code=document.getElementById('crossIssueCodeFilter')?.value||'ALL';if(!panel)return;
 const issues=crossIssuesForCode_(code).filter(x=>crossTargetForIssue_(x));
 if(code==='ALL'||!issues.length){panel.classList.add('hidden');return;}
 const counts=new Map();issues.forEach(issue=>{const {row}=findZipOrigin_(issue),t=crossTargetForIssue_(issue);if(!row||!t)return;const v=String(row[t.col]??'');counts.set(v,(counts.get(v)||0)+1)});
 if(!counts.size){panel.classList.add('hidden');return;}panel.classList.remove('hidden');
 const fieldNames=[...new Set(issues.map(x=>crossTargetForIssue_(x)?.field).filter(Boolean))];
 document.getElementById('crossValueReplaceTitle').textContent=`✏️ Guided Replace ${code} · ${fieldNames.join(' / ')}`;
 document.getElementById('crossValueReplaceMeta').textContent=`ผู้ใช้เป็นผู้กำหนดค่าใหม่เอง · ระบบจะแก้เฉพาะ ${issues.length} จุดที่ถูกตรวจเป็น ${code} เท่านั้น ไม่กระทบแถวอื่น`;
 const sel=document.getElementById('crossReplaceOldValue'),prior=sel?.value;if(sel){sel.innerHTML=[...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([v,c])=>`<option value="${escapeAttr(v)}">${escapeHtml(v||'(ว่าง)')} · ${c} รายการ</option>`).join('');if([...counts.keys()].includes(prior))sel.value=prior;}
}
async function applyCrossValueReplace_(){
 const code=document.getElementById('crossIssueCodeFilter')?.value||'ALL',oldVal=document.getElementById('crossReplaceOldValue')?.value??'',newVal=String(document.getElementById('crossReplaceNewValue')?.value??'').trim();
 if(code==='ALL'){toast('กรุณาเลือก Error Code','เลือก Code ก่อนใช้แทนค่าซ้ำ','warning');return;}if(!newVal){toast('กรุณากรอกค่าใหม่','ระบุค่าที่ต้องการแทนที่','warning');return;}
 const matches=crossIssuesForCode_(code).filter(issue=>{const {row}=findZipOrigin_(issue),t=crossTargetForIssue_(issue);return row&&t&&String(row[t.col]??'')===oldVal;});
 if(!matches.length){toast('ไม่พบรายการ','ไม่มีค่าที่เลือกใน Error Code นี้','info');return;}
 const ok=await showDialog(`แทนค่า ${code} ทั้งหมด`,`เปลี่ยน “${oldVal||'(ว่าง)'}” → “${newVal}” จำนวน ${matches.length} จุด\n\nระบบจะแก้เฉพาะจุดที่อยู่ใน Error Code ${code} และยัง Undo ได้ก่อนบันทึก ZIP`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:`แทนที่ ${matches.length} จุด`,value:true,className:'primary'}]);if(!ok)return;
 let changed=0;for(const issue of matches){const {item,row}=findZipOrigin_(issue),t=crossTargetForIssue_(issue);if(item&&row&&t&&setCrossBulkCell_(item,issue.section,row,t.col,newVal))changed++;}
 zipReaderState.dirty=zipReaderState.entries.some(x=>x.modified);runCrossPreflight();renderZipFileList();renderZipPreview();document.getElementById('crossReplaceNewValue').value='';updateZipEditStatus(`แทนค่า ${code} ${changed} จุด · ยังไม่ได้บันทึก MD5`);toast('แทนค่าทั้งหมดแล้ว',`${oldVal||'(ว่าง)'} → ${newVal} · ${changed} จุด`,'success',5500);
}
function updateCrossFocusStatus_(issue){const bar=document.getElementById('crossFocusStatus');if(!bar)return;if(!issue){bar.classList.add('hidden');return;}const list=crossIssuesForCode_(issue.code),idx=list.indexOf(issue),t=crossTargetForIssue_(issue);bar.classList.remove('hidden');document.getElementById('crossFocusTitle').textContent=`${issue.code} · จุดที่ ${idx+1}/${Math.max(1,list.length)} · ${t?.field||issue.section}`;document.getElementById('crossFocusMeta').textContent=`${issue.section} แถว ${issue.rowIndex+1}${issue.key?` · Key ${issue.key}`:''} · เซลล์เป้าหมายถูกไฮไลต์`;document.getElementById('crossFocusPrevBtn').disabled=idx<=0;document.getElementById('crossFocusNextBtn').disabled=idx<0||idx>=list.length-1;zipReaderState.crossFocus={code:issue.code,index:idx};}
async function moveCrossFocus_(delta){const f=zipReaderState.crossFocus;if(!f)return;const list=crossIssuesForCode_(f.code),next=Math.max(0,Math.min(list.length-1,(f.index||0)+delta));if(list[next])await jumpToCrossIssue_(list[next]);}
function renderCrossPreflight_(){
 const panel=document.getElementById('crossPreflight');if(!panel)return;
 const issues=zipReaderState.crossIssues||[];panel.classList.toggle('hidden',String(zipReaderState.moduleCode||'').toUpperCase()!=='CROSS');if(panel.classList.contains('hidden'))return;
 const codeSel=document.getElementById('crossIssueCodeFilter'),q=String(document.getElementById('crossIssueSearch')?.value||'').trim().toLowerCase(),selected=codeSel?.value||'ALL';
 const codes=[...new Set(issues.map(x=>x.code))].sort();if(codeSel){const prior=codeSel.value;codeSel.innerHTML='<option value="ALL">ทุก Error Code</option>'+codes.map(c=>`<option value="${c}">${c} · ${(CROSS_RULE_GUIDE[c]?.title||loadCrossCustomRules_().find(r=>String(r.code).toUpperCase()===c)?.title||'')}</option>`).join('');codeSel.value=codes.includes(prior)?prior:'ALL';}
 const active=document.getElementById('crossIssueCodeFilter')?.value||selected;const bulkBtn=document.getElementById('crossBulkFixBtn');if(bulkBtn){bulkBtn.disabled=!CROSS_BULK_FIXABLE.has(active);bulkBtn.textContent=CROSS_BULK_FIXABLE.has(active)?`🛠️ Auto Fix ${active}`:'🛠️ Error นี้ต้องแก้แบบ Guided';bulkBtn.title=CROSS_BULK_FIXABLE.has(active)?(CROSS_AUTO_FIX_LOGIC[active]?.title||'แสดง Logic ก่อนยืนยันและแก้ทุกจุด'):'กฎนี้ต้องให้ผู้ใช้กำหนดค่า/ตรวจบริบทเอง';}
 const filtered=issues.filter(x=>(active==='ALL'||x.code===active)&&(!q||`${x.code} ${x.detail} ${x.solution} ${x.key}`.toLowerCase().includes(q)));
 const counts={Error:0,Warning:0,Reference:0};issues.forEach(x=>counts[x.level]=(counts[x.level]||0)+1);
 document.getElementById('crossPreflightStats').innerHTML=`<div><b>${issues.length}</b><span>จุดที่ควรตรวจ</span></div><div><b>${counts.Error||0}</b><span>Error</span></div><div><b>${counts.Warning||0}</b><span>Warning</span></div><div><b>${counts.Reference||0}</b><span>ต้องใช้ฐานอ้างอิง</span></div>`;
 document.getElementById('crossIssueBody').innerHTML=filtered.length?filtered.slice(0,500).map(x=>{const t=crossTargetForIssue_(x);return `<tr><td><b>${x.code}</b>${x.custom?'<br><small>Custom</small>':''}${x.knowledge?'<br><small class="cross-kb-badge">📚 Knowledge</small>':''}</td><td><span class="cross-level ${x.level.toLowerCase()}">${x.level}</span></td><td>${escapeHtml(x.section||'-')}${x.rowIndex>=0?` แถว ${x.rowIndex+1}`:''}<br><small>${escapeHtml(x.entry?baseName(x.entry):'ฐานอ้างอิง')}</small></td><td>${t?`<b>${escapeHtml(t.field)}</b>`:'<span class="meta">หลายฟิลด์/ต้องตรวจบริบท</span>'}</td><td>${escapeHtml(x.detail)}</td><td>${escapeHtml(x.solution)}</td><td>${x.entry?`${zipRowWasEdited_(x.entry,x.section,x.rowIndex)?'<span class="cross-edited-badge">✓ แก้แล้ว</span> ':''}<button class="primary mini" data-cross-jump="${issues.indexOf(x)}">${t?'แก้ฟิลด์นี้':'ดูจุดนี้'}</button>`:'<span class="meta">ต้องเชื่อมฐานอ้างอิง</span>'}</td></tr>`}).join(''):'<tr><td colspan="7" class="empty-row">ไม่พบรายการตามตัวกรอง</td></tr>';
 document.querySelectorAll('[data-cross-jump]').forEach(b=>b.onclick=()=>jumpToCrossIssue_(issues[Number(b.dataset.crossJump)]));renderCrossValueReplace_();
}
async function jumpToCrossIssue_(issue){
 if(!issue)return;zipReaderState.activeCrossIssue={entry:issue.entry,section:issue.section,rowIndex:issue.rowIndex,code:issue.code};await selectZipEntry(issue.entry);if(issue.section&&zipReaderState.sections[issue.section])selectZipSection(issue.section);
 const search=document.getElementById('zipTableSearch');if(search){search.value=issue.key||'';renderZipPreview();}
 updateCrossFocusStatus_(issue);const target=crossTargetForIssue_(issue);
 setTimeout(()=>{let el=target?document.querySelector(`[data-zip-row="${issue.rowIndex}"][data-zip-col="${target.col}"]`):document.querySelector(`[data-zip-row-index="${issue.rowIndex}"]`)?.closest('tr');if(el){el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});el.classList.add(target?'cross-cell-target':'cross-highlight');if(target){el.setAttribute('tabindex','0');el.focus({preventScroll:true});}setTimeout(()=>el.classList.remove(target?'cross-cell-target':'cross-highlight'),5000)}},160);
}

function openCrossRuleManager_(){document.getElementById('crossRuleManagerModal')?.classList.add('show');document.getElementById('crossRuleManagerModal')?.setAttribute('aria-hidden','false');syncCrossRuleFields_();renderCrossRuleManager_();updateCrossRuleKnowledgeStatus_(null);}
function closeCrossRuleManager_(){document.getElementById('crossRuleManagerModal')?.classList.remove('show');document.getElementById('crossRuleManagerModal')?.setAttribute('aria-hidden','true');}
function syncCrossRuleFields_(){const section=document.getElementById('crossRuleSection')?.value||'BILLTRAN',sel=document.getElementById('crossRuleField');if(!sel)return;const names=labels[section]||[];sel.innerHTML=names.map(x=>`<option value="${escapeAttr(x)}">${escapeHtml(x)}</option>`).join('');}
function updateCrossRuleKnowledgeStatus_(item,missing=false){const el=document.getElementById('crossRuleKnowledgeStatus');if(!el)return;if(item){el.className='cross-rule-kb-status ok';el.textContent=`✓ พบใน Knowledge Base · ${item.ErrorCode} · ${item.UpdatedBy||item.Updated_By||'พร้อมใช้'}`;}else if(missing){el.className='cross-rule-kb-status missing';el.textContent='ยังไม่มี Error Code นี้ใน Knowledge Base · สามารถเพิ่มเองหรือ Export Research Request ให้ ChatGPT ค้นคว้า';}else{el.className='cross-rule-kb-status';el.textContent='ยังไม่ได้ตรวจ Knowledge Base';}}
async function lookupCrossRuleKnowledge_(fill=true){const code=String(document.getElementById('crossRuleCode')?.value||'').trim().toUpperCase();if(!code){toast('กรอก Error Code','เช่น C07, C09, T33','warning');return null;}const items=await hydrateCrossKnowledgeForCodes_([code],true),item=items.find(x=>String(x.ErrorCode||'').toUpperCase()===code)||crossKnowledgeForCode_(code);updateCrossRuleKnowledgeStatus_(item,!item);if(item&&fill){const title=document.getElementById('crossRuleTitle'),solution=document.getElementById('crossRuleSolution');if(title&&!title.value.trim())title.value=item.Description||'';if(solution&&!solution.value.trim())solution.value=item.Solution||'';const rf=String(item.RelatedFile||'').trim(),fld=String(item.RelatedField||'').trim();if(rf&&[...document.getElementById('crossRuleSection').options].some(o=>o.value===rf)){document.getElementById('crossRuleSection').value=rf;syncCrossRuleFields_();}if(fld&&[...document.getElementById('crossRuleField').options].some(o=>o.value===fld))document.getElementById('crossRuleField').value=fld;toast('พบ Knowledge',`${code}: เติมความหมาย/แนวทางแก้ให้แล้ว`,'success',3500);}return item||null;}
async function openCrossRuleKnowledgeEditor_(){const code=String(document.getElementById('crossRuleCode')?.value||'').trim().toUpperCase();if(!code){toast('กรอก Error Code','กรอก Code ก่อนเปิด Knowledge','warning');return;}const item=await lookupCrossRuleKnowledge_(false);if(item){openCaseKnowledgeModal(code,'','',item);return;}openCaseKnowledgeModal(code,'',String(document.getElementById('crossRuleTitle')?.value||'').trim(),null);const modal=document.getElementById('caseKnowledgeModal');if(modal){document.getElementById('caseKnowledgeModule').value='CROSS';modal.dataset.sourceModule='CROSS';document.getElementById('caseKnowledgeRelatedFile').value=document.getElementById('crossRuleSection')?.value||'';document.getElementById('caseKnowledgeRelatedField').value=document.getElementById('crossRuleField')?.value||'';document.getElementById('caseKnowledgeCause').value='';document.getElementById('caseKnowledgeSolution').value=String(document.getElementById('crossRuleSolution')?.value||'').trim();}}
function currentCrossResearchRequest_(){const code=String(document.getElementById('crossRuleCode')?.value||'').trim().toUpperCase();const built=CROSS_RULE_GUIDE[code]||null;return{schema:'PCMC_SSO_CROSS_RESEARCH_REQUEST_V1',module:'CROSS',requestedAt:new Date().toISOString(),request:{ErrorCode:code,Section:document.getElementById('crossRuleSection')?.value||'',Field:document.getElementById('crossRuleField')?.value||'',Operator:document.getElementById('crossRuleOperator')?.value||'',Value:document.getElementById('crossRuleValue')?.value||'',Level:document.getElementById('crossRuleLevel')?.value||'Warning',CurrentTitle:document.getElementById('crossRuleTitle')?.value||built?.title||'',CurrentSolution:document.getElementById('crossRuleSolution')?.value||built?.solution||''},instruction:'ค้นคว้าจากคู่มือ/เอกสาร SSOP ที่น่าเชื่อถือ แล้วคืน Knowledge Pack schema PCMC_SSO_CROSS_KNOWLEDGE_PACK_V1 โดยมี knowledge และ rules สำหรับ Import เข้า PCMC-SSO Toolkit'};}
function exportCrossResearchRequest_(){const req=currentCrossResearchRequest_();if(!req.request.ErrorCode){toast('กรอก Error Code','กรอก Code ที่ต้องการค้นคว้าก่อน','warning');return;}const blob=new Blob([JSON.stringify(req,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`CROSS_RESEARCH_${req.request.ErrorCode}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('สร้าง Research Request แล้ว','ส่งไฟล์นี้ให้ ChatGPT เพื่อค้นคว้าและสร้าง Knowledge Pack กลับมาได้โดยไม่ต้อง Build โปรแกรมใหม่','success',6500);}
async function importCrossKnowledgePack_(file){if(!file)return;try{const pack=JSON.parse(await file.text());if(pack?.schema!=='PCMC_SSO_CROSS_KNOWLEDGE_PACK_V1')throw new Error('ไม่ใช่ Cross Knowledge Pack V1');const knowledge=Array.isArray(pack.knowledge)?pack.knowledge:[],rules=Array.isArray(pack.rules)?pack.rules:[];if(!knowledge.length&&!rules.length)throw new Error('Pack ไม่มี knowledge หรือ rules');let saved=0;if(knowledge.length){const items=knowledge.map(k=>({Module:'CROSS',ErrorCode:String(k.ErrorCode||k.code||'').trim().toUpperCase(),Description:k.Description||k.description||'',Cause:k.Cause||k.cause||'',Solution:k.Solution||k.solution||'',RelatedFile:k.RelatedFile||k.relatedFile||'',RelatedField:k.RelatedField||k.relatedField||'',Tips:k.Tips||k.tips||'',UpdatedBy:authState.user?.Display_Name||'Knowledge Pack',Active:k.Active!==false})).filter(x=>x.ErrorCode);const data=await apiRequest('upsertKnowledge',{items,createOnly:isViewer()});saved=(data.inserted||0)+(data.updated||0);cacheCrossKnowledgeItems_(items);items.forEach(x=>crossKnowledgeLoaded.add(x.ErrorCode));}if(rules.length){const old=loadCrossCustomRules_(),map=new Map(old.map(r=>[`${String(r.code||'').toUpperCase()}|${r.section}|${r.field}|${r.operator}|${r.value||''}`,r]));rules.forEach(r=>{const x={id:r.id||Date.now()+Math.random(),enabled:r.enabled!==false,code:String(r.code||r.ErrorCode||'').trim().toUpperCase(),section:r.section||r.Section,field:r.field||r.Field,operator:r.operator||r.Operator||'EMPTY',value:r.value??r.Value??'',level:r.level||r.Level||'Warning',title:r.title||r.Title||'',solution:r.solution||r.Solution||''};if(x.code&&x.section&&x.field)map.set(`${x.code}|${x.section}|${x.field}|${x.operator}|${x.value||''}`,x);});saveCrossCustomRules_([...map.values()]);}renderCrossRuleManager_();runCrossPreflight();toast('Import Knowledge Pack สำเร็จ',`Knowledge บันทึก/อัปเดต ${saved} รายการ · Rule ${rules.length} รายการ`,'success',7000);}catch(e){toast('Import Knowledge Pack ไม่สำเร็จ',e.message,'error',6500)}}
function renderCrossRuleManager_(){const body=document.getElementById('crossRuleBody');if(!body)return;const rules=loadCrossCustomRules_();body.innerHTML=rules.length?rules.map((r,i)=>{const kb=crossKnowledgeForCode_(r.code);return `<tr><td><input type="checkbox" data-cross-rule-toggle="${i}" ${r.enabled!==false?'checked':''}></td><td><b>${escapeHtml(r.code)}</b>${kb?'<br><small class="cross-kb-badge">📚 Knowledge</small>':''}</td><td>${escapeHtml(r.section)}.${escapeHtml(r.field)}</td><td>${escapeHtml(r.operator)} ${escapeHtml(r.value||'')}</td><td>${escapeHtml(kb?.Description||r.title||'')}</td><td><button class="danger mini" data-cross-rule-delete="${i}">ลบ</button></td></tr>`}).join(''):'<tr><td colspan="6" class="empty-row">ยังไม่มีกฎ Custom</td></tr>';body.querySelectorAll('[data-cross-rule-toggle]').forEach(x=>x.onchange=()=>{const a=loadCrossCustomRules_();a[+x.dataset.crossRuleToggle].enabled=x.checked;saveCrossCustomRules_(a);runCrossPreflight()});body.querySelectorAll('[data-cross-rule-delete]').forEach(x=>x.onclick=async()=>{const a=loadCrossCustomRules_(),r=a[+x.dataset.crossRuleDelete];const ok=await showDialog('ลบกฎ Custom',`ลบ ${r?.code||''} ${r?.title||''} ?`,'warning',[{text:'ยกเลิก',value:false,className:'soft'},{text:'ลบ',value:true,className:'danger'}]);if(!ok)return;a.splice(+x.dataset.crossRuleDelete,1);saveCrossCustomRules_(a);renderCrossRuleManager_();runCrossPreflight()});}
async function addCrossCustomRule_(){const code=String(document.getElementById('crossRuleCode')?.value||'').trim().toUpperCase(),section=document.getElementById('crossRuleSection')?.value,field=document.getElementById('crossRuleField')?.value,operator=document.getElementById('crossRuleOperator')?.value,value=document.getElementById('crossRuleValue')?.value||'',level=document.getElementById('crossRuleLevel')?.value||'Warning';if(/^W/i.test(code))level='Warning';else if(document.getElementById('crossRuleLevel')?.value==='Warning'&&/^[CRST]/i.test(code))level='Error';let title=String(document.getElementById('crossRuleTitle')?.value||'').trim(),solution=String(document.getElementById('crossRuleSolution')?.value||'').trim();if(!/^[A-Z][A-Z0-9]{1,5}$/.test(code)||!section||!field){toast('ข้อมูลกฎยังไม่ครบ','กรอก Error Code, Section และ Field','warning');return;}let kb=crossKnowledgeForCode_(code);if(!kb)kb=await lookupCrossRuleKnowledge_(false);title=title||String(kb?.Description||'').trim();solution=solution||String(kb?.Solution||'').trim();if(!title){toast('ยังไม่มีคำอธิบายกฎ','เพิ่มชื่อกฎเอง หรือบันทึก/Import Knowledge ของ Error Code นี้ก่อน','warning',6000);return;}const a=loadCrossCustomRules_();a.push({id:Date.now(),enabled:true,code,section,field,operator,value,level,title,solution});saveCrossCustomRules_(a);document.getElementById('crossRuleCode').value='';document.getElementById('crossRuleTitle').value='';document.getElementById('crossRuleSolution').value='';updateCrossRuleKnowledgeStatus_(null);renderCrossRuleManager_();runCrossPreflight();toast('เพิ่มกฎ Cross แล้ว',`${code} จะใช้แนวทางแก้จาก Knowledge Base เมื่อมีข้อมูล`,'success');}
function exportCrossCustomRules_(){const blob=new Blob([JSON.stringify(loadCrossCustomRules_(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='PCMC_SSO_Cross_Custom_Rules.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
async function importCrossCustomRules_(file){if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed))throw new Error('รูปแบบ JSON ต้องเป็น Array');saveCrossCustomRules_(parsed);renderCrossRuleManager_();runCrossPreflight();toast('Import กฎ Cross สำเร็จ',`${parsed.length} กฎ`,'success')}catch(e){toast('Import ไม่สำเร็จ',e.message,'error')}}
function runCrossPreflight(){
 if(String(zipReaderState.moduleCode||'').toUpperCase()!=='CROSS')return[];
 zipReaderState.crossIssues=applyCrossKnowledgeToIssues_(scanCrossZip_());const invSet=new Set((collectZipSectionsWithOrigin_().BILLTRAN||[]).map(o=>String(o.row[4]||'').trim()).filter(Boolean));zipReaderState.crossIssues.forEach(x=>{const key=String(x.key||'').trim();if(key&&invSet.has(key)){if(!zipReaderState.crossIssueHistory[x.code])zipReaderState.crossIssueHistory[x.code]=new Set();zipReaderState.crossIssueHistory[x.code].add(key);}});renderCrossPreflight_();const n=zipReaderState.crossIssues.length;updateZipEditStatus(n?`Cross: พบ ${n} จุด`:'Cross: ตรวจผ่านเบื้องต้น');const codes=[...new Set(zipReaderState.crossIssues.map(x=>x.code))];hydrateCrossKnowledgeForCodes_(codes).then(items=>{if(!items.length)return;applyCrossKnowledgeToIssues_(zipReaderState.crossIssues);renderCrossPreflight_();renderCrossRuleManager_();});return zipReaderState.crossIssues;
}

function validateZipActive(){
 const sec=zipReaderState.sections||{},problems=[],c=zipReaderState.caseItem,moduleCode=String(zipReaderState.moduleCode||c?.Module_Code||'SSOCAC').toUpperCase(),cpap=moduleCode==='STCPAP',sleep=moduleCode==='STSLEEP';
 if(moduleCode==='CROSS'){const found=runCrossPreflight();const errors=found.filter(x=>x.level==='Error').length,warnings=found.filter(x=>x.level==='Warning').length,refs=found.filter(x=>x.level==='Reference').length;showDialog(found.length?'Cross Preflight พบจุดที่ควรตรวจ':'Cross Preflight ผ่านเบื้องต้น',found.length?`พบทั้งหมด ${found.length} จุด\nError ${errors} · Warning ${warnings} · ต้องใช้ฐานอ้างอิง ${refs}\n\nระบบแสดงรายการ พร้อม “แก้ฟิลด์นี้”, Guided Replace และ Auto Fix ตาม Logic ไว้เหนือพื้นที่แก้ไขแล้ว`:'ไม่พบข้อผิดพลาดจากกฎที่ตรวจได้ภายใน ZIP ชุดนี้\nหมายเหตุ: W04/W05/W07 และการยืนยัน S18/S19/T06 แบบเต็มต้องใช้ฐานอ้างอิงภายนอก','warning');return;}
 const bill=sec.BILLTRAN||[];
 const emptyRows=(rows,idx)=>rows.map((r,i)=>({r,i})).filter(x=>!String(x.r[idx]||'').trim());
 const badRows=(rows,idx,expected)=>rows.map((r,i)=>({r,i})).filter(x=>String(x.r[idx]||'').trim().toUpperCase()!==expected);
 const addBillCommon=(expectedAuth)=>{
   if(!bill.length){problems.push('ไม่พบส่วน BILLTRAN');return;}
   const badAuth=badRows(bill,1,expectedAuth);if(badAuth.length)problems.push(`BILLTRAN.AuthCode: ต้องเป็น ${expectedAuth} จำนวน ${badAuth.length} แถว`);
   const emptyHmain=emptyRows(bill,14);if(emptyHmain.length)problems.push(`BILLTRAN.Hmain: ห้ามเป็นค่าว่าง จำนวน ${emptyHmain.length} แถว`);
   const emptyPayPlan=emptyRows(bill,15);if(emptyPayPlan.length)problems.push(`BILLTRAN.PayPlan: ห้ามเป็นค่าว่าง จำนวน ${emptyPayPlan.length} แถว`);
 };
 if(cpap||sleep){
  addBillCommon('STCPAP');
  if(bill.some(r=>!String(r[11]||'').trim()))problems.push('BILLTRAN.TFlag: ห้ามเป็นค่าว่าง');
  const targetCodes=cpap?['3012','3013']:['51120','51121'];
  const bi=sec.BillItems||[];
  const target=bi.filter(r=>targetCodes.includes(String(r[4]||'').trim()));
  if(!target.length)problems.push(`BillItems: ไม่พบ STDCode ${targetCodes.join(' หรือ ')}`);
  const badClaim=target.map(r=>({r,i:bi.indexOf(r)})).filter(x=>String(x.r[12]||'').trim().toUpperCase()!=='OPF');
  if(badClaim.length)problems.push(`BillItems.ClaimCat: เฉพาะรายการ STDCode ${targetCodes.join('/')} ต้องเป็น OPF พบไม่ถูกต้อง ${badClaim.length} แถว`);
  const ops=sec.OPServices||[];if(!ops.length)problems.push('ไม่พบส่วน OPServices');else{if(cpap&&ops.some(r=>String(r[2]||'').trim().toUpperCase()!=='ED'))problems.push('OPServices: Class ต้องเป็น ED');if(cpap&&ops.some(r=>!String(r[11]||'').trim()))problems.push('OPServices: SvPID/ว.แพทย์ ว่าง');if(ops.some(r=>!String(r[20]||'').trim()))problems.push('OPServices: SvTxCode/เลขกำกับเบิก ว่าง');}
  const dx=sec.OPDx||[];if(!dx.length)problems.push('ไม่พบส่วน OPDx');else if(cpap&&dx.some(r=>String(r[0]||'').trim().toUpperCase()!=='ED'))problems.push('OPDx: Class ต้องเป็น ED');
  if(sleep&&ops.length&&dx.length){const opClasses=[...new Set(ops.map(r=>String(r[2]||'').trim().toUpperCase()).filter(Boolean))];const dxClasses=[...new Set(dx.map(r=>String(r[0]||'').trim().toUpperCase()).filter(Boolean))];if(!opClasses.length)problems.push('OPServices: Class ว่าง');if(!dxClasses.length)problems.push('OPDx: Class ว่าง');if(opClasses.length&&dxClasses.length&&opClasses.some(x=>!dxClasses.includes(x)))problems.push('Sleep Test: OPServices.Class ต้องตรงกับ OPDx.Class');}
  updateZipEditStatus(problems.length?`พบ ${problems.length} จุด`:'ตรวจผ่าน');showDialog(problems.length?'พบข้อมูลที่ต้องตรวจสอบ':`ตรวจสอบ ${cpap?'CPAP':'Sleep Test'} เรียบร้อย`,problems.length?problems.join('\n'):`ผ่านกฎสำคัญของ ${cpap?'SSOCPAP':'Sleep Test'}: AuthCode = STCPAP, Hmain/PayPlan มีค่า และ ClaimCat = OPF เฉพาะรายการสิทธิที่กำหนด`,problems.length?'warning':'success');return;
 }
 // Cancer / SSOCAC
 addBillCommon('SSOCAC');
 if(bill.some(r=>!(r[7]||'').trim()))problems.push('BILLTRAN.MemberNo/Case Number: ห้ามเป็นค่าว่าง');
 const bi=sec.BillItems||[];
 // Cancer: ไม่บังคับ ClaimCat = OPR ทุก BillItems.
 // ให้ตรวจ/ปรับ OPR เฉพาะรายการที่เข้าเงื่อนไขรายการมะเร็งที่ระบบจับคู่ได้เท่านั้น.
 const terms=chemoDrugTerms(),chemoLabel=zipReaderState.caseItem?.Chemo_Drug||'';
 if(terms.length){const matchedDi=(sec.DispensedItems||[]).filter(r=>rowMatchesChemo(r,[2,3,5],terms)),badDi=matchedDi.filter(r=>(r[16]||'').trim().toUpperCase()!=='OPR');if(badDi.length)problems.push(`DispensedItems: รายการยา “${chemoLabel}” ที่ตรงกับทะเบียน ยังไม่ได้ระบุ ClaimCat = OPR จำนวน ${badDi.length} แถว`)}
 const ops=sec.OPServices||[];if(ops.some(r=>!r.some(v=>String(v||'').trim().toUpperCase()==='SSOCAC')))problems.push('OPServices: ไม่พบ SSOCAC ครบทุกแถว');
 const dx=sec.OPDx||[];
 if(dx.some(r=>!r.some(v=>/^C\d{4}$/i.test(String(v||'').trim()))))problems.push('OPDx: ไม่พบ Protocol C#### ครบทุกแถว');
 const hasZ511=dx.some(r=>String(r[4]||'').trim().toUpperCase()==='Z511');if(!hasZ511)problems.push('OPDx.DiagnosisCode: Cancer ต้องมีรหัส Z511 อย่างน้อย 1 รายการ');
 updateZipEditStatus(problems.length?`พบ ${problems.length} จุด`:'ตรวจผ่าน');showDialog(problems.length?'พบข้อมูลที่ต้องตรวจสอบ':'ตรวจสอบเรียบร้อย',problems.length?problems.join('\n'):'ข้อมูลผ่านกฎสำคัญ Cancer: AuthCode = SSOCAC, Hmain/PayPlan มีค่า และพบ Z511 ใน OPDx (ไม่บังคับ OPR ทุก BillItems)',problems.length?'warning':'success')
}
async function undoZipEntry(){
 const item=currentZipItem();if(!item)return;
 item.text=item.originalText;item.sections=parseZipSsopSections(item.originalText||'');item.modified=false;item.saved=false;item.savedText=null;item.autoChangedCells={};item.editedCells={};item.editedRows={};item.changeStats={cells:0,added:0,deleted:0};
 zipReaderState.zip.file(item.name,cp874Bytes(item.originalText||''));item.entry=zipReaderState.zip.file(item.name);
 Object.keys(zipReaderState.rowSelections).filter(k=>k.startsWith(`${item.name}::`)).forEach(k=>delete zipReaderState.rowSelections[k]);zipReaderState.sections=item.sections;zipReaderState.dirty=zipReaderState.entries.some(x=>x.modified);
 const names=Object.keys(item.sections);if(names.length)selectZipSection(names[0]);else{const parsed=parseSsopText(item.originalText||'');item.plainRows=parsed.rows;item.plainHeaders=parsed.headers;zipReaderState.activeSection='';zipReaderState.rows=parsed.rows;zipReaderState.headers=parsed.headers;renderZipPreview()}
 updateZipEditStatus('คืนค่าไฟล์ต้นฉบับแล้ว')
}
function extractPeriodKeyFromName(name){
  const base=String(name||'').replace(/\.[^.]+$/,'');
  const m=base.match(/(\d{4}_\d{2}_\d{8}-\d{6})/);
  return m?m[1]:base;
}
async function recordGeneratedZip(caseItem,fileName){
  if(!caseItem?.Case_ID)return null;
  return apiRequest('recordGeneratedSubmission',{Case_ID:caseItem.Case_ID,Period_Key:extractPeriodKeyFromName(fileName),Work_Order_No:caseItem.Work_Order_No||'',Source_ZIP_Name:zipReaderState.file?.name||fileName,Submission_File_Name:zipReaderState.file?.name||fileName,Generated_File_Name:fileName,updatedBy:authState.user?.Display_Name||''});
}

function zipHeaderValue_(text,tag){const m=String(text||'').match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`,'i'));return m?String(m[1]||'').trim():'';}
function zipSetHeaderValue_(text,tag,value){const re=new RegExp(`(<${tag}>)[\\s\\S]*?(</${tag}>)`,'i');return re.test(text)?text.replace(re,`$1${value}$2`):text;}
function crossPatientRows_(){const sec=collectZipSectionsWithOrigin_(),bills=sec.BILLTRAN||[],issues=zipReaderState.crossIssues||[];const dispById=new Map((sec.Dispensing||[]).map(o=>[String(o.row[1]||'').trim(),String(o.row[2]||'').trim()]));const opBySv=new Map((sec.OPServices||[]).map(o=>[String(o.row[1]||'').trim(),String(o.row[0]||'').trim()]));const issueInv=(x)=>{if(/^\w+$/.test(String(x.key||''))&&bills.some(b=>String(b.row[4]||'').trim()===String(x.key||'').trim()))return String(x.key||'').trim();if(x.section==='DispensedItems')return dispById.get(String(x.key||'').trim())||'';if(x.section==='OPDx')return opBySv.get(String(x.key||'').trim())||'';return'';};const byInv=new Map();issues.forEach(x=>{const inv=issueInv(x);if(inv){if(!byInv.has(inv))byInv.set(inv,new Set());byInv.get(inv).add(x.code);}});Object.entries(zipReaderState.crossIssueHistory||{}).forEach(([code,set])=>{(set||new Set()).forEach(inv=>{if(!byInv.has(inv))byInv.set(inv,new Set());byInv.get(inv).add(code);});});return bills.map(o=>{const r=o.row,inv=String(r[4]||'').trim(),item=zipReaderState.entries.find(e=>e.name===o.entry),edited=zipRowWasEdited_(o.entry,'BILLTRAN',o.index);return{inv,hn:String(r[6]||''),pid:String(r[12]||''),name:String(r[13]||''),codes:[...(byInv.get(inv)||[])].sort(),edited,item,rowIndex:o.index};});}
function renderZipSubsetPatients_(){const body=document.getElementById('zipSubsetBody');if(!body)return;const q=String(document.getElementById('zipSubsetSearch')?.value||'').trim().toLowerCase(),code=document.getElementById('zipSubsetCodeFilter')?.value||'ALL',ed=document.getElementById('zipSubsetEditedFilter')?.value||'ALL',all=crossPatientRows_();const rows=all.filter(x=>(code==='ALL'||x.codes.includes(code))&&(ed==='ALL'||(ed==='EDITED'?x.edited:!x.edited))&&(!q||`${x.inv} ${x.hn} ${x.pid} ${x.name}`.toLowerCase().includes(q)));body.innerHTML=rows.length?rows.map(x=>`<tr><td><input type="checkbox" data-subset-inv="${escapeAttr(x.inv)}" ${zipReaderState.subsetSelected.has(x.inv)?'checked':''}></td><td><b>${escapeHtml(x.inv)}</b></td><td>${escapeHtml(x.hn)}</td><td>${escapeHtml(x.pid)}</td><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.codes.join(', ')||'-')}</td><td>${x.edited?'<span class="cross-edited-badge">✓ แก้แล้ว</span>':'<span class="meta">ยังไม่แก้</span>'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty-row">ไม่พบผู้ป่วยตามตัวกรอง</td></tr>';body.querySelectorAll('[data-subset-inv]').forEach(cb=>cb.onchange=()=>{cb.checked?zipReaderState.subsetSelected.add(cb.dataset.subsetInv):zipReaderState.subsetSelected.delete(cb.dataset.subsetInv);updateZipSubsetCount_();});document.getElementById('zipSubsetCount').textContent=`เลือก ${zipReaderState.subsetSelected.size.toLocaleString('th-TH')} ราย · แสดง ${rows.length.toLocaleString('th-TH')} ราย`;window.__zipSubsetFilteredInvs=rows.map(x=>x.inv);}
function updateZipSubsetCount_(){const el=document.getElementById('zipSubsetCount');if(el)el.textContent=`เลือก ${zipReaderState.subsetSelected.size.toLocaleString('th-TH')} ราย`;}
function openZipSubsetExport_(){if(!zipReaderState.zip)return;zipReaderState.subsetSelected=new Set();const sel=document.getElementById('zipSubsetCodeFilter'),codes=[...new Set([...(zipReaderState.crossIssues||[]).map(x=>x.code),...Object.keys(zipReaderState.crossIssueHistory||{})])].sort();if(sel)sel.innerHTML='<option value="ALL">ทุก Error Code</option>'+codes.map(c=>`<option value="${escapeAttr(c)}">${escapeHtml(c)}</option>`).join('');const active=document.getElementById('crossIssueCodeFilter')?.value;if(active&&active!=='ALL'&&codes.includes(active))sel.value=active;const original=String(zipReaderState.file?.name||'');const m=original.match(/_SSOPBIL_(\d{4})_(\d{2})_/i);document.getElementById('zipSubsetSession').value=m?.[1]||'';document.getElementById('zipSubsetStation').value=m?.[2]||'';renderZipSubsetPatients_();const modal=document.getElementById('zipSubsetExportModal');modal?.classList.add('show');modal?.setAttribute('aria-hidden','false');}
function closeZipSubsetExport_(){const m=document.getElementById('zipSubsetExportModal');m?.classList.remove('show');m?.setAttribute('aria-hidden','true');}
function subsetFilteredRows_(section,rows,selectedInv,dispIds,svIds){if(section==='BILLTRAN')return rows.filter(r=>selectedInv.has(String(r[4]||'').trim())).map(r=>[...r]);if(section==='BillItems')return rows.filter(r=>selectedInv.has(String(r[0]||'').trim())).map(r=>[...r]);if(section==='Dispensing')return rows.filter(r=>selectedInv.has(String(r[2]||'').trim())).map(r=>[...r]);if(section==='DispensedItems')return rows.filter(r=>dispIds.has(String(r[0]||'').trim())).map(r=>[...r]);if(section==='OPServices')return rows.filter(r=>selectedInv.has(String(r[0]||'').trim())).map(r=>[...r]);if(section==='OPDx')return rows.filter(r=>svIds.has(String(r[1]||'').trim())).map(r=>[...r]);return rows.map(r=>[...r]);}
function rebuildSubsetText_(item,selectedInv,dispIds,svIds,session,station,stamp){let text=item.originalText||item.text||'',ending=text.includes('\r\n')?'\r\n':'\n',counts={};for(const [sec,rows] of Object.entries(item.sections||{})){const filtered=subsetFilteredRows_(sec,rows,selectedInv,dispIds,svIds);if(sec==='BILLTRAN')filtered.forEach(r=>{r[0]=station;});counts[sec]=filtered.length;const body=filtered.map(r=>r.join('|')).join(ending),re=new RegExp(`(<${sec}>)[\\s\\S]*?(</${sec}>)`,'i');if(re.test(text))text=text.replace(re,`$1${ending}${body}${ending}$2`);}text=zipSetHeaderValue_(text,'SESSNO',session);text=zipSetHeaderValue_(text,'DATETIME',stamp.iso);const count=counts.BILLTRAN??counts.Dispensing??counts.OPServices??0;text=zipSetHeaderValue_(text,'RECCOUNT',String(count));text=text.replace(/<\?EndNote\s+CheckSum="[^"]*"\?>\s*$/i,'').replace(/<\?EndNote\s+Checksum="[^"]*"\?>\s*$/i,'').replace(/\s+$/,'')+ending;const sum=md5(cp874Bytes(text));return text+`<?EndNote Checksum="${sum}"?>`+ending;}
async function buildZipSubset_(){const selectedInv=new Set(zipReaderState.subsetSelected||[]),session=String(document.getElementById('zipSubsetSession')?.value||'').trim(),station=String(document.getElementById('zipSubsetStation')?.value||'').trim();if(!selectedInv.size){toast('ยังไม่ได้เลือกผู้ป่วย','เลือกอย่างน้อย 1 InvNo ก่อนสร้าง ZIP','warning');return;}if(!/^\d{4}$/.test(session)){toast('Session ID ไม่ถูกต้อง','ต้องเป็นตัวเลข 4 หลัก เช่น 6908','warning');return;}if(!/^\d{2}$/.test(station)){toast('Station ID ไม่ถูกต้อง','ต้องเป็นตัวเลข 2 หลัก เช่น 01','warning');return;}await saveAllModifiedZipFiles();const sec=collectZipSectionsWithOrigin_(),dispIds=new Set((sec.Dispensing||[]).filter(o=>selectedInv.has(String(o.row[2]||'').trim())).map(o=>String(o.row[1]||'').trim()).filter(Boolean)),svIds=new Set((sec.OPServices||[]).filter(o=>selectedInv.has(String(o.row[0]||'').trim())).map(o=>String(o.row[1]||'').trim()).filter(Boolean));const now=new Date(),pad=n=>String(n).padStart(2,'0'),date=`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`,time=`${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`,stamp={iso:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`};let hcode='';for(const item of zipReaderState.entries){if(!item.text){const buf=await item.entry.async('arraybuffer');item.text=decodeSsopBuffer(buf);item.originalText=item.originalText||item.text;item.sections=item.sections||parseZipSsopSections(item.text);}hcode=hcode||zipHeaderValue_(item.text,'HCODE');}hcode=hcode||'00000';const out=new JSZip();for(const item of zipReaderState.entries){if(!item.sections||!Object.keys(item.sections).length)continue;const text=rebuildSubsetText_(item,selectedInv,dispIds,svIds,session,station,stamp);out.file(item.name,cp874Bytes(text));}const fileName=`${hcode}_SSOPBIL_${session}_${station}_${date}-${time}.zip`,blob=await out.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});if(window.showSaveFilePicker){try{const handle=await window.showSaveFilePicker({suggestedName:fileName,types:[{description:'SSOP ZIP',accept:{'application/zip':['.zip']}}]});const w=await handle.createWritable();await w.write(blob);await w.close();}catch(e){if(e?.name==='AbortError')return;throw e;}}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fileName;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}closeZipSubsetExport_();toast('สร้าง ZIP เฉพาะผู้ป่วยสำเร็จ',`${selectedInv.size} ราย · Session ${session} · Station ${station} · ${fileName}`,'success',8000);}

const CROSS_KNOWLEDGE_SEED_V457=[
 {ErrorCode:'C07',Description:'รหัสสถานพยาบาลหลัก (Hmain) ไม่ถูกต้อง',Cause:'Hmain ว่าง หรือระบุรหัสสถานพยาบาลผู้รักษาแทนสถานพยาบาลหลักของผู้ประกันตน ณ วันรักษา',Solution:'ตรวจสิทธิผู้ประกันตน ณ BILLTRAN.DTTran แล้วแก้ BILLTRAN.Hmain เป็นรหัสสถานพยาบาลหลัก 5 หลักที่ถูกต้อง ห้ามเดาจาก Hcode ของผู้รักษา',RelatedFile:'BILLTRAN',RelatedField:'Hmain',Tips:'C07 เป็น Error ไม่ใช่ Warning. อ้างอิงคู่มือ SSOP: หากไม่บันทึก Hmain ระบบอาจแทน 10000 และติด C07'},
 {ErrorCode:'C08',Description:'Hcode ของ Invoice เดียวกันไม่ตรงกัน',Cause:'BILLTRAN.Hcode, Dispensing.ProviderID หรือ OPServices.Hcode ของ InvNo เดียวกันต่างกัน',Solution:'ใช้ InvNo เป็น key ตรวจผู้ให้บริการจริง แล้วทำรหัสสถานพยาบาลให้สอดคล้องกันทุกแฟ้ม',RelatedFile:'BILLTRAN / BILLDISP / OPServices',RelatedField:'Hcode / ProviderID',Tips:'Auto Fix ใช้ BILLTRAN.Hcode เป็นค่าหลักได้เมื่อยืนยันว่า BILLTRAN ถูกต้อง'},
 {ErrorCode:'R04',Description:'ยอดเบิกของ Dispensing และ DispensedItems ไม่ตรงกัน',Cause:'ยอดหัวใบสั่งยาไม่เท่ากับผลรวมรายการย่อยใน DispID เดียวกัน',Solution:'Dispensing.ChargeAmt = ผลรวม DispensedItems.ChargeAmt และ Dispensing.ClaimAmt = ผลรวม DispensedItems.ReimbAmt. ตรวจรายการยาที่ขาด/เกินก่อนบันทึก',RelatedFile:'BILLDISP',RelatedField:'Dispensing.ChargeAmt / ClaimAmt; DispensedItems.ChargeAmt / ReimbAmt',Tips:'Safe Auto Fix ปรับยอดหัวจากผลรวมรายการย่อย. ไม่ลบรายการ ReimbPrice/ReimbAmt=0 อัตโนมัติ เพราะอาจเป็นรายการที่ไม่ขอเบิกแต่ต้องคงข้อมูล'},
 {ErrorCode:'R31',Description:'ใน BillTran มีการเบิกค่ายา แต่ขาดข้อมูลยาใน BillDisp',Cause:'InvNo มี BillItems หมวดยาแต่ไม่มี Dispensing/DispensedItems ที่สัมพันธ์กัน',Solution:'ตรวจ InvNo และเพิ่มข้อมูล BILLDISP ที่ขาดให้ครบ หรือยกเลิกรายการค่ายาที่ไม่ควรเบิกตามข้อมูลจริง',RelatedFile:'BILLTRAN / BILLDISP',RelatedField:'InvNo',Tips:'ห้ามสร้างข้อมูลยาโดยเดา'},
 {ErrorCode:'R33',Description:'ยอดเบิกยาใน BillTran/BillItems ไม่เท่ากับ Dispensing',Cause:'ผลรวมยอดขอเบิกหมวดยาใน BillItems ไม่สัมพันธ์กับ Dispensing.ClaimAmt',Solution:'ใช้ InvNo เทียบยอดหมวดยาและ Dispensing จากนั้นแก้รายการย่อยหรือยอดสรุปให้ตรงตามข้อมูลจริง',RelatedFile:'BillItems / BILLDISP',RelatedField:'ClaimAmount / ClaimAmt',Tips:'ควรตรวจ R04/R43 ก่อน เพราะยอดรายการยาอาจเป็นต้นเหตุ'},
 {ErrorCode:'R60',Description:'ไม่ระบุ Quantity ใน DispensedItems หรือระบุ 0.00',Cause:'DispensedItems.Quantity ว่างหรือไม่มากกว่า 0',Solution:'กรอกจำนวนยาที่จ่ายจริง และคำนวณ ChargeAmt/ReimbAmt ใหม่ตาม Quantity × ราคาต่อหน่วย',RelatedFile:'BILLDISP',RelatedField:'DispensedItems.Quantity',Tips:'ตรวจ UnitPrice และ ReimbPrice ประกอบ'},
 {ErrorCode:'S14',Description:'DTAppoint ไม่ถูกต้อง',Cause:'วันนัดผิดรูปแบบหรือไม่สัมพันธ์กับวันบริการ',Solution:'ตรวจวันนัดตามข้อมูลเวชระเบียน ใช้รูปแบบวันที่ตาม SSOP และไม่ควรเป็นวันก่อนบริการเมื่อเป็นนัดครั้งต่อไป',RelatedFile:'OPServices',RelatedField:'DTAppoint',Tips:'หากไม่มีนัดให้ใช้ค่าว่างตามข้อกำหนด ไม่สร้างวันนัดเอง'},
 {ErrorCode:'S18',Description:'รหัสการวินิจฉัยไม่ถูกต้องหรือไม่สัมพันธ์กับ CodeSet',Cause:'OPDx.Code/DiagnosisCode ผิดรูปแบบหรือไม่อยู่ใน codeset ที่ระบุ',Solution:'ตรวจรหัส ICD/codeset จากแหล่งอ้างอิงที่ใช้ในงวดส่ง และตัดเครื่องหมายจุดในรหัสตามข้อกำหนด SSOP เมื่อ applicable',RelatedFile:'OPServices',RelatedField:'OPDx.CodeSet / Code',Tips:'ต้องใช้ฐาน codeset เพื่อยืนยันเต็มรูปแบบ'},
 {ErrorCode:'S19',Description:'รหัสการให้บริการไม่ถูกต้องหรือไม่สัมพันธ์กับ CodeSet',Cause:'OPServices.CodeSet กับ STDCode/LCCode ไม่ครบหรือไม่สัมพันธ์กัน',Solution:'ตรวจชนิดบริการและ codeset ที่กองทุนกำหนด แล้วแก้รหัสให้สัมพันธ์กันตามบริการจริง',RelatedFile:'OPServices',RelatedField:'CodeSet / STDCode / LCCode',Tips:'ต้องใช้ฐาน codeset เพื่อยืนยันเต็มรูปแบบ'},
 {ErrorCode:'S32',Description:'HN ไม่ตรงกับ HN ใน BILLTRAN',Cause:'HN ใน Dispensing หรือ OPServices ไม่ตรงกับ BILLTRAN ของ InvNo เดียวกัน',Solution:'ใช้ InvNo เป็น key และยืนยันว่าเป็นผู้ป่วยคนเดียวกัน จากนั้นทำ HN ให้ตรงกับ BILLTRAN.HN',RelatedFile:'BILLDISP / OPServices',RelatedField:'HN',Tips:'รองรับ Auto Fix เมื่อ BILLTRAN เป็นข้อมูลหลักที่ถูกต้อง'},
 {ErrorCode:'S33',Description:'PID ไม่ตรงกับ PID ใน BILLTRAN',Cause:'PID ใน Dispensing หรือ OPServices ไม่ตรงกับ BILLTRAN ของ InvNo เดียวกัน',Solution:'ใช้ InvNo เป็น key ตรวจผู้ป่วย แล้วทำ PID ให้ตรงกับ BILLTRAN.PID',RelatedFile:'BILLDISP / OPServices',RelatedField:'PID',Tips:'รองรับ Auto Fix เมื่อ BILLTRAN เป็นข้อมูลหลักที่ถูกต้อง'},
 {ErrorCode:'S41',Description:'Class เป็นหัตถการแต่ไม่ระบุรหัสหัตถการใน OPServices',Cause:'ประเภทบริการต้องมีรหัสบริการแต่ LCCode/STDCode หรือ CodeSet ขาด',Solution:'ตรวจหัตถการจริงจากเวชระเบียนและระบุ LCCode/STDCode พร้อม CodeSet ให้ครบตามประกาศ',RelatedFile:'OPServices',RelatedField:'Class / LCCode / STDCode / CodeSet',Tips:'ห้ามเดารหัสหัตถการ'},
 {ErrorCode:'T01',Description:'InvNo ซ้ำกันในไฟล์เดียวกัน',Cause:'BILLTRAN มี InvNo ซ้ำ',Solution:'ตรวจว่าเป็นรายการซ้ำหรือคนละ visit. หากต้องเปลี่ยน InvNo ต้องเปลี่ยน reference ใน BillItems/Dispensing/OPServices ที่เกี่ยวข้องพร้อมกัน',RelatedFile:'BILLTRAN',RelatedField:'InvNo',Tips:'InvNo เป็น key หลักของชุดธุรกรรม'},
 {ErrorCode:'T06',Description:'รหัสสิทธิประกันสุขภาพหลักไม่ถูกต้อง',Cause:'Hmain/PayPlan ว่างหรือไม่ตรงสิทธิที่มีผล ณ วันบริการ',Solution:'ตรวจสิทธิจาก master/ฐานสิทธิ ณ DTTran แล้วแก้ Hmain/PayPlan ตามจริง',RelatedFile:'BILLTRAN',RelatedField:'Hmain / PayPlan',Tips:'ต้องใช้ฐานสิทธิภายนอกเพื่อยืนยันเต็มรูปแบบ'},
 {ErrorCode:'T15',Description:'SvRefID ไม่ถูกต้อง กรณีหมวด 3 และ 5',Cause:'BillItems.SvRefID ไม่สามารถเชื่อม OPServices.SvID ของบริการที่เกี่ยวข้องได้',Solution:'ตรวจ InvNo/บริการและแก้ SvRefID ให้ชี้ SvID ที่ถูกต้อง หรือเพิ่ม OPServices ที่ขาดจากข้อมูลจริง',RelatedFile:'BillItems / OPServices',RelatedField:'SvRefID / SvID',Tips:'ห้ามสร้าง SvID โดยเดา'},
 {ErrorCode:'T31',Description:'ไม่มีรายการ BillItems ของ BILLTRAN นี้',Cause:'มี BILLTRAN แต่ไม่มี BillItems ที่ใช้ InvNo เดียวกัน',Solution:'เพิ่ม BillItems ที่ขาดจากระบบต้นทาง หรือเอา BILLTRAN ที่ไม่ควรส่งออกจากชุดส่ง',RelatedFile:'BILLTRAN / BillItems',RelatedField:'InvNo',Tips:'ใช้ InvNo เป็น key'},
 {ErrorCode:'T33',Description:'Amount ไม่ตรงกับยอดรวม BillItems',Cause:'BILLTRAN.Amount ไม่เท่ากับผลรวม BillItems.ChargeAmt ของ InvNo เดียวกัน',Solution:'ตรวจรายการย่อย แล้วปรับ BILLTRAN.Amount = ผลรวม ChargeAmt เมื่อรายการย่อยถูกต้อง',RelatedFile:'BILLTRAN / BillItems',RelatedField:'Amount / ChargeAmt',Tips:'รองรับ Safe Auto Fix จากผลรวมรายการย่อย'},
 {ErrorCode:'T42',Description:'SvDate ไม่สัมพันธ์กับ DTTran',Cause:'BillItems.SvDate ไม่สัมพันธ์กับวันธุรกรรม BILLTRAN.DTTran',Solution:'ตรวจวันที่บริการจริงของ visit และแก้วันที่ที่ผิด โดยไม่เปลี่ยนวันที่อัตโนมัติหากยังไม่ยืนยัน',RelatedFile:'BILLTRAN / BillItems',RelatedField:'DTTran / SvDate',Tips:'Error; ต้องอิงวันบริการจริง'},
 {ErrorCode:'T44',Description:'ClaimAmount ไม่เท่ากับ ClaimUP × Quantity',Cause:'ยอดขอเบิกรายการคำนวณไม่สัมพันธ์กับราคาเบิกต่อหน่วยและจำนวน',Solution:'เมื่อ Quantity และ ClaimUP ถูกต้อง ให้คำนวณ ClaimAmount = ClaimUP × Quantity โดยใช้หลักการปัดเศษที่ระบบกำหนด',RelatedFile:'BillItems',RelatedField:'Quantity / ClaimUP / ClaimAmount',Tips:'รองรับ Auto Fix เมื่อ Quantity และ ClaimUP ยืนยันแล้ว'},
 {ErrorCode:'T45',Description:'ผลรวม ClaimAmount ไม่เท่ากับ BILLTRAN.ClaimAmt',Cause:'ยอดขอเบิกรวมไม่ตรงผลรวมรายการย่อย',Solution:'ตรวจ BillItems แล้วปรับ BILLTRAN.ClaimAmt = ผลรวม BillItems.ClaimAmount เมื่อรายการย่อยถูกต้อง',RelatedFile:'BILLTRAN / BillItems',RelatedField:'ClaimAmt / ClaimAmount',Tips:'รองรับ Safe Auto Fix จากผลรวมรายการย่อย'},
 {ErrorCode:'T51',Description:'ไม่มีข้อมูล OPServices ของ BILLTRAN นี้',Cause:'มี BILLTRAN แต่ไม่พบ OPServices ของ InvNo เดียวกัน',Solution:'เพิ่มข้อมูลบริการที่ขาดจากต้นทาง หรือเอาธุรกรรมที่ไม่ควรส่งออกจากชุดข้อมูล',RelatedFile:'BILLTRAN / OPServices',RelatedField:'InvNo',Tips:'ห้ามสร้างบริการโดยเดา'},
 {ErrorCode:'T55',Description:'ไม่ระบุ Quantity ใน BillItems หรือระบุ 0.00',Cause:'BillItems.Quantity ว่างหรือไม่มากกว่า 0',Solution:'กรอกจำนวนจริง แล้วตรวจ ChargeAmt และ ClaimAmount ที่คำนวณจากราคาต่อหน่วยใหม่',RelatedFile:'BillItems',RelatedField:'Quantity',Tips:'ตรวจ T44/T45 ต่อหลังแก้'},
 {ErrorCode:'W04',Description:'DTTran ไม่อยู่ในช่วงที่โรงพยาบาลแจ้งใช้ราคายานี้',Cause:'วันบริการอยู่นอกช่วง Effective/Expire ของ Drugcatalog',Solution:'ตรวจ Drugcatalog เวอร์ชันที่มีผลในวันบริการ แล้วแก้ master ราคา/วันที่หรือข้อมูลส่งตามข้อเท็จจริง',RelatedFile:'BILLDISP / Drugcatalog',RelatedField:'DTTran / HospDrgID',Tips:'Warning; ต้องเชื่อม Drugcatalog'},
 {ErrorCode:'W05',Description:'ราคายาไม่ตรงกับ Drugcatalog',Cause:'ราคาที่ส่งไม่ตรงราคาที่ประกาศใช้สำหรับ Local Drug Code ในช่วงวันนั้น',Solution:'ตรวจ HospDrgID และราคาที่มีผลใน Drugcatalog แล้วแก้ต้นทางหรือรายการส่งให้ตรง',RelatedFile:'BILLDISP / Drugcatalog',RelatedField:'HospDrgID / ReimbPrice',Tips:'Warning; ต้องเชื่อม Drugcatalog'},
 {ErrorCode:'W07',Description:'รหัส TMT ใน DispensedItems ไม่ตรง Drugcatalog',Cause:'DrgID/TMT ของ HospDrgID ไม่ตรงกับ master Drugcatalog',Solution:'ตรวจ mapping Local Drug Code → TMT ใน Drugcatalog และแก้ master หรือแฟ้มส่งตามข้อมูลจริง',RelatedFile:'BILLDISP / Drugcatalog',RelatedField:'HospDrgID / DrgID',Tips:'Warning; ต้องเชื่อม Drugcatalog'}
];
async function syncCrossKnowledgeSeed_(){if(String(authState.user?.Role||'').toUpperCase()!=='ADMIN'){toast('เฉพาะ Admin','การอัปเดต Knowledge มาตรฐานต้องใช้สิทธิ์ Admin','warning');return;}const ok=await showDialog('อัปเดต Cross Knowledge มาตรฐาน',`ระบบจะ Upsert ${CROSS_KNOWLEDGE_SEED_V457.length} Error/Warning โดยใช้ Module + ErrorCode เป็น key จึงไม่สร้างรายการซ้ำ และผู้ใช้ยังแก้/นำเข้า Error ใหม่ได้เหมือนเดิม`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'อัปเดต Knowledge',value:true,className:'primary'}]);if(!ok)return;try{const items=CROSS_KNOWLEDGE_SEED_V457.map(x=>({Module:'CROSS',...x,UpdatedBy:authState.user?.Display_Name||'V4.5.7 Knowledge Seed',Active:true}));const d=await apiRequest('upsertKnowledge',{items});cacheCrossKnowledgeItems_(items);toast('อัปเดต Knowledge สำเร็จ',`เพิ่ม ${d.inserted||0} · อัปเดต ${d.updated||0} · ไม่สร้างรายการซ้ำ`,'success',7000);await loadKnowledge(document.getElementById('knowledgeSearchInput')?.value||'',document.getElementById('knowledgeModuleFilter')?.value||'ALL');}catch(e){toast('อัปเดต Knowledge ไม่สำเร็จ',e.message,'error',6500);}}

async function downloadEditedZip(){
 if(!zipReaderState.zip||!zipReaderState.file)return;
 try{
  const summary=zipChangeSummary();const changed=zipReaderState.entries.filter(x=>x.modified).length;
  if(changed){const ok=await showDialog('ยืนยันสร้าง ZIP',`ระบบจะบันทึกไฟล์ที่แก้ไข ${changed} ไฟล์ และสร้าง MD5 ใหม่ก่อน ZIP\n\nแก้ไขเซลล์ ${summary.cells} ครั้ง\nเพิ่ม ${summary.added} แถว\nลบ ${summary.deleted} แถว`,'info',[{text:'ยกเลิก',value:false,className:'soft'},{text:'บันทึกและสร้าง ZIP',value:true,className:'primary'}]);if(!ok)return;}
  updateZipEditStatus('กำลังบันทึกทุกไฟล์และสร้าง ZIP...');await saveAllModifiedZipFiles();
  const blob=await zipReaderState.zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});let savedName=zipReaderState.file.name,saveMode='ดาวน์โหลดผ่าน Browser';if(window.showSaveFilePicker){try{const handle=await window.showSaveFilePicker({suggestedName:savedName,types:[{description:'ZIP file',accept:{'application/zip':['.zip']}}]});const writable=await handle.createWritable();await writable.write(blob);await writable.close();savedName=handle.name||savedName;saveMode='บันทึกไปยังตำแหน่งที่ผู้ใช้เลือก';}catch(err){if(err?.name==='AbortError'){updateZipEditStatus('ยกเลิกการบันทึก ZIP');return;}throw err;}}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=savedName;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
  let tracked=false;if(zipReaderState.caseItem){await recordGeneratedZip(zipReaderState.caseItem,savedName);tracked=true;zipReaderState.caseItem.Case_Status='รอตรวจสอบ';const local=registryState.items.find(x=>x.Case_ID===zipReaderState.caseItem.Case_ID);if(local)local.Case_Status='รอตรวจสอบ';applyRegistryFilter();renderRegistryStats();}
  updateZipEditStatus('บันทึกแล้ว · สร้าง ZIP เรียบร้อย');toast('สร้าง ZIP สำเร็จ',tracked?`สร้าง MD5 ใหม่และ${saveMode}: ${savedName} · บันทึกประวัติแล้ว`:`สร้าง MD5 ใหม่และ${saveMode}: ${savedName}`,'success',8000);const note=document.getElementById('zipSaveLocationNote');if(note)note.textContent=`✓ สร้างไฟล์ ${savedName} แล้ว · ${saveMode}`;
 }catch(err){updateZipEditStatus('สร้าง ZIP ไม่สำเร็จ');toast('สร้าง ZIP ไม่สำเร็จ',err.message,'error',7000)}
}

document.getElementById('crossRunPreflightBtn')?.addEventListener('click',runCrossPreflight);document.getElementById('crossBulkFixBtn')?.addEventListener('click',bulkFixSelectedCrossCode_);document.getElementById('crossRuleKnowledgeLookupBtn')?.addEventListener('click',()=>lookupCrossRuleKnowledge_(true));document.getElementById('crossRuleKnowledgeEditBtn')?.addEventListener('click',openCrossRuleKnowledgeEditor_);document.getElementById('crossResearchExportBtn')?.addEventListener('click',exportCrossResearchRequest_);document.getElementById('crossKnowledgePackImportBtn')?.addEventListener('click',()=>document.getElementById('crossKnowledgePackImportInput')?.click());document.getElementById('crossKnowledgePackImportInput')?.addEventListener('change',e=>{importCrossKnowledgePack_(e.target.files?.[0]);e.target.value='';});document.getElementById('crossRuleCode')?.addEventListener('change',()=>lookupCrossRuleKnowledge_(true));document.getElementById('crossIssueCodeFilter')?.addEventListener('change',()=>{zipReaderState.crossFocus=null;updateCrossFocusStatus_(null);renderCrossPreflight_();});document.getElementById('crossIssueSearch')?.addEventListener('input',renderCrossPreflight_);document.getElementById('crossReplaceApplyBtn')?.addEventListener('click',applyCrossValueReplace_);document.getElementById('crossFocusPrevBtn')?.addEventListener('click',()=>moveCrossFocus_(-1));document.getElementById('crossFocusNextBtn')?.addEventListener('click',()=>moveCrossFocus_(1));document.getElementById('crossFocusBackBtn')?.addEventListener('click',()=>{updateCrossFocusStatus_(null);document.getElementById('crossPreflight')?.scrollIntoView({behavior:'smooth',block:'start'});});document.getElementById('crossRuleManagerBtn')?.addEventListener('click',openCrossRuleManager_);document.getElementById('crossRuleManagerClose')?.addEventListener('click',closeCrossRuleManager_);document.getElementById('crossRuleSection')?.addEventListener('change',syncCrossRuleFields_);document.getElementById('crossRuleAddBtn')?.addEventListener('click',addCrossCustomRule_);document.getElementById('crossRuleExportBtn')?.addEventListener('click',exportCrossCustomRules_);document.getElementById('crossRuleImportBtn')?.addEventListener('click',()=>document.getElementById('crossRuleImportInput')?.click());document.getElementById('crossRuleImportInput')?.addEventListener('change',e=>{importCrossCustomRules_(e.target.files?.[0]);e.target.value='';});
document.getElementById('zipChooseBtn')?.addEventListener('click',()=>document.getElementById('zipFileInput').click());document.getElementById('zipFileInput')?.addEventListener('change',e=>handleZipFile(e.target.files?.[0]));document.getElementById('zipChangeBtn')?.addEventListener('click',resetZipReader);let zipSearchTimer=null;document.getElementById('zipTableSearch')?.addEventListener('input',()=>{clearTimeout(zipSearchTimer);zipSearchTimer=setTimeout(renderZipPreview,120)});document.getElementById('zipAutoFillBtn')?.addEventListener('click',autoFillZipFromCase);document.getElementById('zipSaveFileBtn')?.addEventListener('click',saveCurrentZipFile);document.getElementById('zipValidateBtn')?.addEventListener('click',validateZipActive);document.getElementById('zipUndoBtn')?.addEventListener('click',undoZipEntry);document.getElementById('zipAddRowBtn')?.addEventListener('click',addZipRow);document.getElementById('zipDeleteRowsBtn')?.addEventListener('click',deleteSelectedZipRows);document.getElementById('zipSubsetExportBtn')?.addEventListener('click',openZipSubsetExport_);document.getElementById('zipSubsetClose')?.addEventListener('click',closeZipSubsetExport_);document.getElementById('zipSubsetCancel')?.addEventListener('click',closeZipSubsetExport_);document.getElementById('zipSubsetCodeFilter')?.addEventListener('change',renderZipSubsetPatients_);document.getElementById('zipSubsetSearch')?.addEventListener('input',renderZipSubsetPatients_);document.getElementById('zipSubsetEditedFilter')?.addEventListener('change',renderZipSubsetPatients_);document.getElementById('zipSubsetSelectFilteredBtn')?.addEventListener('click',()=>{(window.__zipSubsetFilteredInvs||[]).forEach(x=>zipReaderState.subsetSelected.add(x));renderZipSubsetPatients_();});document.getElementById('zipSubsetClearBtn')?.addEventListener('click',()=>{zipReaderState.subsetSelected.clear();renderZipSubsetPatients_();});document.getElementById('zipSubsetBuildBtn')?.addEventListener('click',buildZipSubset_);document.getElementById('zipDownloadBtn')?.addEventListener('click',downloadEditedZip);const zipDrop=document.getElementById('zipDropZone');if(zipDrop){['dragenter','dragover'].forEach(ev=>zipDrop.addEventListener(ev,e=>{e.preventDefault();zipDrop.classList.add('dragover')}));['dragleave','drop'].forEach(ev=>zipDrop.addEventListener(ev,e=>{e.preventDefault();zipDrop.classList.remove('dragover')}));zipDrop.addEventListener('drop',e=>handleZipFile(e.dataTransfer.files?.[0]))}

/* Excel Import V4.5.2 */
const excelImportState={file:null,rows:[],duplicates:{},fileName:'',sheetName:''};
const EXCEL_HEADERS_CANCER=['วันที่มารับบริการ','HN','vn','เลขบัตรประชาชน','ชื่อ-นามสกุล','สิทธิการรักษา','ยา Chemo','Case No.','Protocal','TFlag','Session','Station','JobNo'];
const EXCEL_HEADERS_CPAP=['วันที่รับบริการ','บัตรประชาชน','HN','VN','ชื่อ-นามสกุล','สิทธิ','เลขกำกับเบิก','ว.แพทย์','รหัสวินิจฉัย','tflag','session','station','JobNo'];
const EXCEL_HEADERS_SLEEP=['เลขบัตร ปชช.','VN','HN','ชื่อผู้ป่วย','วันที่รับบริการ','สิทธิการรักษา','PDx.ICD10','เลขกำกับเบิก','tflag','session','station','JobNo'];
function openExcelImport(){resetExcelImport();const cpap=currentRegistryModule==='STCPAP';const sleep=currentRegistryModule==='STSLEEP';const m=document.getElementById('excelImportModal');const title=m?.querySelector('.modal-head strong');const meta=m?.querySelector('.modal-head .meta');if(title)title.textContent=cpap?'📥 นำเข้า Excel — CPAP':sleep?'📥 นำเข้า Excel — Sleep Test':'📥 นำเข้า Excel — Cancer';if(meta)meta.textContent=cpap?'อ่าน TAB CPAP ตาม Pattern 13 คอลัมน์และตรวจรายการซ้ำก่อนบันทึก':sleep?'อ่าน TAB SleepTest ตาม Pattern 12 คอลัมน์และตรวจรายการซ้ำก่อนบันทึก':'รองรับรูปแบบไฟล์ตัวอย่าง DATA และตรวจรายการซ้ำก่อนบันทึก';m.classList.add('show');m.setAttribute('aria-hidden','false')}
function closeExcelImport(){const m=document.getElementById('excelImportModal');m.classList.remove('show');m.setAttribute('aria-hidden','true')}
function resetExcelImport(){excelImportState.file=null;excelImportState.rows=[];excelImportState.duplicates={};document.getElementById('excelImportFile').value='';showImportStep('choose')}
function showImportStep(step){['Choose','Preview','Result'].forEach(n=>document.getElementById('import'+n+'Step')?.classList.toggle('hidden',n.toLowerCase()!==step))}
function cleanText(v){return String(v??'').replace(/\s+/g,' ').trim()}
function normalizeIdentifier(v,length=0){let t=cleanText(v).replace(/\.0$/,'');if(!t)return'';if(length&&/^\d+$/.test(t))t=t.padStart(length,'0');return t}
function excelDateToIso(v){
 if(v===null||v===undefined||v==='')return'';
 const normalizeParts=(y,m,d)=>{
   y=Number(y);m=Number(m);d=Number(d);
   if(!y||!m||!d)return'';
   if(y>2400)y-=543;
   // ไฟล์ Excel เดิมบางชุดเก็บ Serial Date คลาด 57 ปีและ 1 วัน
   // แก้เฉพาะปีเก่าผิดปกติ เพื่อไม่กระทบวันที่ของ SSOCAC
   if(y>=1960&&y<2000){
     const fixed=new Date(Date.UTC(y+57,m-1,d));
     fixed.setUTCDate(fixed.getUTCDate()+1);
     y=fixed.getUTCFullYear();m=fixed.getUTCMonth()+1;d=fixed.getUTCDate();
   }
   if(y<2000||y>2100)return'';
   return `${String(y).padStart(4,'0')}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 };
 if(v instanceof Date&&!isNaN(v))return normalizeParts(v.getFullYear(),v.getMonth()+1,v.getDate());
 if(typeof v==='number'&&window.XLSX?.SSF){const d=XLSX.SSF.parse_date_code(v);if(d)return normalizeParts(d.y,d.m,d.d)}
 const t=cleanText(v);
 let m=t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);if(m)return normalizeParts(m[3],m[2],m[1]);
 m=t.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);if(m)return normalizeParts(m[1],m[2],m[3]);
 return '';
}

function mapCancerExcelRow(r,index){const item={_row:index+2,Module_Code:'SSOCAC',Service_Date:excelDateToIso(r['วันที่มารับบริการ']),HN:cleanText(r['HN']),VN:cleanText(r['vn']??r['VN']),CID:cleanText(r['เลขบัตรประชาชน']),Patient_Name:cleanText(r['ชื่อ-นามสกุล']),Coverage:cleanText(r['สิทธิการรักษา']),Chemo_Drug:cleanText(r['ยา Chemo']),SSO_Case_No:cleanText(r['Case No.']),Protocol_Code:cleanText(r['Protocal']??r['Protocol']),TFlag:cleanText(r['TFlag']),Session:cleanText(r['Session']),Station:cleanText(r['Station']),Work_Order_No:cleanText(r['JobNo']),Case_Status:'รอเตรียมข้อมูล',Updated_By:authState.user?.Display_Name||''};item._key=item.VN?`SSOCAC|${item.HN}|${item.VN}`:`SSOCAC|${item.HN}|${item.Service_Date}|${item.SSO_Case_No}|${item.Session}|${item.Station}`;item._errors=[];if(!item.Service_Date)item._errors.push('วันที่ไม่ถูกต้อง');if(!item.HN)item._errors.push('ไม่มี HN');if(!item.Patient_Name)item._errors.push('ไม่มีชื่อผู้ป่วย');return item}

function mapCpapExcelRow(r,index){
 const get=(...keys)=>{for(const k of keys){if(Object.prototype.hasOwnProperty.call(r,k)&&cleanText(r[k])!=='')return r[k]}return''};
 const hasDiagnosis=Object.prototype.hasOwnProperty.call(r,'รหัสวินิจฉัย')||Object.prototype.hasOwnProperty.call(r,'Diagnosis_Code');
 const item={_row:index+2,Module_Code:'STCPAP',Service_Type:cleanText(get('Service_Type','ประเภทบริการ'))||'CPAP',Service_Date:excelDateToIso(get('วันที่รับบริการ','Service_Date')),CID:normalizeIdentifier(get('บัตรประชาชน','CID'),13),HN:normalizeIdentifier(get('HN','hn','เลข HN'),9),VN:normalizeIdentifier(get('VN','vn')),Patient_Name:cleanText(get('ชื่อ-นามสกุล','ชื่อผู้ป่วย','Patient_Name')),Coverage:cleanText(get('สิทธิ','สิทธิการรักษา','Coverage')),Claim_Control_No:cleanText(get('เลขกำกับเบิก','Claim_Control_No')),TFlag:cleanText(get('tflag','TFlag')),Session:normalizeIdentifier(get('session','Session')),Station:normalizeIdentifier(get('station','Station'),2),Doctor_License:cleanText(get('ว.แพทย์','Doctor_License')),Diagnosis_Code:hasDiagnosis?cleanText(get('รหัสวินิจฉัย','Diagnosis_Code')):'',Work_Order_No:normalizeIdentifier(get('JobNo','Work_Order_No')),Case_Status:'รอเตรียมข้อมูล',Updated_By:authState.user?.Display_Name||''};
 item._key=item.VN?`STCPAP|${item.HN}|${item.VN}`:`STCPAP|${item.HN}|${item.Service_Date}|${item.Claim_Control_No}|${item.Session}|${item.Station}`;item._errors=[];if(!item.Service_Date)item._errors.push('วันที่ไม่ถูกต้อง');if(!item.HN)item._errors.push('ไม่มี HN');if(!item.Patient_Name)item._errors.push('ไม่มีชื่อผู้ป่วย');if(!item.Coverage)item._errors.push('ไม่มีสิทธิ');if(!item.Claim_Control_No)item._errors.push('ไม่มีเลขกำกับเบิก');if(!item.TFlag)item._errors.push('ไม่มี TFlag');return item;
}
function mapSleepExcelRow(row,index){
 const get=(...keys)=>{for(const k of keys){if(Object.prototype.hasOwnProperty.call(row,k))return row[k]}return ''};
 const item={_row:index+2,Module_Code:'STSLEEP',Service_Type:'SLEEP_TEST',Service_Date:excelDateToIso(get('วันที่รับบริการ','Service_Date')),CID:normalizeIdentifier(get('เลขบัตร ปชช.','เลขบัตรประชาชน','CID'),13),HN:normalizeIdentifier(get('HN','hn','เลข HN'),9),VN:normalizeIdentifier(get('VN','vn')),Patient_Name:cleanText(get('ชื่อผู้ป่วย','ชื่อ-นามสกุล','Patient_Name')),Coverage:cleanText(get('สิทธิการรักษา','สิทธิ','Coverage')),Diagnosis_Code:cleanText(get('PDx.ICD10','รหัสวินิจฉัย','Diagnosis_Code')),Claim_Control_No:cleanText(get('เลขกำกับเบิก','Claim_Control_No')),TFlag:cleanText(get('tflag','TFlag')),Session:normalizeIdentifier(get('session','Session')),Station:normalizeIdentifier(get('station','Station'),2),Work_Order_No:normalizeIdentifier(get('JobNo','Work_Order_No')),Doctor_License:'',Case_Status:'รอเตรียมข้อมูล',Updated_By:authState.user?.Display_Name||''};
 item._key=item.VN?`STSLEEP|${item.HN}|${item.VN}`:`STSLEEP|${item.HN}|${item.Service_Date}|${item.Claim_Control_No}|${item.Session}|${item.Station}`;item._errors=[];if(!item.Service_Date)item._errors.push('วันที่ไม่ถูกต้อง');if(!item.HN)item._errors.push('ไม่มี HN');if(!item.Patient_Name)item._errors.push('ไม่มีชื่อผู้ป่วย');if(!item.Coverage)item._errors.push('ไม่มีสิทธิ');if(!item.Claim_Control_No)item._errors.push('ไม่มีเลขกำกับเบิก');if(!item.TFlag)item._errors.push('ไม่มี TFlag');return item;
}
async function handleExcelFile(file){
 if(!file)return;if(!window.XLSX){toast('เปิดไฟล์ไม่ได้','ไม่สามารถโหลดไลบรารีอ่าน Excel กรุณาตรวจอินเทอร์เน็ต','error');return}
 try{excelImportState.file=file;excelImportState.fileName=file.name;const buf=await file.arrayBuffer();const wb=XLSX.read(buf,{type:'array',cellDates:false,raw:false});let sheetName=currentRegistryModule==='STCPAP'?(wb.SheetNames.find(n=>String(n).trim().toUpperCase()==='CPAP')||wb.SheetNames[0]):currentRegistryModule==='STSLEEP'?(wb.SheetNames.find(n=>String(n).trim().toUpperCase()==='SLEEPTEST')||wb.SheetNames.find(n=>String(n).replace(/\s+/g,'').toUpperCase()==='SLEEPTEST')||wb.SheetNames[0]):(wb.SheetNames.includes('DATA')?'DATA':wb.SheetNames[0]);excelImportState.sheetName=sheetName;const ws=wb.Sheets[sheetName];const raw=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});const actual=(XLSX.utils.sheet_to_json(ws,{header:1,range:0,blankrows:false})[0]||[]).map(cleanText);const required=currentRegistryModule==='STCPAP'?EXCEL_HEADERS_CPAP:currentRegistryModule==='STSLEEP'?EXCEL_HEADERS_SLEEP:EXCEL_HEADERS_CANCER;const missing=required.filter(h=>!actual.includes(h));if(missing.length)throw new Error('หัวคอลัมน์ไม่ครบ: '+[...new Set(missing)].join(', '));const mapper=currentRegistryModule==='STCPAP'?mapCpapExcelRow:currentRegistryModule==='STSLEEP'?mapSleepExcelRow:mapCancerExcelRow;const rows=raw.map(mapper).filter(x=>Object.values(x).some(v=>cleanText(v)));if(!rows.length)throw new Error('ไม่พบข้อมูลในไฟล์');excelImportState.rows=rows;document.getElementById('importFileName').textContent=file.name;document.getElementById('importSheetName').textContent=`ชีต ${sheetName} · ${rows.length} รายการ`;showImportStep('preview');renderImportPreview(true);const dup=await apiRequest('checkImportDuplicates',{module:currentRegistryModule,rows:rows.map(stripImportMeta)});excelImportState.duplicates=dup.duplicates||{};rows.forEach(x=>{x._duplicate=excelImportState.duplicates[x._key]||null;x._action=x._duplicate?'skip':'new'});renderImportPreview(false)}catch(err){toast('อ่าน Excel ไม่สำเร็จ',err.message,'error',8000);resetExcelImport()}
}
function stripImportMeta(x){const o={};Object.keys(x).forEach(k=>{if(!k.startsWith('_'))o[k]=x[k]});o._key=x._key;return o}
function renderImportPreview(checking){const rows=excelImportState.rows,dup=rows.filter(x=>x._duplicate).length,invalid=rows.filter(x=>x._errors.length).length,ready=rows.length-invalid;document.getElementById('importSummary').innerHTML=`<div><span>ทั้งหมด</span><strong>${rows.length}</strong></div><div><span>พร้อมนำเข้า</span><strong>${ready}</strong></div><div><span>พบข้อมูลซ้ำ</span><strong>${checking?'…':dup}</strong></div><div><span>ข้อมูลไม่ครบ</span><strong>${invalid}</strong></div>`;document.getElementById('importPreviewBody').innerHTML=rows.map((x,i)=>{const status=x._errors.length?`<span class="import-badge invalid">${escapeHtml(x._errors.join(', '))}</span>`:checking?'<span class="import-badge checking">กำลังตรวจซ้ำ</span>':x._duplicate?`<span class="import-badge duplicate">ซ้ำกับ ${escapeHtml(x._duplicate.Case_ID)}</span>`:'<span class="import-badge new">รายการใหม่</span>';const action=x._errors.length?'<span class="meta">นำเข้าไม่ได้</span>':x._duplicate?`<select class="dup-action" data-import-index="${i}"><option value="skip" ${x._action==='skip'?'selected':''}>ข้ามรายการ</option><option value="update" ${x._action==='update'?'selected':''}>อัปเดตรายการเดิม</option><option value="new" ${x._action==='new'?'selected':''}>นำเข้าเป็นงานใหม่</option></select>`:'<span class="meta">นำเข้าเป็นงานใหม่</span>';return `<tr><td>${x._row}</td><td>${status}</td><td>${thDate(x.Service_Date)}</td><td><b>${escapeHtml(x.HN||'-')}</b><div class="subline">${escapeHtml(x.VN||'-')}</div></td><td>${escapeHtml(x.Patient_Name||'-')}</td><td>${escapeHtml((currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP')?(x.Claim_Control_No||'-'):(x.SSO_Case_No||'-'))}<div class="subline">${escapeHtml((currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP')?(x.Service_Type||'-'):(x.Protocol_Code||'-'))}</div></td><td>${action}</td></tr>`}).join('');document.querySelectorAll('[data-import-index]').forEach(el=>el.onchange=()=>{excelImportState.rows[Number(el.dataset.importIndex)]._action=el.value});document.getElementById('importConfirmBtn').disabled=checking||ready===0}
async function confirmExcelImport(){const valid=excelImportState.rows.filter(x=>!x._errors.length);if(!valid.length)return;const btn=document.getElementById('importConfirmBtn');btn.disabled=true;btn.textContent='กำลังนำเข้า...';try{const data=await apiRequest('importCases',{module:currentRegistryModule,sourceFileName:excelImportState.fileName,rows:valid.map(x=>({...stripImportMeta(x),duplicateAction:x._action||'new'}))});document.getElementById('importResultBox').innerHTML=`<div class="result-icon">✅</div><h3>นำเข้า Excel เรียบร้อย</h3><div class="result-grid"><div><span>สำเร็จ</span><strong>${data.imported||0}</strong></div><div><span>อัปเดต</span><strong>${data.updated||0}</strong></div><div><span>ข้าม</span><strong>${data.skipped||0}</strong></div><div><span>ผิดพลาด</span><strong>${data.failed||0}</strong></div></div><p>รหัสชุดนำเข้า: ${escapeHtml(data.batchId||'-')}</p>`;showImportStep('result');clearRegistryCache(currentRegistryModule);await loadRegistry()}catch(err){toast('นำเข้าไม่สำเร็จ',err.message,'error',8000)}finally{btn.disabled=false;btn.textContent='ยืนยันนำเข้า'}}
document.getElementById('importCancelBtn')?.addEventListener('click',closeExcelImport);document.getElementById('importDoneBtn')?.addEventListener('click',closeExcelImport);document.getElementById('importChangeFileBtn')?.addEventListener('click',resetExcelImport);document.getElementById('excelChooseBtn')?.addEventListener('click',()=>document.getElementById('excelImportFile').click());document.getElementById('excelImportFile')?.addEventListener('change',e=>handleExcelFile(e.target.files[0]));document.getElementById('importConfirmBtn')?.addEventListener('click',confirmExcelImport);const drop=document.getElementById('excelDropZone');if(drop){['dragenter','dragover'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.add('drag')}));['dragleave','drop'].forEach(n=>drop.addEventListener(n,e=>{e.preventDefault();drop.classList.remove('drag')}));drop.addEventListener('drop',e=>handleExcelFile(e.dataTransfer.files[0]))}


/* ======================================================
   Central Reply Import V3.4.0 (Revised from real .BIL)
   จับคู่ด้วย CID + วันที่บริการ และเชื่อม Period Key
====================================================== */
const replyImportState={file:null,zip:null,matches:[],unmatched:[],sourceFiles:[],meta:{},descriptions:{},knowledgeByCode:{},knowledgeKnown:0,knowledgeUnknown:0};
function openReplyImport(){resetReplyImport();const cpap=currentRegistryModule==='STCPAP';const sleep=currentRegistryModule==='STSLEEP';const m=document.getElementById('replyImportModal');const title=m?.querySelector('.modal-head strong');const meta=m?.querySelector('.modal-head .meta');if(title)title.textContent=cpap?'📨 นำเข้าผลตอบกลับ CPAP':sleep?'📨 นำเข้าผลตอบกลับ Sleep Test':'📨 นำเข้าผลตอบกลับ Cancer';if(meta)meta.textContent=(cpap||sleep)?'อ่าน ZIP/BIL ตอบกลับ จับคู่ด้วยงวดส่ง Session : Station และบันทึก Error Code':'อ่านไฟล์ SOCDBIL และเชื่อมตามงวดส่ง';m.classList.add('show');m.setAttribute('aria-hidden','false')}
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
    if(m&&isValidReplyErrorCode(m[1]))out[m[1].toUpperCase()]=m[2].trim();
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
    const codes=[...new Set((tail.match(/\b[A-Z]{1,4}\d{1,4}\b/gi)||[]).map(code=>code.toUpperCase()).filter(isValidReplyErrorCode))];
    rows.push({Result_Code:stat,Station:(fields[0]||'').replace(/^\w\s*/,'' ).trim()||fields[1]||meta.Station||'',Line_No:fields[1]||'',Hcode:fields[2]||'',Hmain:fields[3]||'',AuthCode:fields[4]||'',Service_Date:fields[5]||'',InvNo:fields[6]||'',CID:normalizeDigits(fields[7]||''),Benefit_Package:fields[8]||'',Amount:fields[9]||'',Claim_Amt:fields[10]||'',Error_Codes:codes.join(','),Source_Entry:sourceName,Period_Key:meta.Period_Key||'',Reply_No:meta.Reply_No||'',Reply_Date:meta.Reply_Date||''});
  }
  return rows;
}
function parseReplyPeriodKey(value){
  const text=String(value||'').trim();
  const m=text.match(/(?:^|\s)(\d{4})[_-](\d{1,3})(?:[_-]|$)/);
  return m?{session:String(m[1]),station:String(Number(m[2]))}:{session:'',station:''};
}
function normalizeMatchToken(value){return String(value??'').trim().replace(/^0+(?=\d)/,'')}
function replyModuleCompatible(row){
  const auth=String(row?.AuthCode||'').trim().toUpperCase();
  if(!auth)return true;
  if(currentRegistryModule==='SSOCAC')return auth==='SSOCAC';
  if(currentRegistryModule==='STCPAP'||currentRegistryModule==='STSLEEP')return auth==='STCPAP';
  return true;
}
function matchReplyRow(row){
  if(!replyModuleCompatible(row))return {item:null,score:0,label:'',reason:`ประเภทไฟล์ ${row.AuthCode||'-'} ไม่ตรงกับโมดูล ${currentRegistryModule}`};
  const cid=normalizeDigits(row.CID),dateKey=normalizeThaiDateKey(row.Service_Date);
  const period=parseReplyPeriodKey(row.Period_Key);
  const replySession=normalizeMatchToken(period.session);
  const replyStation=normalizeMatchToken(period.station||row.Station);
  const scored=registryState.items.map(item=>{
    const itemCid=normalizeDigits(item.CID);
    const itemSession=normalizeMatchToken(item.Session);
    const itemStation=normalizeMatchToken(item.Station);
    const itemDate=normalizeThaiDateKey(item.Service_Date);
    let score=0;const labels=[];
    if(cid&&itemCid===cid){score+=120;labels.push('CID')}
    if(replySession&&itemSession===replySession){score+=80;labels.push('Session')}
    if(replyStation&&itemStation===replyStation){score+=80;labels.push('Station')}
    if(replySession&&replyStation&&itemSession===replySession&&itemStation===replyStation){score+=180;labels.push('งวดส่ง')}
    if(dateKey&&itemDate===dateKey){score+=25;labels.push('วันที่บริการ')}
    return {item,score,label:[...new Set(labels)].join(' + ')};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(!scored.length)return {item:null,score:0,label:'',reason:`ไม่พบ CID ${cid||'-'} หรือ Session : Station ${replySession||'-'} : ${replyStation||'-'}`};
  const best=scored[0],second=scored[1];
  const strong=(cid&&normalizeDigits(best.item.CID)===cid)||(replySession&&replyStation&&normalizeMatchToken(best.item.Session)===replySession&&normalizeMatchToken(best.item.Station)===replyStation);
  if(!strong)return {item:null,score:best.score,label:best.label,reason:'พบข้อมูลบางส่วน แต่ยังยืนยันเคสไม่ได้'};
  if(second&&second.score===best.score)return {item:null,score:best.score,label:best.label,reason:'พบทะเบียนมากกว่า 1 รายการที่มีคะแนนเท่ากัน'};
  return best;
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
    allRows.forEach(row=>{const hit=matchReplyRow(row);if(!hit?.item){unmatched.push(`${row.CID || '-'} · ${row.Service_Date || '-'} · InvNo ${row.InvNo||'-'} · ${hit?.reason||'ไม่พบทะเบียนที่ตรงกัน'}`);return}matches.push({...row,Case_ID:hit.item.Case_ID,HN:hit.item.HN,VN:hit.item.VN,Patient_Name:hit.item.Patient_Name,Work_Order_No:hit.item.Work_Order_No||'',Match_Score:hit.score,Match_Label:hit.label,Reply_File_Name:file.name,selected:true})});
    replyImportState.file=file;replyImportState.zip=zip;replyImportState.matches=matches;replyImportState.sourceFiles=docs.map(x=>x.name);replyImportState.unmatched=unmatched;replyImportState.meta=mainMeta;await hydrateReplyImportKnowledge();renderReplyImport();
  }catch(err){toast('อ่านผลตอบกลับไม่สำเร็จ',err.message||String(err),'error',7000)}
}

async function hydrateReplyImportKnowledge(){
  const codes=[...new Set(replyImportState.matches.flatMap(x=>String(x.Error_Codes||'').split(',').map(v=>v.trim().toUpperCase()).filter(Boolean)))];
  replyImportState.knowledgeByCode={};replyImportState.knowledgeKnown=0;replyImportState.knowledgeUnknown=0;
  if(!codes.length)return;
  try{
    const data=await apiRequest('getByCodes',{module:currentRegistryModule,codes});
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
  try{const data=await apiRequest('importReplyResults',{items,replyFileName:replyImportState.file?.name||'',replyEntryNames:replyImportState.sourceFiles,periodKey:replyImportState.meta?.Period_Key||'',replyNo:replyImportState.meta?.Reply_No||'',replyDate:replyImportState.meta?.Reply_Date||'',updatedBy:authState.user?.Display_Name||''});closeReplyImport();toast('บันทึกผลตอบกลับสำเร็จ',`อัปเดต ${data.updated||0} รายการ · เชื่อม Attempt เดิม ${data.linked||0} · ผล A ${data.resultA||0} · ผล C ${data.resultC||0} · Knowledge ${replyImportState.knowledgeKnown} รหัส · รหัสใหม่ ${replyImportState.knowledgeUnknown}`,'success',7500);clearRegistryCache(currentRegistryModule);await loadRegistry()}catch(err){toast('บันทึกผลไม่สำเร็จ',err.message,'error',7000)}finally{btn.disabled=false;btn.textContent='ยืนยันบันทึกผล'}
}
document.getElementById('replyImportCancelBtn')?.addEventListener('click',closeReplyImport);document.getElementById('replyImportChooseBtn')?.addEventListener('click',()=>document.getElementById('replyImportFile')?.click());document.getElementById('replyImportFile')?.addEventListener('change',e=>handleReplyImportFile(e.target.files?.[0]));document.getElementById('replyImportChangeBtn')?.addEventListener('click',resetReplyImport);document.getElementById('replyImportSaveBtn')?.addEventListener('click',saveReplyImport);document.getElementById('replyImportKnowledgeBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const q=[...new Set(replyImportState.matches.flatMap(x=>String(x.Error_Codes||'').split(',').map(v=>v.trim()).filter(Boolean)))].join(' ');const url=`${location.origin}${location.pathname}?page=knowledge&module=${encodeURIComponent(currentRegistryModule)}&q=${encodeURIComponent(q)}`;const w=window.open(url,'_blank','noopener,noreferrer');if(!w)toast('เบราว์เซอร์บล็อกแท็บใหม่','กรุณาอนุญาต Pop-up สำหรับเว็บไซต์นี้','warning',6000);});


/* ======================================================
   Authentication & System Administration V3.8.0
====================================================== */
async function initializeAuthentication(){
  bindAuthEvents();
  if(authState.token){try{const data=await apiRequest('getSession');applyAuthentication(data.user);return;}catch(_e){clearAuthentication();}}
  showLogin();
}
function bindAuthEvents(){
  document.getElementById('loginBtn')?.addEventListener('click',performLogin);
  document.getElementById('loginPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')performLogin()});
  document.getElementById('logoutBtn')?.addEventListener('click',performLogout);
  document.getElementById('addUserBtn')?.addEventListener('click',()=>openUserModal());
  document.getElementById('userModalClose')?.addEventListener('click',closeUserModal);
  document.getElementById('userModalCancel')?.addEventListener('click',closeUserModal);
document.getElementById('userModulesAllBtn')?.addEventListener('click',()=>setUserModuleSelection('ALL'));
document.getElementById('userModulesClearBtn')?.addEventListener('click',()=>setUserModuleSelection('EDITOR,SSIP'));
  document.getElementById('userSaveBtn')?.addEventListener('click',saveSystemUser);
  document.getElementById('reloadConfigBtn')?.addEventListener('click',loadSystemConfig);
}
function showLogin(message=''){document.getElementById('loginOverlay')?.classList.add('show');document.getElementById('loginMessage').textContent=message;setTimeout(()=>document.getElementById('loginUsername')?.focus(),80)}
function clearAuthentication(){authState.token='';authState.user=null;localStorage.removeItem('ssopSessionToken');document.getElementById('authBar')?.classList.add('hidden')}
async function performLogin(){const username=document.getElementById('loginUsername').value.trim(),password=document.getElementById('loginPassword').value,btn=document.getElementById('loginBtn');btn.disabled=true;btn.textContent='กำลังเข้าสู่ระบบ...';try{const data=await apiRequest('login',{username,password});authState.token=data.sessionToken;localStorage.setItem('ssopSessionToken',authState.token);applyAuthentication(data.user);document.getElementById('loginPassword').value='';}catch(err){document.getElementById('loginMessage').textContent=err.message}finally{btn.disabled=false;btn.textContent='เข้าสู่ระบบ'}}
function applyRoleUi(){
 const viewer=isViewer();document.body.classList.toggle('role-viewer',viewer);
 // VIEWER ห้ามแก้ฐานทะเบียน แต่ใช้ SSOP Editor แบบ Local Processing ได้
 ['importExcelBtn','openZipReaderBtn','openReplyImportBtn','addCaseBtn','registryKnowledgeBtn'].forEach(id=>document.getElementById(id)?.classList.toggle('hidden',viewer));
 document.getElementById('openCancerEditorBtn')?.classList.remove('hidden');
 document.querySelectorAll('[data-module="knowledge"]').forEach(el=>el.classList.remove('hidden'));
 document.querySelectorAll('[data-module="admin"]').forEach(el=>el.classList.toggle('hidden',authState.user?.Role!=='ADMIN'));
 document.querySelectorAll('[data-module="editor"]').forEach(el=>el.classList.remove('hidden'));
}
function applyAuthentication(user){authState.user=user;document.getElementById('loginOverlay')?.classList.remove('show');document.getElementById('authBar')?.classList.remove('hidden');document.getElementById('authDisplayName').textContent=user.Display_Name;document.getElementById('authRole').textContent=user.Role;document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',user.Role!=='ADMIN'));applyRoleUi();refreshModuleCardsForUser();const page=new URLSearchParams(location.search).get('page');loadDocumentLinks();if(page==='knowledge'&&hasModuleAccess('knowledge')){showPage('knowledgePage');loadKnowledge('','ALL');}else if(page==='editor'){showPage('cancerPage');}else{goHome();}}
async function performLogout(){try{await apiRequest('logout')}catch(_e){}clearAuthentication();showLogin('ออกจากระบบแล้ว')}
async function loadAdminPage(){if(authState.user?.Role!=='ADMIN')return;await Promise.all([loadSystemUsers(),loadSystemConfig()]);}
let systemUsersCache=[];
async function loadSystemUsers(){const body=document.getElementById('systemUsersBody');body.innerHTML='<tr><td colspan="8">กำลังโหลด...</td></tr>';try{const data=await apiRequest('listUsers');systemUsersCache=data.items||[];body.innerHTML=systemUsersCache.map((u,i)=>`<tr><td><b>${escapeHtml(u.User_ID)}</b></td><td>${escapeHtml(u.Display_Name)}</td><td>${escapeHtml(u.Email||'-')}</td><td><span class="role-badge">${escapeHtml(u.Role)}</span></td><td>${escapeHtml(u.Department||'-')}</td><td>${u.Active?'<span class="db-badge ok">ใช้งาน</span>':'<span class="db-badge pending">ปิด</span>'}</td><td>${thDateTime(u.Last_Login_At)}</td><td><button class="soft" data-user-edit="${i}">แก้ไข</button></td></tr>`).join('')||'<tr><td colspan="8">ยังไม่มีผู้ใช้</td></tr>';body.querySelectorAll('[data-user-edit]').forEach(b=>b.onclick=()=>openUserModal(systemUsersCache[Number(b.dataset.userEdit)]));}catch(err){body.innerHTML=`<tr><td colspan="8">${escapeHtml(err.message)}</td></tr>`}}
function setUserModuleSelection(value){
 const raw=String(value||'').trim().toUpperCase();
 const all=raw==='ALL';
 const selected=new Set(raw.split(/[;,|\s]+/).map(v=>v.trim()).filter(Boolean));
 document.querySelectorAll('#userModules input[type=checkbox]').forEach(cb=>{
   if(cb.value==='EDITOR'||cb.value==='SSIP'){cb.checked=true;return;}
   cb.checked=all||selected.has(cb.value);
 });
}
function getUserModuleSelection(){
 const selected=[...document.querySelectorAll('#userModules input[type=checkbox]:checked')].map(cb=>cb.value).filter(v=>v!=='EDITOR'&&v!=='SSIP');
 const allCodes=['MAIN','CROSS','SSOCAC','STCPAP','STSLEEP','KNOWLEDGE'];
 if(allCodes.every(code=>selected.includes(code)))return 'ALL';
 return ['EDITOR','SSIP',...selected].join(',');
}
function refreshModuleCardsForUser(){
 document.querySelectorAll('.module-card[data-module]').forEach(card=>{
   const allowed=hasModuleAccess(card.dataset.module);
   card.classList.toggle('module-no-access',!allowed);
   card.setAttribute('aria-disabled',allowed?'false':'true');
   card.title=allowed?'':`ไม่มีสิทธิ์ใช้งาน ${moduleAccessLabel(card.dataset.module)}`;
 });
}
function openUserModal(u=null){document.getElementById('userModalTitle').textContent=u?'แก้ไขผู้ใช้':'เพิ่มผู้ใช้';document.getElementById('userId').value=u?.User_ID||'';document.getElementById('userId').readOnly=Boolean(u);document.getElementById('userDisplayName').value=u?.Display_Name||'';document.getElementById('userEmail').value=u?.Email||'';document.getElementById('userRole').value=u?.Role||'USER';document.getElementById('userDepartment').value=u?.Department||'';setUserModuleSelection(u?.Allowed_Modules||'ALL');document.getElementById('userPassword').value='';document.getElementById('userActive').checked=u?.Active!==false;document.getElementById('userModal').classList.add('show')}
function closeUserModal(){document.getElementById('userModal').classList.remove('show')}
async function saveSystemUser(){const item={User_ID:document.getElementById('userId').value.trim(),Display_Name:document.getElementById('userDisplayName').value.trim(),Email:document.getElementById('userEmail').value.trim(),Role:document.getElementById('userRole').value,Department:document.getElementById('userDepartment').value.trim(),Allowed_Modules:getUserModuleSelection(),Password:document.getElementById('userPassword').value,Active:document.getElementById('userActive').checked};try{await apiRequest('saveUser',{item});closeUserModal();toast('บันทึกสำเร็จ','ข้อมูลผู้ใช้ได้รับการอัปเดตแล้ว','success');loadSystemUsers()}catch(err){toast('บันทึกผู้ใช้ไม่สำเร็จ',err.message,'error',6500)}}
async function loadSystemConfig(){const grid=document.getElementById('systemConfigGrid');if(!grid)return;grid.innerHTML='<div>กำลังโหลด...</div>';try{const data=await apiRequest('listSystemConfig');grid.innerHTML=(data.items||[]).map((x,i)=>`<div class="config-item"><div><b>${escapeHtml(x.Config_Key||'')}</b><small>${escapeHtml(x.Description||'')}</small></div><input data-config-value="${i}" value="${escapeAttr(x.Config_Value||'')}"><button class="soft" data-config-save="${i}">บันทึก</button></div>`).join('')||'<div class="meta">ยังไม่มีค่ากำหนด</div>';grid.querySelectorAll('[data-config-save]').forEach(btn=>btn.onclick=async()=>{const i=Number(btn.dataset.configSave),x=data.items[i];x.Config_Value=grid.querySelector(`[data-config-value="${i}"]`).value;try{await apiRequest('saveSystemConfig',{item:x});toast('บันทึกแล้ว',x.Config_Key,'success')}catch(err){toast('บันทึกไม่สำเร็จ',err.message,'error')}})}catch(err){grid.innerHTML=`<div>${escapeHtml(err.message)}</div>`}}

// V4.1 Error Work Queue events
document.addEventListener('click',e=>{
 if(e.target.closest('#errorQueueClose,#errorQueueDone')){e.preventDefault();closeErrorQueue();return;}
 if(e.target.closest('#errorQueueFilterBtn')){e.preventDefault();if(registryState.activeErrorCode)filterRegistryByError(registryState.activeErrorCode);return;}
 if(e.target.closest('#errorQueueCsvBtn')){e.preventDefault();exportErrorQueueCsv();return;}
 const modal=e.target.closest('#errorQueueModal');if(modal&&e.target===modal)closeErrorQueue();
});


/* V4.5.2 Core scroll recovery: release body lock whenever no visible modal remains. */
function recoverPageScroll(){
 const anyVisible=[...document.querySelectorAll('.modal.show')].some(m=>getComputedStyle(m).display!=='none');
 if(!anyVisible){document.body.classList.remove('modal-open');document.documentElement.style.overflow='';document.body.style.overflow='';}
}
document.addEventListener('click',()=>setTimeout(recoverPageScroll,0));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setTimeout(recoverPageScroll,0)});
setInterval(recoverPageScroll,1500);

// V4.5.2 ZIP filter lifecycle
document.addEventListener('click',e=>{const p=document.getElementById('zipColumnFilterPopover');if(p&&!p.contains(e.target)&&!e.target.closest('[data-zip-filter-col]'))closeZipColumnFilter();});

// V4.5.0 Cross-module validation rules
// V4.4.5 SSIP navigation
document.getElementById('ssipBackHomeBtn')?.addEventListener('click',goHome);
