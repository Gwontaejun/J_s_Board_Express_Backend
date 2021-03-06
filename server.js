const express = require("express");
const app = express();
const port = process.env.PORT || 3002;

const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql"); // mysql 모듈 사용

// Heroku가 30분동안 활동을 안하면 sleep모드로 들어가는데 그것을 방지함.
var http = require("http");
setInterval(function() {
    http.get("http://j-s-board-express-backend.herokuapp.com");
}, 600000);

var db_config = {
    host: "us-cdbr-east-03.cleardb.com",
    user: "bb94c115e6b589", //mysql의 id
    password: "05b341eb", //mysql의 password
    database: "heroku_30d79440d15b677", //사용할 데이터베이스
  };

var connection;

// 서버가 끊겼을때 다시 연결하도록 하는 함수.
function handleDisconnect() {
  connection = mysql.createConnection(db_config); 
                                                  

  connection.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                     
  });                                     
                                          
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();                        
    } else {                                     
      throw err;                                 
    }
  });
}
handleDisconnect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


/*----------------------------------------------------------------------------------------------------------------------*/

// 검색결과 보여주는 쿼리
app.get('/Board_Search', (req, res) => {
    const Board_No = req.query;
    connection.query(
        "SELECT * FROM Board WHERE " + Board_No.Search_Type + " LIKE ?"
        , ["%" + Board_No.Search_Text + "%"],
        function (err, rows) {
            if (err) {
                console.log("BoardRead Error", err);
            } else {
                res.send(rows);
            }
        })
})

/*----------------------------------------------------------------------------------------------------------------------*/

// 왼쪽 네비바 데이터 쿼리
app.get('/CountList', (req, res) => {
    const Order_Type = req.query.Order_Type;
    connection.query("SELECT Board_No, Board_Title, Read_Count FROM Board ORDER BY " + Order_Type + " DESC",
        function (err, rows) {
            if (err) {
                console.log("CountList Error", err);
            } else {
                res.send(rows);
            }
        })
})

/*----------------------------------------------------------------------------------------------------------------------*/

// Board_No를 가져오기 위한 쿼리(Heroku clearDB 특성상 A.I가 10씩 증가하는 경우가있어서 하나하나씩 가져와서 해야할듯함)
app.get('/BoardNoGet', (req, res) => {
    connection.query("SELECT Board_No FROM Board ORDER BY Board_No DESC",
        function (err, rows) {
            if (err) {
                console.log("BoardList Error");
            } else {
                res.send(rows[0]);
            }
        })
})

// BoardList 쿼리
app.get('/BoardList', (req, res) => {
    const Board_Theme = req.query.Board_Theme;
    connection.query("SELECT Board_No, Board_Title, User_Name, Read_Count FROM Board WHERE Board_Theme = ?", [Board_Theme],
        function (err, rows) {
            if (err) {
                console.log("BoardList Error");
            } else {
                res.send(rows);
            }
        })
})
// BoardRead 쿼리
app.get('/BoardRead', (req, res) => {
    const Board_No = req.query.Board_No;
    connection.query(
        "SELECT Board_Title, Board_Content, Board_Theme, date_format(Board_WriteDate, '%Y-%m-%d') as Board_WriteDate, User_Id, User_Name, Image_Name FROM Board WHERE Board_No = ?"
        , [Board_No],
        function (err, rows) {
            if (err) {
                console.log("BoardRead Error");
            } else {
                res.send(rows[0]);
            }
        })
})
// BoardDelete 쿼리
app.delete("/BoardDelete", (req, res) => {
    const Board_No = req.body.Board_No;
    connection.query("DELETE FROM Board WHERE Board_NO = ?", [Board_No],
        function (err, rows, fields) {
            if (err) {
                console.log("BoardDelete Error");
            } else {
            };
        });
});
// BoardUpdate 쿼리
app.patch('/BoardUpdate', (req, res) => {
    const query = 'UPDATE Board SET Board_Title = ?, Board_Content = ?, User_Name = ? WHERE Board_No = ?';
    const params = [req.body.Board_Title, req.body.Board_Content, req.body.User_Name, req.query.Board_No];
    connection.query(query, params, (err, result) => {
        if (err) {
            console.log("BoardUpdate Error");
        } else {
            res.send({
                ok: true,
            });
        }
    });
});
// BoardInsert 쿼리
app.post("/BoardInsert", (req, res) => {
    const query = 'INSERT INTO Board (Board_No, Board_Theme, Board_Title, Board_Content, Board_WriteDate, User_Id, User_Name) values (?,?,?,?,?,?,?)';
    const params = [req.body.Board_No, req.body.Board_Theme, req.body.Board_Title, req.body.Board_Content, req.body.Board_WriteDate, req.body.User_Id, req.body.User_Name];
    connection.query(query, params, (err, rows, result) => {
        if (err) {
            console.log("BoardInsert Error", err);
        } else {
            res.send(rows);
        };
    });
});

/*----------------------------------------------------------------------------------------------------------------------*/

// CommentRead 쿼리
app.get('/CommentRead', (req, res) => {
    const Board_No = req.query.Board_No;
    connection.query(
        "SELECT Comment_Content, date_format(Comment_WriteDate, '%Y-%m-%d') as Comment_WriteDate, User_Name FROM Comment WHERE Board_No = ? ORDER BY Comment_No DESC"
        , [Board_No],
        function (err, rows) {
            if (err) {
                console.log("CommentRead Error");
            } else {
                res.send(rows);
            }
        })
});
// CommentInsert 쿼리
app.post("/CommentInsert", (req, res) => {
    const query = 'INSERT INTO Comment(Board_No, Comment_Content, Comment_WriteDate, User_Id, User_Name) values (?,?,?,?,?)';
    const params = [req.body.Board_No, req.body.Comment_Content, req.body.Comment_WriteDate, req.body.User_Id, req.body.User_Name]; 
    connection.query(query, params, (err, rows, result) => {
        if (err) {
            console.log("CommentInsert Error", err);
        } else {
            res.send(rows);
        };
    });
});

app.listen(port, () => {
})