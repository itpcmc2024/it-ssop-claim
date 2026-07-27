(() => {
  'use strict';
  const cfg = window.SSOP_CONFIG || {};
  const patients = [
    {caseId:'CAC-20260727-0001',module:'SSOCAC',date:'27/07/2569',hn:'65001234',vn:'690001',cid:'1100000000001',name:'ผู้ป่วยทดสอบ 1',status:'C'},
    {caseId:'CAC-20260726-0012',module:'SSOCAC',date:'26/07/2569',hn:'64004567',vn:'690002',cid:'1100000000002',name:'ผู้ป่วยทดสอบ 2',status:'A'},
    {caseId:'CPA-20260725-0003',module:'CPAP',date:'25/07/2569',hn:'63007890',vn:'690003',cid:'1100000000003',name:'ผู้ป่วยทดสอบ 3',status:'PENDING'},
    {caseId:'SLP-20260724-0004',module:'SLEEP',date:'24/07/2569',hn:'62001122',vn:'690004',cid:'1100000000004',name:'ผู้ป่วยทดสอบ 4',status:'A'}
  ];

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    setUser();
    bindNavigation();
    bindActions();
    fillPlaceholders();
    renderPatients();
    showPage(location.hash.replace('#/','') || cfg.defaultPage || 'dashboard', false);
  }

  function setUser(){
    const u=cfg.user||{};
    text('topUserName',u.displayName||'ผู้ใช้งาน');
    text('topUserMeta',`${u.role||'USER'}${u.department?' • '+u.department:''}`);
    const avatar=document.querySelector('.avatar');
    if(avatar) avatar.textContent=(u.displayName||'U').trim().charAt(0).toUpperCase();
  }

  function bindNavigation(){
    document.querySelectorAll('[data-page]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.page)));
    document.querySelectorAll('[data-page-link]').forEach(btn=>btn.addEventListener('click',()=>showPage(btn.dataset.pageLink)));
    document.getElementById('menuToggle').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
    window.addEventListener('hashchange',()=>showPage(location.hash.replace('#/','')||'dashboard',false));
  }

  function bindActions(){
    document.addEventListener('click',e=>{
      const detail=e.target.closest('[data-detail]');
      if(detail) showCase(detail.dataset.detail);
      const action=e.target.closest('[data-action]');
      if(action) handleAction(action.dataset.action);
    });
    ['patientSearch','moduleFilter','statusFilter'].forEach(id=>document.getElementById(id).addEventListener('input',renderPatients));
    document.getElementById('modalClose').addEventListener('click',closeModal);
    document.getElementById('modalOk').addEventListener('click',closeModal);
    document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  }

  function showPage(name,updateHash=true){
    if(!document.getElementById('page-'+name)) name='dashboard';
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById('page-'+name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===name));
    document.getElementById('sidebar').classList.remove('open');
    if(updateHash) location.hash='#/'+name;
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function fillPlaceholders(){
    const pages={
      cpap:['CPAP','Module สำหรับทะเบียนอุปกรณ์และประวัติการส่งเบิก CPAP'],
      sleep:['Sleep Test','Module สำหรับข้อมูลการตรวจการนอนหลับ'],
      main:['Main','Module การส่งเบิกหลัก'],
      cross:['Cross Area','Module การส่งเบิกข้ามพื้นที่'],
      knowledge:['Knowledge Center','ฐานความรู้ CheckCode และแนวทางแก้ไข'],
      zip:['ZIP Editor','เครื่องมือแก้ไขไฟล์ ZIP ใน Browser โดยไม่จัดเก็บไฟล์']
    };
    Object.entries(pages).forEach(([id,[title,desc]])=>{
      document.getElementById('page-'+id).innerHTML=`<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div></div><section class="panel coming"><div class="coming-icon">✓</div><h2>เตรียมพื้นที่ไว้เรียบร้อยแล้ว</h2><p>เมนูนี้ยังเป็นหน้าตัวอย่าง และจะเชื่อมข้อมูลจริงในระยะถัดไปโดยไม่เปลี่ยนรูปแบบการใช้งานหลัก</p><button class="outline-btn" data-page-link="dashboard">กลับหน้าภาพรวม</button></section>`;
    });
  }

  function renderPatients(){
    const q=document.getElementById('patientSearch').value.trim().toLowerCase();
    const module=document.getElementById('moduleFilter').value;
    const status=document.getElementById('statusFilter').value;
    const filtered=patients.filter(p=>{
      const hay=[p.caseId,p.module,p.date,p.hn,p.vn,p.cid,p.name,p.status].join(' ').toLowerCase();
      return (!q||hay.includes(q))&&(!module||p.module===module)&&(!status||p.status===status);
    });
    document.getElementById('patientRows').innerHTML=filtered.map(p=>`<tr><td><b>${p.caseId}</b></td><td>${p.module}</td><td>${p.date}</td><td><b>${p.hn}</b><small>VN ${p.vn}</small></td><td>${p.name}</td><td><span class="badge ${statusClass(p.status)}">${statusText(p.status)}</span></td><td><button class="mini-btn" data-detail="${p.caseId}">ดูรายละเอียด</button></td></tr>`).join('');
    document.getElementById('emptyPatients').classList.toggle('hidden',filtered.length>0);
  }

  function showCase(caseId){
    const p=patients.find(x=>x.caseId===caseId)||patients[0];
    openModal(`รายละเอียด ${p.caseId}`,`<div class="detail-grid"><div><label>Module</label><b>${p.module}</b></div><div><label>วันที่บริการ</label><b>${p.date}</b></div><div><label>HN</label><b>${p.hn}</b></div><div><label>VN</label><b>${p.vn}</b></div><div><label>CID</label><b>${p.cid}</b></div><div><label>ชื่อผู้ป่วย</label><b>${p.name}</b></div></div><h3 class="timeline-title">ประวัติการส่งเบิก</h3><div class="timeline"><div class="timeline-item"><span class="dot c"></span><div><b>ครั้งที่ 1 • ผล C</b><small>Batch: 6812_12_20251216-081214</small><p>CheckCode: CE3, CD1</p></div></div><div class="timeline-item"><span class="dot a"></span><div><b>ครั้งที่ 2 • ผล A</b><small>Batch: 6813_12_20251217-093021</small><p>ผ่านการตรวจสอบ</p></div></div></div>`);
  }

  function handleAction(action){
    const messages={
      'mock-logout':'รุ่นนี้เป็นหน้าตัวอย่าง จึงยังไม่เปิดระบบ Login จริง',
      'mock-export':'สร้างปุ่มส่งออกไว้แล้ว จะเชื่อมข้อมูลจริงใน Phase ถัดไป',
      'mock-import':'หน้าต่าง Import Excel จะเพิ่มหลังยืนยันโครงสร้างหน้าจอ',
      'mock-new-case':'ฟอร์มเพิ่มเคส Cancer จะเพิ่มในขั้นตอนถัดไป',
      'mock-add-user':'หน้าจัดการผู้ใช้จะเชื่อมกับ System_Users หลังเปิด Login จริง',
      'mock-edit-user':'ขณะนี้เป็นข้อมูลตัวอย่าง ยังไม่มีการบันทึกลง Google Sheet'
    };
    showToast(messages[action]||'ฟังก์ชันนี้จะเชื่อมข้อมูลจริงในขั้นตอนถัดไป');
  }

  function openModal(title,html){text('modalTitle',title);document.getElementById('modalBody').innerHTML=html;document.getElementById('modal').classList.remove('hidden');}
  function closeModal(){document.getElementById('modal').classList.add('hidden');}
  function showToast(message){const t=document.getElementById('toast');t.textContent=message;t.classList.remove('hidden');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.add('hidden'),3500);}
  function statusClass(s){return s==='A'?'a':s==='C'?'c':'p';}
  function statusText(s){return s==='A'?'ผ่าน A':s==='C'?'ติด C':'รอดำเนินการ';}
  function text(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
})();
