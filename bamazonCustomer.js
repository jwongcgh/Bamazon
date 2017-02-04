'use strict';

var mysql = require("mysql");
var inquirer = require("inquirer");

// table formatting npm
var Table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "Bamazon"
});

// establishing mysql connection
connection.connect(function(err){
	if (err) throw err;
	runDisplayItems();
});

// store stock available items_id in an array
var availableItems = [];

// create instance of Table
var table = new Table ({
	head: ['id', 'Product', 'Price'],
	// colWidths: [4, 60, 8],
	colAligns: ['right', 'left', 'right']
});

var runDisplayItems = function() {
	// reading mysql database
	var query = "SELECT item_id, product_name, price, stock_quantity FROM products";

	connection.query(query, function(err, res) {
		
		// loop through all items in inventory
		for (let i=0; i<res.length; i++) {
			
			// display only items currently in stock, if zero in stock will skip item
			if (parseInt(res[i].stock_quantity) !== 0) {
				// filling up item-id array
				availableItems.push(res[i].item_id);
				// filling up table
				table.push(
					[res[i].item_id, res[i].product_name, res[i].price.toFixed(2)]
				);
			}			
		}
		console.log(table.toString());
		runAskCustomer();
		// connection.end();
	});
}

function runAskCustomer() {
	inquirer.prompt ([
		{
			type: "input",
			message: "Please enter id of product you'd like to buy?",
			name: 'item_id',
			// validates data entry/checks that input is a valid entry
			validate: function(input) {
				// declare function as asynchronous, and save the done callback
				var done = this.async();
				// Do async stuff
				setTimeout(function(){
					// checking if user input for item_id is found in availableItems item_id array
					if (availableItems.indexOf(parseInt(input)) == -1 ) {
						// pass the return value in the done callback
						done('Please provide a valid product id');
						return;
					} 
					done(null, true);
				}, 200);
			}
		},
		{
			type: "input",
			message: "How many do you want to purchase?",
			name: 'item_quant',
			// validates data entry
			validate: function(input) {
				var done = this.async();
				// Do async stuff
				setTimeout(function(){
					// checking if input is a valid number
					if (isNaN(input) || input < 0) {
						done('Please provide a number');
						return;
					} 
					done(null, true);
				}, 200);
			}
		}
		]).then(function(answer) {
			runCheckInventory(answer.item_id, answer.item_quant);
		});
}

function runCheckInventory(item_id, item_quant) {
	var query = "SELECT item_id, product_name, stock_quantity, price FROM products WHERE ?";
			connection.query(query, {item_id: item_id}, function(err, res) {	
				// checking if number of items ordered is in stock
				if (res[0].stock_quantity < parseInt(item_quant)) {
					console.log("Sorry! Only " + res[0].stock_quantity + " left in stock");
					connection.end();
				} else {
					var total = item_quant * res[0].price;
					console.log("===------------------------===");
					console.log("Order Summary");
					console.log("Item: " + res[0].product_name);
					console.log("Quantity: " + item_quant);
					console.log("Unit Price: $ " + res[0].price);
					console.log("Invoice Total: $ " + (item_quant * res[0].price).toFixed(2));
					console.log("Your order will ship within 2-3 days");
					console.log("Thanks for your support, Have a great day!");
					console.log("===------------------------===");
					var stockLeft = res[0].stock_quantity - item_quant;
					runUpdateInventory(item_id, stockLeft);
				}	
			});
}

function runUpdateInventory(item_id, stockLeft) {
	var query = "UPDATE products SET ? WHERE ?";
	connection.query(query, [{stock_quantity: stockLeft},{item_id: item_id}],
		function(err, res){
			if (err) throw err;
		});
	connection.end();
}

