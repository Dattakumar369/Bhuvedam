import type { LanguageCode } from '@/constants/languages';
import { LANGUAGES } from '@/constants/languages';
import { hiApp } from '@/constants/i18n/locales/hiApp';
import { mrApp } from '@/constants/i18n/locales/mrApp';
import { taApp } from '@/constants/i18n/locales/taApp';
import { knApp } from '@/constants/i18n/locales/knApp';

const langName = (code: string) =>
  LANGUAGES.find((l) => l.code === code)?.nativeName ?? code.toUpperCase();

export interface AppTranslations {
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  homeGreeting: (name: string) => string;
  homeSubtitle: string;
  quickActions: string;
  askAi: string;
  weather: string;
  fertilizers: string;
  pesticides: string;
  fungicides: string;
  sprayGuide: string;
  mandiRates: string;
  schemes: string;
  fieldMeasure: string;
  cropGuide: string;
  recentChats: string;
  seeAll: string;
  emptyChat: string;
  farmerDefault: string;
  settingsTitle: string;
  appearance: string;
  darkMode: string;
  darkModeDesc: string;
  preferences: string;
  farmAlerts: string;
  farmAlertsDesc: string;
  language: string;
  languageCurrent: (code: string) => string;
  location: string;
  locationDetecting: string;
  about: string;
  aboutApp: string;
  appVersion: string;
  support: string;
  profileTitle: string;
  profileSubtitle: string;
  general: string;
  privacyPolicy: string;
  termsOfService: string;
  logout: string;
  logoutConfirm: string;
  loginTitle: string;
  loginTab: string;
  signupTab: string;
  loginWithPassword: string;
  loginWithOtp: string;
  useOtpInstead: string;
  backToPasswordLogin: string;
  loginPasswordHint: string;
  loginPhoneHint: string;
  signupHint: string;
  loginOtpHint: (phone: string) => string;
  loginNameHint: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  loginBtn: string;
  loggingIn: string;
  createAccountBtn: string;
  sendOtp: string;
  sendingOtp: string;
  otp: string;
  verifyOtp: string;
  verifying: string;
  resendOtp: string;
  resendIn: (sec: number) => string;
  yourName: string;
  continueBtn: string;
  creatingAccount: string;
  changeNumber: (phone: string) => string;
  backToOtp: string;
  loginDisclaimerPrefix: string;
  loginDisclaimerSuffix: string;
  terms: string;
  privacy: string;
  otpSendFailed: string;
  otpInvalid: string;
  loginFailed: string;
  signupFailed: string;
  wrongPassword: string;
  forgotPassword: string;
  resetPassword: string;
  resetPasswordHint: string;
  resetPasswordSuccess: string;
  changePassword: string;
  changePasswordHint: string;
  currentPassword: string;
  newPassword: string;
  passwordChanged: string;
  accountNotFound: string;
  mobileNotRegistered: string;
  phoneAlreadyRegistered: string;
  passwordTooShort: string;
  invalidMobile: string;
  mobileRequired: string;
  nameRequired: string;
  passwordRequired: string;
  noPasswordSet: string;
  samePassword: string;
  accountDisabled: string;
  resetPasswordFailed: string;
  passwordChangeFailed: string;
  genericError: string;
  networkError: string;
  sessionExpired: string;
  backToLogin: string;
  syncFailed: string;
  tabHome: string;
  tabCrop: string;
  tabAi: string;
  tabProfile: string;
  chooseLanguage: string;
  chooseLanguageSubtitle: string;
  done: string;
}

