import React from 'react';
import { Spinner, Modal, Button } from 'react-bootstrap';

const ConfirmDeleteModal = ({ show, loading, cancelDelete, confirmDelete }) => {

    return (
        <Modal show={show} onHide={cancelDelete} backdrop="static" keyboard={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={cancelDelete}>Cancelar</Button>
                <Button variant="danger" onClick={confirmDelete}>
                    {loading && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>}
                    Eliminar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmDeleteModal;
