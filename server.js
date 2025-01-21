const express = require('express');
const { ObjectId } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MongoClient = require('mongodb').MongoClient;
const dbClient = new MongoClient('mongodb://127.0.0.1:27017/');
const collection = dbClient.db('blogs').collection('posts');


//error handling
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// POST
app.post(
    '/blogs',
    asyncHandler(async (req, res) => {
        const { title, body, author = 'Anonymous' } = req.body;

        // Validation
        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required.' });
        }

        const newBlog = {
            title,
            body,
            author,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await dbClient.connect();
        const result = await collection.insertOne(newBlog);
        await dbClient.close();

        res.status(201).json({
            id: result.insertedId,
            title: newBlog.title,
            body: newBlog.body,
            author: newBlog.author,
            createdAt: newBlog.createdAt,
            updatedAt: newBlog.updatedAt,
        });
    })
);


// GET all
app.get(
    '/blogs',
    asyncHandler(async (req, res) => {
        await dbClient.connect();
        const blogs = await collection.find({}).toArray();
        await dbClient.close();

        res.json(blogs);
    })
);

// GET single
app.get(
    '/blogs/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID.' });
        }

        await dbClient.connect();
        const blog = await collection.findOne({ _id: new ObjectId(id) });
        await dbClient.close();

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        res.json(blog);
    })
);

// PUT
app.put(
    '/blogs/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, body, author } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID.' });
        }

        // Validation
        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required.' });
        }

        const updatedBlog = {
            title,
            body,
            author: author || 'Anonymous',
            updatedAt: new Date(),
        };

        await dbClient.connect();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedBlog }
        );
        await dbClient.close();

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        res.json({ message: 'Blog updated successfully.' });
    })
);

// DELETE 
app.delete(
    '/blogs/:id',
    asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid blog ID.' });
        }

        await dbClient.connect();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        await dbClient.close();

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Blog not found.' });
        }

        res.json({ message: 'Blog deleted successfully.' });
    })
);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
