import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteCar, getCarWithRentals } from '../../services/carService';
import { getAllCustomers } from '../../services/customerService';
import { getErrorMessage } from '../../services/api';
import type { CarWithRentalsResponse } from '../../types/car';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/StatusBadge';
import { IdTag } from '../../components/IdTag';
import { RentalsTable } from '../../components/RentalsTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carName, customerName, formatMoney } from '../../utils/format';

export function CarDetailsPage() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [car, setCar] = useState<CarWithRentalsResponse | null>(null);
  const [customerNames, setCustomerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadCar() {
    setLoading(true);
    setError('');
    try {
      // aggregated response: the car + its rentals
      const data = await getCarWithRentals(carId!);
      setCar(data);

      // the rentals only have the customer id, so we load the customers to show their names
      const customers = await getAllCustomers();
      const names: Record<string, string> = {};
      customers.forEach((customer) => (names[customer.customerId] = customerName(customer)));
      setCustomerNames(names);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCar();
  }, [carId]);

  async function handleDelete() {
    if (!car) return;
    setDeleting(true);
    try {
      await deleteCar(car.carId);
      showToast(`${carName(car)} was deleted`);
      navigate('/cars');
    } catch (err) {
      showToast('Could not delete the car: ' + getErrorMessage(err), 'error');
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) return <Loader text={`Loading ${carId}...`} />;
  if (error || !car) return <ErrorMessage message={error} onRetry={loadCar} backLink="/cars" backText="Back to fleet" />;

  return (
    <>
      <PageHeader
        title={`${car.make} ${car.model}`}
        subtitle={<IdTag id={car.carId} kind="car" />}
        backLink="/cars"
        backText="Fleet"
        actions={
          <>
            <Link to={`/cars/${car.carId}/edit`} className="btn btn-secondary">
              Edit
            </Link>
            <button className="btn btn-danger-outline" onClick={() => setShowDelete(true)}>
              Delete
            </button>
          </>
        }
      />

      <section className="panel">
        <dl className="facts">
          <div>
            <dt>Year</dt>
            <dd>{car.year}</dd>
          </div>
          <div>
            <dt>Daily rate</dt>
            <dd>{formatMoney(car.dailyRate)}</dd>
          </div>
          <div>
            <dt>Availability</dt>
            <dd>
              <StatusBadge status={car.status} />
            </dd>
          </div>
          <div>
            <dt>Times rented</dt>
            <dd>{car.rentals.length}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Rental history</h2>
          <Link to={`/rentals/new?carId=${car.carId}`} className="btn btn-small btn-secondary">
            Book this car
          </Link>
        </div>
        {car.rentals.length === 0 ? (
          <p className="muted">This car hasn't been rented yet.</p>
        ) : (
          <RentalsTable rentals={car.rentals} show="customer" names={customerNames} />
        )}
      </section>

      {showDelete && (
        <ConfirmDialog
          title={`Delete ${carName(car)}?`}
          message={`${car.carId} and its ${car.rentals.length} rental(s) will be deleted. This can't be undone.`}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
