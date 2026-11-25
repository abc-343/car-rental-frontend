import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCustomer, getAllCustomers } from '../../services/customerService';
import { getErrorMessage } from '../../services/api';
import type { CustomerResponse } from '../../types/customer';
import { useToast } from '../../components/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { SearchBar } from '../../components/SearchBar';
import { Loader } from '../../components/Loader';
import { ErrorMessage } from '../../components/ErrorMessage';
import { EmptyState } from '../../components/EmptyState';
import { IdTag } from '../../components/IdTag';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { customerName, initials } from '../../utils/format';

export function CustomerListPage() {
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<CustomerResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function loadCustomers() {
    setLoading(true);
    setError('');
    try {
      setCustomers(await getAllCustomers());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleDelete() {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await deleteCustomer(customerToDelete.customerId);
      showToast(`${customerName(customerToDelete)} was deleted`);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      showToast('Could not delete the customer: ' + getErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  }

  // search by name, email, phone or customer number
  const text = search.toLowerCase();
  const filteredCustomers = customers.filter(
    (customer) =>
      customerName(customer).toLowerCase().includes(text) ||
      customer.email.toLowerCase().includes(text) ||
      customer.phone.includes(text) ||
      customer.customerId.toLowerCase().includes(text),
  );

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="People with an account at the branch."
        actions={
          <Link to="/customers/new" className="btn btn-primary">
            Add customer
          </Link>
        }
      />

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone or number" />
        {search && (
          <button className="btn btn-link" onClick={() => setSearch('')}>
            Clear search
          </button>
        )}
      </div>

      {loading ? (
        <Loader text="Loading customers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCustomers} />
      ) : filteredCustomers.length === 0 ? (
        search ? (
          <EmptyState title={`No customers match "${search}"`} message="Check the spelling or search by email.">
            <button className="btn btn-secondary" onClick={() => setSearch('')}>
              Clear search
            </button>
          </EmptyState>
        ) : (
          <EmptyState title="No customers yet" message="Add a customer before booking their first rental.">
            <Link to="/customers/new" className="btn btn-primary">
              Add customer
            </Link>
          </EmptyState>
        )
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerId}>
                  <td data-label="Customer">
                    <span className="person">
                      <span className="avatar">{initials(customerName(customer))}</span>
                      <Link to={`/customers/${customer.customerId}`} className="row-title">
                        {customerName(customer)}
                      </Link>
                    </span>
                  </td>
                  <td data-label="Email">{customer.email}</td>
                  <td data-label="Phone">{customer.phone}</td>
                  <td data-label="Number">
                    <IdTag id={customer.customerId} kind="customer" />
                  </td>
                  <td className="row-actions">
                    <Link to={`/customers/${customer.customerId}`} className="btn btn-small btn-ghost">
                      View
                    </Link>
                    <Link to={`/customers/${customer.customerId}/edit`} className="btn btn-small btn-ghost">
                      Edit
                    </Link>
                    <button className="btn btn-small btn-ghost-danger" onClick={() => setCustomerToDelete(customer)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-foot muted">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>
        </div>
      )}

      {customerToDelete && (
        <ConfirmDialog
          title={`Delete ${customerName(customerToDelete)}?`}
          message={`${customerToDelete.customerId} and all of their rentals will be deleted. This can't be undone.`}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setCustomerToDelete(null)}
        />
      )}
    </>
  );
}
