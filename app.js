// ===== CONFIGURACIÓN GLOBAL =====

const CONFIG = {
    STORAGE_KEY: 'alfa_casos',
    DEMO_KEY: 'alfa_demo_loaded',
    ROLE_KEY: 'alfa_role',
    PIN_PLANEADOR: '1234',
    PIN_ADMIN: '9307',
    IA_LIMIT: 5,
    IA_USED_KEY: 'alfa_ia_used_today',
    IA_DATE_KEY: 'alfa_ia_date',
};

let currentRole = 'tecnico';
let uploadedImages = [];
let iaUsedToday = 0;

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', () => {
    loadRole();
    loadData();
    initializeEvents();
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
    checkIALimit();
    loadResumen();
});

// ===== GESTIÓN DE ROLES =====

function loadRole() {
    const savedRole = localStorage.getItem(CONFIG.ROLE_KEY) || 'tecnico';
    setRole(savedRole);
}

function setRole(role) {
    currentRole = role;
    localStorage.setItem(CONFIG.ROLE_KEY, role);
    updateUIByRole();
}

function updateUIByRole() {
    const avatarMap = { tecnico: 'T', planeador: 'P', admin: 'A' };
    const roleNameMap = { tecnico: 'Técnico', planeador: 'Planeador', admin: 'Administrador' };
    const roleDescMap = { tecnico: 'Consulta', planeador: 'Registra', admin: 'Control Total' };

    document.getElementById('userAvatar').textContent = avatarMap[currentRole];
    document.getElementById('userName').textContent = roleNameMap[currentRole];
    document.getElementById('userRole').textContent = roleDescMap[currentRole];

    // Mostrar/ocultar secciones por rol
    document.querySelector('[data-page="registrar"]').style.display = 
        (currentRole === 'tecnico') ? 'none' : 'block';
    
    document.getElementById('adminBtn').style.display = 
        (currentRole === 'admin') ? 'block' : 'none';

    // Proteger eliminar en base de conocimiento
    updateBaseTable();
}

// ===== UTILIDADES DE ALMACENAMIENTO =====

function loadData() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!data) {
        loadDemoData();
    }
}

function getCasos() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveCasos(casos) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(casos));
}

