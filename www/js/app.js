var tmpUrl = 0;
var HasDownloadFinished = false;
var TotalImagesForDownload = 0;
var TotalDownloadedImages = 0;
var DownloadFailed = false;
var imgsDownload = [];


function CheckData() {
    if (typeof ShouldiceData === 'undefined') {
        HideLoadingScreen();
        return;
    }

    var newData = localStorage.getItem("ShouldiceDataTemp");
    var oldData = localStorage.getItem("ShouldiceData");



    if (newData != oldData) {

        var oldDataParsed = JSON.parse(oldData);
        var newDataParsed = JSON.parse(newData);

        var oldDataImages = GetAllImages(oldDataParsed);
        var newDataImages = GetAllImages(newDataParsed);


        //set images for delete
        var imgsDelete = [];

        var imgFound = false;

        for (var i = 0; i < oldDataImages.length; i++) {
            imgFound = false;

            for (var k = 0; k < newDataImages.length; k++) {
                if (oldDataImages[i] == newDataImages[k]) {
                    imgFound = true;
                    break;
                }
            }

            if (imgFound == false) {
                imgsDelete.push(oldDataImages[i])
            }
        }

        //set images for download
        for (var i = 0; i < newDataImages.length; i++) {
            imgFound = false;

            for (var k = 0; k < oldDataImages.length; k++) {
                if (newDataImages[i] == oldDataImages[k]) {
                    imgFound = true;
                    break;
                }
            }

            if (imgFound == false) {
                imgsDownload.push(newDataImages[i])
            }
        }
        TotalImagesForDownload = imgsDownload.length;

        //delete all images
        DeleteAllImagesFromDevice(imgsDelete);
        //download all images
        DownloadAllImagesFromServer(imgsDownload);

    } else {
        //remove loading screen
        HideLoadingScreen();

        $('#init_app_manually').click();

        InitJqueryScripts();
    }

}


function ShowLoadingScreen() {
    $('#loadingScreen').show();
}
function HideLoadingScreen() {
    InitializeApp();
    $('#loadingScreen').hide();
}

function DeleteAllImagesFromDevice(imgsDelete) {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        dataDir = fileSystem.root.getDirectory("images", { create: true }, function (dir) {
            try {
                for (var i = 0; i < imgsDelete.length; i++) {
                    DeleteFile(dir, imgsDelete[i].Image);
                }
            } catch (error) {
                console.log(error);
                //alert("Catch error getDirectory: " + error);
            }
        });
    }, null);

}
function DownloadAllImagesFromServer(imgsDownload) {
    
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        dataDir = fileSystem.root.getDirectory("images", { create: true }, function (dir) {
            try {
                if (TotalImagesForDownload == 0)
                    HideLoadingScreen();
				// alert('downloading..');
                //for (var i = 0; i < imgsDownload.length; i++) {
                for (var i = 0; i < 10; i++) {
                    DownloadFile(dir);
                }
                //}
            } catch (error) {
                console.log(error);
                //alert("Catch error getDirectory: " + error);
            }
        });
    }, null);

}
var imgdir;
var dwnCounter = 0;
function DownloadFile(dir) {

    if (imgsDownload.length == 0) {
        if (HasDownloadFinished == false) {
            HasDownloadFinished = true;

            HideLoadingScreen();

            $('#init_app_manually').click();

            InitJqueryScripts();

            if (typeof newData !== 'undefined') {
                localStorage.setItem("ShouldiceData", newData);
            }
        }

        return;
    }

    var imgDownload = imgsDownload.pop();

    var uri = encodeURI(DownloadURL + imgDownload.Image);

    var ImagePath = dir.toURL() + imgDownload.Image;

    var fileTransfer = new FileTransfer();

    dir.getFile(imgDownload.Image, { create: false }, function (entry) {
        //console.log("Image exists: " + entry.toURL());
        //if(entry.toURL().indexOf('subnavigation') > -1)
                //console.log("subnavigation image exists:" + entry.toURL());
        dwnCounter++;
		$('#update_percent').click();
        DownloadFile(dir);
    }, function () {
        fileTransfer.download(
                              uri,
                              ImagePath,
                              function (entry) {
                              //if(entry.toURL().indexOf('subnavigation') > -1)
                                //console.log("subnavigation download:" + entry.toURL());
                                  console.log("Download complete" + entry.toURL());
                                  dwnCounter++;
							      $('#update_percent').click();
                                  DownloadFile(dir);

                              },
                              function (error) {
                              //if(entry.toURL().indexOf('subnavigation') > -1)
                                //console.log("subnavigation error:" + entry.toURL());
                                  dwnCounter++;
                                  DownloadFile(dir);
							      $('#update_percent').click();
                                  console.log("download error source " + error.source);
                              },
                              false,
                              {
                                  headers: {
                                      "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                                  }
                              }
                              );
    });
}

function DeleteFile(dir, file) {
    try {
        dir.getFile(file, { create: false }, function (fileDir) {
            fileDir.remove(function (file) {
                console.log("Image removed!");
            }, function () {
                alert("error deleting the file " + error.code);
            });
        });
    }
    catch (error) {
        alert("DeleteFile: " + error);
    }
}


function GetAboutUsImages(data, id, styleName) {
    var imageList = [];

    var suffixes = [];

    switch (styleName) {
        case 'style1':
        case 'style2':
        case 'style7':
            suffixes.push("_about_half_full_height.");
            break;
        case 'style3':
        case 'style6':
        case 'style8':
        case 'style5':
            suffixes.push("_about_top_image.");
            break;
    }

    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].uid == id) {
            for (var j = 0; j < suffixes.length; j++) {
                var curImage = {};
                curImage.Image = data.Images[i].file.replace('.', suffixes[j]);
                curImage.TypeID = ImageTypes.AboutPages;

                imageList.push(curImage);
            }
        }
    }

    return imageList;
}

