import React, { useState } from "react";
import { Spinner, Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/authService";
import "../styles/styles.css";
import { sendResetPasswordRequest } from "../services/userService";

const Login = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Ingresa todos los campos");
      return;
    }

    setLoading(true)
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      const errorMessage = err.message || "Credenciales incorrectas";
      setError(errorMessage);
    } finally {
      setLoading(false)
    }
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo.");
      return;
    }

    setLoading(true)
    setError("");
    setSuccess("");
    try {
      const response = await sendResetPasswordRequest(email);
      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Hubo un problema. Intenta nuevamente.");
        return;
      }

      setSuccess(data.message || "BIEN!");

      setTimeout(() => {
        setIsRecoveringPassword(false);
        setError("");
        setSuccess("");
      }, 5000);

    } catch (err) {
      setError("Hubo un problema al enviar el enlace. Inténtalo de nuevo.");
    } finally {
      setLoading(false)
    }

  };

  const togglePasswordRecovery = () => {
    setIsRecoveringPassword(!isRecoveringPassword);
    setError("");
  };

  return (
    <Container>
      <Card className="p-4 shadow loginContainer">
        <Card.Title className="text-center m-5">
          <h1>BlogueandoAndo</h1>
          <p className="text-secondary">{isRecoveringPassword ? "Recuperar contraseña" : "Iniciar sesión"}</p>
        </Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {!isRecoveringPassword ? (
          <>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formEmail">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  name="formEmail"
                  type="text"
                  placeholder="Correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  name="formPassword"
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mt-5" disabled={loading}>
                {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>}
                Ingresar
              </Button>
            </Form>

            {/* Password recovery link */}
            <div className="text-center">
              <Button variant="link" onClick={() => navigate("/register")} disabled={loading}>Registrarse</Button>
              <Button variant="link" onClick={togglePasswordRecovery} disabled={loading}>Recuperar contraseña</Button>
            </div>

            <Button className="mx-auto mt-5 w-50" variant="light" onClick={() => navigate("/home")} disabled={loading}>Continuar sin iniciar sesión</Button>
          </>
        ) : (
          <>
            {/* Password Recovery Form */}
            <div className="mt-3">
              <Form.Group controlId="formEmail">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={handlePasswordRecovery} className="w-100 mt-3">
                Enviar enlace de recuperación
              </Button>
            </div>
            <Button variant="link" onClick={togglePasswordRecovery} className="w-100 mt-3">
              Volver a la pantalla de inicio de sesión
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Login;
