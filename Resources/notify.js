//notifications

Ti.App.addEventListener('app:notify:notify', function(e) {
	Ti.UI.createAlertDialog({
		title: e.title,
		message: e.message,
		ok: e.button_name
	}).show();
});