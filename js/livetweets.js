Drupal.behaviors.liveTweets = function(){
  for(var i in Drupal.settings.liveTweets.blocks){
    Drupal.settings.liveTweets.blocks[i].container = $('.livetweets-content').eq(i);
    Drupal.settings.liveTweets.blocks[i].maxId = 0;
    Drupal.settings.liveTweets.blocks[i].count = 0;
    scrapeTwitter(i);
  }

  setInterval(tweetTimeUpdate, 1000);

};

function scrapeTwitter(index)
{
  $.getJSON('http://search.twitter.com/search.json?callback=?', 
  {
    q: Drupal.settings.liveTweets.blocks[index].query,
    since_id: Drupal.settings.liveTweets.blocks[index].maxId,
    rpp: Drupal.settings.liveTweets.blocks[index].display_count
  },
  function(data,status){
    if(status == 'success'){
      Drupal.settings.liveTweets.blocks[index].maxId = data.max_id_str;
      data.results.reverse();
      $.each(data.results, function(k, item){
        Drupal.settings.liveTweets.blocks[index].count++;
        Drupal.settings.liveTweets.blocks[index].count%=Drupal.settings.liveTweets.blocks[index].display_count;
        //  add it to DOM
        renderItem(item, Drupal.settings.liveTweets.blocks[index].container, Drupal.settings.liveTweets.blocks[index].display_count, Drupal.settings.liveTweets.blocks[index].count);
      });
      
      setTimeout(function(){scrapeTwitter(index)}, Drupal.settings.liveTweets.config.update_interval);
    }
  });
};

 // render a tweet
function renderItem(item, container, max, index)
{

  var date = Date.parse(item.created_at);
  var newDiv = '<div class="tweet tweet-count-'+ index +'" id="tw-'+ item.id +'"><div class="img" style="background-image:url('+ item.profile_image_url +')"></div><p><a href="http://www.twitter.com/'+item.from_user+'">@'+item.from_user+'</a> - '+item.text.parseURL().parseUsername().parseHashtag()+'</p><p class="date" id="d-'+ date +'">'+ relative_time(item.created_at) +'</p><div class="clear"></div><div class="icon"></div></div>';

  
  container.prepend(newDiv);
  $('#tw-'+item.id).hide().show('slow', function(){
  });
  container.find('.tweet:gt('+ (max-1) +')').fadeOut(function(){$(this).remove()})
}


// found + modified relative time function
function relative_time(time_value) {
   var parsed_date = Date.parse(time_value);
   var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
   var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);

   if(delta < 60) {
        return delta + ' seconds ago';
   } else if(delta < 120) {
       return 'about a minute ago';
   } else if(delta < (45*60)) {
       return (parseInt(delta / 60)).toString() + ' minutes ago';
   } else if(delta < (90*60)) {
           return 'about an hour ago';
       } else if(delta < (24*60*60)) {
       return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
   } else if(delta < (48*60*60)) {
       return '1 day ago';
   } else {
       return (parseInt(delta / 86400)).toString() + ' days ago';
   }
}

function tweetTimeUpdate()
{
  $('.livetweets-content .date').each(function(i){
    var date = new Date();
    date.setTime( $(this).attr('id').replace('d-','') );
    $(this).text(  relative_time(date) );
  });
}

// found regex to create links out of url matches
String.prototype.parseURL = function() {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
    return url.link(url);
  });
};
String.prototype.parseUsername = function() {
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
    var username = u.replace("@","")
    return u.link("http://twitter.com/"+username);
  });
};
String.prototype.parseHashtag = function() {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
    var tag = t.replace("#","%23")
    return t.link("http://search.twitter.com/search?q="+tag);
  });
};

