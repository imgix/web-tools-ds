var _ = require('lodash'),
    through = require('through2');

module.exports = function setupDatastoreComputeAllPipeline(gulp) {
  return function datastoreComputeAllPipeline() {
    return through.obj(null, null, function flush(callback) {
      console.log('flush');

      // Refresh all
      _.chain(gulp.ds.definitions)
        .flatMap(function getAllItems(def) {
            return def.getAll();
          })
        .invokeMap('DSCompute')
        .value();

      callback();
    });
  };
};
