import { DEFAULT_LANGUAGE, type LanguageCode } from '@/constants/languages';
import { EN_TOPIC_CATEGORIES, TE_TOPIC_CATEGORIES } from '@/constants/i18n/topicCategories';

export interface AiTopicCategory {
  title: string;
  questions: readonly string[];
}

export interface Translations {
  aiWelcome: string;
  aiSuggestions: readonly string[];
  aiTopicCategories: readonly AiTopicCategory[];
  topicPickerHint: string;
  chatPlaceholder: string;
  chatListeningPlaceholder: string;
  newChat: string;
  aiAssistantTitle: string;
  aiAssistantSubtitle: string;
  searchConversations: string;
  noConversationsTitle: string;
  noConversationsDesc: string;
  startNewChat: string;
  statusListening: string;
  statusThinking: string;
  statusSpeaking: string;
  voiceModeOn: string;
  voiceModeOff: string;
  voiceBarListening: string;
  voiceBarThinking: string;
  voiceBarSpeaking: string;
  typingIndicator: string;
  voiceInputTitle: string;
  voiceInputMessage: string;
  voiceInputOk: string;
  voiceInputLearnMore: string;
  aiError: string;
  messageEdit: string;
  messageDelete: string;
  messageActionsTitle: string;
  messageDeleteConfirmTitle: string;
  messageDeleteConfirmUser: string;
  messageDeleteConfirmAssistant: string;
  editingMessage: string;
  cancelEdit: string;
  chatAttachImage: string;
  chatImageDefaultPrompt: string;
  chatImageSessionNote: string;
  mockResponses: {
    default: string;
    crop: string;
    pest: string;
    irrigation: string;
  };
  mockConversations: readonly { title: string; preview: string }[];
}

const en: Translations = {
  aiWelcome:
    "Hello! I'm Bhuvedam AI — your complete farming assistant. Ask about crops, weather, soil, pests, irrigation, fertilizers, harvest, market prices, and government schemes. I'll give detailed, practical answers.",
  aiSuggestions: [
    'What crops should I plant this season?',
    'How to prevent pest infestation in cotton?',
    'Best irrigation schedule for wheat?',
    'When should I harvest my rice crop?',
    'How to improve soil fertility naturally?',
    'What fertilizer is best for tomatoes?',
    'How to get PM-KISAN or crop insurance?',
    'Current market price tips for my produce?',
  ],
  aiTopicCategories: EN_TOPIC_CATEGORIES,
  topicPickerHint: 'All topics — pick a category and tap a question',
  chatPlaceholder: 'Ask about farming, crops, weather...',
  chatListeningPlaceholder: 'Listening...',
  newChat: 'New Chat',
  aiAssistantTitle: 'AI Assistant',
  aiAssistantSubtitle: 'Your smart farming companion',
  searchConversations: 'Search conversations...',
  noConversationsTitle: 'No conversations yet',
  noConversationsDesc: 'Ask AI about crops, weather, pests, and farming best practices',
  startNewChat: 'Start New Chat',
  statusListening: 'Listening...',
  statusThinking: 'Thinking...',
  statusSpeaking: 'Speaking...',
  voiceModeOn: 'Voice mode on — type or tap mic',
  voiceModeOff: 'Voice mode off',
  voiceBarListening: 'Listening... speak now',
  voiceBarThinking: 'Bhuvedam AI is thinking...',
  voiceBarSpeaking: 'Speaking...',
  typingIndicator: 'Bhuvedam AI is thinking...',
  voiceInputTitle: 'Voice typing not available',
  voiceInputMessage:
    'Please type your question in the chat box.\n\nWhen voice mode is on, Bhuvedam AI will still read answers aloud for you.',
  voiceInputOk: 'OK',
  voiceInputLearnMore: 'OK',
  aiError: 'Bhuvedam AI could not reply. Please try again.',
  messageEdit: 'Edit',
  messageDelete: 'Delete',
  messageActionsTitle: 'Message',
  messageDeleteConfirmTitle: 'Delete message?',
  messageDeleteConfirmUser: 'This message and all replies after it will be removed.',
  messageDeleteConfirmAssistant: 'This reply will be removed.',
  editingMessage: 'Editing message',
  cancelEdit: 'Cancel',
  chatAttachImage: 'Upload photo',
  chatImageDefaultPrompt:
    'Analyze this farm photo — identify the crop, any disease/pest/nutrient problem visible, and suggest practical solutions.',
  chatImageSessionNote: 'Photos stay in this chat only — not saved online.',
  mockResponses: {
    default:
      'Based on current agricultural best practices, I recommend monitoring soil moisture levels regularly and adjusting irrigation based on crop growth stage. Would you like specific advice for a particular crop?',
    crop:
      'For the current season in Maharashtra, **wheat**, **chickpea**, and **mustard** are excellent choices. Ensure soil pH is between 6.0-7.5 and prepare the field with proper drainage.',
    pest:
      'Integrated Pest Management (IPM) is the most effective approach:\n\n1. **Monitor** fields weekly for early signs\n2. **Use** pheromone traps for detection\n3. **Apply** neem-based sprays as first line of defense\n4. **Reserve** chemical pesticides only when thresholds are exceeded',
    irrigation:
      'For wheat cultivation, follow this irrigation schedule:\n\n- **Crown root initiation**: First irrigation\n- **Tillering stage**: Second irrigation\n- **Flowering**: Critical irrigation\n- **Grain filling**: Final irrigation\n\nAvoid waterlogging at all stages.',
  },
  mockConversations: [
    { title: 'Best crops for Kharif season', preview: 'What crops should I plant this season?' },
    { title: 'Pest control in cotton', preview: 'How to prevent pest infestation in cotton?' },
    { title: 'Wheat irrigation tips', preview: 'Best irrigation schedule for wheat?' },
  ],
};

