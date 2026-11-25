import { Route, Routes } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { CarListPage } from '../pages/cars/CarListPage';
import { CarDetailsPage } from '../pages/cars/CarDetailsPage';
import { CarFormPage } from '../pages/cars/CarFormPage';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { CustomerDetailsPage } from '../pages/customers/CustomerDetailsPage';
import { CustomerFormPage } from '../pages/customers/CustomerFormPage';
import { RentalListPage } from '../pages/rentals/RentalListPage';
import { RentalDetailsPage } from '../pages/rentals/RentalDetailsPage';
import { RentalFormPage } from '../pages/rentals/RentalFormPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />

        <Route path="cars" element={<CarListPage />} />
        <Route path="cars/new" element={<CarFormPage />} />
        <Route path="cars/:carId" element={<CarDetailsPage />} />
        <Route path="cars/:carId/edit" element={<CarFormPage />} />

        <Route path="customers" element={<CustomerListPage />} />
        <Route path="customers/new" element={<CustomerFormPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailsPage />} />
        <Route path="customers/:customerId/edit" element={<CustomerFormPage />} />

        <Route path="rentals" element={<RentalListPage />} />
        <Route path="rentals/new" element={<RentalFormPage />} />
        <Route path="rentals/:rentalId" element={<RentalDetailsPage />} />
        <Route path="rentals/:rentalId/edit" element={<RentalFormPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
