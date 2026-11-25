import api from './api';
import type { CustomerRequest, CustomerResponse, CustomerWithRentalsResponse } from '../types/customer';

export async function getAllCustomers(): Promise<CustomerResponse[]> {
  const response = await api.get<CustomerResponse[]>('/api/customers');
  return response.data;
}

export async function getCustomerById(customerId: string): Promise<CustomerResponse> {
  const response = await api.get<CustomerResponse>(`/api/customers/${customerId}`);
  return response.data;
}

// aggregated: customer + all their rentals
export async function getCustomerWithRentals(customerId: string): Promise<CustomerWithRentalsResponse> {
  const response = await api.get<CustomerWithRentalsResponse>(`/api/customers/${customerId}/rentals`);
  return response.data;
}

export async function createCustomer(customer: CustomerRequest): Promise<CustomerResponse> {
  const response = await api.post<CustomerResponse>('/api/customers', customer);
  return response.data;
}

export async function updateCustomer(customerId: string, customer: CustomerRequest): Promise<CustomerResponse> {
  const response = await api.put<CustomerResponse>(`/api/customers/${customerId}`, customer);
  return response.data;
}

export async function deleteCustomer(customerId: string): Promise<void> {
  await api.delete(`/api/customers/${customerId}`);
}
