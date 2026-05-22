let todosLosProductos = [];

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();
    await cargarProductos();
    initNavbarScroll();
});

function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('navbar-blur');
        } else {
            navbar.classList.remove('navbar-blur');
        }
    });
}

function renderNavbar() {
    const usuario = getUsuario();
    const nav = document.getElementById('nav-acciones');

    if (usuario) {
        nav.innerHTML = `
      <a href="pages/carrito.html"
         class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13H5.4
               M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
        <span id="badge-carrito" class="badge-carrito hidden">0</span>
      </a>
      ${usuario.rol === 'admin'
            ? `<a href="pages/admin.html"
               class="text-sm font-medium px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
             Admin
           </a>`
            : `<a href="pages/historial.html"
               class="text-sm text-gray-600 hover:text-black transition-colors">Mis pedidos</a>`
        }
      <button onclick="cerrarSesion()"
        class="text-sm text-gray-500 hover:text-black transition-colors">Salir</button>
    `;
        actualizarBadgeCarrito();
    } else {
        nav.innerHTML = `
      <a href="pages/login.html"
         class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Iniciar sesión</a>
      <a href="pages/registro.html"
         class="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
        Registrarse
      </a>
    `;
    }
}

async function actualizarBadgeCarrito() {
    try {
        const data  = await carrito.ver();
        const badge = document.getElementById('badge-carrito');
        if (!badge) return;

        const total = data.items.reduce((sum, i) => sum + i.cantidad, 0);
        if (total > 0) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    } catch (err) {
    }
}

async function cargarProductos() {
    try {
        todosLosProductos = await productos.todos();
        mostrarProductos(todosLosProductos);
    } catch (err) {
        document.getElementById('loading').textContent = 'Error al cargar productos.';
    }
}

function mostrarProductos(lista) {
    const loading  = document.getElementById('loading');
    const catalogo = document.getElementById('catalogo');
    const sinProd  = document.getElementById('sin-productos');
    const contador = document.getElementById('contador-productos');

    loading.classList.add('hidden');
    contador.textContent = `${lista.length} producto${lista.length !== 1 ? 's' : ''}`;

    if (lista.length === 0) {
        catalogo.classList.add('hidden');
        sinProd.classList.remove('hidden');
        return;
    }

    sinProd.classList.add('hidden');
    catalogo.classList.remove('hidden');

    catalogo.innerHTML = lista.map(p => `
    <div class="card-producto fade-in-up" onclick="verProducto(${p.id})">
      <div class="img-wrapper">
        <img src="${p.imagen_url || 'https://placehold.co/400x400/f3f4f6/9ca3af?text=Rawstyle'}"
             alt="${p.nombre}"
             loading="lazy"/>
        <div class="overlay-btn">
          <span class="bg-white text-black text-sm font-semibold px-5 py-2 rounded-lg
                       hover:bg-gray-100 transition-colors">
            Ver detalle
          </span>
        </div>
      </div>
      <div class="p-4">
        <span class="text-xs text-gray-400 uppercase tracking-wide">${p.categoria}</span>
        <h3 class="font-semibold text-gray-900 mt-1 truncate">${p.nombre}</h3>

        ${p.tallas && p.tallas.length > 0
        ? `<div class="flex flex-wrap gap-1 mt-1">
               ${p.tallas.map(t =>
            `<span class="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">${t}</span>`
        ).join('')}
             </div>`
        : ''
    }

        <div class="flex items-center justify-between mt-2">
          <span class="text-lg font-bold">$${Number(p.precio).toLocaleString('es-CO')}</span>
          <span class="text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}">
            ${p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
          </span>
        </div>
        <button onclick="event.stopPropagation(); agregarRapido(${p.id})"
          class="mt-3 w-full bg-black text-white py-2 rounded-lg text-sm font-medium
                 hover:bg-gray-800 transition-colors
                 ${p.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
          ${p.stock === 0 ? 'disabled' : ''}>
          Agregar al carrito
        </button>
      </div>
    </div>
  `).join('');
}

async function filtrarCategoria(categoriaId) {
    const titulos = {
        0: 'Todos los productos',
        1: 'Camisas', 2: 'Pantalones', 3: 'Busos', 4: 'Chaquetas'
    };
    document.getElementById('titulo-catalogo').textContent = titulos[categoriaId] || 'Productos';
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('catalogo').classList.add('hidden');

    const buscador = document.getElementById('buscador');
    if (buscador) buscador.value = '';

    try {
        const lista = categoriaId === 0
            ? await productos.todos()
            : await productos.porCategoria(categoriaId);
        mostrarProductos(lista);
    } catch (err) {
        mostrarToast('Error al cargar productos.');
    }
}

async function agregarRapido(productoId) {
    if (!getToken()) {
        window.location.href = 'pages/login.html';
        return;
    }
    try {
        await carrito.agregar({ producto_id: productoId, cantidad: 1 });
        mostrarToast('Producto agregado al carrito ✓');
        actualizarBadgeCarrito();
    } catch (err) {
        mostrarToast(err.mensaje || 'Error al agregar.');
    }
}

function verProducto(id) {
    window.location.href = `pages/producto.html?id=${id}`;
}

function buscarProductos(termino) {
    const texto = termino.toLowerCase().trim();

    if (texto === '') {
        mostrarProductos(todosLosProductos);
        document.getElementById('titulo-catalogo').textContent = 'Todos los productos';
        return;
    }

    const filtrados = todosLosProductos.filter(p =>
        p.nombre.toLowerCase().includes(texto)    ||
        p.categoria.toLowerCase().includes(texto) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(texto))
    );

    mostrarProductos(filtrados);
    document.getElementById('titulo-catalogo').textContent =
        filtrados.length > 0
            ? `Resultados para "${termino}"`
            : `Sin resultados para "${termino}"`;
}

function mostrarToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => t.classList.add('translate-y-20', 'opacity-0'), 2500);
}