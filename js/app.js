// ============ ESTADO Y TRADUCCIONES ============
let state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
let repuestosTemporales = [];
let manoObraTemporal = [];
let editandoMantenimientoId = null;
let currentLang = 'es'; 

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
    iva: "IVA (%)", 
    btn_gen_pdf: "Generar PDF", copia_seguridad: "Copia de seguridad", copia_texto: "Los datos se guardan en este navegador. Si borras el historial o cambias de equipo, se pierden. Exporta una copia periódicamente.",
    exportar: "⬇ Exportar copia (JSON)", importar: "⬆ Importar copia", borrar: "🗑 Borrar todos los datos",
    derechos: "Todos los derechos reservados.", selecciona: "— Selecciona —", no_foto: "— No usar foto —",
    ej_operacion: "Ej: Sustituir correa", ej_referencia: "Ej: MANN-W712", seleccionar_archivo: "Seleccionar archivo",
    pdf_informe: "INFORME DE MANTENIMIENTO", pdf_factura: "FACTURA DE MANTENIMIENTO",
    pdf_vehiculo: "Vehículo:", pdf_matricula: "Matrícula:", pdf_bastidor: "Nº Bastidor:", pdf_fecha_inf: "Fecha informe:",
    pdf_periodo: "Periodo:", pdf_mano_obra: "Desglose de Mano de Obra", pdf_concepto: "Concepto", pdf_importe: "Importe",
    pdf_repuestos: "Desglose de Repuestos", pdf_desc: "Descripción", pdf_precio_ud: "Precio Ud.", pdf_base: "Base imponible:",
    pdf_iva: "IVA", pdf_total: "TOTAL FACTURA:", pdf_servicios: "Servicio / Mano de Obra", pdf_materiales: "Materiales / Repuestos",
    pdf_ope_realizadas: "Operaciones Realizadas", pdf_taller_txt: "Taller:",
    modo_generacion: "Modo de generación", por_fechas: "Por rango de fechas", por_seleccion: "Seleccionando mantenimientos", selecciona_mant: "Selecciona los mantenimientos para incluir en la factura"
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
    iva: "VAT (%)", 
    btn_gen_pdf: "Generate PDF", copia_seguridad: "Backup", copia_texto: "Data is stored in this browser. If you clear your history or change devices, it will be lost. Export a backup regularly.",
    exportar: "⬇ Export backup (JSON)", importar: "⬆ Import backup", borrar: "🗑 Delete all data",
    derechos: "All rights reserved.", selecciona: "— Select —", no_foto: "— No photo —",
    ej_operacion: "Ex: Replace belt", ej_referencia: "Ex: MANN-W712", seleccionar_archivo: "Select file",
    pdf_informe: "MAINTENANCE REPORT", pdf_factura: "MAINTENANCE INVOICE",
    pdf_vehiculo: "Vehicle:", pdf_matricula: "Plate:", pdf_bastidor: "VIN:", pdf_fecha_inf: "Report date:",
    pdf_periodo: "Period:", pdf_mano_obra: "Labor Breakdown", pdf_concepto: "Concept", pdf_importe: "Amount",
    pdf_repuestos: "Parts Breakdown", pdf_desc: "Description", pdf_precio_ud: "Unit Price", pdf_base: "Subtotal:",
    pdf_iva: "VAT", pdf_total: "TOTAL INVOICE:", pdf_servicios: "Service / Labor", pdf_materiales: "Materials / Parts",
    pdf_ope_realizadas: "Operations Performed", pdf_taller_txt: "Workshop:",
    modo_generacion: "Generation mode", por_fechas: "By date range", por_seleccion: "Selecting records", selecciona_mant: "Select maintenance records to include in the invoice"
  }
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

  const groupTexts = {
    "group-1": { es: "Revisión / Mantenimiento", en: "Service / Maintenance" },
    "group-2": { es: "Motor", en: "Engine" },
    "group-3": { es: "Transmisión", en: "Transmission" },
    "group-4": { es: "Suspensión, Dirección y Frenos", en: "Suspension, Steering & Brakes" },
    "group-5": { es: "Electricidad / Electrónica", en: "Electrical / Electronics" },
    "group-6": { es: "Climatización", en: "Air Conditioning" },
    "group-7": { es: "Escape", en: "Exhaust" },
    "group-8": { es: "Interior, Habitáculo y Seguridad", en: "Interior, Cabin & Safety" },
    "group-9": { es: "Chasis y Carrocería", en: "Chassis & Bodywork" },
    "group-10": { es: "Otro", en: "Other" }
  };

  const optionTexts = {
    "opt-1": { es: "Revisión / Mantenimiento", en: "Service / Maintenance" },
    "opt-2": { es: "Motor", en: "Engine" },
    "opt-3": { es: "Transmisión", en: "Transmission" },
    "opt-4": { es: "Suspensión, Dirección y Frenos", en: "Suspension, Steering & Brakes" },
    "opt-5": { es: "Electricidad / Electrónica", en: "Electrical / Electronics" },
    "opt-6": { es: "Climatización", en: "Air Conditioning" },
    "opt-7": { es: "Escape", en: "Exhaust" },
    "opt-8": { es: "Interior, Habitáculo y Seguridad", en: "Interior, Cabin & Safety" },
    "opt-9": { es: "Chasis y Carrocería", en: "Chassis & Bodywork" },
    "opt-10": { es: "Otro", en: "Other" }
  };

  for (const [id, texts] of Object.entries(groupTexts)) {
    const el = document.getElementById(id);
    if (el) el.label = texts[currentLang];
  }

  for (const [id, texts] of Object.entries(optionTexts)) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = texts[currentLang];
      el.value = texts[currentLang];
    }
  }

  if(editandoMantenimientoId) {
      document.getElementById('titulo-formulario').textContent = currentLang === 'es' ? 'Editando Mantenimiento' : 'Editing Maintenance';
      document.getElementById('btn-guardar').textContent = currentLang === 'es' ? '💾 Guardar Cambios' : '💾 Save Changes';
  } else {
      document.getElementById('titulo-formulario').textContent = translations[currentLang].reg_mantenimiento;
      document.getElementById('btn-guardar').textContent = translations[currentLang].guardar_mant;
  }
  
  document.documentElement.lang = currentLang;
}

