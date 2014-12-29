var rl      = require( 'readline' ).createInterface( { input: process.stdin, output: process.stdout } );
var fs      = require( 'fs' );
var colors  = require( 'colors' );
var ps      = require( 'path' );
var wrench  = require( 'wrench' );
var _       = require( 'lodash' );

var packagePath = ps.join( __dirname, 'package.json' );
var defaultBoilerplatesPath = ps.join( process.env.HOME, '.boilerplates/' );

var _getBoilerplatesPath = function () {
	return JSON.parse( fs.readFileSync( packagePath ) ).boilerplates;
};

var _getBoilerplateDescription = function ( path ) {
	var description = 'No description'.yellow;
	var pkgPath = ps.join( path, 'package.json' );
	if ( fs.existsSync( pkgPath ) ) {
		description = ( '' + JSON.parse( fs.readFileSync( pkgPath ) ).description ).blue;
	}
	return description;
};

var _writeboilerplatesPath = function ( path ) {
	var json = JSON.parse( fs.readFileSync( packagePath ) );
	json.boilerplates = path;
	fs.writeFileSync( packagePath, JSON.stringify( json ) );
};

var _checkBoilerplatesPath = function () {
	if ( !_getBoilerplatesPath() ) {
		console.log( 'run `birth init` at first'.bold.red );
		process.exit();
	}
};

var init = function () {
	console.log( ( 'current boilerplates directory path: ' + _getBoilerplatesPath() ).bold );
	rl.question( 'enter new boilerplates directory path. (default=' + defaultBoilerplatesPath + ')\n', function ( path ) {
		if ( !path ) path = defaultBoilerplatesPath;
		if ( !fs.existsSync( path ) ) fs.mkdirSync( path );
		_writeboilerplatesPath( path );
		console.log( ( 'set boilerplates path: ' + path ).blue );
		rl.close();
		process.exit();
	} );
};

var generate = function ( name, options ) {
	_checkBoilerplatesPath();
	var path = ps.join( _getBoilerplatesPath(), name );
	if ( !fs.existsSync( path ) || !fs.lstatSync( path ).isDirectory() ) {
		console.log( ( 'No Boilerplate \'' + name + '\' available' ).red );
	} else {
		var dest = process.cwd();
		if ( options.path ) dest = options.path;
		dest = ps.join( dest, name );
		wrench.copyDirSyncRecursive( path, dest );
		console.log( ( name + ' successfully generated!' ).blue );
	}
	process.exit();
};

var list = function () {
	_checkBoilerplatesPath();
	var bpp = _getBoilerplatesPath();
	var lsfile = fs.readdirSync( bpp );
	if ( lsfile.length === 0 ) {
		console.log( 'No boilerplate available'.blue );
	} else {
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
			console.log( ( 'Boilerplate: ' + obj.name + ' (' + obj.path + ')' ).blue.bold );
			console.log( ( '\t' + obj.description ) );
			console.log();
		} );
	}
	process.exit();
};

var regist = function ( newBpPath ) {
	_checkBoilerplatesPath();
	if ( !fs.existsSync( newBpPath ) || !fs.lstatSync( newBpPath ).isDirectory() ) {
		console.log( ( 'Boilerplate not found in ' + newBpPath ).red );
	} else {
		wrench.copyDirSyncRecursive( newBpPath, ps.join( _getBoilerplatesPath(), ps.basename( newBpPath ) ) );
		console.log( ( 'New boilerplate ' + ps.basename( newBpPath ) + ' successfully added' ).blue );
	}
	process.exit();
};

var unregist = function ( bpName ) {
	_checkBoilerplatesPath();
	var path = ps.join( _getBoilerplatesPath(), bpName );
	if ( !fs.existsSync( path ) || !fs.lstatSync( path ).isDirectory() ) {
		console.log( ( bpName + ' Boilerplate not found' ).red );
		process.exit();
	} else {
		rl.question( 'really unregist ' + bpName + ' ?\n[y/N]', function ( answer ) {
			if ( answer === 'y' ) {
				wrench.rmdirSyncRecursive( path );
				console.log( ( bpName + ' Boilerplate unregisted' ).blue );
			}
			rl.close();
		} );
	}
};

module.exports = {
	_getBoilerplatesPath: _getBoilerplatesPath,
	_writeboilerplatesPath: _writeboilerplatesPath,
	init: init,
	generate: generate,
	list: list,
	regist: regist,
	unregist: unregist
};