const hi: Translations = {
  aiWelcome:
    'नमस्ते! मैं आपका AI कृषि सहायक हूँ। फसलों, मौसम, मिट्टी, कीटों या खेती के बारे में कुछ भी पूछें।',
  aiSuggestions: [
    'इस मौसम में कौन सी फसलें बोनी चाहिए?',
    'कपास में कीट संक्रमण कैसे रोकें?',
    'गेहूं के लिए सबसे अच्छी सिंचाई अनुसूची?',
    'चावल की फसल की कटाई कब करें?',
    'मिट्टी की उर्वरता प्राकृतिक रूप से कैसे बढ़ाएं?',
    'टमाटर के लिए कौन सा उर्वरक सबसे अच्छा है?',
  ],
  aiTopicCategories: EN_TOPIC_CATEGORIES,
  topicPickerHint: 'सभी topics — category चुनें और tap करें',
  chatPlaceholder: 'खेती, फसल, मौसम के बारे में पूछें...',
  chatListeningPlaceholder: 'सुन रहा है...',
  newChat: 'नई चैट',
  aiAssistantTitle: 'AI सहायक',
  aiAssistantSubtitle: 'आपका स्मार्ट कृषि साथी',
  searchConversations: 'बातचीत खोजें...',
  noConversationsTitle: 'अभी कोई बातचीत नहीं',
  noConversationsDesc: 'फसल, मौसम, कीट और खेती के बारे में AI से पूछें',
  startNewChat: 'नई चैट शुरू करें',
  statusListening: 'सुन रहा है...',
  statusThinking: 'सोच रहा है...',
  statusSpeaking: 'बोल रहा है...',
  voiceModeOn: 'वॉइस मोड चालू — टाइप करें या माइक दबाएं',
  voiceModeOff: 'वॉइस मोड बंद',
  voiceBarListening: 'सुन रहा है... अब बोलें',
  voiceBarThinking: 'Bhuvedam AI सोच रहा है...',
  voiceBarSpeaking: 'बोल रहा है...',
  typingIndicator: 'Bhuvedam AI सोच रहा है...',
  voiceInputTitle: 'वॉइस टाइपिंग उपलब्ध नहीं',
  voiceInputMessage:
    'कृपया चैट बॉक्स में अपना प्रश्न टाइप करें।\n\nवॉइस मोड चालू होने पर Bhuvedam AI जवाब बोलकर भी सुनाएगा।',
  voiceInputOk: 'ठीक है',
  voiceInputLearnMore: 'ठीक है',
  aiError: 'AI जवाब प्राप्त करने में विफल',
  messageEdit: 'संपादित करें',
  messageDelete: 'हटाएं',
  messageActionsTitle: 'संदेश',
  messageDeleteConfirmTitle: 'संदेश हटाएं?',
  messageDeleteConfirmUser: 'यह संदेश और इसके बाद के सभी जवाब हटा दिए जाएंगे।',
  messageDeleteConfirmAssistant: 'यह जवाब हटा दिया जाएगा।',
  editingMessage: 'संदेश संपादित कर रहे हैं',
  cancelEdit: 'रद्द करें',
  chatAttachImage: 'फोटो अपलोड',
  chatImageDefaultPrompt:
    'इस खेत की फोटो का विश्लेषण करें — फसल, रोग/कीट/पोषक समस्या पहचानें और व्यावहारिक समाधान बताएं।',
  chatImageSessionNote: 'फोटो केवल इस सत्र में रहती है — सर्वर पर नहीं।',
  mockResponses: {
    default:
      'वर्तमान कृषि सर्वोत्तम प्रथाओं के आधार पर, मैं मिट्टी की नमी नियमित रूप से जांचने और फसल की वृद्धि के अनुसार सिंचाई समायोजित करने की सलाह देता हूँ। क्या आप किसी विशेष फसल के लिए सलाह चाहते हैं?',
    crop:
      'महाराष्ट्र में वर्तमान मौसम के लिए **गेहूं**, **चना** और **सरसों** उत्कृष्ट विकल्प हैं। मिट्टी का pH 6.0-7.5 के बीच रखें और उचित जल निकासी के साथ खेत तैयार करें।',
    pest:
      'एकीकृत कीट प्रबंधन (IPM) सबसे प्रभावी है:\n\n1. **निगरानी** — साप्ताहिक खेत जांच\n2. **फेरोमोन ट्रैप** का उपयोग\n3. **नीम आधारित** स्प्रे पहली रक्षा\n4. **रासायनिक कीटनाशक** केवल आवश्यकता पर',
    irrigation:
      'गेहूं की खेती के लिए सिंचाई अनुसूची:\n\n- **मुकुट जड़**: पहली सिंचाई\n- **कल्ले**: दूसरी सिंचाई\n- **फूल**: महत्वपूर्ण सिंचाई\n- **दाना भरना**: अंतिम सिंचाई\n\nकिसी भी चरण में जलभराव से बचें।',
  },
  mockConversations: [
    { title: 'खरीफ के लिए सर्वोत्तम फसलें', preview: 'इस मौसम में कौन सी फसलें बोनी चाहिए?' },
    { title: 'कपास में कीट नियंत्रण', preview: 'कपास में कीट संक्रमण कैसे रोकें?' },
    { title: 'गेहूं सिंचाई सुझाव', preview: 'गेहूं के लिए सबसे अच्छी सिंचाई अनुसूची?' },
  ],
};

