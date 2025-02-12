import React, { useState } from "react";
import { Card, Container, Row, Col, Badge, Form, InputGroup, Button } from "react-bootstrap";
import { FaStar, FaEye, FaEyeSlash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PostModal from "./PostModal";
import DOMPurify from "dompurify";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Modal.css";

const PostsList = ({ showFilter, showMyPostsOnly, posts, handleUpdatePost, setSelectedPost, selectedPost, handleDeletePost }) => {
  
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const pageSize = 12;
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  const allTags = [...new Set(posts.flatMap(post => post.tags))];
  const filteredSuggestions = tagInput ? allTags.filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase())) : allTags;

  const handleTagSelect = (tag) => {
    setSelectedTags(prevTags => [...new Set([...prevTags, tag])]);
    setTagInput("");
    setShowDropdown(false);
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  let filteredPosts = posts;

  if (showMyPostsOnly && user) {
    filteredPosts = filteredPosts.filter(post => post.user_id === user?.id);
  }

  if (selectedTags.length > 0) {
    filteredPosts = filteredPosts.filter(post => selectedTags.every(tag => post.tags.includes(tag)));
  }

  const totalPages = Math.ceil(filteredPosts.length / pageSize);
  const currentPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      navigate(`/home?page=${page}`);
    }
  };

  const sanitizeContent = (content) => {
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["p", "ul", "ol", "li", "b", "i", "u", "strong", "em", "br"]
    });
    const limitedContent = sanitized.slice(0, 200) + (sanitized.length > 200 ? "..." : "");
    return limitedContent;
  };

  return (
    <Container className="mt-2">
      {showFilter && (
        <Form.Group className="mb-3 position-relative">
          <Form.Label>Filtrar por etiquetas</Form.Label>
          <InputGroup>
            <Form.Control 
              type="text" 
              placeholder="Escribe para buscar etiquetas" 
              value={tagInput} 
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </InputGroup>
          {showDropdown && (
            <div className="position-absolute w-100 bg-white border rounded shadow mt-1" style={{ top: "100%", left: 0, zIndex: 1000 }}>
              {filteredSuggestions.map((tag, index) => (
                <div key={index} className="p-2" style={{ cursor: "pointer" }} onMouseDown={() => handleTagSelect(tag)}>
                  {tag}
                </div>
              ))}
            </div>
          )}
          <div className="mt-2">
            {selectedTags.map((tag, index) => (
              <Badge key={index} bg="primary" className="me-1" onClick={() => removeTag(tag)} style={{ cursor: "pointer" }}>
                {tag} ✕
              </Badge>
            ))}
          </div>
        </Form.Group>
      )}

      <Row className="mt-4">
        {currentPosts.length > 0 ? (
          currentPosts.map((post, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow post-card position-relative" onClick={() => setSelectedPost(post)}>
                {post.user_id === user?.id && (
                  <div className="position-absolute top-0 end-0 p-2">
                    {post.is_public ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                  </div>
                )}

                <Card.Body>
                  <Card.Title className="post-title-preview">{post.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Por {post.user_name} - {post.publication_date}</Card.Subtitle>
                  <div>
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} color={i < post.rating ? "#ffc107" : "#e4e5e9"} />
                    ))}
                  </div>
                  <div className="ql-editor px-0 my-4 post-content-preview">
                    <div dangerouslySetInnerHTML={{ __html: sanitizeContent(post.content) }} />
                  </div>
                  <div className="mt-2">
                    {post.tags.map((tag, i) => (
                      <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No hay publicaciones disponibles.</p>
        )}
      </Row>

      <PostModal 
        show={selectedPost !== null} 
        handleClose={() => {setSelectedPost(null)}} 
        post={selectedPost} 
        handleUpdate={handleUpdatePost}
        handleDelete={handleDeletePost}
      />

      <div className="d-flex justify-content-center align-items-center mt-4">
        <Button variant="link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          <FaChevronLeft /> Anterior
        </Button>

        <div className="mx-3">
          Página {currentPage} de {totalPages}
        </div>

        <Button variant="link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Siguiente <FaChevronRight />
        </Button>

      </div>
    </Container>
  );
};

export default PostsList;
