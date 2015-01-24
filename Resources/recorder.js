//for recording
var recording = '';
var recording_xhr = '';
var androidfile = '';

//for pause/resume
var create_new_recording = false;
var queued_recording = '';

//****************************************************************************************************

function start_recording(request_id, ketchup_server) {
	var recording_started = false;

	if((Ti.Platform.name == 'iPhone OS') && (!Ti.Media.canRecord)) {
		Ti.UI.createAlertDialog({
			title:'Recording Error',
			message:'No audio recording hardware is currently connected.'
		}).show();
	}
	else {
		//require 100MB available to make the recording
		var space_available = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory()).spaceAvailable();
		if(space_available < 104857600) {
			Ti.UI.createAlertDialog({
				title:'Recording Error',
				message:'You must have at least 100MB of space free to start a recording'
			}).show();

			f.deleteFile();
		}
		else {
			recording_started = true;

			Ti.App.idleTimerDisabled = true;

			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
			if(f.exists()) {
				f.deleteFile();
			}
			f.write('{"request_id": '+request_id+', "ketchup_server": '+JSON.stringify(ketchup_server)+'}');

			if (Ti.Platform.name == 'iPhone OS') {
				if(recording != '') {
					stop_recording(request_id, false);
					var start_recording_delay = 5000;
				}
				else {
					Ti.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_RECORD; //this should be set every time once we have this optimized	
					var start_recording_delay = 0;
				}

				queued_recording = setTimeout(function() {
					queued_recording = '';
					create_new_recording = false;

					recording = Ti.Media.createAudioRecorder({
						compression: Ti.Media.AUDIO_FORMAT_AAC,
						format: Ti.Media.AUDIO_FILEFORMAT_MP4
					});
					recording.start();

					Ti.API.debug('recording started');
				}, start_recording_delay);

				if(recording.stopped == true) {
					//have to figure out how to handle this scenario
				}
			}
			else if(Ti.Platform.name == 'android') {
				var intent = Ti.Android.createIntent({ 
					action: 'android.provider.MediaStore.RECORD_SOUND'
				});
				var curActivity = win.getActivity();
				curActivity.startActivityForResult(intent, function(e) {
					if (e.error) {
						Ti.API.info('Error: '+e.error);
						Ti.UI.createAlertDialog({
							title: 'Error!',
							message: e.error
						}).show();    
					}
					else {
						if (e.resultCode === Ti.Android.RESULT_OK) {
							recording = Ti.Filesystem.getFile(e.intent.data);
						}
						else {
							Ti.API.info('Cancel/Error? Result code:'+e.resultCode);
							Ti.UI.createAlertDialog({
								title: 'Error!',
								message: 'Canceled/Error? Result code: ' + e.resultCode
							}).show();
							return;
						}
					}
				});
			}
		}
	}

	return recording_started;
}

function pause_recording() {
	if(recording.paused == true) {
		resume_recording();
	}
	else {
		if (Ti.Platform.name == 'iPhone OS') {
			recording.pause();
		}
		else if(Ti.Platform.name == 'android') {
			Ti.UI.createAlertDialog({
				title: 'Cannot Pause Recording',
				message: 'The Pause function is not yet available on Android.'
			}).show();
		}
	}
}
function resume_recording() {
	if (Ti.Platform.name == 'iPhone OS') {
		recording.resume();
	}
	else if(Ti.Platform.name == 'android') {
		Ti.UI.createAlertDialog({
			title: 'Cannot Resume Recording',
			message: 'The Resume function is not yet available on Android.'
		}).show();
	}
}

function get_recording_counts_by_request_id() {
	var counts_by_request_id = new Array();

	var recording_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory());
	var directory_listing = recording_dir.getDirectoryListing();

	var count_directory_files = directory_listing.length;
	for(var j=0;j<count_directory_files;j++) {
		var filename = directory_listing[j];

		//parse request id
		var request_id = filename;
		request_id = request_id.substr(0, request_id.length - 4); //take out extension
		request_id = request_id.substr(3); //take out 'rec'

		var pt_index = request_id.indexOf('pt');
		request_id = request_id.substr(0, pt_index);

		if (typeof(counts_by_request_id[request_id]) == 'undefined') {
			counts_by_request_id[request_id] = 0;
		}
		counts_by_request_id[request_id]++;
	}

	return counts_by_request_id;
}

