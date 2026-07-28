/* ============================================================
   لوحة تحكم i3z voice — تتصل مباشرة بـ GitHub عبر Git Gateway
   ============================================================ */

// ⚠️ عدّل هذين السطرين ليطابقا حسابك ومستودعك على GitHub
const GH_OWNER = 'CHANGE-ME';
const GH_REPO  = 'i3z-voice';
const GH_BRANCH = 'main';

const API_BASE = `/.netlify/git/github/repos/${GH_OWNER}/${GH_REPO}`;

let settingsState = null, settingsSha = null;
let codesState = null, codesSha = null;

function b64EncodeUnicode(str){ return btoa(unescape(encodeURIComponent(str))); }
function b64DecodeUnicode(str){ return decodeURIComponent(escape(atob(str.replace(/\n/g, '')))); }

async function getToken(){
  const user = window.netlifyIdentity.currentUser();
  if(!user) throw new Error('غير مسجل الدخول');
  return await user.jwt();
}

async function ghGetFile(path){
  const token = await getToken();
  const res = await fetch(`${API_BASE}/contents/${path}?ref=${GH_BRANCH}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if(!res.ok) throw new Error('تعذر تحميل ' + path + ' (' + res.status + ')');
  const data = await res.json();
  return { json: JSON.parse(b64DecodeUnicode(data.content)), sha: data.sha };
}

async function ghPutJSON(path, obj, sha, message){
  const token = await getToken();
  const body = { message, content: b64EncodeUnicode(JSON.stringify(obj, null, 2)), branch: GH_BRANCH };
  if(sha) body.sha = sha;
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if(!res.ok){
    const t = await res.text();
    throw new Error('فشل الحفظ (' + res.status + '): ' + t.slice(0,200));
  }
  return await res.json();
}

function setStatus(msg, type){
  const el = document.getElementById('save-status');
  el.textContent = msg;
  el.className = 'save-status ' + (type || '');
  if(type === 'ok'){ setTimeout(() => { el.textContent=''; el.className='save-status'; }, 3000); }
}

function uid(){ return Math.random().toString(36).slice(2,8).toUpperCase(); }

function generateCode(){
  const part = () => Math.random().toString(36).slice(2,6).toUpperCase();
  return `I3Z-${part()}-${part()}`;
}

/* ================= تحميل البيانات ================= */

async function loadAllData(){
  document.getElementById('loading').classList.remove('hidden');
  try{
    const [s, c] = await Promise.all([
      ghGetFile('content/settings.json'),
      ghGetFile('content/codes.json')
    ]);
    settingsState = s.json; settingsSha = s.sha;
    codesState = c.json; codesSha = c.sha;
    renderStats();
    renderRecentCodes();
    renderCodesEditor();
    renderSettingsForm();
  }catch(err){
    console.error(err);
    setStatus('تعذر تحميل البيانات: ' + err.message, 'err');
  }finally{
    document.getElementById('loading').classList.add('hidden');
  }
}

/* ================= نظرة عامة ================= */

function isCodeActive(c){
  return c.active !== false && (!c.expires || new Date(c.expires) >= new Date());
}

function renderStats(){
  const codes = codesState.codes || [];
  const activeCount = codes.filter(isCodeActive).length;
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card"><b>${codes.length}</b><span>إجمالي الأكواد</span></div>
    <div class="stat-card"><b>${activeCount}</b><span>أكواد فعّالة</span></div>
    <div class="stat-card"><b>${codes.length - activeCount}</b><span>أكواد موقوفة/منتهية</span></div>
  `;
}

function renderRecentCodes(){
  const codes = [...(codesState.codes || [])].slice(-5).reverse();
  const list = document.getElementById('recent-codes-list');
  if(codes.length === 0){
    list.innerHTML = `<p style="color:var(--d-muted); font-size:.85rem;">لا توجد أكواد بعد.</p>`;
    return;
  }
  list.innerHTML = codes.map(c => `
    <div class="recent-item">
      <div>
        <div class="ri-title">${c.code}</div>
        <div class="ri-meta">${c.label || 'بدون وصف'}</div>
      </div>
      <span class="${isCodeActive(c) ? 'badge-active' : 'badge-inactive'}">${isCodeActive(c) ? 'فعّال' : 'موقوف'}</span>
    </div>
  `).join('');
}

/* ================= إعدادات الموقع ================= */

const SETTINGS_FIELDS = [
  { key:'site_title', label:'اسم الموقع', type:'text' },
  { key:'site_tagline', label:'الوصف القصير للموقع', type:'text' },
  { key:'free_char_limit', label:'الحد الأقصى للنص (النسخة المجانية)', type:'number' },
  { key:'vip_char_limit', label:'الحد الأقصى للنص (VIP)', type:'number' },
];

function renderSettingsForm(){
  document.getElementById('settings-form').innerHTML = SETTINGS_FIELDS.map(f => `
    <div class="field">
      <label>${f.label}</label>
      <input type="${f.type}" data-settings-key="${f.key}" value="${(settingsState[f.key] ?? '').toString().replace(/"/g,'&quot;')}">
    </div>
  `).join('');
}

async function saveSettings(){
  SETTINGS_FIELDS.forEach(f => {
    const el = document.querySelector(`[data-settings-key="${f.key}"]`);
    if(el) settingsState[f.key] = f.type === 'number' ? Number(el.value) : el.value;
  });
  setStatus('جاري الحفظ...', 'busy');
  try{
    const result = await ghPutJSON('content/settings.json', settingsState, settingsSha, 'تحديث إعدادات الموقع من لوحة التحكم');
    settingsSha = result.content.sha;
    setStatus('تم الحفظ بنجاح ✓', 'ok');
  }catch(err){
    console.error(err);
    setStatus('فشل الحفظ: ' + err.message, 'err');
  }
}

/* ================= أكواد VIP ================= */

function renderCodesEditor(){
  const codes = codesState.codes || [];
  const container = document.getElementById('codes-editor-list');
  if(codes.length === 0){
    container.innerHTML = `<p style="color:var(--d-muted); font-size:.85rem;">لا توجد أكواد بعد. اضغط "+ كود جديد" للبدء.</p>`;
    return;
  }
  container.innerHTML = codes.map((c, i) => `
    <div class="code-card" data-index="${i}">
      <div class="form-grid">
        <div class="field full">
          <label>الكود</label>
          <input type="text" data-c="${i}" data-k="code" value="${(c.code||'').replace(/"/g,'&quot;')}" style="font-family:monospace; direction:ltr; text-align:right;">
        </div>
        <div class="field">
          <label>الوصف</label>
          <input type="text" data-c="${i}" data-k="label" value="${(c.label||'').replace(/"/g,'&quot;')}">
        </div>
        <div class="field">
          <label>تاريخ الانتهاء (اختياري)</label>
          <input type="date" data-c="${i}" data-k="expires" value="${(c.expires||'').slice(0,10)}">
        </div>
      </div>
      <div class="code-card-actions">
        <label class="toggle-row">
          <input type="checkbox" data-c="${i}" data-k="active" ${c.active !== false ? 'checked' : ''}>
          فعّال
        </label>
        <button class="btn-outline-sm" data-delete-code="${i}">🗑️ حذف</button>
      </div>
    </div>
  `).join('');
}

function addNewCode(){
  codesState.codes = codesState.codes || [];
  codesState.codes.push({
    code: generateCode(),
    label: 'اشتراك جديد',
    active: true,
    expires: ''
  });
  renderCodesEditor();
  switchSection('codes');
}

function collectCodesFromForm(){
  document.querySelectorAll('.code-card').forEach(card => {
    const i = Number(card.dataset.index);
    card.querySelectorAll('[data-c]').forEach(el => {
      const key = el.dataset.k;
      if(key === 'active'){
        codesState.codes[i][key] = el.checked;
      }else{
        codesState.codes[i][key] = el.value;
      }
    });
  });
}

async function saveCodes(){
  collectCodesFromForm();
  setStatus('جاري الحفظ...', 'busy');
  try{
    const result = await ghPutJSON('content/codes.json', codesState, codesSha, 'تحديث أكواد VIP من لوحة التحكم');
    codesSha = result.content.sha;
    setStatus('تم حفظ الأكواد بنجاح ✓', 'ok');
    renderStats();
    renderRecentCodes();
  }catch(err){
    console.error(err);
    setStatus('فشل الحفظ: ' + err.message, 'err');
  }
}

async function deleteCode(index){
  if(!confirm('متأكد إنك تبي تحذف هذا الكود نهائياً؟')) return;
  collectCodesFromForm();
  codesState.codes.splice(index, 1);
  await saveCodes();
  renderCodesEditor();
}

/* ================= التنقل ================= */

function switchSection(target){
  document.querySelectorAll('.dash-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('section-' + target)?.classList.remove('hidden');
  document.querySelectorAll('.dash-nav-link').forEach(l => l.classList.toggle('active', l.dataset.target === target));
  const titles = {
    overview:['نظرة عامة','مرحباً بك من جديد'],
    codes:['أكواد VIP','أضف، عدّل، أو ألغِ أي كود اشتراك'],
    settings:['إعدادات الموقع','تحكم في حدود النص واسم الموقع'],
  };
  const t = titles[target] || ['',''];
  document.getElementById('topbar-title').textContent = t[0];
  document.getElementById('topbar-sub').textContent = t[1];
}

/* ================= ربط الأحداث ================= */

function wireEvents(){
  document.querySelectorAll('.dash-nav-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); switchSection(link.dataset.target); });
  });
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.nav));
  });

  document.getElementById('add-code-btn').addEventListener('click', addNewCode);
  document.getElementById('save-codes-btn').addEventListener('click', saveCodes);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('logout-btn').addEventListener('click', () => window.netlifyIdentity.logout());

  document.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-delete-code]');
    if(delBtn){ deleteCode(Number(delBtn.dataset.deleteCode)); }
  });
}

/* ================= المصادقة ================= */

function showApp(){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  loadAllData();
}
function showGate(){
  document.getElementById('gate').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  const identity = window.netlifyIdentity;
  if(!identity){
    setStatus('تعذر تحميل نظام الدخول', 'err');
    return;
  }
  identity.on('init', user => { if(user) showApp(); else showGate(); });
  identity.on('login', user => { identity.close(); showApp(); });
  identity.on('logout', () => showGate());
  document.getElementById('gate-login-btn').addEventListener('click', () => identity.open('login'));
  identity.init();
});
