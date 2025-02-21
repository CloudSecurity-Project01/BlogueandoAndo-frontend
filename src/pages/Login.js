import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/authService";
import "../styles/styles.css";

const Login = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");  
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError("Ingresa todos los campos");
      return;
    }
  
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      const errorMessage = err.message || "Credenciales incorrectas";
      setError(errorMessage);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo.");
      return;
    }

    try {
      // Send password recovery request to backend
      const response = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Te hemos enviado un enlace para recuperar tu contraseña.");
        setEmail("");
        setIsRecoveringPassword(false);
      } else {
        setError("Hubo un problema al enviar el enlace. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Hubo un error. Intenta nuevamente.");
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
          <p className="text-secondary">{isRecoveringPassword ? "Recuperar contraseña" : "Iniciar sesión" }</p>
        </Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
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

              <Button variant="primary" type="submit" className="w-100 mt-5">
                Ingresar
              </Button>
            </Form>

            {/* Password recovery link */}
            <div className="text-center">
              <Button variant="link" onClick={() => navigate("/register")}>Registrarse</Button>
              <Button variant="link" onClick={togglePasswordRecovery}>Recuperar contraseña</Button>
            </div>

            <Button className="mx-auto mt-5 w-50"  variant="light" onClick={() => navigate("/home")}>Continuar sin iniciar sesión</Button>
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
