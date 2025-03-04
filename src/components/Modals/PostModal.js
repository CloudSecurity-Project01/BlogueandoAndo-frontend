import React, { useState, useEffect, useRef } from "react";
import { Spinner, Modal, Button, Form, Badge, InputGroup, ListGroup } from "react-bootstrap";
import { FaStar, FaExpand, FaExternalLinkAlt, FaEye, FaEyeSlash, FaTrash } from "react-icons/fa";
import QuillEditor from "../QuillEditor";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import RatingModal from "./RatingModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { getTags } from "../../services/tagService";
import { createPost, getPostById, updatePost } from "../../services/postService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../services/userService";

const PostModal = ({ show, handleClose, post, setPost, handleDelete, mode, setMode }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [allTags, setAllTags] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const [is_public, setIsPublic] = useState(post ? post.is_public : true);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const inputRef = useRef(null);
    const showToast = useToast();

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
        if(show) {
            if (mode === "view" && post) {
                setLoading(true)
                getPostById(post.id)
                    .then((postData) => {
                        setPost(postData);
                    })
                    .catch((error) => {
                        showToast("Hubo un error cargando la publicación.", "error");
                        console.error("Error getting post by ID", error);
                    })
                    .finally(() => { setLoading(false) });
            }
            console.log(user)

            console.log(post)
        }
    }, [show, mode])

    useEffect(() => {
        if (mode === "edit" || mode === "create") {
            getTags(1, -1)
                .then((data) => {
                    setAllTags(data.tags)
                })
                .catch((error) => {
                    showToast(extractErrorMessage(error), "error");
                    console.error("Error getting tags list", error)
                });
        }
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

    const openRatingModal = (rating) => {
        setShowRatingModal(true);
        setUserRating(rating ? rating : null);
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

    const confirmDelete = async () => {
        setLoadingButton(true);
        try {
            await handleDelete(post.id);
            setShowDeleteConfirm(false);
            showToast("Publicación eliminada correctamente.", "success");
            handleClose();            
        } catch (error) {
            showToast(extractErrorMessage(error), "error");
            console.error("Error deleting post:", error);
        } finally {
            setLoadingButton(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            showToast("Por favor, ingresa un título.", "error");
            return;
        }

        if (!content.trim()) {
            showToast("Por favor, ingresa el contenido de tu publicación.", "error");
            return;
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

        setLoadingButton(true)
        postAction
            .then((data) => {
                setTitle(data.title);
                setContent(data.content);
                setSelectedTags(data.tags || []);
                if (mode === "edit") setIsPublic(data.is_public);
                handleClose(data, mode === "create");
                setMode("view");
                showToast(`Publicación ${mode === "create" ? "creada" : "actualizada"} correctamente.`, "success");
            })
            .catch((error) => {
                console.error(`Error ${mode === "create" ? "creating" : "updating"} post`, error);
                showToast(`Hubo un error al ${mode === "create" ? "crear" : "actualizar"} la publicación. Intenta de nuevo.`, "error");
            })
            .finally(() => { setLoadingButton(false) });
    };

    const filteredSuggestions = tagInput
        ? allTags.filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase()))
        : [];


    if (!post && mode !== "create") return null;

    return (
        <>
            <Modal show={show} onHide={handleClose} size="lg" className={`custom-modal ${showDeleteConfirm || showRatingModal ? 'custom-dialog' : ''}`} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{mode === "edit" ? "Editar Post" : mode === "create" ? "Crear Nuevo Post" : post.title}</Modal.Title>
                </Modal.Header>

                {loading ? (
                    <Modal.Body className="post-modal-body">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                            <Spinner animation="border" />
                        </div>
                    </Modal.Body>
                ) : (<>

                    {mode === "view" ? (
                        <Modal.Body className="post-modal-body">
                            <p><strong>Autor:</strong> {post.user_name}</p>
                            <p><strong>Fecha:</strong> {post.publication_date}</p>
                            <div className="mb-3">
                                <strong>Calificación: </strong>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} color={i < post.rating ? "#ffc107" : "#e4e5e9"}
                                        style={{ cursor: user ? "pointer" : "default" }}
                                        onClick={user ? () => openRatingModal(i + 1) : null}
                                    />
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
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Escribe para añadir etiquetas"
                                        />
                                    </InputGroup>
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <ListGroup className="mt-1 position-absolute w-100 shadow-lg" style={{ zIndex: 10, backgroundColor: "white", maxHeight: "200px", overflowY: "scroll" }}>
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
                </>)}

                <Modal.Footer className="d-flex justify-content-between">
                    {mode === "create" ? (
                        <>
                            <Button variant="light" className="me-2" onClick={handleFullScreenCreate}>
                                Crear en pantalla completa <FaExternalLinkAlt className="ms-1" />
                            </Button>
                            <div className="ms-auto">
                                <Button className="mx-2" variant="secondary" onClick={handleClose}>Cancelar</Button>
                                <Button variant="primary" onClick={handleSubmit}>
                                    {loadingButton ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Guardar"}
                                </Button>
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
                                <Button variant="primary" onClick={handleSubmit}>
                                    {loadingButton ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Actualizar"}
                                </Button>
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

            <ConfirmDeleteModal
                show={showDeleteConfirm}
                loading={loadingButton}
                cancelDelete={cancelDelete}
                confirmDelete={confirmDelete}
            />

            <RatingModal
                show={showRatingModal}
                setShow={setShowRatingModal}
                post={post}
                setPost={setPost}
                userRating={userRating}
                setUserRating={setUserRating}
            />
        </>
    );
};

export default PostModal;