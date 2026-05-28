const STORAGE_KEY = 'memrise-mini-lists-v1';
const IPA_CACHE_KEY = 'memrise-mini-ipa-cache-v1';
const TRANSLATION_CACHE_KEY = 'memrise-mini-translation-cache-v2';
const SPEECH_SETTINGS_KEY = 'memrise-mini-speech-settings-v1';
const STORAGE_SETTINGS_KEY = 'memrise-mini-storage-settings-v1';
const UI_SETTINGS_KEY = 'memrise-mini-ui-settings-v1';
const GOOGLE_CLIENT_ID_KEY = 'memrise-mini-google-client-id-v1';
const DRIVE_FILE_NAME = 'memrise-mini-data.json';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const DRIVE_SYNC_INTERVAL = 60_000;
const VIETNAMESE_TTS_URL = 'https://translate.google.com/translate_tts';

const els = {
  createListForm: document.querySelector('#createListForm'),
  listName: document.querySelector('#listName'),
  wordInput: document.querySelector('#wordInput'),
  fileInput: document.querySelector('#fileInput'),
  fileName: document.querySelector('#fileName'),
  demoButton: document.querySelector('#demoButton'),
  addListButton: document.querySelector('#addListButton'),
  closeCreateListButton: document.querySelector('#closeCreateListButton'),
  createListModal: document.querySelector('#createListModal'),
  backToListsButton: document.querySelector('#backToListsButton'),
  listView: document.querySelector('#listView'),
  flashcardView: document.querySelector('#flashcardView'),
  mainHeader: document.querySelector('#mainHeader'),
  listSearchInput: document.querySelector('#listSearchInput'),
  listMenuButton: document.querySelector('#listMenuButton'),
  listMenu: document.querySelector('#listMenu'),
  listMenuItems: document.querySelector('#listMenuItems'),
  focusCreateListButton: document.querySelector('#focusCreateListButton'),
  settingsButton: document.querySelector('#settingsButton'),
  closeSettingsButton: document.querySelector('#closeSettingsButton'),
  settingsSidebar: document.querySelector('#settingsSidebar'),
  settingsSidebarEyebrow: document.querySelector('#settingsSidebarEyebrow'),
  settingsSidebarTitle: document.querySelector('#settingsSidebarTitle'),
  storagePanel: document.querySelector('#storagePanel'),
  settingsBackdrop: document.querySelector('.settings-backdrop'),
  driveLockOverlay: document.querySelector('#driveLockOverlay'),
  unlockDriveButton: document.querySelector('#unlockDriveButton'),
  driveLockHint: document.querySelector('#driveLockHint'),
  listCollection: document.querySelector('#listCollection'),
  activeListTitle: document.querySelector('#activeListTitle'),
  listDetailView: document.querySelector('#listDetailView'),
  backFromDetailButton: document.querySelector('#backFromDetailButton'),
  detailListTitle: document.querySelector('#detailListTitle'),
  phraseList: document.querySelector('#phraseList'),
  continueLearningButton: document.querySelector('#continueLearningButton'),
  markAllKnownButton: document.querySelector('#markAllKnownButton'),
  progressText: document.querySelector('#progressText'),
  progressBar: document.querySelector('#progressBar'),
  flashcard: document.querySelector('#flashcard'),
  cardImage: document.querySelector('#cardImage'),
  cardBadge: document.querySelector('#cardBadge'),
  englishText: document.querySelector('#englishText'),
  ipaText: document.querySelector('#ipaText'),
  vietnameseText: document.querySelector('#vietnameseText'),
  prevButton: document.querySelector('#prevButton'),
  speakButton: document.querySelector('#speakButton'),
  playButton: document.querySelector('#playButton'),
  nextButton: document.querySelector('#nextButton'),
  intervalInput: document.querySelector('#intervalInput'),
  englishVoiceSelect: document.querySelector('#englishVoiceSelect'),
  vietnameseVoiceSelect: document.querySelector('#vietnameseVoiceSelect'),
  storageModeSelect: document.querySelector('#storageModeSelect'),
  darkModeToggle: document.querySelector('#darkModeToggle'),
  uiLanguageSelect: document.querySelector('#uiLanguageSelect'),
  languagePairSelect: document.querySelector('#languagePairSelect'),
  googleClientIdInput: document.querySelector('#googleClientIdInput'),
  googleClientIdField: document.querySelector('#googleClientIdField'),
  driveSignInButton: document.querySelector('#driveSignInButton'),
  driveSignOutButton: document.querySelector('#driveSignOutButton'),
  driveSyncNowButton: document.querySelector('#driveSyncNowButton'),
  storageStatus: document.querySelector('#storageStatus'),
  openDriveButton: document.querySelector('#openDriveButton'),
  saveDriveButton: document.querySelector('#saveDriveButton'),
  exportDriveButton: document.querySelector('#exportDriveButton'),
  importDriveInput: document.querySelector('#importDriveInput'),
  listButtonTemplate: document.querySelector('#listButtonTemplate'),
};

const state = {
  lists: loadJson(STORAGE_KEY, []),
  ipaCache: loadJson(IPA_CACHE_KEY, {}),
  translationCache: loadJson(TRANSLATION_CACHE_KEY, {}),
  activeListId: null,
  activeIndex: 0,
  autoplayTimer: null,
  speechSettings: loadJson(SPEECH_SETTINGS_KEY, {
    englishVoice: 'en-US-female',
    vietnameseVoice: 'vi-VN-female-north',
  }),
  availableVoices: [],
  speechRunId: 0,
  vietnameseAudio: null,
  storageSettings: loadJson(STORAGE_SETTINGS_KEY, { mode: 'local', driveFileName: '', driveFileId: '', driveUpdatedAt: '' }),
  googleAccessToken: '',
  googleTokenClient: null,
  driveSyncTimer: null,
  driveSyncInProgress: false,
  settingsOpen: false,
  openMenu: '',
  uiSettings: loadJson(UI_SETTINGS_KEY, { darkMode: false, languagePair: 'en-vi', uiLanguage: 'vi' }),
  listSearch: '',
  activeView: 'lists',
  driveFileHandle: null,
  driveSaveTimer: null,
  driveSaveInProgress: false,
  editingListId: null,
  openPhraseActionId: null,
};


