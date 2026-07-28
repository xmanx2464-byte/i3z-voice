# i3z voice — دليل النشر

موقع تحويل نص إلى صوت بلهجات عربية، مع نظام اشتراك VIP بالأكواد، ولوحة
تحكم مخصصة تدير كل شي مباشرة.

**التكلفة: $0** — لكن هذا المشروع يحتاج خطوة إضافية عن مشاريعك السابقة:
تفعيل "Netlify Functions" (لا يزال ضمن الخطة المجانية، فقط يحتاج إعداد).

---

## لماذا يختلف هذا المشروع عن Zenfile والمدونة؟

التحويل الفعلي للصوت يحتاج معالجة من طرف خادم (Server-side) — المتصفح
وحده ما يقدر يسوي هذا بجودة عالية ولهجات متعددة. لذلك أضفنا "Netlify
Function" (خدمة صغيرة تشتغل بالخلفية) تستخدم نفس تقنية Edge-TTS اللي
جربتها ببوت "الأصوات" على تيليجرام.

**نقطة أمانة مهمة:** هذي أول مرة نستخدم هذه التقنية بهذا الشكل (كخدمة
ويب بدل بوت بايثون)، فمن المتوقع نحتاج نختبرها ونصلح أي تفصيل بسيط بعد
أول نشر — هذا طبيعي ومتوقع بمشروع فيه جزء تقني جديد.

---

## خطوات النشر

### 1. أنشئ مستودع GitHub جديد
باسم `i3z-voice` (بنفس حسابك الحالي).

### 2. ارفع الملفات
- **ملفات الجذر** (`index.html`, `vip.html`, `about.html`, `privacy-policy.html`,
  `terms.html`, `styles.css`, `main.js`, `app.js`, `voices.js`, `dashboard.html`,
  `dashboard.css`, `dashboard.js`, `package.json`, `netlify.toml`, `README.md`):
  ترفع مباشرة عبر "Add file → Upload files" وأنت بالصفحة الرئيسية للمستودع.
- **مجلد `content/`**: يحتوي `settings.json` و `codes.json`. أنشئ أول ملف
  عبر "Create new file" بكتابة المسار كامل `content/settings.json`، ثم
  كرر لـ `content/codes.json`.
- **مجلد `netlify/functions/`**: يحتوي `tts.js` و `verify-code.js`. نفس
  الطريقة: "Create new file" واكتب المسار كامل `netlify/functions/tts.js`
  (ينشئ المجلدين المتداخلين تلقائياً)، وكرر لـ `verify-code.js`.

### 3. عدّل `dashboard.js` قبل الرفع
افتح الملف وغيّر:
```js
const GH_OWNER = 'CHANGE-ME';   // اسم حسابك على GitHub
const GH_REPO  = 'i3z-voice';
```

### 4. انشر على Netlify
1. اذهب لحساب Netlify (يفضّل نفس حساب Zenfile إذا لسا فيه حصة، أو حساب جديد)
2. **Add new site → Import an existing project → GitHub → اختر i3z-voice**
3. اضغط **Deploy** — Netlify بيقرأ `netlify.toml` تلقائياً وينفذ `npm install`
   لتثبيت مكتبة `msedge-tts`، ثم يجهّز الـ Functions
4. انتظر 2-3 دقائق (أطول شوي من المرات السابقة بسبب تثبيت المكتبة)

### 5. فعّل Identity + Git Gateway (بنفس خطوات المدونة بالضبط)
1. Site configuration → Identity → Enable Identity
2. Registration preferences → Invite only
3. Services → Git Gateway → Enable
4. Invite users → ادعُ بريدك → فعّل حسابك من الإيميل

### 6. اختبر الأداة
1. افتح موقعك → جرب تكتب نص قصير وتضغط "حوّل إلى صوت"
2. إذا ظهر خطأ، افتح **Netlify → Functions → tts → سجل الأحداث (Logs)**
   لمعرفة تفاصيل الخطأ بالضبط — ابعثه لي وأساعدك أحله

### 7. أضف أكواد VIP
من `دومينك/dashboard.html` بعد تسجيل الدخول → قسم "أكواد VIP" → "+ كود جديد"

---

## هيكل الملفات

```
├── index.html                 الصفحة الرئيسية + أداة التحويل
├── vip.html                    صفحة الاشتراك وتفعيل الأكواد
├── about.html / privacy-policy.html / terms.html
├── styles.css                  التصميم العام
├── main.js                     قائمة الجوال
├── app.js                      منطق أداة التحويل
├── voices.js                   قائمة الأصوات (مشتركة بين الموقع والخادم)
├── dashboard.html / .css / .js لوحة التحكم
├── package.json                مكتبة msedge-tts
├── netlify.toml                إعدادات النشر والـ Functions
├── content/
│   ├── settings.json            إعدادات الموقع
│   └── codes.json                أكواد VIP
└── netlify/functions/
    ├── tts.js                    توليد الصوت الفعلي
    └── verify-code.js            التحقق من كود VIP
```
