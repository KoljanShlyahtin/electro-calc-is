let rooms = [];
let roomIdCounter = 0;
let dataWasLoaded = false;

// Шаблоны помещений
const roomTemplates = [
    { id: 'living', name: 'Гостиная', icon: '🛋️', sockets: 8, switches: 3, ac: 1, ceiling: 4, sconces: 2, backlight: 2, net: 1, tv: 1 },
    { id: 'kitchen', name: 'Кухня', icon: '🍳', sockets: 6, switches: 2, ac: 0, ceiling: 3, sconces: 0, backlight: 1, net: 0, tv: 1 },
    { id: 'bedroom', name: 'Спальня', icon: '🛏️', sockets: 5, switches: 2, ac: 1, ceiling: 3, sconces: 2, backlight: 1, net: 0, tv: 1 },
    { id: 'bathroom', name: 'Санузел', icon: '🚿', sockets: 3, switches: 1, ac: 0, ceiling: 2, sconces: 0, backlight: 0, net: 0, tv: 0 },
    { id: 'hallway', name: 'Прихожая', icon: '🚪', sockets: 3, switches: 2, ac: 0, ceiling: 2, sconces: 0, backlight: 1, net: 0, tv: 0 },
    { id: 'corridor', name: 'Коридор', icon: '🚶', sockets: 2, switches: 2, ac: 0, ceiling: 2, sconces: 0, backlight: 1, net: 0, tv: 0 },
    { id: 'office', name: 'Кабинет', icon: '💻', sockets: 6, switches: 2, ac: 1, ceiling: 3, sconces: 1, backlight: 1, net: 2, tv: 0 },
    { id: 'kids', name: 'Детская', icon: '🧸', sockets: 5, switches: 2, ac: 1, ceiling: 3, sconces: 1, backlight: 1, net: 1, tv: 1 },
    { id: 'kids2', name: 'Детская 2', icon: '🎈', sockets: 5, switches: 2, ac: 1, ceiling: 3, sconces: 1, backlight: 1, net: 1, tv: 1 },
    { id: 'laundry', name: 'Постирочная', icon: '🧺', sockets: 3, switches: 1, ac: 0, ceiling: 1, sconces: 0, backlight: 0, net: 0, tv: 0 },
    { id: 'balcony', name: 'Балкон/Лоджия', icon: '🌤️', sockets: 2, switches: 1, ac: 0, ceiling: 1, sconces: 0, backlight: 1, net: 0, tv: 0 }
];

window.onload = function() {
    renderRoomSelector();
    
    // Пытаемся загрузить данные из черновой
    const loaded = loadRoughData();
    dataWasLoaded = loaded;
    
    if (!loaded) {
        // Если данных нет, выбираем стандартный набор
        toggleRoom('living');
        toggleRoom('kitchen');
        toggleRoom('bedroom');
        toggleRoom('bathroom');
        toggleRoom('hallway');
    }
    
    calculate();
    updateDataStatus();
};

// === ЗАГРУЗКА ДАННЫХ ИЗ ЧЕРНОВОЙ ===
function loadRoughData() {
    try {
        const saved = localStorage.getItem('roughElectroData');
        if (!saved) return false;
        
        const data = JSON.parse(saved);
        
        // Проверка актуальности (не старше 7 дней)
        const savedDate = new Date(data.timestamp);
        const now = new Date();
        const diffDays = (now - savedDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 7) {
            console.log('🕐 Данные устарели (>7 дней), игнорируем');
            return false;
        }
        
        // Очищаем текущие комнаты
        rooms = [];
        roomIdCounter = 0;
        
        // Восстанавливаем комнаты
        data.rooms.forEach(r => {
            const id = roomIdCounter++;
            rooms.push({
                id,
                templateId: r.templateId,
                name: r.name,
                hasSockets: r.hasSockets, socketCount: r.socketCount,
                hasSwitches: r.hasSwitches, switchCount: r.switchCount,
                hasNet: r.hasNet, netCount: r.netCount,
                hasTv: r.hasTv, tvCount: r.tvCount,
                hasCeiling: r.hasCeiling, ceilingCount: r.ceilingCount,
                hasSconces: r.hasSconces, sconceCount: r.sconceCount,
                hasBacklight: r.hasBacklight, backlightCount: r.backlightCount,
                hasAC: r.hasAC, acCount: r.acCount
            });
        });
        
        // Обновляем UI
        renderRooms();
        updateSelectorVisuals();
        
        // Показываем уведомление
        showImportNotification(data.rooms.length);
        
        return true;
        
    } catch(e) {
        console.error('❌ Ошибка загрузки данных:', e);
        return false;
    }
}

