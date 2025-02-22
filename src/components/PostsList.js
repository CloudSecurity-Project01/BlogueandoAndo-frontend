import React from "react";
import { Card, Container, Row, Col, Badge } from "react-bootstrap";
import { FaStar, FaEye, FaEyeSlash } from "react-icons/fa";
import PostModal from "./PostModal";
import DOMPurify from "dompurify";
import { useAuth } from "../services/authService";
import "../styles/styles.css";

const PostsList = ({ posts, handleCloseModal, setSelectedPost, selectedPost, handleDeletePost, modalMode, setModalMode }) => {

  const { user } = useAuth();

  const sanitizeContent = (content) => {
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["p", "ul", "ol", "li", "b", "i", "u", "strong", "em", "br"]
    });
    const limitedContent = sanitized.slice(0, 200) + (sanitized.length > 200 ? "..." : "");
    return limitedContent;
  };

  return (
    <Container className="mt-2">
      <Row className="mt-4">
        {posts?.length > 0 ? (
          posts?.map((post, index) => (
            <Col md={4} key={index} className="mb-4">
              <Card className="shadow post-card position-relative" onClick={() => {setSelectedPost(post); setModalMode("view")}}>
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
                  <div className="px-0 my-4 post-content-preview">
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
          <p className="text-center my-5">No hay publicaciones disponibles.</p>
        )}
      </Row>

      <PostModal
        show={selectedPost !== null}
        handleClose={handleCloseModal}
        post={selectedPost}
        setPost={setSelectedPost}
        handleDelete={handleDeletePost}
        mode={modalMode}
        setMode={setModalMode}
      />
    </Container>
  );
};

export default PostsList;
