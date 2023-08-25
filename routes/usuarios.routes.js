import {Router} from 'express';
import {login, register, verificarToken} from '../controllers/usuarios.controllers.js';


const router = Router();

router.post('/api/registro', register);
router.post('/login', login);

router.get('/api/verify', verificarToken);


 
export default router;