function showImportNotification(count) {
    const notify = document.createElement('div');
    notify.className = 'alert';
    notify.style.cssText = 'position:fixed;top:20px;right:20px;z-index:1000;max-width:300px;';
    notify.innerHTML = `✅ Загружено ${count} помещений из черновой!<br><small style="color:#666">Можно скорректировать значения</small>`;
    document.body.appendChild(notify);
    
    setTimeout(() => {
        notify.style.transition = 'opacity 0.5s';
        notify.style.opacity = '0';
        setTimeout(() => notify.remove(), 500);
    }, 4000);
}

function clearSavedData() {
    if (confirm('Удалить сохраненные данные черновой отделки?')) {
        localStorage.removeItem('roughElectroData');
        document.getElementById('dataStatus').textContent = '🗑️ Данные очищены';
        setTimeout(() => {
            document.getElementById('dataStatus').textContent = '';
        }, 3000);
    }
}

function updateDataStatus() {
    const statusEl = document.getElementById('dataStatus');
    const saved = localStorage.getItem('roughElectroData');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const date = new Date(data.timestamp).toLocaleDateString('ru-RU');
            statusEl.textContent = `📦 Данные от ${date}`;
            statusEl.title = `Загружено помещений: ${data.rooms.length}`;
        } catch(e) {
            statusEl.textContent = '⚠️ Ошибка данных';
        }
    } else {
        statusEl.textContent = '';
    }
}

// --- ФУНКЦИИ UI ---

function renderRoomSelector() {
    const container = document.getElementById('roomSelector');
    container.innerHTML = roomTemplates.map(room => `
        <div class="room-check-item" id="check_item_${room.id}">
            <input type="checkbox" id="cb_${room.id}" onchange="handleCheckboxChange('${room.id}')">
            <label for="cb_${room.id}" onclick="handleLabelClick('${room.id}')">${room.icon} ${room.name}</label>
        </div>
    `).join('');
}

function handleCheckboxChange(templateId) {
    const checkbox = document.getElementById(`cb_${templateId}`);
    if (checkbox.checked) addRoomFromTemplate(templateId);
    else removeRoomByTemplate(templateId);
    
    updateSelectorVisuals();
    renderRooms();
    calculate();
}

function handleLabelClick(templateId) {
    const checkbox = document.getElementById(`cb_${templateId}`);
    checkbox.checked = !checkbox.checked;
    handleCheckboxChange(templateId);
}

function updateSelectorVisuals() {
    roomTemplates.forEach(t => {
        const checkbox = document.getElementById(`cb_${t.id}`);
        const item = document.getElementById(`check_item_${t.id}`);
        if (checkbox.checked) item.classList.add('active');
        else item.classList.remove('active');
    });
}

function addRoomFromTemplate(templateId) {
    if (rooms.find(r => r.templateId === templateId)) return;

    const template = roomTemplates.find(r => r.id === templateId);
    if (!template) return;

    const id = roomIdCounter++;
    rooms.push({ 
        id, templateId, name: template.name, 
        hasSockets: true, socketCount: template.sockets, 
        hasSwitches: true, switchCount: template.switches, 
        hasAC: template.ac > 0, acCount: template.ac,
        hasCeiling: template.ceiling > 0, ceilingCount: template.ceiling,
        hasSconces: template.sconces > 0, sconceCount: template.sconces,
        hasBacklight: template.backlight > 0, backlightCount: template.backlight,
        hasNet: template.net > 0, netCount: template.net,
        hasTv: template.tv > 0, tvCount: template.tv
    });
}

