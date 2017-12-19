// noinspection JSAnnotator
shell = require("shelljs")

shell.cd('src')
shell.exec("babel ../src/TripGoRouting.js > ../dist/TripgoRouting-src.js");
shell.ls('*.js').forEach(function (file) {
    if(file != "TripGoRouting.js")
       shell.exec("babel ../src/"+file+ " >> ../dist/TripgoRouting-src.js");

});

// noinspection JSAnnotator
var fs = require("fs");

// Require the Obfuscator Module
// noinspection JSAnnotator
var JavaScriptObfuscator = require('javascript-obfuscator');

// Read the file of your original JavaScript Code as text
fs.readFile('../dist/TripgoRouting-src.js', "UTF-8", function(err, data) {
    if (err) {
        throw err;
    }

    // Obfuscate content of the JS file
    var obfuscationResult = JavaScriptObfuscator.obfuscate(data);

    // Write the obfuscated code into a new file
    fs.writeFile('../dist/TripgoRouting.js', obfuscationResult.getObfuscatedCode() , function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("Success!");
    });
});

