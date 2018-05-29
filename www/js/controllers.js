var hostname = "http://192.168.0.100:3000/";

angular.module('starter.controllers', [])

.service("core",function($http,$rootScope){
  this.ajax = function(url,type,data,success_f,error_f){
    var requestData = "";
    if(data != null || data != undefined || data!=""){
      for(var key in data){
        requestData += `${key}=${data[key]}&`;
      }
      requestData = requestData.substring(0,requestData.length-1);      
      console.log(requestData);
    }
    $http({
      url: hostname+url,
      method: type,
      headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
      data:requestData
    }).success(function(response){
      console.log(response);
      success_f(response);
    }).error(function(response){
      console.log("error");
      error_f(response);
    });
  };

  this.alert = function($scope,$ionicPopup,title,msg,afterExec){
    $scope.showAlert = function() {
       var alertPopup = $ionicPopup.alert({
         title: title,
         template: msg
       });
       alertPopup.then(function(res) {
         afterExec(res);
       });
    };
    $scope.showAlert();
  };
  this.unexpectedError = function(msg){
    if(msg == undefined || msg == null) {
      alert("Unexpedted error occured. Please try again.");
    } else {
      alert(msg);
    }
  };


  this.sort = function(property){
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
  };

  this.validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
})

.service("user",function(){
  var username = undefined;
  var auth_token = undefined;

  var db;
  this.getUser = function(){
    return {
      "e":this.username,
      "a":this.auth_token
    }
  };
  this.login = function(name,token){
    this.username = name;
    this.auth_token = token;
    localStorage.setItem("store_user",JSON.stringify(this.getUser()));
  };
  this.logout = function(){
    this.username = undefined;
    this.auth_token = undefined;
    localStorage.removeItem("store_user");  
    window.location.assign("#/app/index");
  };
  this.prepare = function(){
    var data = {}
    try {
      data = JSON.parse(localStorage.getItem("store_user"));
      if(data == null) {
        throw "NULL";
      }
    } catch(msg) {
      data = {
        username:undefined,
        auth_token:undefined
      }
    }
    console.log(data);
    this.username = data.e;
    this.auth_token = data.a;
    console.log("prepared",this.getUser(),this.isLoggedIn());
  };
  this.isLoggedIn = function(){
    if(this.username != undefined && this.auth_token != undefined) {
      return true;
    } else {
      return false;
    }
  }
  this.prepare();
})

