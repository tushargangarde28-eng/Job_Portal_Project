var express = require("express");
var exe = require("./../mysql_connection");
var router = express.Router();

router.get("/",function(req,res){
    res.render("common/home.ejs");
});

router.get("/company_login",function(req,res){
    res.render("common/company_login.ejs");
});
router.get("/admin_login", async function (req, res) {
  res.render("common/admin_login.ejs");
});

router.post("/admin_login", async function (req, res) {
  var d = req.body;
  var sql = `SELECT * FROM admin WHERE admin_email = ? AND admin_password = ?`;
  var admin = await exe(sql, [d.admin_email, d.admin_password]);

  if (admin.length > 0) {
    req.session.admin_id = admin[0].admin_id;
    res.send(`
      <html>
        <head>
          <style>
            .loader {
              border: 6px solid #f3f3f3;
              border-top: 6px solid #3498db;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              animation: spin 1s linear infinite;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            @keyframes spin {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <script>
            // alert("Login Successful! Welcome, Admin.");

            // Create loader
            var loader = document.createElement('div');
            loader.className = 'loader';
            document.body.appendChild(loader);

            // Redirect after showing loader
            setTimeout(() => {
              window.location.href = "/admin";
            }, 1500);
          </script>
        </body>
      </html>
    `);
  } else {
    res.send(`
      <script>
        alert("Invalid email or password. Please try again.");
        window.location.href = "/admin_login";
      </script>
    `);
  }
});



router.post("/company/register",async function(req,res){
    try{
    var d = req.body;
    var sql = "insert into company (company_name, company_location,hr_name, hr_designation, hr_mobile, hr_email, hr_password)values(?,?,?,?,?,?,?)";
    var result = await exe(sql,[d.company_name, d.company_location, d.hr_name, d.hr_designation, d.hr_mobile, d.hr_email, d.hr_password])
    res.redirect("/company_login");
    }catch(err){
        // res.send("company already registered with this email");
        res.send(`
              <script>
                alert("Company already registered with this email!");
                window.history.back();
              </script>
`);

    }
});

router.get("/company_register", function(req,res){
    res.render("common/company_register.ejs");
});


router.post("/company/login", async function (req, res) {
  var d = req.body;
  var sql = "SELECT * FROM company WHERE hr_email=? AND hr_password=?";
  var result = await exe(sql, [d.hr_email, d.hr_password]);

  if (result.length > 0) {
    req.session.company_id = result[0].company_id;

    // Show loader UI before redirecting
    res.send(`
      <html>
        <head>
          <title>Loading Dashboard...</title>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              background: linear-gradient(135deg, #007bff, #00c6ff);
              font-family: 'Poppins', sans-serif;
              color: #fff;
            }
            .loader {
              border: 6px solid rgba(255, 255, 255, 0.2);
              border-top: 6px solid #fff;
              border-radius: 50%;
              width: 70px;
              height: 70px;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h2 {
              font-weight: 500;
              letter-spacing: 0.5px;
            }
            .fade-in {
              opacity: 0;
              animation: fadeIn 1s ease-in forwards;
            }
            @keyframes fadeIn {
              to { opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="fade-in">
            <div class="loader"></div>
            <h2>Loading your dashboard...</h2>
          </div>

          <script>
            // Delay redirect to show loader
            setTimeout(() => {
              window.location.href = "/company";
            }, 1800);
          </script>
        </body>
      </html>
    `);

  } else {
    res.send(`
      <script>
        alert('Invalid email or password. Please try again.');
        window.location.href = '/company/login';
      </script>
    `);
  }
});

router.get("/register",async function(req,res){
    res.render("common/employee_register.ejs");
});

router.get("/login",function(req,res){
    res.render("common/employee_login.ejs");
});


// Employee Register And Login ---------------------------------------------------------------------->
router.post("/employee/register",async function(req,res){
    try{
    var d = req.body;
    var sql = "insert into employee (employee_name, employee_mobile, employee_email, employee_password, employee_address, current_designation)values(?,?,?,?,?,?)";
    var result = await exe(sql,[d.employee_name, d.employee_mobile, d.employee_email, d.employee_password, d.employee_address, d.current_designation]);
    res.redirect("/login");
    }catch(err){
        // res.send("Employee already registered with this email");
                res.send(`
                  <script>
                    alert('Employee already registered with this email. ');
                    window.location.href = '/employee/register';
                  </script>
                `);
    }
});


// router.post("/login",async function(req,res){
//     var d = req.body;
//     var sql = "select * from employee where employee_email=? and employee_password=?";
//     var result = await exe(sql,[d.employee_email, d.employee_password]);
//     if(result.length>0){
//         req.session.employee_id = result[0].employee_id;
//         res.redirect("/employee");
//     }else{
//         res.redirect("/login");
//     }
// });
router.post("/employee/login", async function (req, res) {
  var d = req.body;
  var sql = "SELECT * FROM employee WHERE employee_email=? AND employee_password=?";
  var result = await exe(sql, [d.employee_email, d.employee_password]);

  if (result.length > 0) {
    req.session.employee_id = result[0].employee_id;

    res.send(`
      <html>
        <head>
          <title>Loading Profile...</title>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              background: linear-gradient(135deg, #6a11cb, #2575fc);
              font-family: 'Poppins', sans-serif;
              color: #fff;
            }
            .loader {
              border: 6px solid rgba(255, 255, 255, 0.2);
              border-top: 6px solid #fff;
              border-radius: 50%;
              width: 70px;
              height: 70px;
              animation: spin 1s linear infinite;
              margin-bottom: 20px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            h2 {
              font-weight: 500;
              letter-spacing: 0.5px;
            }
            .fade-in {
              opacity: 0;
              animation: fadeIn 1s ease-in forwards;
            }
            @keyframes fadeIn {
              to { opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="fade-in">
            <div class="loader"></div>
            <h2>Loading your profile...</h2>
          </div>

          <script>
            // Show loader for a short time before redirect
            setTimeout(() => {
              window.location.href = "/employee";
            }, 1800);
          </script>
        </body>
      </html>
    `);

  } else {
    res.send(`
      <script>
        alert('Invalid email or password. Please try again.');
        window.location.href = '/employee/login';
      </script>
    `);
  }
});
// ------------------------------------------------------------------------------------------------


router.get("/logout",function(req,res){
    var redirectTo = req.session.employee_id ? "/login" : "/company_login";
    req.session.destroy();
    res.redirect("/");
});



module.exports= router;
