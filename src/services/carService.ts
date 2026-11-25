import api from './api';
import type { CarRequest, CarResponse, CarStatus, CarWithRentalsResponse } from '../types/car';

export async function getAllCars(status?: CarStatus): Promise<CarResponse[]> {
  // GET /api/cars or GET /api/cars?status=AVAILABLE
  const response = await api.get<CarResponse[]>('/api/cars', { params: status ? { status } : {} });
  return response.data;
}

export async function getCarById(carId: string): Promise<CarResponse> {
  const response = await api.get<CarResponse>(`/api/cars/${carId}`);
  return response.data;
}

// aggregated: car + all its rentals
export async function getCarWithRentals(carId: string): Promise<CarWithRentalsResponse> {
  const response = await api.get<CarWithRentalsResponse>(`/api/cars/${carId}/rentals`);
  return response.data;
}

export async function createCar(car: CarRequest): Promise<CarResponse> {
  const response = await api.post<CarResponse>('/api/cars', car);
  return response.data;
}

export async function updateCar(carId: string, car: CarRequest): Promise<CarResponse> {
  const response = await api.put<CarResponse>(`/api/cars/${carId}`, car);
  return response.data;
}

export async function deleteCar(carId: string): Promise<void> {
  await api.delete(`/api/cars/${carId}`);
}
