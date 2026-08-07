import { Router } from 'express';
import { requireAdmin } from '../middleware/require-admin.js';
import * as controller from '../controllers/revenue.controller.js';

const router = Router();

router.use(requireAdmin);

router.get('/overview', controller.getOverview);
router.get('/workers', controller.getWorkers);

router.get('/settings/commission', controller.getCommission);
router.put('/settings/commission', controller.updateCommission);

router.get('/earnings', controller.getEarnings);
router.post('/earnings/calculate-all', controller.calculateAllMissingEarnings);
router.post('/bookings/:bookingId/calculate', controller.calculateBookingEarning);

router.get('/settlements', controller.getSettlements);
router.post('/settlements', controller.createSettlement);
router.patch('/settlements/:id/complete', controller.completeSettlement);

router.get('/reports/monthly', controller.getMonthlyReport);

export default router;
