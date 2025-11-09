var express = require("express");
var exe = require("./../mysql_connection");
var router = express.Router();

function verify_login(req,res,next){
    if(req.session.employee_id){
        next();
    }else{
        res.redirect("/login");
    }
}

router.use(verify_login);

router.get("/",verify_login,async function(req,res){

    var sql = `select * from employee where employee_id = ?`;
    var employee = await exe(sql,[req.session.employee_id]);

    var sql2 = `select * from employee_education where employee_id = ?`
    var education = await exe (sql,[req.session.employee_id]);
var profile_completion = 0;

    if(employee[0].employee_name){
        profile_completion += 12.5;
    }
    if(employee[0].employee_email){
        profile_completion += 12.5;
    }
    if(employee[0].employee_mobile){
        profile_completion += 12.5;
    }
    if(employee[0].profile_photo){
        profile_completion += 12.5;
    }
    if(employee[0].skills_summary){
        profile_completion += 12.5;
    }
    if(employee[0].employee_resume){
        profile_completion += 12.5;
    }
    if(employee[0].linkdin_url){
        profile_completion += 12.5;
    }
    if(employee[0].portfolio_url){
        profile_completion += 12.5;
    }

    var sql= `select * from jobs`;
    var jobs = await exe(sql);

    var packet = {employee,jobs,profile_completion};    
    res.render("employee/home.ejs",packet);
})


router.get("/profile",async function(req,res){

    var user = req.session.employee_id;
    var sql = `select * from employee where employee_id=?`;
    var employee = await exe(sql, [user]);

    var profile_completion = 0;

    if(employee[0].employee_name){
        profile_completion += 12.5;
    }
    if(employee[0].employee_email){
        profile_completion += 12.5;
    }
    if(employee[0].employee_mobile){
        profile_completion += 12.5;
    }
    if(employee[0].profile_photo){
        profile_completion += 12.5;
    }
    if(employee[0].skills_summary){
        profile_completion += 12.5;
    }
    if(employee[0].employee_resume){
        profile_completion += 12.5;
    }
    if(employee[0].linkdin_url){
        profile_completion += 12.5;
    }
    if(employee[0].portfolio_url){
        profile_completion += 12.5;
    }
    var sql2 = `select * from employee_education where employee_id = ?`;
    var education = await exe(sql2,[user]);

    var sql3 = `select * from employee_experience where employee_id = ?`;
    var experience = await exe(sql3,[user]);

    var sql4 = `  SELECT * FROM employee_skills JOIN employee ON employee_skills.employee_id = employee.employee_id WHERE employee.employee_id = ?`;
    var skills = await exe(sql4,[user]);

    var packet = {user,employee, skills,education,profile_completion,experience};
    res.render("employee/profile.ejs",packet);
});

router.get("/edit_employee_personal",async function(req,res){
    var user = req.session.employee_id;
    var sql = `select * from employee where employee_id=?`;
    var employee = await exe(sql, [user]);

    var packet = {user, employee};
    res.render("employee/edit_employee_personal.ejs",packet);
})

// router.get("/edit_profile",async function(req,res){
//     var user = req.session.employee_id;
//     var sql = `select * from employee where employee_id=?`;
//     var employee = await exe(sql, [user]);

//     var packet = {user, employee};
//     res.render("employee/edit_profile.ejs",packet);
// });

