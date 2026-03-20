const apiKeyInput = document.getElementById('apiKey');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceSelect = document.getElementById('voiceSelect');
const chatWindow = document.getElementById('chatWindow');
const audioElement = document.getElementById('audioElement');
const themeToggle = document.getElementById('themeToggle');
const statusBar = document.getElementById('statusBar');
const textFileInput = document.getElementById('textFileInput');
const textFileName = document.getElementById('textFileName');

const STORAGE_KEYS = {
    theme: 'theme',
    apiKey: 'apiKey',
    voice: 'voice'
};

const DEFAULTS = {
    theme: 'light',
    voice: 'mimo_default'
};

const state = {
    messages: [],
    loading: false,
    currentAudioUrl: null,
    uploadedTextFileBaseName: '',
    uploadedTextContent: ''
};

initialize();

function initialize() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || DEFAULTS.theme;
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
    const savedVoice = localStorage.getItem(STORAGE_KEYS.voice) || DEFAULTS.voice;

    document.body.setAttribute('data-theme', savedTheme);
    apiKeyInput.value = savedApiKey;
    voiceSelect.value = savedVoice;

    bindEvents();
    updateThemeToggleIcon(savedTheme);
    renderMessages();
    setStatus('就绪');
}

function bindEvents() {
    themeToggle.addEventListener('click', handleThemeToggle);
    apiKeyInput.addEventListener('input', handleApiKeyInput);
    voiceSelect.addEventListener('change', handleVoiceChange);
    sendBtn.addEventListener('click', handleSend);
    userInput.addEventListener('keydown', handleInputKeydown);
    userInput.addEventListener('input', handleUserInputChange);
    textFileInput?.addEventListener('change', handleTextFileChange);
}

function handleThemeToggle() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
    if (!themeToggle) {
        return;
    }
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function handleApiKeyInput() {
    localStorage.setItem(STORAGE_KEYS.apiKey, apiKeyInput.value.trim());
}

function handleVoiceChange() {
    localStorage.setItem(STORAGE_KEYS.voice, voiceSelect.value);
}

function handleInputKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleSend();
    }
}

function handleUserInputChange() {
    if (state.uploadedTextContent && userInput.value.trim() !== state.uploadedTextContent.trim()) {
        state.uploadedTextFileBaseName = '';
        state.uploadedTextContent = '';
        if (textFileName) {
            textFileName.textContent = '未选择文件';
        }
    }
}

async function handleTextFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    const fileName = file.name || '';
    const isTxtFile = fileName.toLowerCase().endsWith('.txt') || file.type === 'text/plain';
    if (!isTxtFile) {
        setStatus('仅支持上传 .txt 文本文件', 'error');
        event.target.value = '';
        return;
    }

    try {
        const content = (await file.text()).trim();
        if (!content) {
            throw new Error('文件内容为空');
        }

        const baseName = getFileBaseName(fileName);
        state.uploadedTextFileBaseName = baseName;
        state.uploadedTextContent = content;
        userInput.value = content;

        if (textFileName) {
            textFileName.textContent = fileName;
        }

        setStatus(`已读取文件：${fileName}，正在发送...`, 'pending');
        await handleSend();
    } catch (error) {
        setStatus(`读取文件失败：${error.message}`, 'error');
    } finally {
        event.target.value = '';
    }
}

function setStatus(text, type = 'info') {
    if (!statusBar) {
        return;
    }
    statusBar.textContent = text;
    statusBar.dataset.type = type;
}

function setLoading(loading) {
    state.loading = loading;
    sendBtn.disabled = loading;
    sendBtn.textContent = loading ? '合成中...' : '发送并合成语音';
    userInput.disabled = loading;
    if (!loading) {
        userInput.focus();
    }
}

function appendMessage(message) {
    state.messages.push(message);
    renderMessages();
}

