interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

class LanguageService {
  private currentLanguage: string = 'en';
  private translations: Translations = {};

  constructor() {
    this.loadTranslations();
    this.loadSavedLanguage();
  }

  private loadTranslations() {
    this.translations = {
      en: {
        // App Title & Header
        appName: 'Safe Guard',
        appSubtitle: 'Emergency Safety App',
        welcomeBack: 'Welcome back',
        active: 'Active',
        
        // Language Selection
        selectLanguage: 'Select Language',
        choosePreferredLanguage: 'Choose your preferred language for the app',
        continue: 'Continue',
        
        // Weather
        currentWeather: 'Current Weather',
        weatherUpdate: 'Weather Update',
        weatherAlerts: 'Weather Alerts',
        forecast: 'Forecast',
        temperature: 'Temperature',
        humidity: 'Humidity',
        windSpeed: 'Wind Speed',
        pressure: 'Pressure',
        visibility: 'Visibility',
        uvIndex: 'UV Index',
        lastUpdated: 'Last updated',
        loadingWeather: 'Loading weather...',
        
        // Emergency
        emergencySOS: 'Emergency SOS',
        sosDescription: 'Press and hold for 3 seconds to activate SOS',
        quickEmergencyActions: 'Quick Emergency Actions',
        emergencyCall: 'Emergency Call',
        shareLocation: 'Share Location',
        safetyChecklist: 'Safety Checklist',
        flashlight: 'Flashlight',
        emergencyRadio: 'Emergency Radio',
        documentScene: 'Document Scene',
        medicalInfo: 'Medical Info',
        reportIncident: 'Report Incident',
        
        // Navigation
        notifications: 'Notifications',
        hospital: 'Hospital',
        rescueCenter: 'Rescue Center',
        contacts: 'Contacts',
        settings: 'Settings',
        
        // Settings
        appTheme: 'App Theme',
        lightTheme: 'Light Theme',
        darkTheme: 'Dark Theme',
        locationPermissions: 'Location Permissions',
        locationAccess: 'Location Access',
        liveLocationTracking: 'Live Location Tracking',
        requestLocationPermission: 'Request Location Permission',
        resetApp: 'Reset App',
        
        // User Setup
        personalInformation: 'Personal Information',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        locationPermission: 'Location Permissions',
        emergencyContacts: 'Emergency Contacts',
        addEmergencyContact: 'Add Emergency Contact',
        contactName: 'Contact Name',
        relationship: 'Relationship',
        
        // Disaster Planning
        disasterPlanning: 'Disaster Planning',
        disasterTypes: 'Disaster Types',
        planningGuide: 'Planning Guide',
        emergencyKit: 'Emergency Kit',
        resources: 'Resources',
        
        // Common
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information'
      },
      hi: {
        // App Title & Header
        appName: 'सेफ गार्ड',
        appSubtitle: 'आपातकालीन सुरक्षा ऐप',
        welcomeBack: 'वापसी पर स्वागत',
        active: 'सक्रिय',
        
        // Language Selection
        selectLanguage: 'भाषा चुनें',
        choosePreferredLanguage: 'ऐप के लिए अपनी पसंदीदा भाषा चुनें',
        continue: 'जारी रखें',
        
        // Weather
        currentWeather: 'वर्तमान मौसम',
        weatherUpdate: 'मौसम अपडेट',
        weatherAlerts: 'मौसम चेतावनी',
        forecast: 'पूर्वानुमान',
        temperature: 'तापमान',
        humidity: 'आर्द्रता',
        windSpeed: 'हवा की गति',
        pressure: 'दबाव',
        visibility: 'दृश्यता',
        uvIndex: 'यूवी इंडेक्स',
        lastUpdated: 'अंतिम अपडेट',
        loadingWeather: 'मौसम लोड हो रहा है...',
        
        // Emergency
        emergencySOS: 'आपातकालीन SOS',
        sosDescription: 'SOS सक्रिय करने के लिए 3 सेकंड दबाकर रखें',
        quickEmergencyActions: 'त्वरित आपातकालीन कार्य',
        emergencyCall: 'आपातकालीन कॉल',
        shareLocation: 'स्थान साझा करें',
        safetyChecklist: 'सुरक्षा चेकलिस्ट',
        flashlight: 'टॉर्च',
        emergencyRadio: 'आपातकालीन रेडियो',
        documentScene: 'दस्तावेज़ दृश्य',
        medicalInfo: 'चिकित्सा जानकारी',
        reportIncident: 'घटना की रिपोर्ट करें',
        
        // Navigation
        notifications: 'सूचनाएं',
        hospital: 'अस्पताल',
        rescueCenter: 'बचाव केंद्र',
        contacts: 'संपर्क',
        settings: 'सेटिंग्स',
        
        // Settings
        appTheme: 'ऐप थीम',
        lightTheme: 'लाइट थीम',
        darkTheme: 'डार्क थीम',
        locationPermissions: 'स्थान अनुमतियां',
        locationAccess: 'स्थान पहुंच',
        liveLocationTracking: 'लाइव स्थान ट्रैकिंग',
        requestLocationPermission: 'स्थान अनुमति का अनुरोध करें',
        resetApp: 'ऐप रीसेट करें',
        
        // User Setup
        personalInformation: 'व्यक्तिगत जानकारी',
        fullName: 'पूरा नाम',
        phoneNumber: 'फोन नंबर',
        locationPermission: 'स्थान अनुमतियां',
        emergencyContacts: 'आपातकालीन संपर्क',
        addEmergencyContact: 'आपातकालीन संपर्क जोड़ें',
        contactName: 'संपर्क नाम',
        relationship: 'रिश्ता',
        
        // Disaster Planning
        disasterPlanning: 'आपदा योजना',
        disasterTypes: 'आपदा प्रकार',
        planningGuide: 'योजना गाइड',
        emergencyKit: 'आपातकालीन किट',
        resources: 'संसाधन',
        
        // Common
        save: 'सेव करें',
        cancel: 'रद्द करें',
        close: 'बंद करें',
        next: 'अगला',
        previous: 'पिछला',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
        warning: 'चेतावनी',
        info: 'जानकारी'
      },
      te: {
        // App Title & Header
        appName: 'సేఫ్ గార్డ్',
        appSubtitle: 'అత్యవసర భద్రతా యాప్',
        welcomeBack: 'తిరిగి స్వాగతం',
        active: 'చురుకుగా',
        
        // Language Selection
        selectLanguage: 'భాష ఎంచుకోండి',
        choosePreferredLanguage: 'యాప్ కోసం మీ ఇష్టమైన భాషను ఎంచుకోండి',
        continue: 'కొనసాగించు',
        
        // Weather
        currentWeather: 'ప్రస్తుత వాతావరణం',
        weatherUpdate: 'వాతావరణ నవీకరణ',
        weatherAlerts: 'వాతావరణ హెచ్చరికలు',
        forecast: 'అంచనా',
        temperature: 'ఉష్ణోగ్రత',
        humidity: 'తేమ',
        windSpeed: 'గాలి వేగం',
        pressure: 'ఒత్తిడి',
        visibility: 'దృశ్యత',
        uvIndex: 'UV సూచిక',
        lastUpdated: 'చివరిగా నవీకరించబడింది',
        loadingWeather: 'వాతావరణం లోడ్ అవుతోంది...',
        
        // Emergency
        emergencySOS: 'అత్యవసర SOS',
        sosDescription: 'SOS సక్రియం చేయడానికి 3 సెకన్లు నొక్కి పట్టుకోండి',
        quickEmergencyActions: 'త్వరిత అత్యవసర చర్యలు',
        emergencyCall: 'అత్యవసర కాల్',
        shareLocation: 'స్థానం పంచుకోండి',
        safetyChecklist: 'భద్రతా చెక్‌లిస్ట్',
        flashlight: 'ఫ్లాష్‌లైట్',
        emergencyRadio: 'అత్యవసర రేడియో',
        documentScene: 'దస్తావేజు దృశ్యం',
        medicalInfo: 'వైద్య సమాచారం',
        reportIncident: 'సంఘటనను నివేదించండి',
        
        // Navigation
        notifications: 'నోటిఫికేషన్లు',
        hospital: 'ఆసుపత్రి',
        rescueCenter: 'రెస్క్యూ సెంటర్',
        contacts: 'పరిచయాలు',
        settings: 'సెట్టింగ్‌లు',
        
        // Settings
        appTheme: 'యాప్ థీమ్',
        lightTheme: 'లైట్ థీమ్',
        darkTheme: 'డార్క్ థీమ్',
        locationPermissions: 'స్థాన అనుమతులు',
        locationAccess: 'స్థాన యాక్సెస్',
        liveLocationTracking: 'లైవ్ లొకేషన్ ట్రాకింగ్',
        requestLocationPermission: 'స్థాన అనుమతిని అభ్యర్థించండి',
        resetApp: 'యాప్‌ను రీసెట్ చేయండి',
        
        // User Setup
        personalInformation: 'వ్యక్తిగత సమాచారం',
        fullName: 'పూర్తి పేరు',
        phoneNumber: 'ఫోన్ నంబర్',
        locationPermission: 'స్థాన అనుమతులు',
        emergencyContacts: 'అత్యవసర పరిచయాలు',
        addEmergencyContact: 'అత్యవసర పరిచయాన్ని జోడించండి',
        contactName: 'పరిచయ పేరు',
        relationship: 'సంబంధం',
        
        // Disaster Planning
        disasterPlanning: 'విపత్తు ప్రణాళిక',
        disasterTypes: 'విపత్తు రకాలు',
        planningGuide: 'ప్రణాళిక గైడ్',
        emergencyKit: 'అత్యవసర కిట్',
        resources: 'వనరులు',
        
        // Common
        save: 'సేవ్ చేయండి',
        cancel: 'రద్దు చేయండి',
        close: 'మూసివేయండి',
        next: 'తదుపరి',
        previous: 'మునుపటి',
        loading: 'లోడ్ అవుతోంది...',
        error: 'లోపం',
        success: 'విజయం',
        warning: 'హెచ్చరిక',
        info: 'సమాచారం'
      },
      ta: {
        // App Title & Header
        appName: 'சேஃப் கார்டு',
        appSubtitle: 'அவசரகால பாதுகாப்பு ஆப்',
        welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
        active: 'செயலில்',
        
        // Language Selection
        selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
        choosePreferredLanguage: 'ஆப்பிற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
        continue: 'தொடரவும்',
        
        // Weather
        currentWeather: 'தற்போதைய வானிலை',
        weatherUpdate: 'வானிலை புதுப்பிப்பு',
        weatherAlerts: 'வானிலை எச்சரிக்கைகள்',
        forecast: 'முன்னறிவிப்பு',
        temperature: 'வெப்பநிலை',
        humidity: 'ஈரப்பதம்',
        windSpeed: 'காற்றின் வேகம்',
        pressure: 'அழுத்தம்',
        visibility: 'தெரிவுநிலை',
        uvIndex: 'UV குறியீடு',
        lastUpdated: 'கடைசியாக புதுப்பிக்கப்பட்டது',
        loadingWeather: 'வானிலை ஏற்றப்படுகிறது...',
        
        // Emergency
        emergencySOS: 'அவசரகால SOS',
        sosDescription: 'SOS ஐ செயல்படுத்த 3 வினாடிகள் அழுத்திப் பிடிக்கவும்',
        quickEmergencyActions: 'விரைவு அவசரகால நடவடிக்கைகள்',
        emergencyCall: 'அவசரகால அழைப்பு',
        shareLocation: 'இடத்தைப் பகிரவும்',
        safetyChecklist: 'பாதுகாப்பு சரிபார்ப்பு பட்டியல்',
        flashlight: 'ஒளிவிளக்கு',
        emergencyRadio: 'அவசரகால வானொலி',
        documentScene: 'ஆவண காட்சி',
        medicalInfo: 'மருத்துவ தகவல்',
        reportIncident: 'சம்பவத்தை அறிக்கை செய்யவும்',
        
        // Navigation
        notifications: 'அறிவிப்புகள்',
        hospital: 'மருத்துவமனை',
        rescueCenter: 'மீட்பு மையம்',
        contacts: 'தொடர்புகள்',
        settings: 'அமைப்புகள்',
        
        // Settings
        appTheme: 'ஆப் தீம்',
        lightTheme: 'ஒளி தீம்',
        darkTheme: 'இருண்ட தீம்',
        locationPermissions: 'இட அனுமதிகள்',
        locationAccess: 'இட அணுகல்',
        liveLocationTracking: 'நேரடி இட கண்காணிப்பு',
        requestLocationPermission: 'இட அனுமதியைக் கோரவும்',
        resetApp: 'ஆப்பை மீட்டமைக்கவும்',
        
        // User Setup
        personalInformation: 'தனிப்பட்ட தகவல்',
        fullName: 'முழு பெயர்',
        phoneNumber: 'தொலைபேசி எண்',
        locationPermission: 'இட அனுமதிகள்',
        emergencyContacts: 'அவசரகால தொடர்புகள்',
        addEmergencyContact: 'அவசரகால தொடர்பைச் சேர்க்கவும்',
        contactName: 'தொடர்பு பெயர்',
        relationship: 'உறவு',
        
        // Disaster Planning
        disasterPlanning: 'பேரிடர் திட்டமிடல்',
        disasterTypes: 'பேரிடர் வகைகள்',
        planningGuide: 'திட்டமிடல் வழிகாட்டி',
        emergencyKit: 'அவசரகால கிட்',
        resources: 'வளங்கள்',
        
        // Common
        save: 'சேமிக்கவும்',
        cancel: 'ரத்து செய்யவும்',
        close: 'மூடவும்',
        next: 'அடுத்து',
        previous: 'முந்தைய',
        loading: 'ஏற்றப்படுகிறது...',
        error: 'பிழை',
        success: 'வெற்றி',
        warning: 'எச்சரிக்கை',
        info: 'தகவல்'
      },
      bn: {
        // App Title & Header
        appName: 'সেফ গার্ড',
        appSubtitle: 'জরুরি নিরাপত্তা অ্যাপ',
        welcomeBack: 'আবার স্বাগতম',
        active: 'সক্রিয়',
        
        // Language Selection
        selectLanguage: 'ভাষা নির্বাচন করুন',
        choosePreferredLanguage: 'অ্যাপের জন্য আপনার পছন্দের ভাষা বেছে নিন',
        continue: 'চালিয়ে যান',
        
        // Weather
        currentWeather: 'বর্তমান আবহাওয়া',
        weatherUpdate: 'আবহাওয়া আপডেট',
        weatherAlerts: 'আবহাওয়া সতর্কতা',
        forecast: 'পূর্বাভাস',
        temperature: 'তাপমাত্রা',
        humidity: 'আর্দ্রতা',
        windSpeed: 'বাতাসের গতি',
        pressure: 'চাপ',
        visibility: 'দৃশ্যমানতা',
        uvIndex: 'UV সূচক',
        lastUpdated: 'সর্বশেষ আপডেট',
        loadingWeather: 'আবহাওয়া লোড হচ্ছে...',
        
        // Emergency
        emergencySOS: 'জরুরি SOS',
        sosDescription: 'SOS সক্রিয় করতে ৩ সেকেন্ড চেপে ধরুন',
        quickEmergencyActions: 'দ্রুত জরুরি কার্যক্রম',
        emergencyCall: 'জরুরি কল',
        shareLocation: 'অবস্থান শেয়ার করুন',
        safetyChecklist: 'নিরাপত্তা চেকলিস্ট',
        flashlight: 'টর্চলাইট',
        emergencyRadio: 'জরুরি রেডিও',
        documentScene: 'দস্তাবেজ দৃশ্য',
        medicalInfo: 'চিকিৎসা তথ্য',
        reportIncident: 'ঘটনা রিপোর্ট করুন',
        
        // Navigation
        notifications: 'বিজ্ঞপ্তি',
        hospital: 'হাসপাতাল',
        rescueCenter: 'উদ্ধার কেন্দ্র',
        contacts: 'যোগাযোগ',
        settings: 'সেটিংস',
        
        // Settings
        appTheme: 'অ্যাপ থিম',
        lightTheme: 'হালকা থিম',
        darkTheme: 'গাঢ় থিম',
        locationPermissions: 'অবস্থান অনুমতি',
        locationAccess: 'অবস্থান অ্যাক্সেস',
        liveLocationTracking: 'লাইভ অবস্থান ট্র্যাকিং',
        requestLocationPermission: 'অবস্থান অনুমতির অনুরোধ করুন',
        resetApp: 'অ্যাপ রিসেট করুন',
        
        // User Setup
        personalInformation: 'ব্যক্তিগত তথ্য',
        fullName: 'পূর্ণ নাম',
        phoneNumber: 'ফোন নম্বর',
        locationPermission: 'অবস্থান অনুমতি',
        emergencyContacts: 'জরুরি যোগাযোগ',
        addEmergencyContact: 'জরুরি যোগাযোগ যোগ করুন',
        contactName: 'যোগাযোগের নাম',
        relationship: 'সম্পর্ক',
        
        // Disaster Planning
        disasterPlanning: 'দুর্যোগ পরিকল্পনা',
        disasterTypes: 'দুর্যোগের ধরন',
        planningGuide: 'পরিকল্পনা গাইড',
        emergencyKit: 'জরুরি কিট',
        resources: 'সম্পদ',
        
        // Common
        save: 'সংরক্ষণ করুন',
        cancel: 'বাতিল করুন',
        close: 'বন্ধ করুন',
        next: 'পরবর্তী',
        previous: 'পূর্ববর্তী',
        loading: 'লোড হচ্ছে...',
        error: 'ত্রুটি',
        success: 'সফলতা',
        warning: 'সতর্কতা',
        info: 'তথ্য'
      }
    };
  }

