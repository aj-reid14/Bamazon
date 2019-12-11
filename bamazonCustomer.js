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
    ShowProducts();
  });

  function RestartConnection() {
      connection = mysql.createConnection({
          host: "localhost",
          port: 3306,
          user: "root",
          password: "bootySHAKE",
          database: "bamazon"
      });
      
      connection.connect(function(err) {
        if (err) throw err;
        console.log(`connected as id ${connection.threadId}`);
        ShowProducts();
    })

  }
  
  function ShowProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;

      console.log("ID | Item Name | Department | Price | Stock (Quantity)");
      console.log("-----------------------------------");

      for (let i = 0; i < res.length; i++) {
        console.log(`${res[i].item_id} | ${res[i].product_name} | ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity}`);
        console.log("-----------------------------------");
      }
    });

    setTimeout(ShowInitialPrompts, 1500);

  }

  function ShowInitialPrompts() {
      inquirer.prompt([
          {
              type: "input",
              message: "Enter a Produt: ",
              name: "userProduct"
          }, {
              type: "input",
              message: "How Many?",
              name: "userQuantity",
          }, {
              type: "confirm",
              message: "Are you sure?",
              name: "confirm",
              default: true
          }
      ]).then(function(response) {
          if (!response.confirm) {
              console.log("Come back when you are ready to shop!");
              RestartConnection();
          } else {
            UpdateBamazon(response);
          }
      })
  }
  
  function UpdateBamazon(userOrder) {
    
    let productFound = false;
    
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
  
        for (let i = 0; i < res.length; i++) {
            if (res[i].item_id === parseInt(userOrder.userProduct)) {

                productFound = true;

                if (userOrder.userQuantity > res[i].stock_quantity) {
                    console.log("Puchase Failed - Insufficient Stock")
                } else {
                    let query = connection.query(
                        "UPDATE products SET ? WHERE ?", [
                            {stock_quantity: res[i].stock_quantity - userOrder.userQuantity}, 
                            {item_id: userOrder.userProduct}
                        ], function(err, result) {
                        if (err) throw err;
                        let cost = parseInt(userOrder.userQuantity) * res[i].price;
                        console.log("Thank you for your purchase!");
                        console.log("----------------------------");
                        console.log(`RECEIPT: ${res[i].product_name} - (x${userOrder.userQuantity}), $${cost.toFixed(2)}`);
                    })}

                break;
            }
        }

        connection.end();

        if (!productFound)
            console.log("Purchase Failed - Product not found.");

      });
  }