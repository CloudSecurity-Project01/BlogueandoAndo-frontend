import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container, Modal, Button, Badge, Form, InputGroup, ListGroup } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight, FaStar, FaHome, FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { useAuth } from "../services/authService";
import DOMPurify from "dompurify";
import QuillEditor from "../components/QuillEditor";
import Error from "../components/Error";
import { createPost, deletePost, getPostById, getPostsIds, updatePost } from "../services/postService";
import { getTags } from "../services/tagService";

const Post = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [post, setPost] = useState({
        title: "",
        content: "",
        tags: [],
        is_public: true,
    });
    const [postsIds, setPostsIds] = useState([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPost, setEditedPost] = useState(post);
    const [tagInput, setTagInput] = useState("");
    const [allTags, setAllTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const [error, setError] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        getTags(1, -1)
            .then((data) => {
                setAllTags(data.tags)
            })
            .catch((error) => {
                console.error("Error getting tags list", error)
            });
        getPostsIds()
            .then(setPostsIds)
            .catch((error) => {
                console.error("Error getting posts IDs", error)
            })
    }, []);

    useEffect(() => {
        if (!id) return;

        if (id === "new") {
            if (!user) {
                setError("Unauthorized");
            } else {
                setIsEditing(true);
                if (location.state) {
                    const { title, content, tags } = location.state;
                    setEditedPost({
                        title,
                        content,
                        tags,
                        is_public: true
                    });
                }
                setError(null);
            }
            return;
        }

        setError(null);
        getPostById(id)
            .then((postData) => {
                setPost(postData);
                const postIndex = postsIds.indexOf(Number(id));
                setCurrentPostIndex(postIndex);
            })
            .catch((error) => {
                setError("NotFound");
                console.error("Error getting post by ID", error);
            });

    }, [id, user, location.state, postsIds]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (user && params.get("edit") === "true") {
            if (location.state) {
                const { title, content, tags, is_public } = location.state;
                setEditedPost({
                    ...post,
                    title: title,
                    content: content,
                    tags: tags,
                    is_public: is_public,
                });
                setIsEditing(true);
            }
        }
    }, [location.search, user, location.state, post]);

    const handleBack = () => {
        console.log("IDs: ", postsIds)
        console.log("current: ", currentPostIndex)
        const prevPostIndex = (currentPostIndex - 1 + postsIds.length) % postsIds.length;
        navigate(`/post/${postsIds[prevPostIndex]}`);
    };

    const handleForward = () => {
        console.log("IDs: ", postsIds)
        console.log("current: ", currentPostIndex)
        const nextPostIndex = (currentPostIndex + 1) % postsIds.length;
        navigate(`/post/${postsIds[nextPostIndex]}`);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditedPost(post);
    };

    const handleSave = () => {
        if (!editedPost.title.trim()) {
            return alert("Por favor, ingresa un título.");
        }

        if (!editedPost.content.trim()) {
            return alert("Por favor, ingresa contenido.");
        }

        const postAction = id === "new"
            ? createPost(editedPost.title, editedPost.content, editedPost.tags, user.id)
            : updatePost({ ...editedPost, id: post.id }, user);

        postAction
            .then((data) => {
                setIsEditing(false);
                id === "new" ? navigate(`/post/${data.id}`) : setPost(data);
            })
            .catch((error) => {
                console.error(`Error ${id === "new" ? "creating" : "updating"} post`, error);
                alert(`Hubo un error al ${id === "new" ? "crear" : "actualizar"} la publicación. Intenta de nuevo.`);
            });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedPost(post);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const confirmDelete = (postId) => {
        deletePost(postId);
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
                tags: [...prevPost.tags, tag]
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
        setUserRating(null);
    };

    const closeRatingModal = () => {
        setShowRatingModal(false);
    };

    const submitRating = async () => {
        if (userRating === null) return;

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

    if (!post && !error) {
        return <div>Loading...</div>;
    }

    if (["NotFound", "Unauthorized"].includes(error)) {
        return <Error type={error} />;
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

            {!isEditing && (
                <>
                    <p className="text-center text-secondary">{post.user_name} - {post.publication_date}</p>

                    <div className="d-flex align-items-center">
                        <strong>Calificación:</strong>
                        <div className="ms-2">
                            {[...Array(5)].map((_, i) => (
                                <FaStar
                                    key={i}
                                    color={i < Math.round(post.rating) ? "#ffc107" : "#e4e5e9"}
                                    style={{ fontSize: "20px" }}
                                />
                            ))}
                            <span className="ms-2 text-muted">{post.rating?.toFixed(1)}</span>
                        </div>
                    </div>
                </>
            )}


            <div className="my-3 position-relative">
                {(isEditing || post.tags?.length > 0) && (<strong>Etiquetas: </strong>)}
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
                    post.tags?.map((tag, i) => (
                        <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                    ))
                )}
            </div>

            {/* Content */}
            <div className="ql-editor my-5">
                {isEditing ? (
                    <QuillEditor
                        value={editedPost.content}
                        onChange={(value) => setEditedPost({ ...editedPost, content: value })}
                    />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                )}
            </div>

            {id === "new" && (
                <div className="ms-auto text-center">
                    <Button variant="secondary" onClick={() => { navigate("/home") }}>Cancelar</Button>
                    <Button className="mx-2" variant="primary" onClick={handleSave}>
                        <FaSave /> Guardar
                    </Button>
                </div>
            )}

            {user?.id !== post.user_id && !isEditing && (
                <div className="text-center my-5">
                    <Button variant="primary" onClick={openRatingModal}>
                        Calificar este post
                    </Button>
                </div>
            )}

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

export default Post;