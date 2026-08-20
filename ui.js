const UI = {
    contentContainer: document.getElementById('app-content'),

    renderView(viewName, state) {
        if (viewName === 'upload') {
            this.renderUploadView();
        } else if (viewName === 'summary') {
            this.renderSummaryView(state.currentData);
        } else if (viewName === 'quiz') {
            this.renderQuizView(state.currentData, state.currentQuizAnswers);
        } else if (viewName === 'history') {
            this.renderHistoryView(state.history);
        }
    },

    renderUploadView() {
        this.contentContainer.innerHTML = `
            <div class="card" style="text-align: center; padding: 40px 20px;">
                <span style="font-size: 3rem;">📷</span>
                <h3 style="margin-top: 10px;">อัปโหลดชีทเรียน</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px; margin-bottom: 20px;">
                    อัปโหลดรูปภาพหรือเอกสารเพื่อให้ AI สรุปเนื้อหาและเก็งข้อสอบให้ <br>
                    <span style="color: var(--primary); font-weight: 500;">(เลือกพร้อมกันได้สูงสุด 5 ไฟล์)</span>
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="btn-camera" class="btn btn-primary" style="flex: 1;">ถ่ายรูป</button>
                    <button id="btn-file" class="btn" style="flex: 1; border: 1px solid var(--border);">เลือกไฟล์</button>
                </div>
                <input type="file" id="input-camera" accept="image/*" capture="environment" style="display: none;">
                <input type="file" id="input-file" accept="image/*,.pdf" multiple style="display: none;">
            </div>
        `;
    },

    renderSummaryView(data) {
        if (!data) {
            this.contentContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px 20px;">
                    <span style="font-size: 3rem;">📖</span>
                    <h3 style="margin-top: 10px;">ยังไม่มีข้อมูลสรุป</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px;">
                        กรุณาสแกนหรืออัปโหลดเอกสารที่แท็บ "สแกน/อัปโหลด" เพื่อสร้างสรุป
                    </p>
                </div>
            `;
            return;
        }

        const bullets = data.summaryPoints.map(pt => `<li style="margin-bottom: 6px;">${pt}</li>`).join('');

        this.contentContainer.innerHTML = `
            <div class="card">
                <div style="margin-bottom: 8px;">
                    <span class="subject-badge">📚 วิชา: ${data.subject || 'ทั่วไป'}</span>
                </div>
                <div class="card-title">📌 ${data.summaryTitle || 'สรุปประเด็นสำคัญ'}</div>
                <ul class="summary-bullet" style="padding-left: 20px; color: #334155;">
                    ${bullets}
                </ul>
            </div>
            <div class="card">
                <div class="card-title">🔍 สรุปเนื้อหาโดยละเอียด</div>
                <p style="line-height: 1.6; color: #334155; font-size: 0.95rem; white-space: pre-line;">
                    ${data.detailedSummary}
                </p>
            </div>
            <button id="btn-go-quiz" class="btn btn-primary full-width">
                🧠 เริ่มทำแบบทดสอบเก็งข้อสอบ (${data.quiz ? data.quiz.length : 0} ข้อ)
            </button>
        `;
    },

    renderQuizView(data, answers) {
        if (!data || !data.quiz) {
            this.contentContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px 20px;">
                    <span style="font-size: 3rem;">🧠</span>
                    <h3 style="margin-top: 10px;">ยังไม่มีแบบทดสอบ</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px;">
                        กรุณาสร้างสรุปเนื้อหาก่อน เพื่อให้ AI ออกข้อสอบให้
                    </p>
                </div>
            `;
            return;
        }

        let html = `<div class="card-title" style="margin-bottom: 16px;">แบบทดสอบเก็งข้อสอบ (${data.quiz.length} ข้อ)</div>`;
        data.quiz.forEach((q, qIndex) => {
            html += `<div class="card"><p style="font-weight:600; margin-bottom:12px; color: var(--text-primary);">ข้อ ${qIndex + 1}: ${q.question}</p>`;
            q.options.forEach((opt, oIndex) => {
                const isSelected = answers && answers[qIndex] === oIndex;
                html += `
                    <button class="btn option-btn full-width" data-qindex="${qIndex}" data-oindex="${oIndex}" 
                        style="margin-bottom:8px; border:1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}; 
                        background:${isSelected ? 'var(--primary-light)' : '#fff'}; 
                        color:${isSelected ? 'var(--primary)' : 'var(--text-primary)'}; justify-content:flex-start; text-align:left; line-height: 1.4;">
                        ${opt}
                    </button>`;
            });
            
            if (answers && answers[qIndex] !== undefined) {
                const isCorrect = answers[qIndex] === q.correctIndex;
                html += `
                    <div style="margin-top:12px; padding:12px; border-radius:8px; background:${isCorrect ? '#dcfce7' : '#fee2e2'}; color:${isCorrect ? '#166534' : '#991b1b'}; font-size:0.9rem; line-height: 1.5;">
                        <strong>${isCorrect ? '✅ ถูกต้อง!' : '❌ ผิดครับ'}</strong><br>
                        คำตอบที่ถูกคือ: <strong>${q.options[q.correctIndex]}</strong><br>
                        <em>คำอธิบาย: ${q.explanation}</em>
                    </div>
                `;
            }
            html += `</div>`;
        });
        this.contentContainer.innerHTML = html;
    },

    renderHistoryView(historyList) {
        const categories = Store.getCategories();
        const currentCategory = Store.getSelectedCategory();

        const pillsHTML = categories.map(cat => `
            <button class="category-pill ${cat === currentCategory ? 'active' : ''}" data-category="${cat}">
                ${cat}
            </button>
        `).join('');

        const filteredList = Store.getHistory();

        if (!historyList || historyList.length === 0) {
            this.contentContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px 20px;">
                    <span style="font-size: 3rem;">📁</span>
                    <h3 style="margin-top: 10px;">ไม่มีประวัติการสรุป</h3>
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 6px;">
                        รายการสรุปและแบบทดสอบที่คุณเคยสแกนจะบันทึกไว้ที่นี่
                    </p>
                </div>
            `;
            return;
        }

        const historyHTML = filteredList.map(item => `
            <div class="history-item" data-id="${item.id}" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:12px; margin-bottom:12px; cursor: pointer;">
                <div>
                    <div style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                        <span class="subject-tag">${item.subject || 'ทั่วไป'}</span>
                        <button class="btn-edit-subject" data-id="${item.id}" style="background:none; border:none; font-size: 0.9rem; cursor:pointer; padding: 2px;">✏️</button>
                    </div>
                    <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${item.summaryTitle || 'สรุปบทเรียน'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                        ⏱️ ${item.timestamp} • ${item.quiz ? item.quiz.length : 0} ข้อสอบ
                    </div>
                </div>
                <button class="btn-delete-history" data-id="${item.id}" style="background:none; border:none; color: var(--danger); font-size: 1.2rem; cursor:pointer; padding: 8px;">🗑️</button>
            </div>
        `).join('');

        this.contentContainer.innerHTML = `
            <div class="card">
                <div class="card-title" style="margin-bottom: 8px;">หมวดหมู่วิชา</div>
                <div class="category-pills-container">
                    ${pillsHTML}
                </div>
            </div>
            <div class="card">
                <div class="card-title" style="margin-bottom: 12px;">
                    ประวัติการติว (${filteredList.length})
                </div>
                ${filteredList.length > 0 ? historyHTML : '<div style="text-align:center; padding:20px; color:var(--text-secondary);">ไม่พบรายการในหมวดหมู่นี้</div>'}
            </div>
        `;
    },

    toggleLoading(show, text = 'กำลังประมวลผลด้วย AI...') {
        const overlay = document.getElementById('loading-overlay');
        const textEl = document.getElementById('loading-text');
        if (textEl) textEl.textContent = text;
        if (show) overlay.classList.remove('hidden');
        else overlay.classList.add('hidden');
    },

    showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.background = '#334155';
        toast.style.color = '#fff';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '20px';
        toast.style.marginTop = '10px';
        toast.style.fontSize = '0.85rem';
        toast.style.fontWeight = '500';
        toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        
        container.appendChild(toast);
        
        setTimeout(() => toast.style.opacity = '1', 10);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
