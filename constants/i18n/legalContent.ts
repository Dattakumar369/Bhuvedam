import type { LanguageCode } from '@/constants/languages';
import { APP } from '@/constants/app';
import { getPrivacyPolicyExtra, getTermsLegalExtra } from '@/constants/trustPolicy';

function termsEn(): string {
  return `
# Terms of Service

**Last updated:** January 2026

## Acceptance of Terms

By accessing or using ${APP.name}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.

## Description of Service

${APP.name} provides AI-powered agricultural assistance, weather intelligence, and farming recommendations. The service is intended for informational purposes and should not replace professional agricultural advice.

## User Responsibilities

- Provide accurate information when using the app
- Use the service for **lawful farming purposes only**
- Do not attempt to reverse engineer or disrupt the service
- Keep your account credentials secure
- Do not ask the AI to help with illegal pesticides, fraud, or evading government rules

${getTermsLegalExtra(APP.name)}

## Disclaimer

The information provided by ${APP.name} is for general guidance only. We do not guarantee specific crop yields, weather accuracy, or farming outcomes. Always consult local agricultural experts for critical decisions.

## Limitation of Liability

${APP.name} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.

## Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the app constitutes acceptance of updated terms.

## Contact

Questions about these terms? Contact us at **${APP.supportEmail}**.
`.trim();
}

function termsTe(): string {
  return `
# Terms of Service / నిబంధనలు

**Last updated:** January 2026

## Acceptance

${APP.name} use cheste ee Terms accept chesinattu. Oppukunte use cheyakandi.

## Service

${APP.name} AI farming assistance, weather, recommendations istundi. Professional ag advice replace cheyadu.

## User Responsibilities

- Sariyaina details enter cheyandi
- **Lawful farming purposes** matrame
- Account secure ga pettandi
- Illegal pesticides, fraud, government rules evade cheyadaniki AI adagakandi

${getTermsLegalExtra(APP.name)}

## Disclaimer

General guidance matrame — yield, weather guarantee ledu. Critical decisions ki local ag officer consult cheyandi.

## Contact

**${APP.supportEmail}**
`.trim();
}

function termsHi(): string {
  return `
# सेवा की शर्तें

**अंतिम अपडेट:** जनवरी 2026

## स्वीकृति

${APP.name} का उपयोग करके आप इन शर्तों से सहमत हैं।

## सेवा

${APP.name} AI कृषि सहायता, मौसम और सिफारिशें प्रदान करता है। पेशेवर कृषि सलाह का विकल्प नहीं है।

## उपयोगकर्ता जिम्मेदारियां

- सही जानकारी दें
- केवल **वैध कृषि उद्देश्यों** के लिए उपयोग करें
- खाता सुरक्षित रखें
- अवैध कीटनाशक, धोखाधड़ी या सरकारी नियमों से बचने के लिए AI न पूछें

${getTermsLegalExtra(APP.name)}

## अस्वीकरण

सामान्य मार्गदर्शन मात्र — उपज या मौसम की गारंटी नहीं। महत्वपूर्ण निर्णयों के लिए स्थानीय कृषि विशेषज्ञ से consult करें।

## संपर्क

**${APP.supportEmail}**
`.trim();
}

function termsMr(): string {
  return `
# सेवा अटी

**शेवटचे अपडेट:** जानेवारी 2026

## स्वीकार

${APP.name} वापरून तुम्ही या अटींना सहमती देता.

## सेवा

${APP.name} AI शेती सहाय्य, हवामान आणि शिफारसी देते. व्यावसायिक सल्ला नाही.

## जबाबदाऱ्या

- अचूक माहिती द्या
- फक्त **कायदेशीर शेती** साठी वापरा
- खाते सुरक्षित ठेवा

${getTermsLegalExtra(APP.name)}

## अस्वीकरण

सामान्य मार्गदर्शन — उत्पादनाची हमी नाही. महत्वाचे निर्णय local ag officer कडे.

## संपर्क

**${APP.supportEmail}**
`.trim();
}

