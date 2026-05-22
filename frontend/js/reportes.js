let graficaProductos = null;
let graficaCategorias = null;
let graficaPeriodo = null;
let graficaDia = null;

async function cargarReportes() {
    await Promise.all([
        cargarResumen(),
        cargarGraficaDia(),
        cargarGraficaProductos(),
        cargarGraficaCategorias(),
        cargarGraficaPeriodo(),
    ]);
}

async function cargarResumen() {
    try {
        const data = await reportes.resumen();
        document.getElementById('r-pedidos').textContent =
            Number(data.total_pedidos).toLocaleString('es-CO');
        document.getElementById('r-ingresos').textContent =
            `$${Number(data.ingresos_totales).toLocaleString('es-CO')}`;
        document.getElementById('r-clientes').textContent =
            Number(data.clientes_activos).toLocaleString('es-CO');
        document.getElementById('r-unidades').textContent =
            Number(data.total_unidades).toLocaleString('es-CO');
    } catch (err) {
        console.error('Error resumen:', err);
    }
}

async function cargarGraficaDia() {
    try {
        const data = await reportes.dia();

        if (data.length === 0) {
            document.getElementById('sin-datos-dia').classList.remove('hidden');
            return;
        }

        const labels  = data.map(d => d.dia);
        const valores = data.map(d => Number(d.total_ventas));

        const ctx = document.getElementById('graficaDia').getContext('2d');
        if (graficaDia) graficaDia.destroy();

        graficaDia = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Ingresos del día',
                    data: valores,
                    backgroundColor: '#6366f1',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `$${Number(ctx.raw).toLocaleString('es-CO')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: val => `$${Number(val).toLocaleString('es-CO')}`
                        }
                    }
                }
            }
        });

        const tbody = document.getElementById('tabla-dia-body');
        tbody.innerHTML = data.map(d => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${d.dia}</td>
        <td class="px-4 py-3 text-sm text-center">${d.numero_pedidos}</td>
        <td class="px-4 py-3 text-sm font-bold text-right text-green-700">
          $${Number(d.total_ventas).toLocaleString('es-CO')}
        </td>
      </tr>
    `).join('');
    } catch (err) {
        console.error('Error gráfica día:', err);
    }
}

async function cargarGraficaProductos() {
    try {
        const data = await reportes.productos();

        if (data.length === 0) {
            document.getElementById('sin-datos-productos').classList.remove('hidden');
            return;
        }

        const labels  = data.map(d => d.nombre);
        const valores = data.map(d => Number(d.total_ventas));
        const colores = generarColores(data.length);

        const ctx = document.getElementById('graficaProductos').getContext('2d');
        if (graficaProductos) graficaProductos.destroy();

        graficaProductos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Ventas (COP)',
                    data: valores,
                    backgroundColor: colores,
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `$${Number(ctx.raw).toLocaleString('es-CO')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: val => `$${Number(val).toLocaleString('es-CO')}`
                        }
                    },
                    x: { ticks: { maxRotation: 45 } }
                }
            }
        });

        const tbody = document.getElementById('tabla-productos-body');
        tbody.innerHTML = data.map((d, i) => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${i + 1}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${d.nombre}</td>
        <td class="px-4 py-3 text-sm text-gray-500">${d.categoria}</td>
        <td class="px-4 py-3 text-sm font-medium text-center">${d.unidades_vendidas}</td>
        <td class="px-4 py-3 text-sm font-bold text-right text-green-700">
          $${Number(d.total_ventas).toLocaleString('es-CO')}
        </td>
      </tr>
    `).join('');
    } catch (err) {
        console.error('Error gráfica productos:', err);
    }
}


async function cargarGraficaCategorias() {
    try {
        const data = await reportes.categorias();

        if (data.length === 0) {
            document.getElementById('sin-datos-categorias').classList.remove('hidden');
            return;
        }

        const labels  = data.map(d => d.categoria);
        const valores = data.map(d => Number(d.total_ventas));
        const colores = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

        const ctx = document.getElementById('graficaCategorias').getContext('2d');
        if (graficaCategorias) graficaCategorias.destroy();

        graficaCategorias = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: valores,
                    backgroundColor: colores,
                    borderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 16, font: { size: 12 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` $${Number(ctx.raw).toLocaleString('es-CO')}`
                        }
                    }
                }
            }
        });

        const tbody = document.getElementById('tabla-categorias-body');
        tbody.innerHTML = data.map(d => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${d.categoria}</td>
        <td class="px-4 py-3 text-sm text-center">${d.unidades_vendidas}</td>
        <td class="px-4 py-3 text-sm text-center">${d.numero_pedidos}</td>
        <td class="px-4 py-3 text-sm font-bold text-right text-green-700">
          $${Number(d.total_ventas).toLocaleString('es-CO')}
        </td>
      </tr>
    `).join('');
    } catch (err) {
        console.error('Error gráfica categorías:', err);
    }
}

async function cargarGraficaPeriodo() {
    try {
        const data = await reportes.periodo();

        if (data.length === 0) {
            document.getElementById('sin-datos-periodo').classList.remove('hidden');
            return;
        }

        const labels  = data.map(d => d.mes);
        const valores = data.map(d => Number(d.total_ventas));

        const ctx = document.getElementById('graficaPeriodo').getContext('2d');
        if (graficaPeriodo) graficaPeriodo.destroy();

        graficaPeriodo = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Ingresos',
                    data: valores,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.08)',
                    borderWidth: 2,
                    pointBackgroundColor: '#4f46e5',
                    pointRadius: 5,
                    tension: 0.3,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `$${Number(ctx.raw).toLocaleString('es-CO')}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: val => `$${Number(val).toLocaleString('es-CO')}`
                        }
                    }
                }
            }
        });

        const tbody = document.getElementById('tabla-periodo-body');
        tbody.innerHTML = data.map(d => `
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${d.mes}</td>
        <td class="px-4 py-3 text-sm text-center">${d.numero_pedidos}</td>
        <td class="px-4 py-3 text-sm font-bold text-right text-green-700">
          $${Number(d.total_ventas).toLocaleString('es-CO')}
        </td>
      </tr>
    `).join('');
    } catch (err) {
        console.error('Error gráfica periodo:', err);
    }
}

function generarColores(n) {
    const base = [
        '#6366f1','#8b5cf6','#a78bfa','#c4b5fd',
        '#818cf8','#4f46e5','#7c3aed','#9333ea'
    ];
    return Array.from({ length: n }, (_, i) => base[i % base.length]);
}