function stop_recording(request_id, do_upload, ketchup_server, dropbox_server) {
	Ti.API.debug('stopping recording');
	if(do_upload != true) {
		Ti.API.debug('intent is to start a new one');
	}

	if(Ti.Platform.name != 'android') {
		//reset queued recording
		clearTimeout(queued_recording);
		queued_recording = '';
	}

	if(recording != '') {		
		//**********
		//move to recording queue
		//**********
		//in an odd scenario, we could have files in the recording queue from multiple sets of request ids
		//thus we first check how many go with each request id

		var counts_by_request_id = get_recording_counts_by_request_id();

		if (typeof(counts_by_request_id[request_id]) == 'undefined') {
			var new_filename = 'rec'+request_id+'pt1.mp4';
		}
		else {
			var new_filename = 'rec'+request_id+'pt'+(counts_by_request_id[request_id] + 1)+'.mp4';	
		}
		
		var new_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory(), new_filename);
		
		//get file
		if (Ti.Platform.name == 'iPhone OS') {
			var file = recording.stop();
			file.move(new_file.nativePath);
		}
		else if(Ti.Platform.name == 'android') {
			var file = recording;
			Ti.UI.createAlertDialog({
				title: 'android file',
				message: JSON.stringify(file)
			}).show();
			//android wont remame on them ove so move to a slightly different location
			//file.move(new_file.nativePath);

			//for whatever reason the file doesnt rename on android. get the file and rename it (we have to get it again because we moved it)
			//file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory(), new_filename);

		}
	}
	
	//reset recording variable
	recording = '';

	//if do_upload is false, we are still recording and are not yet ready to upload
	if(do_upload == true) {
		Ti.API.debug('we will do an upload');

		Ti.App.idleTimerDisabled = false;

		//**********
		//move to upload queue
		//**********
		var counts_by_request_id = get_recording_counts_by_request_id();

		var recording_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory());
		var directory_listing = recording_dir.getDirectoryListing();

		var count_directory_files = directory_listing.length;
		for(var j=0;j<count_directory_files;j++) {
			var filename = directory_listing[j];
			var old_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_recording_directory(), filename);

			Ti.API.debug('original filename: '+filename);

			//parse request id and file index
			var request_id_2 = filename;
			request_id_2 = request_id_2.substr(0, request_id_2.length - 4); //take out extension
			request_id_2 = request_id_2.substr(3); //take out 'rec'

			var pt_index = request_id_2.indexOf('pt');
			var file_index = request_id_2.substr(pt_index + 2);
			request_id_2 = request_id_2.substr(0, pt_index);

			var new_filename = 'rec'+request_id_2;
			if(counts_by_request_id[request_id_2] > 1) {
				new_filename += 'pt'+file_index+'of'+counts_by_request_id[request_id_2];
			}
			new_filename += '.mp4';

			Ti.API.debug('new filename: '+new_filename);

			var new_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_upload_directory(), new_filename);
			old_file.move(new_file.nativePath);
		}

		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
		f.deleteFile();
		
		//do file upload
		upload_recordings(ketchup_server, dropbox_server, false);
	}
}

function upload_recordings(ketchup_server, dropbox_server, override_wifi) {
	var files_to_upload = get_files_to_upload();

	if((Ti.Network.getNetworkType() == Ti.Network.NETWORK_WIFI) || (override_wifi == true)) {
		if(files_to_upload.length > 0) {
			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
			f.write('{"uploading": true}');

			upload_single_file(0, files_to_upload, ketchup_server, dropbox_server);
		}
		else {
			upload_failure('There were no files to upload', true);
		}
	}
	else {
		var notification = Ti.UI.createAlertDialog({
			message: 'Recordings are large and could constitute a large portion of your data plan. Are you sure you want to upload now?',
			title: 'No WiFi Connection',
			buttonNames: ['Yes', 'No']
		});

		notification.addEventListener('click', function(e) {
			if(e.index == 0) {
				upload_recordings(ketchup_server, dropbox_server, true);
			}
			else if(e.index == 1) {
				Ti.App.fireEvent('app:all:file_upload_error');
			}
		});

		notification.show();
	}
}

