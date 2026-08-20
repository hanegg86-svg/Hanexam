/**
 * Main Controller & Event Dispatcher
 */
const App = {
    init() {
        this.bindEvents();
        this.checkApiKey();
        this.renderCurrentTab();
    },

    bindEvents() {
        // Navigation Bar Tabs
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Settings Modal
        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('input-api-key').value = Store.getApiKey();
            document.getElementById('modal-settings').classList.remove('hidden');
        });

        document.getElementById('btn-close-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.add('hidden');
        });

        document.getElementById('btn-save-key').addEventListener('click', () => {
            const key = document.getElementById('input-api-key').value;
            if (!key) {
                UI.showToast('กรุณากรอก API Key');
                return;
            }
            Store.setApiKey(key);
            document.getElementById('modal-settings').classList.add('hidden');
            UI.showToast('บันทึก API Key เรียบร้อย');
        });

        // Event Delegation for Content Area
        document.getElementById('app-content').addEventListener('click', (e) => {
            // Upload view actions
            if (e.target.closest('#btn-camera')) {
                document.getElementById('input-camera').click();
            } else if (e.target.closest('#btn-file')) {
                document.getElementById('input-file').click();
            }

            // Summary view action -> Go to Quiz
            if (e.target.closest('#btn-go-quiz')) {
                this.switchTab('quiz');
            }

            // Quiz option select action
            const optBtn = e.target.closest('.option-btn');
            if (optBtn) {
                const qIndex = parseInt(optBtn.dataset.qindex);
                const oIndex = parseInt(optBtn.dataset.oindex);
                Store.setQuizAnswer(qIndex, oIndex);
                UI.renderView('quiz', Store.state);
            }

            // Category Pill Filter click
            const categoryPill = e.target.closest('.category-pill');
            if (categoryPill) {
                Store.setSelectedCategory(categoryPill.dataset.category);
                UI.renderView('history', Store.state);
            }

            // History item click
            const historyItem = e.target.closest('.history-item');
            const deleteBtn = e.target.closest('.btn-delete-history');
            
            if (deleteBtn) {
                e.stopPropagation();
                const id = deleteBtn.dataset.id;
                Store.deleteHistoryItem(id);
                UI.renderView('history', Store.state);
                UI.showToast('ลบประวัติเรียบร้อย');
            } else if (historyItem) {
                const id = historyItem.dataset.id;
                if (Store.loadHistoryItem(id)) {
                    this.switchTab('summary');
                }
            }
        });

        // File Inputs Handler
        document.getElementById('app-content').addEventListener('change', (e) => {
            if (e.target.id === 'input-camera' || e.target.id === 'input-file') {
                const file = e.target.files[0];
                if (file) this.handleProcessFile(file);
            }
        });
    },

    checkApiKey() {
        if (!Store.getApiKey()) {
            setTimeout(() => {
                document.getElementById('modal-settings').classList.remove('hidden');
            }, 500);
        }
    },

    switchTab(tab) {
        Store.setActiveTab(tab);
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        this.renderCurrentTab();
    },

    renderCurrentTab() {
        UI.renderView(Store.getActiveTab(), Store.state);
    },

    async handleProcessFile(file) {
        const apiKey = Store.getApiKey();
        if (!apiKey) {
            UI.showToast('กรุณาใส่ Gemini API Key ก่อนใช้งาน');
            document.getElementById('modal-settings').classList.remove('hidden');
            return;
        }

        try {
            UI.toggleLoading(true, 'กำลังอ่านไฟล์และแปลงข้อมูล...');
            const base64Data = await this.fileToBase64(file);
            const mimeType = file.type || 'image/jpeg';

            UI.toggleLoading(true, 'Gemini 3.5 Flash Lite กำลังวิเคราะห์เนื้อหา...');
            const aiResponse = await this.callGeminiAPI(apiKey, base64Data, mimeType);

            Store.setCurrentData(aiResponse);
            UI.toggleLoading(false);
            UI.showToast('วิเคราะห์เนื้อหาและสร้างข้อสอบสำเร็จ!');
            this.switchTab('summary');

        } catch (error) {
            UI.toggleLoading(false);
            console.error('Error processing file:', error);
            UI.showToast('เกิดข้อผิดพลาด: ' + (error.message || 'ไม่สามารถวิเคราะห์ได้'));
        }
    },

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    async callGeminiAPI(apiKey, base64Data, mimeType) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

        const promptText = `
        คุณคือผู้เชี่ยวชาญด้านการติวสอบ กรุณาอ่านและวิเคราะห์เนื้อหาจากเอกสาร/รูปภาพนี้ แล้วตอบกลับมาในรูปแบบ JSON Structure เท่านั้น ห้ามใส่ข้อความอื่นนอกเหนือจาก JSON:
        {
            "subject": "ชื่อวิชาหรือหมวดหมู่เนื้อหา (สั้นๆ ไม่เกิน 3 คำ)",
            "summaryTitle": "หัวข้อเรื่องสรุปที่กระชับน่าสนใจ",
            "summaryPoints": [
                "ประเด็นสำคัญที่ 1",
                "ประเด็นสำคัญที่ 2",
                "ประเด็นสำคัญที่ 3"
            ],
            "detailedSummary": "สรุปเนื้อหาอย่างเป็นระบบและละเอียด อ่านง่าย เหมาะกับการทบทวนสอบ",
            "quiz": [
                {
                    "question": "คำถามข้อที่ 1 ที่น่าจะออกสอบ",
                    "options": ["ตัวเลือก A", "ตัวเลือก B", "ตัวเลือก C", "ตัวเลือก D"],
                    "correctIndex": 0,
                    "explanation": "อธิบายเหตุผลของเฉลยข้อนี้อย่างละเอียด"
                }
            ]
        }
        เก็งข้อสอบสร้างมาอย่างน้อย 3-5 ข้อ`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || 'API Request Failed');
        }

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        
        return JSON.parse(rawText);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
