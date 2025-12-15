const SERVER = "http://localhost:3000";
const API = `${SERVER}/api`;

// Utils
const getToken = () => localStorage.getItem("token");
const getUser = () => JSON.parse(localStorage.getItem("user") || "{}");
const isLoggedIn = () => !!getToken();

// Helper to handle fetch with auth and potential logout
const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = { ...options.headers };
    if (token) headers["Authorization"] = token;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "login.html";
        return null;
    }

    // Check if JSON response explicitly says invalid token (if backend returns 200/400 with message)
    const clone = res.clone();
    try {
        const data = await clone.json();
        if (data.message === "Invalid Token") {
            localStorage.clear();
            window.location.href = "login.html";
            return null;
        }
    } catch (e) { }

    return res;
};

// DOM Content Loaded - Entry Point
document.addEventListener("DOMContentLoaded", () => {

    // Auth Redirects
    const path = window.location.pathname;
    if (isLoggedIn() && (path.includes("login.html") || path.includes("register.html"))) {
        window.location.href = "feed.html";
    }
    if (!isLoggedIn() && (path.includes("feed.html") || path.includes("profile.html"))) {
        window.location.href = "login.html";
    }

    // Init Page Specific Logic
    if (document.getElementById("loginForm")) initLogin();
    if (document.getElementById("registerForm")) initRegister();
    if (document.getElementById("postList")) initFeed();
    if (document.getElementById("profileUsername")) initProfile();

    // Global Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    // Load Sidebar if exists
    if (document.getElementById("sidebarAvatar")) loadSidebar();
});


/* ============================
   AUTH MODULE
============================ */
function initLogin() {
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                window.location.href = "feed.html";
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    });
}