function setLanguage(lang) {
  currentLang = lang;
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

      state.mantenimientos.forEach(m => {
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
  
  state.vehiculos.push({ id: uid(), matricula: mat, marca, modelo, bastidor });
  guardar();
  document.getElementById('v_matricula').value = '';
  document.getElementById('v_marca').value = '';
  document.getElementById('v_modelo').value = '';
  document.getElementById('v_bastidor').value = '';
  mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Vehículo añadido.' : 'Vehicle added.', 'ok');
  renderAll();
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
  guardar(); renderAll();
}

function eliminarVehiculo(id) {
  if (!confirm(currentLang === 'es' ? '¿Eliminar vehículo y todos sus mantenimientos?' : 'Delete vehicle and all its maintenance records?')) return;
  state.vehiculos = state.vehiculos.filter(v => v.id !== id);
  state.mantenimientos = state.mantenimientos.filter(m => m.vehiculoId !== id);
  guardar(); renderAll();
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
  
  // Resetear el texto del botón de subir archivo
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
  
  const selTipo = document.getElementById('m_tipo');
  if (currentLang === 'es') selTipo.value = "Revisión / Mantenimiento";
  else selTipo.value = "Service / Maintenance";

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
  let texto = (currentLang === 'es' ? "DESGLOSE DEL MANTENIMIENTO:" : "MAINTENANCE BREAKDOWN:") + "\n\n";
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
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fechaMostrar}</td><td>${esc(v ? v.matricula : '—')}</td>
      <td>${m.km||''}</td><td>${esc(m.tipo)}</td>
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
  ['m_vehiculo','i_vehiculo'].forEach(id => {
    const sel = document.getElementById(id);
    const prev = sel.value;
    sel.innerHTML = `<option value="" data-i18n="selecciona">${translations[currentLang].selecciona}</option>` + opts;
    if (prev) sel.value = prev;
  });
  const filtro = document.getElementById('f_vehiculo');
  const prevF = filtro.value;
  filtro.innerHTML = `<option value="" data-i18n="todos">${translations[currentLang].todos}</option>` + opts;
  if (prevF) filtro.value = prevF;
  
  actualizarDesplegableFotos();
}

document.getElementById('f_vehiculo').addEventListener('change', renderMantenimientos);

// ============ CHECKBOX SELECT ALL ============
function toggleAllChecks(source) {
  const checkboxes = document.querySelectorAll('.check-mant');
  checkboxes.forEach(cb => cb.checked = source.checked);
}

// ============ MENSAJES ============
function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="msg ${tipo}">${esc(texto)}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
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
    const tr = document.createElement('tr');
    tr.innerHTML = `<td style="text-align:center;"><input type="checkbox" class="check-mant" value="${m.id}"></td>
      <td>${m.fecha.split('-').reverse().join('/')}</td>
      <td>${m.km || ''}</td>
      <td>${esc(m.tipo)}</td>
      <td>${(m.manoObra || []).map(o => o.concepto).join(', ')}</td>
      <td>${fmt(total)}</td>`;
    tbody.appendChild(tr);
  });
}

