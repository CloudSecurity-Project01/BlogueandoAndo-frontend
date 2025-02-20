import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Badge, InputGroup, ListGroup } from "react-bootstrap";
import { FaStar, FaExpand, FaExternalLinkAlt, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import QuillEditor from "./QuillEditor";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/authService";
import DOMPurify from "dompurify";
import { createPost } from "../services/postService";
import { updatePost } from "../services/postService";

const PostModal = ({ show, handleClose, post, handleDelete, initMode }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mode, setMode] = useState(initMode);
    const [tagInput, setTagInput] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [is_public, setIsPublic] = useState(post ? post.is_public : true);
    const [selectedTags, setSelectedTags] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();
    const inputRef = useRef(null);

    const allTags = ["JavaScript", "React", "Frontend", "CSS", "Flexbox", "Node.js", "Backend"];

    useEffect(() => {
        if (show) {
            if (mode === "edit" && post) {
                setTitle(post.title);
                setContent(post.content);
                setSelectedTags(post.tags || []);
            } else if (mode === "create") {
                setTitle('');
                setContent('');
                setSelectedTags([]);
            }
        }
    }, [show, mode, post]);

    useEffect(() => {
        console.log("Mode has changed to: ", mode);
    }, [mode]);

    const handleFullScreenCreate = () => {
        navigate("/post/new", {
            state: {
                title: title,
                content: content,
                tags: selectedTags
            }
        });
        handleClose();
    };

    const handleFullScreenEdit = () => {
        navigate(`/post/${post.id}?edit=true`, {
            state: {
                title: title,
                content: content,
                tags: selectedTags,
                is_public: is_public
            }
        });
        handleClose();
    };

    const removeTag = (tag) => {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
    };

    const handleDeletePost = () => {
        setShowDeleteConfirm(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            handleTagSelect(tagInput.trim());
        }
    };

    const handleTagSelect = (tag) => {
        const normalizedTag = tag.toLowerCase();
        if (!selectedTags.some((t) => t.toLowerCase() === normalizedTag)) {
            setSelectedTags((prevTags) => [...prevTags, tag]);
        }
        setTagInput("");
        setShowSuggestions(false);
    };

    const confirmDelete = () => {
        handleDelete(post.id);
        setShowDeleteConfirm(false);
        handleClose();
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            return alert("Por favor, ingresa un título.");
        }
        
        if (!content.trim()) {
            return alert("Por favor, ingresa contenido.");
        }
    
        const postData = {
            title,
            content,
            tags: selectedTags,
            is_public
        };
    
        const postAction = mode === "create"
            ? createPost(title, content, selectedTags, user.id)
            : updatePost({ ...postData, id: post.id }, user);
    
        postAction
            .then((data) => {
                setTitle(data.title);
                setContent(data.content);
                setSelectedTags(data.tags || []);
                if (mode === "edit") setIsPublic(data.is_public);
                setMode("view");
                handleClose(data);
            })
            .catch((error) => {
                console.error(`Error ${mode === "create" ? "creating" : "updating"} post`, error);
                alert(`Hubo un error al ${mode === "create" ? "crear" : "actualizar"} la publicación. Intenta de nuevo.`);
            });
    };    

    const filteredSuggestions = tagInput
        ? allTags.filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase()))
        : [];


    if (!post && mode !== "create") return null;

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" className={`custom-modal ${showDeleteConfirm ? 'custom-dialog' : ''}`} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{mode === "edit" ? "Editar Post" : mode === "create" ? "Crear Nuevo Post" : post.title}</Modal.Title>
                </Modal.Header>

                {mode === "view" ? (
                    <Modal.Body className="post-modal-body">
                        <p><strong>Autor:</strong> {post.user_name}</p>
                        <p><strong>Fecha:</strong> {post.publication_date}</p>
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
                            {post.tags?.map((tag, i) => (
                                <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                            ))}
                        </div>
                    </Modal.Body>
                ) : (
                    <Modal.Body className="post-modal-body">
                        <Form>
                            <Form.Group className="mb-3" controlId="title">
                                <Form.Label>Título</Form.Label>
                                <Form.Control
                                    name="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contenido</Form.Label>
                                <QuillEditor value={content} onChange={setContent} />
                            </Form.Group>
                            <Form.Group className="mb-3 position-relative" controlId="tags">
                                <Form.Label>Etiquetas</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        name="tags"
                                        type="text"
                                        ref={inputRef}
                                        value={tagInput}
                                        onChange={(e) => {
                                            setTagInput(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Escribe para añadir etiquetas"
                                    />
                                </InputGroup>
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <ListGroup className="mt-1 position-absolute w-100 shadow-lg" style={{ zIndex: 10, backgroundColor: "white" }}>
                                        {filteredSuggestions.map((tag, index) => (
                                            <ListGroup.Item key={index} action onClick={() => handleTagSelect(tag)}>
                                                {tag}
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                                <div className="mt-2">
                                    {selectedTags.map((tag, index) => (
                                        <Badge key={index} bg="primary" className="me-1" onClick={() => removeTag(tag)} style={{ cursor: "pointer" }}>
                                            {tag} ✕
                                        </Badge>
                                    ))}
                                </div>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                )}

                <Modal.Footer className="d-flex justify-content-between">
                    {mode === "create" ? (
                        <>
                            <Button variant="light" className="me-2" onClick={handleFullScreenCreate}>
                                Crear en pantalla completa <FaExternalLinkAlt className="ms-1" />
                            </Button>
                            <div className="ms-auto">
                                <Button className="mx-2" variant="secondary" onClick={handleClose}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSubmit}>Guardar</Button>
                            </div>
                        </>
                    ) : mode === "edit" ? (
                        <>
                            <Button variant="light" className="me-2" onClick={handleFullScreenEdit}>
                                Editar en pantalla completa <FaExternalLinkAlt className="ms-1" />
                            </Button>
                            {post?.user_id === user?.id && (
                                <Button variant="light" className="me-2 d-flex align-items-center" onClick={() => {
                                    setIsPublic(!is_public);
                                }}>
                                    {is_public ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                                    <span className="ms-2">{is_public ? "Público" : "Privado"}</span>
                                </Button>
                            )}
                            <div className="ms-auto">
                                <Button className="mx-2" variant="secondary" onClick={() => { setMode("view"); handleClose(post); }}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSubmit}>Actualizar</Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="light" onClick={() => navigate(`/post/${post.id}`)}>
                                Ver en pantalla completa <FaExpand className="ml-2" />
                            </Button>
                            <div className="ms-auto">
                                {post?.user_id === user?.id && (
                                    <>
                                        <Button variant="warning" onClick={() => { setMode("edit") }}>
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

            {/* Confirmation Modal for Deleting Post */}
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