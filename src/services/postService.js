import config from "../config";
import { fetchWithAuth } from "./authService";

export const getPostById = async (id) => {
    return await fetchWithAuth(`${config.API_BASE_URL}/post?id=${id}`);
}

export const createPost = async (title, content, tags, userId) => {
    return await fetchWithAuth(`${config.API_BASE_URL}/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ "title": title, "content": content, "tags": tags, "user_id": userId }),
    });
};

export const updatePost = async (updatedPostData, user) => {
    return await fetchWithAuth(`${config.API_BASE_URL}/post/${updatedPostData.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...updatedPostData, "user_id": user.id }),
    });
};

export const deletePost = async (postId) => {
    return await fetchWithAuth(`${config.API_BASE_URL}/post/${postId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
};

export const getPosts = async (showMyPostsOnly, currentPage, pageSize, tags, tagFilterMode) => {
    const skip = (currentPage - 1) * pageSize;
    let url = config.API_BASE_URL + "/posts";

    const queryParams = new URLSearchParams({
        size: pageSize,
        skip: skip,
        filter: showMyPostsOnly ? "mine" : "all",
    });

    if (tags.length > 0) {
        queryParams.append("tag_filter_mode", tagFilterMode.toLowerCase())
        tags.forEach(tag => queryParams.append("tags", tag));
    }

    url += "?" + queryParams.toString();

    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    };

    return await fetchWithAuth(url, requestOptions);
}

export const getPostsIds = async (showMyPostsOnly) => {
    let url = config.API_BASE_URL + "/posts_ids";

    const queryParams = new URLSearchParams({
        filter: showMyPostsOnly ? "mine" : "all"
    });

    url += "?" + queryParams.toString();

    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    };

    return await fetchWithAuth(url, requestOptions);
}