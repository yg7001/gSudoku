var app=angular.module("gSudoku-test",["ngRoute","gSudoku"]);
app.config(["$routeProvider",function($routeProvider){
	$routeProvider.when("/",{controller:"mainCtrl",templateUrl:"menu.html"})
	.when("/cell7",{controller:"cell7Ctrl",templateUrl:"cell7.html"})
	.when("/cell6",{controller:"cell6Ctrl",templateUrl:"cell6.html"})
	.otherwise({redirectTo:"/"});
}]);

app.controller("mainCtrl",function($scope){
});

app.controller("cell6Ctrl",function($scope){
});

app.controller("cell7Ctrl",function($scope){
});
