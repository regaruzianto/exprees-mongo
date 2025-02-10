const express = require('express');
const mongoose = require('mongoose');
const port = 3000;
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');


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

app.listen(port, ()=>{
    console.log("terhubung ke localhost 3000");
});
