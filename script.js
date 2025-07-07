// --- 要素の取得 (一部) ---
const feedbackOverlay = document.getElementById('feedback-overlay');
// ... 他の要素取得は前のバージョンと同じ ...
const learningView = document.getElementById('learningView');
const listView = document.getElementById('listView');
const showLearningViewBtn = document.getElementById('showLearningViewBtn');
const showListViewBtn = document.getElementById('showListViewBtn');
const deckSelector = document.getElementById('deckSelector');
const addDeckBtn = document.getElementById('addDeckBtn');
const renameDeckBtn = document.getElementById('renameDeckBtn');
const deleteDeckBtn = document.getElementById('deleteDeckBtn');
const randomModeCheckbox = document.getElementById('randomMode');
const card = document.getElementById('card');
const cardFront = document.querySelector('.card-front');
const cardBack = document.querySelector('.card-back');
const wordStatsEl = document.getElementById('word-stats');
const memorizedBtn = document.getElementById('memorizedBtn');
const notMemorizedBtn = document.getElementById('notMemorizedBtn');
const addBtn = document.getElementById('addBtn');
const newFrontInput = document.getElementById('newFront');
const newBackInput = document.getElementById('newBack');
const reviewModeCheckbox = document.getElementById('reviewMode');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const toggleBulkAddBtn = document.getElementById('toggleBulkAddBtn');
const bulkAddContainer = document.getElementById('bulkAddContainer');
const bulkWordInput = document.getElementById('bulkWordInput');
const bulkAddSubmitBtn = document.getElementById('bulkAddSubmitBtn');
const bulkAddCancelBtn = document.getElementById('bulkAddCancelBtn');
const wordListContainer = document.getElementById('wordListContainer');
const listTitle = document.getElementById('listTitle');


// --- グローバル変数 ---
let appData = {};
let currentDeckName = '';
let currentIndex = -1;
let currentWordList = [];
let isJudging = false; // 判定中のアニメーション連打を防ぐフラグ

// --- 関数定義 (主要なもの以外は省略) ---
function saveData() { /* ... */ }
function loadData() { /* ... */ }
function populateDeckSelector() { /* ... */ }
function updateStatus() { /* ... */ }
function shuffle(array) { /* ... */ }
function displayWord() { /* ... */ }
function displayStats() { /* ... */ }
function generateWordList() { /* ... */ }
function toggleView(viewToShow) { /* ... */ }
function renderWordList() { /* ... */ }
function handleListClick(e) { /* ... */ }
function editWord(index) { /* ... */ }
function deleteWord(index) { /* ... */ }
function handleDeckChange() { /* ... */ }
function addDeck() { /* ... */ }
function renameDeck() { /* ... */ }
function deleteDeck() { /* ... */ }
function addWord() { /* ... */ }
function addBulkWords() { /* ... */ }
function resetProgress() { /* ... */ }


// --- アニメーション再生 ---
function playFeedbackAnimation(isCorrect) {
    const resultClass = isCorrect ? 'correct' : 'incorrect';
    feedbackOverlay.className = 'show ' + resultClass; // 古いクラスを消して新しいクラスを設定

    // アニメーション終了後にクラスをクリア
    feedbackOverlay.addEventListener('animationend', () => {
        feedbackOverlay.className = '';
    }, { once: true }); // イベントリスナーを一度だけ実行
}


// --- 判定ロジック (更新) ---
function judgeWord(isCorrect) {
    if (isJudging || currentIndex < 0 || currentWordList.length === 0) return;

    isJudging = true; // 判定開始
    playFeedbackAnimation(isCorrect);

    // データ更新
    const wordToUpdate = currentWordList[currentIndex];
    if (isCorrect) {
        wordToUpdate.correctCount++;
        wordToUpdate.memorized = true;
    } else {
        wordToUpdate.incorrectCount++;
        wordToUpdate.memorized = false;
    }
    saveData();
    updateStatus();

    // アニメーションの時間（少し短め）待ってから次の単語へ
    setTimeout(() => {
        currentIndex++;
        displayWord();
        isJudging = false; // 判定終了
    }, 250);
}


// --- イベントリスナー設定 ---
showLearningViewBtn.addEventListener('click', () => toggleView('learning'));
showListViewBtn.addEventListener('click', () => toggleView('list'));
wordListContainer.addEventListener('click', handleListClick);

deckSelector.addEventListener('change', handleDeckChange);
addDeckBtn.addEventListener('click', addDeck);
renameDeckBtn.addEventListener('click', renameDeck);
deleteDeckBtn.addEventListener('click', deleteDeck);

