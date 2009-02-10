if(window.RUNTIME_LOC==undefined){var RUNTIME_LOC="local/web"}if(window.MOBILE==undefined){var MOBILE=false}var DESTROY_TWEETS=true;var TWEET_DISPLAY_LIMIT=20;var LOCATION_SEARCH_DISTANCE="5mi";var UPDATE_LOCATION=false;var UPDATE_FREQ=45000;var AUTO_UPDATE=true;var URL_BASE="";var BIND_CLICKS=false;var XS=false;var AIR=false;var PROXY=true;var CSS_FILE="front/bubble_style.css";var shizzow_data=null;if(RUNTIME_LOC=="air"){BIND_CLICKS=true;URL_BASE="http://twitter.tagal.us/";XS=true;AIR=true;PROXY=false}if(window.mt_options){mt_options()}var tw_panels=new Array();var front_panel=null;var user_loc="";var plugin_hooks=new Array();$(document).ready(function(){if(!AIR){doc_ready_functions()}});function doc_ready_functions(){$("#nav_buttons").sortable();get_session_panels();if(window.request_panes!=undefined){for(i in request_panes){add_search_panel(request_panes[i])}request_panes=undefined}if(AUTO_UPDATE){auto_update_tweets()}}function Data_Panel(b,c,d,a,e){this.panel_id=b;this.panel_type=c;this.user=d;this.pass=a;this.gen_info=e;this.auth=make_base_auth(d,a);this.latest_tweet_id="-1";this.tweet_type=null;this.panel_data=new Array();this.reply_id=-1;this.reply_to_name=null;this.tweet_display_limit=TWEET_DISPLAY_LIMIT}function CT_Plugin(a,b){this.hook=a;this.callback=b}function get_panel_by_id(a){for(pan in tw_panels){if(tw_panels[pan].panel_id==a){return tw_panels[pan]}}return null}function save_panel(a,b){for(panel in tw_panels){if(panel.panel_id==a){panel=b}}if(AIR){air_save_panels()}}function get_session_panels(){if(AIR){air_get_session_panels();return}if(PROXY){proxy_get_session_panels();return}}function get_tweets(a,c,b){if(a==null){return}var f=get_panel_by_id(a);show_loader();var e=$("#panel_"+a).find(".tweets");if(c==undefined){c="regular"}if(c!="direct"){$("#panel_"+a).find(".dm_notify_box").hide()}else{$("#panel_"+a).find(".dm_notify_box").show()}var d=false;if(f.panel_data==null){f.panel_data=new Array();d=true}if(f.tweet_type==null){f.tweet_type=c}if(f.tweet_type!=c){e.html("");f.tweet_type=c;f.panel_data=new Array();f.latest_tweet_id=-1;if((f.tweet_type=="direct")||(f.tweet_type=="direct_sent")){if($(".direct_options").length==0){$("#panel_"+a).find(".tweet_type_menu").append('<div class="direct_options"><a href="" onclick="get_tweets(\''+a+"','direct',1); return false;\">Inbox</a><a href=\"\" onclick=\"get_tweets('"+a+"','direct_sent',1); return false;\">Outbox</a><br class=\"clear_both\"></div>")}}else{$(".direct_options").remove()}}save_panel(a,f);if(PROXY){proxy_get_tweets(a,c,b,f.latest_tweet_id,user_loc,LOCATION_SEARCH_DISTANCE)}if(XS){js_get_tweets(a,c,b,f.latest_tweet_id,user_loc,LOCATION_SEARCH_DISTANCE)}if(c=="direct_sent"){c="direct"}$("#panel_"+a).find(".tweet_type_button").removeClass("button_highlighted");$("#panel_"+a).find("#panel_"+a+"_"+c).addClass("button_highlighted")}function get_more_tweets(a){var e=get_panel_by_id(a);if(DESTROY_TWEETS){e.tweet_display_limit+=20;save_panel(e)}var c=e.panel_data.length;if((c%20)!=0){c++}var b=Math.ceil(c/20)+1;var d="regular";if(e.tweet_type!=null){d=e.tweet_type}get_tweets(a,d,b)}function send_tweet(b){var e=$("#panel_"+b).find(".tweet_input").val();var d=get_panel_by_id(b);if(d.reply_to_name!=null){if(e.indexOf("@"+d.reply_to_name)==-1){d.reply_id=-1}}else{d.reply_to_name=null}save_panel(d);var c=d.reply_to_id;if(e.length>140){alert("Too many characters: "+e.length);return}$("#panel_"+b).find(".tweet_input").val("");$("#panel_"+b).find(".length_notify_box").html("");$("#panel_"+b).find(".last_update").val(e);var a=false;if(d.tweet_type=="direct"){a=true;$("#panel_"+b).find("dm_notify_box").html("")}if(PROXY){proxy_send_tweet(b,e,c,d.reply_to_name,a)}if(XS){js_send_tweet(b,e,c,d.reply_to_name,a)}d.reply_to_id=-1;d.reply_to_name=null;save_panel(d)}function send_shout(b){var d=get_panel_by_id(b);var c=$("#panel_"+b).find(".tweet_input").val();var a=$("#panel_"+b).find(".shizzow_favorites").val();$("#panel_"+b).find(".tweet_input").val("");$("#panel_"+b).find(".length_notify_box").html("");if(PROXY){proxy_send_shout(b,c,a)}}function reply_to_tweet(a,b,d){var e=get_panel_by_id(a);e.reply_id=b;e.reply_to_name=d;save_panel(e);var c=$("#panel_"+a).find(".tweet_input");c.focus();if(e.tweet_type=="direct"){$("#panel_"+a).find(".dm_notify_box").html("Direct message to @"+d)}else{c.val("@"+d+" ")}}function reply_button(a,d){var b=$(d).parent(".the_tweet").find(".tweet_id").val();var c=$(d).parent(".the_tweet").find(".tweet_user_name").val();reply_to_tweet(a,b,c)}function retweet_button(b,c,e){var a=$("#panel_"+b+"tweet_"+c).find(".tweet_text").text();var d="RT @"+e+": "+a;if(d.length>140){d=d.substring(0,137)+".."}$("#panel_"+b).find(".tweet_input").val(d)}function toggle_favorite(b,c){var a=$("#panel_"+b+"tweet_"+c).hasClass("favorite_tweet");if(a){$("#panel_"+b+"tweet_"+c).removeClass("favorite_tweet")}else{$("#panel_"+b+"tweet_"+c).addClass("favorite_tweet")}if(PROXY){proxy_toggle_favorite(b,c,!a)}if(XS){js_toggle_favorite(b,c,!a)}}function toggle_favorite_button(a,c){var b=$(c).parent(".the_tweet").find(".tweet_id").val();toggle_favorite(a,b)}function update_times(a){var c=get_panel_by_id(a);cur_date=new Date();if(c.panel_data!=undefined){for(var b=0;b<c.panel_data.length;b++){$("#tweet_time_"+c.panel_data[b].id).html(get_time_text(cur_date,new Date(c.panel_data[b].created_at)))}}}function get_time_text(d,b){var e=parseInt((d.getTime()-b.getTime())/1000);if(e<=(60*60*12)){if(e<=60){return"Less than a minute ago "}else{if(e<3600){var a=parseInt(e/60);return a+" minutes ago "}else{var c=parseInt(e/3600);return c+" hours ago "}}}else{return b+" "}}function add_new_nav_button(b){var c=get_panel_user_name(b);var a='<img src="'+URL_BASE+'images/Cancel.png" id="remove_panel_'+b+'"  class="close_panel" onclick="remove_panel(\''+b+'\')" alt="Close Panel" title="Close this panel" />';$("#nav_buttons").append('<div class="nav_button" id="show_panel_'+b+'" onclick="show_panel(\''+b+"')\">"+c+a+"</div>");$("#nav_buttons").sortable({update:function(){},})}function make_new_panel(){var d=$("#tw_user").val();var g=$("#tw_pass").val();$("#login_form").hide("slide",{direction:"up"},600);$("#tw_user").val("");$("#tw_pass").val("");if($("#account_type").val()=="shizzow"){make_new_shizzow_panel(d,g);return}var b=d;if(get_panel_by_id(b)!=null){alert("You already have that panel open!");return}var c=true;if(PROXY){c=proxy_check_login(d,g)}if(XS){c=js_check_login(d,g)}if(!c){alert("That login user/pass didn't work!");return}var e=null;if(XS){e=js_get_twitter_user_info(d)}else{e=proxy_get_twitter_user_info(d)}var h=new Data_Panel(b,"regular_panel",d,g,e);tw_panels.push(h);if(AIR){air_save_panels()}if(!AIR){var f=proxy_get_panel(b,d,g,e)}var a=js_get_panel(b,d,g,e);set_up_panel(b,a,d,g)}function make_new_shizzow_panel(c,g){var k=new Date();var b="Shizzow_"+k.getTime();if(get_panel_by_id(b)!=null){alert("You already have a panel open like that!");return}if(PROXY){var f=proxy_get_shizzow_panel(b,c,g)}var e="";var h=new Data_Panel(b,"shizzow_panel",c,g,e);h.tweet_type="shouts";tw_panels.push(h);var a=js_get_shizzow_panel(b,c,g);set_up_panel(b,a,c,g);if(PROXY){proxy_get_shizzow_favorites(b)}}function remove_panel(a){$("#panel_"+a).remove();$("#show_panel_"+a).remove();for(i=0;i<tw_panels.length;i++){if(tw_panels[i].panel_id==a){tw_panels.splice(i,1)}}if(PROXY){proxy_remove_panel(a)}if(AIR){air_remove_panel(a)}front_panel=tw_panels[0].panel_id;show_panel(front_panel)}function prompt_search_term(){var b="Enter a search term:";var a=prompt(b);return a}function add_search_panel(e){if(e==null){e=prompt_search_term()}if((e=="")||(e==null)){return}var a="Search "+e;var g=new Date();a="Search_"+g.getTime();if(get_panel_by_id(a)!=null){alert("You already have a panel open like that!");return}var f=new Data_Panel(a,"search_panel",e,"_search",null);tw_panels.push(f);if(AIR){air_save_panels()}var c=js_get_search_panel(a,e,"_search");if(PROXY){var b=proxy_get_search_panel(a,e,"_search")}set_up_panel(a,c,e,"_search");return false}function set_up_panel(d,c,b,a){$("#panels").append(c);add_new_nav_button(d);show_panel(d);get_tweets(d,"regular",1)}function show_panel(a){if(a==undefined){return}var c=get_panel_by_id(a);if(c==null){return}front_panel=a;$(".twitter_panel").hide();$("#panel_"+a).show();$(".nav_button").removeClass("button_highlighted");$("#show_panel_"+a).addClass("button_highlighted");if(c.tweet_type==null){c.tweet_type="regular";save_panel(a,c)}$("#panel_"+a+"_"+c.tweet_type).show();$(".tweet_type_button").removeClass("button_highlighted");$("#panel_"+a+"_"+c.tweet_type).addClass("button_highlighted");$("#panel_"+a).find(".tweet_input").keyup(function(){length_notify(a)});var b=$("#panel_"+a).find(".panel_background").val();if(!MOBILE){$("body").css("background","url('"+b+"') no-repeat fixed");$("body").css("background-color","#"+$("#panel_"+a).find(".panel_background_color").val())}}function get_panel_user_name(a){if(a.indexOf("Search_")!=-1){return"Search: "+$("#panel_"+a).find(".panel_user_name").val()}if(a.indexOf("Shizzow_")!=-1){return"Shizzow: "+$("#panel_"+a).find(".panel_user_name").val()}return a}function auto_update_tweets(){if(AIR){setTimeout(function(){auto_update_tweets()},UPDATE_FREQ)}else{setTimeout("auto_update_tweets()",UPDATE_FREQ)}for(i in tw_panels){if(tw_panels[i].panel_type!="shizzow_panel"){get_tweets(tw_panels[i].panel_id,tw_panels[i].tweet_type,1)}}}function refresh_tweets(){$("#panels").find(".panel_id").each(function(a){get_tweets(this.value,"regular",1)})}function show_login_form(){$("#login_form").toggle("slide",{direction:"up"},400,function(){$("#login_form:visible").find("#tw_user").focus()})}function logout(){if(AIR){air_destroy_db();var a=window.location.href;window.location.href=a}if(PROXY){$.post(URL_BASE+"bin/ajax.php",{func:"logout",},function(c){var b=window.location.href;window.location.href=b},"html")}}function show_loader(){$("#loader").show()}function hide_loader(){$("#loader").hide()}function length_notify(b){var d=$("#panel_"+b).find(".tweet_input");var c=d.val().length;if(c>=140){d.val(d.val().substring(0,140));c=max_length}var a="";if(c>=120){a='<span style="color: red;">'}else{a="<span>"}$("#panel_"+b).find(".length_notify_box").html(a+(140-c)+" characters left</span>")}function get_user_tweets(b,a){$(".get_user_tweets").hide();if(XS){js_get_user_tweets(a,$(b).parent())}if(PROXY){proxy_get_user_tweets(a,$(b).parent())}}function follow_user(a,b){if(PROXY){proxy_follow_user(a,b)}if(XS){js_follow_user(a,b)}}function parse_last_update(a,b){$("#panel_"+a).find(".last_update").html(b[0].text)}function parse_get_shouts_data(b,a,e){shizzow_data=e;hide_loader();var f=new Date();for(i in e.results.shouts){var c="";var d=e.results.shouts[i];var h=d.shouts_history_id;c+='<div class="tweet" id="shout_'+h+'">';c+='<div class="avatar_container"><img class="avatar" src="'+e.results.shouts[i].people_images.people_image_48+'" alt="Avatar"/></div>';c+='<div class="the_tweet">';var k="";if(d.shouts_messages!=null){k=d.shouts_messages[0].message}c+=d.people_name+" shouted from "+d.places_name;if(k!=""){c+='<span class="tweet_text">'+k+"</span>"}c+='<span class="tweet_meta">';var g=new Date();g.setISO8601(d.arrived);c+='<span id="tweet_time_'+h+'">'+d.shout_time+"</span>";c+="</div>";c+='<br class="clear_both"/>';c+="</div>";$("#panel_"+b).find(".tweets").append(c);$("#panel_"+b).find("#shout_"+h).show()}}function parse_get_tweets_data(f,d,q,x){if(d=="direct_sent"){d="direct"}var t=$("#panel_"+f).find(".tweets");var s=get_panel_by_id(f);if(s.panel_data==x){update_times(f);return}if(s.panel_type=="shizzow_panel"){parse_get_shouts_data(f,q,x);return}var l=new Date();var g=false;if(x.results!=undefined){g=true}if(q==1){if(!g){x.reverse()}else{x.results.reverse()}}var u=x.length;if(g){u=x.results.length}for(i=0;i<u;i++){var a=null;if(!g){a=x[i]}else{a=x.results[i]}var b=false;if(s.tweet_type=="replies"){if((""+a.from_user)==(s.user+"")){b=true}}for(j=0;j<s.panel_data.length;j++){if(s.panel_data[j].text==a.text){b=true}}if(b){continue}if(a.id>s.latest_tweet_id){s.latest_tweet_id=a.id}s.panel_data.push(a);if(DESTROY_TWEETS){if(s.panel_data.length>s.tweet_display_limit){var p=s.panel_data.shift();$("#panel_"+f+"tweet_"+p.id).hide();$("#panel_"+f+"tweet_"+p.id).remove()}}var y="";if(a.favorited){y="favorite_tweet"}var k='<div class="tweet '+y+'" id="panel_'+f+"tweet_"+a.id+'">';k+='<div class="tweet_top"></div>';k+='<div class="tweet_left"></div>';var e="";if(!g){if(d!="direct"){e=a.user.profile_image_url}else{e=a.sender.profile_image_url}}else{e=a.profile_image_url}k+='<div class="avatar_container"><img class="avatar" src="'+e+'" alt="Avatar"/></div>';k+='<div class="the_tweet">';k+='<div class="the_tweet_top"></div>';k+='<div class="the_tweet_left"></div>';var n="";if(!g){if(d=="direct"){n=a.sender_screen_name}else{n=a.user.screen_name}}else{n=a.from_user}k+='<input type="hidden" class="tweet_user_name" value="'+n+'"/>';k+='<input type="hidden" class="tweet_id" value="'+a.id+'"/>';k+='<a class="user_name" onclick="return display_twitter_user(\''+n+'\');" href="">'+n+"</a>: ";var o=parse_tweet(a.text);k+='<span class="tweet_text">'+o+"</span>";k+='<span class="tweet_meta">';var m=new Date(a.created_at);k+='<span id="tweet_time_'+a.id+'">'+get_time_text(l,m)+"</span>";if(a.in_reply_to_screen_name!=undefined){k+='In reply to <a href="http://twitter.com/'+a.in_reply_to_screen_name+'">'+a.in_reply_to_screen_name+"</a> "}if(!g){if(d!="direct"){k+="from "+a.source}}k+="</span>";var h=true;if(g){h=false}if(d=="replies"){h=true}if(n==(""+s.user)){h=false}var v=true;if(d=="direct"){v=false}if(h){k+='<div id="reply_'+a.id+'" class="reply_icon" ';k+="onclick=\"reply_to_tweet('"+f+"',"+a.id+",'"+n+"')\">";k+='<img src="'+URL_BASE+'images/reply.gif" alt="Reply to this tweet" /></div>'}if(v){k+='<div id="favorite_'+a.id+'" class="favorite_icon" ';k+="onclick=\"toggle_favorite('"+f+"',"+a.id+')">';k+='<img src="'+URL_BASE+'images/star.gif" alt="Favorite" title="Favorite this tweet" /></div>'}if(d!="direct"){if(!g){k+='<div id="retweet_'+a.id+'" class="retweet_icon" ';k+="onclick=\"retweet_button('"+f+"',"+a.id+",'"+n+"')\">";k+='<img src="'+URL_BASE+'images/Recycle.png" alt="Retweet" title="Retweet" /></div>'}}k+='<div class="the_tweet_right"></div>';k+='<div class="the_tweet_bottom"></div>';k+="</div>";k+='<br class="clear_both"/>';k+='<div class="tweet_right"></div>';k+='<div class="tweet_bottom"></div>';k+="</div>";if(q==1){t.prepend(k)}else{t.append(k)}var c=""+f;var r=""+a.id;var w=""+n;$("#panel_"+f+"tweet_"+a.id).show()}hide_loader();save_panel(f,s);update_times(f)}function parse_tweet(d){var c=d;var b=/(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi;c=d.replace(b,'<a target="_blank" class="tweeted_link" href="$&" onclick="return follow_link(\'$&\')">$&</a>');var e=/[#]+[A-Za-z0-9-_]+/gi;c=c.replace(e,function(g){var f=g.replace("#","");return'<a target="_blank" href="http://tagal.us/tag/'+f+'" onclick="return follow_link(\'http://tagal.us/tag/'+f+"');\">"+g+"</a>"});var a=/[@]+[A-Za-z0-9-_]+/gi;c=c.replace(a,function(f){var g=f.replace("@","");return'<a href="http://twitter.com/'+g+'" onclick="return display_twitter_user(\''+g+"');\">"+f+"</a>"});return c}function parse_shizzow_favorites(a,b){shizzow_data=b;for(i in b.results.places){var c=b.results.places[i];$("#panel_"+a).find(".shizzow_favorites").append('<option value="'+c.places_key+'">'+c.places_name+"</option>")}}function follow_link(a){if(AIR){window.parentSandboxBridge.nav_in_browser(a);return false}return true}function show_notify_window(a){$("#notify_overlay").css("opacity","0.5");$("#notify_overlay").css("height",$(document).height());$("#notify_overlay").show();$("#notify_window").css("left",($(window).width()/2)-200);$("#notify_window").css("top",$(window).scrollTop()+50);$("#notify_window").css("opacity","1");$("#notify_content").html(a);$("#notify_window").show()}function hide_notify_window(){$("#notify_overlay").hide();$("#notify_content").html("");$("#notify_window").hide()}function display_twitter_user(d){var a=true;var c="";if(PROXY){c=proxy_get_twitter_user_info(d)}if(XS){c=js_get_twitter_user_info(d)}var b="";b+='<span class="user_name"><a target="_blank" href="http://twitter.com/'+d+'" onclick="return follow_link(\'http://twitter.com/'+d+"')\">@"+d+"</a>";if(a){b+=' - <a href="" onclick="follow_user_window(\''+d+"'); return false;\">Follow</a>"}b+="</span>";b+='<img class="avatar" src="'+c.profile_image_url+'" alt="Avatar" title="'+d+'"/>';b+='<p class="user_info">'+parse_tweet(c.description)+"</p>";if(c.url!=null){b+='<span class="user_url"><a target="_blank" href="'+c.url+'" onclick="return follow_link(\''+c.url+"')\">"+c.url+"</a></span>"}b+='<div class="user_stats">';b+="<label>Followers:</label>"+c.followers_count+"<br/>";b+="<label>Following:</label>"+c.friends_count+"<br/>";b+="</div>";b+='<div class="user_tweets">';b+='<a href="" class="get_user_tweets" onclick="get_user_tweets(this,\''+d+"'); return false;\">Get tweets</a>";b+="</div>";show_notify_window(b);return false}function display_user_tweets(b,a){var c="<ul>";for(i=0;i<b.length;i++){c+="<li>"+parse_tweet(b[i].text)+"</li>"}c+="</ul>";a.append(c)}function follow_user_window(c){var b=new Array();for(i in tw_panels){if(tw_panels[i].panel_type!="search_panel"){b.push(tw_panels[i])}}if(b.length<1){alert("I'm sorry, but you aren't logged in to any Twitter accounts, so you can't follow that user");return}var a="";a+="<h3>Follow @"+c+"</h3>";for(i in b){a+='<a href="" onclick="follow_user(\''+b[i].panel_id+"','"+c+"'); return false;\">Follow with "+b[i].panel_id+" account</a>";a+="<br/>"}show_notify_window(a)}function register_plugin(b,c){var a=new CT_Plugin(b,c);plugin_hooks.push(a)}function get_plugins(a){}function run_plugins(hook,args){for(i=0;i<plugin_hooks.length;i++){if(plugin_hooks[i].hook==hook){eval(plugin_hooks.callback_fn)}}}function proxy_get_panel(e,c,a,d){var b="";$.post(URL_BASE+"bin/ajax.php",{func:"get_panel",panel_id:e,user:c,pass:a,async:false,},function(f,g){b=f},"html");return b}function proxy_get_search_panel(d,b,a,c){$.post(URL_BASE+"bin/ajax.php",{func:"get_search_panel",panel_id:d,search_term:b,},function(e,f){},"html");return""}function proxy_get_session_panels(){show_loader();$.post(URL_BASE+"bin/ajax.php",{func:"get_session_panels",},function(b){$("#panels").append(b);$(".twitter_panel").hide();$("#panels").find(".twitter_panel").each(function(e){if($(this).is(".proxy_panel")){var d=$(this).find(".panel_id");var f=$(this).find(".panel_type").val();var c=$(this).find(".panel_user_name").val();tw_panels[tw_panels.length]=new Data_Panel(d.val(),f,c,"",null);add_new_nav_button(d.val());get_tweets(d.val(),"regular",1)}});var a=$(".twitter_panel:first").find(".panel_id").val();show_panel(a);hide_loader()},"html")}function proxy_get_tweets(a,d,c,b,e,f){$.post(URL_BASE+"bin/ajax.php",{func:"get_tweets",panel:a,tweet_type:d,page:c,since:b,location:e,location_search_dist:f,},function(g){parse_get_tweets_data(a,d,c,g)},"json")}function proxy_remove_panel(a){$.post(URL_BASE+"bin/ajax.php",{func:"remove_panel",panel:a,},function(b){},"json")}function proxy_send_tweet(b,g,d,e,a){var f=get_panel_by_id(b);var c="regular";if(f.tweet_type=="direct"){c="direct_sent"}$.post(URL_BASE+"bin/ajax.php",{func:"send_tweet",panel:b,tweet_data:g,reply_to:d,reply_to_name:e,direct_message:a,},function(h){get_tweets(b,c,1)},"json")}function proxy_toggle_favorite(b,c,a){$.post(URL_BASE+"bin/ajax.php",{func:"toggle_favorite",panel:b,tweet_id:c,favorite:a,},function(d){},"json")}function proxy_get_twitter_user_info(b){var a="";$.ajax({async:false,url:URL_BASE+"bin/ajax.php",type:"POST",data:"func=get_twitter_user_info&user="+b,success:function(c){a=c},dataType:"json",});return a}function proxy_check_login(c,a){var b=false;$.ajax({async:false,url:URL_BASE+"bin/ajax.php",type:"POST",data:"func=check_login&user="+c+"&pass="+a,success:function(d){b=d},dataType:"json",});return b}function proxy_get_user_tweets(b,a){$.ajax({url:URL_BASE+"bin/ajax.php",type:"POST",data:"func=get_user_tweets&user="+b,success:function(c){display_user_tweets(c,a)},dataType:"json",})}function proxy_follow_user(a,b){$.post(URL_BASE+"bin/ajax.php",{func:"follow_user",panel:a,user:b,},function(c){alert("You are now following @"+b)},"json")}function proxy_get_shizzow_panel(c,b,a){$.post(URL_BASE+"bin/ajax.php",{func:"get_shizzow_panel",panel_id:c,user:b,pass:a,},function(d,e){},"html");return""}function proxy_get_shizzow_favorites(a){$.post(URL_BASE+"bin/ajax.php",{func:"get_shizzow_favorites",panel:a,},function(b,c){parse_shizzow_favorites(a,b)},"json");return""}function proxy_send_shout(b,c,a){show_loader();$.post(URL_BASE+"bin/ajax.php",{func:"proxy_send_shout",panel:b,shout_text:c,loc:a,},function(d,e){alert(d.results.message);hide_loader()},"json");return""}function js_get_panel(d,e,b,c){if(b=="_search"){return js_get_search_panel(d,e,b)}var f="";var g="";if(c!=null){if(c.profile_background_image_url!=undefined){f=c.profile_background_image_url}if(c.profile_background_color!=undefined){g=c.profile_background_color}}var a="";a+='<div class="twitter_panel" id="panel_'+d+'">';a+='<input type="hidden" class="panel_id" value="'+d+'"/><input type="hidden" class="panel_user_name" value="'+e+'"/>';a+='<input type="hidden" class="panel_background" value="'+f+'" /><input type="hidden" class="panel_background_color" value="'+g+'" />';a+='<input type="hidden" class="panel_type" value="regular_panel"/>';a+='<div class="twitter_inputs"><span class="dm_notify_box"></span><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><input type="button" class="tweet_submit" onclick="send_tweet(\''+d+'\')" value="Update"/><span class="length_notify_box" id="chars_left_panel_'+d+'"></span><br class="clear_both"/></div>';a+='<div class="last_update"></div>';a+='<div class="tweet_type_menu"><div class="tweet_type_button" id="panel_'+d+'_regular" onclick="get_tweets(\''+d+'\',\'regular\',1)">Timeline</div><div class="tweet_type_button" id="panel_'+d+'_replies" onclick="get_tweets(\''+d+'\',\'replies\',1)">Replies</div><div class="tweet_type_button" id="panel_'+d+'_direct" onclick="get_tweets(\''+d+"','direct',1)\">Direct messages</div><br class=\"clear_both\" /></div>";a+='<div class="tweets"></div>';a+='<div class="more_tweets" onclick="get_more_tweets(\''+d+"'); return false;\">Load more tweets...</div>";a+="</div>";a+="";return a}function js_get_search_panel(c,d,b){var a="";a+='<div class="twitter_panel" id="panel_'+c+'">';a+='<input type="hidden" class="panel_id" value="'+c+'"/><input type="hidden" class="panel_user_name" value="'+d+'"/><input type="hidden" class="panel_type" value="search_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';a+='<div class="twitter_inputs"></div>';a+='<div class="tweet_type_menu"></div><div class="tweets"></div>';a+='<div class="more_tweets" onclick="get_more_tweets(\''+c+"'); return false;\">Load more tweets...</div>";a+="</div>";a+="";return a}function js_get_search_tweets(b,e,d,h,a,g){var f=get_panel_by_id(b);var c=f.user;since_req="&since_id="+h;if(h=="-1"){since_req=""}if(d!=1){since_req=""}if(AIR){air_get_search_tweets(b,c,e,d,since_req,a,g)}else{$.ajax({url:"http://search.twitter.com/search.json",dataType:"json",cache:false,data:"q="+c+"&page="+d+since_req,success:function(k){parse_get_tweets_data(b,e,d,k)}})}}function js_get_tweets(b,e,d,h,a,g){var f=get_panel_by_id(b);if(e=="replies"){return js_get_search_tweets(b,e,d,h,a,g)}if(f.panel_type=="search_panel"){return js_get_search_tweets(b,e,d,h,a,g)}since_req="&since_id="+h;if(h=="-1"){since_req=""}if(d!=1){since_req=""}var c=f.auth;if(e=="regular"){$.ajax({url:"http://twitter.com/statuses/friends_timeline.json",beforeSend:function(k){k.setRequestHeader("Authorization",c)},dataType:"json",cache:false,data:"page="+d+since_req,success:function(k){parse_get_tweets_data(b,e,d,k)}})}else{if(e=="replies"){$.ajax({url:"http://twitter.com/statuses/replies.json",beforeSend:function(k){k.setRequestHeader("Authorization",c)},dataType:"json",cache:false,data:"page="+d+since_req,success:function(k){parse_get_tweets_data(b,e,d,k)}})}else{if(e=="direct"){$.ajax({url:"http://twitter.com/direct_messages.json",beforeSend:function(k){k.setRequestHeader("Authorization",c)},dataType:"json",cache:false,data:"page="+d+since_req,success:function(k){parse_get_tweets_data(b,e,d,k)}})}else{if(e=="direct_sent"){$.ajax({url:"http://twitter.com/direct_messages/sent.json",beforeSend:function(k){k.setRequestHeader("Authorization",c)},dataType:"json",cache:false,data:"page="+d+since_req,success:function(k){parse_get_tweets_data(b,e,d,k)}})}}}}}function js_toggle_favorite(b,c,a){var e=get_panel_by_id(b);var d=e.auth;alert("http://twitter.com/favorites/create/"+c+".json");if(a){$.ajax({url:"http://twitter.com/favorites/create/"+c+".json",beforeSend:function(f){f.setRequestHeader("Authorization",d)},type:"POST",dataType:"json",cache:false,success:function(f){alert("toggled")},error:function(f,h,g){alert("Favorites don't work yet in the AIR version - sorry!")},})}else{$.ajax({url:"http://twitter.com/favorites/destroy/"+c+".json",beforeSend:function(f){f.setRequestHeader("Authorization",d)},type:"POST",dataType:"json",cache:false,success:function(f){}})}}function js_get_twitter_user_info(b){var a="";$.ajax({async:false,url:"http://twitter.com/users/show/"+b+".json",dataType:"json",type:"GET",success:function(c){a=c},error:function(c,e,d){a=null},});return a}function js_get_user_tweets(b,a){$.ajax({url:"http://twitter.com/statuses/user_timeline/"+b+".json",dataType:"json",type:"GET",success:function(c){display_user_tweets(c,a)},error:function(c,e,d){},})}function js_check_login(a,d){var b=false;var c=make_base_auth(a,d);$.ajax({async:false,url:"http://twitter.com/account/verify_credentials.json",beforeSend:function(e){e.setRequestHeader("Authorization",c)},dataType:"json",cache:false,type:"GET",success:function(e){b=true},error:function(e,g,f){b=false},});return b}function js_send_tweet(b,h,c,f,e){var g=get_panel_by_id(b);var d=g.auth;h=escape(h);var a="&in_reply_to_status_id="+c;if(c==0){a=""}if(!e){$.ajax({url:"http://twitter.com/statuses/update.json",beforeSend:function(k){k.setRequestHeader("Authorization",d)},dataType:"json",cache:false,data:"status="+h+a,type:"POST",success:function(k){get_tweets(b,"regular",1)},error:function(){alert("There was an error sending that tweet!")},})}else{$.ajax({url:"http://twitter.com/direct_messages/new.json",beforeSend:function(k){k.setRequestHeader("Authorization",d)},dataType:"json",cache:false,data:"user="+f+"&text="+h,type:"POST",success:function(k){get_tweets(b,"regular",1)}})}}function js_get_user_tweets(b,a){$.ajax({url:"http://twitter.com/statuses/user_timeline/"+b+".json?count=10",type:"GET",success:function(c){display_user_tweets(c,a)},dataType:"json",})}function js_follow_user(a,c){var d=get_panel_by_id(a);var b=d.auth;$.ajax({url:"http://twitter.com/friendships/create/"+c+".json",type:"GET",success:function(e){alert("You are now following @"+c)},error:function(){alert("There was an error while trying to follow @"+c)},dataType:"json",})}function js_get_shizzow_panel(c,d,b){var a="";a+='<div class="twitter_panel" id="panel_'+c+'">';a+='<input type="hidden" class="panel_id" value="'+c+'"/><input type="hidden" class="panel_user_name" value="'+d+'"/><input type="hidden" class="panel_type" value="shizzow_panel"/><input type="hidden" class="panel_background" value="" /><input type="hidden" class="panel_background_color" value="fff" />';a+='<div class="twitter_inputs"><textarea class="tweet_input" name="tweet_input" rows="3" cols="30"></textarea><br/>Location: <select class="shizzow_favorites"></select><br/><input type="button" class="tweet_submit" onclick="send_shout(\''+c+'\')" value="Update"/><span class="length_notify_box" id="chars_left_panel_'+c+'"></span><br class="clear_both"/></div>';a+='<div class="tweet_type_menu"></div><div class="tweets"></div>';a+='<div class="more_tweets" onclick="get_more_tweets(\''+c+"'); return false;\">Load more tweets...</div>";a+="</div>";a+="";return a}function air_remove_panel(a){window.parentSandboxBridge.air_remove_panel()}function air_save_panels(){window.parentSandboxBridge.air_save_panels(tw_panels)}function air_get_session_panels(){var stored_v=window.parentSandboxBridge.air_get_session_panels();var saved_panels=eval("("+stored_v+")");if(saved_panels==undefined){return}for(i=0;i<100;i++){if(saved_panels[""+i]==undefined){return}var pan=saved_panels[""+i];pan.latest_tweet_id="-1";pan.panel_data=new Array();tw_panels.push(pan);var pan_html=js_get_panel(pan.panel_id,pan.user,pan.pass,pan.gen_info);set_up_panel(pan.panel_id,pan_html,pan.user,pan.pass)}}function air_destroy_db(){window.parentSandboxBridge.air_destroy_db()}function air_get_search_tweets(b,e,d,c,g,a,f){window.parentSandboxBridge.get_search_tweets(b,e,d,c,g,a,f,function(l,k,h,m){parse_get_tweets_data(b,k,h,m)})}Date.prototype.setISO8601=function(b){var c="([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";var f=b.match(new RegExp(c));var e=0;var a=new Date(f[1],0,1);if(f[3]){a.setMonth(f[3]-1)}if(f[5]){a.setDate(f[5])}if(f[7]){a.setHours(f[7])}if(f[8]){a.setMinutes(f[8])}if(f[10]){a.setSeconds(f[10])}if(f[12]){a.setMilliseconds(Number("0."+f[12])*1000)}if(f[14]){e=(Number(f[16])*60)+Number(f[17]);e*=((f[15]=="-")?1:-1)}e-=a.getTimezoneOffset();time=(Number(a)+(e*60*1000));this.setTime(Number(time))};