// ============ GENERAR PDF ============
function generarPDF() {
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

    // Marca de agua (Logo)
    const logoImg = document.querySelector('.logo-img');
    if (logoImg && logoImg.src) {
      try {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({opacity: 0.05})); 
        doc.addImage(logoImg.src, 'PNG', (pageW - 150) / 2, (pageH - 150) / 2, 150, 150);
        doc.restoreGraphicsState();
      } catch(e) { console.log("Error al añadir logo al PDF", e); }
    }

    // Cabecera
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageW, 20, 'F'); 
    doc.setTextColor(255,255,255);
    doc.setFontSize(16); doc.setFont(undefined, 'bold');
    
    // Título dinámico centrado
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

    // Tablas
    if (tipoInforme === 'historico') {
      let bodyHistorial = [];
      lista.forEach(m => {
        let textoTipoYServicio = m.tipo + "\n";
        textoTipoYServicio += "• " + (m.manoObra || []).map(o => o.concepto).join("\n• ");
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

        doc.setFillColor(240, 242, 245); 
        doc.rect(15, y - 5, pageW - 30, 8, 'F');
        doc.setFontSize(10); doc.setFont(undefined, 'bold'); doc.setTextColor(15, 23, 42);
        doc.text(`${t.fecha}: ${m.fecha.split('-').reverse().join('/')}`, 18, y);
        if (m.km) doc.text(`${t.km}: ${m.km}`, 80, y);
        if (m.taller) doc.text(`${t.pdf_taller_txt} ${m.taller}`, pageW - 18, y, {align:'right'});
        y += 8;

        let bodyMano = (m.manoObra || []).map(o => [ o.concepto, fmt(o.precio) ]);
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
    doc.save(nombre);
    mostrarMsg('msg_informe', currentLang === 'es' ? 'PDF generado y abierto.' : 'PDF generated and opened.', 'ok');
  } catch (error) {
    console.error(error);
    mostrarMsg('msg_informe', currentLang === 'es' ? 'Error al generar el PDF. Revisa la consola.' : 'Error generating PDF. Check console.', 'err');
  }
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
      state = data; guardar(); renderAll();
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

// ============ INIT ============
cargar();
document.getElementById('m_fecha').value = new Date().toISOString().slice(0,10);
renderManoObraTemporal();
renderRepuestosTemporales();
renderAll();

// Evento para actualizar el nombre del archivo en el botón de subir foto
document.getElementById('r_foto').addEventListener('change', function() {
  const fileLabel = document.getElementById('file-btn-label');
  if (this.files && this.files[0]) {
    fileLabel.textContent = this.files[0].name;
  } else {
    fileLabel.textContent = translations[currentLang].seleccionar_archivo;
  }
});