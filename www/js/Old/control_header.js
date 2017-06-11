shouldiceApp.controller("Control_Header", ['$scope', '$state', '$location', '$route', '$rootScope',
    function ($scope, $state, $location, $route, $rootScope) {

        $scope.GoBack = function () {
            $state.go($rootScope.returnToState, $rootScope.returnToStateParams);
        }


        $scope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            if (toState.data.showHeader) {
                $('.ui-header-fixed').show();
            }
            else {
                $('.ui-header-fixed').hide();
            }
        });
}]);