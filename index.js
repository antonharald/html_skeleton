// HTML skeleton
// A command-line tool, that removes attribute values and text content from
// the html file which is given as the first argument. The result is printed
// to stdout.


var q = require("q"); // a promis lib
var _ = require("underscore"); // functional
var jsdom = require("jsdom"); // dom parsing
var fs = require("fs"); // file system

// prepare functions for promise use.
var readFile = q.denodeify(fs.readFile);
var parseHTML = q.denodeify(jsdom.env);

// argument handling
var args = _.rest(process.argv, 2);
var path = _.first(args);

// only childless elements get here
var removeTextContent = (element) => {
	element.textContent = "";
}

// attributes are kept, values removed
var removeAttributeValues = (element) => {
	_.each(element.attributes, (attribute) => {
		element.setAttribute(attribute.name, "")
	})
}

// recursively iterate the dom-tree
var removeContents = (element) => {	
	element.hasAttributes() && removeAttributeValues(element);
	element.children.length === 0 && removeTextContent(element);
	_.forEach(element.children, removeContents);
}

var output = (data) => { console.log(data) }

// async file-reading and dom-parsing, finally output
var main = () => {
	readFile(path)
	.then((data) => { return parseHTML(data.toString()) })
	.then((window) => {
		var documentElement = window.document.documentElement;
		removeContents(documentElement);
		output(documentElement.outerHTML); })	
	.catch((err) => { console.log("error!") })
	.done();
}

// go!
main();
