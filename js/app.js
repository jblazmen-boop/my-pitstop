import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Registrar el Service Worker para las notificaciones
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log("Service Worker registrado correctamente.");
  }).catch(err => console.log("Error al registrar Service Worker:", err));
}

const firebaseConfig = {
  apiKey: "AIzaSyAr5RD3Y0azFQCwpDEq-zx7m-fH_tP4zCw",
  authDomain: "my-pitstop-5f986.firebaseapp.com",
  projectId: "my-pitstop-5f986",
  storageBucket: "my-pitstop-5f986.firebasestorage.app",
  messagingSenderId: "1063205814561",
  appId: "1:1063205814561:web:d3d77eac32b518e91dbe60"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let state = { vehiculos: [], mantenimientos: [], catalogoFotos: [], author: 'J.Blázquez', themeAccent: 'rojo', themeMachine: 'carbono' };
let repuestosTemporales = [];
let manoObraTemporal = [];
let editandoMantenimientoId = null;
let currentLang = 'es'; 
let miGraficoInstancia = null; 
let signaturePad = null; 
let firmaGuardada = null; 
let currentUser = null;
let unsubscribeSnapshot = null;

let globalAudioCtx = null;
function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) globalAudioCtx = new AudioContext();
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

const STORAGE_KEY = 'mi_app_mantenimiento_coches'; 

const modalAuth = document.getElementById('modal-auth');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogoutHeader = document.getElementById('btn-logout-header');
const authError = document.getElementById('auth-error');

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    modalAuth.style.display = 'none'; 
    btnLogoutHeader.style.display = 'block'; 
    iniciarSincronizacion(user.uid); 
  } else {
    currentUser = null;
    modalAuth.style.display = 'flex'; 
    btnLogoutHeader.style.display = 'none';
    if (unsubscribeSnapshot) unsubscribeSnapshot(); 
    state = { vehiculos: [], mantenimientos: [], catalogoFotos: [], author: 'J.Blázquez', themeAccent: 'rojo', themeMachine: 'carbono' };
    actualizarAutor('J.Blázquez');
    aplicarTemaColores();
    renderAll();
  }
});

btnLogin.onclick = () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  authError.textContent = currentLang === 'es' ? "Cargando..." : "Loading...";
  signInWithEmailAndPassword(auth, email, pass).catch(e => authError.textContent = "Error: " + e.message);
};

btnRegister.onclick = () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  authError.textContent = currentLang === 'es' ? "Creando cuenta..." : "Creating account...";
  createUserWithEmailAndPassword(auth, email, pass).catch(e => authError.textContent = "Error: " + e.message);
};

btnLogoutHeader.onclick = () => signOut(auth);

document.getElementById('btn-forgot-password').onclick = (e) => {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  if (!email) {
    authError.style.color = '#ef4444';
    authError.textContent = currentLang === 'es' ? 'Escribe tu correo arriba para enviarte el enlace.' : 'Enter your email above to send the link.';
    return;
  }
  authError.style.color = '#9ca3af';
  authError.textContent = currentLang === 'es' ? "Enviando..." : "Sending...";
  sendPasswordResetEmail(auth, email)
    .then(() => {
      authError.style.color = '#22c55e'; 
      authError.textContent = currentLang === 'es' ? 'Correo enviado. Revisa tu bandeja de entrada (y spam).' : 'Email sent. Check your inbox (and spam).';
    })
    .catch((error) => {
      authError.style.color = '#ef4444';
      authError.textContent = "Error: " + error.message;
    });
};

function iniciarSincronizacion(uid) {
  const userDocRef = doc(db, "usuarios", uid);
  
  unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      state = docSnap.data();
      if (!state.vehiculos) state.vehiculos = [];
      if (!state.mantenimientos) state.mantenimientos = [];
      if (!state.catalogoFotos) state.catalogoFotos = [];
      if (!state.author) state.author = 'J.Blázquez';
      if (!state.themeAccent) state.themeAccent = 'rojo';
      if (!state.themeMachine) state.themeMachine = 'carbono';
      
      state.vehiculos.forEach(v => { if (!v.proxSeguro) v.proxSeguro = ''; });

      actualizarAutor(state.author);
      aplicarTemaColores();
      const inputAuthor = document.getElementById('input-author');
      if(inputAuthor) inputAuthor.value = state.author;

      renderAll();
      cargarRecordatorios();
      cargarGastosFijos();
    } else {
      const datosLocales = localStorage.getItem(STORAGE_KEY);
      if (datosLocales) {
        state = JSON.parse(datosLocales);
        if(!state.author) state.author = 'J.Blázquez';
        if(!state.themeAccent) state.themeAccent = 'rojo';
        if(!state.themeMachine) state.themeMachine = 'carbono';
        setDoc(userDocRef, state);
      } else {
        state = { vehiculos: [], mantenimientos: [], catalogoFotos: [], author: 'J.Blázquez', themeAccent: 'rojo', themeMachine: 'carbono' };
        setDoc(userDocRef, state);
      }
      actualizarAutor(state.author);
      aplicarTemaColores();
      const inputAuthor = document.getElementById('input-author');
      if(inputAuthor) inputAuthor.value = state.author;
      
      renderAll();
    }
  });
}

function actualizarAutor(nombre) {
  state.author = nombre || 'J.Blázquez';
  const headerAuthor = document.getElementById('header-author');
  if (headerAuthor) headerAuthor.textContent = 'by ' + state.author;
  guardar();
}

// ============ COLORES PERSONALIZABLES ============
const coloresAcento = {
  rojo: { main: '#e11d48', hover: '#be123c' },
  azul: { main: '#3b82f6', hover: '#2563eb' },
  verde: { main: '#10b981', hover: '#059669' },
  naranja: { main: '#f59e0b', hover: '#d97706' },
  morado: { main: '#8b5cf6', hover: '#7c3aed' },
  rosa: { main: '#ec4899', hover: '#db2777' }
};
const coloresMaquina = {
  carbono: { main: '#2a323d', dark: '#303945' },
  azul: { main: '#1e293b', dark: '#334155' },
  verde: { main: '#2a3b2a', dark: '#3b4a3b' },
  gris: { main: '#334155', dark: '#475569' }
};

function aplicarTemaColores() {
  const acento = coloresAcento[state.themeAccent] || coloresAcento.rojo;
  const maquina = coloresMaquina[state.themeMachine] || coloresMaquina.carbono;
  
  document.documentElement.style.setProperty('--accent', acento.main);
  document.documentElement.style.setProperty('--accent-hover', acento.hover);
  document.documentElement.style.setProperty('--bg-machine', maquina.main);
  document.documentElement.style.setProperty('--bg-machine-dark', maquina.dark);
  
  const selAccent = document.getElementById('input-theme-accent');
  const selMachine = document.getElementById('input-theme-machine');
  if (selAccent) selAccent.value = state.themeAccent;
  if (selMachine) selMachine.value = state.themeMachine;
}

function cambiarColorAcento(val) {
  state.themeAccent = val;
  guardar();
  aplicarTemaColores();
}

function cambiarColorMaquina(val) {
  state.themeMachine = val;
  guardar();
  aplicarTemaColores();
}

// ============ SONIDO Y TEMA ============
function reproducirBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return; 
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
  } catch (e) { console.log("Audio no disponible", e); }
}

function sonidoArranque() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3); 
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) { console.log(e); }
}

function toggleTema() {
  const body = document.body;
  const btn = document.getElementById('btn-tema');
  reproducirBeep();
  body.classList.toggle('modo-claro');
  if (body.classList.contains('modo-claro')) {
    btn.textContent = '☀️';
    localStorage.setItem('pitstop_tema', 'claro');
  } else {
    btn.textContent = '🌙';
    localStorage.setItem('pitstop_tema', 'oscuro');
  }
  if (document.getElementById('grafico').classList.contains('active')) {
    renderGrafico();
  }
}

function cargarTema() {
  const tema = localStorage.getItem('pitstop_tema');
  const btn = document.getElementById('btn-tema');
  if (tema === 'claro') {
    document.body.classList.add('modo-claro');
    btn.textContent = '☀️';
  } else {
    document.body.classList.remove('modo-claro');
    btn.textContent = '🌙';
  }
}

