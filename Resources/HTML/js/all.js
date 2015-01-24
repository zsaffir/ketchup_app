//Based on https://developers.google.com/mobile/articles/webapp_fixed_ui we need to remove scroll and add back in for scrollable elements

//disable body from scrolling
document.addEventListener('touchmove', function(e) {
	e.preventDefault();
	return false;
}, false);

//server info
var ketchup_server = new Object();
ketchup_server.domain = 'https://www.ketchuptechnology.com/education';
ketchup_server.api_key = 'this_is_the_api_key';
ketchup_server.api_pw = 'this_is_the_api_pw';

var dropbox_server = new Object();
dropbox_server.domain = 'https://api-content.dropbox.com/1/files/dropbox/recordings';
dropbox_server.authorization = 'Bearer NvCbEjbwqTEAAAAAAAAAAXgfn7Yk2YMdVWlFHxQkvlLxZBDqqg-CnKxyOG7RgC-L';

var canvas_server = new Object();
canvas_server.domain = '';
canvas_server.id = '170000000000174';
canvas_server.key = 'x2gQpZn4VpJWFuDrK5uH3IlaA5FyZcAxB6UzlfNPdNxXVIk4oXDDW0Y01cUhsHdn';
canvas_server.redirect = 'https://www.ketchuptechnology.com/education/oauth_redirect';

//month names
var month_names = [null, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

//display date
function generate_display_date(ccyymmdd) {
	var date_displaystr = String(ccyymmdd);
	var year = parseInt(date_displaystr.substring(0, 4));
	var month = parseInt(date_displaystr.substring(4, 6));
	var day = parseInt(date_displaystr.substring(6, 8));

	var display_date = month_names[month] + ' ' + day + ', ' + year;

	return display_date;
}

//handle event listen_select_recordings properly
var events_array = new Array();
function add_event_listener_once(event_name, event_handler) {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.addEventListener(event_name, event_handler);
		var event_count = events_array.length;

		var this_event = new Object();
		this_event.event_name = event_name;
		this_event.event_handler = event_handler;

		events_array[event_count] = this_event;
	}
}

$(window).unload(function() {
	var event_count = events_array.length;
	for(var j=0;j<event_count;j++) {
		var event_name = events_array[j].event_name;
		var event_handler = events_array[j].event_handler;

		Ti.App.removeEventListener(event_name, event_handler);
	}
});

//check if file was uploading
add_event_listener_once('app:check_for_upload_in_progress', function(e) {
	var upload_in_progress = '';
	if(document.getElementById('uploading_div')) {
		var upload_in_progress = 'Y';
	}

	Ti.App.fireEvent('app:resume:respond_to_existing_upload_file', {
		request_id : e.request_id,
		upload_in_progress : upload_in_progress,
		ketchup_server : ketchup_server
	});
});

function ga_event(category, action, label) {
	if(action == undefined) {
		action = '';
	}
	if(label == undefined) {
		label = '';
	}

	var ajax = $.ajax({
		type : 'POST',
		async : true,
		url : 'http://www.google-analytics.com/collect',
		data : {
			v: '1',
			tid: 'UA-46814132-1',
			cid: '555',
			t: 'event',
			ec: category,
			ea: action,
			el: label
		}
	});

	/*var post = $.post(
		'http://www.google-analytics.com/collect',
		{
			v: '1',
			tid: 'UA-46814132-1',
			cid: '555',
			t: 'event',
			ec: category,
			ea: action,
			el: label
		}
	);*/
}

var course = new Object();
course.id = '';
course.name = '';
course.date = 0;
course.set_course = function(course_id, course_name, course_date) {
	course.id = course_id;
	course.name = course_name;
	course.date = course_date;
};

var user = new Object();
user.set_user = function(canvas_access_token, user_id, user_name) {
	user.canvas_access_token = canvas_access_token;
	user.id = user_id;
	user.name = user_name;
};
user.set_user('', '', '');

/*if(get_query_param('user') != '') {
	user.id = get_query_param('user');
}
if(get_query_param('user_nid') != '') {
	user.nid = get_query_param('user_nid');
}
if(get_query_param('user_pw') != '') {
	user.pw = get_query_param('user_pw');
}
if(get_query_param('user_name') != '') {
	user.name = get_query_param('user_name');
}
if(get_query_param('user_email') != '') {
	user.email = get_query_param('user_email');
}*/

var arr_unviewed_counts = new Array();

function get_app_height() {
	var navbar_height = 20;
	var bottom_nav_height = 50;
	var window_height = window.innerHeight;
	var title_height = $('#title').outerHeight();
	var app_height = window_height - title_height - navbar_height - bottom_nav_height;

	return app_height;
}

function get_page_name() {
	var sPath = window.location.pathname;
	var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
	return sPage;
}

function get_query_param(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function scroll_app() {
	$('#app').niceScroll({bouncescroll: true, touchbehavior: true});
	if(document.getElementById('right_side_slider')) {
		$('#right_side_slider').niceScroll({bouncescroll: true, touchbehavior: true});
	}
	if(document.getElementById('left_side_slider')) {
		$('#left_side_slider').niceScroll({bouncescroll: true, touchbehavior: true});
	}
}

function resize_app_height(height) {
	$('#app').css('height', height);
	$('#right_side_slider').css('height', height);
	$('#left_side_slider').css('height', height);
}

function show_loading() {
	$('#app').after('<div id="loading">Loading...</div>');
}
function hide_loading() {
	$('#loading').remove();
}

function notify(message, callback, title, button_name) {
	if(typeof(Ti) != 'undefined') {
		Ti.App.fireEvent('app:notify:notify', {
			message : message,
			title : title,
			button_name : button_name,
			callback : JSON.stringify(callback)
		});
		callback.call();
	} else {
		alert('title: ' + title + "\n" + 'message: ' + message + "\n" + 'button_name: ' + button_name);
		callback.call();
	}
}

function lp(direction, new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url) {
	var duration = 600;

	//**********
	//content
	//**********
	if(direction == 'right') {
		//create sliding div
		$('#app').after('<div id="right_side_slider" style="height:'+get_app_height()+'px;">' + new_content + '</div>');
	}
	else if(direction == 'left') {
		//create sliding div
		$('#app').after('<div id="left_side_slider" style="height:'+get_app_height()+'px;">' + new_content + '</div>');
	}
	else {
		$('#app').html(new_content);
		resize_app_height(get_app_height()+'px');
	}
	if (on_before_load) {
		on_before_load.call();
	}

	//set settings height to match screen height
	//$('#settings').css('height', window.innerHeight + 'px');

	if(direction == 'right') {
		//slide existing content slightly
		$('#app').animate({
			marginLeft : '-15%'
		}, duration, 'swing');

		//slide in new content
		$('#right_side_slider').animate({
			marginLeft : '0'
		}, duration, 'swing', function() {
			$('#app').remove();
			$('#right_side_slider').attr('id', 'app');
		});
	}
	else if(direction == 'left') {
		//slide existing content
		$('#app').animate({
			marginLeft : '100%'
		}, duration, 'swing');

		//slide in new content
		$('#left_side_slider').animate({
			marginLeft : '0'
		}, duration, 'swing', function() {
			$('#app').remove();
			$('#left_side_slider').attr('id', 'app');
		});
	}

	//**********
	//nav
	//**********
	if(new_bottom_nav != '') {
		if(!document.getElementById('bottom_nav')) {
			$('#app').after('<div id="bottom_nav"></div>');
		}
		
		if(direction == '') {
			$('#bottom_nav').html(new_bottom_nav);
			if((ga_url == 'request_main.html') || (ga_url == 'listen_select_recording.html') || (ga_url == 'record_select_course.html')) {
				arr_unviewed_counts = get_unviewed_counts(ga_url);
			}

			if(arr_unviewed_counts.requests) {
				record_badge.set_value(parseInt(arr_unviewed_counts.requests));
			}
			if(arr_unviewed_counts.recordings) {
				listen_badge.set_value(parseInt(arr_unviewed_counts.recordings));
			}
		}
		else {
			//create new nav
			$('#bottom_nav').after('<div id="new_bottom_nav">' + new_bottom_nav + '</div>');

			//fade in new nav
			$('#new_bottom_nav').animate({
				opacity : '1.0'
			}, duration, 'swing', function() {
				$('#bottom_nav').remove();
				$('#new_bottom_nav').attr('id', 'bottom_nav');

				//get badges (listen/record)
				if((ga_url == 'request_main.html') || (ga_url == 'listen_select_recording.html') || (ga_url == 'record_select_course.html')) {
					arr_unviewed_counts = get_unviewed_counts(ga_url);
				}

				if(arr_unviewed_counts.requests) {
					record_badge.set_value(parseInt(arr_unviewed_counts.requests));
				}
				if(arr_unviewed_counts.recordings) {
					listen_badge.set_value(parseInt(arr_unviewed_counts.recordings));
				}
			});
		}
	}
	else {
		$('#bottom_nav').remove();
	}

	//**********
	//title
	//**********
	var new_title_full = new_title;
	if(new_title_addons) {
		new_title_full += new_title_addons;
	}

	if(direction == '') {
		$('#title').html(new_title_full);

		if (on_load_finished) {
			on_load_finished.call();
		}
	}
	else {
		$('#title').after('<div id="new_title">' + new_title_full + '</div>');

		//fade in new title
		$('#new_title').animate({
			opacity : '1.0'
		}, duration, 'swing', function() {
			$('#title').remove();
			$('#new_title').attr('id', 'title');

			if (on_load_finished) {
				on_load_finished.call();
			}
		});
	}
	
	ga_event(new_title, ga_url);
}

function load_page(new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url) {
	lp('', new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url);
}

function load_page_right_side(new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url) {
	lp('right', new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url);
}

function load_page_left_side(new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url) {
	lp('left', new_title, new_title_addons, new_content, new_bottom_nav, on_load_finished, on_before_load, ga_url);
}

function sign_out(redirect) {
	//remove user's token from canvas
	var ajax = $.ajax({
		type : 'GET',
		url : ketchup_server.domain + '/fn_api_delete_canvas_token.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&user_id=' + encodeURIComponent(user.id) + '&canvas_access_token='+encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain)
	});

	//remove user from session
	user.set_user('', '', '');
	canvas_server.domain = '';

	//remove user from persistent file
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:signin:remove_user_info');
	}

	if(settings.properties.open == true) {
		settings.functions.hide();
	}
	
	if(redirect == true) {
		sign_in.functions.load();
	}
}

//****************************************************************************************************
//badges
//****************************************************************************************************

var listen_badge = new Object();
listen_badge.set_value = function(value){
	listen_badge.value = value;
	
	if (value == 0) {
		var badge_display = 'none';
	}
	else {
		var badge_display = 'block';
	}

	$('#listen_badge').html(value);
	$('#listen_badge').css('display', badge_display);
	listen_badge.badge = '<div id="listen_badge" class="badge" style="display:'+badge_display+';">' + value + '</div>';
};
listen_badge.set_value(0);

var record_badge = new Object();
record_badge.set_value = function(value){
	record_badge.value = value;
	
	if (value == 0) {
		var badge_display = 'none';
	}
	else {
		var badge_display = 'block';
	}

	$('#record_badge').html(value);
	$('#record_badge').css('display', badge_display);
	record_badge.badge = '<div id="record_badge" class="badge" style="display:'+badge_display+';">' + value + '</div>';
};
record_badge.set_value(0);

//get unviewed counts
function get_unviewed_counts(ga_url) {
	var arr_unviewed_counts = new Array();

	var reset_requests = '';
	var reset_recordings = '';
	if(ga_url == 'record_select_course.html') {
		reset_requests = 'Y';
	}
	else if(ga_url == 'listen_select_recording.html') {
		reset_recordings = 'Y';
	}

	var ajax = $.ajax({
		type : 'GET',
		async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_unviewed_counts.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&user_id=' + encodeURIComponent(user.id) + '&reset_requests=' + encodeURIComponent(reset_requests) + '&reset_recordings=' + encodeURIComponent(reset_recordings) + '&canvas_access_token='+encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain)
	});

	ajax.fail(function(jqXHR, textStatus) {
		//do nothing - array already empty
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			arr_unviewed_counts = response.unviewed_counts;
		}
		else {
			//do nothing - array already empty
		}
	});

	//set app badge
	if(typeof(Ti) != 'undefined') {
		var badge_value = 0;
		if(arr_unviewed_counts.requests) {
			badge_value += parseInt(arr_unviewed_counts.requests);
		}
		if(arr_unviewed_counts.recordings) {
			badge_value += parseInt(arr_unviewed_counts.recordings);
		}

		Ti.App.fireEvent('app:badge:set_badge_value', {
			badge_value : badge_value
		});
	}

	return arr_unviewed_counts;
}

