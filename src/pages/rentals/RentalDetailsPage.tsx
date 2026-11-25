import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRental, getRentalWithDetails } from '../../services/rentalService';
import { getErrorMessage } from '../../services/api';
import type { RentalWithDetailsResponse } from '../../types/rental';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { StatusBadge } from '../../components/StatusBadge';
import { IdTag } from '../../components/IdTag';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { carName, formatDate, formatMoney, initials } from '../../utils/format';

export function RentalDetailsPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rental, setRental] = useState<RentalWithDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadRental() {
    setLoading(true);
    setError('');
    try {
      // aggregated response: the rental + a summary of its customer and its car
      setRental(await getRentalWithDetails(rentalId!));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRental();
  }, [rentalId]);

  async function handleDelete() {
    if (!rental) return;
    setDeleting(true);
    try {
      await deleteRental(rental.rentalId);
      showToast(`Rental ${rental.rentalId} was deleted`);
      navigate('/rentals');
    } catch (err) {
      showToast('Could not delete the rental: ' + getErrorMessage(err), 'error');
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) return <Loader text={`Loading rental ${rentalId}...`} />;
  if (error || !rental)
    return <ErrorMessage message={error} onRetry={loadRental} backLink="/rentals" backText="Back to rentals" />;

  return (
    <>
      <PageHeader
        title={`Rental ${rental.rentalId}`}
        subtitle={`${formatDate(rental.startDate)} – ${formatDate(rental.endDate)}`}
        backLink="/rentals"
        backText="Rentals"
        actions={
          <>
            <Link to={`/rentals/${rental.rentalId}/edit`} className="btn btn-secondary">
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
            <dt>Status</dt>
            <dd>
              <StatusBadge status={rental.status} />
            </dd>
          </div>
          <div>
            <dt>Pickup</dt>
            <dd>{formatDate(rental.startDate)}</dd>
          </div>
          <div>
            <dt>Return</dt>
            <dd>{formatDate(rental.endDate)}</dd>
          </div>
          <div>
            <dt>Total cost</dt>
            <dd className="facts-strong">{formatMoney(rental.totalCost)}</dd>
          </div>
        </dl>
      </section>

      {/* links to the related customer and car */}
      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">Customer</h2>
          <Link to={`/customers/${rental.customer.customerId}`} className="related">
            <span className="avatar avatar-large">{initials(rental.customer.fullName)}</span>
            <span>
              <strong>{rental.customer.fullName}</strong>
              <span className="muted block">{rental.customer.email}</span>
              <IdTag id={rental.customer.customerId} kind="customer" />
            </span>
          </Link>
        </section>

        <section className="panel">
          <h2 className="panel-title">Car</h2>
          <Link to={`/cars/${rental.car.carId}`} className="related">
            <IdTag id={rental.car.carId} kind="car" />
            <span>
              <strong>
                {rental.car.make} {rental.car.model}
              </strong>
              <span className="muted block">{rental.car.year}</span>
            </span>
          </Link>
        </section>
      </div>

      {showDelete && (
        <ConfirmDialog
          title={`Delete rental ${rental.rentalId}?`}
          message={`${rental.customer.fullName}'s booking of the ${carName(rental.car)} will be removed. This can't be undone.`}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
