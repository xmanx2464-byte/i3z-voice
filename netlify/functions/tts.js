/* يحوّل النص إلى صوت فعلياً باستخدام مكتبة msedge-tts (تعتمد على خدمة
   Microsoft Edge Read Aloud نفسها اللي استخدمها بوت "الأصوات" على تيليجرام،
   لكن هنا تشتغل من طرف الخادم عبر Netlify Function). */

const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const { VOICES } = require('../../voices.js');

const FREE_CHAR_LIMIT = 300;
const VIP_CHAR_LIMIT = 3000;

async function isValidCode(code, host, proto) {
  if (!code) return false;
  try {
    const res = await fetch(`${proto}://${host}/content/codes.json`);
    if (!res.ok) return false;
    const data = await res.json();
    const codes = data.codes || [];
    const found = codes.find(c => (c.code || '').toLowerCase() === code.toLowerCase());
    return !!found && found.active !== false && (!found.expires || new Date(found.expires) >= new Date());
  } catch (err) {
    console.error('isValidCode error:', err);
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { text, voice, code, pitch, rate } = JSON.parse(event.body || '{}');

    if (!text || !text.trim()) {
      return { statusCode: 400, headers: {'Content-Type':'application/json'}, body: JSON.stringify({ error: 'الرجاء إدخال نص' }) };
    }
    if (!voice) {
      return { statusCode: 400, headers: {'Content-Type':'application/json'}, body: JSON.stringify({ error: 'الرجاء اختيار صوت' }) };
    }

    const host = event.headers.host;
    const proto = event.headers['x-forwarded-proto'] || 'https';
    const vip = await isValidCode(code, host, proto);
    const limit = vip ? VIP_CHAR_LIMIT : FREE_CHAR_LIMIT;

    if (text.length > limit) {
      return {
        statusCode: 400,
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ error: `النص أطول من الحد المسموح (${limit} حرف).` })
      };
    }

    const voiceInfo = VOICES.find(v => v.id === voice);
    if (!voiceInfo) {
      return { statusCode: 400, headers: {'Content-Type':'application/json'}, body: JSON.stringify({ error: 'صوت غير معروف' }) };
    }
    if (!voiceInfo.free && !vip) {
      return { statusCode: 403, headers: {'Content-Type':'application/json'}, body: JSON.stringify({ error: 'هذا الصوت متاح لمشتركي VIP فقط. فعّل كودك من صفحة VIP.' }) };
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);

    const pitchNum = Number.isFinite(pitch) ? Math.max(-50, Math.min(50, pitch)) : 0;
    const pitchStr = `${pitchNum >= 0 ? '+' : ''}${pitchNum}Hz`;

    const rateNum = Number.isFinite(rate) ? Math.max(-50, Math.min(50, rate)) : 0;
    const rateStr = `${rateNum >= 0 ? '+' : ''}${rateNum}%`;

    const { audioStream } = await tts.toStream(text, { pitch: pitchStr, rate: rateStr });

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/webm',
        'Content-Disposition': 'attachment; filename="i3z-voice.webm"'
      },
      body: audioBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error('TTS function error:', err);
    return {
      statusCode: 500,
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ error: 'تعذر توليد الصوت، حاول مرة أخرى لاحقاً.' })
    };
  }
};
