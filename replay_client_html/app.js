
var playerInstance;

var channel_list =[];

var CHANNEL_URL = "http://1.8.90.212:8888/serv?feed=category  ";
var SCHEDURL_URL = "http://1.8.90.212:8888/serv?feed=channel&";

var cur_date = 0;
var cur_date_string;
var replay_info = [];

var cur_channel;

var button = [];

var video_width = $('.video-frame').css('width');
console.log('width:' + video_width );
video_width = video_width.replace("px","");

var video_height = video_width/4*3;

var isLive = true;
var live_url = '';
var replay_url = '';

function rtmp2hls(url)
{
  var ret = url;

  if(url.indexOf("http") == -1)
  {
    ret = url.replace("rtmp","http");
    ret += ".m3u8";
  }

  return ret;
}

function InitPlayer()
{
  console.log('width:' + video_width + '  height:' + video_height );
  // playerInstance = jwplayer('myElement');
  playerInstance = videojs('myElement',{ "height": video_height, "width": video_width });

}

function Play(url)
{


  // playerInstance.remove();

  // playerInstance = jwplayer('myElement');
  //     playerInstance.setup({ 
  //       //file:  'http://localhost/dianbo/test.mp4',     //'upload/1.mp4', 
  //       //image: 'upload/cover.jpg'
  //       file :rtmp2hls(url),
  //       autostart : true,
  //       width :  video_width + 'px',
  //       height : video_height+'px',
    
  //       primary: "html5"
  //     });
  playerInstance.src({
      src: rtmp2hls(url),
      type: 'application/x-mpegURL',
      withCredentials: false
    });

  playerInstance.load();

}

function UpdateChannel(channel_id,channel_name,url)
{
  $('ul#channel-list').find('li').removeClass("active");
  $('#'+channel_id).addClass("active");

  cur_channel = channel_id;

  replay_info = [];
  cur_date = 0;

  $.showPreloader();

  $('h1.title').text(channel_name);
  $('#tab1').find('.video-title-2').text('当前频道：'+channel_name);


  button = [];
  button.push({
          text: '请选择',
          label: true
        });



  
  function update(i)
  {
    if(i<7)
    {

       $.getJSON(SCHEDURL_URL+'list='+channel_id+'&d='+ i, function(data){
      //console.log(data);
      //$.extend(true,data,replay_info[i]);

        replay_info[i] = data;

        if(i==0)
        {
          cur_date_string = data.date.substring(5,data.date.length);
        }

        button.push({
          text: data.date.substring(5,data.date.length),
          onClick: function() {
            console.log("clicked "+ i);
            cur_date = i;
            cur_date_string = data.date.substring(5,data.date.length);
            ParseDate(i);
          }
        });


        update(i+1);

       });


    }else
    {
      $.hidePreloader();
      console.log('replay_info:'+ replay_info.length);

      $('.create-actions').off();
      // $('.create-actions').remove();
      // $('.video-title-2').find('span').append('<a href="#" class="create-actions">选择日期</a>');

      $('.create-actions').on('click', function () {
        var buttons1 = button;
        var buttons2 = [
          {
            text: '取消',
            bg: 'danger'
          }
        ];
        var groups = [buttons1, buttons2];
        $.actions(groups);

      });

      ParseDate(cur_date);
      live_url = url;

      $('#tab-link-1').trigger('click');
      //Play(url);


      // console.log('trigger 1');
      var e = document.createEvent('HTMLEvents');
      e.initEvent('click',true, true);
      document.getElementById('tab-link-1').dispatchEvent(e);

      

    }
  }

  update(0);

  // while(replay_info.length<1)
  // {
    
  // }

 // console.log('replay_info:'+ replay_info.length);
  //while(replay_info.length<4);

  
  

}

function ParseDate(index)
{

    var content = replay_info[index];

    $("#video-list").remove();
    $("#video-list-block").append('<ul id="video-list"></ul>');

    var list = content.list;
   // console.log('content:'+content.list);
    var flag = true;

    for(var i = 0;i<list.length;i++)
    {
      if(list[i].finished == "1")
      {
        var channel = $('<li class="close-panel" id="video-'+ i +'">\
                              <div class="item-content">\
                                <div class="item-media"><i class="icon icon-computer"></i></div>\
                                <div class="item-inner">'+list[i].title +'<br>\
                                '+ list[i].start_time.substring(11,16)+' - ' + list[i].end_time.substring(11,16) +'\
                                </div>\
                              </div>\
                            </li>');

        $("#video-list").prepend(channel);

        (function(i){

          channel.on('click',function(){

             // console.log("video clicked");

              
              //UpdateChannel(item.channel_id,item.channel_name);
              PlayVideo(i,list[i].url);

          });

        })(i);

        if(flag)
        {
          flag = false;
          var title1 = list[i].title;
          var title2 = list[i].start_time.substring(11,16)+' - ' + list[i].end_time.substring(11,16);

          title2 = cur_date_string + ' ' + title2.trim();

          $('#tab2').find('.video-title-1').text('正在播放：'+  title1 );
          $('#tab2').find('.video-title-2-inner').text('节目时间：'+  title2 );

          PlayVideo(i,list[i].url);

          replay_url = list[i].url;

        }
        


      }
    }

    if(flag)
    {
      $('#tab2').find('.video-title-1').text('正在播放：无' );
      $('#tab2').find('.video-title-2-inner').text('节目时间：'+  cur_date_string );

      replay_url = '';
    }





}