//****************************************************************************************************
//settings
//****************************************************************************************************

var settings = new Object();
settings.content = '';
settings.properties = new Object();
settings.properties.open = false;
settings.functions = new Object();
settings.functions.generate_content = function() {
	settings.content = '<div class="settings_label">'+user.name+'</div>';
	settings.content += '<a href="javascript:feedback.functions.load();" class="settings_link">Feedback</a>';
	settings.content += '<a href="#" ontouchstart="settings.functions.show_honor_code();" class="settings_link">Honor Code</a>';
	settings.content += '<a href="#" ontouchstart="settings.functions.show_terms();" class="settings_link">Terms & Conditions</a>';
	settings.content += '<a href="javascript:sign_out(true);" class="settings_link">Sign Out</a>';
};
settings.functions.show = function() {
	if(!document.getElementById('hide_settings')) {
		$('#app').after('<div id="hide_settings" ontouchstart="settings.functions.hide();"></div>');
	}
	if(!document.getElementById('settings')) {
		$('#app').after('<div id="settings"></div>');
	}

	var duration = 600;

	var navbar_height = 20;
	//var bottom_nav_height = 50;
	var settings_height = window.innerHeight - navbar_height;

	$('#settings').css('background-color', '#3e3e3e');

	settings.functions.generate_content();

	//mark as open
	settings.properties.open = true;

	//put content in settings
	$('#settings').html(settings.content);

	//set settings height to match screen height
	$('#settings').css('height', settings_height + 'px');
	
	//reset app height so animation occurs properly
	//document.getElementById('app').style.height = get_app_height() + 'px';

	//slide existing content
	$('#title').animate({
		marginLeft : '-85%'
	}, duration, 'swing');
	
	$('#bottom_nav').animate({
		marginLeft : '-85%'
	}, duration, 'swing');

	$('#app').animate({
		marginLeft : '-85%'
	}, duration, 'swing', function() {
		//create opaque link on right to hide settings
		//$('#app').after('<div id="hide_settings" ontouchstart="settings.functions.hide();" ontouchmove="function(e) {e.preventDefault();return false;};" style="height:'+settings_height+'px;"></div>');

		//set hide settings height to match screen height
		$('#hide_settings').css('height', settings_height + 'px');

		//show hide_settings
		$('#hide_settings').css('z-index', '12');
	});

	//set hamburger to hide settings
	//$('#settings_link').attr('href', 'javascript:settings.functions.hide();');
};
settings.functions.hide = function(func) {
	var duration = 600;

	//remove opaque link
	$('#hide_settings').css('z-index', '0');
	//$('#hide_settings').remove();


	//reset app height so animation occurs properly
	document.getElementById('app').style.height = get_app_height() + 'px';

	//slide existing content
	$('#title').animate({
		marginLeft : '0'
	}, duration, 'swing');

	$('#bottom_nav').animate({
		marginLeft : '0'
	}, duration, 'swing');

	$('#app').animate({
		marginLeft : '0'
	}, duration, 'swing', function() {
		//remove settings
		//$('#settings').remove();
		$('#settings').css('background-color', 'white');

		//reset app height if necessary
		settings.properties.open = false;

		if(typeof(func) != 'undefined') {
			func.call();
		}
	});

	//set hamburger to show settings
	//$('#settings_link').attr('href', 'javascript:settings.functions.show();');
};
settings.functions.show_honor_code = function() {
	var url = 'http://www.northwestern.edu/ethics/misconduct.html';

	if(typeof(Ti) != 'undefined') {
		Ti.App.fireEvent('app:app:open_url_safari', {
			url : url
		});
	}
	else {
		location.href = url;
	}
};
settings.functions.show_terms = function() {
	var url = ketchup_server.domain + '/terms.html';

	if(typeof(Ti) != 'undefined') {
		Ti.App.fireEvent('app:app:open_url_safari', {
			url : url
		});
	}
	else {
		location.href = url;
	}
};


//****************************************************************************************************
//sign in
//****************************************************************************************************

var sign_in = new Object();
sign_in.title = 'Log in to KetchUp';
sign_in.title_addons = '';

/*sign_in.content = '<form id="sign_in_form" method="post" action="javascript:sign_in.functions.sign_in();">';

sign_in.content += '<div class="super_label">RETURNING USERS</div>';
sign_in.content += '<div class="sign_in_user">';
sign_in.content += '<div class="label">School Email</div>';
sign_in.content += '<input type="text" class="sign_in_input" id="input_user" autocorrect="off" autocapitalize="off" onfocus="this.style.webkitTransform = \'translate3d(0px,-10000px,0)\'; webkitRequestAnimationFrame(function() { this.style.webkitTransform = \'\'; }.bind(this));"></input>';
sign_in.content += '</div>';
sign_in.content += '<div class="sign_in_password">';
sign_in.content += '<div class="label">Password</div>';
sign_in.content += '<input type="password" class="sign_in_input" id="input_password" maxlength="50" onfocus="this.style.webkitTransform = \'translate3d(0px,-10000px,0)\'; webkitRequestAnimationFrame(function() { this.style.webkitTransform = \'\'; }.bind(this));"></input>';
sign_in.content += '</div>';
sign_in.content += '<input type="submit" value="Sign In" style="position:absolute;top:-1000px;">';
sign_in.content += '<a class="sign_in_submit" href="#" ontouchstart="document.getElementById(\'sign_in_form\').submit();">Sign In to KetchUp</a>';

sign_in.content += '<div class="super_label" style="margin-top:35px;">NEW USERS</div>';
sign_in.content += '<a class="sign_in_submit" href="#" ontouchstart="email_confirm.functions.load(\'right\');">Sign Up for KetchUp</a>';

sign_in.content += '</form>';
sign_in.content += '<div class="hidden_images">'; //an attempt to pre-cache images
sign_in.content += '<img src="img/ketchup_logo.png">';
sign_in.content += '<img src="img/request_icon.png">';
sign_in.content += '<img src="img/listen_icon.png">';
sign_in.content += '<img src="img/record_icon.png">';
sign_in.content += '<img src="img/request_icon_sel.png">';
sign_in.content += '<img src="img/listen_icon_sel.png">';
sign_in.content += '<img src="img/record_icon_sel.png">';
sign_in.content += '</div>';*/

sign_in.content = '<a class="panel" style="text-decoration:none;" href="javascript:document.getElementById(\'school_dropdown\').focus();">Select your school below</a>';
sign_in.content += '<div id="school_select"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';

sign_in.bottom_nav = '';
sign_in.functions = new Object();
sign_in.functions.load = function(direction) {
	$('#bottom_nav').remove();
	$('#settings').remove();
	$('#hide_settings').remove();

	if(direction == 'left') {
		load_page_left_side(sign_in.title, sign_in.title_addons, sign_in.content, sign_in.bottom_nav, sign_in.functions.get_schools, null, 'index.html');
	}
	else if(direction == 'right') {
		load_page_right_side(sign_in.title, sign_in.title_addons, sign_in.content, sign_in.bottom_nav, sign_in.functions.get_schools, null, 'index.html');
	}
	else {
		load_page(sign_in.title, sign_in.title_addons, sign_in.content, sign_in.bottom_nav, sign_in.functions.get_schools, null, 'index.html');
	}
};

sign_in.functions.get_schools = function() {
	//document.getElementById('school_select').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';

	var return_content = '';

	var ajax = $.ajax({
		type : 'GET',
		async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_canvas_urls.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw)
	});

	ajax.fail(function(jqXHR, textStatus) {
		sign_in.functions.display_error(jqXHR.statusText);
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			var canvas_urls = response.canvas_urls;

			var canvas_url_count = canvas_urls.length;
			if (canvas_url_count == 0) {
				return_content += '<a class="tappable_error" href="javascript:request_main.functions.load(false, \'left\');">';
				return_content += 'No schools found<br><span class="tappable_error_link">Try again</span>';
				return_content += '</a>';				
			}
			else {
				return_content += '<select id="school_dropdown" onchange="sign_in.functions.show_canvas_logon(this.value);" style="display:block;font-size:20px;width:100%;">';
				return_content += '<option value="">Tap to select</option>';
				for (var j = 0; j < canvas_url_count; j++) {
					var option_school = '<option value="'+canvas_urls[j].canvas_url+'">'+canvas_urls[j].school_name+'</option>';
					return_content += option_school;
				}
				return_content += '</select>';
			}

			document.getElementById('school_select').innerHTML = return_content;
			scroll_app();
		} else {
			sign_in.functions.display_error(response.message);
		}
	});
};

sign_in.functions.display_loading = function() {
	document.getElementById('school_select').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';
}
sign_in.functions.display_error = function(error_msg) {
	var error_html = '';
	error_html += '<a class="tappable_error" onclick="javascript:sign_in.functions.display_loading();" href="javascript:sign_in.functions.get_schools();">';
	error_html += 'The following error occurred:';
	error_html += '<br>';
	error_html += error_msg;
	error_html += '<br>';
	error_html += '<span class="tappable_error_link">Tap to retry</span>';
	error_html += '</a>';

	document.getElementById('school_select').innerHTML = error_html;
	scroll_app();
}

sign_in.functions.show_canvas_logon = function(canvas_url) {
	show_loading();
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:canvas:do_canvas_oauth', {
			canvas_server: canvas_server,
			canvas_url: canvas_url
		});
	}
}

sign_in.functions.canvas_token_expired = function() {
	var canvas_url = canvas_server.domain;
	sign_out(false);

	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:canvas:canvas_token_expired', {
			canvas_url: canvas_url
		});
	}
}

//event listeners

add_event_listener_once('app:all:cancel_canvas_logon', function(e) {
	hide_loading();
	sign_in.functions.load();
});

add_event_listener_once('app:all:success_canvas_logon', function(e) {
	location.href = 'fn_sign_in.html';
});

add_event_listener_once('app:all:show_canvas_logon', function(e) {
	var canvas_url = e.canvas_url;

	sign_in.functions.show_canvas_logon(canvas_url);
});

//****************************************************************************************************
//email confirm
//****************************************************************************************************

/*var email_confirm = new Object();
email_confirm.title = 'Sign Up';
email_confirm.title_addons = '<a ontouchstart="sign_in.functions.load(\'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
email_confirm.content = '<form id="email_confirm_form" method="post" action="javascript:email_confirm.functions.email_confirm();">';
email_confirm.content += '<div id="request_title" style="font-weight:normal;">Please enter your school email address to sign up for KetchUp.</div>';
email_confirm.content += '<input type="text" class="email_confirm_input" id="input_email" maxlength="50" autocorrect="off" autocapitalize="off" onfocus="this.style.webkitTransform = \'translate3d(0px,-10000px,0)\'; webkitRequestAnimationFrame(function() { this.style.webkitTransform = \'\'; }.bind(this));">';
email_confirm.content += '<input type="submit" value="Sign In" style="position:absolute;top:-1000px;">';
email_confirm.content += '<a class="sign_in_submit" href="#" ontouchstart="document.getElementById(\'email_confirm_form\').submit();">Confirm Email</a>';
email_confirm.content += '</form>';
email_confirm.bottom_nav = '';
email_confirm.functions = new Object();
email_confirm.functions.load = function(direction) {
	document.getElementById('app').style.height = 'auto';

	if(direction == 'left') {
		load_page_left_side(email_confirm.title, email_confirm.title_addons, email_confirm.content, email_confirm.bottom_nav, null, null, 'email_confirm.html');
	}
	else if(direction == 'right') {
		load_page_right_side(email_confirm.title, email_confirm.title_addons, email_confirm.content, email_confirm.bottom_nav, null, null, 'email_confirm.html');
	}
	else {
		load_page(email_confirm.title, email_confirm.title_addons, email_confirm.content, email_confirm.bottom_nav, null, null, 'email_confirm.html');
	}
};
email_confirm.functions.email_confirm = function() {
	var email = document.getElementById('input_email').value;
	email = email.toLowerCase();

	//validation
	var got_error = '';
	var title = '';
	var message = '';
	var callback = '';

	//require email
	if (got_error == '') {
		if (email == '') {
			got_error = 'Y';
			title = 'Email required';
			message = 'Please enter your email.';
			callback = function() {};
		}
	}

	//send to server
	if (got_error == '') {
		show_loading();

		var ajax = $.ajax({
			type : 'GET',
			async: false, //because we only output errors after we get the response
			url : ketchup_server.domain + '/fn_api_send_email_confirmation.php',
			data : 'version=1.2&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&email='+encodeURIComponent(email)
		});

		ajax.fail(function(jqXHR, textStatus) {
			hide_loading();

			title = 'Error';
			message = jqXHR.statusText;
			callback = function() {};
			notify(message, callback, title, 'OK');
		});
		
		ajax.done(function(jqXHR, textStatus) {
			hide_loading();

			var response = JSON.parse(ajax.responseText);
			if(response.success != true) {
				title = 'Error';
				message += response.message;
				callback = function() {};
				notify(message, callback, title, 'OK');
			}
			else {
				//log in ga
				ga_event('email_confirm', user.id, email);

				//show message
				title = 'Confirmation Email Sent';
				message += 'Please click the link in your email to activate your KetchUp account. Then, sign in again.';
				callback = function() {
					sign_in.functions.load();
				};
				notify(message, callback, title, 'OK');
			}
		});
	}

	//show error message
	else if (got_error != '') {
		notify(message, callback, title, 'OK');
	}
};*/

