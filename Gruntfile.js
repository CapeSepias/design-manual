module.exports = function(grunt) {

  'use strict';

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  var path = require('path');
  var config = {

    /**
     * Pull in the package.json file so we can read its metadata.
     */
    pkg: grunt.file.readJSON('bower.json'),

    /**
     * Set some src and dist location variables.
     */
    loc: {
      src: 'src',
      dist: '.'
    },

    /**
     * Bower: https://github.com/yatskevich/grunt-bower-task
     *
     * Set up Bower packages and migrate static assets.
     */
    bower: {
      cf: {
        options: {
          targetDir: '<%= loc.src %>/vendor/',
          install: false,
          verbose: true,
          cleanTargetDir: false,
          layout: function(type, component) {
            if (type === 'img') {
              return path.join('../static/img');
            } else if (type === 'fonts') {
              return path.join('../static/fonts');
            } else {
              return path.join(component);
            }
          }
        }
      }
    },

    /**
     * Concat: https://github.com/gruntjs/grunt-contrib-concat
     *
     * Concatenate cf-* Less files prior to compiling them.
     */
    concat: {
      'cf-less': {
        src: [
          '<%= loc.src %>/vendor/cf-*/*.less',
          '!<%= loc.src %>/vendor/cf-core/*.less',
          '<%= loc.src %>/vendor/cf-core/cf-core.less',
          '<%= loc.src %>!vendor/cf-concat/cf.less'
        ],
        dest: '<%= loc.src %>/vendor/cf-concat/cf.less'
      },
      js: {
        src: [
          '<%= loc.src %>/vendor/jquery/jquery.js',
          '<%= loc.src %>/vendor/jquery.easing/jquery.easing.js',
          '<%= loc.src %>/vendor/cf-*/*.js',
          '!<%= loc.src %>/vendor/cf-*/Gruntfile.js',
          '<%= loc.src %>/static/js/app.js'
        ],
        dest: '<%= loc.dist %>/static/js/main.js'
      },
      topdocIcons: {
        src: [
          'src/topdoc-templates/includes/filter-components-without-markup.jade',
          'src/topdoc-templates/icons/src.jade'
        ],
        dest: 'src/topdoc-templates/icons/index.jade'
      }
    },

    /**
     * Less: https://github.com/gruntjs/grunt-contrib-less
     *
     * Compile Less files to CSS.
     */
    less: {
      main: {
        options: {
          // The src/vendor paths are needed to find the CF components' files.
          // Feel free to add additional paths to the array passed to `concat`.
          paths: grunt.file.expand('src/vendor/*').concat([])
        },
        files: {
          '<%= loc.dist %>/static/css/main.css': ['<%= loc.src %>/static/css/main.less']
        }
      }
    },

    /**
     * Autoprefixer: https://github.com/nDmitry/grunt-autoprefixer
     *
     * Parse CSS and add vendor-prefixed CSS properties using the Can I Use database.
     */
    autoprefixer: {
      options: {
        // Options we might want to enable in the future.
        diff: false,
        map: false
      },
      main: {
        // Prefix `static/css/main.css` and overwrite.
        expand: true,
        src: ['<%= loc.dist %>/static/css/main.css']
      },
    },

    /**
     * Uglify: https://github.com/gruntjs/grunt-contrib-uglify
     *
     * Minify JS files.
     * Make sure to add any other JS libraries/files you'll be using.
     * You can exclude files with the ! pattern.
     */
    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true
      },
      // headScripts: {
      //   src: 'vendor/html5shiv/html5shiv-printshiv.js',
      //   dest: 'static/js/html5shiv-printshiv.js'
      // },
      js: {
        src: ['<%= loc.dist %>/static/js/main.js'],
        dest: '<%= loc.dist %>/static/js/main.min.js'
      }
    },

    /**
     * Banner: https://github.com/mattstyles/grunt-banner
     *
     * Here's a banner with some template variables.
     * We'll be inserting it at the top of minified assets.
     */
    banner:
      '/*!\n' +
      ' *  <%= pkg.name %> - v<%= pkg.version %>\n' +
      ' *  <%= pkg.homepage %>\n' +
      ' *  Licensed <%= pkg.license %> by <%= pkg.author.name %> <<%= pkg.author.email %>>\n' +
      ' */',

    usebanner: {
      css: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: ['<%= loc.dist %>/static/css/*.min.css']
        }
      },
      js: {
        options: {
          position: 'top',
          banner: '<%= banner %>',
          linebreak: true
        },
        files: {
          src: ['<%= loc.dist %>/static/js/*.min.js']
        }
      }
    },

    /**
     * CSS Min: https://github.com/gruntjs/grunt-contrib-cssmin
     *
     * Compress CSS files.
     */
    cssmin: {
      main: {
        options: {
          processImport: false
        },
        files: {
          '<%= loc.dist %>/static/css/main.min.css': ['<%= loc.dist %>/static/css/main.css'],
        }
      },
      'ie-alternate': {
        options: {
          processImport: false
        },
        files: {
          '<%= loc.dist %>/static/css/main.ie.min.css': ['<%= loc.dist %>/static/css/main.ie.css'],
        }
      }
    },

    /**
     * Legacssy: https://github.com/robinpokorny/grunt-legacssy
     *
     * Fix your CSS for legacy browsers.
     */
    legacssy: {
      'ie-alternate': {
        options: {
          // Flatten all media queries with a min-width over 960 or lower.
          // All media queries over 960 will be excluded fromt he stylesheet.
          // EM calculation: 960 / 16 = 60
          legacyWidth: 60
        },
        files: {
          '<%= loc.dist %>/static/css/main.ie.css': '<%= loc.dist %>/static/css/main.css'
        }
      }
    },

    /**
     * Copy: https://github.com/gruntjs/grunt-contrib-copy
     *
     * Copy files and folders.
     */
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: '<%= loc.src %>',
            src: [
              // HTML files
              '*.html',
            ],
            dest: '<%= loc.dist %>'
          },
          {
            expand: true,
            cwd: '<%= loc.src %>/static',
            src: [
              // Fonts
              'fonts/*'
            ],
            dest: '<%= loc.dist %>/static'
          },
          {
            expand: true,
            cwd: '<%= loc.src %>/static',
            src: [
              // Images
              'img/**'
            ],
            dest: '<%= loc.dist %>/static'
          },
          {
            expand: true,
            cwd: '<%= loc.src %>',
            src: [
              // Vendor files
              'vendor/html5shiv/html5shiv-printshiv.min.js',
              'vendor/box-sizing-polyfill/boxsizing.htc'
            ],
            dest: '<%= loc.dist %>/static'
          }
        ]
      }
    },

    /**
     * JSHint: https://github.com/gruntjs/grunt-contrib-jshint
     *
     * Validate files with JSHint.
     * Below are options that conform to idiomatic.js standards.
     * Feel free to add/remove your favorites: http://www.jshint.com/docs/#options
     */
    jshint: {
      options: {
        camelcase: false,
        curly: true,
        forin: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        quotmark: true,
        sub: true,
        boss: true,
        strict: true,
        evil: true,
        eqnull: true,
        browser: true,
        plusplus: false,
        globals: {
          jQuery: true,
          $: true,
          module: true,
          require: true,
          define: true,
          console: true,
          EventEmitter: true
        }
      },
      all: ['<%= loc.src %>/static/js/app.js']
    },

    /**
     * Topdoc: https://github.com/topcoat/topdoc
     *
     * A command line tool for generating usage docs based on css comments
     */
    topdoc: {
      icons: {
        options: {
          source: 'static/css/',
          destination: '_includes/identity/icons/',
          template: 'src/topdoc-templates/icons/index.jade',
          templateData: {
            family: 'cf-icons'
          }
        }
      }
    },

    /**
     * Watch: https://github.com/gruntjs/grunt-contrib-watch
     *
     * Run predefined tasks whenever watched file patterns are added, changed or deleted.
     * Add files to monitor below.
     */
    watch: {
      css: {
        files: ['<%= loc.src %>/static/css/**/*.less'],
        tasks: ['css']
      },
      js: {
        files: ['Gruntfile.js', '<%= loc.src %>/static/js/**/*.js'],
        tasks: ['js']
      },
      content: {
        files: ['**/*.html', '/downloads/*.md', '/guides/*.md', '/identity/*.md', '/ui-toolkit/*.md'],
        tasks: ['copy']
      }
    }

  };

  /**
   * Initialize a configuration object for the current project.
   */
  grunt.initConfig(config);

  grunt.registerTask(
    'cleanUpAfterTopdoc',
    'Topdoc runs on all non-minified CSS files, including .ie.css files. We need to delete those.',
    function() {
      grunt.file.delete(grunt.file.expand('_includes/**/**/main.ie.html'));
    }
  );

  /**
   * Create custom task aliases and combinations.
   */
  grunt.registerTask('compile-cf', ['bower:cf', 'concat:cf-less', 'concat:topdocIcons']);
  grunt.registerTask('css', ['less', 'autoprefixer', 'legacssy', 'cssmin', 'usebanner:css', 'copy']);
  grunt.registerTask('js', ['concat:js', 'uglify', 'usebanner:js', 'copy']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['test', 'css', 'js', 'copy']);
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build-partials-from-cf-docs', ['topdoc', 'cleanUpAfterTopdoc']);

};