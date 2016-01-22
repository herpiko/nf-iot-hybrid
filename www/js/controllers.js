angular.module('starter.controllers', [])

.controller('AppCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {

	$rootScope.isLoggedIn = false;
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
	$scope.spinner = false;
  $scope.doLogin = function() {
		$scope.spinner = true;
    console.log('Doing login', $scope.loginData);
    $http({
      method : "POST",
      url : "http://128.199.95.141:2999/api/login",
      data : $scope.loginData
    })
    .success(function(data, status){
      console.log(data);
      if (!data.success) {
        console.log("Login failed");
        // If fail, pop a message 
	      var myPopup = $ionicPopup.show({
         template: "Nama pengguna atau kata sandi salah",
         title: 'Gagal Login',
         scope: $scope,
         buttons: [
           {
             text: '<b>OK</b>',
             type: 'button-positive',
             onTap: function(e) {
								return;
             }
           }
         ]
       });
				$rootScope.isLoggedIn = false;
      } else if (data.key) {
        // If success, save auth key to localStorage
        localStorage.setItem("key", data.key);
				$rootScope.isLoggedIn = true;
				$scope.spinner = false;
			}
    })
  };


  // Initiate socket connection
  $rootScope.socket = io("http://128.199.95.141:2999");
  
  // This socket event is to answer middleware (server) question, "whoare"
  // The mobile app answer "join-ng" that represents as an angular client instance
  // This is required to splitted socket communication between raspberry pi and mobile apps
  $rootScope.socket.on("whoareu", function(){
    console.log("middleware asking whoareu");
    $rootScope.socket.emit("join-ng");
  })

  // theft value should be false when initialized
  $rootScope.theft = false;

  // Wait for period event from raspi
  $rootScope.socket.on("message", function(data){
		$rootScope.dht11 = {
			temp : data.temp,
			humid : data.humid
		}
  	$scope.$apply();

    // If the raspberry pi send true value in theft key, pop the alarm message
    // Bip bip bip!
		if (!$rootScope.theft && data.theft) {
	    var myPopup = $ionicPopup.show({
       template: "Alarm pencurian menyala!",
       title: 'ALARM!',
       scope: $scope,
       buttons: [
         {
           text: '<b>OK</b>',
           type: 'button-positive',
           onTap: function(e) {
			  			return;
           }
         }
       ]
  	  })
		}
    // Set the value to global
    $rootScope.theft = data.theft;
  })
  
  // Logout function, this will redirect view to login page.
	$rootScope.logout = function(){
		$rootScope.isLoggedIn = false;
    // Remove auth key from local storage
		localStorage.removeItem("key");
  	$scope.$apply();
	}

})
.controller('StartCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {
	$rootScope.isLoggedIn = false;
})
.controller('MapCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {

  // This controller should not be accessed if the user is not logged in
	if (!$rootScope.isLoggedIn) {
		$state.go("app.start");
		localStorage.removeItem("key");
	}

  // Initialized marker in map
  $scope.markers = {
    mainMarker : {
      lat: -6.352812176498355,
      lng: 106.8327283859253,
      focus: true,
    }
  };

  // Update current marker position
  // Disabled since the webservice API is not implemented yet. 
  angular.extend($scope, {
    center: {
      lat: -6.352812176498355,
      lng: 106.8327283859253,
      zoom: 15
    },
    events: {
      map: {
        enable: ['click', 'drag', 'blur', 'touchstart'],
        logic: 'emit'
      }
    }
  })
})
.controller('LampCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {
  
  // This controller should not be accessed if the user is not logged in
	if (!$rootScope.isLoggedIn) {
		$state.go("app.start");
		localStorage.removeItem("key");
	}
	

  // Function to switch LED1 state
  $scope.led1 = function(value){
		value = (value) ? 1 : 2;
    $http({
      method : "POST",
      url : "http://128.199.95.141:2999/api/led1?value=" + value
    })
    .success(function(data, status){
      console.log(data);
    })
    .error(function(data, status){
      console.log(data);
    })
  }
  
  // Function to switch LED2 state
  $scope.led2 = function(value){
		value = (value) ? 1 : 2;
    $http({
      method : "POST",
      url : "http://128.199.95.141:2999/api/led2?value=" + value
    })
    .success(function(data, status){
      console.log(data);
    })
    .error(function(data, status){
      console.log(data);
    })
  }
})
.controller('Dht11Ctrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {
})
.controller('CameraCtrl', function($rootScope, $scope, $ionicModal, $timeout, $http, $state, $ionicPopup) {
	$scope.spinner = false;
  $scope.$apply();

  // Get camera image from raspberry pi
  $scope.camera = function(){
		console.log("CAMERA");
		$scope.spinner = true;
  	$scope.$apply();
    $http({
      method : "POST",
      url : "http://128.199.95.141:2999/api/image"
    })
    .success(function(data, status){
      console.log(data);

      // The camera image is encoded in base64 string. add prefix
			$scope.image = "data:image/png;base64," + data;
    })
    .error(function(data, status){
      console.log(data);
    })
  }

  // Wait for image event from socket
  $rootScope.socket.on("image", function(data){
    console.log(data);
    // The camera image is encoded in base64 string. add prefix
    $scope.image = "data:image/png;base64," + data;
		$scope.spinner = false;
  	$scope.$apply();
  })
  $scope.camera();
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
