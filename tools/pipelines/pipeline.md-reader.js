var _ = require('lodash'),
    path = require('path'),
    combine = require('stream-combiner'),
    through = require('through2'),
    frontMatter = require('front-matter'),
    showdown = require('showdown');

module.exports = function setupMarkdownReaderPipeline(gulp) {
  function parseMarkdown(options, extensions) {
    var converter,
        optionsWithExtensions;

    _.each(extensions, function applyExtenstion(config, name) {
      showdown.extension(name, _.constant([config]));
    });

    optionsWithExtensions = _.merge(options, {
      extensions: _.keys(extensions)
    });

    converter = new showdown.Converter(optionsWithExtensions);

    return through.obj(function transform(file, encoding, callback) {
      var parsedData = frontMatter(file.contents.toString()),
          attributes = _.get(parsedData, 'attributes', {});

      attributes.body = converter.makeHtml(parsedData.body);

      file.data = attributes;

      callback(null, file);
    });
  }

  return function markdownReaderPipeline(options) {
    options = _.defaultsDeep({}, options, {
      doProcessing: true,

      inputOptions: {},
      markdownExtensions: {}
    });

    return combine(_.compact([
      // Processing pipeline
      options.doProcessing && parseMarkdown(options.inputOptions, options.markdownExtensions)
    ]));
  };
};
