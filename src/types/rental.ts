// Mirrors the rental DTOs of the Spring Boot API (rentalmanagement.presentationlayer.dto)
import type { CarSummary } from './car';
import type { CustomerSummary } from './customer';

export type RentalStatus = 'RESERVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export const RENTAL_STATUSES: RentalStatus[] = ['RESERVED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

// RentalRequestDTO (rentalId and totalCost are generated/calculated by the server)
export interface RentalRequest {
  customerId: string;
  carId: string;
  startDate: string; // ISO date, yyyy-MM-dd
  endDate: string;
  status: RentalStatus;
}

// RentalResponseDTO
export interface RentalResponse extends RentalRequest {
  rentalId: string;
  totalCost: number;
}

// RentalWithDetailsResponseDTO (aggregated: GET /api/rentals/{rentalId}/details)
export interface RentalWithDetailsResponse {
  rentalId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: RentalStatus;
  customer: CustomerSummary;
  car: CarSummary;
}
