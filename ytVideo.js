var myApp = angular.module('ytVideo',[]);

myApp.controller('ytVideoCtrl', function($scope, $http, $sce) {
	$scope.title = "YouTube";
	$scope.suggestions = [];
	$scope.loading = true;
  $scope.currItem = {};
  $scope.totalResults = null;
  $scope.relatedLoading = true;
  $scope.channelLoading = true;
  $scope.tab = true;
  $scope.commentsLoading = true;
  $scope.sce = $sce


	$scope.loadSuggestions = function(){
    var url = "http://clients1.google.com/complete/search?output=youtube&q="+$scope.searchString
    +"&callback=JSON_CALLBACK";
		$http.jsonp(url).then(function(response) {
      $scope.suggestions = response.data[1];
    });
	}

  $scope.init = function(){
    console.log(window.location.search.replace("?q=",""));
    $scope.currItem.id = window.location.search.replace("?id=","");

    getVideoInfo();
    getRelatedContent();
    getComments();

    onYouTubeIframeAPIReady = function () {
      console.log("ytready");
      $scope.loadIframe();
    };
  }

  function getVideoInfo(){
    var urlStats = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id="+$scope.currItem.id+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
        console.log(responseStats);
        $scope.currItem = responseStats.data.items[0];
        $scope.loading = false;
        getChannelInfo();
      });
  }

  function getRelatedContent(){
    console.log("ASDSAD");
    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+$scope.currItem.id+"&type=video&maxResults=10&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
    $http.jsonp(url).then(function(response) {
      console.log("search");
      var ids = '';
      for (var i = 0; i < response.data.items.length; i++) {
        response.data.items[i].id = response.data.items[i].id.videoId;
        ids += response.data.items[i].id+',';
      }
      $scope.nextPageToken = response.data.nextPageToken;
      $scope.totalResults = response.data.pageInfo.totalResults;
      var urlStats = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id="+ids+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
        console.log("stats");
        for (var i = responseStats.data.items.length - 1; i >= 0; i--) {
          response.data.items[i].statistics = responseStats.data.items[i].statistics;
          response.data.items[i].contentDetails = responseStats.data.items[i].contentDetails;
        }
        $scope.results = response.data.items;
        $scope.relatedLoading = false;
      });
    });
  }

  function getChannelInfo(){
    console.log("currItem",$scope.currItem);
    var urlStats = "https://www.googleapis.com/youtube/v3/channels?part=topicDetails,snippet,statistics&id="+$scope.currItem.snippet.channelId+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
        console.log("channel",responseStats.data.items[0]);
        $scope.channel = responseStats.data.items[0];
        $scope.channelLoading = false;
      });
  }

  function getComments(){
    var urlStats = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId="+$scope.currItem.id+"&order=relevance&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
        $scope.comments = responseStats.data.items;
        console.log("commetns",$scope.comments);
        $scope.commentsLoading = false;
      });
  }

  $scope.getUploadDate = function(date){
    var curr=new Date();
    var update=new Date(date);
    var diff=curr.getTime()-update.getTime();
    if(diff>(365*24*60*60*1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(365*24*60*60*1000))+" years ago";
    }
    else if(diff>(30*24*60*60*1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(30*24*60*60*1000))+" months ago";
    }
    else if(diff>(24*60*60*1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(24*60*60*1000))+" days ago";
    }
    else if(diff>(60*60*1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(60*60*1000))+" hours ago";
    }
    else if(diff>(60*1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(60*1000))+" minutes ago";
    }
    else if(diff>(1000)){
      return "uploaded "+Math.floor((curr.getTime()-update.getTime())/(1000))+" seconds ago";
    }
  }

  $scope.getViewCount = function(count,id){
    var string = '';
    var myEl = angular.element( document.querySelector('#views-' + id));

    if(parseInt(count)>1000000){
      string=((Math.floor(count/100000)*10)/100)+'M';
      myEl.attr('class',"million");
      return string;
    }
    else if(parseInt(count)>1000){
      string=((Math.floor(count/100)*10)/100)+'K';
      myEl.attr('class',"thousand");
      return string;
    }
    else{
      string=count;
      return string;
    }
  }

  $scope.getResultsCount = function(count){
    if(parseInt(count)>=1000000){
      string=((Math.floor(count/100000)*10)/100)+' M';
      return string;
    }
    else if(parseInt(count)>=1000){
      string=((Math.floor(count/100)*10)/100)+' K';
      return string;
    }
    else{
      string=count;
      return string;
    }
  }

  $scope.getLd = function(statistics){
    return Math.floor(statistics.likeCount*100/
      (parseInt(statistics.likeCount)+parseInt(statistics.dislikeCount)));
  }

  $scope.getTime = function(str){
    str = str.replace("PT","").replace("S","").
    replace("M"," :").replace("H"," :");
    if(str.indexOf(":") === -1)
      str = "0 :" + str;
    return str;
  }

  $scope.go = function(regionName){
    window.location = 'search.html?q=' + $scope.searchString;
  }

  $scope.loadIframe = function(){
    console.log(" clicked");
    function onPlayerReady(event){
      //event.target.playVideo();
    }
    player = new YT.Player('asd', {
      height: '700',
      width: '1200',
      videoId: $scope.currItem.id,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerReady
      }
    });
  }

  $scope.play = function(item){
    window.location = 'video.html?id=' + item.id;
  }

  $scope.setTab = function(tab, $event){
    if(tab === 'comments')
      $scope.tab = true;
    if(tab === 'details')
      $scope.tab = false;
  }
});
