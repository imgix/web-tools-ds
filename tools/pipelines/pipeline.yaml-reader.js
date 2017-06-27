var _ = require('lodash'),
    combine = require('stream-combiner'),
    yamlLint = require('./misc/yamllint.js'),
    yamlLintReporter = require('reporter-plus/yamllint');

module.exports = function setupYAMLReaderPipeline(gulp) {
  return function yamlReaderPipeline(options) {
    options = _.defaultsDeep({}, options, {
      doCheck: true,
      doProcessing: true,

      yamlLintOptions: {},
      inputOptions: {}
    });

    return combine(_.compact([
      // Checking pipeline
      options.doCheck && yamlLint(options.yamlLintOptions),
      options.doCheck && yamlLint.reporter(yamlLintReporter),

      // Processing pipeline
      options.doProcessing && gulpPlugins.yaml(options.inputOptions),
      options.doProcessing && gulpPlugins.data(function getFromFile(file) {
          return require(file.path);
        })
    ]));
  };
};
