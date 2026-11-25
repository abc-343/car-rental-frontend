import api from './api';
import type { RentalRequest, RentalResponse, RentalStatus, RentalWithDetailsResponse } from '../types/rental';

export async function getAllRentals(status?: RentalStatus): Promise<RentalResponse[]> {
  // GET /api/rentals or GET /api/rentals?status=ACTIVE
  const response = await api.get<RentalResponse[]>('/api/rentals', { params: status ? { status } : {} });
  return response.data;
}

export async function getRentalById(rentalId: string): Promise<RentalResponse> {
  const response = await api.get<RentalResponse>(`/api/rentals/${rentalId}`);
  return response.data;
}

// aggregated: rental + customer summary + car summary
export async function getRentalWithDetails(rentalId: string): Promise<RentalWithDetailsResponse> {
  const response = await api.get<RentalWithDetailsResponse>(`/api/rentals/${rentalId}/details`);
  return response.data;
}

export async function createRental(rental: RentalRequest): Promise<RentalResponse> {
  const response = await api.post<RentalResponse>('/api/rentals', rental);
  return response.data;
}

export async function updateRental(rentalId: string, rental: RentalRequest): Promise<RentalResponse> {
  const response = await api.put<RentalResponse>(`/api/rentals/${rentalId}`, rental);
  return response.data;
}

export async function deleteRental(rentalId: string): Promise<void> {
  await api.delete(`/api/rentals/${rentalId}`);
}
