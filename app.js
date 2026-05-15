const STORAGE_KEY = 'memrise-mini-lists-v1';
const IPA_CACHE_KEY = 'memrise-mini-ipa-cache-v1';
const TRANSLATION_CACHE_KEY = 'memrise-mini-translation-cache-v2';
const SPEECH_SETTINGS_KEY = 'memrise-mini-speech-settings-v1';

const els = {
  createListForm: document.querySelector('#createListForm'),
  listName: document.querySelector('#listName'),
  wordInput: document.querySelector('#wordInput'),
  fileInput: document.querySelector('#fileInput'),
  fileName: document.querySelector('#fileName'),
  demoButton: document.querySelector('#demoButton'),
  listCollection: document.querySelector('#listCollection'),
  deleteListButton: document.querySelector('#deleteListButton'),
  activeListTitle: document.querySelector('#activeListTitle'),
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
};

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

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lists));
  localStorage.setItem(IPA_CACHE_KEY, JSON.stringify(state.ipaCache));
  localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(state.translationCache));
  localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(state.speechSettings));
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
    return 'Chưa có nghĩa tiếng Việt. Hãy nhập nghĩa sau dấu “|” để lưu thủ công.';
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

  return best || 'Đang chờ dịch nghĩa tiếng Việt';
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
  if (!state.lists.length) {
    els.listCollection.innerHTML = '<p class="hint">Chưa có danh sách nào. Hãy tạo danh sách hoặc nạp bộ mẫu.</p>';
    return;
  }

  state.lists.forEach((list) => {
    const button = els.listButtonTemplate.content.firstElementChild.cloneNode(true);
    button.classList.toggle('active', list.id === state.activeListId);
    button.querySelector('.list-name').textContent = list.name;
    button.querySelector('.list-count').textContent = `${list.items.length} mục`;
    button.addEventListener('click', () => {
      state.activeListId = list.id;
      state.activeIndex = 0;
      stopAutoplay();
      render();
    });
    els.listCollection.append(button);
  });
}

function renderFlashcard() {
  const list = getActiveList();
  const hasItems = list?.items?.length;
  els.prevButton.disabled = !hasItems;
  els.nextButton.disabled = !hasItems;
  els.speakButton.disabled = !hasItems;
  els.playButton.disabled = !hasItems;
  els.deleteListButton.disabled = !list;

  if (!hasItems) {
    els.activeListTitle.textContent = 'Chưa có danh sách';
    els.progressText.textContent = '0/0';
    els.progressBar.style.width = '0%';
    els.cardBadge.textContent = 'Sẵn sàng';
    els.cardImage.removeAttribute('src');
    els.englishText.textContent = 'Hãy tạo danh sách đầu tiên';
    els.ipaText.textContent = '';
    els.vietnameseText.textContent = 'Flashcard sẽ xuất hiện tại đây.';
    return;
  }

  state.activeIndex = (state.activeIndex + list.items.length) % list.items.length;
  const item = list.items[state.activeIndex];
  els.activeListTitle.textContent = list.name;
  els.progressText.textContent = `${state.activeIndex + 1}/${list.items.length}`;
  els.progressBar.style.width = `${((state.activeIndex + 1) / list.items.length) * 100}%`;
  els.cardBadge.textContent = state.autoplayTimer ? 'Đang tự động chạy' : 'Flashcard';
  els.cardImage.src = item.image || getImageUrl(item.english);
  els.cardImage.alt = `Ảnh minh họa cho ${item.english}`;
  els.englishText.textContent = item.english;
  els.ipaText.textContent = item.ipa || 'Đang tìm IPA...';
  els.vietnameseText.textContent = item.vietnamese || 'Đang dịch nghĩa tiếng Việt...';
}

function render() {
  if (!state.activeListId && state.lists.length) state.activeListId = state.lists[0].id;
  renderLists();
  renderFlashcard();
}

function speakCurrentCard() {
  const list = getActiveList();
  if (!list?.items.length) return;
  const item = list.items[state.activeIndex];
  window.speechSynthesis.cancel();
  speak(item.english, getSpeechProfile('english'), 1);
  window.setTimeout(() => speak(item.vietnamese || '', getSpeechProfile('vietnamese'), 0.94), Math.min(2600, Math.max(1200, item.english.length * 90)));
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
  const list = getActiveList();
  if (!list?.items.length) return;
  state.activeIndex = (state.activeIndex + step + list.items.length) % list.items.length;
  renderFlashcard();
  speakCurrentCard();
}

function startAutoplay() {
  const seconds = Math.max(3, Number(els.intervalInput.value) || 7);
  stopAutoplay(false);
  els.playButton.textContent = 'Dừng tự động';
  renderFlashcard();
  speakCurrentCard();
  state.autoplayTimer = window.setInterval(() => moveCard(1), seconds * 1000);
}

function stopAutoplay(updateButton = true) {
  if (state.autoplayTimer) window.clearInterval(state.autoplayTimer);
  state.autoplayTimer = null;
  if (updateButton) els.playButton.textContent = 'Tự động chạy';
  renderFlashcard();
}

els.createListForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const items = parseInput(els.wordInput.value);
  if (!items.length) return;
  const name = els.listName.value.trim();
  const existingList = state.lists.find((list) => list.name.toLowerCase() === name.toLowerCase());
  const list = existingList || { id: uid(), name, items: [] };
  list.name = name;
  list.items = items;
  if (!existingList) state.lists.unshift(list);
  state.activeListId = list.id;
  state.activeIndex = 0;
  saveState();
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

els.demoButton.addEventListener('click', async () => {
  const list = { id: uid(), name: 'Bộ mẫu du lịch & công việc', items: demoItems.map((item) => ({ id: uid(), ipa: '', image: '', ...item })) };
  state.lists.unshift(list);
  state.activeListId = list.id;
  state.activeIndex = 0;
  saveState();
  render();
  await enrichList(list);
});

els.deleteListButton.addEventListener('click', () => {
  const list = getActiveList();
  if (!list) return;
  state.lists = state.lists.filter((candidate) => candidate.id !== list.id);
  state.activeListId = state.lists[0]?.id || null;
  state.activeIndex = 0;
  stopAutoplay();
  saveState();
  render();
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') moveCard(1);
  if (event.key === 'ArrowLeft') moveCard(-1);
  if (event.key === ' ') {
    event.preventDefault();
    speakCurrentCard();
  }
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

render();
