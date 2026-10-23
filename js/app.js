// ============ ESTADO ============
let state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
let repuestosTemporales = [];
let manoObraTemporal = [];
let editandoMantenimientoId = null;

const STORAGE_KEY = 'mi_app_mantenimiento_coches'; 

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

// ============ MODAL FOTO ============
function abrirModal(src) {
  document.getElementById('img-modal').src = src;
  document.getElementById('modal-foto').style.display = 'flex';
}
function cerrarModal() {
  document.getElementById('modal-foto').style.display = 'none';
}

// ============ TABS ============
document.querySelectorAll('.tab').forEach(t => {
  t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  };
});

// ============ VEHÍCULOS ============
function addVehiculo() {
  const mat = document.getElementById('v_matricula').value.trim().toUpperCase();
  const marca = document.getElementById('v_marca').value.trim();
  const modelo = document.getElementById('v_modelo').value.trim();
  const bastidor = document.getElementById('v_bastidor').value.trim().toUpperCase();
  
  if (!mat) { mostrarMsg('msg_vehiculo', 'La matrícula es obligatoria.', 'err'); return; }
  if (state.vehiculos.some(v => v.matricula === mat)) {
    mostrarMsg('msg_vehiculo', 'Ya existe un vehículo con esa matrícula.', 'err'); return;
  }
  
  state.vehiculos.push({ id: uid(), matricula: mat, marca, modelo, bastidor });
  guardar();
  document.getElementById('v_matricula').value = '';
  document.getElementById('v_marca').value = '';
  document.getElementById('v_modelo').value = '';
  document.getElementById('v_bastidor').value = '';
  mostrarMsg('msg_vehiculo', 'Vehículo añadido.', 'ok');
  renderAll();
}

function editarVehiculo(id) {
  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;
  const marca = prompt("Marca:", v.marca);
  const modelo = prompt("Modelo:", v.modelo);
  const bastidor = prompt("Nº Bastidor:", v.bastidor);
  if (marca === null) return;
  v.marca = marca;
  v.modelo = modelo;
  v.bastidor = bastidor.toUpperCase();
  guardar(); renderAll();
}

function eliminarVehiculo(id) {
  if (!confirm('¿Eliminar vehículo y todos sus mantenimientos?')) return;
  state.vehiculos = state.vehiculos.filter(v => v.id !== id);
  state.mantenimientos = state.mantenimientos.filter(m => m.vehiculoId !== id);
  guardar(); renderAll();
}

