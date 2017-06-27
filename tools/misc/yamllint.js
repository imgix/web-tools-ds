var path = require('path'),
    _ = require('lodash'),
    gutil = require('gulp-util'),
    through = require('through2'),
    yaml = require('js-yaml'),
    linter;

linter = function () {
  function makeReport(file, type, errorObj) {
    return {
      file: file.path,
      type: type,
      message: errorObj.reason,
      line: _.get(errorObj, 'mark.line'),
      column: _.get(errorObj, 'mark.column')
    };
  }

  return through.obj(function transform(file, encoding, callback) {
    var reports = [];

    try {
      yaml.safeLoad(file.contents.toString(), {
        filename: path.basename(file.path),
        onWarning: (warning) => {
          reports.push(makeReport(file, 'warning', warning));
        }
      });
    } catch (error) {
      reports.push(makeReport(file, 'error', error));
    }

    // send status down-stream
    file.yamlLint = {
      isValid: !reports.length,
      reports: reports
    };

    callback(null, file);
  });
};

linter.reporter = function (reporter) {
  var report;

  if (_.isString(reporter)) {
    // Load it
    report = require(reporter);
  } else if (_.isFunction(reporter)) {
    report = reporter;
  } else {
    throw new gutil.PluginError('yamlLint', 'Invalid reporter');
  }

  return through.obj(function transform(file, encoding, callback) {
    if (file.yamlLint && !file.yamlLint.isValid) {
      report(file.yamlLint.reports);
    }

    callback(null, file);
  });
};

module.exports = linter;