function GetCategoryImages(data, CurCategory) {
    var imageList = [];

    var suffixes = [];
    
    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].uid == CurCategory.pagebgimageid) {
            var curImage = {};
            curImage.Image = data.Images[i].file.replace('.', '_full_size.');
            curImage.TypeID = ImageTypes.FullSize;

            imageList.push(curImage);

            var curImage = {};
            curImage.Image = data.Images[i].file.replace('.', '_favorite.');
            curImage.TypeID = ImageTypes.Favorite;

            imageList.push(curImage);
        }
    }
    return imageList;
}

function GetCategoryGalleryImages(data, CurGallery) {
    var imageList = [];

    var suffixes = [];
    
    for (var i = 0; i < data.Images.length; i++) {
        if (CurGallery.menuimageid != "0" && CurGallery.menuimageid != null) {
            if (data.Images[i].uid == CurGallery.menuimageid) {
                var curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_subnavigation.');
                curImage.TypeID = ImageTypes.Thumbnail;

                imageList.push(curImage);
            }
        }
    }

    suffixes.push("_full_size.");
    suffixes.push("_favorite.");
    suffixes.push("_sample_category.");

    for (var i = 0; i < CurGallery.Images.length; i++) {
        if (CurGallery.Images[i].isdefault == "1") {
            var curImage = {};
            curImage.Image = CurGallery.Images[i].file.replace('.', '_about_half_full_height.');
            curImage.TypeID = ImageTypes.CategoryPages;

            imageList.push(curImage);
        }
        for (var j = 0; j < suffixes.length; j++) {
            var curImage = {};
            curImage.Image = CurGallery.Images[i].file.replace('.', suffixes[j]);
            if (suffixes[j] == "_full_size.")
                curImage.TypeID = ImageTypes.FullSize;
            else if (suffixes[j] == "_favorite.")
                curImage.TypeID = ImageTypes.Favorite;
            else if (suffixes[j] == "_sample_category.")
                curImage.TypeID = ImageTypes.SampleCategory;

            imageList.push(curImage);
        }
    }

    return imageList;
}

