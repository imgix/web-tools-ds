var _ = require('lodash'),
    path = require('path'),
    combine = require('stream-combiner'),
    through = require('through2'),
    yaml = require('js-yaml'),
    yamlLint = require('../misc/yamllint.js'),
    yamlLintReporter = require('reporter-plus/yamllint');

module.exports = function setupYAMLReaderPipeline(gulp) {
  function parseYAML(options) {
    return through.obj(function transform(file, encoding, callback) {
      var yamlOptions = _.defaults(options, {
        filename: path.basename(file.path)
      });

      file.data = yaml.load(file.contents.toString(), yamlOptions);

      callback(null, file);
    });
  }

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
      options.doProcessing && parseYAML(options.inputOptions)
    ]));
  };
};
