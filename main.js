/* * * * * * * * * *
EasyTree
(c) 2015, Alexa Little

License: MIT BSD-3
(see ./licenses/EasyTree BSD-3/ for details)

THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE U.S. GOVERNMENT OR ANY DEPARTMENTS OR EMPLOYEES THEREOF BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.)
* * * * * * * * * * */

// define a global root variable
// this allows the tree to persist
var root;

var selectedLink;
var dependentNode;

// define the palette for POS color-coding
var poscolors = ["#FF7F00", "#FFFF32", "#B2FF8C", "#32FF00", "#A5EDFF", "#19B2FF", 
    "#CCBFFF", "#654CFF", "#FF99BF", "#E51932"];

// settings variables are saved as session variables
// this way, they persist even if user navigates away from tree viewer

var standardPOS = function() {
    var poslist = {
        "1":'adj',
        "2":'adv', 
        "3":'adp', 
        "4":'noun', 
        "5":'aux', 
        "6":'verb', 
        "7":'det', 
        "8":'pron', 
        "9":'conj', 
        "10":'x'
    };
    localStorage['posarray'] = JSON.stringify(poslist);
};

// if no POS customization saved, initialize with defaults
if (!localStorage['posarray']) {
    standardPOS();
};

if (!localStorage['counts']) {
    localStorage['counts'] = JSON.stringify({});
};

var settings = [['customwidth', 0.25], ['customdepth', 100], ['nodesize', 10], ['xsep', 5], ['ysep', 10], ['currentFont', 'standard']];

// if custom setting not saved, initialize with default
for (var k=0; k<settings.length; k++) {
    if (!localStorage[settings[k][0]]) {
        localStorage[settings[k][0]] = settings[k][1];
    };
};

// the main display function
var main = function() {
    // in case extra toolbar windows are showing, hide them
    $('#jsontext').hide();
    $('#download').hide();
    $('#linktext').hide();
    findStorage();
    switcher();
};

var findStorage = function() {
    var check = "check";
    try {
        localStorage.setItem(check, check);
        localStorage.removeItem(check);
        return true;
    } catch (e) {
        alert('Your browser will not support EasyTree! (See FAQ or README for details.)');
    }
};

var switcher = function() {
    // if we have a tree, display it
    if (sessionStorage.treeData) {
        haveTree();
    } else {
        // otherwise, check for a new tree
        $('#upload').show();
        $('#upload2').show();
    };
};

// wait to call "main" until the page has finished loading
$(document).ready(main);

// if we have a tree, display it
var haveTree = function () {
    $('#upload').hide();
    $('#upload2').hide();
    var treeData = sessionStorage.treeData;
    treeData = JSON.parse(treeData);
    // if we have the original sentence (and possibly a translation), display those
    if (sessionStorage.original) {
        showSents(sessionStorage.original);
        if (sessionStorage.translation) {
            showSents(sessionStorage.translation);
        };
    }
    else {
        // no original / translation to display!
    };
    // call the function to generate the tree graphics
    getTree(treeData);
};