const enApp: AppTranslations = {
  greetingMorning: 'Good Morning',
  greetingAfternoon: 'Good Afternoon',
  greetingEvening: 'Good Evening',
  homeGreeting: (name) => `Hello, ${name}!`,
  homeSubtitle: "Here's your farm overview for today",
  quickActions: 'Quick Actions',
  askAi: 'Ask AI',
  weather: 'Weather',
  fertilizers: 'Fertilizers',
  pesticides: 'Pesticides',
  fungicides: 'Fungicides',
  sprayGuide: 'Spray Guide',
  mandiRates: 'Mandi Rates',
  schemes: 'Schemes',
  fieldMeasure: 'Field Measure',
  cropGuide: 'Crop Guide',
  recentChats: 'Recent Chats',
  seeAll: 'See all',
  emptyChat: 'Start a conversation with AI Assistant',
  farmerDefault: 'Farmer',
  settingsTitle: 'Settings',
  appearance: 'APPEARANCE',
  darkMode: 'Dark Mode',
  darkModeDesc: 'Switch between light and dark themes',
  preferences: 'PREFERENCES',
  farmAlerts: 'Farm Alerts',
  farmAlertsDesc: 'Weather, mandi rates & crop reminders',
  language: 'Language',
  languageCurrent: (code) => `Current: ${langName(code)}`,
  location: 'Location',
  locationDetecting: 'Detecting...',
  about: 'ABOUT',
  aboutApp: 'About',
  appVersion: 'App Version',
  support: 'Support',
  profileTitle: 'Profile',
  profileSubtitle: 'Manage your account',
  general: 'GENERAL',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  logout: 'Logout',
  logoutConfirm: 'Are you sure you want to logout from Bhuvedam?',
  loginTitle: 'Welcome to Bhuvedam',
  loginTab: 'Login',
  signupTab: 'Sign Up',
  loginWithPassword: 'Password',
  loginWithOtp: 'OTP',
  useOtpInstead: 'Login with OTP instead',
  backToPasswordLogin: '← Back to password login',
  loginPasswordHint: '',
  loginPhoneHint: '',
  signupHint: '',
  loginOtpHint: (phone) => `You will get a call on +91 ${phone} with your OTP`,
  loginNameHint: 'What is your name?',
  mobileNumber: 'Mobile Number',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  loginBtn: 'Login',
  loggingIn: 'Logging in...',
  createAccountBtn: 'Create Account',
  sendOtp: 'Call OTP',
  sendingOtp: 'Calling...',
  otp: 'OTP',
  verifyOtp: 'Verify OTP',
  verifying: 'Verifying...',
  resendOtp: 'Resend OTP',
  resendIn: (sec) => `Resend OTP in ${sec}s`,
  yourName: 'Your Name',
  continueBtn: 'Continue',
  creatingAccount: 'Creating account...',
  changeNumber: (phone) => `← Change number (+91 ${phone})`,
  backToOtp: '← Back to OTP',
  loginDisclaimerPrefix: 'By continuing, you agree to our',
  loginDisclaimerSuffix: 'Your farm data stays private.',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  otpSendFailed: 'Could not send OTP call. Check internet and try again.',
  otpInvalid: 'Wrong OTP or expired. Try again.',
  loginFailed: 'Login failed. Please try again.',
  signupFailed: 'Could not complete signup. Try again.',
  wrongPassword: 'Wrong mobile number or password',
  forgotPassword: 'Forgot password?',
  resetPassword: 'Reset Password',
  resetPasswordHint: 'Enter your registered mobile number',
  resetPasswordSuccess: 'Password updated. You are now logged in.',
  changePassword: 'Change Password',
  changePasswordHint: 'Enter current password and choose a new one',
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  passwordChanged: 'Password changed successfully',
  accountNotFound: 'No account found with this mobile number',
  mobileNotRegistered: 'This mobile number is not registered. Please sign up first.',
  phoneAlreadyRegistered: 'This mobile number is already registered. Try logging in.',
  passwordTooShort: 'Password must be at least 8 characters',
  invalidMobile: 'Enter a valid 10-digit mobile number',
  mobileRequired: 'Mobile number is required',
  nameRequired: 'Please enter your name',
  passwordRequired: 'Password is required',
  noPasswordSet: 'No password set. Use Forgot Password on the login screen.',
  samePassword: 'New password must be different from current password',
  accountDisabled: 'Account is disabled. Contact support.',
  resetPasswordFailed: 'Could not reset password. Please try again.',
  passwordChangeFailed: 'Could not change password. Please try again.',
  genericError: 'Something went wrong. Please try again.',
  networkError: 'Could not connect to server. Check your internet and try again.',
  sessionExpired: 'Your session expired. Please log in again.',
  backToLogin: '← Back to login',
  syncFailed: 'Could not sync farm data to server. Will retry later.',
  tabHome: 'Home',
  tabCrop: 'Crop',
  tabAi: 'AI',
  tabProfile: 'Profile',
  chooseLanguage: 'Choose Language',
  chooseLanguageSubtitle: 'Choose your preferred language',
  done: 'Done',
};

