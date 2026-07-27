(() => {
  'use strict';

  const cfg = window.SSOP_CONFIG || {};
  let activeNonce = '';
  let requestTimer = null;

  document.addEventListener('DOMContentLoaded', init);
  window.addEventListener('message', receiveApiResponse);

  function init() {
    if (!cfg.apiUrl || cfg.apiUrl.includes('PUT_YOUR_')) {
      return showError('ยังไม่ได้ตั้งค่า apiUrl ใน assets/js/config.js');
    }
    if (!cfg.googleClientId || cfg.googleClientId.includes('PUT_YOUR_')) {
      return showError('ยังไม่ได้ตั้งค่า Google Client ID ใน assets/js/config.js');
    }

    waitForGoogleIdentity(0);
  }

  function waitForGoogleIdentity(attempt) {
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: cfg.googleClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false
      });
      google.accounts.id.renderButton(document.getElementById('googleButton'), {
        theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 280, locale: 'th'
      });
      showLogin();
      return;
    }

    if (attempt >= 50) return showError('โหลด Google Sign-In ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรชหน้า');
    setTimeout(() => waitForGoogleIdentity(attempt + 1), 200);
  }

  function handleCredentialResponse(response) {
    if (!response || !response.credential) return showError('Google ไม่ได้ส่งข้อมูลเข้าสู่ระบบกลับมา');
    showLoading('กำลังตรวจสอบสิทธิ์ผู้ใช้งาน');

    activeNonce = createNonce();
    document.getElementById('apiAction').value = 'bootstrap';
    document.getElementById('apiCredential').value = response.credential;
    document.getElementById('apiNonce').value = activeNonce;
    document.getElementById('apiForm').action = cfg.apiUrl;
    document.getElementById('apiForm').submit();

    clearTimeout(requestTimer);
    requestTimer = setTimeout(() => {
      showError('เซิร์ฟเวอร์ตอบกลับช้าเกินไป กรุณาตรวจ Web App URL และ Deployment แล้วลองใหม่');
    }, 30000);
  }

  function receiveApiResponse(event) {
    const data = event.data;
    if (!data || typeof data !== 'object' || !data.nonce || data.nonce !== activeNonce) return;

    clearTimeout(requestTimer);
    activeNonce = '';
    if (!data.ok) return showError(data.message || 'ไม่สามารถเข้าใช้งานระบบได้');
    renderApp(data);
  }

  function renderApp(data) {
    hideAll();
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('userBox').classList.add('show');
    document.getElementById('userName').textContent = data.user.displayName;
    document.getElementById('userMeta').textContent = `${data.user.email} • ${data.user.role}${data.user.department ? ' • ' + data.user.department : ''}`;

    const d = data.dashboard || {};
    setText('total', format(d.total));
    setText('pending', format(d.pending));
    setText('countC', format(d.c));
    setText('countA', format(d.a));

    const modules = d.modules || {};
    const names = { SSOCAC: 'Cancer Care', STCPAP: 'CPAP', STSLEEP: 'Sleep Test', MAIN: 'Main', CROSS: 'Cross Area' };
    const keys = Object.keys(modules);
    document.getElementById('moduleGrid').innerHTML = keys.length
      ? keys.map(k => `<div class="module"><b>${escapeHtml(names[k] || k)}</b><span>${format(modules[k])}</span></div>`).join('')
      : '<div class="module"><b>SSOCAC</b><span>0</span></div>';
  }

  function signOut() {
    if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect();
    document.getElementById('userBox').classList.remove('show');
    showLogin();
  }

  function showLogin() {
    hideAll();
    document.getElementById('loginBox').classList.remove('hidden');
  }
  function showLoading(message) {
    hideAll();
    document.getElementById('loadingText').textContent = message || 'กำลังดำเนินการ';
    document.getElementById('loading').classList.remove('hidden');
  }
  function showError(message) {
    hideAll();
    document.getElementById('errorText').textContent = message;
    document.getElementById('errorBox').classList.remove('hidden');
  }
  function hideAll() {
    ['loginBox', 'loading', 'errorBox', 'dashboard'].forEach(id => document.getElementById(id).classList.add('hidden'));
  }
  function createNonce() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now() + '-' + Math.random().toString(36).slice(2);
  }
  function setText(id, value) { document.getElementById(id).textContent = value; }
  function format(value) { return Number(value || 0).toLocaleString('th-TH'); }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }

  window.ssopSignOut = signOut;
  window.ssopRetry = showLogin;
})();
