var myApp = angular.module('yt',[]);

myApp.controller('ytCtrl2', function($scope, $http, $sce) {
	console.log("ASDSA");
	$scope.countrycodes = {};
	$scope.init = function(){
		$http.get('http://data.okfn.org/data/core/country-list/r/data.json')
	    .then(function(response) {
	      $scope.countrycodes = response.data;
	      $scope.regionName = 'India';
      		console.log('init set',$scope.regionName);
	    });
	}
	$scope.set = function(){
		console.log($scope.regionName);
	}
});