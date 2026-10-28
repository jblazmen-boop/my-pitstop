// ============ ESTADO Y TRADUCCIONES ============
let state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
let repuestosTemporales = [];
let manoObraTemporal = [];
let editandoMantenimientoId = null;
let currentLang = 'es'; 
let miGraficoInstancia = null; 

const STORAGE_KEY = 'mi_app_mantenimiento_coches'; 

const translations = {
  es: {
    vehiculos_titulo: "Vehículos", matricula: "Matrícula", marca: "Marca", modelo: "Modelo", bastidor: "Nº Bastidor (VIN)",
    add_vehiculo: "Añadir vehículo", acciones: "Acciones", reg_mantenimiento: "Registrar mantenimiento",
    vehiculo: "Vehículo", fecha: "Fecha", km: "Km", tipo: "Tipo", taller: "Taller", notas: "Notas",
    mano_obra: "Mano de Obra", operacion: "Operación", precio: "Precio (€)", add_btn: "+ Añadir",
    total_mano: "Total Mano de Obra:", repuestos: "Repuestos", cant: "Cant.", descripcion: "Descripción",
    referencia: "Referencia", subir_foto: "Subir nueva foto (opcional)", cat_foto: "O elegir del catálogo (opcional)",
    add_repuesto: "+ Añadir Repuesto", foto: "Foto", total: "Total", total_repuestos: "Total Repuestos:",
    guardar_mant: "Guardar Mantenimiento", cancelar_edit: "Cancelar Edición", historial: "Historial de Mantenimientos",
    filtrar: "Filtrar por vehículo", todos: "Todos", operaciones: "Operaciones", mano: "Mano", piezas: "Piezas",
    gen_informe: "Generar informe / factura en PDF", tipo_informe: "Tipo de Informe", detallado: "Factura Detallada (con precios)",
    historico: "Histórico Técnico (sin precios)", fecha_desde: "Fecha desde", fecha_hasta: "Fecha hasta",
    iva: "IVA (%)", btn_gen_pdf: "Generar PDF", btn_share_pdf: "Compartir PDF",
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
    estadisticas: "Estadísticas de Gasto", recordatorios: "Avisos y Recordatorios", recordatorios_texto: "Aquí puedes ver y gestionar las fechas de tus próximos mantenimientos e ITV.",
    fecha_prox_mant: "Fecha Próx. Mantenimiento", km_prox_mant: "Km Próx. Mantenimiento", km_itv: "Km de la ITV",
    fecha_prox_itv: "Fecha Próx. ITV", prox_mant: "Próximo Mantenimiento (Km / Fecha)", prox_itv: "Próxima ITV",
    guardar: "Guardar Fechas", estado: "Estado", 
    itv_ok: "En regla", itv_warn: "Próximo", itv_danger: "Caducado", sin_fecha: "Sin fecha",
    itv_nombre: "Revisión ITV (Automática)"
  },
  en: {
    vehiculos_titulo: "Vehicles", matricula: "License Plate", marca: "Make", modelo: "Model", bastidor: "VIN Number",
    add_vehiculo: "Add vehicle", acciones: "Actions", reg_mantenimiento: "Register maintenance",
    vehiculo: "Vehicle", fecha: "Date", km: "Mileage", tipo: "Type", taller: "Workshop", notas: "Notes",
    mano_obra: "Labor", operacion: "Operation", precio: "Price (€)", add_btn: "+ Add",
    total_mano: "Total Labor:", repuestos: "Parts", cant: "Qty.", descripcion: "Description",
    referencia: "Reference", subir_foto: "Upload new photo (optional)", cat_foto: "Or choose from catalog (optional)",
    add_repuesto: "+ Add Part", foto: "Photo", total: "Total", total_repuestos: "Total Parts:",
    guardar_mant: "Save Maintenance", cancelar_edit: "Cancel Edit", historial: "Maintenance History",
    filtrar: "Filter by vehicle", todos: "All", operaciones: "Operations", mano: "Labor", piezas: "Parts",
    gen_informe: "Generate report / invoice PDF", tipo_informe: "Report Type", detallado: "Detailed Invoice (with prices)",
    historico: "Technical History (no prices)", fecha_desde: "Date from", fecha_hasta: "Date to",
    iva: "VAT (%)", btn_gen_pdf: "Generate PDF", btn_share_pdf: "Share PDF",
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
    estadisticas: "Expense Statistics", recordatorios: "Reminders & Alerts", recordatorios_texto: "Here you can view and manage upcoming maintenance and vehicle inspection dates.",
    fecha_prox_mant: "Next Maint. Date", km_prox_mant: "Next Maint. Mileage", km_itv: "MOT Mileage",
    fecha_prox_itv: "Next Insp. Date", prox_mant: "Next Maintenance (Miles / Date)", prox_itv: "Next Vehicle Inspection / MOT",
    guardar: "Save Dates", estado: "Status", 
    itv_ok: "Valid", itv_warn: "Due soon", itv_danger: "Expired", sin_fecha: "No date",
    itv_nombre: "MOT Inspection (Auto)"
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
      el.title = translations[currentLang][key];
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
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
    
    if (t.dataset.tab === 'grafico') renderGrafico();
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
  
  state.vehiculos.push({ id: uid(), matricula: mat, marca, modelo, bastidor, proxMant: '', proxKmMant: '', proxItv: '' });
  guardar();
  document.getElementById('v_matricula').value = '';
  document.getElementById('v_marca').value = '';
  document.getElementById('v_modelo').value = '';
  document.getElementById('v_bastidor').value = '';
  mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Vehículo añadido.' : 'Vehicle added.', 'ok');
  renderAll();
  cargarRecordatorios();
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
  guardar(); renderAll(); cargarRecordatorios();
}

function eliminarVehiculo(id) {
  if (!confirm(currentLang === 'es' ? '¿Eliminar vehículo y todos sus mantenimientos?' : 'Delete vehicle and all its maintenance records?')) return;
  state.vehiculos = state.vehiculos.filter(v => v.id !== id);
  state.mantenimientos = state.mantenimientos.filter(m => m.vehiculoId !== id);
  guardar(); renderAll(); cargarRecordatorios();
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

// ============ GRÁFICO ESTILO RACING ============
function renderGrafico() {
  if (typeof Chart === 'undefined') return; 

  const vehiculoId = document.getElementById('g_vehiculo').value;
  let lista = state.mantenimientos;
  if (vehiculoId) lista = lista.filter(m => m.vehiculoId === vehiculoId);

  const gastosPorAnio = {};
  lista.forEach(m => {
    if (!m.fecha) return;
    const anio = m.fecha.split('-')[0];
    if (!gastosPorAnio[anio]) gastosPorAnio[anio] = { mano: 0, piezas: 0 };
    gastosPorAnio[anio].mano += m.mano;
    gastosPorAnio[anio].piezas += m.piezas;
  });

  const anios = Object.keys(gastosPorAnio).sort();
  const dataMano = anios.map(a => gastosPorAnio[a].mano);
  const dataPiezas = anios.map(a => gastosPorAnio[a].piezas);

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
      labels: anios,
      datasets: [
        {
          label: translations[currentLang].mano_obra,
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
        legend: { labels: { color: '#e2e8f0', font: { size: 14, weight: 'bold' } } },
        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#e2e8f0', borderColor: '#374151', borderWidth: 1 }
      },
      scales: {
        x: { ticks: { color: '#9ca3af', font: { size: 12 } }, grid: { color: 'rgba(55, 65, 81, 0.5)' } },
        y: { ticks: { color: '#9ca3af', font: { size: 12 } }, grid: { color: 'rgba(55, 65, 81, 0.5)' } }
      }
    }
  });
}

