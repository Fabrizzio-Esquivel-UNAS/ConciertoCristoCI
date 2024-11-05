const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const path = require('path');

dotenv.config();
app.use(express.json()); // Para procesar JSON en las peticiones

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Datos de demostración para los asientos
const demoSeats = [
  { id: 1, status: 'disponible' },
  { id: 2, status: 'ocupado' },
  { id: 3, status: 'disponible' },
  { id: 4, status: 'ocupado' },
  { id: 5, status: 'disponible' }
];

// Definir el modelo de Asiento
const seatSchema = new mongoose.Schema({
  id: Number,
  status: { type: String, enum: ['disponible', 'ocupado'], default: 'disponible' }
});

// Insertar datos de demostración si la colección está vacía
mongoose.connection.once('open', async () => {
  const count = await Seat.countDocuments();
  if (count === 0) {
    await Seat.insertMany(demoSeats);
    console.log('Datos de demostración insertados');
  }
});

const Seat = mongoose.model('Seat', seatSchema);

// Ruta para renderizar la vista principal
app.get('/', async (req, res) => {
  try {
    const seats = await Seat.find();
    res.render('seats', { seats });  // Renderiza la vista 'seats.ejs' y pasa los asientos
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los asientos' });
  }
});

// Ruta para obtener todos los asientos en JSON
app.get('/seats', async (req, res) => {
  try {
    const seats = await Seat.find();
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los asientos' });
  }
});

// Ruta para actualizar la disponibilidad de un asiento
app.put('/seats/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validar el estado proporcionado
  if (!['disponible', 'ocupado'].includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const seat = await Seat.findOneAndUpdate({ id: id }, { status: status }, { new: true });
    if (!seat) {
      return res.status(404).json({ error: 'Asiento no encontrado' });
    }
    res.json(seat);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el asiento' });
  }
});

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
