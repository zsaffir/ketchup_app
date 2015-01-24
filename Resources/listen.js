Ti.App.addEventListener('app:listen:get_audio_files_on_device', function(e) {
	var listen_dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_listen_directory());
	var directory_listing = listen_dir.getDirectoryListing();

	var directory_array = new Array();
	var directory_iterator = 0;

	var count_files = directory_listing.length;
	for(var j=0;j<count_files;j++) {
		var filename = directory_listing[j];

		var extension = filename.substr(filename.length - 4);
		if(extension == '.mp4') {
			directory_array[directory_iterator] = filename;
			directory_iterator++;
		}
	}

	Ti.App.fireEvent('app:all:get_recordings', {
		directory_array: directory_array
	});
});

var xhrs = new Array();

//**********
//download
//**********

Ti.App.addEventListener('app:listen:download_recording', function(e) {
	var dropbox_server = e.dropbox_server;
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;
	var override_wifi = e.override_wifi;

	if(typeof(xhrs[index]) == 'undefined') { //only proceed if download is not already in progress
		if((Ti.Network.getNetworkType() == Ti.Network.NETWORK_WIFI) || (override_wifi == true)) {
			xhrs[index] = Ti.Network.createHTTPClient({
				onload: function(e) {
					xhrs.splice(index, 1);
					Ti.API.debug('loaded');
					//now check file size
					var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_listen_directory(), filename);
					
					//check if not iOS and write to file here
					if (Ti.Platform.name != 'iPhone OS') {
						Ti.API.debug('writing to file...');
						file.write(this.responseData);
					}
					if(file.size <= 1024) { //arbitrarily picked this number - ideal number is smaller than the minimum mp4 file size
						Ti.App.fireEvent('app:all:delete_recording', {
							filename: filename,
							course: course,
							date: date,
							recorder: recorder,
							index: index
						});

						Ti.UI.createAlertDialog({
							title: 'Download Error',
							message: 'This file could not be downloaded: corrupt file'
						}).show();
					}
					else {
						Ti.App.fireEvent('app:all:update_recording_available', {
							filename: filename,
							course: course,
							date: date,
							recorder: recorder,
							index: index
						});
					}
				},
				onerror: function(e) {
					xhrs.splice(index, 1);
					Ti.App.fireEvent('app:all:delete_recording', {
						filename: filename,
						course: course,
						date: date,
						recorder: recorder,
						index: index
					});

					Ti.UI.createAlertDialog({
						title: 'Download Error',
						message: 'The file could not be downloaded: ' + e.error
					}).show();
				},
				ondatastream: function(e) {
					Ti.App.fireEvent('app:all:update_recording_download_progress', {
						progress: e.progress,
						index: index
					});
				},
				timeout: 1000 * 60 * 20 //20 minutes
			});

			xhrs[index].open('GET', dropbox_server.domain+'/'+filename);
			xhrs[index].setRequestHeader('Authorization', dropbox_server.authorization);
			
			//writing directly to file property here is an ios feature
			if (Ti.Platform.name == 'iPhone OS') {
				Ti.API.debug('setting file property');
				xhrs[index].file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_listen_directory(), filename);
			}
			xhrs[index].send();
		}
		else {
			var notification = Ti.UI.createAlertDialog({
				message: 'Recordings are large and could constitute a large portion of your data plan. Are you sure you want to download now?',
				title: 'No WiFi Connection',
				buttonNames: ['Yes', 'No']
			});

			notification.addEventListener('click', function(e) {
				if(e.index == 0) {
					Ti.App.fireEvent('app:listen:download_recording', {
						dropbox_server: dropbox_server,
						filename: filename,
						course: course,
						date: date,
						recorder: recorder,
						index: index,
						override_wifi: true
					});
				}
				else if(e.index == 1) {
					Ti.App.fireEvent('app:all:cancel_download', {
						filename: filename,
						course: course,
						date: date,
						recorder: recorder,
						index: index,
						download_in_progress: false
					});
				}
			});

			notification.show();
		}
	}
	else { //if download is in progress than promt to cancel
		Ti.App.fireEvent('app:listen:prompt_cancel_download', {
			filename: filename,
			course: course,
			date: date,
			recorder: recorder,
			index: index
		});
	}
});

Ti.App.addEventListener('app:listen:prompt_cancel_download', function(e) {
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;

	var notification = Ti.UI.createAlertDialog({
		message: 'Are you sure you want to cancel this download?',
		title: 'Cancel Download',
		buttonNames: ['Yes', 'No']
	});

	notification.addEventListener('click', function(e2) {
		if(e2.index == 0) {
			Ti.App.fireEvent('app:all:cancel_download', {
				filename: filename,
				course: course,
				date: date,
				recorder: recorder,
				index: index,
				download_in_progress: true
			});		
		}
		else if(e2.index == 1) {
			//do nothing
		}
	});

	notification.show();
});

