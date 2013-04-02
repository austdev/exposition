/*global module:false, require:false, process:false */
module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        html: { /* Custom task, see below */
            build: {
                options: {
                    templateData: {
                        scripts: grunt.file.expand('js/*.js')
                    }
                },
                files: [
                    {src: ['*.html'], dest: 'build/'}
                ]
            },
            release: {
                options: {
                    templateData: {
                        scripts: [
                            'js/<%= pkg.name %>-<%= pkg.version %>.min.js'
                        ]
                    }
                },
                files: [
                    {src: ['*.html'], dest: 'build/'}
                ]
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            release: {
                src: ['js/*.js'],
                dest: 'build/js/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            release: {
                src: 'build/js/<%= pkg.name %>-<%= pkg.version %>.js',
                dest: 'build/js/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        jshint: {
            files: ['gruntfile.js', 'js/*.js', 'build/*.js', '!*/spin.js'],
            options: {
                eqeqeq: true,
                browser: true,
                jquery: true,
                globals: {
                    console: false
                }
            }
        },
        copy: {
            build: {
                files: [
                    {src: ['js/**'], dest: 'build/'}
                ]
            },
            release: {
                files: [
                    {src: ['php/**'], dest: 'build/'},
                    {src: ['css/**'], dest: 'build/'},
                    {src: ['doc/**'], dest: 'build/'},
                    {src: 'readme.md', dest: 'build/'},
                    {src: 'htaccess', dest: 'build/.htaccess'}
                ]
            }
        },
        clean: {
            // Avoid deleting the 'build' directory, which is an SSHFS mount point on my dev machine
            build: ['build/**', '!build']
        },
        watch: {
            files: ['js/*.js', 'php/**/*.php'],
            tasks: ['default']
        }
    });

    // Custom task
    // Generate HTML from Handlebar template. Dynamically add <script> statements.
    // Code adapted from grunt-contrib-copy
    grunt.registerMultiTask('html', 'Generate HTML files based on Handlebar templates.', function() {
        var Handlebars = require('handlebars');
        var path = require('path');
        var options = this.options();
        var templateData = options.templateData || {};
        //grunt.log.writeln(this.target + ': ' + JSON.stringify(this.data));

        var unixifyPath = function(filepath) {
            if (process.platform === 'win32') {
                return filepath.replace(/\\/g, '/');
            } else {
                return filepath;
            }
        };
        this.files.forEach(function(filePair) {

            var isExpandedPair = filePair.orig.expand || false;
            filePair.src.forEach(function(src) {
                var dest;
                if (grunt.util._.endsWith(filePair.dest, '/')) {
                    dest = (isExpandedPair) ? filePair.dest : unixifyPath(path.join(filePair.dest, src));
                } else {
                    dest = filePair.dest;
                }
                grunt.log.writeln('Generating: "'+dest+'"');
                var template = Handlebars.compile(grunt.file.read(src));
                grunt.file.write(dest, template(templateData));
            });
        });
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default tasks
    grunt.registerTask('default', ['html:build', 'jshint', 'copy']);
    grunt.registerTask('release', ['clean', 'html:release', 'concat', 'uglify', 'jshint', 'copy:release']);

};