function loadDemoData() {
    const casos = [
        {
            id: 'demo-001',
            fecha: '2024-01-15',
            planta: 'P7',
            area: 'Producción',
            maquina: 'Variador de Frecuencia',
            codigoEquipo: 'EQ-VAR-001',
            componente: 'Variador',
            descripcion: 'Variador presentaba alarma de temperatura elevada, deteniéndose cada 2 horas',
            sintomas: 'LED rojo intermitente, alarma acústica, parada de emergencia automática',
            causaRaiz: 'Acumulación de polvo en disipador de calor, ventilador obstruido',
            accionCorrectiva: 'Limpieza profunda del disipador, reemplazo de ventilador, verificación de flujo de aire',
            repuestos: 'Ventilador ABB 24VDC, 2 kg de aire comprimido',
            tiempoParada: 4.5,
            tiempoReparacion: 2.5,
            criticidad: 'Crítica',
            ordenTrabajo: 'OT-2024-001',
            responsable: 'Juan Pérez',
            solucionEfectiva: 'Sí',
            leccionAprendida: 'La limpieza preventiva mensual del variador reduce el 80% de fallos térmicos',
            recomendacionPreventiva: 'Implementar rutina de limpieza mensual, verificar ventilación cada trimestre',
            imagenes: [],
        },
        {
            id: 'demo-002',
            fecha: '2024-01-18',
            planta: 'P1',
            area: 'Envasado',
            maquina: 'Llenadora Automática',
            codigoEquipo: 'EQ-LLE-002',
            componente: 'Microswitch de Guarda',
            descripcion: 'Microswitch intermitente causaba paradas falsas de máquina llenadora',
            sintomas: 'Paradas aleatorias sin que hubiera problema, reseteo manual requerido',
            causaRaiz: 'Microswitch defectuoso con mal contacto, oxidación en terminales',
            accionCorrectiva: 'Reemplazo completo del microswitch, limpieza de terminales, reajuste mecánico',
            repuestos: 'Microswitch Honeywell HE3000, conectores plateados',
            tiempoParada: 3.0,
            tiempoReparacion: 1.5,
            criticidad: 'Alta',
            ordenTrabajo: 'OT-2024-002',
            responsable: 'María García',
            solucionEfectiva: 'Sí',
            leccionAprendida: 'Los microswitches de seguridad deben testearse bajo carga antes de validar',
            recomendacionPreventiva: 'Realizar test de continuidad mensual, reemplazar cada 2 años preventivamente',
            imagenes: [],
        },
        {
            id: 'demo-003',
            fecha: '2024-01-20',
            planta: 'P7',
            area: 'Utilidades',
            maquina: 'Motor Trifásico Compresor',
            codigoEquipo: 'EQ-MOT-003',
            componente: 'Motor Eléctrico',
            descripcion: 'Motor presentaba alto amperaje y vibración anormal',
            sintomas: 'Consumo elevado de corriente, vibración perceptible, ruido anormal',
            causaRaiz: 'Cojinete deteriorado, desalineación del eje con compresor',
            accionCorrectiva: 'Reemplazo de cojinetes, alineación láser del motor-compresor, ajuste de anclajes',
            repuestos: 'Cojinetes NSK 6205-2RS, acoplamiento elástico, tornillos de anclaje M20',
            tiempoParada: 8.0,
            tiempoReparacion: 4.0,
            criticidad: 'Crítica',
            ordenTrabajo: 'OT-2024-003',
            responsable: 'Carlos López',
            solucionEfectiva: 'Sí',
            leccionAprendida: 'La vibración es indicador temprano de falla de cojinete, intervenir antes de ruptura',
            recomendacionPreventiva: 'Monitoreo trimestral con medidor de vibración, cambio de cojinetes cada 3 años',
            imagenes: [],
        },
        {
            id: 'demo-004',
            fecha: '2024-01-22',
            planta: 'P1',
            area: 'Hornos',
            maquina: 'Horno de Secado Industrial',
            codigoEquipo: 'EQ-HOR-004',
            componente: 'Sensor de Temperatura',
            descripcion: 'Horno no alcanzaba temperatura de consigna, presentaba lecturas incorrectas',
            sintomas: 'Temperatura real inferior a lectura, producto mal secado, alarma de baja temperatura',
            causaRaiz: 'Sensor PT100 descalibrado y con depósitos en vaina protectora',
            accionCorrectiva: 'Extracción y limpieza del sensor, calibración en laboratorio, reinstalación',
            repuestos: 'Sensor PT100 Pt Rtd, pasta térmica de alta temperatura',
            tiempoParada: 6.0,
            tiempoReparacion: 2.0,
            criticidad: 'Alta',
            ordenTrabajo: 'OT-2024-004',
            responsable: 'Roberto Sánchez',
            solucionEfectiva: 'Sí',
            leccionAprendida: 'Los sensores requieren limpieza periódica y calibración anual para precisión',
            recomendacionPreventiva: 'Calibración anual de sensores, inspección visual trimestral, uso de vaina protectora',
            imagenes: [],
        },
        {
            id: 'demo-005',
            fecha: '2024-01-25',
            planta: 'P7',
            area: 'Producción',
            maquina: 'Sensor Inductivo Proxim',
            codigoEquipo: 'EQ-SEN-005',
            componente: 'Sensor Inductivo',
            descripcion: 'Sensor presenta falsos disparos causando conteos errados',
            sintomas: 'Señal intermitente, conteo duplicado, alarma aleatoria de producción',
            causaRaiz: 'Suciedad metálica acumulada en cara del sensor, desalineación respecto a target',
            accionCorrectiva: 'Limpieza del sensor, realineación, ajuste de distancia de activación',
            repuestos: 'Lente protectora para sensor, cinta de posicionamiento',
            tiempoParada: 2.0,
            tiempoReparacion: 0.75,
            criticidad: 'Media',
            ordenTrabajo: 'OT-2024-005',
            responsable: 'Ana Martínez',
            solucionEfectiva: 'Sí',
            leccionAprendida: 'Los sensores inductivos deben estar libres de ferromagnéticos en el radio de acción',
            recomendacionPreventiva: 'Limpieza semanal de lentes sensores, inspección de ferromagnéticos cercanos',
            imagenes: [],
        },
        {
            id: 'demo-006',
            fecha: '2024-01-28',
            planta: 'P1',
            area: 'Bobinado',
            maquina: 'Devanador Eléctrico',
            codigoEquipo: 'EQ-DEV-006',
            componente: 'Cojinete y Transmisión',
            descripcion: 'Devanador producía ruido y vibración en operación',
            sintomas: 'Ruido metálico intermitente, vibración en bastidor, olor a quemado',
            causaRaiz: 'Cojinete frontal desgastado, desalineación en transmisión de correas',
            accionCorrectiva: 'Reemplazo de cojinete, alineación de poleas, tensionado de correas',
            repuestos: 'Cojinete Timken, correa trapezoidal B50, aceite SAE 40 para cojinetes',
            tiempoParada: 5.0,
            tiempoReparacion: 3.0,
            criticidad: 'Alta',
            ordenTrabajo: 'OT-2024-006',
            responsable: 'Felipe Rodríguez',
            solucionEfectiva: 'Parcial',
            leccionAprendida: 'Las correas deben inspeccionarse junto con cojinetes para evitar falla en cascada',
            recomendacionPreventiva: 'Revisión semestral de alineación, cambio de correas cada 18 meses',
            imagenes: [],
        },
    ];

    saveCasos(casos);
    localStorage.setItem(CONFIG.DEMO_KEY, 'true');
}

