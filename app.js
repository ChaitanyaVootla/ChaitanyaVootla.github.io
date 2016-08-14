var myApp = angular.module('yt',[]);

myApp.controller('ytCtrl', function($scope, $http, $sce) {
	$scope.title = "YouTube";
	$scope.suggestions = [];
	$scope.loading = true;
  $scope.regionName={
    Code: 'IN',
    Name: 'India'
  }
  $scope.searchString = '';
  $scope.nextPageToken = '';
  $scope.modeSearch = false;
  $scope.prevSearch = '';
  $scope.playing = false;
  $scope.currItem = {};
  $scope.totalResults = null; 


	$scope.loadSuggestions = function(){
    var url = "http://clients1.google.com/complete/search?output=youtube&q="+$scope.searchString
    +"&callback=JSON_CALLBACK";
		$http.jsonp(url).then(function(response) {
      $scope.suggestions = response.data[1];
    });
	}


  $scope.getPopular = function(loadMore, regionName){
    $scope.modeSearch = false;
    $scope.playing = false;
    $scope.regionUrl = '&regionCode=' + $scope.regionName.Code;
    if(!loadMore){
      $scope.nextPageToken = '';
    }
    $scope.regionUrl = '&regionCode=' + regionName.Code;
    $scope.loading = true;
    var url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostpopular&pageToken="+$scope.nextPageToken+"&maxResults=20"+$scope.regionUrl+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
    $http.jsonp(url).then(function(response) {
      if(!loadMore){
        $scope.results = [];
        for (var i=0; i<response.data.items.length/2; i++){
          $scope.results[i] = [];
          $scope.results[i][0] = response.data.items[i*2];
          $scope.results[i][1] = response.data.items[i*2+1];
        }
        console.log($scope.results);
      }
      else{
        var len = $scope.results.length;
        for (var i=len; i<len
          + response.data.items.length/2; i++){
          $scope.results[i] = [];
          $scope.results[i][0] = response.data.items[(i-len)*2];
          $scope.results[i][1] = response.data.items[(i-len)*2+1];
        }
        console.log($scope.results);
      }
      
      $scope.nextPageToken = response.data.nextPageToken; 
      $scope.loading = false;
    });
  }

  $scope.init = function(){

    onYouTubeIframeAPIReady = function () {
      console.log("ytready");
    };

    $http.get('http://data.okfn.org/data/core/country-list/r/data.json')
    .then(function(response) {
      $scope.countrycodes = response.data;
      //document.getElementById("sel1").options[document.getElementById("sel1").selectedIndex].text = "India";
      $scope.regionName={
        Code: 'IN',
        Name: 'India'
      }
    });

    $scope.getPopular(false,{
      Code: 'IN',
      Name: 'India'
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
      string=((Math.floor(count/100000)*10)/100)+'M';
      return string;
    }
    else if(parseInt(count)>=1000){
      string=((Math.floor(count/100)*10)/100)+'K';
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

  $scope.set = function(regionName){
    $scope.getPopular(false,regionName);
  }

  $scope.search = function(loadMore){
    $scope.playing = false;
    $scope.modeSearch = true;
    console.log("loadMore");
    if(!loadMore){
      $scope.nextPageToken = '';
      $scope.prevSearch = $scope.searchString;
    }
    $scope.loading = true;
    var url = "https://www.googleapis.com/youtube/v3/search?order=relevance&part=snippet&q="+$scope.prevSearch+"&pageToken="+$scope.nextPageToken+"&type=video&videoSyndicated=true&maxResults=10&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
    $http.jsonp(url).then(function(response) {
      var ids = '';
      for (var i = 0; i < response.data.items.length; i++) {
        response.data.items[i].id = response.data.items[i].id.videoId;
        ids += response.data.items[i].id+',';
      }
      $scope.nextPageToken = response.data.nextPageToken;
      $scope.totalResults = response.data.pageInfo.totalResults; 
      $scope.loading = false;
      var urlStats = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id="+ids+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
        console.log(url,response,urlStats,responseStats);
        for (var i = responseStats.data.items.length - 1; i >= 0; i--) {
          response.data.items[i].statistics = responseStats.data.items[i].statistics;
          response.data.items[i].contentDetails = responseStats.data.items[i].contentDetails;
        }
        if(!loadMore){
          $scope.results = [];
          for (var i=0; i<responseStats.data.items.length/2; i++){
            $scope.results[i] = [];
            $scope.results[i][0] = responseStats.data.items[i*2];
            $scope.results[i][1] = responseStats.data.items[i*2+1];
          }
          console.log($scope.results);
        }
        else{
          var len = $scope.results.length;
          for (var i=len; i<len
            + responseStats.data.items.length/2; i++){
            $scope.results[i] = [];
            $scope.results[i][0] = responseStats.data.items[(i-len)*2];
            $scope.results[i][1] = responseStats.data.items[(i-len)*2+1];
          }
          console.log($scope.results);
        }
      });
    });
  }

  $scope.go = function(regionName){
    if($scope.modeSearch === true)
      $scope.search(true);
    else{
      console.log("gettting pop");
      $scope.getPopular(true,regionName);
    }
  }

  $scope.loadIframe = function(){
    console.log(" clicked");
    function onPlayerReady(event){
      event.target.playVideo();
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

  $scope.setCurr = function(item){
    $scope.playing = true;
    $scope.currItem = item;
  }

  $scope.goBack = function(){
    $scope.playing = false;
  }
});
