import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Container className="py-4 flex-grow-1">
        <Outlet />
      </Container>
      <footer className="bg-light text-center py-3 mt-auto">
        <small className="text-muted">
          CRM AI © {new Date().getFullYear()}
        </small>
      </footer>
    </div>
  );
}
