import React, { useState, useEffect } from "react";
import { Spinner, Container, Button, Form, InputGroup, Badge } from "react-bootstrap";
import { FaPlus, FaFilter } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import PostsList from "../components/PostsList";
import PostModal from "../components/Modals/PostModal";
import { useLocation } from "react-router-dom";
import { deletePost, getPosts } from "../services/postService";
import "../styles/styles.css";
import { getTags } from "../services/tagService";
import PaginationComponent from "../components/PaginationComponent";
import TagsModal from "../components/Modals/TagsModal";


const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
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
  const [tagsFilterMode, setTagsFilterMode] = useState("AND");
  const [tagInput, setTagInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    getPosts(showMyPostsOnly, currentPage, pageSize, selectedTags, tagsFilterMode)
      .then((data) => {
        console.log("DATA: ", data)
        setPosts(data.posts)
        setCurrentPage(data.current_page)
        setTotalPages(data.total_pages)
        setTotalItems(data.total_items)
      })
      .catch((error) => console.error("Error getting posts:", error))
      .finally(() => { setLoading(false) });
  }, [showMyPostsOnly, currentPage, pageSize, selectedTags, tagsFilterMode]);

  useEffect(() => {
    if (showFilter) {
      getTags(1, -1)
        .then((data) => {
          setAllTags(data.tags)
        })
        .catch((error) => {
          console.error("Error getting tags list", error)
        });
    }
  }, [showFilter]);

  const clearFilters = () => {
    setSelectedTags([])
  }

  const filteredSuggestions = tagInput
    ? allTags
      .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
      .filter(tag => !selectedTags.some(selectedTag => selectedTag.toLowerCase() === tag.toLowerCase()))
    : allTags.filter(tag => !selectedTags.some(selectedTag => selectedTag.toLowerCase() === tag.toLowerCase()));

  const handleTagSelect = (tag) => {
    setSelectedTags(prevTags => {
      const normalizedTag = tag.toLowerCase();
      const tagExists = prevTags.some(t => t.toLowerCase() === normalizedTag);
      const isInputTagSelected = normalizedTag === tagInput.toLowerCase();

      if (tagExists && !isInputTagSelected) {
        return prevTags.filter(t => t.toLowerCase() !== normalizedTag);
      }

      if (tagExists || isInputTagSelected) {
        return prevTags;
      }

      return [...prevTags, tag];
    });

    setTagInput("");
    setShowDropdown(false);
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleClosePostModal = (postData, isNew) => {
    if (postData && postData.title) {
      setSelectedPost(postData)
      console.log("isNew", isNew)
      if (isNew) {
        setPosts((prevPosts) => [...prevPosts, postData]);
      } else {
        setPosts(prevPosts => prevPosts.map(post => (post.id === postData.id ? postData : post)));
      }
    } else {
      setSelectedPost(null)
    }
    setShowPostModal(false)
  };

  const handleCloseTagsModal = () => {
    setShowTagsModal(false)
  }

  const handleDeletePost = (postId) => {
    deletePost(postId);
    setPosts(posts.filter((post) => post.id !== postId));
    setSelectedPost(null)
  };

  const handleShowAllTags = () => {
    setShowTagsModal(true)
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
            <Button variant="primary" onClick={() => { setShowPostModal(true); setModalMode("create") }}>
              <FaPlus /> Nueva
            </Button>
          )}
        </div>
      </div>


      {showFilter && (
        <div className="m-3 p-3 border rounded bg-light position-relative">
          <Button
            variant="outline-warning"
            className="position-absolute top-0 end-0 mt-2 me-2"
            onClick={clearFilters}
            style={{ zIndex: 1000 }}
          >
            Limpiar filtros
          </Button>

          <Form.Group className="position-relative">
            <Form.Label className="d-block mb-1">Etiquetas:</Form.Label>

            <div className="d-flex align-items-center">
              <div className="position-relative ms-3" style={{ maxWidth: "350px" }}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Escribe para buscar etiquetas"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    style={{ width: "350px" }}
                  />
                </InputGroup>

                {showDropdown && (
                  <div
                    className="position-absolute bg-white border rounded shadow mt-1"
                    style={{
                      top: "100%",
                      left: 0,
                      zIndex: 1000,
                      maxHeight: "200px",
                      overflowY: "scroll",
                      width: "350px"
                    }}
                  >
                    {filteredSuggestions?.map((tag, index) => (
                      <div
                        key={index}
                        className="p-2"
                        style={{ cursor: "pointer" }}
                        onMouseDown={() => handleTagSelect(tag)}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="light"
                className="ms-2"
                onClick={() => setTagsFilterMode(tagsFilterMode === "AND" ? "OR" : "AND")}
              >
                {tagsFilterMode}
              </Button>

              <Button variant="secondary" className="ms-5" onClick={handleShowAllTags}>
                Ver todas
              </Button>
            </div>
          </Form.Group>

          <div className="mt-2 d-flex flex-wrap align-items-center">
            {selectedTags?.map((tag, index) => (
              <Badge
                key={index}
                bg="primary"
                className={index === 0 ? "ms-3 me-1" : "me-1"}
                onClick={() => removeTag(tag)}
                style={{ cursor: "pointer" }}
              >
                {tag} ✕
              </Badge>
            ))}
          </div>
        </div>
      )}

      {user && (
        <PostModal
          show={showPostModal}
          handleClose={handleClosePostModal}
          handleDelete={handleDeletePost}
          mode={modalMode}
          setMode={setModalMode}
        />
      )}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <Spinner animation="border" />
        </div>
      ) : (
        <PostsList
          posts={posts}
          handleCloseModal={handleClosePostModal}
          setSelectedPost={setSelectedPost}
          selectedPost={selectedPost}
          handleDeletePost={handleDeletePost}
          modalMode={modalMode}
          setModalMode={setModalMode}
        />
      )}

      <TagsModal
        show={showTagsModal}
        handleClose={handleCloseTagsModal}
        selectedTags={selectedTags}
        handleTagSelect={handleTagSelect}
      />

      <PaginationComponent currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} setPageSize={setPageSize} />


    </Container>
  );
};

export default Home;
