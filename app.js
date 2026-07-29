/* منطق أداة تحويل النص إلى صوت في الصفحة الرئيسية */

const FREE_CHAR_LIMIT = 300;
const VIP_CHAR_LIMIT = 3000;

let selectedVoice = null;
let vipCode = null;
let vipValid = false;
let activeLang = 'ar';

const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const langSelect = document.getElementById('langSelect');
const voiceGrid = document.getElementById('voiceGrid');
const vipCodeInput = document.getElementById('vipCodeInput');
const applyCodeBtn = document.getElementById('applyCodeBtn');
const vipStatus = document.getElementById('vipStatus');
const pitchRange = document.getElementById('pitchRange');
const pitchBadge = document.getElementById('pitchBadge');
const rateRange = document.getElementById('rateRange');
const rateBadge = document.getElementById('rateBadge');
const generateBtn = document.getElementById('generateBtn');
const progressWrap = document.getElementById('progressWrap');
const errorBox = document.getElementById('errorBox');
const resultBox = document.getElementById('resultBox');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const regenerateBtn = document.getElementById('regenerateBtn');

function currentLimit(){
  return vipValid ? VIP_CHAR_LIMIT : FREE_CHAR_LIMIT;
}

function renderLangTabs(){
  const langs = [...new Map(VOICES.map(v => [v.lang, v.langLabel])).entries()];
  langSelect.innerHTML = langs.map(([lang, label]) => `
    <option value="${lang}" ${lang === activeLang ? 'selected' : ''}>${label}</option>
  `).join('');
}
renderLangTabs();

langSelect.addEventListener('change', () => {
  activeLang = langSelect.value;
  renderVoices();
});

function renderVoices(){
  const filtered = VOICES.filter(v => v.lang === activeLang);
  voiceGrid.innerHTML = filtered.map((v) => {
    const i = VOICES.indexOf(v);
    return `
    <div class="voice-card ${v.free ? '' : 'locked'} ${selectedVoice && selectedVoice.id === v.id ? 'selected' : ''}" data-index="${i}">
      ${!v.free ? '<span class="vc-lock">VIP</span>' : ''}
      <div class="vc-name">${v.dialect}</div>
      <div class="vc-dialect">${v.gender}</div>
    </div>
  `;
  }).join('');
  if(!selectedVoice || selectedVoice.lang !== activeLang){
    selectedVoice = filtered[0];
    document.querySelector('.voice-card')?.classList.add('selected');
  }
}
renderVoices();

voiceGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.voice-card');
  if(!card) return;
  const idx = Number(card.dataset.index);
  const voice = VOICES[idx];
  if(!voice.free && !vipValid){
    showError('هذا الصوت متاح لمشتركي VIP فقط. فعّل كودك أو اشترك من صفحة VIP.');
    return;
  }
  document.querySelectorAll('.voice-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedVoice = voice;
  hideError();
});

function updateCharCount(){
  const len = textInput.value.length;
  const limit = currentLimit();
  charCount.textContent = `${len} / ${limit} حرف ${vipValid ? '(VIP)' : '(النسخة المجانية)'}`;
  charCount.classList.toggle('over', len > limit);
  generateBtn.disabled = len === 0 || len > limit;
}
textInput.addEventListener('input', updateCharCount);
updateCharCount();

function pitchLabel(val){
  if(val < -20) return 'خشن جداً';
  if(val < 0) return 'خشن قليلاً';
  if(val === 0) return 'طبيعي';
  if(val <= 20) return 'رقيق قليلاً';
  return 'رقيق جداً';
}
pitchRange.addEventListener('input', () => {
  pitchBadge.textContent = pitchLabel(Number(pitchRange.value));
});

function rateLabel(val){
  if(val < -20) return 'بطيء جداً';
  if(val < 0) return 'أبطأ قليلاً';
  if(val === 0) return 'عادية';
  if(val <= 20) return 'أسرع قليلاً';
  return 'سريع جداً';
}
rateRange.addEventListener('input', () => {
  rateBadge.textContent = rateLabel(Number(rateRange.value));
});

applyCodeBtn.addEventListener('click', async () => {
  const code = vipCodeInput.value.trim();
  if(!code){ vipStatus.textContent = 'اكتب الكود أولاً'; vipStatus.className = 'vip-status err'; return; }
  applyCodeBtn.disabled = true;
  vipStatus.textContent = 'جاري التحقق...';
  vipStatus.className = 'vip-status';
  try{
    const res = await fetch('/.netlify/functions/verify-code', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if(data.valid){
      vipValid = true;
      vipCode = code;
      vipStatus.textContent = '✓ الكود فعّال! كل الأصوات والنصوص الأطول متاحة الآن.';
      vipStatus.className = 'vip-status ok';
      renderVoices();
      updateCharCount();
    }else{
      vipStatus.textContent = 'الكود غير صحيح أو منتهي الصلاحية.';
      vipStatus.className = 'vip-status err';
    }
  }catch(err){
    console.error(err);
    vipStatus.textContent = 'تعذر التحقق من الكود، حاول مرة أخرى.';
    vipStatus.className = 'vip-status err';
  }
  applyCodeBtn.disabled = false;
});

function showError(msg){
  errorBox.textContent = msg;
  errorBox.classList.add('active');
}
function hideError(){
  errorBox.classList.remove('active');
}

async function generateSpeech(){
  hideError();
  resultBox.classList.remove('active');
  const text = textInput.value.trim();
  if(!text){ showError('اكتب نصاً أولاً.'); return; }
  if(text.length > currentLimit()){ showError('النص أطول من الحد المسموح.'); return; }
  if(!selectedVoice){ showError('اختر صوتاً أولاً.'); return; }

  progressWrap.classList.add('active');
  generateBtn.disabled = true;

  try{
    const res = await fetch('/.netlify/functions/tts', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        text,
        voice: selectedVoice.id,
        code: vipCode,
        pitch: Number(pitchRange.value),
        rate: Number(rateRange.value)
      })
    });

    if(!res.ok){
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'تعذر توليد الصوت، حاول مرة أخرى.');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    audioPlayer.src = url;
    downloadBtn.href = url;
    downloadBtn.download = `i3z-voice-${Date.now()}.webm`;
    resultBox.classList.add('active');
  }catch(err){
    console.error(err);
    showError(err.message || 'حدث خطأ أثناء توليد الصوت.');
  }

  progressWrap.classList.remove('active');
  generateBtn.disabled = false;
}

generateBtn.addEventListener('click', generateSpeech);
regenerateBtn.addEventListener('click', generateSpeech);
