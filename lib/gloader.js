/*
 * GLoader - Web resources loader
 * Author  : Gabriel Hautclocq
 * URL     : https://github.com/gabsoftware/gloader
 * License : MIT
 *
 */
"use strict";
const DepGraph = require('dependency-graph').DepGraph;

export default class GLoader {

    constructor() {
        this.graph = new DepGraph();
        this.validTypes = [ "js", "css" ];
    }

    /**
    * Add a script to the dependency graph. If a dependency already exists with this id, this method will do nothing.
    */
    addScript( id, data, callback ) {
        return this.addResource( id, data, "js", callback );        
    }


    /**
    * Add a stylesheet to the dependency graph. If a dependency already exists with this id, this method will do nothing.
    */
    addStylesheet( id, data, callback ) {
        return this.addResource( id, data, "css", callback );
    }

    /**
    * Add a generic resource to the dependency graph. If a dependency already exists with this id, this method will do nothing.
    */
    addResource( id, data, type, callback ) {
        if( ! id ) {
            throw new Error( "id was empty" );
        }
        if( typeof id !== "string" ) {
            throw new Error( "id was not a string" );
        }
        if( ! data ) {
            throw new Error( "data was empty for script #" + id );
        }
        // if data is a string, consider it as an URL
        if( typeof data === "string" ) {
            data = { "url": data };
        }
        if( typeof data !== "object" ) {
            throw new Error( "data was not an object or a string for #" + id );
        }
        if( ! data.url || typeof data.url !== "string" ) {
            throw new Error( "data.url was not a string for #" + id );
        }
        if( data.fallback && typeof data.fallback !== "string" ) {
            throw new Error( "data.fallback was not a string for #" + id );
        }
        if( ! type ) {
            throw new Error( "type cannot be empty for #" + id );
        }
        if( typeof type !== "string" ) {
            throw new Error( "type was not a string for #" + id );
        }
        if( this.validTypes.indexOf( type ) === -1 ) {
            throw new Error( "type was not a valid value for #" + id );
        }

        data.type = type;
        if( callback ) {
            data.callback = callback;
        }

        return this.graph.addNode( id, data );
    }

    /**
    * Remove a resource from the dependency graph.
    */
    removeResource( id ) {
        return this.graph.removeNode( id );
    }

    hasResource( id ) {
        return this.graph.hasNode( id );
    }

    addDependency( idfrom, idto ) {
        return this.graph.addDependency( idfrom, idto );
    }

    removeDependency( from, to ) {
        return this.graph.removeDependency( idfrom, idto );
    }

    getData( id ) {
        return this.graph.getNodeData( id );
    }

    loadResource( id ) {
        const self = this;

        return new Promise( function( resolve, reject ) {

            const obj  = self.getData( id );
            const url  = obj.url,
                  type = obj.type,
                  clbk = obj.callback;


            let r = false, t, s;

            if( type === "js" ) {
                t        = document.getElementsByTagName( "script" )[0];
                s        = document.createElement       ( "script" );
                s.type   = "text/javascript";
                s.src    = url;
                s.defer  = true;
            } else if( type === "css" ) {
                s = document.createElement( "link"  );
                s.type   = "text/css";
                s.rel    = "stylesheet";
                s.href   = url;
            }

            s.onload = s.onreadystatechange = function () {
                if( ! r && ( ! this.readyState || this.readyState === "complete" ) ) {
                    r = true;
                    resolve( this );
                    if( typeof clbk === "function" ) {
                        clbk.call( this );
                    } else if( typeof clbk === "object" && typeof clbk.fn === "function" ) {
                        clbk.fn.apply(
                            ( clbk.scope ? clbk.scope : this ),
                            ( typeof clbk.args === "object" && clbk.args.length ? clbk.args : [] )
                        );
                    }
                }
            };

            // if no fallback specified, reject the promise directly
            if( ! obj.fallback ) {
                s.onerror = s.onabort = reject;
            } else {
                s.onerror = s.onabort = function( message ) {


                    const url2  = obj.fallback,
                          type2 = obj.type,
                          clbk2 = obj.callback;


                    let r2 = false, t2, s2;

                    if( type2 === "js" ) {
                        t2 = document.getElementsByTagName("script")[0];
                        s2 = document.createElement("script");
                        s2.type   = "text/javascript";
                        s2.src    = url2;
                        s2.defer  = true;
                    } else if( type2 === "css" ) {
                        s2 = document.createElement( "link"  );
                        s2.type   = "text/css";
                        s2.rel    = "stylesheet";
                        s2.href   = url2;
                    }

                    s2.onload = s.onreadystatechange = function () {
                        if( ! r2 && ( ! this.readyState || this.readyState === "complete" ) ) {
                            r2 = true;
                            resolve( this );
                            if( typeof clbk2 === "function" ) {
                                clbk2.call( this );
                            } else if( typeof clbk2 === "object" && typeof clbk2.fn === "function" ) {
                                clbk2.fn.apply(
                                    ( clbk2.scope ? clbk2.scope : this ),
                                    ( typeof clbk2.args === "object" && clbk2.args.length ? clbk2.args : [] )
                                );
                            }
                        }
                    };

                    s2.onerror = s2.onabort = reject;

                    if( type2 === "css" ) document.body.appendChild ( s2     );
                    else                  t2.parentNode.insertBefore( s2, t2 );
                };
            }
            if( type === "css" ) document.body.appendChild( s    );
            else                 t.parentNode.insertBefore( s, t );
        });
    }

    // load an array of resources (a step) in parallel
    loadResources( step ) {
        const self = this;
        const proms = [];
        let prom;
        for( s of step ) {
            prom = self.loadResource( s );
            proms.push( prom );
        }
        return Promise.all( proms );
    }

    // helper function to run sequencially several async tasks
    sequence( tasks, fn ) {
        const self = this;
        return tasks.reduce(
            ( promise, task ) => promise.then(
                ( onFulfilled, onRejected ) => fn( task ).bind( self )
            ).bind( self )
        , Promise.resolve() );
    }

    // begin the loading of the resources
    load() {
        const self = this;

        const steps = self.graph.steps();
        if( ! steps || ! Array.isArray( steps ) || ! steps.length ) {
            throw new Error( "nothing to load" );
        }

        // launch the resources loading sequence
        return self.sequence( steps, self.loadResources.bind( self ) ).then( ( onFulfilled, onRejected ) => {
            // (optional) code to execute when all the resources have been loaded
        }, ( message ) => {
            // (optionnal) code to execute if any resource can't be loaded            
        });
    }
}