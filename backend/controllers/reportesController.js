const db = require('../config/db');

async function ventasPorProducto(req, res) {
    try {
        const [datos] = await db.query(`
      SELECT 
        p.nombre,
        c.nombre AS categoria,
        SUM(dp.cantidad) AS unidades_vendidas,
        SUM(dp.cantidad * dp.precio_unitario) AS total_ventas
      FROM detalle_pedido dp
      JOIN productos p ON dp.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN pedidos ped ON dp.pedido_id = ped.id
      WHERE ped.estado != 'cancelado'
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY total_ventas DESC
    `);
        res.json(datos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener reporte por producto.' });
    }
}

async function ventasPorCategoria(req, res) {
    try {
        const [datos] = await db.query(`
      SELECT 
        c.nombre AS categoria,
        SUM(dp.cantidad) AS unidades_vendidas,
        SUM(dp.cantidad * dp.precio_unitario) AS total_ventas,
        COUNT(DISTINCT ped.id) AS numero_pedidos
      FROM detalle_pedido dp
      JOIN productos p ON dp.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      JOIN pedidos ped ON dp.pedido_id = ped.id
      WHERE ped.estado != 'cancelado'
      GROUP BY c.id, c.nombre
      ORDER BY total_ventas DESC
    `);
        res.json(datos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener reporte por categoría.' });
    }
}

async function ventasPorPeriodo(req, res) {
    try {
        const [datos] = await db.query(`
      SELECT 
        DATE_FORMAT(ped.creado_en, '%Y-%m') AS periodo,
        DATE_FORMAT(ped.creado_en, '%b %Y') AS mes,
        COUNT(ped.id) AS numero_pedidos,
        SUM(ped.total) AS total_ventas
      FROM pedidos ped
      WHERE ped.estado != 'cancelado'
      GROUP BY DATE_FORMAT(ped.creado_en, '%Y-%m')
      ORDER BY periodo ASC
    `);
        res.json(datos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener reporte por periodo.' });
    }
}

async function resumenGeneral(req, res) {
    try {
        const [[totales]] = await db.query(`
      SELECT 
        COUNT(DISTINCT ped.id) AS total_pedidos,
        SUM(ped.total) AS ingresos_totales,
        COUNT(DISTINCT ped.usuario_id) AS clientes_activos
      FROM pedidos ped
      WHERE ped.estado != 'cancelado'
    `);

        const [[productos_vendidos]] = await db.query(`
      SELECT SUM(dp.cantidad) AS total_unidades
      FROM detalle_pedido dp
      JOIN pedidos ped ON dp.pedido_id = ped.id
      WHERE ped.estado != 'cancelado'
    `);

        res.json({
            total_pedidos:    totales.total_pedidos || 0,
            ingresos_totales: totales.ingresos_totales || 0,
            clientes_activos: totales.clientes_activos || 0,
            total_unidades:   productos_vendidos.total_unidades || 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener resumen.' });
    }
}

async function ventasPorDia(req, res) {
    try {
        const [datos] = await db.query(`
      SELECT 
        DATE(ped.creado_en) AS fecha,
        DATE_FORMAT(ped.creado_en, '%d %b') AS dia,
        COUNT(ped.id) AS numero_pedidos,
        SUM(ped.total) AS total_ventas
      FROM pedidos ped
      WHERE ped.estado != 'cancelado'
      GROUP BY DATE(ped.creado_en)
      ORDER BY fecha ASC
    `);
        res.json(datos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ mensaje: 'Error al obtener reporte por día.' });
    }
}

module.exports = { ventasPorProducto, ventasPorCategoria, ventasPorPeriodo, resumenGeneral, ventasPorDia };