function encenderMaquina() {
  const led = document.getElementById('led-encendido');
  if (led) {
    led.classList.add('encendido');
    sonidoArranque(); 
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
    gen_informe: "Generar Informe / Factura", tipo_informe: "Tipo de Informe", detallado: "Informe Detallado / Factura",
    historico: "Histórico Técnico (sin precios)", fecha_desde: "Fecha desde", fecha_hasta: "Fecha hasta",
    iva: "IVA (%)", btn_gen_pdf: "Generar PDF", btn_share_pdf: "Compartir PDF", btn_email_pdf: "Enviar por Correo",
    btn_share_chart: "Compartir", btn_email_chart: "Correo",
    copia_seguridad: "Ajustes y Copia de Seguridad",
    copia_texto: "Tus datos se guardan de forma segura en la nube y se sincronizan en todos tus dispositivos con tu cuenta. Aun así, te recomendamos exportar una copia de seguridad periódicamente.",
    exportar: "Exportar copia (JSON)", importar: "Importar copia", borrar: "Borrar todos los datos",
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
    seguro: "Seguro",
    fecha_prox_seguro: "Fecha Venc. Seguro",
    prox_seguro: "Próximo Seguro",
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
    email_asunto_informe: "Informe de Mantenimiento My PitStop", email_cuerpo_informe: "Adjunto el informe de mantenimiento generado con My PitStop. Por favor, no olvides adjuntar el PDF descargado.",
    modal_historico_titulo: "Historial Rápido",
    seleccionar_vehiculo_modal: "Seleccionar Vehículo",
    sin_mantenimientos: "No hay mantenimientos registrados para este vehículo.",
    firma_titulo: "Firme aquí",
    btn_borrar_firma: "Borrar",
    btn_guardar_firma: "Guardar Firma",
    btn_cancelar_firma: "Cancelar",
    pdf_firma: "Firma del Cliente:",
    btn_firmar_informe: "Firmar Informe/Factura",
    btn_export_excel: "Exportar a Excel",
    auth_title: "Accede a My PitStop",
    auth_subtitle: "Sincroniza tus datos en todos tus dispositivos",
    email: "Email",
    password: "Contraseña",
    btn_forgot_pwd: "He olvidado mi contraseña",
    btn_login: "Iniciar Sesión",
    btn_register: "Registrarse",
    btn_logout: "Salir",
    btn_calendar: "Añadir al Calendario",
    btn_alerts: "Activar Avisos",
    delete_warning_title: "Borrar Aviso",
    delete_warning_text: "¿Quieres borrar este aviso? (Si lo tenías en tu calendario, tendrás que quitarlo manualmente desde la app de tu calendario).",
    delete_warning_btn: "Sí, borrar",
    theme_settings: "Ajustes de la App",
    author_label: "Personalizar nombre en la cabecera",
    color_accent: "Color de Acento",
    color_machine: "Color de la Máquina",
    color_red: "Rojo (Por defecto)",
    color_blue: "Azul",
    color_green: "Verde",
    color_orange: "Naranja",
    color_purple: "Morado",
    color_pink: "Rosa",
    color_carbono: "Carbono (Por defecto)",
    color_dark_blue: "Azul Oscuro",
    color_olive: "Verde Oliva",
    color_slate: "Gris Pizarra",
    editar_btn: "Editar",
    borrar_btn: "Borrar"
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
    gen_informe: "Generate Report / Invoice", tipo_informe: "Report Type", detallado: "Detailed Report / Invoice",
    historico: "Technical History (no prices)", fecha_desde: "Date from", fecha_hasta: "Date to",
    iva: "VAT (%)", btn_gen_pdf: "Generate PDF", btn_share_pdf: "Share PDF", btn_email_pdf: "Send by Email",
    btn_share_chart: "Share", btn_email_chart: "Email",
    copia_seguridad: "Settings & Backup",
    copia_texto: "Your data is securely stored in the cloud and synced across all your devices with your account. We still recommend exporting a backup periodically.",
    exportar: "Export backup (JSON)", importar: "Import backup", borrar: "Delete all data",
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
    seguro: "Insurance",
    fecha_prox_seguro: "Insurance Exp. Date",
    prox_seguro: "Next Insurance",
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
    email_asunto_informe: "My PitStop Maintenance Report", email_cuerpo_informe: "Attached is the maintenance report generated with My PitStop. Please do not forget to attach the downloaded PDF.",
    modal_historico_titulo: "Quick History",
    seleccionar_vehiculo_modal: "Select Vehicle",
    sin_mantenimientos: "No maintenance records for this vehicle.",
    firma_titulo: "Sign here",
    btn_borrar_firma: "Clear",
    btn_guardar_firma: "Save Signature",
    btn_cancelar_firma: "Cancel",
    pdf_firma: "Customer Signature:",
    btn_firmar_informe: "Sign Report/Invoice",
    btn_export_excel: "Export to Excel",
    auth_title: "Log in to My PitStop",
    auth_subtitle: "Sync your data across all devices",
    email: "Email",
    password: "Password",
    btn_forgot_pwd: "Forgot password?",
    btn_login: "Log In",
    btn_register: "Register",
    btn_logout: "Logout",
    btn_calendar: "Add to Calendar",
    btn_alerts: "Activate Alerts",
    delete_warning_title: "Delete Alert",
    delete_warning_text: "Do you want to delete this alert? (If you had it in your calendar, you'll need to remove it manually from the calendar app).",
    delete_warning_btn: "Yes, delete",
    theme_settings: "App Settings",
    author_label: "Customize name in header",
    color_accent: "Accent Color",
    color_machine: "Machine Color",
    color_red: "Red (Default)",
    color_blue: "Blue",
    color_green: "Green",
    color_orange: "Orange",
    color_purple: "Purple",
    color_pink: "Pink",
    color_carbono: "Carbon (Default)",
    color_dark_blue: "Dark Blue",
    color_olive: "Olive Green",
    color_slate: "Slate Gray",
    editar_btn: "Edit",
    borrar_btn: "Delete"
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
  "type_10": { es: "Otro", en: "Other" },
  "type_11": { es: "Vida / Salud Batería", en: "Battery Life / Health" }
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
      document.getElementById('btn-guardar').textContent = currentLang === 'es' ? 'Guardar Cambios' : 'Save Changes';
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
  
  const hEs = document.getElementById('lang-es');
  const hEn = document.getElementById('lang-en');
  if(hEs) hEs.classList.remove('active');
  if(hEn) hEn.classList.remove('active');
  const hCurrent = document.getElementById('lang-' + lang);
  if(hCurrent) hCurrent.classList.add('active');
  
  const mEs = document.getElementById('lang-es-modal');
  const mEn = document.getElementById('lang-en-modal');
  if(mEs) mEs.classList.remove('active');
  if(mEn) mEn.classList.remove('active');
  const mCurrent = document.getElementById('lang-' + lang + '-modal');
  if(mCurrent) mCurrent.classList.add('active');

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
      if (!state.author) state.author = 'J.Blázquez';
      if (!state.themeAccent) state.themeAccent = 'rojo';
      if (!state.themeMachine) state.themeMachine = 'carbono';

      state.vehiculos.forEach(v => { 
        if (!v.proxMant) v.proxMant = ''; 
        if (!v.proxKmMant) v.proxKmMant = ''; 
        if (!v.proxItv) v.proxItv = ''; 
        if (!v.proxSeguro) v.proxSeguro = '';
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

function guardar() { 
  if (!currentUser) return; 
  setDoc(doc(db, "usuarios", currentUser.uid), state)
    .catch(e => console.error("Error al guardar en la nube:", e));
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function fmt(n) { return (Number(n)||0).toFixed(2) + ' €'; }
function esc(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// NUEVA FUNCIÓN PARA FORMATEAR FECHAS (DD/MM/AAAA)
function formatFecha(fechaStr) {
  if (!fechaStr) return '—';
  const partes = fechaStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fechaStr;
}
// ==========================================
// PARTE 2 DE 3 - MODALES, TABS, CRUD Y RENDERIZADO
// ==========================================

// ---------- MENSAJES ----------
function mostrarMsg(id, texto, tipo = 'ok') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto;
  el.className = 'msg ' + tipo;
  setTimeout(() => {
    el.textContent = '';
    el.className = '';
  }, 4000);
}

// ---------- MODAL FOTO ----------
function abrirModal(src) {
  const modal = document.getElementById('modal-foto');
  const img = document.getElementById('img-modal');
  if (modal && img) {
    img.src = src;
    modal.style.display = 'flex';
  }
}

function cerrarModal() {
  const modal = document.getElementById('modal-foto');
  if (modal) modal.style.display = 'none';
}

// ---------- MODAL HISTÓRICO RÁPIDO ----------
function abrirModalHistorico() {
  const modal = document.getElementById('modal-historico');
  const sel = document.getElementById('modal-select-vehiculo');
  if (!modal || !sel) return;

  sel.innerHTML = `<option value="">${translations[currentLang].selecciona}</option>` +
    state.vehiculos.map(v => `<option value="${v.id}">${esc(v.matricula)} - ${esc(v.marca)} ${esc(v.modelo)}</option>`).join('');

  if (state.vehiculos.length > 0) {
    sel.value = state.vehiculos[0].id;
  }

  cambiarVehiculoHistorico();
  modal.style.display = 'flex';
}

function cerrarModalHistorico(event) {
  if (event && event.target !== event.currentTarget && !event.target.classList.contains('cerrar-modal')) return;
  const modal = document.getElementById('modal-historico');
  if (modal) modal.style.display = 'none';
}

function cambiarVehiculoHistorico() {
  const id = document.getElementById('modal-select-vehiculo')?.value;
  const lista = document.getElementById('historial-lista');
  const titulo = document.getElementById('historial-titulo-vehiculo');
  if (!lista) return;

  const v = state.vehiculos.find(x => x.id === id);
  if (titulo) {
    titulo.textContent = v
      ? `${translations[currentLang].modal_historico_titulo}: ${v.matricula}`
      : translations[currentLang].modal_historico_titulo;
  }

  const mants = state.mantenimientos
    .filter(m => m.vehiculoId === id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (!mants.length) {
    lista.innerHTML = `<p class="empty">${translations[currentLang].sin_mantenimientos}</p>`;
    return;
  }

  lista.innerHTML = mants.map(m => {
    const tipoTexto = tiposMantenimiento[m.tipo]?.[currentLang] || m.tipo || '';
    const ops = (m.manoObra || []).map(o => o.concepto).join(', ') || '';
    return `
      <div class="historial-item" onclick="editarMantenimiento('${m.id}'); cerrarModalHistorico();">
        <h4>${esc(formatFecha(m.fecha))} - ${esc(tipoTexto)}</h4>
        <p>${m.km ? esc(m.km) + ' km' : ''} ${m.taller ? ' - ' + esc(m.taller) : ''}</p>
        <p>${esc(ops)}</p>
      </div>
    `;
  }).join('');
}

// ---------- MODAL FIRMA ----------
function abrirModalFirma() {
  const modal = document.getElementById('modal-firma');
  const canvas = document.getElementById('canvas-firma');
  if (!modal || !canvas) return;

  modal.style.display = 'flex';
  canvas.width = canvas.offsetWidth;
  canvas.height = 250;

  if (signaturePad) {
    signaturePad.clear();
  } else if (window.SignaturePad) {
    signaturePad = new SignaturePad(canvas);
  }
}

function cerrarModalFirma() {
  const modal = document.getElementById('modal-firma');
  if (modal) modal.style.display = 'none';
}

function limpiarFirma() {
  if (signaturePad) signaturePad.clear();
}

function guardarFirma() {
  if (!signaturePad || signaturePad.isEmpty()) {
    alert(currentLang === 'es' ? 'Firma vacía. Dibuja tu firma primero.' : 'Empty signature. Draw your signature first.');
    return;
  }

  firmaGuardada = signaturePad.toDataURL('image/png');
  cerrarModalFirma();
  mostrarMsg(
    'msg_informe',
    currentLang === 'es'
      ? 'Firma guardada. Se incluirá al generar el PDF.'
      : 'Signature saved. It will be included when generating PDF.',
    'ok'
  );
}

// ---------- PESTAÑAS ----------
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    reproducirBeep();

    const target = tab.dataset.tab;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById(target);
    if (panel) panel.classList.add('active');

    if (target === 'grafico') {
      renderGrafico();
      cargarGastosFijos();
    }

    if (target === 'recordatorios') {
      cargarRecordatorios();
    }

    if (target === 'informe') {
      renderTablaSeleccion();
    }

    if (window.innerWidth <= 768) {
      tab.classList.add('tooltip-active');
      setTimeout(() => tab.classList.remove('tooltip-active'), 1200);
    }
  });
});

// ---------- VEHÍCULOS ----------
function addVehiculo() {
  const matricula = document.getElementById('v_matricula').value.trim().toUpperCase();
  const marca = document.getElementById('v_marca').value.trim();
  const modelo = document.getElementById('v_modelo').value.trim();
  const bastidor = document.getElementById('v_bastidor').value.trim();

  if (!matricula || !marca || !modelo) {
    mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Matrícula, marca y modelo son obligatorios.' : 'Plate, make and model are required.', 'err');
    return;
  }

  if (state.vehiculos.some(v => v.matricula === matricula)) {
    mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Ese vehículo ya existe.' : 'That vehicle already exists.', 'err');
    return;
  }

  const nuevo = {
    id: uid(),
    matricula,
    marca,
    modelo,
    bastidor,
    proxMant: '',
    proxKmMant: '',
    proxItv: '',
    proxSeguro: '',
    ultItvFecha: '',
    ultItvKm: '',
    costeSeguro: '',
    costeItv: ''
  };

  state.vehiculos.push(nuevo);
  guardar();

  document.getElementById('v_matricula').value = '';
  document.getElementById('v_marca').value = '';
  document.getElementById('v_modelo').value = '';
  document.getElementById('v_bastidor').value = '';

  renderAll();
  mostrarMsg('msg_vehiculo', currentLang === 'es' ? 'Vehículo añadido.' : 'Vehicle added.', 'ok');
}

function eliminarVehiculo(id) {
  const texto = currentLang === 'es'
    ? '¿Borrar este vehículo y todos sus mantenimientos?'
    : 'Delete this vehicle and all its maintenance records?';

  if (!confirm(texto)) return;

  state.vehiculos = state.vehiculos.filter(v => v.id !== id);
  state.mantenimientos = state.mantenimientos.filter(m => m.vehiculoId !== id);

  guardar();
  renderAll();
}

function renderVehiculos() {
  const tbody = document.querySelector('#tabla_vehiculos tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!state.vehiculos.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${currentLang === 'es' ? 'No hay vehículos registrados.' : 'No vehicles registered.'}</td></tr>`;
    return;
  }

  state.vehiculos.forEach(v => {
    tbody.innerHTML += `
      <tr>
        <td>${esc(v.matricula)}</td>
        <td>${esc(v.marca)}</td>
        <td>${esc(v.modelo)}</td>
        <td>${esc(v.bastidor || '—')}</td>
        <td>
          <button type="button" class="danger" onclick="eliminarVehiculo('${v.id}')">${translations[currentLang].borrar_btn}</button>
        </td>
      </tr>
    `;
  });
}

// ---------- SELECTS ----------
function renderSelects() {
  const ids = ['m_vehiculo', 'f_vehiculo', 'i_vehiculo', 'rec_vehiculo', 'g_vehiculo', 'modal-select-vehiculo'];

  ids.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;

    const valorActual = sel.value;
    let html = '';

    if (id === 'f_vehiculo' || id === 'g_vehiculo') {
      html += `<option value="">${translations[currentLang].todos}</option>`;
    } else {
      html += `<option value="">${translations[currentLang].selecciona}</option>`;
    }

    state.vehiculos.forEach(v => {
      html += `<option value="${v.id}">${esc(v.matricula)} - ${esc(v.marca)} ${esc(v.modelo)}</option>`;
    });

    sel.innerHTML = html;

    if (valorActual && Array.from(sel.options).some(o => o.value === valorActual)) {
      sel.value = valorActual;
    }
  });

  const catSel = document.getElementById('r_foto_catalogo');
  if (catSel) {
    const valorActual = catSel.value;
    let html = `<option value="">${translations[currentLang].no_foto}</option>`;

    state.catalogoFotos.forEach((f, i) => {
      const nombre = f.nombre || `Foto ${i + 1}`;
      html += `<option value="${i}">${esc(nombre)}</option>`;
    });

    catSel.innerHTML = html;

    if (valorActual && Array.from(catSel.options).some(o => o.value === valorActual)) {
      catSel.value = valorActual;
    }
  }
}

