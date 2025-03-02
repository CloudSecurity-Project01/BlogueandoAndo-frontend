import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaStar } from "react-icons/fa";
import { ratePost } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../services/userService';


const RatingModal = ({ show, setShow, post, setPost, userRating, setUserRating }) => {
    
    const { user } = useAuth();
    const showToast = useToast();

    const closeRatingModal = () => {
        setShow(false);
    };

    const submitRating = async () => {
        if (userRating === null) return;
        console.log("RATING POST: ", post)
        ratePost(post, userRating, user)
            .then((postData) => {
                setPost(postData)
            })
            .catch((error) => {
                showToast(extractErrorMessage(error), "error");
                console.error("NEW ERROR: ", error)
            });
        closeRatingModal();
    };
    return (
        <Modal show={show} onHide={closeRatingModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Calificar Publicación</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p>Selecciona una calificación:</p>
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            color={i < (userRating ?? 0) ? "#ffc107" : "#e4e5e9"}
                            style={{ cursor: "pointer", fontSize: "24px" }}
                            onClick={() => setUserRating(i + 1)}
                        />
                    ))}
                    <p className="mt-2">Tu calificación: {userRating ?? "N/A"}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeRatingModal}>
                        Cancelar
                    </Button>
                    <Button variant="success" onClick={submitRating} disabled={userRating === null}>
                        Enviar Calificación
                    </Button>
                </Modal.Footer>
            </Modal>
    );
};

export default RatingModal;