// ===== MODALES =====

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
    });
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.remove('show');
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// ===== MODAL: CAMBIAR ROL =====

document.getElementById('changeRoleBtn').addEventListener('click', () => {
    openModal('roleModal');
});

document.querySelectorAll('.role-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const role = e.currentTarget.dataset.role;
        if (role === 'planeador') {
            requestPIN('planeador');
        } else if (role === 'admin') {
            requestPIN('admin');
        } else {
            setRole(role);
            closeModal('roleModal');
        }
    });
});

function requestPIN(role) {
    window.targetRole = role;
    openModal('pinModal');
}

document.getElementById('confirmPinBtn').addEventListener('click', () => {
    const pin = document.getElementById('pinInput').value;
    const targetRole = window.targetRole;

    let expectedPIN = '';
    if (targetRole === 'planeador') expectedPIN = CONFIG.PIN_PLANEADOR;
    if (targetRole === 'admin') expectedPIN = CONFIG.PIN_ADMIN;

    if (pin === expectedPIN) {
        setRole(targetRole);
        closeModal('pinModal');
        closeModal('roleModal');
        document.getElementById('pinInput').value = '';
    } else {
        alert('PIN incorrecto');
        document.getElementById('pinInput').value = '';
    }
});

// ===== FORMULARIO REGISTRO FALLA =====

// Configurar fecha actual
document.getElementById('fecha').valueAsDate = new Date();

// Manejo de imágenes
document.getElementById('imageInput').addEventListener('change', (e) => {
    handleImageUpload(e.target.files);
});

function handleImageUpload(files) {
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Redimensionar a 500px max
                let width = img.width;
                let height = img.height;
                const maxSize = 500;
                
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                uploadedImages.push(compressedData);
                displayImagePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function displayImagePreview() {
    const previewContainer = document.getElementById('imagePreviews');
    previewContainer.innerHTML = '';
    
    uploadedImages.forEach((img, idx) => {
        const div = document.createElement('div');
        div.className = 'image-preview';
        div.innerHTML = `
            <img src="${img}" alt="Preview">
            <button class="remove-image" data-idx="${idx}">✕</button>
        `;
        previewContainer.appendChild(div);
    });
    
    document.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            uploadedImages.splice(idx, 1);
            displayImagePreview();
        });
    });
}

