import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { FaPlus, FaFilter } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // Import Auth Context
import PostsList from "../components/PostsList";
import CreatePostModal from "../components/CreatePostModal";

const Home = () => {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetch("/postsData.json")
      .then((response) => response.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error("Error loading posts:", error));
  }, []);

  const handleSavePost = (newPost) => {
    const newPostWithMeta = {
      ...newPost,
      id: posts.length + 1,
      author: user?.username,
      date: new Date().toISOString().split("T")[0],
      rating: 0,
    };
    setPosts([...posts, newPostWithMeta]);
    setShowModal(false);
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
    setSelectedPost(updatedPost);
  };

  const handlePostSelect = (post) => {
    setSelectedPost(post);
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
    setSelectedPost(null)
  };

  return (
    <Container>
      <h2 className="text-center mb-4 mt-5">Publicaciones</h2>

      <div className="d-flex px-3">
        <Button variant="secondary" onClick={() => setShowFilter(!showFilter)}>
          <FaFilter /> Filtrar
        </Button>

        {user && (
          <Button variant="light" className="mx-1" onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}>
            {showMyPostsOnly ? "Todas las publicaciones" : "Mis Publicaciones"}
          </Button>
        )}

        {user && (
          <Button variant="primary" className="ms-auto" onClick={() => setShowModal(true)}>
            <FaPlus /> Nueva
          </Button>
        )}
      </div>

      {user && (
        <CreatePostModal show={showModal} handleClose={() => setShowModal(false)} handleSave={handleSavePost} />
      )}

      <PostsList
        showFilter={showFilter}
        showMyPostsOnly={showMyPostsOnly}
        username={user?.username}
        posts={posts}
        handleUpdatePost={handleUpdatePost}
        setSelectedPost={handlePostSelect}
        selectedPost={selectedPost}
        handleDeletePost={handleDeletePost}
      />

    </Container>
  );
};

export default Home;