// ---------- MANO DE OBRA ----------
function addManoObra() {
  const concepto = document.getElementById('o_concepto').value.trim();
  const precio = parseFloat(document.getElementById('o_precio').value) || 0;

  if (!concepto || precio <= 0) {
    alert(currentLang === 'es' ? 'Introduce concepto y precio válido.' : 'Enter a concept and valid price.');
    return;
  }

  manoObraTemporal.push({
    id: uid(),
    concepto,
    precio
  });

  document.getElementById('o_concepto').value = '';
  document.getElementById('o_precio').value = '';

  renderTablaManoObra();
  actualizarTotales();
}

function eliminarManoObra(id) {
  manoObraTemporal = manoObraTemporal.filter(o => o.id !== id);
  renderTablaManoObra();
  actualizarTotales();
}

function renderTablaManoObra() {
  const tbody = document.querySelector('#tabla_mano_obra tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!manoObraTemporal.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty">${currentLang === 'es' ? 'Sin operaciones.' : 'No operations.'}</td></tr>`;
    return;
  }

  manoObraTemporal.forEach(o => {
    tbody.innerHTML += `
      <tr>
        <td>${esc(o.concepto)}</td>
        <td>${fmt(o.precio)}</td>
        <td><button type="button" class="danger" onclick="eliminarManoObra('${o.id}')">${translations[currentLang].borrar_btn}</button></td>
      </tr>
    `;
  });
}

