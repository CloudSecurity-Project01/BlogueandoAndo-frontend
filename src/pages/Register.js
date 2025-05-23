import React, { useState } from "react";
import { Spinner, Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../services/userService";
import "../styles/styles.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /\d/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!minLength.test(password)) return "La contraseña debe tener al menos 8 caracteres.";
    if (!uppercase.test(password)) return "La contraseña debe contener una letra mayúscula.";
    if (!lowercase.test(password)) return "La contraseña debe contener una letra minúscula.";
    if (!number.test(password)) return "La contraseña debe contener un número.";
    if (!specialChar.test(password)) return "La contraseña debe contener un carácter especial.";

    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(validatePassword(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError("Ingresa todos los campos");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (passwordStrength) {
      setError(passwordStrength);
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await registerUser(name, email, password);
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Hubo un problema. Intenta nuevamente.");
        return;
      }

      setSuccess(data.message || "Revisa tu bandeja de entrada para activar tu cuenta.");
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      setError("Hubo un problema al enviar el enlace. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card className="p-4 shadow loginContainer">
        <Card.Title className="text-center m-5">
          <h1>BlogueandoAndo</h1>
          <p className="text-secondary">Nueva cuenta</p>
        </Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formname">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formEmail" className="mt-3">
            <Form.Label>Correo</Form.Label>
            <Form.Control
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formPassword" className="mt-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={handlePasswordChange}
            />
            {passwordStrength && (
              <Form.Text className="text-danger">{passwordStrength}</Form.Text>
            )}
          </Form.Group>

          <Form.Group controlId="formConfirmPassword" className="mt-3">
            <Form.Label>Confirmar contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mt-4">
            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Crear cuenta"}
          </Button>
        </Form>

        <Button
          variant="link"
          className="w-100 mt-3"
          onClick={() => navigate('/login')}
        >
          Iniciar sesión
        </Button>
      </Card>
    </Container>
  );
};

export default Register;