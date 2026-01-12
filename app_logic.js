// app_logic.js

// ---------------------------------------------------------

function inicializarSistemasGenerales() {
    let selectGen = document.getElementById("inputSistemaGeneral");
    if (!selectGen) return;

    selectGen.innerHTML = ""; // Limpiar
    
    if (typeof SISTEMAS_GENERALES !== 'undefined') {
        SISTEMAS_GENERALES.forEach(sys => {
            let opcion = document.createElement("option");
            opcion.value = sys.id;
            opcion.text = sys.nombre;
            selectGen.add(opcion);
        });
    }
}

// 1. LÓGICA DE INTERFAZ (Bloqueo de Ventanas)
// ---------------------------------------------------------
function configurarUI_Apoyos() {
    let modo = document.getElementById("selectModoApoyos").value;

    // Referencias a los inputs
    let inputSep = document.getElementById("inputSepApoyos");
    let inputTotal = document.getElementById("inputTotalApoyos");
    let divEsp = document.getElementById("grupoEspecifico");

    // Reset visual
    inputSep.disabled = false;
    inputTotal.disabled = false;
    inputTotal.readOnly = false;
    inputTotal.style.backgroundColor = "white";
    divEsp.style.display = "none";

    if (modo === "PROPUESTO") {
        // MODO 1: Calculamos en base a separación
        // Ventana 1 (Sep): Activa
        // Ventana 2 (Total): Bloqueada (Sombreada) - Es Resultado
        // Ventana 3 (Específico): Oculta
        inputTotal.readOnly = true;
        inputTotal.style.backgroundColor = "#e0e0e0"; // Sombreado
        previsualizarTotalApoyos(); // Ejecuta el cálculo simple al cambiar
    } 
    else if (modo === "UNIFORME") {
        // MODO 2: Ingreso directo manual
        // Ventana 1 (Sep): Bloqueada
        // Ventana 2 (Total): Activa (Usuario escribe)
        // Ventana 3: Oculta
        inputSep.disabled = true;
        inputSep.value = ""; // Limpiamos para no confundir
    } 
    else if (modo === "ESPECIFICO") {
        // MODO 3: Detalle fino
        // Ventana 1 y 2: Bloqueadas
        // Ventana 3: Visible y Activa
        inputSep.disabled = true;
        inputTotal.disabled = true;
        inputTotal.value = "";
        divEsp.style.display = "block";
    }
}

// Función auxiliar para mostrar el cálculo en gris (Modo 1)
function previsualizarTotalApoyos() {
    if (document.getElementById("selectModoApoyos").value !== "PROPUESTO") return;

    let vertiente = parseFloat(document.getElementById("inputVertiente").value) || 0;
    let sep = parseFloat(document.getElementById("inputSepApoyos").value) || 0;

    if (vertiente > 0 && sep > 0) {
        let total = Math.ceil(vertiente / sep) + 1; // +1 por el arranque
        document.getElementById("inputTotalApoyos").value = total;
    }
}

