import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import Auth Context
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");  // State for password recovery email
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);  // Track if the user is in password recovery mode

  const { login } = useAuth(); // Get login function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Ingresa todos los campos");
      return;
    }

    try {
      await login(username, password); // Call login function
      navigate("/home"); // Redirect to home
    } catch (err) {
      setError("Usuario o contraseña incorrectos");
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
        setEmail("");  // Clear the email input after sending
        setIsRecoveringPassword(false);  // Hide recovery form
      } else {
        setError("Hubo un problema al enviar el enlace. Inténtalo de nuevo.");
      }
    } catch (err) {
      setError("Hubo un error. Intenta nuevamente.");
    }
  };

  const togglePasswordRecovery = () => {
    setIsRecoveringPassword(!isRecoveringPassword);
    setError("");  // Clear any previous error
  };

  const handleContinueWithoutLogin = () => {
    // Allow user to go to home page without login
    navigate("/home");
  };

  return (
    <Container>
      <Card className="p-4 shadow loginContainer">
        <Card.Title className="text-center m-5">Bienvenido</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {!isRecoveringPassword ? (
          <>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formUsername">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mt-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
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
              <Button variant="link" onClick={togglePasswordRecovery}>Recuperar contraseña</Button>
            </div>

            {/* Button to continue to Home without login */}
            <Button variant="light" onClick={handleContinueWithoutLogin} className="w-100 mt-3">
              Continuar sin iniciar sesión
            </Button>
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
