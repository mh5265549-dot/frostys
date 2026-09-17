import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STORE_INFO } from '../data/menuData';

interface HelperAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onOpenOrderModal?: () => void;
  onOpenCallModal?: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  urduText?: string;
  timestamp: string;
  actionButton?: {
    label: string;
    action: () => void;
    icon?: string;
  };
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const HelperAIModal: React.FC<HelperAIModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenOrderModal,
  onOpenCallModal,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'both' | 'en' | 'ur'>('both');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large'); // default to large for easy reading
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechLang, setSpeechLang] = useState<'ur-PK' | 'en-US'>('en-US');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Reset minimization whenever modal is reopened
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Assalam-o-Alaikum & Welcome to Frosty's & Grill! 🍦🍔 (8B Commercial, Green City, Lahore).\nI am your bilingual ordering & customer support assistant. Ask me about our ice creams, grill items (Burgers, Sandwiches, Wraps, Fries Supreme), store policies, or tap the mic 🎙️ below to speak in English or Urdu!",
      urduText: "السلام علیکم! فراسٹیز اینڈ گرل میں خوش آمدید۔ 🍦🍔 (8 بی کمرشل، گرین سٹی، لاہور)۔\nمیں آپ کا آرڈرنگ اور کسٹمر سپورٹ اسسٹنٹ ہوں۔ آپ آئس کریمز، گرل مینو، ہوم ڈیلیوری پالیسی، یا کسی بھی بات کے متعلق پوچھ سکتے ہیں یا نیچے مائیک 🎙️ دبا کر بول سکتے ہیں!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalTranscript) {
          setInputText(finalTranscript);
          setInterimTranscript('');
          handleSend(finalTranscript);
          recognition.stop();
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser / مائیکروفون کی اجازت دیجئے۔');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Tap the mic and speak clearly / آواز سنائی نہیں دی، دوبارہ بولئے۔');
        } else {
          setSpeechError('Could not process speech. Please try again or type below.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 150);
    }
  }, [isOpen, messages, isListening, isTyping]);

  // Toggle Voice Recording
  const toggleListening = () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        const targetLang = language === 'ur' ? 'ur-PK' : speechLang;
        recognitionRef.current.lang = targetLang;
        recognitionRef.current.start();
      } catch {
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            // Already active
          }
        }, 200);
      }
    }
  };

  // Text to Speech (Speak Aloud)
  const speakMessage = useCallback((msgId: string, textToSpeak: string, langPref: 'en' | 'ur') => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/[*#_•\n]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (langPref === 'ur') {
      utterance.lang = 'ur-PK';
      utterance.rate = 0.9;
    } else {
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
    }

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  }, [speakingMessageId]);

  const quickQuestions = [
    {
      en: 'What is on Frosty’s Grill menu & prices?',
      ur: 'فراسٹیز گرل کا مینو اور قیمتیں کیا ہیں؟',
      query: "What is on Frosty's Grill menu and pricing?",
    },
    {
      en: 'Can I get cones delivered to my home?',
      ur: 'کیا گھر کے لیے کون ڈیلیور ہو سکتی ہے؟',
      query: 'Can I get cones delivered to my home?',
    },
    {
      en: 'How to switch between Grill & Ice Cream?',
      ur: 'گرل اور آئس کریم شاپ میں کیسے سوئچ کریں؟',
      query: 'How do I switch between Frosty Ice Cream and Grill shop?',
    },
    {
      en: 'What is the difference in Banana Splits?',
      ur: 'بنانا اسپلٹ کی اقسام میں کیا فرق ہے؟',
      query: 'What is the difference between Simple and Deluxe Banana Split?',
    },
    {
      en: 'Where is Frosty’s & store hours?',
      ur: 'دکان کا پتہ اور ٹائمنگ کیا ہے؟',
      query: 'Where is the shop located and what are opening hours?',
    },
    {
      en: 'How to order via WhatsApp?',
      ur: 'واٹس ایپ پر آرڈر کیسے کریں؟',
      query: 'How to order via WhatsApp?',
    },
  ];

  const getAIResponse = (query: string): { text: string; urduText?: string; action?: { label: string; action: () => void; icon?: string } } => {
    const q = query.toLowerCase();

    // 1. Cone Delivery Restriction Policy
    const isDeliveryQuery = q.includes('deliver') || q.includes('home') || q.includes('ghar') || q.includes('گھر') || q.includes('ڈیلیوری') || q.includes('پہنچا') || q.includes('bhej') || q.includes('mangwa');
    const isConeQuery = q.includes('cone') || q.includes('کون') || q.includes('waffle') || q.includes('وافل') || q.includes('soft serve');

    if (
      (isDeliveryQuery && isConeQuery) ||
      q.includes('cone delivery') ||
      q.includes('home delivery for cone') ||
      q.includes('can i get cone delivered') ||
      q.includes('can you deliver cone') ||
      q.includes('kya cone deliver') ||
      q.includes('ghar mangwa')
    ) {
      return {
        text: "⚠️ Store Delivery Policy — Cones are not available for delivery:\n\nCones are not available for delivery to prevent melting during transit. This applies to all cone options (Waffle Cones, Soft Serve, Vanilla, and Chocolate Cones).\n\n• Why? Cones melt rapidly during transport and cannot be safely sealed.\n• Cones are available for: Dine-In and Takeaway.\n• Safe Alternative: For home delivery, please choose our insulated Cups & Bowls!",
        urduText: "⚠️ لازمی پالیسی — کونز ڈیلیوری کے لیے دستیاب نہیں ہیں:\n\nکونز ہوم ڈیلیوری کے لیے دستیاب نہیں ہیں (وافل کون، ونیلا، یا چاکلیٹ کون) کیونکہ راستے میں پگھل جاتی ہیں۔\n\n• دستیابی: ڈائن اِن اور ٹیک اوے کے لیے دستیاب ہیں۔\n• ہوم ڈیلیوری کے لیے محفوظ کپ (Cup/Bowl) منتخب فرمائیں!",
        action: {
          label: 'Explore Cups & Scoops',
          action: () => {
            if (onSelectCategory) onSelectCategory('scoops');
            onClose();
          },
          icon: 'fa-ice-cream',
        },
      };
    }

    // 2. Shop Switcher
    if (q.includes('switch') || q.includes('seprate') || q.includes('separate') || q.includes('change shop') || q.includes('سوئچ') || q.includes('تبدیل')) {
      return {
        text: "🔄 How to Switch Between Frosty's & Frosty's Grill:\n\n• Top Navigation Bar: Use the toggle button in the top navbar anytime to flip between 'Frosty's Ice Cream' and 'Frosty's Grill'.\n• Transition: You will see a smooth brand transition screen with matching colors.\n• Cart is Shared: Items added from both shops stay in your cart so you can checkout burgers and sundaes together!",
        urduText: "🔄 فراسٹیز آئس کریم اور گرل میں سوئچ کرنے کا طریقہ:\n\n• اوپر نیویگیشن بار میں موجود ٹوگل بٹن کو دبائیں اور فوری طور پر دوسری شاپ پر شفٹ ہو جائیں۔\n• آپ کا کارٹ دونوں دکانوں کے لیے مشترک ہے — یعنی آپ برگر اور آئس کریم ایک ساتھ آرڈر کر سکتے ہیں!",
      };
    }

    // 3. Frosty's Grill Menu, Items & Combos
    if (
      q.includes('grill') || q.includes('burger') || q.includes('sandwich') || q.includes('wrap') ||
      q.includes('fries') || q.includes('supreme') || q.includes('combo') || q.includes('hotline') ||
      q.includes('charcoal') || q.includes('chipotle') || q.includes('louisiana') || q.includes('striped') ||
      q.includes('برگر') || q.includes('گرل') || q.includes('سینڈوچ') || q.includes('ریپ') || q.includes('فرائز')
    ) {
      if (q.includes('striped') || q.includes('louisiana') || (q.includes('wrap') && q.includes('chipotle'))) {
        return {
          text: "🌯 Striped Grill Chicken Wrap with Louisiana Chipotle Sauce:\n\n• Description: Charcoal-grilled juicy chicken wrapped in a toasted tortilla with crisp lettuce and Louisiana Chipotle sauce.\n• Delivery: Available for Home Delivery, Dine-In & Take-Away!\n• Price: Rs. 700\n• Make it a Combo: Add fries & a drink for +Rs. 300\n📞 Grill Delivery Hotline: 0325 4826051",
          urduText: "🌯 اسٹرائپڈ گرلڈ چکن ریپ بمعہ لوزیانا چپوٹلے ساس:\n\n• تفصیل: کوئلوں پر گرل شدہ جوسی چکن، خستہ سلاد پتہ اور لذیذ لوزیانا چپوٹلے ساس گرم ٹورٹیا میں۔\n• ڈیلیوری: ہوم ڈیلیوری، ڈائن اِن اور ٹیک اوے کے لیے دستیاب ہے!\n• قیمت: 700 روپے (کمبو: +300 روپے)\n📞 گرل ڈیلیوری ہاٹ لائن: 03254826051",
          action: {
            label: 'Call Grill Hotline',
            action: () => {
              window.open('tel:03254826051', '_self');
            },
            icon: 'fa-phone',
          },
        };
      }

      if (q.includes('sandwich') || q.includes('سینڈوچ')) {
        return {
          text: "🥪 Grilled Chicken Sandwich (Rs. 450):\n\n• Structure: Authentic triple-decker club style!\n  1. First golden toasted bread\n  2. Spiced tender grilled chicken\n  3. Middle toasted bread\n  4. Fresh sliced tomatoes, garden lettuce, cheese & house dressing\n  5. Third golden toasted bread\n• Make it a Combo: Add hot fries in our branded box + chilled drink for +Rs. 300\n📞 Grill Delivery Hotline: 0325 4826051",
          urduText: "🥪 گرلڈ چکن سینڈوچ (450 روپے):\n\n• ساخت: لذیذ ٹرپل ڈیکر کلب اسٹائل!\n  1. پہلی ٹوسٹڈ ڈبل روٹی\n  2. لذیذ میرینیٹڈ گرلڈ چکن\n  3. درمیانی ٹوسٹڈ ڈبل روٹی\n  4. تازہ ٹماٹر، سلاد پتہ، چیز اور ساس\n  5. اوپر تیسری ٹوسٹڈ ڈبل روٹی\n• کمبو بنائیں: فراسٹیز برانڈڈ باکس فرائز + مشروب +300 روپے میں\n📞 گرل ہاٹ لائن: 03254826051",
          action: {
            label: "Go to Frosty's Grill Menu 🔥",
            action: () => {
              if (onSelectCategory) onSelectCategory('fast-food-bbq');
              setIsMinimized(true);
            },
            icon: 'fa-fire-flame-curved',
          },
        };
      }

      if (q.includes('fries') || q.includes('فرائز')) {
        return {
          text: "🍟 Frosty's Crispy Fries:\n\n• Regular Fries (Rs. 250): Fresh golden shoestring fries served in Frosty's custom navy blue takeout meal box (0325 4826051).\n• Fries Supreme (Rs. 350): Melted cheese sauce, jalapeños, onions, tomatoes & chipotle sauce.\n• Grilled Chicken Fries Supreme (Rs. 500): Loaded with flame-grilled chicken chunks & melted cheese!\n• Make it a Combo: +Rs. 300 for fries & drink with any main.",
          urduText: "🍟 فراسٹیز فرائز مینو:\n\n• ریگولر فرائز (250 روپے): تازہ گرم فرائز فراسٹیز کے مخصوص نیوی بلیو باکس میں۔\n• فرائز سپریم (350 روپے): پگھلی ہوئی چیز ساس اور جاپالینو کے ساتھ۔\n• چکن فرائز سپریم (500 روپے): گرلڈ چکن کے ٹکڑوں سے بھرپور!",
        };
      }

      if (q.includes('charcoal') || q.includes('chicken burger')) {
        return {
          text: "🍔 Grilled Chicken Burger:\n\n• Description: Juicy, flame-grilled marinated chicken breast fillet with crisp lettuce, sliced tomatoes, melted cheddar & signature smoked sauce on a warm toasted sesame bun.\n• Delivery: Available for Home Delivery, Dine-In & Take-Away!\n• Price: Rs. 600\n• Combo: Add fries & drink for +Rs. 300\n📞 Grill Delivery Hotline: 0325 4826051",
          urduText: "🍔 گرلڈ چکن برگر:\n\n• تفصیل: لذیذ فلیم گرلڈ میرینیٹڈ چکن بریسٹ فلے، تازہ سلاد پتہ، ٹماٹر، چیز اور اسموکڈ ساس۔\n• ڈیلیوری: ہوم ڈیلیوری، ڈائن اِن اور ٹیک اوے کے لیے دستیاب ہے۔\n• قیمت: 600 روپے (کمبو: +300 روپے)\n📞 گرل ڈیلیوری ہاٹ لائن: 03254826051",
        };
      }

      return {
        text: "🔥 Frosty's Grill Menu & Pricing (WE DELIVER!):\n\n🍔 Mains & Burgers:\n• Grilled Chicken Burger (Rs. 600)\n• Grilled Chicken Sandwich (Rs. 450)\n• Grilled Chicken Wrap (Rs. 700)\n• Striped Grill Chicken Wrap with Louisiana Chipotle Sauce (Rs. 700)\n\n🍟 Fries Supreme:\n• Regular Fries (Rs. 250)\n• Fries Supreme (Rs. 350)\n• Grilled Chicken Fries Supreme (Rs. 500)\n\n✨ Combos & Extras:\n• Make it a Combo: Add Fries + Drink for +Rs. 300\n• Extra Cheese / Sauce: +Rs. 70\n📞 Grill Hotline: 0325 4826051",
        urduText: "🔥 فراسٹیز گرل مینو اور قیمتیں (ہوم ڈیلیوری دستیاب ہے!):\n\n🍔 برگرز اور ریپس:\n• گرلڈ چکن برگر (600 روپے)\n• گرلڈ چکن سینڈوچ (450 روپے)\n• گرلڈ چکن ریپ (700 روپے)\n• اسٹرائپڈ گرلڈ چکن ریپ بمعہ لوزیانا ساس (700 روپے)\n\n🍟 فرائز سپریم:\n• ریگولر فرائز (250 روپے) | فرائز سپریم (350 روپے) | چکن لوڈڈ سپریم (500 روپے)\n• کمبو بنائیں: فرائز + ڈرنک شامل کریں +300 روپے میں\n📞 گرل ہاٹ لائن: 03254826051",
        action: {
          label: "Go to Frosty's Grill Menu 🔥",
          action: () => {
            if (onSelectCategory) onSelectCategory('fast-food-bbq');
            setIsMinimized(true);
          },
          icon: 'fa-fire-flame-curved',
        },
      };
    }

    // 4. Banana Splits
    if (q.includes('banana') || q.includes('split') || q.includes('بنانا') || q.includes('اسپلٹ')) {
      return {
        text: "🍌 Banana Split Variations at Frosty's:\n\n1. Banana Split (Simple):\n• Ingredients: Chocolate Syrup & Sprinkles\n• Two Scoop: Rs. 300 | Three Scoop: Rs. 400\n• Classic split banana with ice cream scoops, chocolate syrup & sprinkles (no whipped cream or puree).\n\n2. Banana Split Deluxe:\n• Ingredients: Chocolate Syrup, Sprinkles, Whipped Cream, Strawberry/Mango Puree\n• Two Scoop: Rs. 450 | Three Scoop: Rs. 550\n• Extra Mango Chunks: +Rs. 50\n• Loaded with towering whipped cream, fruit puree ribbons, chocolate syrup & sprinkles!",
        urduText: "🍌 بنانا اسپلٹ کی اقسام:\n\n1. سمپل بنانا اسپلٹ:\n• اجزاء: چاکلیٹ سیرپ اور اسپرنکلز\n• 2 اسکوپ: 300 روپے | 3 اسکوپ: 400 روپے (وہپڈ کریم اور پیوری شامل نہیں)\n\n2. بنانا اسپلٹ ڈیلکس:\n• اجزاء: چاکلیٹ سیرپ، اسپرنکلز، وہپڈ کریم، اسٹرابیری/مینگو پیوری\n• 2 اسکوپ: 450 روپے | 3 اسکوپ: 550 روپے\n• ایکسٹرا مینگو چنکس: +50 روپے",
        action: {
          label: 'View Sundaes Section',
          action: () => {
            if (onSelectCategory) onSelectCategory('sundaes');
            onClose();
          },
          icon: 'fa-bowl-rice',
        },
      };
    }

    // 5. Waffle Cone
    if (q.includes('waffle') || q.includes('soft serve') || q.includes('سافٹ سرو') || q.includes('وافل')) {
      return {
        text: "🍦 Waffle Cone (Soft Serve):\n\n• Special (Rs. 150): Rich chocolate inside the cone & on top with 2 FREE toppings!\n• Regular (Rs. 100): Crispy rolled cone with smooth soft serve & 2 FREE toppings!\n• Delivery Rule: Cones are not available for delivery (cups can be delivered).",
        urduText: "🍦 وافل کون سافٹ سرو:\n\n• اسپیشل (150 روپے): کون کے اندر اور اوپر چاکلیٹ کے ساتھ 2 مفت ٹاپنگز!\n• ریگولر (100 روپے): تازہ کرسپی وافل کون اور آئس کریم 2 مفت ٹاپنگز کے ساتھ۔\n• ڈیلیوری اصول: کونز ہوم ڈیلیوری کے لیے دستیاب نہیں ہیں (کپ ڈیلیور ہو سکتے ہیں)۔",
      };
    }

    // 6. Free Toppings
    if (q.includes('topping') || q.includes('free') || q.includes('ٹاپنگ') || q.includes('مفت')) {
      return {
        text: "🍨 2 Free Complimentary Toppings:\n\nEvery waffle cone and fresh ice cream scoop comes with 2 free toppings of your choice:\n• Belgian Chocolate Drizzle\n• Rich Caramel Syrup\n• Crushed Roasted Almonds & Pistachios\n• Colorful Sprinkles & Choco Chips",
        urduText: "🍨 2 مفت ٹاپنگز کی سہولت:\n\nہر کون اور تازہ اسکوپ کے ساتھ آپ کو 2 مفت ٹاپنگز ملتی ہیں! چاکلیٹ ساس، کیریمل، بادام، پستے، یا اسپرنکلز میں سے 2 منتخب کریں۔",
      };
    }

    // 7. Location & Hours
    if (
      q.includes('location') || q.includes('address') || q.includes('hour') || q.includes('time') ||
      q.includes('where') || q.includes('open') || q.includes('پتہ') || q.includes('ٹائم') || q.includes('کہاں')
    ) {
      return {
        text: `📍 Frosty's & Grill Store Location & Hours:\n\n• Address: 8B Commercial, Green City, Lahore, Pakistan.\n• Hours: Daily 4:00 PM – 2:00 AM (Serving late night!)\n• Grill Delivery Hotline: 0325 4826051\n• WhatsApp: ${STORE_INFO.whatsapp}`,
        urduText: `📍 فراسٹیز اینڈ گرل کا پتہ اور اوقات:\n\n• پتہ: 8 بی کمرشل، گرین سٹی، لاہور، پاکستان۔\n• اوقات: روزانہ شام 4:00 بجے سے رات 2:00 بجے تک۔\n• گرل ہاٹ لائن: 03254826051`,
        action: {
          label: 'Call Store Now',
          action: () => {
            if (onOpenCallModal) onOpenCallModal();
            onClose();
          },
          icon: 'fa-phone',
        },
      };
    }

    // 8. Kulfi
    if (q.includes('kulfi') || q.includes('قلفی')) {
      return {
        text: "🍢 Authentic Creamy Kulfi on a Stick:\n\n• Small Kulfi: Rs. 50\n• Medium Kulfi: Rs. 70\n• Large Kulfi: Rs. 100\n• Traditional rich condensed milk kulfi infused with roasted pistachios and fragrant cardamom.",
        urduText: "🍢 روایتی کریمی قلفی کی تازہ ترین قیمتیں:\n\n• چھوٹی قلفی (Small): 50 روپے\n• درمیانی قلفی (Medium): 70 روپے\n• بڑی قلفی (Large): 100 روپے\n• پستے، زعفران اور گاڑھے دودھ سے تیار کردہ خالص روایتی قلفی۔",
        action: {
          label: 'View Kulfi in Menu',
          action: () => {
            if (onSelectCategory) onSelectCategory('kulfi');
            onClose();
          },
          icon: 'fa-candy-cane',
        },
      };
    }

    // 9. WhatsApp Ordering
    if (q.includes('whatsapp') || q.includes('order') || q.includes('آرڈر') || q.includes('واٹس')) {
      return {
        text: "📱 How to Order via Website & WhatsApp:\n\n1. Select your favorite Grill meals or Ice Cream desserts from the menu.\n2. Tap the floating Bag / Cart button.\n3. Choose your order type: Delivery, Takeaway, or Dine-In.\n4. Click 'Confirm via WhatsApp' — your receipt opens ready to send in WhatsApp!\n• Grill hotline for fast phone orders: 0325 4826051.",
        urduText: "📱 واٹس ایپ پر آرڈر کرنے کا طریقہ:\n\n1. مینو سے اپنے پسندیدہ آئٹمز منتخب کریں۔\n2. نیچے موجود بیگ پر کلک کریں۔\n3. ہوم ڈیلیوری، ٹیک اوے، یا ڈائن اِن منتخب کریں۔\n4. 'Confirm via WhatsApp' دبائیں، آرڈر فوری روانہ ہو جائے گا!",
        action: {
          label: 'View Cart / Bag',
          action: () => {
            if (onOpenOrderModal) onOpenOrderModal();
            onClose();
          },
          icon: 'fa-bag-shopping',
        },
      };
    }

    // Default
    return {
      text: "I am right here to help you! You can ask me about:\n• Frosty's Grill Menu: Burgers (Rs. 600), Sandwiches (Rs. 450), Wraps (Rs. 700), Fries Supreme & Combos\n• Delivery Policy: Cones are not available for delivery (Cups deliverable)\n• Banana Splits: Simple (Rs. 300) vs Deluxe (Rs. 450)\n• Switching between Ice Cream and Grill\n• Store Location (8B Commercial, Green City, Lahore) & Grill Hotline (0325 4826051)",
      urduText: "میں آپ کی مکمل مدد کے لیے حاضر ہوں! آپ مجھ سے فراسٹیز گرل کے برگرز، سینڈوچز، ریپس اور فرائز کی قیمتیں، کونز کی ہوم ڈیلیوری پالیسی، بنانا اسپلٹ کی اقسام، شاپ سوئچ کرنے کا طریقہ، یا گرل ہاٹ لائن (03254826051) کے بارے میں کچھ بھی پوچھ سکتے ہیں۔",
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSpeechError(null);
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(query);
      const aiMessage: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.text,
        urduText: response.urduText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: response.action,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 500);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <aside aria-label="Minimized AI Assistant" className="fixed bottom-20 sm:bottom-6 right-4 z-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="bg-white text-stone-900 px-3.5 py-2 rounded-2xl shadow-xl border border-stone-200 flex items-center gap-3 cursor-pointer hover:bg-stone-50 transition-colors"
          onClick={() => setIsMinimized(false)}
          title="Click to expand Helper AI"
        >
        <div className="w-8 h-8 rounded-xl bg-[#FF4B72] flex items-center justify-center text-white text-sm shadow-xs">
          <i className="fa-solid fa-headset"></i>
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <span>Helper AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-[10px] text-stone-500">Tap to expand (اردو / Eng)</div>
        </div>
        <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 text-xs cursor-pointer"
            title="Expand Helper AI"
          >
            <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              if (recognitionRef.current) recognitionRef.current.abort();
              setIsMinimized(false);
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 text-xs cursor-pointer"
            title="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </motion.div>
      </aside>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-white p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white text-lg shadow-xs">
                  <i className="fa-solid fa-headset"></i>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs"></span>
              </div>
              <div>
                <h3 className="font-heading font-black text-base sm:text-lg text-stone-900 flex items-center gap-2">
                  Frosty's AI Support
                  <span className="text-[10px] bg-pink-50 text-[#FF4B72] px-2 py-0.5 rounded-full font-bold border border-pink-200 flex items-center gap-1">
                    <i className="fa-solid fa-microphone text-[9px]"></i> Voice & Text
                  </span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  شاپ اسسٹنٹ • Bilingual Order & Store Guide (English / اردو)
                </p>
              </div>
            </div>

            {/* Accessibility, Minimize & Close Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                title="Toggle Text Size for Easy Reading"
              >
                {textSize === 'normal' ? '🔍 Bigger' : '🔍 Normal'}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors text-sm cursor-pointer"
                title="Minimize Helper AI"
              >
                <i className="fa-solid fa-minus"></i>
              </button>

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  if (recognitionRef.current) recognitionRef.current.abort();
                  setIsMinimized(false);
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-rose-100 hover:text-rose-600 text-stone-700 flex items-center justify-center transition-colors text-base cursor-pointer"
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Quick Notice Banner with Language Controls */}
          <div className="bg-stone-50 border-b border-stone-200 px-4 py-2 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <i className="fa-solid fa-volume-high text-[#FF4B72]"></i>
              Tap 🎙️ to speak or 🔊 to listen to answers!
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">Language:</span>
              <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-stone-200 shadow-2xs">
                <button
                  onClick={() => setLanguage('both')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'both' ? 'bg-[#FF4B72] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setSpeechLang('en-US');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'en' ? 'bg-[#FF4B72] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('ur');
                    setSpeechLang('ur-PK');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    language === 'ur' ? 'bg-[#FF4B72] text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  اردو
                </button>
              </div>
            </div>
          </div>

          {/* Active Voice Listening Banner */}
          {isListening && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-200 px-4 py-3 text-stone-900 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-red-600 relative" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-stone-900">
                    Listening now... Speak your question!
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {interimTranscript ? `"${interimTranscript}"` : 'سن رہے ہیں... اپنی بات بولئے'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleListening}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Stop / روکیں
              </button>
            </motion.div>
          )}

          {/* Voice Error Notification */}
          {speechError && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
                {speechError}
              </span>
              <button
                onClick={() => setSpeechError(null)}
                className="text-stone-400 hover:text-stone-700 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#FF4B72] text-white rounded-tr-none'
                      : 'bg-white border border-stone-200 text-stone-900 rounded-tl-none'
                  } ${textSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}
                >
                  {/* Read Aloud Audio Controls for AI responses */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-100 text-xs">
                      <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                        <i className="fa-solid fa-wand-magic-sparkles text-[#FF4B72]"></i>
                        Frosty's Assistant
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakMessage(msg.id, msg.text, 'en')}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            speakingMessageId === msg.id
                              ? 'bg-[#FF4B72] text-white animate-pulse'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                          title="Listen in English"
                        >
                          <i className={`fa-solid ${speakingMessageId === msg.id ? 'fa-pause' : 'fa-volume-high'}`}></i>
                          <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen Eng'}</span>
                        </button>

                        {msg.urduText && (
                          <button
                            onClick={() => speakMessage(msg.id, msg.urduText!, 'ur')}
                            className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="سنیں (اردو)"
                          >
                            <i className="fa-solid fa-volume-high text-emerald-600"></i>
                            <span>اردو میں سنیں</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* English Section */}
                  {(language === 'both' || language === 'en' || msg.sender === 'user') && (
                    <div className="whitespace-pre-line leading-relaxed font-sans">
                      {msg.text}
                    </div>
                  )}

                  {/* Urdu Section */}
                  {msg.urduText && (language === 'both' || language === 'ur') && (
                    <div
                      className={`whitespace-pre-line leading-loose text-stone-800 mt-2.5 pt-2.5 border-t border-stone-100 font-sans text-right ${
                        textSize === 'large' ? 'text-base sm:text-lg' : 'text-sm'
                      }`}
                      dir="rtl"
                    >
                      {msg.urduText}
                    </div>
                  )}

                  {/* Action Shortcut Button */}
                  {msg.actionButton && (
                    <button
                      onClick={msg.actionButton.action}
                      className="mt-3 w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                    >
                      {msg.actionButton.icon && (
                        <i className={`fa-solid ${msg.actionButton.icon}`}></i>
                      )}
                      <span>{msg.actionButton.label}</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex flex-col items-start"
              >
                <div className="bg-white border border-stone-200 text-stone-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-2xs flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-pink-100 text-[#FF4B72] flex items-center justify-center text-[10px]">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <span className="text-xs font-semibold text-stone-600 mr-1">
                    {language === 'ur' ? 'اسسٹنٹ جواب تیار کر رہا ہے' : "Frosty's Assistant is typing"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B72] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-[11px] text-stone-500 font-bold shrink-0 flex items-center gap-1">
              <i className="fa-solid fa-lightbulb text-amber-500"></i>
              Quick:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-pink-50 text-xs text-stone-700 hover:text-[#FF4B72] border border-stone-200 hover:border-pink-200 transition-all whitespace-nowrap shadow-2xs cursor-pointer"
              >
                {language === 'ur' ? q.ur : q.en}
              </button>
            ))}
          </div>

          {/* Input Bar with Voice Microphone Button */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
            <button
              onClick={toggleListening}
              id="btn-voice-speech-input"
              type="button"
              className={`p-3 sm:px-4 sm:py-3 rounded-2xl font-bold transition-all shadow-2xs flex items-center gap-2 text-xs shrink-0 cursor-pointer border ${
                isListening
                  ? 'bg-red-600 text-white border-red-500 animate-pulse scale-105'
                  : 'bg-stone-100 hover:bg-pink-50 text-stone-700 hover:text-[#FF4B72] border-stone-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak your question / بول کر پوچھیں'}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines animate-bounce' : 'fa-microphone'} text-sm text-[#FF4B72]`}></i>
              <span className="hidden sm:inline font-bold">
                {isListening ? 'Listening...' : 'Speak'}
              </span>
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Type or speak in English / اردو...'
              }
              className="flex-1 bg-stone-50 text-stone-900 placeholder-stone-400 px-3.5 py-2.5 sm:py-3 rounded-2xl border border-stone-200 focus:outline-none focus:border-[#FF4B72] focus:bg-white text-xs sm:text-sm"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#FF4B72] hover:bg-[#E63956] disabled:opacity-40 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 text-xs sm:text-sm shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