// ---------- REPUESTOS ----------
function convertirArchivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addRepuesto() {
  const cant = parseInt(document.getElementById('r_cant').value) || 1;
  const desc = document.getElementById('r_desc').value.trim();
  const ref = document.getElementById('r_ref').value.trim();
  const precio = parseFloat(document.getElementById('r_precio').value) || 0;

  if (!desc || precio <= 0) {
    alert(currentLang === 'es' ? 'Introduce descripción y precio válido.' : 'Enter a description and valid price.');
    return;
  }

  let foto = '';

  const fileInput = document.getElementById('r_foto');
  const catIndex = document.getElementById('r_foto_catalogo')?.value;

  if (fileInput && fileInput.files && fileInput.files[0]) {
    foto = await convertirArchivoABase64(fileInput.files[0]);
  } else if (catIndex !== undefined && catIndex !== '') {
    const f = state.catalogoFotos[Number(catIndex)];
    if (f) foto = f.data || f.url || f;
  }

  repuestosTemporales.push({
    id: uid(),
    cant,
    desc,
    ref,
    precio,
    foto
  });

  document.getElementById('r_cant').value = '1';
  document.getElementById('r_desc').value = '';
  document.getElementById('r_ref').value = '';
  document.getElementById('r_precio').value = '';
  if (fileInput) fileInput.value = '';
  if (document.getElementById('r_foto_catalogo')) document.getElementById('r_foto_catalogo').value = '';

  const labelFile = document.getElementById('file-btn-label');
  if (labelFile) labelFile.textContent = translations[currentLang].seleccionar_archivo;

  renderTablaRepuestos();
  actualizarTotales();
}

function eliminarRepuesto(id) {
  repuestosTemporales = repuestosTemporales.filter(r => r.id !== id);
  renderTablaRepuestos();
  actualizarTotales();
}

function renderTablaRepuestos() {
  const tbody = document.querySelector('#tabla_repuestos tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!repuestosTemporales.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">${currentLang === 'es' ? 'Sin repuestos.' : 'No parts.'}</td></tr>`;
    return;
  }

  repuestosTemporales.forEach(r => {
    const total = Number(r.cant || 0) * Number(r.precio || 0);
    tbody.innerHTML += `
      <tr>
        <td>${r.foto ? `<img src="${r.foto}" class="foto-miniatura" onclick="abrirModal(this.src)">` : '—'}</td>
        <td>${esc(r.cant)}</td>
        <td>${esc(r.desc)}</td>
        <td>${esc(r.ref || '—')}</td>
        <td>${fmt(r.precio)}</td>
        <td>${fmt(total)}</td>
        <td><button type="button" class="danger" onclick="eliminarRepuesto('${r.id}')">${translations[currentLang].borrar_btn}</button></td>
      </tr>
    `;
  });
}

function actualizarTotales() {
  const totalMano = manoObraTemporal.reduce((s, o) => s + Number(o.precio || 0), 0);
  const totalRep = repuestosTemporales.reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);

  const elMano = document.getElementById('total_mano');
  const elRep = document.getElementById('total_repuestos');

  if (elMano) elMano.textContent = fmt(totalMano);
  if (elRep) elRep.textContent = fmt(totalRep);
}

// ---------- GUARDAR / EDITAR MANTENIMIENTO ----------
function limpiarFormularioMantenimiento() {
  const ids = ['m_vehiculo', 'm_fecha', 'm_km', 'm_tipo', 'm_taller', 'm_notas', 'o_concepto', 'o_precio', 'r_cant', 'r_desc', 'r_ref', 'r_precio'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const rCant = document.getElementById('r_cant');
  if (rCant) rCant.value = '1';

  const rFoto = document.getElementById('r_foto');
  if (rFoto) rFoto.value = '';

  const rFotoCat = document.getElementById('r_foto_catalogo');
  if (rFotoCat) rFotoCat.value = '';

  const labelFile = document.getElementById('file-btn-label');
  if (labelFile) labelFile.textContent = translations[currentLang].seleccionar_archivo;

  manoObraTemporal = [];
  repuestosTemporales = [];

  renderTablaManoObra();
  renderTablaRepuestos();
  actualizarTotales();
}

function guardarMantenimiento() {
  const vehiculoId = document.getElementById('m_vehiculo').value;
  const fecha = document.getElementById('m_fecha').value;
  const km = document.getElementById('m_km').value;
  const tipo = document.getElementById('m_tipo').value;
  const taller = document.getElementById('m_taller').value.trim();
  const notas = document.getElementById('m_notas').value.trim();

  if (!vehiculoId || !fecha || !tipo) {
    mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Vehículo, fecha y tipo son obligatorios.' : 'Vehicle, date and type are required.', 'err');
    return;
  }

  const totalMano = manoObraTemporal.reduce((s, o) => s + Number(o.precio || 0), 0);
  const totalRep = repuestosTemporales.reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);
  const total = totalMano + totalRep;

  const mantenimiento = {
    id: editandoMantenimientoId || uid(),
    vehiculoId,
    fecha,
    km,
    tipo,
    taller,
    notas,
    manoObra: JSON.parse(JSON.stringify(manoObraTemporal)),
    repuestos: JSON.parse(JSON.stringify(repuestosTemporales)),
    totalMano,
    totalRep,
    total
  };

  if (editandoMantenimientoId) {
    const idx = state.mantenimientos.findIndex(m => m.id === editandoMantenimientoId);
    if (idx >= 0) state.mantenimientos[idx] = mantenimiento;
    editandoMantenimientoId = null;

    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) btnCancelar.style.display = 'none';
  } else {
    state.mantenimientos.push(mantenimiento);
  }

  guardar();
  limpiarFormularioMantenimiento();

  const titulo = document.getElementById('titulo-formulario');
  if (titulo) titulo.textContent = translations[currentLang].reg_mantenimiento;

  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) btnGuardar.textContent = translations[currentLang].guardar_mant;

  renderAll();
  mostrarMsg('msg_mantenimiento', currentLang === 'es' ? 'Mantenimiento guardado.' : 'Maintenance saved.', 'ok');
}

