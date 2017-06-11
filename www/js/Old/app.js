var shouldiceApp = angular.module('ShouldiceApp', ['ui.router']);

shouldiceApp.config(function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
});

shouldiceApp.run(function ($rootScope) {


    $rootScope.GetUIViewID = function () {
        if ($rootScope.toState == undefined)
            return "";

        return $rootScope.toState.data.id;
    }

    $rootScope.GetUIViewClass = function () {
        if ($rootScope.toState == undefined)
            return "";

        return $rootScope.toState.data.class;
    }
});

shouldiceApp.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.returnToState = $rootScope.toState;
            $rootScope.returnToStateParams = $rootScope.toStateParams;

            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;
        });
    }
]);