function upload_single_file(files_to_upload_index, files_to_upload, ketchup_server, dropbox_server) {
	var count_files_to_upload = files_to_upload.length;
	var filename = files_to_upload[files_to_upload_index].filename;
	var request_id = files_to_upload[files_to_upload_index].request_id;

	Ti.API.debug('beginning upload of file #'+(files_to_upload_index + 1)+' of '+count_files_to_upload);

	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_upload_directory(), filename);
	
	recording_xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			var dropbox_file_info = JSON.parse(this.responseText);
			insert_db_entry(files_to_upload_index, files_to_upload, dropbox_file_info, dropbox_server, ketchup_server);
		},
		onerror: function(e) {
			upload_failure('Could not upload the file: ' + e.error, false);
		},
		onsendstream: function(e) {
			Ti.App.fireEvent('app:all:update_upload_progress', {
				current_file_progress: e.progress,
				current_file_index: files_to_upload_index,
				count_files: count_files_to_upload
			});
		},
		timeout: 1000 * 60 * 20 //20 minutes
	});
	
	recording_xhr.open('POST', dropbox_server.domain+'?overwrite=false');
	recording_xhr.setRequestHeader('Authorization', dropbox_server.authorization);
	recording_xhr.send({
		file: f.read()
	});
}

function insert_db_entry(files_to_upload_index, files_to_upload, dropbox_file_info, dropbox_server, ketchup_server) {
	var count_files_to_upload = files_to_upload.length;
	var filename = files_to_upload[files_to_upload_index].filename;
	var request_id = files_to_upload[files_to_upload_index].request_id;
	var file_index = files_to_upload[files_to_upload_index].file_index;
	var count_files = files_to_upload[files_to_upload_index].count_files;
	
	var dropbox_filename = dropbox_file_info.path.substr(12);

	Ti.API.debug('uploading file #' + (files_to_upload_index + 1));
	Ti.API.debug(JSON.stringify(files_to_upload[files_to_upload_index]));

	var xhr = Ti.Network.createHTTPClient({
		onload: function(e) {
			//delete file
			var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_upload_directory(), filename);
			f.deleteFile();

			if(files_to_upload_index == (count_files_to_upload - 1)) {
				upload_success();
			}
			else {
				upload_single_file((files_to_upload_index + 1), files_to_upload, ketchup_server, dropbox_server);
			}
		},
		onerror: function(e) {
			upload_failure('Could not access the database: '+ e.error, false);
		},
		timeout: 1000 * 60 * 10 //10 minutes
	});
	xhr.open('POST', ketchup_server.domain+'/fn_api_insert_recording.php');
	xhr.send({
		version: '2.0',
		api_key: ketchup_server.api_key,
		api_pw: ketchup_server.api_pw,
		request_id: request_id,
		file_index: file_index,
		count_files: count_files,
		filename: dropbox_filename
	});
}

function abort_recording_upload() {
	Ti.App.idleTimerDisabled = false;
	//delete upload file
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
	f.deleteFile();

	if(recording_xhr.readyState) {
		if(recording_xhr.readyState == recording_xhr.LOADING) {
			recording_xhr.abort();
			recording_xhr = '';

			var notification = Ti.UI.createAlertDialog({
				title: 'Upload Cancelled',
				message: 'You cancelled the upload. Please try again.'
			});

			//callback to app (should eventually do different callbacks for different response types)
			notification.addEventListener('click', function(e){
				Ti.App.fireEvent('app:all:file_upload_error');
			});
			notification.show();
		}
	}
	else {
		Ti.UI.createAlertDialog({
			title: 'Cannot Cancel Upload',
			message: 'The upload has already completed.'
		}).show();
	}
}

