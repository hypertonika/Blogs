const apiUrl = "http://localhost:3000/blogs";

// Fetch and display all blogs
async function fetchBlogs() {
    const response = await fetch(apiUrl);
    const blogs = await response.json();

    const blogList = document.getElementById('blogList');
    blogList.innerHTML = ''; // Clear existing blogs

    blogs.forEach(blog => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <h3>${blog.title}</h3>
            <p><strong>Author:</strong> ${blog.author || "Anonymous"}</p>
            <p>${blog.body}</p>
            <p><em>Created at:</em> ${new Date(blog.createdAt).toLocaleString()}</p>
            <button onclick="deleteBlog('${blog._id}')">Delete</button>
            <button onclick="showUpdateForm('${blog._id}', '${blog.title}', '${blog.body}', '${blog.author || ''}')">Update</button>
        `;
        blogList.appendChild(listItem);
    });
}

// Add a new blog
document.getElementById('createBlogForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value || "Anonymous";

    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body: content, author }),
    });

    document.getElementById('createBlogForm').reset();
    fetchBlogs();
});

// Delete a blog
async function deleteBlog(id) {
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    });
    fetchBlogs();
}

// Show update form with current blog data
function showUpdateForm(id, title, body, author) {
    document.getElementById('updateBlogForm').style.display = 'block';
    document.getElementById('updateId').value = id;
    document.getElementById('updateTitle').value = title;
    document.getElementById('updateContent').value = body;
    document.getElementById('updateAuthor').value = author || "Anonymous";
}

// Update a blog
document.getElementById('updateBlogForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('updateId').value;
    const title = document.getElementById('updateTitle').value;
    const content = document.getElementById('updateContent').value;
    const author = document.getElementById('updateAuthor').value;

    await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, body: content, author }),
    });

    document.getElementById('updateBlogForm').style.display = 'none';
    fetchBlogs();
});

// Fetch a single blog (optional for debugging)
async function fetchBlogById(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) {
            throw new Error(`Error fetching blog with ID ${id}: ${response.statusText}`);
        }
        const blog = await response.json();
        console.log(blog);
    } catch (error) {
        console.error("An error occurred while fetching the blog:", error.message);
    }
}

// Initial fetch of blogs
fetchBlogs();
