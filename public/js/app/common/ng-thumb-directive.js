angular.module('myApp')
  .directive('ngThumb', ['$window', function($window) {
    var helper = {
      support: !!($window.FileReader && $window.CanvasRenderingContext2D),
      isFile: function(item) {
        return angular.isObject(item) && item instanceof $window.File;
      },
      isImage: function(file) {
        var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      },
      createImage: function(src, onLoad) {
        var img = new Image();
        img.onload = onLoad;
        img.src = src;
      }
    };

    return {
      restrict: 'A',
      template: '<canvas/>',
      link: function(scope, element, attributes) {
        var params = scope.$eval(attributes.ngThumb);

        if (!helper.support) return;
        if (!params.file) return;

        if (params.file.url) {
          helper.createImage(params.file.url, onLoadImage);
        } else {
          if (!helper.isFile(params.file)) return;
          if (!helper.isImage(params.file)) return;

          var reader = new FileReader();
          reader.onload = function(event) {
            helper.createImage(event.target.result, onLoadImage);
          };
          reader.readAsDataURL(params.file);
        }

        var canvas = element.find('canvas');

        function onLoadImage() {
          var width = params.width || this.width / this.height * params.height;
          var height = params.height || this.height / this.width * params.width;
          canvas.attr({ width: width, height: height });
          canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
        }
      }
    };
  }]);