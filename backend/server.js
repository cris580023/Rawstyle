const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
console.log('__dirname:', __dirname);
console.log('Frontend path:', frontendPath);

app.use(express.static(frontendPath));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/carrito',   require('./routes/carritoRoutes'));
app.use('/api/pedidos',   require('./routes/pedidosRoutes'));
app.use('/api/reportes', require('./routes/reportesRoutes'));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});