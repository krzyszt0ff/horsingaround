import express from 'express';
<<<<<<< HEAD
import { listReports, getReport, changeReportStatus, changeUserRole, listUsers } from '../controllers/adminController.js';
=======
import { listReports, getReport, changeReportStatus, changeUserRole, listUsers } from '../controllers/adminController';
>>>>>>> d62c256 (Dodane modele, routery i kontrolery do obsługi funkcjonalności: matche, like'i, wiadomości, zgłoszenia)

const router = express.Router();

router.get('/reports', listReports);//zwraca listę aktywnych zgłoszeń, kod statusu
router.get('/users', listUsers);//zwraca listę użytkowników: id, email oraz rolę, kod statusu
router.get('/reports/:id', getReport);//zwraca pojedyncze zgłoszenie, kod statusu
router.patch('/reports/:id', changeReportStatus);//zwraca zmodyfikowane zgłoszenie, kod statusu
router.patch('/users/:id', changeUserRole);//zwraca kod statusu

export default router;