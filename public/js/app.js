// 获取DOM元素
const diaryEditor = document.getElementById('diaryEditor');
const saveBtn = document.getElementById('saveBtn');
const dateDisplay = document.getElementById('dateDisplay');
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const passwordInput = document.getElementById('passwordInput');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historyContent = document.getElementById('historyContent');
const bottleBtn = document.getElementById('bottleBtn');
const treeholeModal = document.getElementById('treeholeModal');
const closeTreeholeBtn = document.getElementById('closeTreeholeBtn');
const treeholeEditor = document.getElementById('treeholeEditor');
const sendTreeholeBtn = document.getElementById('sendTreeholeBtn');
const toast = document.getElementById('toast');

// 显示当前日期
function updateDate() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekday = weekdays[now.getDay()];
    dateDisplay.textContent = `${year}年${month}月${day}日 ${weekday}`;
}

updateDate();

// 自动保存草稿到本地存储
function autoSaveDraft() {
    const content = diaryEditor.value;
    localStorage.setItem('diaryDraft', content);
}

function loadDraft() {
    const draft = localStorage.getItem('diaryDraft');
    if (draft) {
        diaryEditor.value = draft;
    }
}

// 加载草稿
loadDraft();

// 监听输入变化，自动保存草稿
diaryEditor.addEventListener('input', autoSaveDraft);
diaryEditor.addEventListener('blur', autoSaveDraft);

// 显示提示消息
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 保存日记
async function saveDiary() {
    const content = diaryEditor.value.trim();
    
    if (!content) {
        showToast('请输入日记内容', 'error');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">保存中...</span>';

    try {
        const response = await fetch('/api/diaries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();

        if (data.success) {
            showToast('小确幸已保存 💕', 'success');
            diaryEditor.value = '';
            localStorage.removeItem('diaryDraft');
        } else {
            showToast(data.message || '保存失败，请重试', 'error');
        }
    } catch (error) {
        console.error('保存错误:', error);
        showToast('网络错误，请检查连接后重试', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="btn-icon">💕</span><span class="btn-text">保存小确幸</span>';
    }
}

saveBtn.addEventListener('click', saveDiary);

// 查看历史模态框
historyBtn.addEventListener('click', () => {
    historyModal.classList.add('show');
    passwordInput.value = '';
    historyContent.innerHTML = '';
});

closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('show');
});

// 点击模态框外部关闭
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) {
        historyModal.classList.remove('show');
    }
});

// 查看历史记录
async function viewHistory() {
    const password = passwordInput.value.trim();

    if (!password) {
        showToast('请输入密码', 'error');
        return;
    }

    viewHistoryBtn.disabled = true;
    viewHistoryBtn.textContent = '加载中...';

    try {
        const response = await fetch('/api/diaries/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
            if (data.data && data.data.length > 0) {
                historyContent.innerHTML = data.data.map(item => {
                    const date = new Date(item.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `
                        <div class="history-item">
                            <div class="history-item-date">${year}年${month}月${day}日 ${hours}:${minutes}</div>
                            <div class="history-item-content">${item.content}</div>
                        </div>
                    `;
                }).join('');
            } else {
                historyContent.innerHTML = '<div class="no-history">还没有历史记录，快去记录你的小确幸吧~</div>';
            }
        } else {
            showToast(data.message || '密码错误', 'error');
            historyContent.innerHTML = '';
        }
    } catch (error) {
        console.error('查看历史错误:', error);
        showToast('网络错误，请检查连接后重试', 'error');
    } finally {
        viewHistoryBtn.disabled = false;
        viewHistoryBtn.textContent = '查看历史';
    }
}

viewHistoryBtn.addEventListener('click', viewHistory);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        viewHistory();
    }
});

// 树洞倾诉模态框
bottleBtn.addEventListener('click', () => {
    treeholeModal.classList.add('show');
    treeholeEditor.value = '';
});

closeTreeholeBtn.addEventListener('click', () => {
    treeholeModal.classList.remove('show');
});

treeholeModal.addEventListener('click', (e) => {
    if (e.target === treeholeModal) {
        treeholeModal.classList.remove('show');
    }
});

// 发送树洞倾诉
async function sendTreehole() {
    const content = treeholeEditor.value.trim();

    if (!content) {
        showToast('请输入倾诉内容', 'error');
        return;
    }

    sendTreeholeBtn.disabled = true;
    sendTreeholeBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">发送中...</span>';

    try {
        const response = await fetch('/api/treehole/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();

        if (data.success) {
            showToast('你的心声已经传达到远方 ✉️', 'success');
            treeholeEditor.value = '';
            treeholeModal.classList.remove('show');
            
            // 漂流瓶闪烁动画
            bottleBtn.classList.add('sparkle');
            setTimeout(() => {
                bottleBtn.classList.remove('sparkle');
            }, 2000);
        } else {
            showToast(data.message || '发送失败，请重试', 'error');
        }
    } catch (error) {
        console.error('发送错误:', error);
        showToast('网络错误，请检查连接后重试', 'error');
    } finally {
        sendTreeholeBtn.disabled = false;
        sendTreeholeBtn.innerHTML = '<span class="btn-icon">✉️</span><span class="btn-text">倾诉</span>';
    }
}

sendTreeholeBtn.addEventListener('click', sendTreehole);

