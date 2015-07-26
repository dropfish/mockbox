var myApp = angular.module('myApp', ['ui.router']);

var DELAY = 500;

myApp.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/list");
  $stateProvider
    .state('list', {
      url: "/list",
      resolve: {
        metadataList: function(Metaserver) {
          return Metaserver.getList();
        }
      },
      templateUrl: "static/list.html",
      controller: function($scope, metadataList) {
        $scope.metadataList = metadataList;
        $scope.sortType = "name";
        $scope.sortReverse = false;
        $scope.selectedFile = undefined;
        $scope.hoveredFile = undefined;
        $scope.changeSort = function(newSortType) {
          if (newSortType == $scope.sortType) {
            // if same sortType applied twice in a row, flip sortReverse
            $scope.sortReverse = !$scope.sortReverse;
          }
          else { // set it to true so that new sortType selections always
                 // start with sortReverse = false
            $scope.sortReverse = false;
          }
          $scope.sortType = newSortType;
        };
        $scope.setSelected = function(newFile) {
          console.log("setSelected(" + newFile.name + ")");
          $scope.selectedFile = newFile;
        };
        $scope.setHovered = function(newFile) {
          console.log("setHovered(" + newFile.name + ")");
          $scope.hoveredFile = newFile;
        };
        $scope.resetHovered = function() {
          $scope.hoveredFile = undefined;
        }
      }
    })
    .state('view', {
      url: "/view/:filename",
      templateUrl: "static/view.html",
      params: {
        test: null,
        metadata: null
      },
      resolve: {
        metadata: function($stateParams, Metaserver) {
          console.log("metadata resolve");
          console.log("RESOLVE stateParams: " + JSON.stringify($stateParams));
          if ($stateParams.metadata) { // user clicked on ui-sref
            console.log("already in stateParams");
            return $stateParams.metadata
          }
          else { // user typed URL into address bar, need to fetch metadata
            console.log("NOT already in stateParams, calling with filename = " + $stateParams.filename);
            return Metaserver.getByName($stateParams.filename);
          }
        }
      },
      controller: function($scope, $stateParams, Blockserver, metadata) {
        var blockserverKey;
        $scope.filename = $stateParams.filename;
        console.log("stateParams: " + JSON.stringify($stateParams));
        $scope.metadata = metadata;
        console.log("metadata: " + JSON.stringify($scope.metadata));

        blockserverKey = $scope.metadata.blockserverKey;
        console.log("blockserverKey: " + blockserverKey);

        $scope.imagePathOrDocumentContents = Blockserver.getByKey(blockserverKey);
        console.log("contents: " + JSON.stringify($scope.imagePathOrDocumentContents));
      }
    });
});

myApp.factory("Metaserver", function($http, $timeout, $q) {
  console.log("metaserver");
  var defer, fileList, fileIndex;
  function getList() {
    console.log("getList (in metaserver)");
    defer = $q.defer()

    $timeout(function() {
      console.log("timeout completed");
      defer.resolve($http.get("static/data/metaserver.json"));
    }, Math.random()*DELAY);
    return defer.promise;
  }
  return {
    getByName: function(name) {
      console.log("getByName(" + name + ")");
      var defer = $q.defer()
      getList().then(function(results) {
        fileList = results.data.files;
        for (fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
          if (fileList[fileIndex].name == name) {
            console.log("resolving to " + JSON.stringify(fileList[fileIndex]));
            defer.resolve(fileList[fileIndex]);
            break;
          }
        }
      });
      return defer.promise;
    },
    getList: function() {
      console.log("getList()");
      var defer = $q.defer()
      getList().then(function(results) {
        defer.resolve(results.data.files);
      });
      return defer.promise;
    }
  };
});

myApp.factory("Blockserver", function($http, $timeout, $q) {
  return {
    getByKey: function(blockserverKey) {
      console.log("getByKey(" + blockserverKey + ")");
      var defer = $q.defer()

      $timeout(function() {
        $http.get("static/data/blockserver.json").then(function(results) {
          console.log("results.data: " + JSON.stringify(results.data));
          if (blockserverKey in results.data) {
            console.log("blockserverKey in results, it's " + JSON.stringify(results.data[blockserverKey]));
            defer.resolve(results.data[blockserverKey]);
          }
          // implement error checking here and in getByName later
          // else {
          //   throw blockserverKey + " not found in blockserver";
          // }
        });
      }, Math.random()*DELAY);

      return defer.promise;
    }
  };
});