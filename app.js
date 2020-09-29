const express = require('express');
var app = express();
//const port = 9000;
const port = process.env.PORT || 9000;
const bodyParser = require('body-parser');
// web browser driver
const puppeteer = require('puppeteer');
const baseUrl = 'https://www.iec.co.il/businessclients/pages/smp.aspx?Date=';

app.use(bodyParser.json()); // parse application/json

app.get('/', function (request, response) {
	response.status(200).json({ test: 'OK' });
});

app.get('/:date/', function (request, response) {
	let date = request.params.date;
	transformedDate = date.replace(/-/g, '/');
	let url = baseUrl + transformedDate;

	let browserReference;
	puppeteer
		.launch()
		.then(function (browser) {
			browserReference = browser;
			return browser.newPage();
		})
		.then(function (page) {
			return page.goto(url).then(function () {
				return page.content();
			});
		})
		.then(parseHTML2JSON)
		.then((data) => {
			response.status(200).json(data);
		})
		.then(() =>
			browserReference
				.close()
				.then(() => console.log('Puppeteer browser closed!'))
				.catch((err) => {
					console.log('Can not close puppeteer browser!', err);
				})
		)
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
