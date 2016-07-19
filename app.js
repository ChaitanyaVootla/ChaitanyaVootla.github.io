var myApp = angular.module('yt',[]);

myApp.controller('ytCtrl', function($scope, $http, $sce) {
	$scope.title = "YouTube";
	$scope.suggestions = [];
	$scope.loading = true;
  $scope.region = 'IN';
  //$scope.regionName = 'India';

	$scope.loadSuggestions = function(){
    var url = "http://clients1.google.com/complete/search?output=youtube&q="+$scope.searchString
    +"&callback=JSON_CALLBACK";
		$http.jsonp(url).then(function(response) {
      $scope.suggestions = response.data[1];
    });
	}

  $scope.init = function(){
    $scope.searchString = '';
    $scope.nextPageToken = '';
    $scope.loading = true;
    $scope.regionUrl = '&regionCode=' + $scope.region;
    var url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostpopular&pageToken="+$scope.nextPageToken+"&maxResults=10"+$scope.regionUrl+"&key=AIzaSyCeFO-T8BMXKLAJSzSO19B8gtc8sb6WDS8&callback=JSON_CALLBACK";
    $http.jsonp(url).then(function(response) {
      $scope.results = response.data.items;
      
      $scope.nextPageToken = response.data.nextPageToken;
      $scope.loading = false;
      
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/player_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      onYouTubeIframeAPIReady = function () {
        for (var i = response.data.items.length - 1; i >= 0; i--) {
          player = new YT.Player('player'+response.data.items[i].id, {
            height: '300',
            width: '500',
            videoId: response.data.items[i].id
          });
        }
      };

    });

    $http.get('http://data.okfn.org/data/core/country-list/r/data.json')
    .then(function(response) {
      $scope.countrycodes = response.data;
      document.getElementById("sel1").options[document.getElementById("sel1").selectedIndex].text="India"
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

  $scope.getLd = function(statistics){
    return Math.floor(statistics.likeCount*100/
      (parseInt(statistics.likeCount)+parseInt(statistics.dislikeCount)));
  }

  $scope.set = function(){
    console.log(document.getElementById("sel1").options[document.getElementById("sel1").selectedIndex].value);
    $scope.region = document.getElementById("sel1").options[document.getElementById("sel1").selectedIndex].value;
    //$scope.regionName = document.getElementById("sel1").options[document.getElementById("sel1").selectedIndex].text;
    console.log($scope.regionName);
    $scope.init();
  }
});
