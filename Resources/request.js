//request

Ti.App.addEventListener('app:request:request_submitted', function(e) {
	var title = e.title;
	var message = e.message;
	var button_name = e.button_name;

	var notification = Ti.UI.createAlertDialog({
		title: title,
		message: message,
		ok: button_name
	});

	notification.addEventListener('click', function(e) {
		Ti.App.fireEvent('app:all:request_submitted_redirect');
	});

	notification.show();
});