// ============ MANO DE OBRA ============
function addManoObra() {
  const concepto = document.getElementById('o_concepto').value.trim();
  const precio = parseFloat(document.getElementById('o_precio').value) || 0;
  if (!concepto) { alert("La operación es obligatoria."); return; }
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
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#888; padding:10px;">No hay operaciones añadidas.</td></tr>';
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

  if (!desc) { alert("La descripción del repuesto es obligatoria."); return; }

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
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#888; padding:10px;">No hay repuestos añadidos.</td></tr>';
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
  sel.innerHTML = '<option value="">— No usar foto —</option>';
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
  
  if (!vehiculoId) { mostrarMsg('msg_mantenimiento', 'Selecciona un vehículo.', 'err'); return; }
  if (!fecha) { mostrarMsg('msg_mantenimiento', 'La fecha es obligatoria.', 'err'); return; }
  if (manoObraTemporal.length === 0 && repuestosTemporales.length === 0) {
    mostrarMsg('msg_mantenimiento', 'Añade al menos una operación o repuesto.', 'err'); return;
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
    mostrarMsg('msg_mantenimiento', 'Mantenimiento actualizado con éxito.', 'ok');
  } else {
    state.mantenimientos.push({ 
      id: uid(), vehiculoId, fecha, km: Number(km)||0, tipo, mano, piezas, taller, notas,
      manoObra: [...manoObraTemporal], repuestos: [...repuestosTemporales] 
    });
    mostrarMsg('msg_mantenimiento', 'Mantenimiento registrado con éxito.', 'ok');
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
  document.getElementById('btn-guardar').textContent = '💾 Guardar Cambios';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
  document.getElementById('titulo-formulario').textContent = 'Editando Mantenimiento';
  
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
  document.getElementById('m_tipo').value = 'Aceite y Filtros'; 

  document.getElementById('btn-guardar').textContent = 'Guardar Mantenimiento';
  document.getElementById('btn-cancelar').style.display = 'none';
  document.getElementById('titulo-formulario').textContent = 'Registrar mantenimiento';
}

function eliminarMantenimiento(id) {
  if (!confirm('¿Eliminar este mantenimiento?')) return;
  state.mantenimientos = state.mantenimientos.filter(m => m.id !== id);
  guardar(); renderAll();
}

function verDesglose(id) {
  const m = state.mantenimientos.find(x => x.id === id);
  if (!m) return;
  let texto = "DESGLOSE DEL MANTENIMIENTO:\n\n";
  if (m.manoObra && m.manoObra.length > 0) {
    texto += "MANO DE OBRA:\n";
    m.manoObra.forEach(o => { texto += `- ${o.concepto}: ${fmt(o.precio)}\n`; });
    texto += "\n";
  }
  if (m.repuestos && m.repuestos.length > 0) {
    texto += "REPUESTOS:\n";
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
    tbody.innerHTML = '<tr><td colspan="5" class="empty">Aún no hay vehículos. Añade uno arriba.</td></tr>';
    return;
  }
  state.vehiculos.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${esc(v.matricula)}</td><td>${esc(v.marca)}</td><td>${esc(v.modelo)}</td>
      <td>${esc(v.bastidor)}</td>
      <td>
        <button class="secondary" style="padding:4px 8px; font-size:11px; margin-right:4px;" onclick="editarVehiculo('${v.id}')">Editar</button>
        <button class="danger" onclick="eliminarVehiculo('${v.id}')">Eliminar</button>
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
    tbody.innerHTML = '<tr><td colspan="9" class="empty">No hay mantenimientos registrados.</td></tr>';
    return;
  }
  lista.forEach(m => {
    const v = state.vehiculos.find(x => x.id === m.vehiculoId);
    const fechaMostrar = m.fecha ? m.fecha.split('-').reverse().join('/') : '';
    let numOps = (m.manoObra ? m.manoObra.length : 0) + (m.repuestos ? m.repuestos.length : 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fechaMostrar}</td><td>${esc(v ? v.matricula : '—')}</td>
      <td>${m.km||''}</td><td>${esc(m.tipo)}</td>
      <td><button class="secondary" style="padding:4px 8px; font-size:11px;" onclick="verDesglose('${m.id}')">Ver (${numOps})</button></td>
      <td>${fmt(m.mano)}</td><td>${fmt(m.piezas)}</td><td>${fmt(m.mano+m.piezas)}</td>
      <td style="display:flex; flex-direction:column; gap:4px;">
        <div>
            <button class="secondary" style="padding:4px 8px; font-size:11px;" onclick="editarMantenimiento('${m.id}')">Editar</button>
            <button class="danger" onclick="eliminarMantenimiento('${m.id}')">Eliminar</button>
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
    sel.innerHTML = '<option value="">— Selecciona —</option>' + opts;
    if (prev) sel.value = prev;
  });
  const filtro = document.getElementById('f_vehiculo');
  const prevF = filtro.value;
  filtro.innerHTML = '<option value="">Todos</option>' + opts;
  if (prevF) filtro.value = prevF;
  
  actualizarDesplegableFotos();
}

document.getElementById('f_vehiculo').addEventListener('change', renderMantenimientos);

// ============ MENSAJES ============
function mostrarMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="msg ${tipo}">${esc(texto)}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 4000);
}

