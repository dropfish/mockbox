var myApp = angular.module('myApp');

myApp.factory("Metaserver", function($http, $timeout, $q) {
	var defer, fileList, fileIndex;
	function getList() {
		if (defer) {
	  		return defer.promise; // return cached result
		}

		defer = $q.defer();
		$timeout(function() {
			defer.resolve($http.get("static/data/metaserver.json"));
		}, Math.random() * DELAY);
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
				defer.resolve("404");
			});
			return defer.promise;
		},
		getList: function() {
			var defer = $q.defer()
			getList().then(function(results) {
				defer.resolve(results.data.files);
			});
			return defer.promise;
		},
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
					else {
						console.log("500");
						defer.resolve("500");
					}
		    	});
			}, Math.random() * DELAY);
			return defer.promise;
		}
	};
});