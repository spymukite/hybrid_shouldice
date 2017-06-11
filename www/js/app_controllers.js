var Host = 'http://app.shouldice.ca';
var UrlToImage = "";

function GetShouldiceExternalImagesData() {
    $.ajaxSetup({ cache: false });
    $.ajax("http://app.shouldice.ca/typo3conf/ext/shouldice_app/Resources/Public/php/data.json", {
        dataType: "text",
        success: function (data) {
           navigator.splashscreen.hide();
            var tmp = data.replace("var ShouldiceData = ", "");

            ShouldiceData = JSON.parse(tmp);

            ShouldiceDataOld = ShouldiceData;
            localStorage.removeItem("ShouldiceDataTemp");
            localStorage.setItem("ShouldiceDataTemp", JSON.stringify(ShouldiceData));


            CheckData();
        },
        error: function (a) {
           navigator.splashscreen.hide();
            console.log(a);
        }
    });
}

function GetShouldiceDataFromLS() {
    var ShouldiceDataOld = localStorage.getItem("ShouldiceData");
    if (ShouldiceDataOld == undefined) {
        ShouldiceDataOld = {
            AboutUsPages: [],
            CategoryPages: [],
            Inspirations: [],
            SampleCategories: [],
        }

        localStorage.removeItem("ShouldiceData");
        localStorage.setItem("ShouldiceData", JSON.stringify(ShouldiceDataOld));

        return ShouldiceDataOld;
    }
    return JSON.parse(ShouldiceDataOld);
}

var ShouldiceDataOld = GetShouldiceDataFromLS();

var app = angular.module("Shouldice_App", ['slick']);


//if (typeof ShouldiceData !== 'undefined') {
//    ShouldiceDataOld = ShouldiceData;
//    localStorage.setItem("ShouldiceDataTemp", JSON.stringify(ShouldiceData));
//}

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);


function InitializeApp() {
    $('#loadingClick').click();
};


function GoOffline() {
    IsOnline = false;
    $('#offlineClick').click();
};

function GoOnLine() {
    IsOnline = true;
    $('#onLineClick').click();
};
var CatalogSlides = [];
var StoneSamplesSlides = [];

