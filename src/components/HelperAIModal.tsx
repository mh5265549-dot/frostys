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
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<'both' | 'en' | 'ur'>('both');
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large'); // default to large for elders
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechLang, setSpeechLang] = useState<'ur-PK' | 'en-US'>('en-US');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Assalam-o-Alaikum & Welcome to Frosty's! 🍦 (8B Commercial, Green City, Lahore).\nI am your official assistant. You can type or tap the microphone button 🎙️ below to speak your question or order directly!",
      urduText: "السلام علیکم! فراسٹیز میں خوش آمدید۔ 🍦 (8 بی کمرشل، گرین سٹی، لاہور)۔\nمیں آپ کا مددگار اسسٹنٹ ہوں۔ آپ لکھ سکتے ہیں یا نیچے مائیک کا بٹن 🎙️ دبا کر بول کر بھی اپنا سوال پوچھ سکتے ہیں!",
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
  }, [isOpen, messages, isListening]);

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
        // Set language based on active preference
        const targetLang = language === 'ur' ? 'ur-PK' : speechLang;
        recognitionRef.current.lang = targetLang;
        recognitionRef.current.start();
      } catch (err) {
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
      en: 'How do I order a chocolate cone?',
      ur: 'چاکلیٹ کون کیسے آرڈر کریں؟',
      query: 'How do I order a chocolate cone?',
    },
    {
      en: 'Can I get cones delivered to my home?',
      ur: 'کیا میں گھر کے لیے کون منگوا سکتا ہوں؟',
      query: 'Can I get cones delivered to my home?',
    },
    {
      en: 'What is the difference in Banana Splits?',
      ur: 'بنانا اسپلٹ کی اقسام میں کیا فرق ہے؟',
      query: 'What is the difference between Simple and Deluxe Banana Split?',
    },
    {
      en: 'What are the 2 free toppings?',
      ur: '2 فری ٹاپنگز کونسی ہیں؟',
      query: 'What are the 2 free toppings?',
    },
    {
      en: 'Where is Frosty’s & store hours?',
      ur: 'دکان کا پتہ اور ٹائمنگ کیا ہے؟',
      query: 'Where is the shop located and what are opening hours?',
    },
    {
      en: 'How to file a complaint or review?',
      ur: 'شکایت یا فیڈ بیک کیسے دیں؟',
      query: 'How do I submit feedback or file a complaint?',
    },
  ];

  const getAIResponse = (query: string): { text: string; urduText?: string; action?: { label: string; action: () => void; icon?: string } } => {
    const q = query.toLowerCase();

    // 1. Cone Delivery Restriction Policy
    if (
      (q.includes('deliver') && (q.includes('cone') || q.includes('home') || q.includes('ghar') || q.includes('کون'))) ||
      q.includes('گھر') || q.includes('کون منگوا') || q.includes('home delivery for cone') || q.includes('cone delivery')
    ) {
      return {
        text: "⚠️ Important Store Policy — Cone Delivery Restriction:\n\nAll cone options (Waffle Cones, Vanilla Cones, and Chocolate Cones) are strictly available for DINE-IN or TAKE-AWAY only.\n\n• Why? Crispy wafer and waffle cones soften and melt easily during motorbike transit.\n• Can I order delivery? Yes! All our ice cream scoops, sundaes, shakes, and cold coffees are safely packed and delivered in insulated cups/bowls to your doorstep.\n• Visit Us: For fresh crispy cones, please visit our parlour at 8B Commercial, Green City, Lahore.",
        urduText: "⚠️ اہم دکانی پالیسی — کونز کی ہوم ڈیلیوری:\n\nتمام وافل کونز، ونیلا کونز اور چاکلیٹ کونز صرف ڈائن اِن (Dine-In) یا ٹیک اوے (Take-Away) کے لیے دستیاب ہیں۔\n\n• وجہ: راستے میں کون کے نرم پڑنے اور آئس کریم پگھلنے سے بچانے کے لیے گھر پر کونز نہیں بھیجی جاتیں۔\n• کیا ہوم ڈیلیوری ممکن ہے؟ جی ہاں! تمام آئس کریم اسکوپس، سنڈیز اور شیکس محفوظ پیکنگ والے کپ (Cups) میں گھر پر ڈیلیور کیے جاتے ہیں۔\n• تشریف لائیے: تازہ کرسپی کون کے لیے ہمارے پارلر (8 بی کمرشل، گرین سٹی، لاہور) تشریف لائیں۔",
        action: {
          label: 'View Cups & Scoops Menu',
          action: () => {
            if (onSelectCategory) onSelectCategory('ice-cream-scoops');
            onClose();
          },
          icon: 'fa-ice-cream',
        },
      };
    }

    // 2. Banana Split Variations
    if (q.includes('banana') || q.includes('split') || q.includes('بنانا') || q.includes('اسپلٹ')) {
      return {
        text: "🍌 Banana Split Variations at Frosty's:\n\n1. Simple Banana Split:\n• Includes 2 scoops of ice cream, fresh banana slices, and syrup.\n• Note: Does NOT include whipped cream or sprinkles.\n\n2. Deluxe Banana Split:\n• Includes 3 rich scoops of ice cream, fresh banana, rich whipped cream, colorful sprinkles, and specialty syrups.",
        urduText: "🍌 بنانا اسپلٹ کی اقسام:\n\n1. سمپل بنانا اسپلٹ (Simple):\n• اس میں 2 اسکوپ آئس کریم، تازہ کیلے کے سلائسز اور ساس شامل ہوتی ہے۔\n• نوٹ: اس میں وہپڈ کریم یا اسپرنکلز شامل نہیں ہوتے۔\n\n2. ڈیلکس بنانا اسپلٹ (Deluxe):\n• اس میں 3 بڑے اسکوپ آئس کریم، کیلا، وافر وہپڈ کریم، رنگ برنگے اسپرنکلز اور اسپیشل ساسز شامل ہوتی ہیں۔",
        action: {
          label: 'View Sundaes Section',
          action: () => {
            if (onSelectCategory) onSelectCategory('signature-sundaes');
            onClose();
          },
          icon: 'fa-bowl-rice',
        },
      };
    }

    // 3. Waffle Cone (Soft Serve)
    if (q.includes('waffle') || q.includes('soft serve') || q.includes('سافٹ سرو') || q.includes('وافل')) {
      return {
        text: "🍦 Waffle Cone (Soft Serve):\n\n• Freshly rolled golden crispy waffle cone with smooth vanilla soft serve and rich chocolate drizzle.\n• Includes 2 FREE toppings of your choice!\n• Price: Rs. 100 (Regular/Large)\n• Note: Available for Dine-In & Counter Take-Away only.",
        urduText: "🍦 وافل کون سافٹ سرو:\n\n• تازہ بنی کرسپی وافل کون، ونیلا سافٹ سرو آئس کریم اور چاکلیٹ ساس۔\n• اس میں 2 مفت ٹاپنگز شامل ہیں!\n• قیمت: 100 روپے (ریگولر/لارج)۔\n• نوٹ: صرف ڈائن اِن اور کاؤنٹر ٹیک اوے کے لیے دستیاب ہے۔",
      };
    }

    // 4. Vanilla / Chocolate Scoop / Cone Ordering Steps
    if (
      q.includes('chocolate') || q.includes('vanilla') || q.includes('cone') || q.includes('scoop') ||
      q.includes('order') || q.includes('چاکلیٹ') || q.includes('ونیلا') || q.includes('کون') || q.includes('آرڈر')
    ) {
      return {
        text: "How to order Vanilla or Chocolate Scoop / Cone:\n\n1. Locate the 'Vanilla Scoop / Cone' or 'Chocolate Scoop / Cone' (Rs. 150) on the main page.\n2. Choose your serving size: Single, Double, or Triple Scoop.\n3. Choose Cup or Crispy Wafer Cone *(Cones for Dine-In/Take-Away only)*.\n4. Pick your 2 FREE toppings (Chocolate fudge, crushed nuts, sprinkles, etc.).\n5. Tap 'Customize & Add' and confirm via WhatsApp!",
        urduText: "ونیلا یا چاکلیٹ اسکوپ / کون آرڈر کرنے کا طریقہ:\n\n1. مین پیج پر 'Vanilla Scoop / Cone' یا 'Chocolate Scoop / Cone' (150 روپے) منتخب کریں۔\n2. اسکوپ کا انتخاب کریں: سنگل، ڈبل یا ٹرپل اسکوپ۔\n3. کپ یا کرسپی کون منتخب کریں *(کونز صرف ڈائن اِن/ٹیک اوے کے لیے ہیں)*۔\n4. اپنی پسند کی 2 مفت ٹاپنگز چنیں۔\n5. 'Customize & Add' دبائیں اور واٹس ایپ پر آرڈر بھیجیں!",
        action: {
          label: 'Open Ice Cream Scoops',
          action: () => {
            if (onSelectCategory) onSelectCategory('ice-cream-scoops');
            onClose();
          },
          icon: 'fa-wand-magic-sparkles',
        },
      };
    }

    // 5. Frosty's Grill (Coming Soon)
    if (q.includes('grill') || q.includes('burger') || q.includes('bbq') || q.includes('taco') || q.includes('برگر') || q.includes('گرل')) {
      return {
        text: "🔥 Frosty's Grill (Coming Soon!):\n\nOur upcoming kitchen section features gourmet smash burgers, club sandwiches, Mexican tacos, and live BBQ skewers. It is currently in teaser preview mode, and ordering will be unlocked upon our official grand food launch!",
        urduText: "🔥 فراسٹیز گرل (جلد آ رہا ہے!):\n\nہمارے کچن کا نیا مینو جس میں برگرز، سینڈوچز، ٹیکوز اور باربی کیو شامل ہیں۔ فی الحال یہ ٹیزر موڈ میں ہے اور جلد ہی آرڈرز کے لیے لائیو ہو جائے گا!",
      };
    }

    // 6. Free Toppings
    if (q.includes('topping') || q.includes('free') || q.includes('ٹاپنگ') || q.includes('مفت')) {
      return {
        text: "🍨 2 Free Complimentary Toppings:\n\nEvery waffle cone and artisanal scoop comes with 2 free toppings of your choice at no extra charge:\n• Belgian Chocolate Drizzle\n• Rich Caramel Syrup\n• Crushed Roasted Almonds & Pistachios\n• Colorful Sprinkles & Choco Chips",
        urduText: "🍨 2 مفت ٹاپنگز کی سہولت:\n\nہر کون اور اسکوپ کے ساتھ آپ کو 2 مفت ٹاپنگز ملتی ہیں! آپ چاکلیٹ ساس، کیریمل ساس، بادام/پستے، یا کلر فل اسپرنکلز میں سے اپنی مرضی کے 2 انتخاب کر سکتے ہیں۔",
      };
    }

    // 7. Feedback & Complaint System
    if (q.includes('complaint') || q.includes('feedback') || q.includes('review') || q.includes('شکایت') || q.includes('رائے')) {
      return {
        text: "📝 Feedback & Complaint System:\n\n• Giving Feedback: Tap the floating 'Feedback & Review' button at the bottom of the screen or submit a rating right after checkout.\n• Filing a Complaint: Access the Complaint/Support button. Submitting an issue triggers an instant direct email notification to the Frosty's management team for immediate resolution!",
        urduText: "📝 رائے اور شکایت کا نظام:\n\n• فیڈ بیک دینا: اسکرین کے نیچے موجود 'Feedback & Review' بٹن پر کلک کریں یا آرڈر کے فوراً بعد ریٹنگ دیں۔\n• شکایت درج کروانا: کمپلینٹ سسٹم پر کلک کر کے اپنی شکایت لکھیں۔ یہ فوری طور پر فراسٹیز مینیجمنٹ ٹیم کو ای میل بھیج دیتا ہے تاکہ آپ کا مسئلہ ترجیحی بنیادوں پر حل کیا جا سکے۔",
      };
    }

    // 8. Location & Hours
    if (
      q.includes('location') || q.includes('address') || q.includes('hour') || q.includes('time') ||
      q.includes('where') || q.includes('open') || q.includes('پتہ') || q.includes('ٹائم') || q.includes('کہاں')
    ) {
      return {
        text: `📍 Frosty's Store Location & Hours:\n\n• Address: 8B Commercial, Green City, Lahore, Pakistan.\n• Hours: Daily 4:00 PM – 2:00 AM (Serving late-night cravings!)\n• Phone: ${STORE_INFO.phone}\n• WhatsApp: ${STORE_INFO.whatsapp}`,
        urduText: `📍 فراسٹیز کا پتہ اور اوقات:\n\n• پتہ: 8 بی کمرشل، گرین سٹی، لاہور۔\n• اوقات: روزانہ شام 4:00 بجے سے رات 2:00 بجے تک (لیٹ نائٹ کھلا رہتا ہے)۔\n• فون: ${STORE_INFO.phone}`,
        action: {
          label: 'Call Parlour Now',
          action: () => {
            if (onOpenCallModal) onOpenCallModal();
            onClose();
          },
          icon: 'fa-phone',
        },
      };
    }

    // 9. WhatsApp Ordering
    if (q.includes('whatsapp') || q.includes('واٹس') || q.includes('فون')) {
      return {
        text: "📱 Ordering on WhatsApp:\n\n1. Add your treats to your bag.\n2. Tap the floating bag button at the bottom of the screen.\n3. Enter your Name, Phone, and Delivery Address (or choose Dine-In / Takeaway).\n4. Click 'Confirm via WhatsApp' — your ready-to-send bill opens in WhatsApp instantly!",
        urduText: "📱 واٹس ایپ پر آرڈر کرنے کا طریقہ:\n\n1. اپنی پسندیدہ آئٹمز بیگ میں شامل کریں۔\n2. نیچے موجود بیگ پر کلک کریں۔\n3. اپنا نام، فون نمبر اور پتہ درج کریں۔\n4. 'Confirm via WhatsApp' دبائیں، مکمل بل واٹس ایپ پر کھل جائے گا!",
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

    // Default Precise Response
    return {
      text: "I am ready to assist you! You can ask me:\n• Step-by-step help to order scoops, cones, or sundaes\n• Store policy on Cone Deliveries (Dine-in/Take-away only)\n• Differences between Simple & Deluxe Banana Splits\n• How to submit feedback or complaints\n• Store hours & location at 8B Commercial, Green City, Lahore",
      urduText: "میں آپ کی مکمل مدد کے لیے حاضر ہوں! آپ مجھ سے ونیلا، چاکلیٹ یا سنڈیز کے آرڈر کا طریقہ، کون ڈیلیوری کی پالیسی، بنانا اسپلٹ کی اقسام، فیڈ بیک دینے یا دکان کے اوقات کے بارے میں باآسانی پوچھ سکتے ہیں۔",
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
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#1C120F] text-white rounded-3xl shadow-2xl border-2 border-[#FF4B72]/40 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2D1B18] via-[#3D2522] to-[#2D1B18] p-4 sm:p-5 border-b border-[#52332E] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white text-xl shadow-lg">
                  <i className="fa-solid fa-headset animate-pulse"></i>
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#2D1B18] shadow-sm"></span>
              </div>
              <div>
                <h3 className="font-heading font-black text-lg sm:text-xl text-white flex items-center gap-2">
                  Frosty's Helper AI
                  <span className="text-xs bg-[#FF4B72]/30 text-[#FF85A1] px-2 py-0.5 rounded-full font-bold border border-[#FF4B72]/40 flex items-center gap-1">
                    <i className="fa-solid fa-microphone text-[10px]"></i> Voice & Text
                  </span>
                </h3>
                <p className="text-xs text-amber-200/90 font-medium">
                  شاپ اسسٹنٹ • Bilingual Voice & Order Guide
                </p>
              </div>
            </div>

            {/* Accessibility & Close Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 border border-white/10 transition-colors"
                title="Toggle Text Size for Easy Reading"
              >
                {textSize === 'normal' ? '🔍 Bigger Text' : '🔍 Normal Text'}
              </button>

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  if (recognitionRef.current) recognitionRef.current.abort();
                  onClose();
                }}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#FF4B72] text-white flex items-center justify-center transition-colors text-lg"
                title="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* Quick Notice Banner with Language Controls */}
          <div className="bg-amber-400/10 border-b border-amber-400/20 px-4 py-2.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <i className="fa-solid fa-volume-high text-[#FF4B72]"></i>
              Tap 🎙️ to speak or 🔊 to listen to answers!
            </span>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setLanguage('both')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    language === 'both' ? 'bg-[#FF4B72] text-white' : 'text-stone-300'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setSpeechLang('en-US');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    language === 'en' ? 'bg-[#FF4B72] text-white' : 'text-stone-300'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => {
                    setLanguage('ur');
                    setSpeechLang('ur-PK');
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                    language === 'ur' ? 'bg-[#FF4B72] text-white' : 'text-stone-300'
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
              className="bg-gradient-to-r from-red-600/30 via-[#FF4B72]/30 to-red-600/30 border-b border-[#FF4B72]/50 px-4 py-3 text-white flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full bg-red-500 animate-ping absolute" />
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 relative" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-200">
                    Listening now... Speak your question or order!
                  </p>
                  <p className="text-[11px] text-stone-300">
                    {interimTranscript ? `"${interimTranscript}"` : 'سن رہے ہیں... اپنی بات بولئے'}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleListening}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Stop / روکیں
              </button>
            </motion.div>
          )}

          {/* Voice Error Notification */}
          {speechError && (
            <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <i className="fa-solid fa-triangle-exclamation text-amber-400"></i>
                {speechError}
              </span>
              <button
                onClick={() => setSpeechError(null)}
                className="text-stone-400 hover:text-white font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[84%] rounded-2xl p-4 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-[#FF4B72] text-white rounded-tr-none'
                      : 'bg-[#281814] border border-[#3E2620] text-amber-50 rounded-tl-none'
                  } ${textSize === 'large' ? 'text-base sm:text-lg' : 'text-sm'}`}
                >
                  {/* Read Aloud Audio Controls for AI responses */}
                  {msg.sender === 'ai' && (
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-white/10 text-xs">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                        <i className="fa-solid fa-headset text-[#FF4B72]"></i>
                        Frosty's Assistant
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => speakMessage(msg.id, msg.text, 'en')}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            speakingMessageId === msg.id
                              ? 'bg-[#FF4B72] text-white animate-pulse'
                              : 'bg-white/10 hover:bg-white/20 text-stone-200'
                          }`}
                          title="Listen in English"
                        >
                          <i className={`fa-solid ${speakingMessageId === msg.id ? 'fa-pause' : 'fa-volume-high'}`}></i>
                          <span>{speakingMessageId === msg.id ? 'Stop' : 'Listen Eng'}</span>
                        </button>

                        {msg.urduText && (
                          <button
                            onClick={() => speakMessage(msg.id, msg.urduText!, 'ur')}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="سنیں (اردو)"
                          >
                            <i className="fa-solid fa-volume-high"></i>
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
                      className={`whitespace-pre-line leading-loose text-amber-200 mt-3 pt-3 border-t border-white/10 font-sans text-right ${
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
                      className="mt-3.5 w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 to-[#FF4B72] hover:opacity-95 text-[#1C120F] font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="p-3 bg-[#160D0B] border-t border-[#3E2620] overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold shrink-0 flex items-center gap-1">
              <i className="fa-solid fa-lightbulb"></i>
              Quick Questions:
            </span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-[#281814] hover:bg-[#FF4B72] text-xs text-amber-100 hover:text-white border border-[#442A23] transition-all whitespace-nowrap shadow-sm"
              >
                {language === 'ur' ? q.ur : q.en}
              </button>
            ))}
          </div>

          {/* Input Bar with Prominent Voice Microphone Button */}
          <div className="p-3 sm:p-4 bg-[#231512] border-t border-[#3E2620] flex items-center gap-2">
            {/* Voice Input Microphone Button */}
            <button
              onClick={toggleListening}
              id="btn-voice-speech-input"
              type="button"
              className={`p-3.5 sm:px-4 sm:py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 text-sm shrink-0 border ${
                isListening
                  ? 'bg-red-500 text-white border-red-400 animate-pulse scale-105 ring-2 ring-red-400'
                  : 'bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] hover:opacity-95 text-white border-[#FF85A1]/40'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak your question / بول کر پوچھیں'}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines animate-bounce' : 'fa-microphone'} text-base`}></i>
              <span className="hidden md:inline font-bold">
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
                  : 'Type or tap 🎙️ to speak in English / اردو...'
              }
              className="flex-1 bg-[#160D0B] text-white placeholder-stone-400 px-4 py-3 rounded-2xl border border-[#442A23] focus:outline-none focus:border-[#FF4B72] text-sm sm:text-base"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-[#FF4B72] hover:bg-[#E63956] disabled:opacity-40 text-white font-bold transition-all shadow-lg flex items-center gap-2 text-sm sm:text-base shrink-0"
            >
              <span>Send</span>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
