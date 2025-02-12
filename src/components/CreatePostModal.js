import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Button, InputGroup, Badge, ListGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import QuillEditor from "./QuillEditor";
import { useAuth } from "../context/AuthContext";
import "../styles/Modal.css";

const CreatePostModal = ({ show, handleClose, handleSave, initialPost = null }) => {
    const [title, setTitle] = useState(initialPost ? initialPost.title : '');
    const [content, setContent] = useState(initialPost ? initialPost.content : '');
    const [selectedTags, setSelectedTags] = useState(initialPost ? initialPost.tags : []);
    const [is_public, SetIsPublic] = useState(initialPost ? initialPost.is_public : true);
    const [tagInput, setTagInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const { user } = useAuth();

    const allTags = ["JavaScript", "React", "Frontend", "CSS", "Flexbox", "Node.js", "Backend"];

    const handleTagSelect = (tag) => {
        const normalizedTag = tag.toLowerCase();
        if (!selectedTags.some((t) => t.toLowerCase() === normalizedTag)) {
            setSelectedTags((prevTags) => [...prevTags, tag]);
        }
        setTagInput("");
        setShowSuggestions(false);
    };

    const removeTag = (tag) => {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            handleTagSelect(tagInput.trim());
        }
    };

    const filteredSuggestions = tagInput
        ? allTags.filter((tag) => tag.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase()))
        : [];

    const handleSubmit = () => {
        if (title.trim() && content.trim()) {
            handleSave({
                ...initialPost,
                title,
                content,
                tags: selectedTags,
                is_public: initialPost?.user_id === user?.id ? is_public : initialPost.is_public,
            });
            handleClose();
        }
    };

    useEffect(() => {
        if (initialPost) {
            setTitle(initialPost.title);
            setContent(initialPost.content);
            setSelectedTags(initialPost.tags || []);
        } else {
            setTitle("");
            setContent("");
            setSelectedTags([]);
        }
    }, [initialPost]);

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal" centered>
            <Modal.Header closeButton>
                <Modal.Title>{initialPost ? "Editar Post" : "Crear Nuevo Post"}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="post-modal-body">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contenido</Form.Label>
                        <QuillEditor value={content} onChange={setContent} />
                    </Form.Group>
                    <Form.Group className="mb-3 position-relative">
                        <Form.Label>Etiquetas</Form.Label>
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
            <Modal.Footer className="d-flex justify-content-between">
                {initialPost?.user_id === user?.id && (
                    <Button variant="light" className="me-2 d-flex align-items-center" onClick={() => SetIsPublic(!is_public)}>
                        {is_public ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                        <span className="ms-2">{is_public ? "Público" : "Privado"}</span>
                    </Button>
                )}
                <div className="ms-auto">
                    <Button className="mx-2" variant="secondary" onClick={handleClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>{initialPost ? "Actualizar" : "Guardar"}</Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CreatePostModal;