function editarMantenimiento(id) {
  const m = state.mantenimientos.find(x => x.id === id);
  if (!m) return;

  editandoMantenimientoId = id;

  document.getElementById('m_vehiculo').value = m.vehiculoId || '';
  document.getElementById('m_fecha').value = m.fecha || '';
  document.getElementById('m_km').value = m.km || '';
  document.getElementById('m_tipo').value = m.tipo || '';
  document.getElementById('m_taller').value = m.taller || '';
  document.getElementById('m_notas').value = m.notas || '';

  manoObraTemporal = JSON.parse(JSON.stringify(m.manoObra || []));
  repuestosTemporales = JSON.parse(JSON.stringify(m.repuestos || []));

  renderTablaManoObra();
  renderTablaRepuestos();
  actualizarTotales();

  const titulo = document.getElementById('titulo-formulario');
  if (titulo) titulo.textContent = currentLang === 'es' ? 'Editando Mantenimiento' : 'Editing Maintenance';

  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) btnGuardar.textContent = currentLang === 'es' ? 'Guardar Cambios' : 'Save Changes';

  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.style.display = 'inline-block';

  const tabMant = document.querySelector('.tab[data-tab="mantenimientos"]');
  if (tabMant) tabMant.click();
}

function cancelarEdicion() {
  editandoMantenimientoId = null;
  limpiarFormularioMantenimiento();

  const titulo = document.getElementById('titulo-formulario');
  if (titulo) titulo.textContent = translations[currentLang].reg_mantenimiento;

  const btnGuardar = document.getElementById('btn-guardar');
  if (btnGuardar) btnGuardar.textContent = translations[currentLang].guardar_mant;

  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.style.display = 'none';
}

function eliminarMantenimiento(id) {
  const texto = currentLang === 'es'
    ? '¿Borrar este mantenimiento?'
    : 'Delete this maintenance record?';

  if (!confirm(texto)) return;

  state.mantenimientos = state.mantenimientos.filter(m => m.id !== id);
  guardar();
  renderAll();
}

function renderMantenimientos() {
  const tbody = document.querySelector('#tabla_mantenimientos tbody');
  if (!tbody) return;

  const filtro = document.getElementById('f_vehiculo')?.value || '';

  let lista = [...state.mantenimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  if (filtro) {
    lista = lista.filter(m => m.vehiculoId === filtro);
  }

  tbody.innerHTML = '';

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">${currentLang === 'es' ? 'No hay mantenimientos registrados.' : 'No maintenance records.'}</td></tr>`;
    return;
  }

  lista.forEach(m => {
    const v = state.vehiculos.find(x => x.id === m.vehiculoId);
    const tipoTexto = tiposMantenimiento[m.tipo]?.[currentLang] || m.tipo || '';

    const totalMano = m.totalMano != null
      ? m.totalMano
      : (m.manoObra || []).reduce((s, o) => s + Number(o.precio || 0), 0);

    const totalRep = m.totalRep != null
      ? m.totalRep
      : (m.repuestos || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);

    const total = m.total != null ? m.total : totalMano + totalRep;
    const operaciones = (m.manoObra || []).map(o => o.concepto).join(', ') || '—';

    tbody.innerHTML += `
      <tr>
        <td>${esc(formatFecha(m.fecha))}</td>
        <td>${v ? esc(v.matricula) : '—'}</td>
        <td>${esc(m.km || '—')}</td>
        <td>${esc(tipoTexto)}</td>
        <td>${esc(operaciones)}</td>
        <td>${fmt(totalMano)}</td>
        <td>${fmt(totalRep)}</td>
        <td>${fmt(total)}</td>
        <td>
          <button type="button" class="secondary" onclick="editarMantenimiento('${m.id}')">${translations[currentLang].editar_btn}</button>
          <button type="button" class="danger" onclick="eliminarMantenimiento('${m.id}')">${translations[currentLang].borrar_btn}</button>
        </td>
      </tr>
    `;
  });
}

// ---------- RENDER GENERAL ----------
function renderAll() {
  renderVehiculos();
  renderSelects();
  renderMantenimientos();
  renderTablaManoObra();
  renderTablaRepuestos();
  actualizarTotales();

  const inputAuthor = document.getElementById('input-author');
  if (inputAuthor) inputAuthor.value = state.author;

  aplicarTemaColores();

  if (typeof cargarRecordatorios === 'function') cargarRecordatorios();
  if (typeof cargarGastosFijos === 'function') cargarGastosFijos();
  if (typeof renderTablaSeleccion === 'function') renderTablaSeleccion();
}

// ---------- LISTENERS EXTRA ----------
const fVehiculo = document.getElementById('f_vehiculo');
if (fVehiculo) {
  fVehiculo.addEventListener('change', renderMantenimientos);
}

const rFotoInput = document.getElementById('r_foto');
const fileBtnLabel = document.getElementById('file-btn-label');
if (rFotoInput && fileBtnLabel) {
  rFotoInput.addEventListener('change', () => {
    fileBtnLabel.textContent = rFotoInput.files[0]
      ? rFotoInput.files[0].name
      : translations[currentLang].seleccionar_archivo;
  });
}
// ==========================================
// PARTE 3 DE 3 - GRÁFICOS, AVISOS, PDF, BACKUP E INIT
// ==========================================

// ---------- GRÁFICO DE GASTOS ----------
function cargarGastosFijos() {
  const sel = document.getElementById('g_vehiculo');
  const id = sel ? sel.value : '';

  const inputSeguro = document.getElementById('gf_seguro');
  const inputItv = document.getElementById('gf_itv');

  if (id) {
    const v = state.vehiculos.find(x => x.id === id);
    if (v) {
      if (inputSeguro) inputSeguro.value = v.costeSeguro || '';
      if (inputItv) inputItv.value = v.costeItv || '';
    }
  } else {
    if (inputSeguro) inputSeguro.value = '';
    if (inputItv) inputItv.value = '';
  }

  renderGrafico();
}

function guardarGastosFijos() {
  const sel = document.getElementById('g_vehiculo');
  const id = sel ? sel.value : '';

  if (!id) {
    mostrarMsg('msg_gastos_fijos', currentLang === 'es' ? 'Selecciona un vehículo primero.' : 'Select a vehicle first.', 'err');
    return;
  }

  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;

  v.costeSeguro = parseFloat(document.getElementById('gf_seguro').value) || '';
  v.costeItv = parseFloat(document.getElementById('gf_itv').value) || '';

  guardar();
  renderGrafico();
  mostrarMsg('msg_gastos_fijos', currentLang === 'es' ? 'Gastos fijos guardados.' : 'Fixed costs saved.', 'ok');
}