const mr: Translations = {
  aiWelcome:
    'नमस्कार! मी तुमचा AI शेती सहाय्यक आहे. पिके, हवामान, माती, कीटक किंवा शेतीबद्दल काहीही विचारा.',
  aiSuggestions: [
    'या हंगामात कोणती पिके लावावीत?',
    'कापús मध्ये कीटक संसर्ग कसा रोखावा?',
    'गहूसाठी सर्वोत्तम सिंचन वेळापत्रक?',
    'भाताची कापणी कधी करावी?',
    'मातीची सुपीकता नैसर्गिकरित्या कशी वाढवावी?',
    'टोमॅटोसाठी कोणते खत सर्वोत्तम?',
  ],
  aiTopicCategories: EN_TOPIC_CATEGORIES,
  topicPickerHint: 'सर्व topics — category निवडा',
  chatPlaceholder: 'शेती, पिके, हवामान विचारा...',
  chatListeningPlaceholder: 'ऐकत आहे...',
  newChat: 'नवीन चॅट',
  aiAssistantTitle: 'AI सहाय्यक',
  aiAssistantSubtitle: 'तुमचा स्मार्ट शेती साथी',
  searchConversations: 'संभाषण शोधा...',
  noConversationsTitle: 'अद्याप कोणतेही संभाषण नाही',
  noConversationsDesc: 'पिके, हवामान, कीटक आणि शेतीबद्दल AI ला विचारा',
  startNewChat: 'नवीन चॅट सुरू करा',
  statusListening: 'ऐकत आहे...',
  statusThinking: 'विचार करत आहे...',
  statusSpeaking: 'बोलत आहे...',
  voiceModeOn: 'व्हॉइस मोड चालू — टाइप करा किंवा माइक दाबा',
  voiceModeOff: 'व्हॉइस मोड बंद',
  voiceBarListening: 'ऐकत आहे... आता बोला',
  voiceBarThinking: 'Bhuvedam AI विचार करत आहे...',
  voiceBarSpeaking: 'बोलत आहे...',
  typingIndicator: 'Bhuvedam AI विचार करत आहे...',
  voiceInputTitle: 'व्हॉइस टाइपिंग उपलब्ध नाही',
  voiceInputMessage:
    'कृपया चॅट बॉक्समध्ये प्रश्न टाइप करा.\n\nव्हॉइस मोड चालू असताना Bhuvedam AI उत्तरे वाचूनही सांगेल.',
  voiceInputOk: 'ठीक आहे',
  voiceInputLearnMore: 'ठीक आहे',
  aiError: 'AI उत्तर मिळवण्यात अयशस्वी',
  messageEdit: 'संपादित करा',
  messageDelete: 'हटवा',
  messageActionsTitle: 'संदेश',
  messageDeleteConfirmTitle: 'संदेश हटवायचा?',
  messageDeleteConfirmUser: 'हा संदेश आणि त्यानंतरची सर्व उत्तरे हटवली जातील.',
  messageDeleteConfirmAssistant: 'हे उत्तर हटवले जाईल.',
  editingMessage: 'संदेश संपादित करत आहे',
  cancelEdit: 'रद्द करा',
  chatAttachImage: 'फोटो अपलोड',
  chatImageDefaultPrompt:
    'या शेताच्या फोटोचे विश्लेषण करा — पीक, रोग/कीड/पोषक समस्या ओळखा आणि व्यावहारिक उपाय सुचवा.',
  chatImageSessionNote: 'फोटो फक्त या सत्रात — सर्व्हरवर सेव्ह नाही.',
  mockResponses: {
    default:
      'सध्याच्या शेती सर्वोत्तम पद्धतींनुसार, मातीची ओलसरता नियमित तपासा आणि पिकाच्या वाढीनुसार सिंचन समायोजित करा. विशिष्ट पिकासाठी सल्ला हवा आहे का?',
    crop:
      'महाराष्ट्रात या हंगामासाठी **गहू**, **हरभरा** आणि **मोहरी** उत्तम पर्याय आहेत. माती pH 6.0-7.5 दरम्यान ठेवा आणि योग्य निचरा तयार करा.',
    pest:
      'एकात्मिक कीटक व्यवस्थापन (IPM) सर्वात प्रभावी:\n\n1. **निरीक्षण** — साप्ताहिक शेत तपासणी\n2. **फेरोमोन ट्रॅप** वापरा\n3. **नीम आधारित** फवारणी\n4. **रासायनिक कीटकनाशके** फक्त गरज असल्यास',
    irrigation:
      'गहू लागवडीसाठी सिंचन वेळापत्रक:\n\n- **मुकुट मुळे**: पहिले सिंचन\n- **कंद**: दुसरे सिंचन\n- **फुलणे**: महत्वाचे सिंचन\n- **दाणे भरणे**: शेवटचे सिंचन\n\nकोणत्याही टप्प्यात पाण्याचा साच होऊ देऊ नका.',
  },
  mockConversations: [
    { title: 'खरीप हंगामासाठी सर्वोत्तम पिके', preview: 'या हंगामात कोणती पिके लावावीत?' },
    { title: 'कापús मध्ये कीटक नियंत्रण', preview: 'कापús मध्ये कीटक संसर्ग कसा रोखावा?' },
    { title: 'गहू सिंचन सुझाव', preview: 'गहूसाठी सर्वोत्तम सिंचन वेळापत्रक?' },
  ],
};

