const express = require('express');
var app = express();
//const port = 9000;
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
// web browser driver
const puppeteer = require('puppeteer');
const baseUrl = 'https://www.iec.co.il/businessclients/pages/smp.aspx?Date=';

app.use(bodyParser.json()); // parse application/json

app.get('/:date/', function (request, response) {
	let date = request.params.date;
	transformedDate = date.replace(/-/g, '/');
	let url = baseUrl + transformedDate;

	puppeteer
		.launch()
		.then(function (browser) {
			return browser.newPage();
		})
		.then(function (page) {
			return page.goto(url).then(function () {
				return page.content();
			});
		})
		.then(parseHTML2JSON)
		.then((data) => {
			console.log(data);
			response.status(200).json(data);
		})
		.catch(function (err) {
			response.status(503, 'Internal Error').send(err);
			console.log('Error:::', err);
		});
});

const parseHTML2JSON = (html) => {
	let timeExpression = new RegExp('[0-2][0-3]:[0-5][0-9]');
	let resultObject = {};
	html.split('\n').forEach((line) => {
		let lineNoSpaces = line.replace(/\s/g, '');
		let resultArray;
		if (
			lineNoSpaces.includes('<td>') &&
			timeExpression.test(lineNoSpaces)
		) {
			resultArray = [];
			lineNoSpaces.split('<td>').forEach((element) => {
				if (element) {
					resultArray.push(element.replace('</td>', ''));
				}
			});
			let newDataObject = {
				with_constraints: resultArray[1],
				no_constraints: resultArray[2],
			};
			resultObject[resultArray[0]] = newDataObject;
		}
	});
	return resultObject;
};

console.log('Listening to port', port);
app.listen(port);
