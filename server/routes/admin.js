import express from 'express';
import { listReports, getReport, changeReportStatus,  softDeleteUser,
  restoreUser,changeUserRole, listUsers } from '../controllers/adminController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";
import authAdmin from "../middleware/authAdmin.js";

const router = express.Router();
router.use(authMiddleware, authAdmin);

router.get('/reports', listReports);//zwraca listę aktywnych zgłoszeń, kod statusu
router.get('/users', listUsers);//zwraca listę użytkowników: id, email oraz rolę, kod statusu
router.get('/reports/:id', getReport);//zwraca pojedyncze zgłoszenie, kod statusu
router.patch('/reports/:id', changeReportStatus);//zwraca zmodyfikowane zgłoszenie, kod statusu
router.patch('/users/:id', changeUserRole);//zwraca kod statusu
router.patch("/users/:id/soft-delete", softDeleteUser);
router.patch("/users/:id/restore", restoreUser);
export default router;