// Envío del formulario
document.getElementById('fallaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (currentRole === 'tecnico') {
        alert('No tienes permiso para registrar fallas');
        return;
    }

    // Validaciones obligatorias
    const causaRaiz = document.getElementById('causaRaiz').value;
    const accionCorrectiva = document.getElementById('accionCorrectiva').value;
    const leccionAprendida = document.getElementById('leccionAprendida').value;
    const solucionEfectiva = document.getElementById('solucionEfectiva').value;

    if (!causaRaiz || !accionCorrectiva || !leccionAprendida || !solucionEfectiva) {
        alert('Debes completar: Causa Raíz, Acción Correctiva, Lección Aprendida y Solución Efectiva');
        return;
    }

    // Crear caso
    const caso = {
        id: 'caso-' + Date.now(),
        fecha: document.getElementById('fecha').value,
        planta: document.getElementById('planta').value,
        area: document.getElementById('area').value,
        maquina: document.getElementById('maquina').value,
        codigoEquipo: document.getElementById('codigoEquipo').value,
        componente: document.getElementById('componente').value,
        descripcion: document.getElementById('descripcion').value,
        sintomas: document.getElementById('sintomas').value,
        causaRaiz: causaRaiz,
        accionCorrectiva: accionCorrectiva,
        repuestos: document.getElementById('repuestos').value,
        tiempoParada: parseFloat(document.getElementById('tiempoParada').value),
        tiempoReparacion: parseFloat(document.getElementById('tiempoReparacion').value),
        criticidad: document.getElementById('criticidad').value,
        ordenTrabajo: document.getElementById('ordenTrabajo').value,
        responsable: document.getElementById('responsable').value,
        solucionEfectiva: solucionEfectiva,
        leccionAprendida: leccionAprendida,
        recomendacionPreventiva: document.getElementById('recomendacionPreventiva').value,
        imagenes: [...uploadedImages],
    };

    const casos = getCasos();
    casos.push(caso);
    saveCasos(casos);

    alert('Falla registrada exitosamente');
    document.getElementById('fallaForm').reset();
    uploadedImages = [];
    displayImagePreview();
    document.getElementById('fecha').valueAsDate = new Date();
    
    // Volver a resumen
    switchPage('resumen');
});

// ===== NAVEGACIÓN DE PÁGINAS =====

function switchPage(pageName) {
    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar página seleccionada
    document.getElementById(pageName).classList.add('active');
    
    // Actualizar nav activo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Actualizar título
    const titleMap = {
        resumen: 'Resumen Ejecutivo',
        registrar: 'Registrar Falla Resuelta',
        chat: 'Chat Técnico',
        base: 'Base de Conocimiento',
    };
    document.getElementById('pageTitle').textContent = titleMap[pageName];

    // Recargar datos si es necesario
    if (pageName === 'resumen') loadResumen();
    if (pageName === 'base') updateBaseTable();
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        switchPage(page);
    });
});

// ===== RESUMEN EJECUTIVO =====

function loadResumen() {
    const casos = getCasos();
    
    // KPI
    document.getElementById('kpiCasos').textContent = casos.length;
    
    const criticas = casos.filter(c => c.criticidad === 'Crítica' || c.criticidad === 'Alta').length;
    document.getElementById('kpiCriticas').textContent = criticas;
    
    const conEvidencia = casos.filter(c => c.imagenes && c.imagenes.length > 0).length;
    document.getElementById('kpiEvidencia').textContent = conEvidencia;
    
    const efectivas = casos.filter(c => c.solucionEfectiva === 'Sí').length;
    const porcentaje = casos.length > 0 ? Math.round((efectivas / casos.length) * 100) : 0;
    document.getElementById('kpiEfectivas').textContent = porcentaje + '%';

    // Máquinas con mayor recurrencia
    const recurrenMap = {};
    casos.forEach(c => {
        recurrenMap[c.maquina] = (recurrenMap[c.maquina] || 0) + 1;
    });
    
    const recurrenArray = Object.entries(recurrenMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    let recurrenHTML = '<table><thead><tr><th>Máquina</th><th>Ocurrencias</th></tr></thead><tbody>';
    recurrenArray.forEach(([maquina, count]) => {
        recurrenHTML += `<tr><td>${maquina}</td><td>${count}</td></tr>`;
    });
    recurrenHTML += '</tbody></table>';
    document.getElementById('recurrenTable').innerHTML = recurrenHTML;

    // Casos recientes
    const recientes = casos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
    let recentHTML = '<table><thead><tr><th>Fecha</th><th>Máquina</th><th>Criticidad</th></tr></thead><tbody>';
    recientes.forEach(c => {
        const critClass = 'criticidad-badge ' + c.criticidad.toLowerCase();
        recentHTML += `<tr><td>${c.fecha}</td><td>${c.maquina}</td><td><span class="${critClass}">${c.criticidad}</span></td></tr>`;
    });
    recentHTML += '</tbody></table>';
    document.getElementById('recentTable').innerHTML = recentHTML;
}

// ===== BASE DE CONOCIMIENTO =====

function updateBaseTable() {
    const casos = getCasos();
    let filtro = document.getElementById('baseSearch').value.toLowerCase();
    
    let filtrados = casos;
    if (filtro) {
        filtrados = casos.filter(c => 
            c.maquina.toLowerCase().includes(filtro) ||
            c.componente.toLowerCase().includes(filtro) ||
            c.area.toLowerCase().includes(filtro) ||
            c.leccionAprendida.toLowerCase().includes(filtro)
        );
    }

    const tbody = document.getElementById('baseTableBody');
    tbody.innerHTML = '';

    filtrados.forEach(caso => {
        const critClass = 'criticidad-badge ' + caso.criticidad.toLowerCase();
        const accion = (caso.accionCorrectiva || '').substring(0, 50) + '...';
        
        let deleteBtn = '';
        if (currentRole === 'admin') {
            deleteBtn = `<button class="btn btn-danger btn-small delete-caso" data-id="${caso.id}">Eliminar</button>`;
        }

        const row = `
            <tr>
                <td>${caso.fecha}</td>
                <td>${caso.planta}</td>
                <td>${caso.maquina}</td>
                <td>${caso.componente}</td>
                <td><span class="${critClass}">${caso.criticidad}</span></td>
                <td title="${caso.leccionAprendida}">${accion}</td>
                <td class="table-actions">
                    <button class="btn btn-primary btn-small ver-caso" data-id="${caso.id}">Ver</button>
                    ${deleteBtn}
                </td>
            </tr>
        `;
        
        tbody.insertAdjacentHTML('beforeend', row);
    });

    // Eventos
    document.querySelectorAll('.ver-caso').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            openCasoModal(id);
        });
    });

    document.querySelectorAll('.delete-caso').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            requestDeletePIN(id);
        });
    });
}

