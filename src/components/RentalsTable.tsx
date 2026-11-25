import { Link } from 'react-router-dom';
import type { RentalResponse } from '../types/rental';
import { StatusBadge } from './StatusBadge';
import { IdTag } from './IdTag';
import { formatDate, formatMoney } from '../utils/format';

interface RentalsTableProps {
  rentals: RentalResponse[];
  show: 'customer' | 'car'; // on a car page we show the customer, on a customer page the car
  names: Record<string, string>; // id -> name, so we can show "John Smith" instead of "CUS-0001"
}

// Table of rentals used on the car details and customer details pages
export function RentalsTable({ rentals, show, names }: RentalsTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Rental</th>
            <th>{show === 'customer' ? 'Customer' : 'Car'}</th>
            <th>Dates</th>
            <th className="num">Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rentals.map((rental) => {
            const otherId = show === 'customer' ? rental.customerId : rental.carId;
            const otherLink = show === 'customer' ? `/customers/${otherId}` : `/cars/${otherId}`;
            return (
              <tr key={rental.rentalId}>
                <td data-label="Rental">
                  <Link to={`/rentals/${rental.rentalId}`}>
                    <IdTag id={rental.rentalId} kind="rental" />
                  </Link>
                </td>
                <td data-label={show === 'customer' ? 'Customer' : 'Car'}>
                  <Link to={otherLink}>{names[otherId] || otherId}</Link>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
