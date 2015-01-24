//persistent sign on info is based on https://wiki.appcelerator.org/display/guides/Filesystem+Access+and+Storage
//store user info for persistent sign on
Ti.App.addEventListener('app:signin:store_user_info', function(e){
	var canvas_domain = e.canvas_domain;
	var canvas_access_token = e.canvas_access_token;
	var user_id = e.user_id;
	var user_name = e.user_name;

	//based on https://wiki.appcelerator.org/display/guides/Filesystem+Access+and+Storage
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'user_info.json');
	if(f.exists()) {
		f.deleteFile();
	}
	f.write('{"canvas_domain": "'+canvas_domain+'", "canvas_access_token": "'+canvas_access_token+'", "user_id": "'+user_id+'", "user_name": "'+user_name+'"}');
});

//retrieve stored info to sign user in (persistent sign on)
Ti.App.addEventListener('app:signin:sign_in', function(e){
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'user_info.json');
	if(f.exists()) {
		var contents = f.read();
		var user_info = JSON.parse(contents.text);

		Ti.App.fireEvent('app:fn_signin_html:sign_in_redirect', {
			canvas_domain : user_info.canvas_domain,
			canvas_access_token : user_info.canvas_access_token,
			user_id : user_info.user_id,
			user_name : user_info.user_name
		});
	}
});

//remove stored info to sign user out (persistent sign on)
Ti.App.addEventListener('app:signin:remove_user_info', function(e){
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'user_info.json');
	f.deleteFile();

	//remove badge
	Ti.UI.iPhone.appBadge = 0;

	//delete recordings
	
});