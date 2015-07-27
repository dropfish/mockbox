var myApp = angular.module('myApp');

myApp.controller("ListCtrl", function($scope, metadataList) {
	$scope.metadataList = metadataList;
	$scope.sortType = "name";
	$scope.sortReverse = false;

	$scope.setSort = function(newSortType) {
		if (newSortType == $scope.sortType) {
			// if same sortType applied twice in a row, flip sortReverse
			$scope.sortReverse = !$scope.sortReverse;
		}
		else {  // set it to true so that new sortType selections always
				// start with sortReverse = false
	    	$scope.sortReverse = false;
		}
		$scope.sortType = newSortType;
	};

	$scope.setSelected = function(newFile) {
		$scope.selectedFile = newFile;
	};

	$scope.setHovered = function(newFile) {
		$scope.hoveredFile = newFile;
	};

	$scope.resetHovered = function() {
		$scope.hoveredFile = undefined;
	};
});

myApp.controller("ViewCtrl", function($scope, $stateParams, Blockserver, Metaserver, metadata, metadataList) {
	var index,
	    i,
	    metadataBeforeCurrentMetadata,
	    metadataAfterCurrentMetadata;

	if (metadata == '404') {
		$scope.do404 = true;
	}
	else {
		$scope.metadata = metadata;
		$scope.metadataList = metadataList;
		$scope.imagePathOrDocumentContents = Blockserver.getByKey(metadata.blockserverKey);
		
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