shouldiceApp.controller("Control_Catalog", ['$scope', function ($scope) {

    // Catalog slider
    $('.slider').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
    });
}]);