import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCar, getCarById, updateCar } from '../../services/carService';
import { getErrorMessage, getFieldErrors } from '../../services/api';
import type { CarRequest, CarStatus } from '../../types/car';
import { CAR_STATUSES } from '../../types/car';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { FormField } from '../../components/FormField';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { carName, titleCase } from '../../utils/format';

// /cars/new -> create, /cars/:carId/edit -> update
export function CarFormPage() {
  const { carId } = useParams();
  const isEdit = carId !== undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();

  // year and dailyRate are strings while typing, we convert them to numbers when saving
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [status, setStatus] = useState<CarStatus>('AVAILABLE');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');

  // edit mode: fill the form with the current values of the car
  useEffect(() => {
    if (!carId) return;
    getCarById(carId)
      .then((car) => {
        setMake(car.make);
        setModel(car.model);
        setYear(String(car.year));
        setDailyRate(String(car.dailyRate));
        setStatus(car.status);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [carId]);

  // same rules as the validation annotations on CarRequestDTO
  function validate() {
    const newErrors: Record<string, string> = {};
    if (make.trim() === '') newErrors.make = 'Make is required.';
    else if (make.length > 50) newErrors.make = 'Make must be 50 characters or less.';

    if (model.trim() === '') newErrors.model = 'Model is required.';
    else if (model.length > 50) newErrors.model = 'Model must be 50 characters or less.';

    const yearNumber = Number(year);
    if (year === '' || !Number.isInteger(yearNumber) || yearNumber < 1886 || yearNumber > 2100) {
      newErrors.year = 'Year must be between 1886 and 2100.';
    }

    if (dailyRate === '' || Number(dailyRate) <= 0) newErrors.dailyRate = 'Daily rate must be more than $0.';
    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // don't send the form if there are errors

    const car: CarRequest = {
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      dailyRate: Number(dailyRate),
      status: status,
    };

    setSaving(true);
    try {
      const saved = isEdit ? await updateCar(carId, car) : await createCar(car);
      showToast(isEdit ? `${carName(saved)} was updated` : `${carName(saved)} was added as ${saved.carId}`);
      navigate(`/cars/${saved.carId}`);
    } catch (err) {
      // show the error from the backend (and the field errors if there are some)
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text={`Loading ${carId}...`} />;
  if (loadError) return <ErrorMessage message={loadError} backLink="/cars" backText="Back to fleet" />;

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit ${carId}` : 'Add car'}
        subtitle={isEdit ? undefined : 'The plate number is given automatically when you save.'}
        backLink={isEdit ? `/cars/${carId}` : '/cars'}
        backText={isEdit ? 'Back to car' : 'Fleet'}
      />

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert">{formError}</div>}

        <div className="form-grid">
          <FormField label="Make" id="make" error={errors.make}>
            <input id="make" value={make} onChange={(e) => setMake(e.target.value)} />
          </FormField>

          <FormField label="Model" id="model" error={errors.model}>
            <input id="model" value={model} onChange={(e) => setModel(e.target.value)} />
          </FormField>

          <FormField label="Year" id="year" error={errors.year}>
            <input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </FormField>

          <FormField label="Daily rate ($)" id="dailyRate" error={errors.dailyRate}>
            <input
              id="dailyRate"
              type="number"
              step="0.01"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
            />
          </FormField>

          <FormField
            label="Availability"
            id="status"
            error={errors.status}
            hint="A car on an active rental can't go to maintenance."
          >
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as CarStatus)}>
              {CAR_STATUSES.map((s) => (
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
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add car'}
          </button>
        </div>
      </form>
    </>
  );
}
