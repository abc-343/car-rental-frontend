import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCar, getAllCars } from '../../services/carService';
import { getErrorMessage } from '../../services/api';
import type { CarResponse, CarStatus } from '../../types/car';
import { CAR_STATUSES } from '../../types/car';
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
import { carName, formatMoney } from '../../utils/format';

export function CarListPage() {
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [carToDelete, setCarToDelete] = useState<CarResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function loadCars() {
    setLoading(true);
    setError('');
    try {
      // the status filter is done by the backend: GET /api/cars?status=...
      const data = await getAllCars(statusFilter ? (statusFilter as CarStatus) : undefined);
      setCars(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // reload every time the status filter changes
  useEffect(() => {
    loadCars();
  }, [statusFilter]);

  async function handleDelete() {
    if (!carToDelete) return;
    setDeleting(true);
    try {
      await deleteCar(carToDelete.carId);
      showToast(`${carName(carToDelete)} was deleted`);
      setCarToDelete(null);
      loadCars();
    } catch (err) {
      showToast('Could not delete the car: ' + getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('');
  }

  // the search is done here, on the cars we already loaded
  const text = search.toLowerCase();
  const filteredCars = cars.filter(
    (car) =>
      car.carId.toLowerCase().includes(text) ||
      car.make.toLowerCase().includes(text) ||
      car.model.toLowerCase().includes(text) ||
      String(car.year).includes(text),
  );

  const hasFilters = search !== '' || statusFilter !== '';

  return (
    <>
      <PageHeader
        title="Fleet"
        subtitle="Every car the branch can rent, with its daily rate and availability."
        actions={
          <Link to="/cars/new" className="btn btn-primary">
            Add car
          </Link>
        }
      />

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by make, model, year or plate" />
        <FilterChips options={CAR_STATUSES} selected={statusFilter} onSelect={setStatusFilter} />
        {hasFilters && (
          <button className="btn btn-link" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <Loader text="Loading the fleet..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCars} />
      ) : filteredCars.length === 0 ? (
        hasFilters ? (
          <EmptyState title="No cars match" message="Try another search or availability filter.">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <EmptyState title="The fleet is empty" message="Add a car so it can be rented.">
            <Link to="/cars/new" className="btn btn-primary">
              Add car
            </Link>
          </EmptyState>
        )
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Plate</th>
                <th>Car</th>
                <th className="num">Daily rate</th>
                <th>Availability</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.carId}>
                  <td data-label="Plate">
                    <IdTag id={car.carId} kind="car" />
                  </td>
                  <td data-label="Car">
                    <span>
                      <Link to={`/cars/${car.carId}`} className="row-title">
                        {car.make} {car.model}
                      </Link>
                      <span className="muted"> {car.year}</span>
                    </span>
                  </td>
                  <td data-label="Daily rate" className="num">
                    {formatMoney(car.dailyRate)}
                  </td>
                  <td data-label="Availability">
                    <StatusBadge status={car.status} />
                  </td>
                  <td className="row-actions">
                    <Link to={`/cars/${car.carId}`} className="btn btn-small btn-ghost">
                      View
                    </Link>
                    <Link to={`/cars/${car.carId}/edit`} className="btn btn-small btn-ghost">
                      Edit
                    </Link>
                    <button className="btn btn-small btn-ghost-danger" onClick={() => setCarToDelete(car)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-foot muted">
            Showing {filteredCars.length} of {cars.length} cars
          </p>
        </div>
      )}

      {carToDelete && (
        <ConfirmDialog
          title={`Delete ${carName(carToDelete)}?`}
          message={`${carToDelete.carId} and all of its rentals will be deleted. This can't be undone.`}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setCarToDelete(null)}
        />
      )}
    </>
  );
}
