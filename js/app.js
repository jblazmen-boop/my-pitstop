// ============ ESTADO Y TRADUCCIONES ============
let state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
let repuestosTemporales = [];
let manoObraTemporal = [];
let editandoMantenimientoId = null;
let currentLang = 'es'; 
let miGraficoInstancia = null; 

const STORAGE_KEY = 'mi_app_mantenimiento_coches'; 

// ============ SISTEMA DE SONIDO (BEEP) ============
function reproducirBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return; 

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square'; 
    osc.frequency.setValueAtTime(880, ctx.currentTime); 

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1); 

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1); 
  } catch (e) {
    console.log("Audio no disponible", e);
  }
}

const translations = {
  es: {
    vehiculos_titulo: "Vehículos", matricula: "Matrícula", marca: "Marca", modelo: "Modelo", bastidor: "Nº Bastidor (VIN)",
    add_vehiculo: "Añadir vehículo", acciones: "Acciones", reg_mantenimiento: "Registrar mantenimiento",
    vehiculo: "Vehículo", fecha: "Fecha", km: "Kms", tipo: "Tipo", taller: "Taller", notas: "Notas",
    mano_obra: "Mano de Obra", operacion: "Operación", precio: "Precio (€)", add_btn: "+ Añadir",
    total_mano: "Total Mano de Obra:", repuestos: "Repuestos", cant: "Cant.", descripcion: "Descripción",
    referencia: "Referencia", subir_foto: "Subir nueva foto (opcional)", cat_foto: "O elegir del catálogo (opcional)",
    add_repuesto: "+ Añadir Repuesto", foto: "Foto", total: "Total", total_repuestos: "Total Repuestos:",
    guardar_mant: "Guardar Mantenimiento", cancelar_edit: "Cancelar Edición", historial: "Historial de Mantenimientos",
    filtrar: "Filtrar por vehículo", todos: "Todos", operaciones: "Operaciones", mano: "Mano", piezas: "Piezas",
    gen_informe: "Generar Informe / Factura", tipo_informe: "Tipo de Informe", detallado: "Factura Detallada (con precios)",
    historico: "Histórico Técnico (sin precios)", fecha_desde: "Fecha desde", fecha_hasta: "Fecha hasta",
    iva: "IVA (%)", btn_gen_pdf: "Generar PDF", btn_share_pdf: "Compartir PDF", btn_email_pdf: "Enviar por Correo",
    btn_share_chart: "Compartir Gráfico", btn_email_chart: "Enviar Gráfico por Correo",
    copia_seguridad: "Copia de seguridad", copia_texto: "Los datos se guardan en este navegador. Si borras el historial o cambias de equipo, se pierden. Exporta una copia periódicamente.",
    exportar: "⬇ Exportar copia (JSON)", importar: "⬆ Importar copia", borrar: "🗑 Borrar todos los datos",
    derechos: "Todos los derechos reservados.", selecciona: "— Selecciona —", no_foto: "— No usar foto —",
    ej_operacion: "Ej: Sustituir correa", ej_referencia: "Ej: MANN-W712", seleccionar_archivo: "Seleccionar archivo",
    ph_matricula: "1234ABC", ph_marca: "Seat", ph_modelo: "León", ph_bastidor: "WVWZZZ...", ph_taller: "Taller Pepe", ph_descripcion: "Filtro de aceite",
    pdf_informe: "INFORME DE MANTENIMIENTO / FACTURA", pdf_factura: "INFORME DE MANTENIMIENTO / FACTURA",
    pdf_vehiculo: "Vehículo:", pdf_matricula: "Matrícula:", pdf_bastidor: "Nº Bastidor:", pdf_fecha_inf: "Fecha informe:",
    pdf_periodo: "Periodo:", pdf_mano_obra: "Desglose de Mano de Obra", pdf_concepto: "Concepto", pdf_importe: "Importe",
    pdf_repuestos: "Desglose de Repuestos", pdf_desc: "Descripción", pdf_precio_ud: "Precio Ud.", pdf_base: "Base imponible:",
    pdf_iva: "IVA", pdf_total: "TOTAL FACTURA:", pdf_servicios: "Servicio / Mano de Obra", pdf_materiales: "Materiales / Repuestos",
    pdf_taller_txt: "Taller:", modo_generacion: "Modo de generación", por_fechas: "Por rango de fechas", 
    por_seleccion: "Seleccionando mantenimientos", selecciona_mant: "Selecciona los mantenimientos para incluir en la factura",
    estadisticas: "Estadísticas de Gasto", recordatorios: "Avisos y Recordatorios", 
    prox_mant: "Próximo Mantenimiento", itv: "ITV", resumen_avisos: "Resumen de Avisos",
    fecha_prox_mant: "Fecha Próx. Mantenimiento", km_prox_mant: "Kms Próx. Mantenimiento", 
    fecha_prox_itv: "Fecha Próx. ITV", 
    registro_itv_pasada: "Al rellenar estos campos, se añadirá un registro al historial del coche:",
    fecha_pasada_itv: "Fecha Pasada ITV", km_itv_pasada: "Kms de esa ITV",
    guardar: "Guardar Datos", estado: "Estado", 
    itv_ok: "En regla", itv_warn: "Próximo", itv_danger: "Caducado", sin_fecha: "Sin fecha",
    itv_nombre: "Revisión ITV", prox_itv: "Próxima ITV",
    modo_grafico: "Ver por:", anios: "Años", meses: "Meses", anio_grafico: "Año:", gasto_total: "Gasto Total", gasto_total_mix: "Gasto Total (Mecánica + Fijos)",
    aviso_horizontal: "Para una mejor experiencia, gira tu dispositivo a horizontal.",
    gastos_fijos: "Gastos Fijos (Seguro e ITV)", gastos_fijos_texto: "Añade aquí el coste de tu seguro y de la tasa de la ITV para que se sumen al total de gastos del vehículo.",
    coste_seguro: "Coste Seguro (Anual)", coste_itv: "Coste Tasa ITV (Aprox)", resumen_fijos: "Resumen Fijos",
    pdf_titulo_grafico: "RESUMEN DE GASTOS", pdf_gasto_fijo: "Gasto Fijo (Seguro+ITV):", 
    email_asunto_grafico: "Resumen de Gastos My PitStop", email_cuerpo_grafico: "Adjunto el resumen de gastos generado con My PitStop. Por favor, no olvides adjuntar el PDF descargado.",
    email_asunto_informe: "Informe de Mantenimiento My PitStop", email_cuerpo_informe: "Adjunto el informe de mantenimiento generado con My PitStop. Por favor, no olvides adjuntar el PDF descargado."
  },
  en: {
    vehiculos_titulo: "Vehicles", matricula: "License Plate", marca: "Make", modelo: "Model", bastidor: "VIN Number",
    add_vehiculo: "Add vehicle", acciones: "Actions", reg_mantenimiento: "Register maintenance",
    vehiculo: "Vehicle", fecha: "Date", km: "Miles", tipo: "Type", taller: "Workshop", notas: "Notes",
    mano_obra: "Labor", operacion: "Operation", precio: "Price (€)", add_btn: "+ Add",
    total_mano: "Total Labor:", repuestos: "Parts", cant: "Qty.", descripcion: "Description",
    referencia: "Reference", subir_foto: "Upload new photo (optional)", cat_foto: "Or choose from catalog (optional)",
    add_repuesto: "+ Add Part", foto: "Photo", total: "Total", total_repuestos: "Total Parts:",
    guardar_mant: "Save Maintenance", cancelar_edit: "Cancel Edit", historial: "Maintenance History",
    filtrar: "Filter by vehicle", todos: "All", operaciones: "Operations", mano: "Labor", piezas: "Parts",
    gen_informe: "Generate Report / Invoice", tipo_informe: "Report Type", detallado: "Detailed Invoice (with prices)",
    historico: "Technical History (no prices)", fecha_desde: "Date from", fecha_hasta: "Date to",
    iva: "VAT (%)", btn_gen_pdf: "Generate PDF", btn_share_pdf: "Share PDF", btn_email_pdf: "Send by Email",
    btn_share_chart: "Share Chart", btn_email_chart: "Email Chart",
    copia_seguridad: "Backup", copia_texto: "Data is stored in this browser. If you clear your history or change devices, it will be lost. Export a backup regularly.",
    exportar: "⬇ Export backup (JSON)", importar: "⬆ Import backup", borrar: "🗑 Delete all data",
    derechos: "All rights reserved.", selecciona: "— Select —", no_foto: "— No photo —",
    ej_operacion: "Ex: Replace belt", ej_referencia: "Ex: MANN-W712", seleccionar_archivo: "Select file",
    ph_matricula: "1234ABC", ph_marca: "Seat", ph_modelo: "Leon", ph_bastidor: "WVWZZZ...", ph_taller: "Workshop Joe", ph_descripcion: "Oil filter",
    pdf_informe: "MAINTENANCE REPORT / INVOICE", pdf_factura: "MAINTENANCE REPORT / INVOICE",
    pdf_vehiculo: "Vehicle:", pdf_matricula: "Plate:", pdf_bastidor: "VIN:", pdf_fecha_inf: "Report date:",
    pdf_periodo: "Period:", pdf_mano_obra: "Labor Breakdown", pdf_concepto: "Concept", pdf_importe: "Amount",
    pdf_repuestos: "Parts Breakdown", pdf_desc: "Description", pdf_precio_ud: "Unit Price", pdf_base: "Subtotal:",
    pdf_iva: "VAT", pdf_total: "TOTAL INVOICE:", pdf_servicios: "Service / Labor", pdf_materiales: "Materials / Parts",
    pdf_taller_txt: "Workshop:", modo_generacion: "Generation mode", por_fechas: "By date range", 
    por_seleccion: "Selecting records", selecciona_mant: "Select maintenance records to include in the invoice",
    estadisticas: "Expense Statistics", recordatorios: "Reminders & Alerts", 
    prox_mant: "Next Maintenance", itv: "Vehicle Inspection", resumen_avisos: "Alerts Summary",
    fecha_prox_mant: "Next Maint. Date", km_prox_mant: "Next Maint. Miles", 
    fecha_prox_itv: "Next Insp. Date", 
    registro_itv_pasada: "By filling these fields, a record will be added to the car's history:",
    fecha_pasada_itv: "Last Insp. Date", km_itv_pasada: "Miles at Last Insp.",
    guardar: "Save Data", estado: "Status", 
    itv_ok: "Valid", itv_warn: "Due soon", itv_danger: "Expired", sin_fecha: "No date",
    itv_nombre: "MOT Inspection", prox_itv: "Next Vehicle Inspection",
    modo_grafico: "View by:", anios: "Years", meses: "Months", anio_grafico: "Year:", gasto_total: "Total Expense", gasto_total_mix: "Total Expense (Mechanics + Fixed)",
    aviso_horizontal: "For a better experience, rotate your device to landscape.",
    gastos_fijos: "Fixed Costs (Insurance & MOT)", gastos_fijos_texto: "Add the cost of your insurance and MOT fee here so they add up to the vehicle's total expenses.",
    coste_seguro: "Insurance Cost (Annual)", coste_itv: "MOT Fee (Approx)", resumen_fijos: "Fixed Summary",
    pdf_titulo_grafico: "EXPENSE SUMMARY", pdf_gasto_fijo: "Fixed Cost (Insurance+MOT):",
    email_asunto_grafico: "My PitStop Expense Summary", email_cuerpo_grafico: "Attached is the expense summary generated with My PitStop. Please do not forget to attach the downloaded PDF.",
    email_asunto_informe: "My PitStop Maintenance Report", email_cuerpo_informe: "Attached is the maintenance report generated with My PitStop. Please do not forget to attach the downloaded PDF."
  }
};