// ---------------------------------------------------------
// 2. MOTOR DE CÁLCULO (Actualizado)
// ---------------------------------------------------------
function ejecutarCalculoFehaciente() {
    console.log("Iniciando cálculo...");

    try {
        if (typeof SISTEMAS_CONSTRUCTIVOS === 'undefined') throw new Error("Falta catalogos.js");

        // --- A. CAPTURA DE DATOS BÁSICOS ---
        let sysCode = document.getElementById("inputSistema").value;
        let sistemaData = SISTEMAS_CONSTRUCTIVOS[sysCode];
        
        let largoCanalon = parseFloat(document.getElementById("inputLargo").value) || 0;
        let anchoVertiente = parseFloat(document.getElementById("inputVertiente").value) || 0;
        let altura = parseFloat(document.getElementById("inputAltura").value) || 0;

        if (largoCanalon === 0 || anchoVertiente === 0) { 
            alert("⚠️ Ingresa dimensiones válidas."); return; 
        }

        // --- B. DETERMINAR CANTIDAD DE APOYOS (LÓGICA NUEVA) ---
        let modoApoyos = document.getElementById("selectModoApoyos").value;
        let apoyosCampo = 0;
        let apoyosPerimetro = 0;
        let metodoUsado = ""; // Para el reporte

        if (modoApoyos === "PROPUESTO") {
            // Lógica de División
            let sep = parseFloat(document.getElementById("inputSepApoyos").value) || 1.52;
            let totalCalc = Math.ceil(anchoVertiente / sep) + 1;
            
            apoyosCampo = totalCalc;
            apoyosPerimetro = totalCalc; // Asumimos igualdad si no es específico
            metodoUsado = `Calculado cada ${sep}m`;
        } 
        else if (modoApoyos === "UNIFORME") {
            // Lógica Directa
            let totalManual = parseFloat(document.getElementById("inputTotalApoyos").value) || 0;
            if(totalManual === 0) throw new Error("En modo Uniforme, debes indicar el Total de Largueros.");
            
            apoyosCampo = totalManual;
            apoyosPerimetro = totalManual;
            metodoUsado = "Ingreso Manual Uniforme";
        } 
        else if (modoApoyos === "ESPECIFICO") {
            // Lógica Detallada
            apoyosCampo = parseFloat(document.getElementById("inputApoyosCampo").value) || 0;
            apoyosPerimetro = parseFloat(document.getElementById("inputApoyosPerim").value) || 0;
            
            if(apoyosCampo === 0 || apoyosPerimetro === 0) throw new Error("Ingresa las cantidades de Campo y Perímetro.");
            metodoUsado = "Específico Plano";
        }

        // --- C. CÁLCULO DE LÁMINAS (Igual que antes) ---
        // Zonificación Viento (ASCE)
        let anchoPerim = Math.max((altura / 3), (typeof REGLAS_ASCE !== 'undefined' ? REGLAS_ASCE.ancho_minimo_perimetro : 1.20));
        
        let anchoEfectivo = sistemaData.ancho_efectivo;
        let numColumnas = Math.ceil(largoCanalon / anchoEfectivo);
        
        let colsPerimetro = Math.ceil((anchoPerim * 2) / anchoEfectivo);
        let colsCampo = numColumnas - colsPerimetro;
        if (colsCampo < 0) { colsCampo = 0; colsPerimetro = numColumnas; }

        let numFilas = (sistemaData.tipo === "LAMINACION") ? Math.ceil(anchoVertiente / 12.00) : 1;

        // ... (Código anterior A, B, C se mantiene igual) ...

        // --- D. CÁLCULO DE FIJACIONES (CON MATRIZ DE VIENTO) ---
        
        let velViento = document.getElementById("inputViento").value; // "150" o "200"
        let refMatriz = sistemaData.matriz_ref; // Ej. "TR 101"
        
        // Obtenemos las densidades de la matriz (Si no existe, usamos default 1)
        let reglasFijacion = MATRIZ_VIENTO[refMatriz] ? MATRIZ_VIENTO[refMatriz][velViento] : { c: 1, p: 1 };
        
        let densidadCampo = reglasFijacion.c;     // Ej. 3 tornillos
        let densidadPerim = reglasFijacion.p;     // Ej. 4 tornillos (o 5 si es 200km/h)

        // Cálculo Total:
        // (ColumnasCampo * ApoyosCampo * DensidadCampo) + (ColumnasPerim * ApoyosPerim * DensidadPerim)
        
        let totalFijaciones = 0;
        let detalleCalculo = "";

        if (sistemaData.tipo === "MEMBRANA") {
            // Lógica Especial TPO (Densidad por Rollo/Area según tu CSV)
            // En tu CSV, TPO tiene valores como 105, 210. Asumiremos que es por Rollo Estándar.
            let rollosCampo = (colsCampo * numFilas); // Aprox
            let rollosPerim = (colsPerimetro * numFilas);
            
            totalFijaciones = (rollosCampo * densidadCampo) + (rollosPerim * densidadPerim);
            detalleCalculo = `Densidad TPO: ${densidadCampo} (C) / ${densidadPerim} (P) x Rollo`;
        } 
        else {
            // Lógica Lámina (Por Apoyo / Por Larguero)
            // Multiplicamos por numFilas también (traslapes longitudinales llevan fijación)
            
            let fijCampo = (colsCampo * apoyosCampo * numFilas) * densidadCampo;
            let fijPerim = (colsPerimetro * apoyosPerimetro * numFilas) * densidadPerim;
            
            totalFijaciones = fijCampo + fijPerim;
            detalleCalculo = `Factor: ${densidadCampo} (C) / ${densidadPerim} (P) x Apoyo`;
        }

        // --- E. SALIDA (Actualizada) ---
        let htmlResumen = `
            <p><strong>Estrategia Apoyos:</strong> ${metodoUsado}</p>
            <p><strong>Viento ${velViento} km/h:</strong> Fijación Campo: ${densidadCampo} | Perímetro: ${densidadPerim}</p>
            <p><strong>Láminas:</strong> ${numColumnas} Hileras (${colsCampo} C / ${colsPerimetro} P)</p>
        `;
        document.getElementById("outputResumen").innerHTML = htmlResumen;

        let tbody = document.querySelector("#tablaResultados tbody");
        tbody.innerHTML = "";
        
        tbody.innerHTML += `<tr><td>${sistemaData.nombre}</td><td>${numColumnas} col x ${numFilas} filas</td><td>${numColumnas*numFilas}</td><td>Pzas</td></tr>`;
        
        tbody.innerHTML += `<tr><td>Fijación (${sistemaData.fijacion_tipo})</td><td>${detalleCalculo}</td><td>${Math.ceil(totalFijaciones)}</td><td>Pzas</td></tr>`;

    } catch (error) {
        alert("❌ " + error.message);
    }
}

// Inicializar estado al cargar
window.onload = function() {
    configurarUI_Apoyos();       // La que hicimos antes
    inicializarSistemasGenerales(); // La nueva
    actualizarLeyendas();        // Para mostrar la pendiente inicial
};