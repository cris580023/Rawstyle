const API_URL = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUsuario() {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    const enPages = window.location.pathname.includes('/pages/');
    window.location.href = enPages ? 'login.html' : 'pages/login.html';
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
    });

    const data = await res.json();
    if (!res.ok) throw { status: res.status, mensaje: data.mensaje };
    return data;
}

const auth = {
    login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
    registro: (body) => apiFetch('/auth/registro', { method: 'POST', body: JSON.stringify(body) }),
};

const productos = {
    todos:        ()   => apiFetch('/productos'),
    porId:        (id) => apiFetch(`/productos/${id}`),
    porCategoria: (id) => apiFetch(`/productos/categoria/${id}`),
    // Admin
    todosAdmin:   ()   => apiFetch('/productos/admin/todos'),
    crear:        (b)  => apiFetch('/productos',    { method: 'POST',   body: JSON.stringify(b) }),
    actualizar:   (id, b) => apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
    eliminar:     (id) => apiFetch(`/productos/${id}`, { method: 'DELETE' }),
};

const carrito = {
    ver:       ()          => apiFetch('/carrito'),
    agregar:   (b)         => apiFetch('/carrito', { method: 'POST',   body: JSON.stringify(b) }),
    actualizar:(id, b)     => apiFetch(`/carrito/${id}`, { method: 'PUT', body: JSON.stringify(b) }),
    eliminar:  (id)        => apiFetch(`/carrito/${id}`, { method: 'DELETE' }),
    vaciar:    ()          => apiFetch('/carrito/vaciar', { method: 'DELETE' }),
};

const pedidos = {
    crear:      (b)  => apiFetch('/pedidos',            { method: 'POST', body: JSON.stringify(b) }),
    misPedidos: ()   => apiFetch('/pedidos'),
    // Admin
    todos:      ()   => apiFetch('/pedidos/admin/todos'),
    cambiarEstado: (id, b) => apiFetch(`/pedidos/admin/${id}/estado`, { method: 'PUT', body: JSON.stringify(b) }),
};

const reportes = {
    resumen:     () => apiFetch('/reportes/resumen'),
    productos:   () => apiFetch('/reportes/productos'),
    categorias:  () => apiFetch('/reportes/categorias'),
    periodo:     () => apiFetch('/reportes/periodo'),
    dia:        () =>  apiFetch('/reportes/dia'),
};