const tiposMantenimiento = {
  "type_1": { es: "Revisión / Mantenimiento", en: "Service / Maintenance" },
  "type_2": { es: "Motor", en: "Engine" },
  "type_3": { es: "Transmisión", en: "Transmission" },
  "type_4": { es: "Suspensión, Dirección y Frenos", en: "Suspension, Steering & Brakes" },
  "type_5": { es: "Electricidad / Electrónica", en: "Electrical / Electronics" },
  "type_6": { es: "Climatización", en: "Air Conditioning" },
  "type_7": { es: "Escape", en: "Exhaust" },
  "type_8": { es: "Interior, Habitáculo y Seguridad", en: "Interior, Cabin & Safety" },
  "type_9": { es: "Chasis y Carrocería", en: "Chassis & Bodywork" },
  "type_10": { es: "Otro", en: "Other" }
};

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[currentLang][key];
      } else {
        el.textContent = translations[currentLang][key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[currentLang][key]) {
      el.title = translations[currentLang][key].toUpperCase(); 
    }
  });

  for (const [key, texts] of Object.entries(tiposMantenimiento)) {
    const num = key.split('_')[1];
    const groupEl = document.getElementById('group-' + num);
    const optEl = document.getElementById('opt-' + num);
    if (groupEl) groupEl.label = texts[currentLang];
    if (optEl) optEl.textContent = texts[currentLang];
  }

  if(editandoMantenimientoId) {
      document.getElementById('titulo-formulario').textContent = currentLang === 'es' ? 'Editando Mantenimiento' : 'Editing Maintenance';
      document.getElementById('btn-guardar').textContent = currentLang === 'es' ? '💾 Guardar Cambios' : '💾 Save Changes';
  } else {
      document.getElementById('titulo-formulario').textContent = translations[currentLang].reg_mantenimiento;
      document.getElementById('btn-guardar').textContent = translations[currentLang].guardar_mant;
  }
  
  document.documentElement.lang = currentLang;
  renderAll(); 
  renderGrafico(); 
  cargarGastosFijos();
  cargarRecordatorios(); 
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('pitstop_idioma', lang); 
  document.getElementById('lang-es').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById('lang-' + lang).classList.add('active');
  translatePage();
}

function cargar() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) { 
    try { 
      state = JSON.parse(raw); 
      if (!state.catalogoFotos) state.catalogoFotos = [];
      if (!state.vehiculos) state.vehiculos = [];
      if (!state.mantenimientos) state.mantenimientos = [];

      state.vehiculos.forEach(v => { 
        if (!v.proxMant) v.proxMant = ''; 
        if (!v.proxKmMant) v.proxKmMant = ''; 
        if (!v.proxItv) v.proxItv = ''; 
        if (!v.ultItvFecha) v.ultItvFecha = '';
        if (!v.ultItvKm) v.ultItvKm = '';
        if (!v.costeSeguro) v.costeSeguro = '';
        if (!v.costeItv) v.costeItv = '';
      });

      state.mantenimientos.forEach(m => {
        if (m.tipo && !m.tipo.startsWith('type_')) {
            const foundKey = Object.keys(tiposMantenimiento).find(k => tiposMantenimiento[k].es === m.tipo || tiposMantenimiento[k].en === m.tipo);
            if (foundKey) m.tipo = foundKey;
        }
        if (!m.manoObra) {
          m.manoObra = [];
          if (m.concepto && m.mano > 0) {
            m.manoObra.push({ concepto: m.concepto, precio: m.mano });
          }
        }
        if (!m.repuestos) m.repuestos = [];
        if (!m.taller) m.taller = '';
        if (!m.notas) m.notas = '';
      });
    } catch(e) { console.log("Error al cargar datos", e); } 
  }
}
function guardar() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function fmt(n) { return (Number(n)||0).toFixed(2) + ' €'; }
function esc(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function abrirModal(src) {
  document.getElementById('img-modal').src = src;
  document.getElementById('modal-foto').style.display = 'flex';
}
function cerrarModal() {
  document.getElementById('modal-foto').style.display = 'none';
}

document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    // REPRODUCIR SONIDO AL CAMBIAR DE PESTAÑA
    reproducirBeep();

    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
    
    if (t.dataset.tab === 'grafico') {
        renderGrafico();
        cargarGastosFijos();
    }
    if (t.dataset.tab === 'recordatorios') cargarRecordatorios();
  };
});

