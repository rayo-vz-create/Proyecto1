// --- CONFIGURACIÓN DE SEGURIDAD ---
const CLAVE_SECRETA = "ViajeGO_Secure_Key_2026"; 

let currentItem = null;
let currentType = '';
let modalInstance = null;
let allServicesData = []; 

// --- DEFINICIÓN DE MULTIPLICADORES BASE ---
const PRECIOS_EXTRA = {
    // Vuelos y Buses
    'Estándar': 1.0,
    'Ejecutiva': 1.5,
    'Ejecutivo': 1.5,
    'Primera': 2.0,
    'Lujo': 2.0,
    // Hoteles
    'Estándar': 1.0,
    'Doble': 1.5,
    'Suite': 2.5
};

document.addEventListener('DOMContentLoaded', () => {
    // Carga dinámica de CryptoJS si no existe en el HTML
    if (typeof CryptoJS === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js";
        document.head.appendChild(script);
    }

    checkLogin();
    
    const tabs = document.querySelectorAll('#catalogoTabs button');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (event) => {
            const tipo = event.target.id.replace('-tab', '');
            cargarServicio(tipo);
        });
    });

    if (document.getElementById('vuelos-container')) {
        cargarServicio('vuelos');
    } else if (document.getElementById('lista-reservas')) {
        cargarMisViajes();
    }

    const cardExp = document.getElementById('cardExp');
    if(cardExp) cardExp.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2, 4);
        e.target.value = val;
    });
    const cardCvv = document.getElementById('cardCvv');
    if(cardCvv) cardCvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
});

// --- FILTRADO ---
function aplicarFiltros() {
    const texto = document.getElementById('filtroDestino').value.toLowerCase();
    const filtrados = allServicesData.filter(item => {
        if (currentType === 'vuelos') {
            return item.destino_iata.toLowerCase().includes(texto) || item.origen_iata.toLowerCase().includes(texto) || item.aerolinea.toLowerCase().includes(texto);
        } else if (currentType === 'hoteles') {
            return item.ciudad.toLowerCase().includes(texto) || item.nombre.toLowerCase().includes(texto);
        } else if (currentType === 'autobuses') {
            return item.destino.toLowerCase().includes(texto) || item.origen.toLowerCase().includes(texto);
        }
        return false;
    });
    renderizarTarjetas(filtrados);
}

function limpiarFiltros() {
    if(document.getElementById('filtroDestino')) document.getElementById('filtroDestino').value = '';
    renderizarTarjetas(allServicesData);
}

function limpiarFiltrosInputs() {
    if(document.getElementById('filtroDestino')) document.getElementById('filtroDestino').value = '';
}

// --- CARGA Y RENDERIZADO ---
async function cargarServicio(tipo) {
    currentType = tipo;
    const contenedor = document.getElementById(`${tipo}-container`);
    if(!contenedor) return;
    
    contenedor.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-danger"></div><p class="mt-2 text-secondary">Cargando...</p></div>';
    limpiarFiltrosInputs();

    try {
        const res = await fetch(`/api/${tipo}`);
        const datos = await res.json();
        allServicesData = datos;
        renderizarTarjetas(datos);
    } catch (e) { 
        console.error(e);
        contenedor.innerHTML = '<div class="col-12 text-center text-danger py-5">Error de conexión.</div>';
    }
}

