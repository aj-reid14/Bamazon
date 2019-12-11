const mysql = require("mysql");
const inquirer = require("inquirer");

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "bootySHAKE",
    database: "bamazon"
});

connection.connect(function (err) {
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
    ]).then(function (result) {
        UpdateBamazon(result);
    })
}

function UpdateBamazon(user) {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        switch (user.choice) {
            case "View Products for Sale":
                ShowProducts(res);
                connection.end();
                break;
            case "View Low Inventory":
                ShowLowInventory(res);
                connection.end();
                break;
            case "Add to Inventory":
                AddToInventory(res);
                break;
            case "Add New Product":
                AddNewProduct();
                break;
        }

    });

}

function ShowProducts(products) {

    console.log("-----------------------------------");

    for (let i = 0; i < products.length; i++) {
        console.log(`${products[i].item_id} | ${products[i].product_name} | ${products[i].department_name} | ${products[i].price} | ${products[i].stock_quantity}`);
        console.log("-----------------------------------");
    }
}

function ShowLowInventory(products) {

    let lowStockFound = false;
    console.log("-----------------------------------");

    for (let i = 0; i < products.length; i++) {

        if (products[i].stock_quantity <= 5) {
            lowStockFound = true;
            console.log(`${products[i].item_id} | ${products[i].product_name} | ${products[i].department_name} | ${products[i].price} | ${products[i].stock_quantity}`);
            console.log("-----------------------------------");
        }
    }

    if (!lowStockFound)
        console.log("All items in stock.");

}

function AddToInventory(products) {

    ShowProducts(products);

    inquirer.prompt([
        {
            type: "input",
            name: "choice",
            message: "Select An Item: "
        }, {
            type: "input",
            name: "quantity",
            message: "Adding Quantity: "
        }
    ]).then(function (user) {
        for (let i = 0; i < products.length; i++) {
            if (parseInt(user.choice) === products[i].item_id) {
                console.log("-----------------------------------");
                console.log(`Updating Stock: ${products[i].product_name} (+${user.quantity})`);

                connection.query("UPDATE products SET ? WHERE ?", [
                    { stock_quantity: products[i].stock_quantity + parseInt(user.quantity) },
                    { item_id: user.choice }
                ], function (err, result) {
                    if (err) throw err;
                    console.log("Stock Updated!");
                    connection.end();
                });

                break;
            }
        }
    })
}

function AddNewProduct() {

    inquirer.prompt([
        {
            type: "input",
            name: "product",
            message: "Enter Product Name: "
        }, {
            type: "input",
            name: "department",
            message: "Enter Product's Department: "
        }, {
            type: "input",
            name: "price",
            message: "Enter the Price: $"
        }, {
            type: "input",
            name: "quantity",
            message: "Enter Quantity to Add to Inventory: "
        }
    ]).then(function(user) {

        if (!user.product || !user.department || !user.price || !user.quantity) {
            console.log("Action Failed - Invalid Product Information");
        } else {

            let post = {
                product_name: user.product,
                department_name: user.department,
                price: parseFloat(user.price).toFixed(2),
                stock_quantity: parseInt(user.quantity)
            };

            connection.query("INSERT INTO products SET ?", post, function(err, result) {
                if (err) throw err;

                console.log("-----------------------------------");
                console.log("New Product Added to Inventory!");
                console.log("-----------------------------------");
                console.log(`${user.product} | ${user.department} | ${user.price} | ${user.quantity}`);

            })

        }
        connection.end();
    })

}

function RestartConnection() {
    connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "bootySHAKE",
        database: "bamazon"
    });
}