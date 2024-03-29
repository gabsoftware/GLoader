# [GLoader](https://gabsoftware.github.io/GLoader/) - JavaScript and stylesheet loader

GLoader is a resources loader for the Web with dependency and fallback management. The library is
very lightweight (about 7 kb minified, 2 kb minified and gziped).

JavaScript scripts and CSS stylesheets are supported.

## Why using a loader when I could directly add the resources into the HTML?

It can be tricky to load a bunch of libraries that depend on other libraries, in the right order,
and to ensure that no calls are being made to an unloaded library.

GLoader can load your resources both in parallel and sequentially, following a dependency graph
generated by the declared dependency relationships.

If for any reason a dependency could not be loaded and a fallback resource is specified, then
GLoader tries to load the fallback resource instead.

Using GLoader means for example that you should no longer worry to have errors such as
"$ is undefined" when you use a library that depends on jQuery.

## Usage

### Getting started

```
git clone https://github.com/gabsoftware/GLoader.git
cd GLoader
npm i
npm run build
```

Then you can use the gloader.es.js generated in the dist folder.

### Basics

Firstly, add the GLoader script in your head tag or at the end of the body tag:

```
<script type="text/javascript" src="gloader.es.js"></script>
```

You can find this script in the dist directory. Ensure that the following code is run <b>after</b>
GLoader has been loaded.

Instantiate a GLoader:

```
const gloader = new GLoader();
```

Then, add all your resources in GLoader:

```
gloader.addScript    ( "jquery"      , "jquery-3.2.1.min.js" );
gloader.addScript    ( "jqueryui"    , "jquery-ui.min.js"    );
gloader.addScript    ( "bootstrapjs" , "bootstrap.min.js"    );
gloader.addStylesheet( "bootstrapcss", "bootstrap.min.css"   );
gloader.addScript    ( "fontawesome" , "d1c21a858c.js"       );
gloader.addScript    ( "pdfmake"     , "pdfmake.min.js"      );
gloader.addScript    ( "pdfmakefonts", "vfs_fonts.js"        );
```

Then, declare the dependency relationships between all the resources:

```
gloader.addDependency( "jquery"     , "jqueryui"     );
gloader.addDependency( "jquery"     , "bootstrapjs"  );
gloader.addDependency( "bootstrapjs", "bootstrapcss" );
gloader.addDependency( "bootstrapjs", "pdfmake"      );
gloader.addDependency( "pdfmake"    , "pdfmakefonts" );
gloader.addDependency( "fontawesome", "pdfmakefonts" );
```

This gives the following dependency tree:

```
                    jqueryui
                  /
        jquery --                    bootstrapcss
                  \                /
                    bootstrapjs -- 
                                   \
                                     pdfmake -- 
                                                \
                                                 pdfmakefonts
                                                /
        fontawesome ---------------------------

steps : 1--------------2--------------3--------------4
1. jquery and fontawesome
2. jqueryui and bootstrapjs
3. bootstrapcss and pdfmake
4. pdfmakefonts
```

Finally, you can load all the resources in the right order with this simple call:

```
gloader.load();
```

The result should be the following:

- jquery and fontawesome are loaded in parallel
- then jquery ui and bootstrapjs are loaded in parallel
- then bootstrapcss and pdfmake are loaded in parallel
- then finally pdfmakefonts is loaded

**Note**: If any of the declared resource tries to load another resource by themselves, it usually
happens before the next step is loaded (for example, the fontawesome script will load some CSS and
fonts).

### Fallbacks

For each resource, you can provide a fallbacks URL that will be loaded in case the original resource
could not be loaded:

```
gloader.addScript( "jquery", {
    "url": "jquery-3.2.1.min.js",
    "fallback": "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"
});
gloader.addScript( "jqueryui", {
    "url": "jquery-ui.min.js",
    "fallback": "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
});
gloader.addScript( "bootstrapjs", {
    "url": "bootstrap.min.js",
    "fallback": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
});
gloader.addStylesheet( "bootstrapcss", {
    "url": "bootstrap.min.css",
    "fallback": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
});
gloader.addScript( "fontawesome", {
    "url": "d1c21a858c.js",
    "fallback": "https://use.fontawesome.com/d1c21a858c.js"
});
gloader.addScript( "pdfmake", {
    "url": "pdfmake.min.js",
    "fallback": "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.31/pdfmake.min.js"
});
gloader.addScript( "pdfmakefonts", {
    "url": "vfs_fonts.js",
    "fallback": "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.31/vfs_fonts.js"
});
```

