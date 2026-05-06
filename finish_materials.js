// === ЦЕНЫ МАТЕРИАЛОВ (ЧИСТОВАЯ) ===
const FINISH_MAT_P = {
    socket: 165,       // Розетка силовая
    switch: 135,       // Выключатель
    net_socket: 250,   // Интернет RJ-45
    tv_socket: 250,    // ТВ розетка
    tp_regulator: 1500,// Терморегулятор ТП (механизм + рамка)
    light_ceiling: 220,// Потолочный светильник (средний)
    light_sconce: 180, // Бра
    backlight_point: 320, // Блок питания + контроллер на зону (усредненно)
    ac_cover: 0        // Декоративная панель кондиционера
};

/**
 * Расчет стоимости материалов чистовой отделки
 */
function calculateFinishMaterials(stats) {
    const costSockets = stats.sockets * FINISH_MAT_P.socket;
    const costSwitches = stats.switches * FINISH_MAT_P.switch;
    const costNet = stats.net * FINISH_MAT_P.net_socket;
    const costTv = stats.tv * FINISH_MAT_P.tv_socket;
    const costTpRegs = stats.tpRegs * FINISH_MAT_P.tp_regulator;
    const costCeilingLights = stats.ceiling * FINISH_MAT_P.light_ceiling;
    const costSconces = stats.sconces * FINISH_MAT_P.light_sconce;
    const costBacklight = stats.backlight * FINISH_MAT_P.backlight_point;
    
    const totalMaterialCost = costSockets + costSwitches + costNet + costTv + 
                              costTpRegs + costCeilingLights + costSconces + costBacklight;

    return {
        total: totalMaterialCost,
        details: {
            sockets: costSockets,
            switches: costSwitches,
            net: costNet,
            tv: costTv,
            tpRegs: costTpRegs,
            ceiling: costCeilingLights,
            sconces: costSconces,
            backlight: costBacklight
        }
    };
}