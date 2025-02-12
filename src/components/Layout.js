import React from "react";
import { Navbar, Nav, Container, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/home">BlogueandoAndo</Navbar.Brand>
          <Nav className="ms-auto">
            {/* If user is logged in, show username and menu */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="d-flex align-items-center text-white" style={{ cursor: "pointer" }}>
                  <span className="me-2">{user.user_name}</span>
                  <FaUserCircle size={24} color="white" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // If user is not logged in, show login and register buttons
              <>
                <Button as={Link} to="/login" variant="link" className="text-white">Ingresar</Button>
                <Button as={Link} to="/register" variant="link" className="text-white ms-2">Registrarse</Button>
              </>
            )}
          </Nav>
        </Container>
      </Navbar>

      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
