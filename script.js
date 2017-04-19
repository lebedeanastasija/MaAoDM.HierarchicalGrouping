var distancesMatrix = [[0, null, null, null, null], 
				 	   [null, 0, null, null, null],
				 	   [null, null, 0, null, null],
				 	   [null, null, null, 0, null],
				 	   [null, null, null, null, 0]],

	objectsCount = 5,
	distancesCount,
	distancesInfo = [],
	distancesValues,
	usedObjects = [],
	removeOnNextStep = [];

var svgContainer,
	axisLength = 450,
	maxAxisValue = 20,
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

	/*svgContainer = d3.select("div")
	.append("svg")                   
	.attr("width", 500)
	.attr("height", 550);

	scale = getScale();*/
	//drawCoordinateAxes(axisLength, {x0: 50, y0: 500}, scale);		

	distancesCount = getDistancesCount(objectsCount);
	distancesValues = generateNumbers(distancesCount, {min: 1, max: 20});
	for(var i = 0; i < distancesValues.length; i++) {

	}
	initializeDistances(objectsCount);
	console.log("Distances info", distancesInfo);

	var data = makeTreeData(distancesInfo, objectsCount);
	var dataMap = data.reduce(function(map, node) {
		map[node.name] = node;
			return map;
	}, {});
	var treeData = [];
	data.forEach(function(node) {
		var parent = dataMap[node.parent];
		if (parent) {
			(parent.children || (parent.children = []))
				.push(node);
		} else {
			treeData.push(node);
		}
	});
	console.log("Tree data", treeData);

   // ************** Generate the tree diagram	 *****************

	var margin = {top: 20, right: 120, bottom: 20, left: 120},
		width = 960 - margin.right - margin.left,
		height = 500 - margin.top - margin.bottom;
			
	var i = 0;

	var tree = d3.layout.tree()
		.size([height, width]);

	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	root = treeData[0];
		  
	update(root);

	function update(source) {

	  var nodes = tree.nodes(root).reverse(),
		  links = tree.links(nodes);

	  nodes.forEach(function(d) { d.y = d.depth * 180; });

	  var node = svg.selectAll("g.node")
		  .data(nodes, function(d) { return d.id || (d.id = ++i); });

	  var nodeEnter = node.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { 
			  return "translate(" + d.y + "," + d.x + ")"; });

	  nodeEnter.append("circle")
		  .attr("r", 10)
		  .style("fill", "#fff");

	  nodeEnter.append("text")
		  .attr("x", function(d) { 
			  return d.children || d._children ? -13 : 13; })
		  .attr("dy", ".35em")
		  .attr("text-anchor", function(d) { 
			  return d.children || d._children ? "end" : "start"; })
		  .text(function(d) { return d.name; })
		  .style("fill-opacity", 1);

	  var link = svg.selectAll("path.link")
		  .data(links, function(d) { return d.target.id; });

	  link.enter().insert("path", "g")
		  .attr("class", "link")
		  .attr("d", diagonal);
	}
}

function getDistancesCount(objectsCount) {
	return objectsCount * (objectsCount - 1) / 2;
}

function initializeDistances(objectsCount) {
	var tempDistances = Array.from(distancesValues);
	for(var i = 0; i < objectsCount; i++) {
		for(var j = i; j < objectsCount; j++) {
			if(i !== j) {
				var temp = tempDistances.shift();
				distancesMatrix[i][j] = temp;
				distancesMatrix[j][i] = temp;
				var info = {
					value: temp,
					indexes: [i, j]
				}
				distancesInfo.push(info);
			}
		}
	}
}