### Callbacks

You can define a callback function that will be called right after a resource has been loaded:

```
// example of callback function without arguments and custom scope
gloader.addScript( "jquery", {
    "url": "jquery-3.2.1.min.js",
    "fallback": "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"
}, function() {
    console.log( "CALLBACK JQUERY" );
});

// example of callback function with arguments and custom scope
gloader.addScript( "jqueryui", {
    "url": "jquery-ui.min.js",
    "fallback": "https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
}, {
    "fn": function( a, b, c ) {
        console.log( "CALLBACK JQUERY-UI", a, b, c, this );
    },
    "args": [ 1, 2, "abc" ],
    "scope": {
        "that"  : "object",
        "is"    : "a",
        "custom": "scope"
    }
});
```

### Defered loading of resources

You can start loading all your resources after the HTML document has been fully loaded. Here's an
example that you can place either in your `head` or in your `body` tag:

```
<script type="text/javascript">
    function gloader_init() {
        // instantiate a new GLoader
        var gloader = new GLoader();

        // add the resources
        gloader.addScript    ( "jquery"      , "jquery-3.2.1.min.js" );
        gloader.addScript    ( "jqueryui"    , "jquery-ui.min.js"    );
        gloader.addScript    ( "bootstrapjs" , "bootstrap.min.js"    );
        gloader.addStylesheet( "bootstrapcss", "bootstrap.min.css"   );
        gloader.addScript    ( "fontawesome" , "d1c21a858c.js"       );
        gloader.addScript    ( "pdfmake"     , "pdfmake.min.js"      );
        gloader.addScript    ( "pdfmakefonts", "vfs_fonts.js"        );
        
        // define dependencies
        gloader.addDependency( "jquery"      , "jqueryui"            );
        gloader.addDependency( "jquery"      , "bootstrapjs"         );
        gloader.addDependency( "bootstrapjs" , "bootstrapcss"        );
        gloader.addDependency( "bootstrapjs" , "pdfmake"             );
        gloader.addDependency( "pdfmake"     , "pdfmakefonts"        );
        gloader.addDependency( "fontawesome" , "pdfmakefonts"        );

        // start to load the resources
        gloader.load();
    }
</script>
<script type="text/javascript" src="gloader.es.js" defer onload="gloader_init()"></script>
```

## API

<pre>
<b>addScript</b>( id, data, callback )
Add a script to load.
Parameters:
    <i>id</i>   (string)             : The id of the script to load
    <i>data</i> (string|object)      : The configuration data of the script to load. If a string is provided,
                                it should be a valid URL. It can also be an object:
        {
            <i>url</i>      (string) : The URL of the script to load
            <i>fallback</i> (string) : The fallback URL of the script to load, that will be used if the
                                script cannot be loaded with the url config
        }
    <i>callback</i> (function|object): The callback function to call when the script has been loaded. The
                                callback parameter can also be an object:
        {
            <i>fn</i>    (function)  : The callback function to call when the script has been loaded
            <i>args</i>  (array)     : An optional array of arguments that will be passed to the callback
                                function. By default it's [] (empty array).
            <i>scope</i> (object)    : The optional value of <i>this</i> for the callback function.
        }
Returns                       : nothing

<b>addStylesheet</b>( id, data, callback )
Add a stylesheet to load.
Parameters:
    <i>id</i>   (string)             : The id of the stylesheet to load
    <i>data</i> (string|object)      : The configuration data of the stylesheet to load. If a string is
                                provided, it should be a valid URL. It can also be an object:
        {
            <i>url</i>      (string) : The URL of the stylesheet to load
            <i>fallback</i> (string) : The fallback URL of the stylesheet to load, will be used if the
                                stylesheet cannot be loaded with the url config.
        }
    <i>callback</i> (function|object): The callback function to call when the stylesheet has been loaded. The
                                callback parameter can also be an object:
        {
            <i>fn</i>    (function)  : The callback function to call when the stylesheet has been loaded
            <i>args</i>  (array)     : An optional array of arguments that will be passed to the callback
                                function. By default it's [] (empty array).
            <i>scope</i> (object)    : The optional value of <i>this</i> for the callback function.
        }
