// catalogos.js - Actualizado con Matriz de Viento
// LISTA MAESTRA DE FAMILIAS (Rendimientos de Mano de Obra)
const SISTEMAS_GENERALES = [
    { id: 1,  nombre: "1. Aislamiento fibra vidrio/mineral s/larguero" },
    { id: 2,  nombre: "2. Aislamiento espumado (PIR/PUR) s/larguero" },
    { id: 3,  nombre: "3. Lámina fijación expuesta (R101, O100)" },
    { id: 4,  nombre: "4. Panel > 4\" fijación expuesta (Galvatecho)" },
    { id: 5,  nombre: "5. Lámina rolada SSR Galvalok" },
    { id: 6,  nombre: "6. Lámina rolada en sitio oculta (KR-18, KR-24)" },
    { id: 7,  nombre: "7. Lámina autosoportante (Arco K01/K02)" },
    { id: 8,  nombre: "8. Panel > 2\" fijación oculta (Multytecho)" },
    { id: 9,  nombre: "9. Aislamiento fibra vidrio/mineral s/deck" },
    { id: 10, nombre: "10. Aislamiento espumado s/deck (Cover Board)" },
    { id: 11, nombre: "11. Desviador Diamante" },
    { id: 12, nombre: "12. Membrana mecánicamente anclada (TPO/PVC)" },
    { id: 13, nombre: "13. Membrana totalmente adherida" },
    { id: 14, nombre: "14. Traslúcidos (Acrílico/Policarbonato)" },
    { id: 15, nombre: "15. Accesorios (Brocales, Domos)" }
];
// Datos extraídos de FICHAS TECNICAS TIPO2 - DATOS2.csv (A49:N73)
// Formato: { "VELOCIDAD": { c: Campo, p: Perímetro } }
const MATRIZ_VIENTO = {
    "TR 72":    { "150": { c: 3, p: 3 }, "200": { c: 3, p: 4 } },
    "TR 101":   { "150": { c: 3, p: 4 }, "200": { c: 4, p: 5 } }, // R-101
    "TR 90":    { "150": { c: 4, p: 5 }, "200": { c: 5, p: 6 } },
    "KR-18":    { "150": { c: 1, p: 1 }, "200": { c: 1, p: 1 } }, // Clips (1 por apoyo)
    "TPO":      { "150": { c: 105, p: 210 }, "200": { c: 315, p: 420 } }, // Densidad Global
    "LOSACERO": { "150": { c: 3, p: 3 }, "200": { c: 3, p: 3 } }
};

