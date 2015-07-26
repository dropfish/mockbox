var myApp = angular.module('myApp', ['ui.router', 'ngSanitize']);

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
        metadata: null,
        metadataList: null
      },
      resolve: {
        metadata: function($stateParams, Metaserver) {
          console.log("metadata resolve");
          console.log("RESOLVE stateParams: " + JSON.stringify($stateParams));
          if ($stateParams.metadata) { // user clicked on ui-sref
            console.log("already in stateParams");
            return $stateParams.metadata;
          }
          else { // user typed URL into address bar, need to fetch metadata
            console.log("NOT already in stateParams, calling with filename = " + $stateParams.filename);
            return Metaserver.getByName($stateParams.filename);
          }
        },
        metadataList: function($stateParams, Metaserver) {
          console.log("metadataList resolve");
          console.log("RESOLVE stateParams: " + JSON.stringify($stateParams));
          if ($stateParams.metadataList) { // user clicked on ui-sref
            console.log("already in stateParams");
            return $stateParams.metadataList;
          }
          else { // user typed URL into address bar, need to fetch metadataList
            console.log("getting list...")
            return Metaserver.getList();
          }
        }
      },
      controller: function($scope, $stateParams, Blockserver, Metaserver, metadata, metadataList) {
        console.log("in controller");
        var blockserverKey,
            index,
            i,
            metadataBeforeCurrentMetadata,
            metadataAfterCurrentMetadata;

        $scope.metadata = metadata;
        $scope.metadataList = metadataList;

        blockserverKey = $scope.metadata.blockserverKey;

        $scope.imagePathOrDocumentContents = Blockserver.getByKey(blockserverKey);

        $scope.prevImage = undefined;
        $scope.nextImage = undefined;

        for (index = 0; index < metadataList.length; index++) {
          if (metadataList[index].name == metadata.name) {
            // we've found the currently displayed metadata in the list
            break;
          }
        }
        // set prevImage, if there is one, by walking backwards
        metadataBeforeCurrentMetadata = metadataList.slice(0, index);
        for (i = metadataBeforeCurrentMetadata.length - 1; i >= 0; i--) {
          if (metadataBeforeCurrentMetadata[i].kind == 'image') {
            $scope.prevImage = metadataBeforeCurrentMetadata[i];
            break;
          }
        }

        // set nextImage, if there is one, by walking forwards
        metadataAfterCurrentMetadata = metadataList.slice(index + 1, metadataList.length);
        for (i = 0; i < metadataAfterCurrentMetadata.length; i++) {
          if (metadataAfterCurrentMetadata[i].kind == 'image') {
            $scope.nextImage = metadataAfterCurrentMetadata[i];
            break;
          }
        }
      }
    });
});

myApp.factory("Metaserver", function($http, $timeout, $q) {
  var defer, fileList, fileIndex;
  function getList() {
    if (defer && defer.promise) {
      return defer.promise; // return cached result
    }
    defer = $q.defer()

    $timeout(function() {
      defer.resolve($http.get("static/data/metaserver.json"));
    }, Math.random()*DELAY);
    return defer.promise;
  }
  return {
    getByName: function(name) {
      var defer = $q.defer()
      getList().then(function(results) {
        fileList = results.data.files;
        for (fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
          if (fileList[fileIndex].name == name) {
            defer.resolve(fileList[fileIndex]);
            break;
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

myApp.factory("Blockserver", function($http, $timeout, $q) {
  return {
    getByKey: function(blockserverKey) {
      var defer = $q.defer()

      $timeout(function() {
        $http.get("static/data/blockserver.json").then(function(results) {
          if (blockserverKey in results.data) {
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