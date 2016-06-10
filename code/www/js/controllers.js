angular.module('songhop.controllers', [
	'ionic', 
	'songhop.services',
	'songhop.directives',
	'angular-svg-round-progress'
])

/*
Controller for the home page
*/
.controller('HomeCtrl', function($scope, $timeout, SharedService) {
	$scope.navTitle = 'Home';
	$scope.musictag = "#";
	var self = this;

	$scope.changeTitle = function(title) {
		SharedService.add('#'+title);
	}

	$scope.musicCollections = [
		{
			"tag": "Alternative",
			"image": "img/alternative.png"
		},
		{
			"tag": "Country",
			"image": "img/country.png"
		},
		{
			"tag": "Dance",
			"image": "img/dance.png"
		},
		{
			"tag": "Electronic",
			"image": "img/electronic.png"
		},
		{
			"tag": "HipHopRap",
			"image": "img/rap.png"
		},
		{
			"tag": "Jazz",
			"image": "img/jazz.png"
		},
		{
			"tag": "Latino",
			"image": "img/latino.png"
		},
		{
			"tag": "Pop",
			"image": "img/pop.png"
		},
		{
			"tag": "RnBSoul",
			"image": "img/rnb.png"
		},
		{
			"tag": "Rock",
			"image": "img/rock.png"
		}
	]
})
/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $rootScope, $interval, $ionicLoading,$timeout, User, Recommendations, SharedService) {
	//helper function for loading
	var self = this;
	var interval = null;
	var oldSoftBack = $rootScope.$ionicGoBack;

	$scope.vwidth = window.innerWidth*85/100;
	$scope.vheight= window.innerHeight*85/100;
	$scope.navTitle = SharedService.message;

	var showLoading = function() {
		$ionicLoading.show({
			template: '<i class="ion-loading-c"></i>',
			noBackdrop: true
		})
	}

	var hideLoading = function() {
		$ionicLoading.hide();
	};

	showLoading();

	$scope.songs = [
	     {
	        "title":"Stealing Cinderella",
	        "artist":"Chuck Wicks",
	        "image_small":"http://icons.iconarchive.com/icons/carlosjj/google-jfk/128/music-icon.png",
	        "image_large":"http://icons.iconarchive.com/icons/carlosjj/google-jfk/128/music-icon.png"
	     }
  	];

  	$scope.currentSong = angular.copy($scope.songs[0]);

  	// fire when we favorite/skip the song
  	$scope.sendFeedback = function(bool) {
  		$scope.timerSetup(0,0);
  		showLoading();

  		if (bool) User.addSongToFavorites($scope.currentSong);

  		$scope.currentSong.rated = bool;
  		$scope.currentSong.hide  = true;

  		Recommendations.nextSong();
  		playSong();
  	};

  	var playSong = function() {
  		$scope.currentSong = Recommendations.queue[0];
  		Recommendations.playCurrentSong().then(function() {
  			var timer = max = Recommendations.songDuration();

  			$scope.timerSetup(timer,max, {
        		done 	: false,
        		paused 	: false,
        		started : true
        	});

  			interval = $interval($scope.progressbar, 1000);
  			hideLoading();
  		});
  	};

  	$rootScope.$ionicGoBack = function() {
    	Recommendations.haltAudio();
    	Recommendations.queue.length = 0;
    	oldSoftBack();
  	};

  	$scope.max = 30;
	$scope.timer  = 0;

	// When current song loaded
	$scope.timerSetup = function(timer, max, options) {
		$scope.timer 	= timer;
		$scope.max   	= max;
		var defaultOpts = {
			started: false,
			paused : true,
			done   : false
		};

		if (options) defaultOpts = options;
		$scope.mediaStatus(defaultOpts);
	}

	$scope.mediaStatus = function(defaultOpts) {
		$scope.started = defaultOpts.started;
		$scope.paused  = defaultOpts.paused;
		$scope.done    = defaultOpts.done;

		return defaultOpts;
	}

  	Recommendations.init()
  	.then(function() {
  		$scope.currentSong = Recommendations.queue[0];
  		playSong();
  	})

  	// actually timer method, count down every second, stops on zero
  	
  	$scope.progressbar = function() {
  		console.log($scope.timer);

        if ($scope.timer === 0) {
        	$scope.currentSong.loaded = false;
        	$interval.cancel(interval);

        	$scope.mediaStatus({
        		done    :true,
        		started :false,
        		paused  :false
        	})
        	return;
        }
        $scope.timer = $scope.timer - 1;
  	}

  	$scope.nextAlbumImg = function() {
  		if (Recommendations.queue.length > 1) {
  			return Recommendations.queue[1].image_large;
  		} 
  		return '';
  	};

  	$scope.swipeToNextSong = function() {
  		$scope.sendFeedback(false);
  	}

  	$scope.swipeToFav = function() {
  		$scope.sendFeedback(true);
  	}

  	$scope.currentTimer = 0;
  	$scope.pauseMode = function() {
  		$scope.currentTimer = $scope.timer;
  		$interval.cancel(interval);
  		Recommendations.haltAudio();
  		
		$scope.mediaStatus({
  			started: false,
  			paused : true,
  			done   : false
  		});
  	};
  	
  	$scope.playMode  = function(replay) {
  		if (replay) $scope.currentTimer = 0;

  		interval = $interval($scope.progressbar, 1000);
  		Recommendations.playAudio();

  		$scope.timerSetup($scope.currentTimer, $scope.max,{
  			started: true,
  			paused : false,
  			done   : false
  		});
  	};

  	$scope.trackProgress = function() {
  		time = Math.ceil(Recommendations.currentTime());
  		return time;
  	}
})

/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window) {
	$scope.favorites = User.favorites;
	$scope.username  = User.username;
	$scope.email     = 'hien@whimsy-games.com';

	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	};

	$scope.openSong = function(song) {
		$window.open(song.open_url);
	};

	$scope.logout = function() {
		User.destroySession();
		$window.location.href = 'index.html';
	}
})

.controller('SplashCtrl', function($scope, $state, User) {

	$scope.submitForm = function(username, signingUp) {
		User.auth(username, signingUp).then(function() {
			$state.go('tab.home');
		}, function() {
			alert('try another username');
		});
	}
})
/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations, User) {
	$scope.enteringFavorites = function() {
		User.newFavorites = 0;
		Recommendations.haltAudio();
	};

	$scope.leavingFavorites = function() {
		Recommendations.init();
	};

	$scope.favCount = User.favoritesCount;

});