const translations = {
  vi: {
    pageTitle: 'Memrise Mini - Học tiếng Anh bằng flashcard',
    driveLockEyebrow: 'Yêu cầu đăng nhập Google Drive',
    driveLockTitle: 'Đăng nhập Drive để tiếp tục học',
    driveLockBody: 'Ứng dụng đang dùng chế độ Google Drive. Vì lý do bảo mật, trình duyệt không giữ phiên Drive sau mỗi lần mở lại, nên bạn cần đăng nhập trước khi sử dụng tiếp.',
    driveLockButton: 'Đăng nhập Google Drive',
    driveLockDefaultHint: 'Nếu đây là lần đầu, hãy mở Cài đặt và nhập OAuth Client ID của Google Cloud.',
    driveLockHasClientId: 'Bấm đăng nhập để cấp quyền đọc/ghi thư mục dữ liệu riêng của ứng dụng trên Google Drive.',
    driveLockMissingClientId: 'Chưa có OAuth Client ID. Hãy mở Cài đặt, nhập Client ID rồi đăng nhập Drive.',
    settings: 'Cài đặt',
    settingsStorageTitle: 'Nơi lưu trữ',
    closeSettings: 'Đóng bảng bên phải',
    settingsPanelLabel: 'Cài đặt ứng dụng',
    appearance: 'Giao diện',
    darkMode: '🌙 Chế độ tối',
    darkModeTooltip: 'Bật hoặc tắt chế độ tối',
    interfaceLanguage: 'Ngôn ngữ hiển thị',
    vietnamese: 'Tiếng Việt',
    english: 'Tiếng Anh',
    learning: 'Học tập',
    languagePair: 'Cặp ngôn ngữ',
    englishToVietnamese: 'Tiếng Anh → Tiếng Việt',
    vietnameseToEnglish: 'Tiếng Việt → Tiếng Anh',
    dataStorage: 'Lưu trữ dữ liệu',
    storagePanelLabel: 'Chọn nơi lưu dữ liệu',
    storageSummary: 'Lưu cục bộ (một thiết bị) · Đồng bộ Google Drive (nhiều thiết bị)',
    storageMode: 'Chế độ',
    localStorageOption: 'Lưu cục bộ',
    driveSyncOption: 'Đồng bộ Google Drive',
    signInDrive: 'Đăng nhập Drive',
    syncNow: 'Đồng bộ ngay',
    signOutDrive: 'Đăng xuất Drive',
    openDriveFile: 'Mở file Drive',
    saveToDrive: 'Lưu vào Drive',
    downloadDataFile: 'Tải file dữ liệu',
    importDriveFile: 'Nạp file Drive',
    driveHint: 'Drive dùng thư mục ẩn appDataFolder của chính tài khoản Google. Ứng dụng sẽ tự đẩy danh sách mới lên Drive và định kỳ kéo thay đổi từ Drive về.',
    mainNav: 'Điều hướng chính',
    searchLists: 'Tìm danh sách',
    searchPlaceholder: 'Tên hoặc danh sách',
    settingsButton: 'Cài đặt',
    wordLists: '☰ Danh sách từ',
    createUpdateList: 'Tạo / cập nhật danh sách',
    existingLists: 'Danh sách từ hiện có',
    deleteCurrentList: 'Xóa danh sách hiện tại',
    listManagement: 'Quản lý danh sách',
    yourLibrary: 'Thư viện của bạn',
    lists: 'Danh sách',
    wordList: 'Danh sách từ',
    continueLearning: 'Học tiếp',
    markAllKnown: 'Đánh dấu tất cả là đã biết',
    markAsKnown: 'Đánh dấu là đã biết',
    unmarkAsKnown: 'Bỏ đánh dấu là đã biết',
    markAsDifficult: 'Đánh dấu là khó',
    unmarkAsDifficult: 'Bỏ đánh dấu từ khó',
    phraseActions: 'Tùy chọn từ',
    knownWord: 'Đã biết',
    difficultWord: 'Từ khó',
    back: '← Quay lại',
    studyProgress: 'Tiến độ học',
    currentFlashcard: 'Flashcard hiện tại',
    illustrationAlt: 'Ảnh minh họa',
    ready: 'Sẵn sàng',
    createFirstList: 'Hãy tạo danh sách đầu tiên',
    flashcardPlaceholder: 'Flashcard sẽ xuất hiện tại đây.',
    previous: '← Trước',
    speakAgain: 'Flip / Đọc lại',
    autoplay: 'Tự động chạy',
    stopAutoplay: 'Dừng tự động',
    next: 'Tiếp →',
    everyCard: 'Mỗi thẻ',
    seconds: 'giây',
    englishVoice: 'Giọng tiếng Anh',
    vietnameseVoice: 'Giọng nghĩa tiếng Việt',
    femaleAmerican: 'Nữ · giọng Mỹ',
    maleAmerican: 'Nam · giọng Mỹ',
    femaleBritish: 'Nữ · giọng Anh',
    maleBritish: 'Nam · giọng Anh',
    femaleNorth: 'Nữ miền Bắc',
    maleNorth: 'Nam miền Bắc',
    addList: 'Thêm danh sách',
    closeAddList: 'Đóng hộp thêm danh sách',
    listName: 'Tên danh sách',
    listNamePlaceholder: 'Ví dụ: Business English',
    wordsOrSentences: 'Từ/câu tiếng Anh',
    wordInputPlaceholder: 'Mỗi dòng một mục. Có thể dùng: hello | xin chào\nresilience\nCould you help me?',
    uploadTxtCsv: 'Tải TXT/CSV',
    noFileSelected: 'Chưa chọn file',
    learn: 'Học',
    edit: 'Sửa',
    delete: 'Xóa',
    learnTooltip: 'Bắt đầu học danh sách này',
    editTooltip: 'Sửa danh sách này',
    deleteTooltip: 'Xóa danh sách này',
    listFallback: 'Danh sách {number}',
    localStorageStatus: 'Đang lưu trên máy này bằng localStorage. Phù hợp khi chỉ học trên một máy tính.',
    driveNeedsClientId: 'Chế độ Google Drive cần OAuth Client ID. Nhập Client ID từ Google Cloud, sau đó bấm “Đăng nhập Drive”.',
    driveNeedsSignIn: 'Đã chọn Google Drive. Vui lòng đăng nhập Drive để mở khóa ứng dụng và đồng bộ dữ liệu.',
    driveSignedIn: 'Đã đăng nhập Google Drive. File dữ liệu {fileName} được lưu trong appDataFolder và tự đồng bộ mỗi phút.',
    importedDrive: 'Đã nạp {fileName}. Bấm “Đăng nhập Drive” để tự động đẩy dữ liệu này lên Google Drive.',
    driveSyncFailed: 'Không thể đồng bộ Google Drive. Hãy đăng nhập lại hoặc kiểm tra OAuth Client ID.',
    googleIdentityNotLoaded: 'Google Identity Services chưa tải xong.',
    noListsHint: 'Chưa có danh sách nào. Hãy tạo danh sách hoặc nạp bộ mẫu.',
    wordsCount: '{count} từ',
    itemsCount: '{count} mục',
    lastStudied: 'Lần học gần nhất: {value}',
    justNow: 'Vừa xong',
    notYet: 'Chưa học',
    noListsMenu: 'Chưa có danh sách nào.',
    noListTitle: 'Chưa có danh sách',
    flashcard: 'Flashcard',
    autoplaying: 'Đang tự động chạy',
    imageFor: 'Ảnh minh họa cho {text}',
    loadingIpa: 'Đang tìm IPA...',
    translatingVietnamese: 'Đang dịch nghĩa tiếng Việt...',
    missingVietnamese: 'Chưa có nghĩa tiếng Việt. Hãy nhập nghĩa sau dấu “|” để lưu thủ công.',
    pendingVietnamese: 'Đang chờ dịch nghĩa tiếng Việt',
    signInBeforeDrive: 'Cần đăng nhập Google Drive trước khi dùng tiếp.',
    driveSignInFailed: 'Không thể đăng nhập Google Drive. Vui lòng kiểm tra OAuth Client ID và thử lại.',
    driveUnlockFailed: 'Không thể đăng nhập Google Drive. Hãy kiểm tra OAuth Client ID trong Cài đặt.',
    manualSyncFailed: 'Đồng bộ thủ công thất bại. Hãy đăng nhập lại Google Drive.',
    openDriveFailed: 'Không thể đăng nhập Drive. Vui lòng kiểm tra OAuth Client ID.',
    saveDriveFailed: 'Không thể lưu vào Drive. Hãy đăng nhập lại Google Drive.',
    invalidDriveFile: 'File Drive không hợp lệ. Vui lòng chọn file JSON của Memrise Mini.',
  },
  en: {
    pageTitle: 'Memrise Mini - Learn English with flashcards',
    driveLockEyebrow: 'Google Drive sign-in required',
    driveLockTitle: 'Sign in to Drive to keep learning',
    driveLockBody: 'The app is using Google Drive mode. For security, the browser does not keep your Drive session after each reopen, so you need to sign in before continuing.',
    driveLockButton: 'Sign in to Google Drive',
    driveLockDefaultHint: 'If this is your first time, open Settings and enter your Google Cloud OAuth Client ID.',
    driveLockHasClientId: 'Click sign in to grant read/write access to the app’s private data folder on Google Drive.',
    driveLockMissingClientId: 'No OAuth Client ID yet. Open Settings, enter the Client ID, then sign in to Drive.',
    settings: 'Settings',
    settingsStorageTitle: 'Storage',
    closeSettings: 'Close right sidebar',
    settingsPanelLabel: 'App settings',
    appearance: 'Appearance',
    darkMode: '🌙 Dark mode',
    darkModeTooltip: 'Turn dark mode on or off',
    interfaceLanguage: 'Display language',
    vietnamese: 'Vietnamese',
    english: 'English',
    learning: 'Learning',
    languagePair: 'Language pair',
    englishToVietnamese: 'English → Vietnamese',
    vietnameseToEnglish: 'Vietnamese → English',
    dataStorage: 'Data storage',
    storagePanelLabel: 'Choose where to store data',
    storageSummary: 'Local storage (single device) · Google Drive sync (multi-device)',
    storageMode: 'Mode',
    localStorageOption: 'Local storage',
    driveSyncOption: 'Google Drive sync',
    signInDrive: 'Sign in to Drive',
    syncNow: 'Sync now',
    signOutDrive: 'Sign out of Drive',
    openDriveFile: 'Open Drive file',
    saveToDrive: 'Save to Drive',
    downloadDataFile: 'Download data file',
    importDriveFile: 'Import Drive file',
    driveHint: 'Drive uses the hidden appDataFolder for your Google account. The app automatically pushes new lists to Drive and periodically pulls Drive changes back.',
    mainNav: 'Main navigation',
    searchLists: 'Search lists',
    searchPlaceholder: 'Name or list',
    settingsButton: 'Settings',
    wordLists: '☰ Word lists',
    createUpdateList: 'Create / update list',
    existingLists: 'Existing word lists',
    deleteCurrentList: 'Delete current list',
    listManagement: 'List management',
    yourLibrary: 'Your library',
    lists: 'Lists',
    wordList: 'Word list',
    continueLearning: 'Continue learning',
    markAllKnown: 'Mark all as known',
    markAsKnown: 'Mark as known',
    unmarkAsKnown: 'Unmark as known',
    markAsDifficult: 'Mark as difficult',
    unmarkAsDifficult: 'Unmark difficult word',
    phraseActions: 'Word options',
    knownWord: 'Known',
    difficultWord: 'Difficult word',
    back: '← Back',
    studyProgress: 'Study progress',
    currentFlashcard: 'Current flashcard',
    illustrationAlt: 'Illustration',
    ready: 'Ready',
    createFirstList: 'Create your first list',
    flashcardPlaceholder: 'Flashcards will appear here.',
    previous: '← Previous',
    speakAgain: 'Flip / Speak again',
    autoplay: 'Autoplay',
    stopAutoplay: 'Stop autoplay',
    next: 'Next →',
    everyCard: 'Every card',
    seconds: 'seconds',
    englishVoice: 'English voice',
    vietnameseVoice: 'Vietnamese meaning voice',
    femaleAmerican: 'Female · American accent',
    maleAmerican: 'Male · American accent',
    femaleBritish: 'Female · British accent',
    maleBritish: 'Male · British accent',
    femaleNorth: 'Northern female',
    maleNorth: 'Northern male',
    addList: 'Add list',
    closeAddList: 'Close add list modal',
    listName: 'List name',
    listNamePlaceholder: 'Example: Business English',
    wordsOrSentences: 'English words/sentences',
    wordInputPlaceholder: 'One item per line. You can use: hello | xin chào\nresilience\nCould you help me?',
    uploadTxtCsv: 'Upload TXT/CSV',
    noFileSelected: 'No file selected',
    learn: 'Learn',
    edit: 'Edit',
    delete: 'Delete',
    learnTooltip: 'Start studying this list',
    editTooltip: 'Edit this list',
    deleteTooltip: 'Delete this list',
    listFallback: 'List {number}',
    localStorageStatus: 'Saving on this device with localStorage. Best when you only study on one computer.',
    driveNeedsClientId: 'Google Drive mode needs an OAuth Client ID. Enter the Client ID from Google Cloud, then click “Sign in to Drive”.',
    driveNeedsSignIn: 'Google Drive is selected. Please sign in to Drive to unlock the app and sync data.',
    driveSignedIn: 'Signed in to Google Drive. The data file {fileName} is stored in appDataFolder and syncs every minute.',
    importedDrive: 'Imported {fileName}. Click “Sign in to Drive” to automatically push this data to Google Drive.',
    driveSyncFailed: 'Could not sync Google Drive. Sign in again or check the OAuth Client ID.',
    googleIdentityNotLoaded: 'Google Identity Services did not finish loading.',
    noListsHint: 'No lists yet. Create a list or load a sample set.',
    wordsCount: '{count} words',
    itemsCount: '{count} items',
    lastStudied: 'Last studied: {value}',
    justNow: 'Just now',
    notYet: 'Not yet',
    noListsMenu: 'No lists yet.',
    noListTitle: 'No list selected',
    flashcard: 'Flashcard',
    autoplaying: 'Autoplaying',
    imageFor: 'Illustration for {text}',
    loadingIpa: 'Looking up IPA...',
    translatingVietnamese: 'Translating Vietnamese meaning...',
    missingVietnamese: 'No Vietnamese meaning yet. Enter a meaning after “|” to save it manually.',
    pendingVietnamese: 'Waiting for Vietnamese translation',
    signInBeforeDrive: 'Sign in to Google Drive before continuing.',
    driveSignInFailed: 'Could not sign in to Google Drive. Check the OAuth Client ID and try again.',
    driveUnlockFailed: 'Could not sign in to Google Drive. Check the OAuth Client ID in Settings.',
    manualSyncFailed: 'Manual sync failed. Sign in to Google Drive again.',
    openDriveFailed: 'Could not sign in to Drive. Check the OAuth Client ID.',
    saveDriveFailed: 'Could not save to Drive. Sign in to Google Drive again.',
    invalidDriveFile: 'Invalid Drive file. Choose a Memrise Mini JSON file.',
  },
};

