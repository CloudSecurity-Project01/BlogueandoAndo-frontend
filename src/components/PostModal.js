import React, { useState } from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import { FaStar, FaExpand, FaExternalLinkAlt, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";
import DOMPurify from "dompurify";

const PostModal = ({ show, handleClose, post, username, handleUpdate, handleDelete }) => {
    const [editMode, setEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();

    if (!post) return null;

    const handleFullScreenEdit = () => {
        navigate(`/post/${post.id}?edit=true`);
        handleClose();
    };

    const handleDeletePost = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        handleDelete(post.id); 
        setShowDeleteConfirm(false);
        handleClose();
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    return (
        <>
            <Modal 
                show={show} 
                onHide={handleClose} 
                size="lg"
                dialogClassName={showDeleteConfirm ? 'custom-dialog' : ''}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? "Editar Post" : post.title}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="post-modal-body">
                    {!editMode ? (
                        <>
                            <p><strong>Autor:</strong> {post.author}</p>
                            <p><strong>Fecha:</strong> {post.date}</p>

                            <div className="mb-3">
                                <strong>Calificación: </strong> 
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < post.rating ? "#ffc107" : "#e4e5e9"} />
                                ))}
                            </div>

                            <div className="ql-editor my-4">
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                            </div>

                            <div className="mb-3">
                                {post.tags.map((tag, i) => (
                                    <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                                ))}
                            </div>
                        </>
                    ) : (
                        <CreatePostModal 
                            show={editMode} 
                            handleClose={() => setEditMode(false)} 
                            handleSave={handleUpdate}
                            initialPost={post} 
                            username={username}
                        />
                    )}
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between">
                    {editMode ? (
                        <>
                            <Button 
                                variant="light" 
                                className="me-2" 
                                onClick={handleFullScreenEdit}
                            >
                                Editar en pantalla completa <FaExternalLinkAlt className="ms-1" />
                            </Button>
                            {post.author === username && (
                                <Button 
                                    variant="light" 
                                    className="me-2 d-flex align-items-center"
                                >
                                    {post.visibility === "public" ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                                    <span className="ms-2">{post.visibility === "public" ? "Público" : "Privado"}</span>
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button variant="light" onClick={() => navigate(`/post/${post.id}`)}>
                                Ver en pantalla completa <FaExpand className="ml-2" />
                            </Button>
                            <div className="ms-auto">
                                {post.author === username && (
                                    <>
                                        <Button variant="warning" onClick={() => setEditMode(true)}>
                                            Editar
                                        </Button>
                                        <Button className="mx-2" variant="danger" onClick={handleDeletePost}>
                                            <FaTrash className="me-2" /> Eliminar
                                        </Button>
                                    </>
                                )}
                                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                            </div>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteConfirm} onHide={cancelDelete} backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDelete}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDelete}>Eliminar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default PostModal;
