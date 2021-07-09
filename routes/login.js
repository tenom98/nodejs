var express = require("express")
var router = express.Router()
var mysql = require("mysql2")
var Crypto = require("crypto")
var secretKey = process.env.secretKey
require('dotenv').config()

var conn = mysql.createConnection({
    host : process.env.host,
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
})

router.get("/", function(req, res, next){
    if(!req.session.logged){
        res.render("login",{
            name:"none"
        })
    }else{
        res.render('login',{
            name:req.session.logged.name
        })

    }
    
})

router.post("/login", function(req, res,next){
    var post_id = req.body.post_id
    var password = req.body.password
    var crypto = Crypto.createHmac('sha256',secretKey).update(password).digest('hex')
   
    console.log(post_id, crypto)
    conn.query(
        `SELECT * FROM user_list WHERE post_id = ? and password = ?`,
        [post_id, crypto],
        function(err, result){
            if(err){
                console.log(err)
                res.send("SQL login connection Error")
            }else{
                if(result.length > 0){
                    req.session.logged = result[0]
                    res.redirect('/board')
                }else{
                    res.render('error', {
                        message: "Wrong ID or PassWord"
                    })
                }
            }
        }
    )
})

router.get("/signup", function(req, res, next){
    res.render('signup')
})
router.post("/signup2", function(req, res, next){
    var post_id = req.body.post_id
    var password = req.body.password
    var name = req.body.name
    var division = req.body.division
    var linkcode = req.body.linkcode
    var crypto = Crypto.createHmac('sha256',secretKey).update(password).digest('hex')
    console.log(post_id, password, name, division, linkcode)
    // console.log(req.body)
    conn.query(
        `SELECT * FROM user_list WHERE post_id = ?`,
        [post_id],
        function(err, result){
            if(err){
                console.log(err)
                res.send("SQL connect Error")
            }else{
                if(result.length > 0){
                    res.send("이미 존재하는 아이디")
                }else{
                    conn.query(
                        `insert into user_list (post_id, password, name, division, linkcode) values(?, ?, ?, ?, ?)`,
                        [post_id, crypto, name, division, linkcode],
                        function(err2, result2){
                            if(err2){
                                console.log(err2)
                                res.send("SQL insert Error")
                            }else{
                                res.redirect("/")
                            }
                        }
                    )
                }
            }
        }
    )
})

router.get('/logout', function(req,res,next){
    req.session.destroy(function(err){
        if(err){
            console.log(err)
            res.send("session destroy error")
        }else{
            res.redirect('/')
        }
    })
})
module.exports = router