function getUiLanguage() {
  return translations[state.uiSettings.uiLanguage] ? state.uiSettings.uiLanguage : 'vi';
}

function t(key, params = {}) {
  const template = translations[getUiLanguage()][key] || translations.vi[key] || key;
  return Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function applyTranslations() {
  const language = getUiLanguage();
  document.documentElement.lang = language;
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-label]').forEach((element) => {
    element.setAttribute('aria-label', t(element.dataset.i18nLabel));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.setAttribute('title', t(element.dataset.i18nTitle));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    element.setAttribute('alt', t(element.dataset.i18nAlt));
  });
  if (els.uiLanguageSelect) els.uiLanguageSelect.value = language;
}

const demoItems = [
  { english: 'resilience', vietnamese: 'sự kiên cường, khả năng phục hồi' },
  { english: 'Could you help me find the nearest station?', vietnamese: 'Bạn có thể giúp tôi tìm nhà ga gần nhất không?' },
  { english: 'curiosity', vietnamese: 'sự tò mò, ham học hỏi' },
  { english: 'I would like a cup of coffee, please.', vietnamese: 'Tôi muốn một tách cà phê, làm ơn.' },
];

function loadJson(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function saveState(options = {}) {
  const { markDirty = true, skipDriveSave = false } = options;
  if (markDirty) state.storageSettings.driveUpdatedAt = new Date().toISOString();

  if (state.storageSettings.mode === 'local') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lists));
    stopDriveAutoSync();
  } else if (!skipDriveSave) {
    scheduleDriveSave();
  }

  localStorage.setItem(IPA_CACHE_KEY, JSON.stringify(state.ipaCache));
  localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(state.translationCache));
  localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(state.speechSettings));
  persistStorageSettings();
  renderStoragePanel();
  updateDriveLock();
}

function persistStorageSettings() {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(state.storageSettings));
}

function saveUiSettings() {
  localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(state.uiSettings));
}

function applyTheme() {
  document.body.classList.toggle('theme-dark', Boolean(state.uiSettings.darkMode));
  els.darkModeToggle?.setAttribute('aria-pressed', String(Boolean(state.uiSettings.darkMode)));
}

function getGoogleClientId() {
  return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || window.MEMRISE_GOOGLE_CLIENT_ID || '';
}

function saveGoogleClientId(value) {
  const clientId = value.trim();
  if (clientId) {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId);
  } else {
    localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
  }
  state.googleTokenClient = null;
  renderStoragePanel();
  updateDriveLock();
}

function createStoragePayload() {
  return normalizeStoragePayload({
    app: 'memrise-mini',
    version: 1,
    updatedAt: state.storageSettings.driveUpdatedAt || new Date().toISOString(),
    lists: state.lists,
    ipaCache: state.ipaCache,
    translationCache: state.translationCache,
    speechSettings: state.speechSettings,
  });
}