function termsTa(): string {
  return `
# சேவை விதிமுறைகள்

**கடைசி புதுப்பிப்பு:** ஜனவரி 2026

## ஏற்பு

${APP.name} பயன்படுத்துவதன் மூலம் இந்த விதிமுறைகளை ஏற்கிறீர்கள்.

## சேவை

${APP.name} AI விவசாய உதவி, வானிலை, பரிந்துரைகள். தொழில்முறை ஆலோசனை அல்ல.

## பொறுப்புகள்

- சரியான தகவல் கொடுங்கள்
- **சட்டப்பூர்வ விவசாய** நோக்கங்களுக்கு மட்டும்
- கணக்கை பாதுகாப்பாக வைத்திருங்கள்

${getTermsLegalExtra(APP.name)}

## மறுப்பு

பொது வழிகாட்டுதல் மட்டும். முக்கிய முடிவுகளுக்கு local ag officer.

## தொடர்பு

**${APP.supportEmail}**
`.trim();
}

function termsKn(): string {
  return `
# ಸೇವಾ ನಿಯಮಗಳು

**ಕೊನೆಯ ಅಪ್‌ಡೇಟ್:** ಜನವರಿ 2026

## ಒಪ್ಪಿಗೆ

${APP.name} ಬಳಸುವ ಮೂಲಕ ಈ ನಿಯಮಗಳನ್ನು ಒಪ್ಪುತ್ತೀರಿ.

## ಸೇವೆ

${APP.name} AI ಕೃಷಿ ಸಹಾಯ, ಹವಾಮಾನ, ಶಿಫಾರಸುಗಳು. ವೃತ್ತಿಪರ ಸಲಹೆ ಅಲ್ಲ.

## ಜವಾಬ್ದಾರಿಗಳು

- ಸರಿಯಾದ ಮಾಹಿತಿ ನೀಡಿ
- **ಕಾನೂನುಬದ್ಧ ಕೃಷಿ** ಉದ್ದೇಶಗಳಿಗೆ ಮಾತ್ರ
- ಖಾತೆ ಸುರಕ್ಷಿತವಾಗಿ ಇರಿಸಿ

${getTermsLegalExtra(APP.name)}

## ಹಕ್ಕು ನಿರಾಕರಣೆ

ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ. ಪ್ರಮುಖ ನಿರ್ಧಾರಗಳಿಗೆ local ag officer.

## ಸಂಪರ್ಕ

**${APP.supportEmail}**
`.trim();
}

function privacyEn(): string {
  return `
# Privacy Policy

**Last updated:** January 2026

## Introduction

${APP.name} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

## Information We Collect

- **Personal Information:** Name, phone number, and language preference
- **Location Data:** Farm location for weather and crop recommendations
- **Usage Data:** App interactions, AI chat history, and feature usage
- **Device Information:** Device type, operating system, and app version

## How We Use Your Information

We use collected information to:

1. Provide personalized weather and farming recommendations
2. Enable AI-powered agricultural assistance
3. Improve our services and user experience
4. Send important service-related communications

## Data Security

We implement industry-standard security measures including encryption, secure storage, and access controls to protect your personal information.

## Data Sharing

We do **not** sell your personal information. We do **not** share one farmer's profile, location, or chat with another farmer.

We may share limited data with trusted service providers (e.g. AI, weather APIs) only to operate **your** features, subject to confidentiality agreements. They must not use your data to identify or serve other users.

${getPrivacyPolicyExtra()}

## Your Rights

You have the right to access, update, or delete your personal information. Contact us at **${APP.supportEmail}** to exercise these rights.

## Contact Us

For privacy-related questions, reach us at **${APP.supportEmail}**.
`.trim();
}

function privacyTe(): string {
  return `
# Privacy Policy / గోప్యతా విధానం

**Last updated:** January 2026

## Introduction

${APP.name} mee privacy protect cheyadaniki commit ayyindi.

## Collect chestham

- **Personal:** Name, phone, language
- **Location:** Farm location — weather & crop recommendations
- **Usage:** App use, AI chat history
- **Device:** Phone type, OS, app version

## Use

1. Personalized weather & farming recommendations
2. AI agricultural assistance
3. Service improve cheyadaniki
4. Important notifications

## Data Sharing

Mee personal info **ammuvu** ledu. Okka raitu profile/location/chat **inkok raitu ki share cheyamu**.

${getPrivacyPolicyExtra()}

## Your Rights

Access, update, delete — **${APP.supportEmail}** contact cheyandi.
`.trim();
}

