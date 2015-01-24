Ti.App.addEventListener('app:player:set_recording', function(e) {
	var filename = e.filename;
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, get_listen_directory(), filename);
	if(file.exists()) {
		var filepath = file.nativePath;

		var winVideo = Ti.UI.createWindow({
			title:'Video Player',
			backButtonTitle: 'Videos',
			barColor: '#000',
			backgroundColor:'#000',
			orientationModes:[Ti.UI.PORTRAIT]
		});
		
		Ti.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;
		var videoPlayer = Ti.Media.createVideoPlayer({
			url: filepath,
			backgroundColor: '#000',
			fullscreen: true,
			scalingMode: Ti.Media.VIDEO_SCALING_ASPECT_FIT,
			mediaControlMode: Ti.Media.VIDEO_CONTROL_NONE     
		});
		
		videoPlayer.addEventListener('fullscreen', function(e2) {
			if (e2.entering == 0) {
				winVideo.close();
			};
		});

		winVideo.add(videoPlayer);
		winVideo.open();
	}
	else {
		var notification = Ti.UI.createAlertDialog({
			title: 'Error',
			message: 'The file could not be played. Please contact KetchUp support.'
		});

		notification.show();
	}
});
