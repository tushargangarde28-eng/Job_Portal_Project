var express = require("express");
var bodyparser = require("body-parser");
var session = require("express-session");
var upload = require("express-fileupload"); 

var common_route = require("./routes/common");
var admin_route = require("./routes/admin");
var company_route = require("./routes/company");
var employee_route = require("./routes/employee");
 
require("dotenv").config();

var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.static("public/"))

app.use(session({
    secret:"tushar",
    resave:true,
    saveUninitialized: true
}));

app.use("/",common_route);
app.use("/employee",employee_route);
app.use("/company",company_route);
app.use("/admin",admin_route);


app.listen(process.env.PORT);