function renderGrafico() {
  const canvas = document.getElementById('miGrafico');
  if (!canvas) return;

  if (miGraficoInstancia) {
    miGraficoInstancia.destroy();
    miGraficoInstancia = null;
  }

  const selV = document.getElementById('g_vehiculo');
  const idVehiculo = selV ? selV.value : '';

  const selModo = document.getElementById('g_modo');
  const modo = selModo ? selModo.value : 'anios';

  const contAnio = document.getElementById('contenedor_anio_grafico');
  const selAnio = document.getElementById('g_anio');

  let lista = state.mantenimientos;

  if (idVehiculo) {
    lista = lista.filter(m => m.vehiculoId === idVehiculo);
  }

  if (modo === 'meses') {
    if (contAnio) contAnio.style.display = 'block';

    const anios = [...new Set(lista.map(m => (m.fecha || '').slice(0, 4)).filter(Boolean))].sort();

    if (selAnio) {
      const valorActual = selAnio.value;
      selAnio.innerHTML = anios.map(a => `<option value="${a}">${a}</option>`).join('');

      if (valorActual && anios.includes(valorActual)) {
        selAnio.value = valorActual;
      } else if (anios.length) {
        selAnio.value = anios[anios.length - 1];
      }
    }
  } else {
    if (contAnio) contAnio.style.display = 'none';
  }

  const etiquetas = [];
  const datosMecanica = [];
  const datosFijos = [];

  let totalMecanica = 0;
  let totalFijos = 0;

  if (modo === 'anios') {
    const mapa = {};

    lista.forEach(m => {
      const anio = (m.fecha || '').slice(0, 4);
      if (!anio) return;

      if (!mapa[anio]) mapa[anio] = 0;

      let total = Number(m.total || 0);
      if (!total) {
        const mano = (m.manoObra || []).reduce((s, o) => s + Number(o.precio || 0), 0);
        const rep = (m.repuestos || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);
        total = mano + rep;
      }

      mapa[anio] += total;
    });

    const anios = Object.keys(mapa).sort();

    anios.forEach(a => {
      etiquetas.push(a);
      datosMecanica.push(mapa[a]);
      totalMecanica += mapa[a];

      let fijo = 0;
      if (idVehiculo) {
        const v = state.vehiculos.find(x => x.id === idVehiculo);
        if (v) fijo = Number(v.costeSeguro || 0) + Number(v.costeItv || 0);
      }
      datosFijos.push(fijo);
      totalFijos += fijo;
    });
  } else {
    const anio = selAnio ? selAnio.value : '';
    const meses = ['01','02','03','04','05','06','07','08','09','10','11','12'];

    const mapa = {};
    meses.forEach(mm => { mapa[mm] = 0; });

    lista.forEach(m => {
      const f = m.fecha || '';
      if (f.slice(0, 4) !== anio) return;
      const mm = f.slice(5, 7);
      if (!mapa[mm]) return;

      let total = Number(m.total || 0);
      if (!total) {
        const mano = (m.manoObra || []).reduce((s, o) => s + Number(o.precio || 0), 0);
        const rep = (m.repuestos || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);
        total = mano + rep;
      }

      mapa[mm] += total;
    });

    const nombresMeses = currentLang === 'es'
      ? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
      : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    meses.forEach((mm, i) => {
      etiquetas.push(nombresMeses[i]);
      datosMecanica.push(mapa[mm]);
      totalMecanica += mapa[mm];

      let fijo = 0;
      if (idVehiculo) {
        const v = state.vehiculos.find(x => x.id === idVehiculo);
        if (v) fijo = (Number(v.costeSeguro || 0) + Number(v.costeItv || 0)) / 12;
      }
      datosFijos.push(fijo);
      totalFijos += fijo;
    });
  }

  const total = totalMecanica + totalFijos;
  const elTotal = document.getElementById('texto_gasto_total');
  if (elTotal) elTotal.textContent = fmt(total);

  const ctx = canvas.getContext('2d');

  miGraficoInstancia = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: currentLang === 'es' ? 'Mecánica' : 'Mechanics',
          data: datosMecanica,
          backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e11d48'
        },
        {
          label: currentLang === 'es' ? 'Fijos' : 'Fixed',
          data: datosFijos,
          backgroundColor: '#3b82f6'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() || '#e2e8f0' }
        }
      },
      scales: {
        x: {
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#9ca3af' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#9ca3af',
            callback: v => v + ' €'
          },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function exportarGraficoPDF(modo) {
  const canvas = document.getElementById('miGrafico');
  if (!canvas) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  pdf.setFontSize(18);
  pdf.text(translations[currentLang].pdf_titulo_grafico, 15, 20);

  pdf.setFontSize(11);
  pdf.text(translations[currentLang].pdf_fecha_inf + ' ' + new Date().toLocaleDateString(), 15, 28);

  const imgData = canvas.toDataURL('image/png');
  const ancho = 180;
  const alto = (canvas.height * ancho) / canvas.width;
  pdf.addImage(imgData, 'PNG', 15, 40, ancho, alto);

  const nombre = 'gastos_' + Date.now() + '.pdf';
  pdf.save(nombre);

  if (modo === 'share' && navigator.share) {
    navigator.share({
      title: translations[currentLang].email_asunto_grafico,
      text: translations[currentLang].email_cuerpo_grafico
    }).catch(() => {});
  } else if (modo === 'email') {
    window.location.href = 'mailto:?subject=' +
      encodeURIComponent(translations[currentLang].email_asunto_grafico) +
      '&body=' + encodeURIComponent(translations[currentLang].email_cuerpo_grafico);
  } else {
    mostrarMsg('msg_grafico', currentLang === 'es' ? 'PDF generado.' : 'PDF generated.', 'ok');
  }
}

// ---------- RECORDATORIOS ----------
function cargarRecordatorios() {
  const sel = document.getElementById('rec_vehiculo');
  if (!sel) return;

  const valorActual = sel.value;

  let html = `<option value="">${translations[currentLang].selecciona}</option>`;
  state.vehiculos.forEach(v => {
    html += `<option value="${v.id}">${esc(v.matricula)} - ${esc(v.marca)} ${esc(v.modelo)}</option>`;
  });
  sel.innerHTML = html;

  if (valorActual && Array.from(sel.options).some(o => o.value === valorActual)) {
    sel.value = valorActual;
  }

  const id = sel.value;
  if (id) {
    const v = state.vehiculos.find(x => x.id === id);
    if (v) {
      document.getElementById('rec_mant').value = v.proxMant || '';
      document.getElementById('rec_km_mant').value = v.proxKmMant || '';
      document.getElementById('rec_itv').value = v.proxItv || '';
      document.getElementById('rec_itv_pasada').value = v.ultItvFecha || '';
      document.getElementById('rec_km_itv_pasada').value = v.ultItvKm || '';
      document.getElementById('rec_seguro').value = v.proxSeguro || '';
    }
  } else {
    ['rec_mant','rec_km_mant','rec_itv','rec_itv_pasada','rec_km_itv_pasada','rec_seguro'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }

  renderTablaRecordatorios();
}

function guardarRecordatorio() {
  const id = document.getElementById('rec_vehiculo')?.value;
  if (!id) {
    mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err');
    return;
  }

  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;

  const nuevaFechaItvPasada = document.getElementById('rec_itv_pasada').value;
  const nuevosKmItvPasada = document.getElementById('rec_km_itv_pasada').value;

  const esNuevaItv = nuevaFechaItvPasada &&
    (nuevaFechaItvPasada !== (v.ultItvFecha || '') || nuevosKmItvPasada !== String(v.ultItvKm || ''));

  v.proxMant = document.getElementById('rec_mant').value;
  v.proxKmMant = document.getElementById('rec_km_mant').value;
  v.proxItv = document.getElementById('rec_itv').value;
  v.proxSeguro = document.getElementById('rec_seguro').value;
  v.ultItvFecha = nuevaFechaItvPasada;
  v.ultItvKm = nuevosKmItvPasada;

  if (esNuevaItv && nuevaFechaItvPasada) {
    state.mantenimientos.push({
      id: uid(),
      vehiculoId: id,
      fecha: nuevaFechaItvPasada,
      km: nuevosKmItvPasada,
      tipo: 'type_1',
      taller: '',
      notas: translations[currentLang].itv_nombre,
      manoObra: [],
      repuestos: [],
      totalMano: 0,
      totalRep: 0,
      total: 0
    });
  }

  guardar();
  renderAll();
  cargarRecordatorios();
  mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Datos guardados.' : 'Data saved.', 'ok');
}

function renderTablaRecordatorios() {
  const tbody = document.getElementById('tabla_recordatorios_body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!state.vehiculos.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty">${currentLang === 'es' ? 'Sin vehículos.' : 'No vehicles.'}</td></tr>`;
    return;
  }

  state.vehiculos.forEach(v => {
    tbody.innerHTML += `
      <tr>
        <td>${esc(v.matricula)}</td>
        <td>${esc(formatFecha(v.proxMant))}${v.proxKmMant ? ' / ' + esc(v.proxKmMant) + ' km' : ''}</td>
        <td>${esc(formatFecha(v.proxItv))}</td>
        <td>${esc(formatFecha(v.proxSeguro))}</td>
        <td>
          <button type="button" class="secondary" onclick="seleccionarVehiculoRecordatorio('${v.id}')">${translations[currentLang].editar_btn}</button>
          <button type="button" class="danger" onclick="eliminarRecordatorio('${v.id}')">${translations[currentLang].borrar_btn}</button>
        </td>
      </tr>
    `;
  });
}

function seleccionarVehiculoRecordatorio(id) {
  const sel = document.getElementById('rec_vehiculo');
  if (sel) {
    sel.value = id;
    cargarRecordatorios();
  }
}

function eliminarRecordatorio(id) {
  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;

  if (!confirm(currentLang === 'es'
    ? '¿Borrar los avisos de este vehículo? (Si los tenías en el calendario, quítalos manualmente desde tu app de calendario)'
    : 'Delete this vehicle\'s alerts? (If you had them in your calendar, remove them manually from your calendar app)')) {
    return;
  }

  v.proxMant = '';
  v.proxKmMant = '';
  v.proxItv = '';
  v.proxSeguro = '';
  v.ultItvFecha = '';
  v.ultItvKm = '';

  guardar();
  cargarRecordatorios();
  mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Avisos borrados.' : 'Alerts deleted.', 'ok');
}

// ---------- CALENDARIO (.ICS) ----------
function generarICS(titulo, fecha, descripcion) {
  const dt = fecha.replace(/-/g, '');
  const uidIcs = uid() + '@mypitstop';
  const ahora = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My PitStop//ES',
    'BEGIN:VEVENT',
    'UID:' + uidIcs,
    'DTSTAMP:' + ahora,
    'DTSTART;VALUE=DATE:' + dt,
    'SUMMARY:' + titulo,
    'DESCRIPTION:' + descripcion,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function descargarICS() {
  const id = document.getElementById('rec_vehiculo')?.value;
  if (!id) {
    mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err');
    return;
  }

  const v = state.vehiculos.find(x => x.id === id);
  if (!v) return;

  const eventos = [];

  if (v.proxMant) {
    eventos.push(generarICS(
      `Mantenimiento - ${v.matricula}`,
      v.proxMant,
      `Vehículo: ${v.matricula} - ${v.marca} ${v.modelo}`
    ));
  }

  if (v.proxItv) {
    eventos.push(generarICS(
      `ITV - ${v.matricula}`,
      v.proxItv,
      `Revisión ITV: ${v.matricula}`
    ));
  }

  if (v.proxSeguro) {
    eventos.push(generarICS(
      `Seguro - ${v.matricula}`,
      v.proxSeguro,
      `Vencimiento seguro: ${v.matricula}`
    ));
  }

  if (!eventos.length) {
    mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'No hay fechas para añadir al calendario.' : 'No dates to add.', 'err');
    return;
  }

  eventos.forEach((ics, i) => {
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitstop_evento_${i + 1}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  });

  mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Archivos .ics descargados.' : '.ics files downloaded.', 'ok');
}

// ---------- NOTIFICACIONES ----------
function activarNotificaciones() {
  if (!('Notification' in window)) {
    mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Este navegador no soporta notificaciones.' : 'Browser does not support notifications.', 'err');
    return;
  }

  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Avisos activados.' : 'Alerts activated.', 'ok');
      comprobarAvisos();
    } else {
      mostrarMsg('msg_recordatorios', currentLang === 'es' ? 'Avisos rechazados.' : 'Alerts denied.', 'err');
    }
  });
}