function renderizarTarjetas(datos) {
    const contenedor = document.getElementById(`${currentType}-container`);
    
    if (!datos.length) { 
        contenedor.innerHTML = `<div class="col-12 text-center py-5"><i class="fas fa-search fa-3x text-secondary mb-3 opacity-50"></i><h4 class="text-white">No se encontraron resultados</h4></div>`; 
        return; 
    }

    let html = '';
    datos.forEach(item => {
        let nombre, desc, detalles, icono;
        const precioF = parseFloat(item.precio || item.precio_noche).toLocaleString('en-US', {minimumFractionDigits: 2});

        if (currentType === 'vuelos') {
            nombre = item.aerolinea;
            desc = `${item.origen_iata} <i class="fas fa-arrow-right text-danger mx-1"></i> ${item.destino_iata}`;
            detalles = `<small><i class="fas fa-plane-departure text-secondary"></i> ${new Date(item.fecha_salida).toLocaleString()}</small>`;
            icono = 'plane';
        } else if (currentType === 'hoteles') {
            nombre = item.nombre;
            desc = `<i class="fas fa-map-marker-alt text-danger"></i> ${item.ciudad}`;
            detalles = `<small class="text-warning">${'★'.repeat(item.estrellas)}</small>`;
            icono = 'hotel';
        } else {
            nombre = item.linea_autobus;
            desc = `${item.origen} <i class="fas fa-arrow-right text-danger mx-1"></i> ${item.destino}`;
            detalles = `<small><i class="far fa-clock text-secondary"></i> ${new Date(item.fecha_salida).toLocaleString()}</small>`;
            icono = 'bus';
        }

        const nombreAgencia = item.nombre_agencia || 'ViajeGO Oficial';
        const itemString = encodeURIComponent(JSON.stringify(item));
        
        html += `
        <div class="col">
            <div class="card h-100 bg-dark border border-secondary text-white shadow-sm card-hover" style="background-color: #1a1a1a !important;">
                <div class="position-absolute top-0 end-0 m-2 badge bg-black bg-opacity-75 border border-secondary text-light shadow-sm">
                    <i class="fas fa-building text-danger me-1"></i> ${nombreAgencia}
                </div>
                <div class="card-body mt-2">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-danger bg-opacity-10 p-3 rounded-circle me-3 text-danger d-flex align-items-center justify-content-center" style="width:50px; height:50px;">
                            <i class="fas fa-${icono} fa-lg"></i>
                        </div>
                        <h5 class="card-title mb-0 fw-bold text-truncate">${nombre}</h5>
                    </div>
                    <p class="card-text mb-2 fw-bold fs-5">${desc}</p>
                    <div class="mb-4">${detalles}</div>
                    <div class="d-flex justify-content-between align-items-end mt-auto pt-3 border-top border-secondary border-opacity-25">
                        <div><small class="text-secondary text-uppercase" style="font-size:0.7rem">Precio desde</small><h4 class="fw-bold text-white mb-0">$${precioF}</h4></div>
                        <button class="btn btn-outline-danger btn-sm fw-bold px-4 rounded-pill" onclick="abrirModal('${currentType}', '${itemString}')">Ver Detalles</button>
                    </div>
                </div>
            </div>
        </div>`;
    });
    contenedor.innerHTML = html;
}

// --- MODAL DINÁMICO ---
function abrirModal(tipo, itemString) {
    if (!localStorage.getItem('user')) { alert("Debes iniciar sesión para reservar."); window.location.href = 'login.html'; return; }
    currentItem = JSON.parse(decodeURIComponent(itemString));
    
    const fieldsDiv = document.getElementById('dynamicFields');
    document.getElementById('modalTitle').innerText = `Reservar: ${currentItem.nombre || currentItem.aerolinea || currentItem.linea_autobus}`;
    
    let html = '';
    const today = new Date().toISOString().split('T')[0];
    const safeDate = (d) => { try { return new Date(d).toISOString().split('T')[0]; } catch(e){ return today; } };

    const opcionesStr = currentItem.clase_base || currentItem.tipo_habitacion || currentItem.tipo_asiento || 'Estándar';
    const opcionesArr = opcionesStr.split(',');

    let optionsHtml = '';
    opcionesArr.forEach(opt => {
        const key = opt.trim();
        const mult = PRECIOS_EXTRA[key] || 1.0;
        optionsHtml += `<option value="${key}" data-mult="${mult}">${key} (x${mult})</option>`;
    });

    if (tipo === 'hoteles') {
        html = `
        <div class="row g-3">
            <div class="col-6"><label class="text-secondary small">Entrada</label><input type="date" id="dateStart" class="form-control bg-black text-white border-secondary" min="${today}" onchange="calcTotal()"></div>
            <div class="col-6"><label class="text-secondary small">Salida</label><input type="date" id="dateEnd" class="form-control bg-black text-white border-secondary" min="${today}" onchange="calcTotal()"></div>
            <div class="col-6"><label class="text-secondary small">Habitación</label>
                <select id="optionSelect" class="form-select bg-black text-white border-secondary" onchange="calcTotal()">
                    ${optionsHtml}
                </select>
            </div>
            <div class="col-6"><label class="text-secondary small">Huéspedes</label><input type="number" id="guests" class="form-control bg-black text-white border-secondary" value="2" min="1" max="4" onchange="calcTotal()"></div>
        </div>`;
    } else {
        const rawStart = safeDate(currentItem.fecha_salida);
        const rawEnd = safeDate(currentItem.fecha_regreso_llegada);

        html = `
        <div class="alert alert-dark border-secondary text-info mb-3"><i class="fas fa-info-circle"></i> Fechas fijas programadas.</div>
        <div class="row g-3">
            <div class="col-6"><label class="text-secondary small">Clase / Asiento</label>
                <select id="optionSelect" class="form-select bg-black text-white border-secondary" onchange="calcTotal()">
                    ${optionsHtml}
                </select>
            </div>
            <div class="col-6"><label class="text-secondary small">Pasajeros</label><input type="number" id="guests" class="form-control bg-black text-white border-secondary" value="1" min="1" max="10" onchange="calcTotal()"></div>
            <input type="hidden" id="dateStart" value="${rawStart}">
            <input type="hidden" id="dateEnd" value="${rawEnd}">
        </div>`;
    }

    fieldsDiv.innerHTML = html;
    document.getElementById('totalPriceDisplay').innerText = '$0.00';
    if(tipo !== 'hoteles') calcTotal(); 
    modalInstance = new bootstrap.Modal(document.getElementById('bookingModal'));
    modalInstance.show();
}

