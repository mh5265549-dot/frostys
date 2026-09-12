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
  const [textSize, setTextSize] = useState<'normal' | 'large'>('large'); // default to large for elders
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
      text: "Assalam-o-Alaikum & Welcome to Frosty's & Grill! 🍦🍔 (8B Commercial, Green City, Lahore).\nI am your official ordering & customer support assistant. You can ask about our ice creams, full Grill menu (Burgers, Sandwiches, Wraps, Fries Supreme), store policies, or tap the mic 🎙️ below to speak!",
      urduText: "السلام علیکم! فراسٹیز اینڈ گرل میں خوش آمدید۔ 🍦🍔 (8 بی کمرشل، گرین سٹی، لاہور)۔\nمیں آپ کا آفیشل کسٹمر سپورٹ اور آرڈرنگ اسسٹنٹ ہوں۔ آپ آئس کریمز، فراسٹیز گرل کے کھانوں، دکانی پالیسیوں کے بارے میں پوچھ سکتے ہیں یا نیچے مائیک 🎙️ دبا کر بول کر بھی سوال کر سکتے ہیں!",
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
      en: 'What is on Frosty’s Grill menu & prices?',
      ur: 'فراسٹیز گرل کے مینو اور قیمتیں کیا ہیں؟',
      query: "What is on Frosty's Grill menu and pricing?",
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
      en: 'How to order Grilled Chicken Burger combo?',
      ur: 'گرلڈ چکن برگر کمبو کیسے آرڈر کریں؟',
      query: 'Tell me about the Grilled Chicken Burger and combos',
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

    // 1. Cone Delivery Restriction Policy (Strict enforcement for all cone types: Waffle, Vanilla, Chocolate, Soft Serve, etc.)
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
        text: "⚠️ Strict Store Policy — No Cones for Home Delivery:\n\nCones are NOT allowed for home delivery under any circumstances. This applies to every single cone option on our menu, including Waffle Cones (soft serve), Vanilla Cones, and Chocolate Cones.\n\n• Why? Cones melt far too quickly and cannot be securely packed or sealed for transit by our delivery staff.\n• Availability: All cone types are strictly restricted to DINE-IN and TAKE-AWAY only.\n• Recommended Alternative: If you want home delivery, please select your ice cream in our insulated CUP / BOWL options instead!",
        urduText: "⚠️ لازمی دکانی پالیسی — کونز کی ہوم ڈیلیوری ممنوع ہے:\n\nہوم ڈیلیوری پر کسی بھی قسم کی کون (چاہے وافل کون سافٹ سرو ہو، ونیلا کون ہو، یا چاکلیٹ کون) بھیجنے کی قطعی اجازت نہیں ہے۔\n\n• وجہ: کونز راستے میں بہت تیزی سے پگھل جاتی ہیں اور انہیں سفر کے دوران محفوظ طریقے سے پیک یا سیل نہیں کیا جا سکتا۔\n• دستیابی: تمام کونز صرف ڈائن اِن (Dine-In) یا ٹیک اوے (Take-Away) کے لیے مخصوص ہیں۔\n• متبادل تجویز: اگر آپ ہوم ڈیلیوری چاہتے ہیں تو براہِ کرم آئس کریم کو محفوظ کپ (Cup) یا باؤل کے آپشن میں آرڈر فرمائیں!",
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

    // 2. Frosty's Grill Menu, Items, Combos & Hotline (NOW OPEN - WE DELIVER)
    if (
      q.includes('grill') || q.includes('burger') || q.includes('sandwich') || q.includes('wrap') ||
      q.includes('fries') || q.includes('supreme') || q.includes('combo') || q.includes('hotline') ||
      q.includes('charcoal') || q.includes('chipotle') || q.includes('louisiana') || q.includes('striped') ||
      q.includes('برگر') || q.includes('گرل') || q.includes('سینڈوچ') || q.includes('ریپ') || q.includes('فرائز') ||
      q.includes('600') || q.includes('450') || q.includes('700') || q.includes('350') || q.includes('250')
    ) {
      // Check for specific items like Striped Grill Chicken Wrap or Charcoal Grill Burger
      if (q.includes('striped') || q.includes('louisiana') || (q.includes('wrap') && q.includes('chipotle'))) {
        return {
          text: "🌯 Striped Grill Chicken Wrap with Louisiana Chipotle Sauce:\n\n• Description: Charcoal-grilled juicy chicken wrapped in a toasted tortilla with crisp lettuce and flavorful Louisiana Chipotle sauce.\n• Delivery: Available for Home Delivery, Dine-In & Take-Away!\n• Price: Rs. 700\n• Make it a Combo: Add fries & a drink for +Rs. 300\n📞 Grill Delivery Hotline: 0325 4826051",
          urduText: "🌯 اسٹرائپڈ گرلڈ چکن ریپ بمعہ لوزیانا چپوٹلے ساس:\n\n• تفصیل: کوئلوں پر گرل کیا ہوا جوسی چکن، خستہ سلاد پتہ اور لذیذ لوزیانا چپوٹلے ساس جسے گرم ٹورٹیا روٹی میں رول کیا گیا ہے۔\n• ڈیلیوری: ہوم ڈیلیوری، ڈائن اِن اور ٹیک اوے کے لیے دستیاب ہے!\n• قیمت: 700 روپے\n• کمبو بنائیں: فرائز اور ڈرنک شامل کریں +300 روپے میں\n📞 گرل ڈیلیوری ہاٹ لائن: 03254826051",
          action: {
            label: 'Call Grill Hotline',
            action: () => {
              window.open('tel:03254826051', '_self');
            },
            icon: 'fa-phone',
          },
        };
      }

      if (q.includes('charcoal')) {
        return {
          text: "🍔 Charcoal Grill Burger:\n\n• Description: Double charcoal-grilled juicy patties loaded with special pickles, fresh onions, ripe tomatoes, and signature smoked sauce.\n• Delivery: Available for Home Delivery, Dine-In & Take-Away!\n• Make it a Combo: Add fries & a drink for +Rs. 300\n📞 Grill Delivery Hotline: 0325 4826051",
          urduText: "🍔 چارکول گرل برگر (Charcoal Grill Burger):\n\n• تفصیل: کوئلوں پر تیار شدہ ڈبل جوسی پیٹیز، اسپیشل اچار، تازہ پیاز، سرخ ٹماٹر اور سگنیچر اسموکڈ ساس سے بھرپور۔\n• ڈیلیوری: ہوم ڈیلیوری، ڈائن اِن اور ٹیک اوے پر دستیاب ہے۔\n• کمبو بنائیں: فرائز اور ڈرنک شامل کریں +300 روپے میں\n📞 گرل ڈیلیوری ہاٹ لائن: 03254826051",
          action: {
            label: 'Call Grill Hotline',
            action: () => {
              window.open('tel:03254826051', '_self');
            },
            icon: 'fa-phone',
          },
        };
      }

      return {
        text: "🔥 Frosty's Grill Menu & Pricing (NOW OPEN — WE DELIVER!):\n\n🍔 Mains & Burgers:\n• Grilled Chicken Burger (Rs. 600): Grilled chicken, fresh lettuce, tomatoes, onions, pickles & signature sauce.\n• Charcoal Grill Burger: Double charcoal-grilled juicy patties loaded with special pickles, onions, tomatoes & signature smoked sauce.\n• Grilled Chicken Sandwich (Rs. 450): Grilled chicken, lettuce, tomatoes, onions, fries & signature sauce.\n• Grilled Chicken Wrap (Rs. 700): Grilled chicken, lettuce, tomatoes, onions, fries, pickles, olives & signature sauce.\n• Striped Grill Chicken Wrap with Louisiana Chipotle Sauce: Charcoal-grilled juicy chicken in a toasted tortilla with crisp lettuce & Louisiana Chipotle sauce.\n\n🍟 Fries & Loaded Specialties:\n• Regular Fries (Rs. 250): Hot & crispy golden fries.\n• Fries Supreme (Rs. 350): Topped with onions, tomatoes & chipotle sauce.\n• Grilled Chicken Fries Supreme (Rs. 500): Loaded with grilled chicken, onions, tomatoes & chipotle sauce.\n\n✨ Add-ons & Combos:\n• Cheese Add-on: +Rs. 70 | Extra Sauce: +Rs. 70\n• Make it a Combo: Add Fries + Drink for +Rs. 300 (or add a Drink to fries for +Rs. 60).\n\n📞 Grill Delivery Hotline: 0325 4826051 (or order directly via WhatsApp).",
        urduText: "🔥 فراسٹیز گرل مینو اور قیمتیں (کھلا ہے — ہوم ڈیلیوری دستیاب ہے!):\n\n🍔 خاص گرل آئٹمز:\n• گرلڈ چکن برگر (600 روپے): گرلڈ چکن، سلاد پتہ، ٹماٹر، پیاز، اچار اور سگنیچر ساس۔\n• چارکول گرل برگر: کوئلوں پر گرل شدہ ڈبل جوسی پیٹیز، اسپیشل اچار، پیاز، ٹماٹر اور اسموکڈ ساس۔\n• گرلڈ چکن سینڈوچ (450 روپے): گرلڈ چکن، سلاد پتہ، ٹماٹر، پیاز، فرائز اور سگنیچر ساس۔\n• گرلڈ چکن ریپ (700 روپے): گرلڈ چکن، سلاد پتہ، ٹماٹر، پیاز، فرائز، زیتون، اچار اور ساس۔\n• اسٹرائپڈ گرلڈ چکن ریپ بمعہ لوزیانا چپوٹلے ساس: کوئلوں پر گرل شدہ جوسی چکن، خستہ سلاد اور لوزیانا چپوٹلے ساس۔\n\n🍟 فرائز:\n• ریگولر فرائز (250 روپے): تازہ گرم کرسپی فرائز۔\n• فرائز سپریم (350 روپے): پیاز، ٹماٹر اور چپوٹلے ساس کے ساتھ۔\n• گرلڈ چکن فرائز سپریم (500 روپے): گرلڈ چکن، پیاز، ٹماٹر اور چپوٹلے ساس سے لوڈڈ۔\n\n✨ ایڈ آنز اور کمبوز:\n• ایکسٹرا چیز: 70 روپے | ایکسٹرا ساس: 70 روپے\n• کمبو بنائیں: برگر/سینڈوچ کے ساتھ فرائز اور ڈرنک شامل کریں صرف +300 روپے میں (یا فرائز کے ساتھ ڈرنک +60 روپے)۔\n\n📞 گرل ڈیلیوری ہاٹ لائن: 03254826051",
        action: {
          label: "Go to Frosty's Grill Section 🔥",
          action: () => {
            if (onSelectCategory) onSelectCategory('fast-food-bbq');
            setIsMinimized(true);
          },
          icon: 'fa-fire-flame-curved',
        },
      };
    }

    // 3. Banana Split Variations
    if (q.includes('banana') || q.includes('split') || q.includes('بنانا') || q.includes('اسپلٹ')) {
      return {
        text: "🍌 Banana Split Variations at Frosty's:\n\n1. Simple Banana Split (Rs. 350):\n• Features only 2 scoops of ice cream, fresh banana slices, and dessert syrup.\n• Note: Does NOT include whipped cream or sprinkles.\n\n2. Deluxe Banana Split (Rs. 450):\n• Features 3 rich scoops of ice cream, fresh banana slices, rich whipped cream, colorful sprinkles, and specialty toppings & syrups.",
        urduText: "🍌 بنانا اسپلٹ کی اقسام اور قیمتیں:\n\n1. سمپل بنانا اسپلٹ (Simple - 350 روپے):\n• اس میں صرف 2 اسکوپ آئس کریم، تازہ کیلے کے سلائسز اور میٹھی ساس شامل ہوتی ہے۔\n• نوٹ: اس میں وہپڈ کریم یا اسپرنکلز شامل نہیں ہوتے۔\n\n2. ڈیلکس بنانا اسپلٹ (Deluxe - 450 روپے):\n• اس میں 3 بڑے اسکوپ آئس کریم، تازہ کیلا، وافر وہپڈ کریم، رنگ برنگے اسپرنکلز اور اسپیشل ساسز شامل ہوتی ہیں۔",
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

    // 4. Waffle Cone (Soft Serve)
    if (q.includes('waffle') || q.includes('soft serve') || q.includes('سافٹ سرو') || q.includes('وافل')) {
      return {
        text: "🍦 Waffle Cone (Soft Serve):\n\n• Price: Rs. 100\n• Features: Crispy golden freshly rolled waffle cone with smooth vanilla soft serve ice cream, chocolate drizzle, and 2 FREE toppings!\n• Delivery Policy: Cones are strictly for Dine-In & Take-Away only (No cones for home delivery to prevent melting. Insulated cups are 100% deliverable!).",
        urduText: "🍦 وافل کون سافٹ سرو:\n\n• قیمت: 100 روپے\n• خصوصیات: تازہ کرسپی وافل کون، اسموتھ ونیلا سافٹ سرو آئس کریم، چاکلیٹ ڈرزل اور 2 مفت ٹاپنگز!\n• ڈیلیوری پالیسی: کونز صرف ڈائن اِن اور ٹیک اوے کے لیے ہیں (ہوم ڈیلیوری پر کون نہیں بھیجی جاتی تاکہ پگھل نہ جائے، کپ ڈیلیور ہو سکتے ہیں)۔",
        action: {
          label: 'Order Waffle Cone (Soft Serve)',
          action: () => {
            if (onSelectCategory) onSelectCategory('scoops');
            onClose();
          },
          icon: 'fa-ice-cream',
        },
      };
    }

    // 5. Vanilla / Chocolate Scoop / Cone Ordering Steps
    if (
      q.includes('chocolate') || q.includes('vanilla') || q.includes('cone') || q.includes('scoop') ||
      q.includes('چاکلیٹ') || q.includes('ونیلا') || q.includes('کون')
    ) {
      return {
        text: "🍨 Vanilla & Chocolate Scoops / Cones (Rs. 150):\n\n• Vanilla Scoop / Cone (Rs. 150): Classic smooth vanilla ice cream served in a wafer cone or branded blue cup with 2 FREE toppings.\n• Chocolate Scoop / Cone (Rs. 150): Rich Dutch cocoa dark chocolate ice cream served in a wafer cone or branded blue cup with 2 FREE toppings.\n• Sizes: Single (Rs. 150), Double (Rs. 280), or Triple Scoop (Rs. 400).\n• Policy Note: Cones are Dine-in & Take-away only. Cups are available for delivery.",
        urduText: "🍨 ونیلا اور چاکلیٹ اسکوپ / کون (150 روپے):\n\n• ونیلا اسکوپ / کون (150 روپے): کلاسک اسموتھ ونیلا آئس کریم ویفر کون یا برانڈڈ نیلے کپ میں 2 مفت ٹاپنگز کے ساتھ۔\n• چاکلیٹ اسکوپ / کون (150 روپے): ڈچ کوکو ڈارک چاکلیٹ آئس کریم ویفر کون یا کپ میں 2 مفت ٹاپنگز کے ساتھ۔\n• سائزز: سنگل، ڈبل، یا ٹرپل اسکوپ۔\n• اہم نوٹ: کونز صرف ڈائن اِن اور ٹیک اوے کے لیے ہیں، ہوم ڈیلیوری کے لیے کپ کا انتخاب فرمائیں۔",
        action: {
          label: 'Open Ice Cream Scoops',
          action: () => {
            if (onSelectCategory) onSelectCategory('scoops');
            onClose();
          },
          icon: 'fa-wand-magic-sparkles',
        },
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
        text: "📝 Feedback & Complaint System:\n\n• Filing a Complaint: You can submit a complaint directly through the website's support/complaint system. Every submission triggers an instant direct alert email to Frosty's management team for immediate investigation and fast resolution!\n• Giving Feedback: Tap the floating 'Feedback & Review' button at the bottom of the screen or submit a rating right after placing an order.",
        urduText: "📝 فیڈ بیک اور شکایت درج کرنے کا طریقہ:\n\n• شکایت درج کروانا: آپ ویب سائٹ کے سپورٹ / کمپلینٹ سیکشن سے فوری شکایت درج کر سکتے ہیں۔ شکایت درج ہوتے ہی مینیجمنٹ ٹیم کو فوری الرٹ ای میل جاتی ہے تاکہ آپ کا مسئلہ فوری حل کیا جا سکے!\n• فیڈ بیک دینا: نیچے موجود 'Feedback & Review' بٹن پر کلک کر کے یا آرڈر کے بعد اپنی ریٹنگ اور تاثرات شیئر کر سکتے ہیں۔",
      };
    }

    // 8. Location & Hours
    if (
      q.includes('location') || q.includes('address') || q.includes('hour') || q.includes('time') ||
      q.includes('where') || q.includes('open') || q.includes('پتہ') || q.includes('ٹائم') || q.includes('کہاں')
    ) {
      return {
        text: `📍 Frosty's & Grill Store Location & Hours:\n\n• Address: 8B Commercial, Green City, Lahore, Pakistan.\n• Hours: Daily 4:00 PM – 2:00 AM (Serving late-night desserts & hot grill meals!)\n• Grill Delivery Hotline: 0325 4826051\n• WhatsApp: ${STORE_INFO.whatsapp}`,
        urduText: `📍 فراسٹیز اینڈ گرل کا پتہ اور اوقات:\n\n• پتہ: 8 بی کمرشل، گرین سٹی، لاہور، پاکستان۔\n• اوقات: روزانہ شام 4:00 بجے سے رات 2:00 بجے تک (لیٹ نائٹ کھلا رہتا ہے)۔\n• گرل ڈیلیوری ہاٹ لائن: 03254826051`,
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

    // 9. WhatsApp Ordering & Checkout
    if (q.includes('whatsapp') || q.includes('order') || q.includes('آرڈر') || q.includes('واٹس')) {
      return {
        text: "📱 How to Order via Website & WhatsApp:\n\n1. Select your favorite Grill meals or Ice Cream desserts from the menu.\n2. Tap the floating Bag / Cart button at the bottom of the screen.\n3. Choose your order type: Delivery, Takeaway, or Dine-In.\n4. Click 'Confirm via WhatsApp' — your itemized receipt opens in WhatsApp ready to send instantly!\n• Grill hotline for fast phone orders: 0325 4826051.",
        urduText: "📱 ویب سائٹ اور واٹس ایپ پر آرڈر کا طریقہ:\n\n1. مینو سے اپنے پسندیدہ گرل یا آئس کریم آئٹمز بیگ میں شامل کریں۔\n2. نیچے موجود بیگ پر کلک کریں۔\n3. آرڈر کی قسم منتخب کریں (ہوم ڈیلیوری، ٹیک اوے، یا ڈائن اِن)۔\n4. 'Confirm via WhatsApp' دبائیں، مکمل بل واٹس ایپ پر تیار ملے گا!\n• فون پر آرڈر کے لیے گرل ہاٹ لائن: 03254826051۔",
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

    // Default Elder-Friendly & Concise Guide
    return {
      text: "I am right here to help you! You can ask me about:\n• Frosty's Grill Menu: Burgers (Rs. 600), Sandwiches (Rs. 450), Wraps (Rs. 700), Fries Supreme & Combos\n• Delivery Policy: No Cones for Home Delivery (Dine-in/Take-away only; Cups deliverable)\n• Banana Splits: Simple (Rs. 350) vs Deluxe (Rs. 450)\n• Complaints & Feedback system with instant management alerts\n• Store Location (8B Commercial, Green City, Lahore) & Grill Hotline (0325 4826051)",
      urduText: "میں آپ کی مکمل مدد کے لیے حاضر ہوں! آپ مجھ سے فراسٹیز گرل کے برگرز، سینڈوچز، ریپس اور فرائز کی قیمتیں، کونز کی ہوم ڈیلیوری پالیسی، بنانا اسپلٹ کی اقسام، شکایت درج کروانے کا طریقہ، یا گرل ہاٹ لائن (03254826051) کے بارے میں کچھ بھی پوچھ سکتے ہیں۔",
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
    }, 600);
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        className="fixed bottom-20 sm:bottom-6 right-4 z-50 bg-[#2D1B18]/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-2xl border-2 border-[#FF4B72] flex items-center gap-3 cursor-pointer hover:bg-[#3D2522] transition-colors"
        onClick={() => setIsMinimized(false)}
        title="Click to expand Helper AI"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-white text-sm shadow">
          <i className="fa-solid fa-headset animate-pulse"></i>
        </div>
        <div className="text-left">
          <div className="text-xs font-black text-white flex items-center gap-1.5">
            <span>Helper AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-[10px] text-amber-200">Tap to expand chat</div>
        </div>
        <div className="flex items-center gap-1 border-l border-white/20 pl-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1.5 text-amber-300 hover:text-white rounded-lg hover:bg-white/10 text-xs"
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
            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-white/10 text-xs"
            title="Close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </motion.div>
    );
  }

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

            {/* Accessibility, Minimize & Close Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-amber-200 border border-white/10 transition-colors"
                title="Toggle Text Size for Easy Reading"
              >
                {textSize === 'normal' ? '🔍 Bigger' : '🔍 Normal'}
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-base"
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

            {/* Subtle Typing Animation Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex flex-col items-start"
              >
                <div className="bg-[#281814] border border-[#3E2620] text-amber-50 rounded-2xl rounded-tl-none px-4 py-3 shadow-md flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF4B72] to-[#FF85A1] flex items-center justify-center text-[10px] text-white">
                    <i className="fa-solid fa-headset"></i>
                  </div>
                  <span className="text-xs font-semibold text-amber-200/90 mr-1">
                    {language === 'ur' ? 'اسسٹنٹ سوچ رہا ہے' : "Frosty's Assistant is typing"}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF4B72] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#FF85A1] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></span>
                  </div>
                </div>
                <span className="text-[10px] text-stone-500 mt-1 px-1">
                  Just now
                </span>
              </motion.div>
            )}

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