function addVehiculo() {
  const mat = document.getElementById('v_matricula').value.trim().toUpperCase();
  const marca = document.getElementById('v_marca').value.trim();
  const modelo = document.getElementById('v_modelo').value.trim();
  const bastidor = document.getElementById('v_bastidor').value.trim().toUpperCase();
  
  if (!mat) { mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'La matrícula es obligatoria.' : 'License plate is required.', 'err'); return; }
  if (state.vehiculos.some(v => v.matricula === mat)) {
    mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Ya existe un vehículo con esa matrícula.' : 'A vehicle with that plate already exists.', 'err'); return;
  }
  
  state.vehiculos.push({ id: uid(), matricula: mat, marca, modelo, bastidor, proxMant: '', proxKmMant: '', proxItv: '', ultItvFecha: '', ultItvKm: '', costeSeguro: '', costeItv: '' });
  guardar();
  document.getElementById('v_matricula').value = '';
  document.getElementById('v_marca').value = '';
  document.getElementById('v_modelo').value = '';
  document.getElementById('v_bastidor').value = '';
  mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Vehículo añadido.' : 'Vehicle added.', 'ok');
  renderAll();
  cargarRecordatorios();
  cargarGastosFijos();
}

function editarVehiculo(id) {
  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;
  const marca = prompt(currentLang === 'es' ? "Marca:" : "Make:", v.marca);
  const modelo = prompt(currentLang === 'es' ? "Modelo:" : "Model:", v.modelo);
  const bastidor = prompt(currentLang === 'es' ? "Nº Bastidor:" : "VIN:", v.bastidor);
  if (marca === null) return;
  v.marca = marca;
  v.modelo = modelo;
  v.bastidor = bastidor.toUpperCase();
  guardar(); renderAll(); cargarRecordatorios(); cargarGastosFijos();
}

function eliminarVehiculo(id) {
  if (!confirm(currentLang === 'es' ? '¿Eliminar vehículo y todos sus mantenimientos?' : 'Delete vehicle and all its maintenance records?')) return;
  state.vehiculos = state.vehiculos.filter(v => v.id !== id);
  state.mantenimientos = state.mantenimientos.filter(m => m.vehiculoId !== id);
  guardar(); renderAll(); cargarRecordatorios(); cargarGastosFijos();
}

function addManoObra() {
  const concepto = document.getElementById('o_concepto').value.trim();
  const precio = parseFloat(document.getElementById('o_precio').value) || 0;
  if (!concepto) { alert(currentLang === 'es' ? "La operación es obligatoria." : "Operation is required."); return; }
  manoObraTemporal.push({ concepto, precio });
  document.getElementById('o_concepto').value = '';
  document.getElementById('o_precio').value = '';
  renderManoObraTemporal();
}

function eliminarManoObraTemporal(index) {
  manoObraTemporal.splice(index, 1);
  renderManoObraTemporal();
}