// ============ GENERAR PDF ============
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const tipoInforme = document.getElementById('i_tipo_informe').value;
  
  const vehiculoId = document.getElementById('i_vehiculo').value;
  const desde = document.getElementById('i_desde').value;
  const hasta = document.getElementById('i_hasta').value;
  const numFactura = document.getElementById('i_factura').value.trim();
  const taller = document.getElementById('i_taller').value.trim();
  const ivaPorcentaje = parseFloat(document.getElementById('i_iva').value) || 0;

  if (!vehiculoId) { mostrarMsg('msg_informe', 'Selecciona un vehículo.', 'err'); return; }

  const v = state.vehiculos.find(x => x.id === vehiculoId);
  
  let lista = state.mantenimientos.filter(m => m.vehiculoId === vehiculoId);
  if (desde) lista = lista.filter(m => m.fecha >= desde);
  if (hasta) lista = lista.filter(m => m.fecha <= hasta);
  lista.sort((a,b) => a.fecha.localeCompare(b.fecha));

  if (lista.length === 0) { mostrarMsg('msg_informe', 'No hay mantenimientos en ese rango.', 'err'); return; }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  // ================= CABECERA =================
  doc.setFillColor(26, 58, 92);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(15); doc.setFont(undefined, 'bold');
  
  const titulo = tipoInforme === 'historico' ? 'HISTORIAL DE MANTENIMIENTO' : 'INFORME / FACTURA DE MANTENIMIENTO';
  doc.text(titulo, 15, 14);
  
  if (numFactura && tipoInforme === 'detallado') { 
    doc.setFontSize(10); doc.text('Nº: ' + numFactura, pageW - 15, 14, {align:'right'}); 
  }

  doc.setTextColor(0,0,0);
  doc.setFontSize(10); doc.setFont(undefined, 'normal');
  y = 32;

  if (taller && tipoInforme === 'detallado') { doc.text(taller, 15, y); y += 5; }
  
  doc.setFont(undefined, 'bold'); doc.text('Vehículo:', 15, y); doc.setFont(undefined, 'normal');
  doc.text(`${v.marca} ${v.modelo}`, 45, y); y += 6;
  doc.setFont(undefined, 'bold'); doc.text('Matrícula:', 15, y); doc.setFont(undefined, 'normal');
  doc.text(v.matricula, 45, y); y += 6;
  doc.setFont(undefined, 'bold'); doc.text('Nº Bastidor:', 15, y); doc.setFont(undefined, 'normal');
  doc.text(v.bastidor || '—', 45, y); y += 6;
  doc.setFont(undefined, 'bold'); doc.text('Fecha informe:', 15, y); doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString('es-ES'), 45, y); y += 6;
  doc.setFont(undefined, 'bold'); doc.text('Periodo:', 15, y); doc.setFont(undefined, 'normal');
  const per = (desde ? desde.split('-').reverse().join('/') : 'inicio') + ' — ' + (hasta ? hasta.split('-').reverse().join('/') : 'hoy');
  doc.text(per, 45, y); y += 10;

  if (tipoInforme === 'historico') {
    // ================= INFORME HISTÓRICO =================
    let bodyHistorial = [];
    
    lista.forEach(m => {
      // Columna 1: SOLO Operaciones (sin el tipo)
      let textoTipoYServicio = "";
      if (m.manoObra && m.manoObra.length > 0) {
        textoTipoYServicio = m.manoObra.map(o => `• ${o.concepto}`).join("\n");
      } else {
        textoTipoYServicio = "—";
      }

      // Columna 2: Repuestos / Materiales
      let textoRepuestos = "—";
      if (m.repuestos && m.repuestos.length > 0) {
        textoRepuestos = m.repuestos.map(r => {
           const refStr = r.ref ? `- ${r.ref}:` : '-';
           return `• ${refStr} ${r.desc}`;
        }).join("\n");
      }

      // Añadir taller si existe
      if (m.taller) {
         if (textoRepuestos !== "—") textoRepuestos += "\n\n";
         else textoRepuestos = "";
         textoRepuestos += `Taller: ${m.taller}`;
      }

      bodyHistorial.push([
        m.fecha.split('-').reverse().join('/'),
        m.km || '',
        textoTipoYServicio,
        textoRepuestos
      ]);
    });

    doc.autoTable({
      startY: y,
      head: [['Fecha', 'Km', 'Operaciones Realizadas', 'Materiales / Repuestos']],
      body: bodyHistorial,
      theme: 'striped',
      headStyles: { fillColor: [26, 58, 92], textColor: 255, fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, valign: 'top', cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 2: { cellWidth: 65 }, 3: { cellWidth: 70 } },
      margin: { left: 15, right: 15 }
    });

  } else {
    // ================= INFORME DETALLADO =================
    let bodyMano = [];
    lista.forEach(m => {
      if (m.manoObra && m.manoObra.length > 0) {
        m.manoObra.forEach(o => {
          bodyMano.push([ m.fecha.split('-').reverse().join('/'), m.km || '', o.concepto, fmt(o.precio) ]);
        });
      }
    });

    if (bodyMano.length > 0) {
      doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text('Desglose de Mano de Obra', 15, y);
      y += 4;
      doc.autoTable({
        startY: y,
        head: [['Fecha', 'Km', 'Concepto', 'Importe']],
        body: bodyMano,
        theme: 'grid',
        headStyles: { fillColor: [40, 70, 100], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 20 }, 2: { cellWidth: 115 }, 3: { cellWidth: 25, halign: 'right' } },
        margin: { left: 15, right: 15 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    let bodyRepuestos = [];
    lista.forEach(m => {
      if (m.repuestos && m.repuestos.length > 0) {
        m.repuestos.forEach(r => {
          bodyRepuestos.push([ m.fecha.split('-').reverse().join('/'), r.cant, r.ref || '-', r.desc, fmt(r.precio), fmt(r.cant * r.precio) ]);
        });
      }
    });

    if (bodyRepuestos.length > 0) {
      doc.setFontSize(11); doc.setFont(undefined, 'bold');
      doc.text('Desglose de Repuestos', 15, y);
      y += 4;
      doc.autoTable({
        startY: y,
        head: [['Fecha', 'Cant', 'Ref.', 'Descripción', 'Precio Ud.', 'Total']],
        body: bodyRepuestos,
        theme: 'grid',
        headStyles: { fillColor: [40, 70, 100], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 15, halign: 'center' }, 2: { cellWidth: 30 }, 3: { cellWidth: 60 }, 4: { cellWidth: 25, halign: 'right' }, 5: { cellWidth: 25, halign: 'right' } },
        margin: { left: 15, right: 15 }
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    const totalMano = lista.reduce((s,m) => s + (Number(m.mano)||0), 0);
    const totalPiezas = lista.reduce((s,m) => s + (Number(m.piezas)||0), 0);
    const base = totalMano + totalPiezas;
    const iva = base * (ivaPorcentaje / 100);
    const total = base + iva;

    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text('Base imponible:', 130, y); doc.text(fmt(base), pageW - 15, y, {align:'right'}); y += 6;
    doc.text(`IVA (${ivaPorcentaje}%):`, 130, y); doc.text(fmt(iva), pageW - 15, y, {align:'right'}); y += 6;
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL FACTURA:', 130, y); doc.text(fmt(total), pageW - 15, y, {align:'right'});
  }

  // Abrir en una pestaña nueva para visualizar antes de descargar
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
  
  mostrarMsg('msg_informe', 'PDF generado y abierto en una pestaña nueva.', 'ok');
}

// ============ BACKUP ============
function exportarJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'mantenimiento_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click(); URL.revokeObjectURL(url);
  mostrarMsg('msg_backup', 'Copia exportada.', 'ok');
}

function importarJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.vehiculos || !data.mantenimientos) throw new Error('Formato inválido');
      if (!confirm('Esto reemplazará todos los datos actuales. ¿Continuar?')) return;
      state = data; guardar(); renderAll();
      mostrarMsg('msg_backup', 'Datos importados correctamente.', 'ok');
    } catch(err) {
      mostrarMsg('msg_backup', 'Error al importar: ' + err.message, 'err');
    }
  };
  reader.readAsText(file);
}

function borrarTodo() {
  if (!confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) return;
  state = { vehiculos: [], mantenimientos: [], catalogoFotos: [] };
  guardar(); renderAll();
  mostrarMsg('msg_backup', 'Todos los datos borrados.', 'ok');
}

// ============ INIT ============
cargar();
document.getElementById('m_fecha').value = new Date().toISOString().slice(0,10);
renderManoObraTemporal();
renderRepuestosTemporales();
renderAll();