router.post("/update_profile", async function (req, res) {
  var d = req.body;
  var sql = `
        UPDATE employee SET 
            employee_name = ?, 
            employee_mobile = ?, 
            employee_email = ?, 
            employee_password = ?, 
            alternate_mobile = ?, 
            employee_address = ?, 
            employee_pincode = ?, 
            employee_dob = ?, 
            maritial_status = ?, 
            gender = ?, 
            current_designation = ?, 
            experience_year = ?, 
            current_salary = ?, 
            expected_salary = ?, 
            preferred_job_type = ?, 
            preferred_locations = ?, 
            skills_summary = ?, 
            language_known = ?, 
            linkdin_url = ?, 
            github_url = ?, 
            portfolio_url = ?, 
            status = ?, 
            is_verified = ?, 
            updated_at = NOW()
        WHERE employee_id = ?
        `;

  var result = await exe(sql, [
    d.employee_name,
    d.employee_mobile,
    d.employee_email,
    d.employee_password,
    d.alternate_mobile,
    d.employee_address,
    d.employee_pincode,
    d.employee_dob,
    d.maritial_status,
    d.gender,
    d.current_designation,
    d.experience_year,
    d.current_salary,
    d.expected_salary,
    d.preferred_job_type,
    d.preferred_locations,
    d.skills_summary,
    d.language_known,
    d.linkdin_url,
    d.github_url,
    d.portfolio_url,
    d.status,
    d.is_verified,
    req.session.employee_id,
  ]);

  // --- Profile Photo Upload ---
  if (req.files && req.files.profile_photo) {
    var image = req.files.profile_photo;
    var filename = Date.now() + ".png";
    image.mv("public/employee_profile/" + filename);
    var sql2 = `UPDATE employee SET profile_photo = ? WHERE employee_id = ?`;
    await exe(sql2, [filename, req.session.employee_id]);
  }

  // --- Resume File Upload ---
  if (req.files && req.files.employee_resume) {
    var resume = req.files.employee_resume;
    var resumename = Date.now() + "_" + resume.name;
    resume.mv("public/employee_resume/" + resumename);
    var sql3 = `UPDATE employee SET employee_resume = ? WHERE employee_id = ?`;
    await exe(sql3, [resumename, req.session.employee_id]);
  }

  res.redirect("/employee/profile");
});


router.get("/add_employee_skills", async function(req, res) {
    var employee = req.session.employee_id;
    var sql = `select * from employee_skills where employee_id=?`;
    // var sql = `  SELECT * FROM employee_skills JOIN employee ON employee_skills.employee_id = employee.employee_id WHERE employee.employee_id = ?`;
    var skills = await exe(sql,[employee]);
    var packet = {skills};
    res.render("employee/add_employee_skills.ejs",packet);
});

router.get("/edit_employee_skills",async function (req,res){
    var user = req.session.employee_id;
    // var sql = `select * from employee_skills,employee employee_skills.employee_id=employee.employee_id where employee_id=?`;
        var sql = `
      SELECT * 
      FROM employee_skills
      JOIN employee ON employee_skills.employee_id = employee.employee_id
      WHERE employee.employee_id = ?
    `;
    
    var skills = await exe(sql,[user]); 
    var packet = {user, skills};
    res.render("employee/edit_employee_skills.ejs",packet);
    
})

