$(document).ready(function () {
	

}); // end: $(document).ready()

function InitJqueryScripts(){
	
	$('#footer_catalog ul > li').each(function() {
        var marginLeft = $(this).offset().left * (-1);
		$(this).children('.subnav').css('margin-left',marginLeft);
    });

    // Sub Category Anchor
    $('.sub_cat_anchor').click(function (e) {
        e.preventDefault();
    });

    // Activate/Deactivate subnav
    $('.toggle_subnav').click(function (e) {
        e.preventDefault();
        $('body').toggleClass('subnav_active');
    });

    // Catalog slider
    $('#catalog .slider').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1
    });
	

    // Stone sample slider
    $('#samples_content .slider').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
    });

    // Lightbox Slider
    $('#gallery_image').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
    });

    $('#gallery_image').on('swipe', GallerySlick);

    //  Main Content Navigatiom
    $('#footer_catalog a').click(function (e) {
        e.preventDefault();

        var getCounter = $(this).attr('counter');
        if (getCounter == undefined)
            return;

        $('#catalog .slider').slick('slickGoTo', getCounter);
    });

    $('#catalog .slider').on('afterChange', function (event, slick, currentSlide) {
        //$('#catalog * .scroll').scrollTop(0);
        $('#footer_catalog li').removeClass('act');
        $('#footer_catalog * .subnav_item').removeClass('act');

        $('#footer_catalog > ul > li[counter="' + CatalogSlides[currentSlide] + '"]').addClass('act');

        $('#footer_catalog * .subnav_item[counter="' + currentSlide + '"]').addClass('act');
    });

    $('#footer_samples .first').addClass('act');

    $('#footer_samples a').click(function (e) {
        e.preventDefault();

        var getCounter = $(this).attr('counter');
        if (getCounter == undefined)
            return;

        $('#samples_content .slider').slick('slickGoTo', getCounter);
    });

    $('#samples_content .slider').on('afterChange', function (event, slick, currentSlide) {
        //$('#catalog * .scroll').scrollTop(0);
        $('#footer_samples li').removeClass('act');
        $('#footer_samples * .subnav_item').removeClass('act');

        $('#footer_samples > ul > li[counter="' + StoneSamplesSlides[currentSlide] + '"]').addClass('act');

        $('#footer_samples * .subnav_item[counter="' + currentSlide + '"]').addClass('act');
    });

    $('#nix_contact_form').submit(function (e) {
        e.preventDefault();
        var formData = $(this).serialize();

        var url = Host + "/typo3conf/ext/shouldice_app/Resources/Public/php/nix_service.php";

        $.ajax({
            type: 'GET',
            url: url,
            data: 'send_mail=1&' + formData,
            success: function (data) {
                ShowContactSuccessMsg();

                HideContactForm();
            },
            error: function (error) {
                ShowContactErrorMsg();
                HideContactForm();
            }
		});
    });
}

var CatalogSlickInit = false;
var InspirationSlickInit = false;
var StonesSlickInit = false;
function StonesSlick(){
	if(StonesSlickInit)
		return;
	$('.subnav_slick_stones').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 7,
        slidesToScroll: 1,
		touchThreshold: 100
    });
	StonesSlickInit = true;
}
function CatalogSlick(){
	if(CatalogSlickInit)
		return;
	$('.subnav_slick_catalog').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 7,
        slidesToScroll: 1,
		touchThreshold: 100
    });
	CatalogSlickInit = true;
}
function InspirationSlick(){
	if(InspirationSlickInit)
		return;
	$('.subnav_slick_inspiration').slick({
        dots: false,
        arrows: false,
        infinite: false,
        autoplay: false,
        speed: 300,
        slidesToShow: 7,
        slidesToScroll: 1,
		touchThreshold: 100
    });
	InspirationSlickInit = true;
}

// Show/Hide Header & Footer
function showHeader() {
    $('.ui-header-fixed').show();
}
function hideHeader() {
    $('.ui-header-fixed').hide();
}

function showCatalogFooter() {
    $('#footer_catalog').show();
}
function hideCatalogFooter() {
    $('#footer_catalog').hide();
}

function showSamplesFooter() {
    $('#footer_samples').show();
}
function hideSamplesFooter() {
    $('#footer_samples').hide();
}



function ShowContactSuccessMsg() {
    $('.contact_msgs').removeClass('hidden');
    $('#contact_success_msg').removeClass('hidden');
}

function ShowContactErrorMsg() {
    $('.contact_msgs').removeClass('hidden');
    $('#contact_error_msg').removeClass('hidden');
}

function HideContactMsgs() {
    $('.contact_msgs').addClass('hidden');
    $('#contact_success_msg').addClass('hidden');
    $('#contact_error_msg').addClass('hidden');
    ShowContactForm();
}

function ShowContactForm() {
    $('#nix_contact_form').find("input[type=text]").val("");
    $('#nix_contact_form').find("input[type=email]").val("");
    $('#nix_contact_form').find("input[type=radio]").prop('checked', false);
    $('#nix_contact_form').removeClass('hidden');
}

function HideContactForm() {
    $('#nix_contact_form').addClass('hidden');
}

var currentSlide = 0;
var selectedGallery = [];

function GallerySlick(event, slick, direction) {
    currentSlide = slick.currentSlide;

    SetGalleryDetails();
}

function SetGalleryDetails() {
    var image = selectedGallery[currentSlide];

    $('#galleryHeader').text(image.name);

    if (image.isFavorite) {
        $('#galleryAddFromFavorites').hide();
        $('#galleryRemoveFromFavorites').show();
    }
    else {
        $('#galleryAddFromFavorites').show();
        $('#galleryRemoveFromFavorites').hide();
    }

}

function SmoothScrolling(t){
	var tmpTop = $(t).offset().top;
	var height = $(t).height();

	var scrollTo = tmpTop + height;

	$(t).parents('.content_item').animate({
		scrollTop: scrollTo
	}, 1000);
}