function renderManoObraTemporal() {
  const tbody = document.querySelector('#tabla_mano_obra tbody');
  tbody.innerHTML = '';
  let total = 0;
  if (manoObraTemporal.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#888; padding:10px;">${currentLang === 'es' ? 'No hay operaciones añadidas.' : 'No operations added.'}</td></tr>`;
  } else {
    manoObraTemporal.forEach((o, i) => {
      total += o.precio;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="border:1px solid #ddd; padding:6px;">${esc(o.concepto)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${fmt(o.precio)}</td>
        <td style="border:1px solid #ddd; padding:6px;"><button class="danger" style="padding:2px 6px;" onclick="eliminarManoObraTemporal(${i})">X</button></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById('total_mano').textContent = fmt(total);
}

// ============ REPUESTOS ============
function addRepuesto() {
  const cant = parseInt(document.getElementById('r_cant').value) || 1;
  const desc = document.getElementById('r_desc').value.trim();
  const ref = document.getElementById('r_ref').value.trim().toUpperCase();
  const precio = parseFloat(document.getElementById('r_precio').value) || 0;
  const fileInput = document.getElementById('r_foto');
  const fotoCatalogoId = document.getElementById('r_foto_catalogo').value;

  if (!desc) { alert(currentLang === 'es' ? "La descripción del repuesto es obligatoria." : "Part description is required."); return; }

  if (fotoCatalogoId) {
    const fotoObj = state.catalogoFotos.find(f => f.id === fotoCatalogoId);
    if (fotoObj) {
      guardarRepuesto(cant, desc, ref, precio, fotoObj.base64, fotoObj.id);
      return;
    }
  }

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        const nuevoId = uid();
        state.catalogoFotos.push({ id: nuevoId, nombre: `${desc} (${ref})`, base64: fotoBase64 });
        guardar();
        actualizarDesplegableFotos();

        guardarRepuesto(cant, desc, ref, precio, fotoBase64, nuevoId);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    guardarRepuesto(cant, desc, ref, precio, null, null);
  }
}

function guardarRepuesto(cant, desc, ref, precio, fotoBase64, fotoId) {
  repuestosTemporales.push({ cant, desc, ref, precio, foto: fotoBase64, fotoId: fotoId });
  document.getElementById('r_cant').value = 1;
  document.getElementById('r_desc').value = '';
  document.getElementById('r_ref').value = '';
  document.getElementById('r_precio').value = '';
  document.getElementById('r_foto').value = '';
  document.getElementById('r_foto_catalogo').value = '';
  
  const fileLabel = document.getElementById('file-btn-label');
  if (fileLabel) fileLabel.textContent = translations[currentLang].seleccionar_archivo;
  
  renderRepuestosTemporales();
}

function eliminarRepuestoTemporal(index) {
  repuestosTemporales.splice(index, 1);
  renderRepuestosTemporales();
}

function renderRepuestosTemporales() {
  const tbody = document.querySelector('#tabla_repuestos tbody');
  tbody.innerHTML = '';
  let total = 0;
  
  if (repuestosTemporales.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding:10px;">${currentLang === 'es' ? 'No hay repuestos añadidos.' : 'No parts added.'}</td></tr>`;
  } else {
    repuestosTemporales.forEach((r, i) => {
      const subtotal = r.cant * r.precio;
      total += subtotal;
      const fotoHtml = r.foto ? `<img src="${r.foto}" class="foto-miniatura" onclick="abrirModal('${r.foto}')" title="Clic para ampliar">` : '-';
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="border:1px solid #ddd; padding:6px; text-align:center;">${fotoHtml}</td>
        <td style="border:1px solid #ddd; padding:6px;">${r.cant}</td>
        <td style="border:1px solid #ddd; padding:6px;">${esc(r.desc)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${esc(r.ref)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${fmt(r.precio)}</td>
        <td style="border:1px solid #ddd; padding:6px;">${fmt(subtotal)}</td>
        <td style="border:1px solid #ddd; padding:6px;"><button class="danger" style="padding:2px 6px;" onclick="eliminarRepuestoTemporal(${i})">X</button></td>`;
      tbody.appendChild(tr);
    });
  }
  document.getElementById('total_repuestos').textContent = fmt(total);
}

function actualizarDesplegableFotos() {
  const sel = document.getElementById('r_foto_catalogo');
  const prev = sel.value;
  sel.innerHTML = `<option value="" data-i18n="no_foto">${translations[currentLang].no_foto}</option>`;
  state.catalogoFotos.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.nombre;
    sel.appendChild(opt);
  });
  if (prev) sel.value = prev;
}

// ============ MANTENIMIENTOS ============
function guardarMantenimiento() {
  const vehiculoId = document.getElementById('m_vehiculo').value;
  const fecha = document.getElementById('m_fecha').value;
  const km = document.getElementById('m_km').value;
  const tipo = document.getElementById('m_tipo').value; 
  const taller = document.getElementById('m_taller').value.trim();
  const notas = document.getElementById('m_notas').value.trim();
  
  if (!vehiculoId) { mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err'); return; }
  if (!fecha) { mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'La fecha es obligatoria.' : 'Date is required.', 'err'); return; }
  if (manoObraTemporal.length === 0 && repuestosTemporales.length === 0) {
    mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Añade al menos una operación o repuesto.' : 'Add at least one operation or part.', 'err'); return;
  }

  const mano = manoObraTemporal.reduce((sum, o) => sum + o.precio, 0);
  const piezas = repuestosTemporales.reduce((sum, r) => sum + (r.cant * r.precio), 0);

  if (editandoMantenimientoId) {
    const index = state.mantenimientos.findIndex(m => m.id === editandoMantenimientoId);
    if (index !== -1) {
      state.mantenimientos[index] = { 
        ...state.mantenimientos[index],
        vehiculoId, fecha, km: Number(km)||0, tipo, mano, piezas, taller, notas,
        manoObra: [...manoObraTemporal], repuestos: [...repuestosTemporales] 
      };
    }
    mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Mantenimiento actualizado con éxito.' : 'Maintenance updated successfully.', 'ok');
  } else {
    state.mantenimientos.push({ 
      id: uid(), vehiculoId, fecha, km: Number(km)||0, tipo, mano, piezas, taller, notas,
      manoObra: [...manoObraTemporal], repuestos: [...repuestosTemporales] 
    });
    mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Mantenimiento registrado con éxito.' : 'Maintenance recorded successfully.', 'ok');
  }
  
  guardar();
  cancelarEdicion();
  renderAll();
}

function editarMantenimiento(id) {
  const m = state.mantenimientos.find(x => x.id === id);
  if (!m) return;
  
  document.getElementById('m_vehiculo').value = m.vehiculoId;
  document.getElementById('m_fecha').value = m.fecha;
  document.getElementById('m_km').value = m.km || '';
  document.getElementById('m_tipo').value = m.tipo; 
  document.getElementById('m_taller').value = m.taller || '';
  document.getElementById('m_notas').value = m.notas || '';
  
  manoObraTemporal = m.manoObra ? JSON.parse(JSON.stringify(m.manoObra)) : [];
  repuestosTemporales = m.repuestos ? JSON.parse(JSON.stringify(m.repuestos)) : [];
  
  renderManoObraTemporal();
  renderRepuestosTemporales();
  
  editandoMantenimientoId = id;
  document.getElementById('btn-guardar').textContent = currentLang === 'es' ? '💾 Guardar Cambios' : '💾 Save Changes';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
  document.getElementById('titulo-formulario').textContent = currentLang === 'es' ? 'Editando Mantenimiento' : 'Editing Maintenance';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  editandoMantenimientoId = null;
  manoObraTemporal = [];
  repuestosTemporales = [];
  renderManoObraTemporal();
  renderRepuestosTemporales();
  
  document.getElementById('m_fecha').value = new Date().toISOString().slice(0,10);
  document.getElementById('m_km').value = '';
  document.getElementById('m_taller').value = '';
  document.getElementById('m_notas').value = '';
  document.getElementById('m_vehiculo').value = ''; 
  document.getElementById('m_tipo').value = 'type_1'; 

  document.getElementById('btn-guardar').textContent = translations[currentLang].guardar_mant;
  document.getElementById('btn-cancelar').style.display = 'none';
  document.getElementById('titulo-formulario').textContent = translations[currentLang].reg_mantenimiento;
  
  const fileLabel = document.getElementById('file-btn-label');
  if (fileLabel) fileLabel.textContent = translations[currentLang].seleccionar_archivo;
}

function eliminarMantenimiento(id) {
  if (!confirm(currentLang === 'es' ? '¿Eliminar este mantenimiento?' : 'Delete this maintenance record?')) return;
  state.mantenimientos = state.mantenimientos.filter(m => m.id !== id);
  guardar(); renderAll();
}

function verDesglose(id) {
  const m = state.mantenimientos.find(x => x.id === id);
  if (!m) return;
  
  const tipoTexto = tiposMantenimiento[m.tipo] ? tiposMantenimiento[m.tipo][currentLang] : m.tipo;
  
  let texto = (currentLang === 'es' ? "DESGLOSE DEL MANTENIMIENTO:" : "MAINTENANCE BREAKDOWN:") + "\n\n";
  texto += (currentLang === 'es' ? "Tipo: " : "Type: ") + tipoTexto + "\n\n";
  
  if (m.manoObra && m.manoObra.length > 0) {
    texto += (currentLang === 'es' ? "MANO DE OBRA:\n" : "LABOR:\n");
    m.manoObra.forEach(o => { texto += `- ${o.concepto}: ${fmt(o.precio)}\n`; });
    texto += "\n";
  }
  if (m.repuestos && m.repuestos.length > 0) {
    texto += (currentLang === 'es' ? "REPUESTOS:\n" : "PARTS:\n");
    m.repuestos.forEach(r => { texto += `- ${r.cant}x ${r.ref} (${r.desc}): ${fmt(r.cant*r.precio)}\n`; });
    texto += "\n";
  }
  texto += `TOTAL: ${fmt(m.mano + m.piezas)}`;
  alert(texto);
}

// ============ GASTOS FIJOS ============
function cargarGastosFijos() {
  const sel = document.getElementById('g_vehiculo');
  if (!sel) return;
  const vehiculoId = sel.value;
  
  const seguroInput = document.getElementById('gf_seguro');
  const itvInput = document.getElementById('gf_itv');

  if (vehiculoId) {
    const v = state.vehiculos.find(x => x.id === vehiculoId);
    if (v) {
      seguroInput.value = v.costeSeguro || '';
      itvInput.value = v.costeItv || '';
    }
  } else {
    seguroInput.value = '';
    itvInput.value = '';
  }
}

function guardarGastosFijos() {
  const vehiculoId = document.getElementById('g_vehiculo').value;
  const seguro = document.getElementById('gf_seguro').value;
  const itv = document.getElementById('gf_itv').value;
  
  if (!vehiculoId) { mostrarMsg('msg_gastos_fijos', currentLang === 'es' ? 'Selecciona un vehículo en el desplegable de arriba.' : 'Select a vehicle in the dropdown above.', 'err'); return; }
  
  const v = state.vehiculos.find(x => x.id === vehiculoId);
  if (v) {
    v.costeSeguro = seguro;
    v.costeItv = itv;
    
    guardar();
    renderGrafico(); 
    mostrarMsg('msg_gastos_fijos', currentLang === 'es' ? 'Gastos guardados.' : 'Costs saved.', 'ok');
  }
}

// ============ RENDER ============
function renderAll() {
  renderVehiculos();
  renderMantenimientos();
  renderSelects();
  if (document.getElementById('bloque_seleccion').style.display === 'block' && document.getElementById('i_vehiculo').value) {
    renderTablaSeleccion();
  }
}

function renderVehiculos() {
  const tbody = document.querySelector('#tabla_vehiculos tbody');
  tbody.innerHTML = '';
  if (state.vehiculos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${currentLang === 'es' ? 'Aún no hay vehículos. Añade uno arriba.' : 'No vehicles yet. Add one above.'}</td></tr>`;
    return;
  }
  state.vehiculos.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(v.matricula)}</td><td>${esc(v.marca)}</td><td>${esc(v.modelo)}</td>
      <td>${esc(v.bastidor)}</td>
      <td>
        <button class="secondary" style="padding:4px 8px; font-size:11px; margin-right:4px;" onclick="editarVehiculo('${v.id}')">${currentLang === 'es' ? 'Editar' : 'Edit'}</button>
        <button class="danger" onclick="eliminarVehiculo('${v.id}')">${currentLang === 'es' ? 'Eliminar' : 'Delete'}</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderMantenimientos() {
  const tbody = document.querySelector('#tabla_mantenimientos tbody');
  const filtro = document.getElementById('f_vehiculo').value;
  tbody.innerHTML = '';
  let lista = state.mantenimientos.slice().sort((a,b) => b.fecha.localeCompare(a.fecha));
  if (filtro) lista = lista.filter(m => m.vehiculoId === filtro);
  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">${currentLang === 'es' ? 'No hay mantenimientos registrados.' : 'No maintenance records found.'}</td></tr>`;
    return;
  }
  lista.forEach(m => {
    const v = state.vehiculos.find(x => x.id === m.vehiculoId);
    const fechaMostrar = m.fecha ? m.fecha.split('-').reverse().join('/') : '';
    let numOps = (m.manoObra ? m.manoObra.length : 0) + (m.repuestos ? m.repuestos.length : 0);
    
    const tipoTexto = tiposMantenimiento[m.tipo] ? tiposMantenimiento[m.tipo][currentLang] : m.tipo;

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fechaMostrar}</td><td>${esc(v ? v.matricula : '—')}</td>
      <td>${m.km||''}</td><td>${esc(tipoTexto)}</td>
      <td><button class="secondary" style="padding:4px 8px; font-size:11px;" onclick="verDesglose('${m.id}')">${currentLang === 'es' ? 'Ver' : 'View'} (${numOps})</button></td>
      <td>${fmt(m.mano)}</td><td>${fmt(m.piezas)}</td><td>${fmt(m.mano+m.piezas)}</td>
      <td style="display:flex; flex-direction:column; gap:4px;">
        <div>
            <button class="secondary" style="padding:4px 8px; font-size:11px;" onclick="editarMantenimiento('${m.id}')">${currentLang === 'es' ? 'Editar' : 'Edit'}</button>
            <button class="danger" onclick="eliminarMantenimiento('${m.id}')">${currentLang === 'es' ? 'Eliminar' : 'Delete'}</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderSelects() {
  const opts = state.vehiculos.map(v => `<option value="${v.id}">${esc(v.matricula)} — ${esc(v.marca)} ${esc(v.modelo)}</option>`).join('');
  
  ['m_vehiculo','i_vehiculo','g_vehiculo','rec_vehiculo'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = `<option value="" data-i18n="selecciona">${translations[currentLang].selecciona}</option>` + opts;
    if (id === 'g_vehiculo') sel.innerHTML = `<option value="" data-i18n="todos">${translations[currentLang].todos}</option>` + opts;
    if (prev) sel.value = prev;
  });
  
  const filtro = document.getElementById('f_vehiculo');
  const prevF = filtro.value;
  filtro.innerHTML = `<option value="" data-i18n="todos">${translations[currentLang].todos}</option>` + opts;
  if (prevF) filtro.value = prevF;
  
  actualizarDesplegableFotos();
}

document.getElementById('f_vehiculo').addEventListener('change', renderMantenimientos);
document.getElementById('i_vehiculo').addEventListener('change', renderTablaSeleccion);

function toggleAllChecks(source) {
  const checkboxes = document.querySelectorAll('.check-mant');
  checkboxes.forEach(cb => cb.checked = source.checked);
}

function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="msg ${tipo}">${esc(texto)}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

// ============ GRÁFICO ESTILO RACING MEJORADO (Suma Fijos) ============
function renderGrafico() {
  if (typeof Chart === 'undefined') return; 

  const vehiculoId = document.getElementById('g_vehiculo').value;
  const modo = document.getElementById('g_modo').value;
  const selectAnioContenedor = document.getElementById('contenedor_anio_grafico');
  const selectAnio = document.getElementById('g_anio');

  let lista = state.mantenimientos;
  if (vehiculoId) lista = lista.filter(m => m.vehiculoId === vehiculoId);

  const aniosDisponibles = [...new Set(lista.filter(m => m.fecha).map(m => m.fecha.split('-')[0]))].sort();
  
  if (modo === 'meses') {
    selectAnioContenedor.style.display = 'block';
    const prevAnio = selectAnio.value;
    selectAnio.innerHTML = '';
    aniosDisponibles.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a;
      opt.textContent = a;
      selectAnio.appendChild(opt);
    });
    if (prevAnio && aniosDisponibles.includes(prevAnio)) selectAnio.value = prevAnio;
  } else {
    selectAnioContenedor.style.display = 'none';
  }

  let etiquetas = [];
  let dataMano = [];
  let dataPiezas = [];
  let gastoTotal = 0;

  if (modo === 'anios') {
    const gastosPorAnio = {};
    lista.forEach(m => {
      if (!m.fecha) return;
      if (m.taller === 'ITV' || (m.manoObra && m.manoObra.some(o => o.concepto.includes('ITV')))) return;

      const anio = m.fecha.split('-')[0];
      if (!gastosPorAnio[anio]) gastosPorAnio[anio] = { mano: 0, piezas: 0 };
      gastosPorAnio[anio].mano += m.mano;
      gastosPorAnio[anio].piezas += m.piezas;
    });

    etiquetas = Object.keys(gastosPorAnio).sort();
    
    const anioActual = new Date().getFullYear().toString();
    if (!etiquetas.includes(anioActual) && (vehiculoId || state.vehiculos.some(v => v.costeSeguro || v.costeItv))) {
        etiquetas.push(anioActual);
        etiquetas.sort();
        gastosPorAnio[anioActual] = { mano: 0, piezas: 0 };
    }

    dataMano = etiquetas.map(a => gastosPorAnio[a].mano);
    dataPiezas = etiquetas.map(a => gastosPorAnio[a].piezas);
    
    if (vehiculoId) {
        const v = state.vehiculos.find(x => x.id === vehiculoId);
        if (v) {
            const fijos = (parseFloat(v.costeSeguro)||0) + (parseFloat(v.costeItv)||0);
            const indexActual = etiquetas.indexOf(anioActual);
            if (indexActual !== -1) {
                dataMano[indexActual] += fijos;
            }
        }
    } else {
        let fijosTotales = 0;
        state.vehiculos.forEach(v => fijosTotales += (parseFloat(v.costeSeguro)||0) + (parseFloat(v.costeItv)||0));
        const indexActual = etiquetas.indexOf(anioActual);
        if (indexActual !== -1) {
            dataMano[indexActual] += fijosTotales;
        }
    }
    
    gastoTotal = dataMano.reduce((s, v) => s + v, 0) + dataPiezas.reduce((s, v) => s + v, 0);

  } else {
    const anioSeleccionado = selectAnio.value || aniosDisponibles[0] || new Date().getFullYear();
    const gastosPorMes = Array(12).fill(0).map(() => ({ mano: 0, piezas: 0 }));

    lista.forEach(m => {
      if (!m.fecha) return;
      if (m.taller === 'ITV' || (m.manoObra && m.manoObra.some(o => o.concepto.includes('ITV')))) return;
      
      const [anio, mes] = m.fecha.split('-');
      if (anio === anioSeleccionado) {
        const mesIndex = parseInt(mes) - 1;
        gastosPorMes[mesIndex].mano += m.mano;
        gastosPorMes[mesIndex].piezas += m.piezas;
      }
    });

    if (anioSeleccionado == new Date().getFullYear().toString()) {
        if (vehiculoId) {
            const v = state.vehiculos.find(x => x.id === vehiculoId);
            if (v) gastosPorMes[0].mano += (parseFloat(v.costeSeguro)||0) + (parseFloat(v.costeItv)||0);
        } else {
            let fijosTotales = 0;
            state.vehiculos.forEach(v => fijosTotales += (parseFloat(v.costeSeguro)||0) + (parseFloat(v.costeItv)||0));
            gastosPorMes[0].mano += fijosTotales;
        }
    }

    etiquetas = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (currentLang === 'en') etiquetas = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    dataMano = gastosPorMes.map(m => m.mano);
    dataPiezas = gastosPorMes.map(m => m.piezas);
    gastoTotal = dataMano.reduce((s, v) => s + v, 0) + dataPiezas.reduce((s, v) => s + v, 0);
  }

  document.getElementById('texto_gasto_total').textContent = fmt(gastoTotal);

  const ctx = document.getElementById('miGrafico').getContext('2d');
  if (miGraficoInstancia) miGraficoInstancia.destroy();

  let gradientMano = ctx.createLinearGradient(0, 0, 0, 400);
  gradientMano.addColorStop(0, 'rgba(225, 29, 72, 0.5)');
  gradientMano.addColorStop(1, 'rgba(225, 29, 72, 0.0)');

  let gradientPiezas = ctx.createLinearGradient(0, 0, 0, 400);
  gradientPiezas.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
  gradientPiezas.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  miGraficoInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: translations[currentLang].mano_obra + ' + Fijos',
          data: dataMano,
          borderColor: '#e11d48', 
          backgroundColor: gradientMano,
          borderWidth: 3,
          pointBackgroundColor: '#e11d48',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        },
        {
          label: translations[currentLang].repuestos,
          data: dataPiezas,
          borderColor: '#38bdf8', 
          backgroundColor: gradientPiezas,
          borderWidth: 3,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#fff',
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { 
            labels: { 
                color: '#000000', 
                font: { size: 14, weight: 'bold' } 
            } 
        },
        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: '#374151', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { color: '#000000', font: { size: 12 } }, grid: { color: 'rgba(55, 65, 81, 0.5)' } },
        y: { ticks: { color: '#000000', font: { size: 12 } }, grid: { color: 'rgba(55, 65, 81, 0.5)' } }
      }
    }
  });
}

