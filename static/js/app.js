var myApp = angular.module('myApp', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/list");
  $stateProvider
    .state('list', {
      url: "/list",
      resolve: {
        fileList: function(File) {
          return File.getList();
        }
      },
      templateUrl: "static/list.html",
      controller: function($scope, fileList) {
        $scope.files = fileList;
      }
    })
    .state('view', {
      url: "/view/:filename",
      templateUrl: "static/view.html",
      controller: function(File, $scope, $stateParams) {
        $scope.filename = $stateParams.filename;
        $scope.file = File.getByName($scope.filename);
      }
    });
});

myApp.factory("File", function($http, $timeout, $q) {
  var defer, fileList, fileToReturn, fileIndex;
  function getList() {
    defer = $q.defer()

    $timeout(function() {
      defer.resolve($http.get("static/data/files.json"));
    }, Math.random()*1000);
    return defer.promise;
  }
  return {
    getByName: function(filename) {
      var defer = $q.defer()
      getList().then(function(results) {
        fileList = results.data.files;
        fileToReturn = undefined;
        for (fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
          if (fileList[fileIndex].filename == filename) {
            defer.resolve(fileList[fileIndex]);
          }
        }
      });
      return defer.promise;
    },
    getList: function() {
      var defer = $q.defer()
      getList().then(function(results) {
        defer.resolve(results.data.files);
      });
      return defer.promise;
    }
  };
});