function normalizeStoragePayload(payload = {}) {
  return {
    app: 'memrise-mini',
    version: Number(payload.version) || 1,
    updatedAt: payload.updatedAt || new Date().toISOString(),
    lists: Array.isArray(payload.lists) ? payload.lists.map(normalizeList).filter((list) => list.items.length) : [],
    ipaCache: payload.ipaCache && typeof payload.ipaCache === 'object' ? payload.ipaCache : {},
    translationCache: payload.translationCache && typeof payload.translationCache === 'object' ? payload.translationCache : {},
    speechSettings: payload.speechSettings && typeof payload.speechSettings === 'object' ? payload.speechSettings : {},
  };
}

function normalizeList(list, index) {
  const fallbackName = t('listFallback', { number: index + 1 });
  const name = String(list?.name || fallbackName).trim() || fallbackName;
  return {
    id: String(list?.id || uid()),
    name,
    items: Array.isArray(list?.items) ? list.items.map(normalizeListItem).filter((item) => item.english) : [],
  };
}

function normalizeListItem(item) {
  return {
    id: String(item?.id || uid()),
    english: String(item?.english || '').trim(),
    vietnamese: String(item?.vietnamese || '').trim(),
    ipa: String(item?.ipa || '').trim(),
    image: String(item?.image || '').trim(),
    known: Boolean(item?.known),
    difficult: Boolean(item?.difficult),
    studied: Boolean(item?.studied),
  };
}

function mergeStoragePayloads(localPayload, remotePayload) {
  const local = normalizeStoragePayload(localPayload);
  const remote = normalizeStoragePayload(remotePayload);
  const listMap = new Map();

  [...remote.lists, ...local.lists].forEach((list) => {
    const key = getListMergeKey(list);
    const existing = listMap.get(key);
    listMap.set(key, existing ? mergeLists(existing, list) : cloneList(list));
  });

  return {
    app: 'memrise-mini',
    version: Math.max(local.version || 1, remote.version || 1),
    updatedAt: new Date().toISOString(),
    lists: [...listMap.values()],
    ipaCache: { ...remote.ipaCache, ...local.ipaCache },
    translationCache: { ...remote.translationCache, ...local.translationCache },
    speechSettings: { ...remote.speechSettings, ...local.speechSettings },
  };
}

function mergeLists(baseList, incomingList) {
  const itemMap = new Map();
  [...baseList.items, ...incomingList.items].forEach((item) => {
    const key = getItemMergeKey(item);
    const existing = itemMap.get(key);
    itemMap.set(key, existing ? mergeListItems(existing, item) : { ...item });
  });

  return {
    id: baseList.id || incomingList.id || uid(),
    name: incomingList.name || baseList.name,
    items: [...itemMap.values()],
  };
}

function mergeListItems(baseItem, incomingItem) {
  return {
    id: baseItem.id || incomingItem.id || uid(),
    english: incomingItem.english || baseItem.english,
    vietnamese: incomingItem.vietnamese || baseItem.vietnamese,
    ipa: incomingItem.ipa || baseItem.ipa,
    image: incomingItem.image || baseItem.image,
    known: Boolean(baseItem.known || incomingItem.known),
    difficult: Boolean(baseItem.difficult || incomingItem.difficult),
    studied: Boolean(baseItem.studied || incomingItem.studied),
  };
}

function cloneList(list) {
  return { ...list, items: list.items.map((item) => ({ ...item })) };
}

function getListMergeKey(list) {
  const normalizedName = normalizeForComparison(list.name);
  return normalizedName ? `name:${normalizedName}` : list.id;
}

function getItemMergeKey(item) {
  const normalizedEnglish = normalizeForComparison(item.english);
  return normalizedEnglish ? `english:${normalizedEnglish}` : item.id;
}

function payloadContentSignature(payload) {
  const normalized = normalizeStoragePayload(payload);
  return JSON.stringify({
    lists: normalized.lists,
    ipaCache: normalized.ipaCache,
    translationCache: normalized.translationCache,
    speechSettings: normalized.speechSettings,
  });
}

function applyStoragePayload(payload, options = {}) {
  const { fromDrive = false } = options;
  const normalized = normalizeStoragePayload(payload);
  state.lists = normalized.lists;
  state.ipaCache = normalized.ipaCache;
  state.translationCache = normalized.translationCache;
  state.speechSettings = {
    ...state.speechSettings,
    ...normalized.speechSettings,
  };
  state.storageSettings.driveUpdatedAt = normalized.updatedAt;
  state.activeListId = state.lists[0]?.id || null;
  state.activeIndex = 0;
  els.englishVoiceSelect.value = state.speechSettings.englishVoice;
  els.vietnameseVoiceSelect.value = state.speechSettings.vietnameseVoice;
  saveState({ markDirty: !fromDrive, skipDriveSave: fromDrive });
  render();
}

function supportsDriveFileAccess() {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
}

function isDriveSignedIn() {
  return Boolean(state.googleAccessToken);
}

function isDriveLocked() {
  return state.storageSettings.mode === 'drive' && !isDriveSignedIn();
}

function updateDriveLock() {
  const locked = isDriveLocked();
  els.driveLockOverlay.hidden = !locked;
  document.body.classList.toggle('drive-locked', locked);
  if (locked) {
    const hasClientId = Boolean(getGoogleClientId());
    els.driveLockHint.textContent = hasClientId
      ? t('driveLockHasClientId')
      : t('driveLockMissingClientId');
  }
}

function scheduleDriveSave() {
  if (state.storageSettings.mode !== 'drive') return;
  window.clearTimeout(state.driveSaveTimer);
  state.driveSaveTimer = window.setTimeout(() => {
    syncDrive({ pushLocal: true }).catch(() => {
      setStorageStatus(t('driveSyncFailed'));
    });
  }, 500);
}

async function writeDriveData() {
  await syncDrive({ pushLocal: true });
}

async function waitForGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return;
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(timer);
        resolve();
      } else if (attempts > 80) {
        window.clearInterval(timer);
        reject(new Error(t('googleIdentityNotLoaded')));
      }
    }, 100);
  });
}

async function requestDriveSignIn(prompt = 'consent') {
  const clientId = getGoogleClientId();
  if (!clientId) {
    openSettings();
    setStorageStatus('Vui lòng nhập Google OAuth Client ID trước khi đăng nhập Drive.');
    throw new Error('Missing Google OAuth Client ID');
  }

  await waitForGoogleIdentity();
  state.googleTokenClient = state.googleTokenClient || window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: () => {},
  });

  const tokenResponse = await new Promise((resolve, reject) => {
    state.googleTokenClient.callback = (response) => {
      if (response?.error) reject(new Error(response.error));
      else resolve(response);
    };
    state.googleTokenClient.requestAccessToken({ prompt });
  });

  state.googleAccessToken = tokenResponse.access_token;
  state.storageSettings.mode = 'drive';
  persistStorageSettings();
  updateDriveLock();
  await syncDrive({ pullRemote: true, pushLocal: true });
  startDriveAutoSync();
}

async function driveFetch(path, options = {}) {
  if (!state.googleAccessToken) throw new Error('Drive is not signed in');
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${state.googleAccessToken}`,
      ...(options.headers || {}),
    },
  });
  if (response.status === 401) {
    state.googleAccessToken = '';
    updateDriveLock();
  }
  if (!response.ok) throw new Error(`Google Drive API failed: ${response.status}`);
  return response;
}

async function findDriveDataFile() {
  if (state.storageSettings.driveFileId) return state.storageSettings.driveFileId;
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id,name,modifiedTime)',
    q: `name='${DRIVE_FILE_NAME}' and trashed=false`,
  });
  const response = await driveFetch(`${DRIVE_API_BASE}/files?${params}`);
  const data = await response.json();
  const file = data.files?.[0];
  if (file?.id) {
    state.storageSettings.driveFileId = file.id;
    state.storageSettings.driveFileName = file.name;
    persistStorageSettings();
  }
  return file?.id || '';
}

async function createDriveDataFile() {
  const boundary = `memrise_${Date.now()}`;
  const metadata = { name: DRIVE_FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' };
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(createStoragePayload(), null, 2),
    `--${boundary}--`,
  ].join('\r\n');
  const response = await driveFetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const file = await response.json();
  state.storageSettings.driveFileId = file.id;
  state.storageSettings.driveFileName = file.name || DRIVE_FILE_NAME;
  persistStorageSettings();
  return file.id;
}

async function readDrivePayload(fileId) {
  const response = await driveFetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`);
  return response.json();
}