var setJSONtreeData = function() {
        // get the data
    var input = $('#treedata').val();
    // check for original and translated sentences
    var sents = input.match(/##(o|t): .*/g);
    if (sents) {
        // set both, if applicable
        if (sents.length === 2) {
            sessionStorage.setItem("original", sents[0]);
            showSents(sessionStorage.original);
            sessionStorage.setItem("translation", sents[1]);
            showSents(sessionStorage.translation);
        }
        // else show original, if available
        else {
            sessionStorage.setItem("original", sents[0]);
            showSents(sessionStorage.original);
        }
    };
    // remove sentences from tree data to isolate the JSON
    var treeData = input.replace(/##(o|t): .*/g, "");
    // hide upload window
    $('#upload').hide();
    $('#upload2').hide();
    try {
        // try to store tree data and display tree
        sessionStorage.setItem("treeData", treeData);
        treeData = JSON.parse(treeData);
        getTree(treeData);
    } catch(e) {
        // alert user if error occurs
        alert("Sorry, something went wrong!");
    };
};

var setphrasetreeData = function() {
        var original = $("#treedata2").val();
    if (original !== "") {
        var phrase = original.split(" ");
        var treeData = new Object();
        treeData.name = "root";
        treeData.children = [];
        for (var i=0; i< (phrase.length); i++) {
            treeData.children.push({name: phrase[i]});
        };
        $('#upload').hide();
        $('#upload2').hide();
        try {
            // try to store tree data and display tree
            sessionStorage.setItem("treeData", JSON.stringify(treeData));
            sessionStorage.setItem("original", "##o: " + original);
            showSents(original);
            getTree(treeData);
        } catch(e) {
            // alert user if error occurs
            alert("Sorry, something went wrong!");
        };
    } else {
        alert("You forgot to enter a phrase!");
    };
};

// helper function
// manipulates DOM to show original sentence or translation sentence
var showSents = function (whatvar) {
    document.getElementById("sents").className = localStorage['currentFont'];
    var space = document.createElement("P");
    var text = document.createTextNode(whatvar.replace(/##(o|t): /, ""));
    space.appendChild(text);
    document.getElementById("sents").appendChild(space);
};

// future implementation for adding a new node
/* var addNode = function() {
    if (sessionStorage.treeData) {
        saveTree();
        cleanjson();
        var myNode = prompt('enter a name');
        var tempString = sessionStorage.treeData;
        var nextId = tempString.match(/,\"id\":[0-9]+/g).length + 1;
        var tempData = JSON.parse(tempString);
        tempData['children'].push({"name": myNode, "id": nextId});
        sessionStorage.setItem("treeData", JSON.stringify(tempData));
        window.location.reload();
        getTree(sessionStorage.treeData);
    } else {
        var myNode = prompt('enter a name');
        if (myNode !== null) {
            var treeData = '{"name": "root", "children": [{"name":"' + myNode + '"}]}';
            sessionStorage.setItem("treeData", treeData);
            haveTree();
        };
    }
}; */

// reset the tree data (to an empty string) and reload the window
var clearTree = function() {
    sessionStorage.removeItem("treeData");
    window.location.reload();
};

// display the POS color-coding legend
var showKey = function() {
    // iterates through POS object and returns the labels
    for (var i=2; i<12; i++) {
        var id = i * 10;
        var text = document.getElementById(id);
        // adds labels to HTML
        text.innerHTML = JSON.parse(localStorage['posarray'])[i-1];
    }
    $('#pos').toggle();
};

// displays a customization window
var displayCustomizer = function() {
    $('#pos').hide();
    // as before, iterates through POS object and returns the labels
    for (var i=1; i<11; i++) {
        var text = document.getElementById(i);
        // labels displayed as textarea default values
        text.value = JSON.parse(localStorage['posarray'])[i];
    }
    $('#custompos').show();
};

// updates the POS values based on user customization
var getCustomPos = function() {
    // retrieve the POS string and convert to an object structure
    var tempdict = JSON.parse(localStorage['posarray']);
    for (var i=1; i<11; i++) {
        // update object with user inputs
        var newpos = document.getElementById(i);
        tempdict[i] = newpos.value;
    };
    $('#custompos').hide();
    // convert back to string and store
    localStorage['posarray'] = JSON.stringify(tempdict);
    // reload the tree
    if (sessionStorage.treeData) {
        update(root);
    };
    // show the updated POS legend
    showKey();
};

// reset the pos values
var resetPOS = function() {
    standardPOS();
    $('#pos').toggle();
    showKey();
    if (sessionStorage.treeData) {
        update(root);
    };
};

// update the buttons for high-frequency labels
var updateLabels = function() {
    var stop;
    if (localStorage['labels']) {
        var labels = sortLabels();
        // limit total labels to 10
        stop = labels.length;
        // display up to 10 labels on buttons
        for (var i=0; i<stop; i++) {
            var id = "button" + i.toString();
            document.getElementById(id).value = labels[i];
            document.getElementById(id).style.display = "inline-block";
        };
    } else {
        stop = 0;
    };
    // if extra buttons, hide them
    for (var j=9; j>=stop; j--) {
        var id = "button" + j.toString();
        document.getElementById(id).style.display = "none";
    };
};

// find the most frequent labels
var sortLabels = function() {
    var labels = localStorage['labels'].split(',');
    var counts = JSON.parse(localStorage['counts']);
    labels = labels.sort(function(a, b) {
        return counts[b] - counts[a];
    });
    if (labels.length > 10) {
        labels = labels.slice(0,9);
    };
    return labels;
};

// close the label menu and update the tree
var finishLabel = function() {
    $('#labels').hide();
    document.getElementById('textLabel').value = "";
    d3.select(selectedLink).style("stroke", "#545454");
    update(root);
};

// handle a user-customized label
var newLabel = function() {
    // get the user's label
    var labelText = $('#textLabel').val();
    // update the tree data
    dependentNode.link = labelText;
    // get list of top labels from storage; initialize if not stored
    var labels;
    if (!localStorage['labels']) {
        labels = [];
    } else {
        labels = localStorage['labels'].split(',');
    };
    // get the label counts
    var counts = JSON.parse(localStorage['counts']);
    // if this is a new label, add it to the list
    if (!counts[labelText]) {
        counts[labelText] = 1;
        labels.push(labelText);
    } else {
        // otherwise just up its count
        counts[labelText] += 1;
    };
    localStorage['counts'] = JSON.stringify(counts);
    localStorage['labels'] = labels.toString();
    finishLabel();
};

// handle a button press for high-frequency labels
var freqLabel = function(labelText) {
    dependentNode.link = labelText;
    var counts = JSON.parse(localStorage['counts']);
    counts[labelText] += 1;
    localStorage['counts'] = JSON.stringify(counts);
    finishLabel();
};

// reset the label frequencies
var resetLabels = function() {
    localStorage.removeItem('labels');
    localStorage['counts'] = JSON.stringify({});
    finishLabel();
    updateLabels();
};

// helper function
// walks through the tree data and recreates the JSON structure
var saveTree = function() {
    try {
        var json = JSON.stringify(root, function(k, v) {
            if (k === 'parent') {
                return 'PARENT';
            }
            return v;
        });
    sessionStorage.treeData = json;
    }
    catch(err) {
        alert("Sorry, something went wrong!");
    }
};

// regex to remove d3 'junk' variables from tree data
var cleanjson = function() {
    var json = sessionStorage.treeData;
    json = json.replace(/\"parent\":\"PARENT\",/g, "");
    json = json.replace(/\"depth\":[0-9]*,/g, "");
    json = json.replace(/\"(x|x0|y|y0)\":([0-9]+\.[0-9]+|[0-9]+),/g, "");
    json = json.replace(/,\"(x|x0|y|y0)":[0-9]+/g, "");
    sessionStorage.treeData = json;
};

// output tree as copyable text
var textTree = function() {
    saveTree();
    var output;
    if (sessionStorage.treeData !== "undefined") {
        cleanjson();
        if (sessionStorage.original && sessionStorage.translation) {
            output = sessionStorage.original + "\n" 
                + sessionStorage.translation + "\n" 
                + sessionStorage.treeData;
        } else if (sessionStorage.original) {
            output = sessionStorage.original + "\n" + sessionStorage.treeData;
        } else {
            output = sessionStorage.treeData;
        }
    }
    else {
        output = "Tree not found.";
    }
    document.getElementById("jsonfield").innerHTML = output;
};

// output tree as file download
var downloadTree = function() {
    saveTree();
    var output;
    if (sessionStorage.treeData !== "undefined") {
        cleanjson();
        if (sessionStorage.original && sessionStorage.translation) {
            output = sessionStorage.original + "\n" 
                + sessionStorage.translation + "\n" 
                + sessionStorage.treeData;
        } else if (sessionStorage.original) {
            output = sessionStorage.original + "\n" + sessionStorage.treeData;
        } else {
            output = sessionStorage.treeData;
        }
        // uses Blob and FileSaver libraries
        var blob = new Blob([output], {type: "text/plain;charset=utf-8"});
        var filename = $("#filename").val();
        saveAs(blob, filename);
    }
    else {
        alert("Tree not found.");
    }
    $("#download").hide();
};

// SETTINGS
// helper functions called by buttons in "SETTINGS" menu

// increases node radius by 5
var biggerNode = function() {
    localStorage['nodesize'] = parseFloat(localStorage['nodesize']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases node radius by 5
var smallerNode = function() {
	if(parseFloat(localStorage['nodesize'])>5) {
    	localStorage['nodesize'] = parseFloat(localStorage['nodesize']) - 5;
	    if (sessionStorage.treeData) {
    	    update(root);
	    };
	}
};

// increases branch separation by 0.5
var widerTree = function() {
    localStorage['customwidth'] = parseFloat(localStorage['customwidth']) + 0.5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases branch separation by 0.5
var narrowTree = function() {
    localStorage['customwidth'] = parseFloat(localStorage['customwidth']) - 0.5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases height of each layer by 25
var tallerTree = function() {
    localStorage['customdepth'] = parseFloat(localStorage['customdepth']) + 25;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases height of each layer by 25
var shorterTree = function() {
    localStorage['customdepth'] = parseFloat(localStorage['customdepth']) - 25;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases text distance from node
// (horiziontally, +5 each time)
var biggerX = function() {
    localStorage['xsep'] = parseFloat(localStorage['xsep']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases text distance from node
// (vertically, -5 each time)
var smallerX = function() {
    localStorage['xsep'] = parseFloat(localStorage['xsep']) - 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// increases text distance from node
// (vertically, +5 each time)
var biggerY = function() {
    localStorage['ysep'] = parseFloat(localStorage['ysep']) + 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

// decreases text distance from node
// (vertically, -5 each time)
var smallerY = function() {
    localStorage['ysep'] = parseFloat(localStorage['ysep']) - 5;
    if (sessionStorage.treeData) {
        update(root);
    };
};

var customFont = function() {
    localStorage['currentFont'] = $("#fonts").val();
    document.getElementById("sents").className = localStorage['currentFont'];
    if (sessionStorage.treeData) {
        update(root);
    };
};

// return all settings to defaults
var reset = function() {
    for (var k=0; k<settings.length; k++) {
        localStorage[settings[k][0]] = settings[k][1];
    };
    document.getElementById('sents').className = localStorage['currentFont'];
    // if tree data, update the tree!
    if (sessionStorage.treeData) {
        update(root);
    };
};

// END SETTINGS

var massReset = function() {
    var c = confirm("Are you sure? This will reset ALL settings!");
    if (c === true) {
        saveTree();
        localStorage.clear();
        window.location.reload();
        reset();
        haveTree();
    } else {
        return;
    };
};

// ************** Generate the tree diagram  *****************
var getTree = function(treeData) {
    // set height and width equal to HTML doc properties
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();

    // initialize misc. variables
    var i = 0;
    var duration = 750;
    var selectedNode = null;
    var draggingNode = null;

    // names the tree layout "tree" and gives it a size value
    // use "width, height" for horizontal tree
    // use "height, width" for vertical tree
    var tree = d3.layout.tree()
     .size([viewerWidth, viewerHeight]);

    // declares the function for drawing the links
    // use "d.x, d.y" for horizontal tree
    // use "d.y, d.x" for vertical tree
    var diagonal = d3.svg.diagonal()
     .projection(function(d) { return [d.x, d.y]; });

    // Define the zoom function for the zoomable tree
    function zoom() {
        fullTree.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.5, 2]).on("zoom", zoom);

    // appends svg to html area tagged "body"
    var baseSvg = d3.select("body").append("svg")
     .attr("width", viewerWidth)
     .attr("height", viewerHeight)
     .attr("class", "overlay")
     .call(zoomListener).on("dblclick.zoom", null);


    // creates a group for holding the whole tree, which allows "zoom" to function
	var fullTree = baseSvg.append("g").attr("class", "fulltree");
	// create a group for holding the links -- this group will be drawn first
    var lgroup = fullTree.append("g").attr("class", "links");
	// create a group for holding the nods -- this group will be drawn second
    var ngroup = fullTree.append("g").attr("class", "nodes");
	// create a group for holding the temporary link(s) -- this group will be drawn last
	fullTree.append("g").attr("class", "templinks");

    // define the root and its initial location
    root = treeData;
    root.x0 = viewerWidth / 2;
    root.y0 = parseFloat(localStorage['nodesize'])+40;
    // helper functions to collapse and expand nodes
    
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // collapse and expand node's children  on click
    function click(d) {
        if (d3.event.defaultPrevented) return;
        d = toggleChildren(d);
        update(d);
    };

    // display "drop zone" on mouseover
    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };

    // remove "drop zone" on mouseout
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // show temporary paths between dragged node and drop zone
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            data = [{
                    source: {
                        x: selectedNode.x0,
                        y: selectedNode.y0
                    },
                    target: {
                        x: draggingNode.x0,
                        y: draggingNode.y0
                    }
            }];
        }
        var link = fullTree.select(".templinks").selectAll(".templink").data(data);

        link.enter().append("path")
                .attr("class", "templink")
                .attr("d", d3.svg.diagonal())
                .attr("pointer-events", "none");

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // prepare node for dragging by removing children and paths
    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        fullTree.select(".nodes").selectAll(".node").sort(function(a, b) { // select the parent and sort the path's
            if (a.id !== draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            linktexts = fullTree.select(".links").selectAll(".pathGroup")
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = fullTree.select(".nodes").selectAll(".node")
                .data(nodes, function(d) {
                    return d.id;
                }).filter(function(d, i) {
                    if (d.id === draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        };
                // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
	    fullTree.select(".links").selectAll(".pathGroup").filter(function(d, i) {
            if (d.target.id === draggingNode.id) {
                return true;
            }
            return false;
        }).remove();
        dragStarted = null;
    };

    // Define the drag listeners for drag/drop behaviour of nodes.
    var dragListener = d3.behavior.drag()
        .on("dragstart", function(d) {
            // root cannot be dragged
            if (d === root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function(d) {
            if (d === root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            d.y0 += d3.event.dy;
            d.x0 += d3.event.dx;
            var node = d3.select(this);
            node.attr("transform", "translate(" + d.x0 + "," + d.y0 + ")");
            updateTempConnector();
        }).on("dragend", function(d) {
            if (d === root) {
                return;
            }
            domNode = this;
            if (selectedNode) {
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(selectedNode);
                // now remove the element from the parent, and insert it into the new elements children
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                // Make sure it works whether children are expanded or not!
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                        // sort nodes to maintain original word order!
                        selectedNode.children = selectedNode.children.sort(function(a, b) {
                            return b.id - a.id;
                        });
                    } else {
                        // sort nodes to maintain original word order!
                        selectedNode._children.push(draggingNode);
                        selectedNode._children = selectedNode.children.sort(function(a, b) {
                            return a.id - b.id;
                        });
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                endDrag();
            } else {
                endDrag();
            }
        });

    // when node is dropped, update tree
    function endDrag() {
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
		if(selectedNode != null) {
			// animations could go to/from the drop target
			update(selectedNode);
		}
        else if (draggingNode !== null) {
			// the dragged node is moving back to where it started, let the animations come from the dragged node
            update(draggingNode);
        }
        draggingNode = null;
        selectedNode = null;
    };

    // main update function
    update = function(animSource) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

        // Sets the x and y coordinates of the nodes
        nodes.forEach(function(d) {d.y = d.depth * parseFloat(localStorage['customdepth']);
								   d.x = d.x * parseFloat(localStorage['customwidth']); 
		});
		// Revise node coordinates to prevent shifting of the root node
		nodes.forEach(function(d) {d.y = d.y+(root.y0-root.y);
							       d.x = d.x+(root.x0-root.x);});

        // Declare the nodes
        var node = fullTree.select(".nodes").selectAll(".node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

	    // Declare the paths
        var link = fullTree.select(".links").selectAll(".pathGroup")
            .data(links, function(d) {
                return d.target.id;
        });

        // create a group to hold path graphics and path labels
        var linkEnter = link.enter().append("g").attr("class", "pathGroup");
        
        // add path graphics
        linkEnter.append("path")
            .attr("d", function(d) {
                var o = {
                    x: animSource.x0,
                    y: animSource.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
        }).on("click", function (d) {
            // label on click
            // suppressed for direct children of root
            if (d.source === root) {
                return;
            }
            else {
                updateLabels();
                $('#labels').show();
                d3.select(this).style("stroke", "red");
                selectedLink = this;
                dependentNode = d.target;
                return;
            };
        });
        
        // add labels
        linkEnter.append("text")
                .attr("class", "linktext " + localStorage.currentFont)
				// "fill" is for inside the class
                .attr("fill", "#000")
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d.target.link;
        });

        // animation -- placeholder
        var linkUpdate = link.transition()
                .duration(duration);
        
        // format paths
        linkUpdate.select("path")
                .attr("d", diagonal)
                .style("stroke-width", "3px")
                .style("stroke", "#545454")
                .style("fill", "none")
                .style("cursor", "pointer");

        // format text
        linkUpdate.select("text")
            .attr("class", "linktext " + localStorage.currentFont)
            .text(function(d) {
                return d.target.link;
            })
            .style("fill-opacity", 1)
            .style("stroke", "#000")
            .style("stroke-width", "1px");
    
        // animate text entrance
        linkUpdate.select("text")
                .attr("transform", function(d) {
                    return "translate(" + ((d.target.x + d.source.x) / 2) + "," + ((d.target.y + d.source.y) / 2) + ")";});

        // remove unnecessary paths
        var linkExit = link.exit().remove();

        // set exiting labels to transparent
        linkExit.select("text")
            .style("fill-opacity", 0);

        // Enter the nodes.
        // Use "d.x +...+ d.y" for horizontal trees
        // Use "d.y +...+ d.x" for vertical trees
       var nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
			// source.{x0,y0} is where the nodes originate from
            .attr("transform", function(d) {return "translate(" + animSource.x0 + "," + animSource.y0 + ")"; })
			.on("click", click);

        // add labels to nodes
        nodeEnter.append("text")
            .attr("class", localStorage.currentFont)
			// these (x,y) coordinates seem to be overidden below
            .attr("y", function(d) { 
                return d.children || d._children ? 0 : parseFloat(localStorage['ysep']); })
            .attr("x", function(d) {
                return d.children || d._children ? parseFloat(localStorage['xsep'])+parseFloat(localStorage['nodesize']) : -parseFloat(localStorage['nodesize']); })
            .attr("dy", ".35em")
			// node label text alignment (left, right, middle)
			//.attr("text-anchor", "middle")
            .attr("text-anchor", "left")
			// Doing this only here is problematic because it won't get updated when children are added/removed
			//.attr("text-anchor", function(d) { return d.children || d._children ? "left" : "middle"; })
            .text(function(d) { return d.name; })
            .attr('pointer-events', 'mouseover')
            .style('cursor', 'default')
            .style("fill-opacity", 0)
            .on("mouseover", function(d) {
                // show translation on mouseover
                d3.select(this).text(function (d) {return d.def ? d.def : d.name;});
                })
            .on("mouseout", function(d) {
                // return to original text on mouseout
                d3.select(this).text(function(d) {return d.name;});
                });

        // add circles to nodes
        nodeEnter.append("circle")
            .attr("class", "nodeCircle")
            .attr("r", 0)
            .style("fill", function(d) {
                return d._children ? "#000" : "#fff";
            });

        // add "drop zone" circle to node; set as transparent
        nodeEnter.append("circle")
            .attr("class", "ghostCircle")
            .attr("r", 30)
            .attr("opacity", 0.2)
            .style("fill", "red")
            .style("stroke-width", 0)
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });

		

        // node entrance animation
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        // fade in labels
        nodeUpdate.select("text")
            .attr("class", localStorage['currentFont'])
            .attr("y", function(d) { 
                return d.children || d._children ? 0 : parseFloat(localStorage['ysep'])+parseFloat(localStorage['nodesize']); })
            .attr("x", function(d) {
                return d.children || d._children ? parseFloat(localStorage['xsep'])+parseFloat(localStorage['nodesize']) : -parseFloat(localStorage['nodesize']); })
            .style("fill-opacity", 1);
    
        // node circles "grow" in (animation)
        nodeUpdate.select("circle.nodeCircle")
            .attr("r", parseFloat(localStorage['nodesize']))
            .style("fill", function(d) {
            return d._children ? "#000" : "#fff";
            })
            .style("stroke", function(d) {
                var foundcolor = false;
                for (var i=1; i<11; i++) {
                    // color code according to POS labels
                    if (d.pos === JSON.parse(localStorage['posarray'])[i]) {
                        foundcolor = true;
                        return poscolors[i-1];
                    };
                }
                if (foundcolor === false) {
                    // return default black if color-coding n/a
                    return "black";
                };
            });

        // exiting nodes animation
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + animSource.x + "," + animSource.y + ")";
            }).remove();

        // node circles "shrink" out (animation)
        nodeExit.select("circle")
            .attr("r", 0);

        // labels fade out
        nodeExit.select("text")
            .style("fill-opacity", 0);

        // store node positions
        nodes.forEach(function(d) {
           d.x0 = d.x,
           d.y0 = d.y;
        });
    };

    // lay out the initial tree
    update(root);
};
