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

//console.log(JSON.stringify(occurrences))
console.log(occurrences)

prettyprint.graphOutcomes(occurrences);