const ta: Translations = {
  aiWelcome:
    'வணக்கம்! நான் உங்கள் AI விவசாய உதவியாளர். பயிர்கள், வானிலை, மண், பூச்சிகள் அல்லது விவசாயம் பற்றி எதையும் கேளுங்கள்.',
  aiSuggestions: [
    'இந்த பருவத்தில் எந்த பயிர்களை நட வேண்டும்?',
    'பருத்தியில் பூச்சி தொற்றை எப்படி தடுப்பது?',
    'கோதுமைக்கு சிறந்த பாசன அட்டவணை?',
    'நெல் பயிரை எப்போது அறுவடை செய்ய வேண்டும்?',
    'மண் வளத்தை இயற்கையாக எப்படி மேம்படுத்துவது?',
    'தக்காளிக்கு எந்த உரம் சிறந்தது?',
  ],
  aiTopicCategories: EN_TOPIC_CATEGORIES,
  topicPickerHint: 'அனைத்து topics — category தேர்ந்தெடுக்கவும்',
  chatPlaceholder: 'விவசாயம், பயிர்கள், வானிலை பற்றி கேளுங்கள்...',
  chatListeningPlaceholder: 'கேட்கிறது...',
  newChat: 'புதிய அரட்டை',
  aiAssistantTitle: 'AI உதவியாளர்',
  aiAssistantSubtitle: 'உங்கள் ஸ்மார்ட் விவசாய துணை',
  searchConversations: 'அரட்டைகளை தேடுங்கள்...',
  noConversationsTitle: 'இன்னும் அரட்டைகள் இல்லை',
  noConversationsDesc: 'பயிர்கள், வானிலை, பூச்சிகள் மற்றும் விவசாயம் பற்றி AI-யிடம் கேளுங்கள்',
  startNewChat: 'புதிய அரட்டை தொடங்குங்கள்',
  statusListening: 'கேட்கிறது...',
  statusThinking: 'யோசிக்கிறது...',
  statusSpeaking: 'பேசுகிறது...',
  voiceModeOn: 'குரல் பயன்முறை இயக்கம் — தட்டச்சு அல்லது மைக்',
  voiceModeOff: 'குரல் பயன்முறை முடக்கம்',
  voiceBarListening: 'கேட்கிறது... இப்போது பேசுங்கள்',
  voiceBarThinking: 'Bhuvedam AI யோசிக்கிறது...',
  voiceBarSpeaking: 'பேசுகிறது...',
  typingIndicator: 'Bhuvedam AI யோசிக்கிறது...',
  voiceInputTitle: 'குரல் உள்ளீடு கிடைக்கவில்லை',
  voiceInputMessage:
    'அரட்டை பெட்டியில் கேள்வியை தட்டச்சு செய்யுங்கள்.\n\nகுரல் முறை இயக்கத்தில் Bhuvedam AI பதில்களை பேசியும் கூறும்.',
  voiceInputOk: 'சரி',
  voiceInputLearnMore: 'சரி',
  aiError: 'AI பதில் பெற முடியவில்லை',
  messageEdit: 'திருத்து',
  messageDelete: 'அழி',
  messageActionsTitle: 'செய்தி',
  messageDeleteConfirmTitle: 'செய்தியை அழிக்கவா?',
  messageDeleteConfirmUser: 'இந்த செய்தியும் அதற்குப் பிந்தைய பதில்களும் அழிக்கப்படும்.',
  messageDeleteConfirmAssistant: 'இந்த பதில் அழிக்கப்படும்.',
  editingMessage: 'செய்தியை திருத்துகிறீர்கள்',
  cancelEdit: 'ரத்து',
  chatAttachImage: 'புகைப்படம்',
  chatImageDefaultPrompt:
    'Analyze this farm photo — identify crop, disease/pest/nutrient issue, and suggest practical solutions.',
  chatImageSessionNote: 'Photos stay in this chat only — not saved online.',
  mockResponses: {
    default:
      'தற்போதைய விவசாய சிறந்த நடைமுறைகளின் அடிப்படையில், மண் ஈரப்பதத்தை தொடர்ந்து கண்காணித்து, பயிர் வளர்ச்சிக்கு ஏற்ப பாசனத்தை சரிசெய்ய பரிந்துரைக்கிறேன். குறிப்பிட்ட பயிருக்கு ஆலோசனை வேண்டுமா?',
    crop:
      'மகாராஷ்டிராவில் இந்த பருவத்திற்கு **கோதுமை**, **கடலை** மற்றும் **கடுகு** சிறந்த தேர்வுகள். மண் pH 6.0-7.5 இடையே வைத்து, சரியான வடிகால் தயாரிக்கவும்.',
    pest:
      'ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) மிகவும் பயனுள்ளது:\n\n1. **கண்காணிப்பு** — வாராந்திர சோதனை\n2. **பெரோமோன் பொறிகள்**\n3. **வேப்பை அடிப்படையிலான** தெளிப்பு\n4. **ரசாயன பூச்சிக்கொல்லிகள்** தேவையான போது மட்டும்',
    irrigation:
      'கோதுமைக்கான பாசன அட்டவணை:\n\n- **கrown root**: முதல் பாசனம்\n- **Tillering**: இரண்டாம் பாசனம்\n- **Flowering**: முக்கிய பாசனம்\n- **Grain filling**: இறுதி பாசனம்\n\nஎந்த கட்டத்திலும் நீர் தேங்காமல் பாருங்கள்.',
  },
  mockConversations: [
    { title: 'காரிப் பருவத்திற்கான சிறந்த பயிர்கள்', preview: 'இந்த பருவத்தில் எந்த பயிர்களை நட வேண்டும்?' },
    { title: 'பருத்தியில் பூச்சி கட்டுப்பாடு', preview: 'பருத்தியில் பூச்சி தொற்றை எப்படி தடுப்பது?' },
    { title: 'கோதுமை பாசன குறிப்புகள்', preview: 'கோதுமைக்கு சிறந்த பாசன அட்டவணை?' },
  ],
};

