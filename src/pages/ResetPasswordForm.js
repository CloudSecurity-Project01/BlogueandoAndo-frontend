import React, { useState } from "react";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/userService";

const useQuery = () => new URLSearchParams(useLocation().search);

const ResetPasswordForm = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const query = useQuery();
    const token = query.get("token");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        try {
            console.log(token);
            const response = await resetPassword(token, password);
            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Hubo un problema. Intenta nuevamente.");
                return;
            }

            setSuccess(data.message || "Contraseña restablecida correctamente.");
            setTimeout(() => navigate('/login'), 5000);

        } catch (err) {
            setError("Hubo un error al restablecer la contraseña");
        }
    };

    return (
        <Container>
            <Card className="p-4 shadow loginContainer">
                <Card.Title className="text-center m-5">
                    <h1>BlogueandoAndo</h1>
                    <p className="text-secondary">Restablecer contraseña</p>
                </Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Contraseña restablecida con éxito. Redirigiendo...</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nueva Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Confirmar Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100" disabled={success}>
                        Restablecer Contraseña
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default ResetPasswordForm;