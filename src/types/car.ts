// Mirrors the car DTOs of the Spring Boot API (carmanagement.presentationlayer.dto)
import type { RentalResponse } from './rental';

export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';

export const CAR_STATUSES: CarStatus[] = ['AVAILABLE', 'RENTED', 'MAINTENANCE'];

// CarRequestDTO
export interface CarRequest {
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  status: CarStatus;
}

// CarResponseDTO
export interface CarResponse {
  carId: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  status: CarStatus;
}

// CarWithRentalsResponseDTO (aggregated: GET /api/cars/{carId}/rentals)
export interface CarWithRentalsResponse extends CarResponse {
  rentals: RentalResponse[];
}

// CarSummaryDTO (embedded in RentalWithDetailsResponseDTO)
export interface CarSummary {
  carId: string;
  make: string;
  model: string;
  year: number;
}
