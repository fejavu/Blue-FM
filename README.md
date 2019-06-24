# Blue FM

最近学习，跟着视频教程做了一个简单的音乐播放器，因为它的主色调是蓝色，所以叫 Blue FM。

### 主要功能
1. 页面加载完成后随即开始播放一首歌。
2. 播放过程中可以随意暂停，播放，以及下一首。
3. 页面背景以及页面歌曲信息随选择的歌曲变化
3. 播放进度显示以及歌词加载。
4. 音乐频道选择自动播放歌曲。
5. 频道列表前后滚动，以及滚动面板加锁。

### 技术细节
1. #### 页面响应
页面布局方面，为了使页面元素具有更好的响应式，几乎所有元素的大小单位都使用了vh——相对视口的高度单位，使得页面元素大小随着视口的大小而变化，例如歌曲封面，高度设定为30vh，随视口大小而变化。并且尽量少的使用边框类元素，因为边框类元素也会随着适口的大小改变，影响观感。
```
.cover img {
  height: 30vh; 
  box-shadow: 0px 0px 5px 5px rgba(21, 16, 16,1);
}
```
2. #### 页面布局
页面布局主要使用正常文档流布局，浮动和绝对定位布局。典型的左右元素排布使用浮动布局加相邻元素的左右margin，例如封面图片模块和歌曲信息模块；少数特殊元素使用绝对定位布局，例如频道列表前进后退按钮；其他模块内使用正常文档流布局，例如歌曲细节信息模块。
3. #### 资源获取
音乐频道和歌曲的获取，主要是从封装好的接口，异步获取音乐频道列表和对应的歌曲，获取后进行音乐频道列表 DOM 元素封装，拼接到文档中，获取歌曲后将歌曲信息设置到页面各个位置，并使用 Audio 对象进行歌曲播放。
4. #### 核心函数
Blue FM 的核心函数是 loadMusic 函数，只要在全局变量设置了频道的id，根据封装的接口，就可以使用异步获得该频道的歌曲列表，将然后将第一首歌曲信息设置为页面信息并播放，同时加载歌词。
```
function loadMusic(){
  var _this = this;
  $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel:_this.channelId}).done(function(result){
    _this.song = result['song'][0];
    _this.setMusic();
    _this.loadLyric();
  });
}
```
4. #### 其他细节
**页面加载后自动播放**
设置一个函数，初始化一个默认的channelId，，在用户未点击列表之前进行播放；
**播放完毕自动下一首**
对 Audio 标签进行监听，当歌曲播放完毕，调用封装好的 loadMusic 函数，播放同音乐频道的下一首。

5. #### 遇到的问题
- **布局元素相互影响问题**
由于 css 不正交的特性，页面元素角度，且容易相互影响，特别是需要进行绝对定位布局的音乐频道滚动列表和滚动列表按钮的关系。
解决办法: 利用html元素包裹，将滚动列表和按钮份分开成两个分离的元素，滚动按钮使用绝对定位，与包裹频道列表的元素形成兄弟元素。

- **交互问题**
由于音乐频道列表的点击事件设计到音乐的切换，音乐信息更改，但是如果直接将音乐频道滚动列表的时间绑定到播放面板，容易造成两个模块过度耦合，修改任意一个的时候都会牵涉过多。
解决办法是使用 JavaScript 发布订阅模式，在全局封装一个事件中心，有发布事件和监听事件两个模块，音乐频道滚动里列表使用发布模块，播放面板使用监听模块，两个通过事件中心传递数据，并进行交互，相互解耦。

6. #### 需要改进的功能
- 收藏功能
目前页面有收藏按钮，却没有收藏功能。后期需要对用户收藏的歌曲存储到本地或者后台，形成一个专门的收藏频道，并添加到音乐频道列表上，当歌曲被用户收藏，则页面显示相应的内容。
- 进度条拖放功能
需要对进度条点击跳到相应的歌曲进度进行支持，初步方案是利用用户点击的位置，获取一个点击位置，并且对比总的时间长度，设置歌曲的 currentTime。

### 项目收获
1. 对前后端封装有了更深的认识
双方约定相应的接口，后端负责将数据按照接口的模式封装起来，提供接口进行调用；前端利用接口，获取数据并进行处理，与用户进行交互。
2. 对布局有了更多的了解
网页布局中典型的左右布局，上下布局，浮动布局，绝对定位等需要更多地实践，钻研。

### 技术栈关键字
jQuery、JavaScript、HTML5、CSS3、响应式、异步函数、前后端分离

[预览连接](http://js.jirengu.com/pufirifiqo/1)