async function updateDriveDataFile(fileId) {
  await driveFetch(`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(createStoragePayload(), null, 2),
  });
}

async function syncDrive(options = {}) {
  const { pullRemote = false, pushLocal = false } = options;
  if (state.storageSettings.mode !== 'drive' || !state.googleAccessToken || state.driveSyncInProgress) return;
  state.driveSyncInProgress = true;
  setStorageStatus('Đang đồng bộ với Google Drive...');

  try {
    let fileId = await findDriveDataFile();
    if (!fileId) {
      fileId = await createDriveDataFile();
      setStorageStatus(`Đã tạo ${DRIVE_FILE_NAME} trong Google Drive và bật tự động đồng bộ.`);
      return;
    }

    if (pullRemote) {
      const remotePayload = await readDrivePayload(fileId);
      const remoteTime = Date.parse(remotePayload?.updatedAt || '');
      const localTime = Date.parse(state.storageSettings.driveUpdatedAt || '');
      if (remoteTime && remoteTime > localTime) {
        const localPayload = createStoragePayload();
        if (pushLocal && payloadContentSignature(localPayload) !== payloadContentSignature(remotePayload)) {
          const mergedPayload = mergeStoragePayloads(localPayload, remotePayload);
          applyStoragePayload(mergedPayload, { fromDrive: true });
          await updateDriveDataFile(fileId);
          setStorageStatus(`Đã gộp dữ liệu cục bộ với bản mới trên Google Drive (${new Date(remoteTime).toLocaleString('vi-VN')}).`);
        } else {
          applyStoragePayload(remotePayload, { fromDrive: true });
          setStorageStatus(`Đã nhận dữ liệu mới từ Google Drive (${new Date(remoteTime).toLocaleString('vi-VN')}).`);
        }
        return;
      }
    }

    if (pushLocal) {
      await updateDriveDataFile(fileId);
      setStorageStatus(`Đã đồng bộ ${state.lists.length} danh sách với Google Drive.`);
    } else {
      setStorageStatus('Google Drive đã sẵn sàng. Không có thay đổi mới.');
    }
  } finally {
    state.driveSyncInProgress = false;
    renderStoragePanel();
  }
}

function startDriveAutoSync() {
  stopDriveAutoSync();
  if (state.storageSettings.mode !== 'drive' || !state.googleAccessToken) return;
  state.driveSyncTimer = window.setInterval(() => {
    syncDrive({ pullRemote: true }).catch(() => {
      setStorageStatus('Không thể kéo dữ liệu mới từ Google Drive. Hãy đăng nhập lại nếu phiên đã hết hạn.');
    });
  }, DRIVE_SYNC_INTERVAL);
}

function stopDriveAutoSync() {
  if (state.driveSyncTimer) window.clearInterval(state.driveSyncTimer);
  state.driveSyncTimer = null;
}

async function openDriveFile() {
  await requestDriveSignIn('consent');
}

async function saveDriveFile() {
  await syncDrive({ pushLocal: true });
}

function downloadDriveData() {
  const blob = new Blob([JSON.stringify(createStoragePayload(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = state.storageSettings.driveFileName || DRIVE_FILE_NAME;
  link.click();
  URL.revokeObjectURL(url);
}

async function importDriveData(file) {
  if (!file) return;
  const payload = JSON.parse(await file.text());
  state.storageSettings.mode = 'drive';
  state.storageSettings.driveFileName = file.name;
  els.storageModeSelect.value = 'drive';
  applyStoragePayload(payload);
  setStorageStatus(t('importedDrive', { fileName: file.name }));
}

function setStorageStatus(message) {
  els.storageStatus.textContent = message;
}

function renderStoragePanel() {
  const isDrive = state.storageSettings.mode === 'drive';
  const hasClientId = Boolean(getGoogleClientId());
  els.storageModeSelect.value = state.storageSettings.mode;
  els.googleClientIdInput.value = getGoogleClientId();
  els.googleClientIdField.hidden = !isDrive;
  els.driveSignInButton.hidden = !isDrive || isDriveSignedIn();
  els.driveSignOutButton.hidden = !isDrive || !isDriveSignedIn();
  els.driveSyncNowButton.hidden = !isDrive || !isDriveSignedIn();
  els.openDriveButton.hidden = true;
  els.saveDriveButton.hidden = true;
  els.exportDriveButton.hidden = !isDrive;
  els.importDriveInput.previousElementSibling.hidden = !isDrive;
  els.importDriveInput.hidden = true;

  if (!isDrive) {
    setStorageStatus(t('localStorageStatus'));
    return;
  }

  if (!hasClientId) {
    setStorageStatus(t('driveNeedsClientId'));
    return;
  }

  if (!isDriveSignedIn()) {
    setStorageStatus(t('driveNeedsSignIn'));
    return;
  }

  setStorageStatus(t('driveSignedIn', { fileName: DRIVE_FILE_NAME }));
}

function setOpenMenu(menuName) {
  state.openMenu = state.openMenu === menuName ? '' : menuName;
  renderTopMenus();
}

function closeTopMenus() {
  state.openMenu = '';
  renderTopMenus();
}

function renderTopMenus() {
  const isListMenuOpen = state.openMenu === 'lists';
  els.listMenu.hidden = !isListMenuOpen;
  els.listMenuButton.setAttribute('aria-expanded', String(isListMenuOpen));
  renderListMenu();
}

function openSettings() {
  openSidebar();
}

function openSidebar() {
  state.settingsOpen = true;
  closeTopMenus();
  els.settingsSidebar.classList.add('open');
  els.settingsSidebar.setAttribute('aria-hidden', 'false');
  els.settingsBackdrop.hidden = false;
}

function closeSettings() {
  state.settingsOpen = false;
  els.settingsSidebar.classList.remove('open');
  els.settingsSidebar.setAttribute('aria-hidden', 'true');
  els.settingsBackdrop.hidden = true;
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseInput(rawText) {
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const { english, vietnamese } = parseVocabularyLine(line);
      return {
        id: uid(),
        english,
        vietnamese,
        ipa: '',
        image: '',
        known: false,
        difficult: false,
        studied: false,
      };
    })
    .filter((item) => item.english);
}

function parseVocabularyLine(line) {
  if (line.includes('|')) {
    const [english, ...meaningParts] = line.split('|').map((part) => part.trim());
    return { english, vietnamese: meaningParts.filter(Boolean).join(' | ') };
  }

  const commaParts = splitCsvLine(line);
  if (commaParts.length > 1 && looksLikeVietnamese(commaParts.slice(1).join(', '))) {
    return {
      english: commaParts[0].trim(),
      vietnamese: commaParts.slice(1).map((part) => part.trim()).filter(Boolean).join(', '),
    };
  }

  return { english: line, vietnamese: '' };
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result.map((part) => part.trim()).filter(Boolean);
}

function looksLikeVietnamese(text) {
  return /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(text)
    || /\b(bạn|của|là|một|không|người|sự|cái|con|cho|với|trong|tiếng|nghĩa|xin|chào|cảm|ơn|toi|tôi|la|mot|khong|nguoi)\b/i.test(text);
}

function shouldRefreshVietnameseMeaning(text) {
  if (!text) return true;
  return !looksLikeVietnamese(text) && /^[a-z0-9\s.,!?'-]+$/i.test(text);
}

function getActiveList() {
  return state.lists.find((list) => list.id === state.activeListId) || state.lists[0] || null;
}

function normalizeKey(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, '').trim();
}

function getImageUrl(text) {
  const query = encodeURIComponent(normalizeKey(text).split(/\s+/).slice(0, 4).join(' ') || 'english learning');
  return `https://source.unsplash.com/1200x900/?${query},english,learning`;
}

async function enrichList(list) {
  await Promise.all(list.items.map(async (item) => {
    item.image = item.image || getImageUrl(item.english);
    const [ipa, vietnamese] = await Promise.all([
      item.ipa ? item.ipa : fetchIpa(item.english),
      shouldRefreshVietnameseMeaning(item.vietnamese) ? translateToVietnamese(item.english) : item.vietnamese,
    ]);
    item.ipa = ipa;
    item.vietnamese = vietnamese;
  }));
  saveState();
  renderFlashcard();
}

async function fetchIpa(text) {
  const key = normalizeKey(text);
  if (!key || key.includes(' ')) return '';
  if (state.ipaCache[key]) return state.ipaCache[key];

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`);
    if (!response.ok) throw new Error('Dictionary lookup failed');
    const data = await response.json();
    const phonetic = data?.[0]?.phonetics?.find((entry) => entry.text)?.text || data?.[0]?.phonetic || '';
    state.ipaCache[key] = phonetic;
    saveState();
    return phonetic;
  } catch {
    return '';
  }
}

async function translateToVietnamese(text) {
  const key = normalizeKey(text);
  if (state.translationCache[key]) return state.translationCache[key];

  try {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', 'en|vi');
    const response = await fetch(url);
    if (!response.ok) throw new Error('Translation lookup failed');
    const data = await response.json();
    const translated = pickBestVietnameseTranslation(data, text);
    state.translationCache[key] = translated;
    saveState();
    return translated;
  } catch {
    return t('missingVietnamese');
  }
}

function pickBestVietnameseTranslation(data, originalText) {
  const candidates = [
    data?.responseData?.translatedText,
    ...(data?.matches || [])
      .filter((match) => match?.translation)
      .sort((a, b) => (Number(b.quality) || 0) - (Number(a.quality) || 0))
      .map((match) => match.translation),
  ];

  const original = normalizeForComparison(originalText);
  const best = candidates
    .map(cleanTranslationText)
    .find((translation) => translation && normalizeForComparison(translation) !== original);

  return best || t('pendingVietnamese');
}

function cleanTranslationText(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = String(text || '').trim();
  return textarea.value.replace(/\s+/g, ' ').trim();
}

function normalizeForComparison(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ\s]/gi, '').trim();
}

function renderLists() {
  els.listCollection.innerHTML = '';
  const query = normalizeForComparison(state.listSearch);
  const visibleLists = state.lists.filter((list) => !query || normalizeForComparison(list.name).includes(query));
  if (!visibleLists.length) {
    els.listCollection.innerHTML = `<p class="hint">${t('noListsHint')}</p>`;
    return;
  }

  visibleLists.forEach((list) => {
    const card = els.listButtonTemplate.content.firstElementChild.cloneNode(true);
    const isActive = list.id === state.activeListId;
    const progressCurrent = isActive ? state.activeIndex + 1 : 0;
    const progressTotal = list.items.length;
    const progressRatio = progressTotal ? (progressCurrent / progressTotal) * 100 : 0;
    card.classList.toggle('active', isActive);
    card.querySelector('.list-name').textContent = list.name;
    card.querySelector('.list-count').textContent = t('wordsCount', { count: list.items.length });
    card.querySelector('.list-last-studied').textContent = t('lastStudied', { value: isActive ? t('justNow') : t('notYet') });
    card.querySelector('.list-progress-fill').style.width = `${progressRatio}%`;
    card.querySelector('.list-progress-text').textContent = `${progressCurrent}/${progressTotal}`;
    card.querySelector('.list-learn').textContent = t('learn');
    card.querySelector('.list-learn').setAttribute('title', t('learnTooltip'));
    card.querySelector('.list-edit').setAttribute('aria-label', t('edit'));
    card.querySelector('.list-edit').setAttribute('title', t('editTooltip'));
    card.querySelector('.list-delete').setAttribute('aria-label', t('delete'));
    card.querySelector('.list-delete').setAttribute('title', t('deleteTooltip'));
    card.querySelector('.list-learn').addEventListener('click', () => {
      openListDetail(list.id);
    });
    card.querySelector('.list-edit').addEventListener('click', (event) => {
      event.stopPropagation();
      openCreateListModal(list);
    });
    card.querySelector('.list-delete').addEventListener('click', (event) => {
      event.stopPropagation();
      state.activeListId = list.id;
      deleteActiveList();
    });
    card.addEventListener('click', () => card.querySelector('.list-learn').click());
    els.listCollection.append(card);
  });
}

function renderListMenu() {
  els.listMenuItems.innerHTML = '';

  if (!state.lists.length) {
    els.listMenuItems.innerHTML = `<p class="menu-empty">${t('noListsMenu')}</p>`;
  } else {
    state.lists.forEach((list) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.role = 'menuitem';
      button.className = 'menu-list-item';
      button.classList.toggle('active', list.id === state.activeListId);
      button.innerHTML = `<span>${escapeHtml(list.name)}</span><small>${t('itemsCount', { count: list.items.length })}</small>`;
      button.addEventListener('click', () => {
        state.activeListId = list.id;
        state.activeIndex = 0;
        closeTopMenus();
        render();
      });
      els.listMenuItems.append(button);
    });
  }
}

function deleteActiveList() {
  if (isDriveLocked()) return;
  const list = getActiveList();
  if (!list) return;
  state.lists = state.lists.filter((candidate) => candidate.id !== list.id);
  state.activeListId = state.lists[0]?.id || null;
  state.activeIndex = 0;
  stopAutoplay();
  saveState();
  closeTopMenus();
  render();
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}


function openListDetail(listId) {
  state.activeListId = listId;
  state.activeIndex = 0;
  state.activeView = 'detail';
  state.openPhraseActionId = null;
  stopAutoplay();
  render();
}

function setPhraseKnown(item, known) {
  item.known = known;
  if (known) item.studied = true;
  saveState();
  renderListDetail();
  renderLists();
}

function setPhraseDifficult(item, difficult) {
  item.difficult = difficult;
  saveState();
  renderListDetail();
}

function renderPhraseStatus(item) {
  const classes = ['phrase-status-icon'];
  if (item.known) classes.push('known');
  else if (item.studied) classes.push('learning');
  const label = item.known ? t('knownWord') : item.studied ? t('flashcard') : t('notYet');
  return `<span class="${classes.join(' ')}" aria-label="${escapeHtml(label)}">${item.known ? '✓' : ''}</span>`;
}

function renderListDetail() {
  if (!els.phraseList) return;
  const list = getActiveList();
  els.detailListTitle.textContent = list?.name || t('noListTitle');
  els.continueLearningButton.disabled = !list?.items?.length;
  els.markAllKnownButton.disabled = !list?.items?.length;
  els.phraseList.innerHTML = '';

  if (!list?.items?.length) {
    els.phraseList.innerHTML = `<p class="hint">${t('noListsHint')}</p>`;
    return;
  }

  list.items.forEach((item, index) => {
    const row = document.createElement('article');
    row.className = 'phrase-row';
    row.innerHTML = `
      <div class="phrase-meta">
        ${renderPhraseStatus(item)}
        <span class="difficulty-icon" ${item.difficult ? '' : 'hidden'} aria-label="${t('difficultWord')}" title="${t('difficultWord')}">⚡</span>
      </div>
      <div class="phrase-copy">
        <strong>${escapeHtml(item.english)}</strong>
        <span>${escapeHtml(item.vietnamese || t('pendingVietnamese'))}</span>
      </div>
      <div class="phrase-action-wrap">
        <button class="phrase-action-button" type="button" aria-label="${t('phraseActions')}" title="${t('phraseActions')}" aria-expanded="${state.openPhraseActionId === item.id}">…</button>
      </div>
    `;

    const actionWrap = row.querySelector('.phrase-action-wrap');
    const actionButton = row.querySelector('.phrase-action-button');
    actionButton.addEventListener('click', (event) => {
      event.stopPropagation();
      state.openPhraseActionId = state.openPhraseActionId === item.id ? null : item.id;
      renderListDetail();
    });

    if (state.openPhraseActionId === item.id) {
      const menu = document.createElement('div');
      menu.className = 'phrase-action-menu';
      const knownButton = document.createElement('button');
      knownButton.type = 'button';
      knownButton.textContent = item.known ? t('unmarkAsKnown') : t('markAsKnown');
      knownButton.addEventListener('click', (event) => {
        event.stopPropagation();
        state.openPhraseActionId = null;
        setPhraseKnown(item, !item.known);
      });
      const difficultButton = document.createElement('button');
      difficultButton.type = 'button';
      difficultButton.textContent = item.difficult ? t('unmarkAsDifficult') : t('markAsDifficult');
      difficultButton.addEventListener('click', (event) => {
        event.stopPropagation();
        state.openPhraseActionId = null;
        setPhraseDifficult(item, !item.difficult);
      });
      menu.append(knownButton, difficultButton);
      actionWrap.append(menu);
    }

    row.addEventListener('click', () => {
      state.activeIndex = index;
    });
    els.phraseList.append(row);
  });
}

function renderFlashcard() {
  const list = getActiveList();
  const hasItems = list?.items?.length;
  els.prevButton.disabled = !hasItems;
  els.nextButton.disabled = !hasItems;
  els.speakButton.disabled = !hasItems;
  els.playButton.disabled = !hasItems;
  els.playButton.setAttribute('title', t(state.autoplayTimer ? 'stopAutoplay' : 'autoplay'));

  if (!hasItems) {
    els.activeListTitle.textContent = t('noListTitle');
    els.progressText.textContent = '0/0';
    els.progressBar.style.width = '0%';
    els.cardBadge.textContent = t('ready');
    els.cardImage.removeAttribute('src');
    els.englishText.textContent = t('createFirstList');
    els.ipaText.textContent = '';
    els.vietnameseText.textContent = t('flashcardPlaceholder');
    return;
  }

  state.activeIndex = (state.activeIndex + list.items.length) % list.items.length;
  const item = list.items[state.activeIndex];
  if (state.activeView === 'flashcard' && !item.studied) {
    item.studied = true;
    saveState();
  }
  els.activeListTitle.textContent = list.name;
  els.progressText.textContent = `${state.activeIndex + 1}/${list.items.length}`;
  els.progressBar.style.width = `${((state.activeIndex + 1) / list.items.length) * 100}%`;
  els.cardBadge.textContent = state.autoplayTimer ? t('autoplaying') : t('flashcard');
  els.cardImage.src = item.image || getImageUrl(item.english);
  els.cardImage.alt = t('imageFor', { text: item.english });
  els.englishText.textContent = item.english;
  els.ipaText.textContent = item.ipa || t('loadingIpa');
  els.vietnameseText.textContent = item.vietnamese || t('translatingVietnamese');
}

function render() {
  applyTranslations();
  if (!state.activeListId && state.lists.length) state.activeListId = state.lists[0].id;
  els.listView.hidden = state.activeView !== 'lists';
  if (els.listDetailView) els.listDetailView.hidden = state.activeView !== 'detail';
  els.flashcardView.hidden = state.activeView !== 'flashcard';
  if (els.mainHeader) els.mainHeader.hidden = state.activeView !== 'lists';
  if (els.addListButton) els.addListButton.hidden = state.activeView !== 'lists';
  renderLists();
  renderListDetail();
  renderFlashcard();
  renderStoragePanel();
  renderTopMenus();
}


function openCreateListModal(list = null) {
  state.editingListId = list?.id || null;
  els.createListForm.reset();
  if (list) {
    els.listName.value = list.name;
    els.wordInput.value = list.items.map((item) => `${item.english} | ${item.vietnamese}`.trim()).join('\n');
  }
  els.fileInput.value = '';
  els.fileName.textContent = t('noFileSelected');
  els.createListModal.hidden = false;
  requestAnimationFrame(() => els.listName.focus());
}

function closeCreateListModal() {
  state.editingListId = null;
  els.createListModal.hidden = true;
  els.createListForm.reset();
  els.fileInput.value = '';
  els.fileName.textContent = t('noFileSelected');
}

function speakCurrentCard() {
  if (isDriveLocked()) return;
  const list = getActiveList();
  if (!list?.items.length) return;
  const item = list.items[state.activeIndex];
  const runId = state.speechRunId + 1;
  state.speechRunId = runId;
  stopSpeechPlayback();
  speak(item.english, getSpeechProfile('english'), 1);
  window.setTimeout(() => {
    if (runId === state.speechRunId) speakVietnamese(item.vietnamese || '');
  }, Math.min(2600, Math.max(1200, item.english.length * 90)));
}

function stopSpeechPlayback() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (state.vietnameseAudio) {
    state.vietnameseAudio.pause();
    state.vietnameseAudio = null;
  }
}

function speak(text, profile, rate) {
  if (!text || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = profile.lang;
  utterance.rate = rate;
  const voice = chooseVoice(profile);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  window.speechSynthesis.speak(utterance);
}

function speakVietnamese(text) {
  if (!text) return;

  playVietnameseTtsAudio(text).catch(() => {
    speak(text, getSpeechProfile('vietnamese'), 0.94);
  });
}

async function playVietnameseTtsAudio(text) {
  const chunks = splitSpeechText(text, 180);

  for (const chunk of chunks) {
    const url = new URL(VIETNAMESE_TTS_URL);
    url.searchParams.set('ie', 'UTF-8');
    url.searchParams.set('client', 'tw-ob');
    url.searchParams.set('tl', 'vi');
    url.searchParams.set('q', chunk);

    const audio = new Audio(url.toString());
    state.vietnameseAudio = audio;
    await playAudio(audio);
  }

  state.vietnameseAudio = null;
}

function playAudio(audio) {
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', resolve, { once: true });
    audio.addEventListener('error', reject, { once: true });
    audio.play().catch(reject);
  });
}

function splitSpeechText(text, maxLength) {
  const sentences = String(text).match(/[^.!?。！？]+[.!?。！？]?/g) || [text];
  const chunks = [];

  sentences.forEach((sentence) => {
    let current = sentence.trim();
    while (current.length > maxLength) {
      const splitAt = current.lastIndexOf(' ', maxLength);
      const cutIndex = splitAt > 0 ? splitAt : maxLength;
      chunks.push(current.slice(0, cutIndex).trim());
      current = current.slice(cutIndex).trim();
    }
    if (current) chunks.push(current);
  });

  return chunks;
}

function getSpeechProfile(language) {
  const profiles = {
    english: {
      'en-US-female': { lang: 'en-US', preferredNames: ['female', 'woman', 'samantha', 'zira', 'jenny', 'aria', 'susan', 'google us english'] },
      'en-US-male': { lang: 'en-US', preferredNames: ['male', 'man', 'david', 'guy', 'mark', 'google us english'] },
      'en-GB-female': { lang: 'en-GB', preferredNames: ['female', 'woman', 'sonia', 'libby', 'serena', 'kate', 'google uk english female'] },
      'en-GB-male': { lang: 'en-GB', preferredNames: ['male', 'man', 'ryan', 'george', 'daniel', 'google uk english male'] },
    },
    vietnamese: {
      'vi-VN-female-north': { lang: 'vi-VN', preferredNames: ['hoaimy', 'hoai my', 'female', 'woman', 'linh', 'an'] },
      'vi-VN-male-north': { lang: 'vi-VN', preferredNames: ['namminh', 'nam minh', 'male', 'man', 'minh'] },
    },
  };

  const settingKey = language === 'english' ? state.speechSettings.englishVoice : state.speechSettings.vietnameseVoice;
  return profiles[language][settingKey] || Object.values(profiles[language])[0];
}

function chooseVoice(profile) {
  const voices = state.availableVoices.length ? state.availableVoices : window.speechSynthesis.getVoices();
  const exactLangVoices = voices.filter((voice) => voice.lang.toLowerCase() === profile.lang.toLowerCase());
  const languageVoices = exactLangVoices.length
    ? exactLangVoices
    : voices.filter((voice) => voice.lang.toLowerCase().startsWith(profile.lang.slice(0, 2).toLowerCase()));

  return languageVoices.find((voice) => profile.preferredNames.some((name) => voice.name.toLowerCase().includes(name)))
    || languageVoices[0]
    || null;
}

function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  state.availableVoices = window.speechSynthesis.getVoices();
}

function moveCard(step) {
  if (isDriveLocked()) return;
  const list = getActiveList();
  if (!list?.items.length) return;
  state.activeIndex = (state.activeIndex + step + list.items.length) % list.items.length;
  renderFlashcard();
  speakCurrentCard();
}

function startAutoplay() {
  const seconds = Math.max(3, Number(els.intervalInput.value) || 7);
  stopAutoplay(false);
  els.playButton.textContent = t('stopAutoplay');
  els.playButton.setAttribute('title', t('stopAutoplay'));
  renderFlashcard();
  speakCurrentCard();
  state.autoplayTimer = window.setInterval(() => moveCard(1), seconds * 1000);
}

function stopAutoplay(updateButton = true) {
  if (state.autoplayTimer) window.clearInterval(state.autoplayTimer);
  state.autoplayTimer = null;
  if (updateButton) {
    els.playButton.textContent = t('autoplay');
    els.playButton.setAttribute('title', t('autoplay'));
  }
  renderFlashcard();
}

els.createListForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isDriveLocked()) return;
  const items = parseInput(els.wordInput.value);
  if (!items.length) return;
  const name = els.listName.value.trim();
  const existingList = state.editingListId
    ? state.lists.find((list) => list.id === state.editingListId)
    : state.lists.find((list) => list.name.toLowerCase() === name.toLowerCase());
  const list = existingList || { id: uid(), name, items: [] };
  list.name = name;
  if (existingList) {
    const statusByKey = new Map(existingList.items.map((item) => [getItemMergeKey(item), item]));
    items.forEach((item) => {
      const previousItem = statusByKey.get(getItemMergeKey(item));
      if (!previousItem) return;
      item.known = previousItem.known;
      item.difficult = previousItem.difficult;
      item.studied = previousItem.studied;
    });
  }
  list.items = items;
  if (!existingList) state.lists.unshift(list);
  state.activeListId = list.id;
  state.activeIndex = 0;
  saveState();
  closeCreateListModal();
  render();
  await enrichList(list);
});

els.fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  els.fileName.textContent = file.name;
  els.wordInput.value = await file.text();
  if (!els.listName.value.trim()) els.listName.value = file.name.replace(/\.[^.]+$/, '');
});

els.addListButton?.addEventListener('click', () => {
  openCreateListModal();
});
els.closeCreateListButton?.addEventListener('click', () => {
  closeCreateListModal();
});
els.createListModal?.addEventListener('click', (event) => {
  if (event.target.classList.contains('create-modal') || event.target.classList.contains('create-modal-backdrop')) {
    closeCreateListModal();
  }
});
els.listSearchInput?.addEventListener('input', () => {
  state.listSearch = els.listSearchInput.value;
  renderLists();
});

els.prevButton.addEventListener('click', () => moveCard(-1));
els.nextButton.addEventListener('click', () => moveCard(1));
els.speakButton.addEventListener('click', speakCurrentCard);
els.playButton.addEventListener('click', () => (state.autoplayTimer ? stopAutoplay() : startAutoplay()));
els.flashcard.addEventListener('click', speakCurrentCard);
els.intervalInput.addEventListener('change', () => {
  if (state.autoplayTimer) startAutoplay();
});
els.englishVoiceSelect.addEventListener('change', () => {
  state.speechSettings.englishVoice = els.englishVoiceSelect.value;
  saveState();
});
els.vietnameseVoiceSelect.addEventListener('change', () => {
  state.speechSettings.vietnameseVoice = els.vietnameseVoiceSelect.value;
  saveState();
});

els.listMenuButton?.addEventListener('click', (event) => {
  event.stopPropagation();
  setOpenMenu('lists');
});
els.settingsButton.addEventListener('click', (event) => {
  event.stopPropagation();
  openSidebar();
});
els.listMenu?.addEventListener('click', (event) => event.stopPropagation());
els.focusCreateListButton?.addEventListener('click', () => {
  closeTopMenus();
  els.createListForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  els.listName.focus();
});
els.closeSettingsButton.addEventListener('click', closeSettings);
els.settingsBackdrop.addEventListener('click', closeSettings);
document.addEventListener('click', () => {
  closeTopMenus();
  if (state.openPhraseActionId) {
    state.openPhraseActionId = null;
    renderListDetail();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeTopMenus();
    if (state.settingsOpen) closeSettings();
    if (!els.createListModal.hidden) closeCreateListModal();
  }
});


document.querySelectorAll('[data-screen-target]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.querySelector(`#${button.dataset.screenTarget}`);
    if (!target) return;
    if (button.dataset.screenTarget === 'settingsButton') {
      openSidebar();
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.focus?.();
  });
});

