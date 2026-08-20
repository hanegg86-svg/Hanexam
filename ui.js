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

        const bullets = data.summaryPoints.map(pt => `<li>${pt}</li>`).join('');

        this.contentContainer.innerHTML = `
            <div class="card">
                <div style="margin-bottom: 8px;">
                    <span class="subject-badge">📚 วิชา: ${data.subject || 'ทั่วไป'}</span>
                </div>
                <div class="card-title">📌 ${data.summaryTitle || 'สรุปประเด็นสำคัญ'}</div>
                <ul class="summary-bullet">
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
            <div class="history-item" data-id="${item.id}">
                <div>
                    <div style="margin-bottom: 4px;">
                        <span class="subject-tag">${item.subject || 'ทั่วไป'}</span>
                    </div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${item.summaryTitle || 'สรุปบทเรียน'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">
                        ⏱️ ${item.timestamp} • ${item.quiz ? item.quiz.length : 0} ข้อสอบ
                    </div>
                </div>
                <button class="btn-delete-history" data-id="${item.id}" style="background:none; border:none; color: var(--danger); font-size: 1.1rem; padding: 4px;">🗑️</button>
            </div>
        `).join('');

        this.contentContainer.innerHTML = `
            <div class="card-title" style="margin-bottom: 8px;">หมวดหมู่วิชา</div>
            <div class="category-pills-container">
                ${pillsHTML}
            </div>
            <div class="card-title" style="margin-top: 16px; margin-bottom: 12px;">
                ประวัติการติว (${filteredList.length})
            </div>
            ${filteredList.length > 0 ? historyHTML : '<div class="card" style="text-align:center; padding:20px; color:var(--text-secondary);">ไม่พบรายการในหมวดหมู่นี้</div>'}
        `;
    },
