var express = require("express");
var exe = require("./../mysql_connection");

var router = express.Router();


function verify_login(req,res,next){
    if(req.session.admin_id){
        next();
    }else{
        res.redirect("/admin_login");
    }
}

router.use(verify_login);


router.get("/",async function(req,res){
    var sql = `SELECT COUNT(*) AS total_employees FROM employee`;
    var employee = await exe(sql);
    var sql1 = `SELECT COUNT(*) AS total_companies FROM company`;
    var company = await exe(sql1);
    var sql2 = `SELECT COUNT(*) AS total_jobs FROM jobs`;
    var jobs = await exe(sql2);
    var sql3 = `SELECT COUNT(*) AS total_applications FROM applications`;
    var applications = await exe(sql3);

    var packet = {employee,company,jobs,applications};
    res.render("admin/home.ejs",packet);
});

router.get("/manage_jobs",async function(req,res){
    var sql = "select * from jobs,company where jobs.company_id = company.company_id order by job_id desc";
    var jobs = await exe(sql);
    var packet = {jobs};
    res.render("admin/manage_jobs.ejs",packet);
});

router.get("/edit_job/:job_id",async function(req,res){
    var job_id = req.params.job_id;
    var sql = `select * from jobs,company where jobs.company_id = company.company_id and job_id = ?`;
    var job = await exe(sql,[job_id]);
    var packet = {job};
    res.render("admin/edit_job.ejs",packet);
})

router.post("/update_job",async function(req,res){
    // var job_id = req.params.job_id;
    var d = req.body;
    var sql = `
      UPDATE jobs SET job_title=?, job_description=?, job_category=?, job_type=?,experience_min=?,experience_max=?, skills=?, vacancies=?,reference_link=?, status=? WHERE job_id=?`;
    var result = await exe(sql, [
      d.job_title, d.job_description, d.job_category, d.job_type,
      d.experience_min, d.experience_max, d.skills, d.vacancies,
      d.reference_link, d.status, d.job_id
]);
    // res.send(result);
    res.redirect("/admin/manage_jobs");
})

router.get("/delete_job/:job_id",async function(req,res){
    var job_id = req.params.job_id;
    var sql = `delete from jobs where job_id = ?`;
    var result = await exe(sql,[job_id]);
    res.redirect("/admin/manage_jobs");
})

router.get("/employeers",async function(req,res){
    var sql = "select * from employee order by employee_id desc";
    var employees = await exe(sql);
    var packet = {employees};
    res.render("admin/employeers.ejs",packet);
});

router.get("/view_employee/:employee_id",async function(req,res){
    var employee_id = req.params.employee_id;
    var sql = `select * from employee where employee_id = ?`;
    var employee = await exe(sql,[employee_id]);
    var sql1 = `select * from employee_experience where employee_id = ?`;
    var experience = await exe(sql1,[employee_id]);
    var sql2 = `select * from employee_education where employee_id = ?`;
    var education = await exe(sql2,[employee_id]);
    var sql3 = `select * from employee_skills where employee_id = ?`;
    var skills = await exe(sql3,[employee_id]);

    var packet = {employee,experience,education,skills};
    res.render("admin/view_employee.ejs",packet);
})

router.get("/edit_employee/:employee_id",async function(req,res){
  var id= req.params.employee_id;
  var sql = `select * from employee where employee_id = ?`;
  var employee = await exe(sql,[id]);
  var packet = {employee};
  res.render("admin/edit_employee.ejs",packet);
});

router.post("/update_employee",async function (req,res) {
  var d = req.body;
  var sql = ` update employee set employee_name = ?, employee_email = ?, employee_mobile = ?, employee_password = ? where employee_id = ?`;
  var result = await exe(sql,[d.employee_name,d.employee_email,d.employee_mobile,d.employee_password,d.employee_id]);
  // res.send(d);
  res.redirect("/admin/employeers");
});

router.get("/delete_employee/:employee_id",async function(req,res){
    var employee_id = req.params.employee_id;
    var sql = `delete from employee where employee_id = ?`;
    var result = await exe(sql,[employee_id]);
    res.redirect("/admin/employeers");
})

router.get("/companies",async function(req,res){
    var sql = "select * from company order by company_id desc";
    var companies = await exe(sql);
    var packet = {companies};
    res.render("admin/companies.ejs",packet);
});

router.get("/view_company/:company_id",async function(req,res){
    var company_id = req.params.company_id;
    var sql = `select * from company,jobs where company.company_id = jobs.company_id and company.company_id =  ?`;
    var company = await exe(sql,[company_id]);
    var sql2 = `SELECT COUNT(*) AS total_jobs FROM jobs`;
    var jobs = await exe(sql2);
    var sql3 = `select count(*) AS total_applications FROM applications,jobs where applications.job_id = jobs.job_id and jobs.company_id = ?`;
    var applications = await exe(sql3,[company_id]);
    var packet = {company,jobs,applications}; 
    res.render("admin/view_company.ejs",packet);
})

