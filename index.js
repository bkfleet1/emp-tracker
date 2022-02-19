const inquirer = require(`inquirer`); // questions resource (npm i inquirer)
const cTable = require('console.table');
const db = require('./db/connection');
const { response } = require('express');
let Depts = [];
let Roles = [];
let DMgrs = [];
let DMgrsArr = [];
let EmpArr = [];
let EmpArr2 = [];
let EmpArr4 = [];
let EmpArr5 = [];

const builddept = () => {
    db.query(`Select name from department`, (err, res) => {
        if (err) throw err
        for (let index = 0; index < res.length; index++) {
            Depts.push(res[index].name)
        }
    }
    )
}

const menu = [
    {
        type: 'list',
        name: 'menu',
        message: `Please select a function you want to perform`,
        choices: [`View all departments`, `View all roles`, `View all employees`, `Add a department`, `Add a role`, `Add an employee`, `Update an employee role`, `Exit Application`],
    }
];

const newDepartment = [
    {
        type: `input`,
        name: `name`,
        message: `What's the name of the new department you'd like to add?`
    },
];

const newRole = [
    {
        type: `list`,
        name: `department_name`,
        message: `Select the department to which the new role is assigned?`,
        choices: Depts
    },
    {
        type: `input`,
        name: `title`,
        message: `What's the title of the new role?`
    },
    {
        type: `input`,
        name: `salary`,
        message: `What's the salary of the new role? Do not include $`
    }
];

const newEmpDept = [
    {
        type: `list`,
        name: `department_name`,
        message: `What department is the employee assigned?`,
        choices: Depts
    }
];

const newEmployee = [
    {
        type: `list`,
        name: `title`,
        message: `What role is the employee assigned?`,
        choices: Roles
    },
    {
        type: `input`,
        name: `first_name`,
        message: `What's the employee's first name?`
    },
    {
        type: `input`,
        name: `last_name`,
        message: `What's the employee's last name?`
    },
    {
        type: `list`,
        name: `manager`,
        message: `Who is the employee's manager?`,
        choices: DMgrs
    }
];

const updateEmployee = [
    {
        type: `list`,
        name: `employee`,
        message: `Which employee's title would you like to update?`,
        choices: EmpArr
    }
];

const updateEmpRole = [
    {
        type: `list`,
        name: `title`,
        message: `Which role would you like to assign to the employee?`,
        choices: EmpArr4
    }
];



const init = () => {
    inquirer.prompt(menu)
        .then((data) => {
            if (data.menu === `View all departments`) {
                getDepartments();
            }
            else if (data.menu === `View all roles`) {
                getRoles();
            }
            else if (data.menu === `View all employees`) {
                getEmployees();
            }
            else if (data.menu === `Add a department`) {
                postDepartment();
            }
            else if (data.menu === `Add a role`) {
                postRole();
            }
            else if (data.menu === `Add an employee`) {
                postEmployee();
            }
            else if (data.menu === `Update an employee role`) {
                putEmployee();
            }
            else if (data.menu === `Exit Application`) { return }
            else return;
        })
        .catch((err) => {
            console.log(`The following error occurred while creating manager's profile. Here's the error:`, err);
        })
};

const getDepartments = () => {
    const sql = `select * from department order by name asc`;
    db.query(sql, (err, res) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else
            console.table(res)
        init();
    });
};


const getRoles = () => {
    const sql = `select * from role order by title asc`;
    db.query(sql, (err, res) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else
            console.table(res)
        init();
    });
};

const getEmployees = () => {
    const sql = `select * from employee order by first_name asc`;
    db.query(sql, (err, res) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else
            console.table(res)
        init();
    });
};


const postDepartment = () => {
    inquirer.prompt(newDepartment)
        .then((data) => {
            const sql = `INSERT INTO department (name) VALUES (?)`;
            db.query(sql, (data.name), (err, res) => {
                if (err) {
                    res.status(400).json({ error: err.message });
                    return;
                }
                console.log(`
**** Department ${data.name} was successfully added! ****
        `)
            });
            init();
        })
};