function comprobarAvisos() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  state.vehiculos.forEach(v => {
    const check = (fecha, etiqueta) => {
      if (!fecha) return;
      const f = new Date(fecha);
      if (isNaN(f)) return;

      const diff = Math.ceil((f - hoy) / (1000 * 60 * 60 * 24));

      if (diff >= 0 && diff <= 30) {
        new Notification('My PitStop', {
          body: `${v.matricula}: ${etiqueta} en ${diff} días (${formatFecha(fecha)})`,
          icon: 'logo-192.png'
        });
      }
    };

    check(v.proxMant, currentLang === 'es' ? 'Mantenimiento' : 'Maintenance');
    check(v.proxItv, currentLang === 'es' ? 'ITV' : 'Inspection');
    check(v.proxSeguro, currentLang === 'es' ? 'Seguro' : 'Insurance');
  });
}

// ---------- INFORME / PDF ----------
function toggleModoInforme() {
  const modo = document.getElementById('i_modo')?.value;
  const bloqueFechas = document.getElementById('bloque_fechas');
  const bloqueSel = document.getElementById('bloque_seleccion');

  if (modo === 'seleccion') {
    if (bloqueFechas) bloqueFechas.style.display = 'none';
    if (bloqueSel) bloqueSel.style.display = 'block';
    renderTablaSeleccion();
  } else {
    if (bloqueFechas) bloqueFechas.style.display = 'grid';
    if (bloqueSel) bloqueSel.style.display = 'none';
  }
}

function renderTablaSeleccion() {
  const tbody = document.querySelector('#tabla_seleccion tbody');
  if (!tbody) return;

  const idV = document.getElementById('i_vehiculo')?.value || '';

  let lista = state.mantenimientos;
  if (idV) lista = lista.filter(m => m.vehiculoId === idV);

  lista = [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  tbody.innerHTML = '';

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">${currentLang === 'es' ? 'Sin mantenimientos.' : 'No records.'}</td></tr>`;
    return;
  }

  lista.forEach(m => {
    const tipoTexto = tiposMantenimiento[m.tipo]?.[currentLang] || m.tipo || '';
    const total = Number(m.total || 0) ||
      (m.manoObra || []).reduce((s, o) => s + Number(o.precio || 0), 0) +
      (m.repuestos || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);

    const operaciones = (m.manoObra || []).map(o => o.concepto).join(', ') || '—';

    tbody.innerHTML += `
      <tr>
        <td style="text-align:center;"><input type="checkbox" class="chk-mant" value="${m.id}"></td>
        <td>${esc(formatFecha(m.fecha))}</td>
        <td>${esc(m.km || '—')}</td>
        <td>${esc(tipoTexto)}</td>
        <td>${esc(operaciones)}</td>
        <td>${fmt(total)}</td>
      </tr>
    `;
  });
}

function toggleAllChecks(el) {
  document.querySelectorAll('.chk-mant').forEach(c => c.checked = el.checked);
}

function generarPDF(modo) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');

  const idV = document.getElementById('i_vehiculo')?.value || '';
  const v = state.vehiculos.find(x => x.id === idV);

  if (!v) {
    mostrarMsg('msg_informe', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err');
    return;
  }

  const modoSel = document.getElementById('i_modo')?.value || 'fechas';
  const tipoInforme = document.getElementById('i_tipo_informe')?.value || 'detallado';
  const iva = parseFloat(document.getElementById('i_iva')?.value) || 0;

  let lista = [];

  if (modoSel === 'fechas') {
    const desde = document.getElementById('i_desde').value;
    const hasta = document.getElementById('i_hasta').value;

    lista = state.mantenimientos.filter(m => {
      if (m.vehiculoId !== idV) return false;
      if (desde && m.fecha < desde) return false;
      if (hasta && m.fecha > hasta) return false;
      return true;
    });
  } else {
    const checks = [...document.querySelectorAll('.chk-mant:checked')].map(c => c.value);
    lista = state.mantenimientos.filter(m => checks.includes(m.id));
  }

  lista.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  if (!lista.length) {
    mostrarMsg('msg_informe', currentLang === 'es' ? 'Sin mantenimientos para el informe.' : 'No records for the report.', 'err');
    return;
  }

  const esDetallado = tipoInforme === 'detallado';

  let y = 20;

  pdf.setFontSize(18);
  pdf.setTextColor(225, 29, 72);
  pdf.text(esDetallado ? translations[currentLang].pdf_informe : translations[currentLang].historico, 15, y);
  y += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${translations[currentLang].pdf_vehiculo} ${v.marca} ${v.modelo}`, 15, y);
  y += 5;
  pdf.text(`${translations[currentLang].pdf_matricula} ${v.matricula}`, 15, y);
  y += 5;
  pdf.text(`${translations[currentLang].pdf_bastidor} ${v.bastidor || '—'}`, 15, y);
  y += 5;
  pdf.text(`${translations[currentLang].pdf_fecha_inf} ${new Date().toLocaleDateString()}`, 15, y);
  y += 8;

  let totalManoGlobal = 0;
  let totalRepGlobal = 0;

  lista.forEach((m, idx) => {
    if (y > 250) { pdf.addPage(); y = 20; }

    const tipoTexto = tiposMantenimiento[m.tipo]?.[currentLang] || m.tipo || '';

    pdf.setFontSize(11);
    pdf.setTextColor(225, 29, 72);
    pdf.text(`${idx + 1}. ${formatFecha(m.fecha)} - ${tipoTexto}`, 15, y);
    y += 5;

    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    if (m.km) { pdf.text(`Kms: ${m.km}`, 15, y); y += 4; }
    if (m.taller) { pdf.text(`${translations[currentLang].pdf_taller_txt} ${m.taller}`, 15, y); y += 4; }
    if (m.notas) { pdf.text(`${m.notas}`, 15, y); y += 4; }

    if (esDetallado) {
      const mano = m.manoObra || [];
      const rep = m.repuestos || [];

      if (mano.length) {
        if (y > 260) { pdf.addPage(); y = 20; }
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.text(translations[currentLang].pdf_mano_obra + ':', 18, y);
        y += 4;
        mano.forEach(o => {
          if (y > 270) { pdf.addPage(); y = 20; }
          pdf.text(`  - ${o.concepto}`, 20, y);
          pdf.text(fmt(o.precio), 180, y, { align: 'right' });
          y += 4;
          totalManoGlobal += Number(o.precio || 0);
        });
      }

      if (rep.length) {
        if (y > 260) { pdf.addPage(); y = 20; }
        pdf.setTextColor(0, 0, 0);
        pdf.text(translations[currentLang].pdf_repuestos + ':', 18, y);
        y += 4;
        rep.forEach(r => {
          if (y > 270) { pdf.addPage(); y = 20; }
          const tot = Number(r.cant || 0) * Number(r.precio || 0);
          pdf.text(`  - ${r.cant}x ${r.desc}`, 20, y);
          pdf.text(fmt(tot), 180, y, { align: 'right' });
          y += 4;
          totalRepGlobal += tot;
        });
      }
    }

    y += 4;
  });

  if (esDetallado) {
    if (y > 240) { pdf.addPage(); y = 20; }

    const base = totalManoGlobal + totalRepGlobal;
    const ivaImporte = base * (iva / 100);
    const totalFinal = base + ivaImporte;

    y += 5;
    pdf.setDrawColor(200);
    pdf.line(15, y, 195, y);
    y += 6;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${translations[currentLang].pdf_base} ${fmt(base)}`, 180, y, { align: 'right' });
    y += 5;
    pdf.text(`${translations[currentLang].pdf_iva} (${iva}%): ${fmt(ivaImporte)}`, 180, y, { align: 'right' });
    y += 6;

    pdf.setFontSize(12);
    pdf.setTextColor(225, 29, 72);
    pdf.text(`${translations[currentLang].pdf_total} ${fmt(totalFinal)}`, 180, y, { align: 'right' });
    y += 10;
  }

  if (firmaGuardada) {
    if (y > 200) { pdf.addPage(); y = 20; }
    y += 5;
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(translations[currentLang].pdf_firma, 15, y);
    y += 4;
    pdf.addImage(firmaGuardada, 'PNG', 15, y, 60, 25);
  }

  const nombre = `informe_${v.matricula}_${Date.now()}.pdf`;
  pdf.save(nombre);

  if (modo === 'share' && navigator.share) {
    navigator.share({
      title: translations[currentLang].email_asunto_informe,
      text: translations[currentLang].email_cuerpo_informe
    }).catch(() => {});
  } else {
    mostrarMsg('msg_informe', currentLang === 'es' ? 'PDF generado.' : 'PDF generated.', 'ok');
  }
}

