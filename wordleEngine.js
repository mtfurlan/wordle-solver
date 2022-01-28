#!/usr/bin/env nodejs
'use strict';


// this function taken from main.e65ce0a5.js, parameter names cleaned up and constants defined
function evaluateGuess(guess, solution) {
    const Ma = "correct";
    const Oa = "absent"
    const Ia = "present"
    for (var s = Array(solution.length).fill(Oa), t = Array(solution.length).fill(!0), o = Array(solution.length).fill(!0), n = 0; n < guess.length; n++) guess[n] === solution[n] && o[n] && (s[n] = Ma, t[n] = !1, o[n] = !1);
    for (var r = 0; r < guess.length; r++) {
        var i = guess[r];
        if (t[r]) for (var l = 0; l < solution.length; l++) {
            var d = solution[l];
            if (o[l] && i === d) {
                s[r] = Ia,
                    o[l] = !1;
                break
            }
        }
    }
    return s
}


module.exports = { evaluateGuess };


if (require.main === module) {
    // first two args are node and script
    const args = process.argv.slice(2);
    if(args.length != 2) {
        console.log("need two args, guess and solution");
        process.exit(1);
    }
    console.log(JSON.stringify(evaluateGuess(args[0], args[1])));
}

