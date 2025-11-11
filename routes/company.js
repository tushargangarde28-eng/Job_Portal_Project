var express = require("express");
var exe = require("./../mysql_connection");
var fileUpload = require("express-fileupload");
var send_mail=require("../mail_sending");
var router = express.Router();

function verify_login(req,res,next){
    if(req.session.company_id){
        next(); 
    }else{
        res.redirect("/company_login");
    }
}

router.use(verify_login);

// Company Home Page URl ------------------------------------------------------------->
router.get("/",verify_login, async function(req,res){
    var sql = "select * from jobs,company where jobs.company_id = company.company_id and company.company_id=? order by job_id desc";
    var jobs = await exe(sql,[req.session.company_id]);
    var sql2 = "select * from company where company_id=?";
    var companies = await exe(sql2,[req.session.company_id]);
    var sql3 = "select * from applications,jobs where applications.job_id = jobs.job_id and jobs.company_id = ?";
    var applications = await exe(sql3,[req.session.company_id]);
    var packet = {jobs,companies,applications};
    // res.send(packet); 
    res.render("company/home.ejs",packet);
});

// Post Job page url ------------------------------------------------------>
router.get("/post_job",function(req,res){
    res.render("company/post_job.ejs");
});

// Insert Job Query 
router.post("/save_job",verify_login,async function(req,res){
    var d=req.body;
    var sql= `INSERT INTO jobs(company_id,job_title,job_description,job_type,experience_min,experience_max,skills,vacancies,reference_link) VALUES(?,?,?,?,?,?,?,?,?)`;
    var result=await exe(sql,[req.session.company_id,d.job_title,d.job_description,d.job_type,d.experience_min,d.experience_max,d.skills,d.vacancies,d.reference_link]);
    res.redirect("/company/jobs");
    // res.send(result);
})


// Url For My Jobs -------------------------------------------------------------------------------> 
router.get("/jobs",verify_login,async function(req,res){
    var sql = "select * from jobs where company_id = ?";
    var result = await exe(sql, [req.session.company_id]);
    res.render("company/jobs.ejs",{jobs:result});
});

// Job Details Page Url 
router.get("/jobs/:id",verify_login,async function(req,res){
    var job_id = req.params.id;
            var sql = `
              SELECT * 
              FROM jobs
              JOIN company ON jobs.company_id = company.company_id
              WHERE job_id = ?
            `;
    var jobs = await exe(sql,[job_id]);
    var packet = {jobs};
    res.render("company/job_details.ejs",packet);
});
// Job Edit Page Url 
router.get("/jobs/:id/edit",async function(req,res){
    var job_id = req.params.id;
    var sql = "select * from jobs where job_id=?";
    var jobs = await exe(sql,[job_id]);
    res.render("company/edit_job.ejs",{jobs});
});

// Edit Job  
router.post("/post_job",async function(req,res){
    var d = req.body;
    var sql = `
      UPDATE jobs SET job_title=?, job_description=?, job_category=?, job_type=?,experience_min=?,experience_max=?, skills=?, vacancies=?,reference_link=?, status=? WHERE job_id=?`;
    var result = await exe(sql, [
      d.job_title, d.job_description, d.job_category, d.job_type,
      d.experience_min, d.experience_max, d.skills, d.vacancies,
      d.reference_link, d.status, d.job_id
]);
    // res.send(result);
    res.redirect("/company/jobs");
})

// Job Applications Url ------------------------------------------------------------------------->

router.get("/jobs/:id/applications", async function (req, res) {
var job_id = req.params.id;
var company_id = req.session.company_id;

var sql= `select * from jobs where job_id = ?`;
var result = await exe(sql,[job_id]);

var sql = ` select * from employee, applications where applications.employee_id = employee.employee_id and applications.job_id = ?`;
var applications = await exe(sql, [ job_id]);
var packet = {result,applications};
res.render("company/jobs_applications.ejs",packet);
});

// Delete Job 
router.post("/jobs/:id/delete",async function(req,res){
    var job_id = req.params.id;
    var sql = "delete from jobs where job_id=?";
    var result = await exe(sql,[job_id]);
    res.redirect("/company/jobs");
});


// router.post("/update_job/:id",async function(req,res){
//     var job_id = req.params.id;
//     var d = req.body;
//     var sql = "update jobs set job_title=?, job_description=?, job_type=?, experience_min=?, experience_max=?, skills=?, vacancies=?, reference_link=? where job_id=?";
//     var result = await exe(sql,[d.job_title,d.job_description,d.job_type,d.experience_min,d.experience_max,d.skills,d.vacancies,d.reference_link,job_id]);
//     res.redirect("/company/jobs");
// });





// -------------------------------------------------------------------------------------------->

// Page is Disable in navbar when we need then we use this router 

// router.get("/applications", async function(req, res) {
//     var companyId = req.session.company_id;

//     var sql = `
//       SELECT a.*, e.employee_name, e.employee_email, e.employee_mobile, j.job_title
//       FROM applications a
//       JOIN employee e ON a.employee_id = e.employee_id
//       JOIN jobs j ON a.job_id = j.job_id
//       WHERE j.company_id = ?
//       ORDER BY a.created_at DESC
//     `;

//     var applications = await exe(sql, [companyId]);

