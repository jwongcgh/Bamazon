'use strict';

var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require("cli-table");
// var Table = require("console.table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "jwsql**00",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err) throw err;
	runManageStock();
});

var table = new Table ({
	// head: ['id', 'Product', 'Price'],
	// colWidths: [4, 60, 8],
	colAligns: ['right', 'left', 'right']
});

var newItem = {};

function runManageStock() {

// prompts user to select a task and "when:" pertinent more question according to selected task
inquirer.prompt ( [
		{
			type: "list",
			message: "Select a Task",
			choices: [
				"View Products for Sale", 
				"View Low Inventory", 
				"Add to Inventory", 
				"Add New Products"
				],
			name: "task"
		},
		{
				when: function(userChoice) { 
					return userChoice.task ==  "Add to Inventory" },
				type: "input",
				message: "Enter item_id",
				name: "item_id",
				validate: function(input) {
					var done = this.async();
					setTimeout(function() {
						if(isNaN(input) || input <= 0) {
							done('Provide a valid price number');
							return;
						}
						done(null, true);
					}, 200);
				}
			},
		{
				when: function(userChoice) { return userChoice.task ==  "Add New Products" },
				type: "input",
				message: "Enter product name",
				name: "product_name",
				validate: function(input) {
					var done = this.async();
					setTimeout(function() {
						if(!input) {
							done('Product name has to be entered')
						}
						done(null, true);
					}, 200);
				}
			},
			{
				when: function(userChoice) { return userChoice.task ==  "Add New Products" },
				type: "input",
				message: "Enter Department name product belongs to",
				name: "department_name",
				validate: function(input) {
					var done = this.async();
					setTimeout(function() {
						if(!input) {
							done('Enter product department');
						}
						done(null, true);
					}, 200);
				}
			},
			{
				when: function(userChoice) { return userChoice.task ==  "Add New Products" },
				type: "input",
				message: "What is the product price?",
				name: "price",
				validate: function(input) {
					
					var done = this.async();
					// validateNumber(input);
					setTimeout(function(){
						if(isNaN(input) || input <= 0) {
							done('Provide a valid price number');
							return;
						}
						done(null, true);
					}, 200);
				}
			},
			{
				when: function(userChoice) { return (userChoice.task ==  "Add New Products" || userChoice.task == "Add to Inventory")},
				type: "input",
				message: "How many are we stocking?",
				name: "item_quant",
				validate: function(input) {
					// validateNumber(input);
					var done = this.async();
					setTimeout(function(){
						if(isNaN(input) || input <= 0 ) {
							done('Provide a valid number other than 0');
							return;
						}
						done(null, true);
					}, 200);
				}
			}
	]).then(function(answer) {
		console.log("answer: " + JSON.stringify(answer));
		switch (answer.task) {
			case "View Products for Sale":
				// readDatabase(answer.task);
				runViewProducts();
				break;

			case "View Low Inventory":
				runViewLowInventory();
				break;

			case "Add to Inventory":
				newItem = {
					item_id: answer.item_id,
					stock_quantity: answer.item_quant
				}
				runResupply(newItem);
				break;

			case "Add New Products":
			newItem = {
				product_name: answer.product_name,
				department_name: answer.department_name,
				price: parseFloat(answer.price),
				stock_quantity: parseInt(answer.item_quant)
			}
				runAddNewItem(newItem);
				break;
		}
	});
}




	var runViewProducts = function () {
		var query = "SELECT * FROM products";
		connection.query(query, function(err, res) {
			console.log("===----------- Products Catalog -------------===");
			console.log("===------------------------------------------===");
			console.log("item id || product name || unit price || stock quantity");
			for (let i=0; i<res.length; i++) {
			console.log(res[i].item_id + " " +
				        res[i].product_name + " || $" +
				        res[i].price + " || " +
						res[i].stock_quantity);
			}
			console.log("===------------------------===");
		})
		connection.end();
	}

	function runViewLowInventory() {
		var query = "SELECT * FROM products";
		connection.query(query, function(err, res) {
			console.log("===----------- Low Inventory Items -------------===");
			for (let i=0; i<res.length; i++) {
				if (res[i].stock_quantity < 6) {
			console.log(res[i].item_id + " " +
				        res[i].product_name + " || " +
						res[i].stock_quantity);
			}
			}
		})
		connection.end();
	}


	function runResupply() {
		// runViewProducts();
			
			var query = "SELECT stock_quantity FROM products WHERE ?";
			connection.query(query, {item_id: newItem.item_id}, function(err, res) {
				var totalItems = parseInt(res[0].stock_quantity) + parseInt(newItem.stock_quantity);
				update(totalItems);
			});

			function update(totalItems) {
			var query = "UPDATE products SET ? WHERE ?";
			connection.query(query, [{stock_quantity: totalItems}, 
				                     {item_id: parseInt(newItem.item_id)}], 
				function(err, res) {
					if (err) throw err;
					console.log("Updated stock_quantity: " + totalItems);
				});
			connection.end();
			}
			
		// });
		
	}

	function runAddNewItem() {
		console.log("inside New Item");

			// console.log(newItem);
			var query = "INSERT INTO products SET ?";
			connection.query(query, newItem, function(err,res){
				if (err) throw err;
				console.log("Product Added")
				connection.end();
			});
		
	}