function removeRoomByTemplate(templateId) {
    rooms = rooms.filter(r => r.templateId !== templateId);
}

function removeRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    rooms = rooms.filter(r => r.id !== id);
    if (room.templateId) {
        const cb = document.getElementById(`cb_${room.templateId}`);
        if (cb) cb.checked = false;
    }

    updateSelectorVisuals();
    renderRooms();
    calculate();
}

function updateRoomCheckbox(id, field, checked) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        room[field] = checked;
        renderRooms();
        calculate();
    }
}

function updateRoomCount(id, field, value) {
    const room = rooms.find(r => r.id === id);
    if (room) {
        room[field] = parseInt(value) || 0;
        calculate();
    }
}

function updateRoomName(id, value) {
    const room = rooms.find(r => r.id === id);
    if (room) room.name = value;
}

function renderRooms() {
    const importedClass = dataWasLoaded ? 'imported' : '';
    
    document.getElementById('roomsContainer').innerHTML = rooms.map(room => `
        <div class="room-card ${importedClass}">
            <div class="room-header">
                <input type="text" class="room-name-input" value="${room.name}" onchange="updateRoomName(${room.id}, this.value)">
                <button class="room-remove" onclick="removeRoom(${room.id})">✕</button>
            </div>
            <div class="room-checkboxes">
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasSockets ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasSockets', this.checked)"><label>🔌 Розетки</label></div>
                    <input type="number" value="${room.socketCount}" min="0" ${!room.hasSockets ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'socketCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasSwitches ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasSwitches', this.checked)"><label>🔘 Выключатели</label></div>
                    <input type="number" value="${room.switchCount}" min="0" ${!room.hasSwitches ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'switchCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasNet ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasNet', this.checked)"><label>🌐 Интернет</label></div>
                    <input type="number" value="${room.netCount}" min="0" ${!room.hasNet ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'netCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasTv ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasTv', this.checked)"><label>📺 ТВ</label></div>
                    <input type="number" value="${room.tvCount}" min="0" ${!room.hasTv ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'tvCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasAC ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasAC', this.checked)"><label>❄️ Кондиционер</label></div>
                    <input type="number" value="${room.acCount}" min="0" ${!room.hasAC ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'acCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasCeiling ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasCeiling', this.checked)"><label>💡 Свет</label></div>
                    <input type="number" value="${room.ceilingCount}" min="0" ${!room.hasCeiling ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'ceilingCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasSconces ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasSconces', this.checked)"><label>🕯️ Бра</label></div>
                    <input type="number" value="${room.sconceCount}" min="0" ${!room.hasSconces ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'sconceCount', this.value)">
                </div>
                <div class="checkbox-item">
                    <div class="checkbox-header"><input type="checkbox" ${room.hasBacklight ? 'checked' : ''} onchange="updateRoomCheckbox(${room.id}, 'hasBacklight', this.checked)"><label>✨ Подсветка</label></div>
                    <input type="number" value="${room.backlightCount}" min="0" ${!room.hasBacklight ? 'disabled' : ''} onchange="updateRoomCount(${room.id}, 'backlightCount', this.value)">
                </div>
            </div>
        </div>
    `).join('');
}

// --- ГЛАВНАЯ ФУНКЦИЯ CALCULATE ---