const SISTEMAS_CONSTRUCTIVOS = {
    // --- LÁMINAS ACANALADAS (FIJACIÓN EXPUESTA) ---
    "AC_TR72": {
        nombre: "TR-72 (Acanalado)",
        tipo: "LAMINACION",
        ancho_efectivo: 0.72,
        pend_min: 7,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 72"
    },
    "AC_TR101": {
        nombre: "TR-101 / R-101",
        tipo: "LAMINACION",
        ancho_efectivo: 1.01,
        pend_min: 7,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 101"
    },
    "AC_TRN100": {
        nombre: "TRN-100/35",
        tipo: "LAMINACION",
        ancho_efectivo: 1.00,
        pend_min: 7,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 101" // Similar a R101
    },
    "AC_TR90": {
        nombre: "TR-90",
        tipo: "LAMINACION",
        ancho_efectivo: 0.90,
        pend_min: 7,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 90"
    },
    "AC_TO100": {
        nombre: "TO-100 (Ondulado)",
        tipo: "LAMINACION",
        ancho_efectivo: 0.95, // Aprox según mercado, ajustado de tabla
        pend_min: 10,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 101" // Comportamiento similar
    },
    "AC_TO725": {
        nombre: "TO-725 (Ondulado)",
        tipo: "LAMINACION",
        ancho_efectivo: 0.715,
        pend_min: 10,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 72"
    },
    "AC_TO30": {
        nombre: "TO-30 Full Hard",
        tipo: "LAMINACION",
        ancho_efectivo: 0.76,
        pend_min: 10,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 72"
    },
    
    // --- DECK / LOSACERO (ENTREPISO) ---
    "DC_TRD915": {
        nombre: "TRD-91.5 (Deck)",
        tipo: "LAMINACION",
        ancho_efectivo: 0.915,
        pend_min: 2,
        fijacion_tipo: "TORNILLO", // O Perno
        matriz_ref: "TR 101"
    },
    "DC_LOS15": {
        nombre: "Losacero 15",
        tipo: "LAMINACION",
        ancho_efectivo: 0.915,
        pend_min: 0,
        fijacion_tipo: "PERNO",
        matriz_ref: "LOSACERO"
    },
    "DC_LOS25": {
        nombre: "Losacero 25",
        tipo: "LAMINACION",
        ancho_efectivo: 0.915,
        pend_min: 0,
        fijacion_tipo: "PERNO",
        matriz_ref: "LOSACERO"
    },
    "DC_LOS30": { // SECCION 4 en Excel suele ser Losacero 30/Sección 4
        nombre: "Losacero 30 / Sección 4",
        tipo: "LAMINACION",
        ancho_efectivo: 0.915,
        pend_min: 0,
        fijacion_tipo: "PERNO",
        matriz_ref: "LOSACERO"
    },

    // --- PANELES AISLADOS ---
    "PN_MTECHO": {
        nombre: "Multytecho",
        tipo: "LAMINACION",
        ancho_efectivo: 1.00,
        pend_min: 5,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18" // Fijación oculta similar
    },
    "PN_GTECHO": {
        nombre: "Galvatecho",
        tipo: "LAMINACION",
        ancho_efectivo: 1.00,
        pend_min: 5,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18"
    },
    "PN_MMURO": {
        nombre: "Multymuro",
        tipo: "LAMINACION",
        ancho_efectivo: 1.067,
        pend_min: 0,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18"
    },
    "PN_GALVALOK": {
        nombre: "Galvalok (Panel)",
        tipo: "ROLADO_SITIO",
        ancho_efectivo: 0.61, // variable
        pend_min: 2,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18"
    },

    // --- ROLADOS EN SITIO (SSR) ---
    "SSR_KR18": {
        nombre: "KR-18",
        tipo: "ROLADO_SITIO",
        ancho_efectivo: 0.4572,
        pend_min: 2,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18"
    },
    "SSR_KR24": {
        nombre: "KR-24",
        tipo: "ROLADO_SITIO",
        ancho_efectivo: 0.61,
        pend_min: 2,
        fijacion_tipo: "CLIP",
        matriz_ref: "KR-18"
    },

    // --- OTROS / ESPECIALES ---
    "TJ_GALVATEJA": {
        nombre: "Galvateja",
        tipo: "LAMINACION",
        ancho_efectivo: 1.00, // Aprox, efectiva visual
        pend_min: 15,
        fijacion_tipo: "TORNILLO",
        matriz_ref: "TR 101"
    },
    "MEM_TPO": {
        nombre: "Membrana TPO",
        tipo: "MEMBRANA",
        ancho_efectivo: 2.44, // Puede variar por rollo
        pend_min: 1,
        fijacion_tipo: "PLATO",
        matriz_ref: "TPO"
    },
    "ISO_POLY4X8": {
        nombre: "Polyiso 4x8 (Aislamiento)",
        tipo: "MEMBRANA", // Tratamiento por área
        ancho_efectivo: 1.22, // 4 pies
        pend_min: 0,
        fijacion_tipo: "PLATO",
        matriz_ref: "TPO" // Usa densidad por m2 similar
    }
};

const REGLAS_ASCE = {
    ancho_minimo_perimetro: 1.20,
    factor_h_3: 0.333
};