function GetInspirationImages(data, CurInspiration) {
    var imageList = [];

    var suffixes = [];
    var MainGallery = CurInspiration.Galleries[0];
    var counter = 0;
    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].uid == CurInspiration.pagebgimageid) {
            var curImage = {};
            curImage.Image = data.Images[i].file.replace('.', '_subnavigation.');
            curImage.TypeID = ImageTypes.Thumbnail;
            imageList.push(curImage);
        }
        if (MainGallery.Images[0] != undefined) {
            if (data.Images[i].uid == MainGallery.Images[0].uid) {
                var curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_inspiration_1.');
                curImage.TypeID = ImageTypes.InspirationPages;
                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                curImage.TypeID = ImageTypes.FullSize;

                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                curImage.TypeID = ImageTypes.Favorite;

                imageList.push(curImage);
            }
        }
        if (MainGallery.Images[1] != undefined) {
            if (data.Images[i].uid == MainGallery.Images[1].uid) {
                var curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_inspiration_2.');
                curImage.TypeID = ImageTypes.InspirationPages;
                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                curImage.TypeID = ImageTypes.FullSize;

                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                curImage.TypeID = ImageTypes.Favorite;

                imageList.push(curImage);
            }
        }
        if (MainGallery.Images[2] != undefined) {
            if (data.Images[i].uid == MainGallery.Images[2].uid) {
                var curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_inspiration_3.');
                curImage.TypeID = ImageTypes.InspirationPages;
                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                curImage.TypeID = ImageTypes.FullSize;

                imageList.push(curImage);

                curImage = {};
                curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                curImage.TypeID = ImageTypes.Favorite;

                imageList.push(curImage);
            }
        }
    }
    return imageList;
}

