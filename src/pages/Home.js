import React, { useState, useEffect } from "react";
import { Pagination, Dropdown, DropdownButton, ButtonGroup, Container, Button, Form, InputGroup, Badge } from "react-bootstrap";
import { FaPlus, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../services/authService";
import PostsList from "../components/PostsList";
import PostModal from "../components/PostModal";
import { useLocation } from "react-router-dom";
import { deletePost, getPosts } from "../services/postService";
import "../styles/Modal.css";
import { getTags } from "../services/tagService";


const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [pageSize, setPageSize] = useState(12);
  const [allTags, setAllTags] = useState([]);
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    getPosts(showMyPostsOnly, currentPage, pageSize)
      .then((data) => {
        console.log("DATA: ", data)
        setPosts(data.posts)
        setCurrentPage(data.current_page)
        setTotalPages(data.total_pages)
        setTotalItems(data.total_items)
      })
      .catch((error) => console.error("Error getting posts:", error));
  }, [showMyPostsOnly, currentPage, pageSize]);

  useEffect(() => {
      getTags()
          .then(setAllTags)
          .catch((error) => {
              console.error("Error getting tags list", error)    
          });
  }, []);

  const handleSavePost = () => {

  };

  //const allTags = [...new Set(posts?.flatMap(post => post.tags))];
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

  if (selectedTags.length > 0) {
    filteredPosts = filteredPosts.filter(post => selectedTags.every(tag => post.tags.includes(tag)));
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleClose = (postData) => {
    if (postData && postData.title) {
      setSelectedPost(postData)
      setPosts(prevPosts =>
        prevPosts.map(post => (post.id === postData.id ? postData : post))
      );
    } else {
      setSelectedPost(null)
    }
    setShowModal(false)
  };

  const handleDeletePost = (postId) => {
    deletePost(postId);
    setPosts(posts.filter((post) => post.id !== postId));
    setSelectedPost(null)
  };

  const pageSizeOptions = [10, 25, 50, 100];

  const renderPageNumbers = () => {
    let pages = [];

    pages.push(
      <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </Pagination.Item>
    );

    if (currentPage > 3) {
      pages.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
    }

    if (currentPage > 2) {
      pages.push(
        <Pagination.Item key={currentPage - 1} onClick={() => handlePageChange(currentPage - 1)}>
          {currentPage - 1}
        </Pagination.Item>
      );
    }

    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(
        <Pagination.Item key={currentPage} active>
          {currentPage}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - 1) {
      pages.push(
        <Pagination.Item key={currentPage + 1} onClick={() => handlePageChange(currentPage + 1)}>
          {currentPage + 1}
        </Pagination.Item>
      );
    }

    if (currentPage < totalPages - 2) {
      pages.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
    }

    if (totalPages > 1) {
      pages.push(
        <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    return pages;
  };



  return (
    <Container>
      <h2 className="text-center mb-4 mt-5">Publicaciones</h2>

      <div className="d-flex">
        <Button variant="dark" onClick={() => setShowFilter(!showFilter)}>
          <FaFilter /> Filtrar
        </Button>

        {user && (
          <Button variant="light" className="mx-1" onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}>
            {showMyPostsOnly ? "Mis Publicaciones" : "Todas las publicaciones"}
          </Button>
        )}
        <div className="ms-auto">

          {user && (
            <Button variant="primary" onClick={() => { setShowModal(true); }}>
              <FaPlus /> Nueva
            </Button>
          )}
        </div>
      </div>


      {showFilter && (
        <Form.Group className="my-3 position-relative">
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

      {user && (
        <PostModal
          show={showModal}
          handleClose={handleClose}
          handleDelete={handleDeletePost}
          initMode="create"
        />
      )}

      <PostsList
        posts={posts}
        handleSubmit={handleSavePost}
        handleCloseModal={handleClose}
        setSelectedPost={setSelectedPost}
        selectedPost={selectedPost}
        handleDeletePost={handleDeletePost}
      />

      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft />
          </Pagination.Prev>

          {renderPageNumbers()}

          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight />
          </Pagination.Next>
        </Pagination>
      </div>
        
      <div className="d-flex justify-content-center mb-3 align-items-center" >
        <span>Resultados por página: </span>
          <DropdownButton as={ButtonGroup} title={`${pageSize}`} variant="light" className="mx-2">
            {pageSizeOptions.map((size) => (
              <Dropdown.Item key={size} onClick={() => { setPageSize(size); setCurrentPage(1); }}>
                {size}
              </Dropdown.Item>
            ))}
          </DropdownButton>
          <span>de {totalItems}</span>
        </div>
    </Container>
  );
};

export default Home;
