import React, { useState, useEffect } from 'react';
import { Spinner, Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';

import PaginationComponent from '../PaginationComponent';
import { getTags } from '../../services/tagService';
import { useAuth } from '../../context/AuthContext';

const TagsModal = ({ show, handleClose, selectedTags, handleTagSelect }) => {
    const { user } = useAuth();
    const [tags, setTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [onlyMine, setOnlyMine] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            const response = await getTags(currentPage, pageSize, onlyMine);
            setTags(response.tags);
            setCurrentPage(response.current_page);
            setTotalPages(response.total_pages);
            setTotalItems(response.total_items);
            setLoading(false);
        };
        setLoading(true);
        fetchTags();
    }, [currentPage, pageSize, onlyMine]);

    const toggleMineFilter = () => {
        setOnlyMine((prevState) => !prevState);
    };



    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Lista de Etiquetas</Modal.Title>
            </Modal.Header>
            <Modal.Body className='d-flex flex-column post-modal-body'>
                <div>
                    {user && (
                        <Button variant="outline-secondary" onClick={toggleMineFilter} className="mb-3">
                            {onlyMine ? 'Mostrar todas las etiquetas' : 'Mostrar solo mis etiquetas'}
                        </Button>
                    )}
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                            <Spinner animation="border" />
                        </div>
                    ) : (<>
                        <Row className="px-2 pt-2">
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
                    </>)}
                </div>
                <div className='mt-auto'>
                <PaginationComponent
                    
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                />
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default TagsModal;
