var numbers,
	numbersCount = 20;	

var svgContainer,
	axisLength = 450,
	maxAxisValue = 10,
	startPoint = {
		x: 50,
		y: 500
	},
	scale = 1;

var colors = [
	"red", 
 	"brown",
 	"blue", 
 	"purple", 
 	"yellow", 
 	"orange", 
 	"gray", 
 	"green", 
 	"crimson", 
 	"lavender"	
 	];

function onLoad (){

	svgContainer = d3.select("div")
	.append("svg")                   
	.attr("width", 500)
	.attr("height", 550);

	scale = getScale();
	drawCoordinateAxes(axisLength, {x0: 50, y0: 500}, scale);		
	drawPoints(trainingPoints, colors[0], 4);

	console.log(separatingFunction);

	numbers = generateNumbers(numbersCount, {min: 0, max: maxAxisValue});
	console.log(numbers);
}

////////////////////////////////////////////
////////////GENERAL FUNCTIONALITY///////////
////////////////////////////////////////////

function generateNumbers(count, range) {
	var numbers = []
	for(var i = 0; i < count; i++) {		
		numbers.push(randomInRange(range.min, range.max));		
	}
	return numbers;
}

function formatFloat(src,digits) {
	var powered, tmp, result	
	var powered = Math.pow(10,digits);	
	var tmp = src*powered;		
	tmp = Math.round(tmp);
	var result = tmp/powered;
	return result;
}

function randomInRange(min, max) {
  	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pointsAreEqual(point1, point2) {
	var result = true;
	for(var i = 0; i < 2; i++){
		if(point1[i] !== point2[i]) {
			result = false;
		}
	}

	return result;
}

function pointSort(points) {
	return points.sort(pointCompare);
}

function pointCompare(a, b) {
	return a.y - b.y;
}

function getScale(){
	return axisLength/maxAxisValue;
}

///////////////////////////////////
////////////DRAWING////////////////
///////////////////////////////////

function drawCoordinateAxes(axisLength, startPoint, yAxisScale) {
	var xScale = d3.scaleLinear().domain([0, axisLength/scale]).range([0, axisLength]);
    var yScale = d3.scaleLinear().domain([0, axisLength/scale]).range([axisLength, 0]);
 	var xAxis = d3.axisBottom().scale(xScale);
 	var yAxis = d3.axisLeft().scale(yScale);

	
	var yAxisGroup = svgContainer
	.append("g")								 
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',50)')
 	.call(yAxis);

	var xAxisGroup = svgContainer
	.append("g")
	.attr('class', 'axis')
	.attr('transform', 'translate(' + startPoint.x0 + ',' + startPoint.y0 + ')')
	.call(xAxis);
}

function drawPoints(points, color, width, connect) {
	if(!connect) {
		points.forEach((point) =>  {	
			//if (startPoint.y - (point.y * scale) < startPoint.y){
				drawPoint(point, color, width);				
			//}			
		});
	} else {
		for(var i = 1; i < points.length; i++) {
			drawPoint(points[i], color, width);
			drawLine(pints[i-1], functionResults[i], color, width);
		}
	}		
}

function drawPoint(point, color, size) {
	svgContainer.append("circle")
	.attr("cx", point.x * (scale/2) + startPoint.x + axisLength/2 + 20)
	.attr("cy", startPoint.y - (point.y * (scale/2)) - axisLength/2 ) 
	.attr("r", size || 1)
	.style("fill", color);
}

function drawLine(point1, point2, color, width) {	
	svgContainer.append("line")
    .attr("x1", point1.x * (scale/2) + startPoint.x + axisLength/2 + 20)
    .attr("y1", startPoint.y - (point1.y * (scale/2)) - axisLength/2)
    .attr("x2", point2.x * (scale/2) + startPoint.x + axisLength/2 + 20)
    .attr("y2", startPoint.y - (point2.y * (scale/2)) - axisLength/2)
    .attr("stroke-width", width)
    .attr("stroke", color);
}