Ti.App.addEventListener('app:listen:cancel_download', function(e) {
	var index = e.index;

	if(typeof(xhrs[index]) != 'undefined') {
		if(xhrs[index].readyState == xhrs[index].LOADING) {
			xhrs[index].abort();
			xhrs.splice(index, 1);
		}
		else {
			Ti.UI.createAlertDialog({
				title:'Cannot Cancel Download',
				message:'The download has already completed.'
			}).show();	
		}
	}
	else {
		Ti.UI.createAlertDialog({
			title:'Cannot Cancel Download',
			message:'The recording is no longer downloading.'
		}).show();
	}
});

//**********
//delete recording
//**********

Ti.App.addEventListener('app:listen:prompt_delete_recording', function(e) {
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;

	var notification = Ti.UI.createAlertDialog({
		message: 'Are you sure you want to delete your recording of '+course+' from '+date+' from this device (You will be able to download it off the server until it expires)?',
		title: 'Delete Recording From Device',
		buttonNames: ['Yes', 'No']
	});

	notification.addEventListener('click', function(e2) {
		if(e2.index == 0) {
			Ti.App.fireEvent('app:all:delete_recording', {
				filename: filename,
				course: course,
				date: date,
				recorder: recorder,
				index: index
			});
		}
		else if(e2.index == 1) {
			//do nothing
		}
	});

	notification.show();
});

Ti.App.addEventListener('app:listen:delete_recording', function(e) {
	var filename = e.filename;

	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_listen_directory(), filename);
	if(f.exists()) {
		f.deleteFile();
	}
});


Ti.App.addEventListener('app:listen:store_recording_info', function(e) {
	var recordings = e.recordings;

	var recording_json = '[';
	var recording_count = recordings.length;
	for (var j = 0; j < recording_count; j++) {
		var course = recordings[j].course;
		var date = recordings[j].date;
		var recorder = recordings[j].recorder;
		
		recording_json += '{';
		recording_json += '"course": "'+course+'"';
		recording_json += ',"date": "'+date+'"';
		recording_json += ',"recorder": "'+recorder+'"';
		
		//there may not be a filename (if this is a request)
		if(recordings[j].filename) {
			var filename = recordings[j].filename;
			recording_json += ',"filename": "'+filename+'"';
		}
		
		//there may not be an expiration date (if this is a request)
		if(recordings[j].expiration_date) {
			var expiration_date = recordings[j].expiration_date;
			recording_json += ',"expiration_date": '+expiration_date;
		}
		
		recording_json += '}, ';
	}
	recording_json = recording_json.substr(0, recording_json.length - 2);
	recording_json += ']';


	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'recording_info.json');
	if(f.exists()) {
		f.deleteFile();
	}
	f.write(recording_json);
});

Ti.App.addEventListener('app:listen:get_cached_file_list', function(e) {
	var directory_array = e.directory_array;

	var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_json_directory(), 'recording_info.json');
	if(f.exists()) {
		var contents = f.read();
		var recordings = JSON.parse(contents.text);

		//todays date
		var today = new Date();
		var ccyy = today.getFullYear();
		var mm = today.getMonth()+1; //January is 0
		var dd = today.getDate();

		if(mm < 10) {
			mm = '0'+mm;
		}
		if(dd < 10) {
			dd = '0' + dd;
		}

		var today_ccyymmdd = ccyy+mm+dd;

		//make sure none of the recordings are already expired
		var available_recordings = new Array();
		var available_recordings_interator = 0;

		var recording_count = recordings.length;
		for (var j = 0; j < recording_count; j++) {
			var course = recordings[j].course;
			var date = recordings[j].date;
			var recorder = recordings[j].recorder;
			var filename = recordings[j].filename;
			var expiration_date = recordings[j].expiration_date;

			if(today_ccyymmdd <= expiration_date) {
				var recording = new Object();
				recording.course = course;
				recording.date = date;
				recording.recorder = recorder;
				recording.filename = filename;
				recording.expiration_date = expiration_date;

				available_recordings[available_recordings_interator] = recording;
				available_recordings_interator++;
			}
		}

		Ti.App.fireEvent('app:all:output_recordings_from_cache', {
			recordings: available_recordings,
			directory_array: directory_array
		});
	}
});

