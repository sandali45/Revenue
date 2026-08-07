import { ApiError } from '../utils/api-error.js';
import * as repository from '../repositories/revenue.repository.js';

function positiveInteger(value, fieldName) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive integer`);
  }

  return number;
}

export async function getOverview() {
  return repository.fetchOverview();
}

export async function getWorkers() {
  return repository.fetchWorkers();
}

export async function getCommission() {
  const commissionRate = await repository.fetchCommissionRate();
  return { commissionRate };
}

export async function updateCommission(value) {
  const commissionRate = Number(value);

  if (
    !Number.isFinite(commissionRate) ||
    commissionRate < 0 ||
    commissionRate > 100
  ) {
    throw new ApiError(400, 'Commission rate must be between 0 and 100');
  }

  return repository.saveCommissionRate(commissionRate);
}

export async function getEarnings(query) {
  return repository.fetchEarnings({
    status: query.status,
    workerId: query.workerId,
    search: query.search,
  });
}

export async function calculateAllMissingEarnings() {
  return repository.createAllMissingEarnings();
}

export async function calculateBookingEarning(value) {
  const bookingId = positiveInteger(value, 'Booking ID');
  const result = await repository.createBookingEarning(bookingId);

  if (result.reason === 'booking_not_found') {
    throw new ApiError(404, 'Booking not found');
  }

  if (result.reason === 'booking_not_completed') {
    throw new ApiError(
      409,
      'Earning can only be calculated for a completed booking'
    );
  }

  return result;
}

export async function getSettlements(query) {
  return repository.fetchSettlements({
    status: query.status,
    workerId: query.workerId,
  });
}

export async function createSettlement(value) {
  const workerId = positiveInteger(value, 'Worker ID');
  const result = await repository.createWorkerSettlement(workerId);

  if (result.reason === 'worker_not_found') {
    throw new ApiError(404, 'Worker not found');
  }

  if (result.reason === 'no_pending_earnings') {
    throw new ApiError(409, 'This worker has no pending earnings');
  }

  return result.settlement;
}

export async function completeSettlement(idValue, referenceNoValue) {
  const settlementId = positiveInteger(idValue, 'Settlement ID');
  const referenceNo = String(referenceNoValue || '').trim();

  if (!referenceNo) {
    throw new ApiError(400, 'Reference number is required');
  }

  const result = await repository.completeWorkerSettlement(
    settlementId,
    referenceNo
  );

  if (result.reason === 'settlement_not_found') {
    throw new ApiError(404, 'Settlement not found');
  }

  if (result.reason === 'already_completed') {
    throw new ApiError(409, 'Settlement is already completed');
  }

  return result.settlement;
}

export async function getMonthlyReport() {
  return repository.fetchMonthlyReport();
}