function calcTotal() {
    let total = 0;
    const guests = parseInt(document.getElementById('guests').value) || 1;
    const select = document.getElementById('optionSelect');
    const mult = parseFloat(select.selectedOptions[0].dataset.mult || 1);

    if (currentType === 'hoteles') {
        const basePrice = parseFloat(currentItem.precio_noche);
        const startVal = document.getElementById('dateStart').value;
        const endVal = document.getElementById('dateEnd').value;
        if (startVal && endVal) {
            const start = new Date(startVal);
            const end = new Date(endVal);
            if (end > start) {
                const days = Math.ceil(Math.abs(end - start) / 86400000);
                total = basePrice * mult * days * guests;
            }
        }
    } else {
        total = parseFloat(currentItem.precio) * mult * guests;
    }
    document.getElementById('totalPriceDisplay').innerText = `$${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
}

// --- SESIÓN ---
function checkLogin() {
    const userStr = localStorage.getItem('user');
    const authContainer = document.getElementById('auth-buttons');
    if (!authContainer) return; 
    
    // CORRECCIÓN: Validamos que userStr exista y no sea la palabra "undefined"
    if (userStr && userStr !== "undefined") {
        try {
            const user = JSON.parse(userStr);
            let html = `<span class="text-white me-3 small">Hola, <b>${user.nombre || user.nombre_comercial}</b></span>`;
            if(user.rol === 'admin') html += `<a href="adminPanel.html" class="btn btn-sm btn-warning me-2 fw-bold">Admin</a>`;
            else if(user.rol === 'agencia') html += `<a href="servicesPanel.html" class="btn btn-sm btn-warning me-2 fw-bold">Panel</a>`;
            html += `<a href="perfil.html" class="btn btn-sm btn-outline-danger me-2">Perfil</a>`;
            html += `<a href="mis_viajes.html" class="btn btn-sm btn-outline-light me-2">Mis Viajes</a>`;
            html += `<button onclick="logout()" class="btn btn-sm btn-danger"><i class="fas fa-sign-out-alt"></i></button>`;
            authContainer.innerHTML = html;
        } catch (e) {
            // Si el JSON está mal, limpiamos para evitar el bucle de error
            console.error("Error parseando usuario:", e);
            localStorage.removeItem('user');
        }
    } else {
        authContainer.innerHTML = `<a href="login.html" class="text-secondary text-decoration-none small me-3">Ingresar</a><a href="registro.html" class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold">Registro</a>`;
    }
}

function logout() { localStorage.removeItem('user'); window.location.href = 'index.html'; }

// --- NUEVA FUNCIÓN PARA REGISTRO SEGURO (MISAEL) ---
async function registrarUsuario(event) {
    if(event) event.preventDefault();
    const nombre = document.getElementById('regNombre').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const datos = { nombre, email, password };
    const key = CryptoJS.enc.Utf8.parse(CLAVE_SECRETA.padEnd(32, '0').substring(0, 32));
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(datos), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    try {
        const res = await fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_data: encrypted })
        });
        const data = await res.json();
        if (data.success) {
            alert("✅ Registro exitoso. ¡Bienvenido!");
            window.location.href = 'login.html';
        } else {
            alert("❌ Error: " + data.message);
        }
    } catch (e) {
        console.error("Error:", e);
        alert("Error de conexión al registrar.");
    }
}

// --- NUEVA FUNCIÓN PARA LOGIN ENCRIPTADO (ACTUALIZADA) ---
async function enviarLoginSeguro(email, password) {
    const credenciales = { email: email, password: password };
    const key = CryptoJS.enc.Utf8.parse(CLAVE_SECRETA.padEnd(32, '0').substring(0, 32));

    const datosCifrados = CryptoJS.AES.encrypt(JSON.stringify(credenciales), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted_data: datosCifrados })
        });
        const data = await res.json();

        if (data.success || data.encrypted_response) {
            let finalData = data;
            if (data.encrypted_response) {
                const bytes = CryptoJS.AES.decrypt(data.encrypted_response, key, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                });
                finalData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            }

            if (finalData.success) {
                localStorage.setItem('user', JSON.stringify(finalData.user));
                localStorage.setItem('token', finalData.token);
                localStorage.setItem('csrf_token', finalData.csrf_token); 
                console.log("🛡️ Login exitoso: JWT y CSRF Token guardados.");
            }
            return finalData;
        }
        return data;
    } catch (e) {
        console.error("Error en login seguro", e);
        return { success: false, message: "Error de conexión" };
    }
}

