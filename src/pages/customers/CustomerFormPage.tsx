import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, getCustomerById, updateCustomer } from '../../services/customerService';
import { getErrorMessage, getFieldErrors } from '../../services/api';
import type { CustomerRequest } from '../../types/customer';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { FormField } from '../../components/FormField';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { customerName } from '../../utils/format';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// /customers/new -> create, /customers/:customerId/edit -> update
export function CustomerFormPage() {
  const { customerId } = useParams();
  const isEdit = customerId !== undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<CustomerRequest>({ firstName: '', lastName: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');

  // edit mode: fill the form with the current values of the customer
  useEffect(() => {
    if (!customerId) return;
    getCustomerById(customerId)
      .then((customer) =>
        setForm({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        }),
      )
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [customerId]);

  // one change handler for all the inputs, it uses the input's name
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // same rules as the validation annotations on CustomerRequestDTO
  function validate() {
    const newErrors: Record<string, string> = {};
    if (form.firstName.trim() === '') newErrors.firstName = 'First name is required.';
    else if (form.firstName.length > 50) newErrors.firstName = 'First name must be 50 characters or less.';

    if (form.lastName.trim() === '') newErrors.lastName = 'Last name is required.';
    else if (form.lastName.length > 50) newErrors.lastName = 'Last name must be 50 characters or less.';

    if (form.email.trim() === '') newErrors.email = 'Email is required.';
    else if (!EMAIL_REGEX.test(form.email.trim())) newErrors.email = 'Enter a valid email, like name@example.com.';

    if (form.phone.trim() === '') newErrors.phone = 'Phone is required.';
    else if (form.phone.length > 20) newErrors.phone = 'Phone must be 20 characters or less.';
    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');

    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const customer: CustomerRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    setSaving(true);
    try {
      const saved = isEdit ? await updateCustomer(customerId, customer) : await createCustomer(customer);
      showToast(isEdit ? `${customerName(saved)} was updated` : `${customerName(saved)} was added as ${saved.customerId}`);
      navigate(`/customers/${saved.customerId}`);
    } catch (err) {
      setErrors(getFieldErrors(err));
      setFormError(getErrorMessage(err)); // e.g. "Email ... is already used" (409)
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text={`Loading ${customerId}...`} />;
  if (loadError) return <ErrorMessage message={loadError} backLink="/customers" backText="Back to customers" />;

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit ${customerId}` : 'Add customer'}
        subtitle={isEdit ? undefined : 'The customer number is given automatically when you save.'}
        backLink={isEdit ? `/customers/${customerId}` : '/customers'}
        backText={isEdit ? 'Back to customer' : 'Customers'}
      />

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        {formError && <div className="form-alert">{formError}</div>}

        <div className="form-grid">
          <FormField label="First name" id="firstName" error={errors.firstName}>
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
          </FormField>

          <FormField label="Last name" id="lastName" error={errors.lastName}>
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
          </FormField>

          <FormField label="Email" id="email" error={errors.email} hint="Two customers can't have the same email.">
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </FormField>

          <FormField label="Phone" id="phone" error={errors.phone}>
            <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
          </FormField>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add customer'}
          </button>
        </div>
      </form>
    </>
  );
}