els.googleClientIdInput.addEventListener('change', () => {
  saveGoogleClientId(els.googleClientIdInput.value);
});

els.storageModeSelect.addEventListener('change', () => {
  state.storageSettings.mode = els.storageModeSelect.value;
  if (state.storageSettings.mode === 'local') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lists));
    state.googleAccessToken = '';
    state.driveFileHandle = null;
    stopDriveAutoSync();
  }
  saveState({ markDirty: false });
  if (state.storageSettings.mode === 'drive') {
    requestDriveSignIn('consent').catch(() => {
      setStorageStatus(t('signInBeforeDrive'));
    });
  }
});

els.darkModeToggle.addEventListener('click', () => {
  state.uiSettings.darkMode = !state.uiSettings.darkMode;
  saveUiSettings();
  applyTheme();
});

els.uiLanguageSelect?.addEventListener('change', () => {
  state.uiSettings.uiLanguage = els.uiLanguageSelect.value;
  saveUiSettings();
  render();
});

els.languagePairSelect.addEventListener('change', () => {
  state.uiSettings.languagePair = els.languagePairSelect.value;
  saveUiSettings();
});

els.driveSignInButton.addEventListener('click', () => {
  requestDriveSignIn('consent').catch(() => {
    setStorageStatus(t('driveSignInFailed'));
  });
});

