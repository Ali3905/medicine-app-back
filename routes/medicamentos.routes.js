import {Router} from 'express'
import {autorizar} from '../middlewares/validarToken.js';
import {getMedicamentos, encontrarMedicamento, createMedicamento, actFechaCad, buscarMedicamentos, buscarMedicamentosS, buscarMedicamentosHdD, buscarMedicamentosPriv} from '../controllers/medicamentos.controllers.js';

const router = new Router();

router.get('/medicamentos', getMedicamentos);
router.post('/nuevoMedicamento',autorizar, createMedicamento);
router.get('/medicamentos/:id', encontrarMedicamento);
router.get('/api/medicamentos/:nombre', buscarMedicamentos);
router.get('/api/medicamentosS/:nombre/:centro', buscarMedicamentosS);
router.get('/api/medicamentosHdD/:nombre', buscarMedicamentosHdD);
router.get('/api/medicamentosPriv/:nombre', buscarMedicamentosPriv);

router.post('/cambiarMedicamento/',autorizar, actFechaCad);

export default router;