app.controller("Control_General", ['$scope', function ($scope) {


    $scope.LoadApp = function () {
        $scope.ChangeLocation(window.location.hash, true);
    }
    $scope.SetOfflineMode = function () {
        $scope.IsOnline = IsOnline;
    }

    $scope.SetOnLineMode = function () {
        $scope.IsOnline = IsOnline;
    }

    $scope.CurrentState = 0;

    $scope.PreviousScreen = "";

    $scope.CurrentLoadingPercent = 0;

    $scope.UpdateLoadingPercent = function(){
        var cur = 100 - ((imgsDownload.length / TotalImagesForDownload) * 100);

        $scope.CurrentLoadingPercent = cur.toFixed(0);

    }

    $scope.ChangeLocation = function (newLocation, init) {

        if (newLocation == window.location.hash && init == undefined)
            return;

        if (newLocation == undefined)
            newLocation = curLocation;

        $scope.PreviousScreen = window.location.hash;

        switch (newLocation) {
            case "#catalog_or_samples":
                $scope.CurrentState = 2;
                break;
            case "#catalog":
                $scope.CurrentState = 3;
                break;
            case "#samples_landing":
                $scope.CurrentState = 4;
                break;
            case "#samples_content":
                $scope.CurrentState = 5;
                break;
            case "#favourites":
                $scope.CurrentState = 6;
                break;
            case "#contact":
                $scope.CurrentState = 8;
                break;
            case "#support":
                $scope.CurrentState = 10;
                break;
            case '#elevate':
                window.initVisualizer();
                $scope.CurrentState = 11;
            default:
                $scope.CurrentState = 1;
                break;
        }
    }

    $scope.GoBack = function () {
        if (window.location.hash == '#elevate' && window.backHistory && window.backHistory()) {
            return;
        }
        if (window.location.hash == $scope.PreviousScreen) {
            $scope.PreviousScreen = "";
        }

        $.mobile.changePage($scope.PreviousScreen);
        $scope.ChangeLocation($scope.PreviousScreen, true);
    }

    $scope.InitializeCategorySlides = function () {
        var slidesCounter = 0;

        for (var i = 0; i < $scope.AboutUsPages.length; i++) {
            CatalogSlides[slidesCounter] = 0;
            slidesCounter++;
        }

        for (var i = 0; i < $scope.CategoryPages.length; i++) {
            $scope.CategoryPageSlides.push($scope.CategoryPages[i]);
            $scope.CategoryPages[i].Type = 1;
            $scope.CategoryPages[i].Class = "catalog_main_cat";
            $scope.CategoryPages[i].Counter = slidesCounter;

            $scope.CategoryPages[i].MainImage = $scope.GetImageObjectByID($scope.CategoryPages[i].pagebgimageid);

            CatalogSlides[slidesCounter] = slidesCounter;

            var tmpSlideCounter = slidesCounter;
            for (var k = 0; k < $scope.CategoryPages[i].Galleries.length; k++) {
                slidesCounter++;

                var tmpGallery = $scope.CategoryPages[i].Galleries[k];
                tmpGallery.Type = 2;
                tmpGallery.Class = "catalog_sub_cat scroll";
                tmpGallery.Counter = slidesCounter;
                tmpGallery.MainImage = null;

                for (var j = 0; j < tmpGallery.Images.length; j++) {
                    if (tmpGallery.Images[j].isdefault ==  "1") {
                        tmpGallery.MainImage = tmpGallery.Images[j];
                        tmpGallery.Images.remove(tmpGallery.Images[j]);
                        break;
                    }
                }

                $scope.CategoryPageSlides.push(tmpGallery);
                CatalogSlides[slidesCounter] = tmpSlideCounter;
            }

            slidesCounter++;
        }

        $scope.InspirationPageCounter = slidesCounter;

        for (var i = 0; i < $scope.InspirationPages.length; i++) {
            $scope.InspirationPages[i].Counter = slidesCounter;
            if ($scope.InspirationPages[i].Galleries.length > 0) {
                $scope.InspirationPages[i].MainGallery = $scope.InspirationPages[i].Galleries.shift();

                if ($scope.InspirationPages[i].Galleries.length > 0) {
                    $scope.InspirationPages[i].Galleries[0].Class == "inspiration_middle";

                    $scope.InspirationPages[i].Galleries[$scope.InspirationPages[i].Galleries.length - 1].Class == "inspiration_bottom";
                }
            }

            CatalogSlides[slidesCounter] = $scope.InspirationPageCounter;
            slidesCounter++;
        }
    }

    $scope.InitializeStoneSamplesSlides = function () {
        var slidesCounter = 0;

        //StoneSamplesSlides

        for (var i = 0; i < $scope.StoneSamplesPages.length; i++) {
            $scope.StoneSamplesPages[i].Counter = slidesCounter;
            $scope.StoneSamplesPages[i].MenuClass = "";

            if (i == 0) {
                $scope.StoneSamplesPages[i].MenuClass = "first";
            }
            else if ((i + 1) == $scope.StoneSamplesPages.length) {
                $scope.StoneSamplesPages[i].MenuClass = "last";
            }


            var tmpSlideCounter = slidesCounter;
            for (var k = 0; k < $scope.StoneSamplesPages[i].Galleries.length; k++) {
                var tmpGallery = $scope.StoneSamplesPages[i].Galleries[k];
                tmpGallery.Counter = slidesCounter;

                tmpGallery.parentTitle = $scope.StoneSamplesPages[i].pagetitle;
                tmpGallery.parentTitle_fr = $scope.StoneSamplesPages[i].pagetitle_fr;

                $scope.StoneSamplesSlides.push(tmpGallery);
                StoneSamplesSlides[slidesCounter] = tmpSlideCounter;

                slidesCounter++;
            }
        }
    }
    $scope.openLightboxModal = function (images) {
        Lightbox.openModal(images, 0);
    };

    $scope.GetImageByID = function (id) {
        for (var i = 0; i < ShouldiceDataOld.Images.length; i++) {
            var image = ShouldiceDataOld.Images[i];
            if (image.uid == id)
                return UrlToImages + image.file;

        }
    }


    $scope.GetImageObjectByID = function (id) {
        for (var i = 0; i < ShouldiceDataOld.Images.length; i++) {
            var image = ShouldiceDataOld.Images[i];
            if (image.uid == id)
                return image;
        }
    }

    $scope.GetImageByType = function (id, type) {

        if (id == undefined)
            return "";

        for (var i = 0; i < ShouldiceDataOld.Images.length; i++) {
            var image = ShouldiceDataOld.Images[i];
            if (image.uid == id)
            {
                switch (type) {
                    case 1:
                        suffix = "_full_size.";
                        break;
                    case 2:
                        suffix = "_about_top_image.";
                        break;
                    case 3:
                        suffix = "_about_half_full_height.";
                        break;
                    case 4:
                        suffix = "_catalog_category_level_1.";
                        break;
                    case 5:
                        suffix = "_main_category_level_2.";
                        break;
                    case 6:
                        suffix = "_sample_category.";
                        break;
                    case 7:
                        suffix = "_inspiration_1.";
                        break;
                    case 8:
                        suffix = "_inspiration_2.";
                        break;
                    case 9:
                        suffix = "_inspiration_3.";
                        break;
                    case 10:
                        suffix = "_inspiration_4.";
                        break;
                    case 11:
                        suffix = "_inspiration_5.";
                        break;
                    case 12:
                        suffix = "_inspiration_6_bottom_right.";
                        break;
                    case 13:
                        suffix = "_inspiration_7.";
                        break;
                    case 14:
                        suffix = "_inspiration_8_top_left.";
                        break;
                    case 15:
                        suffix = "_inspiration_9_bottom_left.";
                        break;
                    case 16:
                        suffix = "_inspiration_10_big_right.";
                        break;
                    case 17:
                        suffix = "_subnavigation.";
                        break;
                    case 18:
                        suffix = "_favorite.";
                        break;
                    default:
                        suffix = ".";
                        break;
                }

                return UrlToImages + image.file.replace('.', suffix);
            }

        }
    }

    $scope.GetDefaultGalleryImage = function (gallery, type) {

        var suffix = ".";

        if (type == undefined) {
            return "";
        }

        switch (type) {
            case 1:
                suffix = "_catalog.";
                break;
            case 2:
                suffix = "_sample.";
                break;
            case 3:
                suffix = "_four_images.";
                break;
            case 4:
                suffix = "_three_images_left.";
                break;
            case 5:
                suffix = "_three_images_right.";
                break;
        }

        var tmpImage = "";

        if (gallery.isFavorite == undefined)
            gallery.isFavorite = false;

        for (var i = 0; i < gallery.Images.length; i++) {
            if (i == 0)
                tmpImage = UrlToImages + gallery.Images[i].file; //'./images/galeries/preview/' + gallery.Images[i].File;

            if (gallery.Images[i].isdefault) {
                return UrlToImages + gallery.Images[i].file.replace('.', suffix);  //'./images/galeries/preview/' + gallery.Images[i].File;
            }
        }

        return tmpImage.replace('.', suffix);
    };

    $scope.OpenCategoryGallery = function (category, image) {
        var gallery = [];
        if (category.MainImage != null)
            gallery.push(category.MainImage);

        for (var i = 0; i < category.Images.length; i++) {
            gallery.push(category.Images[i]);
        }

        $scope.OpenLightbox(gallery, image);
    }

    $scope.OpenInspirationGallery = function (inspiration, image) {
        var gallery = [];
        if (inspiration.MainGallery != null) {
            for (var i = 0; i < inspiration.MainGallery.Images.length; i++) {
                gallery.push(inspiration.MainGallery.Images[i]);
            }
        }


        for (var i = 0; i < inspiration.Galleries.length; i++) {
            for (var k = 0; k < inspiration.Galleries[i].Images.length; k++) {
                gallery.push(inspiration.Galleries[i].Images[k])
            }
        }

        $scope.OpenLightbox(gallery, image);
    }

    $scope.OpenStoneSampleGallery = function (stoneSample, image) {
        $scope.OpenLightbox(stoneSample.Images, image);
    }

    $scope.OpenImageFavoritesGallery = function (imageGroup, image) {
        $scope.OpenLightbox(imageGroup.Images, image);
    }

    $scope.OpenLightbox = function (Gallery, selectedImage) {

        var slickLen = $('#gallery_image').children().children().children().length;

        for (var i = 0; i < slickLen; i++) {
            $('#gallery_image').slick('slickRemove', 0);
        }

        $scope.SelectedGallery = Gallery;
        selectedGallery = Gallery;

        currentSlide = 0;

        var tmpWidth = effectiveDeviceWidth();
        var tmpHeight = effectiveDeviceHeight();

        if (tmpWidth < tmpHeight) {
            var tmp = tmpWidth;
            tmpWidth = tmpHeight;
            tmpHeight = tmp;
        }

        for (var i = 0; i < Gallery.length; i++) {
            if (Gallery[i].uid == selectedImage.uid)
                currentSlide = i;

            $('#gallery_image').slick('slickAdd', '<div class="lightbox_slider_item"><div style="height:' + tmpHeight + 'px; width: ' + tmpWidth + 'px;background-size:cover;display:block;background-image:url(' + $scope.GetImageByType(Gallery[i].uid, 1) + ');"></div></div>')
        }

        $('#gallery_image').slick('slickGoTo', currentSlide, false);

        totalItems = Gallery.length;

        SetGalleryDetails();
        $('#gallery_popup').show();
    };

    $scope.showSamplesFooter = function (number) {
        $('#samples .slider').slick("slickGoTo", number, false);
        $('#footer_samples').show();
        $('#footer_samples a').removeClass('act');
        $('#footer_samples a[counter="' + number + '"]').addClass('act');
        samplesFooterVisible = true;
    }

    $scope.ToggleFavoritesGalleryFromLightbox = function(){
        $scope.ToggleFavoritesGallery($scope.SelectedGallery[currentSlide]);
        SetGalleryDetails();
    }

    $scope.ToggleFavoritesGallery = function (Image) {
        event.preventDefault();

        if (Image.isFavorite == undefined || Image.isFavorite == false) {
            $scope.Favorites.push(Image);
            Image.isFavorite = true;
        }
        else {
            $scope.Favorites.remove(Image);
            Image.isFavorite = false;
        }

        $scope.UpdateFavoriteToLS();
        $scope.CreateFavoritesLists();
    }

    $scope.InitializeLanguage = function () {
        var lang = localStorage.getItem("language");
        if (lang == undefined) {
            localStorage.removeItem("language");
            localStorage.setItem("language", 1);
            lang = 1;
        }

        $scope.Language = lang;
    }

    $scope.SetFavoritesFromLS = function () {
        var fav = localStorage.getItem("favorites");
        if (fav != undefined) {
            fav = fav.split(',');
            //for (var i = 0; i < fav.length; i++) {
            //    fav[i] = parseInt(fav[i]);
            //}
        }
        else
            fav = [];

        for (var i = 0; i < $scope.CategoryPages.length; i++) {
            if($scope.CategoryPages[i].MainImage != undefined)
                $scope.CheckImageFavorites($scope.CategoryPages[i].MainImage, 1, fav, $scope.CategoryPages[i].pagetitle, $scope.CategoryPages[i].pagetitlefr);

            $scope.CheckGalleriesFavorites($scope.CategoryPages[i].Galleries, 1, fav, $scope.CategoryPages[i].pagetitle, $scope.CategoryPages[i].pagetitlefr);
        }


        for (var i = 0; i < $scope.InspirationPages.length; i++) {
            if ($scope.InspirationPages[i].MainGallery != null) {
                var gallery = $scope.InspirationPages[i].MainGallery;

                for (var k = 0; k < gallery.Images.length; k++) {
                    $scope.CheckImageFavorites(gallery.Images[k], 0, fav, $scope.InspirationPages[i].pagetitle, $scope.InspirationPages[i].pagetitlefr, $scope.InspirationPages[i].uid + "999");
                }
            }

            for (var j = 0; j < $scope.InspirationPages[i].Galleries.length; j++) {
                var gallery = $scope.InspirationPages[i].Galleries[j];

                for (var k = 0; k < gallery.Images.length; k++) {
                    $scope.CheckImageFavorites(gallery.Images[k], 0, fav, $scope.InspirationPages[i].pagetitle, $scope.InspirationPages[i].pagetitlefr, $scope.InspirationPages[i].uid + "999");
                }
            }
        }

        for (var i = 0; i < $scope.StoneSamplesPages.length; i++) {
            $scope.CheckGalleriesFavorites($scope.StoneSamplesPages[i].Galleries, 1, fav, $scope.StoneSamplesPages[i].pagetitle, $scope.StoneSamplesPages[i].pagetitlefr);
        }

        $scope.CreateFavoritesLists();
    }

    $scope.CheckGalleriesFavorites = function (galleries, type, fav, parentName, parentName_fr, groupid) {
        for (var k = 0; k < galleries.length; k++) {
            $scope.CheckGalleryFavorites(galleries[k], type, fav, parentName, parentName_fr, groupid)
        }
    }

    $scope.CheckGalleryFavorites = function (gallery, type, fav, parentName, parentName_fr, groupid) {
        if (gallery.MainImage != undefined && gallery.MainImage != null) {
            if(groupid == undefined)
                $scope.CheckImageFavorites(gallery.MainImage, type, fav, parentName + ' / ' + gallery.title, parentName_fr + ' / ' + gallery.titlefr, gallery.uid);
            else
                $scope.CheckImageFavorites(gallery.MainImage, type, fav, parentName + ' / ' + gallery.title, parentName_fr + ' / ' + gallery.titlefr, groupid);
        }

        var images = gallery.Images;

        for (var j = 0; j < images.length; j++) {
            $scope.CheckImageFavorites(images[j], type, fav, parentName + ' / ' + gallery.title, parentName_fr + ' / ' + gallery.titlefr, groupid);
        }
    }

    $scope.CheckImageFavorites = function (image, type, fav, parentName, parentName_fr, groupid) {

        if (image == undefined)
            alert('as');


        if(image.isFavorite == undefined)
            image.isFavorite = false;
        image.Type = type;
        image.parentName = parentName;
        image.parentNamefr = parentName_fr;

        if (groupid != undefined)
            image.groupid = groupid;
        else
            image.groupid = image.nixgalleryid;

        if (fav.indexOf(image.uid) > -1) {
            if($scope.Favorites.indexOf(image) == -1)
                $scope.Favorites.push(image);

            image.isFavorite = true;
        }
    }

    $scope.CreateFavoritesLists = function () {

        var stonesamplelist = {};
        var categorylist = {};

        for (var i = 0; i < $scope.Favorites.length; i++) {
            var image = $scope.Favorites[i];
            if (image.Type == 0 || image.isdefault == "1") {
                if (categorylist[image.groupid] == undefined) {
                    categorylist[image.groupid] = [];
                }

                categorylist[image.groupid].push(image);
            }
            else {
                if (stonesamplelist[image.groupid] == undefined) {
                    stonesamplelist[image.groupid] = [];
                }

                stonesamplelist[image.groupid].push(image);
            }
        }



        $scope.Favorites_Inspirations = [];
        $scope.Favorites_StoneSamples = [];

        var keys = Object.keys(categorylist);
        for (var i = 0; i < keys.length; i++) {
            var gallery = categorylist[keys[i]];
            $scope.Favorites_Inspirations.push({ name: gallery[0].parentName, namefr: gallery[0].parentNamefr, Images: gallery });
        }

        var keys = Object.keys(stonesamplelist);
        for (var i = 0; i < keys.length; i++) {
            var gallery = stonesamplelist[keys[i]];
            $scope.Favorites_StoneSamples.push({ name: gallery[0].parentName, namefr: gallery[0].parentNamefr, Images: gallery });
        }
    }

    $scope.UpdateFavoriteToLS = function () {
        var ids = "";
        for (var i = 0; i < $scope.Favorites.length; i++) {
            if (i > 0)
                ids = ids + ",";

            ids = ids + $scope.Favorites[i].uid;
        }

        localStorage.removeItem("favorites");
        localStorage.setItem("favorites", ids);
    }

    $scope.AddSampleFavorite = function (sample) {

        var sampleCat = null;

        for (var i = 0; i < $scope.SampleFavorites.length; i++) {
            if ($scope.SampleFavorites[i].Title == sample.Parent.PageTitle) {
                sampleCat = $scope.SampleFavorites[i];
                break;
            }
        }

        if (sampleCat == null) {
            sampleCat = { Title: sample.Parent.PageTitle, Samples: [] };
            $scope.SampleFavorites.push(sampleCat);
        }

        sampleCat.Samples.push(sample);
    }

    $scope.RemoveSampleFavorite = function (sample) {

        var sampleCat = null;

        for (var i = 0; i < $scope.SampleFavorites.length; i++) {
            if ($scope.SampleFavorites[i].Title == sample.Parent.PageTitle) {
                sampleCat = $scope.SampleFavorites[i];
                break;
            }
        }

        if (sampleCat != null) {
            sampleCat.Samples.remove(sample);
            if (sampleCat.Samples.length == 0) {
                $scope.SampleFavorites.remove(sampleCat);
            }
        }
    }

    $scope.IsNotStoneSamplePage = function (item) {
        if (item.PageType == "2" || item.PageType == 2)
            return false;

        return true;
    }

    $scope.SetLanguage = function () {
        var suffix = "";

        if ($scope.Language == 2) {
            suffix = "fr";
            $scope.Strings = stringsFr;
        }
        else
            $scope.Strings = stringsEn;

        for (var i = 0; i < $scope.AboutUsPages.length; i++) {
            $scope.SetNixPageLanguage($scope.AboutUsPages[i], suffix);
        }

        for (var i = 0; i < $scope.CategoryPages.length; i++) {
            $scope.SetNixPageLanguage($scope.CategoryPages[i], suffix);
        }


        for (var i = 0; i < $scope.InspirationPages.length; i++) {
            $scope.SetNixPageLanguage($scope.InspirationPages[i], suffix);
        }


        for (var i = 0; i < $scope.StoneSamplesPages.length; i++) {
            $scope.SetNixPageLanguage($scope.StoneSamplesPages[i], suffix);
        }

    }

    $scope.SetNixPageLanguage = function (nixPage, suffix) {
        nixPage.PageClass = replaceAll(nixPage["pagetitle"], " ", "");

        nixPage.SectionTitle = nixPage["sectiontitle" + suffix];
        nixPage.PageTitle = nixPage["pagetitle" + suffix];
        nixPage.PageContent = nixPage["pagecontent" + suffix];
        nixPage.Title1 = nixPage["title1" + suffix];
        nixPage.Title2 = nixPage["title2" + suffix];
        nixPage.Title3 = nixPage["title3" + suffix];
        nixPage.Title4 = nixPage["title4" + suffix];
        nixPage.Subtitle1 = nixPage["subtitle1" + suffix];
        nixPage.Subtitle2 = nixPage["subtitle2" + suffix];
        nixPage.Subtitle3 = nixPage["subtitle3" + suffix];
        nixPage.Subtitle4 = nixPage["subtitle4" + suffix];
        nixPage.Content1 = nixPage["content1" + suffix];
        nixPage.Content2 = nixPage["content2" + suffix];
        nixPage.Content3 = nixPage["content3" + suffix];
        nixPage.Content4 = nixPage["content4" + suffix];

        nixPage.PageBGImageID = nixPage["pagebgimageid"];
        nixPage.RefID = nixPage["refid"];
        nixPage.ID = nixPage["uid"];
        nixPage.IsDefault = nixPage["isdefault"];
        nixPage.PageType = nixPage["pagetype"];
        nixPage.BGImageID1 = nixPage["bgimageid1"];
        nixPage.BGImageID2 = nixPage["bgimageid2"];
        nixPage.BGImageID3 = nixPage["bgimageid3"];
        nixPage.BGImageID4 = nixPage["bgimageid4"];

        for (var i = 0; i < nixPage.Galleries.length; i++) {
            $scope.SetNixGalleryLanguage(nixPage.Galleries[i], suffix);
        }
    }

    $scope.SetNixGalleryLanguage = function (nixGallery, suffix) {
        nixGallery.Title = nixGallery["title" + suffix];
        nixGallery.PageContent = nixGallery["content" + suffix];
        nixGallery.SizesContent = nixGallery["sizestext" + suffix];

        nixGallery.ParentTitle = nixGallery["parentTitle" + suffix];

        nixGallery.MenuImageID = nixGallery["menuimageid"];

        for (var i = 0; i < nixGallery.Images.length; i++) {
            nixGallery.Images[i].Name = nixGallery.Images[i]["name" + suffix];
            nixGallery.Images[i].ParentName = nixGallery.Images[i]["parentName" + suffix];
        }
    }

    $scope.ChangeLanguage = function (lang) {
        $scope.Language = lang;
        localStorage.removeItem("language");
        localStorage.setItem("language", lang);
        $scope.SetLanguage();
    }

    $scope.ShowStoneSamplePage = function (index) {
        $('#samples_content .slider').slick('slickGoTo', $scope.StoneSamplesPages[index].Counter);
    }
    $scope.phoneFieldDir =  {number: '', name: 'phoneField'};
    $scope.InitializeApp = function () {

        $scope.Favorites = [];

        $scope.Favorites_Inspirations = [];
        $scope.Favorites_StoneSamples = [];

        $scope.Strings = stringsEn;
        $scope.SelectedGallery = [];
        $scope.Language = 1;
        $scope.IsOnline = IsOnline;

        $scope.CategoryPageSlides = [];
        $scope.StoneSamplesSlides = [];

        $scope.AboutUsPages = ShouldiceDataOld.AboutUsPages;
        $scope.CategoryPages = ShouldiceDataOld.CategoryPages;
        $scope.InspirationPages = ShouldiceDataOld.Inspirations;
        $scope.StoneSamplesPages = ShouldiceDataOld.SampleCategories;


        $scope.InitializeCategorySlides();
        $scope.InitializeStoneSamplesSlides();

        $scope.SetFavoritesFromLS();

        $scope.InitializeLanguage();
        $scope.SetLanguage();
    }



    $scope.InitializeApp();
}]);



function CalculateMeasurement(Length, Height) {
    return Length * Height;
}


Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

app.directive('numberOnlyInput', function () {
    return {
        restrict: 'EA',
        template: '<input ng-model="inputValue" type="text" data-role="none" name="{{inputName}}" required autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>',
        scope: {
            inputValue: '=',
            inputName: '='
        },
        link: function (scope) {
            scope.$watch('inputValue', function(newValue,oldValue) {
                var arr = String(newValue).split("");
                if (arr.length === 0) return;
                if (arr.length === 1 && (arr[0] == '+')) return;
                if (isNaN(newValue)) {
                    scope.inputValue = oldValue;
                }
            });
        }
    };
});
