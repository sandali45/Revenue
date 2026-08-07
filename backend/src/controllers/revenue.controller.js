import { asyncHandler } from '../utils/async-handler.js';
import * as service from '../services/revenue.service.js';

export const getOverview = asyncHandler(async (req, res) => {
  const data = await service.getOverview();
  res.json({ success: true, data });
});

export const getWorkers = asyncHandler(async (req, res) => {
  const data = await service.getWorkers();
  res.json({ success: true, data });
});

export const getCommission = asyncHandler(async (req, res) => {
  const data = await service.getCommission();
  res.json({ success: true, data });
});

export const updateCommission = asyncHandler(async (req, res) => {
  const data = await service.updateCommission(req.body?.commissionRate);
  res.json({
    success: true,
    message: 'Commission rate updated',
    data,
  });
});

export const getEarnings = asyncHandler(async (req, res) => {
  const data = await service.getEarnings(req.query);
  res.json({ success: true, data });
});

export const calculateAllMissingEarnings = asyncHandler(async (req, res) => {
  const data = await service.calculateAllMissingEarnings();
  res.json({
    success: true,
    message: `${data.createdCount} earning record(s) created`,
    data,
  });
});

export const calculateBookingEarning = asyncHandler(async (req, res) => {
  const data = await service.calculateBookingEarning(req.params.bookingId);
  res.status(data.created ? 201 : 200).json({
    success: true,
    message: data.created
      ? 'Earning calculated successfully'
      : 'Earning already exists',
    data: data.earning,
  });
});

export const getSettlements = asyncHandler(async (req, res) => {
  const data = await service.getSettlements(req.query);
  res.json({ success: true, data });
});

export const createSettlement = asyncHandler(async (req, res) => {
  const data = await service.createSettlement(req.body?.workerId);
  res.status(201).json({
    success: true,
    message: 'Settlement created',
    data,
  });
});

export const completeSettlement = asyncHandler(async (req, res) => {
  const data = await service.completeSettlement(
    req.params.id,
    req.body?.referenceNo
  );
  res.json({
    success: true,
    message: 'Settlement completed',
    data,
  });
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const data = await service.getMonthlyReport();
  res.json({ success: true, data });
});
