// === ЦЕНЫ (черновые работы) ===
const P = {
    cable_1_5: 52, cable_2_5: 78, cable_4_0: 135, cable_6_0: 195,
    pod: 35, junction_box: 45, box: 110,
    floor_heat_mat: 1600, contactor: 2700, uzo: 1650,
    work_point_install: 480,
    work_strobe_base: 260,
    work_floor_heat_mat: 500,
    // Цены на сборку щита переехали в panel.js, но цена за модуль/группу может остаться здесь или там.
    // Оставим базовые цены на компоненты щита здесь, а логику сборки в panel.js
    work_panel_base: 3200, 
    work_group_add: 230
};

/**
 * Расчет длины кабеля
 */
function calculateCableLength(area, totalPoints, maxDist, complexityCoef, acCount, totalBacklight) {
    const a = Number(area) || 0;
    const tp = Number(totalPoints) || 0;
    const md = Number(maxDist) || 0;
    const cc = Number(complexityCoef) || 1.0;
    if (a <= 0) return { total: 0, pwr: 0, light: 0, ac: 0 };
    
    const perimeter = Math.sqrt(a) * 4;
    let baseLen = perimeter * 1.5;
    const pointsLen = tp * 4.0;
    const distAdjustment = md > 15 ? ((md - 15) * 3) : 0;
    const acLen = acCount * 8;
    const blLen = totalBacklight * 6; 
    
    let rawTotal = (baseLen + pointsLen + distAdjustment + acLen + blLen) * cc;
    let finalTotal = Math.ceil(rawTotal * 1.15);
    
    return { 
        total: finalTotal, 
        pwr: Math.ceil(finalTotal * 0.55), 
        light: Math.ceil(finalTotal * 0.45),
        ac: acCount * 8
    };
}

/**
 * Расчет общих материалов (без щита)
 */
function calculateGeneralMaterials(data, cableData, countPodrozetniki, countJunctionBoxes) {
    const costCablePwr = cableData.pwr * P.cable_2_5;
    const costCableLight = cableData.light * P.cable_1_5;
    const costPodrozetniki = countPodrozetniki * P.pod;
    const costJunctionBoxes = countJunctionBoxes * P.junction_box;
    
    // Боксы для щита будут добавлены в panel.js, так как их количество зависит от групп
    // Но если нужно считать боксы заранее, можно оставить заглушку
    
    const costFloorHeatMat = data.floorHeatZones > 0 ? (data.floorHeatArea * P.floor_heat_mat) : 0;
    
    // UZO и Контактор считаются в панели, но цена есть здесь.
    // Для простоты вернем частичную сумму, а полную соберем в main calculate
    
    return {
        cablePwr: costCablePwr,
        cableLight: costCableLight,
        pods: costPodrozetniki,
        boxes: costJunctionBoxes,
        fhMat: costFloorHeatMat
    };
}

/**
 * Расчет работ (черновых)
 */
function calculateGeneralWorks(data, cableData, countPodrozetniki, panelWorkCost) {
    const workStrobe = (cableData.pwr + cableData.light) * P.work_strobe_base * (data.wallPrice/280) * 0.8;
    const workInstallPods = countPodrozetniki * P.work_point_install;
    const workFloorHeatMat = data.floorHeatZones > 0 ? (data.floorHeatArea * P.work_floor_heat_mat) : 0;
    
    // Сборка щита считается отдельно в panel.js
    
    return {
        strobe: workStrobe,
        pods: workInstallPods,
        fhMat: workFloorHeatMat,
        panel: panelWorkCost // Приходит из panel.js
    };
}