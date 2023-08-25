import express from 'express';
import usuariosRoutes from './routes/usuarios.routes.js';
import centrosRoutes from './routes/centros.routes.js';
import medicamentoRoutes from './routes/medicamentos.routes.js';
import movimientosRoutes from './routes/movimientos.routes.js';
import farmaciaRoutes from './routes/farmacia.routes.js'
import privadoRoutes from './routes/privado.routes.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';



const app = express();

const corsOptions = {
  origin: "*",
  Credentials: true,
  optionSuccessStatus: 200,
};


app.use(cors(corsOptions));
app.use(
  cors({
    origin: ["http://", "https://app-farmaciacliente-2b5fcd147bad.herokuapp.com", 'https://caramelo.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  })
);

//middlewares OJO EL ORDEN ES IMPORTANTE
app.use(morgan('dev'));
app.use(express.json());

app.use(cookieParser());


//routes


app.use(usuariosRoutes);
app.use(centrosRoutes);
app.use(medicamentoRoutes);
app.use(movimientosRoutes);
app.use(farmaciaRoutes);
app.use(privadoRoutes);





export default app;