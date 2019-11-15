var _ = require('lodash'),
    JSData = require('js-data');

module.exports = function setUpDS(gulp) {
  var dsConfig = _.get(gulp, 'webToolsConfig.dataStore', {}),
      DS;

  function abortAsync(resource, data, callback) {
    return new Promise(function promiser(resolve, reject) {
      reject(new Error('Asynchronous actions are not allowed.'));
    });
  }

  if (!!dsConfig.models) {
    DS = new JSData.DS(_.assign({
      linkRelations: true,
      relationsEnumerable: true,
      beforeCreate: abortAsync,
      beforeUpdate: abortAsync,
      beforeDestroy: abortAsync,
      beforeFind: abortAsync,
      afterInject: function (resource, items) {
          var resourceClass;

          resource = DS.definitions[resource.name];
          resourceClass = resource[resource.class];

          if (!_.isArray(items)) {
            items = [items];
          }

          _.chain(items)
            .castArray()
            .compact()
            .each(function updateItem(item) {
                // Reference the resource
                if (!item._resource) {
                  Object.defineProperty(item, '_resource', {
                    value: resource
                  });
                }

                // Define getters for each enumerable relationship
                _.each(resource.relationList, function addEnumerableRelations(relationDefinition) {
                  var objectProps;

                  if (_.isUndefined(relationDefinition.enumerable) ? resource.relationsEnumerable : relationDefinition.enumerable) {
                    objectProps = Object.getOwnPropertyDescriptor(resourceClass.prototype, relationDefinition.localField);

                    Object.defineProperty(item, relationDefinition.localField, objectProps);
                  }
                });
              })
            .value();
        }
    }, dsConfig.settings));

    // Define all models
    _.each(dsConfig.models, function defineModel(modelConstructor) {
      var model = modelConstructor(DS);

      DS.defineResource(model);
    });

    gulp.ds = DS;
  } else {
    gulp.ds = {};
  }

  // Add the default pipelines to the cache
  gulp.pipelineCache.put('yaml-reader', require('./pipelines/pipeline.yaml-reader.js'));
  gulp.pipelineCache.put('md-reader', require('./pipelines/pipeline.md-reader.js'));
  gulp.pipelineCache.put('datastore', require('./pipelines/pipeline.datastore.js'));
  gulp.pipelineCache.put('datastore-computeAll', require('./pipelines/pipeline.datastore-compute-all.js'));
};
