import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import reportsRoutes from "./routes/reports.js";
import zktecoRoutes from "./routes/zkteco.js";
import attendanceRoutes from "./routes/attendance.js";
import userRoutes from "./routes/users.js";
import devicesRoutes from "./routes/devices.js";
import branchesRoutes from "./routes/branches.js";
import { startSyncScheduler } from "./scheduler/syncScheduler.js";
import { connectDB } from "./config/db.js";

dotenv.config();

// ✅ Inicializar app y servidor HTTP
const app = express();
const server = http.createServer(app);

// ✅ Configurar Socket.io con CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.use((req, res, next) => {
    console.log(`📡 Ruta accedida: ${req.method} ${req.originalUrl}`);
    next();
  });
  
// ✅ Exportar io para usarlo en controladores
export { io };

// ✅ Conexión a base de datos
connectDB();

// ✅ Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));

// ✅ Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/zkteco", zktecoRoutes);
app.use("/api/attendance", attendanceRoutes);

// ✅ Socket.io: manejo de conexión
io.on("connection", (socket) => {
  console.log("✅ Cliente conectado vía WebSocket");

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado");
  });
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
startSyncScheduler(); // ⏱️ Lanzar reintentos automáticos