// --- PROCESAR PAGO (CON ENCRIPTACIÓN PARA BURP SUITE Y SOPORTE PYTHON) ---
async function procesarPago() {
    if(document.getElementById('cardNum').value.length < 16) return alert("Tarjeta inválida");
    const total = parseFloat(document.getElementById('totalPriceDisplay').innerText.replace(/[$,]/g, ''));
    if(total <= 0) return alert("Total inválido");

    const user = JSON.parse(localStorage.getItem('user'));
    const csrfToken = localStorage.getItem('csrf_token');
    const jwtToken = localStorage.getItem('token');

    const payload = {
        user_id: user.id,
        service_type: currentType,
        item_name: currentItem.nombre || currentItem.aerolinea || currentItem.linea_autobus,
        date_start: document.getElementById('dateStart').value,
        date_end: document.getElementById('dateEnd').value,
        num_guests: document.getElementById('guests').value,
        details: { opcion: document.getElementById('optionSelect').value },
        total_price: total
    };

    const key = CryptoJS.enc.Utf8.parse(CLAVE_SECRETA.padEnd(32, '0').substring(0, 32));
    const datosCifrados = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    try {
        const res = await fetch('/api/reservas', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRF-Token': csrfToken 
            }, 
            body: JSON.stringify({ encrypted_data: datosCifrados }) 
        });

        if (res.status === 403) {
            alert("⚠️ Error de seguridad: Token CSRF no válido o ausente.");
            return;
        }

        const data = await res.json();
        if(data.success) { 
            alert("¡Reserva Exitosa y Protegida con CSRF!"); 
            modalInstance.hide(); 
            window.location.href = 'mis_viajes.html'; 
        }
    } catch(e) { 
        console.error(e);
        alert("Error de conexión"); 
    }
}

// --- MIS VIAJES Y CANCELACIONES ---
async function cargarMisViajes() {
    const user = JSON.parse(localStorage.getItem('user'));
    if(!user) return;
    const container = document.getElementById('lista-reservas');
    if(!container) return;
    try {
        const res = await fetch(`/api/mis_reservas/${user.id}`);
        const reservas = await res.json();
        container.innerHTML = reservas.map(r => `
            <div class="col-md-6 mb-3">
                <div class="card bg-dark border-secondary text-white">
                    <div class="card-body">
                        <h5>${r.item_name}</h5>
                        <p class="text-success fw-bold">$${parseFloat(r.total_price).toLocaleString()}</p>
                        ${r.status !== 'Cancelado' ? `<button class="btn btn-sm btn-danger" onclick="cancelarReserva(${r.id})">Cancelar</button>` : '<span class="badge bg-danger">Cancelado</span>'}
                    </div>
                </div>
            </div>`).join('');
    } catch(e) { console.error(e); }
}

async function cancelarReserva(id) {
    if(confirm("¿Cancelar esta reserva? (Reembolso 30%)")) {
        const csrfToken = localStorage.getItem('csrf_token');
        const jwtToken = localStorage.getItem('token');
        
        try {
            const res = await fetch(`/api/reservas/cancelar/${id}`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                    'X-CSRF-Token': csrfToken
                }
            });
            const data = await res.json();
            if(data.success) {
                alert(`Cancelación exitosa. Reembolso: $${data.reembolso}`);
                location.reload();
            }
        } catch(e) {
            console.error(e);
            alert("Error al cancelar");
        }
    }
}

// --- 2FA LOGIC ---
let temporalSecret = "";
async function abrirConfigurar2FA() {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch('/api/generate-2fa', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
    });
    const data = await response.json();
    temporalSecret = data.secret;
    const secretDisplay = document.getElementById('2fa-secret-display');
    if(secretDisplay) secretDisplay.innerText = temporalSecret;
    const modal2fa = document.getElementById('modal2FA');
    if(modal2fa) modal2fa.style.display = 'block';
}

function cerrarModal2FA() {
    const modal2fa = document.getElementById('modal2FA');
    if(modal2fa) modal2fa.style.display = 'none';
}

async function verificar2FA() {
    const tokenInput = document.getElementById('2fa-token-input');
    const token = tokenInput ? tokenInput.value : "";
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await fetch('/api/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: token, user_id: user.id })
    });
    const data = await response.json();
    if (data.success) { 
        localStorage.setItem('token', data.token); 
        alert("¡2FA Verificado!"); 
        location.reload(); 
    } else {
        alert("Código incorrecto");
    }
}