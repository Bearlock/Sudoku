var time;

function showGrid() {
	createGrid(9,9, "table");
}

// Gets userinput cells and makes inside blank
function clearPuzzle() {
	var cells = document.getElementsByClassName('userinput');
	for (var i = 0; i < cells.length; i++) {
		cells[i].value = " ";
	}
}

// Big function, creates grid, sets best time, sets event listeners
// on difficulty and reset buttons, makes grid cells clickable, etc
// Puzzles are randomly selected after a difficult is set
// There are three puzzles for each difficulty and each are separate
// JSON files. These are loaded up by XMLHttpRequests.
function createGrid(rows, columns, table) {
	if (localStorage.getItem('bestTime'))
	{   retrieved = localStorage.getItem('bestTime');
		console.log(retrieved);
		document.getElementById('message').innerHTML = "Best Time: " + retrieved;
	}
	var t = document.createElement("table");
	t.id = "sudokugrid";
		for(var i = 0; i < rows; i++) {
			var r = t.insertRow(i);
			if ((i + 1) % 3 == 0 && (i + 1) != rows) {
				r.className += " sudokurow bottom";
			}
			else {
				r.className += " sudokurow"
			}

			for(var j = 0; j < columns; j++) { 
				c = r.insertCell(j);
				if ((j + 1) % 3 == 0 && (j + 1) != columns) 
					c.className +=" right sudokucell";
				else
					c.className +=" sudokucell";
			}
		}

	document.getElementById("table").appendChild(t);
	var cells = document.getElementsByTagName("td");
	var title = document.getElementById("gameName");
	
	document.getElementById("reset").onclick = function() {
		clearPuzzle();
	}


	document.getElementById("easy").onclick = function() {
		
		clearClock();
		
		var localRequest = new XMLHttpRequest();
		var eVal 		 = Math.floor((Math.random() * 3) + 1);
		var ePuzzle 	 = "easy" + eVal + ".json";
		
		console.log(ePuzzle);

		localRequest.open("GET", ePuzzle, false);
		localRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		localRequest.send();
		
		var response = JSON.parse(localRequest.responseText);

		for (var i = 0; i < 81; i++)
		{
			cells[i].innerHTML = response[i];
			if(cells[i].innerHTML == " ")
			{
				cells[i].innerHTML = '<input class="userinput" type="text">'
			}
		}
		
		time = setInterval(function(){startClock()},1000);

		var input = document.getElementsByClassName("userinput");
		
		for(var i = 0; i < input.length; i++){
			input[i].addEventListener('keyup', inputEvent, false);
			input[i].addEventListener('keydown', removeInput, false); 
		}

	}

	document.getElementById("medium").onclick = function() {
		
		clearClock();
		
		var localRequest = new XMLHttpRequest();
		var mVal 		 = Math.floor((Math.random() * 3) + 1);
		var mPuzzle 	 = "medium" + mVal + ".json";
		var timer 		 = document.getElementById("timer");
		
		console.log(mPuzzle);

		localRequest.open("GET", mPuzzle, false);
		localRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		localRequest.send();
		
		var response = JSON.parse(localRequest.responseText);

		for (var i = 0; i < 81; i++)
		{
			cells[i].innerHTML = response[i];
			if(cells[i].innerHTML == " ")
			{
				cells[i].innerHTML = '<input class="userinput" type="text">'
			}
		}

		time = setInterval(function(){startClock()},1000);

		var input = document.getElementsByClassName("userinput");
		
		for(var i = 0; i < input.length; i++){
			input[i].addEventListener('keyup', inputEvent, false);
			input[i].addEventListener('keydown', removeInput, false); 
		}
	}
	
	document.getElementById("hard").onclick = function() {
		
		clearClock();
		
		var localRequest = new XMLHttpRequest();
		var hVal 		 = Math.floor((Math.random() * 3) + 1);
		var hPuzzle 	 = "hard" + hVal + ".json";
		
		console.log(hPuzzle);
	
		localRequest.open("GET", hPuzzle, false);
		localRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		localRequest.send();
		
		var response = JSON.parse(localRequest.responseText);
	
		for (var i = 0; i < 81; i++)
		{
			cells[i].innerHTML = response[i];
			if(cells[i].innerHTML == " ")
			{
				cells[i].innerHTML = '<input class="userinput" type="text">'
			}
		}
		
		time = setInterval(function(){startClock()},1000);
		
		var input = document.getElementsByClassName("userinput");
		
		for(var i = 0; i < input.length; i++){
			input[i].addEventListener('keyup', inputEvent, false);
			input[i].addEventListener('keydown', removeInput, false); 
		}
	
	}

}

