import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Modal, Button, Badge, Form, InputGroup, ListGroup } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaStar, FaHome, FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import DOMPurify from "dompurify";
import QuillEditor from "./QuillEditor";

const FullPostView = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState();
    const [posts, setPosts] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPost, setEditedPost] = useState(null);
    const [tagInput, setTagInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(null);

    const inputRef = useRef(null);

    const allTags = ["JavaScript", "React", "Frontend", "CSS", "Flexbox", "Node.js", "Backend"];

    useEffect(() => {
        fetch("/postsData.json")
            .then((response) => response.json())
            .then((data) => {
                setPosts(data);
                const postData = data.find((post) => post.id === parseInt(id));
                setPost(postData);
                setEditedPost(postData);
                setCurrentPostIndex(data.findIndex((post) => post.id === parseInt(id)));
            })
            .catch((error) => console.error("Error loading post:", error));
    }, [id]);

    const handleBack = () => {
        const prevPostIndex = (currentPostIndex - 1 + posts.length) % posts.length;
        navigate(`/post/${posts[prevPostIndex].id}`);
    };


    const handleForward = () => {
        const nextPostIndex = (currentPostIndex + 1) % posts.length;
        navigate(`/post/${posts[nextPostIndex].id}`);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        setPost(editedPost);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedPost(post);
        setIsEditing(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(false);
        setPosts(posts.filter((p) => p.id !== post.id));
        navigate("/home");
    };

    const handleDeletePost = () => {
        setShowDeleteConfirm(true);
    };

    const handleTagSelect = (tag) => {
        const normalizedTag = tag.toLowerCase();
        if (!editedPost.tags.some((t) => t.toLowerCase() === normalizedTag)) {
            setEditedPost((prevPost) => ({
                ...prevPost,
                tags: [...prevPost.tags, tag] // Keep original case
            }));
        }
        setTagInput("");
        setShowSuggestions(false);
    };

    const removeTag = (tag) => {
        setEditedPost((prevPost) => ({
            ...prevPost,
            tags: prevPost.tags.filter((t) => t !== tag)
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            handleTagSelect(tagInput.trim());
        }
    };

    const openRatingModal = () => {
        setShowRatingModal(true);
        setUserRating(null); // Reset previous rating
    };

    const closeRatingModal = () => {
        setShowRatingModal(false);
    };

    const submitRating = async () => {
        if (userRating === null) return; // Ensure a rating is selected

        const newAverageRating = (post.rating * post.votes + userRating) / (post.votes + 1);

        // Simulated backend request
        console.log("Sending new rating to backend:", {
            postId: post.id,
            newRating: newAverageRating.toFixed(1),
            totalVotes: post.votes + 1,
        });

        // Update post rating
        setPost((prevPost) => ({
            ...prevPost,
            rating: newAverageRating,
            votes: prevPost.votes + 1,
        }));

        // Close modal after submission
        closeRatingModal();
    };

    const filteredSuggestions = tagInput
        ? allTags.filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !editedPost.tags.some((t) => t.toLowerCase() === tag.toLowerCase()))
        : [];

    if (!post) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={handleBack}>
                    <FaArrowLeft size={24} />
                </Button>
                <div>
                    <Button variant="light" onClick={() => navigate("/home")}>
                        <FaHome size={24} />
                    </Button>
                    {user && (post.user_name === user.user_name) && (
                        isEditing ? (
                            <>
                                <Button className="mx-2" variant="success" onClick={handleSave}>
                                    <FaSave /> Guardar
                                </Button>
                                <Button className="mx-2" variant="danger" onClick={handleCancel}>
                                    <FaTimes /> Cancelar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button className="mx-2" variant="warning" onClick={handleEdit}>
                                    <FaEdit /> Editar
                                </Button>
                                <Button className="mx-2" variant="danger" onClick={handleDeletePost}>
                                    <FaTrash className="me-2" /> Eliminar
                                </Button>
                            </>


                        )
                    )}
                </div>
                <Button variant="secondary" onClick={handleForward}>
                    <FaArrowRight size={24} />
                </Button>
            </div>

            {/* Title */}
            {isEditing ? (
                <Form.Control
                    type="text"
                    value={editedPost.title}
                    onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                    className="mt-4 text-center fs-3"
                />
            ) : (
                <h2 className="text-center mt-4">{post.title}</h2>
            )}

            <p className="text-center text-secondary">{post.user_name} - {post.publication_date}</p>

            {/* Rating Display */}
            <div className="mb-3 d-flex align-items-center">
                <strong>Calificación:</strong>
                <div className="ms-2">
                    {[...Array(5)].map((_, i) => (
                        <FaStar
                            key={i}
                            color={i < Math.round(post.rating) ? "#ffc107" : "#e4e5e9"}
                            style={{ fontSize: "20px" }}
                        />
                    ))}
                    <span className="ms-2 text-muted">{post.rating.toFixed(1)}</span>
                </div>
            </div>

            {/* Tags */}
            <div className="mb-3 position-relative">
                <strong>Etiquetas: </strong>
                {isEditing ? (
                    <>
                        <InputGroup>
                            <Form.Control
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
                                    <ListGroup.Item
                                        key={index}
                                        action
                                        onClick={() => handleTagSelect(tag)}
                                    >
                                        {tag}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}

                        <div className="mt-2">
                            {editedPost.tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    bg="primary"
                                    className="me-1"
                                    onClick={() => removeTag(tag)}
                                    style={{ cursor: "pointer" }}
                                >
                                    {tag} ✕
                                </Badge>
                            ))}
                        </div>
                    </>
                ) : (
                    post.tags.map((tag, i) => (
                        <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                    ))
                )}
            </div>

            {/* Content */}
            <div className="my-5">
                {isEditing ? (
                    <QuillEditor
                        value={editedPost.content}
                        onChange={(value) => setEditedPost({ ...editedPost, content: value })}
                    />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                )}
            </div>

            {/* Rate Post Button (at the bottom) */}
            {user?.username !== post.user_name && (
                <div className="text-center my-5">
                    <Button variant="primary" onClick={openRatingModal}>
                        Calificar este post
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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

            {/* Rating Modal */}
            <Modal show={showRatingModal} onHide={closeRatingModal} centered>
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
        </Container>
    );
};

export default FullPostView;
