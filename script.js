// --- 要素の取得 ---
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
const feedbackOverlay = document.getElementById('feedback-overlay');

// --- グローバル変数 ---
let appData = {};
let currentDeckName = '';
let currentIndex = -1;
let currentWordList = [];
let isJudging = false;

// --- 関数定義 ---
function saveData() {
    appData.lastSelectedDeck = currentDeckName;
    localStorage.setItem('myVocabularyApp_data', JSON.stringify(appData));
}

function loadData() {
    const savedData = localStorage.getItem('myVocabularyApp_data');
    if (savedData) {
        appData = JSON.parse(savedData);
        if (!appData.decks || Object.keys(appData.decks).length === 0) {
            // データはあるがデッキがない場合、初期化プロセスへ
            initializeFromScratch();
        }
    } else {
        // localStorageにデータがない場合、完全に初めての初期化
        initializeFromScratch();
    }
}

function initializeFromScratch() {
    // localStorageにデータがない場合、またはデータが不完全な場合の初期化処理
    appData = {
        decks: {},
        lastSelectedDeck: Object.keys(initialDecksData)[0] || ''
    };

    // data.js のシンプルなデータを、プログラム用の完全なオブジェクト形式に変換
    for (const deckName in initialDecksData) {
        const wordArray = initialDecksData[deckName];
        appData.decks[deckName] = [];
        for (let i = 0; i < wordArray.length; i += 2) {
            const front = wordArray[i];
            const back = wordArray[i + 1];
            if (front && back) { // frontとbackが両方存在することを確認
                appData.decks[deckName].push({
                    front: front,
                    back: back,
                    memorized: false,
                    correctCount: 0,
                    incorrectCount: 0
                });
            }
        }
    }
    saveData(); // 変換したデータをlocalStorageに保存
}

function populateDeckSelector() {
    deckSelector.innerHTML = '';
    Object.keys(appData.decks).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        deckSelector.appendChild(option);
    });
}