els.unlockDriveButton.addEventListener('click', () => {
  requestDriveSignIn('consent').catch(() => {
    openSettings();
    setStorageStatus(t('driveUnlockFailed'));
  });
});

els.driveSyncNowButton.addEventListener('click', () => {
  syncDrive({ pullRemote: true, pushLocal: true }).catch(() => {
    setStorageStatus(t('manualSyncFailed'));
  });
});

els.driveSignOutButton.addEventListener('click', () => {
  if (state.googleAccessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(state.googleAccessToken, () => {});
  }
  state.googleAccessToken = '';
  stopDriveAutoSync();
  updateDriveLock();
  renderStoragePanel();
});

els.openDriveButton.addEventListener('click', () => {
  openDriveFile().catch(() => {
    setStorageStatus(t('openDriveFailed'));
  });
});

els.saveDriveButton.addEventListener('click', () => {
  saveDriveFile().catch(() => {
    setStorageStatus(t('saveDriveFailed'));
  });
});

els.exportDriveButton.addEventListener('click', downloadDriveData);
els.importDriveInput.addEventListener('change', (event) => {
  importDriveData(event.target.files?.[0]).catch(() => {
    setStorageStatus(t('invalidDriveFile'));
  });
  event.target.value = '';
});

document.addEventListener('keydown', (event) => {
  if (isDriveLocked() || state.activeView !== 'flashcard') return;
  if (event.key === 'ArrowRight') moveCard(1);
  if (event.key === 'ArrowLeft') moveCard(-1);
  if (event.key === ' ') {
    event.preventDefault();
    speakCurrentCard();
  }
});