// ============ RECORDATORIOS (Km, Fecha e ITV Automática) ============
function cargarRecordatorios() {
  const sel = document.getElementById('rec_vehiculo');
  if (!sel) return;
  const vehiculoId = sel.value;
  const kmInput = document.getElementById('rec_km_mant');
  const mantInput = document.getElementById('rec_mant');
  const itvInput = document.getElementById('rec_itv');
  const kmItvInput = document.getElementById('rec_km_itv');
  const tbody = document.getElementById('tabla_recordatorios_body');
  tbody.innerHTML = '';

  if (vehiculoId) {
    const v = state.vehiculos.find(x => x.id === vehiculoId);
    if (v) {
      kmInput.value = v.proxKmMant || '';
      mantInput.value = v.proxMant || '';
      itvInput.value = v.proxItv || '';
      kmItvInput.value = v.proxKmItv || '';
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

    const kmFormat = v.proxKmMant ? `<span style="color: #38bdf8; font-weight: bold;">${v.proxKmMant} Km</span>` : '—';
    const kmItvFormat = v.proxKmItv ? `<span style="color: #38bdf8; font-weight: bold;">${v.proxKmItv} Km</span><br>` : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(v.matricula)}</td>
      <td>${kmFormat}<br>${formatDate(v.proxMant)}</td>
      <td>${kmItvFormat}${formatDate(v.proxItv)}</td>`;
    tbody.appendChild(tr);
  });
}

function guardarRecordatorio() {
  const vehiculoId = document.getElementById('rec_vehiculo').value;
  const km = document.getElementById('rec_km_mant').value;
  const mant = document.getElementById('rec_mant').value;
  const itv = document.getElementById('rec_itv').value;
  const kmItv = document.getElementById('rec_km_itv').value;
  
  if (!vehiculoId) { mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err'); return; }
  
  const v = state.vehiculos.find(x => x.id === vehiculoId);
  if (v) {
    v.proxKmMant = km;
    v.proxMant = mant;
    v.proxItv = itv;
    v.proxKmItv = kmItv;

    // LÓGICA PARA REGISTRAR LA ITV EN EL HISTORIAL
    if (itv) {
      // Buscar si ya existe un registro de ITV para este vehículo con esta misma fecha
      const itvExistente = state.mantenimientos.find(m => 
        m.vehiculoId === vehiculoId && 
        m.tipo === 'type_10' && // Usamos Otro/ITV
        m.fecha === itv &&
        m.taller === 'ITV'
      );

      if (!itvExistente) {
        // Creamos un registro automático para el historial
        state.mantenimientos.push({
          id: uid(),
          vehiculoId: vehiculoId,
          fecha: itv,
          km: Number(kmItv) || 0,
          tipo: 'type_10', // Otro
          mano: 0,
          piezas: 0,
          taller: 'ITV',
          notas: currentLang === 'es' ? 'Registro automático de ITV' : 'Automatic MOT record',
          manoObra: [{ concepto: translations[currentLang].itv_nombre, precio: 0 }],
          repuestos: []
        });
      }
    }

    guardar();
    cargarRecordatorios();
    renderAll(); // Actualizamos el historial
    mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Fechas guardadas y añadidas al historial.' : 'Dates saved and added to history.', 'ok');
  }
}