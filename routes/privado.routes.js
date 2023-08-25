import { Router } from "express";
import { createSalidaPriv, createEntradaPriv, createInventarioPriv, ListaMedicamentosPriv, balancePriv} from "../controllers/privado.controllers.js";
import { autorizar } from "../middlewares/validarToken.js";
const router = new Router()

router.post('/salidaPriv',autorizar, createSalidaPriv);
router.post('/entradaPriv',autorizar,createEntradaPriv)
router.post('/inventarioPriv',autorizar, createInventarioPriv);
router.get('/listaPrivado', ListaMedicamentosPriv);
router.get('/balancePriv', balancePriv);


export default router