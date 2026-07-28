/* قائمة الأصوات المدعومة — تطابق أصوات Edge TTS.
   الأصوات المجانية متاحة للجميع، والباقي يحتاج كود VIP فعّال. */
const VOICES = [
  { id:'ar-SA-HamedNeural',   lang:'ar', langLabel:'العربية', dialect:'السعودية', gender:'رجل', free:true },
  { id:'ar-SA-ZariyahNeural', lang:'ar', langLabel:'العربية', dialect:'السعودية', gender:'امرأة', free:true },
  { id:'ar-EG-ShakirNeural',  lang:'ar', langLabel:'العربية', dialect:'مصر', gender:'رجل', free:true },
  { id:'ar-EG-SalmaNeural',   lang:'ar', langLabel:'العربية', dialect:'مصر', gender:'امرأة', free:true },
  { id:'ar-AE-HamdanNeural',  lang:'ar', langLabel:'العربية', dialect:'الإمارات', gender:'رجل', free:true },
  { id:'ar-AE-FatimaNeural',  lang:'ar', langLabel:'العربية', dialect:'الإمارات', gender:'امرأة', free:true },

  { id:'ar-KW-FahedNeural',   lang:'ar', langLabel:'العربية', dialect:'الكويت', gender:'رجل', free:false },
  { id:'ar-KW-NouraNeural',   lang:'ar', langLabel:'العربية', dialect:'الكويت', gender:'امرأة', free:false },
  { id:'ar-QA-MoazNeural',    lang:'ar', langLabel:'العربية', dialect:'قطر', gender:'رجل', free:false },
  { id:'ar-QA-AmalNeural',    lang:'ar', langLabel:'العربية', dialect:'قطر', gender:'امرأة', free:false },
  { id:'ar-BH-AliNeural',     lang:'ar', langLabel:'العربية', dialect:'البحرين', gender:'رجل', free:false },
  { id:'ar-BH-LailaNeural',   lang:'ar', langLabel:'العربية', dialect:'البحرين', gender:'امرأة', free:false },
  { id:'ar-OM-AbdullahNeural',lang:'ar', langLabel:'العربية', dialect:'عُمان', gender:'رجل', free:false },
  { id:'ar-OM-AyshaNeural',   lang:'ar', langLabel:'العربية', dialect:'عُمان', gender:'امرأة', free:false },
  { id:'ar-JO-TaimNeural',    lang:'ar', langLabel:'العربية', dialect:'الأردن', gender:'رجل', free:false },
  { id:'ar-JO-SanaNeural',    lang:'ar', langLabel:'العربية', dialect:'الأردن', gender:'امرأة', free:false },
  { id:'ar-LB-RamiNeural',    lang:'ar', langLabel:'العربية', dialect:'لبنان', gender:'رجل', free:false },
  { id:'ar-LB-LaylaNeural',   lang:'ar', langLabel:'العربية', dialect:'لبنان', gender:'امرأة', free:false },
  { id:'ar-SY-LaithNeural',   lang:'ar', langLabel:'العربية', dialect:'سوريا', gender:'رجل', free:false },
  { id:'ar-SY-AmanyNeural',   lang:'ar', langLabel:'العربية', dialect:'سوريا', gender:'امرأة', free:false },
  { id:'ar-IQ-BasselNeural',  lang:'ar', langLabel:'العربية', dialect:'العراق', gender:'رجل', free:false },
  { id:'ar-IQ-RanaNeural',    lang:'ar', langLabel:'العربية', dialect:'العراق', gender:'امرأة', free:false },
  { id:'ar-YE-SalehNeural',   lang:'ar', langLabel:'العربية', dialect:'اليمن', gender:'رجل', free:false },
  { id:'ar-YE-MaryamNeural',  lang:'ar', langLabel:'العربية', dialect:'اليمن', gender:'امرأة', free:false },
  { id:'ar-MA-JamalNeural',   lang:'ar', langLabel:'العربية', dialect:'المغرب', gender:'رجل', free:false },
  { id:'ar-MA-MounaNeural',   lang:'ar', langLabel:'العربية', dialect:'المغرب', gender:'امرأة', free:false },
  { id:'ar-DZ-IsmaelNeural',  lang:'ar', langLabel:'العربية', dialect:'الجزائر', gender:'رجل', free:false },
  { id:'ar-DZ-AminaNeural',   lang:'ar', langLabel:'العربية', dialect:'الجزائر', gender:'امرأة', free:false },
  { id:'ar-TN-HediNeural',    lang:'ar', langLabel:'العربية', dialect:'تونس', gender:'رجل', free:false },
  { id:'ar-TN-ReemNeural',    lang:'ar', langLabel:'العربية', dialect:'تونس', gender:'امرأة', free:false },
  { id:'ar-LY-OmarNeural',    lang:'ar', langLabel:'العربية', dialect:'ليبيا', gender:'رجل', free:false },
  { id:'ar-LY-ImanNeural',    lang:'ar', langLabel:'العربية', dialect:'ليبيا', gender:'امرأة', free:false },

  { id:'en-US-GuyNeural',     lang:'en', langLabel:'English', dialect:'أمريكا', gender:'رجل', free:true },
  { id:'en-US-AriaNeural',    lang:'en', langLabel:'English', dialect:'أمريكا', gender:'امرأة', free:true },
  { id:'en-GB-RyanNeural',    lang:'en', langLabel:'English', dialect:'بريطانيا', gender:'رجل', free:false },
  { id:'en-GB-SoniaNeural',   lang:'en', langLabel:'English', dialect:'بريطانيا', gender:'امرأة', free:false },

  { id:'fr-FR-HenriNeural',   lang:'fr', langLabel:'Français', dialect:'فرنسا', gender:'رجل', free:false },
  { id:'fr-FR-DeniseNeural',  lang:'fr', langLabel:'Français', dialect:'فرنسا', gender:'امرأة', free:false },

  { id:'es-ES-AlvaroNeural',  lang:'es', langLabel:'Español', dialect:'إسبانيا', gender:'رجل', free:false },
  { id:'es-ES-ElviraNeural',  lang:'es', langLabel:'Español', dialect:'إسبانيا', gender:'امرأة', free:false },

  { id:'tr-TR-AhmetNeural',   lang:'tr', langLabel:'Türkçe', dialect:'تركيا', gender:'رجل', free:false },
  { id:'tr-TR-EmelNeural',    lang:'tr', langLabel:'Türkçe', dialect:'تركيا', gender:'امرأة', free:false },
];

if(typeof module !== 'undefined'){ module.exports = { VOICES }; }
