//canvas integration

var do_canvas_oauth = function(e) {
	var canvas_server = e.canvas_server;
	var canvas_url = e.canvas_url;

	//**********
	//create window
	//**********
	//cancel button
	var button = Ti.UI.createButton({
		systemButton: Ti.UI.iPhone.SystemButton.CANCEL
	});
	button.addEventListener('click',function(e) {
		oauth_navWin.close();
		Ti.App.fireEvent('app:all:cancel_canvas_logon');
	});

	//sign in window
	var oauth_win = Ti.UI.createWindow({
		statusBarStyle: Titanium.UI.iPhone.StatusBar.GRAY,
		navBarHidden: false,
		tabBarHidden: true,
		rightNavButton: button,
		title: 'Sign in to KetchUp'
	});

	var oauth_webview = Ti.UI.createWebView({
		url: 'https://'+canvas_url+'/login/oauth2/auth?client_id='+canvas_server.id+'&response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob'
	});	

	//navigation parent (to give header)
	var oauth_navWin = Ti.UI.iOS.createNavigationWindow({
		modal: true,
		window: oauth_win
	});
	
	oauth_webview.addEventListener('load', function() {
		var new_url = oauth_webview.url;

		var code_path = '/login/oauth2/auth?code=';

    	if(new_url.indexOf('https://' + canvas_url + '/login/oauth2/auth?code=') == 0) {
    		//Ti.API.debug('The new url is: '+new_url);
    		var code_start_pos = 8 + canvas_url.length + code_path.length;

    		//Ti.API.debug('code should start at position: '+code_start_pos);
    		var canvas_code = new_url.substring(code_start_pos);

    		//Ti.API.debug('canvas code is: '+canvas_code);

    		//get final token
    		var token_xhr = Ti.Network.createHTTPClient({
				onload: function(e) {
					var response = this.responseText;
					//Ti.API.debug('The response was successful: '+response);

					var canvas_response = JSON.parse(response);
					var canvas_access_token = canvas_response.access_token;
					
					var canvas_user_info = canvas_response.user;
					var canvas_user_id = canvas_user_info.id;
					var canvas_user_name = canvas_user_info.name;

					//set user
					Ti.App.fireEvent('app:signin:store_user_info', {
						canvas_domain : canvas_url,
						canvas_access_token : canvas_access_token,
						user_id : canvas_user_id,
						user_name : canvas_user_name
					});

					//Ti.API.debug('Received this token: '+canvas_access_token);

					//close canvas logon
					oauth_navWin.close();

					//redirect to sign on
					Ti.App.fireEvent('app:all:success_canvas_logon');
				},
				onerror: function(e) {
					var alert = Ti.UI.createAlertDialog({
						title: 'Authentication Error',
						message: 'Could not communicate with Canvas'
					});

					alert.show();
				}
			});
			
			token_xhr.open('POST', 'https://'+canvas_url+'/login/oauth2/token');
			token_xhr.send({
				client_id : canvas_server.id,
				client_secret : canvas_server.key,
				code: canvas_code
			});
    	}
	});

	oauth_win.add(oauth_webview);
	oauth_navWin.open();
}

Ti.App.addEventListener('app:canvas:do_canvas_oauth', do_canvas_oauth);

Ti.App.addEventListener('app:canvas:canvas_token_expired', function(e) {
		var canvas_url = e.canvas_url;

		var notification = Ti.UI.createAlertDialog({
			message: 'Please log in to Canvas again.',
			title: 'Canvas Authentication Expired'
		});

		notification.addEventListener('click', function(e) {
			Ti.App.fireEvent('app:all:show_canvas_logon', {
				canvas_url: canvas_url
			});
		});

		notification.show();
});