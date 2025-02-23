const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const likeRouter = require('./routes/like');
const commentRouter = require('./routes/comment');
const followRouter = require('./routes/follow');


const app = express()

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/cobadatabase')
.then(() => {
    console.log("Terhunbung ke MogoDb");
})
.catch((err)=>{
    console.log("Koneksi Gagal", err);

});


app.get('/', (req,res)=>{
    res.json('Hello World');
});


app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/like', likeRouter);
app.use('/comment', commentRouter);
app.use('/follow', followRouter);

app.listen(port, ()=>{
    console.log("terhubung ke localhost 3000");
});
