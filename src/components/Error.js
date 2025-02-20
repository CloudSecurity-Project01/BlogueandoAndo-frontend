import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Error = ({ type }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/home");
    };

    const handleGoLogin = () => {
        navigate("/login");
    };

    const errors = {
        "NotFound" : {
            "title" : "Página no encontrada",
            "body" : "Lo sentimos, la página que buscas no existe.",
            "button" : "Volver a la Inicio",
            "action" : handleGoHome
        },
        "Unauthorized" : {
            "title": "Acceso Denegado",
            "body": "No tienes permiso para ver esta página.",
            "button" : "Iniciar sesión",
            "action" : handleGoLogin
        }
    }
        
    console.log(errors[type])

    return (
        <Container className="text-center mt-5">
            <h1>{ errors[type].title }</h1>
            <p>{ errors[type].body }</p>
            <Button className="mt-5" variant="primary" onClick={errors[type].action}>
                { errors[type].button }
            </Button>
        </Container>
    );
};

export default Error;