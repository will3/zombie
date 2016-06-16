module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      js: {
        src: [
          'node_modules/three/build/three.js',
          'node_modules/cannon/build/cannon.js'
        ],
        dest: 'js',
        flatten: true,
        expand: true
      }
    },
    shell: {
      open: {
        command: 'open http://localhost:3000'
      },
      build: {
        command: 'npm run build'
      }
    },
    connect: {
      server: {
        options: {
          port: 3000,
          keepalive: true
        }
      }
    },
    concurrent: {
      dev: {
        tasks: ['shell:build', 'connect'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['copy', 'shell:open', 'concurrent:dev']);
};