//****************************************************************************************************
//request main
//****************************************************************************************************

var request_main = new Object();

request_main.properties = new Object();
request_main.properties.course = '';
request_main.properties.course_display = 'Select Course';
request_main.properties.date = '';
request_main.properties.time = '';
request_main.properties.date_display = 'Select Date';
request_main.properties.classmate_display = 'Select Classmate';
request_main.properties.classmate_id = '';
request_main.properties.classmate_image = 'img/person.svg';

request_main.title = '<img src="img/ketchup_logo_white.png" style="height:30px;">';
request_main.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_main.content = '';
request_main.bottom_nav = '';

request_main.functions = new Object();
request_main.functions.load = function(reset, direction) {
	//reset the request
	if(reset == true) {
		request_main.properties = new Object();
		request_main.properties.course = '';
		request_main.properties.course_display = 'Select Course';
		request_main.properties.date = '';
		request_main.properties.time = '';
		request_main.properties.date_display = 'Select Date';
		request_main.properties.classmate_display = 'Select Classmate';
		request_main.properties.classmate_id = '';
		request_main.properties.classmate_image = 'img/person.svg';
	}

	//always reset manual date/time properties
	request_select_manual_date.properties = new Object();
	request_select_manual_time.properties = new Object();

	if(settings.properties.open == true) {
		settings.functions.hide();
	}

	request_main.functions.generate_bottom_nav();
	request_main.functions.generate_content();

	if(direction == 'right') {
		load_page_right_side(request_main.title, request_main.title_addons, request_main.content, request_main.bottom_nav, null, null, 'request_main.html');
	}
	else if(direction == 'left') {
		load_page_left_side(request_main.title, request_main.title_addons, request_main.content, request_main.bottom_nav, null, null, 'request_main.html');
	}
	else {
		load_page(request_main.title, request_main.title_addons, request_main.content, request_main.bottom_nav, null, null, 'request_main.html');
	}
};
request_main.functions.generate_bottom_nav = function() {
	request_main.bottom_nav = '<div id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_main.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_main.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}
request_main.functions.generate_content = function() {
	var request_link_course_style = '';
	var request_link_date_style = '';
	var request_link_classmate_style = '';
	var request_link_submit_style = '';

	if(request_main.properties.course == '') {
		request_link_course_style += 'font-weight:bold;';
		request_link_date_style += 'color:gray;';
		request_link_classmate_style += 'color:gray;';
	}
	if(request_main.properties.date == '') {
		request_link_date_style += 'font-weight:bold;';
	}
	if(request_main.properties.classmate_id == '') {
		request_link_classmate_style += 'font-weight:bold;';
	}
	if((request_main.properties.course == '') || (request_main.properties.date == '') || (request_main.properties.classmate_id == '')) {
		request_link_submit_style = 'background-color:#999;color:#ccc;';
	}

	request_main.content = '<div id="request_title">Ask a classmate to<br>record a lecture</div>';

	request_main.content += '<a class="request_link" style="'+request_link_course_style+'" href="javascript:request_main.functions.select_course();">';
	request_main.content += '<img src="img/course.png">';
	request_main.content += '<span>'+request_main.properties.course_display+'</span>';
	request_main.content += '<div class="arrow_right"><img src="img/arrow_lg.png"/></div>';
	request_main.content += '</a>';

	request_main.content += '<a class="request_link" style="'+request_link_date_style+'" href="javascript:request_main.functions.select_date();">';
	request_main.content += '<img src="img/calendar.png">';
	request_main.content += '<span>'+request_main.properties.date_display+'</span>';
	request_main.content += '<div class="arrow_right"><img src="img/arrow_lg.png"/></div>';
	request_main.content += '</a>';

	request_main.content += '<a class="request_link last_request_link" style="'+request_link_classmate_style+'" href="javascript:request_main.functions.select_classmate();">';
	request_main.content += '<img src="' + request_main.properties.classmate_image + '">';
	request_main.content += '<span>'+request_main.properties.classmate_display+'</span>';
	request_main.content += '<div class="arrow_right"><img src="img/arrow_lg.png"/></div>';
	request_main.content += '</a>';

	request_main.content += '<a href="#" ontouchstart="request_main.functions.submit_request();" class="request_submit_link" style="' + request_link_submit_style + '">Send Request</a>';
};
request_main.functions.select_course = function() {
	request_select_course.functions.load('right');
};
request_main.functions.select_date = function() {
	if(request_main.properties.course == '') {
		notify('You must select a course before selecting a date.', function(){}, 'Course Required', 'OK');
	}
	else {
		request_select_date.functions.load('right');
	}
};
request_main.functions.select_classmate = function() {
	if(request_main.properties.course == '') {
		notify('You must select a course before selecting a classmate.', function(){}, 'Course Required', 'OK');
	}
	else {
		request_select_classmate.functions.load('right');
	}
};
request_main.functions.submit_request = function() {
	if(request_main.properties.course == '') {
		notify('You must select a course before submitting a request.', function(){}, 'Course Required', 'OK');	
	}
	else if(request_main.properties.date == '') {
		notify('You must select a date before submitting a request.', function(){}, 'Date Required', 'OK');	
	}
	else if(request_main.properties.classmate_id == '') {
		notify('You must select a classmate before submitting a request.', function(){}, 'Classmate Required', 'OK');	
	}
	else {
		if(document.getElementById('loading')) {
			notify('Your request is being submitted', function() {}, 'Please Wait', 'OK');
		}
		else {
			show_loading();

			var ajax = $.ajax({
				type : 'POST',
				url : ketchup_server.domain + '/fn_api_send_record_request.php',
				data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&student_id=' + encodeURIComponent(user.id) + '&student_name=' + encodeURIComponent(user.name) + '&course_id=' + encodeURIComponent(request_main.properties.course) + '&course_name=' + encodeURIComponent(request_main.properties.course_display) + '&date= ' + encodeURIComponent(request_main.properties.date) + '&time= ' + encodeURIComponent(request_main.properties.time) + '&classmate_id=' + encodeURIComponent(request_main.properties.classmate_id) + '&classmate_name=' + encodeURIComponent(request_main.properties.classmate_display) + '&source=iOS&canvas_access_token=' + encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain)
			});

			ajax.fail(function(jqXHR, textStatus) {
				hide_loading();
				notify('Please send your request again', function() {}, 'Error connecting to the KetchUp server', 'OK');
			});
			
			ajax.done(function(jqXHR, textStatus) {
				hide_loading();
				var response = JSON.parse(ajax.responseText);
				if (response.success == true) {
					request_main.properties.course = '';
					request_main.properties.course_display = 'Select Course';
					request_main.properties.date = '';
					request_main.properties.time = '';
					request_main.properties.date_display = 'Select Date';
					request_main.properties.classmate_display = 'Select Classmate';
					request_main.properties.classmate_id = '';
					request_main.properties.classmate_image = 'img/person.svg';

					if ( typeof (Ti) != 'undefined') {
						Ti.App.fireEvent('app:request:request_submitted', {
							title: 'Request Sent',
							message: response.message,
							button_name: 'OK'
						});
					}
					else {
						notify(response.message, function() {
							listen_select_recording.functions.load();
						}, 'Request Sent', 'OK');
					}

					ga_event('request_select_classmate');
				}
				else {
					notify(response.message, function(){}, 'Error', 'OK');
				}
			});
		}
	}
};

//event listeners
add_event_listener_once('app:all:request_submitted_redirect', function(e) {
	listen_select_recording.functions.load();
});

//****************************************************************************************************
//request select course
//****************************************************************************************************

var request_select_course = new Object();
request_select_course.title = 'Select Course';
request_select_course.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_select_course.title_addons += '<a ontouchstart="request_main.functions.load(false, \'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
request_select_course.content = '<div id="courses"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
request_select_course.bottom_nav = '';
request_select_course.functions = new Object();
request_select_course.functions.load = function(direction) {
	request_select_course.functions.generate_bottom_nav();

	if(direction == 'right') {
		load_page_right_side(request_select_course.title, request_select_course.title_addons, request_select_course.content, request_select_course.bottom_nav, request_select_course.functions.get_courses, null, 'request_select_course.html');
	}
	else if(direction == 'left') {
		load_page_left_side(request_select_course.title, request_select_course.title_addons, request_select_course.content, request_select_course.bottom_nav, request_select_course.functions.get_courses, null, 'request_select_course.html');
	}
	else {
		load_page(request_select_course.title, request_select_course.title_addons, request_select_course.content, request_select_course.bottom_nav, request_select_course.functions.get_courses, null, 'request_select_course.html');
	}
};
request_select_course.functions.generate_bottom_nav = function() {
	request_select_course.bottom_nav = '<div ontouchstart="request_main.functions.load(false, \'left\');" id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_select_course.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_select_course.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

request_select_course.functions.get_courses = function() {
	//document.getElementById('courses').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';

	var return_content = '';

	var ajax = $.ajax({
		type : 'GET',
		//async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_courses_for_student.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&canvas_access_token=' + encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain)
	});

	ajax.fail(function(jqXHR, textStatus) {
		request_select_course.functions.display_error(jqXHR.statusText);
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			if(response.arr_courses) {
				var arr_courses = response.arr_courses;

				var course_count = arr_courses.length;
				if (course_count == 0) {
					return_content += '<a class="tappable_error" href="javascript:request_main.functions.load(false, \'left\');">';
					return_content += 'No courses were found<br><span class="tappable_error_link">Back</span>';
					return_content += '</a>';				
				}
				else {
					for (var j = 0; j < course_count; j++) {
						var course_link = '<a href="javascript:request_select_course.functions.select_course(\'' + arr_courses[j].course_id + '\', \'' + arr_courses[j].course_name + '\');" class="request_select_course_button">';
						course_link += arr_courses[j].course_name + '</a>';
						return_content += course_link;
					}
				}

				document.getElementById('courses').innerHTML = return_content;
				scroll_app();
			}
			else {
				request_select_course.functions.display_error('Error in response format. Please contact KetchUp support.');
			}
		} else {
			if(response.reauthenticate) {
				sign_in.functions.canvas_token_expired();
			}
			else {
				request_select_course.functions.display_error(response.message);
			}
		}
	});
};
request_select_course.functions.select_course = function(course_id, course_name) {
	request_main.properties.course = course_id;
	request_main.properties.course_display = course_name;

	//reset date and classmate
	request_main.properties.date = '';
	request_main.properties.time = '';
	request_main.properties.date_display = 'Select Date';
	request_main.properties.classmate_display = 'Select Classmate';
	request_main.properties.classmate_id = '';
	request_main.properties.classmate_image = 'img/person.svg';

	request_main.functions.load(false, 'left');
};

request_select_course.functions.display_loading = function() {
	document.getElementById('courses').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';
}
request_select_course.functions.display_error = function(error_msg) {
	var error_html = '';
	error_html += '<a class="tappable_error" onclick="javascript:request_select_course.functions.display_loading();"; href="javascript:request_select_course.functions.get_courses();">';
	error_html += 'The following error occurred:';
	error_html += '<br>';
	error_html += error_msg;
	error_html += '<br>';
	error_html += '<span class="tappable_error_link">Tap to retry</span>';
	error_html += '</a>';

	document.getElementById('courses').innerHTML = error_html;
	scroll_app();
}

//****************************************************************************************************
//request select date
//****************************************************************************************************

var request_select_date = new Object();
request_select_date.title = 'Select Date';
request_select_date.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_select_date.title_addons += '<a ontouchstart="request_main.functions.load(false, \'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
request_select_date.content = '<div id="dates"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
request_select_date.bottom_nav = '';
request_select_date.functions = new Object();
request_select_date.functions.load = function(direction) {
	request_select_date.functions.generate_bottom_nav();

	if(direction == 'left') {
		load_page_left_side(request_select_date.title, request_select_date.title_addons, request_select_date.content, request_select_date.bottom_nav, request_select_date.functions.get_dates, null, 'request_select_date.html');
	}
	else if(direction == 'right') {
		load_page_right_side(request_select_date.title, request_select_date.title_addons, request_select_date.content, request_select_date.bottom_nav, request_select_date.functions.get_dates, null, 'request_select_date.html');	
	}
	else {
		load_page(request_select_date.title, request_select_date.title_addons, request_select_date.content, request_select_date.bottom_nav, request_select_date.functions.get_dates, null, 'request_select_date.html');
	}
};
request_select_date.functions.generate_bottom_nav = function() {
	request_select_date.bottom_nav = '<div ontouchstart="request_main.functions.load(false, \'left\');" id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_select_date.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_select_date.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

request_select_date.functions.get_dates = function() {
	document.getElementById('dates').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';

	var return_content = '';

	var ajax = $.ajax({
		type : 'GET',
		//async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_dates_for_course.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&canvas_access_token='+encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain) + '&course_id=' + encodeURIComponent(request_main.properties.course)
	});

	ajax.fail(function(jqXHR, textStatus) {
		var error_msg = '';
		error_msg += '<a class="tappable_error" href="javascript:request_select_date.functions.get_dates();">';
		error_msg += 'The following error occurred:';
		error_msg += '<br>';
		error_msg += jqXHR.statusText;
		error_msg += '<br>';
		error_msg += '<span class="tappable_error_link">Tap to retry</span>';
		error_msg += '</a>';

		document.getElementById('dates').innerHTML = error_msg;
		scroll_app();
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			var dates = response.dates;

			var date_count = dates.length;
			if (date_count == 0) {
				request_select_manual_date.functions.load();
			} else {
				for (var j = 0; j < date_count; j++) {
					var date_link = '<a href="javascript:request_select_date.functions.select_date_time('+dates[j].ccyymmdd+', '+dates[j].hhmmss+');" class="request_select_date_button">';
					date_link += dates[j].display_date + '</a>';
					return_content += date_link;
				}

				if (response.allow_manual_date_select) {
					return_content += '<a href="javascript:request_select_manual_date.functions.load(\'right\');" class="request_select_date_button">Other...</a>';
				}
			}
		} else {
			return_content += '<a class="tappable_error" href="javascript:request_select_date.functions.get_dates();">';
			return_content += 'The following error occurred:';
			return_content += '<br>';
			return_content += response.message;
			return_content += '<br>';
			return_content += '<span class="tappable_error_link">Tap to retry</span>';
			return_content += '</a>';
		}

		document.getElementById('dates').innerHTML = return_content;
		scroll_app();
	});
};
request_select_date.functions.select_date_time = function(date, time, redirect_location) {
	//update main request
	request_main.properties.date = date;
	request_main.properties.date_display = generate_display_date(date);
	request_main.properties.time = time;

	//redirect
	request_main.functions.load(false, 'left');
};

//****************************************************************************************************
//request select manual date
//****************************************************************************************************

var request_select_manual_date = new Object();
request_select_manual_date.title = 'Select Date';
request_select_manual_date.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_select_manual_date.title_addons += '<a ontouchstart="request_main.functions.load(false, \'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
request_select_manual_date.content = '<div id="manual_select_date"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
request_select_manual_date.bottom_nav = '';
request_select_manual_date.properties = new Object();
request_select_manual_date.functions = new Object();
request_select_manual_date.functions.load = function(direction) {
	request_select_manual_date.functions.generate_bottom_nav();

	//determine default date
	//hierarchy: request_select_time date > request_main date > current date
	if(request_select_manual_time.properties.date) {
		var current_year = parseInt(String(request_select_manual_time.properties.date).substring(0, 4));
		var current_month = parseInt(String(request_select_manual_time.properties.date).substring(4, 6));
	}
	else if(request_main.properties.date != '') {
		var current_year = parseInt(String(request_main.properties.date).substring(0, 4));
		var current_month = parseInt(String(request_main.properties.date).substring(4, 6));
	}
	else {
		var current_date = new Date;
		var current_year = current_date.getFullYear();
		var current_month = current_date.getMonth();

		//since this date comes from javascript, we need to increment current_month by 1 since server dates all use months starting at 1
		//but javascript uses months starting at 0
		current_month++;
	}
	request_select_manual_date.properties.default_year = current_year;
	request_select_manual_date.properties.default_month = current_month;

	if(direction == 'left') {
		load_page_left_side(request_select_manual_date.title, request_select_manual_date.title_addons, request_select_manual_date.content, request_select_manual_date.bottom_nav, request_select_manual_date.functions.display_default_date, null, 'request_select_manual_date.html');
	}
	else if(direction == 'right') {
		load_page_right_side(request_select_manual_date.title, request_select_manual_date.title_addons, request_select_manual_date.content, request_select_manual_date.bottom_nav, request_select_manual_date.functions.display_default_date, null, 'request_select_manual_date.html');	
	}
	else {
		load_page(request_select_manual_date.title, request_select_manual_date.title_addons, request_select_manual_date.content, request_select_manual_date.bottom_nav, request_select_manual_date.functions.display_default_date, null, 'request_select_manual_date.html');
	}
};
request_select_manual_date.functions.generate_bottom_nav = function() {
	request_select_manual_date.bottom_nav = '<div ontouchstart="request_main.functions.load(false, \'left\');" id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_select_manual_date.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_select_manual_date.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

request_select_manual_date.functions.display_default_date = function() {
	request_select_manual_date.functions.display_month(request_select_manual_date.properties.default_year, request_select_manual_date.properties.default_month);
}
request_select_manual_date.functions.display_month = function(year, month) {
	var return_content = request_select_manual_date.functions.load_month(year, month);

	document.getElementById('manual_select_date').innerHTML = return_content;
}
request_select_manual_date.functions.load_month = function(year, month) {
	//get today (javascript date);
	var today_date = new Date;
	var today_year = today_date.getFullYear();
	var today_month = today_date.getMonth();
	var today_day = today_date.getDate();

	//increment month from javascript since the months we are storing are from server months (start at 1)
	//as opposed to javascript months (start at 0)
	today_month++;

	//get selected date (server date)
	//hierarchy: request_select_time date > request_main date
	var selected_year = 0;
	var selected_month = 0;
	var selected_day = 0;
	if(request_select_manual_time.properties.date) {
		var selected_year = String(request_select_manual_time.properties.date).substring(0, 4);
		var selected_month = String(request_select_manual_time.properties.date).substring(4, 6);
		var selected_day = String(request_select_manual_time.properties.date).substring(6, 8);
	}
	else if(request_main.properties.date != '') {
		var selected_year = String(request_main.properties.date).substring(0, 4);
		var selected_month = String(request_main.properties.date).substring(4, 6);
		var selected_day = String(request_main.properties.date).substring(6, 8);
	}

	var return_content = '';

	//generate prev month/year
	if(month != 0) {
		var prev_month = (month - 1);
		var prev_year = year;
	}
	else {
		var prev_month = 11;
		var prev_year = (year - 1);
	}

	//generate next month/year
	if(month != 11) {
		var next_month = (month + 1);
		var next_year = year;
	}
	else {
		var next_month = 0;
		var next_year = (year + 1);
	}

	//output date select
	return_content += '<div class="month_title">';
	return_content += '<a class="month_prev" href="javascript:request_select_manual_date.functions.display_month('+prev_year+', '+prev_month+');">&lt;</a>';
	return_content += ' '+month_names[month]+' '+year;
	return_content += '<a class="month_next" href="javascript:request_select_manual_date.functions.display_month('+next_year+', '+next_month+');">&gt;</a> ';
	return_content += '</div>';

	//start table
	return_content += '<table class="dates">';

	for(var this_day=1;this_day<=31;this_day++) {
		var this_date = new Date(year, (month - 1), this_day);
		var this_year = this_date.getFullYear();
		var this_month = this_date.getMonth();

		//convert this month to server month
		this_month++;
		
		//make sure its a valid date
		if((this_year == year) && (this_month == month)) {
			var this_day = this_date.getDate();
			var this_day_of_week = this_date.getDay();

			//build ccyymmdd date
			var this_year_string = String(this_year);
			var this_month_string = String(this_month);
			var this_day_string = String(this_day);

			while(this_month_string.length < 2) {
				this_month_string = '0'+this_month_string;
			}

			while(this_day_string.length < 2) {
				this_day_string = '0'+this_day_string;
			}

			var this_ccyymmdd = this_year_string + this_month_string + this_day_string;

			//start row
			if((this_day == 1) || (this_day_of_week == 0)) {
				return_content += '<tr>';
			}

			if(this_day == 1) {
				//add blank cells at start of month
				for(var blank_cells=0;blank_cells<this_day_of_week;blank_cells++) {
					return_content += '<td class="blank">&nbsp;</td>';
				}
			}
			
			//determine cell class
			var cell_class = 'day';
			if((today_year == this_year) && (today_month == this_month) && (today_day == this_day)) {
				cell_class += ' today';	
			}
			if((selected_year == this_year) && (selected_month == this_month) && (selected_day == this_day)) {
				cell_class += ' selected';
			}

			return_content += '<td class="'+cell_class+'"><a href="javascript:request_select_manual_date.functions.select_date('+this_ccyymmdd+');">'+this_day+'</a></td>'; //eventually should have a way to select time.  for now, setting to midnight (0)

			//end row
			if(this_day_of_week == 6) {
				return_content += '</tr>';
			}
		}
	}

	//add blank cells at end of month
	for(var blank_cells=this_day_of_week;blank_cells<6;blank_cells++) {
		return_content += '<td class="blank">&nbsp;</td>';
	}

	//end table
	if(this_day_of_week != 6) {
		return_content += '</tr>';
	}
	return_content += '</table>';

	return return_content;
}

request_select_manual_date.functions.select_date = function(date) {
	//update select time properties
	request_select_manual_time.properties.date = date;

	//redirect
	request_select_manual_time.functions.load(false, 'right');
};

//****************************************************************************************************
//request select manual time
//****************************************************************************************************

var request_select_manual_time = new Object();
request_select_manual_time.title = 'Select Time';
request_select_manual_time.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_select_manual_time.title_addons += '<a ontouchstart="request_select_manual_date.functions.load(\'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
request_select_manual_time.content = '<div id="manual_select_time"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
request_select_manual_time.bottom_nav = '';
request_select_manual_time.properties = new Object();
request_select_manual_time.functions = new Object();
request_select_manual_time.functions.load = function(direction) {
	request_select_manual_time.functions.generate_bottom_nav();

	//determine default time
	//hierarchy: request_main > none
	if(request_main.properties.time != '') {
		var current_hour = parseInt(String(request_main.properties.time).substring(0, 2));
		var current_minute = parseInt(String(request_main.properties.time).substring(2, 4));
		var current_second = parseInt(String(request_main.properties.time).substring(4, 6));		
	}
	else {
		var current_hour = 0;
		var current_minute = 0;
		var current_second = 0;
	}
	request_select_manual_time.properties.default_hour = current_hour;
	request_select_manual_time.properties.default_minute = current_minute;
	request_select_manual_time.properties.default_second = current_second;

	if(direction == 'left') {
		load_page_left_side(request_select_manual_time.title, request_select_manual_time.title_addons, request_select_manual_time.content, request_select_manual_time.bottom_nav, request_select_manual_time.functions.display_default_time, null, 'request_select_manual_time.html');
	}
	else if(direction == 'right') {
		load_page_right_side(request_select_manual_time.title, request_select_manual_time.title_addons, request_select_manual_time.content, request_select_manual_time.bottom_nav, request_select_manual_time.functions.display_default_time, null, 'request_select_manual_time.html');
	}
	else {
		load_page(request_select_manual_time.title, request_select_manual_time.title_addons, request_select_manual_time.content, request_select_manual_time.bottom_nav, request_select_manual_time.functions.display_default_time, null, 'request_select_manual_time.html');
	}
};
request_select_manual_time.functions.generate_bottom_nav = function() {
	request_select_manual_time.bottom_nav = '<div ontouchstart="request_main.functions.load(false, \'left\');" id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_select_manual_time.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_select_manual_time.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

request_select_manual_time.functions.display_default_time = function() {
	request_select_manual_time.functions.display_time(request_select_manual_time.properties.default_hour, request_select_manual_time.properties.default_minute, request_select_manual_time.properties.default_second);
}
request_select_manual_time.functions.display_time = function(hour, minute, second) {
	var return_content = request_select_manual_time.functions.load_time(hour, minute, second);

	document.getElementById('manual_select_time').innerHTML = return_content;
}
request_select_manual_time.functions.load_time = function(hour, minute, second) {
	//currently only supporting 12hr time, but server time is in 24hr, so conversion here
	request_select_manual_time.properties.time_type = '12hr';

	var ampm = 'am'; //need to pick a default

	if(hour == 0) {
		hour = 12;
		ampm = 'am';
	}
	else if(hour > 12) {
		hour -= 12;
		ampm = 'pm';
	}

	var return_content = '';

	return_content += '<div class="panel">';

	//start 12hr select
	return_content += '<div id="time_select_12hr">';

	//hour
	return_content += '<select id="manual_time_hour">';
	for(var j=1;j<=12;j++) {
		var hour_display = String(j);
		if(hour_display.length < 2) {
			hour_display = '0'+hour_display;
		}

		var selected = '';
		if(j == hour) {
			selected = ' selected="selected"';
		}

		return_content += '<option value="'+j+'"'+selected+'>'+hour_display+'</option>';
	}
	return_content += '</select>';

	return_content += ' ';

	//minute
	return_content += '<select id="manual_time_minute">';
	for(var j=0;j<=55;j+=5) {
		var minute_display = String(j);
		if(minute_display.length < 2) {
			minute_display = '0'+minute_display;
		}

		var selected = '';
		if(j == minute) {
			selected = ' selected="selected"';
		}

		return_content += '<option value="'+j+'"'+selected+'>'+minute_display+'</option>';
	}
	return_content += '</select>';

	return_content += ' ';

	//second
	return_content += '<input type="hidden" id="manual_time_second" value="0">';

	//AM/PM
	var am_selected = '';
	if(ampm == 'am') {
		am_selected = ' selected="selected"';
	}

	var pm_selected = '';
	if(ampm == 'pm') {
		pm_selected = ' selected="selected"';
	}

	return_content += '<select id="manual_time_ampm">';
	return_content += '<option value="am"'+am_selected+'>AM</option>';
	return_content += '<option value="pm"'+pm_selected+'>PM</option>';
	return_content += '</select>';

	//end 12hr select
	return_content += '</div>';

	return_content += '<a href="javascript:request_select_manual_time.functions.select_time();">Save Time</a>';

	//end panel
	return_content += '</div>';

	return return_content;
}

request_select_manual_time.functions.select_time = function() {
	var hour = parseInt(document.getElementById('manual_time_hour').value);
	var minute = parseInt(document.getElementById('manual_time_minute').value);
	var second = parseInt(document.getElementById('manual_time_second').value);
	var ampm = document.getElementById('manual_time_ampm').value;

	var hhmmss = '';

	//generate hhmmss time
	if(request_select_manual_time.properties.time_type == '12hr') {
		//convert hours to 24hr
		if(ampm == 'pm') {
			hour += 12;
		}
		if(hour == 24) {
			hour = 0;
		}

		//make sure we have two characters for everything
		var string_hour = String(hour);
		if(string_hour.length < 2) {
			string_hour = '0' + string_hour;
		}

		var string_minute = String(minute);
		if(string_minute.length < 2) {
			string_minute = '0' + string_minute;
		}

		var string_second = String(second);
		if(string_second.length < 2) {
			string_second = '0' + string_second;
		}

		hhmmss = string_hour + string_minute + string_second;
	}

	//update main request
	request_main.properties.date = request_select_manual_time.properties.date;
	request_main.properties.date_display = generate_display_date(request_select_manual_time.properties.date);
	request_main.properties.time = hhmmss;

	//redirect
	request_main.functions.load(false, 'left');
}

//****************************************************************************************************
//request select classmate
//****************************************************************************************************

var request_select_classmate = new Object();
request_select_classmate.title = 'Select Classmate';
request_select_classmate.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
request_select_classmate.title_addons += '<a ontouchstart="request_main.functions.load(false, \'left\');" class="header_left_button"><img src="img/left_arrow.gif"></a>';
request_select_classmate.content = '<div id="students"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
request_select_classmate.bottom_nav = '';
request_select_classmate.functions = new Object();
request_select_classmate.functions.load = function(direction) {
	request_select_classmate.functions.generate_bottom_nav();

	if(direction == 'left') {
		load_page_left_side(request_select_classmate.title, request_select_classmate.title_addons, request_select_classmate.content, request_select_classmate.bottom_nav, request_select_classmate.functions.get_students, null, 'request_select_classmate.html');
	}
	else if(direction == 'right') {
		load_page_right_side(request_select_classmate.title, request_select_classmate.title_addons, request_select_classmate.content, request_select_classmate.bottom_nav, request_select_classmate.functions.get_students, null, 'request_select_classmate.html');
	}
	else {
		load_page(request_select_classmate.title, request_select_classmate.title_addons, request_select_classmate.content, request_select_classmate.bottom_nav, request_select_classmate.functions.get_students, null, 'request_select_classmate.html');
	}
};
request_select_classmate.functions.generate_bottom_nav = function() {
	request_select_classmate.bottom_nav = '<div ontouchstart="request_main.functions.load(false, \'left\');" id="nav_request" class="nav_button_sel"><img src="img/request_icon_sel.png"><div>Request</div></div>';
	request_select_classmate.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	request_select_classmate.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

request_select_classmate.functions.get_students = function() {
	//document.getElementById('students').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';
	
	var return_content = '';

	var ajax = $.ajax({
		type : 'GET',
		//async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_students_for_course.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&canvas_access_token=' + encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain) + '&course_id=' + encodeURIComponent(request_main.properties.course)
	});

	ajax.fail(function(jqXHR, textStatus) {
		request_select_classmate.functions.display_error(jqXHR.statusText);
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			var classmates = response.classmates;

			var classmate_count = classmates.length;
			if (classmate_count == 0) {
				return_content += '<div id="loading_inline">';
				return_content += 'No students found<br><a href="javascript:request_main.functions.load(false, \'left\');">Back</a>';
				return_content += '</div>';
			} else {
				for (var j = 0; j < classmate_count; j++) {
					var img_url = '';
					if (classmates[j].img_url) {
						img_url = classmates[j].img_url;
					}

					var student_link = '<a href="javascript:request_select_classmate.functions.select_classmate(\'' + classmates[j].name + '\', \'' + classmates[j].id + '\', \''+img_url+'\');" class="request_select_classmate_button">';
					if (img_url != '') {
						student_link += '<img src="' + classmates[j].img_url + '">';
					} else {
						student_link += '<span>&nbsp;</span>';
					}
					student_link += '<div>' + classmates[j].name + '</div>';
					student_link += '</a>';
					return_content += student_link;
				}
			}

			document.getElementById('students').innerHTML = return_content;
			scroll_app();
		}
		else {
			request_select_classmate.functions.display_error(response.message);
		}
	});
};
request_select_classmate.functions.select_classmate = function(classmate_display, classmate_id, classmate_image) {
	request_main.properties.classmate_display = classmate_display;
	request_main.properties.classmate_id = classmate_id;
	request_main.properties.classmate_image = classmate_image;
	request_main.functions.load(false, 'left');
};

request_select_classmate.functions.display_loading = function() {
	document.getElementById('students').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';
}
request_select_classmate.functions.display_error = function(error_msg) {
	var error_html = '';
	error_html += '<a class="tappable_error" onclick="javascript:request_select_classmate.functions.display_loading();"; href="javascript:request_select_classmate.functions.get_students();">';
	error_html += 'The following error occurred:';
	error_html += '<br>';
	error_html += error_msg;
	error_html += '<br>';
	error_html += '<span class="tappable_error_link">Tap to retry</span>';
	error_html += '</a>';

	document.getElementById('students').innerHTML = error_html;
	scroll_app();
}

//****************************************************************************************************
//listen select recording
//****************************************************************************************************

var listen_select_recording = new Object();
listen_select_recording.title = 'Listen To Lecture';
listen_select_recording.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
listen_select_recording.content = '<div id="recordings_container"><div id="recordings"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div></div>';
listen_select_recording.bottom_nav = '';

listen_select_recording.functions = new Object();
listen_select_recording.functions.load = function(direction) {
	listen_select_recording.functions.generate_bottom_nav();

	if(direction == 'right') {
		load_page_right_side(listen_select_recording.title, listen_select_recording.title_addons, listen_select_recording.content, listen_select_recording.bottom_nav, listen_select_recording.functions.get_recordings, null, 'listen_select_recording.html');
	}
	else if(direction == 'left') {
		load_page_left_side(listen_select_recording.title, listen_select_recording.title_addons, listen_select_recording.content, listen_select_recording.bottom_nav, listen_select_recording.functions.get_recordings, null, 'listen_select_recording.html');
	}
	else {
		load_page(listen_select_recording.title, listen_select_recording.title_addons, listen_select_recording.content, listen_select_recording.bottom_nav, listen_select_recording.functions.get_recordings, null, 'listen_select_recording.html');
	}
};
listen_select_recording.functions.generate_bottom_nav = function() {
	listen_select_recording.bottom_nav = '<div ontouchstart="request_main.functions.load(true);" id="nav_request" class="nav_button"><img src="img/request_icon.png"><div>Request</div></div>';
	listen_select_recording.bottom_nav += '<div id="nav_listen" class="nav_button_sel">'+listen_badge.badge+'<img src="img/listen_icon_sel.png"><div>Listen</div></div>';
	listen_select_recording.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

listen_select_recording.functions.play_recording = function(filename) {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:player:set_recording', {
			filename: filename
		});
	}
};

listen_select_recording.functions.download_recording = function(filename, course, date, recorder, index) {
	//change link
	$('#listen_download_button_'+index).remove();
	$('#listen_select_course_button_'+index).attr('href', 'javascript:listen_select_recording.functions.prompt_cancel_download(\''+filename+'\', \''+course+'\', \''+date+'\', \''+recorder+'\', '+index+');');

	//show progress
	var progress_bar = '<div class="progress_bar_container">';
	progress_bar += '<div id="upload_progress_bar_'+index+'" class="progress_bar" style="height:5px;margin:0;float:none;">&nbsp;</div>';
	progress_bar += '</div>';

	var container = document.getElementById('listen_recorded_by_'+index);
	container.innerHTML = progress_bar;
	
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:listen:download_recording', {
			dropbox_server: dropbox_server,
			filename: filename,
			course: course,
			date: date,
			recorder: recorder,
			index: index,
			override_wifi: false
		});
	}
};
listen_select_recording.functions.prompt_cancel_download = function(filename, course, date, recorder, index) {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:listen:prompt_cancel_download', {
			filename: filename,
			course: course,
			date: date,
			recorder: recorder,
			index: index
		});
	}
};
listen_select_recording.functions.cancel_download = function(filename, course, date, recorder, index, download_in_progress) {
	var link_content = listen_select_recording.functions.generate_link_content('', course, date, recorder, index);
	$('#listen_select_course_button_'+index).html(link_content);
	$('#listen_select_course_button_'+index).attr('href', 'javascript:listen_select_recording.functions.download_recording(\''+filename+'\', \''+course+'\', \''+date+'\', \''+recorder+'\', '+index+');');

	if(download_in_progress == true) {
		if ( typeof (Ti) != 'undefined') {
			Ti.App.fireEvent('app:listen:cancel_download', {
				filename: filename,
				course: course,
				date: date,
				recorder: recorder,
				index: index
			});
		}
	}
};