document.getElementById('baseSearch').addEventListener('input', updateBaseTable);

function requestDeletePIN(casoId) {
    window.deleteCasoId = casoId;
    if (currentRole === 'admin') {
        const pin = prompt('Ingresa PIN para confirmar eliminación:');
        if (pin === CONFIG.PIN_ADMIN) {
            deleteCaso(casoId);
        } else if (pin !== null) {
            alert('PIN incorrecto');
        }
    }
}

function deleteCaso(id) {
    let casos = getCasos();
    casos = casos.filter(c => c.id !== id);
    saveCasos(casos);
    updateBaseTable();
    alert('Caso eliminado');
}

// ===== MODAL RESUMEN CASO =====

function openCasoModal(id) {
    const casos = getCasos();
    const caso = casos.find(c => c.id === id);
    
    if (!caso) return;

    const critClass = 'criticidad-badge ' + caso.criticidad.toLowerCase();
    const imagenHTML = caso.imagenes && caso.imagenes.length > 0 
        ? `<div class="summary-images">
            ${caso.imagenes.map(img => `<div class="summary-image"><img src="${img}" alt="Evidencia"></div>`).join('')}
           </div>`
        : '<p>Sin evidencias fotográficas</p>';

    const body = `
        <div class="caso-summary">
            <h3>${caso.maquina} - ${caso.ordenTrabajo}</h3>
            
            <div class="summary-section">
                <h4>Información General</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Fecha</span>
                        <span class="summary-value">${caso.fecha}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Planta</span>
                        <span class="summary-value">${caso.planta}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Área</span>
                        <span class="summary-value">${caso.area}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Máquina</span>
                        <span class="summary-value">${caso.maquina}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Código Equipo</span>
                        <span class="summary-value">${caso.codigoEquipo}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Componente</span>
                        <span class="summary-value">${caso.componente}</span>
                    </div>
                </div>
            </div>

            <div class="summary-section">
                <h4>Falla</h4>
                <div class="summary-item">
                    <span class="summary-label">Descripción</span>
                    <span class="summary-value">${caso.descripcion}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Síntomas Observados</span>
                    <span class="summary-value">${caso.sintomas}</span>
                </div>
            </div>

            <div class="summary-section">
                <h4>Análisis</h4>
                <div class="summary-item">
                    <span class="summary-label">Causa Raíz Confirmada</span>
                    <span class="summary-value">${caso.causaRaiz}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Acción Correctiva Realizada</span>
                    <span class="summary-value">${caso.accionCorrectiva}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Repuestos Usados</span>
                    <span class="summary-value">${caso.repuestos || 'Ninguno'}</span>
                </div>
            </div>

            <div class="summary-section">
                <h4>Tiempos y Criticidad</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Tiempo de Parada (h)</span>
                        <span class="summary-value">${caso.tiempoParada}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Tiempo de Reparación (h)</span>
                        <span class="summary-value">${caso.tiempoReparacion}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Criticidad</span>
                        <span class="summary-value"><span class="${critClass}">${caso.criticidad}</span></span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Solución Efectiva</span>
                        <span class="summary-value">${caso.solucionEfectiva}</span>
                    </div>
                </div>
            </div>

            <div class="summary-section">
                <h4>Información Operativa</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <span class="summary-label">Orden de Trabajo</span>
                        <span class="summary-value">${caso.ordenTrabajo}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Responsable</span>
                        <span class="summary-value">${caso.responsable}</span>
                    </div>
                </div>
            </div>

            <div class="summary-section">
                <h4>Lecciones y Recomendaciones</h4>
                <div class="summary-item">
                    <span class="summary-label">Lección Aprendida</span>
                    <span class="summary-value">${caso.leccionAprendida}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Recomendación Preventiva</span>
                    <span class="summary-value">${caso.recomendacionPreventiva || 'Ninguna'}</span>
                </div>
            </div>

            <div class="summary-section">
                <h4>Evidencias Fotográficas</h4>
                ${imagenHTML}
            </div>
        </div>
    `;

    document.getElementById('casoModalBody').innerHTML = body;
    document.getElementById('exportPdfBtn').onclick = () => exportPDF(caso);
    
    openModal('casoModal');
}

