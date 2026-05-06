// Цены специфичные для щита (если отличаются от общих)
const PANEL_P = {
    box_per_module_row: 110, // Цена одного бокса/ряда (условно)
    uzo: 1650,
    contactor: 2700,
    work_panel_base: 3200,
    work_group_add: 230,
    work_contactor_install: 1500
};

/**
 * Формирует группы щита и считает стоимость его сборки
 */
function calculatePanel(data, stats) {
    let groups = [];
    
    // 1. Вводная группа
    groups.push({ name: "Вводной автомат + Реле напряжения", type: "main" });

    // 2. Силовые группы (техника)
    if (data.hasWash) groups.push({ name: "Стиральная машина", w: 2.5 });
    if (data.hasDish) groups.push({ name: "ПММ", w: 2.5 });
    if (data.hasOven) groups.push({ name: "Духовка + СВЧ", w: 2.5 });
    if (data.hasBoiler) {
        const isFlow = data.boilerType === 'flow';
        groups.push({ 
            name: isFlow ? "Проточный водонагреватель (3×6)" : "Бойлер (3×2.5)", 
            w: isFlow ? 6.0 : 2.5 
        });
    }

    // 3. Санузлы
    const bathCount = data.roomsData.filter(r => r.templateId === 'bathroom' || r.templateId === 'bathroom2').length;
    if (bathCount > 0) {
        groups.push({ name: `Розетки с/у (УЗО) ×${bathCount}`, w: 2.5 });
    }

    // 4. Теплые полы
    if (data.floorHeatZones > 0) {
        groups.push({ name: `Теплые полы (${data.floorHeatZones} зон)`, w: 2.5 });
    }

    // 5. Кондиционеры
    if (stats.ac > 0) {
        groups.push({ name: `Кондиционеры (${stats.ac} шт)`, w: 2.5 });
    }

    // 6. Освещение
    const totalLightPoints = stats.ceiling + stats.sconces + stats.backlight;
    if (totalLightPoints > 0) {
        // Группируем свет примерно по 10-12 точек на автомат 10А/16А
        const lightGroups = Math.ceil(totalLightPoints / 10);
        groups.push({ name: `Освещение (${lightGroups} групп)`, w: 1.5 });
    }

    // 7. Мастер-выключатель (Контактор)
    if (data.hasMasterKey) {
        groups.push({ name: "Контактор (Мастер-выкл)", w: 0, type: 'contactor' });
    }

    // --- РАСЧЕТ СТОИМОСТИ ЩИТА ---
    
    // Количество модулей (упрощенно: 1 группа = ~2 модуля, вводная ~4, УЗО ~2)
    // Для точного расчета нужен сложный алгоритм, здесь используем приближенный для сметы
    let estimatedModules = 4; // Вводная
    groups.forEach(g => {
        if (g.type === 'contactor') estimatedModules += 2;
        else estimatedModules += 2; // Автомат + возможно УЗО (если не общее)
    });
    
    // Стоимость компонентов щита (боксы, УЗО, контактор)
    // Упрощаем: считаем, что УЗО уже включено в цену группы или считаем отдельно
    // Давайте посчитаем явно УЗО для влажных зон и ТП, если они есть
    
    let panelMaterialCost = 0;
    let panelWorkCost = 0;

    // Базовая работа по сборке щита до 12 модулей
    panelWorkCost = PANEL_P.work_panel_base;
    
    // Доплата за каждую группу сверх базы (например, база включает 6 групп)
    const baseGroups = 6;
    if (groups.length > baseGroups) {
        panelWorkCost += (groups.length - baseGroups) * PANEL_P.work_group_add;
    }

    // Материалы: УЗО (влажные зоны)
    let uzoCount = 0;
    if (bathCount > 0) uzoCount++; // Одно УЗО на все розетки с/у или по одному? Обычно одно общее на влажные.
    if (data.floorHeatZones > 0) uzoCount++; // Часто ТП сажают на отдельное УЗО или то же самое.
    // Для сметы возьмем 2 УЗО типичных случая
    if (bathCount > 0 || data.floorHeatZones > 0) {
         // Если есть влажные зоны, добавляем стоимость УЗО в материалы
         // Предположим 2 шт для надежности
         panelMaterialCost += 2 * PANEL_P.uzo;
    }

    // Материал: Контактор
    if (data.hasMasterKey) {
        panelMaterialCost += PANEL_P.contactor;
        panelWorkCost += PANEL_P.work_contactor_install;
    }

    // Материал: Бокс (щит)
    // Примерная оценка: 1 ряд (12-14 модулей) стоит около 1000-2000р. 
    // Добавим условную стоимость щита в зависимости от кол-ва групп
    const boxCostEstimate = Math.ceil(groups.length / 6) * 1500; // 1500р за каждый блок на 6 групп
    panelMaterialCost += boxCostEstimate;

    // Стоимость самих автоматов (учтена в группе или отдельно?)
    // Обычно в таких сметах автоматы считают поштучно. 
    // Добавим среднюю цену автомата (300р) * кол-во групп
    const automatsCost = groups.length * 350; 
    panelMaterialCost += automatsCost;


    return {
        groups: groups,
        materialCost: panelMaterialCost,
        workCost: panelWorkCost,
        moduleCount: estimatedModules
    };
}

/**
 * Генерирует HTML список групп щита
 */
function generatePanelHTML(panelData) {
    let groupHtml = panelData.groups.map(g => {
        if (g.type === 'contactor') return `<li><span>${g.name}</span> <span>2 мод</span></li>`;
        if (g.type === 'main') return `<li><span>${g.name}</span> <span>-</span></li>`;
        return `<li><span>${g.name}</span> <span>${g.w ? g.w + ' мм²' : '-'}</span></li>`;
    }).join('');

    return `
        <div style="font-weight:bold;margin:15px 0 5px;">📋 Схема щита (${panelData.groups.length} групп):</div>
        <ul class="group-list">${groupHtml}</ul>
    `;
}