// ---------- EXPORTAR EXCEL ----------
function exportarExcel() {
  const idV = document.getElementById('i_vehiculo')?.value || '';
  const v = state.vehiculos.find(x => x.id === idV);

  if (!v) {
    mostrarMsg('msg_informe', currentLang === 'es' ? 'Selecciona un vehículo.' : 'Select a vehicle.', 'err');
    return;
  }

  const lista = state.mantenimientos
    .filter(m => m.vehiculoId === idV)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  let csv = 'Fecha;Kms;Tipo;Taller;Operaciones;Mano;Repuestos;Total\n';

  lista.forEach(m => {
    const tipo = tiposMantenimiento[m.tipo]?.[currentLang] || m.tipo || '';
    const mano = (m.manoObra || []).reduce((s, o) => s + Number(o.precio || 0), 0);
    const rep = (m.repuestos || []).reduce((s, r) => s + Number(r.cant || 0) * Number(r.precio || 0), 0);
    const ops = (m.manoObra || []).map(o => o.concepto).join(' | ');

    csv += `${formatFecha(m.fecha)};${m.km || ''};${tipo};${m.taller || ''};${ops};${mano.toFixed(2)};${rep.toFixed(2)};${(mano + rep).toFixed(2)}\n`;
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mantenimientos_${v.matricula}.csv`;
  a.click();
  URL.revokeObjectURL(url);

  mostrarMsg('msg_informe', currentLang === 'es' ? 'Excel exportado.' : 'Excel exported.', 'ok');
}

// ---------- BACKUP ----------
function exportarJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_pitstop_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarMsg('msg_backup', currentLang === 'es' ? 'Copia exportada.' : 'Backup exported.', 'ok');
}

function importarJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const datos = JSON.parse(e.target.result);

      if (!datos.vehiculos || !datos.mantenimientos) {
        throw new Error('Estructura inválida');
      }

      state = datos;
      if (!state.catalogoFotos) state.catalogoFotos = [];
      if (!state.author) state.author = 'J.Blázquez';
      if (!state.themeAccent) state.themeAccent = 'rojo';
      if (!state.themeMachine) state.themeMachine = 'carbono';

      guardar();
      actualizarAutor(state.author);
      aplicarTemaColores();
      renderAll();
      cargarRecordatorios();

      const inputAuthor = document.getElementById('input-author');
      if (inputAuthor) inputAuthor.value = state.author;

      mostrarMsg('msg_backup', currentLang === 'es' ? 'Copia importada.' : 'Backup imported.', 'ok');
    } catch (err) {
      mostrarMsg('msg_backup', currentLang === 'es' ? 'Archivo inválido.' : 'Invalid file.', 'err');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function borrarTodo() {
  const texto = currentLang === 'es'
    ? '¿Borrar TODOS los datos? Esto no se puede deshacer.'
    : 'Delete ALL data? This cannot be undone.';

  if (!confirm(texto)) return;

  state = { vehiculos: [], mantenimientos: [], catalogoFotos: [], author: 'J.Blázquez', themeAccent: 'rojo', themeMachine: 'carbono' };
  guardar();
  actualizarAutor('J.Blázquez');
  aplicarTemaColores();
  renderAll();
  mostrarMsg('msg_backup', currentLang === 'es' ? 'Datos borrados.' : 'Data deleted.', 'ok');
}

// ---------- INIT ----------
window.addEventListener('DOMContentLoaded', () => {
  const idiomaGuardado = localStorage.getItem('pitstop_idioma') || 'es';
  currentLang = idiomaGuardado;

  cargar();
  cargarTema();
  encenderMaquina();
  aplicarTemaColores();

  setLanguage(currentLang);

  const inputAuthor = document.getElementById('input-author');
  if (inputAuthor) inputAuthor.value = state.author;

  const btnCancelar = document.getElementById('btn-cancelar');
  if (btnCancelar) btnCancelar.style.display = 'none';

  const elTotalMano = document.getElementById('total_mano');
  const elTotalRep = document.getElementById('total_repuestos');
  if (elTotalMano) elTotalMano.textContent = '0.00 €';
  if (elTotalRep) elTotalRep.textContent = '0.00 €';

  toggleModoInforme();

  setTimeout(() => comprobarAvisos(), 2000);
});

// Re-exponer todas las funciones usadas en onclick/onchange del HTML
Object.assign(window, {
  addVehiculo,
  eliminarVehiculo,
  addManoObra,
  eliminarManoObra,
  addRepuesto,
  eliminarRepuesto,
  guardarMantenimiento,
  editarMantenimiento,
  cancelarEdicion,
  eliminarMantenimiento,
  abrirModal,
  cerrarModal,
  abrirModalHistorico,
  cerrarModalHistorico,
  cambiarVehiculoHistorico,
  abrirModalFirma,
  cerrarModalFirma,
  limpiarFirma,
  guardarFirma,
  toggleTema,
  setLanguage,
  cargarRecordatorios,
  guardarRecordatorio,
  descargarICS,
  activarNotificaciones,
  seleccionarVehiculoRecordatorio,
  eliminarRecordatorio,
  renderGrafico,
  cargarGastosFijos,
  guardarGastosFijos,
  exportarGraficoPDF,
  generarPDF,
  exportarExcel,
  toggleModoInforme,
  renderTablaSeleccion,
  toggleAllChecks,
  exportarJSON,
  importarJSON,
  borrarTodo,
  actualizarAutor,
  cambiarColorAcento,
  cambiarColorMaquina,
  comprobarAvisos
});
