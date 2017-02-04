'use strict';

var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "Bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    runManager();
});

var updateItem = {};

// array used to store item_ids from inventory table
var availableItems = [];

// allows tracking where the request to read database comes from
var trackViewTask = "";

function runManager() {
    // prompts user to select a task and "when:" pertinent more question according to selected task
    inquirer.prompt([{
        type: "list",
        message: "Select a Task",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Products"
        ],
        name: "task"
    }, {
    	// prompt when manager wants to re-supply inventory
        when: function(userChoice) {
        	// checks user choice against inventory id stored in available items array
            trackViewTask = "Add to Inventory";
            runViewInventory(trackViewTask);
            return userChoice.task == "Add to Inventory";
        },
        type: "input",
        message: "Enter item_id",
        name: "item_id",
        validate: function(input) {
            var done = this.async();
            setTimeout(function() {
                if (availableItems.indexOf(parseInt(input)) == -1) {
                    // pass the return value in the done callback
                    done('Please provide a valid product id');
                    return;
                }
                done(null, true);
            }, 200);
        }
    }, {
    	// prompt when manager wants to add new product to inventory
        when: function(userChoice) {
            return userChoice.task == "Add New Products" },
        type: "input",
        message: "Enter product name",
        name: "product_name",
        validate: function(input) {
            var done = this.async();
            setTimeout(function() {
                if (!input) {
                    done('Product name has to be entered');
                    return;
                }
                done(null, true);
            }, 200);
        }
    }, {
    	// prompt when manager wants to add new product to inventory
        when: function(userChoice) {
            return userChoice.task == "Add New Products" },
        type: "input",
        message: "Enter Department name product belongs to",
        name: "department_name",
        validate: function(input) {
            var done = this.async();
            setTimeout(function() {
                if (!input) {
                    done('Enter product department');
                    return;
                }
                done(null, true);
            }, 200);
        }
    }, {
    	// prompt when manager wants to add new product to inventory
        when: function(userChoice) {
            return userChoice.task == "Add New Products" },
        type: "input",
        message: "What is the product price?",
        name: "price",
        validate: function(input) {
            var done = this.async();
            // validateNumber(input);
            setTimeout(function() {
                if (isNaN(input) || input <= 0) {
                    done('Provide a valid price number');
                    return;
                }
                done(null, true);
            }, 200);
        }
    }, {
    	// prompt when manager wants to re-supply or add new product to inventory
        when: function(userChoice) {
            return (userChoice.task == "Add New Products" || userChoice.task == "Add to Inventory") },
        type: "input",
        message: "How many are we stocking?",
        name: "item_quant",
        validate: function(input) {
            // validateNumber(input);
            var done = this.async();
            setTimeout(function() {
                if (isNaN(input) || input <= 0 || (input%1) !== 0) {
                    done('Provide a valid amount');
                    return;
                }
                done(null, true);
            }, 200);
        }
    }]).then(function(answer) {
        switch (answer.task) {
            case "View Products for Sale":
                runViewInventory();
                break;

            case "View Low Inventory":
                trackViewTask = "View Low Inventory";
                runViewInventory(trackViewTask);
                break;

            case "Add to Inventory":
                updateItem = {
                    item_id: answer.item_id,
                    stock_quantity: answer.item_quant
                }
                runResupply(updateItem);
                break;

            case "Add New Products":
                updateItem = {
                    product_name: answer.product_name,
                    department_name: answer.department_name,
                    price: parseFloat(answer.price),
                    stock_quantity: parseInt(answer.item_quant)
                }
                runAddNewItem(updateItem);
                break;
        }
    });
}


function runViewInventory(trackViewTask) {
    var query = "SELECT * FROM products";
    connection.query(query, function(err, res) {

        if (trackViewTask == "View Low Inventory") {
            var table = new Table({
                head: ['id', 'Product', 'Current Stock'],
                colAligns: ['right', 'left', 'right']
            });
        } else {
            var table = new Table({
                head: ['id', 'Product', 'Department', 'Unit Price', 'Current Stock'],
                colAligns: ['right', 'left', 'left', 'right', 'right']
            });
        }

        for (let i = 0; i < res.length; i++) {
            // fill available items by id array
            if (trackViewTask == "Add to Inventory") {
                availableItems.push(res[i].item_id);
            } else if (trackViewTask == "View Low Inventory") {
            	// sort products with less than 5 items in stock
                if (res[i].stock_quantity < 6) {
                    table.push([res[i].item_id, res[i].product_name, res[i].stock_quantity]);
                }
            } else {
                table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price.toFixed(2), res[i].stock_quantity]);
            }
        }

        if (trackViewTask == "Add to Inventory") { return availableItems; } 
        else {
            console.log(table.toString());
            connection.end();
        }

    });

}

function runResupply() {
	// reading current stock of a product to be re-supplied, and adding new items quantity to initial value
    var query = "SELECT stock_quantity FROM products WHERE ?";
    connection.query(query, { item_id: updateItem.item_id }, function(err, res) {
        var totalItems = parseInt(res[0].stock_quantity) + parseInt(updateItem.stock_quantity);
        update(totalItems);
    });

    function update(totalItems) {
        var query = "UPDATE products SET ? WHERE ?";
        connection.query(query, [{ stock_quantity: totalItems },
                { item_id: parseInt(updateItem.item_id) }
            ],
            function(err, res) {
                if (err) throw err;
                console.log("Updated stock. Total items: " + totalItems);
            });
        connection.end();
    }
}

function runAddNewItem() {
    var query = "INSERT INTO products SET ?";
    connection.query(query, updateItem, function(err, res) {
        if (err) throw err;
        console.log("Product Added");
        connection.end();
    });

}
