const STORAGE_KEY = 'memrise-mini-lists-v1';
const IPA_CACHE_KEY = 'memrise-mini-ipa-cache-v1';
const TRANSLATION_CACHE_KEY = 'memrise-mini-translation-cache-v1';

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
  listButtonTemplate: document.querySelector('#listButtonTemplate'),
};

const state = {
  lists: loadJson(STORAGE_KEY, []),
  ipaCache: loadJson(IPA_CACHE_KEY, {}),
  translationCache: loadJson(TRANSLATION_CACHE_KEY, {}),
  activeListId: null,
  activeIndex: 0,
  autoplayTimer: null,
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
      const separator = line.includes('|') ? '|' : ',';
      const parts = line.split(separator).map((part) => part.trim()).filter(Boolean);
      return {
        id: uid(),
        english: parts[0],
        vietnamese: parts.slice(1).join(separator === '|' ? ' | ' : ', '),
        ipa: '',
        image: '',
      };
    })
    .filter((item) => item.english);
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
      item.vietnamese ? item.vietnamese : translateToVietnamese(item.english),
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
    const translated = data?.responseData?.translatedText || 'Đang chờ dịch nghĩa tiếng Việt';
    state.translationCache[key] = translated;
    saveState();
    return translated;
  } catch {
    return 'Chưa có nghĩa tiếng Việt. Hãy nhập nghĩa sau dấu “|” để lưu thủ công.';
  }
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
  speak(item.english, 'en-US', 1);
  window.setTimeout(() => speak(item.vietnamese || '', 'vi-VN', 0.94), Math.min(2600, Math.max(1200, item.english.length * 90)));
}

function speak(text, lang, rate) {
  if (!text || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
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

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') moveCard(1);
  if (event.key === 'ArrowLeft') moveCard(-1);
  if (event.key === ' ') {
    event.preventDefault();
    speakCurrentCard();
  }
});

render();
