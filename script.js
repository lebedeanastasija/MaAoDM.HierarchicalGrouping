var distancesMatrix = [],

	objectsCount = 6,
	distancesCount,
	distancesInfo = [],
	distancesValues;

var svgContainer;
	
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
	distancesMatrix = initializeDistancesMatrix(objectsCount);
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

	var svg = d3.select("div").append("svg")
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

function initializeDistancesMatrix(objectsCount) {
	var matrix = [];
	for(var i = 0; i < objectsCount; i++) {
		matrix.push([]);
		console.log(matrix);
		for(var j = 0; j < objectsCount; j++) {
			if(i === j) {
				matrix[i].push(0);
			} else {
				matrix[i].push(null);
			}
		}
	}
	return matrix;
}

function initializeDistances(objectsCount) {
	var tempDistances = Array.from(distancesValues);
	for(var i = 0; i < objectsCount; i++) {
		for(var j = i; j < objectsCount; j++) {
			if(i !== j) {
				var temp = tempDistances.shift();
				console.log(i, j);
				distancesMatrix[i][j] = temp;
				distancesMatrix[j][i] = temp;
				var info = {
					value: temp,
					indexes: [i, j]
				}
				console.log(info);
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