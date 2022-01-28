#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');

const answersFile = "answers.json"

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function countLetters (count, word) {
    word.split('').forEach((s) => {
        count[s] ? count[s]++ : count[s] = 1;
    });
    return count;
}
function wordScore(letterCounts, word) {
    return word.split('').filter(onlyUnique).reduce((sum, letter) => sum+letterCounts[letter], 0);
}

function countLetters2D (count, word) {
    for (let i = 0; i < word.length; i++) {
        count[i][word[i]] ? count[i][word[i]]++ : count[i][word[i]] = 1;
    }
    return count;
}
function wordScore2D(letterCounts, word) {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
        score += letterCounts[i][word[i]];
    }
    return score;
}

function bestWord(choices, ignoreLetters) {
    let letterCount = {};
    choices.forEach((word) => { countLetters(letterCount, word); });
    let minLetter = Object.keys(letterCount).reduce((prevLowest, letter) => {
        return prevLowest < letterCount[letter] ? prevLowest : letterCount[letter];
    });
    let letterCount2D = [{}, {}, {}, {}, {}];
    choices.forEach((word) => { countLetters2D(letterCount2D, word); });

    Object.keys(letterCount).forEach((letter) => {
          letterCount[letter] /= minLetter;
    });
    for (var i = 0; i < letterCount2D.length; i++) {
        Object.keys(letterCount2D[i]).forEach((letter) => {
              letterCount2D[i][letter] /= minLetter;
        });
    }

    if(ignoreLetters) {
        ignoreLetters.forEach((letter) => {
            letterCount[letter] = 0;
        });
    }
    //console.log(letterCount);
    //console.log(letterCount2D);
    //console.log(choices);

    let bestWord = choices.reduce((bestWord, word) => {
        //console.log(word, wordScore(letterCount, word));
        return wordScore(letterCount, bestWord) < wordScore(letterCount, word) ? word : bestWord;
    }, ""); //starting with "" so it logs each word, it is technically unnecessary though
    let [bestWord2D,bestWord2DScore] =  choices.reduce((best, word) => {
        let newScore = wordScore2D(letterCount2D, word)
        //console.log(word, newScore);
        return best[1] < newScore ? [word, newScore] : best;
    }, ["", 0]); //starting with "" so it logs each word, it is technically unnecessary though
    //console.log([bestWord, bestWord2D]);
    return bestWord2D;
}

// guesses is [ "query", "queer"  ]
// evaluations is [[ 'absent', 'absent', 'absent', 'present', 'correct' ], [ 'absent', 'absent', 'absent', 'absent', 'present' ]]
function generateGuess(guesses, evaluations) {
    // correct letters
    let correct = [null, null, null, null, null];
    let wrongLocation = [[], [], [], [], []];
    let present = [];
    let absent = [];
    for (var i = 0; i < evaluations.length; i++) {
        if(evaluations[i]) {
            for (var j = 0; j < 5; j++) {
                let letter = guesses[i][j];
                switch(evaluations[i][j]) {
                    case 'correct':
                        correct[j] = letter;
                        break;
                    case 'present':
                        wrongLocation[j].push(letter);
                        present.push(letter);
                        break;
                    case 'absent':
                        absent.push(letter);
                        break;
                }
            }
        }
    }

    present = present.filter(onlyUnique);
    absent = absent.filter(onlyUnique);
    // Don't include letters in absent if they're in present
    absent = absent.filter((letter) => !present.includes(letter));
    absent = absent.filter((letter) => !correct.includes(letter));

    //TODO: handle double letters properly
    //console.log("present", present);
    //console.log("absent", absent);
    //debugger; // node inspect ./runGame.js karma

    let choices = JSON.parse(fs.readFileSync(answersFile));
    //remove words already chosen
    choices = choices.filter((possibility) => !guesses.includes(possibility));

    if(absent.length > 0) {
        choices = choices.filter((possibility) => !absent.some(c => possibility.includes(c)));
    }
    if(present.length > 0) {
        choices = choices.filter((possibility) => present.every(c => possibility.includes(c)))
    }
    choices = choices.filter((possibility) => { // specific positions
            for (var i = 0; i < 5; i++) {
                if(correct[i] != null) {
                    if(possibility[i] != correct[i]) {
                        return false;
                    }
                }
                if(wrongLocation[i].length > 0) {
                    if(wrongLocation[i].includes(possibility[i])) {
                        return false;
                    }
                }
            }
            return true;
        });

    let lettersThatMustExist = present.concat(correct.filter(n => n));
    return bestWord(choices, lettersThatMustExist);
}

module.exports = { generateGuess };

if (require.main === module) {
    // first two args are node and script
    const args = process.argv.slice(2);
    if(args.length != 2) {
        console.log("need two args, JSON guess array and JSON evaluation array");
        process.exit(1);
    }
    console.log(generateGuess(JSON.parse(args[0]), JSON.parse(args[1])));
}
