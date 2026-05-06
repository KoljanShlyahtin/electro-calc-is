let bathCount = 1;
let rooms = [];
let roomIdCounter = 0;
let lastCalculationData = null;

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
    toggleRoom('living');
    toggleRoom('kitchen');
    toggleRoom('bedroom');
    toggleRoom('bathroom');
    toggleRoom('hallway');
    calculate();
};

// --- ФУНКЦИИ UI (Без изменений) ---
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
    if (templateId === 'bathroom') {
        const existingBaths = rooms.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2');
        if (existingBaths.length >= bathCount) return; 
    }
    if (templateId !== 'bathroom' && rooms.find(r => r.templateId === templateId)) return;

    const template = roomTemplates.find(r => r.id === templateId);
    if (!template) return;

    const id = roomIdCounter++;
    let finalName = template.name;
    
    if (templateId === 'bathroom') {
        const existingBaths = rooms.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2');
        if (existingBaths.length > 0) finalName = 'Санузел 2';
    }

    rooms.push({ 
        id, templateId, name: finalName, 
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
    if (templateId === 'bathroom') {
        const existingBaths = rooms.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2');
        if (existingBaths.length > 0) {
             document.getElementById('cb_bathroom').checked = true;
             return;
        }
    }
    rooms = rooms.filter(r => r.templateId !== templateId);
}

function setBathCount(count) {
    bathCount = count;
    document.getElementById('bath1Btn').classList.toggle('active', count === 1);
    document.getElementById('bath2Btn').classList.toggle('active', count === 2);
    
    const bathCheckbox = document.getElementById('cb_bathroom');
    
    if (count > 0) {
        bathCheckbox.checked = true;
        const currentBaths = rooms.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2');
        
        if (currentBaths.length < count) {
            for (let i = currentBaths.length; i < count; i++) addRoomFromTemplate('bathroom');
        } else if (currentBaths.length > count) {
            const toKeep = currentBaths.slice(0, count).map(r => r.id);
            rooms = rooms.filter(r => {
                if (r.templateId === 'bathroom' || r.templateId === 'bathroom2') return toKeep.includes(r.id);
                return true;
            });
        }
    } else {
        bathCheckbox.checked = false;
        rooms = rooms.filter(r => r.templateId !== 'bathroom' && r.templateId !== 'bathroom2');
    }
    
    updateSelectorVisuals();
    renderRooms();
    calculate();
}

function toggleBoiler() { 
    document.getElementById('boilerOptions').classList.toggle('visible', document.getElementById('boilerCheck').checked); 
    calculate();
}

function toggleFloorHeat() { 
    const zones = parseInt(document.getElementById('floorHeatZones').value);
    document.getElementById('floorHeatOptions').classList.toggle('visible', zones > 0);
    calculate();
}

function toggleMasterKey() { 
    document.getElementById('masterKeyInfo').classList.toggle('visible', document.getElementById('masterKey').checked); 
    calculate();
}

function removeRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (!room) return;

    if (room.templateId === 'bathroom' || room.templateId === 'bathroom2') {
        alert("Чтобы убрать санузел, измените количество санузлов в настройках выше");
        return;
    }

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
    document.getElementById('roomsContainer').innerHTML = rooms.map(room => `
        <div class="room-card">
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
        // 1. Сбор данных
        const inputData = {
            area: parseFloat(document.getElementById('area').value) || 0,
            wallPrice: parseFloat(document.getElementById('wallType').value) || 280,
            cableCoef: parseFloat(document.getElementById('cableCoef').value) || 1.3,
            maxDist: parseFloat(document.getElementById('maxDist').value) || 25,
            
            hasWash: document.getElementById('washMachine').checked,
            hasDish: document.getElementById('dishWasher').checked,
            hasOven: document.getElementById('ovenMicrowave').checked,
            hasBoiler: document.getElementById('boilerCheck').checked,
            boilerType: document.getElementById('boilerType').value,
            
            floorHeatZones: parseInt(document.getElementById('floorHeatZones').value) || 0,
            floorHeatArea: parseInt(document.getElementById('floorHeatArea').value) || 0,
            tpRegs: parseInt(document.getElementById('tpRegulators').value) || 0,
            
            hasMasterKey: document.getElementById('masterKey').checked,
            roomsData: rooms
        };

        // 2. Статистика по комнатам
        let stats = {
            sockets: 0, switches: 0, ac: 0,
            ceiling: 0, sconces: 0, backlight: 0,
            net: 0, tv: 0
        };

        rooms.forEach(r => {
            if(r.hasSockets) stats.sockets += r.socketCount;
            if(r.hasSwitches) stats.switches += r.switchCount;
            if(r.hasAC) stats.ac += r.acCount;
            if(r.hasCeiling) stats.ceiling += r.ceilingCount;
            if(r.hasSconces) stats.sconces += r.sconceCount;
            if(r.hasBacklight) stats.backlight += r.backlightCount;
            if(r.hasNet) stats.net += r.netCount;
            if(r.hasTv) stats.tv += r.tvCount;
        });

        // Добавляем технику
        if(inputData.hasWash) stats.sockets++;
        if(inputData.hasDish) stats.sockets++;
        if(inputData.hasOven) stats.sockets++;
        if(inputData.hasBoiler) stats.sockets++;

        // 3. Расчет точек
        const totalPoints = stats.sockets + stats.switches + stats.ceiling + stats.sconces + stats.backlight + 
                            stats.net + stats.tv + inputData.tpRegs + stats.ac;
        
        const countPodrozetniki = stats.sockets + stats.switches + stats.net + stats.tv + inputData.tpRegs + stats.ac;
        const countJunctionBoxes = Math.ceil(totalPoints / 6) + 2;

        // 4. Расчет кабеля (из materials.js)
        const cableData = calculateCableLength(inputData.area, totalPoints, inputData.maxDist, inputData.cableCoef, stats.ac, stats.backlight);

        // 5. Расчет щита (из panel.js)
        const panelData = calculatePanel(inputData, stats);

        // 6. Расчет общих материалов и работ (из materials.js)
        const genMats = calculateGeneralMaterials(inputData, cableData, countPodrozetniki, countJunctionBoxes);
        const genWorks = calculateGeneralWorks(inputData, cableData, countPodrozetniki, panelData.workCost);

        // 7. Итоговые суммы
        // Материалы: Общие + Щит
        // Примечание: В calculateGeneralMaterials мы не считали боксы и УЗО, они в panelData.materialCost
        const totalMat = genMats.cablePwr + genMats.cableLight + genMats.pods + genMats.boxes + genMats.fhMat + panelData.materialCost;
        
        // Работы: Общие + Щит
        const totalWrk = genWorks.strobe + genWorks.pods + genWorks.fhMat + panelData.workCost;
        
        const grandTotal = totalMat + totalWrk;

        // 8. Генерация HTML
        let roomSummary = rooms.map(r => {
            let badges = [];
            if(r.hasSockets) badges.push(`🔌${r.socketCount}`);
            if(r.hasNet) badges.push(`🌐${r.netCount}`);
            if(r.hasTv) badges.push(`📺${r.tvCount}`);
            if(r.hasSwitches) badges.push(`🔘${r.switchCount}`);
            if(r.hasCeiling) badges.push(`${r.ceilingCount}`);
            if(r.hasSconces) badges.push(`🕯️${r.sconceCount}`);
            if(r.hasBacklight) badges.push(`✨${r.backlightCount}`);
            if(r.hasAC) badges.push(`❄️${r.acCount}`);
            return `<span class="summary-badge">${r.name}: ${badges.join(' ')}</span>`;
        }).join('');

        const utpLen = (stats.net + stats.tv) > 0 ? Math.ceil((stats.net + stats.tv) * 8 * 1.2) : 0;
        const bathCountInList = inputData.roomsData.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2').length;

        const html = `
            <div class="alert">🏗️ Черновая отделка | Санузлов: ${bathCountInList}</div>
            <div style="margin:10px 0">${roomSummary}</div>
            
            <div style="font-weight:bold;margin-bottom:10px;">📦 Расчет материалов:</div>
            <div class="cable-breakdown">
                <div class="cable-row"><span>🔌 ВВГнг 3×2.5 (Силовой):</span> <b>${cableData.pwr} м</b></div>
                <div class="cable-row"><span>💡 ВВГнг 3×1.5 (Свет):</span> <b>${cableData.light} м</b></div>
                ${utpLen > 0 ? `<div class="cable-row"><span>📡 Кабель UTP (витая пара):</span> <b>~${utpLen} м</b></div>` : ''}
                ${cableData.ac > 0 ? `<div class="cable-row"><span>❄️ Кабель на кондиционеры:</span> <b>~${cableData.ac} м</b></div>` : ''}
                
                <hr style="border:0; border-top:1px dashed #ccc; margin:8px 0;">
                
                <div class="cable-row" style="background:rgba(255,149,0,0.15);padding:5px;border-radius:4px;">
                    <span>🏺 <b>Подрозетники:</b></span> <b>${countPodrozetniki} шт</b>
                </div>
                <div class="cable-row"><span>📦 Распред. коробки:</span> ~${countJunctionBoxes} шт</div>
                ${inputData.floorHeatZones > 0 ? `<div class="cable-row"><span>🔥 Маты ТП:</span> ${inputData.floorHeatArea} м²</div>` : ''}
            </div>

            ${generatePanelHTML(panelData)}
            
            <hr style="border:0;border-top:1px dashed #ccc;margin:15px 0;">
            <div style="display:flex;justify-content:space-between;"><span>Материалы:</span> <span>${totalMat.toLocaleString()} ₽</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Работы:</span> <span>${totalWrk.toLocaleString()} ₽</span></div>
            <div class="total-price">ИТОГО: ${grandTotal.toLocaleString()} ₽</div>
        `;

        document.getElementById('result').innerHTML = html;
        document.getElementById('result').style.display = 'block';

        window.lastData = `ЧЕРНОВАЯ ${inputData.area}м²\nРозетки: ${stats.sockets} | Интернет: ${stats.net} | ТВ: ${stats.tv}\nГрупп щита: ${panelData.groups.length}\nИтого: ${grandTotal} ₽`;

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