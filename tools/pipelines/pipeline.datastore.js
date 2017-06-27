var _ = require('lodash'),
    gutil = require('gulp-util'),
    through = require('through2'),
    combine = require('stream-combiner');

module.exports = function setupDatastorePipeline(gulp) {
  function storeData(options)
    return through.obj(function transform(file, encoding, callback) {
      var resource;

      if (_.isString(options.resource)) {
        resource = gulp.DS.resources[options.resource];

        if (!resource) {
          throw new gutil.PluginError('storeData', 'No such resource: "' + options.resource + '"');
        }

        if (options.filenameIsID) {
          file.data[resource.idAttribute] = file.name;
        }

        gulp.DS.inject(options.resource, file.data);
      } else {
        gulp.dataStore[file.name] = file.data;
      }

      callback(null, file);
    });
  }

  return function datastorePipeline(options) {
    options = _.defaultsDeep({}, options, {
      filenameIsID: true
    });

    return combine(_.compact([
      options.transformer && options.transformer(),
      storeData(options)
    ]));
  };
};
