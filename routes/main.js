var express = require("express")
var router = express.Router()
var mysql = require("mysql2")
require('dotenv').config()
var moment = require('moment')

var conn = mysql.createConnection({
    host : "localhost",
    port : 3306,
    user : "root",
    password : "1234",
    database : "test"
})

router.get('/', function(req,res,next){
    if(!req.session.logged){
        res.redirect("/")
    }else{
    conn.query(
        `SELECT * FROM board`,
        function(err, result){
            if(err){
                console.log(err)
                res.send("sql conn error")
            }else{
                res.render('front',{
                    letter : result,
                    name : req.session.logged.name
                })
            }
        }
    )
}})

router.get("/search", function(req,res,next){
    var No = req.query.No
    // console.log(No)
    if(!req.session.logged){
        res.redirect("/")
    }else{
    conn.query(
        `SELECT * FROM board WHERE No =?`,
        [No],
        function(err,result){
            if(err){
                console.log(err)
                res.send("SELECT ERROR")
            }else{
                conn.query(
                    `SELECT * FROM comment WHERE parent_num=?`,
                    [No],
                    function(err,result2){
                        if(err){
                            res.render("error",{
                                message:"게시글 댓글에러"
                            })
                        }else{
                             res.render('search',{
                             info : result,
                             post_id: req.session.logged.post_id,
                             name : req.session.logged.name,
                             opinion : result2
                        })
                    }
            })
        }
        })
}})

router.post("/add_comment", function(req,res,next){
    if(!req.session.logged){
        res.redirect("/")

    }else{
        var No = req.body.No;
        var comment = req.body.comment;
        var post_id = req.session.logged.post_id;
        var name = req.session.logged.name;
        var date = moment().format("YYMMDD");
        var time = moment().format("HHmmss");
       
        conn.query(
            `insert into comment (parent_num,opinion,post_id,name,date,time) values (?,?,?,?,?,?)`,
            [No, comment, post_id, name, date, time],
            function(err, result){
                if(err){
                    console.log(err);
                    res.render("error",{
                        message : "댓글추가 실패"
                    })
                }else{
                    res.redirect("/board/search?No="+No);
                }
            }
        )
    }
    
})

router.get("/publish", function(req,res,next){
    if(!req.session.logged){
        res.redirect('/')
}else{
    res.render('publish',{
        name : req.session.logged.name
    })
}})

router.post("/publish", function(req,res,next){
    var title = req.body.title
    var content = req.body.content
    var img = req.body.img
    var date = moment().format("YYYYMMDD")
    var time = moment().format("hhmmss")
    console.log(title, content, img, date, time)
    
    var author = req.session.logged.name
    var post_id = req.session.logged.post_id
    conn.query(
        `insert into board (title, content, img, date, time, author, post_id) values(?, ?, ?, ?, ?, ?, ?)`,
        [title, content, img, date, time, author, post_id],
        function(err, result){
            if(err){
                console.log(err)
                res.send("wrong SQL conn")
            }else{
                res.redirect("/board")
            }
        }
    )
})
router.get("/del", function(req, res, next){
    var No = req.query.No
    console.log(No)
    if(!req.session.logged){
        res.redirect("/")
    }else{
    conn.query(
        `DELETE FROM board WHERE No =?`,
        [No],
        function(err,result){
            if(err){
                console.log(err)
                res.send("DELETE ERROR")
            }else{
                res.redirect('/board')
            }
        }
    )
}})

router.get("/retouch", function(req, res, next){
    var No = req.query.No
    var title = req.query.title
    var content = req.query.content
    console.log(title)
    if(!req.session.logged){
        res.redirect("/")
    }else{
    conn.query(
        `SELECT * FROM board WHERE No =?`,
        [No, title, content],
        function(err,result){
            if(err){
                console.log(err)
                res.send("upDATEE ERROR")
            }else{
                res.render('retouch',{
                    info : result,
                    name : req.session.logged.name
                })
            }
        }
    )
}})


router.post("/retouch_2", function(req, res, next){
    var No = req.body.No
    var title = req.body.title
    var content = req.body.content
    if(!req.session.logged){
        res.redirect("/")
    }else{
    conn.query(
        `UPDATE board SET title = ?, content = ? WHERE No =?`,
        [title, content, No],
        function(err,result){
            if(err){
                console.log(err)
                res.send("UPDATE ERROR")
            }else{
                res.redirect('/board')
            }
        }
    )
}})


module.exports = router