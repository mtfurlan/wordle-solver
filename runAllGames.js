#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');
const runGame = require("./runGame");
const prettyprint = require("./prettyprint");

const answersFile = "answers.json"

const answers = JSON.parse(fs.readFileSync(answersFile));

const results = answers.map((answer) => runGame.runGame(answer));

const occurrences = results.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
}, {});

console.log(occurrences)

console.log(JSON.stringify(occurrences))
prettyprint.graphOutcomes(occurrences);

let mean = 0;
Object.keys(occurrences).forEach((bucket) => {
    mean += parseInt(bucket) * occurrences[bucket];
});
mean /= answers.length;
console.log("mean guesses:", mean);