.controller('AppCtrl', function($scope,$rootScope,$ionicPopup,$ionicModal,$timeout,user,core,$window,$sce) {
  user.prepare();
  console.log("paaa",user.isLoggedIn());
  if(user.isLoggedIn()){
    $rootScope.loggedIn = true;
  } else {
    $rootScope.loggedIn = false;
  }


  $scope.song = {
    filename:""
  };
  if($rootScope.currentsong == undefined || $rootScope.currentsong == null){
    $rootScope.currentsong = {
      filename:null
    }
    $rootScope.audioElement = document.getElementById("currentsongelement");
  }
  $scope.$watch('$root.currentsong', function() {
    $scope.song = $rootScope.currentsong;
    setTimeout(function(){
      document.getElementById("currentsongelement").play();
    },100);
  });
  document.getElementById("currentsongelement").addEventListener('ended',function(){
    $rootScope.currentSongQueueIndex += 1;
    loadSong();
  });
  $scope.$watch('$root.currentSongQueueIndex', function() {
    loadSong();
  });
  function loadSong(){
    $rootScope.currentsong = {
      name:$rootScope.songsQueue[$rootScope.currentSongQueueIndex%$rootScope.songsQueue.length].name,
      filename:$sce.trustAsResourceUrl(hostname+"uploads/"+$rootScope.songsQueue[$rootScope.currentSongQueueIndex%$rootScope.songsQueue.length].filename),
      imgname:hostname+"uploads/"+$rootScope.songsQueue[$rootScope.currentSongQueueIndex%$rootScope.songsQueue.length].imgname
    };
    $rootScope.$apply();    
  }
  //login
  $scope.loginData = {};
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginModal = modal;
  });
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };
  $scope.login = function() {
    $scope.loginModal.show();
  };
  $scope.doLogin = function() {
    if(typeof $scope.loginData.e == undefined || typeof $scope.loginData.e == null){
      return;
    }
    if(typeof $scope.loginData.p == undefined || typeof $scope.loginData.p == null){
      return;
    }
    core.ajax("login.php","POST",$scope.loginData,function(response){
      if(response.status == "ok"){
        user.login($scope.loginData.e,response.auth_token);
        $timeout(function() {
          $scope.closeLogin();
          $window.location.reload();
        }, 500);
        $rootScope.loggedIn = true;
      } else if(response.status == "error"){
        core.alert($scope,$ionicPopup,"Says","Invalid credentials.",function(){
        });        
      } else if(response.status == "no_data"){
        core.alert($scope,$ionicPopup,"Says","Enter email address & password.",function(){
        });
      } else {
        core.alert($scope,$ionicPopup,"Says","Unexpedted error occured. Please try again.",function(){
        }); 
      }
    },function(error){

    });


  };

  //signup
  $scope.signupData = {
    "u":"",
    "e":"",
    "p":""
  };
  $ionicModal.fromTemplateUrl('templates/signup.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.signupModal = modal;
  });
  $scope.closeSignup = function() {
    $scope.signupModal.hide();
  };
  $scope.signup = function() {
    $scope.signupModal.show();
  };
  $scope.doSignup = function() {
    if($scope.signupData.u.length < 3){
      core.alert($scope,$ionicPopup,"Says","Enter proper name.",function(){
      });  
      return;
    }
    if(!core.validateEmail($scope.signupData.e)){
      core.alert($scope,$ionicPopup,"Says","Enter valid email address.",function(){
      });
      return; 
    }
    if($scope.signupData.p.length < 6){
      core.alert($scope,$ionicPopup,"Says","Enter password with minumum 6 characters.",function(){
      });  
      return;
    }
    core.ajax("signup.php","POST",$scope.signupData,function(response){
      if(response.status == "ok"){
        core.alert($scope,$ionicPopup,"Says","Signup successful. Login to continue.",function(){
          $timeout(function() {
            $scope.closeSignup();
          }, 300);
          $timeout(function() {
            $scope.login();
          }, 600);
        });
      } else if(response.status == "activation_pending"){

      } else if(response.status == "exist"){
        core.alert($scope,$ionicPopup,"Says","Account with specified email already exist. <br>Please enter other email address.",function(){
        }); 
      } else if(response.status == "error"){
        core.alert($scope,$ionicPopup,"Says","Unexpedted error occured. Please try again.",function(){
        });
      } else if(response.status == "no_data"){

      } else {

      }
    },function(error){

    });
  };


  //logout
  $scope.logout = function() {
    core.ajax("logout.php","POST",user.getUser(),function(response){
      if(response.status == "ok") {
        user.logout();
        $rootScope.loggedIn = false;
        $window.location.reload();
      } else if(response.status == "error"){
        core.alert($scope,$ionicPopup,"Says","Invalid Auth Token.",function(){
        });
      } else if(response.status == "no_data"){
      }
    },function(error){

    });
  };
})

.controller('IndexCtrl',function($scope,$rootScope,core){
  $scope.trendingSongs = [];
  $scope.list = ["1","2"];
  $scope.getTrendingSongs = function(){
    core.ajax("getTrendingSongs","GET",null,function(response){
      $scope.trendingSongs = [];
      for(var i=0;i<response.songs.length;i++){
        $scope.trendingSongs.push( response.songs[i]);
        $scope.trendingSongs[i].filename = hostname+"uploads/"+response.songs[i].filename;
        $scope.trendingSongs[i].imgname = hostname+"uploads/"+response.songs[i].imgname;
      }
      console.log("trendingSongs",$scope.trendingSongs);
      setTimeout(function(){
        var swiper = new Swiper('.swiper-container', {
          slidesPerView: 2.8,
          spaceBetween: 10,
          freeMode: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
        });
      },1);

    });
  };
  $scope.getTrendingSongs();

  $scope.playSong = function(id){
    console.log(id);
  }
})

