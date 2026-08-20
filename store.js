/**
 * State Management & LocalStorage Data Layer
 */
const Store = {
    state: {
        apiKey: '',
        activeTab: 'upload',
        history: [],
        currentData: null,
        currentQuizAnswers: {},
        selectedCategory: 'ทั้งหมด'
    },

    init() {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) this.state.apiKey = savedKey;

        const savedHistory = localStorage.getItem('examprep_history');
        if (savedHistory) {
            try {
                this.state.history = JSON.parse(savedHistory);
            } catch (e) {
                this.state.history = [];
            }
        }
    },

    setApiKey(key) {
        this.state.apiKey = key.trim();
        localStorage.setItem('gemini_api_key', this.state.apiKey);
    },

    getApiKey() {
        return this.state.apiKey;
    },

    setActiveTab(tab) {
        this.state.activeTab = tab;
    },

    getActiveTab() {
        return this.state.activeTab;
    },

    setSelectedCategory(category) {
        this.state.selectedCategory = category;
    },

    getSelectedCategory() {
        return this.state.selectedCategory || 'ทั้งหมด';
    },

    getCategories() {
        const categories = new Set(['ทั้งหมด']);
        this.state.history.forEach(item => {
            if (item.subject) categories.add(item.subject);
        });
        return Array.from(categories);
    },

    setCurrentData(data) {
        this.state.currentData = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleDateString('th-TH', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            subject: data.subject || 'ทั่วไป',
            ...data
        };
        this.state.currentQuizAnswers = {};
        this.saveToHistory(this.state.currentData);
    },

    getCurrentData() {
        return this.state.currentData;
    },

    saveToHistory(item) {
        this.state.history.unshift(item);
        if (this.state.history.length > 20) this.state.history.pop();
        localStorage.setItem('examprep_history', JSON.stringify(this.state.history));
    },

    getHistory() {
        if (this.state.selectedCategory && this.state.selectedCategory !== 'ทั้งหมด') {
            return this.state.history.filter(h => h.subject === this.state.selectedCategory);
        }
        return this.state.history;
    },

    updateHistoryItemSubject(id, newSubject) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            item.subject = newSubject.trim();
            localStorage.setItem('examprep_history', JSON.stringify(this.state.history));
        }
    },

    loadHistoryItem(id) {
        const item = this.state.history.find(h => h.id === id);
        if (item) {
            this.state.currentData = item;
            this.state.currentQuizAnswers = {};
            return true;
        }
        return false;
    },

    deleteHistoryItem(id) {
        this.state.history = this.state.history.filter(h => h.id !== id);
        localStorage.setItem('examprep_history', JSON.stringify(this.state.history));
        if (this.state.currentData && this.state.currentData.id === id) {
            this.state.currentData = null;
        }
    },

    setQuizAnswer(questionIndex, selectedOptionIndex) {
        this.state.currentQuizAnswers[questionIndex] = selectedOptionIndex;
    },

    getQuizAnswers() {
        return this.state.currentQuizAnswers;
    }
};

Store.init();
