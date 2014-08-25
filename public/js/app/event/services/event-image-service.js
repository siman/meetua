'use strict';

angular.module('myApp')
    .factory('EventImageService', ['FileUploader', 'EventService', 'SharedEventService', '$cookies', '$window',
    'ErrorService',
    function(FileUploader, EventService, SharedEventService, $cookies, $window, ErrorService) {
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
              return self.uploader.queue;
            },
            isUploadedImage: function(item) {
              return item.isUploaded;
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
                SharedEventService.maybeChangeLogo(item, helper.allImages());
                $window.location.reload(); // refresh so user understand that form changes are not kept
              });
            } else {
              self.uploader.removeFromQueue(item);
              SharedEventService.maybeChangeLogo(item, helper.allImages());
            }

            function removeFromEvent(item) {
              self.event.images = _.reject(self.event.images, function(image) {
                return image._id == item._id;
              });
            }
          }

          function createFileUploader() {
            var uploader = new FileUploader({
              url: self.uploadUrl,
              headers: {
                'X-CSRF-TOKEN': $cookies['XSRF-TOKEN']
              },
              queueLimit: self.queueLimit // possible images count
            });
            uploader.filters.push({name: 'onlyImages', fn: function(item /*{File|HTMLInputElement}*/) {
              var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
              type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
              return self.acceptedFormats.indexOf(type) !== -1;
            }});
            uploader.onAfterAddingFile = function(item){
              // first img is logo by default
              if (helper.allImages().length === 1) {
                item.isLogo = true;
              }
            };
            uploader.onErrorItem = function(item, response, status, headers) {
              var msg = 'Не удалось сохранить изображение ' + item.file.name + '. ' + (response.error ? response.error : response);
              console.error(msg);
              ErrorService.alert(msg);
              item.remove(); // from queue
            };
            uploader.onCompleteAll = function submitAfterUpload() {
              console.log('onCompleteAll', uploader.queue);
              var uploadedImages = _.map(uploader.queue, getItemUploadResponse);
              function getItemUploadResponse(item) {
                var uploadResponse = JSON.parse(item._xhr.response);
                return _.extend(uploadResponse, {isLogo: item.isLogo});
              }
              self.onAllUploaded(uploadedImages);
            };

            // add already uploaded images to the queue
            if (uploader.queue.length == 0 && self.event) {
              _.each(self.event.images, function(image) {
                var dummy = new FileUploader.FileItem(uploader, {
                  lastModifiedDate: new Date(),
                  size: 1e6,
                  type: image.type,
                  name: image.originalName,
                  url: image.url
                });

                dummy.progress = 100;
                dummy.isUploaded = true;
                dummy.isSuccess = true;
                dummy.isLogo = image.isLogo;
                dummy._id = image._id;
                uploader.queue.push(dummy);
              });
            }
            return uploader;
          }
        }

        return {
            create : function(params) {
                return new EventImageService(params);
            }
        }
    }]);