//     res.render("company/applications.ejs", { applications });
// });

// -------------------------------------------------------------------------------------------------->


// Short List Router 
// router.get("/applications/:application_id/shortlist", async function (req, res) {
//   try {
//     var applicationId = req.params.application_id;
//     var sql = "UPDATE applications SET status = 'shortlisted' WHERE application_id = ?";
//     var result = await exe(sql, [applicationId]);

//     if (result.affectedRows > 0) {
//       await send_mail();
//       res.send(`<script>alert("Mail sent successfully!"); window.location.href = "/company/jobs";</script>`);
//     } else {
//       res.send(`<script>alert("Application not found!"); window.location.href = "/company/jobs";</script>`);
//     }
//   } catch (err) {
//     console.error(err);
//     res.send(`<script>alert("Something went wrong!"); window.location.href = "/company/jobs";</script>`);
//   }
// });

router.get("/applications/:application_id/shortlist", async (req, res) => {
  try {
    const applicationId = req.params.application_id;

    // 1️⃣ Update status
    await exe("UPDATE applications SET status = 'shortlisted' WHERE application_id = ?", [applicationId]);

    // 2️⃣ Fetch employee + company info
    const sql = `
      SELECT e.employee_email, e.employee_name, j.job_title, c.hr_email, c.company_name
      FROM applications a
      JOIN employee e ON a.employee_id = e.employee_id
      JOIN jobs j ON a.job_id = j.job_id
      JOIN company c ON j.company_id = c.company_id
      WHERE a.application_id = ?;
    `;
    const [data] = await exe(sql, [applicationId]);
    if (!data) return res.send("No data found for this application.");

    // 3️⃣ Email contents
    const employeeHtml = `
      <h3>Congratulations, ${data.employee_name}!</h3>
      <p>Your application for <b>${data.job_title}</b> has been <b>shortlisted</b>.</p>
      <p>The company <b>${data.company_name}</b> will contact you soon.</p>
      <br><p>— A2toZ Job Portal Team</p>
    `;

    const companyHtml = `
      <h3>Hello ${data.company_name},</h3>
      <p>You have successfully <b>shortlisted</b> candidate <b>${data.employee_name}</b> for <b>${data.job_title}</b>.</p>
      <p>An email has been sent to the candidate.</p>
      <br><p>— A2toZ Job Portal System</p>
    `;

    // 4️⃣ Send both mails in parallel (super fast 🚀)
    await Promise.all([
      send_mail(data.employee_email, `You’ve Been Shortlisted for ${data.job_title}!`, employeeHtml),
      send_mail(data.hr_email, `You Shortlisted ${data.employee_name} for ${data.job_title}`, companyHtml)
    ]);

    // 5️⃣ Show loader + success
    res.send(`
      <html>
        <head>
          <title>Sending Emails...</title>
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
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .success { display: none; text-align: center; }
            svg { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <div id="loader">
            <div class="loader"></div>
            <h2>Sending emails...</h2>
          </div>
          <div id="success" class="success">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h2>Emails sent successfully!</h2>
          </div>
          <script>
            setTimeout(() => {
              document.getElementById('loader').style.display = 'none';
              document.getElementById('success').style.display = 'block';
            }, 1000);
            setTimeout(() => {
              window.location.href = "/company/jobs";
            }, 2500);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Error while sending emails.");
  }
});



router.get("/applications/:application_id/reject",async function (req,res){
    var applicationId = req.params.application_id;
    var sql = "UPDATE applications SET status = 'rejected' WHERE application_id = ?";
    var result = await exe(sql, [applicationId]);
    res.redirect("/company/jobs");

})

// --------------------------------------------------------------------------------------------------->

// Profile Page url 
router.get("/profile",verify_login, async function(req,res){
    var sql = "select * from company where company_id=?";
    var companies = await exe(sql,[req.session.company_id]);
    var packet = {companies};
    res.render("company/profile.ejs",packet);
});
//  Edit Profile Page Url 
router.get("/edit_profile",verify_login,async function(req,res){
    var sql = "select * from company where company_id=?";
    var company = await exe(sql,[req.session.company_id]);
    var packet = {company};
    res.render("company/edit_profile.ejs",packet);
});
// Edit Profile Query 
router.post("/update_profile", verify_login, async function(req, res) {
        var d = req.body;
        var company_id = req.session.company_id;
        var updated_at = new Date();
        var sql = `
            UPDATE company SET 
            company_name=?, company_location=?, company_type=?, industry=?, 
            hr_name=?, hr_designation=?, hr_mobile=?, hr_email=?, hr_password=?, 
            website_url=?, is_verified=?, updated_at=? 
            WHERE company_id=?
        `;
        var result =await exe(sql, [
            d.company_name, d.company_location, d.company_type, d.industry,
            d.hr_name, d.hr_designation, d.hr_mobile, d.hr_email, d.hr_password,
            d.website_url, d.is_verified, updated_at, company_id
        ]);
        if (req.files && req.files.company_logo) {
            var filename = Date.now() + ".png";
            req.files.company_logo.mv("public/company_logo/" +filename);
            var sql2 = "UPDATE company SET company_logo=? WHERE company_id=?";
            var result2= await exe(sql2, [filename, company_id]);
        }
        res.redirect("/company/profile");
});

module.exports= router;