function calculate() {
    try {
        const tpRegsGlobal = parseInt(document.getElementById('tpRegulatorsGlobal').value) || 0;
        const acUnitsGlobal = parseInt(document.getElementById('acUnitsGlobal').value) || 0;

        let stats = {
            sockets: 0, switches: 0, ac: acUnitsGlobal,
            ceiling: 0, sconces: 0, backlight: 0,
            net: 0, tv: 0,
            tpRegs: tpRegsGlobal
        };

        rooms.forEach(r => {
            if(r.hasSockets) stats.sockets += r.socketCount;
            if(r.hasSwitches) stats.switches += r.switchCount;
            if(r.hasCeiling) stats.ceiling += r.ceilingCount;
            if(r.hasSconces) stats.sconces += r.sconceCount;
            if(r.hasBacklight) stats.backlight += r.backlightCount;
            if(r.hasNet) stats.net += r.netCount;
            if(r.hasTv) stats.tv += r.tvCount;
        });

        const matData = calculateFinishMaterials(stats);
        const workData = calculateFinishWorks(stats);
        const grandTotal = matData.total + workData.total;

        let roomSummary = rooms.map(r => {
            let badges = [];
            if(r.hasSockets) badges.push(`🔌${r.socketCount}`);
            if(r.hasNet) badges.push(`🌐${r.netCount}`);
            if(r.hasTv) badges.push(`📺${r.tvCount}`);
            if(r.hasSwitches) badges.push(`🔘${r.switchCount}`);
            if(r.hasCeiling) badges.push(`${r.ceilingCount}`);
            if(r.hasSconces) badges.push(`🕯️${r.sconceCount}`);
            if(r.hasBacklight) badges.push(`✨${r.backlightCount}`);
            return `<span class="summary-badge">${r.name}: ${badges.join(' ')}</span>`;
        }).join('');

        const html = `
            <div class="alert">✨ Чистовая отделка</div>
            <div style="margin:10px 0">${roomSummary}</div>
            
            <div style="font-weight:bold;margin-bottom:10px;">📦 Материалы:</div>
            <div class="cable-breakdown">
                <div class="cable-row"><span>🔌 Розетки:</span> <b>${stats.sockets} шт</b> (${matData.details.sockets.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>🔲 Выключатели:</span> <b>${stats.switches} шт</b> (${matData.details.switches.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>🌐 Интернет:</span> <b>${stats.net} шт</b> (${matData.details.net.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>📺 ТВ:</span> <b>${stats.tv} шт</b> (${matData.details.tv.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>💡 Светильники:</span> <b>${stats.ceiling} шт</b> (${matData.details.ceiling.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>🕯️ Бра:</span> <b>${stats.sconces} шт</b> (${matData.details.sconces.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>✨ Подсветка:</span> <b>${stats.backlight} зон</b> (${matData.details.backlight.toLocaleString()} ₽)</div>
                <div class="cable-row"><span>🌡️ Терморегуляторы ТП:</span> <b>${stats.tpRegs} шт</b> (${matData.details.tpRegs.toLocaleString()} ₽)</div>
            </div>

            <div style="font-weight:bold;margin:15px 0 5px;">🛠️ Работы:</div>
            <div class="cable-breakdown">
                <div class="cable-row"><span>Установка механизмов:</span> <b>${workData.details.mechanisms.toLocaleString()} ₽</b></div>
                <div class="cable-row"><span>Подключение света:</span> <b>${(workData.details.ceiling + workData.details.sconces + workData.details.backlight).toLocaleString()} ₽</b></div>
                <div class="cable-row"><span>Навеска кондиционеров:</span> <b>${workData.details.ac.toLocaleString()} ₽</b></div>
                <div class="cable-row"><span>Установка ТП регуляторов:</span> <b>${workData.details.tpRegs.toLocaleString()} ₽</b></div>
            </div>
            
            <hr style="border:0;border-top:1px dashed #ccc;margin:15px 0;">
            <div style="display:flex;justify-content:space-between;"><span>Материалы:</span> <span>${matData.total.toLocaleString()} ₽</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Работы:</span> <span>${workData.total.toLocaleString()} ₽</span></div>
            <div class="total-price">ИТОГО: ${grandTotal.toLocaleString()} ₽</div>
        `;

        document.getElementById('result').innerHTML = html;
        document.getElementById('result').style.display = 'block';

        window.lastData = `ЧИСТОВАЯ\nРозетки: ${stats.sockets} | Выкл: ${stats.switches}\nСвет: ${stats.ceiling} | Бра: ${stats.sconces}\nИтого: ${grandTotal} ₽`;

    } catch(e) { 
        alert("Ошибка расчета: "+e.message); 
        console.error(e); 
    }
}

function copyResult() {
    if(!window.lastData) { 
        alert("Сначала рассчитайте"); 
        return; 
    }
    navigator.clipboard.writeText(window.lastData).then(() => alert("✅ Скопировано!"));
}