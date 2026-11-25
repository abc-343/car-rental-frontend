import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRental, getAllRentals } from '../../services/rentalService';
import { getAllCustomers } from '../../services/customerService';
import { getAllCars } from '../../services/carService';
import { getErrorMessage } from '../../services/api';
import type { RentalResponse, RentalStatus } from '../../types/rental';
import { RENTAL_STATUSES } from '../../types/rental';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { SearchBar } from '../../components/SearchBar';
import { FilterChips } from '../../components/FilterChips';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { IdTag } from '../../components/IdTag';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carName, customerName, formatDate, formatMoney } from '../../utils/format';

export function RentalListPage() {
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [carNames, setCarNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rentalToDelete, setRentalToDelete] = useState<RentalResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function loadRentals() {
    setLoading(true);
    setError('');
    try {
      // the status filter is done by the backend: GET /api/rentals?status=...
      const [rentalList, customers, cars] = await Promise.all([
        getAllRentals(statusFilter ? (statusFilter as RentalStatus) : undefined),
        getAllCustomers(),
        getAllCars(),
      ]);
      setRentals(rentalList);

      // id -> name, to show names in the table instead of ids
      const customerMap: Record<string, string> = {};
      customers.forEach((customer) => (customerMap[customer.customerId] = customerName(customer)));
      setCustomerNames(customerMap);

      const carMap: Record<string, string> = {};
      cars.forEach((car) => (carMap[car.carId] = carName(car)));
      setCarNames(carMap);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRentals();
  }, [statusFilter]);

  async function handleDelete() {
    if (!rentalToDelete) return;
    setDeleting(true);
    try {
      await deleteRental(rentalToDelete.rentalId);
      showToast(`Rental ${rentalToDelete.rentalId} was deleted`);
      setRentalToDelete(null);
      loadRentals();
    } catch (err) {
      showToast('Could not delete the rental: ' + getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
  }

  // search by rental number, customer name or car name
  const text = search.toLowerCase();
  const filteredRentals = rentals.filter((rental) => {
    const customer = customerNames[rental.customerId] || rental.customerId;
    const car = carNames[rental.carId] || rental.carId;
    return (
      rental.rentalId.toLowerCase().includes(text) ||
      customer.toLowerCase().includes(text) ||
      car.toLowerCase().includes(text)
    );
  });

  const hasFilters = search !== '' || statusFilter !== '';

  return (
    <>
      <PageHeader
        title="Rentals"
        subtitle="Bookings from reservation to return."
        actions={
          <Link to="/rentals/new" className="btn btn-primary">
            New rental
          </Link>
        }
      />

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer, car or rental number" />
        <FilterChips options={RENTAL_STATUSES} selected={statusFilter} onSelect={setStatusFilter} />
        {hasFilters && (
          <button className="btn btn-link" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <Loader text="Loading rentals..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadRentals} />
      ) : filteredRentals.length === 0 ? (
        hasFilters ? (
          <EmptyState title="No rentals match" message="Try another search or status.">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <EmptyState title="No rentals yet" message="Book a car for a customer to see it here.">
            <Link to="/rentals/new" className="btn btn-primary">
              New rental
            </Link>
          </EmptyState>
        )
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Rental</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Dates</th>
                <th className="num">Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRentals.map((rental) => (
                <tr key={rental.rentalId}>
                  <td data-label="Rental">
                    <Link to={`/rentals/${rental.rentalId}`}>
                      <IdTag id={rental.rentalId} kind="rental" />
                    </Link>
                  </td>
                  <td data-label="Customer">
                    <Link to={`/customers/${rental.customerId}`}>
                      {customerNames[rental.customerId] || rental.customerId}
                    </Link>
                  </td>
                  <td data-label="Car">
                    <Link to={`/cars/${rental.carId}`}>{carNames[rental.carId] || rental.carId}</Link>
                  </td>
                  <td data-label="Dates">
                    {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                  </td>
                  <td data-label="Total" className="num">
                    {formatMoney(rental.totalCost)}
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={rental.status} />
                  </td>
                  <td className="row-actions">
                    <Link to={`/rentals/${rental.rentalId}`} className="btn btn-small btn-ghost">
                      View
                    </Link>
                    <Link to={`/rentals/${rental.rentalId}/edit`} className="btn btn-small btn-ghost">
                      Edit
                    </Link>
                    <button className="btn btn-small btn-ghost-danger" onClick={() => setRentalToDelete(rental)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-foot muted">
            Showing {filteredRentals.length} of {rentals.length} rentals
          </p>
        </div>
      )}

      {rentalToDelete && (
        <ConfirmDialog
          title={`Delete rental ${rentalToDelete.rentalId}?`}
          message="This booking will be removed from the customer's and the car's history. This can't be undone."
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setRentalToDelete(null)}
        />
      )}
    </>
  );
}
