var rl = require( 'readline' ).createInterface( { input: process.stdin, output: process.stdout } );
var fs = require( 'fs' );
var ps = require( 'path' );
var _  = require( 'lodash' );

var packagePath = './package.json';
var defaultBoilerplatesPath = ps.join( process.env.HOME, '.boilerplates/' );

var _getBoilerplatesPath = function () {
	return JSON.parse( fs.readFileSync( packagePath ) ).boilerplates;
};
var _getBoilerplateDescription = function ( path ) {
	var description = 'No description';
	var pkgPath = ps.join( path, 'package.json' );
	if ( fs.existsSync( pkgPath ) ) {
		description = JSON.parse( fs.readFileSync( pkgPath ) ).description;
	}
	return description;
};
var _writeboilerplatesPath = function ( path ) {
	var json = JSON.parse( fs.readFileSync( packagePath ) );
	json.boilerplates = path;
	fs.writeFileSync( packagePath, JSON.stringify( json ) );
};
var init = function () {
	rl.question( 'enter boilerplates directory path. (default=' + defaultBoilerplatesPath + ')\n', function ( path ) {
		if ( !path ) path = defaultBoilerplatesPath;
		if ( !fs.existsSync( path ) ) fs.mkdirSync( path );
		_writeboilerplatesPath( path );
		console.log( 'set boilerplates path: ' + path );
		rl.close();
	} );
};
var generate = function ( name, options ) {
	console.log("@name,options:", name,options);
};
var list = function () {
	var bpp = _getBoilerplatesPath();
	_.chain( fs.readdirSync( bpp ) ).map( function ( file ) {
		return {
			name: file,
			path: ps.join( bpp, file )
		};
	} ).filter( function ( obj ) {
		return fs.lstatSync( obj.path ).isDirectory();
	} ).map( function ( obj ) {
		obj.description = _getBoilerplateDescription( obj.path );
		return obj;
	} ).each( function ( obj ) {
		console.log( 'Boilerplate: ' + obj.name + ' (' + obj.path + ')' );
		console.log( '\t' + obj.description );
		console.log();
	} );
};

module.exports = {
	_getBoilerplatesPath: _getBoilerplatesPath,
	_writeboilerplatesPath: _writeboilerplatesPath,
	init: init,
	generate: generate,
	list: list
};
