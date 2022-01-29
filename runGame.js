#!/usr/bin/env nodejs
'use strict';
const solver = require("./solver");
const wordleEngine = require("./wordleEngine");

const prettyprint = require("./prettyprint");



function runGame(solution) {
    //console.log(solution);
    let guesses = [];
    let evaluations = [];

    let guess;
    let evaluation

    let guessCount = 0;
    while((!evaluations.length || !evaluations[evaluations.length-1].every(e => e == "correct"))) {
        guess = solver.generateGuess(guesses, evaluations);
        evaluation = wordleEngine.evaluateGuess(guess, solution);
        guesses.push(guess);
        evaluations.push(evaluation);
        guessCount++;
        //prettyprint.prettyPrintEvaluation(evaluation, guess);
    }
    //prettyprint.prettyPrintEvaluations(evaluations, guesses);
    if(guessCount > 8) {
        console.log(solution, guessCount);
    }
    return guessCount;
}

module.exports = { runGame };

if (require.main === module) {
    // first two args are node and script
    const args = process.argv.slice(2);
    if(args.length != 1) {
        console.log("need a solution to try");
        process.exit(1);
    }
    console.log(runGame(args[0]));
}