els.backFromDetailButton?.addEventListener('click', () => {
  state.activeView = 'lists';
  state.openPhraseActionId = null;
  render();
});

els.continueLearningButton?.addEventListener('click', () => {
  if (!getActiveList()?.items?.length || isDriveLocked()) return;
  state.activeView = 'flashcard';
  state.openPhraseActionId = null;
  stopAutoplay();
  render();
});

els.markAllKnownButton?.addEventListener('click', () => {
  const list = getActiveList();
  if (!list?.items?.length || isDriveLocked()) return;
  list.items.forEach((item) => {
    item.known = true;
    item.studied = true;
  });
  state.openPhraseActionId = null;
  saveState();
  render();
});

els.englishVoiceSelect.value = state.speechSettings.englishVoice;
els.vietnameseVoiceSelect.value = state.speechSettings.vietnameseVoice;
loadVoices();
if ('speechSynthesis' in window) {
  if (typeof window.speechSynthesis.addEventListener === 'function') {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

els.googleClientIdInput.value = getGoogleClientId();
els.uiLanguageSelect.value = getUiLanguage();
els.languagePairSelect.value = state.uiSettings.languagePair;
applyTheme();
render();
updateDriveLock();
els.backToListsButton?.addEventListener('click', () => {
  state.activeView = 'detail';
  state.openPhraseActionId = null;
  render();
});
