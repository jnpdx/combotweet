/*
TAGALUS_LINK = '<a target="_blank" href="http://tagal.us/">Tagalus</a>';


function get_definition_form_code() {
  if ((TAGALUS_API_KEY == null) || (TAGALUS_API_KEY == '')) {
    return '<span class="small_label">You can add a definition to Tagalus if you <a href="http://blog.tagal.us/api-documentation/">enter a Tagalus API key</a></span>';
  }
  
  add_definition_form_code = '<div id="add_tagalus_definition">'
  add_definition_form_code += '<span class="small_label">Add your own definition to ' + TAGALUS_LINK + ': <br/></span>'
  add_definition_form_code += 'Tag:<br/><input type="text" id="add_tagalus_tag_name" /><br/>'
  add_definition_form_code += 'Definition: <br/>'
  add_definition_form_code += '<textarea id="add_tagalus_definition_the_definition"></textarea><br/>'
  add_definition_form_code += '<input type="submit" value="Submit" onclick="submit_tagalus_form(); return false;" />'
  add_definition_form_code += '</div>';

 return add_definition_form_code;
}


function submit_tagalus_form() {
  
  //alert("submitting");
  
  show_loader();
	
  
  if ((TAGALUS_API_KEY == null) || (TAGALUS_API_KEY == '')) {
    alert("You must enter a Tagalus API key to use that feature!");
    return;
  }
  
  TagalusAPI.api_key = TAGALUS_API_KEY;
  
  var user_tag = $('#add_tagalus_tag_name').val();
  var user_def = $('#add_tagalus_definition_the_definition').val();
  hide_notify_window();
  
  
  if ((user_tag == '') || (user_def == '')) {
    
    alert("You must enter both a tag and a definition");
    return;
    
  }
  
  
  
  //alert($('#add_tagalus_tag_name').val() + '' + $('#add_tagalus_definition_the_definition').val());
  //return;
  
  TagalusAPI.api_server = "http://api.localtag:3000/";
  TagalusAPI.api_call('definition/create.json', {
  				the_tag: user_tag,
  				the_definition: user_def,
  			} ,function(data) {
  				window.RETURNED_DATA = data;
  				if (data.error != null) {
  				  alert("There was an error: " + data.error);
  				  return;
  				}
  				alert("Your definition has been added to Tagalus!");
  				hide_loader();
  			});
  
}

function bind_hashtag_links() {

  $('.hashtag_link').unbind('click');

  $('.hashtag_link').bind('click',
  
    function(e) {
    
      var the_tag = e.target.text.substring(1);
      
      var tag_link = '<a target="_blank" href="http://tagal.us/tag/' + the_tag + '">#' + the_tag + '</a>';
    
      //alert("clicked");
    
      show_loader();
      show_notify_window("Loading definition for #" + the_tag + " from Tagalus...",e);
    
      TagalusAPI.api_server = "http://api.localtag:3000/";
      TagalusAPI.api_call('tag/' + the_tag + '/show.json', {} ,function(data) {
      				if (data == null) {
      				  $('#notify_content').html(TAGALUS_LINK + " doesn't have a definition for " + tag_link + "<br/>" + get_definition_form_code());
      				  $('#add_tagalus_tag_name').val(the_tag)
    				  } else {
    				    $('#notify_content').html('<span class="small_label">' + TAGALUS_LINK + " defines " + tag_link + " as:</span><br/>" + data.definition.the_definition + "<br/>" + get_definition_form_code());
    				    $('#add_tagalus_tag_name').val(the_tag)
      				  
    				  }
    				  hide_loader();
      			});
    			
    
      return false;
    
    }
  
  );


}
*/

function bind_hashtag_links() {
  
  //TagalusAPI.api_key = '12362056449a39b0373fca'
  TagalusAPI.load_widget();
  TagalusAPI.add_buttons_to_elements('a.hashtag_link')
  //TagalusAPI.bind_to_clicks('a.hashtag_link')
  
}