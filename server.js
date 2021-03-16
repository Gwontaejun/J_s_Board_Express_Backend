const express = require("express");
const app = express();
const port = process.env.PORT || 3002;

// app.get('/', (req, res) => res.send("hello world"));
// app.listen(port, () => console.log(`Connect at http://localhost:${port}`));
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql"); // mysql 모듈 사용
// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app){
//   app.use(
//       createProxyMiddleware('/', {
//           target: 'http://localhost:3002',
//           changeOrigin: true
//       })
//   )
// };

var connection = mysql.createConnection({
    host: "localhost",
    user: "root", //mysql의 id
    password: "root1234", //mysql의 password
    database: "j_s_board", //사용할 데이터베이스
});

connection.connect();

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
    console.log("test", Board_No);
    connection.query("DELETE FROM Board WHERE Board_NO = ?", [Board_No],
        function (err, rows, fields) {
            if (err) {
                console.log("BoardDelete Error");
            } else {
                console.log("BoardDelete Success");
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
    const query = 'INSERT INTO Board (Board_Theme, Board_Title, Board_Content, Board_WriteDate, User_Id, User_Name) values (?,?,?,?,?,?)';
    const params = [req.body.Board_Theme, req.body.Board_Title, req.body.Board_Content, req.body.Board_WriteDate, req.body.User_Id, req.body.User_Name];
    connection.query(query, params, (err, rows, result) => {
        if (err) {
            console.log("BoardInsert Error", err);
        } else {
            console.log(rows);
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

app.post("/CommentInsert", (req, res) => {
    const query = 'INSERT INTO Comment(Board_No, Comment_Content, Comment_WriteDate, User_Id, User_Name) values (?,?,?,?,?)';
    const params = [req.body.Board_No, req.body.Comment_Content, req.body.Comment_WriteDate, req.body.User_Id, req.body.User_Name]; 
    console.log(params);
    connection.query(query, params, (err, rows, result) => {
        if (err) {
            console.log("CommentInsert Error", err);
        } else {
            console.log(rows);
        };
    });
});

app.listen(port, () => {
    console.log(`Connect at http://localhost:${port}`);
})