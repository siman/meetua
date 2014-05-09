'use strict';

angular.module('myApp')
    .factory('EventImageService', ['$fileUploader', '$cookies', function($fileUploader, $cookies) {
        /**
         *
         * @param {Object} params
         * @param {Scope} params.scope
         * @param {Function} params.onAllUploaded function(uploadedImages)
         * @param {String} [params.uploadUrl]
         * @param {Number} [params.queueLimit]
         * @param {String} [params.acceptedFormats]
         * @constructor
         */
        function EventImageService(params) {
          var self = this;
          self.scope = params.scope;
          self.uploadUrl = params.uploadUrl || '/upload/image';
          self.queueLimit = params.queueLimit || 5;
          self.acceptedFormats = params.acceptedFormats || '|jpg|png|jpeg|bmp|gif|'; // Images only
          self.onAllUploaded = params.onAllUploaded;
          self.uploader = createFileUploader();
          self.removeItem = removeItem;
          self.setAsLogo = setAsLogo;

          function setAsLogo(item) {
            function disableLogo(item) {
              item.isLogo = false;
            }
            _.each(self.uploader.queue, disableLogo);
            item.isLogo = true;
          }

          function removeItem(item){
            self.uploader.removeFromQueue(item);
            // logo is removed
            if (item.isLogo && self.uploader.queue.length > 0) {
              self.uploader.queue[0].isLogo = true; // make first image logo
            }
          }

          function createFileUploader() {
            var uploader = $fileUploader.create({
              scope: self.scope,
              url: self.uploadUrl,
              headers: {
                'X-CSRF-TOKEN': $cookies['XSRF-TOKEN']
              },
              queueLimit: self.queueLimit // possible images count
            });
            uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
              var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
              type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
              return self.acceptedFormats.indexOf(type) !== -1;
            });
            uploader.bind('afteraddingfile', function(e, item){
              // first img is logo by default
              if (uploader.queue.length === 1) {
                item.isLogo = true;
              }
            });
            uploader.bind('completeall', function submitAfterUpload(event, uploadItems, progress) {
              function getItemUploadResponse(item){
                var uploadResponse = JSON.parse(item._xhr.response);
                return _.extend(uploadResponse, {isLogo: item.isLogo});
              }
              var uploadedImages = _.map(uploadItems, getItemUploadResponse);
              self.onAllUploaded(uploadedImages);
            });
            return uploader;
          }
        }

        return {
            create : function(params) {
                return new EventImageService(params);
            }
        }
    }]);