function PlayVideo(i,url)
{
    console.log("video " + i+" clicked");


    $('ul#video-list').find('li').removeClass("active");
    $('#video-'+i).addClass("active");

    var title1 = $('#video-'+i).find('.item-inner').html();
    console.log(title1);
    title1 = title1.substring(0,title1.indexOf('<br>'));
    var title2 = $('#video-'+i).find('.item-inner').html();
    title2 = title2.substring(title2.indexOf('<br>')+4,title2.length -1);
    title2 = cur_date_string + ' ' + title2.trim();

    $('#tab2').find('.video-title-1').text('正在播放：'+  title1 );
    $('#tab2').find('.video-title-2-inner').text('节目时间：'+  title2 );

    console.log(title1);
    console.log(title2);

    replay_url = url;
    $('#tab-link-2').trigger('click');

    var e = document.createEvent('HTMLEvents');
    e.initEvent('click',true, true);
    document.getElementById('tab-link-2').dispatchEvent(e);
    

   // Play(url);

}

$(function () {
    'use strict'; 

    // $('.create-actions').on('click', function () {
    //   button = [
    //     {
    //       text: '请选择',
    //       label: true
    //     },
    //     {
    //       text: '9月20日',
    //       onClick: function() {
    //       }
    //     },
    //     {
    //       text: '9月19日',
    //       onClick: function() {
    //       }
    //     },
    //     {
    //       text: '9月18日',
    //       onClick: function() {
    //         //$.alert("你选择了“卖出“");
    //       }
    //     },
    //     {
    //       text: '9月17日',
    //       onClick: function() {
    //         //$.alert("你选择了“卖出“");
    //       }
    //     },
    //     {
    //       text: '9月16日',
    //       onClick: function() {
    //         //$.alert("你选择了“卖出“");
    //       }
    //     },
    //     {
    //       text: '9月15日',
    //       onClick: function() {
    //         //$.alert("你选择了“卖出“");
    //       }
    //     },
    //     {
    //       text: '9月14日',
    //       onClick: function() {
    //        // $.alert("你选择了“买入“");
    //       }
    //     }
    //   ];
    //   var buttons2 = [
    //     {
    //       text: '取消',
    //       bg: 'danger'
    //     }
    //   ];
    //   var groups = [button, buttons2];
    //   $.actions(groups);
    // });

    // fetch channels
    $.getJSON(CHANNEL_URL, function(data){
        console.log(data);
        channel_list = [];
        $("#channel-list").remove();
        $("#channel-list-block").append('<ul id="channel-list"></ul>');

        $.each(data.category, function(index, item){

          console.log(index + " " + item.channel_id + " " + item.channel_name);
          //var channel={};
         

          var channel = $('<li id="'+ item.channel_id+'" class="close-panel">\
                              <div class="item-content">\
                                <div class="item-media"><i class="icon icon-computer"></i></div>\
                                <div class="item-inner">'+item.channel_name +'</div>\
                              </div>\
                            </li>');

          $("#channel-list").append(channel);

          channel.on('click',function(){

            console.log("channel " + item.channel_name +" clicked");
            UpdateChannel(item.channel_id,item.channel_name,item.rtmp_url);

          });

          if(index == 0)
          {
            cur_channel = item.channel_id;
            UpdateChannel(cur_channel,item.channel_name,item.rtmp_url);
          }
            

          // channel.channel_id = item.channel_id;
          // channel.channel_name = item.channel_name;

         // channel_list.push(channel);
          

        });






        //console.log(channel_list);

    });

    // $('#tab-link-1').on('click',function(){
    //   console.log('tab-1 click');
      
    //   Play(live_url);
      
      

    // });

    $(document).on('click','#tab-link-1',function(){
      console.log('tab-1 click');
      
      Play(live_url);

    });

    $('#tab-link-2').on('click',function(){
      console.log('tab-2 click');
      
      Play(replay_url);
      
      
    });

        

    InitPlayer();
    $.init();



});