function initRegister() {
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const res = await fetch(`${API}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();

            if (data.success) {
                alert("Account created! Please login.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        }
    });
}


/* ============================
   FEED & POST MODULE
============================ */
async function initFeed() {
    await loadPosts();

    const postBtn = document.getElementById("postBtn");
    if (postBtn) {
        postBtn.addEventListener("click", async () => {
            const caption = document.getElementById("postText").value;
            if (!caption.trim()) return alert("Please write something!");

            try {
                const imageInput = document.getElementById("postImage");
                const image = imageInput.files[0];

                const formData = new FormData();
                formData.append("caption", caption);
                if (image) formData.append("image", image);

                const res = await authFetch(`${API}/posts`, {
                    method: "POST",
                    body: formData
                });
                if (!res) return;
                const data = await res.json();

                if (data.success) {
                    document.getElementById("postText").value = "";
                    loadPosts(); // Reload feed
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
}

async function loadPosts() {
    const list = document.getElementById("postList");
    if (!list) return;
    list.innerHTML = `<p style="text-align:center; padding: 2rem;">Loading posts...</p>`;

    try {
        const res = await authFetch(`${API}/posts`);
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            renderPosts(data.posts, list);
        } else {
            list.innerHTML = `<p>Failed to load posts.</p>`;
        }
    } catch (err) {
        console.error(err);
        list.innerHTML = `<p>Error loading posts.</p>`;
    }
}

function renderPosts(posts, container) {
    container.innerHTML = "";
    if (posts.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 2rem; color: #6b7280;">No posts yet. Be the first!</p>`;
        return;
    }

    const currentUser = getUser();

    posts.forEach(post => {
        if (!post.user) return; // Skip broken posts

        const likes = post.likes || [];
        const isLiked = likes.includes(currentUser._id);
        const likeIcon = isLiked ? "👍" : "👎";
        const likeClass = isLiked ? "active" : "";

        // Determine Avatar text or image
        const avatarDisplay = post.user.profilePic
            ? `<img src="${SERVER}${post.user.profilePic}" class="post-avatar-img" alt="Avatar">`
            : `<div class="post-avatar">${post.user.username ? post.user.username[0].toUpperCase() : "U"}</div>`;

        const imageDisplay = post.image
            ? `<img src="${SERVER}${post.image}" class="post-image" alt="Post content">`
            : "";

        const html = `
            <div class="post-card">
                <div class="post-header">
                    ${avatarDisplay}
                    <div class="post-info">
                        <h4>${post.user.username}</h4>
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="post-content">${post.caption || ""}</div>
                ${imageDisplay}
                
                <div class="post-footer">
                    <button class="action-btn ${likeClass}" onclick="toggleLike('${post._id}')">
                        ${likeIcon} ${likes.length} Likes
                    </button>
                    <!-- Comments can be expanded later -->
                    <button class="action-btn" onclick="toggleComments('${post._id}')">
                        💬 ${post.comments.length} Comments
                    </button>
                </div>
                
                <div id="comments-${post._id}" class="comments-section" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border);">
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="commentInput-${post._id}" class="form-control" placeholder="Add a comment..." style="width: 100%;">
                        <button class="btn-primary" style="width: auto; margin: 0; padding: 0.5rem 1rem;" onclick="addComment('${post._id}')">Post</button>
                    </div>
                    <div id="commentList-${post._id}">
                        <!-- Comments injected here -->
                    </div>
                </div>
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// Global Like Function
window.toggleLike = async (postId) => {
    try {
        const res = await authFetch(`${API}/posts/like/${postId}`, {
            method: "POST"
        });
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            if (document.getElementById("postList") && window.location.pathname.includes("feed")) {
                loadPosts();
            } else if (window.location.pathname.includes("profile")) {
                initProfile();
            }
        }
    } catch (err) {
        console.error(err);
    }
};

window.toggleComments = async (postId) => {
    const el = document.getElementById(`comments-${postId}`);
    if (!el) return;

    // Toggle display
    const isHidden = el.style.display === "none";
    el.style.display = isHidden ? "block" : "none";

    if (isHidden) {
        // Load comments
        await loadComments(postId);
    }
};

window.addComment = async (postId) => {
    const input = document.getElementById(`commentInput-${postId}`);
    const text = input.value;
    if (!text.trim()) return;

    try {
        const res = await authFetch(`${API}/comments/${postId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            input.value = "";
            loadComments(postId);
        }
    } catch (err) {
        console.error(err);
    }
};

async function loadComments(postId) {
    const list = document.getElementById(`commentList-${postId}`);
    list.innerHTML = `<p style="font-size: 0.8rem; color: #aaa;">Loading...</p>`;

    try {
        const res = await authFetch(`${API}/comments/${postId}`);
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            list.innerHTML = "";
            if (data.comments.length === 0) list.innerHTML = `<p style="font-size: 0.8rem; color: #aaa;">No comments yet.</p>`;

            data.comments.forEach(c => {
                list.innerHTML += `
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; font-size: 0.9rem;">${c.user.username}:</span>
                        <span style="font-size: 0.9rem;">${c.text}</span>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error(err);
    }
}


/* ============================
   PROFILE MODULE
============================ */
async function initProfile() {
    // Get ID from URL query or default to current user
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id") || getUser()._id;
    const isSelf = userId === getUser()._id;

    try {
        const res = await authFetch(`${API}/users/profile/${userId}`);
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            const { user, posts } = data;

            // Header Information
            document.getElementById("profileUsername").innerText = user.username;
            document.getElementById("profileHandle").innerText = `@${user.username}`;

            // Profile Picture
            const avatarEl = document.getElementById("profileAvatar");
            if (user.profilePic) {
                avatarEl.innerHTML = `<img src="${SERVER}${user.profilePic}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;">`;
            } else {
                avatarEl.innerText = user.username[0].toUpperCase();
            }

            // Stats
            document.getElementById("profileFollowers").innerText = user.followers.length;
            document.getElementById("profileFollowing").innerText = user.following.length;
            document.getElementById("profilePostCount").innerText = posts.length;

            // Render Posts
            const postsContainer = document.getElementById("userPosts");
            // Inject user object into posts for rendering consistency since profile API might separate them
            const postsWithUser = posts.map(p => ({ ...p, user: { ...user, _id: user._id } }));
            renderPosts(postsWithUser, postsContainer);

            // Action Button (Edit or Follow)
            const actionBtn = document.getElementById("profileActionBtn");
            const fileInput = document.getElementById("profilePicInput"); // Hidden input

            if (isSelf) {
                actionBtn.innerText = "Edit Profile";
                actionBtn.onclick = () => {
                    if (fileInput) fileInput.click();
                };

                if (fileInput) {
                    fileInput.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("profilePic", file);

                        try {
                            const res = await authFetch(`${API}/users/profile`, {
                                method: "PUT",
                                body: formData
                            });
                            if (!res) return;
                            const data = await res.json();
                            if (data.success) {
                                initProfile();
                                alert("Profile updated!");
                            }
                        } catch (err) {
                            console.error(err);
                        }
                    }
                }
            } else {
                const isFollowing = user.followers.some(f => f._id === getUser()._id || f === getUser()._id);
                actionBtn.innerText = isFollowing ? "Unfollow" : "Follow";
                actionBtn.classList.toggle("btn-primary", !isFollowing);
                actionBtn.classList.toggle("btn-outline", isFollowing);

                actionBtn.onclick = () => toggleFollow(userId, isFollowing);
            }

        }
    } catch (err) {
        console.error(err);
    }
}

async function toggleFollow(userId, isFollowing) {
    const endpoint = isFollowing ? "unfollow" : "follow";
    try {
        const res = await authFetch(`${API}/users/${endpoint}/${userId}`, {
            method: "POST"
        });
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            initProfile(); // Reload page/stats
        }
    } catch (err) {
        console.error(err);
    }
}

/* ============================
   SIDEBAR MODULE
============================ */
async function loadSidebar() {
    const userId = getUser()._id;
    try {
        const res = await authFetch(`${API}/users/profile/${userId}`);
        if (!res) return;
        const data = await res.json();

        if (data.success) {
            const { user } = data;
            const avatarEl = document.getElementById("sidebarAvatar");
            if (user.profilePic) {
                avatarEl.innerHTML = `<img src="${SERVER}${user.profilePic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            } else {
                avatarEl.innerText = user.username[0].toUpperCase();
            }
            document.getElementById("sidebarName").innerText = user.username;
            document.getElementById("sidebarHandle").innerText = `@${user.username}`;

            const followersEl = document.getElementById("sidebarFollowers");
            const followingEl = document.getElementById("sidebarFollowing");

            followersEl.innerText = user.followers.length;
            followingEl.innerText = user.following.length;

            // Make Active / Clickable
            followersEl.parentElement.style.cursor = "pointer";
            followingEl.parentElement.style.cursor = "pointer";

            followersEl.parentElement.onclick = () => showUserListModal("Followers", user.followers);
            followingEl.parentElement.onclick = () => showUserListModal("Following", user.following);
        }
    } catch (err) {
        console.error(err);
    }
}

/* Modal Logic */
const modal = document.getElementById("userListModal");
const closeModal = document.querySelector(".close-modal");
if (modal && closeModal) {
    closeModal.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

function showUserListModal(title, users) {
    if (!modal) return;
    document.getElementById("modalTitle").innerText = title;
    const list = document.getElementById("modalUserList");
    list.innerHTML = "";

    if (users.length === 0) {
        list.innerHTML = "<p>No users found.</p>";
    } else {
        users.forEach(u => {
            const username = u.username || "Unknown";
            const profilePic = u.profilePic ? `<img src="${SERVER}${u.profilePic}" style="width:30px;height:30px;border-radius:50%;margin-right:10px;vertical-align:middle;object-fit:cover;">` : `<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:#e0e7ff;color:var(--primary);margin-right:10px;text-align:center;line-height:30px;font-weight:bold;">${username[0].toUpperCase()}</span>`;

            list.innerHTML += `
                <div style="padding: 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center;">
                    ${profilePic}
                    <a href="profile.html?id=${u._id}" style="font-weight:600;">${username}</a>
                </div>
            `;
        });
    }

    modal.style.display = "block";
}
