// Mirrors the customer DTOs of the Spring Boot API (customermanagement.presentationlayer.dto)
import type { RentalResponse } from './rental';

// CustomerRequestDTO
export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// CustomerResponseDTO
export interface CustomerResponse extends CustomerRequest {
  customerId: string;
}

// CustomerWithRentalsResponseDTO (aggregated: GET /api/customers/{customerId}/rentals)
export interface CustomerWithRentalsResponse extends CustomerResponse {
  rentals: RentalResponse[];
}

// CustomerSummaryDTO (embedded in RentalWithDetailsResponseDTO)
export interface CustomerSummary {
  customerId: string;
  fullName: string;
  email: string;
}
