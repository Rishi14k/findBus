require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const {initializeSocket} = require('./utils/socket');

//routes calling
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes')
const adminRoutes  = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes')
const { authMiddleware } = require('./middleware/authMiddleware');
const requireAdmin = require('./middleware/requireAdmin');
const requireDriver = require('./middleware/requireDriver');

//db connection
mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Database connected successfully');
}).catch((err)=>{
    console.error('Error connecting to MongoDB:', err);
})

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;


app.use('/api/auth',authRoutes);
app.use('/api/driver',authMiddleware,requireDriver,driverRoutes);
app.use('/api/admin',authMiddleware,requireAdmin,adminRoutes);
app.use('/api/user',userRoutes)

initializeSocket(server);
server.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})