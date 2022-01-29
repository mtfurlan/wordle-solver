#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');

const answersFile = "answers.json"
const answers = JSON.parse(fs.readFileSync(answersFile));
const minLetter = 27; // over entire answer set

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function countLetters2D (count, word, skipLocations) {
    for (let i = 0; i < word.length; i++) {
        if(!skipLocations.includes(i)) {
            count[i][word[i]] ? count[i][word[i]]++ : count[i][word[i]] = 1;
        }
    }
    return count;
}
function wordScore2D(letterCounts, word, skipLocations) {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
        if(!skipLocations.includes(i)) {
            score += letterCounts[i][word[i]];
        }
    }
    return score;
}

function calculateLetterCounts2D(choices, presentLetters, skipLocations) {
    let letterCount2D = [{}, {}, {}, {}, {}];
    choices.forEach((word) => { countLetters2D(letterCount2D, word, skipLocations); });

    for (var i = 0; i < letterCount2D.length; i++) {
        if(!skipLocations.includes(i)) {
            Object.keys(letterCount2D[i]).forEach((letter) => {
                //if(ignoreLetters && ignoreLetters.includes(letter)) {
                //    letterCount2D[i][letter] = 0;
                //} else {
                    letterCount2D[i][letter] /= minLetter;
                //}
            });
        }
    }
    return letterCount2D;
}

function countLetters (count, word) {
        word.split('').forEach((s) => { count[s] = (count[s] || 0) + 1; });
        return count;
}
function wordScore(letterCounts, word) {
        return word.split('').filter(onlyUnique).reduce((sum, letter) => sum+letterCounts[letter], 0);
}
function calculateLetterCounts(choices, presentLetters) {
    let letterCount = {};
    choices.forEach((word) => { countLetters(letterCount, word); });
    let minLetter = Object.keys(letterCount).reduce((prevLowest, letter) => {
        return prevLowest < letterCount[letter] ? prevLowest : letterCount[letter];
    });
    Object.keys(letterCount).forEach((letter) => {
        letterCount[letter] /= minLetter;
    });
    if(presentLetters) {
        presentLetters.forEach((letter) => {
            letterCount[letter] = 0;
        });
    }
    return letterCount;
}



function bestWord(choices, guesses, presentLetters, correctLetters) {

    let correctLocations =[];
    correctLetters.forEach((e, i) => {
        if (e != null) correctLocations.push(i);
    });

    //let letterCount = calculateLetterCounts(choices, presentLetters);
    let letterCount2D = calculateLetterCounts2D(choices, presentLetters, correctLocations);

    //console.log(presentLetters);
    //console.log(letterCount);
    //console.log(letterCount2D);
    //console.log("choices", choices);

    //let bestWord = choices.reduce((bestWord, word) => {
    //    //console.log(word, wordScore(letterCount, word));
    //    return wordScore(letterCount, bestWord) < wordScore(letterCount, word) ? word : bestWord;
    //}, ""); //starting with "" so it logs each word, it is technically unnecessary though


    // if we have many choices, guess from answers not choices
    let guessSet;
    if(choices.length == 1) {
        return choices[0];
    }else if (choices.length <= 25) {
        guessSet = choices;
    } else {
        guessSet = answers.filter((w) => !guesses.includes(w));
    }


    let [bestWord2D,bestWord2DScore] =  guessSet.reduce((best, word) => {
        let newScore = wordScore2D(letterCount2D, word, correctLocations)
        //console.log(word, newScore);
        return best[1] < newScore ? [word, newScore] : best;
    }, ["", 0]); //starting with "" so it logs each word, it is technically unnecessary though
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

    //don't include letters in present if they're in correct
    //TODO: what do if double?
    correct.forEach((e, i) => {
        if (e != null) {
            present = present.filter((letter) => letter != e);
        }
    });

    //console.log("present", present);
    //console.log("absent", absent);
    //debugger; // node inspect ./runGame.js karma

    let choices = answers;
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


    return bestWord(choices, guesses, present, correct);
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

// sort answers by most duplicate letters
//function letterMaxCount(w) {
//    let counts = {};
//    w.split("").forEach((l) => {counts[l] = (counts[l] || 0) + 1; });
//    return counts[Object.keys(counts).reduce((prev, letter) => { return counts[prev] < counts[letter] ? letter : prev; })];
//}
//answers.sort((a, b) => letterMaxCount(a) - letterMaxCount(b))