listen_select_recording.functions.prompt_delete_recording = function(filename, course, date, recorder, index) {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:listen:prompt_delete_recording', {
			filename: filename,
			course: course,
			date: date,
			recorder: recorder,
			index: index
		});
	}
};
listen_select_recording.functions.delete_recording = function(filename, course, date, recorder, index) {
	var link_content = listen_select_recording.functions.generate_link_content('', course, date, recorder, index);
	$('#listen_select_course_button_'+index).html(link_content);
	$('#listen_select_course_button_'+index).attr('href', 'javascript:listen_select_recording.functions.download_recording(\''+filename+'\', \''+course+'\', \''+date+'\', \''+recorder+'\', '+index+');');
	$('#listen_select_course_button_'+index).css('left', '320px');
	$('#listen_select_course_button_'+index).removeClass('listen_recording_available');
	$('#listen_select_course_button_'+index).addClass('listen_recording_unavailable');
	$('#listen_select_course_button_'+index).draggable({cancel: '#recordings_container'});

	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:listen:delete_recording', {
			filename: filename,
			course: course,
			date: date,
			recorder: recorder,
			index: index
		});
	}
};

listen_select_recording.functions.get_recordings = function() {
	$('#listen_could_not_connect').remove();
	if ( typeof (Ti) != 'undefined') {
		setTimeout(function(){
			Ti.App.fireEvent('app:listen:get_audio_files_on_device');
		}, 100); //added a delay so that screen responds instantly
	}
};