function updateStatus() {
    const words = appData.decks[currentDeckName] || [];
    const memorizedCount = words.filter(word => word.memorized).length;
    statusEl.textContent = `全${words.length}単語中、${memorizedCount}単語を学習済み`;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateWordList() {
    const sourceWords = appData.decks[currentDeckName] || [];
    let filteredWords = [...sourceWords];
    
    if (reviewModeCheckbox.checked) {
        filteredWords = filteredWords.filter(word => !word.memorized);
    }

    currentWordList = randomModeCheckbox.checked ? shuffle(filteredWords) : filteredWords;
    
    currentIndex = 0;
    updateStatus();
    displayWord();
    if (!listView.classList.contains('hidden')) {
        renderWordList();
    }
}

function displayWord() {
    card.classList.remove('is-flipped');
    setTimeout(() => {
        if (currentWordList.length === 0) {
            cardFront.textContent = "学習する単語がありません";
            cardBack.textContent = reviewModeCheckbox.checked ? "復習完了です！" : "単語を追加してください";
            displayStats();
            return;
        }
        if (currentIndex >= currentWordList.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = currentWordList.length - 1;

        const word = currentWordList[currentIndex];
        cardFront.textContent = word.front;
        cardBack.textContent = word.back;
        displayStats();
    }, 150);
}

function displayStats() {
    if (currentIndex < 0 || currentWordList.length === 0) {
        wordStatsEl.innerHTML = '';
        return;
    }
    const word = currentWordList[currentIndex];
    const correctHTML = `<span class="stat-correct">${'●'.repeat(word.correctCount || 0)}</span>`;
    const incorrectHTML = `<span class="stat-incorrect">${'×'.repeat(word.incorrectCount || 0)}</span>`;
    wordStatsEl.innerHTML = correctHTML + incorrectHTML;
}

function toggleView(viewToShow) {
    if (viewToShow === 'learning') {
        learningView.classList.remove('hidden');
        listView.classList.add('hidden');
        showLearningViewBtn.classList.add('active');
        showListViewBtn.classList.remove('active');
    } else {
        learningView.classList.add('hidden');
        listView.classList.remove('hidden');
        showLearningViewBtn.classList.remove('active');
        showListViewBtn.classList.add('active');
        renderWordList();
    }
}

function renderWordList() {
    listTitle.textContent = `「${currentDeckName}」の単語一覧`;
    const words = appData.decks[currentDeckName] || [];
    if (words.length === 0) {
        wordListContainer.innerHTML = '<p style="text-align:center; padding: 20px;">このセットには単語がありません。</p>';
        return;
    }
    
    let tableHTML = '<table class="word-list-table"><thead><tr><th>単語 / 意味 (クリックで切替)</th><th>成績</th><th>操作</th></tr></thead><tbody>';
    words.forEach((word, index) => {
        const stats = `<span class="stat-correct">${'●'.repeat(word.correctCount || 0)}</span>` +
                      `<span class="stat-incorrect">${'×'.repeat(word.incorrectCount || 0)}</span>`;
        tableHTML += `
            <tr>
                <td class="word-toggle" data-index="${index}">${word.front}</td>
                <td>${stats}</td>
                <td>
                    <button class="btn btn-secondary list-op-btn" data-edit-index="${index}">編集</button>
                    <button class="btn reset-btn list-op-btn" data-delete-index="${index}">削除</button>
                </td>
            </tr>
        `;
    });
    tableHTML += '</tbody></table>';
    wordListContainer.innerHTML = tableHTML;
}

function handleListClick(e) {
    const target = e.target;
    if (target.matches('.word-toggle')) {
        const index = parseInt(target.dataset.index, 10);
        const word = appData.decks[currentDeckName][index];
        if (target.textContent === word.front) {
            target.textContent = word.back;
            target.classList.add('is-back');
        } else {
            target.textContent = word.front;
            target.classList.remove('is-back');
        }
    }
    if (target.matches('[data-edit-index]')) {
        editWord(parseInt(target.dataset.editIndex, 10));
    }
    if (target.matches('[data-delete-index]')) {
        deleteWord(parseInt(target.dataset.deleteIndex, 10));
    }
}

function editWord(index) {
    const words = appData.decks[currentDeckName];
    const word = words[index];
    const newFront = prompt('新しい単語を入力してください:', word.front);
    if (newFront === null) return;
    const newBack = prompt('新しい意味を入力してください:', word.back);
    if (newBack === null) return;
    word.front = newFront.trim();
    word.back = newBack.trim();
    saveData();
    generateWordList();
}

function deleteWord(index) {
    if (confirm('本当にこの単語を削除しますか？')) {
        appData.decks[currentDeckName].splice(index, 1);
        saveData();
        generateWordList();
    }
}

function handleDeckChange() {
    currentDeckName = deckSelector.value;
    generateWordList();
}

function addDeck() {
    const newName = prompt("新しい単語セットの名前を入力してください:");
    if (newName && newName.trim()) {
        if (appData.decks[newName.trim()]) {
            alert("その名前のセットは既に存在します。");
            return;
        }
        currentDeckName = newName.trim();
        appData.decks[currentDeckName] = [];
        populateDeckSelector();
        deckSelector.value = currentDeckName;
        generateWordList();
        saveData();
    }
}

function renameDeck() {
    const oldName = currentDeckName;
    if (!oldName) return;
    const newName = prompt(`「${oldName}」の新しい名前を入力してください:`, oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
        if (appData.decks[newName.trim()]) {
            alert("その名前のセットは既に存在します。");
            return;
        }
        appData.decks[newName.trim()] = appData.decks[oldName];
        delete appData.decks[oldName];
        currentDeckName = newName.trim();
        populateDeckSelector();
        deckSelector.value = currentDeckName;
        saveData();
        renderWordList();
    }
}

function deleteDeck() {
    if (Object.keys(appData.decks).length <= 1) {
        alert("最後のセットは削除できません。");
        return;
    }
    if (confirm(`本当に「${currentDeckName}」を削除しますか？この操作は元に戻せません。`)) {
        delete appData.decks[currentDeckName];
        currentDeckName = Object.keys(appData.decks)[0];
        populateDeckSelector();
        deckSelector.value = currentDeckName;
        generateWordList();
        saveData();
    }
}

function addWord() {
    const front = newFrontInput.value.trim();
    const back = newBackInput.value.trim();
    if (front && back) {
        const currentWords = appData.decks[currentDeckName];
        if (currentWords.some(w => w.front.toLowerCase() === front.toLowerCase())) {
            alert(`「${front}」は既に追加されています。`);
            return;
        }
        currentWords.push({ front, back, memorized: false, correctCount: 0, incorrectCount: 0 });
        saveData();
        generateWordList();
        newFrontInput.value = "";
        newBackInput.value = "";
    } else {
        alert("単語と意味の両方を入力してください。");
    }
}

function addBulkWords() {
    const text = bulkWordInput.value.trim();
    if (!text) {
        alert("入力エリアが空です。");
        return;
    }
    const lines = text.split('\n');
    let addedCount = 0;
    let skippedCount = 0;
    const currentWords = appData.decks[currentDeckName];
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        const parts = line.includes(',') ? line.split(',') : line.split('\t');
        if (parts.length < 2) return;
        const front = parts[0].trim();
        const back = parts.slice(1).join(',').trim();
        if (!front || !back) return;
        if (currentWords.some(word => word.front.toLowerCase() === front.toLowerCase())) {
            skippedCount++;
        } else {
            currentWords.push({ front, back, memorized: false, correctCount: 0, incorrectCount: 0 });
            addedCount++;
        }
    });
    if (addedCount > 0) {
        saveData();
        generateWordList();
    }
    bulkWordInput.value = '';
    bulkAddContainer.classList.add('hidden');
    alert(`${addedCount}件の単語を追加しました。\n${skippedCount}件は重複のためスキップしました。`);
}

function playFeedbackAnimation(isCorrect) {
    const resultClass = isCorrect ? 'correct' : 'incorrect';
    feedbackOverlay.className = 'show ' + resultClass;
    feedbackOverlay.addEventListener('animationend', () => {
        feedbackOverlay.className = '';
    }, { once: true });
}

function judgeWord(isCorrect) {
    if (isJudging || currentIndex < 0 || currentWordList.length === 0) return;
    isJudging = true;
    playFeedbackAnimation(isCorrect);
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
    setTimeout(() => {
        currentIndex++;
        displayWord();
        isJudging = false;
    }, 250);
}

function resetProgress() {
    if (confirm(`「${currentDeckName}」のすべての成績（●×）をリセットしますか？`)) {
        appData.decks[currentDeckName].forEach(word => {
            word.memorized = false;
            word.correctCount = 0;
            word.incorrectCount = 0;
        });
        saveData();
        generateWordList();
        alert("成績履歴をリセットしました。");
    }
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

init();