randomModeCheckbox.addEventListener('change', generateWordList);
reviewModeCheckbox.addEventListener('change', generateWordList);

card.addEventListener('click', () => { if (currentWordList.length > 0) card.classList.toggle('is-flipped'); });

document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (learningView.classList.contains('hidden')) return;
    
    if (e.key === 'ArrowRight') judgeWord(true);
    else if (e.key === 'ArrowLeft') judgeWord(false);
    else if (e.key === ' ') { e.preventDefault(); card.click(); }
});

addBtn.addEventListener('click', addWord);
newBackInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addBtn.click(); });

memorizedBtn.addEventListener('click', () => judgeWord(true));
notMemorizedBtn.addEventListener('click', () => judgeWord(false));
resetBtn.addEventListener('click', resetProgress);

toggleBulkAddBtn.addEventListener('click', () => bulkAddContainer.classList.toggle('hidden'));
bulkAddCancelBtn.addEventListener('click', () => { bulkAddContainer.classList.add('hidden'); bulkWordInput.value = ''; });
bulkAddSubmitBtn.addEventListener('click', addBulkWords);


// --- 初期化処理 ---
function init() {
    loadData();
    populateDeckSelector();
    currentDeckName = appData.lastSelectedDeck && appData.decks[appData.lastSelectedDeck] ? appData.lastSelectedDeck : Object.keys(appData.decks)[0];
    deckSelector.value = currentDeckName;
    toggleView('learning');
    generateWordList();
}