listen_select_recording.functions.get_recordings_fail = function() {
	//tried to do this, but it didnt work with the weird formatting
	/*return_content += '<a class="tappable_error" href="javascript:listen_select_recording.functions.get_recordings();">';
	return_content += 'The following error occurred:';
	return_content += '<br>';
	return_content += jqXHR.statusText;
	return_content += '<br>';
	return_content += '<span class="tappable_error_link">Tap to retry</span>';
	return_content += '</a>';

	return return_content;*/

	return_content += '<div id="loading_inline">';
	return_content = 'The following error occurred:';
	return_content += '<br>';
	return_content += jqXHR.statusText;
	return_content += '<br>';
	return_content += '<a href="javascript:listen_select_recording.functions.get_recordings();">Tap to retry</a>';
	return_content += '</div>';
	
	return return_content;
};

listen_select_recording.functions.generate_link_content = function(file_on_device, course, date, recorder, index) {
	var display_date = generate_display_date(date);

	if(file_on_device == 'NOT_RECORDED') {
		var link_content = '<div class="listen_course_name">'+course+'</div>';
		link_content += '<div class="listen_course_info">'+display_date+'</div>';
		link_content += '<div class="listen_course_info" id="listen_recorded_by_'+index+'">Request sent to ' + recorder + '</div>';
		link_content += '<div class="listen_request_sent"><img src="img/request_icon.png">Request Sent!</div>';
	}
	else {
		var link_content = '<div class="listen_course_name">'+course+'</div>';
		link_content += '<div class="listen_course_info">'+display_date+'</div>';
		if (recorder != '') {
			link_content += '<div class="listen_course_info" id="listen_recorded_by_'+index+'">Recorded by ' + recorder + '</div>';
		}
		else {
			link_content += '<div class="listen_course_info" id="listen_recorded_by_'+index+'"></div>';
		}
		
		if(file_on_device == '') {
			link_content += '<div class="listen_download_button" id="listen_download_button_'+index+'">Download</div>';
		}
		else {
			link_content += '<div class="listen_request_sent" style="padding-top:0px;margin-top:-3px;"><img src="img/play.gif" style="width:50px;"></div>';
		}
	}

	return link_content;
};

