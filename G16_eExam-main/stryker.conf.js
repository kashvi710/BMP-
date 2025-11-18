// stryker.conf.js
module.exports = {
    testRunner: "mocha",
    coverageAnalysis: "perTest",
    mochaOptions: {
        spec: ["test/**/*.js"],
        package: "package.json",
        require: ["babel-register"],
        grep: ".*",
    },
};
