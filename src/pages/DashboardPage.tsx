import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCars } from '../services/carService';
import { getAllCustomers } from '../services/customerService';
import { getAllRentals } from '../services/rentalService';
import { getErrorMessage } from '../services/api';
import type { CarResponse } from '../types/car';
import { CAR_STATUSES } from '../types/car';
import type { CustomerResponse } from '../types/customer';
import type { RentalResponse } from '../types/rental';
import { RENTAL_STATUSES } from '../types/rental';
import { PageHeader } from '../components/PageHeader';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { BreakdownBars } from '../components/BreakdownBars';
import { IdTag } from '../components/IdTag';
import { StatusBadge } from '../components/StatusBadge';
import { carName, customerName, formatDate, formatMoney, titleCase } from '../utils/format';

export function DashboardPage() {
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [rentals, setRentals] = useState<RentalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      // load the 3 lists at the same time
      const [carList, customerList, rentalList] = await Promise.all([
        getAllCars(),
        getAllCustomers(),
        getAllRentals(),
      ]);
      setCars(carList);
      setCustomers(customerList);
      setRentals(rentalList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader text="Loading the dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  // ----- statistics, all calculated from the data we got from the backend -----

  const carCounts = CAR_STATUSES.map((status) => ({
    status,
    count: cars.filter((car) => car.status === status).length,
  }));

  const rentalCounts = RENTAL_STATUSES.map((status) => ({
    status,
    count: rentals.filter((rental) => rental.status === status).length,
  }));

  let revenue = 0;
  rentals.forEach((rental) => {
    if (rental.status !== 'CANCELLED') revenue += Number(rental.totalCost);
  });

  // next 5 reservations, earliest pickup first
  const nextPickups = rentals
    .filter((rental) => rental.status === 'RESERVED')
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  function findCustomerName(customerId: string) {
    const customer = customers.find((c) => c.customerId === customerId);
    return customer ? customerName(customer) : customerId;
  }

  function findCarName(carId: string) {
    const car = cars.find((c) => c.carId === carId);
    return car ? carName(car) : carId;
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="What's on the lot and what's coming up." />

      {/* every car of the fleet drawn as a parking spot, coloured by availability */}
      <section className="panel">
        <div className="panel-head">
          <h2>The lot</h2>
          <ul className="lot-legend">
            {carCounts.map((item) => (
              <li key={item.status}>
                <span className={`swatch fill-${item.status.toLowerCase()}`} />
                {titleCase(item.status)} <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        </div>
        {cars.length === 0 ? (
          <p className="muted">
            No cars yet. <Link to="/cars/new">Add the first car</Link>.
          </p>
        ) : (
          <div className="bays">
            {cars.map((car) => (
              <Link key={car.carId} to={`/cars/${car.carId}`} className={`bay bay-${car.status.toLowerCase()}`}>
                <IdTag id={car.carId} kind="car" />
                <span className="bay-name">
                  {car.make} {car.model}
                </span>
                <span className="bay-status">{titleCase(car.status)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="figures">
        <Link to="/cars" className="figure">
          <span className="figure-value">{cars.length}</span>
          <span className="figure-label">Cars in the fleet</span>
        </Link>
        <Link to="/customers" className="figure">
          <span className="figure-value">{customers.length}</span>
          <span className="figure-label">Customers</span>
        </Link>
        <Link to="/rentals" className="figure">
          <span className="figure-value">{rentals.length}</span>
          <span className="figure-label">Rentals</span>
        </Link>
        <div className="figure">
          <span className="figure-value">{formatMoney(revenue)}</span>
          <span className="figure-label">Booked revenue (without cancelled)</span>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <h2 className="panel-title">Rentals by status</h2>
          <BreakdownBars items={rentalCounts} />
        </section>

        <section className="panel">
          <h2 className="panel-title">Next pickups</h2>
          {nextPickups.length === 0 ? (
            <p className="muted">No reservations waiting for pickup.</p>
          ) : (
            <ul className="pickup-list">
              {nextPickups.map((rental) => (
                <li key={rental.rentalId}>
                  <Link to={`/rentals/${rental.rentalId}`} className="pickup">
                    <span className="pickup-date">{formatDate(rental.startDate)}</span>
                    <span>
                      <strong>{findCustomerName(rental.customerId)}</strong>
                      <span className="muted"> picks up the {findCarName(rental.carId)}</span>
                    </span>
                    <StatusBadge status={rental.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
