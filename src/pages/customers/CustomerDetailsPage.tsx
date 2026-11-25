import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteCustomer, getCustomerWithRentals } from '../../services/customerService';
import { getAllCars } from '../../services/carService';
import { getErrorMessage } from '../../services/api';
import type { CustomerWithRentalsResponse } from '../../types/customer';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { IdTag } from '../../components/IdTag';
import { RentalsTable } from '../../components/RentalsTable';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carName, customerName, formatMoney } from '../../utils/format';

export function CustomerDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [customer, setCustomer] = useState<CustomerWithRentalsResponse | null>(null);
  const [carNames, setCarNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadCustomer() {
    setLoading(true);
    setError('');
    try {
      // aggregated response: the customer + their rentals
      const data = await getCustomerWithRentals(customerId!);
      setCustomer(data);

      // the rentals only have the car id, so we load the cars to show their names
      const cars = await getAllCars();
      const names: Record<string, string> = {};
      cars.forEach((car) => (names[car.carId] = carName(car)));
      setCarNames(names);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  async function handleDelete() {
    if (!customer) return;
    setDeleting(true);
    try {
      await deleteCustomer(customer.customerId);
      showToast(`${customerName(customer)} was deleted`);
      navigate('/customers');
    } catch (err) {
      showToast('Could not delete the customer: ' + getErrorMessage(err), 'error');
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) return <Loader text={`Loading ${customerId}...`} />;
  if (error || !customer)
    return <ErrorMessage message={error} onRetry={loadCustomer} backLink="/customers" backText="Back to customers" />;

  let totalBooked = 0;
  customer.rentals.forEach((rental) => {
    if (rental.status !== 'CANCELLED') totalBooked += Number(rental.totalCost);
  });

  return (
    <>
      <PageHeader
        title={customerName(customer)}
        subtitle={<IdTag id={customer.customerId} kind="customer" />}
        backLink="/customers"
        backText="Customers"
        actions={
          <>
            <Link to={`/customers/${customer.customerId}/edit`} className="btn btn-secondary">
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
            <dt>Email</dt>
            <dd>{customer.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{customer.phone}</dd>
          </div>
          <div>
            <dt>Rentals</dt>
            <dd>{customer.rentals.length}</dd>
          </div>
          <div>
            <dt>Total booked</dt>
            <dd>{formatMoney(totalBooked)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Rentals</h2>
          <Link to={`/rentals/new?customerId=${customer.customerId}`} className="btn btn-small btn-secondary">
            New rental for {customer.firstName}
          </Link>
        </div>
        {customer.rentals.length === 0 ? (
          <p className="muted">{customer.firstName} hasn't rented a car yet.</p>
        ) : (
          <RentalsTable rentals={customer.rentals} show="car" names={carNames} />
        )}
      </section>

      {showDelete && (
        <ConfirmDialog
          title={`Delete ${customerName(customer)}?`}
          message={`${customer.customerId} and their ${customer.rentals.length} rental(s) will be deleted. This can't be undone.`}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
