# grunt-pandoc

grunt-pandoc is a Grunt plugin which automates building documents with Pandoc.

# Prerequisites

Before continuing, you should be familiar with [Grunt][Grunt homepage], [grunt-contrib-watch][grunt-contrib-watch on npm] and [Pandoc][Pandoc homepage].

# Software requirements

Install Pandoc and make sure it's available on your path. While you could install all dependencies locally, I recommend you install them globally. Installing them globally helps to keep your hard disk clean when you have multiple Pandoc projects. To install them globally, run:

```
$ npm install -g grunt grunt-contrib-watch
```

# Starting a new Pandoc project

To start a new Pandoc project, run:

```
# Clone project
$ git clone https://github.com/Koekelas/grunt-pandoc.git my-project && cd my-project

# Link globally installed dependencies
$ npm link grunt grunt-contrib-watch
# or install dependencies locally
$ npm install

# Customise project metadata and Grunt configuration
$ vim package.json
$ vim Gruntfile.js

# Create input files
$ mkdir source
$ touch "source/01 Chapter 01.md" "source/02 Chapter 02.md"

# Start writing
$ grunt
$ vim "source/01 Chapter 01.md"
```

# The pandoc task

To run this task, run:

```
$ grunt pandoc
```

## Settings

Consult the [Grunt documentation][Grunt configuring tasks] for information on how to configure input and output file(s).

### options

Use this object to set the options you would normally set on the command line. You should set the output file using the method described above. Note that not all of Pandoc's options make sense to be used in this context.

To set an option, define a key value pair where the key is the name of the option you want to set and the value is the value you want to set it to.

#### Keys

Both short and long options are supported. To find the name of a short option, take the short option and drop the hyphen (-). For example:

-f becomes f

To find the name of a long option, take the long option and capitalise the first letter of each word except for the first word and drop all hyphens (-). For example:

--from becomes from and --data-dir becomes dataDir

#### Values

A value can be a/an:

*   boolean (to set an option that doesn't have a value, set it's value to true to set it);
*   number;
*   string;
*   array of the above (to set an option multiple times).

#### Tips

*   Setting an option's value to false unsets the option.
*   When setting an option which can be set multiple times to a single value, the value doesn't need to be
    wrapped in an array.

# Example configurations

## General

```js
var configuration = {

    SOURCE_DIR: "source",
    BUILD_DIR: "build",

    pandoc: {

        build: {

            src: [

                "<%=SOURCE_DIR%>/01 Installing.md",
                "<%=SOURCE_DIR%>/02 Using.md",
                "<%=SOURCE_DIR%>/03 Software.md",
                "<%=SOURCE_DIR%>/04 Configuring.md"
            ],
            dest: "<%=BUILD_DIR%>/<%=pkg.name%>.pdf", //keep this document open in Evince or Sumatra PDF (probably other PDF viewers too) and they will reload the document when it changes

            options: {

                normalize: true,
                variable: [

                    "lang:dutch",
                    "papersize:a4paper",
                    "documentclass:report",
                    "title:<%=pkg.description%>",
                    "author:<%=pkg.author%>"
                ],
                toc: true,
                numberSections: true
            }
        }
    },

    watch: {

        source: {

            files: "<%=SOURCE_DIR%>/**/*", //watch all files so we also rebuild when, for example, we add an image
            tasks: ["pandoc:build"],
            options: {spawn: false}
        }
    }
};
```

## LiveReload with browser plugin

```js
var configuration = {

    SOURCE_DIR: "source",
    BUILD_DIR: "build",

    pandoc: {

        build: {

            src: ["<%=SOURCE_DIR%>/Notes.md"],
            dest: "<%=BUILD_DIR%>/<%=pkg.name%>.html",

            options: {

                to: "html5",
                normalize: true,
                standalone: true
            }
        }
    },

    watch: {

        source: {

            files: "<%=SOURCE_DIR%>/**/*", //watch all files so we also rebuild when, for example, we add an image
            tasks: ["pandoc:build"],
            options: {

                spawn: false,
                livereload: true
            }
        }
    }
};
```

## LiveReload without browser plugin

```js
var configuration = {

    SOURCE_DIR: "source",
    RESOURCES_DIR: "<%=SOURCE_DIR%>/resources",
    FRAGMENTS_DIR: "<%=RESOURCES_DIR%>/fragments",
    BUILD_DIR: "build",
    INPUT_FILES: ["<%=SOURCE_DIR%>/Notes.md"],
    OUTPUT_FILE: "<%=BUILD_DIR%>/<%=pkg.name%>.html",

    pandoc: {

        options: {

            to: "html5",
            normalize: true,
            standalone: true
        },

        build: { //use this target to build a redistributable version

            src: "<%=INPUT_FILES%>",
            dest: "<%=OUTPUT_FILE%>"
        },

        liveReload: {

            src: "<%=INPUT_FILES%>",
            dest: "<%=OUTPUT_FILE%>",

            options: {

                includeAfterBody: "<%=FRAGMENTS_DIR%>/liveReload.html"
            }
        }
    },

    watch: {

        source: {

            files: "<%=SOURCE_DIR%>/**/*", //watch all files so we also rebuild when, for example, we add an image
            tasks: ["pandoc:liveReload"],
            options: {

                spawn: false,
                livereload: true
            }
        }
    }
};
```

The HTML fragment liveReload.html looks like this:

```html
<script src="http://localhost:35729/livereload.js"></script>
```

The HTTP server and script are part of the grunt-contrib-watch task. You'll also want to change the default task to `["pandoc:liveReload", "watch:source"]`.

## GitHub readme previewer

```js
var configuration = {

    SOURCE_DIR: "source",
    RESOURCES_DIR: "<%=SOURCE_DIR%>/resources",
    FRAGMENTS_DIR: "<%=RESOURCES_DIR%>/fragments",
    BUILD_DIR: "build",

    pandoc: {

        build: {

            src: ["<%=SOURCE_DIR%>/README.md"],
            dest: "<%=BUILD_DIR%>/<%=pkg.name%>.html",

            options: {

                from: "markdown_github",
                to: "html5",
                normalize: true,
                standalone: true,
                includeAfterBody: "<%=FRAGMENTS_DIR%>/liveReload.html"
            }
        }
    },

    watch: {

        readme: {

            files: "<%=SOURCE_DIR%>/README.md",
            tasks: ["pandoc:build"],
            options: {

                spawn: false,
                livereload: true
            }
        }
    }
};
```

The HTML fragment liveReload.html looks like this:

```html
<script src="http://localhost:35729/livereload.js"></script>
```

The HTTP server and script are part of the grunt-contrib-watch task. You'll also want to change the default task to `["pandoc:build", "watch:readme"]`.

# To-do

*   Turn this into a real Grunt plugin. At the moment, this is more a project template.

[Grunt homepage]: http://gruntjs.com/ "Grunt Homepage"
[grunt-contrib-watch on npm]: https://npmjs.org/package/grunt-contrib-watch "grunt-contrib-watch on npm"
[Pandoc homepage]: http://johnmacfarlane.net/pandoc/ "Pandoc Homepage"
[Grunt configuring tasks]: http://gruntjs.com/configuring-tasks#files "Grunt Configuring Tasks"
