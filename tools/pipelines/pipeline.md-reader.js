var _ = require('lodash'),
    path = require('path'),
    combine = require('stream-combiner'),
    through = require('through2'),
    frontMatter = require('front-matter'),
    marked = require('marked');

module.exports = function setupMarkdownReaderPipeline(gulp) {
  function parseMarkdown(options, rendererOverrides) {
    var renderer = new marked.Renderer();

    _.assign(renderer, rendererOverrides);

    return through.obj(function transform(file, encoding, callback) {
      var parsedData = frontMatter(file.contents.toString()),
          attributes = _.get(parsedData, 'attributes', {});

      attributes.body = marked(parsedData.body, _.merge({}, options, {
        renderer: renderer
      }));

      file.data = attributes;

      callback(null, file);
    });
  }

  return function markdownReaderPipeline(options) {
    options = _.defaultsDeep({}, options, {
      doProcessing: true,

      inputOptions: {},
      rendererOverrides: {}
    });

    return combine(_.compact([
      // Processing pipeline
      options.doProcessing && parseMarkdown(options.inputOptions, options.rendererOverrides)
    ]));
  };
};
