/*jslint node: true, nomen: true*/

"use strict";

var configuration = {

    SOURCE_DIR: "source",
    RESOURCES_DIR: "<%=SOURCE_DIR%>/resources",
    PANDOC_DIR: "<%=RESOURCES_DIR%>/pandoc",
    TEMPLATES_DIR: "<%=PANDOC_DIR%>/templates",
    FRAGMENTS_DIR: "<%=RESOURCES_DIR%>/fragments",
    STYLES_DIR: "<%=RESOURCES_DIR%>/styles",
    IMAGES_DIR: "<%=RESOURCES_DIR%>/images",
    FONTS_DIR: "<%=RESOURCES_DIR%>/fonts",
    FILTERS_DIR: "<%=RESOURCES_DIR%>/filters",
    BUILD_DIR: "build",

    pandoc: {

        /*
        options: {

            //General
            //from: "markdown",
            //to: "html",
            //dataDir: "<%=PANDOC_DIR%>",

            //Reader
            //parseRaw: true,
            //smart: true,
            //oldDashes: true,
            //baseHeaderLevel: 1,
            //indentedCodeClasses: "javascript,numberLines",
            //defaultImageExtension: "png",
            //filter: "./<%=FILTERS_DIR%>/filter",
            //metadata: ["key1", "key2:value"],
            //normalize: true,
            //preserveTabs: true,
            //tabStop: 4,

            //General writer
            //standalone: true,
            //template: "<%=TEMPLATES_DIR%>/template",
            //variable: ["key1", "key2:value"],
            //noWrap: true,
            //columns: 120,
            //toc: true,
            //tocDepth: 3,
            //noHighlight: true,
            //highlightStyle: "pygments",
            //includeInHeader: ["<%=FRAGMENTS_DIR%>/endHeader1", "<%=FRAGMENTS_DIR%>/endHeader2"],
            //includeBeforeBody: ["<%=FRAGMENTS_DIR%>/beginningBody1", "<%=FRAGMENTS_DIR%>/beginningBody2"],
            //includeAfterBody: ["<%=FRAGMENTS_DIR%>/endBody1", "<%=FRAGMENTS_DIR%>/endBody2"],

            //Specific writers
            //selfContained: true,
            //htmlQTags: true,
            //ascii: true,
            //referenceLinks: true,
            //atxHeaders: true,
            //chapters: true,
            //numberSections: true,
            //numberOffset: "0,0",
            //noTexLigatures: true,
            //listings: true,
            //incremental: true,
            //slideLevel: 1,
            //sectionDivs: true,
            //emailObfuscation: "none",
            //idPrefix: "prefix",
            //titlePrefix: "prefix",
            //css: ["<%=STYLES_DIR%>/style1.css", "<%=STYLES_DIR%>/style2.css"],
            //referenceOdt: "<%=PANDOC_DIR%>/reference.odt",
            //referenceDocx: "<%=PANDOC_DIR%>/reference.docx",
            //epubStylesheet: "<%=PANDOC_DIR%>/epub.css",
            //epubCoverImages: "<%=IMAGES_DIR%>/cover.png",
            //epubMetadata: "<%=RESOURCES_DIR%>/metadata.xml",
            //epubEmbedFont: ["<%=FONTS_DIR%>/font1", "<%=FONTS_DIR%>/font2"],
            //epubChapterLevel: 1,
            //latexEngine: "pdflatex",

            //Citation rendering
            //bibliography: "<%=RESOURCES_DIR%>/bibliography",
            //csl: "<%=PANDOC_DIR%>/default.csl",
            //citationAbbreviations: "<%=PANDOC_DIR%>/citationAbbreviations",
            //natbib: true,
            //biblatex: true,

            //Math rendering
            //latexmathml: "latexMathML.js", //url to local copy
            //latexmathml: true, //embed
            //mathml: "mathML.js", //url to local copy
            //mathml: true //embed
            //jsmath: "jsMath/easy/load.js", //url to local copy
            //jsmath: true, //use jsMath but no embedding or linking
            //mathjax: "mathJax.js", //url to local copy
            //mathjax: true, //link
            //gladtex: true,
            //mimetex: "mimetex.cgi", //url to local copy
            //mimetex: true, //url defaults to /cgi-bin/mimetex.cgi
            //webtex: "script" //url to local copy or service
            //webtex: true //url defaults to the Google Chart API
        },
        */

        build: {

            src: ["<%=SOURCE_DIR%>/00 Title.md", "<%=SOURCE_DIR%>/10 Chapter 01.md"],
            dest: "<%=BUILD_DIR%>/<%=pkg.name%>.pdf"
        }
    },

    watch: {

        source: {

            files: "<%=SOURCE_DIR%>/**/*", //Watch all files so we also rebuild when, for example, we add an image. grunt-contrib-watch doesn't support the standard way of defining files.
            tasks: ["pandoc:build"],

            options: {

                event: ["added", "changed"], //why didn't they name this events?
                spawn: false
            }
        }
    }
};

