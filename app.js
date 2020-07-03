// var budgetController = (function() {
// 	var x = 23;
// 	var add = function(a) {
// 		return x + a;
// 	};
// 	return {
// 		publicTest: function(b) {
// 			return add(b);
// 		}
// 	};
// })();

// var UIController = (function() {})();

// var controller = (function(budgetCtrl, UICtrl) {
// 	var z = budgetCtrl.publicTest(5);
// 	return {
// 		anotherPublic: function() {
// 			console.log(z);
// 		}
// 	};
// })(budgetController, UIController);

// Budget Controller
var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var data = {
		items: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0.0,
			inc: 0.0
		},
		budget: 0,
		percentage: 0
	};
	var calculateTotal = function(type) {
		var arr = data.items[type];
		var sum = 0;
		arr.forEach((el) => {
			sum += el.value;
		});
		data.total[type] = sum;
	};
	return {
		addItem: function({ type, description, value }) {
			var newItem;
			var id = uuid(); // a unqinue number for each item as identifier

			// create item by type
			if (type === 'exp') {
				newItem = new Expense(id, description, value);
			} else if (type === 'inc') {
				newItem = new Income(id, description, value);
			}

			// push into datastructure
			data.items[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type, id) {
			var newItems = data.items[type].filter((el) => {
				return el.id !== id;
			});
			data.items[type] = newItems;
		},
		getTotalBudget: function() {
			// calculate income and exp in total
			calculateTotal('inc');
			calculateTotal('exp');

			// budget = income - expenses
			data.budget = data.total.inc - data.total.exp;

			// calculate percentage we have spent
			data.percentage = data.total.inc > 0 ? Math.round(data.total.exp / data.total.inc * 100) : -1;
			return {
				budget: data.budget,
				inc: data.total.inc,
				exp: data.total.exp,
				perc: data.percentage
			};
		},
		calcPercentages: function() {
			console.log('total.inc= ' + data.total.inc);
			data.items.exp.forEach(function(el) {
				el.calcPercentage(data.total.inc);
			});
		},
		getPercentages: function() {
			// return an array with all percentages
			return data.items.exp.map(function(el) {
				return el.getPercentage();
			});
		}
	};
})();

