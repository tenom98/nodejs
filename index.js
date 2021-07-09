var express = require("express")
var app = express()
var port = 3000
var path = require("path")
var session = require("express-session")
require('dotenv').config()

app.set("views", path.join(__dirname,"views"))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname,"public")))
app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use(
    session({
        secret:process.env.session_secret,
        resave:false,
        saveUninitialized:true,
        maxAge:3600000
    })
)

var main = require('./routes/main')
app.use('/board', main)

var login = require('./routes/login')
app.use('/', login)

app.get("/test", function(req,res){
    res.render("test")
})
app.listen(port,function(){
    console.log("Now we start")
})
