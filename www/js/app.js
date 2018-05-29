
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

    .state('app.index', {
      url: '/index',
      views: {
        'menuContent': {
          templateUrl: 'templates/index.html',
          controller: 'IndexCtrl'
        }
      }
    })

    .state('app.artists', {
      url: '/artists',
      views: {
        'menuContent': {
          templateUrl: 'templates/artists.html',
          controller: 'ArtistsCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/playlist/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  })

  .state('app.playlists', {
    url: '/playlists/:artistid',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.songs', {
    url: '/songs/:artistid',
    views: {
      'menuContent': {
        templateUrl: 'templates/songs.html',
        controller: 'SongsCtrl'
      }
    }
  })

  .state('app.songsPlaylist', {
    url: '/songsPlaylist/:playlistid',
    views: {
      'menuContent': {
        templateUrl: 'templates/songs.html',
        controller: 'SongsPlaylistCtrl'
      }
    }
  })


  .state('app.song', {
    url: '/song/:name/:filename/:imgname/:songindex',
    views: {
      'menuContent': {
        templateUrl: 'templates/song.html',
        controller: 'SongCtrl'
      }
    }
  });
  
  $urlRouterProvider.otherwise('/app/index');
});