const te: Translations = {
  aiWelcome:
    'నమస్కారం! నేను Bhuvedam AI — మీ పూర్తి వ్యవసాయ సహాయకుడిని. పంటలు, వాతావరణం, మట్టి, తెగులు, నీటిపారుదల, ఎరువులు, పంట కోయడం, మార్కెట్ ధరలు, ప్రభుత్వ పథకాలు — ఏ విషయం అయినా అడగండి. అన్ని రకాల వివరమైన సమాధానాలు తెలుగులో ఇస్తాను.',
  aiSuggestions: [
    'ఈ సీజన్‌లో ఏ పంటలు వేయాలి?',
    'పత్తిలో తెగులు సంక్రమణం ఎలా నిరోధించాలి?',
    'గోధumaకి ఉత్తమ నీటిపారుదల షెడ్యూల్?',
    'వరి పంటను ఎప్పుడు కోయాలి?',
    'మట్టి సారవంతతను సహజంగా ఎలా పెంచాలి?',
    'టమాటాలకు ఏ ఎరువు ఉత్తమం?',
  ],
  aiTopicCategories: TE_TOPIC_CATEGORIES,
  topicPickerHint: 'అన్ని రకాల ప్రశ్నలు — category ఎంచుకunisti tap చేయండi',
  chatPlaceholder: 'వ్యవసాయం, పంట, వాతావరణం, తెగులు, ఎరువు — ఏదైనా అడగండి...',
  chatListeningPlaceholder: 'వింటున్నాను...',
  newChat: 'కొత్త చాట్',
  aiAssistantTitle: 'AI సహాయకుడు',
  aiAssistantSubtitle: 'మీ స్మార్ట్ వ్యవసాయ సహచరుడు',
  searchConversations: 'సంభాషణలు వెతకండి...',
  noConversationsTitle: 'ఇంకా సంభాషణలు లేవు',
  noConversationsDesc: 'పంటలు, వాతావరణం, తెగులు మరియు వ్యవసాయం గురించి AI ని అడగండి',
  startNewChat: 'కొత్త చాట్ ప్రారంభించండి',
  statusListening: 'వింటున్నాను...',
  statusThinking: 'ఆలోచిస్తున్నాను...',
  statusSpeaking: 'మాట్లాడుతున్నాను...',
  voiceModeOn: 'వాయిస్ మోడ్ ఆన్ — టైప్ చేయండి లేదా మైక్ నొక్కండి',
  voiceModeOff: 'వాయిస్ మోడ్ ఆఫ్',
  voiceBarListening: 'వింటున్నాను... మీరు మాట్లాడandi',
  voiceBarThinking: 'ఆలోచిస్తున్నాను...',
  voiceBarSpeaking: 'మీకు చెప్పుతున్నాను...',
  typingIndicator: 'Bhuvedam AI ఆలోచిస్తోంది...',
  voiceInputTitle: 'వాయిస్ టైపింగ్ అందుబాటులో లేదు',
  voiceInputMessage:
    'దయచేసి చాట్ బాక్స్‌లో మీ ప్రశ్న టైప్ చేయండి.\n\nవాయిస్ మోడ్ ఆన్ ఉంటే Bhuvedam AI సమాధానాలు మాట్లాడి చెప్తుంది.',
  voiceInputOk: 'సరే',
  voiceInputLearnMore: 'సరే',
  aiError: 'AI సమాధానం పొందడంలో విఫలమైంది',
  messageEdit: 'మార్చు',
  messageDelete: 'తొలగించు',
  messageActionsTitle: 'సందేశం',
  messageDeleteConfirmTitle: 'సందేశం తొలగించాలా?',
  messageDeleteConfirmUser: 'ఈ సందేశం మరియు దాని తర్వాత ఉన్న అన్ని సమాధానాలు తొలగించబడతాయి.',
  messageDeleteConfirmAssistant: 'ఈ సమాధానం తొలగించబడుతుంది.',
  editingMessage: 'సందేశం మారుస్తున్నారు',
  cancelEdit: 'రద్దు',
  chatAttachImage: 'Photo upload',
  chatImageDefaultPrompt:
    'Ee photo chusi crop, rogam/tegu/poshak samasya em kanipistundo cheppandi — practical solution ivvandi.',
  chatImageSessionNote: 'Photos ee session lo matrame untayi — server lo save avvavu.',
  mockResponses: {
    default:
      'ప్రస్తుత వ్యవసాయ ఉత్తమ పద్ధతుల ఆధారంగా, మట్టి తేమ స్థాయులను క్రమం తప్పకుండా పర్యవేక్షించి, పంట పెరుగుదల దశకు అనుగుణంగా నీటిపారుదలను సర్దుబాటు చేయమని సిఫారసు చేస్తున్నాను. నిర్దిష్ట పంటకు సలహా కావాలా?',
    crop:
      'మహారాష్ట్రలో ప్రస్తుత సీజన్‌కు **గోధుమ**, **శనగ** మరియు **ఆవాల** అద్భుతమైన ఎంపికలు. మట్టి pH 6.0-7.5 మధ్య ఉంచండి మరియు సరైన నీటి పారుదలతో పొలం సిద్ధం చేయండి.',
    pest:
      'ఏకీకృత తెగులు నిర్వహణ (IPM) అత్యంత ప్రభావవంతం:\n\n1. **పర్యవేక్షణ** — వారానికి ఒకసారి పొలం తనిఖీ\n2. **ఫెరోమోన్ ట్రాప్‌లు** ఉపయోగించండి\n3. **వేప ఆధారిత** స్ప్రేలు మొదటి రక్షణ\n4. **రసాయన కీటనాశకాలు** అవసరమైనప్పుడు మాత్రమే',
    irrigation:
      'గోధుమ సాగు కోసం నీటిపారుదల షెడ్యూల్:\n\n- **క్రౌన్ రూట్**: మొదటి నీటిపారుదల\n- **టిల్లరింగ్**: రెండవ నీటిపారుదల\n- **పుష్పించే దశ**: కీలక నీటిపారుదల\n- **ధాన్యం నింపే దశ**: చివరి నీటిపారుదల\n\nఏ దశలోనూ నీరు నిల్వ అవ్వకుండా చూడండి.',
  },
  mockConversations: [
    { title: 'ఖరీఫ్ సీజన్‌కు ఉత్తమ పంటలు', preview: 'ఈ సీజన్‌లో ఏ పంటలు వేయాలి?' },
    { title: 'పత్తిలో తెగులు నియంత్రణ', preview: 'పత్తిలో తెగులు సంక్రమణం ఎలా నిరోధించాలి?' },
    { title: 'గోధుమ నీటిపారుదల చిట్కాలు', preview: 'గోధుమకు ఉత్తమ నీటిపారుదల షెడ్యూల్?' },
  ],
};

