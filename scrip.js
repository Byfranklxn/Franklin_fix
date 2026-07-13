document.addEventListener('DOMContentLoaded', () => {
    actualizarTabla();
    
    // Botón para exportar base de datos
    document.getElementById('btn-exportar').addEventListener('click', exportarBaseDatos);
});

const formCliente = document.getElementById('form-cliente');
const listaClientesBody = document.getElementById('lista-clientes-body');
const btnApagar = document.getElementById('btn-apagar');
const modalFactura = document.getElementById('modal-factura');

// Registro de clientes nuevo
formCliente.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value || 'Sin número';
    const modelo = document.getElementById('modelo').value;
    const falla = document.getElementById('falla').value;
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    const estadoPago = document.getElementById('estado-pago').value;

    const nuevoCliente = {
        id: Date.now(),
        nombre,
        telefono,
        modelo,
        falla,
        precio,
        estadoPago,
        fecha: new Date().toLocaleDateString('es-CO')
    };

    let clientes = JSON.parse(localStorage.getItem('franklin_clientes')) || [];
    clientes.push(nuevoCliente);
    localStorage.setItem('franklin_clientes', JSON.stringify(clientes));

    formCliente.reset();
    actualizarTabla();
});

// Renderizar la tabla y sumar valores
function actualizarTabla() {
    let clientes = JSON.parse(localStorage.getItem('franklin_clientes')) || [];
    listaClientesBody.innerHTML = '';
    
    let deudores = 0;
    let totalCaja = 0;

    clientes.forEach(cliente => {
        if (cliente.estadoPago === 'Pendiente') {
            deudores++;
        } else {
            totalCaja += cliente.precio;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${cliente.nombre}</strong></td>
            <td><a href="https://wa.me/${cliente.telefono.replace(/\s+/g, '')}" target="_blank" style="color:#2ecc71; text-decoration:none;"><i class="fa-brands fa-whatsapp"></i> ${cliente.telefono}</a></td>
            <td><i class="fa-solid fa-mobile-retro" style="color:#00f2fe;"></i> ${cliente.modelo}</td>
            <td>${cliente.falla}</td>
            <td><strong>$${cliente.precio.toLocaleString('es-CO')}</strong></td>
            <td>
                <span class="badge-pago ${cliente.estadoPago.toLowerCase()}" onclick="cambiarEstado(${cliente.id})">
                    ${cliente.estadoPago === 'Pagado' ? '✅ PAGADO' : '❌ DEBE'}
                </span>
            </td>
            <td>
                <div class="tabla-acciones">
                    <button class="btn-tabla-factura" onclick="generarFactura(${cliente.id})">
                        <i class="fa-solid fa-file-invoice-dollar"></i> Recibo
                    </button>
                    <button class="btn-tabla-eliminar" onclick="eliminarCliente(${cliente.id})" title="Eliminar">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        listaClientesBody.appendChild(tr);
    });

    // Actualizar Dashboards de arriba
    document.getElementById('num-deudores').innerText = deudores;
    document.getElementById('caja-total').innerText = '$' + totalCaja.toLocaleString('es-CO');
}

// Clic en pago cambia estado
function cambiarEstado(id) {
    let clientes = JSON.parse(localStorage.getItem('franklin_clientes')) || [];
    clientes = clientes.map(c => {
        if (c.id === id) {
            c.estadoPago = c.estadoPago === 'Pagado' ? 'Pendiente' : 'Pagado';
        }
        return c;
    });
    localStorage.setItem('franklin_clientes', JSON.stringify(clientes));
    actualizarTabla();
}

// Eliminar
function eliminarCliente(id) {
    if (confirm('¿Quieres eliminar este registro permanentemente?')) {
        let clientes = JSON.parse(localStorage.getItem('franklin_clientes')) || [];
        clientes = clientes.filter(c => c.id !== id);
        localStorage.setItem('franklin_clientes', JSON.stringify(clientes));
        actualizarTabla();
    }
}

// ARMAR LA FACTURA DINÁMICA
function generarFactura(id) {
    let clientes = JSON.parse(localStorage.getItem('franklin_clientes')) || [];
    const cliente = clientes.find(c => c.id === id);

    if (cliente) {
        document.getElementById('factura-fecha').innerText = cliente.fecha;
        document.getElementById('factura-id').innerText = String(cliente.id).slice(-4); // Tomamos los últimos 4 dígitos como ID de recibo
        document.getElementById('factura-cliente').innerText = cliente.nombre;
        document.getElementById('factura-tel').innerText = cliente.telefono;
        document.getElementById('factura-modelo').innerText = cliente.modelo;
        document.getElementById('factura-falla').innerText = cliente.falla;
        document.getElementById('factura-total').innerText = '$' + cliente.precio.toLocaleString('es-CO');
        
        const estFact = document.getElementById('factura-estado');
        if (cliente.estadoPago === 'Pagado') {
            estFact.innerText = "ESTADO: ¡TOTALMENTE PAGADO!";
            estFact.style.color = '#2ecc71';
            estFact.style.borderColor = '#2ecc71';
        } else {
            estFact.innerText = "ESTADO: PENDIENTE (DEBE)";
            estFact.style.color = '#e74c3c';
            estFact.style.borderColor = '#e74c3c';
        }

        modalFactura.style.display = 'flex';
    }
}

function cerrarModal() {
    modalFactura.style.display = 'none';
}

function imprimirFactura() {
    window.print();
}

// RESPALDO DE BASE DE DATOS (Exportar copia de seguridad en un archivo .txt)
function exportarBaseDatos() {
    let clientes = localStorage.getItem('franklin_clientes');
    if (!clientes || clientes === "[]") {
        alert("No tienes clientes registrados para respaldar.");
        return;
    }
    
    const blob = new Blob([clientes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Copia_Seguridad_Franklin_Fix_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Botón de Apagado
btnApagar.addEventListener('click', () => {
    if (confirm('¿Quieres cerrar el sistema de Franklin Fix?')) {
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#09090b; color:white;">
                <i class="fa-solid fa-power-off" style="font-size: 60px; color:#e74c3c; margin-bottom: 20px; filter: drop-shadow(0 0 15px rgba(231,76,60,0.5));"></i>
                <h1 style="font-weight: 800; letter-spacing:1px;">FRANKLIN FIX APAGADO</h1>
                <p style="color:#8a8a93; margin-top:10px;">Refresca la pestaña para volver a encender el sistema.</p>
            </div>
        `;
    }
});