listen_select_recording.functions.generate_recording_output = function(recordings, directory_array) {
	var return_content = '';

	var recording_count = recordings.length;
	if (recording_count == 0) {
		return_content += '<div id="loading_inline" style="margin-left:120px;">';
		return_content += 'Your library is currently empty<br><a href="javascript:request_main.functions.load(true);">Create a new request</a>';
		return_content += '</div>';
	} else {
		var recordings_playlist = new Array();

		for (var j = 0; j < recording_count; j++) {
			var course = recordings[j].course;
			var date = recordings[j].date;
			var recorder = recordings[j].recorder;
			
			if(recordings[j].filename) {
				var filename = recordings[j].filename;
				var expiration_date = recordings[j].expiration_date;
				
				//check if file is on device
				var file_on_device = '';
				if($.inArray(filename, directory_array) != -1) {
					file_on_device = 'Y';
				}
				
				if(file_on_device == '') {
					var recording_link = '<a href="javascript:listen_select_recording.functions.download_recording(\'' + filename + '\', \''+course+'\', \''+date+'\', \''+recorder+'\', '+j+');" class="listen_select_course_button listen_recording_unavailable" id="listen_select_course_button_'+j+'">';
					recording_link += listen_select_recording.functions.generate_link_content(file_on_device, course, date, recorder, j);
					recording_link += '</a>';
					return_content += recording_link;
				}
				else {
					var recording_link = '<a href="javascript:listen_select_recording.functions.play_recording(\''+filename+'\');" class="listen_select_course_button listen_recording_available" id="listen_select_course_button_'+j+'">';
					recording_link += listen_select_recording.functions.generate_link_content(file_on_device, course, date, recorder, j);
					recording_link += '</a>';
					return_content += recording_link;
				}
			}
			else {
				var recording_link = '<div class="listen_select_course_button listen_recording_unavailable" id="listen_select_course_button_'+j+'">';
				recording_link += listen_select_recording.functions.generate_link_content('NOT_RECORDED', course, date, recorder, j);
				recording_link += '</div>';
				return_content += recording_link;
			}
		}
	}

	return return_content;
};
listen_select_recording.functions.generate_delete_recording_output = function(recordings) {
	var return_content = '';

	var recording_count = recordings.length;
	if (recording_count == 0) {
		//return_content += 'No recordings were found<br><a href="javascript:request_main.functions.load(true);">Return to the Main Menu</a>';
	} else {
		var recordings_playlist = new Array();

		for (var j = 0; j < recording_count; j++) {
			var course = recordings[j].course;
			var date = recordings[j].date;
			var recorder = recordings[j].recorder;
			var filename = recordings[j].filename;
			var expiration_date = recordings[j].expiration_date;

			var recording_delete_link = '<a href="javascript:listen_select_recording.functions.prompt_delete_recording(\''+filename+'\', \''+course+'\', \''+date+'\', \''+recorder+'\', '+j+');" class="delete_recording" id="delete_recording_'+j+'">';
			recording_delete_link += 'Delete';
			recording_delete_link += '</a>';
			return_content += recording_delete_link;
		}
	}

	return return_content;
};

//**********
//event listeners
//**********
//try to get recordings from the server
add_event_listener_once('app:all:get_recordings', function(e) {
	var directory_array = e.directory_array;
	var recordings = new Array(); //scope recordings here so we can get length later

	var recording_content = '';
	var delete_content = '';

	var ajax = $.ajax({
		type : 'GET',
		async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_recordings_for_student.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&canvas_access_token=' + encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain) + '&student_id=' + encodeURIComponent(user.id)
	});

	ajax.fail(function(jqXHR, textStatus) {
		if ( typeof (Ti) != 'undefined') {
			Ti.App.fireEvent('app:listen:get_cached_file_list', {
				directory_array: directory_array
			});
		}
		else {
			recording_content += listen_select_recording.functions.get_recordings_fail();
		}
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			recordings = response.recordings;

			//save to titanium
			if ( typeof (Ti) != 'undefined') {
				Ti.App.fireEvent('app:listen:store_recording_info', {
					recordings: recordings
				});
			}
			
			recording_content += listen_select_recording.functions.generate_recording_output(recordings, directory_array);
			delete_content += listen_select_recording.functions.generate_delete_recording_output(recordings);
		} else {
			recording_content += response.message;
		}
	});

	var return_content = '<div id="listen_recording_content">' + recording_content + '</div>';
	return_content += '<div id="listen_delete_content">' + delete_content + '</div>';

	//insert content first
	$('#recordings').html(return_content);

	//some modifications for a fluid layout that we cant accomplish with percentages in css
	var app_width = $('#app').width();
	var delete_button_width = 120;
	var listen_select_course_button_padding = 20;
	$('#recordings_container').css('width', (app_width + delete_button_width - 200) + 'px'); //not sure why we subtract 200 - possibly because of the -200 left margin on #listen_recording_content
	$('.listen_select_course_button').css('width', (app_width - listen_select_course_button_padding) +'px');
	$('#listen_could_not_connect').css('width', (app_width - listen_select_course_button_padding) +'px');
	$('#loading_inline').css('width', (app_width - listen_select_course_button_padding) +'px');

	//set heights of delete to match link
	var count_recordings = recordings.length;
	for(j=0;j<count_recordings;j++) {
		var link_height = $('#listen_select_course_button_'+j).css('height');

		$('#delete_recording_'+j).css('height', link_height);
		$('#delete_recording_'+j).css('line-height', link_height);
	}

	//scrolling and dragging
	scroll_app();
	$('.listen_recording_available').draggable({axis: 'x', containment: '#recordings_container'});
});

//output cached recordings (server connection failed)
add_event_listener_once('app:all:output_recordings_from_cache', function(e) {
	var recordings = e.recordings;
	var directory_array = e.directory_array;

	var recording_content = listen_select_recording.functions.generate_recording_output(recordings, directory_array);
	var delete_content = listen_select_recording.functions.generate_delete_recording_output(recordings);

	var return_content = '<div id="listen_recording_content">' + recording_content + '</div>';
	return_content += '<div id="listen_delete_content">' + delete_content + '</div>';
	
	if(!document.getElementById('listen_could_not_connect')) {
		var app_width = $('#app').width();
		var listen_select_course_button_padding = 20;

		$('#recordings').before('<div class="could_not_connect" id="listen_could_not_connect" style="width:'+(app_width - listen_select_course_button_padding)+'px;">Could not connect to the KetchUp server <a href="javascript:listen_select_recording.functions.get_recordings();">Retry</a></div>');
	}
	$('#recordings').html(return_content);
	scroll_app();
	$('.listen_recording_available').draggable({axis: 'x', containment: '#recordings_container'});
});

///this function updates download progress
add_event_listener_once('app:all:update_recording_download_progress', function(e) {
	var index = e.index;

	//change link
	$('#listen_download_button_'+index).remove();

	//show progress bar
	var progress_bar = '<div class="progress_bar_container">';
	progress_bar += '<div id="upload_progress_bar_'+index+'" class="progress_bar" style="height:5px;margin:0;float:none;">&nbsp;</div>';
	progress_bar += '</div>';

	var container = document.getElementById('listen_recorded_by_'+index);
	container.innerHTML = progress_bar;

	//update width
	var width = e.progress;
	width *= 100;
	width = Math.floor(width);
	width += '%';
	document.getElementById('upload_progress_bar_'+index).style.width = width;
});

//this function updates to a new link after the recording finishes downloading
add_event_listener_once('app:all:update_recording_available', function(e) {
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;

	var link = document.getElementById('listen_select_course_button_'+index);
	link.href = 'javascript:listen_select_recording.functions.play_recording(\''+filename+'\');';
	link.innerHTML = listen_select_recording.functions.generate_link_content('Y', course, date, recorder, index);
	$('#listen_select_course_button_'+index).removeClass('listen_recording_unavailable');
	$('#listen_select_course_button_'+index).addClass('listen_recording_available');
	$('#listen_select_course_button_'+index).draggable({axis: 'x', containment: '#recordings_container'});
});

//this function cancels a download
add_event_listener_once('app:all:cancel_download', function(e) {
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;
	var download_in_progress = e.download_in_progress;

	listen_select_recording.functions.cancel_download(filename, course, date, recorder, index, download_in_progress);
});

//this function deletes a recording
add_event_listener_once('app:all:delete_recording', function(e) {
	var filename = e.filename;
	var course = e.course;
	var date = e.date;
	var recorder = e.recorder;
	var index = e.index;

	listen_select_recording.functions.delete_recording(filename, course, date, recorder, index);
});

//****************************************************************************************************
//record select course
//****************************************************************************************************