// The events and state changes for the grid
function inputEvent() {
	
	var cells  = document.getElementsByTagName("td")
	var number = this.value;
	var col    = this.parentNode.cellIndex;
	var row    = this.parentNode.parentNode.rowIndex;
	var cell   = sudokugrid.rows[row].cells[col];
	var bool   = findConflicts(number, row, col);
	
	if(!bool) {
		cell.firstChild.className = "userinput";
	}
	else {
		cell.firstChild.className = "userinput conflict";
	}
	
	checkForFixedConflicts(row, col);
		
	if(filled()){
		if(noConflicts()) {
			gameWon();
		}
	}
}

// Allows user to erase input
function removeInput() {
	this.value="";
}

// Finds conflicts for row, column, and sub-square
function findConflicts(number, row, col) {
	
	var conflict = false;
	
	for (var i=0; i < 9; i++) { 
		if(i != col) {
			if(sudokugrid.rows[row].cells[i].innerHTML == number) {
				conflict = true;
			}
			else if(sudokugrid.rows[row].cells[i].firstChild.value === number) {
				conflict = true;
			}
		}
	}
	for (var i = 0; i < 9; i++) { 
		if(i!=row) {
			if(sudokugrid.rows[i].cells[col].innerHTML == number) {
				conflict = true;
			}
			
			else if(sudokugrid.rows[i].cells[col].firstChild.value === number) {
				conflict = true;
			}
		}
	}
	
	// The block for finding conflicts in the sub-square
	var rowSec 		   = Math.floor(row / 3) + 1;
	var columnSec 	   = Math.floor(col / 3) + 1;
	var rowSecStart    = rowSec * 3 - 3;
	var columnSecStart = columnSec * 3 - 3;

	for (var i = rowSecStart; i < rowSecStart + 3; i++){
		for (var j = columnSecStart; j < columnSecStart + 3; j++){
			if(i != row || j != col){
				if(sudokugrid.rows[i].cells[j].innerHTML == number) {
					conflict = true;
				}
				else if(sudokugrid.rows[i].cells[j].firstChild.value === number) {
					conflict = true;
				}
			}
		}
	}
	
	if(number < 1 || number > 9) {
		conflict = true;
	}
	
	if(isNaN(number)) {
		conflict = true;
	}
	
	return conflict;
}

function noConflicts() {
	
	var conflicts = document.getElementsByClassName('conflict');
	
	if (conflicts.length == 0) {
		return true;
	}
	
	else {
		return false;
	}
}

function checkForFixedConflicts(row, col) {
	
	var conflicts = document.getElementsByClassName('userinput');
	for(var i = 0;i < conflicts.length; i++) {
		
		var col    = conflicts[i].parentNode.cellIndex;
		var row    = conflicts[i].parentNode.parentNode.rowIndex;
		var number = conflicts[i].value;
		var bool   = findConflicts(number, row, col)

		if(bool) {
			conflicts[i].className = "userinput conflict";
		}
		
		else {
			conflicts[i].className = "userinput";
		}
	}
}

function filled() {
	
	var filled = true; 
	var cells = document.getElementsByClassName("userinput");
	
	for(var i = 0; i < cells.length; i++) {
		if(cells[i].value == " ") {
			filled = false;
		}
	}
	return filled;
}

var f = 0;

// Timer function
function startClock() {
	f++;
    var sec  = f % 10;
    var tSec = Math.floor(f/10) % 6;
    var min  = Math.floor(f / 60) % 10;
    var tMin = Math.floor((f / 60) / 10) % 6;
    var hour = Math.floor(f / 3600) % 24;
    document.getElementById("timer").innerHTML = hour + ":" + tMin + "" + min + ":" + tSec + "" + sec;
}

// Clears clock and interval whenever a new puzzle is picked
function clearClock() {
	clearInterval(time);
	f = 0;
	document.getElementById("timer").innerHTML = 0 + ":" + 0 + "" + 0 + ":" + 0 + "" + 0;
}

// Stops timer, gets time, stores it in local storage
function gameWon() {
	var bestTime = document.getElementById("timer").innerHTML;
	localStorage.setItem('bestTime', bestTime);
	var retrieved = localStorage.getItem('bestTime');
	document.getElementById('message').innerHTML = "New Best Time: " + retrieved + "!";
	console.log('Retrieved: ' + retrieved);
	clearInterval(time);
	document.getElementById("timer").innerHTML = bestTime;
}