function GetInspirationGalleryImages(data, CurGallery) {
    var imageList = [];

    var suffixes = [];
    for (var i = 0; i < data.Images.length; i++) {
        if (CurGallery.layout == '2') {
            if (CurGallery.Images[0] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[0].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_4.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
            if (CurGallery.Images[1] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[1].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_5.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
            if (CurGallery.Images[2] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[2].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_6_bottom_right.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
            if (CurGallery.Images[3] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[3].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_7.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
        }
        else if (CurGallery.layout == '3') {
            if (CurGallery.Images[0] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[0].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_10_big_right.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
            if (CurGallery.Images[1] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[1].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_9_bottom_left.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
            if (CurGallery.Images[2] != undefined) {
                if (data.Images[i].uid == CurGallery.Images[2].uid) {
                    var curImage = {};
                    curImage.TypeID = ImageTypes.InspirationPages;
                    curImage.Image = data.Images[i].file.replace('.', '_inspiration_9_bottom_left.');
                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_full_size.');
                    curImage.TypeID = ImageTypes.FullSize;

                    imageList.push(curImage);

                    curImage = {};
                    curImage.Image = data.Images[i].file.replace('.', '_favorite.');
                    curImage.TypeID = ImageTypes.Favorite;

                    imageList.push(curImage);
                }
            }
        }
    }
    return imageList;
}

function GetSampleCategoryGalleryImages(data, CurGallery) {
    var imageList = [];

    var suffixes = [];

    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].uid == CurGallery.Images[0].uid) {
            var curImage = {};
            curImage.Image = data.Images[i].file.replace('.', '_subnavigation.');
            curImage.TypeID = ImageTypes.Thumbnail;

            imageList.push(curImage);
        }
    }

    suffixes.push("_full_size.");
    suffixes.push("_favorite.");
    suffixes.push("_sample_category.");

    for (var i = 0; i < CurGallery.Images.length; i++) {
        for (var j = 0; j < suffixes.length; j++) {
            var curImage = {};
            curImage.Image = CurGallery.Images[i].file.replace('.', suffixes[j]);
            if (suffixes[j] == "_full_size.")
                curImage.TypeID = ImageTypes.FullSize;
            else if (suffixes[j] == "_favorite.")
                curImage.TypeID = ImageTypes.Favorite;
            else if (suffixes[j] == "_sample_category.")
                curImage.TypeID = ImageTypes.SampleCategory;

            imageList.push(curImage);
        }
    }

    return imageList;
}


function GetAllImages(data) {
    var imageList = [];


    for (var i = 0; i < data.AboutUsPages.length; i++) {
        if (data.AboutUsPages[i].pagebgimageid != "0" && data.AboutUsPages[0].pagebgimageid != null) {
            var tmpImageList = GetAboutUsImages(data, data.AboutUsPages[i].pagebgimageid, data.AboutUsPages[i].StyleName);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;

        }
    }
    for (var i = 0; i < data.CategoryPages.length; i++) {
        var CurCategoryPage = data.CategoryPages[i];
        if (CurCategoryPage.pagebgimageid != "0" && CurCategoryPage.pagebgimageid != null) {
            var tmpImageList = GetCategoryImages(data, CurCategoryPage);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;

        }
        for (var j = 0; j < CurCategoryPage.Galleries.length; j++) {
            var CurGallery = CurCategoryPage.Galleries[j];

            var tmpImageList = GetCategoryGalleryImages(data, CurGallery);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;
        }
    }

    for (var i = 0; i < data.Inspirations.length; i++) {
        var CurInspiration = data.Inspirations[i];
        if (CurInspiration.pagebgimageid != "0" && CurInspiration.pagebgimageid != null) {
            var tmpImageList = GetInspirationImages(data, CurInspiration);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;

        }
        for (var j = 0; j < CurInspiration.Galleries.length; j++) {
            var CurGallery = CurInspiration.Galleries[j];

            var tmpImageList = GetInspirationGalleryImages(data, CurGallery);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;
        }
    }
    for (var i = 0; i < data.SampleCategories.length; i++) {
        var CurSampleCategory = data.SampleCategories[i];
        for (var j = 0; j < CurSampleCategory.Galleries.length; j++) {
            var CurGallery = CurSampleCategory.Galleries[j];

            var tmpImageList = GetSampleCategoryGalleryImages(data, CurGallery);

            var tmpArray = imageList.concat(tmpImageList).unique();

            imageList = tmpArray;
        }
    }

    return imageList;
}
function Images_GetImageByID(data, id) {
    for (var i = 0; i < data.Images.length; i++) {
        if (id == data.Images[i].uid)
            return data.Images[i].file;
    }
    return null;
}
function Page_GetImages(data, id, pageType) {
    var imageList = [];

    var suffixes = [];

			
	switch(pageType)
	{
		case 1:
			suffixes.push("_about_top_image.");
			suffixes.push("_about_half_full_height.");
			suffixes.push("_full_size.");
			break;
		case 2:
			suffixes.push("_subnavigation.");
			break;
		case 3:
			suffixes.push("_full_size.");
			break;
		case 4:
			break;
		default:
			suffixes.push("_full_size.");
			suffixes.push("_favorite.");
			suffixes.push("_about_top_image.");
			suffixes.push("_about_half_full_height.");
			suffixes.push("_catalog_category_level_1.");
			suffixes.push("_main_category_level_2.");
			suffixes.push("_subnavigation.");
	}
	
    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].uid == id) {
            for (var j = 0; j < suffixes.length; j++) {
                imageList.push(data.Images[i].file.replace('.', suffixes[j]));
            }
        }

        imageList.push(data.Images[i].file);
    }

    return imageList;
}
function Galleries_GetImages(data, pagetype) {
    var imageList = [];

    var suffixes = [];

    // suffixes.push("_favorite.");
    // suffixes.push("_full_size.");
    // suffixes.push("_about_top_image.");
    // suffixes.push("_about_half_full_height.");
    // suffixes.push("_subnavigation.");

    switch (parseInt(pagetype)) {
        case 2:
			suffixes.push("_full_size.");
			suffixes.push("_sample_category.");
			suffixes.push("_subnavigation.");
			suffixes.push("_favorite.");
            break;
        case 3:
			suffixes.push("_favorite.");
			suffixes.push("_full_size.");
            suffixes.push("_inspiration_1.");
            suffixes.push("_inspiration_2.");
            suffixes.push("_inspiration_3.");
            suffixes.push("_inspiration_4.");
            suffixes.push("_inspiration_5.");
            suffixes.push("_inspiration_6_bottom_right.");
            suffixes.push("_inspiration_7.");
            suffixes.push("_inspiration_8_top_left.");
            suffixes.push("_inspiration_9_bottom_left.");
            suffixes.push("_inspiration_10_big_right.");
            break;
        case 4:
			suffixes.push("_full_size.");
			suffixes.push("_about_half_full_height.");
			suffixes.push("_favorite.");
			suffixes.push("_sample_category.");
            break;
    }

    for (var i = 0; i < data.Images.length; i++) {
        if (data.Images[i].isdefault) {
            for (var j = 0; j < suffixes.length; j++) {
                imageList.push(data.Images[i].file.replace('.', suffixes[j]));
            }
        }

        imageList.push(data.Images[i].file);
    }

    return imageList;
}
Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

var ImageTypes = {
    AboutPages : 1,
    CategoryPages: 2,
    InspirationPages: 3,
    StoneSamplePages: 4,
    Thumbnail: 5,
    FullSize: 6,
    Favorite: 7,
    SampleCategory: 8
}