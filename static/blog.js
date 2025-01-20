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
            <p>${blog.content}</p>
            <button onclick="deleteBlog('${blog._id}')">Delete</button>
        `;
        blogList.appendChild(listItem);
    });
}

// Add a new blog
document.getElementById('createBlogForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, content })
    });

    document.getElementById('createBlogForm').reset();
    fetchBlogs();
});

// Delete a blog
async function deleteBlog(id) {
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
    });
    fetchBlogs();
}

// Initial fetch of blogs
fetchBlogs();