  getAvailableLanguages(): Language[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
      { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' }
    ];
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(languageCode: string) {
    if (this.translations[languageCode]) {
      this.currentLanguage = languageCode;
      try {
        localStorage.setItem('safeGuardLanguage', languageCode);
      } catch (error) {
        console.warn('Could not persist selected language:', error);
      }
      
      // Update document direction for RTL languages
      const language = this.getAvailableLanguages().find(lang => lang.code === languageCode);
      if (typeof document !== 'undefined') {
        if (language?.rtl) {
          document.documentElement.dir = 'rtl';
        } else {
          document.documentElement.dir = 'ltr';
        }
      }
    }
  }

  translate(key: string): string {
    const translation = this.translations[this.currentLanguage]?.[key];
    return translation || this.translations['en']?.[key] || key;
  }

  // Shorthand for translate
  t(key: string): string {
    return this.translate(key);
  }

  private loadSavedLanguage() {
    try {
      const savedLanguage = localStorage.getItem('safeGuardLanguage');
      if (savedLanguage && this.translations[savedLanguage]) {
        this.setLanguage(savedLanguage);
      } else {
        // Auto-detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.translations[browserLang]) {
          this.setLanguage(browserLang);
        }
      }
    } catch (error) {
      console.warn('Could not load saved language:', error);
    }
  }

}

export const languageService = new LanguageService();
export type { Language };
