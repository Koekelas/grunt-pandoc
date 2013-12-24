/*jslint node: true, nomen: true*/

"use strict";

//example configuration, customise this
var configuration = {

    //use these variables to structure your project
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

        build: {

            src: ["<%=SOURCE_DIR%>/01 Chapter 01.md", "<%=SOURCE_DIR%>/02 Chapter 02.md"], //your input file(s)
            dest: "<%=BUILD_DIR%>/<%=pkg.name%>.html", //Your output file. Note that your package.json is available under the name pkg.

            /*
            Use this object to set the options you would normally set on the command line. You should set the output file using
            the dest key value pair above. Note that not all of Pandoc's options make sense to be used in this context.

            To set an option, define a key value pair where the key is the name of the option you want to set and the
            value is the value you want to set it to.

            # Keys

            Both short and long options are supported. To find the name of a short option, take the short option and
            drop the hyphen (-). For example:

            -f becomes f

            To find the name of a long option, take the long option and capitalise the first letter of each word except
            for the first word and drop all hyphens (-). For example:

            --from becomes from and --data-dir becomes dataDir

            # Values

            A value can be a/an:

            *   boolean (to set an option that doesn't have a value, set it's value to true to set it);
            *   number;
            *   string;
            *   array of the above (to set an option multiple times).

            # Tips

            *   Setting an option's value to false unsets the option.
            *   When setting an option which can be set multiple times to a single value, the value doesn't need to be
                wrapped in an array.
            */
            options: {

                //all sensible options (Pandoc 1.12.2.1)

                //general
                //from: "markdown",
                //to: "html",
                //dataDir: "<%=PANDOC_DIR%>",

                //reader
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

                //general writer
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

                //specific writers
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

                //citation rendering
                //bibliography: "<%=RESOURCES_DIR%>/bibliography",
                //csl: "<%=PANDOC_DIR%>/default.csl",
                //citationAbbreviations: "<%=PANDOC_DIR%>/citationAbbreviations",
                //natbib: true,
                //biblatex: true,

                //math rendering
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
            }
        }
    },

    watch: {

        source: {

            files: "<%=SOURCE_DIR%>/**/*", //Watch all files so we also rebuild when, for example, we add an image. grunt-contrib-watch doesn't support the standard way of defining files.
            tasks: ["pandoc:build"],
            options: {spawn: false}
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
    grunt.registerTask("default", ["pandoc:build", "watch:source"]); //example default task, customise this
};
