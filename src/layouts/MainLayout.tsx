import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { CarFront, KeyRound, LayoutDashboard, Menu, Users, X } from 'lucide-react';
import { Logo } from '../components/Logo';

export function MainLayout() {
  // on small screens the menu is hidden behind a button
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="sidebar-top">
          <Logo />
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav className="nav">
          <NavLink to="/" end className="nav-link" onClick={closeMenu}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/cars" className="nav-link" onClick={closeMenu}>
            <CarFront size={20} /> Fleet
          </NavLink>
          <NavLink to="/customers" className="nav-link" onClick={closeMenu}>
            <Users size={20} /> Customers
          </NavLink>
          <NavLink to="/rentals" className="nav-link" onClick={closeMenu}>
            <KeyRound size={20} /> Rentals
          </NavLink>
        </nav>
        <p className="sidebar-foot">Rental desk, Saint-Lambert branch</p>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