// ============ RECORDATORIOS Y AVISOS ============
function cargarRecordatorios() {
  const sel = document.getElementById('rec_vehiculo');
  if (!sel) return;
  const vehiculoId = sel.value;
  
  const mantInput = document.getElementById('rec_mant');
  const kmMantInput = document.getElementById('rec_km_mant');
  const itvInput = document.getElementById('rec_itv');
  const itvPasadaInput = document.getElementById('rec_itv_pasada');
  const kmItvPasadaInput = document.getElementById('rec_km_itv_pasada');
  
  const tbody = document.getElementById('tabla_recordatorios_body');
  tbody.innerHTML = '';

  if (vehiculoId) {
    const v = state.vehiculos.find(x => x.id === vehiculoId);
    if (v) {
      mantInput.value = v.proxMant || '';
      kmMantInput.value = v.proxKmMant || '';
      itvInput.value = v.proxItv || '';
      itvPasadaInput.value = v.ultItvFecha || '';
      kmItvPasadaInput.value = v.ultItvKm || '';
    }
  }

  state.vehiculos.forEach(v => {
    const formatDate = (dateStr) => {
      if (!dateStr) return '—';
      const fecha = new Date(dateStr);
      const hoy = new Date();
      const diffDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
      const fechaMostrar = dateStr.split('-').reverse().join('/');
      
      let color = '#9ca3af';
      if (diffDias < 0) color = '#ef4444';
      else if (diffDias <= 30) color = '#f59e0b';
      else color = '#10b981';

      return `<span style="color: ${color}; font-weight: bold;">${fechaMostrar}</span>`;
    };

    const kmMantFormat = v.proxKmMant ? `<span style="color: #38bdf8; font-weight: bold;">${v.proxKmMant} Kms</span><br>` : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(v.matricula)}</td>
      <td>${kmMantFormat}${formatDate(v.proxMant)}</td>
      <td>${formatDate(v.proxItv)}</td>`;
    tbody.appendChild(tr);
  });
}

function guardarRecordatorio() {
  const vehiculoId = document.getElementById('rec_vehiculo').value;
  
  const mantFecha = document.getElementById('rec_mant').value;
  const mantKm = document.getElementById('rec_km_mant').value;
  
  const itvProx = document.getElementById('rec_itv').value;
  const itvPasada = document.getElementById('rec_itv_pasada').value;
  const itvKmPasada = document.getElementById('rec_km_itv_pasada').value;
  
  if (!vehiculoId) { mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err'); return; }
  
  const v = state.vehiculos.find(x => x.id === vehiculoId);
  if (v) {
    v.proxMant = mantFecha;
    v.proxKmMant = mantKm;
    v.proxItv = itvProx;
    v.ultItvFecha = itvPasada;
    v.ultItvKm = itvKmPasada;

    if (itvPasada) {
      const itvExistente = state.mantenimientos.find(m => 
        m.vehiculoId === vehiculoId && 
        m.tipo === 'type_10' && 
        m.fecha === itvPasada &&
        m.taller === 'ITV'
      );

      if (!itvExistente) {
        state.mantenimientos.push({
          id: uid(),
          vehiculoId: vehiculoId,
          fecha: itvPasada, 
          km: Number(itvKmPasada) || 0, 
          tipo: 'type_10', 
          mano: 0,
          piezas: 0,
          taller: 'ITV',
          notas: currentLang === 'es' ? 'Registro de ITV pasada' : 'MOT past record',
          manoObra: [{ concepto: translations[currentLang].itv_nombre, precio: 0 }],
          repuestos: []
        });
        mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Datos guardados e ITV añadida al historial.' : 'Data saved and MOT added to history.', 'ok');
      } else {
        mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Datos guardados (La ITV ya estaba en el historial).' : 'Data saved (MOT was already in history).', 'ok');
      }
    } else {
      mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Datos guardados.' : 'Data saved.', 'ok');
    }

    guardar();
    cargarRecordatorios();
    renderAll();
  }
}

// ============ MODO DE INFORME ============
function toggleModoInforme() {
  const modo = document.getElementById('i_modo').value;
  document.getElementById('bloque_fechas').style.display = modo === 'fechas' ? 'grid' : 'none';
  document.getElementById('bloque_seleccion').style.display = modo === 'seleccion' ? 'block' : 'none';
  if (modo === 'seleccion') renderTablaSeleccion();
}

function renderTablaSeleccion() {
  const vehiculoId = document.getElementById('i_vehiculo').value;
  const tbody = document.querySelector('#tabla_seleccion tbody');
  tbody.innerHTML = '';
  
  if (!vehiculoId) return;
  
  const lista = state.mantenimientos.filter(m => m.vehiculoId === vehiculoId).sort((a,b) => a.fecha.localeCompare(b.fecha));
  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">${currentLang === 'es' ? 'No hay mantenimientos registrados para este vehículo.' : 'No maintenance records for this vehicle.'}</td></tr>`;
    return;
  }
  
  lista.forEach(m => {
    const total = m.mano + m.piezas;
    const tipoTexto = tiposMantenimiento[m.tipo] ? tiposMantenimiento[m.tipo][currentLang] : m.tipo;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="text-align:center;"><input type="checkbox" class="check-mant" value="${m.id}"></td>
      <td>${m.fecha.split('-').reverse().join('/')}</td>
      <td>${m.km || ''}</td>
      <td>${esc(tipoTexto)}</td>
      <td>${(m.manoObra || []).map(o => o.concepto).join(', ')}</td>
      <td>${fmt(total)}</td>`;
    tbody.appendChild(tr);
  });
}

// ============ GENERAR PDF (CON CORREO) ============
function generarPDF(accion = false) {
  try {
    const { jsPDF } = window.jspdf;
    const modo = document.getElementById('i_modo').value;
    const tipoInforme = document.getElementById('i_tipo_informe').value;
    const t = translations[currentLang]; 
    
    const vehiculoId = document.getElementById('i_vehiculo').value;
    if (!vehiculoId) { mostrarMsg('msg_informe', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err'); return; }

    let lista = [];
    let desde = '', hasta = '';

    if (modo === 'seleccion') {
      const checkboxes = document.querySelectorAll('.check-mant:checked');
      if (checkboxes.length === 0) {
        mostrarMsg('msg_informe', currentLang === 'es' ? 'Selecciona al menos un mantenimiento.' : 'Select at least one maintenance record.', 'err'); return;
      }
      const ids = Array.from(checkboxes).map(cb => cb.value);
      lista = state.mantenimientos.filter(m => ids.includes(m.id));
    } else {
      desde = document.getElementById('i_desde').value;
      hasta = document.getElementById('i_hasta').value;
      lista = state.mantenimientos.filter(m => m.vehiculoId === vehiculoId);
      if (desde) lista = lista.filter(m => m.fecha >= desde);
      if (hasta) lista = lista.filter(m => m.fecha <= hasta);
    }

    lista.sort((a,b) => a.fecha.localeCompare(b.fecha));
    if (lista.length === 0) { mostrarMsg('msg_informe', currentLang === 'es' ? 'No hay mantenimientos.' : 'No records.', 'err'); return; }

    const v = state.vehiculos.find(x => x.id === vehiculoId);
    const ivaPorcentaje = parseFloat(document.getElementById('i_iva').value) || 0;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = 15;

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageW, 20, 'F'); 
    doc.setTextColor(255,255,255);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    
    const titulo = tipoInforme === 'detallado' ? t.pdf_factura : t.pdf_informe;
    const tituloAncho = doc.getTextWidth(titulo);
    doc.text(titulo, (pageW - tituloAncho) / 2, 13);

    doc.setTextColor(0,0,0);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    y = 30;

    doc.setFont(undefined, 'bold'); doc.text(t.pdf_vehiculo, 15, y); doc.setFont(undefined, 'normal');
    doc.text(`${v.marca} ${v.modelo}`, 45, y); y += 6;
    doc.setFont(undefined, 'bold'); doc.text(t.pdf_matricula, 15, y); doc.setFont(undefined, 'normal');
    doc.text(v.matricula, 45, y); y += 6;
    doc.setFont(undefined, 'bold'); doc.text(t.pdf_bastidor, 15, y); doc.setFont(undefined, 'normal');
    doc.text(v.bastidor || '—', 45, y); y += 6;
    doc.setFont(undefined, 'bold'); doc.text(t.pdf_fecha_inf, 15, y); doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-GB'), 45, y); y += 6;
    doc.setFont(undefined, 'bold'); doc.text(t.pdf_periodo, 15, y); doc.setFont(undefined, 'normal');
    const per = modo === 'seleccion' ? (currentLang === 'es' ? 'Selección manual' : 'Manual selection') : (desde ? desde.split('-').reverse().join('/') : 'inicio') + ' — ' + (hasta ? hasta.split('-').reverse().join('/') : 'hoy');
    doc.text(per, 45, y); y += 10;

    if (tipoInforme === 'historico') {
      let bodyHistorial = [];
      lista.forEach(m => {
        let tipoTraducido = tiposMantenimiento[m.tipo] ? tiposMantenimiento[m.tipo][currentLang] : m.tipo;
        let manoObraTexto = (m.manoObra || []).map(o => o.concepto).join("\n• ");
        
        if (m.taller === 'ITV') {
            tipoTraducido = currentLang === 'es' ? 'ITV' : 'Vehicle Inspection';
            manoObraTexto = translations[currentLang].itv_nombre; 
        }
        
        let textoTipoYServicio = tipoTraducido + "\n";
        textoTipoYServicio += "• " + manoObraTexto;
        if (m.taller) textoTipoYServicio += `\n\n(${t.pdf_taller_txt} ${m.taller})`;
        
        let textoRepuestos = "—";
        if (m.repuestos && m.repuestos.length > 0) {
          textoRepuestos = m.repuestos.map(r => {
             const refStr = r.ref ? ` (${r.ref})` : '';
             return `• ${r.desc}${refStr}`;
          }).join("\n");
        }
        bodyHistorial.push([ m.fecha.split('-').reverse().join('/'), m.km || '', textoTipoYServicio, textoRepuestos ]);
      });

      doc.autoTable({
        startY: y, head: [[t.fecha, t.km, t.pdf_servicios, t.pdf_materiales]], body: bodyHistorial, theme: 'striped',
        headStyles: { fillColor: [225, 29, 72], textColor: 255, fontSize: 10, fontStyle: 'bold' }, 
        bodyStyles: { fontSize: 9, valign: 'top', cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 249, 250] }, 
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 2: { cellWidth: 65 }, 3: { cellWidth: 70 } },
        margin: { left: 15, right: 15 }
      });

    } else {
      let totalGlobalMano = 0;
      let totalGlobalPiezas = 0;

      lista.forEach((m) => {
        if (y > 230) { doc.addPage(); y = 20; }

        let tipoTraducido = tiposMantenimiento[m.tipo] ? tiposMantenimiento[m.tipo][currentLang] : m.tipo;
        
        if (m.taller === 'ITV') {
            tipoTraducido = currentLang === 'es' ? 'ITV' : 'Vehicle Inspection';
        }

        doc.setFillColor(240, 242, 245); 
        doc.rect(15, y - 5, pageW - 30, 12, 'F'); 
        doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42);
        doc.text(`${t.fecha}: ${m.fecha.split('-').reverse().join('/')}`, 18, y);
        if (m.km) doc.text(`${t.km}: ${m.km}`, 70, y);
        if (m.taller) doc.text(`${t.pdf_taller_txt} ${m.taller}`, pageW - 18, y, {align:'right'});
        
        doc.setFontSize(9); doc.setFont(undefined, 'normal'); doc.setTextColor(100, 100, 100);
        doc.text(`${t.tipo}: ${tipoTraducido}`, 18, y + 5);
        
        y += 12; 

        let bodyMano = (m.manoObra || []).map(o => {
            let concepto = o.concepto;
            if (m.taller === 'ITV') concepto = translations[currentLang].itv_nombre;
            return [ concepto, fmt(o.precio) ];
        });
        
        if (bodyMano.length > 0) {
          doc.autoTable({
            startY: y, head: [[t.pdf_mano_obra, t.pdf_importe]], body: bodyMano, theme: 'grid',
            headStyles: { fillColor: [225, 29, 72], textColor: 255, fontSize: 9 }, 
            bodyStyles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 25, halign: 'right' } },
            margin: { left: 15, right: 15 }
          });
          y = doc.lastAutoTable.finalY + 5;
        }

        let bodyRepuestos = (m.repuestos || []).map(r => [ r.cant, r.ref || '-', r.desc, fmt(r.precio), fmt(r.cant * r.precio) ]);
        if (bodyRepuestos.length > 0) {
          doc.autoTable({
            startY: y, head: [[t.cant, t.referencia, t.pdf_desc, t.pdf_precio_ud, t.total]], body: bodyRepuestos, theme: 'grid',
            headStyles: { fillColor: [225, 29, 72], textColor: 255, fontSize: 9 }, 
            bodyStyles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 30 }, 2: { cellWidth: 75 }, 3: { cellWidth: 20, halign: 'right' }, 4: { cellWidth: 25, halign: 'right' } },
            margin: { left: 15, right: 15 }
          });
          y = doc.lastAutoTable.finalY + 5;
        }

        const subMano = (m.manoObra || []).reduce((s, o) => s + o.precio, 0);
        const subPiezas = (m.repuestos || []).reduce((s, r) => s + (r.cant * r.precio), 0);
        const subTotal = subMano + subPiezas;
        totalGlobalMano += subMano;
        totalGlobalPiezas += subPiezas;

        doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(225, 29, 72);
        doc.text(`${t.total}: ${fmt(subTotal)}`, pageW - 15, y + 3, {align:'right'});
        doc.setTextColor(0,0,0); doc.setFont(undefined, 'normal');
        y += 15; 
      });

      if (y > 250) { doc.addPage(); y = 20; }
      const baseGlobal = totalGlobalMano + totalGlobalPiezas;
      const iva = baseGlobal * (ivaPorcentaje / 100);
      const totalFinal = baseGlobal + iva;

      doc.setFontSize(10); doc.setFont(undefined, 'normal');
      doc.text(t.pdf_base, 130, y); doc.text(fmt(baseGlobal), pageW - 15, y, {align:'right'}); y += 6;
      doc.text(`${t.pdf_iva} (${ivaPorcentaje}%):`, 130, y); doc.text(fmt(iva), pageW - 15, y, {align:'right'}); y += 6;
      doc.setFont(undefined, 'bold'); doc.setTextColor(225, 29, 72); 
      doc.text(t.pdf_total, 130, y); doc.text(fmt(totalFinal), pageW - 15, y, {align:'right'});
    }

    const nombre = tipoInforme === 'historico' ? `Historico_${v.matricula}.pdf` : `Factura_${v.matricula}.pdf`;
    
    if (accion === 'email') {
        doc.save(nombre);
        enviarPorCorreo(t.email_asunto_informe, t.email_cuerpo_informe);
        mostrarMsg('msg_informe', currentLang === 'es' ? 'PDF descargado. Se ha abierto tu gestor de correo.' : 'PDF downloaded. Your email client has been opened.', 'ok');
        return;
    } else if (accion && navigator.share && navigator.canShare) {
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], nombre, { type: 'application/pdf' });
      
      if (navigator.canShare({ files: [file] })) {
        let tituloShare = nombre;
        let textoShare = currentLang === 'es' ? 'Aquí tienes el informe de mantenimiento.' : 'Here is the maintenance report.';

        navigator.share({
          files: [file],
          title: tituloShare,
          text: textoShare
        }).then(() => {
          mostrarMsg('msg_informe', currentLang === 'es' ? 'Compartido con éxito.' : 'Shared successfully.', 'ok');
        }).catch((err) => {
          console.log("Error al compartir:", err);
          doc.save(nombre);
        });
        return;
      }
    }
    
    doc.save(nombre);
    mostrarMsg('msg_informe', currentLang === 'es' ? 'PDF generado y descargado.' : 'PDF generated and downloaded.', 'ok');

  } catch (error) {
    console.error(error);
    mostrarMsg('msg_informe', currentLang === 'es' ? 'Error al generar el PDF. Revisa la consola.' : 'Error generating PDF. Check console.', 'err');
  }
}

// ============ NUEVA FUNCIÓN: EXPORTAR GRÁFICO ============
function exportarGraficoPDF(accion) {
  try {
    const { jsPDF } = window.jspdf;
    const t = translations[currentLang];
    
    const canvas = document.getElementById('miGrafico');
    if (!canvas) return;
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageW, 20, 'F'); 
    doc.setTextColor(255,255,255);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    const titulo = t.pdf_titulo_grafico;
    doc.text(titulo, (pageW - doc.getTextWidth(titulo)) / 2, 13);

    doc.setTextColor(0,0,0);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    y = 30;

    const vehiculoId = document.getElementById('g_vehiculo').value;
    let nombreVehiculo = t.todos;
    if (vehiculoId) {
        const v = state.vehiculos.find(x => x.id === vehiculoId);
        if (v) nombreVehiculo = `${v.marca} ${v.modelo} (${v.matricula})`;
    }

    doc.setFont(undefined, 'bold'); doc.text(t.vehiculo, 15, y); doc.setFont(undefined, 'normal');
    doc.text(nombreVehiculo, 45, y); y += 8;

    const totalTexto = document.getElementById('texto_gasto_total').textContent;
    doc.setFontSize(14); doc.setFont(undefined, 'bold'); doc.setTextColor(225, 29, 72);
    doc.text(`${t.gasto_total}: ${totalTexto}`, 15, y); 
    doc.setTextColor(0,0,0); doc.setFontSize(10); doc.setFont(undefined, 'normal');
    y += 8;

    if (vehiculoId) {
        const v = state.vehiculos.find(x => x.id === vehiculoId);
        if (v && (v.costeSeguro || v.costeItv)) {
            const fijos = (parseFloat(v.costeSeguro)||0) + (parseFloat(v.costeItv)||0);
            doc.text(`${t.pdf_gasto_fijo} ${fmt(fijos)}`, 15, y);
            y += 8;
        }
    }

    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = pageW - 30;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    y += 5;
    doc.addImage(imgData, 'PNG', 15, y, pdfWidth, pdfHeight);

    const nombre = `Estadisticas_${vehiculoId ? 'Vehiculo' : 'Todos'}.pdf`;

    if (accion === 'email') {
        doc.save(nombre);
        enviarPorCorreo(t.email_asunto_grafico, t.email_cuerpo_grafico);
        mostrarMsg('msg_grafico', currentLang === 'es' ? 'PDF descargado. Se ha abierto tu gestor de correo.' : 'PDF downloaded. Your email client has been opened.', 'ok');
        return;
    } else if (accion && navigator.share && navigator.canShare) {
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], nombre, { type: 'application/pdf' });
      
      if (navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: nombre,
          text: currentLang === 'es' ? 'Aquí tienes el resumen de gastos.' : 'Here is the expense summary.'
        }).then(() => {
          mostrarMsg('msg_grafico', currentLang === 'es' ? 'Compartido con éxito.' : 'Shared successfully.', 'ok');
        }).catch((err) => {
          console.log("Error al compartir:", err);
          doc.save(nombre);
        });
        return;
      }
    }
    
    doc.save(nombre);
    mostrarMsg('msg_grafico', currentLang === 'es' ? 'Gráfico exportado.' : 'Chart exported.', 'ok');

  } catch (error) {
    console.error(error);
    mostrarMsg('msg_grafico', currentLang === 'es' ? 'Error al generar el PDF.' : 'Error generating PDF.', 'err');
  }
}

// ============ AUXILIAR: ENVIAR POR CORREO ============
function enviarPorCorreo(asunto, cuerpo) {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = mailtoLink;
}

// ============ BACKUP ============
function exportarJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mantenimiento_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  mostrarMsg('msg_backup', currentLang === 'es' ? 'Copia exportada.' : 'Backup exported.', 'ok');
}

function importarJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.vehiculos || !data.mantenimientos) throw new Error('Formato inválido');
      if (!confirm(currentLang === 'es' ? 'Esto reemplazará todos los datos actuales. ¿Continuar?' : 'This will replace all current data. Continue?')) return;
      state = data; cargar(); guardar(); renderAll(); 
      mostrarMsg('msg_backup', currentLang === 'es' ? 'Datos importados correctamente.' : 'Data imported successfully.', 'ok');
    } catch(err) {
      mostrarMsg('msg_backup', (currentLang === 'es' ? 'Error al importar: ' : 'Import error: ') + err.message, 'err');
    }
  };
  reader.readAsText(file);
}

function borrarTodo() {
  if (!confirm(currentLang === 'es' ? '¿Borrar TODOS los datos? Esta acción no se puede deshacer.' : 'Delete ALL data? This action cannot be undone.')) return;
  state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
  guardar(); renderAll();
  mostrarMsg('msg_backup', currentLang === 'es' ? 'Todos los datos borrados.' : 'All data deleted.', 'ok');
}

// ============ PROTECCIÓN DE DATOS Y AVISOS ============
async function solicitarPersistencia() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const granted = await navigator.storage.persist();
      if (granted) console.log("El navegador protegerá los datos.");
    }
  }
}

function comprobarRecordatorioBackup() {
  const ultimoAviso = localStorage.getItem('pitstop_ultimo_aviso_backup');
  const ahora = new Date().getTime();
  if (!ultimoAviso || (ahora - parseInt(ultimoAviso)) > 604800000) {
    if (state.mantenimientos.length > 0 || state.vehiculos.length > 0) {
      const mensaje = currentLang === 'es' 
        ? "⚠️ RECORDATORIO: Tienes datos guardados. Si borras la caché, los perderás.\n\nTe recomendamos exportar una copia (JSON) en la pestaña 'Copia de seguridad'.\n\n¿Quieres ir ahora?"
        : "⚠️ REMINDER: You have saved data. If you clear cache, you will lose it.\n\nWe recommend exporting a backup (JSON) in the 'Backup' tab.\n\nDo you want to go now?";
      
      const irABackup = confirm(mensaje);
      if (irABackup) {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
        document.querySelector('.tab[data-tab="backup"]').classList.add('active');
        document.getElementById('backup').classList.add('active');
      }
      localStorage.setItem('pitstop_ultimo_aviso_backup', ahora.toString());
    }
  }
}

// ============ AVISO DE GIRO EN MÓVIL ============
function mostrarAvisoGiro() {
  if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
    if (!sessionStorage.getItem('aviso_giro_mostrado')) {
      mostrarMsg('msg_mantenimiento', translations[currentLang].aviso_horizontal, 'ok');
      sessionStorage.setItem('aviso_giro_mostrado', 'true');
    }
  }
}

// ============ INIT ============
const idiomaGuardado = localStorage.getItem('pitstop_idioma');
if (idiomaGuardado && (idiomaGuardado === 'es' || idiomaGuardado === 'en')) {
  currentLang = idiomaGuardado;
  document.getElementById('lang-es').classList.remove('active');
  document.getElementById('lang-en').classList.remove('active');
  document.getElementById('lang-' + currentLang).classList.add('active');
}

cargar();
document.getElementById('m_fecha').value = new Date().toISOString().slice(0,10);
renderManoObraTemporal();
renderRepuestosTemporales();
translatePage(); 
renderAll();

// Iniciar aviso de rotación
setTimeout(mostrarAvisoGiro, 2000);

solicitarPersistencia();
setTimeout(comprobarRecordatorioBackup, 1500); 

document.getElementById('r_foto').addEventListener('change', function() {
  const fileLabel = document.getElementById('file-btn-label');
  if (this.files && this.files[0]) {
    fileLabel.textContent = this.files[0].name;
  } else {
    fileLabel.textContent = translations[currentLang].seleccionar_archivo;
  }
});