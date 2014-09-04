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
          reporter: 'spec'
        },
        src: ['app/test/**/*.js']
      }
    }
  });
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-mocha-test');

  grunt.registerTask('test', ['env:test', 'jasmine_node', 'mochaTest']);

  grunt.registerTask('default', ['test']);
};