const kn: Translations = {
  aiWelcome:
    'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆಗಳು, ಹವಾಮಾನ, ಮಣ್ಣು, ಕೀಟಗಳು ಅಥವಾ ಕೃಷಿ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.',
  aiSuggestions: [
    'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆಗಳನ್ನು ನೆಡಬೇಕು?',
    'ಹತ್ತಿಯಲ್ಲಿ ಕೀಟ ಸೋಂಕು ತಡೆಯುವುದು ಹೇಗೆ?',
    'ಗೋಧಿಗೆ ಅತ್ಯುತ್ತಮ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ?',
    'ಅಕ್ಕಿ ಬೆಳೆಯನ್ನು ಯಾವಾಗ ಕೊಯ್ಯಬೇಕು?',
    'ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ಸ್ವಾಭಾವಿಕವಾಗಿ ಹೇಗೆ ಹೆಚ್ಚಿಸುವುದು?',
    'ಟೊಮಾಟೊಗಳಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ ಉತ್ತಮ?',
  ],
  aiTopicCategories: EN_TOPIC_CATEGORIES,
  topicPickerHint: 'ಎಲ್ಲ topics — category ಆಯ್ಕೆ ಮಾಡಿ',
  chatPlaceholder: 'ಕೃಷಿ, ಬೆಳೆಗಳು, ಹವಾಮಾನ ಬಗ್ಗೆ ಕೇಳಿ...',
  chatListeningPlaceholder: 'ಕೇಳುತ್ತಿದೆ...',
  newChat: 'ಹೊಸ ಚಾಟ್',
  aiAssistantTitle: 'AI ಸಹಾಯಕ',
  aiAssistantSubtitle: 'ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಚರ',
  searchConversations: 'ಸಂಭಾಷಣೆಗಳನ್ನು ಹುಡುಕಿ...',
  noConversationsTitle: 'ಇನ್ನೂ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ',
  noConversationsDesc: 'ಬೆಳೆಗಳು, ಹವಾಮಾನ, ಕೀಟಗಳು ಮತ್ತು ಕೃಷಿ ಬಗ್ಗೆ AI ಗೆ ಕೇಳಿ',
  startNewChat: 'ಹೊಸ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ',
  statusListening: 'ಕೇಳುತ್ತಿದೆ...',
  statusThinking: 'ಯೋಚಿಸುತ್ತಿದೆ...',
  statusSpeaking: 'ಮಾತನಾಡುತ್ತಿದೆ...',
  voiceModeOn: 'ವಾಯ್ಸ್ ಮೋಡ್ ಆನ್ — ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮೈಕ್ ಒತ್ತಿ',
  voiceModeOff: 'ವಾಯ್ಸ್ ಮೋಡ್ ಆಫ್',
  voiceBarListening: 'ಕೇಳುತ್ತಿದೆ... ಈಗ ಮಾತನಾಡಿ',
  voiceBarThinking: 'Bhuvedam AI ಯೋಚಿಸುತ್ತಿದೆ...',
  voiceBarSpeaking: 'ಮಾತನಾಡುತ್ತಿದೆ...',
  typingIndicator: 'Bhuvedam AI ಯೋಚಿಸುತ್ತಿದೆ...',
  voiceInputTitle: 'ವಾಯ್ಸ್ ಟೈಪಿಂಗ್ ಲಭ್ಯವಿಲ್ಲ',
  voiceInputMessage:
    'ದಯವಿಟ್ಟು ಚಾಟ್ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.\n\nವಾಯ್ಸ್ ಮೋಡ್ ಆನ್ ಇದ್ದಾಗ Bhuvedam AI ಉತ್ತರಗಳನ್ನು ಮಾತನಾಡಿ ಹೇಳುತ್ತದೆ.',
  voiceInputOk: 'ಸರಿ',
  voiceInputLearnMore: 'ಸರಿ',
  aiError: 'AI ಉತ್ತರ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ',
  messageEdit: 'ಸಂಪಾದಿಸಿ',
  messageDelete: 'ಅಳಿಸಿ',
  messageActionsTitle: 'ಸಂದೇಶ',
  messageDeleteConfirmTitle: 'ಸಂದೇಶ ಅಳಿಸಬೇಕೇ?',
  messageDeleteConfirmUser: 'ಈ ಸಂದೇಶ ಮತ್ತು ಅದರ ನಂತರದ ಎಲ್ಲ ಉತ್ತರಗಳು ಅಳಿಸಲಾಗುತ್ತದೆ.',
  messageDeleteConfirmAssistant: 'ಈ ಉತ್ತರ ಅಳಿಸಲಾಗುತ್ತದೆ.',
  editingMessage: 'ಸಂದೇಶ ಸಂಪಾದಿಸಲಾಗುತ್ತಿದೆ',
  cancelEdit: 'ರದ್ದು',
  chatAttachImage: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್',
  chatImageDefaultPrompt:
    'Analyze this farm photo — identify crop, disease/pest/nutrient issue, and suggest practical solutions.',
  chatImageSessionNote: 'Photos stay in this chat only — not saved online.',
  mockResponses: {
    default:
      'ಪ್ರಸ್ತುತ ಕೃಷಿ ಉತ್ತಮ ಪದ್ಧತಿಗಳ ಆಧಾರದ ಮೇಲೆ, ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ನಿಯಮಿತವಾಗಿ ಗಮನಿಸಿ ಮತ್ತು ಬೆಳೆ ಬೆಳವಣಿಗೆಯ ಹಂತಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರಾವರಿ ಹೊಂದಿಸಿ. ನಿರ್ದಿಷ್ಟ ಬೆಳೆಗೆ ಸಲಹೆ ಬೇಕೇ?',
    crop:
      'ಮಹಾರಾಷ್ಟ್ರದಲ್ಲಿ ಈ ಋತುವಿಗೆ **ಗೋಧಿ**, **ಕಡಲೆ** ಮತ್ತು **ಸಾಸuve** ಅತ್ಯುತ್ತಮ ಆಯ್ಕೆಗಳು. ಮಣ್ಣಿನ pH 6.0-7.5 ನಡುವೆ ಇರಿಸಿ ಮತ್ತು ಸರಿಯಾದ ಜಲನಿಕಾಸದೊಂದಿಗೆ ಕ್ಷೇತ್ರ ಸಿದ್ಧಪಡಿಸಿ.',
    pest:
      'ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ (IPM) ಅತ್ಯಂತ ಪರಿಣಾಮಕಾರಿ:\n\n1. **ಗಮನ** — ವಾರದೊಮ್ಮೆ ಕ್ಷೇತ್ರ ಪರಿಶೀಲನೆ\n2. **ಫೆರೋಮೋನ್ ಟ್ರಾಪ್‌ಗಳು**\n3. **ಬೇವು ಆಧಾರಿತ** ಸಿಂಪಡಣೆ\n4. **ರಾಸಾಯನಿಕ pesticidಗಳು** ಅಗತ್ಯವಿದ್ದಾಗ ಮಾತ್ರ',
    irrigation:
      'ಗೋಧಿ ಬೆಳೆಗೆ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ:\n\n- **ಕ್ರೌನ್ ರೂಟ್**: ಮೊದಲ ನೀರಾವರಿ\n- **ಟಿಲ್ಲರಿಂಗ್**: ಎರಡನೇ ನೀರಾವರಿ\n- **ಹೂಬಿಡುವಿಕೆ**: ಮುಖ್ಯ ನೀರಾವರಿ\n- **ಧಾನ್ಯ ತುಂಬುವಿಕೆ**: ಕೊನೆಯ ನೀರಾವರಿ\n\nಯಾವುದೇ ಹಂತದಲ್ಲಿ ನೀರು ನಿಲ್ಲಿಸದಿರಲಿ.',
  },
  mockConversations: [
    { title: 'ಖರೀಫ್ ಋತುವಿಗೆ ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳು', preview: 'ಈ ಋತುವಿನಲ್ಲಿ ಯಾವ ಬೆಳೆಗಳನ್ನು ನೆಡಬೇಕು?' },
    { title: 'ಹತ್ತಿಯಲ್ಲಿ ಕೀಟ ನಿಯಂತ್ರಣ', preview: 'ಹತ್ತಿಯಲ್ಲಿ ಕೀಟ ಸೋಂಕು ತಡೆಯುವುದು ಹೇಗೆ?' },
    { title: 'ಗೋಧಿ ನೀರಾವರಿ ಸಲಹೆಗಳು', preview: 'ಗೋಧಿಗೆ ಅತ್ಯುತ್ತಮ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ?' },
  ],
};

export const translations: Record<LanguageCode, Translations> = {
  en,
  hi,
  mr,
  ta,
  te,
  kn,
};

export function getTranslations(language: LanguageCode = DEFAULT_LANGUAGE): Translations {
  const base = translations[language] ?? translations.en;
  return {
    ...base,
    aiTopicCategories: base.aiTopicCategories ?? EN_TOPIC_CATEGORIES,
    topicPickerHint: base.topicPickerHint ?? translations.en.topicPickerHint,
  };
}
