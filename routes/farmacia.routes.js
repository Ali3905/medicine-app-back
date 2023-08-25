import { Router } from "express";
import { createSalidaHdD, balanceteHdD, createInventarioHdd, obtenerListaHdd} from "../controllers/farmacia.controllers.js";
import {autorizar} from '../middlewares/validarToken.js';
const router = new Router()

router.post('/salidaDeHdD',autorizar, createSalidaHdD);
router.get('/balanceteHdD', balanceteHdD)
router.post('/inventarioHdD',autorizar, createInventarioHdd);
router.get('/listaHdd' ,obtenerListaHdd)



export default router