import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createRental, getRentalById, updateRental } from '../../services/rentalService';
import { getAllCustomers } from '../../services/customerService';
import { getAllCars } from '../../services/carService';
import { getErrorMessage, getFieldErrors } from '../../services/api';
import type { RentalRequest, RentalStatus } from '../../types/rental';
import { RENTAL_STATUSES } from '../../types/rental';
import type { CarResponse } from '../../types/car';
import type { CustomerResponse } from '../../types/customer';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { FormField } from '../../components/FormField';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { carName, customerName, formatMoney, titleCase } from '../../utils/format';

// /rentals/new -> create, /rentals/:rentalId/edit -> update
export function RentalFormPage() {
  const { rentalId } = useParams();
  const isEdit = rentalId !== undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // if we come from a customer or a car page, that customer/car is already selected
  const [form, setForm] = useState<RentalRequest>({
    customerId: searchParams.get('customerId') || '',
    carId: searchParams.get('carId') || '',
    startDate: '',
    endDate: '',
    status: 'RESERVED',
  });

  // lists for the dropdowns
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [cars, setCars] = useState<CarResponse[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [customerList, carList] = await Promise.all([getAllCustomers(), getAllCars()]);
        setCustomers(customerList);
        setCars(carList);

        // edit mode: fill the form with the current values of the rental
        if (rentalId) {
          const rental = await getRentalById(rentalId);
          setForm({
            customerId: rental.customerId,
            carId: rental.carId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
          });
        }
      } catch (err) {
        setLoadError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [rentalId]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // same rules as the validation annotations on RentalRequestDTO
  function validate() {
    const newErrors: Record<string, string> = {};
    if (form.customerId === '') newErrors.customerId = 'Choose a customer.';
    if (form.carId === '') newErrors.carId = 'Choose a car.';
    if (form.startDate === '') newErrors.startDate = 'Choose a pickup date.';
    if (form.endDate === '') newErrors.endDate = 'Choose a return date.';
    else if (form.startDate !== '' && form.endDate < form.startDate) {
      newErrors.endDate = "The return date can't be before the pickup date.";
    }
    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      // the backend gives the rental number and calculates the total cost
      const saved = isEdit ? await updateRental(rentalId, form) : await createRental(form);
      showToast(
        `Rental ${saved.rentalId} was ${isEdit ? 'updated' : 'booked'}, total ${formatMoney(saved.totalCost)}`,
      );
      navigate(`/rentals/${saved.rentalId}`);
    } catch (err) {
      // e.g. the car is in maintenance (400) or already booked for these dates (409)
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading customers and cars..." />;
  if (loadError) return <ErrorMessage message={loadError} backLink="/rentals" backText="Back to rentals" />;

  const selectedCar = cars.find((car) => car.carId === form.carId);

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit rental ${rentalId}` : 'New rental'}
        subtitle={isEdit ? undefined : "The total is calculated from the car's daily rate when you save."}
        backLink={isEdit ? `/rentals/${rentalId}` : '/rentals'}
        backText={isEdit ? 'Back to rental' : 'Rentals'}
      />

      {(customers.length === 0 || cars.length === 0) && (
        <div className="form-alert">
          You need at least one customer and one car to book a rental.{' '}
          {customers.length === 0 ? <Link to="/customers/new">Add a customer</Link> : <Link to="/cars/new">Add a car</Link>}
        </div>
      )}

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert">{formError}</div>}

        <div className="form-grid">
          <FormField label="Customer" id="customerId" error={errors.customerId}>
            <select id="customerId" name="customerId" value={form.customerId} onChange={handleChange}>
              <option value="">Choose a customer</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customerName(customer)} ({customer.customerId})
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Car"
            id="carId"
            error={errors.carId}
            hint={selectedCar ? `${formatMoney(selectedCar.dailyRate)} per day` : undefined}
          >
            <select id="carId" name="carId" value={form.carId} onChange={handleChange}>
              <option value="">Choose a car</option>
              {cars.map((car) => (
                <option key={car.carId} value={car.carId}>
                  {car.carId} - {carName(car)} ({titleCase(car.status)})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Pickup date" id="startDate" error={errors.startDate}>
            <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
          </FormField>

          <FormField label="Return date" id="endDate" error={errors.endDate}>
            <input
              id="endDate"
              name="endDate"
              type="date"
              min={form.startDate}
              value={form.endDate}
              onChange={handleChange}
            />
          </FormField>

          <FormField
            label="Status"
            id="status"
            error={errors.status}
            hint="Reserved and active rentals hold the car for these dates."
          >
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as RentalStatus })}
            >
              {RENTAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Book rental'}
          </button>
        </div>
      </form>
    </>
  );
}
