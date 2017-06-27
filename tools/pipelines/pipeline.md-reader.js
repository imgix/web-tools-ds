var _ = require('lodash'),
    combine = require('stream-combiner');

module.exports = function setupMarkdownReaderPipeline(gulp) {
  return function markdownReaderPipeline(options) {
    options = _.defaultsDeep({}, options, {
      doProcessing: true,

      inputOptions: {}
    });

    return combine(_.compact([
      // Processing pipeline
      options.doProcessing && gulpPlugins.markedJson(options.inputOptions),
      options.doProcessing && gulpPlugins.data(function getFromFile(file) {
          return require(file.path);
        })
    ]));
  };
};
