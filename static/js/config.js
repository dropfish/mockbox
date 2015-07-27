var myApp = angular.module('myApp', ['ui.router', 'ngSanitize']);

var DELAY = 1000;

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
      controller: "ListCtrl"
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
          if ($stateParams.metadata) { // user clicked on ui-sref
            return $stateParams.metadata;
          }
          else { // user typed URL into address bar, need to fetch metadata
            return Metaserver.getByName($stateParams.filename);
          }
        },
        metadataList: function($stateParams, Metaserver) {
          if ($stateParams.metadataList) { // user clicked on ui-sref
            return $stateParams.metadataList;
          }
          else { // user typed URL into address bar, need to fetch metadataList
            return Metaserver.getList();
          }
        }
      },
      controller: "ViewCtrl"
    });
});