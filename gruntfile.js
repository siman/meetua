'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pgk: grunt.file.readJSON('package.json'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      development: {
        NODE_ENV: 'development'
      }
    },
    jasmine_node: {
      options: {
        extensions: 'js'
      },
      all: ['app/spec']
    },
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          clearRequireCache: true // for watch
        },
        src: ['app/test/**/*.js']
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    watch: {
      tests: {
        options: {
          spawn: false
        },
        files: 'app/**/*.js',
        tasks: ['mocha-only']
      }
    },
    printChange: {
      file: ''
    }
  });
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('jasmine-only', ['env:test', 'jasmine_node']);
  grunt.registerTask('mocha-only', ['mochaTest']);
  grunt.registerTask('karma-only', ['env:test', 'karma:unit']);
  grunt.registerTask('test', ['env:test', 'jasmine_node', 'mochaTest', 'karma:unit']);

  var testMappings = {
    'app/services/events/save-action.js': 'app/test/services/save-event-test.js',
    'app/controllers/util/utils.js': 'app/test/services/utils.js'
  };
  var defaultMochaSrc = grunt.config('mochaTest.test.src');
  grunt.event.on('watch', function(action, filepath) {
    var changedSrc = action && filepath ? filepath : [];
    grunt.log.writeln('changedSrc', changedSrc, testMappings[filepath]);
    if (testMappings[filepath]) {
      grunt.config('mochaTest.test.src', testMappings[filepath]);
    } else if (changedSrc.match('app/test')) { // keep previous tests if this is not test and no mapping configured for it
      grunt.config('mochaTest.test.src', changedSrc);
    }
  });

  grunt.registerTask('default', ['test']);
};