//form of employee Save Skills 
router.post("/save_skills", async function(req, res) {
    try {
        var employee_id = req.session.employee_id;
        var skills = req.body.skill_name;

        if (!skills) {
            return res.status(400).send("No skills provided!");
        }

        if (!Array.isArray(skills)) skills = [skills];
        skills = skills.filter(skill => skill && skill.trim() !== '');

        if (skills.length === 0) {
            return res.status(400).send("No skills provided!");
        }

        var sql = "INSERT INTO employee_skills (employee_id, skill_name) VALUES ?";
        var values = skills.map(skill => [employee_id, skill]);
        var result = await exe(sql, [values]);

        res.redirect("/employee/profile"); 

    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});
// Edit Skills Or Update Skills
router.post("/update_skills", async (req, res) => {
    var employee_id = req.body.employee_id;
    var skills = req.body.skill_name;
    if (!employee_id || !skills) {
      return res.status(400).send("Invalid employee_id or skills");
    }
    await exe("DELETE FROM employee_skills WHERE employee_id = ?", [employee_id]);
    for (let skill of skills) {
      if (skill.trim() !== "") {
        await exe("INSERT INTO employee_skills(employee_id, skill_name) VALUES(?, ?)", [employee_id, skill]);
      }
    }
    res.redirect("/employee/profile");
});

// Add employee Education
router.get("/add_employee_education",async function(req,res){
    var employee = req.session.employee_id;
    var packet = {employee};
    res.render("employee/add_employee_education.ejs",packet);
});

router.post("/save_education",async function(req,res){
    var d = req.body;
    var sql = "insert into employee_education (employee_id, college_name, course_title, passing_year, marks, status) values(?,?,?,?,?,?)";
    var result = await exe(sql,[d.employee_id, d.college_name, d.course_title, d.passing_year, d.marks,d.status]);
    res.redirect("/employee/profile");
});

router.get("/edit_employee_education/:education_id", async function (req, res) {
  try {
    var education_id = req.params.education_id;
    var user = req.session.employee_id;
    var sql = `SELECT * FROM employee_education WHERE employee_id = ? AND education_id = ?`;
    var educationData = await exe(sql, [user, education_id]);
    if (educationData.length === 0) {
      return res.status(404).send("Education record not found");
    }
    var education = educationData[0];
    res.render("employee/edit_employee_education.ejs", { user, education });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/update_education", async function (req, res) {
  try {
    var user = req.session.employee_id;
    var d = req.body;
    var sql = `
      UPDATE employee_education
      SET college_name=?, course_title=?, passing_year=?, marks=?, status=?
      WHERE employee_id=? AND education_id=?`;
    var result = await exe(sql, [d.college_name, d.course_title, d.passing_year, d.marks, d.status, user, d.education_id]);

    res.redirect("/employee/profile");

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

router.get("/delete_employee_education/:education_id", async function (req, res) {
    var education_id = req.params.education_id;
    var user = req.session.employee_id;
    var sql = `delete  FROM employee_education WHERE employee_id = ? AND education_id = ?`;
    var result = await exe(sql, [user, education_id]);
    res.redirect("/employee/profile");
});

router.get("/add_employee_experience",async function(req,res){
    var user = req.session.employee_id;
    var sql = `select * from employee_experience where employee_id = ?`;
    var experience = await exe(sql,[user]);
    var packet = {experience}
    res.render("employee/add_employee_experience.ejs",packet);

})

router.post("/add_experience",async function (req,res){
    var user = req.session.employee_id;
    var d = req.body;
    var sql = `insert into employee_experience (employee_id,company_name,job_title,start_date,end_date,status)values(?,?,?,?,?,?)`;
    var result = await exe(sql,[user,d.company_name,d.job_title,d.start_date,d.end_date,d.status]);
    res.redirect("/employee/profile");
})

router.get("/edit_employee_experience/:experience_id",async function(req,res){
    var user = req.session.employee_id;
    var experience_id = req.params.experience_id;
    var sql = `select * from employee_experience where employee_id = ? AND experience_id = ?`;
    var experience = await exe(sql,[user,experience_id]);
    var packet = {experience};
    res.render("employee/edit_employee_experience.ejs",packet);

});

router.post("/update_experience/:experience_id",async function(req,res){
    var user = req.session.employee_id;
    var experience_id = req.params.experience_id;
    var d = req.body;
    var sql = `update employee_experience set company_name=?, job_title=?, start_date=?, end_date=?, status=? where employee_id=? and experience_id=?`;
    var result = await exe(sql,[d.company_name,d.job_title,d.start_date,d.end_date,d.status,user,experience_id]);
    res.redirect("/employee/profile");
})

router.get("/delete_employee_experience/:experience_id",async function(req,res){
    var user = req.session.employee_id;
    var experience_id = req.params.experience_id;
    var sql = `delete from employee_experience where employee_id=? and experience_id=?`;
    var result = await exe(sql,[user,experience_id]);
    res.redirect("/employee/profile");
})

router.get("/upload_resume",async function(req,res){
    var user = req.session.employee_id;
    var sql = `select * from employee where employee_id=?`;
    var resume = await exe(sql,[user]);
    var packet = {resume};
    res.render("employee/upload_resume.ejs",packet);
})

router.post("/upload_resume",async function(req,res){

    if(req.files)
    {
        var file_name = Date.now() + ".pdf";
        req.files.employee_resume.mv("public/employee_resume/"+file_name);
    }
    else
        var file_name = "default.pdf";
    var user = req.session.employee_id;
    var sql = `update employee set employee_resume=? where employee_id=?`;
    var result = await exe(sql,[file_name,user]);
    res.redirect("/employee/profile");
});

router.get("/employee/delete_resume/user",async function(req,res){
    var user = req.session.employee_id;
    var sql = `update employee set employee_resume=? where employee_id=?`;
    var result = await exe(sql,[null,user]);
    res.redirect("/employee/profile");
})

router.get("/save_job/:job_id",async function(req,res){
    var employee_id = req.session.employee_id;
    var job_id= req.params.job_id;
    var Sql = `SELECT * FROM saved_jobs WHERE employee_id = ? AND job_id = ?`;
    var results  =await exe(Sql, [employee_id, job_id])
    if (results.length > 0) {
    // console.log("Job already saved for this employee");
    res.send(`
      <script>
        alert("Job already saved for this employee");
        window.location.href = document.referrer;
      </script>
    `);
    } else {
    var sql2 = `INSERT INTO saved_jobs(employee_id, job_id) VALUES(?, ?)`;
    var result = await exe (sql2, [employee_id, job_id]) 
    res.send(`
      <script>
        alert("Job saved successfully");
        window.location.href = document.referrer;
      </script>
    `);
    }
})

router.get("/saved_jobs",async function(req,res){
    var user = req.session.employee_id;
    var sql = `SELECT j.* FROM jobs j INNER JOIN saved_jobs s ON j.job_id = s.job_id WHERE s.employee_id = ?`;
    var saved_jobs = await exe(sql, [user]);
    var packet = {jobs: saved_jobs, user};
    res.render("employee/saved_jobs.ejs", packet);

})

router.post("/unsave_job/:job_id",async function(req,res){
    var job_id = req.params.job_id;
    var employee_id = req.session.employee_id;
    var sql = `DELETE FROM saved_jobs WHERE employee_id = ? AND job_id = ?`;
    var result = await exe(sql, [employee_id, job_id]);
    res.redirect("/employee/saved_jobs");
})

router.post("/apply/:job_id",async function(req,res){
    var job_id = req.params.job_id;
    // var job_id = req.body.job_id;
    var filename = Date.now()+".pdf";
    req.files.employee_resume.mv("public/employee_resume/"+filename);
    
    var sql = `insert into applications (employee_id, job_id, resume_file) values(?,?,?)`;
    var result = await exe(sql,[req.session.employee_id,job_id,filename]);
    // res.send(result);
    res.redirect("/employee/jobs");
})


// Application Page ---------------------------------------------------------------->

router.get("/applications",async function(req,res){
    var user = req.session.employee_id;
var sql = `
  SELECT 
    applications.*,
    jobs.job_title,
    jobs.job_description,
    jobs.job_type,
    jobs.skills,
    company.company_name,
    company.hr_email,
    company.hr_mobile,
    company.company_location
  FROM applications
  JOIN jobs ON applications.job_id = jobs.job_id
  JOIN company ON jobs.company_id = company.company_id
  WHERE applications.employee_id = ?
  ORDER BY applications.application_id DESC
`;

    // var sql = `select * from employee, applications where employee.employee_id = applications.employee_id and employee_id=?`;
    var applications = await exe(sql,[user]);
    var packet = {applications};
    // res.send(applications);
    res.render("employee/applications.ejs",packet);

});

router.get("/delete_resume//employee_resume/:employee_id", async function(req, res) {
  try {
    const employee_id = req.params.employee_id; 

    // 
    const sqlSelect = "SELECT resume_file FROM employee WHERE employee_id = ?";
    const result = await exe(sqlSelect, [employee_id]);

    if (result.length > 0 && result[0].resume_file) {
      const resumePath = path.join(__dirname, "../public/employee_resumes/", result[0].resume_file);

      const sqlDelete = "UPDATE employee SET resume_file = NULL WHERE employee_id = ?";      await exe(sqlDelete, [employee_id]);
    }

    res.redirect("/employee/profile"); // redirect back to profile page
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).send("Internal Server Error");
  }
});


router.get("/jobs",async function(req,res){
    var user = req.session.employee_id;
    var sql = `select *, (select count(*) from applications where applications.job_id = jobs.job_id AND applications.employee_id = ?) as
    applications_count from jobs, company where jobs.company_id = company.company_id order by job_id desc`;
    var jobs = await exe(sql,[user]);
    var sql2 = `select * from employee`;
    var employee = await exe(sql2);
    var packet = {user,jobs,employee};
    res.render("employee/jobs.ejs",packet);
});


module.exports= router;