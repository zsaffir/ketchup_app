var interval = setInterval(check_for_notifications, (1000 * 60 * 15)); //check every 15 minutes

function get_json_directory() {
	var json_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json');
	if(!json_dir.exists()) {
		json_dir.createDirectory();
		json_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'json');
	}

	return json_dir.name;
}

function check_for_notifications() {
	//server info
	var ketchup_server = new Object();
	ketchup_server.domain = 'https://www.ketchuptechnology.com/education';
	ketchup_server.api_key = 'this_is_the_api_key';
	ketchup_server.api_pw = 'this_is_the_api_pw';

	//get user email (we can only proceed if they are signed in persistently)
	
	var canvas_domain = '';
	var canvas_access_token = '';
	var user_id = '';
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'user_info.json');
	if(f.exists()) {
		var contents = f.read();
		var user_info = JSON.parse(contents.text);

		if(user_info.canvas_access_token) {
			canvas_access_token = user_info.canvas_access_token;
			canvas_domain = user_info.canvas_domain;
			user_id =user_info.user_id;
			if(canvas_access_token != '') {
				//http request goes here
				var xhr = Ti.Network.createHTTPClient();
				xhr.onload = function(e) {
					var response = JSON.parse(this.responseText);

					if (response.success == true) {
						var arr_unviewed_counts = response.unviewed_counts;

						var badge_value = 0;
						if(arr_unviewed_counts.requests) {
							badge_value += parseInt(arr_unviewed_counts.requests);
						}
						if(arr_unviewed_counts.recordings) {
							badge_value += parseInt(arr_unviewed_counts.recordings);
						}

						//update badge
						Ti.UI.iPhone.appBadge = badge_value;
					}
				};
				xhr.onerror = function(e) {
					//do nothing (dont update badge)
				};

				xhr.open('GET', ketchup_server.domain+'/fn_api_get_unviewed_counts.php?version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&user_id='+encodeURIComponent(user_id) + '&canvas_access_token='+encodeURIComponent(canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_domain));
				xhr.send();
			}
		}
	}
}