function renderMessages() {
    chatWindow.innerHTML = '';

    if (!state.messages.length) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message system';
        welcomeMessage.textContent = '欢迎使用 MiMo TTS Chat。';
        chatWindow.appendChild(welcomeMessage);
        return;
    }

    state.messages.forEach((message, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';
        contentElement.textContent = message.content;
        messageElement.appendChild(contentElement);

        const actionsElement = document.createElement('div');
        actionsElement.className = 'message-actions';

        if (message.audio) {
            messageElement.classList.add('has-audio');
            contentElement.title = '点击播放音频';
            contentElement.addEventListener('click', () => playAudio(message.audio));

            const downloadButton = createActionLink('下载音频', 'download-link', (event) => {
                event.stopPropagation();
                downloadAudio(message.audio, index, message.audioFileName);
            });
            actionsElement.appendChild(downloadButton);
        }

        const deleteButton = createActionLink('删除', 'delete-link', (event) => {
            event.stopPropagation();
            removeMessage(index);
        });
        actionsElement.appendChild(deleteButton);

        messageElement.appendChild(actionsElement);
        chatWindow.appendChild(messageElement);
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function createActionLink(text, className, onClick) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = text;
    link.className = className;
    link.addEventListener('click', (event) => {
        event.preventDefault();
        onClick(event);
    });
    return link;
}

function removeMessage(index) {
    if (!confirm('确定要删除这条消息吗？')) {
        return;
    }
    state.messages.splice(index, 1);
    renderMessages();
    setStatus('消息已删除');
}

async function handleSend() {
    if (state.loading) {
        return;
    }

    const apiKey = apiKeyInput.value.trim();
    const text = userInput.value.trim();

    if (!apiKey) {
        setStatus('请先输入 API Key', 'error');
        apiKeyInput.focus();
        return;
    }

    if (!text) {
        setStatus('请输入要合成的内容', 'error');
        userInput.focus();
        return;
    }

    appendMessage({ role: 'user', content: text });
    const uploadedBaseName = state.uploadedTextFileBaseName;
    userInput.value = '';
    setLoading(true);
    setStatus('正在请求语音与回复...', 'pending');

    try {
        const message = await requestTtsChat(apiKey, text);
        const audioData = message?.audio?.data || null;
        const content = message?.content || (audioData ? '[语音消息]' : '[空响应]');

        appendMessage({
            role: 'assistant',
            content,
            audio: audioData,
            audioFileName: uploadedBaseName
        });

        state.uploadedTextFileBaseName = '';
        state.uploadedTextContent = '';
        if (textFileName) {
            textFileName.textContent = '未选择文件';
        }

        if (audioData) {
            await playAudio(audioData);
            setStatus('完成：已生成文本与语音', 'success');
        } else {
            setStatus('完成：已生成文本（无音频）', 'warning');
        }
    } catch (error) {
        console.error(error);
        appendMessage({ role: 'system', content: `错误: ${error.message}` });
        setStatus(`请求失败：${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

async function requestTtsChat(apiKey, text) {
    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'mimo-v2-tts',
            messages: [{ role: 'assistant', content: text }],
            audio: {
                format: 'wav',
                voice: voiceSelect.value
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败: ${response.status}`);
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;
    if (!message) {
        throw new Error('响应格式异常，未找到 message 字段');
    }
    return message;
}

async function playAudio(base64Audio) {
    const audioBlob = base64ToBlob(base64Audio, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);

    if (state.currentAudioUrl) {
        URL.revokeObjectURL(state.currentAudioUrl);
    }

    state.currentAudioUrl = audioUrl;
    audioElement.src = audioUrl;
    await audioElement.play().catch(() => {
        setStatus('音频已就绪，请点击播放器手动播放', 'warning');
    });
}

function downloadAudio(base64Audio, index, preferredName = '') {
    const audioBlob = base64ToBlob(base64Audio, 'audio/wav');
    const audioUrl = URL.createObjectURL(audioBlob);

    const anchor = document.createElement('a');
    anchor.href = audioUrl;
    const safeName = sanitizeFilename(preferredName);
    anchor.download = safeName ? `${safeName}.wav` : `mimo_audio_${index + 1}.wav`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(audioUrl);
    setStatus('音频下载已开始', 'success');
}

function base64ToBlob(base64, type) {
    const binaryString = atob(base64);
    const length = binaryString.length;
    const uint8Array = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type });
}

function getFileBaseName(fileName) {
    const name = fileName.replace(/\.[^/.]+$/, '').trim();
    return sanitizeFilename(name) || `txt_${Date.now()}`;
}

function sanitizeFilename(name) {
    return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}
