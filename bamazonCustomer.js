var fs = require("fs");

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: "password here",
	database: "Bamazon"

});

connection.connect(function(err){
	if (err) {
		throw err;
	}
	runDisplayItems();
});

var availableItems = [];

var runDisplayItems = function() {
	var query = "SELECT item_id, product_name, price FROM products";

	// callback function
	// arguments such as query is executed before the callback function(err, res)
	// once the query is fullfilled then callback function(err, res) is executed
	// put connection.end inside the call back function so it does not end connection before query is fullfilled
	connection.query(query, function(err, res) {
		for (let i=0; i<res.length; i++) {
			console.log(res[i].item_id + " " + res[i].product_name + " " + res[i].price);
			availableItems.push(res[i].item_id);
			// stockItems.push(res[i].stock_quantity);
		}
		runAskCustomer();
		// connection.end();
	});
}


function runAskCustomer() {
	console.log(availableItems);
	inquirer.prompt ([
		{
			type: "input",
			message: "Please enter ID of product you'd like to buy?",
			name: 'item_id',
			// validates data entry/checks that input is a valid entry
			validate: function(input) {
				// declare function as asynchronous, and save the done callback
				var done = this.async();
				// Do async stuff
				setTimeout(function(){
					// console.log(typeof availableItems.indexOf(input));
					// console.log(typeof input);
					// console.log(" " + availableItems.indexOf(parseInt(input)));
					// checking if input id is found in availableItems id array
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

			console.log("answer.item_id: " + answer.item_id);
			console.log("answer.item_quant: " + answer.item_quant);
			runCheckInventory(answer.item_id, answer.item_quant);
		});
}

function runCheckInventory(item_id, item_quant) {
	var query = "SELECT item_id, product_name, stock_quantity, price FROM products WHERE ?";
			connection.query(query, {item_id: item_id}, function(err, res) {
				
				console.log(typeof parseInt(item_id));	// string
				console.log(res[0]);
				if (res[0].stock_quantity < parseInt(item_quant)) {
					console.log("Sorry! Only " + res[0].stock_quantity + " left in stock");
				} else {
					var total = item_quant * res[0].price;
					console.log("===------------------------===");
					console.log("Order Summary");
					console.log("Item: " + res[0].product_name);
					console.log("Quantity: " + item_quant);
					console.log("Unit Price: " + res[0].price);
					console.log("Invoice Total: " + item_quant * res[0].price);
					console.log("Your order will ship in 2-3 days");
					console.log("Thanks for your support, Have a great day!");
					console.log("===------------------------===");
					runUpdateInventory(item_id, item_quant);
				}

				connection.end();
			})
	
}

function runUpdateInventory(item_id, item_quant) {
	console.log("answer.item_id: " + item_id);
	console.log("answer.item_quant: " + item_quant);
}

