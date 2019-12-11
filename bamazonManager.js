const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bootySHAKE",
    database: "bamazon"
});

  connection.connect(function(err) {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    ShowManagerOptions();
  });

  function ShowManagerOptions() {

    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Select an Option:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(function(result) {
        UpdateBamazon(result);
    })
  }

  function UpdateBamazon(user) {

      switch (user.choice) {
          case "View Products for Sale":
              ShowProducts();
              break;
          case "View Low Inventory":
              break;
          case "Add to Inventory":
              break;
          case "Add New Product":
              break;
      }

    connection.end();
  }

  function ShowProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
  
        console.log("-----------------------------------");
  
        for (let i = 0; i < res.length; i++) {
          console.log(`${res[i].item_id} | ${res[i].product_name} | ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity}`);
          console.log("-----------------------------------");
        }
      });
  }