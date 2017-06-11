shouldiceApp.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise(function ($injector, $location) {
        alert("wow");
    });

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('language', {
            data: {
                showHeader: false,
                id: "language",
            },
            parent: 'site',
            url: "/",
            views: {
                'mainView@': {
                    templateUrl: '/templates/language.html'
                }
            }
        })
        .state('catalog_or_samples', {
            data: {
                id: "catalog_or_samples",
                class: "full_height",
            },
            parent: 'site',
            url: "/catalog_or_samples",
            views: {
                'mainView@': {
                    templateUrl: '/templates/catalog_or_samples.html'
                }
            }
        })
        .state('catalog', {
            data: {
                id: "catalog",
            },
            parent: 'site',
            url: "/catalog",
            views: {
                'mainView@': {
                    controller: 'Control_Catalog',
                    templateUrl: '/templates/catalog.html'
                }
            }
        })
        .state('samples_landing', {
            data: {
                id: "samples_landing",
            },
            parent: 'site',
            url: "/samples_landing",
            views: {
                'mainView@': {
                    controller: 'Control_Samples_Landing',
                    templateUrl: '/templates/samples_landing.html'
                }
            }
        })
        .state('site', {
            data: {
                showHeader: true,
                test: true,
                id: "",
                class: "",
                style: ""
            },
            'abstract': true,
        })
});