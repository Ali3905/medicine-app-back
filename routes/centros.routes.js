import {Router} from 'express'
import {getCentros, createCentro, actCentro, getMovimientosCentros, getStockMovSelec, getMonthlyStockByMedicine} from '../controllers/centros.controllers.js';

const router = new Router();

router.get('/allCentros', getCentros);
router.post('/nuevoCentro', createCentro);
router.put('/actualizarC/:id', actCentro);
router.get('/movimientosCentro/:centro', getMovimientosCentros);
router.get('/stockMovSelec/:id', getStockMovSelec)
router.get('/getMonthCentroMedicine/:centro', getMonthlyStockByMedicine)


export default router;