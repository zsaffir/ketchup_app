//resume app
Ti.App.addEventListener('resume', function() {
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
	if(f.exists()) {
		var contents = f.read();
		var upload_info = JSON.parse(contents.text);

		if(upload_info.request_id != '') {
			Ti.App.fireEvent('app:check_for_upload_in_progress', {
				request_id : upload_info.request_id
			});
		}
	}
});

//check for upload file
Ti.App.addEventListener('app:resume:respond_to_existing_upload_file', function(e) {
	var request_id = e.request_id;
	var upload_in_progress = e.upload_in_progress;
	var ketchup_server = e.ketchup_server;

	if(upload_in_progress == 'Y') {
		/*var xhr = Ti.Network.createHTTPClient();
		xhr.onload = function(e) {
			var response = JSON.parseJSON.parse(this.responseText);

			if(response.message == 'D') {
				upload_success();
			}
			else {
				upload_failure();
			}
		};
		xhr.onerror = function(e) {
			var notification = Ti.UI.createAlertDialog({
				title: 'Error',
				message: 'Could not communicate with KetchUp server',
				ok: ':('
			});

			notification.show();
		};

		xhr.open('POST', ketchup_server.domain+'/fn_api_check_request_status.php');
		xhr.send({
			api_key: ketchup_server.api_key,
			api_pw: ketchup_server.api_pw,
			request_id: request_id
		});*/
	}
	else {
		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
		f.deleteFile();
	}
});

//****************************************************************************************************


