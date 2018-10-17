var _ = require('lodash'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    combine = require('stream-combiner');

module.exports = function setupDatastorePipeline(gulp) {
  function storeData(options) {
    var model;

    if (_.isString(options.model)) {
      model = gulp.ds.definitions[options.model];

      if (!model) {
        throw new gutil.PluginError('storeData', 'No such model: "' + options.model + '"');
      }
    }

    return through.obj(function transform(file, encoding, callback) {
      var fileName = path.basename(file.path, path.extname(file.path)),
          key;

      if (model) {
        if (options.filenameIsID) {
          file.data[model.idAttribute] = fileName;
        }

        gulp.ds.inject(options.model, file.data);
      } else {
        if (_.isFunction(options.keyAs)) {
          key = options.keyAs(file.data);
        } else {
          key = options.keyAs;
        }

        if (!_.isString(key)) {
          key = fileName;
        }

        _.set(gulp.ds, key, file.data);
      }

      callback(null, file);
    });
  };

  return function datastorePipeline(options) {
    options = _.defaultsDeep({}, options, {
      filenameIsID: true,
      keyAs: null
    });

    return combine(_.compact([
      options.transformer && options.transformer(),
      storeData(options)
    ]));
  };
};
