/*
Copyright 2016 Brazil Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
(function () {
  'use strict';

  angular.module('app')
    .factory('ChinachuService', ChinachuService);

  function ChinachuService(
    $q,
    $http,
    CommonService,
    categoryTable
  ) {
    var service = {
      status: {},
      data: {
        archive: {
          channels: [],
          programs: []
        },
        recorded: []
      },
      url: url,
      user: user,
      password: password,
      previewCacheLifetime: previewCacheLifetime,
      getUrl: getUrl,
      request: request,
      requestAll: requestAll,
      requestPreview: requestPreview,
      requestPreviewNow: requestPreviewNow,
      convertCategory: convertCategory,
      channelFromLegacy: channelFromLegacy,
      serviceFromLegacy: serviceFromLegacy
    };
    var props = {
      setting: {
        url: 'http://127.0.0.1:20772',
        user: '',
        password: '',
        previewCacheLifetime: 604800000
      },
      previewStack: [],
      previewProcessing: false,
      previewCache: CommonService.loadLocalStorage('chinachu/previewCache') || []
    };

    loadSetting();
    initPreviewCache();
    return service;

    function saveSetting() {
      CommonService.saveLocalStorage('chinachu', props.setting);
    }

    function loadSetting() {
      angular.extend(props.setting, CommonService.loadLocalStorage('chinachu'));
    }

    function initPreviewCache() {
      var time = Date.now();
      var previewCache = CommonService.loadLocalStorage('chinachuPreviews');
      if (angular.isArray(previewCache) && previewCache.length > 0) {
        props.previewCache = [];
        previewCache.forEach(function (a) {
          if (time - a.time < previewCacheLifetime()) {
            props.previewCache.push(a);
          } else if (angular.isString(a.key)) {
            CommonService.removeFile('previews', a.key);
          }
        });
      }
    }

    function url(value) {
      if (angular.isDefined(value)) {
        props.setting.url = value;
        saveSetting();
      }
      return props.setting.url;
    }

    function user(value) {
      if (angular.isDefined(value)) {
        props.setting.user = value;
        saveSetting();
      }
      return props.setting.user;
    }

    function password(value) {
      if (angular.isDefined(value)) {
        props.setting.password = value;
        saveSetting();
      }
      return props.setting.password;
    }

    function previewCacheLifetime(value) {
      if (!isNaN(value)) {
        props.setting.previewCacheLifetime = parseInt(value, 10);
        saveSetting();
      }
      return props.setting.previewCacheLifetime;
    }

    function getUrl(path) {
      var wuiUrl = url() || 'http://127.0.0.1:20772';
      var auth = [];

      if (!/^https?:\/\//.test(wuiUrl)) {
        wuiUrl = 'http://' + wuiUrl;
      }
      if (user()) {
        auth.push(user());
        if (password()) {
          auth.push(password());
        }
        wuiUrl = wuiUrl.replace(
          /^(https?:\/\/)(.*)$/,
          '$1' + auth.join(':') + '@$2'
        );
      }
      wuiUrl = wuiUrl.replace(/\/$/, '');
      return [wuiUrl, path].join('');
    }

    function request(path, config) {
      var conf = angular.extend({}, config);

      conf.url = getUrl(path);
      conf.cache = angular.isDefined(conf.cache) ? conf.cache : true;
      return $http(conf);
    }

    function requestAll(paths, config) {
      var promises = [];

      paths.forEach(function (path) {
        promises.push(request(path, config));
      });
      return $q.all(promises);
    }

    function requestPreviewNow(id, format, params) {
      var deferred = $q.defer();
      var ext = /jpe?g$/.test(format) ? '.jpg' : '.png';
      var config = {
        params: params,
        responseType: 'blob'
      };
      var cache = loadPreviewCache(id, format, params);
      if (cache) {
        deferred.resolve(cache);
      } else {
        request(['/api/recorded/' + id + '/preview' + ext].join(''), config).then(function (response) {
          var reader = new FileReader();
          if (
            angular.isObject(response) &&
            angular.isObject(response.data) &&
            response.data.size > 0
          ) {
            reader.onload = function () {
              deferred.resolve(reader.result);
              savePreviewCache(id, format, params, reader.result);
              reader = null;
            };
            reader.onerror = function () {
              deferred.reject(reader.error);
              reader = null;
            };
            reader.readAsDataURL(response.data);
          } else {
            deferred.reject(response);
          }
        }, deferred.reject, deferred.notify);
      }
      return deferred.promise;
    }

    function requestPreview(id, format, params) {
      var deferred = $q.defer();
      var cache = loadPreviewCache(id, format, params);
      if (cache) {
        deferred.resolve(cache);
      } else {
        pushPreviewStack(id, format, params, deferred);
      }
      return deferred.promise;
    }

    function processPreviewStack() {
      var options = null;
      if (!props.previewProcessing && props.previewStack.length > 0) {
        props.previewProcessing = true;
        options = props.previewStack.pop();
        requestPreviewNow(options.id, options.format, options.params)
          .then(function (data) {
            props.previewProcessing = false;
            options.deferred.resolve(data);
            processPreviewStack();
          }, function (response) {
            props.previewProcessing = false;
            options.deferred.reject(response);
            processPreviewStack();
          });
      }
    }

    function pushPreviewStack(id, format, params, deferred) {
      props.previewStack.push({
        id: id,
        format: format,
        params: params,
        deferred: deferred
      });
      processPreviewStack();
    }

    function savePreviewCache(id, format, params, dataUrl) {
      var jsonParams = angular.toJson(params);
      var key = Date.now().toString(36);
      props.previewCache.push({
        id: id,
        format: format,
        params: jsonParams,
        time: Date.now(),
        key: key
      });
      if (CommonService.saveFile('previews', key, dataUrl)) {
        CommonService.saveLocalStorage('chinachuPreviews', props.previewCache);
      }
    }

    function loadPreviewCache(id, format, params) {
      var jsonParams = angular.toJson(params);
      var cache = props.previewCache.filter(function (a) {
        return a.id === id && a.format === format && a.params === jsonParams;
      })[0];
      if (cache) {
        return CommonService.loadFile('previews', cache.key);
      }
      return null;
    }

    function convertCategory(category) {
      var matchedCategory = null;
      if (angular.isNumber(category)) {
        matchedCategory = categoryTable[category];
      } else {
        matchedCategory = categoryTable.filter(function (a) {
          return a.name === category || a.localeName === category;
        })[0];
      }
      if (!matchedCategory) {
        matchedCategory = categoryTable[categoryTable.length - 1];
      }
      return matchedCategory;
    }

    function channelFromLegacy(legacy, channels) {
      var channel;

      if (!angular.isObject(legacy)) {
        return {};
      }
      if (angular.isArray(channels)) {
        channel = channels.filter(function (a) {
          return a.type === legacy.type && a.channel === legacy.channel;
        })[0];
      }
      return channel || {
        type: legacy.type,
        channel: legacy.channel,
        name: legacy.name,
        services: [{
          id: legacy.id,
          name: legacy.name,
          serviceId: parseInt(legacy.sid, 10)
        }]
      };
    }

    function serviceFromLegacy(legacy, channels) {
      if (!angular.isObject(legacy)) {
        return {};
      }
      return channelFromLegacy(legacy, channels).services.filter(function (a) {
        return a.serviceId === parseInt(legacy.sid, 10);
      })[0];
    }
  }
}());