// UIController
var UIController = (function() {
	var DOMElements = {
		typeSelect: document.querySelector('.add__type'),
		descInput: document.querySelector('.add__description'),
		valueInput: document.querySelector('.add__value'),
		inputButton: document.querySelector('.add__btn'),
		incList: document.querySelector('.income__list'),
		expList: document.querySelector('.expenses__list'),
		budgetLabel: document.querySelector('.budget__value'),
		incomeLabel: document.querySelector('.budget__income--value'),
		expenseLabel: document.querySelector('.budget__expenses--value'),
		expensePerc: document.querySelector('.budget__expenses--percentage'),
		itemContainer: document.querySelector('.container'),
		dateLabel: document.querySelector('.budget__title--month')
	};
	var formatNumber = function(num, type) {
		/** rules
		 * + or - sign
		 * 2 decimals
		 * comma separation in thousands number','
		 */
		var sign = type === 'exp' ? '-' : '+';
		if (num === 0) {
			sign = '';
		}
		num = Math.abs(num);
		num = num.toFixed(2);
		var nums = num.toString().split('.');
		nums[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		console.log('format:' + nums[0]);
		if (nums.length === 1) {
			nums.push('00');
		}
		var newNum = sign + nums.join('.');
		console.log('join:' + newNum);
		return newNum;
	};
	// todo
	return {
		getInput: function() {
			return {
				type: DOMElements.typeSelect.value, // inc or exp
				description: DOMElements.descInput.value,
				value: parseFloat(DOMElements.valueInput.value)
			};
		},
		addListItem: function(obj, type) {
			// create html string
			var html;
			if (type === 'inc') {
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div> \
            <div class="right clearfix"> \
            <div class="item__value">%value%</div> \
            <div class="item__delete"> \
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> \
            </div> </div> </div>';
			} else if (type === 'exp') {
				html =
					'<div class="item clearfix" id="exp-%id%"> \
                <div class="item__description">%description%</div> \
                <div class="right clearfix"> \
                <div class="item__value">%value%</div> \
                <div class="item__percentage">21%</div> \
                <div class="item__delete"> \
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> \
                </div> </div></div>';
			}

			// replace placeholder text with data
			var newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert html to dom
			if (type === 'inc') {
				DOMElements.incList.insertAdjacentHTML('beforeend', newHtml);
			} else if (type === 'exp') {
				DOMElements.expList.insertAdjacentHTML('beforeend', newHtml);
			}
		},
		deleteListItem: function(selectorId) {
			var child = document.getElementById(selectorId);
			child.parentNode.removeChild(child);
		},
		clearFields: function() {
			// clear input
			var fields = [ DOMElements.descInput, DOMElements.valueInput ];
			var copiedFields = Array.prototype.slice.call(fields);
			copiedFields.forEach(function(el) {
				el.value = '';
			});
			DOMElements.descInput.focus();
		},
		getDOMElements: function() {
			return DOMElements;
		},
		updateBudgetUI: function(obj) {
			var type = obj.budget >= 0 ? 'inc' : 'exp';
			DOMElements.budgetLabel.textContent = formatNumber(obj.budget, type);
			DOMElements.incomeLabel.textContent = formatNumber(obj.inc, 'inc');
			DOMElements.expenseLabel.textContent = formatNumber(obj.exp, 'exp');
			DOMElements.expensePerc.textContent = obj.perc >= 0 ? obj.perc + '%' : '---';
		},
		updatePercentagesUI: function(percentages) {
			var percentageArray = document.querySelectorAll('.item__percentage');
			percentageArray.forEach(function(el, index) {
				if (percentages[index] >= 0) {
					el.textContent = percentages[index] + '%';
				} else {
					el.textContent = '---';
				}
			});
		},
		displayMonth: function() {
			var date = new Date();
			var year = date.getFullYear();
			// month is 0 based!!!!
			var month = date.getMonth();
			var months = [ 'Jan', 'Feb', 'Mar', 'April', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];
			DOMElements.dateLabel.textContent = months[month] + ', ' + year;
		},
		typeSelectOnChangeHandler: function() {
			// add red focus line
			var fields = [ DOMElements.typeSelect, DOMElements.descInput, DOMElements.valueInput ];
			fields.forEach((el) => {
				el.classList.toggle('red-focus');
			});

			// button color
			DOMElements.inputButton.classList.toggle('red');
		}
	};
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
	var setUpEventListeners = function() {
		DOM.inputButton.addEventListener('click', addItemHandler);

		// when enter key pressed on the input field
		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				addItemHandler();
			}
		});

		// delete event
		DOM.itemContainer.addEventListener('click', ctrlDeleteItem);

		// SELECT css event
		DOM.typeSelect.addEventListener('change', UICtrl.typeSelectOnChangeHandler);
	};
	var DOM = UICtrl.getDOMElements();
	var validateInputData = function(input) {
		if (input.description === '' || isNaN(input.value) || input.value <= 0) return false;
		return true;
	};
	var updateBudget = function() {
		// 1. calculate the budget
		// 2. return the budget
		var budgetData = budgetCtrl.getTotalBudget();

		// 3. display the budget on the UI
		// console.log(budgetData);
		UICtrl.updateBudgetUI(budgetData);
	};
	var updatePercentages = function() {
		// 1. calculate the percentages
		budgetCtrl.calcPercentages();

		// 2. return the percentages
		var percData = budgetCtrl.getPercentages();
		console.log(percData);

		// 3. display the budget on the UI
		UICtrl.updatePercentagesUI(percData);
	};
	var addItemHandler = function() {
		// 1. get the filled input data
		var inputData = UICtrl.getInput();
		if (!validateInputData(inputData)) {
			return;
		}

		// 2. add the item to the budget controller
		var newItem = budgetCtrl.addItem(inputData);

		// 3. add the item to the UI
		UICtrl.addListItem(newItem, inputData.type);
		// 3.1 clear the input after we add one
		UICtrl.clearFields();

		// 4. calculate the budget
		updateBudget();

		// 5. calculate percentages
		updatePercentages();
	};
	var ctrlDeleteItem = function(event) {
		var itemId;
		// traverse dom
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemId) {
			// inc-id
			var index = itemId.indexOf('-'); //first index of
			var type = itemId.substring(0, index);
			var id = itemId.substring(index + 1);

			console.log(id);
			// 1. delete item from data
			budgetCtrl.deleteItem(type, id);

			// 2. delete item from UI
			UICtrl.deleteListItem(itemId);

			// 3. update & calc new budget numbers
			updateBudget();

			// 4. calc and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('Start!');
			setUpEventListeners();
			UICtrl.updateBudgetUI({
				budget: 0,
				inc: 0,
				exp: 0,
				perc: -1
			});
			UICtrl.displayMonth();
		}
	};
})(budgetController, UIController);

// start our app
controller.init();

function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (Math.random() * 16) | 0,
			v = c == 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
