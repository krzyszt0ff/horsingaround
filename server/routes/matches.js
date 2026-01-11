import express from 'express';
import { listMatches, deleteMatch, listMessages, listChats } from '../controllers/matchesController.js';
import { rankLikes, rankMatches } from '../controllers/rankingController.js';

const router = express.Router();

// PROFIL
router.get('/',listMatches);                        //zwraca kod statusu, obiekty w postaci: kod statusu, id_matchu, obiekt z danymi profilu osoby z matcha, treść ostatniej wiadomości last_message
router.delete('/', deleteMatch);                    //zwraca kod statusu

// CHAT
router.get('/:matchid/messages', listMessages);     //zwraca kod statusu, wiadomości przypisane do czatu danego matcha posortowane malejąco (najpierw najnowsze);
router.get('/chats', listChats);                    //zwraca kod statusu, matche przypisane do użytkowika, ostatnią wiadomość

// RANKING
router.get('/rank/likes/:gender', rankLikes);       //zwraca kod statusu, listę użytkowników z największą ilością polubień i ilość polubień
router.get('/rank/matches/:gender', rankMatches);   //zwraca kod statusu, listę użytkowników z największą ilością matchy i ich ilość

export default router;