router.get("/edit_company/:company_id",async function(req,res){
    var company_id = req.params.company_id;
    var sql = `select * from company where company_id = ?`;
    var company = await exe(sql,[company_id]);
    var packet = {company};
    res.render("admin/edit_company.ejs",packet);
})

router.post("/edit_company",async function(req,res){
    var d = req.body;
    var sql = ` update company set company_name = ?, company_type = ?, hr_email = ?, hr_mobile = ?, company_location = ?, status = ? where company_id = ?`;
    var result = await exe(sql,[d.company_name,d.company_type,d.hr_email,d.hr_mobile,d.company_location,d.status,d.company_id]);
    if(req.files && req.files.company_logo){
      var image = req.files.company_logo;
      var filename = Date.now() + ".png";
      image.mv("public/company_logo/" + filename);
      var sql2 = `UPDATE company SET company_logo = ? WHERE company_id = ?`;
      await exe(sql2, [filename, d.company_id]);
    }
    res.redirect("/admin/companies");
})

router.get("/delete_company/:company_id",async function(req,res){
    var company_id = req.params.company_id;
    var sql = `delete from company where company_id = ?`;
    var result = await exe(sql,[company_id]);
    res.redirect("/admin/companies");
})

router.get("/reports", async function (req, res) {
  const employee = await exe(`SELECT COUNT(*) AS total_employees FROM employee`);
  const company = await exe(`SELECT COUNT(*) AS total_companies FROM company`);
  const jobs = await exe(`SELECT COUNT(*) AS total_jobs FROM jobs`);
  const applications = await exe(`SELECT COUNT(*) AS total_applications FROM applications`);

  // Monthly
  const monthlyApplications = await exe(`
    SELECT DATE_FORMAT(appointment_date, '%b') AS month, COUNT(*) AS total
    FROM applications
    WHERE YEAR(appointment_date) = YEAR(CURDATE())
    GROUP BY month ORDER BY MIN(appointment_date)
  `);

  // Categories
  const jobCategories = await exe(`
    SELECT job_category AS category, COUNT(*) AS total
    FROM jobs GROUP BY job_category
  `);

  // ✅ Daily applications (last 7 days)
  const dailyApplications = await exe(`
    SELECT DATE(appointment_date) AS date, COUNT(*) AS total
    FROM applications
    WHERE appointment_date >= CURDATE() - INTERVAL 7 DAY
    GROUP BY DATE(appointment_date)
    ORDER BY date ASC
  `);

  // ✅ Daily job postings (last 7 days)
  const dailyJobs = await exe(`
    SELECT DATE(created_at) AS date, COUNT(*) AS total
    FROM jobs
    WHERE created_at >= CURDATE() - INTERVAL 7 DAY
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  res.render("admin/report.ejs", {
    employee, company, jobs, applications,
    monthlyApplications, jobCategories,
    dailyApplications, dailyJobs,
    topCompanies: [] // if needed
  });
});

router.get("/view_job/:job_id",async function(req,res){
    var job_id = req.params.job_id;
    var sql = `select * from jobs,company where jobs.company_id = company.company_id and job_id = ?`;
    var job = await exe(sql,[job_id]);
    var packet = {job};
    res.render("admin/job_view.ejs",packet);
});



router.get("/settings",async function(req,res){
  var admin = req.session.admin_id;
  var sql = `select * from admin where admin_id = ?`;
  var admin = await exe(sql,[admin]);
  var packet = {admin};
    res.render("admin/settings.ejs",packet);
});

router.post("/change_password", async function (req, res) {
  const admin_id = req.session.admin; // logged-in admin id
  const { current_password, new_password, confirm_password } = req.body;

  if (!admin_id) {
    return res.send(`
      <script>
        alert("Session expired. Please login again.");
        window.location.href = "/admin_login";
      </script>
    `);
  }
  const sql = "SELECT * FROM admin WHERE admin_id = ? AND admin_password = ?";
  const admin = await exe(sql, [admin_id, current_password]);
  if (admin.length === 0) {
    return res.send(`
      <script>
        alert("Incorrect current password!");
        window.location.href = "/admin/settings";
      </script>
    `);
  }
  if (new_password !== confirm_password) {
    return res.send(`
      <script>
        alert("New password and confirm password do not match!");
        window.location.href = "/admin/settings";
      </script>
    `);
  }
  const updateSql = "UPDATE admin SET admin_password = ? WHERE admin_id = ?";
  await exe(updateSql, [new_password, admin_id]);

  res.send(`
    <script>
      alert("Password updated successfully!");
      window.location.href = "/admin/settings";
    </script>
  `);
});


router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin_login");
});

module.exports= router;