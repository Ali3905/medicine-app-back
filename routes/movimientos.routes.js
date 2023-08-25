import {Router} from 'express'
import { createSalidaAlmacen, createEntradaAlmacen, createInventario, balanceDep} from '../controllers/movimientos.controllers.js'
import { autorizar } from '../middlewares/validarToken.js';
const router = Router();

router.post('/nuevaSalidaAlmacen',autorizar, createSalidaAlmacen);
router.post('/nuevaEntradaAlmacen',autorizar, createEntradaAlmacen);
router.post('/createInventario',autorizar, createInventario);
router.get('/balanceteDep', balanceDep);




export default router;