function privacyHi(): string {
  return `
# गोपनीयता नीति

**अंतिम अपडेट:** जनवरी 2026

## परिचय

${APP.name} आपकी गोपनीयता की रक्षा के लिए प्रतिबद्ध है।

## हम क्या एकत्र करते हैं

- **व्यक्तिगत:** नाम, फोन, भाषा
- **स्थान:** खेत का स्थान — मौसम और फसल सिफारिशें
- **उपयोग:** ऐप, AI चैट इतिहास
- **डिवाइस:** फोन प्रकार, OS, ऐप संस्करण

## डेटा साझाकरण

हम आपकी जानकारी **नहीं बेचते**। एक किसान का डेटा **दूसरे किसान के साथ साझा नहीं** करते।

${getPrivacyPolicyExtra()}

## आपके अधिकार

पहुंच, अपडेट, हटाना — **${APP.supportEmail}** पर संपर्क करें।
`.trim();
}

function privacyMr(): string {
  return `
# गोपनीयता धोरण

**शेवटचे अपडेट:** जानेवारी 2026

## परिचय

${APP.name} तुमच्या गोपनीयतेचे संरक्षण करते.

## माहिती

- **वैयक्तिक:** नाव, फोन, भाषा
- **स्थान:** शेताचे स्थान
- **वापर:** अॅप, AI चॅट
- **डिव्हाइस:** फोन, OS, version

## शेअरिंग

तुमची माहिती **विकत नाही**. एका शेतकऱ्याचा डेटा **दुसऱ्यासोबत शेअर नाही**.

${getPrivacyPolicyExtra()}

## अधिकार

**${APP.supportEmail}** वर संपर्क करा.
`.trim();
}

function privacyTa(): string {
  return `
# தனியுரிமைக் கொள்கை

**கடைசி புதுப்பிப்பு:** ஜனவரி 2026

## அறிமுகம்

${APP.name} உங்கள் தனியுரிமையை பாதுகாக்கிறது.

## தகவல்

- **தனிப்பட்ட:** பெயர், தொலைபேசி, மொழி
- **இடம்:** வயல் இடம்
- **பயன்பாடு:** ஆப், AI chat
- **சாதனம்:** போன், OS, version

## பகிர்வு

உங்கள் தகவலை **விற்பனை செய்யோம்**. ஒரு விவசாயியின் தரவை **மற்றவருடன் பகிர மாட்டோம்**.

${getPrivacyPolicyExtra()}

## உரிமைகள்

**${APP.supportEmail}** தொடர்பு கொள்ளுங்கள்.
`.trim();
}

function privacyKn(): string {
  return `
# ಗೋಪ್ಯತಾ ನೀತಿ

**ಕೊನೆಯ ಅಪ್‌ಡೇಟ್:** ಜನವರಿ 2026

## ಪರಿಚಯ

${APP.name} ನಿಮ್ಮ ಗೋಪ್ಯತೆಯನ್ನು ರಕ್ಷಿಸುತ್ತದೆ.

## ಮಾಹಿತಿ

- **ವೈಯಕ್ತಿಕ:** ಹೆಸರು, ಫೋನ್, ಭಾಷೆ
- **ಸ್ಥಳ:** ಹೊಲದ ಸ್ಥಳ
- **ಬಳಕೆ:** ಆಪ್, AI chat
- **ಸಾಧನ:** ಫೋನ್, OS, version

## ಹಂಚಿಕೆ

ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು **ಮಾರಾಟ ಮಾಡುವುದಿಲ್ಲ**. ಒಬ್ಬ ರೈತರ ಡೇಟಾವನ್ನು **ಇನ್ನೊಬ್ಬರೊಂದಿಗೆ ಹಂಚುವುದಿಲ್ಲ**.

${getPrivacyPolicyExtra()}

## ಹಕ್ಕುಗಳು

**${APP.supportEmail}** ಸಂಪರ್ಕಿಸಿ.
`.trim();
}

const TERMS: Record<LanguageCode, () => string> = {
  en: termsEn,
  te: termsTe,
  hi: termsHi,
  mr: termsMr,
  ta: termsTa,
  kn: termsKn,
};

const PRIVACY: Record<LanguageCode, () => string> = {
  en: privacyEn,
  te: privacyTe,
  hi: privacyHi,
  mr: privacyMr,
  ta: privacyTa,
  kn: privacyKn,
};

export function getTermsContent(language: LanguageCode): string {
  return (TERMS[language] ?? TERMS.en)();
}

export function getPrivacyContent(language: LanguageCode): string {
  return (PRIVACY[language] ?? PRIVACY.en)();
}