var record_select_course = new Object();
record_select_course.title = 'Record Lecture';
record_select_course.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
record_select_course.content = '<div id="requests"><div id="loading_inline"><img src="img/loading.gif">Loading...</div></div>';
record_select_course.content += '<div class="hidden_images">'; //an attempt to pre-cache images
record_select_course.content += '<img src="img/record_soundwave_gray.gif">';
record_select_course.content += '<img src="img/record_soundwave_red.gif">';
record_select_course.content += '<img src="img/record_pause.png">';
record_select_course.content += '<img src="img/record_record.gif">';
record_select_course.content += '<img src="img/record_stop.gif">';
record_select_course.content += '<img src="img/record_stop_disabled.png">';
record_select_course.content += '<img src="img/record_upload.gif">';
record_select_course.content += '</div>';
record_select_course.bottom_nav = '';
record_select_course.functions = new Object();
record_select_course.functions.load = function(direction) {
	record_select_course.functions.generate_bottom_nav();

	if(direction == 'right') {
		load_page_right_side(record_select_course.title, record_select_course.title_addons, record_select_course.content, record_select_course.bottom_nav, record_select_course.functions.get_requests, null, 'record_select_course.html');
	}
	else if(direction == 'left') {
		load_page_left_side(record_select_course.title, record_select_course.title_addons, record_select_course.content, record_select_course.bottom_nav, record_select_course.functions.get_requests, null, 'record_select_course.html');
	}
	else {
		load_page(record_select_course.title, record_select_course.title_addons, record_select_course.content, record_select_course.bottom_nav, record_select_course.functions.get_requests, null, 'record_select_course.html');
	}
};
record_select_course.functions.generate_bottom_nav = function() {
	record_select_course.bottom_nav = '<div ontouchstart="request_main.functions.load(true);" id="nav_request" class="nav_button"><img src="img/request_icon.png"><div>Request</div></div>';
	record_select_course.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	record_select_course.bottom_nav += '<div id="nav_record" class="nav_button_sel">'+record_badge.badge+'<img src="img/record_icon_sel.png"><div>Record</div></div>';
}
record_select_course.functions.get_requests = function() {
	var return_content = '';

	var ajax = $.ajax({
		type : 'GET',
		// async : false, //because we insert the content after the response
		url : ketchup_server.domain + '/fn_api_get_requests_for_student.php',
		data : 'version=2.0&api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&canvas_access_token=' + encodeURIComponent(user.canvas_access_token) + '&canvas_domain=' + encodeURIComponent(canvas_server.domain) + '&student_id=' + encodeURIComponent(user.id)
	});

	ajax.fail(function(jqXHR, textStatus) {
		record_select_course.functions.display_error(jqXHR.statusText);
	});

	ajax.done(function(jqXHR, textStatus) {
		var response = JSON.parse(ajax.responseText);
		if (response.success == true) {
			var requests = response.requests;

			var request_count = requests.length;
			if (request_count == 0) {
				return_content += '<div id="loading_inline">';
				return_content += 'No requests found';
				return_content += '</div>';
			} else {
				for (var j = 0; j < request_count; j++) {
					var request_link = '<a href="javascript:record_select_course.functions.select_course(' + requests[j].request_id + ', \'' + requests[j].course_name + '\', \'' + requests[j].requester_name + '\');" class="record_select_course_button">';
					request_link += '<div class="mic_right"><img src="img/record_icon.png"></div>';
					if(requests[j].requester_img) {
						request_link += '<img src="' + requests[j].requester_img + '">';
					}
					else {
						request_link += '<img src="img/play.gif" style="visibility:hidden;">';
					}
					
					if (requests[j].requester_name) {
						request_link += '<span>Request from: ' + requests[j].requester_name + '</span><br>';
					}
					request_link += '<span>Class: ' + requests[j].course_name + '</span><br>';		
					request_link += '<span>Date: ' + generate_display_date(requests[j].request_date) + '</span><br>';
					request_link += '</a>';
					return_content += request_link;
				}
			}

			document.getElementById('requests').innerHTML = return_content;
			scroll_app();
		} else {
			record_select_course.functions.display_error(response.message);
		}
	});
};

record_select_course.functions.select_course = function(request_id, course_name, requester_name) {
	record_record.properties.request_id = request_id;
	record_record.properties.course_name = course_name;
	record_record.properties.requester_name = requester_name;

	record_record.functions.generate_content(course_name, requester_name);
	record_best_practices.functions.load('right');
};

record_select_course.functions.display_loading = function() {
	document.getElementById('requests').innerHTML = '<div id="loading_inline"><img src="img/loading.gif">Loading...</div>';
}
record_select_course.functions.display_error = function(error_msg) {
	var error_html = '';
	error_html += '<a class="tappable_error" onclick="javascript:record_select_course.functions.display_loading();" href="javascript:record_select_course.functions.get_requests();">';
	error_html += 'The following error occurred:';
	error_html += '<br>';
	error_html += error_msg;
	error_html += '<br>';
	error_html += '<span class="tappable_error_link">Tap to retry</span>';
	error_html += '</a>';

	document.getElementById('requests').innerHTML = error_html;
	scroll_app();
}

//event listeners


//****************************************************************************************************
//record best practices
//****************************************************************************************************

var record_best_practices = new Object();
record_best_practices.title = 'Best Practices';
record_best_practices.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
record_best_practices.content = '<ol id="record_list">';
record_best_practices.content += '<li>Always ensure you have permission from the professor before recording a lecture.</li>';
record_best_practices.content += '<li>The closer the phone is to the professor, the better the quality.</li>';
record_best_practices.content += '<li>A three hour recording typically uses 25% battery life.</li>';
record_best_practices.content += '<li><b>Switching apps or powering off the screen during a recording may severely impact its quality.</b></li>';
record_best_practices.content += '</ol>';
record_best_practices.content += '<a class="record_continue" href="javascript:record_record.functions.load(\'right\');">Continue</a>';
record_best_practices.bottom_nav = '';
record_best_practices.functions = new Object();
record_best_practices.functions.load = function(direction) {
	record_best_practices.functions.generate_bottom_nav();

	if(direction == 'left') {
		load_page_left_side(record_best_practices.title, record_best_practices.title_addons, record_best_practices.content, record_best_practices.bottom_nav, null, null, 'record_best_practices.html');
	}
	else if(direction == 'right') {
		load_page_right_side(record_best_practices.title, record_best_practices.title_addons, record_best_practices.content, record_best_practices.bottom_nav, null, null, 'record_best_practices.html');
	}
	else {
		load_page(record_best_practices.title, record_best_practices.title_addons, record_best_practices.content, record_best_practices.bottom_nav, null, null, 'record_best_practices.html');
	}
};
record_best_practices.functions.generate_bottom_nav = function() {
	record_best_practices.bottom_nav = '<div ontouchstart="request_main.functions.load(true);" id="nav_request" class="nav_button"><img src="img/request_icon.png"><div>Request</div></div>';
	record_best_practices.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	record_best_practices.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button_sel">'+record_badge.badge+'<img src="img/record_icon_sel.png"><div>Record</div></div>';
}

//****************************************************************************************************
//record record
//****************************************************************************************************

var record_record = new Object();
record_record.title = 'Record Lecture';
record_record.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
record_record.content = '';
record_record.bottom_nav = '';

record_record.properties = new Object();

record_record.functions = new Object();
record_record.functions.load = function(direction) {
	record_record.properties.started = false;
	record_record.properties.uploading = false;
	record_record.properties.showing_upload = false;

	record_record.functions.generate_bottom_nav();
	record_record.functions.generate_content(record_record.properties.course_name, record_record.properties.requester_name);

	if(direction == 'right') {
		load_page_right_side(record_record.title, record_record.title_addons, record_record.content, record_record.bottom_nav, null, null, 'record_record.html');
	}
	else if(direction == 'left') {
		load_page_left_side(record_record.title, record_record.title_addons, record_record.content, record_record.bottom_nav, null, null, 'record_record.html');
	}
	else {
		load_page(record_record.title, record_record.title_addons, record_record.content, record_record.bottom_nav, null, null, 'record_record.html');
	}
};
record_record.functions.generate_bottom_nav = function() {
	record_record.bottom_nav = '<div ontouchstart="request_main.functions.load(true);" id="nav_request" class="nav_button"><img src="img/request_icon.png"><div>Request</div></div>';
	record_record.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	record_record.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button_sel">'+record_badge.badge+'<img src="img/record_icon_sel.png"><div>Record</div></div>';
}

//**********
//content
//**********

record_record.functions.generate_content = function(course_name, requester_name) {
	record_record.content = '<div id="recorder">';
	record_record.content += '<h2 style="margin-bottom:0;">' + course_name + '</h2>';
	if (requester_name != '') {
		record_record.content += '<div id="record_student">for ' + requester_name + '</div>';
	}
	record_record.content += '<img src="img/record_soundwave_gray.gif" id="record_soundwave_gray" class="">';
	record_record.content += '<img src="img/record_soundwave_red.gif" id="record_soundwave_red" style="display:none;">';
	record_record.content += '<div id="record_time_container"><span id="record_time_label">Stopped</span> <span id="record_time">00:00:00</span></div>';
	
	record_record.content += '<div id="idle_div" class="recording_controls_container">';	
	record_record.content += '<a style="float:left;width:50%;" href="javascript:record_record.functions.start_recording();">';
	record_record.content += '<img src="img/record_record.gif">';
	record_record.content += '<div>Record</div>';
	record_record.content += '</a>';
	record_record.content += '<div class="record_disabled" style="float:left;width:50%;">';
	record_record.content += '<img src="img/record_stop_disabled.png">';
	record_record.content += '<div>Stop and Upload</div>';
	record_record.content += '</div>';
	record_record.content += '</div>';

	record_record.content += '<div id="recording_div" class="recording_controls_container" style="display:none;">';
	record_record.content += '<a style="float:left;width:50%;" href="javascript:record_record.functions.pause_recording();">';
	record_record.content += '<img src="img/record_pause.png">';
	record_record.content += '<div>Pause</div>';
	record_record.content += '</a>';
	record_record.content += '<a style="float:left;width:50%;" href="javascript:record_record.functions.confirm_stop_recording();">';
	record_record.content += '<img src="img/record_stop.gif">';
	record_record.content += '<div>Stop and Upload</div>';
	record_record.content += '</a>';
	record_record.content += '</div>';

	record_record.content += '<div id="paused_div" class="recording_controls_container" style="display:none;">';
	record_record.content += '<a style="float:left;width:50%;" href="javascript:record_record.functions.resume_recording();">';
	record_record.content += '<img src="img/record_record.gif">';
	record_record.content += '<div>Record</div>';
	record_record.content += '</a>';
	record_record.content += '<a style="float:left;width:50%;" href="javascript:record_record.functions.confirm_stop_recording();">';
	record_record.content += '<img src="img/record_stop.gif">';
	record_record.content += '<div>Stop and Upload</div>';
	record_record.content += '</a>';
	record_record.content += '</div>';

	record_record.content += '<div id="upload_div" class="recording_controls_container" style="display:none;">';
	record_record.content += '<a class="full_size_control" href="javascript:record_record.functions.upload_recordings();">';
	record_record.content += '<img src="img/record_upload.gif">';
	record_record.content += '<div>Upload Recording</div>';
	record_record.content += '</a>';
	record_record.content += '</div>';

	record_record.content += '<div id="uploading_div" class="recording_controls_container" style="display:none;">';
	record_record.content += '<div id="upload_progress">0%</div>';
	record_record.content += '<div style="overflow:hidden;">';
	record_record.content += '<div id="upload_progress_bar_container" class="progress_bar_container">';
	record_record.content += '<div id="upload_progress_bar" class="progress_bar">&nbsp;</div>';
	record_record.content += '</div>';
	record_record.content += '<a href="javascript:record_record.functions.abort_upload();" id="upload_stop_link"><img src="img/upload_stop.gif"></a>';
	record_record.content += '</div>'; //end row 2
	record_record.content += '<div><img src="img/loading.gif" id="uploading_loading_img">Uploading to KetchUp...</div>';
	record_record.content += '</div>';

	record_record.content += '</div>';	
};

//**********
//record
//**********

