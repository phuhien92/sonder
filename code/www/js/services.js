angular.module('songhop.services', ['ionic.utils'])

.factory('User', function($http, SERVER, $q, $localstorage) {
	var o = {
		username: false,
		session_id: false,
		favorites: [],
		newFavorites: 0
	};

	o.addSongToFavorites = function(song) {

		if (!song) return false;
		o.favorites.unshift(song);
		o.newFavorites++;

		console.log(o.newFavorites);
		return $http.post(SERVER.url + '/favorites', {session_id: o.session_id, song_id: o.song_id});
	};

	o.favoritesCount = function() {
		return o.newFavorites;
	}

	o.removeSongFromFavorites = function(song, index) {
		if (!song) return false;

		o.favorites.splice(index, 1);

		return $http({
			method: 'DELETE',
			url: SERVER.url + '/favorites',
			params: {session_id: o.session_id, song_id: o.song_id}
		});
	};

	o.auth = function(username, signingUp) {
		var authRoute;

		if (signingUp) {
			authRoute = 'signup';
		} else {
			authRoute = 'login';
		}

		return $http.post(SERVER.url + '/' + authRoute, {username: username})
		.success(function(data) {

			o.setSession(data.username, data.session_id, data.favorites);
		});
	}

	o.populateFavorites = function() {
		return $http({
			method: 'GET',
			url: SERVER.url + '/favorites',
			params: {session_id: o.session_id, song_id: o.song_id},

		})
		.success(function(data) {
			o.favorites = data;
		})
	};

	o.setSession = function(username, session_id, favorites) {
		if (username) o.username = username;
		if (session_id) o.session_id = session_id;
		if (favorites) o.favorites = favorites;

		$localstorage.setObject('user', {username: username, session_id: session_id});
	}

	o.checkSession = function() {
		var defer = $q.defer();
		if (o.session_id) {
			defer.resolve(true);
		} else {
			var user = $localstorage.getObject('user');
			if (user.username) {
				o.setSession(user.username, user.session_id);
				o.populateFavorites().then(function() {
					defer.resolve(true);
				})
			} else {
				defer.resolve(false);
			}
		}

		return defer.promise;
	}

	o.destroySession = function() {
		$localstorage.setObject('user', {});
		o.username = false;
		o.session_id = false;
		o.favorites = [];
		o.newFavorites = 0;
	}

 	return o;
})

.factory('Recommendations', function($http, SERVER, $q, $cordovaMedia) {	

	var o = {
		queue: []
	};
	var media, timeLoop;

	o.playCurrentSong = function() {
		var defer = $q.defer();
		var src   = o.queue[0].preview_url;

		media = new Audio(o.queue[0].preview_url);

		media.addEventListener('loadeddata', function() {
			media.play();
			defer.resolve();
		});
		media.play();

		return defer.promise;
	};

	o.songDuration = function() {
		return Math.round(media.duration);
	}

	o.haltAudio = function() {
		if (media) media.pause();
	};

	o.playAudio = function() {
		if (media) media.play();
	};

	o.currentTime = function() {
		var curTime = Math.ceil(media.currentTime),
		time        = 360/media.duration*curTime;

		return time;
	};

	o.getNextSongs = function() {
		return $http({
			method: 'GET',
			url: SERVER.url + '/recommendations'
		})
		.success(function(data) {
			o.queue = o.queue.concat(data);
		})
	};

	o.nextSong = function() {
		o.queue.shift();
		o.haltAudio();

		if (o.queue.length <= 3) 
			o.getNextSongs();
	}

	o.init = function() {
		if (o.queue.length ==  0) {
			return o.getNextSongs();
		} else {
			return o.playCurrentSong();
		}
	}
 
	return o;
})
.factory('TitleService', [ '$q','$timeout', function($q, $timeout) {
  
  var provideNewTitle = function(title) {
    var deferred = $q.defer();
    
    $timeout( function(title) {
      deferred.resolve(title);
    });
    
    return deferred.promise;
  };
  
  return {
    getTitle : provideNewTitle
  };
}])
.factory('SharedService', function() {
	var shared = {};

	shared.message = '';

	shared.add = function(msg) {
		shared.message = msg;
	};

	return shared;
})
;