.controller('ArtistsCtrl', function($scope,core) {
  $scope.artists = [];
  $scope.getArtists = function(){
    core.ajax("getArtists","GET",null,function(response){
      console.log(response);
      $scope.artists = response;
    });
  };
  $scope.getArtists();
})

.controller('SongsCtrl', function($scope,core,$stateParams,$rootScope) {
  $scope.songs = [];
  $scope.getArtistSongs = function(){
    core.ajax("getArtistSongs?artistid="+$stateParams.artistid,"GET",null,function(response){
      console.log(response);
      $scope.songs = response;
      $rootScope.songsQueue = response;
      $rootScope.currentSongQueueIndex = 0;
    });
  };
  $scope.getArtistSongs();
})

.controller('SongsPlaylistCtrl', function($scope,core,$stateParams,$rootScope) {
  $scope.songs = [];
  $scope.getPlaylistSongs = function(){
    console.log($stateParams.playlistid);
    core.ajax("getPlaylistSongs?playlistid="+$stateParams.playlistid,"GET",null,function(response){
      console.log(response);
      $scope.songs = response;
      $rootScope.songsQueue = response;
      $rootScope.currentSongQueueIndex = 0;
    });
  };
  $scope.getPlaylistSongs();
})

.controller('SongCtrl', function($scope,core,$stateParams,$sce,$rootScope) {
  $scope.songElement = undefined;
  $scope.loadSong = function(){
    $scope.song = [{
      name:$stateParams.name,
      filename:$sce.trustAsResourceUrl(hostname+"uploads/"+$stateParams.filename),
      imgname:hostname+"uploads/"+$stateParams.imgname
    }];
    $rootScope.currentsong = $scope.song[0];
    $rootScope.currentSongQueueIndex = parseInt($stateParams.songindex);
    console.log("rs",$rootScope.currentsong,"sp",$scope.song);
    $scope.songElement = $rootScope.audioElement;
  };

  $scope.loadSong();
  $scope.playpause = function(){
    console.log("called",$scope.songElement.pause);
    if($scope.songElement.paused){
      $scope.songElement.play();
    } else {
      $scope.songElement.pause();
    }
  };
  $scope.prevSongQueue = function(){
    if($rootScope.currentSongQueueIndex == 0){
      $rootScope.currentSongQueueIndex = $rootScope.songsQueue.length - 1;
    } else {
      $rootScope.currentSongQueueIndex -= 1;
    }
    $scope.$apply();
  };
  $scope.nextSongQueue = function(){
    $rootScope.currentSongQueueIndex += 1;
    $scope.$apply();
  };
  $scope.$watch('$root.currentsong', function() {
    $scope.song = [$rootScope.currentsong];
    $scope.$apply();
  });
  $scope.totalDuration = "";
  $scope.currentDuration = "";
  $scope.songPlayPercent = 0;
  setInterval(function(){
    if($scope.songElement != undefined){
      if(!$scope.songElement.paused){
        $scope.totalDuration = Math.trunc($scope.songElement.duration/60)+":"+Math.trunc($scope.songElement.duration%60);
        $scope.currentDuration = Math.trunc($scope.songElement.currentTime/60)+":"+Math.trunc($scope.songElement.currentTime%60);
        $scope.songPlayPercent = Math.trunc(100*(Math.trunc($scope.songElement.currentTime)/Math.trunc($scope.songElement.duration)));
      }
    }
    $scope.$apply();
  },1000);
})

.controller('PlaylistsCtrl', function($scope, $stateParams, core) {
  $scope.playlists = [];
  $scope.getArtistPlaylists = function(){
    core.ajax("getArtistPlaylists?artistid="+$stateParams.artistid,"GET",null,function(response){
      console.log(response);
      $scope.playlists = response;
    });
  };
  $scope.getArtistPlaylists();
})

.controller('PlaylistCtrl', function($scope, $stateParams, core) {
})

var dropdown = function(ev){
  ev.target.children[0].classList.toggle('active');
  ev.target.children[1].classList.toggle('active');
};  