record_record.functions.start_recording = function() {
	record_record.properties.started = true;
	record_record.functions.set_audio_time(record_record.functions.format_time(0));
	document.getElementById('record_time_container').style.visibility = '';
	document.getElementById('record_time_label').innerHTML = 'Recording';
	document.getElementById('record_time_container').style.backgroundColor = 'red';

	document.getElementById('record_soundwave_gray').style.display = 'none';
	document.getElementById('record_soundwave_red').style.display = '';

	document.getElementById('idle_div').style.display = 'none';
	document.getElementById('recording_div').style.display = '';

	//change links
	document.getElementById('nav_request').href = 'javascript:record_record.functions.record_nav_request();';
	document.getElementById('nav_listen').href = 'javascript:record_record.functions.record_nav_listen();';
	document.getElementById('nav_record').href = 'javascript:record_record.functions.record_nav_record();';
	document.getElementById('settings_link').href = 'javascript:record_record.functions.record_nav_settings();';

	//create timer
	record_record.properties.timer = 0;
	record_record.properties.interval = setInterval(function() {
		record_record.properties.timer++;
		record_record.functions.set_audio_time(record_record.functions.format_time(record_record.properties.timer));
	}, 1000);
	record_record.properties.paused = false;

	ga_event('recording started', record_record.properties.request_id);
	
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:start', {
			request_id : record_record.properties.request_id,
			ketchup_server : ketchup_server
		});
	}
};
record_record.functions.pause_recording = function() {
	if (record_record.properties.started == true) {
		document.getElementById('record_time_label').innerHTML = 'Paused';
		document.getElementById('record_time_container').style.backgroundColor = 'gray';

		document.getElementById('record_soundwave_red').style.display = 'none';
		document.getElementById('record_soundwave_gray').style.display = '';

		document.getElementById('recording_div').style.display = 'none';
		document.getElementById('paused_div').style.display = '';

		if(record_record.properties.paused == false) {
			clearInterval(record_record.properties.interval);
			record_record.properties.paused = true;
			ga_event('recording paused', record_record.properties.request_id);

			if ( typeof (Ti) != 'undefined') {
				Ti.App.fireEvent('app:recorder:pause');
			}
		}
		else {
			record_record.functions.resume_recording();
		}
	}
};
record_record.functions.resume_recording = function() {
	if (record_record.properties.started == true) {
		document.getElementById('record_time_label').innerHTML = 'Recording';
		document.getElementById('record_time_container').style.backgroundColor = 'red';

		document.getElementById('record_soundwave_gray').style.display = 'none';
		document.getElementById('record_soundwave_red').style.display = '';
		
		document.getElementById('paused_div').style.display = 'none';
		document.getElementById('recording_div').style.display = '';

		if(record_record.properties.paused == true) {
			record_record.properties.interval = setInterval(function() {
				record_record.properties.timer++;
				record_record.functions.set_audio_time(record_record.functions.format_time(record_record.properties.timer));
			}, 1000);
			record_record.properties.paused = false;
			ga_event('recording resumed', record_record.properties.request_id);
		}

		if ( typeof (Ti) != 'undefined') {
			Ti.App.fireEvent('app:recorder:resume');
		}
	}
};
record_record.functions.confirm_stop_recording = function() {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:confirm_stop', {
			request_id : record_record.properties.request_id,
			ketchup_server : ketchup_server, 
			dropbox_server : dropbox_server
		});
	}
	else {
		alert('Titanium error: could not upload');
		
		document.getElementById('uploading_div').style.display = 'none';
		document.getElementById('upload_div').style.display = '';
	}
};
record_record.functions.stop_recording = function() {
	if (record_record.properties.started == true) {
		record_record.properties.started = false;
		record_record.properties.uploading = true;

		//stop timer
		clearInterval(record_record.properties.interval);

		document.getElementById('record_time_label').innerHTML = 'Stopped';
		document.getElementById('record_time_container').style.backgroundColor = 'gray';

		document.getElementById('record_soundwave_red').style.display = 'none';
		document.getElementById('record_soundwave_gray').style.display = '';

		document.getElementById('recording_div').style.display = 'none';
		document.getElementById('paused_div').style.display = 'none';
		document.getElementById('uploading_div').style.display = '';

		ga_event('recording stopped', record_record.properties.request_id);

		if ( typeof (Ti) != 'undefined') {
			Ti.App.fireEvent('app:recorder:stop', {
				request_id : record_record.properties.request_id,
				ketchup_server : ketchup_server, 
				dropbox_server : dropbox_server
			});
		}
	}
};
record_record.functions.upload_recordings = function() {
	//need to have this function in case original upload (i.e. on stop) fails

	document.getElementById('recording_div').style.display = 'none';
	document.getElementById('upload_div').style.display = 'none';
	document.getElementById('uploading_div').style.display = '';

	ga_event('upload started', record_record.properties.request_id);

	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:upload_recordings', {
			ketchup_server : ketchup_server,
			dropbox_server : dropbox_server
		});
	}
	else {
		alert('Titanium error: could not upload');
		
		document.getElementById('uploading_div').style.display = 'none';
		document.getElementById('upload_div').style.display = '';
	}
};
record_record.functions.abort_upload = function() {
	document.getElementById('upload_progress_bar').style.width = '0%';
	document.getElementById('upload_progress').innerHTML = '0%';

	ga_event('upload aborted', record_record.properties.request_id);

	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:abort_recording_upload');
	}
};
record_record.functions.set_audio_time = function(position) {
	document.getElementById('record_time').innerHTML = position;
};
record_record.functions.format_time = function(seconds) {
	var return_days = parseInt(seconds / 86400) % 365;
	var return_hours = parseInt(seconds / 3600) % 24;
	var return_minutes = parseInt(seconds / 60) % 60;
	var return_seconds = seconds % 60;

	if (return_hours < 10) {
		return_hours = '0' + return_hours;
	}
	if (return_minutes < 10) {
		return_minutes = '0' + return_minutes;
	}
	if (return_seconds < 10) {
		return_seconds = '0' + return_seconds;
	}

	var string = return_hours + ':' + return_minutes + ':' + return_seconds;
	if (return_days != 0) {
		string = return_days + ':' + string;
	}

	return string;
};

record_record.functions.record_nav_request = function() {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:link_disabled', {
			message: 'You may not make a request while the app is recording. To make a request, first stop and upload the current recording.'
		});
	}
};
record_record.functions.record_nav_listen = function() {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:link_disabled', {
			message: 'You may not listen to another lecture while the app is recording. To listen to another lecture, first stop and upload the current recording.'
		});
	}
};
record_record.functions.record_nav_record = function() { //no href in this one because it breaks due to apostrophes
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:link_disabled', {
			message: 'You may not start a new recording while the app is recording. To start a new recording, first stop and upload the current recording.'
		});
	}
};
record_record.functions.record_nav_settings = function() {
	if ( typeof (Ti) != 'undefined') {
		Ti.App.fireEvent('app:recorder:link_disabled', {
			message: 'You may not view the menu while the app is recording. To view the menu, first stop and upload the current recording.'
		});
	}
};

//**********
//event listeners
//**********
//this function is called by the recording.js script after recording is started
add_event_listener_once('app:all:after_start_recording', function(e) {
	var recording_started = e.recording_started;
	if(recording_started == false) {
		record_record.properties.started = false;

		//stop timer
		clearInterval(record_record.properties.interval);

		document.getElementById('record_time_container').style.visibility = 'hidden';
		document.getElementById('record_time_label').innerHTML = 'Stopped';
		document.getElementById('record_time_container').style.backgroundColor = 'gray';

		document.getElementById('record_soundwave_gray').style.display = '';
		document.getElementById('record_soundwave_red').style.display = 'none';

		document.getElementById('idle_div').style.display = '';
		document.getElementById('recording_div').style.display = 'none';

		//change links
		document.getElementById('settings_link').href = 'javascript:settings.functions.show();';
		document.getElementById('nav_request').href = 'javascript:request_main.functions.load(true);';
		document.getElementById('nav_listen').href = 'javascript:listen_select_recording();';
		document.getElementById('nav_record').href = 'javascript:record_select_course.functions.load(\'left\');';

		ga_event('recording start failed', record_record.properties.request_id);
	}
});

//this function is called by the recording.js script when the user confirms intent to stop
add_event_listener_once('app:all:stop_recording', function(e) {
	record_record.functions.stop_recording();
});

//this function is called by the recording.js script after recording is uploaded
add_event_listener_once('app:all:file_upload_success', function() {
	record_select_course.functions.load();
});

//this function is called by the recording.js script if recording errors out
add_event_listener_once('app:all:file_upload_error', function(e) {
	record_record.properties.uploading = false;
	record_record.properties.showing_upload = true;

	if(e.do_redirect == true) {
		record_select_course.functions.load();
	}
	else {
		document.getElementById('uploading_div').style.display = 'none';
		document.getElementById('upload_div').style.display = '';
	}
});

//this function updates the progress bar
add_event_listener_once('app:all:update_upload_progress', function(e) {
	var current_file_progress = e.current_file_progress;
	var current_file_index = e.current_file_index;
	var count_files = e.count_files;

	//note that this is not the best strategy since time to upload is really proportional to bytes, not file count
	//if files are different sizes, this will not approximate time or percentage very well
	var decimal_already_complete = current_file_index/count_files;
	var decimal_current_complete = current_file_progress/count_files;
	var width = decimal_already_complete + decimal_current_complete;
	
	width *= 100;
	width = Math.floor(width);
	width += '%';
	document.getElementById('upload_progress_bar').style.width = width;
	document.getElementById('upload_progress').innerHTML = width;
});

//this function checks if we are on the upload recording screen
add_event_listener_once('app:all:check_if_upload_is_showing', function(e) {
	if(record_record.properties.showing_upload == false) {
		if(record_record.properties.uploading == false) {
			if(record_record.properties.started == false) {
				Ti.App.fireEvent('app:recorder:get_files_to_upload');
			}
		}
	}
});

//****************************************************************************************************
//feedback
//****************************************************************************************************

var feedback = new Object();
feedback.properties = new Object();
feedback.properties.cue_text = 'Tell us what you think';

//<input onfocus="this.style.webkitTransform = 'translate3d(0px,-10000px,0)'; webkitRequestAnimationFrame(function() { this.style.webkitTransform = ''; }.bind(this))"/>

feedback.title = 'Feedback';
feedback.title_addons = '<a href="javascript:settings.functions.show();" id="settings_link" class="header_right_button"><img src="img/home_icon.gif"></a>';
feedback.content = '<form id="feedback_form" method="post" action="javascript:feedback.functions.submit_feedback();">';
feedback.content += '<div id="feedback_cue_text" onclick="javascript:$(\'#feedback_text\').focus();">'+feedback.properties.cue_text+'</div>';
feedback.content += '<textarea id="feedback_text" onkeypress="javascript:$(\'#feedback_cue_text\').html(\'\');" onfocus="this.style.webkitTransform = \'translate3d(0px,-10000px,0)\'; webkitRequestAnimationFrame(function() { this.style.webkitTransform = \'\'; }.bind(this));feedback.functions.textarea_focus();" onblur="javascript:feedback.functions.textarea_blur();"></textarea>';
feedback.content += '</form>';
feedback.content += '<a href="#" ontouchstart="feedback.functions.submit_feedback();" class="request_submit_link" style="margin-top:10px;font-size:14px;">Submit Feedback</a>';
feedback.bottom_nav = '';
feedback.functions = new Object();
feedback.functions.load = function(direction) {
	if(settings.properties.open == true) {
		//settings.functions.hide(function() {document.getElementById('app').style.height = 'auto';});
		settings.functions.hide();
	}

	feedback.functions.generate_bottom_nav();

	if(direction == 'right') {
		load_page_right_side(feedback.title, feedback.title_addons, feedback.content, feedback.bottom_nav, null, null, 'feedback.html');
	}
	else if(direction == 'left') {
		load_page_left_side(feedback.title, feedback.title_addons, feedback.content, feedback.bottom_nav, null, null, 'feedback.html');
	}
	else {
		load_page(feedback.title, feedback.title_addons, feedback.content, feedback.bottom_nav, null, null, 'feedback.html');
	}
};
feedback.functions.generate_bottom_nav = function() {
	feedback.bottom_nav = '<div ontouchstart="request_main.functions.load(true);" id="nav_request" class="nav_button"><img src="img/request_icon.png"><div>Request</div></div>';
	feedback.bottom_nav += '<div ontouchstart="listen_select_recording.functions.load();" id="nav_listen" class="nav_button">'+listen_badge.badge+'<img src="img/listen_icon.png"><div>Listen</div></div>';
	feedback.bottom_nav += '<div ontouchstart="record_select_course.functions.load();" id="nav_record" class="nav_button">'+record_badge.badge+'<img src="img/record_icon.png"><div>Record</div></div>';
}

feedback.functions.textarea_focus = function() {
	//do nothing
};
feedback.functions.textarea_blur = function() {
	var feedback_text = document.getElementById('feedback_text').value;
	if(feedback_text == '') {
		$('#feedback_cue_text').html(feedback.properties.cue_text);
	}
};
feedback.functions.submit_feedback = function() {
	var feedback_text = document.getElementById('feedback_text').value;

	//validation
	var got_error = '';
	var title = '';
	var message = '';
	var callback = '';

	//require feedback text
	if (got_error == '') {
		if (feedback_text == '') {
			got_error = 'Y';
			title = 'Feedback Required';
			message = 'Please enter some feedback text.';
			callback = function() {};
		}
	}

	//send to server
	if (got_error == '') {
		show_loading();

		var ajax = $.ajax({
			type : 'POST',
			url : ketchup_server.domain + '/fn_api_submit_feedback.php',
			data : 'api_key=' + encodeURIComponent(ketchup_server.api_key) + '&api_pw=' + encodeURIComponent(ketchup_server.api_pw) + '&user.email=' + encodeURIComponent(user.email) + '&feedback_text=' + encodeURIComponent(feedback_text)
		});

		ajax.fail(function(jqXHR, textStatus) {
			hide_loading();

			title = 'Error';
			message = jqXHR.statusText;
			callback = function() {};
			notify(message, callback, title, 'OK');
		});
		
		ajax.done(function(jqXHR, textStatus) {
			hide_loading();

			var response = JSON.parse(ajax.responseText);
			if(response.success != true) {
				title = 'Error';
				message += response.message;
				callback = function() {};
			}
			else {
				title = 'Feedback Submitted';
				message += 'Thank you. Your feedback was submitted.';
				callback = function() {
					request_main.functions.load(true);
				};
			}

			notify(message, callback, title, 'OK');
		});
	}

	else if (got_error != '') {
		notify(message, callback, title, 'OK');
	}	
};