function exportPDF(caso) {
    window.print();
}

// ===== CHAT TÉCNICO =====

function initChat() {
    const history = document.getElementById('chatHistory');
    history.innerHTML = '<div class="chat-message assistant"><div class="chat-bubble">¡Hola! Soy tu asistente técnico. Puedo ayudarte a buscar fallas similares, soluciones probadas y lecciones aprendidas. Pregunta sobre máquinas, componentes, síntomas o causas raíz.</div></div>';
}

document.getElementById('chatSendBtn').addEventListener('click', () => {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Mensaje del usuario
    addChatMessage(message, 'user');
    
    // Procesar chat
    processChat(message);
    
    input.value = '';
});

document.getElementById('chatInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('chatSendBtn').click();
    }
});

function addChatMessage(text, sender) {
    const history = document.getElementById('chatHistory');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `<div class="chat-bubble">${escapeHTML(text)}</div>`;
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

function addChatResponse(text, cases = []) {
    const history = document.getElementById('chatHistory');
    const div = document.createElement('div');
    div.className = 'chat-message assistant';
    
    let html = `<div class="chat-bubble">${escapeHTML(text)}`;
    
    if (cases.length > 0) {
        html += '<div class="cases-list">';
        cases.forEach(caso => {
            html += `<button class="case-link" onclick="openCasoModal('${caso.id}')">${caso.fecha} - ${caso.maquina} (${caso.criticidad})</button>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    div.innerHTML = html;
    
    history.appendChild(div);
    history.scrollTop = history.scrollHeight;
}

function processChat(mensaje) {
    const casos = getCasos();
    const lower = mensaje.toLowerCase();
    
    // Verificar límite de IA
    const iaEnabled = document.getElementById('iaToggle').checked;
    if (iaEnabled && iaUsedToday >= CONFIG.IA_LIMIT) {
        addChatResponse('Límite de consultas IA alcanzado hoy. Puedo seguir con búsqueda local.', []);
    }

    // Búsqueda de coincidencias
    let matches = [];
    
    // Palabras clave comunes
    const keywords = {
        variador: ['variador', 'frecuencia', 'alarma', 'temperatura elevada'],
        microswitch: ['microswitch', 'guarda', 'intermitente', 'parada falsa'],
        motor: ['motor', 'amperaje', 'vibración', 'cojinete'],
        horno: ['horno', 'secado', 'temperatura', 'sensor'],
        sensor: ['sensor', 'inductivo', 'disparos', 'conteo'],
        devanador: ['devanador', 'ruido', 'vibración', 'transmisión'],
    };

    // Buscar por palabras clave
    Object.entries(keywords).forEach(([key, words]) => {
        if (words.some(w => lower.includes(w))) {
            const found = casos.filter(c => 
                c.maquina.toLowerCase().includes(key) ||
                c.componente.toLowerCase().includes(key) ||
                c.descripcion.toLowerCase().includes(key) ||
                c.sintomas.toLowerCase().includes(key)
            );
            matches = matches.concat(found);
        }
    });

    // Búsqueda genérica por palabras
    if (matches.length === 0) {
        matches = casos.filter(c => 
            lower.includes(c.maquina.toLowerCase()) ||
            lower.includes(c.componente.toLowerCase()) ||
            lower.includes(c.area.toLowerCase())
        );
    }

    // Si aún no hay resultados, buscar en descripción
    if (matches.length === 0) {
        matches = casos.filter(c =>
            c.descripcion.toLowerCase().includes(lower) ||
            c.sintomas.toLowerCase().includes(lower) ||
            c.causaRaiz.toLowerCase().includes(lower)
        );
    }

    // Generar respuesta
    if (matches.length === 0) {
        addChatResponse('No encontré casos similares en la base de datos. Intenta con otras palabras clave.', []);
    } else {
        let response = `Encontré ${matches.length} caso(s) relacionado(s):\n\n`;
        
        if (iaEnabled && iaUsedToday < CONFIG.IA_LIMIT) {
            // Respuesta elaborada con IA
            const bestMatch = matches[0];
            response += `📌 Caso más similar:\n`;
            response += `Máquina: ${bestMatch.maquina}\n`;
            response += `Componente: ${bestMatch.componente}\n`;
            response += `Causa Raíz: ${bestMatch.causaRaiz}\n`;
            response += `Acción que Funcionó: ${bestMatch.accionCorrectiva}\n`;
            response += `Lección Clave: ${bestMatch.leccionAprendida}\n`;
            response += `Prioridad: ${bestMatch.criticidad}\n`;
            
            iaUsedToday++;
            updateIACounter();
        } else {
            // Respuesta simple
            response += 'Casos encontrados en la base de datos (haz clic para ver detalles completos).';
        }
        
        addChatResponse(response, matches);
    }
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initializeEvents() {
    switchPage('resumen');
    initChat();
    setupAdminModal();
}

// ===== ADMIN PANEL =====

function setupAdminModal() {
    document.getElementById('adminBtn').addEventListener('click', () => {
        updateAdminInfo();
        openModal('adminModal');
    });

    document.getElementById('restaurarDemoBtn').addEventListener('click', () => {
        if (confirm('¿Restaurar datos demo? Se perderán todos los casos actuales.')) {
            loadDemoData();
            alert('Datos demo restaurados');
            updateAdminInfo();
            loadResumen();
        }
    });

    document.getElementById('limpiarLocalBtn').addEventListener('click', () => {
        const pin = prompt('PIN para limpiar localStorage:');
        if (pin === CONFIG.PIN_ADMIN) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            loadDemoData();
            alert('LocalStorage limpiado y demo restaurado');
            updateAdminInfo();
            loadResumen();
        } else if (pin !== null) {
            alert('PIN incorrecto');
        }
    });
}

function updateAdminInfo() {
    const casos = getCasos();
    document.getElementById('adminCasoCount').textContent = casos.length;
    
    const storageUsed = JSON.stringify(localStorage).length / 1024;
    document.getElementById('storageUsed').textContent = storageUsed.toFixed(2);
}

// ===== MODO IA LIMITADO =====

document.getElementById('iaToggle').addEventListener('change', () => {
    checkIALimit();
});

function checkIALimit() {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(CONFIG.IA_DATE_KEY);
    
    if (lastDate !== today) {
        iaUsedToday = 0;
        localStorage.setItem(CONFIG.IA_DATE_KEY, today);
        localStorage.setItem(CONFIG.IA_USED_KEY, '0');
    } else {
        iaUsedToday = parseInt(localStorage.getItem(CONFIG.IA_USED_KEY) || 0);
    }
    
    updateIACounter();
}

function updateIACounter() {
    localStorage.setItem(CONFIG.IA_USED_KEY, iaUsedToday.toString());
    const remaining = CONFIG.IA_LIMIT - iaUsedToday;
    document.getElementById('iaLimit').textContent = `${remaining}/${CONFIG.IA_LIMIT}`;
    document.getElementById('iaLimit').style.backgroundColor = remaining <= 2 ? '#F44336' : '#2196F3';
}

// ===== TIMESTAMP =====

function updateTimestamp() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('timestamp').textContent = now.toLocaleDateString('es-AR', options);
}
