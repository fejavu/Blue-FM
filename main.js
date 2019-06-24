  // publish and subscribe mode 
  var eventCenter = {
      on:function(type, handle) {
        $(document).on(type, handle);
      },
      fire:function(type, data){
        $(document).trigger(type, data);
      }
    };
    
  // footer
    var footer = {
      init:function(){
        this.getdata();
        this.$footer = $("footer");
        this.$ul = this.$footer.find('ul');        
        this.$backBtn = this.$footer.find('.back');
        this.$forwardBtn = this.$footer.find('.forward');
        this.bind();
        this.isEnd = false;
        this.isStart = true;
        this.isAnimate = false;
      },
      bind: function(){
        var _this = this;
        
        // forward button click event
        _this.$forwardBtn.on('click',function(){
          if(_this.isAnimate) return; 
          if(!_this.isEnd){
            _this.isAnimate = true;
            var itemWidth = _this.$ul.find('li').outerWidth(true);
            var itemCount = Math.floor($('.cover-item').width()/itemWidth);
            _this.$ul.animate({
              left: "-="+(itemWidth*itemCount)
            },400,function(){
              _this.isAnimate = false;             
            _this.isStart = false;
            if(parseFloat($('.cover-item').width())-parseFloat(_this.$ul.css('left')) > parseFloat(_this.$ul.css('width'))){
              _this.isEnd = true;
              }              
            });                 
          }else{
            alert('It is the end');
          }
        });
        
        // back button click event
        _this.$backBtn.on('click',function(){
            if(_this.isAnimate) return;
            if(!_this.isStart){
              _this.isAnimate = true;
              var itemWidth = _this.$ul.find('li').outerWidth(true);
              var itemCount = Math.floor($('.cover-item').width()/itemWidth);
              _this.$ul.animate({
                left: "+="+(itemWidth*itemCount)
              },400,function(){      
                _this.isAnimate = false;
                _this.isEnd = false;
                if(Math.abs(parseFloat(_this.$ul.css('left')))<2){
                  _this.isStart = true;
                }
              });  
          }
        });       
        
        // cover items click event
        _this.$footer.on('click','li',function(){
          $(this).addClass('active')
                 .siblings().removeClass('active');          
          eventCenter.fire('itemClick', {
            channelId: $(this).attr('channelId'),
            channelName: $(this).attr('channelName')
          });
        });
      },
      
      // get data for the back end server
      getdata:function(callback) {
        var _this = this;
        $.getJSON('http://api.jirengu.com/fm/getChannels.php')
          .done(function(result) {
            _this.render(result.channels);
          }).fail(function(){
              console.log('cannot get data');
            });
      },
      
      // render the footer cover items
      render:function(channels) {
        channels.forEach(function(channel){
          var $coverItem =$(`<li><div></div><span></span></li>`);
          $coverItem.find('div').css("background","url("+ channel.cover_small+") center center no-repeat");;
          $coverItem.attr('channelId', channel.channel_id);          
          $coverItem.attr('channelName', channel.name);
          $coverItem.find('span').text(channel.name);
          $coverItem.appendTo($("footer ul"));
        });
        var count = channels.length;
        var width = $('footer ul li').outerWidth(true);
        $('footer ul').css({
          'width': count*width +'px',
        });        
      },    
    };
    
    // the main panel play 
    var player = {
      init: function(){
        this.$main = $('.main');
        this.audio = new Audio();
        this.audio.autoplay = true;
        this.bind();
        this.initPlay();
      },
      
      // an autoplay init when laoded
      initPlay:function(){
        this.channelId = 'public_tuijian_autumn';
        this.channelName = '秋日私语';
        this.loadMusic();
      },
      
      // bind the event 
      bind:function() {
        var _this = this;
        
        // subscribe the cover item click event
        eventCenter.on('itemClick', function(e, channelObj){
          _this.channelId = channelObj.channelId;
          _this.channelName = channelObj.channelName;
          _this.loadMusic();
        });     
        
        // play and pause button event
        $('.ctrl-play').on('click',function(){
          var $btn = $(this);
          if($btn.hasClass('icon-play')){
            $btn.removeClass('icon-play').addClass('icon-pause');
            _this.audio.pause();
          }else{
            $btn.removeClass('icon-pause').addClass('icon-play');
            _this.audio.play();            
          }
        });
       
       // next song event
       $('.icon-next').on('click',function(){
          _this.loadMusic();
        });
        
        // update while playing 
        _this.audio.addEventListener('play',function(){
          clearInterval(_this.statusClock);
          _this.statusClock = setInterval(function(){
            _this.update();
          }, 1000);
        });
        
        // when pause, stop update the timer and proccess bar
        _this.audio.addEventListener('pause',function(){
          clearInterval(_this.statusClock);
        });
        
        // when a song end, play next
        _this.audio.addEventListener('ended',function(){
          _this.loadMusic();
        });     
      },
      
      // core function of playing song
      loadMusic:function(){
        var _this = this;
        $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:_this.channelId}).done(function(result){         
          _this.song = result.song[0];
          _this.setMusic();
          _this.loadLyric();        
        });
      },
      
      // set the song infomation
      setMusic:function() {
        this.audio.src = this.song.url;
        this.$main.find('.cover img').attr('src', this.song.picture);        
        this.$main.find('.detail .tag').text(this.channelName);        
        this.$main.find('.detail h2').text(this.song.title);        
        this.$main.find('.detail .author').text(this.song.artist);
        $('.bg').css('background-image','url('+this.song.picture+')');
        $('.ctrl-play').removeClass('icon-pause').addClass('icon-play');
      },
      
      // load the lyric of the current song
      loadLyric:function(){
        var _this = this;
        $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid:_this.song.sid}).done(function(result){
          var lyric = result.lyric;
          var lyricObj = {};
          lyric.split('\n').forEach(function(line){
            var times = line.match(/\d{2}:\d{2}/g);
            var str = line.replace(/\[.+?\]/g,'');
            if(Array.isArray(times)){
              times.forEach(function(time){
                lyricObj[time+''] = str;
              });
            }
          });
          _this.lyricObj = lyricObj;
        });
      },
      
      update:function(){  
        // time update
        var minute = Math.floor(this.audio.currentTime/60);
        var second = Math.floor(this.audio.currentTime%60)+'';
        second = (second.length==2 )? second:('0'+second);
        minute += '';
        $('.timer').text(minute+":"+second);
        
        // proccess bar update
        var percent = this.audio.currentTime / this.audio.duration;
        $('.current').css({
          'width':percent*100+'%'
        });
        
        // load lyrics
        var secondForward = Math.floor(this.audio.currentTime%60+1);
        secondForward = secondForward<10?('0'+secondForward):secondForward;
        var currentLine = this.lyricObj['0'+minute+":"+secondForward];
        if(currentLine){
          $('.lyric').text(currentLine);
        }
      },    
    };

    var app = {
      init:function(){
        footer.init();
        player.init();        
      }
    };
    
    app.init();