Returns                       : nothing

<b>addResource</b>( id, data, type, callback )
Add a resource to load.
Parameters:
    <i>id</i>   (string)             : The id of the resource to load
    <i>data</i> (string|object)      : The configuration data of the resource to load. If a string, it should
                                be a valid URL. It can also be an object:
        {
            <i>url</i>      (string) : The URL of the resource to load
            <i>fallback</i> (string) : The fallback URL of the resource to load, will be used if the resource
                                cannot be loaded with the url config.
        }
    <i>type</i>     (string)         : The type of the resource to load. Accepted values are "js" and "css".
    <i>callback</i> (function|object): The callback function to call when the resource has been loaded. The
                                callback parameter can also be an object:
        {
            <i>fn</i>    (function)  : The callback function to call when the resource has been loaded
            <i>args</i>  (array)     : An optional array of arguments that will be passed to the callback
                                function. By default it's [] (empty array).
            <i>scope</i> (object)    : The optional value of <i>this</i> for the callback function.
        }
Returns                       : nothing

<b>removeResource</b>( id )
Remove a resource to load.
Parameters:
    <i>id</i> (string)               : The id of the resource
Returns                       : nothing

<b>hasResource</b>( id )
Check if a resource should be loaded
Parameters:
    <i>id</i> (string)               : The id of the resource
Returns (boolean)             : true if _id_ is a valid resource ID.

<b>addDependency</b>( idfrom, idto )
Declare a dependency relationship between two resources
Parameters:
    <i>idfrom</i> (string)           : The id of the resource on which depends the resource identified by
                                the <i>idto</i> parameter
    <i>idto</i>   (object)           : The id of the resource that depends on the resource identified by
                                the <i>idfrom</i> parameter
Returns                       : nothing

<b>removeDependency</b>( from, to )
Remove a dependency relationship between two resources
Parameters:
    <i>idfrom</i> (string)           : The id of the resource on which depends the resource identified by
                                the <i>idto</i> parameter
    <i>idto</i>   (object)           : The id of the resource that depends on the resource identified by
                                the <i>idfrom</i> parameter
Returns                       : nothing

<b>getData</b>( id )
Get the data object attached to a resource
Parameters:
    <i>id</i> (string)               : The id of the resource
Returns (object)              : The resource data
    {
        <i>url</i>      (string)     : The URL of the resource to load
        <i>fallback</i> (string)     : The fallback URL of the resource to load, will be used if the resource
                                cannot be loaded with the url config
        <i>type</i>     (string)     : The type of the resource to load. Valid values are "js" and "css".
    }

<b>loadResource</b>( id )
Load the resource identified by id
Parameters:
    <i>id</i> (string)               : The id of the resource to load
Returns (Promise)             : A promise that will be fulfilled when the resource has been
                                loaded

<b>loadResources</b>( step )
Load an array of id of resources that should be loaded in parallel (a step)
Parameters:
    <i>step</i> (Array)              : An array of the id of the resources to load in parallel
Returns (Promise)             : A promise that will be fulfilled when all the resources of the step
                                have been loaded

<b>sequence</b>( tasks, fn )
Helper function to run sequencially several async tasks
Parameters:
    <i>tasks</i> (Array)             : An array of steps, a step being an array of id of resources to load
    <i>fn</i>    (function)          : The function to run for each step
Returns (Promise)             : A promise that will be fulfilled when all the resources of each
                                steps have be loaded

<b>load</b>()
Load all the resources, step by step
Parameters                    : (none)
Returns (Promise)             : A promise fulfilled after all the resources of each steps have been
                                loaded
</pre>

LICENSE: MIT
AUTHOR: Gabriel Hautclocq (GabSoftware)