// --- 省略された関数の実装 ---
function saveData() {appData.lastSelectedDeck = currentDeckName; localStorage.setItem('myVocabularyApp_data', JSON.stringify(appData));}
function loadData() {const d = localStorage.getItem('myVocabularyApp_data'); if (d) {appData = JSON.parse(d); if (!appData.decks || Object.keys(appData.decks).length === 0) {appData = JSON.parse(JSON.stringify(initialData));}} else {appData = JSON.parse(JSON.stringify(initialData));}}
function populateDeckSelector() {deckSelector.innerHTML = ''; Object.keys(appData.decks).forEach(name => {const o = document.createElement('option'); o.value = name; o.textContent = name; deckSelector.appendChild(o);});}
function updateStatus() {const w = appData.decks[currentDeckName] || []; const m = w.filter(i => i.memorized).length; statusEl.textContent = `全${w.length}単語中、${m}単語を学習済み`;}
function shuffle(array) {for (let i = array.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]];} return array;}
function displayWord() {card.classList.remove('is-flipped'); setTimeout(() => {if (currentWordList.length === 0) {cardFront.textContent = "学習する単語がありません"; cardBack.textContent = reviewModeCheckbox.checked ? "復習完了です！" : "単語を追加してください"; displayStats(); return;} if (currentIndex >= currentWordList.length) currentIndex = 0; if (currentIndex < 0) currentIndex = currentWordList.length - 1; const w = currentWordList[currentIndex]; cardFront.textContent = w.front; cardBack.textContent = w.back; displayStats();}, 150);}
function displayStats() {if (currentIndex < 0 || currentWordList.length === 0) {wordStatsEl.innerHTML = ''; return;} const w = currentWordList[currentIndex]; const c = `<span class="stat-correct">${'●'.repeat(w.correctCount || 0)}</span>`; const i = `<span class="stat-incorrect">${'×'.repeat(w.incorrectCount || 0)}</span>`; wordStatsEl.innerHTML = c + i;}
function generateWordList() {const s = appData.decks[currentDeckName] || []; let f = [...s]; if (reviewModeCheckbox.checked) {f = f.filter(w => !w.memorized);} currentWordList = randomModeCheckbox.checked ? shuffle(f) : f; currentIndex = 0; updateStatus(); displayWord(); renderWordList();}
function toggleView(v) {if (v === 'learning') {learningView.classList.remove('hidden'); listView.classList.add('hidden'); showLearningViewBtn.classList.add('active'); showListViewBtn.classList.remove('active');} else {learningView.classList.add('hidden'); listView.classList.remove('hidden'); showLearningViewBtn.classList.remove('active'); showListViewBtn.classList.add('active'); renderWordList();}}
function renderWordList() {listTitle.textContent = `「${currentDeckName}」の単語一覧`; const w = appData.decks[currentDeckName] || []; if (w.length === 0) {wordListContainer.innerHTML = '<p style="text-align:center; padding: 20px;">このセットには単語がありません。</p>'; return;} let h = '<table class="word-list-table"><thead><tr><th>単語 / 意味 (クリックで切替)</th><th>成績</th><th>操作</th></tr></thead><tbody>'; w.forEach((d, i) => {const s = `<span class="stat-correct">${'●'.repeat(d.correctCount||0)}</span><span class="stat-incorrect">${'×'.repeat(d.incorrectCount||0)}</span>`; h += `<tr><td class="word-toggle" data-index="${i}">${d.front}</td><td>${s}</td><td><button class="btn btn-secondary list-op-btn" data-edit-index="${i}">編集</button><button class="btn reset-btn list-op-btn" data-delete-index="${i}">削除</button></td></tr>`;}); h += '</tbody></table>'; wordListContainer.innerHTML = h;}
function handleListClick(e) {const t = e.target; if (t.matches('.word-toggle')) {const i = parseInt(t.dataset.index, 10); const w = appData.decks[currentDeckName][i]; if (t.textContent === w.front) {t.textContent = w.back; t.classList.add('is-back');} else {t.textContent = w.front; t.classList.remove('is-back');}} if (t.matches('[data-edit-index]')) {editWord(parseInt(t.dataset.editIndex, 10));} if (t.matches('[data-delete-index]')) {deleteWord(parseInt(t.dataset.deleteIndex, 10));}}
function editWord(i) {const w = appData.decks[currentDeckName][i]; const f = prompt('単語:', w.front); if(f===null)return; const b = prompt('意味:', w.back); if(b===null)return; w.front = f.trim(); w.back = b.trim(); saveData(); generateWordList();}
function deleteWord(i) {if (confirm('本当にこの単語を削除しますか？')) {appData.decks[currentDeckName].splice(i, 1); saveData(); generateWordList();}}
function handleDeckChange() {currentDeckName = deckSelector.value; generateWordList();}
function addDeck() {const n = prompt("新しい単語セットの名前:"); if (n && n.trim()) {if (appData.decks[n.trim()]) {alert("同名セットあり"); return;} currentDeckName = n.trim(); appData.decks[currentDeckName] = []; populateDeckSelector(); deckSelector.value = currentDeckName; generateWordList(); saveData();}}
function renameDeck() {const o = currentDeckName; if (!o) return; const n = prompt(`「${o}」の新しい名前:`, o); if (n && n.trim() && n.trim() !== o) {if (appData.decks[n.trim()]) {alert("同名セットあり"); return;} appData.decks[n.trim()] = appData.decks[o]; delete appData.decks[o]; currentDeckName = n.trim(); populateDeckSelector(); deckSelector.value = currentDeckName; saveData(); renderWordList();}}
function deleteDeck() {if (Object.keys(appData.decks).length <= 1) {alert("最後のセットは削除できません"); return;} if (confirm(`「${currentDeckName}」を削除しますか？`)) {delete appData.decks[currentDeckName]; currentDeckName = Object.keys(appData.decks)[0]; populateDeckSelector(); deckSelector.value = currentDeckName; generateWordList(); saveData();}}
function addWord() {const f = newFrontInput.value.trim(); const b = newBackInput.value.trim(); if (f && b) {const w = appData.decks[currentDeckName]; if (w.some(i => i.front.toLowerCase() === f.toLowerCase())) {alert("同単語あり"); return;} w.push({ front: f, back: b, memorized: false, correctCount: 0, incorrectCount: 0 }); saveData(); generateWordList(); newFrontInput.value = ""; newBackInput.value = "";} else {alert("単語と意味を入力");}}
function addBulkWords() {const t = bulkWordInput.value.trim(); if (!t) {alert("空です"); return;} const l = t.split('\n'); let a = 0, s = 0; const w = appData.decks[currentDeckName]; l.forEach(i => {i = i.trim(); if (!i) return; const p = i.includes(',') ? i.split(',') : i.split('\t'); if (p.length < 2) return; const f = p[0].trim(); const b = p.slice(1).join(',').trim(); if (!f || !b) return; if (w.some(d => d.front.toLowerCase() === f.toLowerCase())) {s++;} else {w.push({ front: f, back: b, memorized: false, correctCount: 0, incorrectCount: 0 }); a++;}}); if (a > 0) {saveData(); generateWordList();} bulkWordInput.value = ''; bulkAddContainer.classList.add('hidden'); alert(`${a}件追加、${s}件スキップ`);}
function resetProgress() {if (confirm(`「${currentDeckName}」の成績をリセットしますか？`)) {appData.decks[currentDeckName].forEach(w => {w.memorized = false; w.correctCount = 0; w.incorrectCount = 0;}); saveData(); generateWordList(); alert("リセット完了");}}

init();