var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
var upload = require("express-fileupload");

var MySQLStore = require("express-mysql-session")(session);

var common_route = require("./routes/common");
var admin_route = require("./routes/admin");
var company_route = require("./routes/company");
var employee_route = require("./routes/employee");

require("dotenv").config();

var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.static("public/"))


var sessionStore = new MySQLStore({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

app.use(session({
    secret:"tushar",
    resave:false,
    saveUninitialized:false,
    store: sessionStore  
}));

app.use("/",common_route);
app.use("/employee",employee_route);
app.use("/company",company_route);
app.use("/admin",admin_route);

app.listen(process.env.PORT);