function makeTreeData(treeInfo, nodesCount) {
	var treeArray = [];
	var maxParentLength = 0;
	while(maxParentLength < nodesCount) {
		var emptyParents = treeArray.filter(item => item.parent === '');
		var minDistInfo = findMinDistInfo(treeInfo);

		console.log(minDistInfo, treeArray);

		if(emptyParents.length) {
			var nextParents = [];
			emptyParents.forEach(empty => {
				if(empty.name.indexOf(minDistInfo.indexes[0].toString()) > -1 ||
					empty.name.indexOf(minDistInfo.indexes[1].toString()) > -1 ) {
					nextParents.push(empty);
				}
			});

			if(nextParents.length) {
				if(nextParents.length === 2) {
					nextParents[0].parent = nextParents[0].name + nextParents[1].name;
					nextParents[1].parent = nextParents[0].name + nextParents[1].name;
					treeArray.push({name: nextParents[0].name + nextParents[1].name, parent: ''});
				} else {
					var index0 = nextParents[0].name.indexOf(minDistInfo.indexes[0].toString()) > -1 ? 0 : 1;
					var index1 = nextParents[0].name.indexOf(minDistInfo.indexes[1].toString()) > -1 ? 0 : 1;
					if ((index0 && !index1) || (index0 && !index1)) {
						nextParents[0].parent = nextParents[0].name + minDistInfo.indexes[1 - index0].toString();
						treeArray.push({name: minDistInfo.indexes[1 - index0].toString(), parent: nextParents[0].name + minDistInfo.indexes[1 - index0].toString()});
						treeArray.push({name: nextParents[0].name + minDistInfo.indexes[1 - index0].toString(), parent: ''});
					} else {
						console.log("bad distance");
					}				
				}
			} else {
				treeArray.push({name: `${minDistInfo.indexes[0]}`, parent: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`});
				treeArray.push({name: `${minDistInfo.indexes[1]}`, parent: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`});
				treeArray.push({name: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`, parent: ''});
			}
		} else {
			treeArray.push({name: `${minDistInfo.indexes[0]}`, parent: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`});
			treeArray.push({name: `${minDistInfo.indexes[1]}`, parent: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`});
			treeArray.push({name: `${minDistInfo.indexes[0]}${minDistInfo.indexes[1]}`, parent: ''});
		}
		treeInfo.splice(minDistInfo.index, 1);
		maxParentLength = findMaxParentLength(treeArray);
	}
	return treeArray;
}

function findMaxParentLength(treeArray) {
	var maxValue = 0;
	treeArray.forEach(item => {
		if(item.parent.length > maxValue) {
			maxValue = item.parent.length;
		}
	});
	return maxValue;
}

function findMinDistInfo(distances) {
	var minIndex = -1,
	    minDistance = 100,
	    minIndexes = [];
	distances.forEach((item, itemIndex) => {
		if(item.value < minDistance) {
			minDistance = item.value;
			minIndex = itemIndex;
			minIndexes[0] = item.indexes[0];
			minIndexes[1] = item.indexes[1];
		}
	});
	return {
		distance: minDistance, 
		index: minIndex,
		indexes: minIndexes
	}
}

////////////////////////////////////////////////////////////////////////////////

function generateMinTree() {
	while(distancesValues.length) {
		var point1 = null,
			point2 = null;

		removeOnNextStep.forEach(index => {
			distancesInfo.splice(index, 1);
			distancesValues.splice(index, 1);
		})
		if(distancesValues.length < 1) {
			return;
		}
		removeOnNextStep = [];
		var minValue = Math.min.apply(null, distancesValues);
		console.log(minValue);
		console.log("distances", distancesInfo.length);
		var tempArray = Array.from(distancesInfo);
		console.log(tempArray);
		console.log("already used", usedObjects.length);
		tempArray = Array.from(usedObjects);
		console.log(tempArray);
		var minIndex = distancesValues.indexOf(minValue);
		distancesValues.splice(minIndex, 1);


		var distanceInfo = distancesInfo.splice(minIndex, 1)[0];
		
		if(usedObjects.indexOf(distanceInfo.indexes[0]) < 0 ) {
			usedObjects.push(distanceInfo.indexes[0]);
			point1 = {x: usedObjects.length * 2, y: distanceInfo.value}
			drawPoint(point1, colors[3], 5);
		
			svgContainer.append("text")
    		.attr("x", usedObjects.length * 2 * scale + startPoint.x - 5)
    		.attr("y",startPoint.y - (distanceInfo.value * scale) - 10)
    		.attr("dy", ".35em")
    		.text("x" + distanceInfo.indexes[0]);

		} else {
			var firstIndexArray = [];
			distancesInfo.forEach( (distance, index) => {			
				if(distance.indexes[0] === distanceInfo.indexes[0] ||
				   distance.indexes[1] === distanceInfo.indexes[0] ) {
					firstIndexArray.push({distance: distance.value, index: index});
				}				
			});

			var firstMinInfo = findMinDistance(firstIndexArray);
			distancesInfo.forEach((distance, index) => {
				if(index !== firstMinInfo.index && distance.indexes.indexOf(distanceInfo[1]) < 0) {
					removeOnNextStep.push(index);
				}
			})
	
		}
		if(usedObjects.indexOf(distanceInfo.indexes[1]) < 0) {
			usedObjects.push(distanceInfo.indexes[1]);
			point2 = {x: usedObjects.length * 2, y: distanceInfo.value};
			drawPoint(point2, colors[3], 5);
			svgContainer.append("text")
    		.attr("x", usedObjects.length * 2 * scale + startPoint.x - 5)
    		.attr("y",startPoint.y - (distanceInfo.value * scale) - 10)
    		.attr("dy", ".35em")
    		.text("x" + distanceInfo.indexes[1]);

		} else {
			var secondIndexArray = [];
			distancesInfo.forEach( (distance, index) => {
				if(distance.indexes[0] === distanceInfo.indexes[1] ||
				   distance.indexes[1] === distanceInfo.indexes[1] ) {
					secondIndexArray.push({distance: distance.value, index: index});
				}
			});
			var secondMinInfo = findMinDistance(secondIndexArray);
			distancesInfo.forEach((distance, index) => {
				if(index !== secondMinInfo.index && distance.indexes.indexOf(distanceInfo[0]) < 0) {
					removeOnNextStep.push(index);
				}
			})
		}
		if(point1 && point2) {
			drawLine(point1, point2, colors[6], 4);
		}
	}		
}


////////////////////////////////////////////
////////////GENERAL FUNCTIONALITY///////////
////////////////////////////////////////////

function generateNumbers(count, range) {
	var numbers = []
	for(var i = 0; i < count; i++) {	
		var temp = randomInRange(range.min, range.max);
		while(numbers.indexOf(temp) > -1){
			temp = randomInRange(range.min, range.max);
		}
		numbers.push(temp);			
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
			drawLine(points[i-1], functionResults[i], color, width);
		}
	}		
}

function drawPoint(point, color, size) {
	svgContainer.append("circle")
	.attr("cx", point.x * (scale) + startPoint.x)
	.attr("cy", startPoint.y - (point.y * (scale))) 
	.attr("r", size || 1)
	.style("fill", color);
}

function drawLine(point1, point2, color, width) {	
	svgContainer.append("line")
    .attr("x1", point1.x * scale + startPoint.x)
    .attr("y1", startPoint.y - point1.y * scale)
    .attr("x2", point2.x * scale + startPoint.x)
    .attr("y2", startPoint.y - point2.y * scale)
    .attr("stroke-width", width)
    .attr("stroke", color);
}