$(document).ready(function(){
	var pastPing = $.cookie('pastPing'),
		messageText = $('.messageText').text(),
		chatInput = $('.chatText'),
		postLenght = 100,
		pings = [],
		userName = $.cookie('username'),
		chatText,
		pastChat = 0,
		last;
	
	if($.cookie('pastPing') === undefined){
		getPing();
	}
	if(pastChat === undefined){
		getChat();
	}
	
	function userInfo(){
		var e = '<div id="userInfo" class="cover"><h3>Choose a username</h3><br><b>Current username: </b>'+userName+'<br><input class="usrname" type="text" placeholder="Enter a username"><br><input class="usrnameButnn" type="button" value="okay"><br><h3>You can change username later on by typing <b>/username</b> in the chat</h3></div>';
		$(e).appendTo('#chatContainer');
		$('.usrname').focus();
	}
	
	$(this).on('click', '.usrnameButnn', function(){
		userName = $('.usrname').val();
		if(userName === ''||userName === undefined){
			$('#alerts').css({'background': 'rgb(255, 204, 204)','border': 'solid 1px rgb(173, 99, 99)', 'box-shadow': '0em 0em 1em 0em red', 'display':'block'}).fadeIn(200).delay(5000).fadeOut();
			$('#alerts>h3').html('Enter a username before you may continue.');
		}else{
			$.cookie('username', userName);
			$('#userInfo').remove();
		}
	});
	
	function getPing(){
		$.ajax({
			type: "GET",
			url: "json/pings.json",
			dataType: "json",
			cache: false,
			success: function(data){
				if(pastPing < data.ping){
					$('#pingSound>source').attr('src', randSource());
					$('#pingSound').load();
					$('#pingSound').trigger('play');
					pings.push(data);
				}
				pastPing = data.ping;
				$.cookie('pastPing', pastPing);
				$('.message').html(data.message);
				$('.pings').html(data.ping);
			},
			 error: function(jqXHR, textStatus, errorThrown) {
				console.log(JSON.stringify(jqXHR));
				console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
 			}
		});
		
		setTimeout(function(){
			getPing();
		},30000);
	}
	
	function sendPing(){
		parseInt(pastPing++);
		$.ajax({
			type: "POST",
			url: "sendPing.php",
			dataType: "jsonp",
			success: function(data){
				data = JSON.parse(data);
			},
			data: {"ping": pastPing, "message": $('.messageText').text()},
			 error: function(jqXHR, textStatus, errorThrown) {
				console.log(JSON.stringify(jqXHR));
				console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
 			}
		});
		
		getPing();
	}
	
	function getChat(pastMessages){
		$.ajax({
			type: "GET",
			url: "json/talkbox.json",
			dataType: "json",
			cache: false,
			success: function(data){
				if(pastChat === 0 || pastChat < data.length){
						last = data.length-1;
				}
				
				if(pastMessages !== undefined){
					for(var i = last - pastMessages; last > last-pastMessages; i++){
						var e = '<div id="chatMessage" title="'+data[i].timeStamp+'"><span class="username">'+data[i].username+': </span><span class="chatMessage">'+data[i].chatMessage+'</span></div><br>';
						$(e).appendTo('#chatLog');
						if(last == i){
						$('#chatLog').delay(700).animate({"scrollTop": $('#chatLog')[0].scrollHeight}, "slow");
						}
					}
				}else{
				
					if(pastChat < data.length){

						pastChat = data.length;

						var e = '<div id="chatMessage" title="'+data[last].timeStamp+'"><span class="username">'+data[last].username+': </span><span class="chatMessage">'+data[last].chatMessage+'</span></div><br>';
						$(e).appendTo('#chatLog');
						$('#chatLog').delay(700).animate({"scrollTop": $('#chatLog')[0].scrollHeight}, "slow");
					}
				}
				
				setTimeout(function(){
					getChat();
				},1000);
			},
			 error: function(jqXHR, textStatus, errorThrown) {
				console.log(JSON.stringify(jqXHR));
				console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
 			}
		});
	}
	
	function timeZone(){
		var tz = jstz.determine(); // Determines the time zone of the browser client
    	return tz.name(); // Returns the name of the time zone eg "Europe/Berlin"
	}
	function sendChat(){
		$.ajax({
			type: "POST",
			url: "sendChat.php",
			dataType: "text",
			success: function(data){
				data = JSON.parse(data);
			},
			data: {"chatNr": pastChat+1,"timeZone": ''+timeZone()+'', "user": userName, "chatMessage": chatText},
			 error: function(jqXHR, textStatus, errorThrown) {
				console.log(JSON.stringify(jqXHR));
				console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
 			}
		});
				getChat();
	}
	
	
	function randSource(){
		var num = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
		var src = 'audio/ping'+num+'.mp3';
		return src;
	}
	
	$('.messageText').html($('.messageText').data('placeholder'));

	$('.messageText').keydown(function() {
		if ($(this).html() == $(this).data('placeholder')) {
			$('.messageText').html('');
		}
	});
	$('.messageText').focusin(function() {
		if ($(this).html() == $(this).data('placeholder')) {
			$('.messageText').html('');
		}
	});
	
	$('.messageText').keyup(function() {
		if ($(this).html() === '') {
			$('.messageText').html($('.messageText').data('placeholder'));
		}
	});
	$('.messageText').focusout(function() {
		if ($(this).html() === '') {
			$('.messageText').html($('.messageText').data('placeholder'));
		}
	});
	
	$('.messageText').keyup(function(){
		var textLenght = $('.messageText').html().length,
			lenghtLeft;
		
		lenghtLeft = postLenght - parseInt(textLenght);
		$('#lenght').html('<span class="lenghtCounter" title="'+textLenght+' characters of '+postLenght+'">'+lenghtLeft+'</span>');
		if(textLenght > postLenght){
			$('.lenghtCounter').css({"color":"rgb(238, 68, 68)"});
		}else if(textLenght > postLenght-20){
			$('.lenghtCounter').css({"color":"rgb(219, 127, 127)"});
		}
	});
	
	
	$('.ping').click(function(){
		if($(this).html() == 'Send a Ping'){
			$('.message').css({'display':'none'});
			$('.hidden').css({'display':'block'});
			$('.ping').html('ping');
		}else if($('.ping').html() == 'ping'){
			if($('.messageText').html() !== ''){
				if($('.messageText').html() !== 'Write your message here.'){
					if($('.messageText').html().length <= postLenght){
						sendPing();
						$('.ping').html('Send a Ping');
						$('.message').css({'display':'block'});
						$('.hidden').css({'display':'none'});
						$('.messageText').html($('.messageText').data('placeholder'));
						$('#pingSound>source').attr('src', randSource());
						$('#pingSound').load();
						$('#pingSound').trigger('play');
						$('#alerts').css({'border': '1px solid rgb(101, 173, 99)', 'background': 'rgb(209, 255, 204)', 'box-shadow': '0em 0em 1em 0em green', 'display':'block'}).fadeIn(200).delay(5000).fadeOut();
						$('#alerts>h3').html('The ping was sent!');
					}else{
						$('#alerts').css({'background': 'rgb(255, 204, 204)','border': 'solid 1px rgb(173, 99, 99)', 'box-shadow': '0em 0em 1em 0em red','display':'block'}).fadeIn(200).delay(5000).fadeOut();
						$('#alerts>h3').html('The message is too long, make it shorter to be able to send a ping.');
					}
				}else{
					$('#alerts').css({'background': 'rgb(255, 204, 204)','border': 'solid 1px rgb(173, 99, 99)', 'box-shadow': '0em 0em 1em 0em red', 'display':'block'}).fadeIn(200).delay(5000).fadeOut();
					$('#alerts>h3').html('Enter a message before you send a ping.');
				}
			}else{
				$('#alerts').css({'background': 'rgb(255, 204, 204)','border': 'solid 1px rgb(173, 99, 99)', 'box-shadow': '0em 0em 1em 0em red', 'display':'block'}).fadeIn(200).delay(5000).fadeOut();
				$('#alerts>h3').html('Enter a message before you send a ping.');
			}
		}
	});
	
	function availableCommands(){
			var d = new Date();
			var time = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
			$('#chatLog').append('<div id="chatMessage" title="'+time+'"><b><span class="username">Available commands: </span><span class="chatMessage">[/help]:shows commands and information about commands; <br> [/username]:Opens prompt to change username; </span></b></div><br>');
			chatInput.val('');
			$('#chatLog').delay(700).animate({"scrollTop": $('#chatLog')[0].scrollHeight}, "slow");	
	}
	
	function ifSendChat(){
		if(chatInput.val() == '/help'){
			availableCommands();
		}
		if(userName === ''|| userName === undefined || chatInput.val() == '/username'){
			userInfo();
			chatInput.val('');
		}else if(chatInput.val() !== ''){
			chatText = chatInput.val();
			sendChat();
			$('.chatText').val('');
		}
	}
	
	
	$('#sendChat').click(function(){
		ifSendChat();
	});
	
	$('.chatText').keyup(function(e){
		if(e.keyCode == 13)
			ifSendChat();
	});
	
	$('img>.newer').click(function(){
		
	});
	$('img>.older').click(function(){
		
	});
	
	getPing();
	//availableCommands();
	getChat(7);
});