// === ЦЕНЫ РАБОТ (ЧИСТОВАЯ) ===
const FINISH_WORK_P = {
    install_mechanism: 150,  // Установка розетки/выключателя/слаботочки
    install_tp_regulator: 800, // Установка терморегулятора ТП
    install_light_ceiling: 380, // Подключение потолочного светильника
    install_sconce: 420,     // Подключение бра
    install_backlight: 280,  // Монтаж подсветки (подключение блока)
    install_ac_unit: 650     // Навеска и подключение внутреннего блока кондиционера
};

/**
 * Расчет стоимости работ чистовой отделки
 */
function calculateFinishWorks(stats) {
    // Механизмы (розетки, выключатели, интернет, ТВ)
    const countMechanisms = stats.sockets + stats.switches + stats.net + stats.tv;
    const workMechanisms = countMechanisms * FINISH_WORK_P.install_mechanism;

    const workTpRegs = stats.tpRegs * FINISH_WORK_P.install_tp_regulator;
    const workCeilingLights = stats.ceiling * FINISH_WORK_P.install_light_ceiling;
    const workSconces = stats.sconces * FINISH_WORK_P.install_sconce;
    const workBacklight = stats.backlight * FINISH_WORK_P.install_backlight;
    const workAcUnits = stats.ac * FINISH_WORK_P.install_ac_unit;

    const totalWorkCost = workMechanisms + workTpRegs + workCeilingLights + 
                          workSconces + workBacklight + workAcUnits;

    return {
        total: totalWorkCost,
        details: {
            mechanisms: workMechanisms,
            tpRegs: workTpRegs,
            ceiling: workCeilingLights,
            sconces: workSconces,
            backlight: workBacklight,
            ac: workAcUnits
        }
    };
}