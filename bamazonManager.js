'use strict';

var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

connection.connect(function(err){
	if (err) throw err;
	runSearch();
});

function runSearch() {
inquirer.prompt([
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
		}
	]).then(function(answer) {
		console.log(answer);
		switch (answer.task) {
			case "View Products for Sale":
				runViewProducts();
				break;

			case "View Low Inventory":
				runViewLowInventory();
				break;

			case "Add to Inventory":
				runResupply();
				break;

			default:
				runAddNewItem();
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
		inquirer.prompt([
			{
				type: "input",
				message: "Enter item id to be re-stocked",
				name: "item_id"
			},
			{
				type: "input",
				message: "Enter number of items added to stock",
				name: "stock_quantity",
				validate: function(input) {
					var done = this.async();
					setTimeout(function() {
						if (isNaN(input)) {
							done('Enter a valid number');
							return;
						}
						done(null, true);
					}, 200);
				}
			}
		]).then(function(answer) {
			
			var query = "SELECT stock_quantity FROM products WHERE ?";
			connection.query(query, {item_id: answer.item_id}, function(err, res) {
				var totalItems = parseInt(res[0].stock_quantity) + parseInt(answer.stock_quantity);
				update(totalItems);
			});

			function update(totalItems) {
			var query = "UPDATE products SET ? WHERE ?";
			connection.query(query, [{stock_quantity: totalItems}, 
				                     {item_id: parseInt(answer.item_id)}], 
				function(err, res) {
					if (err) throw err;
				});
			connection.end();
			}
			
		});
		
	}

	function runAddNewItem() {
		inquirer.prompt([
			{
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
				type: "input",
				message: "Enter Department name product belongs to",
				name: "product_department",
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
				type: "input",
				message: "What is the product price?",
				name: "price",
				validate: function(input) {
					var done = this.async();
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
				type: "input",
				message: "How many are we stocking?",
				name: "item_quant",
				validate: function(input) {
					var done = this.async();
					setTimeout(function(){
						if(isNaN(input) || input <= 0 ) {
							done('Provide a valide number other than 0');
							return;
						}
						done(null, true);
					}, 200);
				}
			}
		]).then(function(answer) {
			console.log(answer.product_name);
			var newItem = {
				product_name: answer.product_name,
				department_name: answer.product_department,
				price: parseFloat(answer.price),
				stock_quantity: parseInt(answer.item_quant)
			}
			console.log(newItem);
			var query = "INSERT INTO products SET ?";
			connection.query(query, newItem, function(err,res){
				if (err) throw err;
			});
		})
		// connection.end();
	}