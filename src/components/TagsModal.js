import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import PaginationComponent from './PaginationComponent';
import { useAuth } from "../services/authService";
import { getTags } from '../services/tagService';

const TagsModal = ({ show, handleClose, selectedTags, setSelectedTags }) => {
    const { user } = useAuth();
    const [tags, setTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [onlyMine, setOnlyMine] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            const response = await getTags(currentPage, pageSize, onlyMine);
            setTags(response.tags);
            setCurrentPage(response.current_page);
            setTotalPages(response.total_pages);
            setTotalItems(response.total_items);
        };

        fetchTags();
    }, [currentPage, pageSize, onlyMine]);

    const toggleMineFilter = () => {
        setOnlyMine((prevState) => !prevState);
    };

    const handleTagSelect = (tag) => {
        setSelectedTags((prevSelectedTags) =>
            prevSelectedTags.includes(tag)
                ? prevSelectedTags.filter((t) => t !== tag)
                : [...prevSelectedTags, tag]
        );
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Lista de Etiquetas</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {user && (
                    <Button variant="outline-secondary" onClick={toggleMineFilter} className="mb-3">
                        {onlyMine ? 'Mostrar todas las etiquetas' : 'Mostrar solo mis etiquetas'}
                    </Button>
                )}
                <Row className="px-2">
                    {Array(2).fill().map((_, colIndex) => (
                        <Col xs={12} md={6} key={colIndex}>
                            <ListGroup variant="flush">
                                {tags.filter((_, index) => index % 2 === colIndex).map((tag, index) => (
                                    <ListGroup.Item
                                        key={`${colIndex}-${index}`}
                                        className="text-center"
                                        onClick={() => handleTagSelect(tag)}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedTags.includes(tag) ? '#007bff' : '',
                                            color: selectedTags.includes(tag) ? 'white' : '',
                                            transition: 'background-color 0.2s ease-in-out',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!selectedTags.includes(tag)) e.target.style.backgroundColor = '#cce5ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!selectedTags.includes(tag)) e.target.style.backgroundColor = '';
                                        }}
                                    >
                                        {tag}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                    ))}
                </Row>

                <PaginationComponent
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                />
            </Modal.Body>
        </Modal>
    );
};

export default TagsModal;
