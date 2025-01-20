const express = require('express');
const { ObjectId } = require("mongodb");

const app = express();
const PORT = 3000;

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/user?:name', (req, res) => {
    res.send(`${req.query.name}`)
})

const MongoClient = require("mongodb").MongoClient;
const dbClient = new MongoClient("mongodb://127.0.0.1:27017/");
const collection = dbClient.db("blogs").collection("posts");

app.set('view engine', 'ejs');
app.set('views', './views');

async function run() {
    try {
        await dbClient.connect();
       
        const res = await collection.find({}).toArray();
        console.log(res)
        console.log("Подключение установлено");
    } catch(err) {
        console.log(err);
    } finally {
        await dbClient.close();
        console.log("Подключение закрыто");
    }
}
run().catch(console.log);

app.get("/blogs", async (req, res) => {
    let response = ""
    await dbClient.connect();
    response = await collection.find({}).toArray();
    res.send(response)
    await dbClient.close();
})

app.get("/blogs/:id", async (req, res) => {
    let post = ""
    console.log(req.params.id)
    await dbClient.connect();

    try {
        post = await collection.find({_id: new ObjectId(req.params.id)}).toArray();
        post = post[0]
        res.render('post', { post });
    } catch (err) {
        res.send("error");
    }

    await dbClient.close();
})

app.post("/blogs", async (req, res) => {
    console.log(req.body);
    await dbClient.connect();

    try {
        await collection.insertOne(req.body);
    } catch (err) {
        res.end("error");
    }

    await dbClient.close();
    res.end(JSON.stringify(req.body));
})

app.delete("/blogs/:id", async (req, res) => {
    await dbClient.connect();
    let id = req.params.id

    try {
        await collection.deleteOne({_id: new ObjectId(id)});
        console.log(`[DELETE /blogs/${id}]: Blog post deleted successfully.`);
    } catch (err) {
        console.error(`[DELETE /blogs/${id} Error]:`, err);
        res.send("error");
    }

    await dbClient.close();
})

app.put("/blogs/:id", async (req, res) => {
    let id = req.params.id
    await dbClient.connect();

    try {
        await collection.updateOne({_id: new ObjectId(id)}, { $set: req.body } );
        console.log(`[PUT /blogs/${id}]: Blog post updated successfully.`);
    } catch (err) {
        console.error(`[PUT /blogs/${id} Error]:`, err);
        res.end("error");
    }

    await dbClient.close();
    res.end(JSON.stringify(req.body));
})

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})
