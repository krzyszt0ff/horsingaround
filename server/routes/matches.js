import express from 'express';
import { listMatches, deleteMatch, listMessages, sendMessage } from '../controllers/matchesController.js';

const router = express.Router();

router.get('/',listMatches);//zwraca obiekty w postaci: kod statusu, id_matchu, obiekt z danymi profilu osoby z matcha, treść ostatniej wiadomości last_message
router.delete('/:id', deleteMatch);//zwraca kod statusu
router.get('/:matchid/messages', listMessages);//zwraca kod statusu, wiadomości przypisane do czatu danego matcha posortowane malejąco (najpierw najnowsze);
router.post(':matchid/messages', sendMessage);//zwraca kod statusu i utworzoną wiadomość

export default router;