const postRole = () => {
    inquirer.prompt(newRole)
        .then((data) => {
            let deptName = data.department_name;
            let title = data.title;
            let salary = data.salary;
            let sql = `SELECT id as department_id from department where name = '${deptName}'`
            db.query(sql, (err, res) => {
                if (err) throw err
                let [department_id] = res.map(function (i) { return JSON.stringify(i.department_id); })
                let sql1 = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`
                db.query(sql1, ([title, salary, department_id]), (err, res) => {
                    if (err) {
                        res.status(400).json({ error: err.message });
                        return
                    }
                    console.log(`
**** Role ${title} was successfully add! ****
                    `);
                    init();
                })
            })
        })
};


const postEmployee = () => {
    inquirer.prompt(newEmpDept)
        .then((data) => {
            let deptName = data.department_name;
            let sqlE1 = `SELECT id as department_id from department where name = '${deptName}'`
            db.query(sqlE1, (err, res) => {
                if (err) throw err
                let [department_id] = res.map(function (i) { return JSON.stringify(i.department_id); })

                let sqlE2 = `SELECT id, title from role where department_id = '${department_id}'`
                db.query(sqlE2, (err, res) => {
                    if (err) throw err
                    else {
                        res.map(function (i) { Roles.push(i.title) })
                        let rolesIds = res.map(function (i) { return JSON.stringify(i.id) })

                        let sqlE3 = `SELECT id, concat (first_name,' ',last_name) as MgrNames, first_name, last_name FROM employee WHERE role_id IN (${rolesIds})`
                        db.query(sqlE3, (err, res) => {
                            if (err) throw err
                            else {

                                DMgrsArr.push(res)
                                res.map(function (i) { DMgrs.push(i.MgrNames) })
                                inquirer.prompt(newEmployee)
                                    .then((data) => {
                                        title = data.title;
                                        first_name = data.first_name;
                                        last_name = data.last_name;
                                        manager = data.manager;
                                        console.log(first_name, last_name, title, manager)
                                        let mgrArr = DMgrsArr.flat(1)
                                        let mgrArr2 = mgrArr.filter(function (el) { return el.MgrNames === manager })
                                        let manager_id = mgrArr2.map(function (i) { return JSON.stringify(i.id); })
                                        let sqlE4 = `SELECT role.id as role_id from role where role.title = '${title}' and role.department_id='${department_id}'`
                                        db.query(sqlE4, (err, res) => {
                                            if (err) throw err
                                            else {
                                                let [role_id] = res.map(function (i) { return JSON.stringify(i.role_id); })

                                                let sqlE5 = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`
                                                db.query(sqlE5, ([first_name, last_name, role_id, manager_id]), (err, res) => {
                                                    if (err) throw err
                                                    else {
                                                        console.log(`
**** Employee ${first_name} ${last_name} was successfully ****
                                        `);
                                                        init();
                                                    }
                                                }
                                                )
                                            }
                                        })
                                    })
                            }
                        })
                    }
                })
            })
        })
}

const putEmployee = () => {
    const sqlP1 = `select id, role_id, concat (first_name,' ',last_name) as Employee_Name from employee order by first_name asc`;
    db.query(sqlP1, (err, res) => {
        if (err) throw err
        else {
            res.map(function (i) { EmpArr.push(i.Employee_Name) })
            EmpArr2.push(res)
            // console.log(EmpArr2)
            inquirer.prompt(updateEmployee)
                .then((data) => {
                    let Emp_Name = data.employee
                    let EmpArr3 = EmpArr2.flat(1).filter(function (el) { return el.Employee_Name === Emp_Name })
                    let [EmpId3] = EmpArr3.map(function (i) { return JSON.stringify(i.id) })
                    let sqlEmp3 = `SELECT role.id, role.title from role where role.department_id IN (SELECT role.department_id from role where role.id IN (select employee.role_id from employee where employee.id = ${EmpId3}))`
                    db.query(sqlEmp3, (err, res) => {
                        if (err) throw err
                        else {
                            res.map(function (i) { EmpArr4.push(i.title) })
                            EmpArr5.push(res)
                            // console.log(EmpArr5)
                            inquirer.prompt(updateEmpRole)
                                .then((data) => {
                                    let RoleName = data.title;
                                    let EmpArr6 = EmpArr5.flat(1).filter(function (el) { return el.title === data.title})
                                    let [EmpRole4] = EmpArr6.map(function (i) { return JSON.stringify(i.id) })
                                    // console.log('Role_Id :',EmpRole4)
                                    // console.log('Emp_Id :',EmpId3)
                                    let sqlEmp4 = `UPDATE employee set employee.role_id = ${EmpRole4} where employee.id = ${EmpId3}`
                                    db.query(sqlEmp4, (err, res) => {
                                        if (err) throw err
                                        else {  console.log(`
    **** Employee ${Emp_Name}'s role was successfully set to ${RoleName}****
                                                                                `);
                                        init();
                                        }
                                    })
                                })
                        }
                    })
                })
        }
    })
}







init()
builddept()