module.exports = function configure(grunt) {

    grunt.registerMultiTask("pandoc", "Convert files from one markup format to another", function pandocMultiTask() {

        var path = require("path"),
            loDash = grunt.util._,

            normaliseOption = function normaliseOption(option, value) {

                var isShortOption = option.length === 1,
                    normalisedOption = isShortOption ? loDash.sprintf("-%s", option) : loDash.sprintf("--%s", loDash.dasherize(option));

                if (grunt.util.kindOf(value) !== "boolean") {

                    normalisedOption = loDash.sprintf(isShortOption ? "%s %s" : "%s=%s", normalisedOption, value);
                }

                return normalisedOption;
            },

            normaliseOptions = function normaliseOptions(options) {

                var normalisedOptions = [];

                Object
                    .keys(options)
                    .forEach(function eachOption(option) {

                        var values = options[option];

                        if (grunt.util.kindOf(values) !== "array") {

                            values = [values];
                        }

                        values.forEach(function eachValue(value) {

                            if (value === false) {

                                return;
                            }

                            normalisedOptions.push(normaliseOption(option, value));
                        });
                    });

                return normalisedOptions;
            },

            buildQueue = function buildQueue(options, files) {

                var normalisedOptions = normaliseOptions(options),
                    queue = [];

                files.forEach(function eachDestination(destination) {

                    var normalisedFiles = destination.src.filter(function filterFile(file) {

                            if (!grunt.file.exists(file)) { //According to the documentation, I need to filter out non existing files. However, according to my observations, these files are already filtered out.

                                grunt.log.warn(loDash.sprintf("Source file \"%s\" not found.", file));

                                return false;
                            }

                            return true;
                        }),
                        dest = destination.dest;

                    queue.push({

                        file: dest,
                        args: normalisedOptions.concat(loDash.sprintf("--output=%s", dest), normalisedFiles)
                    });
                });

                return queue;
            },

            runPandoc = function runPandoc(args, done) {

                grunt.util.spawn(

                    {cmd: "pandoc", args: args},

                    function onDone(error, result) {

                        done(error, String(result));
                    }
                );
            },

            runTask = function runTask(options, files, done) {

                var queue = buildQueue(options, files),

                    next = function next(error, output) {

                        if (output !== undefined) {

                            if (error) {

                                grunt.log.error();
                                grunt.fail.warn(output);
                            } else {

                                grunt.log.ok();
                            }
                        }

                        if (queue.length <= 0) {

                            done();

                            return;
                        }

                        var desc = queue.pop(),
                            file = desc.file,
                            directory = path.dirname(file);

                        grunt.log.write(loDash.sprintf("Building %s...", file));

                        if (!grunt.file.exists(directory)) {

                            grunt.file.mkdir(directory);
                        }

                        runPandoc(desc.args, next);
                    };

                queue.reverse();
                next();
            };

        runTask(this.options(), this.files, this.async());
    });
    grunt.loadNpmTasks("grunt-contrib-watch");
    configuration.pkg = grunt.file.readJSON("package.json");
    grunt.initConfig(configuration);
    grunt.registerTask("default", ["pandoc:build", "watch:source"]);
};