const teApp: AppTranslations = {
  greetingMorning: 'శుభోదయం',
  greetingAfternoon: 'శుభ మధ్యాహ్నం',
  greetingEvening: 'శుభ సాయంత్రం',
  homeGreeting: (name) => `నమస్కారం, ${name}!`,
  homeSubtitle: 'ఈ రోజు మీ పొలం సమాచారం',
  quickActions: 'త్వరిత చర్యలు',
  askAi: 'AI అడగండి',
  weather: 'వాతావరణం',
  fertilizers: 'ఎరువులు',
  pesticides: 'కీటకనాశినులు',
  fungicides: 'శిలీంధ్ర నాశినులు',
  sprayGuide: 'స్ప్రే గైడ్',
  mandiRates: 'మండి ధరలు',
  schemes: 'పథకాలు',
  fieldMeasure: 'పొలం కొలత',
  cropGuide: 'పంట గైడ్',
  recentChats: 'ఇటీవలి చాట్లు',
  seeAll: 'అన్నీ చూడండి',
  emptyChat: 'AI సహాయకుడితో మాట్లాడటం ప్రారంభించండి',
  farmerDefault: 'రైతు',
  settingsTitle: 'అమరికలు',
  appearance: 'రూపం',
  darkMode: 'డార్క్ మోడ్',
  darkModeDesc: 'లైట్ / డార్క్ థీమ్ మార్చండి',
  preferences: 'అభిమతాలు',
  farmAlerts: 'పొలం alerts',
  farmAlertsDesc: 'వాతావరణం, మండి ధరలు & పంట reminders',
  language: 'భాష',
  languageCurrent: (code) => `ప్రస్తుతం: ${langName(code)}`,
  location: 'స్థానం',
  locationDetecting: 'గుర్తిస్తున్నాం...',
  about: 'గురించి',
  aboutApp: 'గురించి',
  appVersion: 'యాప్ వెర్షన్',
  support: 'సహాయం',
  profileTitle: 'ప్రొఫైల్',
  profileSubtitle: 'మీ ఖాతా నిర్వహణ',
  general: 'సాధారణ',
  privacyPolicy: 'గోప్యతా విధానం',
  termsOfService: 'నిబంధనలు',
  logout: 'లాగౌట్',
  logoutConfirm: 'Bhuvedam నుండి logout చేయాలా?',
  loginTitle: 'Bhuvedam కు స్వాగతం',
  loginTab: 'Login',
  signupTab: 'Sign Up',
  loginWithPassword: 'Password',
  loginWithOtp: 'OTP',
  useOtpInstead: 'OTP తో login',
  backToPasswordLogin: '← Password login',
  loginPasswordHint: '',
  loginPhoneHint: '',
  signupHint: '',
  loginOtpHint: (phone) => `+91 ${phone} ki OTP voice call vastundi`,
  loginNameHint: 'మీ పేరు ఏమిటి?',
  mobileNumber: 'మొబైల్ నంబర్',
  password: 'Password',
  confirmPassword: 'Password confirm',
  loginBtn: 'Login',
  loggingIn: 'Login avutundi...',
  createAccountBtn: 'Account create',
  sendOtp: 'Call OTP',
  sendingOtp: 'Call chestunnam...',
  otp: 'OTP',
  verifyOtp: 'OTP verify',
  verifying: 'Verify అవుతోంది...',
  resendOtp: 'OTP మళ్లీ పంపు',
  resendIn: (sec) => `${sec}s తర్వాత మళ్లీ పంపు`,
  yourName: 'మీ పేరు',
  continueBtn: 'కొనసాగించu',
  creatingAccount: 'Account create అవుతోంది...',
  changeNumber: (phone) => `← Number మార్చu (+91 ${phone})`,
  backToOtp: '← OTP కు వెనక',
  loginDisclaimerPrefix: 'కొనసాగించడం ద్వారా మీరు',
  loginDisclaimerSuffix: 'మీ పొలం డేటా private గా ఉంటుంది.',
  terms: 'నిబంధనలు',
  privacy: 'గోప్యతా విధానం',
  otpSendFailed: 'OTP call pampalekapoyam. Internet check chesi malli try cheyandi.',
  otpInvalid: 'OTP తప్పu లేదా expire. మళ్లీ try చేయండి.',
  loginFailed: 'Login fail. మళ్లీ try చేయండి.',
  signupFailed: 'Signup fail. మళ్లీ try చేయండి.',
  wrongPassword: 'Mobile number లేదా password తప్పu',
  forgotPassword: 'Password marchipoyaara?',
  resetPassword: 'Password Reset',
  resetPasswordHint: 'మీ registered mobile number enter cheyandi',
  resetPasswordSuccess: 'Password update ayyindi. Login ayyaru.',
  changePassword: 'Password Marchu',
  changePasswordHint: 'Current password + kotha password enter cheyandi',
  currentPassword: 'Current Password',
  newPassword: 'Kotha Password',
  passwordChanged: 'Password change ayyindi',
  accountNotFound: 'Ee mobile number tho account ledu',
  mobileNotRegistered: 'Ee mobile number register cheyaledu. Sign up cheyandi.',
  phoneAlreadyRegistered: 'Ee mobile number already register ayyindi. Login try cheyandi.',
  passwordTooShort: 'Password కనీసం 8 characters',
  invalidMobile: 'Valid 10-digit mobile number enter cheyandi',
  mobileRequired: 'Mobile number avasaram',
  nameRequired: 'Mee peru enter cheyandi',
  passwordRequired: 'Password avasaram',
  noPasswordSet: 'Password set cheyaledu. Login lo Forgot Password use cheyandi.',
  samePassword: 'Kotha password current password laaga undakudadhu',
  accountDisabled: 'Account disabled. Support contact cheyandi.',
  resetPasswordFailed: 'Password reset fail. Malli try cheyandi.',
  passwordChangeFailed: 'Password change fail. Malli try cheyandi.',
  genericError: 'Emaina problem vachindi. Malli try cheyandi.',
  networkError: 'Server connect avvaledu. Internet check chesi malli try cheyandi.',
  sessionExpired: 'Session expire ayyindi. Malli login cheyandi.',
  backToLogin: '← Login ki vellu',
  syncFailed: 'Server ki farm data sync fail. Taruvata retry avutundi.',
  tabHome: 'హోమ్',
  tabCrop: 'పంట',
  tabAi: 'AI',
  tabProfile: 'ప్రొఫైల్',
  chooseLanguage: 'భాష ఎంచుకోండి',
  chooseLanguageSubtitle: 'మీకు నచ్చిన భాష ఎంచుకోండి',
  done: 'పూర్తి',
};

export const APP_TRANSLATIONS: Record<LanguageCode, AppTranslations> = {
  en: enApp,
  te: teApp,
  hi: hiApp,
  mr: mrApp,
  ta: taApp,
  kn: knApp,
};

export function getAppTranslations(language: LanguageCode): AppTranslations {
  return APP_TRANSLATIONS[language] ?? enApp;
}

export function getLocalizedGreeting(language: LanguageCode): string {
  const app = getAppTranslations(language);
  const hour = new Date().getHours();
  if (hour < 12) return app.greetingMorning;
  if (hour < 17) return app.greetingAfternoon;
  return app.greetingEvening;
}