function upload_success() {
	Ti.App.idleTimerDisabled = false;
	
	//reset recording xhr
	recording_xhr = '';

	//delete upload file
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
	f.deleteFile();

	var alert = Ti.UI.createAlertDialog({
		title: 'Success',
		message: 'Your recording was uploaded to the KetchUp Server!'
	});

	//callback to app (should eventually do different callbacks for different response types)
	//only redirect if recording is not in process - otherwise show the link and go nowhere
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
	if(f.exists()) {
		//do nothing
	}
	else {
		alert.addEventListener('click', function(e){
			Ti.App.fireEvent('app:all:file_upload_success'); //this is also fired when the app is resumed in case the upload finished while app was in background (see below)
		});
	}

	alert.show();
}
function upload_failure(message, do_redirect) {
	Ti.App.idleTimerDisabled = false;

	//reset recording xhr
	recording_xhr = '';

	//delete upload file
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
	f.deleteFile();

	var alert = Ti.UI.createAlertDialog({
		title: 'Upload Failure',
		message: message
	});

	//callback to app (should eventually do different callbacks for different response types)
	alert.addEventListener('click', function(e){
		Ti.App.fireEvent('app:all:file_upload_error', {
			do_redirect: do_redirect
		});
	});
	alert.show();
}


//****************************************************************************************************
//event listeners

//recorder
Ti.App.addEventListener('app:recorder:start', function(e) {
	var recording_started = start_recording(e.request_id, e.ketchup_server);
	Ti.App.fireEvent('app:all:after_start_recording', {
		recording_started: recording_started
	});
});

Ti.App.addEventListener('app:recorder:pause', function(e) {
	pause_recording();
});

Ti.App.addEventListener('app:recorder:resume', function(e) {
	resume_recording();
});

Ti.App.addEventListener('app:recorder:confirm_stop', function(e) {
	var confirm_stop_notification = Ti.UI.createAlertDialog({
		message: 'Are you sure you want to finish recording and upload?',
		title: 'Upload',
		buttonNames: ['Yes', 'No']
	});

	confirm_stop_notification.addEventListener('click', function(e) {
		if(e.index == 0) {
			Ti.App.fireEvent('app:all:stop_recording');
		}
		else if(e.index == 1) {
			//do nothing
		}
	});

	confirm_stop_notification.show();
});

Ti.App.addEventListener('app:recorder:stop', function(e) {
	stop_recording(e.request_id, true, e.ketchup_server, e.dropbox_server);
});

//upload (in case original fails)
Ti.App.addEventListener('app:recorder:upload_recordings', function(e) {
	upload_recordings(e.ketchup_server, e.dropbox_server, false);
});

//abort upload
Ti.App.addEventListener('app:recorder:abort_recording_upload', function() {
	abort_recording_upload();
});

//link alerts for when recording is going
Ti.App.addEventListener('app:recorder:link_disabled', function(e) {
	var message = e.message;

	Ti.UI.createAlertDialog({
		title: 'Link Disabled',
		message: e.message,
		ok: 'OK'
	}).show();
});

//****************************************************************************************************
//event listeners (and function) for phone interruptions

function recorder_phone_pause_event() {
	Ti.API.debug('app paused');
	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
	if(f.exists()) {
		Ti.API.debug('record file exists');

		if(recording.paused == true) {
			//note: it doesnt matter if the user paused it beforehand or not - this will interrupt the recording beyond recoverability
			create_new_recording = true;
		}

		Ti.API.debug('create_new_recording: '+create_new_recording);
	}
}

function recorder_phone_resume_event() {
	Ti.API.debug('app resumed');

	//if there is a queued recording, clear it because we will need to wait again
	if(queued_recording != '') {
		Ti.API.debug('clearing timeout');
		clearTimeout(queued_recording);
		queued_recording = '';
	}
	else {
		Ti.API.debug('no timeout to clear');
	}

	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
	if(f.exists()) {
		if(create_new_recording == true) {
			//create_new_recording = false;

			var contents = f.read();
			var record_info = JSON.parse(contents.text);

			Ti.App.fireEvent('app:recorder:start', record_info);
		}		
	}
}

