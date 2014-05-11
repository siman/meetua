'use strict';

angular.module('myApp')
    .factory('EventImageService', ['$fileUploader', 'EventService', 'SharedEventService', '$cookies', '$window',
    function($fileUploader, EventService, SharedEventService, $cookies, $window) {
        /**
         *
         * @param {Object} params
         * @param {Scope} params.scope
         * @param {Function} params.onAllUploaded function(uploadedImages)
         * @param {Event} [params.event]
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
          self.event = params.event || {};
          self.uploader = createFileUploader();
          self.removeItem = removeItem;
          self.setAsLogo = setAsLogo;

          var helper = {
            allImages: function() {
              return (self.event.images || []).concat(self.uploader.queue);
            },
            isUploadedImage: function(item) {
              return self.uploader.getIndexOfItem(item) < 0 && item._id;
            }
          };

          function setAsLogo(item) {
            var allImages = helper.allImages();
            if (allImages.length > 1) {
              _.each(allImages, disableLogo);
              item.isLogo = true;
            }

            function disableLogo(item) {
              item.isLogo = false;
            }
          }

          function removeItem(item) {
            if (helper.isUploadedImage(item)) {
              console.log('Removing server image ', item);
              EventService.postRemoveImage({eventId: self.event._id, imageId: item._id}, function() {
                removeFromEvent(item);
                SharedEventService.onRemoved(item, helper.allImages());
                $window.location.reload(); // refresh so user understand that form changes are not kept
              });
            } else {
              self.uploader.removeFromQueue(item);
              SharedEventService.onRemoved(item, helper.allImages());
            }

            function removeFromEvent(item) {
              self.event.images = _.reject(self.event.images, function(image) {
                return image._id == item._id;
              });
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
              if (helper.allImages().length === 1) {
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