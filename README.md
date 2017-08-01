## GLoader

GLoader is a Web resources loader with dependency management.

Useful whenever you have a bunch of libraries to load with some libraries depending on another.

## API

<pre>
    <b>addScript</b>( id, data )  
    Add a script to load.  
    Parameters:  
    <b>id</b>   (string): the id of the script to load  
    <b>data</b> (object): the configuration data of the script to load  
    {  
        <i>url</i>      (string): the URL of the script to load  
        <i>fallback</i> (string): the fallback URL of the script to load, will be used if the script cannot be loaded with the url config  
    }  
    Returns: nothing  
    
    <b>addStylesheet</b>( id, data )  
    Add a stylesheet to load.  
    Parameters:  
    <b>id</b>   (string): the id of the stylesheet to load  
    <b>data</b> (object): the configuration data of the stylesheet to load  
    {  
        <i>url</i>      (string): the URL of the stylesheet to load  
        <i>fallback</i> (string): the fallback URL of the stylesheet to load, will be used if the stylesheet cannot be loaded with the url config  
    }  
    Returns: nothing  
    
    <b>addResource</b>( id, data, type )  
    Add a resource to load.  
    Parameters:  
    <b>id</b>   (string): the id of the resource to load  
    <b>data</b> (object): the configuration data of the resource to load  
    {  
        <i>url</i>      (string): the URL of the resource to load  
        <i>fallback</i> (string): the fallback URL of the resource to load, will be used if the resource cannot be loaded with the url config  
    }  
    <b>type</b> (string): the type of the resource to load. Accepted values are "js" and "css".  
    Returns: nothing  
    
    <b>removeResource</b>( id )  
    Remove a resource to load.  
    Parameters:  
    <b>id</b>   (string): the id of the resource  
    Returns: nothing  
    
    <b>hasResource</b>( id )  
    Check if a resource should be loaded  
    Parameters:  
    <b>id</b>   (string): the id of the resource  
    Returns (boolean): true if _id_ is a valid resource ID.  
    
    <b>addDependency</b>( idfrom, idto )  
    Declare a dependency relationship between two resources  
    Parameters:  
    <b>idfrom</b> (string): the id of the resource on which depends the resource identified by the _idto_ parameter  
    <b>idto</b>   (object): the id of the resource that depends on the resource identified by the _idfrom_ parameter  
    Returns: nothing  
    
    <b>removeDependency</b>( from, to )  
    Remove a dependency relationship between two resources  
    Parameters:  
    <b>idfrom</b> (string): the id of the resource on which depends the resource identified by the _idto_ parameter  
    <b>idto</b>   (object): the id of the resource that depends on the resource identified by the _idfrom_ parameter  
    Returns: nothing  
    
    <b>getData</b>( id )  
    Get the data object attached to a resource  
    Parameters:  
    <b>id</b>   (string): the id of the resource  
    Returns (object): the resource data  
    {  
        <i>url</i>      (string): the URL of the resource to load  
        <i>fallback</i> (string): the fallback URL of the resource to load, will be used if the resource cannot be loaded with the url config  
        <i>type</i>     (string): the type of the resource to load. Valid values are "js" and "css".  
    }  
    
    <b>loadResource</b>( id )  
    Load the resource identified by id  
    Parameters:  
    <b>id</b>   (string): the id of the resource to load  
    Returns (Promise): a promise that will be fulfilled when the resource has been loaded  
    
    <b>loadResources</b>( step )  
    Load an array of id of resources that should be loaded in parallel (a step)  
    Parameters:  
    <b>step</b>  (Array): an array of the id of the resources to load in parallel  
    Returns (Promise): a promse that will be fulfilled when all the resources of the step have been loaded  
    
    <b>sequence</b>( tasks, fn )  
    Helper function to run sequencially several async tasks  
    Parameters:  
    <b>tasks</b> (Array)   : An array of steps, a step being an array of id of resources to load  
    <b>fn</b>    (function): the function to run for each step  
    Returns (Promise)   : a promise that will be fulfilled when all the resources of each steps have be loaded  
    
    <b>load</b>()  
    Load all the resources, step by step  
    Parameters       : (none)  
    Returns (Promise): a promise fulfilled after all the resources of each steps have be loaded  
</pre>

## Usage

First, add GLoader script in your head tag or at the end of the body tag:

```
<script type="text/javascript" src="gloader-all.min.js"></script>
```

You can find this script in the dist directory.

Then, instanciate a GLoader:

```
var gloader = new GLoader();
```

Then, add all your resources in GLoader:

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

Then, declare the dependencies between all the resources:
```
gloader.addDependency( "jquery"     , "jqueryui"     );
gloader.addDependency( "jquery"     , "bootstrapjs"  );
gloader.addDependency( "bootstrapjs", "bootstrapcss" );
gloader.addDependency( "bootstrapjs", "pdfmake"      );
gloader.addDependency( "pdfmake"    , "pdfmakefonts" );
gloader.addDependency( "fontawesome", "pdfmakefonts" );
```

This give the following dependency tree:

```
                    jqueryui
                  /                 bootstrapcss
        jquery --                 /
                  \ bootstrapjs - 
                                  \
                                    pdfmake - 
                                              \
                                                pdfmakefonts
                                              /
        fontawesome -------------------------
```

Finally, you can load the resources:

```
gloader.load();
```