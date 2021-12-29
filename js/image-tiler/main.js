'use strict';

var imageCountLabel;
var imageFiles = [];
// var fit = {
//     x: 0,
//     y: 0,
//     total: 0,
// };
const margin = {
    x: 1,
    y: 1,
};
var pageSize = {
    width: 0,
    height: 0,
};
var imageSize = {
    width: 0,
    height: 0,
};

function getBlobURL(image) {
    var urlCreator = window.URL || window.webkitURL;
    return urlCreator.createObjectURL(image);
}

function newPage() {
    var page = document.createElement('div');
    page.classList.add('page');
    $('.printed').append(page);

    return page;
}

// function updateInfo() {
//     var count = document.getElementsByClassName('image').length;
//     var pages;
//     if (count == 0)
//         pages = 0;
//     else
//         pages = Math.ceil(count / fit.total);

//     imageCountLabel.html(count + ' (' + (count % fit.total) + ' / ' + fit.total + ')' + ' images<br>'
//         + pages + ' pages (' + fit.total + ' per page)<br>'
//         + imageSize.width + 'x' + imageSize.height + 'mm');
// }

function setPageSize(width, height) {
    console.log('Setting page size', width, height);

    pageSize.width = width;
    pageSize.height = height;

    $('.printed').css('width', width + 'mm');
    $('.printed').css('height', height + 'mm');

    // // update fit if the hacky size was
    // if (imageSize.height != 0 && imageSize.width != 0) {
    //     // FIXME: hacky way to update the fit...
    //     setImageSize(imageSize.width, imageSize.height);
    // }
    fit();
}

function parseSize(value) {
    var array;
    try {
        array = JSON.parse('[' + value + ']');
    } catch(e) {
        console.error('Error parsing size "' + value + '"');
        return null;
    }

    return array;
}

function pageSizeSelect(value) {
    var parsed;
    if (value == '0,0') {
        // select custom value
        $('#page-size-select').val('0,0');

        var response = prompt('Enter page size formatted as "width, height" in millimeters:');
        parsed = parseSize(response);

        // TODO: check response

        setPageSize(parsed[0], parsed[1]);
    } else {
        parsed = parseSize(value);

        // TODO: check response

        setPageSize(parsed[0], parsed[1]);
    }

    // updateInfo();
}

function setImageSize(width, height) {
    imageSize.width = width;
    imageSize.height = height;

    // const x = Math.trunc(pageSize.width / (width + margin.x));
    // const y = Math.trunc(pageSize.height / (height + margin.y));

    // fit.x = x;
    // fit.y = y;
    // fit.total = x * y;

    // if (fit.total <= 0)
    //     console.error('Fit total is ' + fit.total + ' which is not meant to happend', imageSize, fit);

    console.log('Setting image size', width, height);

    fit();
}

// rename to selectImageSize
function imageSizeSelect() {
    var response = prompt('Enter image size formatted as "width, height" in millimeters:');
    var parsed = parseSize(response);

    // TODO: check response

    setImageSize(parsed[0], parsed[1]);
    // updateInfo();
}

function orientationButton() {
    setPageSize(pageSize.height, pageSize.width);
}

function fit() {
    if (imageSize.width <= 0 || imageSize.height <= 0) {
        imageSizeSelect();
    }

    var fitX = Math.trunc(pageSize.width / (imageSize.width + margin.x));
    var fitY = Math.trunc(pageSize.height / (imageSize.height + margin.y));

    // total fit
    var fit = fitX * fitY;

    if (fit <= 0)
        console.error('Fit total is ' + fit + ' which is not meant to happend', imageSize, fit);

    console.log('Image fit (X/Y/XY)', fitX, fitY, fit);
    console.log('Fitting ' + imageFiles.length + ' images');

    // remove all the existing pages for printing
    $('.printed').empty();

    var page = newPage();

    for (var i = 0; i < imageFiles.length; i++) {
        var img = document.createElement('img');
        img.classList.add('image');
        img.src = imageFiles[i];
        img.style.width = imageSize.width + 'mm';
        img.style.height = imageSize.height + 'mm';

        // using children to check if the page is full
        if (page.children.length >= fit)
        page = newPage();

        page.appendChild(img);
    }

    var count = document.getElementsByClassName('image').length;
    var pages = document.getElementsByClassName('page').length;

    imageCountLabel.html(count + ' images<br>'
        + pages + ' pages (' + fit + ' per page)<br>'
        + 'Image: ' + imageSize.width + 'x' + imageSize.height + 'mm<br>'
        + 'Page: ' + pageSize.width + 'x' + pageSize.height + 'mm');
}

$(document).ready(function () {
    imageCountLabel = $('#image-counter-label');

    // set the default page size
    pageSizeSelect($('#page-size-select').val());
    // setPageSize(210, 297);

    // setImageSize(40, 55);

    // var row = createNewRow();
    // var rowCount = 1;

    // without this the browser just opens all files as tabs
    $("html").on("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    $('html').on('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const files = e.originalEvent.dataTransfer.files;

        console.log('Adding ' + files.length + ' files', files);

        // NOTE: it may be a bad idea to just save the blobs but ill deal with
        // that later on (hopefully i won't have to heh)
        for (var i = 0; i < files.length; i++)
            imageFiles.push(getBlobURL(files[i]));
            // imageFiles.append(getBlobURL(files[i]));

        // if (imageSize.width <= 0 || imageSize.height <= 0) {
        //     imageSizeSelect();
        // }

        // for (var i = 0; i < files.length; i++) {
        //     var img = document.createElement('img');
        //     img.classList.add('image');
        //     img.src = getBlobURL(files[i]);
        //     img.style.width = imageSize.width + 'mm';
        //     img.style.height = imageSize.height + 'mm';

        //     // add class for styling to the last row
        //     if (rowCount >= fit.y) {
        //         row.classList.add('last-row');
        //         rowCount = 0;
        //     }

        //     // using children to check if the row is full
        //     if (row.children.length >= fit.x) {
        //         row = createNewRow();
        //         rowCount++;
        //     }

        //     row.appendChild(img);
        // }

        // updateInfo();
        fit();
    });
});
