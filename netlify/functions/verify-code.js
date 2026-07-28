/* يتحقق من صلاحية كود VIP بقراءة content/codes.json من نفس الموقع المنشور */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { code } = JSON.parse(event.body || '{}');
    if (!code) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false, error: 'لم يتم إرسال كود' })
      };
    }

    const host = event.headers.host;
    const proto = event.headers['x-forwarded-proto'] || 'https';
    const res = await fetch(`${proto}://${host}/content/codes.json`);
    if (!res.ok) throw new Error('تعذر تحميل قائمة الأكواد');
    const data = await res.json();
    const codes = data.codes || [];

    const found = codes.find(c => (c.code || '').toLowerCase() === code.toLowerCase());
    const valid = !!found && found.active !== false && (!found.expires || new Date(found.expires) >= new Date());

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'خطأ في التحقق' })
    };
  }
};
