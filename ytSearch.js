var myApp = angular.module('ytSearch',[]);

myApp.controller('ytSearchCtrl', function($scope, $http, $sce, $location) {
	$scope.title = "YouTube";
	$scope.suggestions = [];
	$scope.loading = true;
  $scope.searchString = '';
  $scope.nextPageToken = '';
  $scope.modeSearch = false;
  $scope.prevSearch = '';
  $scope.playing = false;
  $scope.currItem = {};
  $scope.totalResults = null;
  $scope.relevanceClass = 'mainTab-active';
  $scope.dateClass = 'mainTab';
  $scope.popularClass = 'mainTab';


	$scope.loadSuggestions = function(){
    var url = "http://clients1.google.com/complete/search?output=youtube&q="+$scope.searchString
    +"&callback=JSON_CALLBACK";
		$http.jsonp(url).then(function(response) {
      $scope.suggestions = response.data[1];
    });
	}

  $scope.init = function(){
    console.log(window.location.search.replace("?q=",""));
    $scope.searchString = window.location.search.replace("?q=","").split('%20').join(' ');
    $scope.search(false,'relevance');
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

  $scope.search = function(loadMore, searchOrder){
    $scope.modeSearch = true;
    if(!loadMore){
      $scope.nextPageToken = '';
      $scope.prevSearch = $scope.searchString;
      $scope.totalResults = null
    }
    $scope.loading = true;
    var url = "https://www.googleapis.com/youtube/v3/search?order="+searchOrder+"&part=snippet&q="+$scope.prevSearch+"&pageToken="+$scope.nextPageToken+"&type=video&videoSyndicated=true&maxResults=10&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
    $http.jsonp(url).then(function(response) {
      var ids = '';
      for (var i = 0; i < response.data.items.length; i++) {
        response.data.items[i].id = response.data.items[i].id.videoId;
        ids += response.data.items[i].id+',';
      }
      $scope.nextPageToken = response.data.nextPageToken;
      $scope.totalResults = response.data.pageInfo.totalResults;
      var urlStats = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id="+ids+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
      $http.jsonp(urlStats).then(function(responseStats) {
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
        }
        else{
          var len = $scope.results.length;
          for (var i=len; i<len
            + responseStats.data.items.length/2; i++){
            $scope.results[i] = [];
            $scope.results[i][0] = responseStats.data.items[(i-len)*2];
            $scope.results[i][1] = responseStats.data.items[(i-len)*2+1];
          }
        }
        $scope.loading = false;
      });
    });
  }

  $scope.go = function(){
    window.location = 'search.html?q=' + $scope.searchString;
  }

  $scope.play = function(item){
    window.location = 'video.html?id=' + item.id;
  }

  $scope.setClass = function(item){
    if(item === 'relevance'){
      $scope.relevanceClass = 'mainTab-active';
      $scope.dateClass = 'mainTab';
      $scope.popularClass = 'mainTab';
    }
    if(item === 'date'){
      $scope.dateClass = 'mainTab-active';
      $scope.relevanceClass = 'mainTab';
      $scope.popularClass = 'mainTab';
    }
    if(item === 'popular'){
      $scope.popularClass = 'mainTab-active';
      $scope.dateClass = 'mainTab';
      $scope.relevanceClass = 'mainTab';
    }
  }
  
});
