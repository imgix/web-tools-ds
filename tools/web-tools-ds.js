var _ = require('lodash'),
    JSData = require('js-data');

module.exports = function setUpDS(gulp) {
  var dsConfig = _.get(gulp, 'webToolsConfig.dataStore'),
      DS;

  function abortAsync(resource, data, callback) {
    return new Promise(function promiser(resolve, reject) {
      reject(new Error('Asynchronous actions are not allowed.'));
    });
  }

  if (!dsConfig) {
    return;
  }

  DS = new JSData.DS({
    beforeCreate: abortAsync,
    beforeUpdate: abortAsync,
    beforeDestroy: abortAsync,
    beforeFind: abortAsync
  });

  // Define all models
  _.each(dsConfig.models, DS.defineResource);

  // Make a low-tech data store for storing simple data
  gulp.data = {};
  // Save DS on Gulp instance to make it accessible
  gulp.DS = DS;

  // Add the default pipelines to the cache
  gulp.pipelineCache.put('yaml-reader', './pipelines/pipeline.yaml-reader.js');
  gulp.pipelineCache.put('md-reader', './pipelines/pipeline.md-reader.js');
  gulp.pipelineCache.put('csv-reader', './pipelines/pipeline.csv-reader.js');
}
