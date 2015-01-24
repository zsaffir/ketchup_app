//****************************************************************************************************
//functions

function get_listen_directory() {
	var listen_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'listen');
	if(!listen_dir.exists()) {
		listen_dir.createDirectory();
		listen_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'listen');
	}

	return listen_dir.name;
}

function get_recording_directory() {
	var upload_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'recording');
	if(!upload_dir.exists()) {
		upload_dir.createDirectory();
		upload_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'recording');
	}

	return upload_dir.name;
}

function get_upload_directory() {
	var upload_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'upload');
	if(!upload_dir.exists()) {
		upload_dir.createDirectory();
		upload_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'upload');
	}

	return upload_dir.name;
}

function get_json_directory() {
	var json_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json');
	if(!json_dir.exists()) {
		json_dir.createDirectory();
		json_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json');
	}

	return json_dir.name;
}

//****************************************************************************************************
//background service (from http://bencoding.com/2012/06/10/using-local-notifications-in-titanium/)
if (Ti.Platform.name == 'android') {
	/*var SECONDS = 10;
	// every 10 minutes
	var intent = Titanium.Android.createServiceIntent({
		url : 'bg.js'
	});
	intent.putExtra('interval', SECONDS * 1000);
	//in millimeter
	var service = Titanium.Android.createService(intent);
	service.start();*/
	
	var win = Ti.UI.createWindow({navBarHidden:true});
}
else {
	// register a background service. this JS will run when the app is backgrounded
	var service = Ti.App.iOS.registerBackgroundService({url:'bg.js'});
	
	var win = Ti.UI.createWindow({
		statusBarStyle: Ti.UI.iPhone.StatusBar.OPAQUE_BLACK
	});
}

//****************************************************************************************************
//create window and webview

// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Ti.UI.setBackgroundColor('#ccc');

//if we have user data, we will generate a different webview
var got_user = '';
var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'user_info.json');
if(f.exists()) {
	var contents = f.read();
	var user_info = JSON.parse(contents.text);
	
	if(user_info.user_id != '') {
		got_user = 'Y';
	}
}

if(got_user == 'Y') {
	var webview = Ti.UI.createWebView({
		url: '/HTML/fn_sign_in.html'
	});	
}
else {
	var webview = Ti.UI.createWebView({
		url: '/HTML/index.html'
	});
}

//****************************************************************************************************
//includes

Ti.include('listen.js'); //listen screen
Ti.include('request.js'); //request
Ti.include('recorder.js'); //recorder
Ti.include('player.js'); //player
Ti.include('signin.js'); //persistent sign in
Ti.include('notify.js'); //notifications
Ti.include('resume.js'); //resume app (handle upload that completed properly)
Ti.include('badge.js'); //badge update
Ti.include('canvas.js'); //canvas

//****************************************************************************************************
//add event listeners

//open link in safari
Ti.App.addEventListener('app:app:open_url_safari', function(e) {
	Titanium.Platform.openURL(e.url);
});

//****************************************************************************************************
//load the main HTML

win.add(webview);
win.open();