//check if recording was interrupted
Ti.App.addEventListener('pause', function(e) {
	if(recording != '') {
		Ti.API.debug(JSON.stringify(e));
		recorder_phone_pause_event();
	}
});

//if recording was interrupted, start a new one
Ti.App.addEventListener('resumed', function(e) {
	if(recording != '') {
		Ti.API.debug(JSON.stringify(e));
		recorder_phone_resume_event();
	}
});

//****************************************************************************************************
//check if there are files that need to be uploaded

function check_for_pending_uploads(app_is_running) {
	Ti.API.debug('checking for pending uploads function');
	var check_for_pending_uploads = true;

	//validation
	if(check_for_pending_uploads == true) {
		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'upload.json');
		if(f.exists()) {
			check_for_pending_uploads = false;
		}
	}

	if(check_for_pending_uploads == true) {
		var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'record.json');
		if(f.exists()) {
			check_for_pending_uploads = false;
		}
	}

	//check for uploads
	if(check_for_pending_uploads == true) {
		Ti.API.debug('actually doing a check');
		//if upload is showing, do nothing.
		if(app_is_running == true) {
			Ti.API.debug('checking if upload is showing');
			Ti.App.fireEvent('app:all:check_if_upload_is_showing');
		}
		else {
			Ti.App.fireEvent('app:recorder:get_files_to_upload');
		}
	}
}

Ti.App.addEventListener('app:recorder:get_files_to_upload', function() {
	Ti.API.debug('getting files to upload');

	//check for mp4 files in the application directory
	var files_to_upload = get_files_to_upload();

	if(files_to_upload.length > 0) {
		//server info
		var ketchup_server = new Object();
		ketchup_server.domain = 'https://www.ketchuptechnology.com/education';
		ketchup_server.api_key = 'this_is_the_api_key';
		ketchup_server.api_pw = 'this_is_the_api_pw';

		var dropbox_server = new Object();
		dropbox_server.domain = 'https://api-content.dropbox.com/1/files/dropbox/recordings';
		dropbox_server.authorization = 'Bearer NvCbEjbwqTEAAAAAAAAAAXgfn7Yk2YMdVWlFHxQkvlLxZBDqqg-CnKxyOG7RgC-L';

		var notification = Ti.UI.createAlertDialog({
			title: 'Pending Uploads',
			message: 'There are files waiting to be uploaded. Click OK to upload them to KetchUp.'
		});
		notification.addEventListener('click', function() {
			upload_recordings(ketchup_server, dropbox_server, false);
		});
		notification.show();
	}
});

function get_files_to_upload() {
	var files_to_upload = new Array();

	var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_upload_directory());
	var directory_listing = dir.getDirectoryListing();

	var count_directory_files = directory_listing.length;
	for(var j=0;j<count_directory_files;j++) {
		var filename = directory_listing[j];
		var last_four = filename.substr(filename.length - 4);

		if(last_four == '.mp4') {
			var file_index = 1;
			var count_files = 1;

			//parse request id
			var request_id = filename;
			request_id = request_id.substr(0, request_id.length - 4); //take out extension
			request_id = request_id.substr(3); //take out 'rec'

			//check for parts
			var pt_index = request_id.indexOf('pt');
			if(pt_index != -1) {
				var of_index = request_id.indexOf('of');

				file_index = request_id.substr(pt_index + 2, (of_index - (pt_index + 2)));
				count_files = request_id.substr(of_index + 2);
				request_id = request_id.substr(0, pt_index);
			}

			var file_to_upload = new Object();
			file_to_upload.filename = filename;
			file_to_upload.request_id = request_id;
			file_to_upload.file_index = file_index;
			file_to_upload.count_files = count_files;

			Ti.API.debug('adding file: '+JSON.stringify(file_to_upload));

			files_to_upload[files_to_upload.length] = file_to_upload;
		}
	}

	return files_to_upload;
}

//check for pending uploads when app is resumed
Ti.App.addEventListener('resumed', function() {
	check_for_pending_uploads(true);
});

//also check for pending uploads when app starts
check_for_pending_uploads(false);
