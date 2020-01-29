/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.2.0
Copyright © 2018 Basecamp, LLC
 */

(function(){var t=this;(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,r){return e.controller.visit(t,r)},clearCache:function(){return e.controller.clearCache()},setProgressBarDelay:function(t){return e.controller.setProgressBarDelay(t)}}}).call(this)}).call(t);var e=t.Turbolinks;(function(){(function(){var t,r,n,o=[].slice;e.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},e.closest=function(e,r){return t.call(e,r)},t=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),e.defer=function(t){return setTimeout(t,1)},e.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?o.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},e.dispatch=function(t,e){var r,o,i,s,a,u;return a=null!=e?e:{},u=a.target,r=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,r===!0),i.data=null!=o?o:{},i.cancelable&&!n&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},n=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),e.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),e.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){e.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=e.Location.wrap(n).requestURL,this.referrer=e.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return e.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return e.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new e.ProgressBar}var n,o,i;return i=e.HttpRequest,n=i.NETWORK_FAILURE,o=i.TIMEOUT_FAILURE,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case o:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.History=function(){function r(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(t,r){return t=e.Location.wrap(t),this.update("push",t,r)},r.prototype.replace=function(t,r){return t=e.Location.wrap(t),this.update("replace",t,r)},r.prototype.onPopState=function(t){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=t.state)?n.turbolinks:void 0)?(r=e.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(t){return e.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){e.HeadDetails=function(){function t(t){var e,r,n,s,a,u;for(this.elements={},n=0,a=t.length;a>n;n++)u=t[n],u.nodeType===Node.ELEMENT_NODE&&(s=u.outerHTML,r=null!=(e=this.elements)[s]?e[s]:e[s]={type:i(u),tracked:o(u),elements:[]},r.elements.push(u))}var e,r,n,o,i;return t.fromHeadElement=function(t){var e;return new this(null!=(e=null!=t?t.childNodes:void 0)?e:[])},t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},t.prototype.getMetaValue=function(t){var e;return null!=(e=this.findMetaElementByName(t))?e.getAttribute("content"):void 0},t.prototype.findMetaElementByName=function(t){var r,n,o,i;r=void 0,i=this.elements;for(o in i)n=i[o].elements,e(n[0],t)&&(r=n[0]);return r},i=function(t){return r(t)?"script":n(t)?"stylesheet":void 0},o=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},r=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},n=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},e=function(t,e){var r;return r=t.tagName.toLowerCase(),"meta"===r&&t.getAttribute("name")===e},t}()}.call(this),function(){e.Snapshot=function(){function t(t,e){this.headDetails=t,this.bodyElement=e}return t.wrap=function(t){return t instanceof this?t:"string"==typeof t?this.fromHTMLString(t):this.fromHTMLElement(t)},t.fromHTMLString=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromHTMLElement(e)},t.fromHTMLElement=function(t){var r,n,o,i;return o=t.querySelector("head"),r=null!=(i=t.querySelector("body"))?i:document.createElement("body"),n=e.HeadDetails.fromHeadElement(o),new this(n,r)},t.prototype.clone=function(){return new this.constructor(this.headDetails,this.bodyElement.cloneNode(!0))},t.prototype.getRootLocation=function(){var t,r;return r=null!=(t=this.getSetting("root"))?t:"/",new e.Location(r)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.bodyElement.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.getPermanentElements=function(){return this.bodyElement.querySelectorAll("[id][data-turbolinks-permanent]")},t.prototype.getPermanentElementById=function(t){return this.bodyElement.querySelector("#"+t+"[data-turbolinks-permanent]")},t.prototype.getPermanentElementsPresentInSnapshot=function(t){var e,r,n,o,i;for(o=this.getPermanentElements(),i=[],r=0,n=o.length;n>r;r++)e=o[r],t.getPermanentElementById(e.id)&&i.push(e);return i},t.prototype.findFirstAutofocusableElement=function(){return this.bodyElement.querySelector("[autofocus]")},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){return this.headDetails.getMetaValue("turbolinks-"+t)},t}()}.call(this),function(){var t=[].slice;e.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){var t,r,n=function(t,e){function r(){this.constructor=t}for(var n in e)o.call(e,n)&&(t[n]=e[n]);return r.prototype=e.prototype,t.prototype=new r,t.__super__=e.prototype,t},o={}.hasOwnProperty;e.SnapshotRenderer=function(e){function o(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=this.currentSnapshot.headDetails,this.newHeadDetails=this.newSnapshot.headDetails,this.currentBody=this.currentSnapshot.bodyElement,this.newBody=this.newSnapshot.bodyElement}return n(o,e),o.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},o.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},o.prototype.replaceBody=function(){var t;return t=this.relocateCurrentBodyPermanentElements(),this.activateNewBodyScriptElements(),this.assignNewBody(),this.replacePlaceholderElementsWithClonedPermanentElements(t)},o.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},o.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},o.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},o.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},o.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},o.prototype.relocateCurrentBodyPermanentElements=function(){var e,n,o,i,s,a,u;for(a=this.getCurrentBodyPermanentElements(),u=[],e=0,n=a.length;n>e;e++)i=a[e],s=t(i),o=this.newSnapshot.getPermanentElementById(i.id),r(i,s.element),r(o,i),u.push(s);return u},o.prototype.replacePlaceholderElementsWithClonedPermanentElements=function(t){var e,n,o,i,s,a,u;for(u=[],o=0,i=t.length;i>o;o++)a=t[o],n=a.element,s=a.permanentElement,e=s.cloneNode(!0),u.push(r(n,e));return u},o.prototype.activateNewBodyScriptElements=function(){var t,e,n,o,i,s;for(i=this.getNewBodyScriptElements(),s=[],e=0,o=i.length;o>e;e++)n=i[e],t=this.createScriptElement(n),s.push(r(n,t));return s},o.prototype.assignNewBody=function(){return document.body=this.newBody},o.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.newSnapshot.findFirstAutofocusableElement())?t.focus():void 0},o.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},o.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},o.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},o.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},o.prototype.getCurrentBodyPermanentElements=function(){return this.currentSnapshot.getPermanentElementsPresentInSnapshot(this.newSnapshot)},o.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},o}(e.Renderer),t=function(t){var e;return e=document.createElement("meta"),e.setAttribute("name","turbolinks-permanent-placeholder"),e.setAttribute("content",t.id),{element:e,permanentElement:t}},r=function(t,e){var r;return(r=t.parentNode)?r.replaceChild(e,t):void 0}}.call(this),function(){var t=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;e.ErrorRenderer=function(e){function r(t){var e;e=document.createElement("html"),e.innerHTML=t,this.newHead=e.querySelector("head"),this.newBody=e.querySelector("body")}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceHeadAndBody(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceHeadAndBody=function(){var t,e;return e=document.head,t=document.body,e.parentNode.replaceChild(this.newHead,e),t.parentNode.replaceChild(this.newBody,t)},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(e.Renderer)}.call(this),function(){e.View=function(){function t(t){this.delegate=t,this.htmlElement=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return e.Snapshot.fromHTMLElement(this.htmlElement)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.htmlElement.setAttribute("data-turbolinks-preview",""):this.htmlElement.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,r,n){return e.SnapshotRenderer.render(this.delegate,n,this.getSnapshot(),e.Snapshot.wrap(t),r)},t.prototype.renderError=function(t,r){return e.ErrorRenderer.render(this.delegate,r,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=t(this.onScroll,this),this.onScroll=e.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){e.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var r;return t.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},t.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},t.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(t){return e.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=t(this.performScroll,this),this.identifier=e.uuid(),this.location=e.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new e.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(t,r){return this.response=t,null!=r&&(this.redirectedToLocation=e.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return e.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};e.Controller=function(){function r(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new e.History(this),this.view=new e.View(this),this.scrollManager=new e.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return r.prototype.start=function(){return e.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new e.SnapshotCache(10)},r.prototype.visit=function(t,r){var n,o;return null==r&&(r={}),t=e.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(t,n)):window.location=t:void 0},r.prototype.startVisitToLocationWithAction=function(t,r,n){var o;return e.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(t,r,{restorationData:o})):window.location=t},r.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},r.prototype.startHistory=function(){return this.location=e.Location.wrap(window.location),this.restorationIdentifier=e.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,r){return this.restorationIdentifier=r,this.location=e.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=e.Location.wrap(t)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return null!=(e=this.cache.get(t))?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable();
},r.prototype.cacheSnapshot=function(){var t,r;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),r=this.view.getSnapshot(),t=this.lastRenderedLocation,e.defer(function(e){return function(){return e.cache.put(t,r.clone())}}(this))):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,r){return e.dispatch("turbolinks:click",{target:t,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(t){return e.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(t){return e.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return e.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(t){return e.dispatch("turbolinks:before-render",{data:{newBody:t}})},r.prototype.notifyApplicationAfterRender=function(){return e.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),e.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(t,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new e.Visit(this,t,r),u.restorationIdentifier=null!=a?a:e.uuid(),u.restorationData=e.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?e.closest(t,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(t){var r;return r=new e.Location(t.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(t){var r;return(r=e.closest(t,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,r,n;e.start=function(){return r()?(null==e.controller&&(e.controller=t()),e.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=e),n()},t=function(){var t;return t=new e.Controller,t.adapter=new e.BrowserAdapter(t),t},n=function(){return window.Turbolinks===e},n()&&e.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=e:"function"==typeof define&&define.amd&&define(e)}).call(this);
/*!
 * jQuery JavaScript Library v1.12.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */


(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	option: [ 1, "<select multiple='multiple'>", "</select>" ],
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

// Support: IE8-IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;


function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}




// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));
/**
 * @license jCanvas v20.1.2
 * Copyright 2017 Caleb Evans
 * Released under the MIT license
 */

!function(a,b,c){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=function(a,b){return c(a,b)}:c(a,b)}("undefined"!=typeof window?window.jQuery:{},"undefined"!=typeof window?window:this,function(a,b){"use strict";function c(a){var b,c=this;for(b in a)Object.prototype.hasOwnProperty.call(a,b)&&(c[b]=a[b]);return c}function d(){qa(this,d.baseDefaults)}function e(a){return"string"===sa(a)}function f(a){return!isNaN(oa(a))&&!isNaN(pa(a))}function g(a){return a&&a.getContext?a.getContext("2d"):null}function h(a){var b,c;for(b in a)Object.prototype.hasOwnProperty.call(a,b)&&(c=a[b],"string"===sa(c)&&f(c)&&"text"!==b&&(a[b]=pa(c)));void 0!==a.text&&(a.text=String(a.text))}function i(a){return a=qa({},a),a.masks=a.masks.slice(0),a}function j(a,b){var c;a.save(),c=i(b.transforms),b.savedTransforms.push(c)}function k(a,b){0===b.savedTransforms.length?b.transforms=i(Fa):(a.restore(),b.transforms=b.savedTransforms.pop())}function l(a,b,c,d){c[d]&&(ta(c[d])?b[d]=c[d].call(a,c):b[d]=c[d])}function m(a,b,c){l(a,b,c,"fillStyle"),l(a,b,c,"strokeStyle"),b.lineWidth=c.strokeWidth,c.rounded?b.lineCap=b.lineJoin="round":(b.lineCap=c.strokeCap,b.lineJoin=c.strokeJoin,b.miterLimit=c.miterLimit),c.strokeDash||(c.strokeDash=[]),b.setLineDash&&b.setLineDash(c.strokeDash),b.webkitLineDash=c.strokeDash,b.lineDashOffset=b.webkitLineDashOffset=b.mozDashOffset=c.strokeDashOffset,b.shadowOffsetX=c.shadowX,b.shadowOffsetY=c.shadowY,b.shadowBlur=c.shadowBlur,b.shadowColor=c.shadowColor,b.globalAlpha=c.opacity,b.globalCompositeOperation=c.compositing,c.imageSmoothing&&(b.imageSmoothingEnabled=c.imageSmoothingEnabled)}function n(a,b,c){c.mask&&(c.autosave&&j(a,b),a.clip(),b.transforms.masks.push(c._args))}function o(a,b){b._transformed&&a.restore()}function p(a,b,c){var d;c.closed&&b.closePath(),c.shadowStroke&&0!==c.strokeWidth?(b.stroke(),b.fill(),b.shadowColor="transparent",b.shadowBlur=0,b.stroke()):(b.fill(),"transparent"!==c.fillStyle&&(b.shadowColor="transparent"),0!==c.strokeWidth&&b.stroke()),c.closed||b.closePath(),o(b,c),c.mask&&(d=r(a),n(b,d,c))}function q(a,b,c,d,e){c._toRad=c.inDegrees?va/180:1,c._transformed=!0,b.save(),c.fromCenter||c._centered||void 0===d||(void 0===e&&(e=d),c.x+=d/2,c.y+=e/2,c._centered=!0),c.rotate&&R(b,c,null),1===c.scale&&1===c.scaleX&&1===c.scaleY||S(b,c,null),(c.translate||c.translateX||c.translateY)&&T(b,c,null)}function r(b){var c,d=Ea.dataCache;return d._canvas===b&&d._data?c=d._data:(c=a.data(b,"jCanvas"),c||(c={canvas:b,layers:[],layer:{names:{},groups:{}},eventHooks:{},intersecting:[],lastIntersected:null,cursor:a(b).css("cursor"),drag:{layer:null,dragging:!1},event:{type:null,x:null,y:null},events:{},transforms:i(Fa),savedTransforms:[],animating:!1,animated:null,pixelRatio:1,scaled:!1,redrawOnMousemove:!1},a.data(b,"jCanvas",c)),d._canvas=b,d._data=c),c}function s(a,b,c){var d;for(d in Ia.events)Object.prototype.hasOwnProperty.call(Ia.events,d)&&(c[d]||c.cursors&&c.cursors[d])&&u(a,b,c,d);b.events.mouseout||(a.bind("mouseout.jCanvas",function(){var c,d=b.drag.layer;for(d&&(b.drag={},F(a,b,d,"dragcancel")),c=0;c<b.layers.length;c+=1)d=b.layers[c],d._hovered&&a.triggerLayerEvent(b.layers[c],"mouseout");a.drawLayers()}),b.events.mouseout=!0)}function t(a,b,c,d){Ia.events[d](a,b),c._event=!0}function u(a,b,c,d){t(a,b,c,d),"mouseover"!==d&&"mouseout"!==d&&"mousemove"!==d||(b.redrawOnMousemove=!0)}function v(a,b,c){var d,e,f;if(c.draggable||c.cursors){for(d=["mousedown","mousemove","mouseup"],f=0;f<d.length;f+=1)e=d[f],t(a,b,c,e);c._event=!0}}function w(a,b,c,d){var f=b.layer.names;d?void 0!==d.name&&e(c.name)&&c.name!==d.name&&delete f[c.name]:d=c,e(d.name)&&(f[d.name]=c)}function x(a,b,c,d){var e,f,g,h,i,j=b.layer.groups;if(d){if(void 0!==d.groups&&null!==c.groups)for(g=0;g<c.groups.length;g+=1)if(f=c.groups[g],e=j[f]){for(i=0;i<e.length;i+=1)if(e[i]===c){h=i,e.splice(i,1);break}0===e.length&&delete j[f]}}else d=c;if(void 0!==d.groups&&null!==d.groups)for(g=0;g<d.groups.length;g+=1)f=d.groups[g],e=j[f],e||(e=j[f]=[],e.name=f),void 0===h&&(h=e.length),e.splice(h,0,c)}function y(a){var b,c,d,e;for(b=null,c=a.intersecting.length-1;c>=0;c-=1)if(b=a.intersecting[c],b._masks){for(e=b._masks.length-1;e>=0;e-=1)if(d=b._masks[e],!d.intersects){b.intersects=!1;break}if(b.intersects&&!b.intangible)break}return b&&b.intangible&&(b=null),b}function z(a,b,c,d){c&&c.visible&&c._method&&(c._next=d||null,c._method&&c._method.call(a,c))}function A(a,b,c){var d,e,f,g,h,i,j,k,l,m;if(g=b.drag,e=g.layer,h=e&&e.dragGroups||[],d=b.layers,"mousemove"===c||"touchmove"===c){if(g.dragging||(g.dragging=!0,e.dragging=!0,e.bringToFront&&(d.splice(e.index,1),e.index=d.push(e)),e._startX=e.x,e._startY=e.y,e._endX=e._eventX,e._endY=e._eventY,F(a,b,e,"dragstart")),g.dragging)for(l=e._eventX-(e._endX-e._startX),m=e._eventY-(e._endY-e._startY),e.updateDragX&&(l=e.updateDragX.call(a[0],e,l)),e.updateDragY&&(m=e.updateDragY.call(a[0],e,m)),e.dx=l-e.x,e.dy=m-e.y,"y"!==e.restrictDragToAxis&&(e.x=l),"x"!==e.restrictDragToAxis&&(e.y=m),F(a,b,e,"drag"),k=0;k<h.length;k+=1)if(j=h[k],i=b.layer.groups[j],e.groups&&i)for(f=0;f<i.length;f+=1)i[f]!==e&&("y"!==e.restrictDragToAxis&&"y"!==i[f].restrictDragToAxis&&(i[f].x+=e.dx),"x"!==e.restrictDragToAxis&&"x"!==i[f].restrictDragToAxis&&(i[f].y+=e.dy))}else"mouseup"!==c&&"touchend"!==c||(g.dragging&&(e.dragging=!1,g.dragging=!1,b.redrawOnMousemove=b.originalRedrawOnMousemove,F(a,b,e,"dragstop")),b.drag={})}function B(b,c,d){var e;c.cursors&&(e=c.cursors[d]),-1!==a.inArray(e,Ga.cursors)&&(e=Ga.prefix+e),e&&b.css({cursor:e})}function C(a,b){a.css({cursor:b.cursor})}function D(a,b,c,d,e){d[c]&&b._running&&!b._running[c]&&(b._running[c]=!0,d[c].call(a[0],b,e),b._running[c]=!1)}function E(b,c){return!(b.disableEvents||b.intangible&&-1!==a.inArray(c,Ha))}function F(a,b,c,d,e){E(c,d)&&("mouseout"!==d&&B(a,c,d),D(a,c,d,c,e),D(a,c,d,b.eventHooks,e),D(a,c,d,Ia.eventHooks,e))}function G(b,d,f,g){var i,j,k,l=d._layer?f:d;return d._args=f,(d.draggable||d.dragGroups)&&(d.layer=!0,d.draggable=!0),d._method||(g?d._method=g:d.method?d._method=a.fn[d.method]:d.type&&(d._method=a.fn[Da.drawings[d.type]])),d.layer&&!d._layer?(i=a(b),j=r(b),k=j.layers,(null===l.name||e(l.name)&&void 0===j.layer.names[l.name])&&(h(d),l=new c(d),l.canvas=b,l.layer=!0,l._layer=!0,l._running={},null!==l.data?l.data=qa({},l.data):l.data={},null!==l.groups?l.groups=l.groups.slice(0):l.groups=[],w(i,j,l),x(i,j,l),s(i,j,l),v(i,j,l),d._event=l._event,l._method===a.fn.drawText&&i.measureText(l),null===l.index&&(l.index=k.length),k.splice(l.index,0,l),d._args=l,F(i,j,l,"add"))):d.layer||h(d),l}function H(a){var b,c;for(c=0;c<Ga.props.length;c+=1)b=Ga.props[c],a[b]=a["_"+b]}function I(a,b){var c,d;for(d=0;d<Ga.props.length;d+=1)c=Ga.props[d],void 0!==a[c]&&(a["_"+c]=a[c],Ga.propsObj[c]=!0,b&&delete a[c])}function J(a,b,c){var d,e,f,g;for(d in c)if(Object.prototype.hasOwnProperty.call(c,d)&&(e=c[d],ta(e)&&(c[d]=e.call(a,b,d)),"object"===sa(e)&&ua(e))){for(f in e)Object.prototype.hasOwnProperty.call(e,f)&&(g=e[f],void 0!==b[d]&&(b[d+"."+f]=b[d][f],c[d+"."+f]=g));delete c[d]}return c}function K(a){var b;for(b in a)Object.prototype.hasOwnProperty.call(a,b)&&-1!==b.indexOf(".")&&delete a[b]}function L(b){var c,d,e=[],f=1;return"transparent"===b?b="rgba(0, 0, 0, 0)":b.match(/^([a-z]+|#[0-9a-f]+)$/gi)&&(d=ja.head,c=d.style.color,d.style.color=b,b=a.css(d,"color"),d.style.color=c),b.match(/^rgb/gi)&&(e=b.match(/(\d+(\.\d+)?)/gi),b.match(/%/gi)&&(f=2.55),e[0]*=f,e[1]*=f,e[2]*=f,void 0!==e[3]?e[3]=pa(e[3]):e[3]=1),e}function M(a){var b,c=3;for("array"!==sa(a.start)&&(a.start=L(a.start),a.end=L(a.end)),a.now=[],1===a.start[3]&&1===a.end[3]||(c=4),b=0;b<c;b+=1)a.now[b]=a.start[b]+(a.end[b]-a.start[b])*a.pos,b<3&&(a.now[b]=wa(a.now[b]));1!==a.start[3]||1!==a.end[3]?a.now="rgba("+a.now.join(",")+")":(a.now.slice(0,3),a.now="rgb("+a.now.join(",")+")"),a.elem.nodeName?a.elem.style[a.prop]=a.now:a.elem[a.prop]=a.now}function N(a){return Da.touchEvents[a]&&(a=Da.touchEvents[a]),a}function O(a){return Da.mouseEvents[a]&&(a=Da.mouseEvents[a]),a}function P(a){Ia.events[a]=function(b,c){function d(a){g.x=a.offsetX,g.y=a.offsetY,g.type=e,g.event=a,("mousemove"!==a.type||c.redrawOnMousemove||c.drag.dragging)&&b.drawLayers({resetFire:!0}),a.preventDefault()}var e,f,g;g=c.event,e="mouseover"===a||"mouseout"===a?"mousemove":a,f=N(e),c.events[e]||(f!==e?b.bind(e+".jCanvas "+f+".jCanvas",d):b.bind(e+".jCanvas",d),c.events[e]=!0)}}function Q(a,b,c){var d,e,f,g,h,i,j,k;(d=c._args)&&(e=r(a),f=e.event,null!==f.x&&null!==f.y&&(i=f.x*e.pixelRatio,j=f.y*e.pixelRatio,g=b.isPointInPath(i,j)||b.isPointInStroke&&b.isPointInStroke(i,j)),h=e.transforms,d.eventX=f.x,d.eventY=f.y,d.event=f.event,k=e.transforms.rotate,i=d.eventX,j=d.eventY,0!==k?(d._eventX=i*za(-k)-j*ya(-k),d._eventY=j*za(-k)+i*ya(-k)):(d._eventX=i,d._eventY=j),d._eventX/=h.scaleX,d._eventY/=h.scaleY,g&&e.intersecting.push(d),d.intersects=Boolean(g))}function R(a,b,c){b._toRad=b.inDegrees?va/180:1,a.translate(b.x,b.y),a.rotate(b.rotate*b._toRad),a.translate(-b.x,-b.y),c&&(c.rotate+=b.rotate*b._toRad)}function S(a,b,c){1!==b.scale&&(b.scaleX=b.scaleY=b.scale),a.translate(b.x,b.y),a.scale(b.scaleX,b.scaleY),a.translate(-b.x,-b.y),c&&(c.scaleX*=b.scaleX,c.scaleY*=b.scaleY)}function T(a,b,c){b.translate&&(b.translateX=b.translateY=b.translate),a.translate(b.translateX,b.translateY),c&&(c.translateX+=b.translateX,c.translateY+=b.translateY)}function U(a){for(;a<0;)a+=2*va;return a}function V(a,b){return a.x+a.radius*za(b)}function W(a,b){return a.y+a.radius*ya(b)}function X(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o;c===d?(m=0,n=0):(m=c.x,n=c.y),d.inDegrees||360!==d.end||(d.end=2*va),d.start*=c._toRad,d.end*=c._toRad,d.start-=va/2,d.end-=va/2,o=va/180,d.ccw&&(o*=-1),e=V(d,d.start+o),f=W(d,d.start+o),g=V(d,d.start),h=W(d,d.start),Z(a,b,c,d,e,f,g,h),b.arc(d.x+m,d.y+n,d.radius,d.start,d.end,d.ccw),i=V(d,d.end+o),j=W(d,d.end+o),k=V(d,d.end),l=W(d,d.end),$(a,b,c,d,k,l,i,j)}function Y(a,b,c,d,e,f,g,h){var i,j,k,l,m,n,o;d.arrowRadius&&!c.closed&&(o=Aa(h-f,g-e),o-=va,m=c.strokeWidth*za(o),n=c.strokeWidth*ya(o),i=g+d.arrowRadius*za(o+d.arrowAngle/2),j=h+d.arrowRadius*ya(o+d.arrowAngle/2),k=g+d.arrowRadius*za(o-d.arrowAngle/2),l=h+d.arrowRadius*ya(o-d.arrowAngle/2),b.moveTo(i-m,j-n),b.lineTo(g-m,h-n),b.lineTo(k-m,l-n),b.moveTo(g-m,h-n),b.lineTo(g+m,h+n),b.moveTo(g,h))}function Z(a,b,c,d,e,f,g,h){d._arrowAngleConverted||(d.arrowAngle*=c._toRad,d._arrowAngleConverted=!0),d.startArrow&&Y(a,b,c,d,e,f,g,h)}function $(a,b,c,d,e,f,g,h){d._arrowAngleConverted||(d.arrowAngle*=c._toRad,d._arrowAngleConverted=!0),d.endArrow&&Y(a,b,c,d,e,f,g,h)}function _(a,b,c,d){var e,f,g;for(e=2,Z(a,b,c,d,d.x2+c.x,d.y2+c.y,d.x1+c.x,d.y1+c.y),void 0!==d.x1&&void 0!==d.y1&&b.moveTo(d.x1+c.x,d.y1+c.y);;){if(f=d["x"+e],g=d["y"+e],void 0===f||void 0===g)break;b.lineTo(f+c.x,g+c.y),e+=1}e-=1,$(a,b,c,d,d["x"+(e-1)]+c.x,d["y"+(e-1)]+c.y,d["x"+e]+c.x,d["y"+e]+c.y)}function aa(a,b,c,d){var e,f,g,h,i;for(e=2,Z(a,b,c,d,d.cx1+c.x,d.cy1+c.y,d.x1+c.x,d.y1+c.y),void 0!==d.x1&&void 0!==d.y1&&b.moveTo(d.x1+c.x,d.y1+c.y);;){if(f=d["x"+e],g=d["y"+e],h=d["cx"+(e-1)],i=d["cy"+(e-1)],void 0===f||void 0===g||void 0===h||void 0===i)break;b.quadraticCurveTo(h+c.x,i+c.y,f+c.x,g+c.y),e+=1}e-=1,$(a,b,c,d,d["cx"+(e-1)]+c.x,d["cy"+(e-1)]+c.y,d["x"+e]+c.x,d["y"+e]+c.y)}function ba(a,b,c,d){var e,f,g,h,i,j,k,l;for(e=2,f=1,Z(a,b,c,d,d.cx1+c.x,d.cy1+c.y,d.x1+c.x,d.y1+c.y),void 0!==d.x1&&void 0!==d.y1&&b.moveTo(d.x1+c.x,d.y1+c.y);;){if(g=d["x"+e],h=d["y"+e],i=d["cx"+f],j=d["cy"+f],k=d["cx"+(f+1)],l=d["cy"+(f+1)],void 0===g||void 0===h||void 0===i||void 0===j||void 0===k||void 0===l)break;b.bezierCurveTo(i+c.x,j+c.y,k+c.x,l+c.y,g+c.x,h+c.y),e+=1,f+=2}e-=1,f-=2,$(a,b,c,d,d["cx"+(f+1)]+c.x,d["cy"+(f+1)]+c.y,d["x"+e]+c.x,d["y"+e]+c.y)}function ca(a,b,c){return b*=a._toRad,b-=va/2,c*za(b)}function da(a,b,c){return b*=a._toRad,b-=va/2,c*ya(b)}function ea(a,b,c,d){var e,f,g,h,i,j,k,l,m,n,o;for(c===d?(h=0,i=0):(h=c.x,i=c.y),e=1,j=l=n=d.x+h,k=m=o=d.y+i,Z(a,b,c,d,j+ca(c,d.a1,d.l1),k+da(c,d.a1,d.l1),j,k),void 0!==d.x&&void 0!==d.y&&b.moveTo(j,k);;){if(f=d["a"+e],g=d["l"+e],void 0===f||void 0===g)break;l=n,m=o,n+=ca(c,f,g),o+=da(c,f,g),b.lineTo(n,o),e+=1}$(a,b,c,d,l,m,n,o)}function fa(a,b,c){isNaN(oa(c.fontSize))||(c.fontSize+="px"),b.font=c.fontStyle+" "+c.fontSize+" "+c.fontFamily}function ga(b,c,d,e){var f,g,h,i=Ea.propCache;if(i.text===d.text&&i.fontStyle===d.fontStyle&&i.fontSize===d.fontSize&&i.fontFamily===d.fontFamily&&i.maxWidth===d.maxWidth&&i.lineHeight===d.lineHeight)d.width=i.width,d.height=i.height;else{for(d.width=c.measureText(e[0]).width,h=1;h<e.length;h+=1)(g=c.measureText(e[h]).width)>d.width&&(d.width=g);f=b.style.fontSize,b.style.fontSize=d.fontSize,d.height=pa(a.css(b,"fontSize"))*e.length*d.lineHeight,b.style.fontSize=f}}function ha(a,b){var c,d,e,f,g,h,i=String(b.text),j=b.maxWidth,k=i.split("\n"),l=[];for(e=0;e<k.length;e+=1){if(f=k[e],g=f.split(" "),c=[],d="",1===g.length||a.measureText(f).width<j)c=[f];else{for(h=0;h<g.length;h+=1)a.measureText(d+g[h]).width>j&&(""!==d&&c.push(d),d=""),d+=g[h],h!==g.length-1&&(d+=" ");c.push(d)}l=l.concat(c.join("\n").replace(/((\n))|($)/gi,"$2").split("\n"))}return l}var ia,ja=b.document,ka=b.Image,la=b.Array,ma=b.getComputedStyle,na=b.Math,oa=b.Number,pa=b.parseFloat,qa=a.extend,ra=a.inArray,sa=function(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()},ta=a.isFunction,ua=a.isPlainObject,va=na.PI,wa=na.round,xa=na.abs,ya=na.sin,za=na.cos,Aa=na.atan2,Ba=la.prototype.slice,Ca=a.event.fix,Da={},Ea={dataCache:{},propCache:{},imageCache:{}},Fa={rotate:0,scaleX:1,scaleY:1,translateX:0,translateY:0,masks:[]},Ga={},Ha=["mousedown","mousemove","mouseup","mouseover","mouseout","touchstart","touchmove","touchend"],Ia={events:{},eventHooks:{},future:{}};d.baseDefaults={align:"center",arrowAngle:90,arrowRadius:0,autosave:!0,baseline:"middle",bringToFront:!1,ccw:!1,closed:!1,compositing:"source-over",concavity:0,cornerRadius:0,count:1,cropFromCenter:!0,crossOrigin:null,cursors:null,disableEvents:!1,draggable:!1,dragGroups:null,groups:null,data:null,dx:null,dy:null,end:360,eventX:null,eventY:null,fillStyle:"transparent",fontStyle:"normal",fontSize:"12pt",fontFamily:"sans-serif",fromCenter:!0,height:null,imageSmoothing:!0,inDegrees:!0,intangible:!1,index:null,letterSpacing:null,lineHeight:1,layer:!1,mask:!1,maxWidth:null,miterLimit:10,name:null,opacity:1,r1:null,r2:null,radius:0,repeat:"repeat",respectAlign:!1,restrictDragToAxis:null,rotate:0,rounded:!1,scale:1,scaleX:1,scaleY:1,shadowBlur:0,shadowColor:"transparent",shadowStroke:!1,shadowX:0,shadowY:0,sHeight:null,sides:0,source:"",spread:0,start:0,strokeCap:"butt",strokeDash:null,strokeDashOffset:0,strokeJoin:"miter",strokeStyle:"transparent",strokeWidth:1,sWidth:null,sx:null,sy:null,text:"",translate:0,translateX:0,translateY:0,type:null,visible:!0,width:null,x:0,y:0},ia=new d,c.prototype=ia,Ia.extend=function(b){return b.name&&(b.props&&qa(ia,b.props),a.fn[b.name]=function a(d){var e,f,h,i,j=this;for(f=0;f<j.length;f+=1)e=j[f],(h=g(e))&&(i=new c(d),G(e,i,d,a),m(e,h,i),b.fn.call(e,h,i));return j},b.type&&(Da.drawings[b.type]=b.name)),a.fn[b.name]},a.fn.getEventHooks=function(){var a,b,c=this,d={};return 0!==c.length&&(a=c[0],b=r(a),d=b.eventHooks),d},a.fn.setEventHooks=function(a){var b,c,d=this;for(b=0;b<d.length;b+=1)c=r(d[b]),qa(c.eventHooks,a);return d},a.fn.getLayers=function(a){var b,c,d,e,f,g=this,h=[];if(0!==g.length)if(b=g[0],c=r(b),d=c.layers,ta(a))for(f=0;f<d.length;f+=1)e=d[f],a.call(b,e)&&h.push(e);else h=d;return h},a.fn.getLayer=function(a){var b,c,d,f,g,h,i=this;if(0!==i.length)if(b=i[0],c=r(b),d=c.layers,h=sa(a),a&&a.layer)f=a;else if("number"===h)a<0&&(a=d.length+a),f=d[a];else if("regexp"===h){for(g=0;g<d.length;g+=1)if(e(d[g].name)&&d[g].name.match(a)){f=d[g];break}}else f=c.layer.names[a];return f},a.fn.getLayerGroup=function(a){var b,c,d,e,f,g=this,h=sa(a);if(0!==g.length)if(b=g[0],"array"===h)f=a;else if("regexp"===h){c=r(b),d=c.layer.groups;for(e in d)if(e.match(a)){f=d[e];break}}else c=r(b),f=c.layer.groups[a];return f},a.fn.getLayerIndex=function(a){var b=this,c=b.getLayers(),d=b.getLayer(a);return ra(d,c)},a.fn.setLayer=function(b,c){var d,e,g,i,j,k,l,m=this;for(e=0;e<m.length;e+=1)if(d=a(m[e]),g=r(m[e]),i=a(m[e]).getLayer(b)){w(d,g,i,c),x(d,g,i,c),h(c);for(j in c)Object.prototype.hasOwnProperty.call(c,j)&&(k=c[j],l=sa(k),"object"===l&&ua(k)?(i[j]=qa({},k),h(i[j])):"array"===l?i[j]=k.slice(0):"string"===l?0===k.indexOf("+=")?i[j]+=pa(k.substr(2)):0===k.indexOf("-=")?i[j]-=pa(k.substr(2)):!isNaN(k)&&f(k)&&"text"!==j?i[j]=pa(k):i[j]=k:i[j]=k);s(d,g,i),v(d,g,i),!1===a.isEmptyObject(c)&&F(d,g,i,"change",c)}return m},a.fn.setLayers=function(b,c){var d,e,f,g,h=this;for(e=0;e<h.length;e+=1)for(d=a(h[e]),f=d.getLayers(c),g=0;g<f.length;g+=1)d.setLayer(f[g],b);return h},a.fn.setLayerGroup=function(b,c){var d,e,f,g,h=this;for(e=0;e<h.length;e+=1)if(d=a(h[e]),f=d.getLayerGroup(b))for(g=0;g<f.length;g+=1)d.setLayer(f[g],c);return h},a.fn.moveLayer=function(b,c){var d,e,f,g,h,i=this;for(e=0;e<i.length;e+=1)d=a(i[e]),f=r(i[e]),g=f.layers,(h=d.getLayer(b))&&(h.index=ra(h,g),g.splice(h.index,1),g.splice(c,0,h),c<0&&(c=g.length+c),h.index=c,F(d,f,h,"move"));return i},a.fn.removeLayer=function(b){var c,d,e,f,g,h=this;for(d=0;d<h.length;d+=1)c=a(h[d]),e=r(h[d]),f=c.getLayers(),(g=c.getLayer(b))&&(g.index=ra(g,f),f.splice(g.index,1),delete g._layer,w(c,e,g,{name:null}),x(c,e,g,{groups:null}),F(c,e,g,"remove"));return h},a.fn.removeLayers=function(b){var c,d,e,f,g,h,i=this;for(d=0;d<i.length;d+=1){for(c=a(i[d]),e=r(i[d]),f=c.getLayers(b),h=0;h<f.length;h+=1)g=f[h],c.removeLayer(g),h-=1;e.layer.names={},e.layer.groups={}}return i},a.fn.removeLayerGroup=function(b){var c,d,e,f,g=this;if(void 0!==b)for(d=0;d<g.length;d+=1)if(c=a(g[d]),e=c.getLayerGroup(b))for(e=e.slice(0),f=0;f<e.length;f+=1)c.removeLayer(e[f]);return g},a.fn.addLayerToGroup=function(b,c){var d,e,f,g=this,h=[c];for(e=0;e<g.length;e+=1)d=a(g[e]),f=d.getLayer(b),f.groups&&(h=f.groups.slice(0),-1===ra(c,f.groups)&&h.push(c)),d.setLayer(f,{groups:h});return g},a.fn.removeLayerFromGroup=function(b,c){var d,e,f,g,h=this,i=[];for(e=0;e<h.length;e+=1)d=a(h[e]),f=d.getLayer(b),f.groups&&-1!==(g=ra(c,f.groups))&&(i=f.groups.slice(0),i.splice(g,1),d.setLayer(f,{groups:i}));return h},Ga.cursors=["grab","grabbing","zoom-in","zoom-out"],Ga.prefix=function(){var a=ma(ja.documentElement,"");return"-"+(Ba.call(a).join("").match(/-(moz|webkit|ms)-/)||""===a.OLink&&["","o"])[1]+"-"}(),a.fn.triggerLayerEvent=function(b,c){var d,e,f,g=this;for(e=0;e<g.length;e+=1)d=a(g[e]),f=r(g[e]),(b=d.getLayer(b))&&F(d,f,b,c);return g},a.fn.drawLayer=function(b){var c,d,e,f,h=this;for(c=0;c<h.length;c+=1)e=a(h[c]),(d=g(h[c]))&&(f=e.getLayer(b),z(e,d,f));return h},a.fn.drawLayers=function(b){var c,d,e,f,h,j,k,l,m,n,o,p,q,s=this,t=b||{};for(l=t.index,l||(l=0),d=0;d<s.length;d+=1)if(c=a(s[d]),e=g(s[d])){for(n=r(s[d]),!1!==t.clear&&c.clearCanvas(),f=n.layers,k=l;k<f.length;k+=1)if(h=f[k],h.index=k,t.resetFire&&(h._fired=!1),z(c,e,h,k+1),h._masks=n.transforms.masks.slice(0),h._method===a.fn.drawImage&&h.visible){q=!0;break}if(q)break;m=k,h=y(n),o=n.event,p=o.type,n.drag.layer&&A(c,n,p),j=n.lastIntersected,null===j||h===j||!j._hovered||j._fired||n.drag.dragging||(n.lastIntersected=null,j._fired=!0,j._hovered=!1,F(c,n,j,"mouseout"),C(c,n)),h&&(h[p]||(p=O(p)),h._event&&h.intersects&&(n.lastIntersected=h,(h.mouseover||h.mouseout||h.cursors)&&!n.drag.dragging&&(h._hovered||h._fired||(h._fired=!0,h._hovered=!0,F(c,n,h,"mouseover"))),h._fired||(h._fired=!0,o.type=null,F(c,n,h,p)),!h.draggable||h.disableEvents||"mousedown"!==p&&"touchstart"!==p||(n.drag.layer=h,n.originalRedrawOnMousemove=n.redrawOnMousemove,n.redrawOnMousemove=!0))),null!==h||n.drag.dragging||C(c,n),m===f.length&&(n.intersecting.length=0,n.transforms=i(Fa),n.savedTransforms.length=0)}return s},a.fn.addLayer=function(a){var b,d,e=this;for(b=0;b<e.length;b+=1)g(e[b])&&(d=new c(a),d.layer=!0,G(e[b],d,a));return e},Ga.props=["width","height","opacity","lineHeight"],Ga.propsObj={},a.fn.animateLayer=function(){var b,c,d,e,f,h=this,i=Ba.call(arguments,0);for("object"===sa(i[2])?(i.splice(2,0,i[2].duration||null),i.splice(3,0,i[3].easing||null),i.splice(4,0,i[4].complete||null),i.splice(5,0,i[5].step||null)):(void 0===i[2]?(i.splice(2,0,null),i.splice(3,0,null),i.splice(4,0,null)):ta(i[2])&&(i.splice(2,0,null),i.splice(3,0,null)),void 0===i[3]?(i[3]=null,i.splice(4,0,null)):ta(i[3])&&i.splice(3,0,null)),c=0;c<h.length;c+=1)b=a(h[c]),g(h[c])&&(d=r(h[c]),(e=b.getLayer(i[0]))&&e._method!==a.fn.draw&&(f=qa({},i[1]),f=J(h[c],e,f),I(f,!0),I(e),e.style=Ga.propsObj,a(e).animate(f,{duration:i[2],easing:a.easing[i[3]]?i[3]:null,complete:function(a,b,c){return function(){H(c),K(c),b.animating&&b.animated!==c||a.drawLayers(),c._animating=!1,b.animating=!1,b.animated=null,i[4]&&i[4].call(a[0],c),F(a,b,c,"animateend")}}(b,d,e),step:function(a,b,c){return function(d,e){var f,g,h,j=!1;"_"===e.prop[0]&&(j=!0,e.prop=e.prop.replace("_",""),c[e.prop]=c["_"+e.prop]),-1!==e.prop.indexOf(".")&&(f=e.prop.split("."),g=f[0],h=f[1],c[g]&&(c[g][h]=e.now)),c._pos!==e.pos&&(c._pos=e.pos,c._animating||b.animating||(c._animating=!0,b.animating=!0,b.animated=c),b.animating&&b.animated!==c||a.drawLayers()),i[5]&&i[5].call(a[0],d,e,c),F(a,b,c,"animate",e),j&&(e.prop="_"+e.prop)}}(b,d,e)}),F(b,d,e,"animatestart")));return h},a.fn.animateLayerGroup=function(b){var c,d,e,f,g=this,h=Ba.call(arguments,0);for(d=0;d<g.length;d+=1)if(c=a(g[d]),e=c.getLayerGroup(b))for(f=0;f<e.length;f+=1)h[0]=e[f],c.animateLayer.apply(c,h);return g},a.fn.delayLayer=function(b,c){var d,e,f,g,h=this;for(c=c||0,e=0;e<h.length;e+=1)d=a(h[e]),f=r(h[e]),(g=d.getLayer(b))&&(a(g).delay(c),F(d,f,g,"delay"));return h},a.fn.delayLayerGroup=function(b,c){var d,e,f,g,h,i=this;for(c=c||0,e=0;e<i.length;e+=1)if(d=a(i[e]),f=d.getLayerGroup(b))for(h=0;h<f.length;h+=1)g=f[h],d.delayLayer(g,c);return i},a.fn.stopLayer=function(b,c){var d,e,f,g,h=this;for(e=0;e<h.length;e+=1)d=a(h[e]),f=r(h[e]),(g=d.getLayer(b))&&(a(g).stop(c),F(d,f,g,"stop"));return h},a.fn.stopLayerGroup=function(b,c){var d,e,f,g,h,i=this;for(e=0;e<i.length;e+=1)if(d=a(i[e]),f=d.getLayerGroup(b))for(h=0;h<f.length;h+=1)g=f[h],d.stopLayer(g,c);return i},function(b){var c;for(c=0;c<b.length;c+=1)a.fx.step[b[c]]=M}(["color","backgroundColor","borderColor","borderTopColor","borderRightColor","borderBottomColor","borderLeftColor","fillStyle","outlineColor","strokeStyle","shadowColor"]),Da.touchEvents={mousedown:"touchstart",mouseup:"touchend",mousemove:"touchmove"},Da.mouseEvents={touchstart:"mousedown",touchend:"mouseup",touchmove:"mousemove"},function(a){var b;for(b=0;b<a.length;b+=1)P(a[b])}(["click","dblclick","mousedown","mouseup","mousemove","mouseover","mouseout","touchstart","touchmove","touchend","pointerdown","pointermove","pointerup","contextmenu"]),a.event.fix=function(b){var c,d,e;if(b=Ca.call(a.event,b),d=b.originalEvent)if(e=d.changedTouches,void 0!==b.pageX&&void 0===b.offsetX)try{c=a(b.currentTarget).offset(),c&&(b.offsetX=b.pageX-c.left,b.offsetY=b.pageY-c.top)}catch(a){}else if(e)try{c=a(b.currentTarget).offset(),c&&(b.offsetX=e[0].pageX-c.left,b.offsetY=e[0].pageY-c.top)}catch(a){}return b},Da.drawings={arc:"drawArc",bezier:"drawBezier",ellipse:"drawEllipse",function:"draw",image:"drawImage",line:"drawLine",path:"drawPath",polygon:"drawPolygon",slice:"drawSlice",quadratic:"drawQuadratic",rectangle:"drawRect",text:"drawText",vector:"drawVector",save:"saveCanvas",restore:"restoreCanvas",rotate:"rotateCanvas",scale:"scaleCanvas",translate:"translateCanvas"},a.fn.draw=function a(b){var d,e,f=this,h=new c(b);if(Da.drawings[h.type]&&"function"!==h.type)f[Da.drawings[h.type]](b);else for(d=0;d<f.length;d+=1)(e=g(f[d]))&&(h=new c(b),G(f[d],h,b,a),h.visible&&h.fn&&h.fn.call(f[d],e,h));return f},a.fn.clearCanvas=function a(b){var d,e,f=this,h=new c(b);for(d=0;d<f.length;d+=1)(e=g(f[d]))&&(null===h.width||null===h.height?(e.save(),e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,f[d].width,f[d].height),e.restore()):(G(f[d],h,b,a),q(f[d],e,h,h.width,h.height),e.clearRect(h.x-h.width/2,h.y-h.height/2,h.width,h.height),o(e,h)));return f},a.fn.saveCanvas=function a(b){var d,e,f,h,i,k=this;for(d=0;d<k.length;d+=1)if(e=g(k[d]))for(h=r(k[d]),f=new c(b),G(k[d],f,b,a),i=0;i<f.count;i+=1)j(e,h);return k},a.fn.restoreCanvas=function a(b){var d,e,f,h,i,j=this;for(d=0;d<j.length;d+=1)if(e=g(j[d]))for(h=r(j[d]),f=new c(b),G(j[d],f,b,a),i=0;i<f.count;i+=1)k(e,h);return j},a.fn.rotateCanvas=function a(b){var d,e,f,h,i=this;for(d=0;d<i.length;d+=1)(e=g(i[d]))&&(h=r(i[d]),f=new c(b),G(i[d],f,b,a),f.autosave&&j(e,h),R(e,f,h.transforms));return i},a.fn.scaleCanvas=function a(b){var d,e,f,h,i=this;for(d=0;d<i.length;d+=1)(e=g(i[d]))&&(h=r(i[d]),f=new c(b),G(i[d],f,b,a),f.autosave&&j(e,h),S(e,f,h.transforms));return i},a.fn.translateCanvas=function a(b){var d,e,f,h,i=this;for(d=0;d<i.length;d+=1)(e=g(i[d]))&&(h=r(i[d]),f=new c(b),G(i[d],f,b,a),f.autosave&&j(e,h),T(e,f,h.transforms));return i},a.fn.drawRect=function a(b){var d,e,f,h,i,j,k,l,n,o=this;for(d=0;d<o.length;d+=1)(e=g(o[d]))&&(f=new c(b),G(o[d],f,b,a),f.visible&&(q(o[d],e,f,f.width,f.height),m(o[d],e,f),e.beginPath(),f.width&&f.height&&(h=f.x-f.width/2,i=f.y-f.height/2,l=xa(f.cornerRadius),l?(j=f.x+f.width/2,k=f.y+f.height/2,f.width<0&&(n=h,h=j,j=n),f.height<0&&(n=i,i=k,k=n),j-h-2*l<0&&(l=(j-h)/2),k-i-2*l<0&&(l=(k-i)/2),e.moveTo(h+l,i),e.lineTo(j-l,i),e.arc(j-l,i+l,l,3*va/2,2*va,!1),e.lineTo(j,k-l),e.arc(j-l,k-l,l,0,va/2,!1),e.lineTo(h+l,k),e.arc(h+l,k-l,l,va/2,va,!1),e.lineTo(h,i+l),e.arc(h+l,i+l,l,va,3*va/2,!1),f.closed=!0):e.rect(h,i,f.width,f.height)),Q(o[d],e,f),p(o[d],e,f)));return o},a.fn.drawArc=function a(b){var d,e,f,h=this;for(d=0;d<h.length;d+=1)(e=g(h[d]))&&(f=new c(b),G(h[d],f,b,a),f.visible&&(q(h[d],e,f,2*f.radius),m(h[d],e,f),e.beginPath(),X(h[d],e,f,f),Q(h[d],e,f),p(h[d],e,f)));return h},a.fn.drawEllipse=function a(b){var d,e,f,h,i,j=this;for(d=0;d<j.length;d+=1)(e=g(j[d]))&&(f=new c(b),G(j[d],f,b,a),f.visible&&(q(j[d],e,f,f.width,f.height),m(j[d],e,f),h=f.width*(4/3),i=f.height,e.beginPath(),e.moveTo(f.x,f.y-i/2),e.bezierCurveTo(f.x-h/2,f.y-i/2,f.x-h/2,f.y+i/2,f.x,f.y+i/2),e.bezierCurveTo(f.x+h/2,f.y+i/2,f.x+h/2,f.y-i/2,f.x,f.y-i/2),Q(j[d],e,f),f.closed=!0,p(j[d],e,f)));return j},a.fn.drawPolygon=function a(b){var d,e,f,h,i,j,k,l,n,o,r=this;for(d=0;d<r.length;d+=1)if((e=g(r[d]))&&(f=new c(b),G(r[d],f,b,a),f.visible)){for(q(r[d],e,f,2*f.radius),m(r[d],e,f),i=2*va/f.sides,j=i/2,h=j+va/2,k=f.radius*za(j),e.beginPath(),o=0;o<f.sides;o+=1)l=f.x+f.radius*za(h),n=f.y+f.radius*ya(h),e.lineTo(l,n),f.concavity&&(l=f.x+(k+-k*f.concavity)*za(h+j),n=f.y+(k+-k*f.concavity)*ya(h+j),e.lineTo(l,n)),h+=i;Q(r[d],e,f),f.closed=!0,p(r[d],e,f)}return r},a.fn.drawSlice=function a(b){var d,e,f,h,i,j,k=this;for(d=0;d<k.length;d+=1)(e=g(k[d]))&&(f=new c(b),G(k[d],f,b,a),f.visible&&(q(k[d],e,f,2*f.radius),m(k[d],e,f),f.start*=f._toRad,f.end*=f._toRad,f.start-=va/2,f.end-=va/2,f.start=U(f.start),f.end=U(f.end),f.end<f.start&&(f.end+=2*va),h=(f.start+f.end)/2,i=f.radius*f.spread*za(h),j=f.radius*f.spread*ya(h),f.x+=i,f.y+=j,e.beginPath(),e.arc(f.x,f.y,f.radius,f.start,f.end,f.ccw),e.lineTo(f.x,f.y),Q(k[d],e,f),f.closed=!0,p(k[d],e,f)));return k},a.fn.drawLine=function a(b){var d,e,f,h=this;for(d=0;d<h.length;d+=1)(e=g(h[d]))&&(f=new c(b),G(h[d],f,b,a),f.visible&&(q(h[d],e,f),m(h[d],e,f),e.beginPath(),_(h[d],e,f,f),Q(h[d],e,f),p(h[d],e,f)));return h},a.fn.drawQuadratic=function a(b){var d,e,f,h=this;for(d=0;d<h.length;d+=1)(e=g(h[d]))&&(f=new c(b),G(h[d],f,b,a),f.visible&&(q(h[d],e,f),m(h[d],e,f),e.beginPath(),aa(h[d],e,f,f),Q(h[d],e,f),p(h[d],e,f)));return h},a.fn.drawBezier=function a(b){var d,e,f,h=this;for(d=0;d<h.length;d+=1)(e=g(h[d]))&&(f=new c(b),G(h[d],f,b,a),f.visible&&(q(h[d],e,f),m(h[d],e,f),e.beginPath(),ba(h[d],e,f,f),Q(h[d],e,f),p(h[d],e,f)));return h},a.fn.drawVector=function a(b){var d,e,f,h=this;for(d=0;d<h.length;d+=1)(e=g(h[d]))&&(f=new c(b),G(h[d],f,b,a),f.visible&&(q(h[d],e,f),m(h[d],e,f),e.beginPath(),ea(h[d],e,f,f),Q(h[d],e,f),p(h[d],e,f)));return h},a.fn.drawPath=function a(b){var d,e,f,h,i,j=this;for(d=0;d<j.length;d+=1)if((e=g(j[d]))&&(f=new c(b),G(j[d],f,b,a),f.visible)){for(q(j[d],e,f),m(j[d],e,f),e.beginPath(),h=1;;){if(void 0===(i=f["p"+h]))break;i=new c(i),"line"===i.type?_(j[d],e,f,i):"quadratic"===i.type?aa(j[d],e,f,i):"bezier"===i.type?ba(j[d],e,f,i):"vector"===i.type?ea(j[d],e,f,i):"arc"===i.type&&X(j[d],e,f,i),h+=1}Q(j[d],e,f),p(j[d],e,f)}return j},a.fn.drawText=function a(b){var d,e,f,h,i,j,k,l,n,p,r,s,t,u,v=this;for(d=0;d<v.length;d+=1)if((e=g(v[d]))&&(f=new c(b),G(v[d],f,b,a),f.visible)){if(e.textBaseline=f.baseline,e.textAlign=f.align,fa(v[d],e,f),i=null!==f.maxWidth?ha(e,f):f.text.toString().split("\n"),ga(v[d],e,f,i),h&&(h.width=f.width,h.height=f.height),q(v[d],e,f,f.width,f.height),m(v[d],e,f),t=f.x,"left"===f.align?f.respectAlign?f.x+=f.width/2:t-=f.width/2:"right"===f.align&&(f.respectAlign?f.x-=f.width/2:t+=f.width/2),f.radius)for(l=pa(f.fontSize),null===f.letterSpacing&&(f.letterSpacing=l/500),k=0;k<i.length;k+=1){for(e.save(),e.translate(f.x,f.y),j=i[k],f.flipArcText&&(p=j.split(""),p.reverse(),j=p.join("")),n=j.length,e.rotate(-va*f.letterSpacing*(n-1)/2),s=0;s<n;s+=1)r=j[s],0!==s&&e.rotate(va*f.letterSpacing),e.save(),e.translate(0,-f.radius),f.flipArcText&&e.scale(-1,-1),e.fillText(r,0,0),"transparent"!==f.fillStyle&&(e.shadowColor="transparent"),0!==f.strokeWidth&&e.strokeText(r,0,0),e.restore();f.radius-=l,f.letterSpacing+=l/(1e3*va),e.restore()}else for(k=0;k<i.length;k+=1)j=i[k],u=f.y+k*f.height/i.length-(i.length-1)*f.height/i.length/2,e.shadowColor=f.shadowColor,e.fillText(j,t,u),"transparent"!==f.fillStyle&&(e.shadowColor="transparent"),0!==f.strokeWidth&&e.strokeText(j,t,u);u=0,"top"===f.baseline?u+=f.height/2:"bottom"===f.baseline&&(u-=f.height/2),f._event&&(e.beginPath(),e.rect(f.x-f.width/2,f.y-f.height/2+u,f.width,f.height),Q(v[d],e,f),e.closePath()),o(e,f)}return Ea.propCache=f,v},a.fn.measureText=function(a){var b,d,e,f=this;return d=f.getLayer(a),(!d||d&&!d._layer)&&(d=new c(a)),b=g(f[0]),b&&(fa(f[0],b,d),e=ha(b,d),ga(f[0],b,d,e)),d},a.fn.drawImage=function b(d){function e(a,b,c,d,e){null===d.width&&null===d.sWidth&&(d.width=d.sWidth=s.width),null===d.height&&null===d.sHeight&&(d.height=d.sHeight=s.height),e&&(e.width=d.width,e.height=d.height),null!==d.sWidth&&null!==d.sHeight&&null!==d.sx&&null!==d.sy?(null===d.width&&(d.width=d.sWidth),null===d.height&&(d.height=d.sHeight),d.cropFromCenter&&(d.sx+=d.sWidth/2,d.sy+=d.sHeight/2),d.sy-d.sHeight/2<0&&(d.sy=d.sHeight/2),d.sy+d.sHeight/2>s.height&&(d.sy=s.height-d.sHeight/2),d.sx-d.sWidth/2<0&&(d.sx=d.sWidth/2),d.sx+d.sWidth/2>s.width&&(d.sx=s.width-d.sWidth/2),q(a,b,d,d.width,d.height),m(a,b,d),b.drawImage(s,d.sx-d.sWidth/2,d.sy-d.sHeight/2,d.sWidth,d.sHeight,d.x-d.width/2,d.y-d.height/2,d.width,d.height)):(q(a,b,d,d.width,d.height),m(a,b,d),b.drawImage(s,d.x-d.width/2,d.y-d.height/2,d.width,d.height)),b.beginPath(),b.rect(d.x-d.width/2,d.y-d.height/2,d.width,d.height),Q(a,b,d),b.closePath(),o(b,d),n(b,c,d)}function f(b,c,d,f,g){return function(){var h=a(b);e(b,c,d,f,g),f.layer?F(h,d,g,"load"):f.load&&f.load.call(h[0],g),f.layer&&(g._masks=d.transforms.masks.slice(0),f._next&&h.drawLayers({clear:!1,resetFire:!0,index:f._next}))}}var h,i,j,k,l,p,s,t,u,v=this,w=Ea.imageCache;for(i=0;i<v.length;i+=1)h=v[i],(j=g(v[i]))&&(k=r(v[i]),l=new c(d),p=G(v[i],l,d,b),l.visible&&(u=l.source,t=u.getContext,u.src||t?s=u:u&&(w[u]&&w[u].complete?s=w[u]:(s=new ka,u.match(/^data:/i)||(s.crossOrigin=l.crossOrigin),s.src=u,w[u]=s)),s&&(s.complete||t?f(h,j,k,l,p)():(s.onload=f(h,j,k,l,p),s.src=s.src))));return v},a.fn.createPattern=function(b){function d(){j=e.createPattern(h,f.repeat),f.load&&f.load.call(l[0],j)}var e,f,h,i,j,k,l=this;return e=g(l[0]),e?(f=new c(b),k=f.source,ta(k)?(h=a("<canvas />")[0],h.width=f.width,h.height=f.height,i=g(h),
k.call(h,i),d()):(i=k.getContext,k.src||i?h=k:(h=new ka,k.match(/^data:/i)||(h.crossOrigin=f.crossOrigin),h.src=k),h.complete||i?d():(h.onload=d,h.src=h.src))):j=null,j},a.fn.createGradient=function(a){var b,d,e,f,h,i,j,k,l,m,n=this,o=[];if(d=new c(a),b=g(n[0])){for(d.x1=d.x1||0,d.y1=d.y1||0,d.x2=d.x2||0,d.y2=d.y2||0,e=null!==d.r1&&null!==d.r2?b.createRadialGradient(d.x1,d.y1,d.r1,d.x2,d.y2,d.r2):b.createLinearGradient(d.x1,d.y1,d.x2,d.y2),j=1;void 0!==d["c"+j];j+=1)void 0!==d["s"+j]?o.push(d["s"+j]):o.push(null);for(f=o.length,null===o[0]&&(o[0]=0),null===o[f-1]&&(o[f-1]=1),j=0;j<f;j+=1){if(null!==o[j]){for(l=1,m=0,h=o[j],k=j+1;k<f;k+=1){if(null!==o[k]){i=o[k];break}l+=1}h>i&&(o[k]=o[j])}else null===o[j]&&(m+=1,o[j]=h+m*((i-h)/l));e.addColorStop(o[j],d["c"+(j+1)])}}else e=null;return e},a.fn.setPixels=function a(b){var d,e,f,h,i,j,k,l,m,n,o=this;for(e=0;e<o.length;e+=1)if(d=o[e],f=g(d),h=r(o[e]),f&&(i=new c(b),G(d,i,b,a),q(o[e],f,i,i.width,i.height),null!==i.width&&null!==i.height||(i.width=d.width,i.height=d.height,i.x=i.width/2,i.y=i.height/2),0!==i.width&&0!==i.height)){if(k=f.getImageData((i.x-i.width/2)*h.pixelRatio,(i.y-i.height/2)*h.pixelRatio,i.width*h.pixelRatio,i.height*h.pixelRatio),l=k.data,n=l.length,i.each)for(m=0;m<n;m+=4)j={r:l[m],g:l[m+1],b:l[m+2],a:l[m+3]},i.each.call(d,j,i),l[m]=j.r,l[m+1]=j.g,l[m+2]=j.b,l[m+3]=j.a;f.putImageData(k,(i.x-i.width/2)*h.pixelRatio,(i.y-i.height/2)*h.pixelRatio),f.restore()}return o},a.fn.getCanvasImage=function(a,b){var c,d=this,e=null;return 0!==d.length&&(c=d[0],c.toDataURL&&(void 0===b&&(b=1),e=c.toDataURL("image/"+a,b))),e},a.fn.detectPixelRatio=function(a){var c,d,e,f,h,i,j,k,l,m=this;for(d=0;d<m.length;d+=1)c=m[d],e=g(c),l=r(m[d]),l.scaled||(f=b.devicePixelRatio||1,h=e.webkitBackingStorePixelRatio||e.mozBackingStorePixelRatio||e.msBackingStorePixelRatio||e.oBackingStorePixelRatio||e.backingStorePixelRatio||1,i=f/h,1!==i&&(j=c.width,k=c.height,c.width=j*i,c.height=k*i,c.style.width=j+"px",c.style.height=k+"px",e.scale(i,i)),l.pixelRatio=i,l.scaled=!0,a&&a.call(c,i));return m},Ia.clearCache=function(){var a;for(a in Ea)Object.prototype.hasOwnProperty.call(Ea,a)&&(Ea[a]={})},a.support.canvas=void 0!==a("<canvas />")[0].getContext,qa(Ia,{defaults:ia,setGlobalProps:m,transformShape:q,detectEvents:Q,closePath:p,setCanvasFont:fa,measureText:ga}),a.jCanvas=Ia,a.jCanvasObject=c});
/*! UIkit 3.2.3 | http://www.getuikit.com | (c) 2014 - 2019 YOOtheme | MIT License */


!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("uikit",e):(t=t||self).UIkit=e()}(this,function(){"use strict";var t=Object.prototype,n=t.hasOwnProperty;function c(t,e){return n.call(t,e)}var e={},i=/([a-z\d])([A-Z])/g;function d(t){return t in e||(e[t]=t.replace(i,"$1-$2").toLowerCase()),e[t]}var r=/-(\w)/g;function f(t){return t.replace(r,o)}function o(t,e){return e?e.toUpperCase():""}function p(t){return t.length?o(0,t.charAt(0))+t.slice(1):""}var s=String.prototype,a=s.startsWith||function(t){return 0===this.lastIndexOf(t,0)};function w(t,e){return a.call(t,e)}var h=s.endsWith||function(t){return this.substr(-t.length)===t};function u(t,e){return h.call(t,e)}function l(t,e){return~this.indexOf(t,e)}var m=Array.prototype,g=s.includes||l,v=m.includes||l;function b(t,e){return t&&(O(t)?g:v).call(t,e)}var x=m.findIndex||function(t){for(var e=arguments,n=0;n<this.length;n++)if(t.call(e[1],this[n],n,this))return n;return-1};function y(t,e){return x.call(t,e)}var k=Array.isArray;function $(t){return"function"==typeof t}function I(t){return null!==t&&"object"==typeof t}var S=t.toString;function T(t){return"[object Object]"===S.call(t)}function E(t){return I(t)&&t===t.window}function C(t){return I(t)&&9===t.nodeType}function A(t){return I(t)&&!!t.jquery}function _(t){return t instanceof Node||I(t)&&1<=t.nodeType}function N(t){return S.call(t).match(/^\[object (NodeList|HTMLCollection)\]$/)}function M(t){return"boolean"==typeof t}function O(t){return"string"==typeof t}function D(t){return"number"==typeof t}function z(t){return D(t)||O(t)&&!isNaN(t-parseFloat(t))}function B(t){return!(k(t)?t.length:I(t)&&Object.keys(t).length)}function P(t){return void 0===t}function H(t){return M(t)?t:"true"===t||"1"===t||""===t||"false"!==t&&"0"!==t&&t}function L(t){var e=Number(t);return!isNaN(e)&&e}function F(t){return parseFloat(t)||0}function j(t){return _(t)||E(t)||C(t)?t:N(t)||A(t)?t[0]:k(t)?j(t[0]):null}function W(t){return _(t)?[t]:N(t)?m.slice.call(t):k(t)?t.map(j).filter(Boolean):A(t)?t.toArray():[]}function V(t){return k(t)?t:O(t)?t.split(/,(?![^(]*\))/).map(function(t){return z(t)?L(t):H(t.trim())}):[t]}function R(t){return t?u(t,"ms")?F(t):1e3*F(t):0}function Y(t,n){return t===n||I(t)&&I(n)&&Object.keys(t).length===Object.keys(n).length&&K(t,function(t,e){return t===n[e]})}function q(t,e,n){return t.replace(new RegExp(e+"|"+n,"mg"),function(t){return t===e?n:e})}var U=Object.assign||function(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];t=Object(t);for(var i=0;i<e.length;i++){var r=e[i];if(null!==r)for(var o in r)c(r,o)&&(t[o]=r[o])}return t};function X(t){return t[t.length-1]}function K(t,e){for(var n in t)if(!1===e(t[n],n))return!1;return!0}function G(t,r){return t.sort(function(t,e){var n=t[r];void 0===n&&(n=0);var i=e[r];return void 0===i&&(i=0),i<n?1:n<i?-1:0})}function J(t,n){var i=new Set;return t.filter(function(t){var e=t[n];return!i.has(e)&&(i.add(e)||!0)})}function Z(t,e,n){return void 0===e&&(e=0),void 0===n&&(n=1),Math.min(Math.max(L(t)||0,e),n)}function Q(){}function tt(t,e){return t.left<e.right&&t.right>e.left&&t.top<e.bottom&&t.bottom>e.top}function et(t,e){return t.x<=e.right&&t.x>=e.left&&t.y<=e.bottom&&t.y>=e.top}var nt={ratio:function(t,e,n){var i,r="width"===e?"height":"width";return(i={})[r]=t[e]?Math.round(n*t[r]/t[e]):t[r],i[e]=n,i},contain:function(n,i){var r=this;return K(n=U({},n),function(t,e){return n=n[e]>i[e]?r.ratio(n,e,i[e]):n}),n},cover:function(n,i){var r=this;return K(n=this.contain(n,i),function(t,e){return n=n[e]<i[e]?r.ratio(n,e,i[e]):n}),n}};function it(t,e,n){if(I(e))for(var i in e)it(t,i,e[i]);else{if(P(n))return(t=j(t))&&t.getAttribute(e);W(t).forEach(function(t){$(n)&&(n=n.call(t,it(t,e))),null===n?ot(t,e):t.setAttribute(e,n)})}}function rt(t,e){return W(t).some(function(t){return t.hasAttribute(e)})}function ot(t,e){t=W(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.hasAttribute(e)&&t.removeAttribute(e)})})}function st(t,e){for(var n=0,i=[e,"data-"+e];n<i.length;n++)if(rt(t,i[n]))return it(t,i[n])}var at=/msie|trident/i.test(window.navigator.userAgent),ht="rtl"===it(document.documentElement,"dir"),ct="ontouchstart"in window,ut=window.PointerEvent,lt=ct||window.DocumentTouch&&document instanceof DocumentTouch||navigator.maxTouchPoints,dt=ut?"pointerdown":ct?"touchstart":"mousedown",ft=ut?"pointermove":ct?"touchmove":"mousemove",pt=ut?"pointerup":ct?"touchend":"mouseup",mt=ut?"pointerenter":ct?"":"mouseenter",gt=ut?"pointerleave":ct?"":"mouseleave",vt=ut?"pointercancel":"touchcancel";function wt(t,e){return j(t)||yt(t,xt(t,e))}function bt(t,e){var n=W(t);return n.length&&n||kt(t,xt(t,e))}function xt(t,e){return void 0===e&&(e=document),Tt(t)||C(e)?e:e.ownerDocument}function yt(t,e){return j($t(t,e,"querySelector"))}function kt(t,e){return W($t(t,e,"querySelectorAll"))}function $t(t,s,e){if(void 0===s&&(s=document),!t||!O(t))return null;var a;Tt(t=t.replace(St,"$1 *"))&&(a=[],t=function(t){return t.match(Et).map(function(t){return t.replace(/,$/,"").trim()})}(t).map(function(t,e){var n=s;if("!"===t[0]){var i=t.substr(1).trim().split(" ");n=Mt(s.parentNode,i[0]),t=i.slice(1).join(" ").trim()}if("-"===t[0]){var r=t.substr(1).trim().split(" "),o=(n||s).previousElementSibling;n=_t(o,t.substr(1))?o:null,t=r.slice(1).join(" ")}return n?(n.id||(n.id="uk-"+Date.now()+e,a.push(function(){return ot(n,"id")})),"#"+zt(n.id)+" "+t):null}).filter(Boolean).join(","),s=document);try{return s[e](t)}catch(t){return null}finally{a&&a.forEach(function(t){return t()})}}var It=/(^|[^\\],)\s*[!>+~-]/,St=/([!>+~-])(?=\s+[!>+~-]|\s*$)/g;function Tt(t){return O(t)&&t.match(It)}var Et=/.*?[^\\](?:,|$)/g;var Ct=Element.prototype,At=Ct.matches||Ct.webkitMatchesSelector||Ct.msMatchesSelector;function _t(t,e){return W(t).some(function(t){return At.call(t,e)})}var Nt=Ct.closest||function(t){var e=this;do{if(_t(e,t))return e;e=e.parentNode}while(e&&1===e.nodeType)};function Mt(t,e){return w(e,">")&&(e=e.slice(1)),_(t)?Nt.call(t,e):W(t).map(function(t){return Mt(t,e)}).filter(Boolean)}function Ot(t,e){var n=[];for(t=j(t);(t=t.parentNode)&&1===t.nodeType;)_t(t,e)&&n.push(t);return n}var Dt=window.CSS&&CSS.escape||function(t){return t.replace(/([^\x7f-\uFFFF\w-])/g,function(t){return"\\"+t})};function zt(t){return O(t)?Dt.call(null,t):""}var Bt={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,menuitem:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0};function Pt(t){return W(t).some(function(t){return Bt[t.tagName.toLowerCase()]})}function Ht(t){return W(t).some(function(t){return t.offsetWidth||t.offsetHeight||t.getClientRects().length})}var Lt="input,select,textarea,button";function Ft(t){return W(t).some(function(t){return _t(t,Lt)})}function jt(t,e){return W(t).filter(function(t){return _t(t,e)})}function Wt(t,e){return O(e)?_t(t,e)||Mt(t,e):t===e||(C(e)?e.documentElement:j(e)).contains(j(t))}function Vt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=Xt(t),i=n[0],r=n[1],o=n[2],s=n[3],a=n[4];return i=Zt(i),1<s.length&&(s=function(e){return function(t){return k(t.detail)?e.apply(void 0,[t].concat(t.detail)):e(t)}}(s)),a&&a.self&&(s=function(e){return function(t){if(t.target===t.currentTarget||t.target===t.current)return e.call(null,t)}}(s)),o&&(s=function(t,i,r){var o=this;return function(n){t.forEach(function(t){var e=">"===i[0]?kt(i,t).reverse().filter(function(t){return Wt(n.target,t)})[0]:Mt(n.target,i);e&&(n.delegate=t,n.current=e,r.call(o,n))})}}(i,o,s)),a=Kt(a),r.split(" ").forEach(function(e){return i.forEach(function(t){return t.addEventListener(e,s,a)})}),function(){return Rt(i,r,s,a)}}function Rt(t,e,n,i){void 0===i&&(i=!1),i=Kt(i),t=Zt(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.removeEventListener(e,n,i)})})}function Yt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var n=Xt(t),i=n[0],r=n[1],o=n[2],s=n[3],a=n[4],h=n[5],c=Vt(i,r,o,function(t){var e=!h||h(t);e&&(c(),s(t,e))},a);return c}function qt(t,n,i){return Zt(t).reduce(function(t,e){return t&&e.dispatchEvent(Ut(n,!0,!0,i))},!0)}function Ut(t,e,n,i){if(void 0===e&&(e=!0),void 0===n&&(n=!1),O(t)){var r=document.createEvent("CustomEvent");r.initCustomEvent(t,e,n,i),t=r}return t}function Xt(t){return $(t[2])&&t.splice(2,0,!1),t}function Kt(t){return t&&at&&!M(t)?!!t.capture:t}function Gt(t){return t&&"addEventListener"in t}function Jt(t){return Gt(t)?t:j(t)}function Zt(t){return k(t)?t.map(Jt).filter(Boolean):O(t)?kt(t):Gt(t)?[t]:W(t)}function Qt(t){return"touch"===t.pointerType||!!t.touches}function te(t,e){void 0===e&&(e="client");var n=t.touches,i=t.changedTouches,r=n&&n[0]||i&&i[0]||t;return{x:r[e+"X"],y:r[e+"Y"]}}function ee(){var n=this;this.promise=new ne(function(t,e){n.reject=e,n.resolve=t})}var ne="Promise"in window?window.Promise:oe,ie=2,re="setImmediate"in window?setImmediate:setTimeout;function oe(t){this.state=ie,this.value=void 0,this.deferred=[];var e=this;try{t(function(t){e.resolve(t)},function(t){e.reject(t)})}catch(t){e.reject(t)}}oe.reject=function(n){return new oe(function(t,e){e(n)})},oe.resolve=function(n){return new oe(function(t,e){t(n)})},oe.all=function(s){return new oe(function(n,t){var i=[],r=0;function e(e){return function(t){i[e]=t,(r+=1)===s.length&&n(i)}}0===s.length&&n(i);for(var o=0;o<s.length;o+=1)oe.resolve(s[o]).then(e(o),t)})},oe.race=function(i){return new oe(function(t,e){for(var n=0;n<i.length;n+=1)oe.resolve(i[n]).then(t,e)})};var se=oe.prototype;function ae(s,a){return new ne(function(t,e){var n=U({data:null,method:"GET",headers:{},xhr:new XMLHttpRequest,beforeSend:Q,responseType:""},a);n.beforeSend(n);var i=n.xhr;for(var r in n)if(r in i)try{i[r]=n[r]}catch(t){}for(var o in i.open(n.method.toUpperCase(),s),n.headers)i.setRequestHeader(o,n.headers[o]);Vt(i,"load",function(){0===i.status||200<=i.status&&i.status<300||304===i.status?t(i):e(U(Error(i.statusText),{xhr:i,status:i.status}))}),Vt(i,"error",function(){return e(U(Error("Network Error"),{xhr:i}))}),Vt(i,"timeout",function(){return e(U(Error("Network Timeout"),{xhr:i}))}),i.send(n.data)})}function he(i,r,o){return new ne(function(t,e){var n=new Image;n.onerror=e,n.onload=function(){return t(n)},o&&(n.sizes=o),r&&(n.srcset=r),n.src=i})}function ce(t){if("loading"===document.readyState)var e=Vt(document,"DOMContentLoaded",function(){e(),t()});else t()}function ue(t,e){return e?W(t).indexOf(j(e)):W((t=j(t))&&t.parentNode.children).indexOf(t)}function le(t,e,n,i){void 0===n&&(n=0),void 0===i&&(i=!1);var r=(e=W(e)).length;return t=z(t)?L(t):"next"===t?n+1:"previous"===t?n-1:ue(e,t),i?Z(t,0,r-1):(t%=r)<0?t+r:t}function de(t){return(t=Te(t)).innerHTML="",t}function fe(t,e){return t=Te(t),P(e)?t.innerHTML:pe(t.hasChildNodes()?de(t):t,e)}function pe(e,t){return e=Te(e),ve(t,function(t){return e.appendChild(t)})}function me(e,t){return e=Te(e),ve(t,function(t){return e.parentNode.insertBefore(t,e)})}function ge(e,t){return e=Te(e),ve(t,function(t){return e.nextSibling?me(e.nextSibling,t):pe(e.parentNode,t)})}function ve(t,e){return(t=O(t)?Ie(t):t)?"length"in t?W(t).map(e):e(t):null}function we(t){W(t).map(function(t){return t.parentNode&&t.parentNode.removeChild(t)})}function be(t,e){for(e=j(me(t,e));e.firstChild;)e=e.firstChild;return pe(e,t),e}function xe(t,e){return W(W(t).map(function(t){return t.hasChildNodes?be(W(t.childNodes),e):pe(t,e)}))}function ye(t){W(t).map(function(t){return t.parentNode}).filter(function(t,e,n){return n.indexOf(t)===e}).forEach(function(t){me(t,t.childNodes),we(t)})}se.resolve=function(t){var e=this;if(e.state===ie){if(t===e)throw new TypeError("Promise settled with itself.");var n=!1;try{var i=t&&t.then;if(null!==t&&I(t)&&$(i))return void i.call(t,function(t){n||e.resolve(t),n=!0},function(t){n||e.reject(t),n=!0})}catch(t){return void(n||e.reject(t))}e.state=0,e.value=t,e.notify()}},se.reject=function(t){var e=this;if(e.state===ie){if(t===e)throw new TypeError("Promise settled with itself.");e.state=1,e.value=t,e.notify()}},se.notify=function(){var o=this;re(function(){if(o.state!==ie)for(;o.deferred.length;){var t=o.deferred.shift(),e=t[0],n=t[1],i=t[2],r=t[3];try{0===o.state?$(e)?i(e.call(void 0,o.value)):i(o.value):1===o.state&&($(n)?i(n.call(void 0,o.value)):r(o.value))}catch(t){r(t)}}})},se.then=function(n,i){var r=this;return new oe(function(t,e){r.deferred.push([n,i,t,e]),r.notify()})},se.catch=function(t){return this.then(void 0,t)};var ke=/^\s*<(\w+|!)[^>]*>/,$e=/^<(\w+)\s*\/?>(?:<\/\1>)?$/;function Ie(t){var e=$e.exec(t);if(e)return document.createElement(e[1]);var n=document.createElement("div");return ke.test(t)?n.insertAdjacentHTML("beforeend",t.trim()):n.textContent=t,1<n.childNodes.length?W(n.childNodes):n.firstChild}function Se(t,e){if(t&&1===t.nodeType)for(e(t),t=t.firstElementChild;t;)Se(t,e),t=t.nextElementSibling}function Te(t,e){return O(t)?Ce(t)?j(Ie(t)):yt(t,e):j(t)}function Ee(t,e){return O(t)?Ce(t)?W(Ie(t)):kt(t,e):W(t)}function Ce(t){return"<"===t[0]||t.match(/^\s*</)}function Ae(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];ze(t,e,"add")}function _e(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];ze(t,e,"remove")}function Ne(t,e){it(t,"class",function(t){return(t||"").replace(new RegExp("\\b"+e+"\\b","g"),"")})}function Me(t){for(var e=[],n=arguments.length-1;0<n--;)e[n]=arguments[n+1];e[0]&&_e(t,e[0]),e[1]&&Ae(t,e[1])}function Oe(t,e){return e&&W(t).some(function(t){return t.classList.contains(e.split(" ")[0])})}function De(t){for(var i=[],e=arguments.length-1;0<e--;)i[e]=arguments[e+1];if(i.length){var r=O(X(i=Be(i)))?[]:i.pop();i=i.filter(Boolean),W(t).forEach(function(t){for(var e=t.classList,n=0;n<i.length;n++)Pe.Force?e.toggle.apply(e,[i[n]].concat(r)):e[(P(r)?!e.contains(i[n]):r)?"add":"remove"](i[n])})}}function ze(t,n,i){(n=Be(n).filter(Boolean)).length&&W(t).forEach(function(t){var e=t.classList;Pe.Multiple?e[i].apply(e,n):n.forEach(function(t){return e[i](t)})})}function Be(t){return t.reduce(function(t,e){return t.concat.call(t,O(e)&&b(e," ")?e.trim().split(" "):e)},[])}var Pe={get Multiple(){return this.get("_multiple")},get Force(){return this.get("_force")},get:function(t){if(!c(this,t)){var e=document.createElement("_").classList;e.add("a","b"),e.toggle("c",!1),this._multiple=e.contains("b"),this._force=!e.contains("c")}return this[t]}},He={"animation-iteration-count":!0,"column-count":!0,"fill-opacity":!0,"flex-grow":!0,"flex-shrink":!0,"font-weight":!0,"line-height":!0,opacity:!0,order:!0,orphans:!0,"stroke-dasharray":!0,"stroke-dashoffset":!0,widows:!0,"z-index":!0,zoom:!0};function Le(t,e,r){return W(t).map(function(n){if(O(e)){if(e=Ye(e),P(r))return je(n,e);r||D(r)?n.style[e]=z(r)&&!He[e]?r+"px":r:n.style.removeProperty(e)}else{if(k(e)){var i=Fe(n);return e.reduce(function(t,e){return t[e]=i[Ye(e)],t},{})}I(e)&&K(e,function(t,e){return Le(n,e,t)})}return n})[0]}function Fe(t,e){return(t=j(t)).ownerDocument.defaultView.getComputedStyle(t,e)}function je(t,e,n){return Fe(t,n)[e]}var We={};function Ve(t){var e=document.documentElement;if(!at)return Fe(e).getPropertyValue("--uk-"+t);if(!(t in We)){var n=pe(e,document.createElement("div"));Ae(n,"uk-"+t),We[t]=je(n,"content",":before").replace(/^["'](.*)["']$/,"$1"),we(n)}return We[t]}var Re={};function Ye(t){var e=Re[t];return e=e||(Re[t]=function(t){t=d(t);var e=document.documentElement.style;if(t in e)return t;var n,i=qe.length;for(;i--;)if((n="-"+qe[i]+"-"+t)in e)return n}(t)||t)}var qe=["webkit","moz","ms"];function Ue(t,s,a,h){return void 0===a&&(a=400),void 0===h&&(h="linear"),ne.all(W(t).map(function(o){return new ne(function(n,i){for(var t in s){var e=Le(o,t);""===e&&Le(o,t,e)}var r=setTimeout(function(){return qt(o,"transitionend")},a);Yt(o,"transitionend transitioncanceled",function(t){var e=t.type;clearTimeout(r),_e(o,"uk-transition"),Le(o,{"transition-property":"","transition-duration":"","transition-timing-function":""}),"transitioncanceled"===e?i():n()},{self:!0}),Ae(o,"uk-transition"),Le(o,U({"transition-property":Object.keys(s).map(Ye).join(","),"transition-duration":a+"ms","transition-timing-function":h},s))})}))}var Xe={start:Ue,stop:function(t){return qt(t,"transitionend"),ne.resolve()},cancel:function(t){qt(t,"transitioncanceled")},inProgress:function(t){return Oe(t,"uk-transition")}},Ke="uk-animation-",Ge="uk-cancel-animation";function Je(t,e,n,a,h){var c=arguments;return void 0===n&&(n=200),ne.all(W(t).map(function(s){return new ne(function(i,r){if(Oe(s,Ge))requestAnimationFrame(function(){return ne.resolve().then(function(){return Je.apply(void 0,c).then(i,r)})});else{var t=e+" "+Ke+(h?"leave":"enter");w(e,Ke)&&(a&&(t+=" uk-transform-origin-"+a),h&&(t+=" "+Ke+"reverse")),o(),Yt(s,"animationend animationcancel",function(t){var e=t.type,n=!1;"animationcancel"===e?(r(),o()):(i(),ne.resolve().then(function(){n=!0,o()})),requestAnimationFrame(function(){n||(Ae(s,Ge),requestAnimationFrame(function(){return _e(s,Ge)}))})},{self:!0}),Le(s,"animationDuration",n+"ms"),Ae(s,t)}function o(){Le(s,"animationDuration",""),Ne(s,Ke+"\\S*")}})}))}var Ze=new RegExp(Ke+"(enter|leave)"),Qe={in:function(t,e,n,i){return Je(t,e,n,i,!1)},out:function(t,e,n,i){return Je(t,e,n,i,!0)},inProgress:function(t){return Ze.test(it(t,"class"))},cancel:function(t){qt(t,"animationcancel")}},tn={width:["x","left","right"],height:["y","top","bottom"]};function en(t,e,u,l,d,n,i,r){u=ln(u),l=ln(l);var f={element:u,target:l};if(!t||!e)return f;var p=rn(t),m=rn(e),g=m;if(un(g,u,p,-1),un(g,l,m,1),d=dn(d,p.width,p.height),n=dn(n,m.width,m.height),d.x+=n.x,d.y+=n.y,g.left+=d.x,g.top+=d.y,i){var o=[rn(xn(t))];r&&o.unshift(rn(r)),K(tn,function(t,s){var a=t[0],h=t[1],c=t[2];!0!==i&&!b(i,a)||o.some(function(i){var t=u[a]===h?-p[s]:u[a]===c?p[s]:0,e=l[a]===h?m[s]:l[a]===c?-m[s]:0;if(g[h]<i[h]||g[h]+p[s]>i[c]){var n=p[s]/2,r="center"===l[a]?-m[s]/2:0;return"center"===u[a]&&(o(n,r)||o(-n,-r))||o(t,e)}function o(e,t){var n=g[h]+e+t-2*d[a];if(n>=i[h]&&n+p[s]<=i[c])return g[h]=n,["element","target"].forEach(function(t){f[t][a]=e?f[t][a]===tn[s][1]?tn[s][2]:tn[s][1]:f[t][a]}),!0}})})}return nn(t,g),f}function nn(n,i){if(n=j(n),!i)return rn(n);var r=nn(n),o=Le(n,"position");["left","top"].forEach(function(t){if(t in i){var e=Le(n,t);Le(n,t,i[t]-r[t]+F("absolute"===o&&"auto"===e?on(n)[t]:e))}})}function rn(t){if(!(t=j(t)))return{};var e,n,i=xn(t),r=i.pageYOffset,o=i.pageXOffset;if(E(t)){var s=t.innerHeight,a=t.innerWidth;return{top:r,left:o,height:s,width:a,bottom:r+s,right:o+a}}Ht(t)||"none"!==Le(t,"display")||(e=it(t,"style"),n=it(t,"hidden"),it(t,{style:(e||"")+";display:block !important;",hidden:null}));var h=t.getBoundingClientRect();return P(e)||it(t,{style:e,hidden:n}),{height:h.height,width:h.width,top:h.top+r,left:h.left+o,bottom:h.bottom+r,right:h.right+o}}function on(i){var r=(i=j(i)).offsetParent||function(t){return yn(t).documentElement}(i),o=nn(r),t=["top","left"].reduce(function(t,e){var n=p(e);return t[e]-=o[e]+F(Le(i,"margin"+n))+F(Le(r,"border"+n+"Width")),t},nn(i));return{top:t.top,left:t.left}}var sn=hn("height"),an=hn("width");function hn(i){var r=p(i);return function(t,e){if(t=j(t),P(e)){if(E(t))return t["inner"+r];if(C(t)){var n=t.documentElement;return Math.max(n["offset"+r],n["scroll"+r])}return(e="auto"===(e=Le(t,i))?t["offset"+r]:F(e)||0)-cn(i,t)}Le(t,i,e||0===e?+e+cn(i,t)+"px":"")}}function cn(t,n,e){return void 0===e&&(e="border-box"),Le(n,"boxSizing")===e?tn[t].slice(1).map(p).reduce(function(t,e){return t+F(Le(n,"padding"+e))+F(Le(n,"border"+e+"Width"))},0):0}function un(o,s,a,h){K(tn,function(t,e){var n=t[0],i=t[1],r=t[2];s[n]===r?o[i]+=a[e]*h:"center"===s[n]&&(o[i]+=a[e]*h/2)})}function ln(t){var e=/left|center|right/,n=/top|center|bottom/;return 1===(t=(t||"").split(" ")).length&&(t=e.test(t[0])?t.concat(["center"]):n.test(t[0])?["center"].concat(t):["center","center"]),{x:e.test(t[0])?t[0]:"center",y:n.test(t[1])?t[1]:"center"}}function dn(t,e,n){var i=(t||"").split(" "),r=i[0],o=i[1];return{x:r?F(r)*(u(r,"%")?e/100:1):0,y:o?F(o)*(u(o,"%")?n/100:1):0}}function fn(t){switch(t){case"left":return"right";case"right":return"left";case"top":return"bottom";case"bottom":return"top";default:return t}}function pn(t,e,n){if(void 0===e&&(e=0),void 0===n&&(n=0),!Ht(t))return!1;var i=xn(t=j(t)),r=t.getBoundingClientRect(),o={top:-e,left:-n,bottom:e+sn(i),right:n+an(i)};return tt(r,o)||et({x:r.left,y:r.top},o)}function mn(t,e){if(void 0===e&&(e=0),!Ht(t))return 0;var n=xn(t=j(t)),i=yn(t),r=t.offsetHeight+e,o=vn(t)[0],s=sn(n),a=s+Math.min(0,o-s),h=Math.max(0,s-(sn(i)+e-(o+r)));return Z((a+n.pageYOffset-o)/((a+(r-(h<s?h:0)))/100)/100)}function gn(t,e){if(E(t=j(t))||C(t)){var n=xn(t);(0,n.scrollTo)(n.pageXOffset,e)}else t.scrollTop=e}function vn(t){var e=[0,0];do{if(e[0]+=t.offsetTop,e[1]+=t.offsetLeft,"fixed"===Le(t,"position")){var n=xn(t);return e[0]+=n.pageYOffset,e[1]+=n.pageXOffset,e}}while(t=t.offsetParent);return e}function wn(t,e,n){return void 0===e&&(e="width"),void 0===n&&(n=window),z(t)?+t:u(t,"vh")?bn(sn(xn(n)),t):u(t,"vw")?bn(an(xn(n)),t):u(t,"%")?bn(rn(n)[e],t):F(t)}function bn(t,e){return t*F(e)/100}function xn(t){return E(t)?t:yn(t).defaultView}function yn(t){return j(t).ownerDocument}var kn={reads:[],writes:[],read:function(t){return this.reads.push(t),Sn(),t},write:function(t){return this.writes.push(t),Sn(),t},clear:function(t){return En(this.reads,t)||En(this.writes,t)},flush:$n};function $n(t){void 0===t&&(t=1),Tn(kn.reads),Tn(kn.writes.splice(0,kn.writes.length)),kn.scheduled=!1,(kn.reads.length||kn.writes.length)&&Sn(t+1)}var In=5;function Sn(t){if(!kn.scheduled){if(kn.scheduled=!0,In<t)throw new Error("Maximum recursion limit reached.");t?ne.resolve().then(function(){return $n(t)}):requestAnimationFrame(function(){return $n()})}}function Tn(t){for(var e;e=t.shift();)e()}function En(t,e){var n=t.indexOf(e);return!!~n&&!!t.splice(n,1)}function Cn(){}function An(t,e){return(e.y-t.y)/(e.x-t.x)}Cn.prototype={positions:[],position:null,init:function(){var i=this;this.positions=[],this.position=null;var r=!1;this.unbind=Vt(document,"mousemove",function(n){r||(setTimeout(function(){var t=Date.now(),e=i.positions.length;e&&100<t-i.positions[e-1].time&&i.positions.splice(0,e),i.positions.push({time:t,x:n.pageX,y:n.pageY}),5<i.positions.length&&i.positions.shift(),r=!1},5),r=!0)})},cancel:function(){this.unbind&&this.unbind()},movesTo:function(t){if(this.positions.length<2)return!1;var e=nn(t),n=X(this.positions),i=this.positions[0];if(e.left<=n.x&&n.x<=e.right&&e.top<=n.y&&n.y<=e.bottom)return!1;var r=[[{x:e.left,y:e.top},{x:e.right,y:e.bottom}],[{x:e.right,y:e.top},{x:e.left,y:e.bottom}]];return e.right<=n.x||(e.left>=n.x?(r[0].reverse(),r[1].reverse()):e.bottom<=n.y?r[0].reverse():e.top>=n.y&&r[1].reverse()),!!r.reduce(function(t,e){return t+(An(i,e[0])<An(n,e[0])&&An(i,e[1])>An(n,e[1]))},0)}};var _n={};function Nn(t,e,n){return _n.computed($(t)?t.call(n,n):t,$(e)?e.call(n,n):e)}function Mn(t,e){return t=t&&!k(t)?[t]:t,e?t?t.concat(e):k(e)?e:[e]:t}function On(e,n,i){var r={};if($(n)&&(n=n.options),n.extends&&(e=On(e,n.extends,i)),n.mixins)for(var t=0,o=n.mixins.length;t<o;t++)e=On(e,n.mixins[t],i);for(var s in e)h(s);for(var a in n)c(e,a)||h(a);function h(t){r[t]=(_n[t]||function(t,e){return P(e)?t:e})(e[t],n[t],i)}return r}function Dn(t,e){var n;void 0===e&&(e=[]);try{return t?w(t,"{")?JSON.parse(t):e.length&&!b(t,":")?((n={})[e[0]]=t,n):t.split(";").reduce(function(t,e){var n=e.split(/:(.*)/),i=n[0],r=n[1];return i&&!P(r)&&(t[i.trim()]=r.trim()),t},{}):{}}catch(t){return{}}}_n.events=_n.created=_n.beforeConnect=_n.connected=_n.beforeDisconnect=_n.disconnected=_n.destroy=Mn,_n.args=function(t,e){return!1!==e&&Mn(e||t)},_n.update=function(t,e){return G(Mn(t,$(e)?{read:e}:e),"order")},_n.props=function(t,e){return k(e)&&(e=e.reduce(function(t,e){return t[e]=String,t},{})),_n.methods(t,e)},_n.computed=_n.methods=function(t,e){return e?t?U({},t,e):e:t},_n.data=function(e,n,t){return t?Nn(e,n,t):n?e?function(t){return Nn(e,n,t)}:n:e};function zn(t){this.id=++Bn,this.el=j(t)}var Bn=0;function Pn(t,e){try{t.contentWindow.postMessage(JSON.stringify(U({event:"command"},e)),"*")}catch(t){}}zn.prototype.isVideo=function(){return this.isYoutube()||this.isVimeo()||this.isHTML5()},zn.prototype.isHTML5=function(){return"VIDEO"===this.el.tagName},zn.prototype.isIFrame=function(){return"IFRAME"===this.el.tagName},zn.prototype.isYoutube=function(){return this.isIFrame()&&!!this.el.src.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/)},zn.prototype.isVimeo=function(){return this.isIFrame()&&!!this.el.src.match(/vimeo\.com\/video\/.*/)},zn.prototype.enableApi=function(){var e=this;if(this.ready)return this.ready;var n,i=this.isYoutube(),r=this.isVimeo();return i||r?this.ready=new ne(function(t){Yt(e.el,"load",function(){if(i){var t=function(){return Pn(e.el,{event:"listening",id:e.id})};n=setInterval(t,100),t()}}),function(i){return new ne(function(n){Yt(window,"message",function(t,e){return n(e)},!1,function(t){var e=t.data;if(e&&O(e)){try{e=JSON.parse(e)}catch(t){return}return e&&i(e)}})})}(function(t){return i&&t.id===e.id&&"onReady"===t.event||r&&Number(t.player_id)===e.id}).then(function(){t(),n&&clearInterval(n)}),it(e.el,"src",e.el.src+(b(e.el.src,"?")?"&":"?")+(i?"enablejsapi=1":"api=1&player_id="+e.id))}):ne.resolve()},zn.prototype.play=function(){var t=this;if(this.isVideo())if(this.isIFrame())this.enableApi().then(function(){return Pn(t.el,{func:"playVideo",method:"play"})});else if(this.isHTML5())try{var e=this.el.play();e&&e.catch(Q)}catch(t){}},zn.prototype.pause=function(){var t=this;this.isVideo()&&(this.isIFrame()?this.enableApi().then(function(){return Pn(t.el,{func:"pauseVideo",method:"pause"})}):this.isHTML5()&&this.el.pause())},zn.prototype.mute=function(){var t=this;this.isVideo()&&(this.isIFrame()?this.enableApi().then(function(){return Pn(t.el,{func:"mute",method:"setVolume",value:0})}):this.isHTML5()&&(this.el.muted=!0,it(this.el,"muted","")))};var Hn="IntersectionObserver"in window?window.IntersectionObserver:function(){function t(e,t){var n=this;void 0===t&&(t={});var i=t.rootMargin;void 0===i&&(i="0 0"),this.targets=[];var r,o=(i||"0 0").split(" ").map(F),s=o[0],a=o[1];this.offsetTop=s,this.offsetLeft=a,this.apply=function(){r=r||requestAnimationFrame(function(){return setTimeout(function(){var t=n.takeRecords();t.length&&e(t,n),r=!1})})},this.off=Vt(window,"scroll resize load",this.apply,{passive:!0,capture:!0})}return t.prototype.takeRecords=function(){var n=this;return this.targets.filter(function(t){var e=pn(t.target,n.offsetTop,n.offsetLeft);if(null===t.isIntersecting||e^t.isIntersecting)return t.isIntersecting=e,!0})},t.prototype.observe=function(t){this.targets.push({target:t,isIntersecting:null}),this.apply()},t.prototype.disconnect=function(){this.targets=[],this.off()},t}();function Ln(t){return!(!w(t,"uk-")&&!w(t,"data-uk-"))&&f(t.replace("data-uk-","").replace("uk-",""))}function Fn(t){this._init(t)}var jn,Wn,Vn,Rn,Yn,qn,Un,Xn,Kn;function Gn(t,e){if(t)for(var n in t)t[n]._connected&&t[n]._callUpdate(e)}function Jn(t,e){var n={},i=t.args;void 0===i&&(i=[]);var r=t.props;void 0===r&&(r={});var o=t.el;if(!r)return n;for(var s in r){var a=d(s),h=st(o,a);if(!P(h)){if(h=r[s]===Boolean&&""===h||ei(r[s],h),"target"===a&&(!h||w(h,"_")))continue;n[s]=h}}var c=Dn(st(o,e),i);for(var u in c){var l=f(u);void 0!==r[l]&&(n[l]=ei(r[l],c[u]))}return n}function Zn(i,r,o){Object.defineProperty(i,r,{enumerable:!0,get:function(){var t=i._computeds,e=i.$props,n=i.$el;return c(t,r)||(t[r]=(o.get||o).call(i,e,n)),t[r]},set:function(t){var e=i._computeds;e[r]=o.set?o.set.call(i,t):t,P(e[r])&&delete e[r]}})}function Qn(e,n,i){T(n)||(n={name:i,handler:n});var t=n.name,r=n.el,o=n.handler,s=n.capture,a=n.passive,h=n.delegate,c=n.filter,u=n.self;r=$(r)?r.call(e):r||e.$el,k(r)?r.forEach(function(t){return Qn(e,U({},n,{el:t}),i)}):!r||c&&!c.call(e)||e._events.push(Vt(r,t,h?O(h)?h:h.call(e):null,O(o)?e[o]:o.bind(e),{passive:a,capture:s,self:u}))}function ti(t,e){return t.every(function(t){return!t||!c(t,e)})}function ei(t,e){return t===Boolean?H(e):t===Number?L(e):"list"===t?V(e):t?t(e):e}Fn.util=Object.freeze({ajax:ae,getImage:he,transition:Ue,Transition:Xe,animate:Je,Animation:Qe,attr:it,hasAttr:rt,removeAttr:ot,data:st,addClass:Ae,removeClass:_e,removeClasses:Ne,replaceClass:Me,hasClass:Oe,toggleClass:De,positionAt:en,offset:nn,position:on,height:sn,width:an,boxModelAdjust:cn,flipPosition:fn,isInView:pn,scrolledOver:mn,scrollTop:gn,offsetPosition:vn,toPx:wn,ready:ce,index:ue,getIndex:le,empty:de,html:fe,prepend:function(e,t){return(e=Te(e)).hasChildNodes()?ve(t,function(t){return e.insertBefore(t,e.firstChild)}):pe(e,t)},append:pe,before:me,after:ge,remove:we,wrapAll:be,wrapInner:xe,unwrap:ye,fragment:Ie,apply:Se,$:Te,$$:Ee,isIE:at,isRtl:ht,hasTouch:lt,pointerDown:dt,pointerMove:ft,pointerUp:pt,pointerEnter:mt,pointerLeave:gt,pointerCancel:vt,on:Vt,off:Rt,once:Yt,trigger:qt,createEvent:Ut,toEventTargets:Zt,isTouch:Qt,getEventPos:te,fastdom:kn,isVoidElement:Pt,isVisible:Ht,selInput:Lt,isInput:Ft,filter:jt,within:Wt,hasOwn:c,hyphenate:d,camelize:f,ucfirst:p,startsWith:w,endsWith:u,includes:b,findIndex:y,isArray:k,isFunction:$,isObject:I,isPlainObject:T,isWindow:E,isDocument:C,isJQuery:A,isNode:_,isNodeCollection:N,isBoolean:M,isString:O,isNumber:D,isNumeric:z,isEmpty:B,isUndefined:P,toBoolean:H,toNumber:L,toFloat:F,toNode:j,toNodes:W,toList:V,toMs:R,isEqual:Y,swap:q,assign:U,last:X,each:K,sortBy:G,uniqueBy:J,clamp:Z,noop:Q,intersectRect:tt,pointInRect:et,Dimensions:nt,MouseTracker:Cn,mergeOptions:On,parseOptions:Dn,Player:zn,Promise:ne,Deferred:ee,IntersectionObserver:Hn,query:wt,queryAll:bt,find:yt,findAll:kt,matches:_t,closest:Mt,parents:Ot,escape:zt,css:Le,getStyles:Fe,getStyle:je,getCssVar:Ve,propName:Ye}),Fn.data="__uikit__",Fn.prefix="uk-",Fn.options={},Vn=(jn=Fn).data,jn.use=function(t){if(!t.installed)return t.call(null,this),t.installed=!0,this},jn.mixin=function(t,e){(e=(O(e)?jn.component(e):e)||this).options=On(e.options,t)},jn.extend=function(t){function e(t){this._init(t)}return t=t||{},((e.prototype=Object.create(this.prototype)).constructor=e).options=On(this.options,t),e.super=this,e.extend=this.extend,e},jn.update=function(t,e){(function t(e,n){e&&e!==document.body&&e.parentNode&&(t(e.parentNode,n),n(e.parentNode))})(t=t?j(t):document.body,function(t){return Gn(t[Vn],e)}),Se(t,function(t){return Gn(t[Vn],e)})},Object.defineProperty(jn,"container",{get:function(){return Wn||document.body},set:function(t){Wn=Te(t)}}),(Rn=Fn).prototype._callHook=function(t){var e=this,n=this.$options[t];n&&n.forEach(function(t){return t.call(e)})},Rn.prototype._callConnected=function(){this._connected||(this._data={},this._computeds={},this._initProps(),this._callHook("beforeConnect"),this._connected=!0,this._initEvents(),this._initObserver(),this._callHook("connected"),this._callUpdate())},Rn.prototype._callDisconnected=function(){this._connected&&(this._callHook("beforeDisconnect"),this._observer&&(this._observer.disconnect(),this._observer=null),this._unbindEvents(),this._callHook("disconnected"),this._connected=!1)},Rn.prototype._callUpdate=function(t){var o=this;void 0===t&&(t="update");var s=t.type||t;b(["update","resize"],s)&&this._callWatches();var e=this.$options.update,n=this._frames,a=n.reads,h=n.writes;e&&e.forEach(function(t,e){var n=t.read,i=t.write,r=t.events;"update"!==s&&!b(r,s)||(n&&!b(kn.reads,a[e])&&(a[e]=kn.read(function(){var t=o._connected&&n.call(o,o._data,s);!1===t&&i?kn.clear(h[e]):T(t)&&U(o._data,t)})),i&&!b(kn.writes,h[e])&&(h[e]=kn.write(function(){return o._connected&&i.call(o,o._data,s)})))})},qn=0,(Yn=Fn).prototype._init=function(t){(t=t||{}).data=function(t,e){var n=t.data,i=(t.el,e.args),r=e.props;if(void 0===r&&(r={}),n=k(n)?B(i)?void 0:n.slice(0,i.length).reduce(function(t,e,n){return T(e)?U(t,e):t[i[n]]=e,t},{}):n)for(var o in n)P(n[o])?delete n[o]:n[o]=r[o]?ei(r[o],n[o]):n[o];return n}(t,this.constructor.options),this.$options=On(this.constructor.options,t,this),this.$el=null,this.$props={},this._frames={reads:{},writes:{}},this._events=[],this._uid=qn++,this._initData(),this._initMethods(),this._initComputeds(),this._callHook("created"),t.el&&this.$mount(t.el)},Yn.prototype._initData=function(){var t=this.$options.data;for(var e in void 0===t&&(t={}),t)this.$props[e]=this[e]=t[e]},Yn.prototype._initMethods=function(){var t=this.$options.methods;if(t)for(var e in t)this[e]=t[e].bind(this)},Yn.prototype._initComputeds=function(){var t=this.$options.computed;if(this._computeds={},t)for(var e in t)Zn(this,e,t[e])},Yn.prototype._callWatches=function(){var t=this.$options.computed,e=this._computeds;for(var n in e){var i=e[n];delete e[n],t[n].watch&&!Y(i,this[n])&&t[n].watch.call(this,this[n],i)}},Yn.prototype._initProps=function(t){var e;for(e in t=t||Jn(this.$options,this.$name))P(t[e])||(this.$props[e]=t[e]);var n=[this.$options.computed,this.$options.methods];for(e in this.$props)e in t&&ti(n,e)&&(this[e]=this.$props[e])},Yn.prototype._initEvents=function(){var n=this,t=this.$options.events;t&&t.forEach(function(t){if(c(t,"handler"))Qn(n,t);else for(var e in t)Qn(n,t[e],e)})},Yn.prototype._unbindEvents=function(){this._events.forEach(function(t){return t()}),this._events=[]},Yn.prototype._initObserver=function(){var n=this,t=this.$options,i=t.attrs,e=t.props,r=t.el;if(!this._observer&&e&&!1!==i){i=k(i)?i:Object.keys(e),this._observer=new MutationObserver(function(){var e=Jn(n.$options,n.$name);i.some(function(t){return!P(e[t])&&e[t]!==n.$props[t]})&&n.$reset()});var o=i.map(function(t){return d(t)}).concat(this.$name);this._observer.observe(r,{attributes:!0,attributeFilter:o.concat(o.map(function(t){return"data-"+t}))})}},Xn=(Un=Fn).data,Kn={},Un.component=function(s,t){if(!t)return T(Kn[s])&&(Kn[s]=Un.extend(Kn[s])),Kn[s];Un[s]=function(t,n){for(var e=arguments.length,i=Array(e);e--;)i[e]=arguments[e];var r=Un.component(s);return r.options.functional?new r({data:T(t)?t:[].concat(i)}):t&&t.nodeType?o(t):Ee(t).map(o)[0];function o(t){var e=Un.getComponent(t,s);if(e){if(!n)return e;e.$destroy()}return new r({el:t,data:n})}};var e=T(t)?U({},t):t.options;if(e.name=s,e.install&&e.install(Un,e,s),Un._initialized&&!e.functional){var n=d(s);kn.read(function(){return Un[s]("[uk-"+n+"],[data-uk-"+n+"]")})}return Kn[s]=T(t)?e:t},Un.getComponents=function(t){return t&&t[Xn]||{}},Un.getComponent=function(t,e){return Un.getComponents(t)[e]},Un.connect=function(t){if(t[Xn])for(var e in t[Xn])t[Xn][e]._callConnected();for(var n=0;n<t.attributes.length;n++){var i=Ln(t.attributes[n].name);i&&i in Kn&&Un[i](t)}},Un.disconnect=function(t){for(var e in t[Xn])t[Xn][e]._callDisconnected()},function(i){var r=i.data;i.prototype.$mount=function(t){var e=this.$options.name;t[r]||(t[r]={}),t[r][e]||((t[r][e]=this).$el=this.$options.el=this.$options.el||t,Wt(t,document)&&this._callConnected())},i.prototype.$emit=function(t){this._callUpdate(t)},i.prototype.$reset=function(){this._callDisconnected(),this._callConnected()},i.prototype.$destroy=function(t){void 0===t&&(t=!1);var e=this.$options,n=e.el,i=e.name;n&&this._callDisconnected(),this._callHook("destroy"),n&&n[r]&&(delete n[r][i],B(n[r])||delete n[r],t&&we(this.$el))},i.prototype.$create=function(t,e,n){return i[t](e,n)},i.prototype.$update=i.update,i.prototype.$getComponent=i.getComponent;var e={};Object.defineProperties(i.prototype,{$container:Object.getOwnPropertyDescriptor(i,"container"),$name:{get:function(){var t=this.$options.name;return e[t]||(e[t]=i.prefix+d(t)),e[t]}}})}(Fn);var ni={connected:function(){Oe(this.$el,this.$name)||Ae(this.$el,this.$name)}},ii={props:{cls:Boolean,animation:"list",duration:Number,origin:String,transition:String,queued:Boolean},data:{cls:!1,animation:[!1],duration:200,origin:!1,transition:"linear",queued:!1,initProps:{overflow:"",height:"",paddingTop:"",paddingBottom:"",marginTop:"",marginBottom:""},hideProps:{overflow:"hidden",height:0,paddingTop:0,paddingBottom:0,marginTop:0,marginBottom:0}},computed:{hasAnimation:function(t){return!!t.animation[0]},hasTransition:function(t){var e=t.animation;return this.hasAnimation&&!0===e[0]}},methods:{toggleElement:function(c,u,l){var d=this;return new ne(function(t){c=W(c);function e(t){return ne.all(t.map(function(t){return d._toggleElement(t,u,l)}))}var n,i=c.filter(function(t){return d.isToggled(t)}),r=c.filter(function(t){return!b(i,t)});if(d.queued&&P(l)&&P(u)&&d.hasAnimation&&!(c.length<2)){var o=document.body,s=o.scrollTop,a=i[0],h=Qe.inProgress(a)&&Oe(a,"uk-animation-leave")||Xe.inProgress(a)&&"0px"===a.style.height;n=e(i),h||(n=n.then(function(){var t=e(r);return o.scrollTop=s,t}))}else n=e(r.concat(i));n.then(t,Q)})},toggleNow:function(e,n){var i=this;return new ne(function(t){return ne.all(W(e).map(function(t){return i._toggleElement(t,n,!1)})).then(t,Q)})},isToggled:function(t){var e=W(t||this.$el);return this.cls?Oe(e,this.cls.split(" ")[0]):!rt(e,"hidden")},updateAria:function(t){!1===this.cls&&it(t,"aria-hidden",!this.isToggled(t))},_toggleElement:function(t,e,n){var i=this;if(e=M(e)?e:Qe.inProgress(t)?Oe(t,"uk-animation-leave"):Xe.inProgress(t)?"0px"===t.style.height:!this.isToggled(t),!qt(t,"before"+(e?"show":"hide"),[this]))return ne.reject();var r=($(n)?n:!1!==n&&this.hasAnimation?this.hasTransition?function(t){var s=t.isToggled,a=t.duration,h=t.initProps,c=t.hideProps,u=t.transition,l=t._toggle;return function(t,e){var n=Xe.inProgress(t),i=t.hasChildNodes?F(Le(t.firstElementChild,"marginTop"))+F(Le(t.lastElementChild,"marginBottom")):0,r=Ht(t)?sn(t)+(n?0:i):0;Xe.cancel(t),s(t)||l(t,!0),sn(t,""),kn.flush();var o=sn(t)+(n?0:i);return sn(t,r),(e?Xe.start(t,U({},h,{overflow:"hidden",height:o}),Math.round(a*(1-r/o)),u):Xe.start(t,c,Math.round(a*(r/o)),u).then(function(){return l(t,!1)})).then(function(){return Le(t,h)})}}(this):function(t){var n=t.animation,i=t.duration,r=t.origin,o=t._toggle;return function(t,e){return Qe.cancel(t),e?(o(t,!0),Qe.in(t,n[0],i,r)):Qe.out(t,n[1]||n[0],i,r).then(function(){return o(t,!1)})}}(this):this._toggle)(t,e);qt(t,e?"show":"hide",[this]);function o(){qt(t,e?"shown":"hidden",[i]),i.$update(t)}return r?r.then(o):ne.resolve(o())},_toggle:function(t,e){var n;t&&(e=Boolean(e),this.cls?(n=b(this.cls," ")||e!==Oe(t,this.cls))&&De(t,this.cls,b(this.cls," ")?void 0:e):(n=e===rt(t,"hidden"))&&it(t,"hidden",e?null:""),Ee("[autofocus]",t).some(function(t){return Ht(t)?t.focus()||!0:t.blur()}),this.updateAria(t),n&&this.$update(t))}}};var ri={mixins:[ni,ii],props:{targets:String,active:null,collapsible:Boolean,multiple:Boolean,toggle:String,content:String,transition:String},data:{targets:"> *",active:!1,animation:[!0],collapsible:!0,multiple:!1,clsOpen:"uk-open",toggle:"> .uk-accordion-title",content:"> .uk-accordion-content",transition:"ease"},computed:{items:function(t,e){return Ee(t.targets,e)}},events:[{name:"click",delegate:function(){return this.targets+" "+this.$props.toggle},handler:function(t){t.preventDefault(),this.toggle(ue(Ee(this.targets+" "+this.$props.toggle,this.$el),t.current))}}],connected:function(){if(!1!==this.active){var t=this.items[Number(this.active)];t&&!Oe(t,this.clsOpen)&&this.toggle(t,!1)}},update:function(){var e=this;this.items.forEach(function(t){return e._toggle(Te(e.content,t),Oe(t,e.clsOpen))});var t=!this.collapsible&&!Oe(this.items,this.clsOpen)&&this.items[0];t&&this.toggle(t,!1)},methods:{toggle:function(r,o){var s=this,t=le(r,this.items),a=jt(this.items,"."+this.clsOpen);(r=this.items[t])&&[r].concat(!this.multiple&&!b(a,r)&&a||[]).forEach(function(t){var e=t===r,n=e&&!Oe(t,s.clsOpen);if(n||!e||s.collapsible||!(a.length<2)){De(t,s.clsOpen,n);var i=t._wrapper?t._wrapper.firstElementChild:Te(s.content,t);t._wrapper||(t._wrapper=be(i,"<div>"),it(t._wrapper,"hidden",n?"":null)),s._toggle(i,!0),s.toggleElement(t._wrapper,n,o).then(function(){Oe(t,s.clsOpen)===n&&(n||s._toggle(i,!1),t._wrapper=null,ye(i))})}})}}},oi={mixins:[ni,ii],args:"animation",props:{close:String},data:{animation:[!0],selClose:".uk-alert-close",duration:150,hideProps:U({opacity:0},ii.data.hideProps)},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.close()}}],methods:{close:function(){var t=this;this.toggleElement(this.$el).then(function(){return t.$destroy(!0)})}}};function si(r){ce(function(){var n;r.update(),Vt(window,"load resize",function(){return r.update(null,"resize")}),Vt(document,"loadedmetadata load",function(t){var e=t.target;return r.update(e,"resize")},!0),Vt(window,"scroll",function(t){if(!n){n=!0,kn.write(function(){return n=!1});var e=t.target;r.update(1!==e.nodeType?document.body:e,t.type)}},{passive:!0,capture:!0});var e,i=0;Vt(document,"animationstart",function(t){var e=t.target;(Le(e,"animationName")||"").match(/^uk-.*(left|right)/)&&(i++,Le(document.body,"overflowX","hidden"),setTimeout(function(){--i||Le(document.body,"overflowX","")},R(Le(e,"animationDuration"))+100))},!0),Vt(document,dt,function(t){if(e&&e(),Qt(t)){var r=te(t),o="tagName"in t.target?t.target:t.target.parentNode;e=Yt(document,pt+" "+vt,function(t){var e=te(t),n=e.x,i=e.y;(o&&n&&100<Math.abs(r.x-n)||i&&100<Math.abs(r.y-i))&&setTimeout(function(){qt(o,"swipe"),qt(o,"swipe"+function(t,e,n,i){return Math.abs(t-n)>=Math.abs(e-i)?0<t-n?"Left":"Right":0<e-i?"Up":"Down"}(r.x,r.y,n,i))})}),"touchstart"===dt&&(Le(document.body,"cursor","pointer"),Yt(document,pt+" "+vt,function(){return setTimeout(function(){return Le(document.body,"cursor","")},50)}))}},{passive:!0})})}var ai,hi={args:"autoplay",props:{automute:Boolean,autoplay:Boolean},data:{automute:!1,autoplay:!0},computed:{inView:function(t){return"inview"===t.autoplay}},connected:function(){this.inView&&!rt(this.$el,"preload")&&(this.$el.preload="none"),this.player=new zn(this.$el),this.automute&&this.player.mute()},update:{read:function(){return!!this.player&&{visible:Ht(this.$el)&&"hidden"!==Le(this.$el,"visibility"),inView:this.inView&&pn(this.$el)}},write:function(t){var e=t.visible,n=t.inView;!e||this.inView&&!n?this.player.pause():(!0===this.autoplay||this.inView&&n)&&this.player.play()},events:["resize","scroll"]}},ci={mixins:[ni,hi],props:{width:Number,height:Number},data:{automute:!0},update:{read:function(){var t=this.$el,e=t.parentNode,n=e.offsetHeight,i=e.offsetWidth,r=nt.cover({width:this.width||t.naturalWidth||t.videoWidth||t.clientWidth,height:this.height||t.naturalHeight||t.videoHeight||t.clientHeight},{width:i+(i%2?1:0),height:n+(n%2?1:0)});return!(!r.width||!r.height)&&r},write:function(t){var e=t.height,n=t.width;Le(this.$el,{height:e,width:n})},events:["resize"]}},ui={props:{pos:String,offset:null,flip:Boolean,clsPos:String},data:{pos:"bottom-"+(ht?"right":"left"),flip:!0,offset:!1,clsPos:""},computed:{pos:function(t){var e=t.pos;return(e+(b(e,"-")?"":"-center")).split("-")},dir:function(){return this.pos[0]},align:function(){return this.pos[1]}},methods:{positionAt:function(t,e,n){var i;Ne(t,this.clsPos+"-(top|bottom|left|right)(-[a-z]+)?"),Le(t,{top:"",left:""});var r=this.offset,o=this.getAxis();z(r)||(r=(i=Te(r))?nn(i)["x"===o?"left":"top"]-nn(e)["x"===o?"right":"bottom"]:0);var s=en(t,e,"x"===o?fn(this.dir)+" "+this.align:this.align+" "+fn(this.dir),"x"===o?this.dir+" "+this.align:this.align+" "+this.dir,"x"===o?""+("left"===this.dir?-r:r):" "+("top"===this.dir?-r:r),null,this.flip,n).target,a=s.x,h=s.y;this.dir="x"===o?a:h,this.align="x"===o?h:a,De(t,this.clsPos+"-"+this.dir+"-"+this.align,!1===this.offset)},getAxis:function(){return"top"===this.dir||"bottom"===this.dir?"y":"x"}}},li={mixins:[ui,ii],args:"pos",props:{mode:"list",toggle:Boolean,boundary:Boolean,boundaryAlign:Boolean,delayShow:Number,delayHide:Number,clsDrop:String},data:{mode:["click","hover"],toggle:"- *",boundary:window,boundaryAlign:!1,delayShow:0,delayHide:800,clsDrop:!1,hoverIdle:200,animation:["uk-animation-fade"],cls:"uk-open"},computed:{boundary:function(t,e){return wt(t.boundary,e)},clsDrop:function(t){return t.clsDrop||"uk-"+this.$options.name},clsPos:function(){return this.clsDrop}},created:function(){this.tracker=new Cn},connected:function(){Ae(this.$el,this.clsDrop);var t=this.$props.toggle;this.toggle=t&&this.$create("toggle",wt(t,this.$el),{target:this.$el,mode:this.mode}),this.toggle||qt(this.$el,"updatearia")},events:[{name:"click",delegate:function(){return"."+this.clsDrop+"-close"},handler:function(t){t.preventDefault(),this.hide(!1)}},{name:"click",delegate:function(){return'a[href^="#"]'},handler:function(t){var e=t.defaultPrevented,n=t.current.hash;e||!n||Wt(n,this.$el)||this.hide(!1)}},{name:"beforescroll",handler:function(){this.hide(!1)}},{name:"toggle",self:!0,handler:function(t,e){t.preventDefault(),this.isToggled()?this.hide(!1):this.show(e,!1)}},{name:mt,filter:function(){return b(this.mode,"hover")},handler:function(t){Qt(t)||(ai&&ai!==this&&ai.toggle&&b(ai.toggle.mode,"hover")&&!Wt(t.target,ai.toggle.$el)&&!et({x:t.pageX,y:t.pageY},nn(ai.$el))&&ai.hide(!1),t.preventDefault(),this.show(this.toggle))}},{name:"toggleshow",handler:function(t,e){e&&!b(e.target,this.$el)||(t.preventDefault(),this.show(e||this.toggle))}},{name:"togglehide "+gt,handler:function(t,e){Qt(t)||e&&!b(e.target,this.$el)||(t.preventDefault(),this.toggle&&b(this.toggle.mode,"hover")&&this.hide())}},{name:"beforeshow",self:!0,handler:function(){this.clearTimers(),Qe.cancel(this.$el),this.position()}},{name:"show",self:!0,handler:function(){var i=this;this.tracker.init(),qt(this.$el,"updatearia");var t=di(document,"click",function(t){var e=t.defaultPrevented,n=t.target;e||Wt(n,i.$el)||i.toggle&&Wt(n,i.toggle.$el)||i.hide(!1)});Yt(this.$el,"hide",t,{self:!0})}},{name:"beforehide",self:!0,handler:function(){this.clearTimers()}},{name:"hide",handler:function(t){var e=t.target;this.$el===e?(ai=this.isActive()?null:ai,qt(this.$el,"updatearia"),this.tracker.cancel()):ai=null===ai&&Wt(e,this.$el)&&this.isToggled()?this:ai}},{name:"updatearia",self:!0,handler:function(t,e){t.preventDefault(),this.updateAria(this.$el),(e||this.toggle)&&(it((e||this.toggle).$el,"aria-expanded",this.isToggled()),De(this.toggle.$el,this.cls,this.isToggled()))}}],update:{write:function(){this.isToggled()&&!Qe.inProgress(this.$el)&&this.position()},events:["resize"]},methods:{show:function(e,n){var i=this;void 0===n&&(n=!0);function r(){return!i.isToggled()&&i.toggleElement(i.$el,!0)}function t(){if(i.toggle=e||i.toggle,i.clearTimers(),!i.isActive())if(n&&ai&&ai!==i&&ai.isDelaying)i.showTimer=setTimeout(i.show,10);else{if(i.isParentOf(ai)){if(!ai.hideTimer)return;ai.hide(!1)}else if(i.isChildOf(ai))ai.clearTimers();else if(ai&&!i.isChildOf(ai)&&!i.isParentOf(ai))for(var t;ai&&ai!==t&&!i.isChildOf(ai);)(t=ai).hide(!1);n&&i.delayShow?i.showTimer=setTimeout(r,i.delayShow):r(),ai=i}}e&&this.toggle&&e.$el!==this.toggle.$el?(Yt(this.$el,"hide",t),this.hide(!1)):t()},hide:function(t){var e=this;void 0===t&&(t=!0);function n(){return e.toggleNow(e.$el,!1)}this.clearTimers(),this.isDelaying=this.tracker.movesTo(this.$el),t&&this.isDelaying?this.hideTimer=setTimeout(this.hide,this.hoverIdle):t&&this.delayHide?this.hideTimer=setTimeout(n,this.delayHide):n()},clearTimers:function(){clearTimeout(this.showTimer),clearTimeout(this.hideTimer),this.showTimer=null,this.hideTimer=null,this.isDelaying=!1},isActive:function(){return ai===this},isChildOf:function(t){return t&&t!==this&&Wt(this.$el,t.$el)},isParentOf:function(t){return t&&t!==this&&Wt(t.$el,this.$el)},position:function(){Ne(this.$el,this.clsDrop+"-(stack|boundary)"),Le(this.$el,{top:"",left:"",display:"block"}),De(this.$el,this.clsDrop+"-boundary",this.boundaryAlign);var t=nn(this.boundary),e=this.boundaryAlign?t:nn(this.toggle.$el);if("justify"===this.align){var n="y"===this.getAxis()?"width":"height";Le(this.$el,n,e[n])}else this.$el.offsetWidth>Math.max(t.right-e.left,e.right-t.left)&&Ae(this.$el,this.clsDrop+"-stack");this.positionAt(this.$el,this.boundaryAlign?this.boundary:this.toggle.$el,this.boundary),Le(this.$el,"display","")}}};function di(t,e,n){var i=Yt(t,e,function(){return i=Vt(t,e,n)},!0);return function(){return i()}}var fi={extends:li},pi={mixins:[ni],args:"target",props:{target:Boolean},data:{target:!1},computed:{input:function(t,e){return Te(Lt,e)},state:function(){return this.input.nextElementSibling},target:function(t,e){var n=t.target;return n&&(!0===n&&this.input.parentNode===e&&this.input.nextElementSibling||wt(n,e))}},update:function(){var t=this.target,e=this.input;if(t){var n,i=Ft(t)?"value":"textContent",r=t[i],o=e.files&&e.files[0]?e.files[0].name:_t(e,"select")&&(n=Ee("option",e).filter(function(t){return t.selected})[0])?n.textContent:e.value;r!==o&&(t[i]=o)}},events:[{name:"change",handler:function(){this.$emit()}},{name:"reset",el:function(){return Mt(this.$el,"form")},handler:function(){this.$emit()}}]},mi={update:{read:function(t){var e=pn(this.$el);if(!e||t.isInView===e)return!1;t.isInView=e},write:function(){this.$el.src=this.$el.src},events:["scroll","resize"]}},gi={props:{margin:String,firstColumn:Boolean},data:{margin:"uk-margin-small-top",firstColumn:"uk-first-column"},update:{read:function(t){var e=this.$el.children;if(!e.length||!Ht(this.$el))return t.rows=[[]];t.rows=vi(e),t.stacks=!t.rows.some(function(t){return 1<t.length})},write:function(t){var i=this;t.rows.forEach(function(t,n){return t.forEach(function(t,e){De(t,i.margin,0!==n),De(t,i.firstColumn,0===e)})})},events:["resize"]}};function vi(t){for(var e=[[]],n=0;n<t.length;n++){var i=t[n],r=wi(i);if(r.height)for(var o=e.length-1;0<=o;o--){var s=e[o];if(!s[0]){s.push(i);break}var a=void 0;if(a=s[0].offsetParent===i.offsetParent?wi(s[0]):(r=wi(i,!0),wi(s[0],!0)),r.top>=a.bottom-1&&r.top!==a.top){e.push([i]);break}if(r.bottom>a.top){if(r.left<a.left&&!ht){s.unshift(i);break}s.push(i);break}if(0===o){e.unshift([i]);break}}}return e}function wi(t,e){var n;void 0===e&&(e=!1);var i=t.offsetTop,r=t.offsetLeft,o=t.offsetHeight;return e&&(i=(n=vn(t))[0],r=n[1]),{top:i,left:r,height:o,bottom:i+o}}var bi={extends:gi,mixins:[ni],name:"grid",props:{masonry:Boolean,parallax:Number},data:{margin:"uk-grid-margin",clsStack:"uk-grid-stack",masonry:!1,parallax:0},computed:{length:function(t,e){return e.children.length},parallax:function(t){var e=t.parallax;return e&&this.length?Math.abs(e):""}},connected:function(){this.masonry&&Ae(this.$el,"uk-flex-top uk-flex-wrap-top")},update:[{read:function(t){var r=t.rows;(this.masonry||this.parallax)&&(r=r.map(function(t){return G(t,"offsetLeft")}),ht&&r.map(function(t){return t.reverse()}));var e=r.some(function(t){return t.some(Xe.inProgress)}),n=!1,i="";if(this.masonry&&this.length){var o=0;n=r.reduce(function(n,t,i){return n[i]=t.map(function(t,e){return 0===i?0:F(n[i-1][e])+(o-F(r[i-1][e]&&r[i-1][e].offsetHeight))}),o=t.reduce(function(t,e){return Math.max(t,e.offsetHeight)},0),n},[]),i=function(t){return Math.max.apply(Math,t.reduce(function(n,t){return t.forEach(function(t,e){return n[e]=(n[e]||0)+t.offsetHeight}),n},[]))}(r)+function(t,e){var n=W(t.children),i=n.filter(function(t){return Oe(t,e)})[0];return F(i?Le(i,"marginTop"):Le(n[0],"paddingLeft"))}(this.$el,this.margin)*(r.length-1)}return{padding:this.parallax&&function(t,e,n){for(var i=0,r=0,o=0,s=e.length-1;0<=s;s--)for(var a=i;a<e[s].length;a++){var h=e[s][a],c=h.offsetTop+sn(h)+(n&&-n[s][a]);r=Math.max(r,c),o=Math.max(o,c+(a%2?t:t/8)),i++}return o-r}(this.parallax,r,n),rows:r,translates:n,height:!e&&i}},write:function(t){var e=t.stacks,n=t.height,i=t.padding;De(this.$el,this.clsStack,e),Le(this.$el,"paddingBottom",i),!1!==n&&Le(this.$el,"height",n)},events:["resize"]},{read:function(t){var e=t.height;return{scrolled:!!this.parallax&&mn(this.$el,e?e-sn(this.$el):0)*this.parallax}},write:function(t){var e=t.rows,i=t.scrolled,r=t.translates;!1===i&&!r||e.forEach(function(t,n){return t.forEach(function(t,e){return Le(t,"transform",i||r?"translateY("+((r&&-r[n][e])+(i?e%2?i:i/8:0))+"px)":"")})})},events:["scroll","resize"]}]};var xi=at?{props:{selMinHeight:String},data:{selMinHeight:!1,forceHeight:!1},computed:{elements:function(t,e){var n=t.selMinHeight;return n?Ee(n,e):[e]}},update:[{read:function(){Le(this.elements,"height","")},order:-5,events:["resize"]},{write:function(){var n=this;this.elements.forEach(function(t){var e=F(Le(t,"minHeight"));e&&(n.forceHeight||Math.round(e+cn("height",t,"content-box"))>=t.offsetHeight)&&Le(t,"height",e)})},order:5,events:["resize"]}]}:{},yi={mixins:[xi],args:"target",props:{target:String,row:Boolean},data:{target:"> *",row:!0,forceHeight:!0},computed:{elements:function(t,e){return Ee(t.target,e)}},update:{read:function(){return{rows:(this.row?vi(this.elements):[this.elements]).map(ki)}},write:function(t){t.rows.forEach(function(t){var n=t.heights;return t.elements.forEach(function(t,e){return Le(t,"minHeight",n[e])})})},events:["resize"]}};function ki(t){var e;if(t.length<2)return{heights:[""],elements:t};var n=$i(t),i=n.heights,r=n.max,o=t.some(function(t){return t.style.minHeight}),s=t.some(function(t,e){return!t.style.minHeight&&i[e]<r});return o&&s&&(Le(t,"minHeight",""),e=$i(t),i=e.heights,r=e.max),{heights:i=t.map(function(t,e){return i[e]===r&&F(t.style.minHeight).toFixed(2)!==r.toFixed(2)?"":r}),elements:t}}function $i(t){var e=t.map(function(t){return nn(t).height-cn("height",t,"content-box")});return{heights:e,max:Math.max.apply(null,e)}}var Ii={mixins:[xi],props:{expand:Boolean,offsetTop:Boolean,offsetBottom:Boolean,minHeight:Number},data:{expand:!1,offsetTop:!1,offsetBottom:!1,minHeight:0},update:{read:function(t){var e=t.minHeight;if(!Ht(this.$el))return!1;var n="",i=cn("height",this.$el,"content-box");if(this.expand){if(this.$el.dataset.heightExpand="",Te("[data-height-expand]")!==this.$el)return!1;n=sn(window)-(Si(document.documentElement)-Si(this.$el))-i||""}else{if(n="calc(100vh",this.offsetTop){var r=nn(this.$el).top;n+=0<r&&r<sn(window)/2?" - "+r+"px":""}!0===this.offsetBottom?n+=" - "+Si(this.$el.nextElementSibling)+"px":z(this.offsetBottom)?n+=" - "+this.offsetBottom+"vh":this.offsetBottom&&u(this.offsetBottom,"px")?n+=" - "+F(this.offsetBottom)+"px":O(this.offsetBottom)&&(n+=" - "+Si(wt(this.offsetBottom,this.$el))+"px"),n+=(i?" - "+i+"px":"")+")"}return{minHeight:n,prev:e}},write:function(t){var e=t.minHeight,n=t.prev;Le(this.$el,{minHeight:e}),e!==n&&this.$update(this.$el,"resize"),this.minHeight&&F(Le(this.$el,"minHeight"))<this.minHeight&&Le(this.$el,"minHeight",this.minHeight)},events:["resize"]}};function Si(t){return t&&nn(t).height||0}var Ti={args:"src",props:{id:Boolean,icon:String,src:String,style:String,width:Number,height:Number,ratio:Number,class:String,strokeAnimation:Boolean,focusable:Boolean,attributes:"list"},data:{ratio:1,include:["style","class","focusable"],class:"",strokeAnimation:!1},beforeConnect:function(){var t,e=this;if(this.class+=" uk-svg",!this.icon&&b(this.src,"#")){var n=this.src.split("#");1<n.length&&(t=n,this.src=t[0],this.icon=t[1])}this.svg=this.getSvg().then(function(t){return e.applyAttributes(t),e.svgEl=function(t,e){{if(Pt(e)||"CANVAS"===e.tagName){it(e,"hidden",!0);var n=e.nextElementSibling;return Ni(t,n)?n:ge(e,t)}var i=e.lastElementChild;return Ni(t,i)?i:pe(e,t)}}(t,e.$el)},Q)},disconnected:function(){var e=this;Pt(this.$el)&&it(this.$el,"hidden",null),this.svg&&this.svg.then(function(t){return(!e._connected||t!==e.svgEl)&&we(t)},Q),this.svg=this.svgEl=null},update:{read:function(){return!!(this.strokeAnimation&&this.svgEl&&Ht(this.svgEl))},write:function(){!function(t){var e=_i(t);e&&t.style.setProperty("--uk-animation-stroke",e)}(this.svgEl)},type:["resize"]},methods:{getSvg:function(){var e=this;return function(n){if(Ei[n])return Ei[n];return Ei[n]=new ne(function(e,t){n?w(n,"data:")?e(decodeURIComponent(n.split(",")[1])):ae(n).then(function(t){return e(t.response)},function(){return t("SVG not found.")}):t()})}(this.src).then(function(t){return function(t,e){e&&b(t,"<symbol")&&(t=function(t,e){if(!Ai[t]){var n;for(Ai[t]={};n=Ci.exec(t);)Ai[t][n[3]]='<svg xmlns="http://www.w3.org/2000/svg"'+n[1]+"svg>";Ci.lastIndex=0}return Ai[t][e]}(t,e)||t);return(t=Te(t.substr(t.indexOf("<svg"))))&&t.hasChildNodes()&&t}(t,e.icon)||ne.reject("SVG not found.")})},applyAttributes:function(n){var i=this;for(var t in this.$options.props)this[t]&&b(this.include,t)&&it(n,t,this[t]);for(var e in this.attributes){var r=this.attributes[e].split(":",2),o=r[0],s=r[1];it(n,o,s)}this.id||ot(n,"id");var a=["width","height"],h=[this.width,this.height];h.some(function(t){return t})||(h=a.map(function(t){return it(n,t)}));var c=it(n,"viewBox");c&&!h.some(function(t){return t})&&(h=c.split(" ").slice(2)),h.forEach(function(t,e){(t=(0|t)*i.ratio)&&it(n,a[e],t),t&&!h[1^e]&&ot(n,a[1^e])}),it(n,"data-svg",this.icon||this.src)}}},Ei={};var Ci=/<symbol(.*?id=(['"])(.*?)\2[^]*?<\/)symbol>/g,Ai={};function _i(t){return Math.ceil(Math.max.apply(Math,Ee("[stroke]",t).map(function(t){return t.getTotalLength&&t.getTotalLength()||0}).concat([0])))}function Ni(t,e){return it(t,"data-svg")===it(e,"data-svg")}var Mi={},Oi={spinner:'<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" cx="15" cy="15" r="14"/></svg>',totop:'<svg width="18" height="10" viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 9 9 1 17 9 "/></svg>',marker:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="4" width="1" height="11"/><rect x="4" y="9" width="11" height="1"/></svg>',"close-icon":'<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.1" x1="1" y1="1" x2="13" y2="13"/><line fill="none" stroke="#000" stroke-width="1.1" x1="13" y1="1" x2="1" y2="13"/></svg>',"close-large":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.4" x1="1" y1="1" x2="19" y2="19"/><line fill="none" stroke="#000" stroke-width="1.4" x1="19" y1="1" x2="1" y2="19"/></svg>',"navbar-toggle-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect y="9" width="20" height="2"/><rect y="3" width="20" height="2"/><rect y="15" width="20" height="2"/></svg>',"overlay-icon":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="0" width="1" height="40"/><rect x="0" y="19" width="40" height="1"/></svg>',"pagination-next":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 1 6 6 1 11"/></svg>',"pagination-previous":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="6 1 1 6 6 11"/></svg>',"search-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"/></svg>',"search-large":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.8" cx="17.5" cy="17.5" r="16.5"/><line fill="none" stroke="#000" stroke-width="1.8" x1="38" y1="39" x2="29" y2="30"/></svg>',"search-navbar":'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10.5" cy="10.5" r="9.5"/><line fill="none" stroke="#000" stroke-width="1.1" x1="23" y1="23" x2="17" y2="17"/></svg>',"slidenav-next":'<svg width="14px" height="24px" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="1.225,23 12.775,12 1.225,1 "/></svg>',"slidenav-next-large":'<svg width="25px" height="40px" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="4.002,38.547 22.527,20.024 4,1.5 "/></svg>',"slidenav-previous":'<svg width="14px" height="24px" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="12.775,1 1.225,12 12.775,23 "/></svg>',"slidenav-previous-large":'<svg width="25px" height="40px" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="20.527,1.5 2,20.024 20.525,38.547 "/></svg>'},Di={install:function(r){r.icon.add=function(t,e){var n,i=O(t)?((n={})[t]=e,n):t;K(i,function(t,e){Oi[e]=t,delete Mi[e]}),r._initialized&&Se(document.body,function(t){return K(r.getComponents(t),function(t){t.$options.isIcon&&t.icon in i&&t.$reset()})})}},extends:Ti,args:"icon",props:["icon"],data:{include:["focusable"]},isIcon:!0,beforeConnect:function(){Ae(this.$el,"uk-icon")},methods:{getSvg:function(){var t=function(t){if(!Oi[t])return null;Mi[t]||(Mi[t]=Te(Oi[t].trim()));return Mi[t].cloneNode(!0)}(function(t){return ht?q(q(t,"left","right"),"previous","next"):t}(this.icon));return t?ne.resolve(t):ne.reject("Icon not found.")}}},zi={args:!1,extends:Di,data:function(t){return{icon:d(t.constructor.options.name)}},beforeConnect:function(){Ae(this.$el,this.$name)}},Bi={extends:zi,beforeConnect:function(){Ae(this.$el,"uk-slidenav")},computed:{icon:function(t,e){var n=t.icon;return Oe(e,"uk-slidenav-large")?n+"-large":n}}},Pi={extends:zi,computed:{icon:function(t,e){var n=t.icon;return Oe(e,"uk-search-icon")&&Ot(e,".uk-search-large").length?"search-large":Ot(e,".uk-search-navbar").length?"search-navbar":n}}},Hi={extends:zi,computed:{icon:function(){return"close-"+(Oe(this.$el,"uk-close-large")?"large":"icon")}}},Li={extends:zi,connected:function(){var e=this;this.svg.then(function(t){return 1!==e.ratio&&Le(Te("circle",t),"strokeWidth",1/e.ratio)},Q)}};var Fi={args:"dataSrc",props:{dataSrc:String,dataSrcset:Boolean,sizes:String,width:Number,height:Number,offsetTop:String,offsetLeft:String,target:String},data:{dataSrc:"",dataSrcset:!1,sizes:!1,width:!1,height:!1,offsetTop:"50vh",offsetLeft:0,target:!1},computed:{cacheKey:function(t){var e=t.dataSrc;return this.$name+"."+e},width:function(t){var e=t.width,n=t.dataWidth;return e||n},height:function(t){var e=t.height,n=t.dataHeight;return e||n},sizes:function(t){var e=t.sizes,n=t.dataSizes;return e||n},isImg:function(t,e){return Ui(e)},target:{get:function(t){var e=t.target;return[this.$el].concat(bt(e,this.$el))},watch:function(){this.observe()}},offsetTop:function(t){return wn(t.offsetTop,"height")},offsetLeft:function(t){return wn(t.offsetLeft,"width")}},connected:function(){Ki[this.cacheKey]?ji(this.$el,Ki[this.cacheKey]||this.dataSrc,this.dataSrcset,this.sizes):this.isImg&&this.width&&this.height&&ji(this.$el,function(t,e,n){var i;n&&(i=nt.ratio({width:t,height:e},"width",wn(Vi(n))),t=i.width,e=i.height);return'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="'+t+'" height="'+e+'"></svg>'}(this.width,this.height,this.sizes)),this.observer=new Hn(this.load,{rootMargin:this.offsetTop+"px "+this.offsetLeft+"px"}),requestAnimationFrame(this.observe)},disconnected:function(){this.observer.disconnect()},update:{read:function(t){var e=this,n=t.image;if(n||"complete"!==document.readyState||this.load(this.observer.takeRecords()),this.isImg)return!1;n&&n.then(function(t){return t&&""!==t.currentSrc&&ji(e.$el,Xi(t))})},write:function(t){if(this.dataSrcset&&1!==window.devicePixelRatio){var e=Le(this.$el,"backgroundSize");!e.match(/^(auto\s?)+$/)&&F(e)!==t.bgSize||(t.bgSize=function(t,e){var n=wn(Vi(e)),i=(t.match(qi)||[]).map(F).sort(function(t,e){return t-e});return i.filter(function(t){return n<=t})[0]||i.pop()||""}(this.dataSrcset,this.sizes),Le(this.$el,"backgroundSize",t.bgSize+"px"))}},events:["resize"]},methods:{load:function(t){var e=this;t.some(function(t){return P(t.isIntersecting)||t.isIntersecting})&&(this._data.image=he(this.dataSrc,this.dataSrcset,this.sizes).then(function(t){return ji(e.$el,Xi(t),t.srcset,t.sizes),Ki[e.cacheKey]=Xi(t),t},Q),this.observer.disconnect())},observe:function(){var e=this;!this._data.image&&this._connected&&this.target.forEach(function(t){return e.observer.observe(t)})}}};function ji(t,e,n,i){if(Ui(t))i&&(t.sizes=i),n&&(t.srcset=n),e&&(t.src=e);else if(e){!b(t.style.backgroundImage,e)&&(Le(t,"backgroundImage","url("+zt(e)+")"),qt(t,Ut("load",!1)))}}var Wi=/\s*(.*?)\s*(\w+|calc\(.*?\))\s*(?:,|$)/g;function Vi(t){var e,n;for(Wi.lastIndex=0;e=Wi.exec(t);)if(!e[1]||window.matchMedia(e[1]).matches){e=w(n=e[2],"calc")?n.substring(5,n.length-1).replace(Ri,function(t){return wn(t)}).replace(/ /g,"").match(Yi).reduce(function(t,e){return t+ +e},0):n;break}return e||"100vw"}var Ri=/\d+(?:\w+|%)/g,Yi=/[+-]?(\d+)/g;var qi=/\s+\d+w\s*(?:,|$)/g;function Ui(t){return"IMG"===t.tagName}function Xi(t){return t.currentSrc||t.src}var Ki,Gi="__test__";try{(Ki=window.sessionStorage||{})[Gi]=1,delete Ki[Gi]}catch(t){Ki={}}var Ji={props:{media:Boolean},data:{media:!1},computed:{matchMedia:function(){var t=function(t){if(O(t)){if("@"===t[0])t=F(Ve("breakpoint-"+t.substr(1)));else if(isNaN(t))return t}return!(!t||isNaN(t))&&"(min-width: "+t+"px)"}(this.media);return!t||window.matchMedia(t).matches}}};var Zi={mixins:[ni,Ji],props:{fill:String},data:{fill:"",clsWrapper:"uk-leader-fill",clsHide:"uk-leader-hide",attrFill:"data-fill"},computed:{fill:function(t){return t.fill||Ve("leader-fill-content")}},connected:function(){var t;t=xe(this.$el,'<span class="'+this.clsWrapper+'">'),this.wrapper=t[0]},disconnected:function(){ye(this.wrapper.childNodes)},update:{read:function(t){var e=t.changed,n=t.width,i=n;return{width:n=Math.floor(this.$el.offsetWidth/2),fill:this.fill,changed:e||i!==n,hide:!this.matchMedia}},write:function(t){De(this.wrapper,this.clsHide,t.hide),t.changed&&(t.changed=!1,it(this.wrapper,this.attrFill,new Array(t.width).join(t.fill)))},events:["resize"]}},Qi={props:{container:Boolean},data:{container:!0},computed:{container:function(t){var e=t.container;return!0===e&&this.$container||e&&Te(e)}}},tr=[],er={mixins:[ni,Qi,ii],props:{selPanel:String,selClose:String,escClose:Boolean,bgClose:Boolean,stack:Boolean},data:{cls:"uk-open",escClose:!0,bgClose:!0,overlay:!0,stack:!1},computed:{panel:function(t,e){return Te(t.selPanel,e)},transitionElement:function(){return this.panel},bgClose:function(t){return t.bgClose&&this.panel}},beforeDisconnect:function(){this.isToggled()&&this.toggleNow(this.$el,!1)},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.hide()}},{name:"toggle",self:!0,handler:function(t){t.defaultPrevented||(t.preventDefault(),this.toggle())}},{name:"beforeshow",self:!0,handler:function(t){if(b(tr,this))return!1;!this.stack&&tr.length?(ne.all(tr.map(function(t){return t.hide()})).then(this.show),t.preventDefault()):tr.push(this)}},{name:"show",self:!0,handler:function(){var r=this;an(window)-an(document)&&this.overlay&&Le(document.body,"overflowY","scroll"),Ae(document.documentElement,this.clsPage),this.bgClose&&Yt(this.$el,"hide",di(document,"click",function(t){var e=t.defaultPrevented,n=t.target,i=X(tr);e||i!==r||i.overlay&&!Wt(n,i.$el)||Wt(n,i.panel)||i.hide()}),{self:!0}),this.escClose&&Yt(this.$el,"hide",Vt(document,"keydown",function(t){var e=X(tr);27===t.keyCode&&e===r&&(t.preventDefault(),e.hide())}),{self:!0})}},{name:"hidden",self:!0,handler:function(){var e=this;tr.splice(tr.indexOf(this),1),tr.length||Le(document.body,"overflowY",""),tr.some(function(t){return t.clsPage===e.clsPage})||_e(document.documentElement,this.clsPage)}}],methods:{toggle:function(){return this.isToggled()?this.hide():this.show()},show:function(){var e=this;return this.container&&this.$el.parentNode!==this.container?(pe(this.container,this.$el),new ne(function(t){return requestAnimationFrame(function(){return e.show().then(t)})})):this.toggleElement(this.$el,!0,nr(this))},hide:function(){return this.toggleElement(this.$el,!1,nr(this))}}};function nr(t){var s=t.transitionElement,a=t._toggle;return function(r,o){return new ne(function(n,i){return Yt(r,"show hide",function(){r._reject&&r._reject(),r._reject=i,a(r,o);var t=Yt(s,"transitionstart",function(){Yt(s,"transitionend transitioncancel",n,{self:!0}),clearTimeout(e)},{self:!0}),e=setTimeout(function(){t(),n()},R(Le(s,"transitionDuration")))})})}}var ir={install:function(a){a.modal.dialog=function(t,e){var n=a.modal(' <div class="uk-modal"> <div class="uk-modal-dialog">'+t+"</div> </div> ",e);return n.show(),Vt(n.$el,"hidden",function(){return ne.resolve(function(){return n.$destroy(!0)})},{self:!0}),n},a.modal.alert=function(e,n){return n=U({bgClose:!1,escClose:!1,labels:a.modal.labels},n),new ne(function(t){return Vt(a.modal.dialog(' <div class="uk-modal-body">'+(O(e)?e:fe(e))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-primary uk-modal-close" autofocus>'+n.labels.ok+"</button> </div> ",n).$el,"hide",t)})},a.modal.confirm=function(r,o){return o=U({bgClose:!1,escClose:!0,labels:a.modal.labels},o),new ne(function(e,t){var n=a.modal.dialog(' <form> <div class="uk-modal-body">'+(O(r)?r:fe(r))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+o.labels.cancel+'</button> <button class="uk-button uk-button-primary" autofocus>'+o.labels.ok+"</button> </div> </form> ",o),i=!1;Vt(n.$el,"submit","form",function(t){t.preventDefault(),e(),i=!0,n.hide()}),Vt(n.$el,"hide",function(){i||t()})})},a.modal.prompt=function(t,o,s){return s=U({bgClose:!1,escClose:!0,labels:a.modal.labels},s),new ne(function(e){var n=a.modal.dialog(' <form class="uk-form-stacked"> <div class="uk-modal-body"> <label>'+(O(t)?t:fe(t))+'</label> <input class="uk-input" autofocus> </div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+s.labels.cancel+'</button> <button class="uk-button uk-button-primary">'+s.labels.ok+"</button> </div> </form> ",s),i=Te("input",n.$el);i.value=o;var r=!1;Vt(n.$el,"submit","form",function(t){t.preventDefault(),e(i.value),r=!0,n.hide()}),Vt(n.$el,"hide",function(){r||e(null)})})},a.modal.labels={ok:"Ok",cancel:"Cancel"}},mixins:[er],data:{clsPage:"uk-modal-page",selPanel:".uk-modal-dialog",selClose:".uk-modal-close, .uk-modal-close-default, .uk-modal-close-outside, .uk-modal-close-full"},events:[{name:"show",self:!0,handler:function(){Oe(this.panel,"uk-margin-auto-vertical")?Ae(this.$el,"uk-flex"):Le(this.$el,"display","block"),sn(this.$el)}},{name:"hidden",self:!0,handler:function(){Le(this.$el,"display",""),_e(this.$el,"uk-flex")}}]};var rr={extends:ri,data:{targets:"> .uk-parent",toggle:"> a",content:"> ul"}},or={mixins:[ni,xi],props:{dropdown:String,mode:"list",align:String,offset:Number,boundary:Boolean,boundaryAlign:Boolean,clsDrop:String,delayShow:Number,delayHide:Number,dropbar:Boolean,dropbarMode:String,dropbarAnchor:Boolean,duration:Number},data:{dropdown:".uk-navbar-nav > li",align:ht?"right":"left",clsDrop:"uk-navbar-dropdown",mode:void 0,offset:void 0,delayShow:void 0,delayHide:void 0,boundaryAlign:void 0,flip:"x",boundary:!0,dropbar:!1,dropbarMode:"slide",dropbarAnchor:!1,duration:200,forceHeight:!0,selMinHeight:".uk-navbar-nav > li > a, .uk-navbar-item, .uk-navbar-toggle"},computed:{boundary:function(t,e){var n=t.boundary,i=t.boundaryAlign;return!0===n||i?e:n},dropbarAnchor:function(t,e){return wt(t.dropbarAnchor,e)},pos:function(t){return"bottom-"+t.align},dropdowns:function(t,e){return Ee(t.dropdown+" ."+t.clsDrop,e)}},beforeConnect:function(){var t=this.$props.dropbar;this.dropbar=t&&(wt(t,this.$el)||Te("+ .uk-navbar-dropbar",this.$el)||Te("<div></div>")),this.dropbar&&(Ae(this.dropbar,"uk-navbar-dropbar"),"slide"===this.dropbarMode&&Ae(this.dropbar,"uk-navbar-dropbar-slide"))},disconnected:function(){this.dropbar&&we(this.dropbar)},update:function(){var e=this;this.$create("drop",this.dropdowns.filter(function(t){return!e.getDropdown(t)}),U({},this.$props,{boundary:this.boundary,pos:this.pos,offset:this.dropbar||this.offset}))},events:[{name:"mouseover",delegate:function(){return this.dropdown},handler:function(t){var e=t.current,n=this.getActive();n&&n.toggle&&!Wt(n.toggle.$el,e)&&!n.tracker.movesTo(n.$el)&&n.hide(!1)}},{name:"mouseleave",el:function(){return this.dropbar},handler:function(){var t=this.getActive();t&&!this.dropdowns.some(function(t){return _t(t,":hover")})&&t.hide()}},{name:"beforeshow",capture:!0,filter:function(){return this.dropbar},handler:function(){this.dropbar.parentNode||ge(this.dropbarAnchor||this.$el,this.dropbar)}},{name:"show",capture:!0,filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el,i=e.dir;this.clsDrop&&Ae(n,this.clsDrop+"-dropbar"),"bottom"===i&&this.transitionTo(n.offsetHeight+F(Le(n,"marginTop"))+F(Le(n,"marginBottom")),n)}},{name:"beforehide",filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el,i=this.getActive();_t(this.dropbar,":hover")&&i&&i.$el===n&&t.preventDefault()}},{name:"hide",filter:function(){return this.dropbar},handler:function(t,e){var n=e.$el,i=this.getActive();(!i||i&&i.$el===n)&&this.transitionTo(0)}}],methods:{getActive:function(){var t=this.dropdowns.map(this.getDropdown).filter(function(t){return t&&t.isActive()})[0];return t&&b(t.mode,"hover")&&Wt(t.toggle.$el,this.$el)&&t},transitionTo:function(t,e){var n=this,i=this.dropbar,r=Ht(i)?sn(i):0;return Le(e=r<t&&e,"clip","rect(0,"+e.offsetWidth+"px,"+r+"px,0)"),sn(i,r),Xe.cancel([e,i]),ne.all([Xe.start(i,{height:t},this.duration),Xe.start(e,{clip:"rect(0,"+e.offsetWidth+"px,"+t+"px,0)"},this.duration)]).catch(Q).then(function(){Le(e,{clip:""}),n.$update(i)})},getDropdown:function(t){return this.$getComponent(t,"drop")||this.$getComponent(t,"dropdown")}}},sr={mixins:[er],args:"mode",props:{mode:String,flip:Boolean,overlay:Boolean},data:{mode:"slide",flip:!1,overlay:!1,clsPage:"uk-offcanvas-page",clsContainer:"uk-offcanvas-container",selPanel:".uk-offcanvas-bar",clsFlip:"uk-offcanvas-flip",clsContainerAnimation:"uk-offcanvas-container-animation",clsSidebarAnimation:"uk-offcanvas-bar-animation",clsMode:"uk-offcanvas",clsOverlay:"uk-offcanvas-overlay",selClose:".uk-offcanvas-close",container:!1},computed:{clsFlip:function(t){var e=t.flip,n=t.clsFlip;return e?n:""},clsOverlay:function(t){var e=t.overlay,n=t.clsOverlay;return e?n:""},clsMode:function(t){var e=t.mode;return t.clsMode+"-"+e},clsSidebarAnimation:function(t){var e=t.mode,n=t.clsSidebarAnimation;return"none"===e||"reveal"===e?"":n},clsContainerAnimation:function(t){var e=t.mode,n=t.clsContainerAnimation;return"push"!==e&&"reveal"!==e?"":n},transitionElement:function(t){return"reveal"===t.mode?this.panel.parentNode:this.panel}},events:[{name:"click",delegate:function(){return'a[href^="#"]'},handler:function(t){var e=t.current.hash;!t.defaultPrevented&&e&&Te(e,document.body)&&this.hide()}},{name:"touchstart",passive:!0,el:function(){return this.panel},handler:function(t){var e=t.targetTouches;1===e.length&&(this.clientY=e[0].clientY)}},{name:"touchmove",self:!0,passive:!1,filter:function(){return this.overlay},handler:function(t){t.cancelable&&t.preventDefault()}},{name:"touchmove",passive:!1,el:function(){return this.panel},handler:function(t){if(1===t.targetTouches.length){var e=event.targetTouches[0].clientY-this.clientY,n=this.panel,i=n.scrollTop,r=n.scrollHeight,o=n.clientHeight;(r<=o||0===i&&0<e||r-i<=o&&e<0)&&t.cancelable&&t.preventDefault()}}},{name:"show",self:!0,handler:function(){"reveal"!==this.mode||Oe(this.panel.parentNode,this.clsMode)||(be(this.panel,"<div>"),Ae(this.panel.parentNode,this.clsMode)),Le(document.documentElement,"overflowY",this.overlay?"hidden":""),Ae(document.body,this.clsContainer,this.clsFlip),Le(document.body,"touch-action","pan-y pinch-zoom"),Le(this.$el,"display","block"),Ae(this.$el,this.clsOverlay),Ae(this.panel,this.clsSidebarAnimation,"reveal"!==this.mode?this.clsMode:""),sn(document.body),Ae(document.body,this.clsContainerAnimation),this.clsContainerAnimation&&(ar().content+=",user-scalable=0")}},{name:"hide",self:!0,handler:function(){_e(document.body,this.clsContainerAnimation),Le(document.body,"touch-action","")}},{name:"hidden",self:!0,handler:function(){this.clsContainerAnimation&&function(){var t=ar();t.content=t.content.replace(/,user-scalable=0$/,"")}(),"reveal"===this.mode&&ye(this.panel),_e(this.panel,this.clsSidebarAnimation,this.clsMode),_e(this.$el,this.clsOverlay),Le(this.$el,"display",""),_e(document.body,this.clsContainer,this.clsFlip),Le(document.documentElement,"overflowY","")}},{name:"swipeLeft swipeRight",handler:function(t){this.isToggled()&&u(t.type,"Left")^this.flip&&this.hide()}}]};function ar(){return Te('meta[name="viewport"]',document.head)||pe(document.head,'<meta name="viewport">')}var hr={mixins:[ni],props:{selContainer:String,selContent:String},data:{selContainer:".uk-modal",selContent:".uk-modal-dialog"},computed:{container:function(t,e){return Mt(e,t.selContainer)},content:function(t,e){return Mt(e,t.selContent)}},connected:function(){Le(this.$el,"minHeight",150)},update:{read:function(){return!(!this.content||!this.container)&&{current:F(Le(this.$el,"maxHeight")),max:Math.max(150,sn(this.container)-(nn(this.content).height-sn(this.$el)))}},write:function(t){var e=t.current,n=t.max;Le(this.$el,"maxHeight",n),Math.round(e)!==Math.round(n)&&qt(this.$el,"resize")},events:["resize"]}},cr={props:["width","height"],connected:function(){Ae(this.$el,"uk-responsive-width")},update:{read:function(){return!!(Ht(this.$el)&&this.width&&this.height)&&{width:an(this.$el.parentNode),height:this.height}},write:function(t){sn(this.$el,nt.contain({height:this.height,width:this.width},t).height)},events:["resize"]}},ur={props:{duration:Number,offset:Number},data:{duration:1e3,offset:0},methods:{scrollTo:function(e){var n=this;e=e&&Te(e)||document.body;var t=sn(document),i=sn(window),r=nn(e).top-this.offset;if(t<r+i&&(r=t-i),qt(this.$el,"beforescroll",[this,e])){var o=Date.now(),s=window.pageYOffset,a=function(){var t=s+(r-s)*function(t){return.5*(1-Math.cos(Math.PI*t))}(Z((Date.now()-o)/n.duration));gn(window,t),t!==r?requestAnimationFrame(a):qt(n.$el,"scrolled",[n,e])};a()}}},events:{click:function(t){t.defaultPrevented||(t.preventDefault(),this.scrollTo(zt(decodeURIComponent(this.$el.hash)).substr(1)))}}};var lr={args:"cls",props:{cls:String,target:String,hidden:Boolean,offsetTop:Number,offsetLeft:Number,repeat:Boolean,delay:Number},data:function(){return{cls:!1,target:!1,hidden:!0,offsetTop:0,offsetLeft:0,repeat:!1,delay:0,inViewClass:"uk-scrollspy-inview"}},computed:{elements:function(t,e){var n=t.target;return n?Ee(n,e):[e]}},update:[{write:function(){this.hidden&&Le(jt(this.elements,":not(."+this.inViewClass+")"),"visibility","hidden")}},{read:function(t){var n=this;t.update&&this.elements.forEach(function(t){var e=t._ukScrollspyState;(e=e||{cls:st(t,"uk-scrollspy-class")||n.cls}).show=pn(t,n.offsetTop,n.offsetLeft),t._ukScrollspyState=e})},write:function(i){var r=this;if(!i.update)return this.$emit(),i.update=!0;this.elements.forEach(function(e){function t(t){Le(e,"visibility",!t&&r.hidden?"hidden":""),De(e,r.inViewClass,t),De(e,n.cls),qt(e,t?"inview":"outview"),n.inview=t,r.$update(e)}var n=e._ukScrollspyState;!n.show||n.inview||n.queued?!n.show&&n.inview&&!n.queued&&r.repeat&&t(!1):(n.queued=!0,i.promise=(i.promise||ne.resolve()).then(function(){return new ne(function(t){return setTimeout(t,r.delay)})}).then(function(){t(!0),setTimeout(function(){return n.queued=!1},300)}))})},events:["scroll","resize"]}]},dr={props:{cls:String,closest:String,scroll:Boolean,overflow:Boolean,offset:Number},data:{cls:"uk-active",closest:!1,scroll:!1,overflow:!0,offset:0},computed:{links:function(t,e){return Ee('a[href^="#"]',e).filter(function(t){return t.hash})},elements:function(t){var e=t.closest;return Mt(this.links,e||"*")},targets:function(){return Ee(this.links.map(function(t){return zt(t.hash).substr(1)}).join(","))}},update:[{read:function(){this.scroll&&this.$create("scroll",this.links,{offset:this.offset||0})}},{read:function(o){var s=this,a=window.pageYOffset+this.offset+1,h=sn(document)-sn(window)+this.offset;o.active=!1,this.targets.every(function(t,e){var n=nn(t).top,i=e+1===s.targets.length;if(!s.overflow&&(0===e&&a<n||i&&n+t.offsetTop<a))return!1;if(!i&&nn(s.targets[e+1]).top<=a)return!0;if(h<=a)for(var r=s.targets.length-1;e<r;r--)if(pn(s.targets[r])){t=s.targets[r];break}return!(o.active=Te(jt(s.links,'[href="#'+t.id+'"]')))})},write:function(t){var e=t.active;this.links.forEach(function(t){return t.blur()}),_e(this.elements,this.cls),e&&qt(this.$el,"active",[e,Ae(this.closest?Mt(e,this.closest):e,this.cls)])},events:["scroll","resize"]}]},fr={mixins:[ni,Ji],props:{top:null,bottom:Boolean,offset:String,animation:String,clsActive:String,clsInactive:String,clsFixed:String,clsBelow:String,selTarget:String,widthElement:Boolean,showOnUp:Boolean,targetOffset:Number},data:{top:0,bottom:!1,offset:0,animation:"",clsActive:"uk-active",clsInactive:"",clsFixed:"uk-sticky-fixed",clsBelow:"uk-sticky-below",selTarget:"",widthElement:!1,showOnUp:!1,targetOffset:!1},computed:{offset:function(t){return wn(t.offset)},selTarget:function(t,e){var n=t.selTarget;return n&&Te(n,e)||e},widthElement:function(t,e){return wt(t.widthElement,e)||this.placeholder},isActive:{get:function(){return Oe(this.selTarget,this.clsActive)},set:function(t){t&&!this.isActive?(Me(this.selTarget,this.clsInactive,this.clsActive),qt(this.$el,"active")):t||Oe(this.selTarget,this.clsInactive)||(Me(this.selTarget,this.clsActive,this.clsInactive),qt(this.$el,"inactive"))}}},connected:function(){this.placeholder=Te("+ .uk-sticky-placeholder",this.$el)||Te('<div class="uk-sticky-placeholder"></div>'),this.isFixed=!1,this.isActive=!1},disconnected:function(){this.isFixed&&(this.hide(),_e(this.selTarget,this.clsInactive)),we(this.placeholder),this.placeholder=null,this.widthElement=null},events:[{name:"load hashchange popstate",el:window,handler:function(){var i=this;if(!1!==this.targetOffset&&location.hash&&0<window.pageYOffset){var r=Te(location.hash);r&&kn.read(function(){var t=nn(r).top,e=nn(i.$el).top,n=i.$el.offsetHeight;i.isFixed&&t<=e+n&&e<=t+r.offsetHeight&&gn(window,t-n-(z(i.targetOffset)?i.targetOffset:0)-i.offset)})}}}],update:[{read:function(t,e){var n=t.height;this.isActive&&"update"!==e&&(this.hide(),n=this.$el.offsetHeight,this.show()),n=this.isActive?n:this.$el.offsetHeight,this.topOffset=nn(this.isFixed?this.placeholder:this.$el).top,this.bottomOffset=this.topOffset+n;var i=pr("bottom",this);return this.top=Math.max(F(pr("top",this)),this.topOffset)-this.offset,this.bottom=i&&i-n,this.inactive=!this.matchMedia,{lastScroll:!1,height:n,margins:Le(this.$el,["marginTop","marginBottom","marginLeft","marginRight"])}},write:function(t){var e=t.height,n=t.margins,i=this.placeholder;Le(i,U({height:e},n)),Wt(i,document)||(ge(this.$el,i),it(i,"hidden","")),this.isActive=this.isActive},events:["resize"]},{read:function(t){var e=t.scroll;return void 0===e&&(e=0),this.width=(Ht(this.widthElement)?this.widthElement:this.$el).offsetWidth,this.scroll=window.pageYOffset,{dir:e<=this.scroll?"down":"up",scroll:this.scroll,visible:Ht(this.$el),top:vn(this.placeholder)[0]}},write:function(t,e){var n=this,i=t.initTimestamp;void 0===i&&(i=0);var r=t.dir,o=t.lastDir,s=t.lastScroll,a=t.scroll,h=t.top,c=t.visible,u=performance.now();if(!((t.lastScroll=a)<0||a===s||!c||this.disabled||this.showOnUp&&"scroll"!==e||((300<u-i||r!==o)&&(t.initScroll=a,t.initTimestamp=u),t.lastDir=r,this.showOnUp&&Math.abs(t.initScroll-a)<=30&&Math.abs(s-a)<=10)))if(this.inactive||a<this.top||this.showOnUp&&(a<=this.top||"down"===r||"up"===r&&!this.isFixed&&a<=this.bottomOffset)){if(!this.isFixed)return void(Qe.inProgress(this.$el)&&a<h&&(Qe.cancel(this.$el),this.hide()));this.isFixed=!1,this.animation&&a>this.topOffset?(Qe.cancel(this.$el),Qe.out(this.$el,this.animation).then(function(){return n.hide()},Q)):this.hide()}else this.isFixed?this.update():this.animation?(Qe.cancel(this.$el),this.show(),Qe.in(this.$el,this.animation).catch(Q)):this.show()},events:["resize","scroll"]}],methods:{show:function(){this.isFixed=!0,this.update(),it(this.placeholder,"hidden",null)},hide:function(){this.isActive=!1,_e(this.$el,this.clsFixed,this.clsBelow),Le(this.$el,{position:"",top:"",width:""}),it(this.placeholder,"hidden","")},update:function(){var t=0!==this.top||this.scroll>this.top,e=Math.max(0,this.offset);this.bottom&&this.scroll>this.bottom-this.offset&&(e=this.bottom-this.scroll),Le(this.$el,{position:"fixed",top:e+"px",width:this.width}),this.isActive=t,De(this.$el,this.clsBelow,this.scroll>this.bottomOffset),Ae(this.$el,this.clsFixed)}}};function pr(t,e){var n=e.$props,i=e.$el,r=e[t+"Offset"],o=n[t];if(o)return z(o)&&O(o)&&o.match(/^-?\d/)?r+wn(o):nn(!0===o?i.parentNode:wt(o,i)).bottom}var mr,gr={mixins:[ii],args:"connect",props:{connect:String,toggle:String,active:Number,swiping:Boolean},data:{connect:"~.uk-switcher",toggle:"> * > :first-child",active:0,swiping:!0,cls:"uk-active",clsContainer:"uk-switcher",attrItem:"uk-switcher-item",queued:!0},computed:{connects:function(t,e){return bt(t.connect,e)},toggles:function(t,e){return Ee(t.toggle,e)}},events:[{name:"click",delegate:function(){return this.toggle+":not(.uk-disabled)"},handler:function(e){e.preventDefault(),this.show(W(this.$el.children).filter(function(t){return Wt(e.current,t)})[0])}},{name:"click",el:function(){return this.connects},delegate:function(){return"["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.show(st(t.current,this.attrItem))}},{name:"swipeRight swipeLeft",filter:function(){return this.swiping},el:function(){return this.connects},handler:function(t){var e=t.type;this.show(u(e,"Left")?"next":"previous")}}],update:function(){var e=this;this.connects.forEach(function(t){return e.updateAria(t.children)});var t=this.$el.children;this.show(jt(t,"."+this.cls)[0]||t[this.active]||t[0]),this.swiping&&Le(this.connects,"touch-action","pan-y pinch-zoom")},methods:{index:function(){return B(this.connects)?-1:ue(jt(this.connects[0].children,"."+this.cls)[0])},show:function(t){for(var e,n,i=this,r=this.$el.children,o=r.length,s=this.index(),a=0<=s,h="previous"===t?-1:1,c=le(t,r,s),u=0;u<o;u++,c=(c+h+o)%o)if(!_t(this.toggles[c],".uk-disabled *, .uk-disabled, [disabled]")){e=this.toggles[c],n=r[c];break}n&&s!==c&&(_e(r,this.cls),Ae(n,this.cls),it(this.toggles,"aria-expanded",!1),it(e,"aria-expanded",!0),this.connects.forEach(function(t){a?i.toggleElement([t.children[s],t.children[c]]):i.toggleNow(t.children[c])}))}}},vr={mixins:[ni],extends:gr,props:{media:Boolean},data:{media:960,attrItem:"uk-tab-item"},connected:function(){var t=Oe(this.$el,"uk-tab-left")?"uk-tab-left":!!Oe(this.$el,"uk-tab-right")&&"uk-tab-right";t&&this.$create("toggle",this.$el,{cls:t,mode:"media",media:this.media})}},wr={mixins:[Ji,ii],args:"target",props:{href:String,target:null,mode:"list"},data:{href:!1,target:!1,mode:"click",queued:!0},computed:{target:function(t,e){var n=t.href,i=t.target;return(i=bt(i||n,e)).length&&i||[e]}},connected:function(){qt(this.target,"updatearia",[this])},events:[{name:mt+" "+gt,filter:function(){return b(this.mode,"hover")},handler:function(t){Qt(t)||this.toggle("toggle"+(t.type===mt?"show":"hide"))}},{name:"click",filter:function(){return b(this.mode,"click")||lt&&b(this.mode,"hover")},handler:function(t){var e;(Mt(t.target,'a[href="#"], a[href=""]')||(e=Mt(t.target,"a[href]"))&&(this.cls&&!Oe(this.target,this.cls.split(" ")[0])||!Ht(this.target)||e.hash&&_t(this.target,e.hash)))&&t.preventDefault(),this.toggle()}}],update:{read:function(){return!(!b(this.mode,"media")||!this.media)&&{match:this.matchMedia}},write:function(t){var e=t.match,n=this.isToggled(this.target);(e?!n:n)&&this.toggle()},events:["resize"]},methods:{toggle:function(t){qt(this.target,t||"toggle",[this])&&this.toggleElement(this.target)}}};Fn.version="3.2.3",(mr=Fn).component("accordion",ri),mr.component("alert",oi),mr.component("cover",ci),mr.component("drop",li),mr.component("dropdown",fi),mr.component("formCustom",pi),mr.component("gif",mi),mr.component("grid",bi),mr.component("heightMatch",yi),mr.component("heightViewport",Ii),mr.component("icon",Di),mr.component("img",Fi),mr.component("leader",Zi),mr.component("margin",gi),mr.component("modal",ir),mr.component("nav",rr),mr.component("navbar",or),mr.component("offcanvas",sr),mr.component("overflowAuto",hr),mr.component("responsive",cr),mr.component("scroll",ur),mr.component("scrollspy",lr),mr.component("scrollspyNav",dr),mr.component("sticky",fr),mr.component("svg",Ti),mr.component("switcher",gr),mr.component("tab",vr),mr.component("toggle",wr),mr.component("video",hi),mr.component("close",Hi),mr.component("marker",zi),mr.component("navbarToggleIcon",zi),mr.component("overlayIcon",zi),mr.component("paginationNext",zi),mr.component("paginationPrevious",zi),mr.component("searchIcon",Pi),mr.component("slidenavNext",Bi),mr.component("slidenavPrevious",Bi),mr.component("spinner",Li),mr.component("totop",zi),mr.use(si);var br={mixins:[ni],props:{date:String,clsWrapper:String},data:{date:"",clsWrapper:".uk-countdown-%unit%"},computed:{date:function(t){var e=t.date;return Date.parse(e)},days:function(t,e){return Te(t.clsWrapper.replace("%unit%","days"),e)},hours:function(t,e){return Te(t.clsWrapper.replace("%unit%","hours"),e)},minutes:function(t,e){return Te(t.clsWrapper.replace("%unit%","minutes"),e)},seconds:function(t,e){return Te(t.clsWrapper.replace("%unit%","seconds"),e)},units:function(){var e=this;return["days","hours","minutes","seconds"].filter(function(t){return e[t]})}},connected:function(){this.start()},disconnected:function(){var e=this;this.stop(),this.units.forEach(function(t){return de(e[t])})},events:[{name:"visibilitychange",el:document,handler:function(){document.hidden?this.stop():this.start()}}],update:{write:function(){var i=this,r=function(t){var e=t-Date.now();return{total:e,seconds:e/1e3%60,minutes:e/1e3/60%60,hours:e/1e3/60/60%24,days:e/1e3/60/60/24}}(this.date);r.total<=0&&(this.stop(),r.days=r.hours=r.minutes=r.seconds=0),this.units.forEach(function(t){var e=String(Math.floor(r[t]));e=e.length<2?"0"+e:e;var n=i[t];n.textContent!==e&&((e=e.split("")).length!==n.children.length&&fe(n,e.map(function(){return"<span></span>"}).join("")),e.forEach(function(t,e){return n.children[e].textContent=t}))})}},methods:{start:function(){var t=this;this.stop(),this.date&&this.units.length&&(this.$emit(),this.timer=setInterval(function(){return t.$emit()},1e3))},stop:function(){this.timer&&(clearInterval(this.timer),this.timer=null)}}};var xr,yr="uk-animation-target",kr={props:{animation:Number},data:{animation:150},computed:{target:function(){return this.$el}},methods:{animate:function(t){var i=this;!function(){if(xr)return;(xr=pe(document.head,"<style>").sheet).insertRule("."+yr+" > * {\n            margin-top: 0 !important;\n            transform: none !important;\n        }",0)}();var r=W(this.target.children),o=r.map(function(t){return $r(t,!0)}),e=sn(this.target),n=window.pageYOffset;t(),Xe.cancel(this.target),r.forEach(Xe.cancel),Ir(this.target),this.$update(this.target),kn.flush();var s=sn(this.target),a=(r=r.concat(W(this.target.children).filter(function(t){return!b(r,t)}))).map(function(t,e){return!!(t.parentNode&&e in o)&&(o[e]?Ht(t)?Sr(t):{opacity:0}:{opacity:Ht(t)?1:0})});return o=a.map(function(t,e){var n=r[e].parentNode===i.target&&(o[e]||$r(r[e]));if(n)if(t){if(!("opacity"in t)){n.opacity%1?t.opacity=1:delete n.opacity}}else delete n.opacity;return n}),Ae(this.target,yr),r.forEach(function(t,e){return o[e]&&Le(t,o[e])}),Le(this.target,"height",e),gn(window,n),ne.all(r.map(function(t,e){return o[e]&&a[e]?Xe.start(t,a[e],i.animation,"ease"):ne.resolve()}).concat(Xe.start(this.target,{height:s},this.animation,"ease"))).then(function(){r.forEach(function(t,e){return Le(t,{display:0===a[e].opacity?"none":"",zIndex:""})}),Ir(i.target),i.$update(i.target),kn.flush()},Q)}}};function $r(t,e){var n=Le(t,"zIndex");return!!Ht(t)&&U({display:"",opacity:e?Le(t,"opacity"):"0",pointerEvents:"none",position:"absolute",zIndex:"auto"===n?ue(t):n},Sr(t))}function Ir(t){Le(t.children,{height:"",left:"",opacity:"",pointerEvents:"",position:"",top:"",width:""}),_e(t,yr),Le(t,"height","")}function Sr(t){var e=t.getBoundingClientRect(),n=e.height,i=e.width,r=on(t),o=r.top,s=r.left;return{top:o+=F(Le(t,"marginTop")),left:s,height:n,width:i}}var Tr={mixins:[kr],args:"target",props:{target:Boolean,selActive:Boolean},data:{target:null,selActive:!1,attrItem:"uk-filter-control",cls:"uk-active",animation:250},computed:{toggles:{get:function(t,e){t.attrItem;return Ee("["+this.attrItem+"],[data-"+this.attrItem+"]",e)},watch:function(){this.updateState()}},target:function(t,e){return Te(t.target,e)},children:{get:function(){return W(this.target&&this.target.children)},watch:function(t,e){!function(t,e){return t.length===e.length&&t.every(function(t){return~e.indexOf(t)})}(t,e)&&this.updateState()}}},events:[{name:"click",delegate:function(){return"["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.apply(t.current)}}],connected:function(){var e=this;if(this.updateState(),!1!==this.selActive){var n=Ee(this.selActive,this.$el);this.toggles.forEach(function(t){return De(t,e.cls,b(n,t))})}},methods:{apply:function(t){this.setState(Cr(t,this.attrItem,this.getState()))},getState:function(){var n=this;return this.toggles.filter(function(t){return Oe(t,n.cls)}).reduce(function(t,e){return Cr(e,n.attrItem,t)},{filter:{"":""},sort:[]})},setState:function(o,t){var s=this;void 0===t&&(t=!0),o=U({filter:{"":""},sort:[]},o),qt(this.$el,"beforeFilter",[this,o]);var a=this.children;this.toggles.forEach(function(t){return De(t,s.cls,!!function(t,e,n){var i=n.filter;void 0===i&&(i={"":""});var r=n.sort,o=r[0],s=r[1],a=Er(t,e),h=a.filter;void 0===h&&(h="");var c=a.group;void 0===c&&(c="");var u=a.sort,l=a.order;void 0===l&&(l="asc");return P(u)?c in i&&h===i[c]||!h&&c&&!(c in i)&&!i[""]:o===u&&s===l}(t,s.attrItem,o))});function e(){var e=function(t){var e=t.filter,n="";return K(e,function(t){return n+=t||""}),n}(o);a.forEach(function(t){return Le(t,"display",e&&!_t(t,e)?"none":"")});var t=o.sort,n=t[0],i=t[1];if(n){var r=function(t,n,i){return U([],t).sort(function(t,e){return st(t,n).localeCompare(st(e,n),void 0,{numeric:!0})*("asc"===i||-1)})}(a,n,i);Y(r,a)||r.forEach(function(t){return pe(s.target,t)})}}t?this.animate(e).then(function(){return qt(s.$el,"afterFilter",[s])}):(e(),qt(this.$el,"afterFilter",[this]))},updateState:function(){var t=this;kn.write(function(){return t.setState(t.getState(),!1)})}}};function Er(t,e){return Dn(st(t,e),["filter"])}function Cr(t,e,n){var i=Er(t,e),r=i.filter,o=i.group,s=i.sort,a=i.order;return void 0===a&&(a="asc"),(r||P(s))&&(o?r?(delete n.filter[""],n.filter[o]=r):(delete n.filter[o],(B(n.filter)||""in n.filter)&&(n.filter={"":r||""})):n.filter={"":r||""}),P(s)||(n.sort=[s,a]),n}var Ar={slide:{show:function(t){return[{transform:Nr(-100*t)},{transform:Nr()}]},percent:function(t){return _r(t)},translate:function(t,e){return[{transform:Nr(-100*e*t)},{transform:Nr(100*e*(1-t))}]}}};function _r(t){return Math.abs(Le(t,"transform").split(",")[4]/t.offsetWidth)||0}function Nr(t,e){return void 0===t&&(t=0),void 0===e&&(e="%"),t+=t?e:"",at?"translateX("+t+")":"translate3d("+t+", 0, 0)"}function Mr(t){return"scale3d("+t+", "+t+", 1)"}var Or=U({},Ar,{fade:{show:function(){return[{opacity:0},{opacity:1}]},percent:function(t){return 1-Le(t,"opacity")},translate:function(t){return[{opacity:1-t},{opacity:t}]}},scale:{show:function(){return[{opacity:0,transform:Mr(.8)},{opacity:1,transform:Mr(1)}]},percent:function(t){return 1-Le(t,"opacity")},translate:function(t){return[{opacity:1-t,transform:Mr(1-.2*t)},{opacity:t,transform:Mr(.8+.2*t)}]}}});function Dr(t,e,n){qt(t,Ut(e,!1,!1,n))}var zr={mixins:[{props:{autoplay:Boolean,autoplayInterval:Number,pauseOnHover:Boolean},data:{autoplay:!1,autoplayInterval:7e3,pauseOnHover:!0},connected:function(){this.autoplay&&this.startAutoplay()},disconnected:function(){this.stopAutoplay()},update:function(){it(this.slides,"tabindex","-1")},events:[{name:"visibilitychange",el:document,filter:function(){return this.autoplay},handler:function(){document.hidden?this.stopAutoplay():this.startAutoplay()}}],methods:{startAutoplay:function(){var t=this;this.stopAutoplay(),this.interval=setInterval(function(){return(!t.draggable||!Te(":focus",t.$el))&&(!t.pauseOnHover||!_t(t.$el,":hover"))&&!t.stack.length&&t.show("next")},this.autoplayInterval)},stopAutoplay:function(){this.interval&&clearInterval(this.interval)}}},{props:{draggable:Boolean},data:{draggable:!0,threshold:10},created:function(){var i=this;["start","move","end"].forEach(function(t){var n=i[t];i[t]=function(t){var e=te(t).x*(ht?-1:1);i.prevPos=e!==i.pos?i.pos:i.prevPos,i.pos=e,n(t)}})},events:[{name:dt,delegate:function(){return this.selSlides},handler:function(t){!this.draggable||!Qt(t)&&function(t){return!t.children.length&&t.childNodes.length}(t.target)||Mt(t.target,Lt)||0<t.button||this.length<2||this.start(t)}},{name:"touchmove",passive:!1,handler:"move",delegate:function(){return this.selSlides}},{name:"dragstart",handler:function(t){t.preventDefault()}}],methods:{start:function(){var t=this;this.drag=this.pos,this._transitioner?(this.percent=this._transitioner.percent(),this.drag+=this._transitioner.getDistance()*this.percent*this.dir,this._transitioner.cancel(),this._transitioner.translate(this.percent),this.dragging=!0,this.stack=[]):this.prevIndex=this.index;var e="touchmove"!=ft?Vt(document,ft,this.move,{passive:!1}):Q;this.unbindMove=function(){e(),t.unbindMove=null},Vt(window,"scroll",this.unbindMove),Vt(document,pt,this.end,!0),Le(this.list,"userSelect","none")},move:function(t){var e=this;if(this.unbindMove){var n=this.pos-this.drag;if(!(0==n||this.prevPos===this.pos||!this.dragging&&Math.abs(n)<this.threshold)){Le(this.list,"pointerEvents","none"),t.cancelable&&t.preventDefault(),this.dragging=!0,this.dir=n<0?1:-1;for(var i=this.slides,r=this.prevIndex,o=Math.abs(n),s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||i[r].offsetWidth;s!==r&&a<o;)this.drag-=a*this.dir,r=s,o-=a,s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||i[r].offsetWidth;this.percent=o/a;var h,c=i[r],u=i[s],l=this.index!==s,d=r===s;[this.index,this.prevIndex].filter(function(t){return!b([s,r],t)}).forEach(function(t){qt(i[t],"itemhidden",[e]),d&&(h=!0,e.prevIndex=r)}),(this.index===r&&this.prevIndex!==r||h)&&qt(i[this.index],"itemshown",[this]),l&&(this.prevIndex=r,this.index=s,d||qt(c,"beforeitemhide",[this]),qt(u,"beforeitemshow",[this])),this._transitioner=this._translate(Math.abs(this.percent),c,!d&&u),l&&(d||qt(c,"itemhide",[this]),qt(u,"itemshow",[this]))}}},end:function(){if(Rt(window,"scroll",this.unbindMove),this.unbindMove&&this.unbindMove(),Rt(document,pt,this.end,!0),this.dragging)if(this.dragging=null,this.index===this.prevIndex)this.percent=1-this.percent,this.dir*=-1,this._show(!1,this.index,!0),this._transitioner=null;else{var t=(ht?this.dir*(ht?1:-1):this.dir)<0==this.prevPos>this.pos;this.index=t?this.index:this.prevIndex,t&&(this.percent=1-this.percent),this.show(0<this.dir&&!t||this.dir<0&&t?"next":"previous",!0)}Le(this.list,{userSelect:"",pointerEvents:""}),this.drag=this.percent=null}}},{data:{selNav:!1},computed:{nav:function(t,e){return Te(t.selNav,e)},selNavItem:function(t){var e=t.attrItem;return"["+e+"],[data-"+e+"]"},navItems:function(t,e){return Ee(this.selNavItem,e)}},update:{write:function(){var n=this;this.nav&&this.length!==this.nav.children.length&&fe(this.nav,this.slides.map(function(t,e){return"<li "+n.attrItem+'="'+e+'"><a href="#"></a></li>'}).join("")),De(Ee(this.selNavItem,this.$el).concat(this.nav),"uk-hidden",!this.maxIndex),this.updateNav()},events:["resize"]},events:[{name:"click",delegate:function(){return this.selNavItem},handler:function(t){t.preventDefault(),this.show(st(t.current,this.attrItem))}},{name:"itemshow",handler:"updateNav"}],methods:{updateNav:function(){var n=this,i=this.getValidIndex();this.navItems.forEach(function(t){var e=st(t,n.attrItem);De(t,n.clsActive,L(e)===i),De(t,"uk-invisible",n.finite&&("previous"===e&&0===i||"next"===e&&i>=n.maxIndex))})}}}],props:{clsActivated:Boolean,easing:String,index:Number,finite:Boolean,velocity:Number,selSlides:String},data:function(){return{easing:"ease",finite:!1,velocity:1,index:0,prevIndex:-1,stack:[],percent:0,clsActive:"uk-active",clsActivated:!1,Transitioner:!1,transitionOptions:{}}},connected:function(){this.prevIndex=-1,this.index=this.getValidIndex(this.index),this.stack=[]},disconnected:function(){_e(this.slides,this.clsActive)},computed:{duration:function(t,e){var n=t.velocity;return Br(e.offsetWidth/n)},list:function(t,e){return Te(t.selList,e)},maxIndex:function(){return this.length-1},selSlides:function(t){return t.selList+" "+(t.selSlides||"> *")},slides:{get:function(){return Ee(this.selSlides,this.$el)},watch:function(){this.$reset()}},length:function(){return this.slides.length}},events:{itemshown:function(){this.$update(this.list)}},methods:{show:function(t,e){var n=this;if(void 0===e&&(e=!1),!this.dragging&&this.length){var i=this.stack,r=e?0:i.length,o=function(){i.splice(r,1),i.length&&n.show(i.shift(),!0)};if(i[e?"unshift":"push"](t),!e&&1<i.length)2===i.length&&this._transitioner.forward(Math.min(this.duration,200));else{var s=this.index,a=Oe(this.slides,this.clsActive)&&this.slides[s],h=this.getIndex(t,this.index),c=this.slides[h];if(a!==c){if(this.dir=function(t,e){return"next"===t?1:"previous"===t?-1:t<e?-1:1}(t,s),this.prevIndex=s,this.index=h,a&&qt(a,"beforeitemhide",[this]),!qt(c,"beforeitemshow",[this,a]))return this.index=this.prevIndex,void o();var u=this._show(a,c,e).then(function(){return a&&qt(a,"itemhidden",[n]),qt(c,"itemshown",[n]),new ne(function(t){kn.write(function(){i.shift(),i.length?n.show(i.shift(),!0):n._transitioner=null,t()})})});return a&&qt(a,"itemhide",[this]),qt(c,"itemshow",[this]),u}o()}}},getIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.index),Z(le(t,this.slides,e,this.finite),0,this.maxIndex)},getValidIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),this.getIndex(t,e)},_show:function(t,e,n){if(this._transitioner=this._getTransitioner(t,e,this.dir,U({easing:n?e.offsetWidth<600?"cubic-bezier(0.25, 0.46, 0.45, 0.94)":"cubic-bezier(0.165, 0.84, 0.44, 1)":this.easing},this.transitionOptions)),!n&&!t)return this._transitioner.translate(1),ne.resolve();var i=this.stack.length;return this._transitioner[1<i?"forward":"show"](1<i?Math.min(this.duration,75+75/(i-1)):this.duration,this.percent)},_getDistance:function(t,e){return this._getTransitioner(t,t!==e&&e).getDistance()},_translate:function(t,e,n){void 0===e&&(e=this.prevIndex),void 0===n&&(n=this.index);var i=this._getTransitioner(e!==n&&e,n);return i.translate(t),i},_getTransitioner:function(t,e,n,i){return void 0===t&&(t=this.prevIndex),void 0===e&&(e=this.index),void 0===n&&(n=this.dir||1),void 0===i&&(i=this.transitionOptions),new this.Transitioner(D(t)?this.slides[t]:t,D(e)?this.slides[e]:e,n*(ht?-1:1),i)}}};function Br(t){return.5*t+300}var Pr={mixins:[zr],props:{animation:String},data:{animation:"slide",clsActivated:"uk-transition-active",Animations:Ar,Transitioner:function(o,s,a,t){var e=t.animation,h=t.easing,n=e.percent,i=e.translate,r=e.show;void 0===r&&(r=Q);var c=r(a),u=new ee;return{dir:a,show:function(t,e,n){var i=this;void 0===e&&(e=0);var r=n?"linear":h;return t-=Math.round(t*Z(e,-1,1)),this.translate(e),Dr(s,"itemin",{percent:e,duration:t,timing:r,dir:a}),Dr(o,"itemout",{percent:1-e,duration:t,timing:r,dir:a}),ne.all([Xe.start(s,c[1],t,r),Xe.start(o,c[0],t,r)]).then(function(){i.reset(),u.resolve()},Q),u.promise},stop:function(){return Xe.stop([s,o])},cancel:function(){Xe.cancel([s,o])},reset:function(){for(var t in c[0])Le([s,o],t,"")},forward:function(t,e){return void 0===e&&(e=this.percent()),Xe.cancel([s,o]),this.show(t,e,!0)},translate:function(t){this.reset();var e=i(t,a);Le(s,e[1]),Le(o,e[0]),Dr(s,"itemtranslatein",{percent:t,dir:a}),Dr(o,"itemtranslateout",{percent:1-t,dir:a})},percent:function(){return n(o||s,s,a)},getDistance:function(){return o&&o.offsetWidth}}}},computed:{animation:function(t){var e=t.animation,n=t.Animations;return U(e in n?n[e]:n.slide,{name:e})},transitionOptions:function(){return{animation:this.animation}}},events:{"itemshow itemhide itemshown itemhidden":function(t){var e=t.target;this.$update(e)},beforeitemshow:function(t){Ae(t.target,this.clsActive)},itemshown:function(t){Ae(t.target,this.clsActivated)},itemhidden:function(t){_e(t.target,this.clsActive,this.clsActivated)}}},Hr={mixins:[Qi,er,ii,Pr],functional:!0,props:{delayControls:Number,preload:Number,videoAutoplay:Boolean,template:String},data:function(){return{preload:1,videoAutoplay:!1,delayControls:3e3,items:[],cls:"uk-open",clsPage:"uk-lightbox-page",selList:".uk-lightbox-items",attrItem:"uk-lightbox-item",selClose:".uk-close-large",selCaption:".uk-lightbox-caption",pauseOnHover:!1,velocity:2,Animations:Or,template:'<div class="uk-lightbox uk-overflow-hidden"> <ul class="uk-lightbox-items"></ul> <div class="uk-lightbox-toolbar uk-position-top uk-text-right uk-transition-slide-top uk-transition-opaque"> <button class="uk-lightbox-toolbar-icon uk-close-large" type="button" uk-close></button> </div> <a class="uk-lightbox-button uk-position-center-left uk-position-medium uk-transition-fade" href="#" uk-slidenav-previous uk-lightbox-item="previous"></a> <a class="uk-lightbox-button uk-position-center-right uk-position-medium uk-transition-fade" href="#" uk-slidenav-next uk-lightbox-item="next"></a> <div class="uk-lightbox-toolbar uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque"></div> </div>'}},created:function(){var t=Te(this.template),e=Te(this.selList,t);this.items.forEach(function(){return pe(e,"<li></li>")}),this.$mount(pe(this.container,t))},computed:{caption:function(t,e){t.selCaption;return Te(".uk-lightbox-caption",e)}},events:[{name:ft+" "+dt+" keydown",handler:"showControls"},{name:"click",self:!0,delegate:function(){return this.selSlides},handler:function(t){t.defaultPrevented||this.hide()}},{name:"shown",self:!0,handler:function(){this.showControls()}},{name:"hide",self:!0,handler:function(){this.hideControls(),_e(this.slides,this.clsActive),Xe.stop(this.slides)}},{name:"hidden",self:!0,handler:function(){this.$destroy(!0)}},{name:"keyup",el:document,handler:function(t){if(this.isToggled(this.$el))switch(t.keyCode){case 37:this.show("previous");break;case 39:this.show("next")}}},{name:"beforeitemshow",handler:function(t){this.isToggled()||(this.draggable=!1,t.preventDefault(),this.toggleNow(this.$el,!0),this.animation=Or.scale,_e(t.target,this.clsActive),this.stack.splice(1,0,this.index))}},{name:"itemshow",handler:function(t){var e=ue(t.target),n=this.getItem(e).caption;Le(this.caption,"display",n?"":"none"),fe(this.caption,n);for(var i=0;i<=this.preload;i++)this.loadItem(this.getIndex(e+i)),this.loadItem(this.getIndex(e-i))}},{name:"itemshown",handler:function(){this.draggable=this.$props.draggable}},{name:"itemload",handler:function(t,r){var o,s=this,e=r.source,n=r.type,i=r.alt;if(this.setItem(r,"<span uk-spinner></span>"),e)if("image"===n||e.match(/\.(jp(e)?g|png|gif|svg|webp)($|\?)/i))he(e).then(function(t){return s.setItem(r,'<img width="'+t.width+'" height="'+t.height+'" src="'+e+'" alt="'+(i||"")+'">')},function(){return s.setError(r)});else if("video"===n||e.match(/\.(mp4|webm|ogv)($|\?)/i)){var a=Te("<video controls playsinline"+(r.poster?' poster="'+r.poster+'"':"")+' uk-video="'+this.videoAutoplay+'"></video>');it(a,"src",e),Yt(a,"error loadedmetadata",function(t){"error"===t?s.setError(r):(it(a,{width:a.videoWidth,height:a.videoHeight}),s.setItem(r,a))})}else if("iframe"===n||e.match(/\.(html|php)($|\?)/i))this.setItem(r,'<iframe class="uk-lightbox-iframe" src="'+e+'" frameborder="0" allowfullscreen></iframe>');else if(o=e.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/watch\?v=([^&\s]+)/)||e.match(/()youtu\.be\/(.*)/)){var h=o[2],c=function(t,e){return void 0===t&&(t=640),void 0===e&&(e=450),s.setItem(r,Lr("https://www.youtube"+(o[1]||"")+".com/embed/"+h,t,e,s.videoAutoplay))};he("https://img.youtube.com/vi/"+h+"/maxresdefault.jpg").then(function(t){var e=t.width,n=t.height;120===e&&90===n?he("https://img.youtube.com/vi/"+h+"/0.jpg").then(function(t){var e=t.width,n=t.height;return c(e,n)},c):c(e,n)},c)}else(o=e.match(/(\/\/.*?)vimeo\.[a-z]+\/([0-9]+).*?/))&&ae("https://vimeo.com/api/oembed.json?maxwidth=1920&url="+encodeURI(e),{responseType:"json",withCredentials:!1}).then(function(t){var e=t.response,n=e.height,i=e.width;return s.setItem(r,Lr("https://player.vimeo.com/video/"+o[2],i,n,s.videoAutoplay))},function(){return s.setError(r)})}}],methods:{loadItem:function(t){void 0===t&&(t=this.index);var e=this.getItem(t);e.content||qt(this.$el,"itemload",[e])},getItem:function(t){return void 0===t&&(t=this.index),this.items[t]||{}},setItem:function(t,e){U(t,{content:e});var n=fe(this.slides[this.items.indexOf(t)],e);qt(this.$el,"itemloaded",[this,n]),this.$update(n)},setError:function(t){this.setItem(t,'<span uk-icon="icon: bolt; ratio: 2"></span>')},showControls:function(){clearTimeout(this.controlsTimer),this.controlsTimer=setTimeout(this.hideControls,this.delayControls),Ae(this.$el,"uk-active","uk-transition-active")},hideControls:function(){_e(this.$el,"uk-active","uk-transition-active")}}};function Lr(t,e,n,i){return'<iframe src="'+t+'" width="'+e+'" height="'+n+'" style="max-width: 100%; box-sizing: border-box;" frameborder="0" allowfullscreen uk-video="autoplay: '+i+'" uk-responsive></iframe>'}var Fr,jr={install:function(t,e){t.lightboxPanel||t.component("lightboxPanel",Hr);U(e.props,t.component("lightboxPanel").options.props)},props:{toggle:String},data:{toggle:"a"},computed:{toggles:{get:function(t,e){return Ee(t.toggle,e)},watch:function(){this.hide()}},items:function(){return J(this.toggles.map(Wr),"source")}},disconnected:function(){this.hide()},events:[{name:"click",delegate:function(){return this.toggle+":not(.uk-disabled)"},handler:function(t){t.preventDefault();var e=st(t.current,"href");this.show(y(this.items,function(t){return t.source===e}))}}],methods:{show:function(t){var e=this;return this.panel=this.panel||this.$create("lightboxPanel",U({},this.$props,{items:this.items})),Vt(this.panel.$el,"hidden",function(){return e.panel=!1}),this.panel.show(t)},hide:function(){return this.panel&&this.panel.hide()}}};function Wr(n){return["href","caption","type","poster","alt"].reduce(function(t,e){return t["href"===e?"source":e]=st(n,e),t},{})}var Vr={},Rr={functional:!0,args:["message","status"],data:{message:"",status:"",timeout:5e3,group:null,pos:"top-center",clsClose:"uk-notification-close",clsMsg:"uk-notification-message"},install:function(r){r.notification.closeAll=function(n,i){Se(document.body,function(t){var e=r.getComponent(t,"notification");!e||n&&n!==e.group||e.close(i)})}},computed:{marginProp:function(t){return"margin"+(w(t.pos,"top")?"Top":"Bottom")},startProps:function(){var t;return(t={opacity:0})[this.marginProp]=-this.$el.offsetHeight,t}},created:function(){Vr[this.pos]||(Vr[this.pos]=pe(this.$container,'<div class="uk-notification uk-notification-'+this.pos+'"></div>'));var t=Le(Vr[this.pos],"display","block");this.$mount(pe(t,'<div class="'+this.clsMsg+(this.status?" "+this.clsMsg+"-"+this.status:"")+'"> <a href="#" class="'+this.clsClose+'" data-uk-close></a> <div>'+this.message+"</div> </div>"))},connected:function(){var t,e=this,n=F(Le(this.$el,this.marginProp));Xe.start(Le(this.$el,this.startProps),((t={opacity:1})[this.marginProp]=n,t)).then(function(){e.timeout&&(e.timer=setTimeout(e.close,e.timeout))})},events:(Fr={click:function(t){Mt(t.target,'a[href="#"],a[href=""]')&&t.preventDefault(),this.close()}},Fr[mt]=function(){this.timer&&clearTimeout(this.timer)},Fr[gt]=function(){this.timeout&&(this.timer=setTimeout(this.close,this.timeout))},Fr),methods:{close:function(t){function e(){qt(n.$el,"close",[n]),we(n.$el),Vr[n.pos].children.length||Le(Vr[n.pos],"display","none")}var n=this;this.timer&&clearTimeout(this.timer),t?e():Xe.start(this.$el,this.startProps).then(e)}}};var Yr=["x","y","bgx","bgy","rotate","scale","color","backgroundColor","borderColor","opacity","blur","hue","grayscale","invert","saturate","sepia","fopacity","stroke"],qr={mixins:[Ji],props:Yr.reduce(function(t,e){return t[e]="list",t},{}),data:Yr.reduce(function(t,e){return t[e]=void 0,t},{}),computed:{props:function(m,g){var v=this;return Yr.reduce(function(t,e){if(P(m[e]))return t;var n,i,r,o=e.match(/color/i),s=o||"opacity"===e,a=m[e].slice(0);s&&Le(g,e,""),a.length<2&&a.unshift(("scale"===e?1:s?Le(g,e):0)||0);var h=function(t){return t.reduce(function(t,e){return O(e)&&e.replace(/-|\d/g,"").trim()||t},"")}(a);if(o){var c=g.style.color;a=a.map(function(t){return function(t,e){return Le(Le(t,"color",e),"color").split(/[(),]/g).slice(1,-1).concat(1).slice(0,4).map(F)}(g,t)}),g.style.color=c}else if(w(e,"bg")){var u="bgy"===e?"height":"width";if(a=a.map(function(t){return wn(t,u,v.$el)}),Le(g,"background-position-"+e[2],""),i=Le(g,"backgroundPosition").split(" ")["x"===e[2]?0:1],v.covers){var l=Math.min.apply(Math,a),d=Math.max.apply(Math,a),f=a.indexOf(l)<a.indexOf(d);r=d-l,a=a.map(function(t){return t-(f?l:d)}),n=(f?-r:0)+"px"}else n=i}else a=a.map(F);if("stroke"===e){if(!a.some(function(t){return t}))return t;var p=_i(v.$el);Le(g,"strokeDasharray",p),"%"===h&&(a=a.map(function(t){return t*p/100})),a=a.reverse(),e="strokeDashoffset"}return t[e]={steps:a,unit:h,pos:n,bgPos:i,diff:r},t},{})},bgProps:function(){var e=this;return["bgx","bgy"].filter(function(t){return t in e.props})},covers:function(t,e){return function(t){var e=t.style.backgroundSize,n="cover"===Le(Le(t,"backgroundSize",""),"backgroundSize");return t.style.backgroundSize=e,n}(e)}},disconnected:function(){delete this._image},update:{read:function(t){var h=this;if(t.active=this.matchMedia,t.active){if(!t.image&&this.covers&&this.bgProps.length){var e=Le(this.$el,"backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/,"$1");if(e){var n=new Image;n.src=e,(t.image=n).naturalWidth||(n.onload=function(){return h.$emit()})}}var i=t.image;if(i&&i.naturalWidth){var c={width:this.$el.offsetWidth,height:this.$el.offsetHeight},u={width:i.naturalWidth,height:i.naturalHeight},l=nt.cover(u,c);this.bgProps.forEach(function(t){var e=h.props[t],n=e.diff,i=e.bgPos,r=e.steps,o="bgy"===t?"height":"width",s=l[o]-c[o];if(s<n)c[o]=l[o]+n-s;else if(n<s){var a=c[o]/wn(i,o,h.$el);a&&(h.props[t].steps=r.map(function(t){return t-(s-n)/a}))}l=nt.cover(u,c)}),t.dim=l}}},write:function(t){var e=t.dim;t.active?e&&Le(this.$el,{backgroundSize:e.width+"px "+e.height+"px",backgroundRepeat:"no-repeat"}):Le(this.$el,{backgroundSize:"",backgroundRepeat:""})},events:["resize"]},methods:{reset:function(){var n=this;K(this.getCss(0),function(t,e){return Le(n.$el,e,"")})},getCss:function(l){var d=this.props;return Object.keys(d).reduce(function(t,e){var n=d[e],i=n.steps,r=n.unit,o=n.pos,s=function(t,e,n){void 0===n&&(n=2);var i=Ur(t,e),r=i[0],o=i[1],s=i[2];return(D(r)?r+Math.abs(r-o)*s*(r<o?1:-1):+o).toFixed(n)}(i,l);switch(e){case"x":case"y":r=r||"px",t.transform+=" translate"+p(e)+"("+F(s).toFixed("px"===r?0:2)+r+")";break;case"rotate":r=r||"deg",t.transform+=" rotate("+(s+r)+")";break;case"scale":t.transform+=" scale("+s+")";break;case"bgy":case"bgx":t["background-position-"+e[2]]="calc("+o+" + "+s+"px)";break;case"color":case"backgroundColor":case"borderColor":var a=Ur(i,l),h=a[0],c=a[1],u=a[2];t[e]="rgba("+h.map(function(t,e){return t+=u*(c[e]-t),3===e?F(t):parseInt(t,10)}).join(",")+")";break;case"blur":r=r||"px",t.filter+=" blur("+(s+r)+")";break;case"hue":r=r||"deg",t.filter+=" hue-rotate("+(s+r)+")";break;case"fopacity":r=r||"%",t.filter+=" opacity("+(s+r)+")";break;case"grayscale":case"invert":case"saturate":case"sepia":r=r||"%",t.filter+=" "+e+"("+(s+r)+")";break;default:t[e]=s}return t},{transform:"",filter:""})}}};function Ur(t,e){var n=t.length-1,i=Math.min(Math.floor(n*e),n-1),r=t.slice(i,i+2);return r.push(1===e?1:e%(1/n)*n),r}var Xr={mixins:[qr],props:{target:String,viewport:Number,easing:Number},data:{target:!1,viewport:1,easing:1},computed:{target:function(t,e){var n=t.target;return function t(e){return e?"offsetTop"in e?e:t(e.parentNode):document.body}(n&&wt(n,e)||e)}},update:{read:function(t,e){var n=t.percent;if("scroll"!==e&&(n=!1),t.active){var i=n;return{percent:n=function(t,e){return Z(t*(1-(e-e*t)))}(mn(this.target)/(this.viewport||1),this.easing),style:i!==n&&this.getCss(n)}}},write:function(t){var e=t.style;t.active?e&&Le(this.$el,e):this.reset()},events:["scroll","resize"]}};var Kr={update:{write:function(){if(!this.stack.length&&!this.dragging){var t=this.getValidIndex(this.index);~this.prevIndex&&this.index===t||this.show(t)}},events:["resize"]}};function Gr(t,e,n){var i=Qr(t,e);return n?i-function(t,e){return to(e).width/2-to(t).width/2}(t,e):Math.min(i,Jr(e))}function Jr(t){return Math.max(0,Zr(t)-to(t).width)}function Zr(t){return no(t).reduce(function(t,e){return to(e).width+t},0)}function Qr(t,e){return(on(t).left+(ht?to(t).width-to(e).width:0))*(ht?-1:1)}function to(t){return t.getBoundingClientRect()}function eo(t,e,n){qt(t,Ut(e,!1,!1,n))}function no(t){return W(t.children)}var io={mixins:[ni,zr,Kr],props:{center:Boolean,sets:Boolean},data:{center:!1,sets:!1,attrItem:"uk-slider-item",selList:".uk-slider-items",selNav:".uk-slider-nav",clsContainer:"uk-slider-container",Transitioner:function(r,i,o,t){var e=t.center,s=t.easing,a=t.list,h=new ee,n=r?Gr(r,a,e):Gr(i,a,e)+to(i).width*o,c=i?Gr(i,a,e):n+to(r).width*o*(ht?-1:1);return{dir:o,show:function(t,e,n){void 0===e&&(e=0);var i=n?"linear":s;return t-=Math.round(t*Z(e,-1,1)),this.translate(e),r&&this.updateTranslates(),e=r?e:Z(e,0,1),eo(this.getItemIn(),"itemin",{percent:e,duration:t,timing:i,dir:o}),r&&eo(this.getItemIn(!0),"itemout",{percent:1-e,duration:t,timing:i,dir:o}),Xe.start(a,{transform:Nr(-c*(ht?-1:1),"px")},t,i).then(h.resolve,Q),h.promise},stop:function(){return Xe.stop(a)},cancel:function(){Xe.cancel(a)},reset:function(){Le(a,"transform","")},forward:function(t,e){return void 0===e&&(e=this.percent()),Xe.cancel(a),this.show(t,e,!0)},translate:function(t){var e=this.getDistance()*o*(ht?-1:1);Le(a,"transform",Nr(Z(e-e*t-c,-Zr(a),to(a).width)*(ht?-1:1),"px")),this.updateTranslates(),r&&(t=Z(t,-1,1),eo(this.getItemIn(),"itemtranslatein",{percent:t,dir:o}),eo(this.getItemIn(!0),"itemtranslateout",{percent:1-t,dir:o}))},percent:function(){return Math.abs((Le(a,"transform").split(",")[4]*(ht?-1:1)+n)/(c-n))},getDistance:function(){return Math.abs(c-n)},getItemIn:function(t){void 0===t&&(t=!1);var e=this.getActives(),n=G(no(a),"offsetLeft"),i=ue(n,e[0<o*(t?-1:1)?e.length-1:0]);return~i&&n[i+(r&&!t?o:0)]},getActives:function(){var n=Gr(r||i,a,e);return G(no(a).filter(function(t){var e=Qr(t,a);return n<=e&&e+to(t).width<=to(a).width+n}),"offsetLeft")},updateTranslates:function(){var n=this.getActives();no(a).forEach(function(t){var e=b(n,t);eo(t,"itemtranslate"+(e?"in":"out"),{percent:e?1:0,dir:t.offsetLeft<=i.offsetLeft?1:-1})})}}}},computed:{avgWidth:function(){return Zr(this.list)/this.length},finite:function(t){return t.finite||Math.ceil(Zr(this.list))<to(this.list).width+function(t){return no(t).reduce(function(t,e){return Math.max(t,to(e).width)},0)}(this.list)+this.center},maxIndex:function(){if(!this.finite||this.center&&!this.sets)return this.length-1;if(this.center)return X(this.sets);Le(this.slides,"order","");for(var t=Jr(this.list),e=this.length;e--;)if(Qr(this.list.children[e],this.list)<t)return Math.min(e+1,this.length-1);return 0},sets:function(t){var o=this,e=t.sets,s=to(this.list).width/(this.center?2:1),a=0,h=s,c=0;return!B(e=e&&this.slides.reduce(function(t,e,n){var i=to(e).width;if(a<c+i&&(!o.center&&n>o.maxIndex&&(n=o.maxIndex),!b(t,n))){var r=o.slides[n+1];o.center&&r&&i<h-to(r).width/2?h-=i:(h=s,t.push(n),a=c+s+(o.center?i/2:0))}return c+=i,t},[]))&&e},transitionOptions:function(){return{center:this.center,list:this.list}}},connected:function(){De(this.$el,this.clsContainer,!Te("."+this.clsContainer,this.$el))},update:{write:function(){var n=this;Ee("["+this.attrItem+"],[data-"+this.attrItem+"]",this.$el).forEach(function(t){var e=st(t,n.attrItem);n.maxIndex&&De(t,"uk-hidden",z(e)&&(n.sets&&!b(n.sets,F(e))||e>n.maxIndex))}),!this.length||this.dragging||this.stack.length||this._getTransitioner().translate(1)},events:["resize"]},events:{beforeitemshow:function(t){!this.dragging&&this.sets&&this.stack.length<2&&!b(this.sets,this.index)&&(this.index=this.getValidIndex());var e=Math.abs(this.index-this.prevIndex+(0<this.dir&&this.index<this.prevIndex||this.dir<0&&this.index>this.prevIndex?(this.maxIndex+1)*this.dir:0));if(!this.dragging&&1<e){for(var n=0;n<e;n++)this.stack.splice(1,0,0<this.dir?"next":"previous");t.preventDefault()}else this.duration=Br(this.avgWidth/this.velocity)*(to(this.dir<0||!this.slides[this.prevIndex]?this.slides[this.index]:this.slides[this.prevIndex]).width/this.avgWidth),this.reorder()},itemshow:function(){P(this.prevIndex)||Ae(this._getTransitioner().getItemIn(),this.clsActive)},itemshown:function(){var e=this,n=this._getTransitioner(this.index).getActives();this.slides.forEach(function(t){return De(t,e.clsActive,b(n,t))}),this.sets&&!b(this.sets,F(this.index))||this.slides.forEach(function(t){return De(t,e.clsActivated,b(n,t))})}},methods:{reorder:function(){var n=this;if(Le(this.slides,"order",""),!this.finite){var i=0<this.dir&&this.slides[this.prevIndex]?this.prevIndex:this.index;if(this.slides.forEach(function(t,e){return Le(t,"order",0<n.dir&&e<i?1:n.dir<0&&e>=n.index?-1:"")}),this.center)for(var t=this.slides[i],e=to(this.list).width/2-to(t).width/2,r=0;0<e;){var o=this.getIndex(--r+i,i),s=this.slides[o];Le(s,"order",i<o?-2:-1),e-=to(s).width}}},getValidIndex:function(t,e){if(void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),t=this.getIndex(t,e),!this.sets)return t;var n;do{if(b(this.sets,t))return t;n=t,t=this.getIndex(t+this.dir,e)}while(t!==n);return t}}},ro={mixins:[qr],data:{selItem:"!li"},computed:{item:function(t,e){return wt(t.selItem,e)}},events:[{name:"itemshown",self:!0,el:function(){return this.item},handler:function(){Le(this.$el,this.getCss(.5))}},{name:"itemin itemout",self:!0,el:function(){return this.item},handler:function(t){var e=t.type,n=t.detail,i=n.percent,r=n.duration,o=n.timing,s=n.dir;Xe.cancel(this.$el),Le(this.$el,this.getCss(so(e,s,i))),Xe.start(this.$el,this.getCss(oo(e)?.5:0<s?1:0),r,o).catch(Q)}},{name:"transitioncanceled transitionend",self:!0,el:function(){return this.item},handler:function(){Xe.cancel(this.$el)}},{name:"itemtranslatein itemtranslateout",self:!0,el:function(){return this.item},handler:function(t){var e=t.type,n=t.detail,i=n.percent,r=n.dir;Xe.cancel(this.$el),Le(this.$el,this.getCss(so(e,r,i)))}}]};function oo(t){return u(t,"in")}function so(t,e,n){return n/=2,oo(t)?e<0?1-n:n:e<0?n:1-n}var ao,ho=U({},Ar,{fade:{show:function(){return[{opacity:0,zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Le(t,"opacity")},translate:function(t){return[{opacity:1-t,zIndex:0},{zIndex:-1}]}},scale:{show:function(){return[{opacity:0,transform:Mr(1.5),zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Le(t,"opacity")},translate:function(t){return[{opacity:1-t,transform:Mr(1+.5*t),zIndex:0},{zIndex:-1}]}},pull:{show:function(t){return t<0?[{transform:Nr(30),zIndex:-1},{transform:Nr(),zIndex:0}]:[{transform:Nr(-100),zIndex:0},{transform:Nr(),zIndex:-1}]},percent:function(t,e,n){return n<0?1-_r(e):_r(t)},translate:function(t,e){return e<0?[{transform:Nr(30*t),zIndex:-1},{transform:Nr(-100*(1-t)),zIndex:0}]:[{transform:Nr(100*-t),zIndex:0},{transform:Nr(30*(1-t)),zIndex:-1}]}},push:{show:function(t){return t<0?[{transform:Nr(100),zIndex:0},{transform:Nr(),zIndex:-1}]:[{transform:Nr(-30),zIndex:-1},{transform:Nr(),zIndex:0}]},percent:function(t,e,n){return 0<n?1-_r(e):_r(t)},translate:function(t,e){return e<0?[{transform:Nr(100*t),zIndex:0},{transform:Nr(-30*(1-t)),zIndex:-1}]:[{transform:Nr(-30*t),zIndex:-1},{transform:Nr(100*(1-t)),zIndex:0}]}}}),co={mixins:[ni,Pr,Kr],props:{ratio:String,minHeight:Number,maxHeight:Number},data:{ratio:"16:9",minHeight:!1,maxHeight:!1,selList:".uk-slideshow-items",attrItem:"uk-slideshow-item",selNav:".uk-slideshow-nav",Animations:ho},update:{read:function(){var t=this.ratio.split(":").map(Number),e=t[0],n=t[1];return n=n*this.list.offsetWidth/e||0,this.minHeight&&(n=Math.max(this.minHeight,n)),this.maxHeight&&(n=Math.min(this.maxHeight,n)),{height:n-cn(this.list,"content-box")}},write:function(t){var e=t.height;0<e&&Le(this.list,"minHeight",e)},events:["resize"]}},uo={mixins:[ni,kr],props:{group:String,threshold:Number,clsItem:String,clsPlaceholder:String,clsDrag:String,clsDragState:String,clsBase:String,clsNoDrag:String,clsEmpty:String,clsCustom:String,handle:String},data:{group:!1,threshold:5,clsItem:"uk-sortable-item",clsPlaceholder:"uk-sortable-placeholder",clsDrag:"uk-sortable-drag",clsDragState:"uk-drag",clsBase:"uk-sortable",clsNoDrag:"uk-sortable-nodrag",clsEmpty:"uk-sortable-empty",clsCustom:"",handle:!1},created:function(){var o=this;["init","start","move","end"].forEach(function(t){var r=o[t];o[t]=function(t){o.scrollY=window.pageYOffset;var e=te(t,"page"),n=e.x,i=e.y;o.pos={x:n,y:i},r(t)}})},events:{name:dt,passive:!1,handler:"init"},update:{write:function(){if(this.clsEmpty&&De(this.$el,this.clsEmpty,B(this.$el.children)),Le(this.handle?Ee(this.handle,this.$el):this.$el.children,{touchAction:"none",userSelect:"none"}),this.drag){var t=nn(window),e=t.right,n=t.bottom;nn(this.drag,{top:Z(this.pos.y+this.origin.top,0,n-this.drag.offsetHeight),left:Z(this.pos.x+this.origin.left,0,e-this.drag.offsetWidth)}),function s(t){var a=t.x;var h=t.y;clearTimeout(ao);(e=document.elementFromPoint(a-window.pageXOffset,h-window.pageYOffset),n=po(),function(t,e){var n=[];for(;e(t)&&n.unshift(t),t=t&&t.parentElement;);return n}(e,function(t){return t===n||fo.test(Le(t,"overflow"))})).some(function(t){var e=t.scrollTop,n=t.scrollHeight;po()===t&&(t=window,n-=window.innerHeight);var i=nn(t),r=i.top,o=i.bottom;if(r<h&&h<r+30?e-=5:h<o&&o-20<h&&(e+=5),0<e&&e<n)return ao=setTimeout(function(){gn(t,e),s({x:a,y:h})},10)});var e,n}(this.pos)}}},methods:{init:function(t){var e=t.target,n=t.button,i=t.defaultPrevented,r=W(this.$el.children).filter(function(t){return Wt(e,t)})[0];!r||i||0<n||Ft(e)||Wt(e,"."+this.clsNoDrag)||this.handle&&!Wt(e,this.handle)||(t.preventDefault(),this.touched=[this],this.placeholder=r,this.origin=U({target:e,index:ue(r)},this.pos),Vt(document,ft,this.move),Vt(document,pt,this.end),Vt(window,"scroll",this.scroll),this.threshold||this.start(t))},start:function(t){this.drag=pe(this.$container,this.placeholder.outerHTML.replace(/^<li/i,"<div").replace(/li>$/i,"div>")),Le(this.drag,U({boxSizing:"border-box",width:this.placeholder.offsetWidth,height:this.placeholder.offsetHeight,overflow:"hidden"},Le(this.placeholder,["paddingLeft","paddingRight","paddingTop","paddingBottom"]))),it(this.drag,"uk-no-boot",""),Ae(this.drag,this.clsDrag,this.clsCustom),sn(this.drag.firstElementChild,sn(this.placeholder.firstElementChild));var e=nn(this.placeholder),n=e.left,i=e.top;U(this.origin,{left:n-this.pos.x,top:i-this.pos.y}),Ae(this.placeholder,this.clsPlaceholder),Ae(this.$el.children,this.clsItem),Ae(document.documentElement,this.clsDragState),qt(this.$el,"start",[this,this.placeholder]),this.move(t)},move:function(t){if(this.drag){this.$emit();var e="mousemove"===t.type?t.target:document.elementFromPoint(this.pos.x-window.pageXOffset,this.pos.y-window.pageYOffset),n=this.getSortable(e),i=this.getSortable(this.placeholder),r=n!==i;if(n&&!Wt(e,this.placeholder)&&(!r||n.group&&n.group===i.group)){if(e=n.$el===e.parentNode&&e||W(n.$el.children).filter(function(t){return Wt(e,t)})[0],r)i.remove(this.placeholder);else if(!e)return;n.insert(this.placeholder,e),b(this.touched,n)||this.touched.push(n)}}else(Math.abs(this.pos.x-this.origin.x)>this.threshold||Math.abs(this.pos.y-this.origin.y)>this.threshold)&&this.start(t)},end:function(t){if(Rt(document,ft,this.move),Rt(document,pt,this.end),Rt(window,"scroll",this.scroll),this.drag){clearTimeout(ao);var e=this.getSortable(this.placeholder);this===e?this.origin.index!==ue(this.placeholder)&&qt(this.$el,"moved",[this,this.placeholder]):(qt(e.$el,"added",[e,this.placeholder]),qt(this.$el,"removed",[this,this.placeholder])),qt(this.$el,"stop",[this,this.placeholder]),we(this.drag),this.drag=null;var n=this.touched.map(function(t){return t.clsPlaceholder+" "+t.clsItem}).join(" ");this.touched.forEach(function(t){return _e(t.$el.children,n)}),_e(document.documentElement,this.clsDragState)}else"touchend"===t.type&&t.target.click()},scroll:function(){var t=window.pageYOffset;t!==this.scrollY&&(this.pos.y+=t-this.scrollY,this.scrollY=t,this.$emit())},insert:function(t,e){var n=this;Ae(this.$el.children,this.clsItem);function i(){e?!Wt(t,n.$el)||function(t,e){return t.parentNode===e.parentNode&&ue(t)>ue(e)}(t,e)?me(e,t):ge(e,t):pe(n.$el,t)}this.animation?this.animate(i):i()},remove:function(t){Wt(t,this.$el)&&(Le(this.handle?Ee(this.handle,t):t,{touchAction:"",userSelect:""}),this.animation?this.animate(function(){return we(t)}):we(t))},getSortable:function(t){return t&&(this.$getComponent(t,"sortable")||this.getSortable(t.parentNode))}}};var lo,fo=/auto|scroll/;function po(){return document.scrollingElement||document.documentElement}var mo,go,vo,wo=[],bo={mixins:[Qi,ii,ui],args:"title",props:{delay:Number,title:String},data:{pos:"top",title:"",delay:0,animation:["uk-animation-scale-up"],duration:100,cls:"uk-active",clsPos:"uk-tooltip"},beforeConnect:function(){this._hasTitle=rt(this.$el,"title"),it(this.$el,{title:"","aria-expanded":!1})},disconnected:function(){this.hide(),it(this.$el,{title:this._hasTitle?this.title:null,"aria-expanded":null})},methods:{show:function(){var e=this;!this.isActive()&&this.title&&(wo.forEach(function(t){return t.hide()}),wo.push(this),this._unbind=Vt(document,pt,function(t){return!Wt(t.target,e.$el)&&e.hide()}),clearTimeout(this.showTimer),this.showTimer=setTimeout(function(){e._show(),e.hideTimer=setInterval(function(){Ht(e.$el)||e.hide()},150)},this.delay))},hide:function(){this.isActive()&&!_t(this.$el,"input:focus")&&(wo.splice(wo.indexOf(this),1),clearTimeout(this.showTimer),clearInterval(this.hideTimer),it(this.$el,"aria-expanded",!1),this.toggleElement(this.tooltip,!1),this.tooltip&&we(this.tooltip),this.tooltip=!1,this._unbind())},_show:function(){this.tooltip=pe(this.container,'<div class="'+this.clsPos+'" aria-expanded="true" aria-hidden> <div class="'+this.clsPos+'-inner">'+this.title+"</div> </div>"),this.positionAt(this.tooltip,this.$el),this.origin="y"===this.getAxis()?fn(this.dir)+"-"+this.align:this.align+"-"+fn(this.dir),this.toggleElement(this.tooltip,!0)},isActive:function(){return b(wo,this)}},events:(lo={focus:"show",blur:"hide"},lo[mt+" "+gt]=function(t){Qt(t)||(t.type===mt?this.show():this.hide())},lo[dt]=function(t){Qt(t)&&(this.isActive()?this.hide():this.show())},lo)},xo={props:{allow:String,clsDragover:String,concurrent:Number,maxSize:Number,method:String,mime:String,msgInvalidMime:String,msgInvalidName:String,msgInvalidSize:String,multiple:Boolean,name:String,params:Object,type:String,url:String},data:{allow:!1,clsDragover:"uk-dragover",concurrent:1,maxSize:0,method:"POST",mime:!1,msgInvalidMime:"Invalid File Type: %s",msgInvalidName:"Invalid File Name: %s",msgInvalidSize:"Invalid File Size: %s Kilobytes Max",multiple:!1,name:"files[]",params:{},type:"",url:"",abort:Q,beforeAll:Q,beforeSend:Q,complete:Q,completeAll:Q,error:Q,fail:Q,load:Q,loadEnd:Q,loadStart:Q,progress:Q},events:{change:function(t){_t(t.target,'input[type="file"]')&&(t.preventDefault(),t.target.files&&this.upload(t.target.files),t.target.value="")},drop:function(t){ko(t);var e=t.dataTransfer;e&&e.files&&(_e(this.$el,this.clsDragover),this.upload(e.files))},dragenter:function(t){ko(t)},dragover:function(t){ko(t),Ae(this.$el,this.clsDragover)},dragleave:function(t){ko(t),_e(this.$el,this.clsDragover)}},methods:{upload:function(t){var i=this;if(t.length){qt(this.$el,"upload",[t]);for(var e=0;e<t.length;e++){if(this.maxSize&&1e3*this.maxSize<t[e].size)return void this.fail(this.msgInvalidSize.replace("%s",this.maxSize));if(this.allow&&!yo(this.allow,t[e].name))return void this.fail(this.msgInvalidName.replace("%s",this.allow));if(this.mime&&!yo(this.mime,t[e].type))return void this.fail(this.msgInvalidMime.replace("%s",this.mime))}this.multiple||(t=[t[0]]),this.beforeAll(this,t);var r=function(t,e){for(var n=[],i=0;i<t.length;i+=e){for(var r=[],o=0;o<e;o++)r.push(t[i+o]);n.push(r)}return n}(t,this.concurrent),o=function(t){var e=new FormData;for(var n in t.forEach(function(t){return e.append(i.name,t)}),i.params)e.append(n,i.params[n]);ae(i.url,{data:e,method:i.method,responseType:i.type,beforeSend:function(t){var e=t.xhr;e.upload&&Vt(e.upload,"progress",i.progress),["loadStart","load","loadEnd","abort"].forEach(function(t){return Vt(e,t.toLowerCase(),i[t])}),i.beforeSend(t)}}).then(function(t){i.complete(t),r.length?o(r.shift()):i.completeAll(t)},function(t){return i.error(t)})};o(r.shift())}}}};function yo(t,e){return e.match(new RegExp("^"+t.replace(/\//g,"\\/").replace(/\*\*/g,"(\\/[^\\/]+)*").replace(/\*/g,"[^\\/]+").replace(/((?!\\))\?/g,"$1.")+"$","i"))}function ko(t){t.preventDefault(),t.stopPropagation()}function $o(t){var e=t.target;("attributes"!==t.type?function(t){for(var e=t.addedNodes,n=t.removedNodes,i=0;i<e.length;i++)Io(e[i],go);for(var r=0;r<n.length;r++)Io(n[r],vo);return!0}(t):function(t){var e=t.target,n=t.attributeName;if("href"===n)return!0;var i=Ln(n);if(!(i&&i in mo))return;if(rt(e,n))return mo[i](e),!0;var r=mo.getComponent(e,i);if(r)return r.$destroy(),!0}(t))&&mo.update(e)}function Io(t,e){if(1===t.nodeType&&!rt(t,"uk-no-boot"))for(e(t),t=t.firstElementChild;t;){var n=t.nextElementSibling;Io(t,e),t=n}}return Fn.component("countdown",br),Fn.component("filter",Tr),Fn.component("lightbox",jr),Fn.component("lightboxPanel",Hr),Fn.component("notification",Rr),Fn.component("parallax",Xr),Fn.component("slider",io),Fn.component("sliderParallax",ro),Fn.component("slideshow",co),Fn.component("slideshowParallax",ro),Fn.component("sortable",uo),Fn.component("tooltip",bo),Fn.component("upload",xo),go=(mo=Fn).connect,vo=mo.disconnect,"MutationObserver"in window&&kn.read(function(){document.body&&Io(document.body,go),new MutationObserver(function(t){return t.forEach($o)}).observe(document,{childList:!0,subtree:!0,characterData:!0,attributes:!0}),mo._initialized=!0}),Fn});
/*! UIkit 3.2.3 | http://www.getuikit.com | (c) 2014 - 2019 YOOtheme | MIT License */


!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?module.exports=i():"function"==typeof define&&define.amd?define("uikiticons",i):(t=t||self).UIkitIcons=i()}(this,function(){"use strict";function i(t){i.installed||t.icon.add({"500px":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.624,11.866c-0.141,0.132,0.479,0.658,0.662,0.418c0.051-0.046,0.607-0.61,0.662-0.664c0,0,0.738,0.719,0.814,0.719 c0.1,0,0.207-0.055,0.322-0.17c0.27-0.269,0.135-0.416,0.066-0.495l-0.631-0.616l0.658-0.668c0.146-0.156,0.021-0.314-0.1-0.449 c-0.182-0.18-0.359-0.226-0.471-0.125l-0.656,0.654l-0.654-0.654c-0.033-0.034-0.08-0.045-0.124-0.045 c-0.079,0-0.191,0.068-0.307,0.181c-0.202,0.202-0.247,0.351-0.133,0.462l0.665,0.665L9.624,11.866z"/><path d="M11.066,2.884c-1.061,0-2.185,0.248-3.011,0.604c-0.087,0.034-0.141,0.106-0.15,0.205C7.893,3.784,7.919,3.909,7.982,4.066 c0.05,0.136,0.187,0.474,0.452,0.372c0.844-0.326,1.779-0.507,2.633-0.507c0.963,0,1.9,0.191,2.781,0.564 c0.695,0.292,1.357,0.719,2.078,1.34c0.051,0.044,0.105,0.068,0.164,0.068c0.143,0,0.273-0.137,0.389-0.271 c0.191-0.214,0.324-0.395,0.135-0.575c-0.686-0.654-1.436-1.138-2.363-1.533C13.24,3.097,12.168,2.884,11.066,2.884z"/><path d="M16.43,15.747c-0.092-0.028-0.242,0.05-0.309,0.119l0,0c-0.652,0.652-1.42,1.169-2.268,1.521 c-0.877,0.371-1.814,0.551-2.779,0.551c-0.961,0-1.896-0.189-2.775-0.564c-0.848-0.36-1.612-0.879-2.268-1.53 c-0.682-0.688-1.196-1.455-1.529-2.268c-0.325-0.799-0.471-1.643-0.471-1.643c-0.045-0.24-0.258-0.249-0.567-0.203 c-0.128,0.021-0.519,0.079-0.483,0.36v0.01c0.105,0.644,0.289,1.284,0.545,1.895c0.417,0.969,1.002,1.849,1.756,2.604 c0.757,0.754,1.636,1.34,2.604,1.757C8.901,18.785,9.97,19,11.088,19c1.104,0,2.186-0.215,3.188-0.645 c1.838-0.896,2.604-1.757,2.604-1.757c0.182-0.204,0.227-0.317-0.1-0.643C16.779,15.956,16.525,15.774,16.43,15.747z"/><path d="M5.633,13.287c0.293,0.71,0.723,1.341,1.262,1.882c0.54,0.54,1.172,0.971,1.882,1.264c0.731,0.303,1.509,0.461,2.298,0.461 c0.801,0,1.578-0.158,2.297-0.461c0.711-0.293,1.344-0.724,1.883-1.264c0.543-0.541,0.971-1.172,1.264-1.882 c0.314-0.721,0.463-1.5,0.463-2.298c0-0.79-0.148-1.569-0.463-2.289c-0.293-0.699-0.721-1.329-1.264-1.881 c-0.539-0.541-1.172-0.959-1.867-1.263c-0.721-0.303-1.5-0.461-2.299-0.461c-0.802,0-1.613,0.159-2.322,0.461 c-0.577,0.25-1.544,0.867-2.119,1.454v0.012V2.108h8.16C15.1,2.104,15.1,1.69,15.1,1.552C15.1,1.417,15.1,1,14.809,1H5.915 C5.676,1,5.527,1.192,5.527,1.384v6.84c0,0.214,0.273,0.372,0.529,0.428c0.5,0.105,0.614-0.056,0.737-0.224l0,0 c0.18-0.273,0.776-0.884,0.787-0.894c0.901-0.905,2.117-1.408,3.416-1.408c1.285,0,2.5,0.501,3.412,1.408 c0.914,0.914,1.408,2.122,1.408,3.405c0,1.288-0.508,2.496-1.408,3.405c-0.9,0.896-2.152,1.406-3.438,1.406 c-0.877,0-1.711-0.229-2.433-0.671v-4.158c0-0.553,0.237-1.151,0.643-1.614c0.462-0.519,1.094-0.799,1.782-0.799 c0.664,0,1.293,0.253,1.758,0.715c0.459,0.459,0.709,1.071,0.709,1.723c0,1.385-1.094,2.468-2.488,2.468 c-0.273,0-0.769-0.121-0.781-0.125c-0.281-0.087-0.405,0.306-0.438,0.436c-0.159,0.496,0.079,0.585,0.123,0.607 c0.452,0.137,0.743,0.157,1.129,0.157c1.973,0,3.572-1.6,3.572-3.57c0-1.964-1.6-3.552-3.572-3.552c-0.97,0-1.872,0.36-2.546,1.038 c-0.656,0.631-1.027,1.487-1.027,2.322v3.438v-0.011c-0.372-0.42-0.732-1.041-0.981-1.682c-0.102-0.248-0.315-0.202-0.607-0.113 c-0.135,0.035-0.519,0.157-0.44,0.439C5.372,12.799,5.577,13.164,5.633,13.287z"/></svg>',album:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="2" width="10" height="1"/><rect x="3" y="4" width="14" height="1"/><rect fill="none" stroke="#000" x="1.5" y="6.5" width="17" height="11"/></svg>',"arrow-down":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="10.5,16.08 5.63,10.66 6.37,10 10.5,14.58 14.63,10 15.37,10.66"/><line fill="none" stroke="#000" x1="10.5" y1="4" x2="10.5" y2="15"/></svg>',"arrow-left":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="10 14 5 9.5 10 5"/><line fill="none" stroke="#000" x1="16" y1="9.5" x2="5" y2="9.52"/></svg>',"arrow-right":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="10 5 15 9.5 10 14"/><line fill="none" stroke="#000" x1="4" y1="9.5" x2="15" y2="9.5"/></svg>',"arrow-up":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="10.5,4 15.37,9.4 14.63,10.08 10.5,5.49 6.37,10.08 5.63,9.4"/><line fill="none" stroke="#000" x1="10.5" y1="16" x2="10.5" y2="5"/></svg>',ban:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/><line fill="none" stroke="#000" stroke-width="1.1" x1="4" y1="3.5" x2="16" y2="16.5"/></svg>',behance:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.5,10.6c-0.4-0.5-0.9-0.9-1.6-1.1c1.7-1,2.2-3.2,0.7-4.7C7.8,4,6.3,4,5.2,4C3.5,4,1.7,4,0,4v12c1.7,0,3.4,0,5.2,0 c1,0,2.1,0,3.1-0.5C10.2,14.6,10.5,12.3,9.5,10.6L9.5,10.6z M5.6,6.1c1.8,0,1.8,2.7-0.1,2.7c-1,0-2,0-2.9,0V6.1H5.6z M2.6,13.8v-3.1 c1.1,0,2.1,0,3.2,0c2.1,0,2.1,3.2,0.1,3.2L2.6,13.8z"/><path d="M19.9,10.9C19.7,9.2,18.7,7.6,17,7c-4.2-1.3-7.3,3.4-5.3,7.1c0.9,1.7,2.8,2.3,4.7,2.1c1.7-0.2,2.9-1.3,3.4-2.9h-2.2 c-0.4,1.3-2.4,1.5-3.5,0.6c-0.4-0.4-0.6-1.1-0.6-1.7H20C20,11.7,19.9,10.9,19.9,10.9z M13.5,10.6c0-1.6,2.3-2.7,3.5-1.4 c0.4,0.4,0.5,0.9,0.6,1.4H13.5L13.5,10.6z"/><rect x="13" y="4" width="5" height="1.4"/></svg>',bell:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M17,15.5 L3,15.5 C2.99,14.61 3.79,13.34 4.1,12.51 C4.58,11.3 4.72,10.35 5.19,7.01 C5.54,4.53 5.89,3.2 7.28,2.16 C8.13,1.56 9.37,1.5 9.81,1.5 L9.96,1.5 C9.96,1.5 11.62,1.41 12.67,2.17 C14.08,3.2 14.42,4.54 14.77,7.02 C15.26,10.35 15.4,11.31 15.87,12.52 C16.2,13.34 17.01,14.61 17,15.5 L17,15.5 Z"/><path fill="none" stroke="#000" d="M12.39,16 C12.39,17.37 11.35,18.43 9.91,18.43 C8.48,18.43 7.42,17.37 7.42,16"/></svg>',bold:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5,15.3 C5.66,15.3 5.9,15 5.9,14.53 L5.9,5.5 C5.9,4.92 5.56,4.7 5,4.7 L5,4 L8.95,4 C12.6,4 13.7,5.37 13.7,6.9 C13.7,7.87 13.14,9.17 10.86,9.59 L10.86,9.7 C13.25,9.86 14.29,11.28 14.3,12.54 C14.3,14.47 12.94,16 9,16 L5,16 L5,15.3 Z M9,9.3 C11.19,9.3 11.8,8.5 11.85,7 C11.85,5.65 11.3,4.8 9,4.8 L7.67,4.8 L7.67,9.3 L9,9.3 Z M9.185,15.22 C11.97,15 12.39,14 12.4,12.58 C12.4,11.15 11.39,10 9,10 L7.67,10 L7.67,15 L9.18,15 Z"/></svg>',bolt:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4.74,20 L7.73,12 L3,12 L15.43,1 L12.32,9 L17.02,9 L4.74,20 L4.74,20 L4.74,20 Z M9.18,11 L7.1,16.39 L14.47,10 L10.86,10 L12.99,4.67 L5.61,11 L9.18,11 L9.18,11 L9.18,11 Z"/></svg>',bookmark:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="5.5 1.5 15.5 1.5 15.5 17.5 10.5 12.5 5.5 17.5"/></svg>',calendar:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M 2,3 2,17 18,17 18,3 2,3 Z M 17,16 3,16 3,8 17,8 17,16 Z M 17,7 3,7 3,4 17,4 17,7 Z"/><rect width="1" height="3" x="6" y="2"/><rect width="1" height="3" x="13" y="2"/></svg>',camera:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10.8" r="3.8"/><path fill="none" stroke="#000" d="M1,4.5 C0.7,4.5 0.5,4.7 0.5,5 L0.5,17 C0.5,17.3 0.7,17.5 1,17.5 L19,17.5 C19.3,17.5 19.5,17.3 19.5,17 L19.5,5 C19.5,4.7 19.3,4.5 19,4.5 L13.5,4.5 L13.5,2.9 C13.5,2.6 13.3,2.5 13,2.5 L7,2.5 C6.7,2.5 6.5,2.6 6.5,2.9 L6.5,4.5 L1,4.5 L1,4.5 Z"/></svg>',cart:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="7.3" cy="17.3" r="1.4"/><circle cx="13.3" cy="17.3" r="1.4"/><polyline fill="none" stroke="#000" points="0 2 3.2 4 5.3 12.5 16 12.5 18 6.5 8 6.5"/></svg>',check:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.1" points="4,10 8,15 17,4"/></svg>',"chevron-double-left":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="10 14 6 10 10 6"/><polyline fill="none" stroke="#000" stroke-width="1.03" points="14 14 10 10 14 6"/></svg>',"chevron-double-right":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="10 6 14 10 10 14"/><polyline fill="none" stroke="#000" stroke-width="1.03" points="6 6 10 10 6 14"/></svg>',"chevron-down":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="16 7 10 13 4 7"/></svg>',"chevron-left":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="13 16 7 10 13 4"/></svg>',"chevron-right":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="7 4 13 10 7 16"/></svg>',"chevron-up":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.03" points="4 13 10 7 16 13"/></svg>',clock:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/><rect x="9" y="4" width="1" height="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M13.018,14.197 L9.445,10.625"/></svg>',close:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.06" d="M16,16 L4,4"/><path fill="none" stroke="#000" stroke-width="1.06" d="M16,4 L4,16"/></svg>',"cloud-download":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M6.5,14.61 L3.75,14.61 C1.96,14.61 0.5,13.17 0.5,11.39 C0.5,9.76 1.72,8.41 3.3,8.2 C3.38,5.31 5.75,3 8.68,3 C11.19,3 13.31,4.71 13.89,7.02 C14.39,6.8 14.93,6.68 15.5,6.68 C17.71,6.68 19.5,8.45 19.5,10.64 C19.5,12.83 17.71,14.6 15.5,14.6 L12.5,14.6"/><polyline fill="none" stroke="#000" points="11.75 16 9.5 18.25 7.25 16"/><path fill="none" stroke="#000" d="M9.5,18 L9.5,9.5"/></svg>',"cloud-upload":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M6.5,14.61 L3.75,14.61 C1.96,14.61 0.5,13.17 0.5,11.39 C0.5,9.76 1.72,8.41 3.31,8.2 C3.38,5.31 5.75,3 8.68,3 C11.19,3 13.31,4.71 13.89,7.02 C14.39,6.8 14.93,6.68 15.5,6.68 C17.71,6.68 19.5,8.45 19.5,10.64 C19.5,12.83 17.71,14.6 15.5,14.6 L12.5,14.6"/><polyline fill="none" stroke="#000" points="7.25 11.75 9.5 9.5 11.75 11.75"/><path fill="none" stroke="#000" d="M9.5,18 L9.5,9.5"/></svg>',code:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.01" points="13,4 19,10 13,16"/><polyline fill="none" stroke="#000" stroke-width="1.01" points="7,4 1,10 7,16"/></svg>',cog:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" cx="9.997" cy="10" r="3.31"/><path fill="none" stroke="#000" d="M18.488,12.285 L16.205,16.237 C15.322,15.496 14.185,15.281 13.303,15.791 C12.428,16.289 12.047,17.373 12.246,18.5 L7.735,18.5 C7.938,17.374 7.553,16.299 6.684,15.791 C5.801,15.27 4.655,15.492 3.773,16.237 L1.5,12.285 C2.573,11.871 3.317,10.999 3.317,9.991 C3.305,8.98 2.573,8.121 1.5,7.716 L3.765,3.784 C4.645,4.516 5.794,4.738 6.687,4.232 C7.555,3.722 7.939,2.637 7.735,1.5 L12.263,1.5 C12.072,2.637 12.441,3.71 13.314,4.22 C14.206,4.73 15.343,4.516 16.225,3.794 L18.487,7.714 C17.404,8.117 16.661,8.988 16.67,10.009 C16.672,11.018 17.415,11.88 18.488,12.285 L18.488,12.285 Z"/></svg>',comment:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6,18.71 L6,14 L1,14 L1,1 L19,1 L19,14 L10.71,14 L6,18.71 L6,18.71 Z M2,13 L7,13 L7,16.29 L10.29,13 L18,13 L18,2 L2,2 L2,13 L2,13 Z"/></svg>',commenting:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="1.5,1.5 18.5,1.5 18.5,13.5 10.5,13.5 6.5,17.5 6.5,13.5 1.5,13.5"/><circle cx="10" cy="8" r="1"/><circle cx="6" cy="8" r="1"/><circle cx="14" cy="8" r="1"/></svg>',comments:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="2 0.5 19.5 0.5 19.5 13"/><path d="M5,19.71 L5,15 L0,15 L0,2 L18,2 L18,15 L9.71,15 L5,19.71 L5,19.71 L5,19.71 Z M1,14 L6,14 L6,17.29 L9.29,14 L17,14 L17,3 L1,3 L1,14 L1,14 L1,14 Z"/></svg>',copy:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" x="3.5" y="2.5" width="12" height="16"/><polyline fill="none" stroke="#000" points="5 0.5 17.5 0.5 17.5 17"/></svg>',"credit-card":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" x="1.5" y="4.5" width="17" height="12"/><rect x="1" y="7" width="18" height="3"/></svg>',database:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><ellipse fill="none" stroke="#000" cx="10" cy="4.64" rx="7.5" ry="3.14"/><path fill="none" stroke="#000" d="M17.5,8.11 C17.5,9.85 14.14,11.25 10,11.25 C5.86,11.25 2.5,9.84 2.5,8.11"/><path fill="none" stroke="#000" d="M17.5,11.25 C17.5,12.99 14.14,14.39 10,14.39 C5.86,14.39 2.5,12.98 2.5,11.25"/><path fill="none" stroke="#000" d="M17.49,4.64 L17.5,14.36 C17.5,16.1 14.14,17.5 10,17.5 C5.86,17.5 2.5,16.09 2.5,14.36 L2.5,4.64"/></svg>',desktop:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="15" width="1" height="2"/><rect x="11" y="15" width="1" height="2"/><rect x="5" y="16" width="10" height="1"/><rect fill="none" stroke="#000" x="1.5" y="3.5" width="17" height="11"/></svg>',download:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="14,10 9.5,14.5 5,10"/><rect x="3" y="17" width="13" height="1"/><line fill="none" stroke="#000" x1="9.5" y1="13.91" x2="9.5" y2="3"/></svg>',dribbble:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.4" d="M1.3,8.9c0,0,5,0.1,8.6-1c1.4-0.4,2.6-0.9,4-1.9 c1.4-1.1,2.5-2.5,2.5-2.5"/><path fill="none" stroke="#000" stroke-width="1.4" d="M3.9,16.6c0,0,1.7-2.8,3.5-4.2 c1.8-1.3,4-2,5.7-2.2C16,10,19,10.6,19,10.6"/><path fill="none" stroke="#000" stroke-width="1.4" d="M6.9,1.6c0,0,3.3,4.6,4.2,6.8 c0.4,0.9,1.3,3.1,1.9,5.2c0.6,2,0.9,4.4,0.9,4.4"/><circle fill="none" stroke="#000" stroke-width="1.4" cx="10" cy="10" r="9"/></svg>',etsy:'<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M8,4.26C8,4.07,8,4,8.31,4h4.46c.79,0,1.22.67,1.53,1.91l.25,1h.76c.14-2.82.26-4,.26-4S13.65,3,12.52,3H6.81L3.75,2.92v.84l1,.2c.73.11.9.27,1,1,0,0,.06,2,.06,5.17s-.06,5.14-.06,5.14c0,.59-.23.81-1,.94l-1,.2v.84l3.06-.1h5.11c1.15,0,3.82.1,3.82.1,0-.7.45-3.88.51-4.22h-.73l-.76,1.69a2.25,2.25,0,0,1-2.45,1.47H9.4c-1,0-1.44-.4-1.44-1.24V10.44s2.16,0,2.86.06c.55,0,.85.19,1.06,1l.23,1H13L12.9,9.94,13,7.41h-.85l-.28,1.13c-.16.74-.28.84-1,1-1,.1-2.89.09-2.89.09Z"/></svg>',expand:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 18 2 18 7 17 7 17 3 13 3"/><polygon points="2 13 3 13 3 17 7 17 7 18 2 18"/><path fill="none" stroke="#000" stroke-width="1.1" d="M11,9 L17,3"/><path fill="none" stroke="#000" stroke-width="1.1" d="M3,17 L9,11"/></svg>',facebook:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11,10h2.6l0.4-3H11V5.3c0-0.9,0.2-1.5,1.5-1.5H14V1.1c-0.3,0-1-0.1-2.1-0.1C9.6,1,8,2.4,8,5v2H5.5v3H8v8h3V10z"/></svg>',"file-edit":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M18.65,1.68 C18.41,1.45 18.109,1.33 17.81,1.33 C17.499,1.33 17.209,1.45 16.98,1.68 L8.92,9.76 L8,12.33 L10.55,11.41 L18.651,3.34 C19.12,2.87 19.12,2.15 18.65,1.68 L18.65,1.68 L18.65,1.68 Z"/><polyline fill="none" stroke="#000" points="16.5 8.482 16.5 18.5 3.5 18.5 3.5 1.5 14.211 1.5"/></svg>',"file-pdf":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" width="13" height="17" x="3.5" y="1.5"/><path d="M14.65 11.67c-.48.3-1.37-.19-1.79-.37a4.65 4.65 0 0 1 1.49.06c.35.1.36.28.3.31zm-6.3.06l.43-.79a14.7 14.7 0 0 0 .75-1.64 5.48 5.48 0 0 0 1.25 1.55l.2.15a16.36 16.36 0 0 0-2.63.73zM9.5 5.32c.2 0 .32.5.32.97a1.99 1.99 0 0 1-.23 1.04 5.05 5.05 0 0 1-.17-1.3s0-.71.08-.71zm-3.9 9a4.35 4.35 0 0 1 1.21-1.46l.24-.22a4.35 4.35 0 0 1-1.46 1.68zm9.23-3.3a2.05 2.05 0 0 0-1.32-.3 11.07 11.07 0 0 0-1.58.11 4.09 4.09 0 0 1-.74-.5 5.39 5.39 0 0 1-1.32-2.06 10.37 10.37 0 0 0 .28-2.62 1.83 1.83 0 0 0-.07-.25.57.57 0 0 0-.52-.4H9.4a.59.59 0 0 0-.6.38 6.95 6.95 0 0 0 .37 3.14c-.26.63-1 2.12-1 2.12-.3.58-.57 1.08-.82 1.5l-.8.44A3.11 3.11 0 0 0 5 14.16a.39.39 0 0 0 .15.42l.24.13c1.15.56 2.28-1.74 2.66-2.42a23.1 23.1 0 0 1 3.59-.85 4.56 4.56 0 0 0 2.91.8.5.5 0 0 0 .3-.21 1.1 1.1 0 0 0 .12-.75.84.84 0 0 0-.14-.25z"/></svg>',"file-text":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" width="13" height="17" x="3.5" y="1.5"/><line fill="none" stroke="#000" x1="6" x2="12" y1="12.5" y2="12.5"/><line fill="none" stroke="#000" x1="6" x2="14" y1="8.5" y2="8.5"/><line fill="none" stroke="#000" x1="6" x2="14" y1="6.5" y2="6.5"/><line fill="none" stroke="#000" x1="6" x2="14" y1="10.5" y2="10.5"/></svg>',file:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" x="3.5" y="1.5" width="13" height="17"/></svg>',flickr:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="5.5" cy="9.5" r="3.5"/><circle cx="14.5" cy="9.5" r="3.5"/></svg>',folder:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="9.5 5.5 8.5 3.5 1.5 3.5 1.5 16.5 18.5 16.5 18.5 5.5"/></svg>',forward:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.47,13.11 C4.02,10.02 6.27,7.85 9.04,6.61 C9.48,6.41 10.27,6.13 11,5.91 L11,2 L18.89,9 L11,16 L11,12.13 C9.25,12.47 7.58,13.19 6.02,14.25 C3.03,16.28 1.63,18.54 1.63,18.54 C1.63,18.54 1.38,15.28 2.47,13.11 L2.47,13.11 Z M5.3,13.53 C6.92,12.4 9.04,11.4 12,10.92 L12,13.63 L17.36,9 L12,4.25 L12,6.8 C11.71,6.86 10.86,7.02 9.67,7.49 C6.79,8.65 4.58,10.96 3.49,13.08 C3.18,13.7 2.68,14.87 2.49,16 C3.28,15.05 4.4,14.15 5.3,13.53 L5.3,13.53 Z"/></svg>',foursquare:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.23,2 C15.96,2 16.4,2.41 16.5,2.86 C16.57,3.15 16.56,3.44 16.51,3.73 C16.46,4.04 14.86,11.72 14.75,12.03 C14.56,12.56 14.16,12.82 13.61,12.83 C13.03,12.84 11.09,12.51 10.69,13 C10.38,13.38 7.79,16.39 6.81,17.53 C6.61,17.76 6.4,17.96 6.08,17.99 C5.68,18.04 5.29,17.87 5.17,17.45 C5.12,17.28 5.1,17.09 5.1,16.91 C5.1,12.4 4.86,7.81 5.11,3.31 C5.17,2.5 5.81,2.12 6.53,2 L15.23,2 L15.23,2 Z M9.76,11.42 C9.94,11.19 10.17,11.1 10.45,11.1 L12.86,11.1 C13.12,11.1 13.31,10.94 13.36,10.69 C13.37,10.64 13.62,9.41 13.74,8.83 C13.81,8.52 13.53,8.28 13.27,8.28 C12.35,8.29 11.42,8.28 10.5,8.28 C9.84,8.28 9.83,7.69 9.82,7.21 C9.8,6.85 10.13,6.55 10.5,6.55 C11.59,6.56 12.67,6.55 13.76,6.55 C14.03,6.55 14.23,6.4 14.28,6.14 C14.34,5.87 14.67,4.29 14.67,4.29 C14.67,4.29 14.82,3.74 14.19,3.74 L7.34,3.74 C7,3.75 6.84,4.02 6.84,4.33 C6.84,7.58 6.85,14.95 6.85,14.99 C6.87,15 8.89,12.51 9.76,11.42 L9.76,11.42 Z"/></svg>',future:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline points="19 2 18 2 18 6 14 6 14 7 19 7 19 2"/><path fill="none" stroke="#000" stroke-width="1.1" d="M18,6.548 C16.709,3.29 13.354,1 9.6,1 C4.6,1 0.6,5 0.6,10 C0.6,15 4.6,19 9.6,19 C14.6,19 18.6,15 18.6,10"/><rect x="9" y="4" width="1" height="7"/><path d="M13.018,14.197 L9.445,10.625" fill="none" stroke="#000" stroke-width="1.1"/></svg>',"git-branch":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.2" cx="7" cy="3" r="2"/><circle fill="none" stroke="#000" stroke-width="1.2" cx="14" cy="6" r="2"/><circle fill="none" stroke="#000" stroke-width="1.2" cx="7" cy="17" r="2"/><path fill="none" stroke="#000" stroke-width="2" d="M14,8 C14,10.41 12.43,10.87 10.56,11.25 C9.09,11.54 7,12.06 7,15 L7,5"/></svg>',"git-fork":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.2" cx="5.79" cy="2.79" r="1.79"/><circle fill="none" stroke="#000" stroke-width="1.2" cx="14.19" cy="2.79" r="1.79"/><circle fill="none" stroke="#000" stroke-width="1.2" cx="10.03" cy="16.79" r="1.79"/><path fill="none" stroke="#000" stroke-width="2" d="M5.79,4.57 L5.79,6.56 C5.79,9.19 10.03,10.22 10.03,13.31 C10.03,14.86 10.04,14.55 10.04,14.55 C10.04,14.37 10.04,14.86 10.04,13.31 C10.04,10.22 14.2,9.19 14.2,6.56 L14.2,4.57"/></svg>',"github-alt":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,0.5 C4.75,0.5 0.5,4.76 0.5,10.01 C0.5,15.26 4.75,19.51 10,19.51 C15.24,19.51 19.5,15.26 19.5,10.01 C19.5,4.76 15.25,0.5 10,0.5 L10,0.5 Z M12.81,17.69 C12.81,17.69 12.81,17.7 12.79,17.69 C12.47,17.75 12.35,17.59 12.35,17.36 L12.35,16.17 C12.35,15.45 12.09,14.92 11.58,14.56 C12.2,14.51 12.77,14.39 13.26,14.21 C13.87,13.98 14.36,13.69 14.74,13.29 C15.42,12.59 15.76,11.55 15.76,10.17 C15.76,9.25 15.45,8.46 14.83,7.8 C15.1,7.08 15.07,6.29 14.75,5.44 L14.51,5.42 C14.34,5.4 14.06,5.46 13.67,5.61 C13.25,5.78 12.79,6.03 12.31,6.35 C11.55,6.16 10.81,6.05 10.09,6.05 C9.36,6.05 8.61,6.15 7.88,6.35 C7.28,5.96 6.75,5.68 6.26,5.54 C6.07,5.47 5.9,5.44 5.78,5.44 L5.42,5.44 C5.06,6.29 5.04,7.08 5.32,7.8 C4.7,8.46 4.4,9.25 4.4,10.17 C4.4,11.94 4.96,13.16 6.08,13.84 C6.53,14.13 7.05,14.32 7.69,14.43 C8.03,14.5 8.32,14.54 8.55,14.55 C8.07,14.89 7.82,15.42 7.82,16.16 L7.82,17.51 C7.8,17.69 7.7,17.8 7.51,17.8 C4.21,16.74 1.82,13.65 1.82,10.01 C1.82,5.5 5.49,1.83 10,1.83 C14.5,1.83 18.17,5.5 18.17,10.01 C18.18,13.53 15.94,16.54 12.81,17.69 L12.81,17.69 Z"/></svg>',github:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,1 C5.03,1 1,5.03 1,10 C1,13.98 3.58,17.35 7.16,18.54 C7.61,18.62 7.77,18.34 7.77,18.11 C7.77,17.9 7.76,17.33 7.76,16.58 C5.26,17.12 4.73,15.37 4.73,15.37 C4.32,14.33 3.73,14.05 3.73,14.05 C2.91,13.5 3.79,13.5 3.79,13.5 C4.69,13.56 5.17,14.43 5.17,14.43 C5.97,15.8 7.28,15.41 7.79,15.18 C7.87,14.6 8.1,14.2 8.36,13.98 C6.36,13.75 4.26,12.98 4.26,9.53 C4.26,8.55 4.61,7.74 5.19,7.11 C5.1,6.88 4.79,5.97 5.28,4.73 C5.28,4.73 6.04,4.49 7.75,5.65 C8.47,5.45 9.24,5.35 10,5.35 C10.76,5.35 11.53,5.45 12.25,5.65 C13.97,4.48 14.72,4.73 14.72,4.73 C15.21,5.97 14.9,6.88 14.81,7.11 C15.39,7.74 15.73,8.54 15.73,9.53 C15.73,12.99 13.63,13.75 11.62,13.97 C11.94,14.25 12.23,14.8 12.23,15.64 C12.23,16.84 12.22,17.81 12.22,18.11 C12.22,18.35 12.38,18.63 12.84,18.54 C16.42,17.35 19,13.98 19,10 C19,5.03 14.97,1 10,1 L10,1 Z"/></svg>',gitter:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="1" width="1.531" height="11.471"/><rect x="7.324" y="4.059" width="1.529" height="15.294"/><rect x="11.148" y="4.059" width="1.527" height="15.294"/><rect x="14.971" y="4.059" width="1.529" height="8.412"/></svg>',"google-plus":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.9,9c0,2.7-0.6,5-3.2,6.3c-3.7,1.8-8.1,0.2-9.4-3.6C-1.1,7.6,1.9,3.3,6.1,3c1.7-0.1,3.2,0.3,4.6,1.3 c0.1,0.1,0.3,0.2,0.4,0.4c-0.5,0.5-1.2,1-1.7,1.6c-1-0.8-2.1-1.1-3.5-0.9C5,5.6,4.2,6,3.6,6.7c-1.3,1.3-1.5,3.4-0.5,5 c1,1.7,2.6,2.3,4.6,1.9c1.4-0.3,2.4-1.2,2.6-2.6H6.9V9H12.9z"/><polygon points="20,9 20,11 18,11 18,13 16,13 16,11 14,11 14,9 16,9 16,7 18,7 18,9"/></svg>',google:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.86,9.09 C18.46,12.12 17.14,16.05 13.81,17.56 C9.45,19.53 4.13,17.68 2.47,12.87 C0.68,7.68 4.22,2.42 9.5,2.03 C11.57,1.88 13.42,2.37 15.05,3.65 C15.22,3.78 15.37,3.93 15.61,4.14 C14.9,4.81 14.23,5.45 13.5,6.14 C12.27,5.08 10.84,4.72 9.28,4.98 C8.12,5.17 7.16,5.76 6.37,6.63 C4.88,8.27 4.62,10.86 5.76,12.82 C6.95,14.87 9.17,15.8 11.57,15.25 C13.27,14.87 14.76,13.33 14.89,11.75 L10.51,11.75 L10.51,9.09 L17.86,9.09 L17.86,9.09 Z"/></svg>',grid:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="3" height="3"/><rect x="8" y="2" width="3" height="3"/><rect x="14" y="2" width="3" height="3"/><rect x="2" y="8" width="3" height="3"/><rect x="8" y="8" width="3" height="3"/><rect x="14" y="8" width="3" height="3"/><rect x="2" y="14" width="3" height="3"/><rect x="8" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>',happy:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="13" cy="7" r="1"/><circle cx="7" cy="7" r="1"/><circle fill="none" stroke="#000" cx="10" cy="10" r="8.5"/><path fill="none" stroke="#000" d="M14.6,11.4 C13.9,13.3 12.1,14.5 10,14.5 C7.9,14.5 6.1,13.3 5.4,11.4"/></svg>',hashtag:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.431,8 L15.661,7 L12.911,7 L13.831,3 L12.901,3 L11.98,7 L9.29,7 L10.21,3 L9.281,3 L8.361,7 L5.23,7 L5,8 L8.13,8 L7.21,12 L4.23,12 L4,13 L6.98,13 L6.061,17 L6.991,17 L7.911,13 L10.601,13 L9.681,17 L10.611,17 L11.531,13 L14.431,13 L14.661,12 L11.76,12 L12.681,8 L15.431,8 Z M10.831,12 L8.141,12 L9.061,8 L11.75,8 L10.831,12 Z"/></svg>',heart:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.03" d="M10,4 C10,4 8.1,2 5.74,2 C3.38,2 1,3.55 1,6.73 C1,8.84 2.67,10.44 2.67,10.44 L10,18 L17.33,10.44 C17.33,10.44 19,8.84 19,6.73 C19,3.55 16.62,2 14.26,2 C11.9,2 10,4 10,4 L10,4 Z"/></svg>',history:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="#000" points="1 2 2 2 2 6 6 6 6 7 1 7 1 2"/><path fill="none" stroke="#000" stroke-width="1.1" d="M2.1,6.548 C3.391,3.29 6.746,1 10.5,1 C15.5,1 19.5,5 19.5,10 C19.5,15 15.5,19 10.5,19 C5.5,19 1.5,15 1.5,10"/><rect x="9" y="4" width="1" height="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M13.018,14.197 L9.445,10.625"/></svg>',home:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="18.65 11.35 10 2.71 1.35 11.35 0.65 10.65 10 1.29 19.35 10.65"/><polygon points="15 4 18 4 18 7 17 7 17 5 15 5"/><polygon points="3 11 4 11 4 18 7 18 7 12 12 12 12 18 16 18 16 11 17 11 17 19 11 19 11 13 8 13 8 19 3 19"/></svg>',image:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="16.1" cy="6.1" r="1.1"/><rect fill="none" stroke="#000" x=".5" y="2.5" width="19" height="15"/><polyline fill="none" stroke="#000" stroke-width="1.01" points="4,13 8,9 13,14"/><polyline fill="none" stroke="#000" stroke-width="1.01" points="11,12 12.5,10.5 16,14"/></svg>',info:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.13,11.59 C11.97,12.84 10.35,14.12 9.1,14.16 C6.17,14.2 9.89,9.46 8.74,8.37 C9.3,8.16 10.62,7.83 10.62,8.81 C10.62,9.63 10.12,10.55 9.88,11.32 C8.66,15.16 12.13,11.15 12.14,11.18 C12.16,11.21 12.16,11.35 12.13,11.59 C12.08,11.95 12.16,11.35 12.13,11.59 L12.13,11.59 Z M11.56,5.67 C11.56,6.67 9.36,7.15 9.36,6.03 C9.36,5 11.56,4.54 11.56,5.67 L11.56,5.67 Z"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/></svg>',instagram:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13.55,1H6.46C3.45,1,1,3.44,1,6.44v7.12c0,3,2.45,5.44,5.46,5.44h7.08c3.02,0,5.46-2.44,5.46-5.44V6.44 C19.01,3.44,16.56,1,13.55,1z M17.5,14c0,1.93-1.57,3.5-3.5,3.5H6c-1.93,0-3.5-1.57-3.5-3.5V6c0-1.93,1.57-3.5,3.5-3.5h8 c1.93,0,3.5,1.57,3.5,3.5V14z"/><circle cx="14.87" cy="5.26" r="1.09"/><path d="M10.03,5.45c-2.55,0-4.63,2.06-4.63,4.6c0,2.55,2.07,4.61,4.63,4.61c2.56,0,4.63-2.061,4.63-4.61 C14.65,7.51,12.58,5.45,10.03,5.45L10.03,5.45L10.03,5.45z M10.08,13c-1.66,0-3-1.34-3-2.99c0-1.65,1.34-2.99,3-2.99s3,1.34,3,2.99 C13.08,11.66,11.74,13,10.08,13L10.08,13L10.08,13z"/></svg>',italic:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.63,5.48 L10.15,14.52 C10,15.08 10.37,15.25 11.92,15.3 L11.72,16 L6,16 L6.2,15.31 C7.78,15.26 8.19,15.09 8.34,14.53 L10.82,5.49 C10.97,4.92 10.63,4.76 9.09,4.71 L9.28,4 L15,4 L14.81,4.69 C13.23,4.75 12.78,4.91 12.63,5.48 L12.63,5.48 Z"/></svg>',joomla:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7.8,13.4l1.7-1.7L5.9,8c-0.6-0.5-0.6-1.5,0-2c0.6-0.6,1.4-0.6,2,0l1.7-1.7c-1-1-2.3-1.3-3.6-1C5.8,2.2,4.8,1.4,3.7,1.4 c-1.3,0-2.3,1-2.3,2.3c0,1.1,0.8,2,1.8,2.3c-0.4,1.3-0.1,2.8,1,3.8L7.8,13.4L7.8,13.4z"/><path d="M10.2,4.3c1-1,2.5-1.4,3.8-1c0.2-1.1,1.1-2,2.3-2c1.3,0,2.3,1,2.3,2.3c0,1.2-0.9,2.2-2,2.3c0.4,1.3,0,2.8-1,3.8L13.9,8 c0.6-0.5,0.6-1.5,0-2c-0.5-0.6-1.5-0.6-2,0L8.2,9.7L6.5,8"/><path d="M14.1,16.8c-1.3,0.4-2.8,0.1-3.8-1l1.7-1.7c0.6,0.6,1.5,0.6,2,0c0.5-0.6,0.6-1.5,0-2l-3.7-3.7L12,6.7l3.7,3.7 c1,1,1.3,2.4,1,3.6c1.1,0.2,2,1.1,2,2.3c0,1.3-1,2.3-2.3,2.3C15.2,18.6,14.3,17.8,14.1,16.8"/><path d="M13.2,12.2l-3.7,3.7c-1,1-2.4,1.3-3.6,1c-0.2,1-1.2,1.8-2.2,1.8c-1.3,0-2.3-1-2.3-2.3c0-1.1,0.8-2,1.8-2.3 c-0.3-1.3,0-2.7,1-3.7l1.7,1.7c-0.6,0.6-0.6,1.5,0,2c0.6,0.6,1.4,0.6,2,0l3.7-3.7"/></svg>',laptop:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect y="16" width="20" height="1"/><rect fill="none" stroke="#000" x="2.5" y="4.5" width="15" height="10"/></svg>',lifesaver:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,0.5 C4.76,0.5 0.5,4.76 0.5,10 C0.5,15.24 4.76,19.5 10,19.5 C15.24,19.5 19.5,15.24 19.5,10 C19.5,4.76 15.24,0.5 10,0.5 L10,0.5 Z M10,1.5 C11.49,1.5 12.89,1.88 14.11,2.56 L11.85,4.82 C11.27,4.61 10.65,4.5 10,4.5 C9.21,4.5 8.47,4.67 7.79,4.96 L5.58,2.75 C6.87,1.95 8.38,1.5 10,1.5 L10,1.5 Z M4.96,7.8 C4.67,8.48 4.5,9.21 4.5,10 C4.5,10.65 4.61,11.27 4.83,11.85 L2.56,14.11 C1.88,12.89 1.5,11.49 1.5,10 C1.5,8.38 1.95,6.87 2.75,5.58 L4.96,7.79 L4.96,7.8 L4.96,7.8 Z M10,18.5 C8.25,18.5 6.62,17.97 5.27,17.06 L7.46,14.87 C8.22,15.27 9.08,15.5 10,15.5 C10.79,15.5 11.53,15.33 12.21,15.04 L14.42,17.25 C13.13,18.05 11.62,18.5 10,18.5 L10,18.5 Z M10,14.5 C7.52,14.5 5.5,12.48 5.5,10 C5.5,7.52 7.52,5.5 10,5.5 C12.48,5.5 14.5,7.52 14.5,10 C14.5,12.48 12.48,14.5 10,14.5 L10,14.5 Z M15.04,12.21 C15.33,11.53 15.5,10.79 15.5,10 C15.5,9.08 15.27,8.22 14.87,7.46 L17.06,5.27 C17.97,6.62 18.5,8.25 18.5,10 C18.5,11.62 18.05,13.13 17.25,14.42 L15.04,12.21 L15.04,12.21 Z"/></svg>',link:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M10.625,12.375 L7.525,15.475 C6.825,16.175 5.925,16.175 5.225,15.475 L4.525,14.775 C3.825,14.074 3.825,13.175 4.525,12.475 L7.625,9.375"/><path fill="none" stroke="#000" stroke-width="1.1" d="M9.325,7.375 L12.425,4.275 C13.125,3.575 14.025,3.575 14.724,4.275 L15.425,4.975 C16.125,5.675 16.125,6.575 15.425,7.275 L12.325,10.375"/><path fill="none" stroke="#000" stroke-width="1.1" d="M7.925,11.875 L11.925,7.975"/></svg>',linkedin:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5.77,17.89 L5.77,7.17 L2.21,7.17 L2.21,17.89 L5.77,17.89 L5.77,17.89 Z M3.99,5.71 C5.23,5.71 6.01,4.89 6.01,3.86 C5.99,2.8 5.24,2 4.02,2 C2.8,2 2,2.8 2,3.85 C2,4.88 2.77,5.7 3.97,5.7 L3.99,5.7 L3.99,5.71 L3.99,5.71 Z"/><path d="M7.75,17.89 L11.31,17.89 L11.31,11.9 C11.31,11.58 11.33,11.26 11.43,11.03 C11.69,10.39 12.27,9.73 13.26,9.73 C14.55,9.73 15.06,10.71 15.06,12.15 L15.06,17.89 L18.62,17.89 L18.62,11.74 C18.62,8.45 16.86,6.92 14.52,6.92 C12.6,6.92 11.75,7.99 11.28,8.73 L11.3,8.73 L11.3,7.17 L7.75,7.17 C7.79,8.17 7.75,17.89 7.75,17.89 L7.75,17.89 L7.75,17.89 Z"/></svg>',list:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="4" width="12" height="1"/><rect x="6" y="9" width="12" height="1"/><rect x="6" y="14" width="12" height="1"/><rect x="2" y="4" width="2" height="1"/><rect x="2" y="9" width="2" height="1"/><rect x="2" y="14" width="2" height="1"/></svg>',location:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.01" d="M10,0.5 C6.41,0.5 3.5,3.39 3.5,6.98 C3.5,11.83 10,19 10,19 C10,19 16.5,11.83 16.5,6.98 C16.5,3.39 13.59,0.5 10,0.5 L10,0.5 Z"/><circle fill="none" stroke="#000" cx="10" cy="6.8" r="2.3"/></svg>',lock:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" height="10" width="13" y="8.5" x="3.5"/><path fill="none" stroke="#000" d="M6.5,8 L6.5,4.88 C6.5,3.01 8.07,1.5 10,1.5 C11.93,1.5 13.5,3.01 13.5,4.88 L13.5,8"/></svg>',mail:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="1.4,6.5 10,11 18.6,6.5"/><path d="M 1,4 1,16 19,16 19,4 1,4 Z M 18,15 2,15 2,5 18,5 18,15 Z"/></svg>',menu:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="16" height="1"/><rect x="2" y="9" width="16" height="1"/><rect x="2" y="14" width="16" height="1"/></svg>',microphone:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" x1="10" x2="10" y1="16.44" y2="18.5"/><line fill="none" stroke="#000" x1="7" x2="13" y1="18.5" y2="18.5"/><path fill="none" stroke="#000" stroke-width="1.1" d="M13.5 4.89v5.87a3.5 3.5 0 0 1-7 0V4.89a3.5 3.5 0 0 1 7 0z"/><path fill="none" stroke="#000" stroke-width="1.1" d="M15.5 10.36V11a5.5 5.5 0 0 1-11 0v-.6"/></svg>',"minus-circle":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9.5" cy="9.5" r="9"/><line fill="none" stroke="#000" x1="5" y1="9.5" x2="14" y2="9.5"/></svg>',minus:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect height="1" width="18" y="9" x="1"/></svg>',"more-vertical":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="3" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="17" r="2"/></svg>',more:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="3" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="17" cy="10" r="2"/></svg>',move:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="4,5 1,5 1,9 2,9 2,6 4,6"/><polygon points="1,16 2,16 2,18 4,18 4,19 1,19"/><polygon points="14,16 14,19 11,19 11,18 13,18 13,16"/><rect fill="none" stroke="#000" x="5.5" y="1.5" width="13" height="13"/><rect x="1" y="11" width="1" height="3"/><rect x="6" y="18" width="3" height="1"/></svg>',nut:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="2.5,5.7 10,1.3 17.5,5.7 17.5,14.3 10,18.7 2.5,14.3"/><circle fill="none" stroke="#000" cx="10" cy="10" r="3.5"/></svg>',pagekit:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="3,1 17,1 17,16 10,16 10,13 14,13 14,4 6,4 6,16 10,16 10,19 3,19"/></svg>',"paint-bucket":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.21,1 L0,11.21 L8.1,19.31 L18.31,9.1 L10.21,1 L10.21,1 Z M16.89,9.1 L15,11 L1.7,11 L10.21,2.42 L16.89,9.1 Z"/><path fill="none" stroke="#000" stroke-width="1.1" d="M6.42,2.33 L11.7,7.61"/><path d="M18.49,12 C18.49,12 20,14.06 20,15.36 C20,16.28 19.24,17 18.49,17 L18.49,17 C17.74,17 17,16.28 17,15.36 C17,14.06 18.49,12 18.49,12 L18.49,12 Z"/></svg>',pencil:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M17.25,6.01 L7.12,16.1 L3.82,17.2 L5.02,13.9 L15.12,3.88 C15.71,3.29 16.66,3.29 17.25,3.88 C17.83,4.47 17.83,5.42 17.25,6.01 L17.25,6.01 Z"/><path fill="none" stroke="#000" d="M15.98,7.268 L13.851,5.148"/></svg>',"phone-landscape":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M17,5.5 C17.8,5.5 18.5,6.2 18.5,7 L18.5,14 C18.5,14.8 17.8,15.5 17,15.5 L3,15.5 C2.2,15.5 1.5,14.8 1.5,14 L1.5,7 C1.5,6.2 2.2,5.5 3,5.5 L17,5.5 L17,5.5 L17,5.5 Z"/><circle cx="3.8" cy="10.5" r=".8"/></svg>',phone:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M15.5,17 C15.5,17.8 14.8,18.5 14,18.5 L7,18.5 C6.2,18.5 5.5,17.8 5.5,17 L5.5,3 C5.5,2.2 6.2,1.5 7,1.5 L14,1.5 C14.8,1.5 15.5,2.2 15.5,3 L15.5,17 L15.5,17 L15.5,17 Z"/><circle cx="10.5" cy="16.5" r=".8"/></svg>',pinterest:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.21,1 C5.5,1 3,4.16 3,7.61 C3,9.21 3.85,11.2 5.22,11.84 C5.43,11.94 5.54,11.89 5.58,11.69 C5.62,11.54 5.8,10.8 5.88,10.45 C5.91,10.34 5.89,10.24 5.8,10.14 C5.36,9.59 5,8.58 5,7.65 C5,5.24 6.82,2.91 9.93,2.91 C12.61,2.91 14.49,4.74 14.49,7.35 C14.49,10.3 13,12.35 11.06,12.35 C9.99,12.35 9.19,11.47 9.44,10.38 C9.75,9.08 10.35,7.68 10.35,6.75 C10.35,5.91 9.9,5.21 8.97,5.21 C7.87,5.21 6.99,6.34 6.99,7.86 C6.99,8.83 7.32,9.48 7.32,9.48 C7.32,9.48 6.24,14.06 6.04,14.91 C5.7,16.35 6.08,18.7 6.12,18.9 C6.14,19.01 6.26,19.05 6.33,18.95 C6.44,18.81 7.74,16.85 8.11,15.44 C8.24,14.93 8.79,12.84 8.79,12.84 C9.15,13.52 10.19,14.09 11.29,14.09 C14.58,14.09 16.96,11.06 16.96,7.3 C16.94,3.7 14,1 10.21,1"/></svg>',"play-circle":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" stroke-width="1.1" points="8.5 7 13.5 10 8.5 13"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/></svg>',play:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="6.5,5 14.5,10 6.5,15"/></svg>',"plus-circle":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9.5" cy="9.5" r="9"/><line fill="none" stroke="#000" x1="9.5" y1="5" x2="9.5" y2="14"/><line fill="none" stroke="#000" x1="5" y1="9.5" x2="14" y2="9.5"/></svg>',plus:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="1" width="1" height="17"/><rect x="1" y="9" width="17" height="1"/></svg>',print:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="4.5 13.5 1.5 13.5 1.5 6.5 18.5 6.5 18.5 13.5 15.5 13.5"/><polyline fill="none" stroke="#000" points="15.5 6.5 15.5 2.5 4.5 2.5 4.5 6.5"/><rect fill="none" stroke="#000" width="11" height="6" x="4.5" y="11.5"/><rect width="8" height="1" x="6" y="13"/><rect width="8" height="1" x="6" y="15"/></svg>',pull:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="6.85,8 9.5,10.6 12.15,8 12.85,8.7 9.5,12 6.15,8.7"/><line fill="none" stroke="#000" x1="9.5" y1="11" x2="9.5" y2="2"/><polyline fill="none" stroke="#000" points="6,5.5 3.5,5.5 3.5,18.5 15.5,18.5 15.5,5.5 13,5.5"/></svg>',push:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="12.15,4 9.5,1.4 6.85,4 6.15,3.3 9.5,0 12.85,3.3"/><line fill="none" stroke="#000" x1="9.5" y1="10" x2="9.5" y2="1"/><polyline fill="none" stroke="#000" points="6 5.5 3.5 5.5 3.5 18.5 15.5 18.5 15.5 5.5 13 5.5"/></svg>',question:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/><circle cx="10.44" cy="14.42" r="1.05"/><path fill="none" stroke="#000" stroke-width="1.2" d="M8.17,7.79 C8.17,4.75 12.72,4.73 12.72,7.72 C12.72,8.67 11.81,9.15 11.23,9.75 C10.75,10.24 10.51,10.73 10.45,11.4 C10.44,11.53 10.43,11.64 10.43,11.75"/></svg>',"quote-right":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.27,7.79 C17.27,9.45 16.97,10.43 15.99,12.02 C14.98,13.64 13,15.23 11.56,15.97 L11.1,15.08 C12.34,14.2 13.14,13.51 14.02,11.82 C14.27,11.34 14.41,10.92 14.49,10.54 C14.3,10.58 14.09,10.6 13.88,10.6 C12.06,10.6 10.59,9.12 10.59,7.3 C10.59,5.48 12.06,4 13.88,4 C15.39,4 16.67,5.02 17.05,6.42 C17.19,6.82 17.27,7.27 17.27,7.79 L17.27,7.79 Z"/><path d="M8.68,7.79 C8.68,9.45 8.38,10.43 7.4,12.02 C6.39,13.64 4.41,15.23 2.97,15.97 L2.51,15.08 C3.75,14.2 4.55,13.51 5.43,11.82 C5.68,11.34 5.82,10.92 5.9,10.54 C5.71,10.58 5.5,10.6 5.29,10.6 C3.47,10.6 2,9.12 2,7.3 C2,5.48 3.47,4 5.29,4 C6.8,4 8.08,5.02 8.46,6.42 C8.6,6.82 8.68,7.27 8.68,7.79 L8.68,7.79 Z"/></svg>',receiver:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.01" d="M6.189,13.611C8.134,15.525 11.097,18.239 13.867,18.257C16.47,18.275 18.2,16.241 18.2,16.241L14.509,12.551L11.539,13.639L6.189,8.29L7.313,5.355L3.76,1.8C3.76,1.8 1.732,3.537 1.7,6.092C1.667,8.809 4.347,11.738 6.189,13.611"/></svg>',reddit:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M19 9.05a2.56 2.56 0 0 0-2.56-2.56 2.59 2.59 0 0 0-1.88.82 10.63 10.63 0 0 0-4.14-1v-.08c.58-1.62 1.58-3.89 2.7-4.1.38-.08.77.12 1.19.57a1.15 1.15 0 0 0-.06.37 1.48 1.48 0 1 0 1.51-1.45 1.43 1.43 0 0 0-.76.19A2.29 2.29 0 0 0 12.91 1c-2.11.43-3.39 4.38-3.63 5.19 0 0 0 .11-.06.11a10.65 10.65 0 0 0-3.75 1A2.56 2.56 0 0 0 1 9.05a2.42 2.42 0 0 0 .72 1.76A5.18 5.18 0 0 0 1.24 13c0 3.66 3.92 6.64 8.73 6.64s8.74-3 8.74-6.64a5.23 5.23 0 0 0-.46-2.13A2.58 2.58 0 0 0 19 9.05zm-16.88 0a1.44 1.44 0 0 1 2.27-1.19 7.68 7.68 0 0 0-2.07 1.91 1.33 1.33 0 0 1-.2-.72zM10 18.4c-4.17 0-7.55-2.4-7.55-5.4S5.83 7.53 10 7.53 17.5 10 17.5 13s-3.38 5.4-7.5 5.4zm7.69-8.61a7.62 7.62 0 0 0-2.09-1.91 1.41 1.41 0 0 1 .84-.28 1.47 1.47 0 0 1 1.44 1.45 1.34 1.34 0 0 1-.21.72z"/><path d="M6.69 12.58a1.39 1.39 0 1 1 1.39-1.39 1.38 1.38 0 0 1-1.38 1.39z"/><path d="M14.26 11.2a1.39 1.39 0 1 1-1.39-1.39 1.39 1.39 0 0 1 1.39 1.39z"/><path d="M13.09 14.88a.54.54 0 0 1-.09.77 5.3 5.3 0 0 1-3.26 1.19 5.61 5.61 0 0 1-3.4-1.22.55.55 0 1 1 .73-.83 4.09 4.09 0 0 0 5.25 0 .56.56 0 0 1 .77.09z"/></svg>',refresh:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M17.08,11.15 C17.09,11.31 17.1,11.47 17.1,11.64 C17.1,15.53 13.94,18.69 10.05,18.69 C6.16,18.68 3,15.53 3,11.63 C3,7.74 6.16,4.58 10.05,4.58 C10.9,4.58 11.71,4.73 12.46,5"/><polyline fill="none" stroke="#000" points="9.9 2 12.79 4.89 9.79 7.9"/></svg>',reply:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.7,13.11 C16.12,10.02 13.84,7.85 11.02,6.61 C10.57,6.41 9.75,6.13 9,5.91 L9,2 L1,9 L9,16 L9,12.13 C10.78,12.47 12.5,13.19 14.09,14.25 C17.13,16.28 18.56,18.54 18.56,18.54 C18.56,18.54 18.81,15.28 17.7,13.11 L17.7,13.11 Z M14.82,13.53 C13.17,12.4 11.01,11.4 8,10.92 L8,13.63 L2.55,9 L8,4.25 L8,6.8 C8.3,6.86 9.16,7.02 10.37,7.49 C13.3,8.65 15.54,10.96 16.65,13.08 C16.97,13.7 17.48,14.86 17.68,16 C16.87,15.05 15.73,14.15 14.82,13.53 L14.82,13.53 Z"/></svg>',rss:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="3.12" cy="16.8" r="1.85"/><path fill="none" stroke="#000" stroke-width="1.1" d="M1.5,8.2 C1.78,8.18 2.06,8.16 2.35,8.16 C7.57,8.16 11.81,12.37 11.81,17.57 C11.81,17.89 11.79,18.19 11.76,18.5"/><path fill="none" stroke="#000" stroke-width="1.1" d="M1.5,2.52 C1.78,2.51 2.06,2.5 2.35,2.5 C10.72,2.5 17.5,9.24 17.5,17.57 C17.5,17.89 17.49,18.19 17.47,18.5"/></svg>',search:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"/></svg>',server:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="1" height="2"/><rect x="5" y="3" width="1" height="2"/><rect x="7" y="3" width="1" height="2"/><rect x="16" y="3" width="1" height="1"/><rect x="16" y="10" width="1" height="1"/><circle fill="none" stroke="#000" cx="9.9" cy="17.4" r="1.4"/><rect x="3" y="10" width="1" height="2"/><rect x="5" y="10" width="1" height="2"/><rect x="9.5" y="14" width="1" height="2"/><rect x="3" y="17" width="6" height="1"/><rect x="11" y="17" width="6" height="1"/><rect fill="none" stroke="#000" x="1.5" y="1.5" width="17" height="5"/><rect fill="none" stroke="#000" x="1.5" y="8.5" width="17" height="5"/></svg>',settings:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><ellipse fill="none" stroke="#000" cx="6.11" cy="3.55" rx="2.11" ry="2.15"/><ellipse fill="none" stroke="#000" cx="6.11" cy="15.55" rx="2.11" ry="2.15"/><circle fill="none" stroke="#000" cx="13.15" cy="9.55" r="2.15"/><rect x="1" y="3" width="3" height="1"/><rect x="10" y="3" width="8" height="1"/><rect x="1" y="9" width="8" height="1"/><rect x="15" y="9" width="3" height="1"/><rect x="1" y="15" width="3" height="1"/><rect x="10" y="15" width="8" height="1"/></svg>',shrink:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="11 4 12 4 12 8 16 8 16 9 11 9"/><polygon points="4 11 9 11 9 16 8 16 8 12 4 12"/><path fill="none" stroke="#000" stroke-width="1.1" d="M12,8 L18,2"/><path fill="none" stroke="#000" stroke-width="1.1" d="M2,18 L8,12"/></svg>',"sign-in":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="7 2 17 2 17 17 7 17 7 16 16 16 16 3 7 3"/><polygon points="9.1 13.4 8.5 12.8 11.28 10 4 10 4 9 11.28 9 8.5 6.2 9.1 5.62 13 9.5"/></svg>',"sign-out":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="13.1 13.4 12.5 12.8 15.28 10 8 10 8 9 15.28 9 12.5 6.2 13.1 5.62 17 9.5"/><polygon points="13 2 3 2 3 17 13 17 13 16 4 16 4 3 13 3"/></svg>',social:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.1" x1="13.4" y1="14" x2="6.3" y2="10.7"/><line fill="none" stroke="#000" stroke-width="1.1" x1="13.5" y1="5.5" x2="6.5" y2="8.8"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="15.5" cy="4.6" r="2.3"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="15.5" cy="14.8" r="2.3"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="4.5" cy="9.8" r="2.3"/></svg>',soundcloud:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.2,9.4c-0.4,0-0.8,0.1-1.101,0.2c-0.199-2.5-2.399-4.5-5-4.5c-0.6,0-1.2,0.1-1.7,0.3C9.2,5.5,9.1,5.6,9.1,5.6V15h8 c1.601,0,2.801-1.2,2.801-2.8C20,10.7,18.7,9.4,17.2,9.4L17.2,9.4z"/><rect x="6" y="6.5" width="1.5" height="8.5"/><rect x="3" y="8" width="1.5" height="7"/><rect y="10" width="1.5" height="5"/></svg>',star:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" stroke-width="1.01" points="10 2 12.63 7.27 18.5 8.12 14.25 12.22 15.25 18 10 15.27 4.75 18 5.75 12.22 1.5 8.12 7.37 7.27"/></svg>',strikethrough:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6,13.02 L6.65,13.02 C7.64,15.16 8.86,16.12 10.41,16.12 C12.22,16.12 12.92,14.93 12.92,13.89 C12.92,12.55 11.99,12.03 9.74,11.23 C8.05,10.64 6.23,10.11 6.23,7.83 C6.23,5.5 8.09,4.09 10.4,4.09 C11.44,4.09 12.13,4.31 12.72,4.54 L13.33,4 L13.81,4 L13.81,7.59 L13.16,7.59 C12.55,5.88 11.52,4.89 10.07,4.89 C8.84,4.89 7.89,5.69 7.89,7.03 C7.89,8.29 8.89,8.78 10.88,9.45 C12.57,10.03 14.38,10.6 14.38,12.91 C14.38,14.75 13.27,16.93 10.18,16.93 C9.18,16.93 8.17,16.69 7.46,16.39 L6.52,17 L6,17 L6,13.02 L6,13.02 Z"/><rect x="3" y="10" width="15" height="1"/></svg>',table:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="18" height="1"/><rect x="1" y="7" width="18" height="1"/><rect x="1" y="11" width="18" height="1"/><rect x="1" y="15" width="18" height="1"/></svg>',"tablet-landscape":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M1.5,5 C1.5,4.2 2.2,3.5 3,3.5 L17,3.5 C17.8,3.5 18.5,4.2 18.5,5 L18.5,16 C18.5,16.8 17.8,17.5 17,17.5 L3,17.5 C2.2,17.5 1.5,16.8 1.5,16 L1.5,5 L1.5,5 L1.5,5 Z"/><circle cx="3.7" cy="10.5" r=".8"/></svg>',tablet:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M5,18.5 C4.2,18.5 3.5,17.8 3.5,17 L3.5,3 C3.5,2.2 4.2,1.5 5,1.5 L16,1.5 C16.8,1.5 17.5,2.2 17.5,3 L17.5,17 C17.5,17.8 16.8,18.5 16,18.5 L5,18.5 L5,18.5 L5,18.5 Z"/><circle cx="10.5" cy="16.3" r=".8"/></svg>',tag:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="1.1" d="M17.5,3.71 L17.5,7.72 C17.5,7.96 17.4,8.2 17.21,8.39 L8.39,17.2 C7.99,17.6 7.33,17.6 6.93,17.2 L2.8,13.07 C2.4,12.67 2.4,12.01 2.8,11.61 L11.61,2.8 C11.81,2.6 12.08,2.5 12.34,2.5 L16.19,2.5 C16.52,2.5 16.86,2.63 17.11,2.88 C17.35,3.11 17.48,3.4 17.5,3.71 L17.5,3.71 Z"/><circle cx="14" cy="6" r="1"/></svg>',thumbnails:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" x="3.5" y="3.5" width="5" height="5"/><rect fill="none" stroke="#000" x="11.5" y="3.5" width="5" height="5"/><rect fill="none" stroke="#000" x="11.5" y="11.5" width="5" height="5"/><rect fill="none" stroke="#000" x="3.5" y="11.5" width="5" height="5"/></svg>',trash:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="6.5 3 6.5 1.5 13.5 1.5 13.5 3"/><polyline fill="none" stroke="#000" points="4.5 4 4.5 18.5 15.5 18.5 15.5 4"/><rect x="8" y="7" width="1" height="9"/><rect x="11" y="7" width="1" height="9"/><rect x="2" y="3" width="16" height="1"/></svg>',"triangle-down":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="5 7 15 7 10 12"/></svg>',"triangle-left":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="12 5 7 10 12 15"/></svg>',"triangle-right":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="8 5 13 10 8 15"/></svg>',"triangle-up":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="5 13 10 8 15 13"/></svg>',tripadvisor:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M19.021,7.866C19.256,6.862,20,5.854,20,5.854h-3.346C14.781,4.641,12.504,4,9.98,4C7.363,4,4.999,4.651,3.135,5.876H0\tc0,0,0.738,0.987,0.976,1.988c-0.611,0.837-0.973,1.852-0.973,2.964c0,2.763,2.249,5.009,5.011,5.009\tc1.576,0,2.976-0.737,3.901-1.879l1.063,1.599l1.075-1.615c0.475,0.611,1.1,1.111,1.838,1.451c1.213,0.547,2.574,0.612,3.825,0.15\tc2.589-0.963,3.913-3.852,2.964-6.439c-0.175-0.463-0.4-0.876-0.675-1.238H19.021z M16.38,14.594\tc-1.002,0.371-2.088,0.328-3.06-0.119c-0.688-0.317-1.252-0.817-1.657-1.438c-0.164-0.25-0.313-0.52-0.417-0.811\tc-0.124-0.328-0.186-0.668-0.217-1.014c-0.063-0.689,0.037-1.396,0.339-2.043c0.448-0.971,1.251-1.71,2.25-2.079\tc2.075-0.765,4.375,0.3,5.14,2.366c0.762,2.066-0.301,4.37-2.363,5.134L16.38,14.594L16.38,14.594z M8.322,13.066\tc-0.72,1.059-1.935,1.76-3.309,1.76c-2.207,0-4.001-1.797-4.001-3.996c0-2.203,1.795-4.002,4.001-4.002\tc2.204,0,3.999,1.8,3.999,4.002c0,0.137-0.024,0.261-0.04,0.396c-0.067,0.678-0.284,1.313-0.648,1.853v-0.013H8.322z M2.472,10.775\tc0,1.367,1.112,2.479,2.476,2.479c1.363,0,2.472-1.11,2.472-2.479c0-1.359-1.11-2.468-2.472-2.468\tC3.584,8.306,2.473,9.416,2.472,10.775L2.472,10.775z M12.514,10.775c0,1.367,1.104,2.479,2.471,2.479\tc1.363,0,2.474-1.108,2.474-2.479c0-1.359-1.11-2.468-2.474-2.468c-1.364,0-2.477,1.109-2.477,2.468H12.514z M3.324,10.775\tc0-0.893,0.726-1.618,1.614-1.618c0.889,0,1.625,0.727,1.625,1.618c0,0.898-0.725,1.627-1.625,1.627\tc-0.901,0-1.625-0.729-1.625-1.627H3.324z M13.354,10.775c0-0.893,0.726-1.618,1.627-1.618c0.886,0,1.61,0.727,1.61,1.618\tc0,0.898-0.726,1.627-1.626,1.627s-1.625-0.729-1.625-1.627H13.354z M9.977,4.875c1.798,0,3.425,0.324,4.849,0.968\tc-0.535,0.015-1.061,0.108-1.586,0.3c-1.264,0.463-2.264,1.388-2.815,2.604c-0.262,0.551-0.398,1.133-0.448,1.72\tC9.79,7.905,7.677,5.873,5.076,5.82C6.501,5.208,8.153,4.875,9.94,4.875H9.977z"/></svg>',tumblr:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.885,8.598c0,0,0,3.393,0,4.996c0,0.282,0,0.66,0.094,0.942c0.377,1.509,1.131,2.545,2.545,3.11 c1.319,0.472,2.356,0.472,3.676,0c0.565-0.188,1.132-0.659,1.132-0.659l-0.849-2.263c0,0-1.036,0.378-1.603,0.283 c-0.565-0.094-1.226-0.66-1.226-1.508c0-1.603,0-4.902,0-4.902h2.828V5.771h-2.828V2H8.205c0,0-0.094,0.66-0.188,0.942 C7.828,3.791,7.262,4.733,6.603,5.394C5.848,6.147,5,6.43,5,6.43v2.168H6.885z"/></svg>',tv:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="16" width="6" height="1"/><rect fill="none" stroke="#000" x=".5" y="3.5" width="19" height="11"/></svg>',twitter:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M19,4.74 C18.339,5.029 17.626,5.229 16.881,5.32 C17.644,4.86 18.227,4.139 18.503,3.28 C17.79,3.7 17.001,4.009 16.159,4.17 C15.485,3.45 14.526,3 13.464,3 C11.423,3 9.771,4.66 9.771,6.7 C9.771,6.99 9.804,7.269 9.868,7.539 C6.795,7.38 4.076,5.919 2.254,3.679 C1.936,4.219 1.754,4.86 1.754,5.539 C1.754,6.82 2.405,7.95 3.397,8.61 C2.79,8.589 2.22,8.429 1.723,8.149 L1.723,8.189 C1.723,9.978 2.997,11.478 4.686,11.82 C4.376,11.899 4.049,11.939 3.713,11.939 C3.475,11.939 3.245,11.919 3.018,11.88 C3.49,13.349 4.852,14.419 6.469,14.449 C5.205,15.429 3.612,16.019 1.882,16.019 C1.583,16.019 1.29,16.009 1,15.969 C2.635,17.019 4.576,17.629 6.662,17.629 C13.454,17.629 17.17,12 17.17,7.129 C17.17,6.969 17.166,6.809 17.157,6.649 C17.879,6.129 18.504,5.478 19,4.74"/></svg>',uikit:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon points="14.4,3.1 11.3,5.1 15,7.3 15,12.9 10,15.7 5,12.9 5,8.5 2,6.8 2,14.8 9.9,19.5 18,14.8 18,5.3"/><polygon points="9.8,4.2 6.7,2.4 9.8,0.4 12.9,2.3"/></svg>',unlock:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect fill="none" stroke="#000" x="3.5" y="8.5" width="13" height="10"/><path fill="none" stroke="#000" d="M6.5,8.5 L6.5,4.9 C6.5,3 8.1,1.5 10,1.5 C11.9,1.5 13.5,3 13.5,4.9"/></svg>',upload:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" points="5 8 9.5 3.5 14 8"/><rect x="3" y="17" width="13" height="1"/><line fill="none" stroke="#000" x1="9.5" y1="15" x2="9.5" y2="4"/></svg>',user:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9.9" cy="6.4" r="4.4"/><path fill="none" stroke="#000" stroke-width="1.1" d="M1.5,19 C2.3,14.5 5.8,11.2 10,11.2 C14.2,11.2 17.7,14.6 18.5,19.2"/></svg>',users:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="7.7" cy="8.6" r="3.5"/><path fill="none" stroke="#000" stroke-width="1.1" d="M1,18.1 C1.7,14.6 4.4,12.1 7.6,12.1 C10.9,12.1 13.7,14.8 14.3,18.3"/><path fill="none" stroke="#000" stroke-width="1.1" d="M11.4,4 C12.8,2.4 15.4,2.8 16.3,4.7 C17.2,6.6 15.7,8.9 13.6,8.9 C16.5,8.9 18.8,11.3 19.2,14.1"/></svg>',"video-camera":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><polygon fill="none" stroke="#000" points="17.5 6.9 17.5 13.1 13.5 10.4 13.5 14.5 2.5 14.5 2.5 5.5 13.5 5.5 13.5 9.6 17.5 6.9"/></svg>',vimeo:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.065,7.59C1.84,7.367,1.654,7.082,1.468,6.838c-0.332-0.42-0.137-0.411,0.274-0.772c1.026-0.91,2.004-1.896,3.127-2.688 c1.017-0.713,2.365-1.173,3.286-0.039c0.849,1.045,0.869,2.629,1.084,3.891c0.215,1.309,0.421,2.648,0.88,3.901 c0.127,0.352,0.37,1.018,0.81,1.074c0.567,0.078,1.145-0.917,1.408-1.289c0.684-0.987,1.611-2.317,1.494-3.587 c-0.115-1.349-1.572-1.095-2.482-0.773c0.146-1.514,1.555-3.216,2.912-3.792c1.439-0.597,3.579-0.587,4.302,1.036 c0.772,1.759,0.078,3.802-0.763,5.396c-0.918,1.731-2.1,3.333-3.363,4.829c-1.114,1.329-2.432,2.787-4.093,3.422 c-1.897,0.723-3.021-0.686-3.667-2.318c-0.705-1.777-1.056-3.771-1.565-5.621C4.898,8.726,4.644,7.836,4.136,7.191 C3.473,6.358,2.72,7.141,2.065,7.59C1.977,7.502,2.115,7.551,2.065,7.59L2.065,7.59z"/></svg>',warning:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="14" r="1"/><circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9"/><path d="M10.97,7.72 C10.85,9.54 10.56,11.29 10.56,11.29 C10.51,11.87 10.27,12 9.99,12 C9.69,12 9.49,11.87 9.43,11.29 C9.43,11.29 9.16,9.54 9.03,7.72 C8.96,6.54 9.03,6 9.03,6 C9.03,5.45 9.46,5.02 9.99,5 C10.53,5.01 10.97,5.44 10.97,6 C10.97,6 11.04,6.54 10.97,7.72 L10.97,7.72 Z"/></svg>',whatsapp:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M16.7,3.3c-1.8-1.8-4.1-2.8-6.7-2.8c-5.2,0-9.4,4.2-9.4,9.4c0,1.7,0.4,3.3,1.3,4.7l-1.3,4.9l5-1.3c1.4,0.8,2.9,1.2,4.5,1.2 l0,0l0,0c5.2,0,9.4-4.2,9.4-9.4C19.5,7.4,18.5,5,16.7,3.3 M10.1,17.7L10.1,17.7c-1.4,0-2.8-0.4-4-1.1l-0.3-0.2l-3,0.8l0.8-2.9 l-0.2-0.3c-0.8-1.2-1.2-2.7-1.2-4.2c0-4.3,3.5-7.8,7.8-7.8c2.1,0,4.1,0.8,5.5,2.3c1.5,1.5,2.3,3.4,2.3,5.5 C17.9,14.2,14.4,17.7,10.1,17.7 M14.4,11.9c-0.2-0.1-1.4-0.7-1.6-0.8c-0.2-0.1-0.4-0.1-0.5,0.1c-0.2,0.2-0.6,0.8-0.8,0.9 c-0.1,0.2-0.3,0.2-0.5,0.1c-0.2-0.1-1-0.4-1.9-1.2c-0.7-0.6-1.2-1.4-1.3-1.6c-0.1-0.2,0-0.4,0.1-0.5C8,8.8,8.1,8.7,8.2,8.5 c0.1-0.1,0.2-0.2,0.2-0.4c0.1-0.2,0-0.3,0-0.4C8.4,7.6,7.9,6.5,7.7,6C7.5,5.5,7.3,5.6,7.2,5.6c-0.1,0-0.3,0-0.4,0 c-0.2,0-0.4,0.1-0.6,0.3c-0.2,0.2-0.8,0.8-0.8,2c0,1.2,0.8,2.3,1,2.4c0.1,0.2,1.7,2.5,4,3.5c0.6,0.2,1,0.4,1.3,0.5 c0.6,0.2,1.1,0.2,1.5,0.1c0.5-0.1,1.4-0.6,1.6-1.1c0.2-0.5,0.2-1,0.1-1.1C14.8,12.1,14.6,12,14.4,11.9"/></svg>',wordpress:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10,0.5c-5.2,0-9.5,4.3-9.5,9.5s4.3,9.5,9.5,9.5c5.2,0,9.5-4.3,9.5-9.5S15.2,0.5,10,0.5L10,0.5L10,0.5z M15.6,3.9h-0.1 c-0.8,0-1.4,0.7-1.4,1.5c0,0.7,0.4,1.3,0.8,1.9c0.3,0.6,0.7,1.3,0.7,2.3c0,0.7-0.3,1.5-0.6,2.7L14.1,15l-3-8.9 c0.5,0,0.9-0.1,0.9-0.1C12.5,6,12.5,5.3,12,5.4c0,0-1.3,0.1-2.2,0.1C9,5.5,7.7,5.4,7.7,5.4C7.2,5.3,7.2,6,7.6,6c0,0,0.4,0.1,0.9,0.1 l1.3,3.5L8,15L5,6.1C5.5,6.1,5.9,6,5.9,6C6.4,6,6.3,5.3,5.9,5.4c0,0-1.3,0.1-2.2,0.1c-0.2,0-0.3,0-0.5,0c1.5-2.2,4-3.7,6.9-3.7 C12.2,1.7,14.1,2.6,15.6,3.9L15.6,3.9L15.6,3.9z M2.5,6.6l3.9,10.8c-2.7-1.3-4.6-4.2-4.6-7.4C1.8,8.8,2,7.6,2.5,6.6L2.5,6.6L2.5,6.6 z M10.2,10.7l2.5,6.9c0,0,0,0.1,0.1,0.1C11.9,18,11,18.2,10,18.2c-0.8,0-1.6-0.1-2.3-0.3L10.2,10.7L10.2,10.7L10.2,10.7z M14.2,17.1 l2.5-7.3c0.5-1.2,0.6-2.1,0.6-2.9c0-0.3,0-0.6-0.1-0.8c0.6,1.2,1,2.5,1,4C18.3,13,16.6,15.7,14.2,17.1L14.2,17.1L14.2,17.1z"/></svg>',world:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" d="M1,10.5 L19,10.5"/><path fill="none" stroke="#000" d="M2.35,15.5 L17.65,15.5"/><path fill="none" stroke="#000" d="M2.35,5.5 L17.523,5.5"/><path fill="none" stroke="#000" d="M10,19.46 L9.98,19.46 C7.31,17.33 5.61,14.141 5.61,10.58 C5.61,7.02 7.33,3.83 10,1.7 C10.01,1.7 9.99,1.7 10,1.7 L10,1.7 C12.67,3.83 14.4,7.02 14.4,10.58 C14.4,14.141 12.67,17.33 10,19.46 L10,19.46 L10,19.46 L10,19.46 Z"/><circle fill="none" stroke="#000" cx="10" cy="10.5" r="9"/></svg>',xing:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4.4,4.56 C4.24,4.56 4.11,4.61 4.05,4.72 C3.98,4.83 3.99,4.97 4.07,5.12 L5.82,8.16 L5.82,8.17 L3.06,13.04 C2.99,13.18 2.99,13.33 3.06,13.44 C3.12,13.55 3.24,13.62 3.4,13.62 L6,13.62 C6.39,13.62 6.57,13.36 6.71,13.12 C6.71,13.12 9.41,8.35 9.51,8.16 C9.49,8.14 7.72,5.04 7.72,5.04 C7.58,4.81 7.39,4.56 6.99,4.56 L4.4,4.56 L4.4,4.56 Z"/><path d="M15.3,1 C14.91,1 14.74,1.25 14.6,1.5 C14.6,1.5 9.01,11.42 8.82,11.74 C8.83,11.76 12.51,18.51 12.51,18.51 C12.64,18.74 12.84,19 13.23,19 L15.82,19 C15.98,19 16.1,18.94 16.16,18.83 C16.23,18.72 16.23,18.57 16.16,18.43 L12.5,11.74 L12.5,11.72 L18.25,1.56 C18.32,1.42 18.32,1.27 18.25,1.16 C18.21,1.06 18.08,1 17.93,1 L15.3,1 L15.3,1 Z"/></svg>',yelp:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M17.175,14.971c-0.112,0.77-1.686,2.767-2.406,3.054c-0.246,0.1-0.487,0.076-0.675-0.069\tc-0.122-0.096-2.446-3.859-2.446-3.859c-0.194-0.293-0.157-0.682,0.083-0.978c0.234-0.284,0.581-0.393,0.881-0.276\tc0.016,0.01,4.21,1.394,4.332,1.482c0.178,0.148,0.263,0.379,0.225,0.646L17.175,14.971L17.175,14.971z M11.464,10.789\tc-0.203-0.307-0.199-0.666,0.009-0.916c0,0,2.625-3.574,2.745-3.657c0.203-0.135,0.452-0.141,0.69-0.025\tc0.691,0.335,2.085,2.405,2.167,3.199v0.027c0.024,0.271-0.082,0.491-0.273,0.623c-0.132,0.083-4.43,1.155-4.43,1.155\tc-0.322,0.096-0.68-0.06-0.882-0.381L11.464,10.789z M9.475,9.563C9.32,9.609,8.848,9.757,8.269,8.817c0,0-3.916-6.16-4.007-6.351\tc-0.057-0.212,0.011-0.455,0.202-0.65C5.047,1.211,8.21,0.327,9.037,0.529c0.27,0.069,0.457,0.238,0.522,0.479\tc0.047,0.266,0.433,5.982,0.488,7.264C10.098,9.368,9.629,9.517,9.475,9.563z M9.927,19.066c-0.083,0.225-0.273,0.373-0.54,0.421\tc-0.762,0.13-3.15-0.751-3.647-1.342c-0.096-0.131-0.155-0.262-0.167-0.394c-0.011-0.095,0-0.189,0.036-0.272\tc0.061-0.155,2.917-3.538,2.917-3.538c0.214-0.272,0.595-0.355,0.952-0.213c0.345,0.13,0.56,0.428,0.536,0.749\tC10.014,14.479,9.977,18.923,9.927,19.066z M3.495,13.912c-0.235-0.009-0.444-0.148-0.568-0.382c-0.089-0.17-0.151-0.453-0.19-0.794\tC2.63,11.701,2.761,10.144,3.07,9.648c0.145-0.226,0.357-0.345,0.592-0.336c0.154,0,4.255,1.667,4.255,1.667\tc0.321,0.118,0.521,0.453,0.5,0.833c-0.023,0.37-0.236,0.655-0.551,0.738L3.495,13.912z"/></svg>',youtube:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15,4.1c1,0.1,2.3,0,3,0.8c0.8,0.8,0.9,2.1,0.9,3.1C19,9.2,19,10.9,19,12c-0.1,1.1,0,2.4-0.5,3.4c-0.5,1.1-1.4,1.5-2.5,1.6 c-1.2,0.1-8.6,0.1-11,0c-1.1-0.1-2.4-0.1-3.2-1c-0.7-0.8-0.7-2-0.8-3C1,11.8,1,10.1,1,8.9c0-1.1,0-2.4,0.5-3.4C2,4.5,3,4.3,4.1,4.2 C5.3,4.1,12.6,4,15,4.1z M8,7.5v6l5.5-3L8,7.5z"/></svg>'})}return"undefined"!=typeof window&&window.UIkit&&window.UIkit.use(i),i});
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}(';(1L($){"cE ej";$.ei.eh=1L(a){1g b=$(B);8z(1g c 5M a)1E(a.ef(c)&&a[c]==3D)a[c]=8t;a=$.ed({ec:"ar",9t:"as",2F:3D,2U:3D,6I:"#au",7O:3D,cm:"e7",9y:"#e5",9u:0.25,ax:"#au",9K:1,cg:9R,9S:9w,cc:"aD",9T:9w,c9:"aD",9x:w,7K:z,9f:9w,9X:"c4",aI:3D,9k:3D,aN:3D,9r:1L(){},aO:1L(){}},a);1g d;d=aP u(a);b.dI(d.3w);d.8V();d.bW();3X b};1E(!(\'8X\'5M 7Q.2V)){7Q.2V.8X=1L(a,i){1E(i===8t)i=0;1E(i<0)i+=B.7f;1E(i<0)i=0;8z(1g n=B.7f;i<n;i++)1E(i 5M B&&B[i]===a)3X i;3X-1}}1E(!(\'7r\'5M 7Q.2V)){7Q.2V.7r=1L(a,b){8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B)a.aR(b,B[i],i,B)}}1E(!(\'bQ\'5M 7Q.2V)){7Q.2V.bQ=1L(a,b){1g c=aP 7Q(B.7f);8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B)c[i]=a.aR(b,B[i],i,B);3X c}}1E(!(\'a0\'5M 7Q.2V)){7Q.2V.a0=1L(a,b){1g c=[],v;8z(1g i=0,n=B.7f;i<n;i++)1E(i 5M B&&a.aR(b,v=B[i],i,B))c.dx(v);3X c}}1g j=(1L(){3X{8l:9D 9F.dt!=="8t",8f:bK.bJ.dq,8e:bK.bJ.do}})();1g k=(1L(){1g a=3D;dm{a=!!aP dl("dk")}dg(e){a=9w}3X a})();1g l=j.8f?\'da\':j.8e?\'d9\':j.8l?\'d7\':\'bA\';1g m=j.8f?\'d2\':j.8e?\'d1\':j.8l?\'d0\':\'bw\';1g o=j.8f?\'cX\':j.8e?\'cV\':j.8l?\'cT\':\'cS\';1g q=j.8f?\'cR\':j.8e?\'cQ\':j.8l?\'cP\':\'cO\';1g r=j.8f?\'cL\':j.8e?\'cJ\':j.8l?\'cI\':\'cH\';1g t=1L(a){B.J=a;B.3Y={2F:cB,2U:bo};B.7E={bg:0,bi:-5y,2F:7u,2U:8P};B.eg={x:0,y:6Y,w:9b,h:56};B.bm();B.bf()};t.2V.bf=1L(){B.ab(3D,3D)};t.2V.ab=1L(a,b){B.6D={1b:a?a.1b:3D,C:a?B.bd(a):3D,e3:a?a.C:3D,e2:a?B.bc(a):3D,e0:a?B.ac(a):3D,8N:b?b:3D}};t.2V.dX=1L(){3X B.6D&&B.6D.1b&&B.6D.1b!==3D};t.2V.bm=1L(){B.8r={};1E(B.J.9f){B.3Y.2F=B.3Y.2F-B.7E.2F;B.3Y.2U=B.3Y.2U-B.7E.2U}1E(!B.J.2F&&!B.J.2U){B.J.2F=B.3Y.2F;B.J.2U=B.3Y.2U}6r 1E(B.J.2F&&!B.J.2U){B.J.2U=B.3Y.2U*B.J.2F/B.3Y.2F}6r 1E(!B.J.2F&&B.J.2U){B.J.2F=B.3Y.2F*B.J.2U/B.3Y.2U}1E(B.J.2U/B.J.2F>B.3Y.2U/B.3Y.2F){B.8r.2F=B.J.2F;B.8r.2U=B.J.2F*B.3Y.2U/B.3Y.2F}6r{B.8r.2F=B.J.2U*B.3Y.2F/B.3Y.2U;B.8r.2U=B.J.2U}};t.2V.bW=1L(){1g b=B;1g c=$(B.3w);1E(j.8f&&!k||j.8e&&!k||j.8l){1E(j.8f||j.8e){c.bv("-dV-bx-cw","by").bv("bx-cw","by")}c.8M(l,1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V();1E(b.b0()){e.bG();e.bH()}c.8M(m,1L(e){a=e.7t.7q?e.7t.7q[0]:e;1E(b.b0()){b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V();e.bG();e.bH()}});$(9F).8M(o,1L(e){a=e.7t.7q?e.7t.7q[0]:e;1E(b.6D.1b!==3D&&b.6D.C!=3D&&"9r"5M b.J){bI(1L(){b.J.9r(b.6D)},0)}b.7o=3D;c.bL(m);$(9F).bL(o)})})}6r{c.8M("bw",1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;b.7o={x:a.b4-c[0].b3,y:a.b2-c[0].b1};b.8V()});c.8M("bA",1L(e){1g a=e.7t.7q?e.7t.7q[0]:e;1E(b.6D.1b!==3D&&b.6D.C!=3D&&"9r"5M b.J){bI(1L(){b.J.9r(b.6D)},0)}b.7o=3D});c.8M("dE",1L(e){b.7o=3D;b.8V()})}};t.2V.aW=1L(a){1g b=B.J.7K.a0(1L(p){3X p.1b==a});3X(b.7f>0)?b[0]:3D};t.2V.aV=1L(b){1g c=B.J.9x.a0(1L(a){3X a.7K.8X(b)>-1});3X(c.7f>0)?c[0]:3D};t.2V.9J=1L(a){1g b=["屋久島","種子島","奄美諸島","沖縄本島","多良間島","宮古島","伊是名島","伊平屋島","八重山諸島"];3X"C"5M a&&b.8X(a.C)>-1};t.2V.af=1L(a,b){a=du(a).aS(/[^0-9a-f]/dp,\'\');1E(a.7f<6){a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]}b=b||0;1g d="#",c,i;8z(i=0;i<3;i++){c=bZ(a.c2(i*2,2),16);c=aL.dd(aL.dc(aL.db(0,bZ(c+(c*b))),2x)).d6(16);d+=("d4"+c).c2(c.7f)}3X d};t.2V.bd=1L(a){c3(B.9i(a)?B.J.c9:B.J.cc){4X"cY":3X B.bc(a);4X"ah":3X B.ac(a);4X"cU":3X B.ac(a);4X"aD":3X a.C;4X"cN":3X a.C;c7:3X a.C}};t.2V.bc=1L(a){1E(B.9i(a)){3X a.C.aS(/地方$/,"")}3X a.C.aS(/[都|府|県]$/,"")};t.2V.ac=1L(a){1E(B.9i(a)){3X a.ah?a.ah:3D}3X A[a.1b]};t.2V.9i=1L(a){3X B.J.9x.8X(a)>-1};1g u=1L(){1g a=!!9F.c8(\'ar\').7W;1E(!a){aC"cD cC cA cz cy cx.";}B.3w=9F.c8("ar");t.cd(B,ek);B.3w.2F=B.8r.2F;B.3w.2U=B.8r.2U};u.2V=ee.eb(t.2V);u.2V.ea=t;u.2V.8V=1L(){1g a=B.3w.7W("2d");a.e8(0,0,B.3w.2F,B.3w.2U);B.aj=9w;B.9l=3D;1g b=B.J.9t=="8N"?B.ci:B.ck;b.cd(B);1E(!B.aj)B.bf();B.3w.9s.e4=B.J.cm;1E(B.J.cg){B.3w.9s.e1=B.J.9K+"co";B.3w.9s.dY=B.J.ax;B.3w.9s.dW="dU"}B.cs();B.cv()};u.2V.ck=1L(){1g c=B.3w.7W("2d");B.J.7K.7r(1L(a){c.ap();B.ao(a);c.bp();1g b=B.aV(a.1b);1E(b){B.an(a,b)}6r{aC"cq 8N dM dL as 1b \'"+1b+"\'.";}c.ce();1E(B.J.9y&&B.J.9u>0)c.az()},B)};u.2V.ci=1L(){1g d=B.3w.7W("2d");B.J.9x.7r(1L(c){d.ap();c.7K.7r(1L(a){1g b=B.aW(a);1E(b){B.ao(b)}6r{aC"cq as 1b \'"+a+"\' dH dG.";}},B);d.bp();B.an(c,c);d.ce();1E(B.J.9y&&B.J.9u>0)d.az()},B)};u.2V.ao=1L(b){b.1Z.7r(1L(p){1g a={X:0,Y:0};1E(B.J.9f){a={X:a.X+(B.9J(p)?B.7E.bg:-B.7E.2F),Y:a.Y+(B.9J(p)?B.7E.bi:0)}}1E("D"5M p)B.aG(p.D,a);1E("8u"5M p){p.8u.7r(1L(s){1E("D"5M s)B.aG(s.D,a)},B)}},B)};u.2V.cv=1L(){1E(!B.J.9S&&!B.J.9T)3X;1g f=B.J.9T&&(!B.J.9S||B.J.9t=="8N");1E(f){B.J.9x.7r(1L(d){1g e={x:0,y:0,n:0};d.7K.7r(1L(a){1g b=B.aW(a);1g c=B.b9(b);e.n++;e.x=(e.x*(e.n-1)+c.x)/e.n;e.y=(e.y*(e.n-1)+c.y)/e.n},B);B.ba(d,e)},B)}6r{B.J.7K.7r(1L(a){1g b=B.b9(a);B.ba(a,b)},B)}};u.2V.ba=1L(a,b){1g c=B.3w.7W("2d");1g d=B.9i(a)?a:B.aV(a.1b);1g e=B.J.9T&&(!B.J.9S||B.J.9t=="8N");c.dy();1E(B.J.9k&&B.J.9k=="dw"){1g f;1E(e==(B.J.9t=="8N")){f=B.9l==a.1b}6r 1E(e){f=d.7K.8X(B.9l)>-1}6r{f=B.9l==d.1b}1g g=d.6I?d.6I:B.J.6I;1g h=d.6I&&d.7O?d.7O:d.6I?B.af(d.6I,0.2):B.J.7O?B.J.7O:B.af(B.J.6I,0.2);c.8c=f?h:g}6r 1E(B.J.9k){c.8c=B.J.9k}6r{c.8c=B.J.6I}c.9X=(B.J.aI?B.J.aI:B.3w.2F/7u)+"co \'"+(B.J.9X?B.J.9X:"c4")+"\'";c.di=\'f9\';c.df=\'de\';1E(B.J.aN){c.d8=B.J.aN;c.d5=5}8z(1g i=0;i<5;i++)c.d3(B.bd(a),b.x*B.3w.2F/B.3Y.2F,b.y*B.3w.2U/B.3Y.2U);c.cZ()};u.2V.b9=1L(a){1g b={x:0,y:0,n:0};1g c={X:0,Y:0};c3(a.C){4X"北海道":c.X=10;c.Y=-5;5J;4X"宮城県":c.Y=5;5J;4X"山形県":c.Y=-5;5J;4X"埼玉県":c.Y=-3;5J;4X"神奈川県":c.Y=2;5J;4X"千葉県":c.X=7;5J;4X"石川県":c.Y=-5;5J;4X"滋賀県":c.Y=5;5J;4X"京都府":c.Y=-2;5J;4X"兵庫県":c.Y=4;5J;4X"三重県":c.Y=-5;5J;4X"広島県":c.Y=-3;5J;4X"島根県":c.X=-5;5J;4X"高知県":c.X=5;5J;4X"福岡県":c.Y=-5;5J;4X"長崎県":c.Y=5;5J}1g d=a.1Z[0];1E(B.J.9f){c={X:c.X+(B.9J(d)?B.7E.bg:-B.7E.2F),Y:c.Y+(B.9J(d)?B.7E.bi:0)}}1E("D"5M d){1g i=0;bs(9R){1g x=d.D[i*2+0];1g y=d.D[i*2+1];1E(9D x==="8t"||9D y==="8t")5J;x=x+c.X;y=y+c.Y;b.n++;b.x=(b.x*(b.n-1)+x)/b.n;b.y=(b.y*(b.n-1)+y)/b.n;i++}}3X b};u.2V.aG=1L(a,b){1g c=B.3w.7W("2d");1g i=0;bs(9R){1g x=a[i*2+0];1g y=a[i*2+1];1E(9D x==="8t"||9D y==="8t")5J;x=x+b.X;y=y+b.Y;1E(i==0){c.bt(x*B.3w.2F/B.3Y.2F,y*B.3w.2U/B.3Y.2U)}6r{c.bb(x*B.3w.2F/B.3Y.2F,y*B.3w.2U/B.3Y.2U)}i++}};u.2V.cs=1L(){1g a=B.3w.7W("2d");1E(B.J.9f){a.ap();a.bt(0,8j*B.3w.2U/B.3Y.2U);a.bb(6c*B.3w.2F/B.3Y.2F,8j*B.3w.2U/B.3Y.2U);a.bb(4g*B.3w.2F/B.3Y.2F,0);a.cu=B.J.ax;a.9K=B.J.9K;a.az()}};u.2V.an=1L(a,b){1g c=B.3w.7W("2d");c.8c=("6I"5M b)?b.6I:B.J.6I;1E(B.J.9y)c.cu=B.J.9y;1E(B.J.9u)c.9K=B.J.9u;1g d=B.7o&&c.dA(B.7o.x,B.7o.y);1E(d){B.aj=9R;B.9l=a.1b;1E(B.6D.1b!=a.1b&&B.J.aO){B.ab(a,b);B.J.aO(B.6D)}6r{B.ab(a,b)}1E(b.7O)c.8c=b.7O;6r 1E(B.J.7O)c.8c=B.J.7O;6r c.8c=B.af(c.8c,0.2)}B.3w.9s.dz=(B.6D.1b==3D)?"c7":"7o"};u.2V.b0=1L(){3X B.aj};1g w=[{"1b":0,"C":"日本","ah":"dv","6I":"#au","7K":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47]}];1g z=[{"1b":1,"C":"北海道","1Z":[{"D":[1Y,92,1Y,93,1Y,95,1Y,97,2N,99,1T,7u,2N,aw,1Y,7S,2B,7S,2B,9O,2S,8y,3I,9v,3T,9M,4w,ct,4w,cr,4w,cp,3T,7J,3T,7J,3I,7J,3E,8D,3E,cn,3E,av,3E,9A,3I,8g,3T,8g,5x,8g,3G,8g,3b,9A,4k,9A,3r,cn,3r,ch,4O,ch,6e,8D,3O,8D,2Z,7J,2Z,aB,3p,7J,4d,7J,4d,9B,4d,9B,3p,9B,3y,9B,2v,9B,3z,8D,3d,8D,5N,8D,6j,7J,4F,7J,4t,7J,4t,aB,4F,aB,4F,dB,5N,cp,3z,cr,2v,ct,2v,aE,3y,9M,3y,9v,3p,9v,3p,8y,2Z,8y,3O,8y,3r,7S,3b,7T,2o,aw,2o,7u,3b,96,4k,95,6e,93,2Z,93,4d,93,3p,94,3y,95,3y,95,1k,96,2v,97,3z,99,3z,99,3z,99,3z,99,3z,7u,3z,7u,3d,7u,3d,7u,5N,99,6j,97,4F,96,5v,96,5v,95,6d,92,7v,92,7a,93,5w,95,9d,97,9e,99,9V,7u,9Y,7u,c0,7T,bX,7T,cG,7S,bV,9O,bU,9O,em,8y,8J,9M,9Z,aE,9Z,aE,bj,9v,9z,8y,9z,7T,9z,aw,bj,98,e9,95,7g,91,7X,89,a1,81,aY,80,8o,80,aZ,78,bo,78,dr,79,dC,79,dD,79,bF,79,a2,79,bD,79,a2,79,a2,78,7N,76,7N,76,bC,76,bC,76,7N,76,7N,76,7N,77,7N,77,7N,78,bB,78,bB,78,7G,78,7G,77,8Q,77,8Q,76,7D,76,7D,75,8m,75,7D,75,7D,74,8m,73,8m,73,9H,73,bz,72,b8,72,8d,71,8d,72,8d,72,8Z,71,8Z,70,8Z,70,be,69,be,68,9j,68,8T,67,8T,67,9p,66,8S,66,9p,65,bz,67,9H,65,8m,61,7D,60,8Q,59,8Q,59,7G,58,7G,57,7G,55,7G,54,7G,53,7G,52,7D,50,7D,48,8m,46,9H,44,9H,43,9H,42,8m,41,8m,41,7D,42,7D,43,8Q,43,8Q,44,7G,46,7N,48,7N,49,bD,50,a2,51,bF,52,dj,53,aZ,53,bk,52,bk,51,8o,50,8o,49,aY,49,aY,50,a1,51,a1,51,a1,50,ds,49,8v,48,8v,48,8v,48,8v,49,8v,50,a9,49,8x,49,7X,49,7X,49,7g,47,7X,47,7X,47,dK,43,8J,43,dO,42,bU,41,bV,39,dP,39,dT,37,bX,35,c0,35,e6,32,9Y,31,9V,30,9V,30,9e,29,9e,28,bh,27,aa,25,6L,22,6C,18,6K,16,7L,16,7v,15,4L,14,5R,15,5R,16,3R,17,3R,17,5E,16,6d,16,6d,17,6d,19,6d,20,6Y,21,6d,25,3J,34,3J,39,3J,41,3J,43,3R,44,3R,44,3R,45,5E,46,5E,46,5E,50,3R,52,3R,54,5E,55,5E,55,5E,56,6d,58,6Y,58,7e,59,5m,60,5m,61,5v,62,5m,63,5m,64,5m,64,5m,65,5m,66,5m,67,ad,69,7e,71,5m,75,4t,77,6j,77,5N,77,5N,76,3d,75,3d,75,2v,75,1k,76,3y,76,3p,76,2Z,74,2Z,74,3O,73,6e,73,3r,71,3r,72,3r,72,4k,72,3b,73,3b,74,2o,75,3b,77,4k,77,3r,79,3r,79,4O,81,3r,82,3b,84,2o,85,2o,87,3G,87,5x,86,4w,87,4w,88,3T,89,3I,89,3E,90,2B,90,1Y,91,1Y,91,1Y,92,1Y,92]},{"C":"礼文島","D":[3d,19,3z,20,3z,20,3z,20,3z,19,2v,18,2v,16,3z,15,3d,19,3d,19]},{"C":"利尻島","D":[6j,21,4F,21,4t,22,5v,23,4t,25,6j,24,5N,23,6j,21,6j,21]},{"C":"奥尻島","D":[4M,7T,4M,7S,2W,9O,2W,9v,3N,9M,2T,8y,2T,7S,3N,7S,3N,7S,2W,7T,4M,7T,4M,7T]},{"C":"北方領土","8u":[{"C":"択捉島","D":[b6,2,bE,1,9I,1,dn,2,9I,3,9I,3,9I,4,9I,6,bE,7,bM,8,aU,9,aU,9,aU,9,bN,11,bO,12,bP,13,bP,13,dF,16,bR,18,aQ,19,ag,19,ag,19,c1,19,aK,18,aJ,19,aK,20,aJ,22,dZ,23,c6,25,cb,28,ai,30,ak,31,9m,31,9n,33,8I,34,7F,35,8G,34,8G,33,7F,32,7F,31,8G,30,7F,29,7F,30,8I,31,8I,30,8I,29,9n,29,9m,29,9m,28,ak,27,ak,26,9m,26,9n,26,9n,25,9m,24,ak,25,ai,24,ai,23,ai,23,cb,22,cF,20,c6,19,cl,18,cl,16,aJ,16,aK,15,c1,13,ag,12,aQ,10,ag,9,aQ,7,cM,7,cW,9,bR,10,bO,9,bN,8,at,6,at,6,at,6,bM,3,b6,2,b6,2]},{"C":"歯舞島","D":[al,61,8F,63,aA,62,aA,61,8F,60,al,61,al,61]},{"C":"色丹島","D":[7F,50,8I,50,9n,51,7F,52,8G,52,8I,53,8G,53,bY,55,bu,55,br,54,br,53,bu,52,bY,51,8G,50,7F,50,7F,50]},{"C":"国後島","D":[8F,36,bl,37,bS,35,bS,38,dJ,38,bl,38,bn,38,bn,39,al,40,8F,41,dN,41,am,42,a8,43,a8,44,dQ,45,8S,45,8S,45,8S,46,9p,47,8S,48,9p,48,9p,48,8T,50,9j,51,8Z,52,8Z,53,8d,55,8d,59,8d,58,8d,57,dS,57,bq,57,b8,56,b8,54,bq,52,8d,50,be,48,9j,48,9j,46,9j,45,8T,44,8T,43,8T,43,8S,41,a8,37,a8,36,am,35,am,35,aA,35,8F,36,8F,36]}]}]},{"1b":2,"C":"青森県","1Z":[{"D":[7e,a7,6Y,8g,6d,8g,6d,a7,6Y,a6,6Y,8A,5E,7z,3R,7y,3J,7y,5R,8E,4L,6c,4L,3v,4L,3v,4L,3v,3J,3F,3R,4Y,5E,4Y,6d,4Y,7e,6v,7e,6v,ad,6v,5v,9c,4F,8C,5N,7w,3d,7w,3d,9c,3d,6v,3d,3F,3d,3F,3z,3F,2v,6c,1k,6c,1k,3v,3y,3v,3p,3F,4d,3F,2Z,3F,3O,3F,3r,3v,3r,6c,3b,6c,3b,3v,3b,3v,4w,3F,3T,3v,3I,3v,3E,3v,3E,3F,3E,3F,2S,6c,2S,7y,2B,7z,2B,7y,1Y,7z,2B,a4,2S,a3,2S,b7,3I,8A,3T,8A,4w,b5,5x,8A,3G,8A,2o,8H,2o,aX,3b,7V,3b,7V,3b,aX,4k,7V,4k,7V,3r,7V,3b,7V,3b,aT,3b,aT,3b,c5,3G,c5,5x,9o,3G,9o,2o,9o,3b,8L,3b,8L,3b,9W,4k,9W,3r,8L,4O,8L,6e,8L,2Z,9U,2Z,aT,4d,ca,3p,ay,1k,8k,2v,8H,2v,8H,1k,cf,2v,7V,3d,aX,3d,cf,5N,8H,5N,8H,4F,ca,5v,8H,5v,7V,5m,9o,5v,9W,4t,a6,4t,a6,4t,a6,4F,8L,3d,9U,2v,9U,3y,9o,3y,9U,3y,9W,1k,8g,2v,cj,2v,9A,2v,av,3z,av,3d,9A,4F,cj,4t,8g,5m,dR,7e,a7,7e,a7]}]},{"1b":3,"C":"岩手県","1Z":[{"D":[4L,3v,4L,3v,3J,3F,3R,4Y,5E,4Y,6d,4Y,7e,6v,7e,6v,ad,6v,5v,9c,4F,8C,5N,7w,3d,7w,2v,8P,2v,8O,2v,8i,3z,6U,1k,6U,1k,6U,1k,7U,2v,9Q,2v,9Q,1k,9P,1k,9C,1k,9C,2v,83,1k,9N,3y,8Y,3y,8Y,3y,9E,3p,8q,3p,9G,4d,9b,3p,8U,3p,ae,3p,8W,1k,7B,1k,7B,1k,7x,1k,7x,3y,6W,3y,5W,1k,6X,1k,6X,1k,6p,1k,3U,1k,3U,1k,3U,1k,3U,1k,3U,2v,5I,3d,5I,5N,4B,4F,4B,4t,4B,4t,4Q,4t,4x,5v,6b,5m,6b,5m,6b,5m,7R,7e,4x,6Y,4x,6Y,4x,6d,6b,5E,6b,5E,4x,3R,5I,3R,3U,3R,6J,4L,3U,4L,6J,4L,6J,7v,6J,7v,3U,7L,3U,7L,3U,6K,6J,7L,6p,7L,6X,6C,6p,7a,6X,5w,6X,6C,5W,7a,5W,6C,5W,5w,5W,5w,5W,5w,6W,6C,7x,5w,7x,5w,7B,5w,7B,6F,7h,6F,7h,5w,7h,5w,8W,6F,8W,5w,ae,6F,ae,6L,8U,6F,8U,5w,8U,6F,9b,6F,9b,6F,9G,6L,9G,6L,9G,7P,8q,7P,8q,6L,8q,5w,8q,6L,9E,7P,9E,7P,8Y,6L,9N,6L,aF,6L,83,6L,83,6F,aF,6F,9P,6F,7U,6F,8i,5w,9q,5w,8O,5w,aH,5w,8s,6C,8s,6C,8s,6C,8K,6K,8P,7a,aM,7a,aM,7a,bT,6K,7w,6K,7w,6K,8C,7L,4Y,7v,3v,4L,3v,4L,3v,4L,3v]}]},{"1b":4,"C":"宮城県","1Z":[{"D":[3R,3U,3R,6J,4L,3U,4L,6J,7v,4Q,4L,5I,5R,4Q,4L,4x,3J,4x,3J,6b,3J,6b,5R,7b,5R,7b,5R,7b,3J,7b,3J,7b,5E,8j,3R,7i,3J,7i,3J,7Z,3R,9h,3J,7C,3J,9h,5R,7C,5R,5A,3J,5A,3J,5A,3J,5A,3J,6O,3J,6O,3R,6n,3J,6n,5R,6n,3J,5c,3J,5c,3J,5c,5R,4i,3J,4i,3R,4i,3R,4i,3R,6a,5E,6a,5E,5c,5E,5c,6d,5c,ad,6n,5m,5c,5m,4i,4t,4i,4t,6a,5v,6a,4t,5c,4F,6a,4F,6a,4F,4i,4F,4i,4t,4i,4t,4i,4F,6Q,5N,6S,5N,6x,3d,6x,3z,6x,3z,7j,3z,4j,2v,5U,1k,5U,2v,5U,3y,5U,3p,7j,2Z,6x,6e,6x,4O,6x,4O,5O,4O,3j,3r,3j,4k,3j,4k,3j,2o,3j,2o,3j,2o,3j,2o,4H,2o,4H,2o,6z,3b,6z,3r,6f,3r,6k,4O,6G,4O,7k,4O,6H,6e,4i,6e,4i,3O,4i,3O,6a,2Z,5c,2Z,6O,2Z,5A,3O,7C,3O,7i,2Z,7i,2Z,7i,2Z,8j,4d,7R,2Z,4x,3O,4Q,3O,4B,4d,4B,3p,5I,3y,5I,1k,3U,1k,3U,1k,3U,1k,3U,2v,5I,3d,5I,5N,4B,4F,4B,4t,4B,4t,4Q,4t,4x,5v,6b,5m,6b,5m,6b,5m,7R,7e,4x,6Y,4x,6Y,4x,6d,6b,5E,6b,5E,4x,3R,5I,3R,3U,3R,3U]}]},{"1b":5,"C":"秋田県","1Z":[{"D":[3d,3F,3d,6v,3d,9c,3d,7w,2v,8P,2v,8O,2v,8i,3z,6U,1k,6U,1k,6U,1k,7U,2v,9Q,2v,9Q,1k,9P,1k,9C,1k,9C,2v,83,1k,9N,3y,8Y,3y,8Y,3y,9E,3p,8q,3p,9G,4d,9b,3p,8U,3p,ae,3p,8W,1k,7B,1k,7B,1k,7x,1k,7x,3y,6W,3y,5W,1k,6X,1k,6X,1k,6p,1k,3U,1k,3U,1k,3U,1k,3U,3y,5I,3p,5I,4d,4B,3O,4B,3O,4B,6e,4B,4O,5I,3r,3U,3r,3U,4k,6J,4k,6J,4k,6p,3b,6p,3b,6J,3G,6p,3G,6p,5x,6X,4w,6p,3T,6X,3I,5W,3I,5W,2S,5W,2B,5W,2B,5W,2B,6W,2B,7x,2B,7x,2B,7B,2B,7h,2S,8W,3E,8U,3I,9P,3E,7U,2S,8i,3E,8i,3I,6U,3I,9q,3E,9q,3E,9q,2S,8O,2S,8s,3E,8K,2S,aH,2S,8O,2S,8i,1Y,6U,2N,6U,1T,6U,2r,8i,2r,aH,1T,8O,2N,9q,2S,8K,3E,8C,3E,4Y,2S,3F,2S,3F,3E,3F,3E,3F,3E,3v,3I,3v,3T,3v,4w,3F,3b,3v,3b,3v,3b,6c,3r,6c,3r,3v,3O,3F,2Z,3F,4d,3F,3p,3F,3y,3v,1k,3v,1k,6c,2v,6c,3z,3F,3d,3F,3d,3F,3d,3F]}]},{"1b":6,"C":"山形県","1Z":[{"D":[3O,4B,6e,4B,4O,5I,3r,3U,3r,3U,4k,6J,4k,6J,4k,6p,3b,6p,3b,6J,3G,6p,3G,6p,5x,6X,4w,6p,3T,6X,3I,5W,3I,5W,2S,5W,2B,5W,2B,5W,1Y,6p,2N,4B,1T,4x,3e,7b,4M,7Z,2W,9h,2W,7C,4M,7C,3e,5A,2r,5A,2r,6O,2r,5c,1T,6a,1Y,4i,1Y,6H,1T,6S,3e,6S,3e,6G,3e,6f,2C,3j,2C,5O,2C,7j,3e,4j,2r,4j,1T,4j,1T,4j,2N,4j,1Y,4j,2B,4j,2S,4j,2S,5U,3E,5i,3I,5i,3I,5i,3I,5i,3T,6q,4w,5i,5x,5i,3G,5i,2o,5U,2o,4j,2o,3j,2o,3j,2o,3j,2o,3j,2o,4H,2o,4H,2o,6z,3b,6z,3r,6f,3r,6k,4O,6G,4O,7k,4O,6H,6e,4i,6e,4i,3O,4i,3O,6a,2Z,5c,2Z,6O,2Z,5A,3O,7C,3O,7i,2Z,7i,2Z,7i,2Z,8j,4d,7R,2Z,4x,3O,4Q,3O,4B,3O,4B,3O,4B]}]},{"1b":7,"C":"福島県","1Z":[{"D":[2v,5U,3z,4j,3z,7j,3z,6x,3d,6x,5N,6x,6j,5i,6j,6s,4F,6w,4F,4s,4F,3B,4F,3A,6j,2X,6j,2m,6j,1C,5N,1C,3d,1C,3z,1K,2v,2e,1k,2e,3p,2e,4d,1K,2Z,1C,2Z,2e,3O,1N,6e,1e,4O,1e,4k,1N,2o,1C,3G,2m,3G,2m,5x,2n,5x,2n,4w,5a,2B,3Z,2N,5a,2r,2n,4M,2m,2T,3k,4h,1C,4o,1K,4b,1C,4b,2m,4b,5a,4b,3Z,7l,3A,6Z,2q,7l,2P,4b,3o,4b,2h,4b,4P,4b,4s,5f,4s,4o,3n,4h,4z,2T,4z,2W,3n,2W,4l,2W,6w,2W,5k,4M,5k,2C,6s,2C,6q,3e,5i,2r,5U,2r,4j,2r,4j,1T,4j,1T,4j,2N,4j,1Y,4j,2B,4j,2S,4j,2S,5U,3E,5i,3I,5i,3I,5i,3I,5i,3T,6q,4w,5i,5x,5i,3G,5i,2o,5U,2o,4j,2o,3j,2o,3j,4k,3j,4k,3j,3r,3j,4O,3j,4O,5O,4O,6x,6e,6x,2Z,6x,3p,7j,3y,5U,2v,5U,1k,5U,2v,5U,2v,5U]}]},{"1b":8,"C":"茨城県","1Z":[{"D":[1k,2x,3y,4r,3p,4S,4d,1u,4d,1a,4d,2H,4d,1p,2Z,3q,2Z,2O,4d,4V,3p,4m,3y,4m,3y,2u,1k,1r,2v,1X,3z,2w,3z,2w,2v,2w,1k,1X,3p,H,4d,1r,2Z,2u,3O,2u,6e,1r,4O,2u,3r,1r,4k,1r,4k,1r,3b,H,3G,H,4w,H,4w,H,3T,H,2B,4m,2N,4V,1T,4p,1T,5L,2r,4p,3e,2s,3e,2s,2N,3q,1Y,4n,2B,1p,2S,1p,2S,2H,3I,2H,3I,2H,3T,1a,3T,1a,4w,1a,5x,2H,5x,1a,3G,1u,3G,4S,3G,4S,3G,4J,3G,4r,2o,4u,2o,2x,2o,2j,2o,1e,2o,1N,2o,1C,2o,1C,4k,1N,4O,1e,6e,1e,3O,1N,2Z,2e,2Z,1C,4d,1K,3p,2e,1k,2e,2v,2e,2v,1e,1k,2x,1k,2x]}]},{"1b":9,"C":"栃木県","1Z":[{"D":[4w,5a,5x,2n,5x,2n,3G,2m,3G,2m,2o,1C,2o,1C,2o,1N,2o,1e,2o,2j,2o,2x,2o,4u,3G,4r,3G,4J,3G,4S,3G,4S,3G,1u,5x,1a,5x,2H,4w,1a,3T,1a,3T,1a,3I,2H,3I,2H,2S,2H,2S,1p,2B,1p,1Y,4n,2N,3q,3e,2s,3e,2s,2C,2O,4M,3q,3N,3q,4h,4n,4o,1p,4o,1J,4o,1u,4h,4S,2T,3x,4h,5V,5f,4J,5f,4u,5f,2x,5f,2j,4o,1e,4o,1N,4o,1N,4o,1K,4o,1K,4h,1C,2T,3k,4M,2m,2r,2n,2N,5a,2B,3Z,4w,5a,4w,5a]}]},{"1b":10,"C":"群馬県","1Z":[{"D":[6Z,3k,7l,1C,4b,1C,4o,1K,4o,1K,4o,1K,4o,1N,4o,1N,4o,1e,5f,2j,5f,2x,5f,4u,5f,4J,4h,5V,2T,3x,4h,4S,4o,1u,4o,1J,4o,1p,4h,4n,3N,3q,4M,3q,2C,2O,3e,2s,4M,2s,3N,2s,2T,2s,5f,2O,5f,2O,8p,2O,6Z,3q,4T,2s,6E,3m,6E,2D,6E,2D,4W,2D,3M,4p,3M,4p,6g,4p,7m,5L,5e,4V,5b,5d,5b,5d,5Y,5d,3L,4p,5Y,4p,3L,2D,6y,2s,3L,3m,3L,2s,3L,2O,3L,3q,3L,4n,5Y,4n,3L,1a,6y,1a,4I,1a,6l,1J,6P,3x,6P,5V,4I,4J,4I,4r,6t,4r,6t,4u,6t,4u,5b,2x,5b,2x,5e,2j,5e,2j,7I,2x,7m,1e,7n,1e,7n,1N,3M,1N,3M,1K,4W,2e,4W,3k,4T,2m,4T,2n,5B,2n,6Z,3k,6Z,3k]}]},{"1b":11,"C":"埼玉県","1Z":[{"D":[5f,2O,5f,2O,8p,2O,6Z,3q,4T,2s,6E,3m,6E,2D,6E,2D,4W,2D,3M,4p,3M,4p,6g,4p,7m,5L,5e,4V,5b,5d,5b,5d,5b,4m,5e,2u,5e,2u,7I,1r,7I,1r,7m,H,7n,H,6g,H,6g,H,6g,H,3M,H,3M,H,3M,1r,3M,1r,4W,1r,4W,1r,4W,1r,4T,H,6Z,H,4b,1X,4b,1X,8p,1X,5f,F,4h,F,3N,F,3N,F,2W,2w,2C,F,2C,F,3e,F,2r,F,1T,1X,1Y,F,1Y,F,1Y,F,1Y,H,1Y,H,1Y,2u,2N,4m,1T,4V,1T,4V,1T,4V,1T,5L,1T,5L,2r,4p,3e,2s,4M,2s,3N,2s,2T,2s,5f,2O,5f,2O]}]},{"1b":12,"C":"千葉県","1Z":[{"D":[3O,2u,6e,1r,4O,2u,3r,1r,4k,1r,4k,1r,3b,H,3G,H,4w,H,4w,H,3T,H,2B,4m,2N,4V,1T,4p,1T,5L,1T,5L,1T,4V,1T,4V,1T,4V,2N,4m,1Y,2u,1Y,H,1Y,F,1Y,F,1Y,F,1Y,2w,2B,2I,1Y,1S,1Y,1S,2B,1S,2S,O,3E,1S,3E,1S,3I,1S,3T,1q,3T,1q,3T,1q,3I,1D,3E,1H,3E,1l,2S,1l,2S,2k,2B,1i,2B,1P,1Y,1P,2N,1P,2N,N,1T,N,2r,N,2N,1B,2N,1x,1Y,1U,2N,1t,2N,T,2N,1f,1T,2J,2N,3f,2N,3f,1T,Q,2r,Q,1T,W,2N,1G,2N,1G,1Y,1G,2S,W,3E,3f,3I,2J,3T,2J,3T,1f,4w,M,5x,M,2o,M,3b,T,3b,M,4k,T,3r,1t,4O,1U,3r,1x,3r,N,4O,1l,2Z,1m,3y,O,1k,O,2v,2I,3z,2I,3d,O,3d,O,3d,2I,3d,2w,3z,2w,3z,2w,2v,2w,1k,1X,3p,H,4d,1r,2Z,2u,3O,2u,3O,2u]}]},{"1b":13,"C":"東京都","1Z":[{"D":[1T,1X,1Y,F,1Y,2w,2B,2I,1Y,1S,1Y,1S,1Y,1S,1Y,1S,1Y,1S,2N,1S,1T,1S,1T,1m,1T,1D,2r,1D,3e,1D,3e,1D,3e,1D,2C,1q,2W,1m,3N,1S,3N,1m,2T,1m,4h,1m,2T,1m,2T,1q,2T,1q,2T,1q,2T,1D,2T,1H,4h,1H,8p,1m,5B,O,5B,O,5B,O,5B,O,5B,O,4T,O,3M,F,6g,H,6g,H,3M,H,3M,H,3M,1r,3M,1r,4W,1r,4W,1r,4W,1r,4T,H,6Z,H,4b,1X,4b,1X,8p,1X,5f,F,4h,F,3N,F,3N,F,2W,2w,2C,F,2C,F,3e,F,2r,F,1T,1X,1T,1X]},{"C":" 伊豆諸島","8u":[{"C":"三宅島","D":[2W,G,2W,S,3N,1n,2T,1W,4h,1n,4h,S,2T,G,3N,G,2W,G,2W,G]},{"C":"御蔵島","D":[2W,1s,2W,1z,2W,1z,4M,1z,2W,1s,2W,1s]},{"C":"八丈島","D":[1T,2Q,2N,4q,2N,5l,2N,6R,2N,6V,2N,6R,1T,6R,2r,5l,2r,4q,1T,2Q,1T,2Q]},{"C":"神津島","D":[4T,1M,5B,1M,5B,2L,5B,I,4T,I,4T,1M,4T,1M]},{"C":"新島","D":[4b,1h,4b,1F,4b,L,4b,1w,7l,L,7l,1F,7l,1F,4b,1h,4b,1h]},{"C":"大島","D":[4o,U,4h,1o,4h,1d,5f,1d,8p,U,4o,U,4o,U]}]}]},{"1b":14,"C":"神奈川県","1Z":[{"D":[2W,1m,2C,1q,3e,1D,3e,1D,2r,1D,1T,1D,1T,1D,1T,1H,2r,1H,3e,1l,2C,1l,2C,1l,2C,1l,2C,1l,3e,1i,2C,1i,2C,1i,2C,1P,2C,N,2C,N,2C,1B,2C,1B,3e,1x,2r,1x,2r,1U,3e,1t,2C,T,2C,T,2C,M,4M,M,4M,T,4M,1t,4M,1t,4M,1U,2W,1x,2T,1B,2T,1B,4h,N,5f,1B,6Z,1x,5B,1t,5B,T,4W,T,4W,1U,3M,1x,3M,1B,4W,1P,3M,1i,6g,1i,7n,1i,3M,1l,4W,1H,6E,1H,6E,1D,4T,1m,5B,O,5B,O,8p,1m,4h,1H,2T,1H,2T,1D,2T,1q,2T,1q,2T,1q,2T,1m,4h,1m,2T,1m,3N,1m,3N,1S,2W,1m,2W,1m]}]},{"1b":15,"C":"新潟県","1Z":[{"D":[2r,5A,2r,6O,2r,5c,1T,6a,1Y,4i,1Y,6H,1T,6S,3e,6S,3e,6G,3e,6f,2C,3j,2C,5O,2C,7j,3e,4j,2r,4j,2r,5U,3e,5i,2C,6q,2C,6s,4M,5k,2W,5k,2W,6w,2W,4l,2W,3n,2T,4z,4h,4z,4o,3n,5f,4s,4b,4s,4b,4P,4b,2h,4b,3o,7l,2P,6Z,2q,7l,3A,4b,3Z,4b,5a,4b,2m,4b,1C,7l,1C,6Z,3k,5B,2n,4T,2n,4T,2m,4W,3k,4W,2e,3M,1K,3M,1N,7n,1N,7n,1e,7m,1e,7I,2x,5e,2j,5e,2j,5b,2x,5b,2x,5b,2x,5b,1e,5Y,2e,3L,1C,6y,2n,4I,2m,6l,3k,5Q,1C,5Q,1C,5P,1C,5P,2e,5P,1N,4f,2e,6M,1N,6M,1N,8n,2e,8n,1K,8R,1C,a5,1C,8b,1K,8b,1K,8b,2e,9g,1N,9g,1e,5o,1e,5o,1e,5o,1N,5h,1K,5h,1C,5h,3k,5G,3k,5G,2m,5G,2m,5o,2n,cK,5a,8R,5a,8n,2X,6M,3Z,6A,3A,6N,3A,8w,3A,5P,3A,6l,2P,6t,3o,3L,4s,5Y,3n,5b,4l,5e,5C,7I,5k,7m,6q,6g,7j,4T,5O,7l,3j,5f,6z,4h,7k,2T,4i,2T,6n,3N,5A,2W,5A,2W,7C,4M,7C,3e,5A,2r,5A,2r,5A]},{"C":"佐渡島","D":[6t,6Q,6t,4i,6y,4i,6y,6Q,6y,6S,6t,6k,6y,6f,3L,6f,3L,6f,3L,4H,6P,7j,6l,4j,5Q,4j,5P,4j,8w,4j,5P,7j,5Q,7j,5Q,6x,5Q,5O,6l,3j,6l,4H,6l,4H,5Q,4H,5Q,3j,5P,3j,5P,6z,5P,6f,5Q,6k,5Q,7k,6l,6S,4I,6H,6t,6Q,6t,6Q]}]},{"1b":16,"C":"富山県","1Z":[{"D":[2z,1p,2z,1p,5u,1a,5T,1a,5K,1a,5K,2H,5K,1p,5K,1p,5X,1p,5Z,2H,4a,1J,7c,1u,7c,1u,5H,1u,7d,4S,7d,1u,6m,1u,5g,1u,6i,1J,4C,1J,4c,1a,4c,1a,5q,1a,5q,1a,5q,1J,5q,1J,5q,1J,6h,1u,6h,4S,6h,3x,5G,3x,5G,3x,5G,5V,5h,4J,5o,4u,5o,2x,5o,1e,5o,1e,9g,1e,5o,1e,5o,1e,5o,1N,5h,1K,5h,1C,5h,3k,5h,3k,5G,3k,5G,2m,5q,2m,4C,3k,6i,1C,6i,1K,6i,2e,5g,1N,6m,1N,7A,1e,7c,1N,8h,1N,5Z,1K,5Z,1C,4a,3k,4a,2m,5Z,2m,5T,1C,5T,1K,5u,2e,5u,1N,5u,1e,5u,1e,2z,1e,2z,1e,2z,2j,2z,2x,2z,4u,2z,4J,2z,5V,2z,3x,3g,4S,3g,1u,2z,1J,3g,1a,3g,1p,2z,1p,2z,1p,2z,1p]}]},{"1b":17,"C":"石川県","1Z":[{"D":[7d,4P,6m,4P,6m,4P,7A,3o,5H,3o,8h,2P,4a,2q,5Z,2q,5X,2q,5X,2q,5K,3B,5K,3A,5T,3Z,5T,2X,5K,5a,5K,3Z,5X,2X,5Z,2X,5Z,3Z,4a,3Z,4a,2X,4a,5a,4a,2m,4a,2m,4a,2m,5Z,2m,5T,1C,5T,1K,5u,2e,5u,1N,5u,1e,2z,1e,2z,1e,2z,2j,2z,2x,2z,4u,2z,4J,2z,5V,2z,3x,3g,4S,3g,1u,2z,1J,3g,1a,3g,1p,2z,1p,2z,1p,2z,1p,2z,1p,2z,1p,2z,4n,2z,4n,3g,2s,4D,3m,4D,3m,7Y,2D,4R,3m,3C,2s,7H,2s,7s,2O,7s,2O,7p,2s,7M,2O,4K,3q,4N,1p,5y,2H,5y,2H,4N,1a,7M,1J,7s,3x,8B,4J,4R,2x,7Y,2j,4D,1N,3g,3k,3g,2m,2z,2n,3g,2X,3g,3A,4D,3B,3g,3o,3g,2h,2z,4P,5u,4s,5T,4s,5T,3n,5K,3n,5X,3n,5X,3n,7c,4z,7c,4l,7A,4l,6m,5C,6i,4l,6i,3n,5g,3n,6m,3n,7d,4P,7d,4P]},{"C":"能登島","D":[4a,3B,4a,3B,4a,3A,5X,3Z,5X,3A,5K,3B,5X,3A,5X,3A,5X,3A,5X,3B,5Z,3A,4a,3B,4a,3B]}]},{"1b":18,"C":"福井県","1Z":[{"D":[4N,1p,4K,3q,7M,2O,7p,2s,7s,2O,7s,2O,7H,2s,3C,2s,4R,3m,7Y,2D,4D,3m,7Y,4p,7Y,5d,3g,5d,3g,2u,4D,1r,4R,H,3C,H,3C,1r,7M,H,4N,H,5y,1X,5y,F,5y,F,6T,2w,8a,F,3P,F,3P,2w,4G,O,5s,1S,4y,1S,2A,1m,5j,1m,5p,1D,3l,1H,3h,1H,3K,1l,5D,1H,4E,1D,4E,1q,2M,1q,2M,1m,2M,1S,2M,O,4E,2I,4E,O,4E,O,4E,O,4E,O,4E,1S,3S,1S,5F,O,5F,1S,5D,1m,5F,1m,4Z,1m,3K,1S,3K,1S,3K,2I,4Z,2I,3l,1S,3h,O,3l,2I,3l,O,3l,2I,3l,2w,3l,2w,3h,2w,3l,F,3l,2w,5p,2I,5p,2w,5j,2I,2p,2w,2p,F,2p,1X,2p,1X,2A,H,4y,H,4y,1X,4y,F,4y,F,5s,F,5s,H,4y,4m,2A,5d,2A,4V,2A,5L,2A,5L,2A,4p,5s,2s,3P,3q,3P,1p,6T,2H,5y,2H,5y,2H,4N,1p,4N,1p]}]},{"1b":19,"C":"山梨県","1Z":[{"D":[7n,H,7m,H,7I,1r,7I,1r,5e,2u,5e,2u,5e,2u,5b,1r,5Y,1r,3L,1r,6y,2u,4I,2u,6P,2u,6P,4m,6l,4m,5P,4m,8w,1r,6N,1r,4f,1X,4f,F,4f,F,6A,2w,6A,2I,4f,O,4f,O,4f,O,4f,O,6N,1m,6N,1q,6N,1l,6N,1P,6N,N,8w,N,5P,N,5Q,1B,5Q,1U,6l,1t,6P,1t,4I,1U,4I,1B,6t,2k,6y,1i,3L,1i,5Y,1i,5Y,1P,5Y,1P,5e,1P,6g,1i,6g,1i,7n,1i,3M,1l,4W,1H,6E,1H,6E,1D,4T,1m,5B,O,5B,O,4T,O,3M,F,6g,H,7n,H,7n,H]}]},{"1b":20,"C":"長野県","1Z":[{"D":[4I,2m,6y,2n,3L,1C,5Y,2e,5b,1e,5b,2x,6t,4u,6t,4u,6t,4r,4I,4r,4I,4J,6P,5V,6P,3x,6l,1J,4I,1a,6y,1a,3L,1a,5Y,4n,3L,4n,3L,3q,3L,2O,3L,2s,3L,3m,6y,2s,3L,2D,5Y,4p,3L,4p,5Y,5d,5e,2u,5Y,1r,3L,1r,6y,2u,4I,2u,6P,2u,6P,4m,6l,4m,5P,4m,8w,1r,6N,1r,4f,1X,4f,F,4f,F,6A,2w,6A,2I,4f,O,4f,O,4f,O,4f,1S,4f,1m,6A,1m,6A,1m,6A,1D,6A,1H,6M,1l,6M,1l,6M,1l,6M,2k,8n,1P,8R,1P,a5,N,8b,1B,5o,1x,5h,1U,5G,1x,6h,1x,5q,1x,3W,1x,4C,1B,4C,N,3W,N,3W,N,3W,N,3W,1P,3W,1i,3W,2k,4c,2k,4c,1l,4c,1H,4c,1q,3W,1q,4C,1q,4C,O,4C,2I,6i,F,5g,1X,7d,H,6m,1r,5g,4m,6i,2u,4C,4m,4C,5d,4c,4V,4c,4p,3W,2D,4c,2s,4c,2O,5q,3q,6h,1p,6h,2H,5q,1a,5q,1a,5q,1a,5q,1J,5q,1J,6h,1u,6h,4S,6h,3x,5G,3x,5G,3x,5G,5V,5h,4J,5o,4u,5o,2x,5o,1e,5o,1e,9g,1e,9g,1N,8b,2e,8b,1K,8b,1K,a5,1C,8R,1C,8n,1K,8n,2e,6M,1N,6M,1N,4f,2e,5P,1N,5P,2e,5P,1C,5Q,1C,5Q,1C,6l,3k,4I,2m,4I,2m]}]},{"1b":21,"C":"岐阜県","1Z":[{"D":[6m,1u,7d,1u,7d,4S,5H,1u,7c,1u,4a,1J,5Z,2H,5X,1p,5K,1p,5K,1p,5K,2H,5K,1a,5T,1a,5u,1a,2z,1p,2z,1p,2z,1p,2z,4n,2z,4n,2z,4n,3g,2s,4D,3m,4D,3m,7Y,4p,7Y,5d,3g,5d,3g,2u,4D,1r,4R,H,3C,H,3C,1r,7M,H,4N,H,5y,1X,5y,F,5y,F,6T,2w,6T,2I,5y,O,4N,1m,4K,1S,4K,1m,4K,1H,4N,1i,4K,1B,4K,N,4K,1B,7M,N,7p,N,7s,1B,7H,1x,8B,1U,3C,1t,3C,1t,3C,1U,3C,1B,3C,N,3C,N,4R,1i,4D,2k,5u,1l,5T,1l,5T,1l,5K,2k,5X,1i,5Z,1P,4a,N,8h,N,7c,N,7A,N,7d,1B,6m,1B,5g,1x,6i,1B,3W,N,3W,N,3W,N,3W,1P,3W,1i,3W,2k,4c,2k,4c,1l,4c,1H,4c,1q,3W,1q,4C,1q,4C,O,4C,2I,6i,F,5g,1X,7d,H,6m,1r,5g,4m,6i,2u,4C,4m,4C,5d,4c,4V,4c,4p,3W,2D,4c,2s,4c,2O,5q,3q,6h,1p,6h,2H,5q,1a,5q,1a,4c,1a,4c,1a,4C,1J,6i,1J,5g,1u,6m,1u,6m,1u]}]},{"1b":22,"C":"静岡県","1Z":[{"D":[3L,1i,6y,1i,6t,2k,4I,1B,4I,1U,6P,1t,6l,1t,5Q,1U,5Q,1B,5P,N,8w,N,6N,N,6N,1P,6N,1l,6N,1q,4f,O,4f,O,4f,O,4f,O,4f,1S,4f,1m,6A,1m,6A,1m,6A,1D,6A,1H,6M,1l,6M,1l,6M,1l,6M,2k,8n,1P,8R,1P,a5,N,8b,1B,5o,1x,5h,1U,5h,1t,5o,1t,5h,T,5h,T,5G,M,5G,M,6h,1f,5q,3f,4c,Q,4c,W,3W,1G,4C,2b,6i,2b,5g,2f,5g,1d,5g,1d,5g,1d,4C,1d,4C,1o,4C,2f,4C,1j,4C,U,3W,2f,4c,1j,3W,2f,3W,1o,4c,U,3W,1o,3W,1d,4c,1d,6h,1R,5h,1R,8R,1R,4f,1O,4f,R,6A,1R,4f,1o,6N,U,8w,2f,5P,2b,5Q,1G,6l,W,6P,Q,4I,Q,4I,3f,4I,3f,4I,3f,4I,2J,4I,2J,6t,1f,3L,M,5b,M,7m,1f,7m,3f,7I,3f,5e,3f,5e,1G,5e,1j,5b,2f,5e,U,5b,U,5b,1o,5b,1d,5b,1d,5e,1R,5e,R,7I,1O,7m,1O,6g,1R,3M,1R,3M,1R,4W,1o,6E,U,6E,2f,4T,1j,5B,2b,5B,W,4T,Q,4T,Q,4T,3f,6E,2J,4T,M,4W,T,4W,1U,3M,1x,3M,1B,4W,1P,3M,1i,6g,1i,6g,1i,5e,1P,5Y,1P,5Y,1P,5Y,1i,3L,1i,3L,1i]}]},{"1b":23,"C":"愛知県","1Z":[{"D":[3W,1x,5q,1x,6h,1x,5G,1x,5h,1U,5o,1x,5h,1U,5h,1t,5o,1t,5h,T,5h,T,5G,M,5G,M,5G,M,6h,1f,5q,3f,4c,Q,4c,W,3W,1G,4C,2b,6i,2b,5g,2f,5g,1o,5g,1d,5g,1d,5g,1d,5g,1d,4a,R,5T,R,5K,1d,5X,1d,5Z,1d,8h,1o,7c,1o,5H,U,5H,U,5H,1o,5H,1o,5H,1o,5H,U,5H,U,5H,1j,7c,1j,8h,1j,4a,1j,4a,2f,5Z,1j,5K,1j,5T,1j,5u,2b,5u,1G,5u,Q,2z,W,2z,2b,5u,2f,5u,1o,4D,2f,4D,1j,3g,2b,4D,W,4D,3f,3g,1f,3g,M,4D,1f,4D,1f,4D,M,7Y,M,4R,M,4R,M,4R,T,3C,1t,3C,1t,3C,1t,3C,1U,3C,1B,3C,N,3C,N,4R,1i,4D,2k,5u,1l,5T,1l,5T,1l,5K,2k,5X,1i,5Z,1P,4a,N,8h,N,7c,N,7A,N,7d,1B,6m,1B,5g,1x,6i,1B,3W,N,4C,N,4C,1B,3W,1x,3W,1x]}]},{"1b":24,"C":"三重県","1Z":[{"D":[4R,1f,3C,M,3C,1f,3C,1f,8B,2J,8B,3f,7H,W,7s,2b,7p,2f,7p,U,7p,1o,7p,1d,7H,R,4R,1O,4D,1c,3g,P,2z,P,3g,1y,3g,1y,3g,1h,4D,1h,3g,1h,3g,1h,3g,1F,4D,L,3g,L,4D,1w,3C,1w,3C,L,4R,L,3C,L,4R,L,3C,L,8B,L,8B,1F,7H,1F,7H,1F,7H,L,7s,L,7s,1w,7p,1w,7p,L,7M,1w,7M,L,4K,L,4K,1M,4N,1w,4N,1w,4N,V,8a,V,3P,1M,3P,1M,4G,1M,3P,2L,3P,I,3P,K,4G,I,5s,K,5s,K,4G,K,4G,G,3P,G,4G,G,4G,G,4G,1n,5s,1n,5s,1W,4y,1n,4y,1n,4y,1A,4y,1W,2A,1W,2A,1A,2p,1A,5j,3c,5p,1z,3l,1s,3h,1s,3h,1s,3K,3c,3K,1A,4Z,1n,4Z,1n,3h,1n,3h,1n,3l,1n,3l,S,3l,S,5p,G,5j,K,2p,G,2A,G,2p,K,2p,I,2p,I,2p,1M,2p,V,2A,L,2A,1F,2A,1F,2A,1h,2p,P,4y,E,4G,1c,5s,1O,2A,1R,2p,1d,2A,1o,2p,U,2p,U,2A,U,2p,2f,2A,1j,2p,1j,2p,2b,2p,1G,2A,1G,4y,Q,2A,Q,2A,Q,5s,Q,4G,Q,3P,W,8a,Q,5y,3f,4N,M,4K,1U,4K,1B,4K,1B,4K,N,4K,1B,7M,N,7p,N,7s,1B,7H,1x,8B,1U,3C,1t,3C,1t,3C,1t,4R,T,4R,M,4R,M,4R,M,4R,1f,4R,1f]}]},{"1b":25,"C":"滋賀県","1Z":[{"D":[4G,F,3P,F,3P,F,3P,F,3P,F,3P,F,3P,F,6T,F,6T,F,6T,2w,6T,2w,6T,2w,6T,2I,5y,O,4N,1m,4K,1S,4K,1m,4K,1H,4N,1i,4K,1B,4K,1B,4K,1U,4N,M,5y,3f,8a,Q,3P,W,4G,Q,5s,Q,2A,Q,2A,Q,4y,Q,2A,1G,2p,1G,2p,2b,5j,1G,2p,1G,5j,W,5p,Q,5p,Q,3l,Q,3h,2J,3h,1f,4Z,1t,3h,1B,3h,N,3h,1i,3K,1l,3h,1H,3l,1H,5p,1D,5j,1m,2A,1m,4y,1S,5s,1S,4G,O,3P,2w,4G,F,4G,F,4G,F,4G,F]}]},{"1b":26,"C":"京都府","1Z":[{"D":[2M,1S,2M,1m,2M,1q,4E,1q,4E,1D,5D,1H,3K,1l,3K,1l,3h,1i,3h,N,3h,1B,4Z,1t,3h,1f,3h,2J,3l,Q,5p,Q,5p,Q,5j,W,2p,1G,5j,1G,2p,2b,2p,1j,5j,1j,3l,2b,3l,1j,4Z,1j,3K,1j,5F,1G,5F,1G,5D,Q,3S,2J,3H,1f,3H,1f,4E,1f,4E,2J,2M,1f,2M,M,5r,M,4e,T,2G,T,2G,1t,2G,1t,4e,1U,2G,1x,2G,1B,5z,1B,5z,N,6B,N,4v,N,4v,N,4v,1P,4v,1P,4A,1i,2Y,1i,5t,1i,2R,1l,3u,1D,3V,1q,5t,1q,5t,1S,2Y,2I,3V,2I,2R,O,3u,2w,3u,F,3u,1X,3u,H,2R,1X,3V,H,2Y,1r,4A,1r,4A,2u,6B,2u,5z,2u,4U,2u,2G,H,2G,1X,4U,1X,5z,2w,5z,2w,4U,2I,5z,O,4U,O,2G,1S,2G,1S,4e,1S,4e,1S,2G,O,4e,2I,4e,2I,2M,2w,4E,2I,2M,O,2M,1S,2M,1S]}]},{"1b":27,"C":"大阪府","1Z":[{"D":[3H,1f,4E,1f,4E,2J,2M,1f,2M,M,5r,M,4e,T,2G,T,2G,1t,2G,1t,4U,1t,2G,T,4U,M,4U,M,2G,1f,4e,1f,5r,1f,4e,2J,4e,W,4e,2b,4e,2b,2G,1j,2G,1j,2G,1j,2G,U,2G,U,2G,U,2G,1o,4U,1d,2G,1R,4U,R,6B,1O,4v,E,4A,P,5t,P,3V,P,3V,P,3V,1y,3V,1y,5t,1h,2Y,1h,4A,1y,4A,1y,4A,1y,4A,1y,4v,1y,4v,1y,5z,P,2G,P,4e,P,5r,P,4E,P,3H,P,3H,E,3S,1c,3S,R,3S,1o,3S,2f,5D,1G,5F,1G,5F,1G,5D,Q,3S,2J,3H,1f,3H,1f,3H,1f]}]},{"1b":28,"C":"兵庫県","1Z":[{"D":[3u,F,3u,2w,2R,O,3V,2I,2Y,2I,5t,1S,5t,1q,3V,1q,3u,1D,2R,1l,5t,1i,2Y,1i,4A,1i,4v,1P,4v,1P,4v,N,4v,N,6B,N,5z,N,5z,1B,2G,1B,2G,1x,4e,1U,2G,1t,4U,1t,2G,T,4U,M,4U,M,2G,1f,4e,1f,5r,1f,4e,2J,4e,W,4e,2b,2G,1j,2G,1j,4U,1j,5z,2b,5z,1j,4v,1j,4A,1j,2Y,2f,3u,2f,5n,2b,6o,1G,6V,W,5l,Q,4q,W,4q,Q,2Q,Q,2K,Q,3s,Q,3s,Q,3s,W,3i,W,2E,W,2y,W,2t,W,2t,Q,2t,Q,2t,2J,4g,1f,2t,M,2t,T,2t,T,2t,1t,2t,1U,2y,1x,2E,1P,3i,1P,3i,1i,3s,1l,2K,1l,3t,1l,3t,1H,3t,1q,3t,1q,3t,1m,2K,1S,2K,O,2K,F,2K,1X,2K,H,2Q,H,4q,H,5l,H,5l,H,6R,H,6V,H,6o,H,6o,H,5S,H,5n,H,3u,1X,3u,F,3u,F]},{"C":"淡路島","D":[2R,1o,3u,1o,3u,1o,3u,1d,5n,R,5S,1c,5n,P,5n,P,5n,1y,5S,1h,6V,1h,6R,1F,5l,L,5l,1F,4q,1F,4q,1h,4q,1h,4q,1h,2Q,1h,2Q,1y,4q,1y,2Q,1y,4q,P,4q,E,5l,E,6R,1O,6V,R,6o,1R,6u,1o,2R,1o,2R,1o]}]},{"1b":29,"C":"奈良県","1Z":[{"D":[3l,2b,3l,1j,4Z,1j,3K,1j,5F,1G,5D,1G,3S,2f,3S,1o,3S,R,3S,1c,3H,E,3H,P,3H,1h,3S,1F,3S,L,3S,L,3H,L,4E,1w,2M,V,2M,1M,5r,1M,5r,2L,2M,I,2M,G,2M,S,2M,1n,2M,1W,2M,1W,2M,1A,3H,1W,3S,1W,5D,1W,3K,1A,3K,1A,3K,3c,3K,1A,4Z,1n,3l,S,5p,G,5j,K,2p,G,2A,G,2p,K,2p,I,2p,I,2p,1M,2p,V,2A,L,2A,1F,2A,1F,2A,1h,2p,P,4y,E,4G,1c,5s,1O,2A,1R,2p,1d,2A,1o,2p,U,2p,U,2A,U,2p,2f,2A,1j,2p,1j,5j,1j,3l,2b,3l,2b]}]},{"1b":30,"C":"和歌山県","1Z":[{"D":[4E,P,3H,P,3H,1h,3S,1F,3S,L,3S,L,3H,L,4E,1w,2M,V,2M,1M,5r,1M,5r,2L,2M,I,2M,G,2M,S,2M,1n,2M,1W,2M,1W,2M,1A,3H,1W,3S,1W,5D,1W,3K,1A,3K,1A,3K,3c,3h,1s,3h,1s,3l,1s,3l,1s,5p,1s,3h,2c,3h,1Q,3l,Z,3h,1Q,4Z,Z,3h,Z,3h,Z,3h,Z,4Z,1v,3h,1v,3h,1v,4Z,1I,4Z,1I,4Z,1I,3K,1V,5F,1V,3S,2g,5D,2g,5F,2g,5D,2l,3S,2g,3H,2l,3S,2g,3S,2g,3H,2g,2M,2g,5r,1V,2G,1V,2G,1I,4U,1I,6B,Z,6B,1Q,6B,1Q,4v,2c,4v,1s,4v,1s,6B,1s,6B,1s,6B,1z,4v,2a,4A,2a,2Y,3c,5t,1A,3V,1W,3V,1n,2R,1n,3u,1n,3u,S,3u,S,3u,G,3u,K,2R,K,3V,K,3V,I,3V,2L,3u,1M,2R,1M,2R,1M,3V,V,5t,V,2Y,1w,5t,L,3V,1F,2R,1h,2R,1y,3V,P,3V,1y,5t,1h,2Y,1h,4A,1y,4A,1y,4A,1y,4v,1y,4v,1y,5z,P,2G,P,4e,P,5r,P,4E,P,4E,P]}]},{"1b":31,"C":"鳥取県","1Z":[{"D":[3a,F,2y,F,3i,1X,2K,H,2K,1X,2K,F,2K,O,2K,1S,3t,1m,3t,1q,3t,1q,3t,1H,3t,1l,2K,1l,3s,1l,3i,1l,2E,2k,2y,2k,4g,1i,3Q,2k,3Q,1l,3a,1H,3a,1D,2i,1D,2l,1q,2l,1q,2l,1m,1V,1q,1v,1D,Z,1H,Z,1D,Z,1q,1s,1m,1z,1m,2a,1q,3c,1D,1A,1D,1A,1l,1W,1l,1n,1l,S,1l,K,1i,I,1i,I,1P,2L,1P,1M,1i,1w,2k,V,2k,1M,1l,1M,1H,1M,1D,1M,1D,2L,1q,K,1q,K,1m,G,O,G,O,G,2I,G,2w,K,2w,I,1X,I,H,K,H,K,1X,S,F,1n,2w,1W,F,1s,1X,1Q,F,1v,F,2l,F,2l,F,2i,F,3a,F,3a,F]}]},{"1b":32,"C":"島根県","1Z":[{"D":[R,1X,1c,1X,1O,H,1O,H,E,H,1F,H,1F,1r,1F,1r,1w,1r,1w,2u,L,4m,V,2u,V,4m,2L,2u,I,2u,G,1r,S,1r,S,1r,K,H,I,H,I,1X,K,2w,G,2w,G,2I,G,O,G,O,K,1m,K,1q,2L,1q,1M,1D,1M,1D,1M,1H,1M,1l,V,2k,1w,2k,1w,2k,L,1i,1F,2k,1h,2k,1h,2k,1y,2k,P,2k,E,2k,E,1i,1c,1i,1O,1P,R,N,1R,N,1d,1B,1d,1x,1R,1x,1d,1U,U,1U,2f,1t,1j,1t,2b,1U,2b,1U,Q,1t,2J,1U,1f,1t,1t,T,T,M,T,1f,1t,2J,1U,Q,1x,W,1x,1G,1B,1G,N,1j,1P,U,1P,U,1i,2f,1l,U,1H,2f,1H,1j,1H,2b,1H,2b,1H,1G,1D,1G,1q,Q,1q,3f,1D,2J,1H,1f,1D,T,1l,T,1i,1t,1P,1U,1P,1x,N,1x,1B,1x,1B,1B,1x,1B,1x,1B,1U,N,1U,N,1t,1P,T,1i,M,2k,2J,2k,Q,1l,W,1H,1G,1q,1j,1m,U,1S,1d,O,R,2I,R,F,1R,F,1R,F,R,1X,R,1X]},{"C":"隠岐島","D":[1W,4r,1A,4J,3c,5V,1A,4S,1W,1u,1n,1u,G,4S,G,5V,S,4J,1W,4r,1W,4r]},{"C":"西ノ島","D":[2L,1p,1M,4n,1M,4n,1M,1p,1M,1p,V,1p,V,2H,1w,1J,V,1J,V,1a,V,2H,1M,2H,2L,1p,2L,1p]},{"C":"中ノ島","D":[K,1a,I,1a,K,2H,I,1a,I,2H,2L,1p,2L,1a,2L,1J,1M,1a,1M,1a,1M,1u,I,1u,2L,1J,2L,1J,I,1J,I,1J,K,1a,K,1a]}]},{"1b":33,"C":"岡山県","1Z":[{"D":[2l,1m,2l,1q,2l,1q,2i,1D,3a,1D,3a,1H,3Q,1l,3Q,2k,4g,1i,2y,2k,2E,2k,3i,1l,3i,1i,3i,1P,2E,1P,2y,1x,2t,1U,2t,1t,2t,T,2t,T,2t,M,4g,1f,2t,2J,2t,Q,2t,Q,4g,W,2i,1j,2l,1j,2g,1j,2g,1j,2g,2b,1V,1j,1I,2b,1I,1j,1V,1j,1V,2f,1V,U,1V,2f,1V,U,1V,1d,1I,U,1I,U,1v,1o,Z,1d,1Q,1o,2c,1o,2c,1d,2c,1d,1s,1o,1z,U,1z,1o,2a,1o,2a,U,2a,2f,2a,2f,3c,2f,3c,2f,3c,U,1A,U,1A,U,1W,U,1n,U,1n,2f,S,2f,S,U,S,U,G,U,G,2f,G,2f,G,1j,G,2b,K,W,K,Q,K,2J,K,M,I,T,I,1U,I,1x,I,1B,K,1B,I,N,I,1P,I,1i,K,1i,S,1l,1n,1l,1W,1l,1A,1l,1A,1D,3c,1D,2a,1q,1z,1m,1s,1m,Z,1q,Z,1D,Z,1H,1v,1D,1V,1q,2l,1m,2l,1m]}]},{"1b":34,"C":"広島県","1Z":[{"D":[1w,2k,1w,2k,L,1i,1F,2k,1h,2k,1h,2k,1y,2k,P,2k,E,2k,E,1i,1c,1i,1O,1P,R,N,1R,N,1d,1B,1d,1x,1R,1x,1d,1U,U,1U,2f,1t,1j,1t,2b,1U,2b,1U,Q,1t,2J,1U,1f,1t,1t,T,T,M,T,1f,1t,2J,1U,Q,1x,W,1x,1G,1x,1G,1x,1j,1x,2f,1U,1o,T,R,T,R,T,R,T,R,T,R,T,1R,M,1d,1f,1d,M,1R,M,1R,1f,1R,2J,1R,2J,1d,3f,1d,2J,1o,2J,1o,2J,U,3f,U,3f,U,W,U,W,1o,1G,1o,2b,1o,1G,1o,1G,1d,1G,R,2b,R,2b,R,1G,1O,W,1c,1G,R,W,1d,Q,1R,Q,1R,3f,1R,3f,R,Q,1O,Q,1O,Q,E,W,E,Q,E,Q,P,W,P,1G,P,1G,1y,1G,1y,2b,1y,2b,P,2b,E,2b,E,1G,E,1G,E,2b,E,1G,1c,2b,1O,1j,1O,2f,1O,2f,1c,U,1c,U,1c,U,1c,1o,E,1o,E,1d,E,1d,E,1R,1c,1d,1c,1d,1c,U,1O,1o,1O,1d,R,1d,R,1R,1R,R,1R,R,1R,1O,1R,1c,1R,P,1R,1h,1d,1h,1o,L,1o,1w,1o,L,1d,1F,1R,1F,1R,1h,1O,1h,1O,L,R,L,R,L,R,L,1O,1w,R,1w,1R,L,1R,V,1d,2L,1d,1M,1R,V,1R,2L,1R,I,1R,I,1d,K,1o,K,U,K,U,G,U,G,2f,G,2f,G,1j,G,2b,K,W,K,Q,K,2J,K,M,I,T,I,1U,I,1x,I,1B,K,1B,I,N,I,1P,2L,1P,1M,1i,1w,2k,1w,2k]},{"C":"大崎上島","D":[R,R,1c,R,1c,1R,1c,R,1c,1O,1O,1c,R,1c,R,1O,R,R,R,R]}]},{"1b":35,"C":"山口県","1Z":[{"D":[1m,M,1m,T,1q,T,1D,T,1D,T,1D,T,1H,1f,1D,2J,1q,3f,1q,Q,1D,1G,1H,1G,1H,2b,1H,2b,1H,1j,1H,2f,1l,U,1i,2f,1P,U,1P,U,N,1j,1B,1G,1x,1G,1x,1G,1x,1j,1x,2f,1U,1o,T,R,T,R,T,R,T,R,T,1c,T,1c,T,1c,1t,P,1t,1h,1t,1F,1t,1F,T,1F,M,L,1f,1w,1f,1w,1f,L,3f,L,3f,1w,2J,1w,1f,V,1f,V,M,V,T,1w,1t,V,1U,V,1U,V,1U,1w,1U,L,1U,L,1U,1F,1x,1F,1x,1w,1x,V,1B,V,1B,V,1B,1w,N,L,1i,L,1i,1F,2k,1h,1H,1y,1H,1y,1H,1h,1D,1y,1q,1y,1D,P,1H,P,1D,E,1q,1c,1S,E,1S,E,O,E,2I,E,2I,1c,2w,P,F,E,F,1c,1X,E,H,E,1r,E,1r,P,1r,E,1r,1c,2u,P,5d,P,5d,1h,5d,1y,4V,P,5L,P,5L,E,5L,E,5L,E,5L,1c,4p,1c,2D,1O,3m,R,3m,1O,2O,1c,3q,E,4n,P,4n,E,3q,1c,3q,1O,3q,R,4n,1d,3q,1o,2O,2f,2O,2b,2O,1G,2O,W,2s,W,3m,W,2D,Q,3m,Q,2s,Q,3m,Q,2D,3f,4V,Q,4V,Q,4V,W,5d,W,4m,W,4m,W,2u,W,1r,W,H,W,H,W,1X,W,1X,W,1X,Q,F,Q,F,3f,2I,2J,O,1f,1S,M,1S,M,1m,M,1m,M]},{"C":"長島","D":[N,V,N,V,N,1M,1P,1M,N,V,N,V,N,V]}]},{"1b":36,"C":"徳島県","1Z":[{"D":[2l,1F,2g,L,1V,L,1V,L,1v,1w,Z,1w,Z,L,1Q,1F,2c,L,1s,L,1z,L,2a,1w,3c,1w,1A,V,1A,V,1A,V,1A,1M,1A,2L,1A,2L,1A,I,1W,K,2a,G,1z,G,1s,G,1s,S,2c,1n,1Q,S,Z,S,1v,S,1v,3c,1I,3c,1V,2a,2g,1z,1V,1s,2g,2c,2i,1Q,3a,1Q,3a,2c,3a,2c,3Q,2c,4g,1s,4g,1z,4g,1z,2t,1z,2y,2a,3i,2a,3s,1A,2K,1A,2Q,1W,4q,1n,4q,1n,2Q,1n,3t,1n,3t,S,2Q,G,3t,1M,2K,2L,2K,1M,2K,V,3t,L,2Q,1h,2Q,1y,3t,1y,2K,1y,2K,1h,2E,1h,2E,1F,2y,1F,2t,1F,3a,1F,2l,1F,2l,1F]}]},{"1b":37,"C":"香川県","1Z":[{"D":[2i,R,2i,R,2i,1O,2i,1c,2i,1O,3a,1O,3a,1O,3a,1O,3a,1c,3Q,1c,3Q,1c,3Q,E,3Q,P,4g,P,2t,P,2t,1y,2y,P,2y,1y,2E,1h,2E,1h,2E,1h,2E,1h,2E,1F,2y,1F,2t,1F,3a,1F,2l,1F,2g,L,1V,L,1V,L,1v,1w,Z,1w,Z,L,1Q,L,1Q,1F,2c,L,1s,L,1z,L,2a,1w,3c,1w,1A,V,1A,V,1A,V,1A,V,1W,1w,1n,1w,1W,L,1W,1F,1A,1y,1W,E,1n,1c,1W,1c,1A,E,3c,E,2a,E,1z,1c,1s,1O,2c,R,2c,R,1Q,1O,1Q,R,1Q,R,Z,1R,1I,R,1V,1O,1V,1O,2g,1O,2g,R,2l,R,2l,R,2i,R,2i,R]},{"C":"小豆島","D":[4g,U,2y,U,2y,U,2y,U,2t,1R,4g,1R,4g,1d,3Q,1R,3a,1R,3Q,1R,3Q,1d,2i,1d,2i,1d,2i,1o,2i,U,3a,U,4g,U,4g,U]},{"C":"豊島","D":[2g,1d,1V,1o,2g,1o,2l,1d,2g,1d,2g,1d]}]},{"1b":38,"C":"愛媛県","1Z":[{"D":[1c,P,P,1w,1h,1M,L,V,1w,V,V,V,V,1w,2L,V,K,V,S,V,1n,1w,1n,1w,1W,1w,1A,V,1A,V,1A,V,1A,1M,1A,2L,1A,2L,1A,I,1W,K,1n,I,S,I,G,I,K,G,I,G,2L,K,1M,K,1w,K,1w,K,L,G,1F,G,1F,G,1h,G,1h,S,1y,1n,1y,1W,E,1A,E,1A,E,3c,E,3c,E,2a,E,2a,1c,1z,1O,1s,1d,1s,1o,1s,1o,1Q,1d,1v,1o,1I,2f,1V,2f,2g,1j,2g,1G,2i,W,2l,W,2i,W,3Q,W,2t,W,2y,W,2y,W,2E,W,2E,Q,2E,3f,3i,3f,2E,2J,2E,2J,2E,2J,2E,1f,2y,1f,2E,1f,3i,M,2E,M,2y,M,2y,M,2t,1f,2t,1f,2t,1f,2t,1f,4g,M,3Q,M,3Q,T,3Q,T,4g,1t,4g,1t,3Q,T,3Q,M,3a,M,3Q,M,2i,1f,2i,M,2l,M,2g,T,2g,T,2g,M,1V,1f,2g,3f,1V,2J,1V,1f,1I,1f,1v,2J,1v,1f,Z,T,Z,T,Z,M,1Q,M,1Q,M,2c,M,2c,M,1s,M,1z,1f,1z,M,1z,T,2a,1t,1z,1t,2a,1B,1s,N,1s,1P,2c,1P,2c,1P,2c,1P,1s,1i,2c,2k,2c,1i,1s,N,1z,1B,1z,1x,2a,1U,2a,T,2a,1f,3c,Q,1n,2b,S,1j,K,2f,1M,2f,V,U,V,U,V,1o,L,R,1h,1O,1h,1O,1y,1c,P,1c,P]},{"C":"大三島","D":[P,R,1y,R,P,1c,1c,E,1c,1c,E,1c,E,1O,E,R,P,R,P,R]},{"C":"伯方島","D":[1y,1c,1y,1c,1h,1c,1h,E,1h,E,1h,E,1h,E,1h,E,1y,1c,1y,1c]},{"C":"中島","D":[1j,1F,1j,L,1j,L,2b,L,2b,L,1j,1F,1j,1F,1j,1F]},{"C":"大島","D":[1h,E,1h,P,P,1y,P,1y,P,P,1y,E,1h,E,1h,E,1h,E]}]},{"1b":39,"C":"高知県","1Z":[{"D":[1Q,S,Z,S,1v,S,1v,3c,1I,3c,1V,2a,2g,1z,1V,1s,2g,2c,2i,1Q,3a,1Q,2i,Z,2g,2l,1I,3a,1I,2i,1I,2i,1v,2i,1v,2l,1v,2g,Z,1V,Z,1V,Z,1I,1s,1Q,2a,2c,1A,2c,S,2c,G,2c,K,1Q,I,1Q,2L,1Q,2L,Z,1M,1v,V,1v,V,1v,1w,1v,L,1I,L,1v,1F,1I,1h,1I,1F,1V,1h,2l,1h,2i,1y,2i,1y,3a,1y,3Q,P,3a,E,4g,E,4g,1c,2t,1c,2y,1O,2y,1O,2t,R,2y,1R,2E,1R,3i,1R,2K,1d,2K,1d,3t,1d,2Q,1R,4q,1d,5l,1o,5l,1o,4q,1o,4q,U,2Q,2b,4q,W,2Q,Q,2Q,Q,2Q,Q,4q,3f,2Q,3f,2Q,3f,3t,Q,3t,Q,3s,1G,3i,W,3i,W,3i,W,2E,W,2E,W,2y,W,2y,W,2t,W,3Q,W,2i,W,2l,1G,2i,1j,2g,2f,2g,2f,1V,1o,1I,1d,1v,1o,1Q,1o,1s,1d,1s,1O,1s,1c,1z,E,2a,E,2a,E,3c,E,3c,E,1A,E,1A,1y,1W,1y,1n,1h,S,1h,G,1F,G,1F,G,L,G,1w,K,1w,K,1M,K,2L,K,I,G,K,G,G,I,S,I,1n,I,1W,K,2a,G,1z,G,1s,G,1s,S,2c,1n,1Q,S,1Q,S]}]},{"1b":40,"C":"福岡県","1Z":[{"D":[2s,E,2s,P,2s,P,2O,1y,2O,1h,2s,1M,2s,2L,2D,I,2D,K,2D,K,2D,K,2D,G,2D,G,2D,S,3m,S,2O,S,1p,S,2H,1n,1a,1n,1a,1W,1a,1A,1J,3c,1J,2a,1J,1z,1u,1z,1u,1z,1u,2c,1J,2c,1u,Z,1u,1v,1u,1v,1u,1v,3x,Z,4J,1Q,4r,Z,4u,Z,2x,Z,2j,1v,1e,1I,1e,1I,1N,1I,1N,1I,2e,1I,2e,Z,2e,1Q,1K,2c,1K,1s,1K,1s,1K,1s,1K,1z,2e,1z,1N,2a,1e,2a,1e,2a,1e,3c,2x,1A,2x,1A,4u,1W,2x,S,2j,S,1e,1n,1e,1n,1e,S,2e,G,3k,I,2m,I,2n,I,2X,I,2X,I,5a,2L,2n,2L,2m,1M,2m,1M,2m,V,2n,V,2n,V,2m,V,3k,1w,3k,1w,1C,1w,1C,L,1C,L,1K,1w,1K,V,1K,V,2e,1M,1N,1M,2j,V,2j,V,2j,1w,2j,L,1e,L,1e,L,2j,L,2x,1F,4u,1h,2x,1y,4u,1y,4u,1y,4u,P,4r,P,4J,E,4J,E,5V,E,4S,E,1u,1c,1u,1c,1u,1c,1J,1c,1a,E,2H,E,1p,E,1p,E,1p,P,4n,P,3q,P,3q,E,2s,E,2s,E]}]},{"1b":41,"C":"佐賀県","1Z":[{"D":[1e,1n,2j,S,2x,S,4u,1W,2x,1A,2x,1A,1e,3c,1e,2a,1e,2a,1N,2a,2e,1z,1K,1z,1K,1s,1K,1s,1K,1s,1K,2c,3k,1s,2m,1z,2n,1s,5a,2c,5a,1Q,2n,1v,2n,1I,2n,1I,2n,1V,2X,1I,2X,1I,3Z,1v,3A,Z,3B,1Q,2q,2c,2q,1s,2q,1s,2q,1z,2P,2a,2h,3c,2h,1W,2h,1n,2h,S,2h,S,3o,S,3o,S,3o,S,3o,1n,2P,1n,2P,S,2P,G,2P,K,2P,K,2P,I,3o,2L,2P,2L,2P,I,2q,2L,2q,1M,2q,V,2q,V,2q,1w,2q,V,3B,V,3Z,1M,3A,I,3A,2L,3A,I,2X,I,2X,I,2X,I,2n,I,2m,I,3k,I,2e,G,1e,S,1e,1n,1e,1n,1e,1n]}]},{"1b":42,"C":"長崎県","1Z":[{"D":[2n,1V,2X,2g,3Z,2g,2X,2l,2X,2i,5a,2l,3k,2l,1C,3a,1C,2t,3k,2y,2n,2E,5a,2E,2X,3i,2X,3i,3Z,3i,3Z,3i,3Z,2E,3A,2y,3Z,2t,2X,4g,2X,3Q,2X,3Q,3Z,3a,3A,3a,2P,3a,3o,4g,4P,2t,3n,2E,4z,2E,4z,2E,4z,2y,3n,2t,3n,3Q,4P,3Q,4s,3a,4s,3a,4s,2i,3n,2l,3n,2l,3n,2l,3n,2l,3n,2i,4l,1v,4l,1v,4l,Z,4l,1Q,4z,1z,3n,1z,3n,1s,4s,2c,4s,2c,4s,2c,4s,1Q,4s,1Q,4P,Z,4P,1v,4s,1V,2h,2g,2h,2g,2h,1V,3o,2g,2q,2l,2P,1I,2P,1v,2P,1Q,3o,2c,3o,2c,2h,1Q,4P,2c,4P,1s,4P,2c,4s,1z,4s,1z,4s,2a,3n,1z,4z,1z,4z,1z,4z,2a,3n,2a,4z,3c,4z,3c,4z,3c,4l,1A,4l,1n,4l,S,4l,G,4l,G,4l,K,4l,G,5C,G,5C,S,6w,S,6w,1n,5k,1W,6s,1A,6q,1A,5i,1W,6q,1W,6q,1W,6q,1W,6q,1n,6s,1n,6s,1n,6s,S,5k,S,5k,G,5k,K,6w,K,4l,I,6w,I,5C,I,4l,I,4l,I,4z,K,3n,K,4s,K,4s,I,4s,K,4s,G,4P,G,2h,K,3o,G,3o,S,3o,S,2h,S,2h,S,2h,1n,2h,1W,2h,3c,2P,2a,2q,1z,2q,1s,2q,1s,2q,2c,3B,1Q,3A,Z,3Z,1v,2X,1I,2X,1I,2n,1V,2n,1V,2n,1V]},{"C":"五島列島","8u":[{"C":"的山大島","D":[5O,K,6x,G,5O,G,3j,K,5O,K,5O,K,5O,K]},{"C":"対馬","D":[4P,1l,2h,1l,2h,2k,2h,1i,2h,1P,4P,N,3n,1x,3n,1x,3n,1U,3n,1t,4z,1t,3n,T,3n,M,4z,M,4l,1f,5C,1f,5C,3f,6w,Q,5k,1G,6s,1G,6s,1G,6s,W,6q,W,6q,1G,6q,W,6q,Q,6s,1f,6s,M,5k,T,5k,T,6w,M,6w,M,5C,T,5C,T,6w,1t,6w,1t,5C,1U,5C,1x,5C,1B,4l,N,4z,1P,4z,1P,4l,1P,4l,1i,3n,1l,4P,1l,4P,1l]},{"C":"福江島","D":[6Q,1v,6Q,1I,6H,1V,6H,1V,6Q,1V,6H,2l,6H,2i,6Q,2i,4i,2l,6a,2i,6a,3a,6a,3a,5c,3a,5c,2i,6n,2i,6O,2i,5A,2l,5A,2g,6O,2l,6O,2l,6n,2g,6O,1V,6n,1V,6n,1I,6n,1v,5c,Z,5c,1v,6a,1I,6a,1I,4i,1v,6Q,1v,6Q,1v,6Q,1v]},{"C":"中通島","D":[4H,S,4H,S,3j,S,5O,S,5O,1n,5O,1n,5O,1W,3j,1W,3j,1A,3j,2a,3j,2a,4H,1z,4H,1z,4H,1s,3j,1z,5O,1s,5O,2c,4H,2c,4H,1Q,4H,Z,4H,Z,6z,1v,6z,1v,6z,1v,6f,1I,6f,1v,6f,Z,6k,Z,6k,Z,6G,Z,6G,Z,6G,1v,7k,1I,7k,1v,7k,1v,7k,Z,6S,Z,6S,1v,6H,1I,6H,1v,6H,Z,6H,Z,6S,Z,6S,1Q,6S,1Q,7k,1Q,6G,1Q,6G,1Q,6G,1Q,6G,1Q,6k,1Q,6k,1Q,6k,1Q,6G,2c,6k,2c,6k,2c,6f,1s,6f,1s,6z,1s,6z,1z,6z,1z,6z,2a,4H,2a,4H,2a,4H,3c,4H,3c,3j,1W,3j,1W,3j,1n,4H,S,4H,S]},{"C":"壱岐島","D":[2P,1O,2P,1O,2q,1O,2q,1c,2q,E,2q,E,2P,E,2q,E,2q,P,2P,P,3o,1y,2h,P,4P,P,4P,E,2h,E,2h,E,2h,1c,2h,1O,2h,1c,2h,1O,2h,R,3o,R,2P,1O,2P,1O]}]}]},{"1b":43,"C":"熊本県","1Z":[{"D":[3q,Z,2s,1I,2s,1V,3m,2g,3m,2l,3m,2i,3m,3Q,2D,2t,2D,2y,2D,2y,3m,2y,2s,2E,2O,3i,3q,2K,4n,2K,4n,2K,1p,3t,1p,2Q,2H,2Q,1a,2Q,1J,5l,1J,6V,1a,6o,1a,6o,1a,5S,1a,5n,2H,6u,1J,3u,1J,2R,1a,5t,1J,5t,1u,5t,4S,2Y,3x,2Y,4J,2Y,4r,2Y,4u,2Y,2x,2Y,2j,2Y,2j,2Y,2j,2Y,2j,2Y,1e,3V,1N,2R,2e,2R,1K,2R,1C,3V,2m,3V,2n,3V,2n,2R,2n,2R,2n,2R,2n,3u,2n,3u,2n,6u,2m,5n,1C,6o,1K,6R,1N,5l,1N,4q,1N,4q,1N,2Q,1N,2Q,1N,2Q,1N,3t,2x,3s,1e,3s,2e,3s,2e,3s,1K,3i,1K,2K,3k,2K,1C,3s,1K,3i,2e,3i,1e,2E,1e,2y,2j,4g,1e,2i,1N,2l,2e,2g,2e,1I,1N,1I,1N,1I,1e,1I,1e,1I,2j,1v,2x,Z,4u,Z,4r,Z,4J,1Q,3x,Z,1u,1v,1u,1v,1J,1I,1a,1V,2H,2g,1p,1V,1p,1I,1p,1I,2H,Z,1p,Z,3q,Z,3q,Z]},{"C":"天草諸島","D":[2q,3s,2q,3s,2q,2K,3B,3s,3A,3s,3Z,3s,3Z,2Q,5a,2Q,2n,3t,2m,3t,1C,3t,1C,3t,1K,3t,1C,2Q,1C,5l,2m,6R,2m,6R,2X,5l,2X,5l,2X,4q,3Z,4q,3Z,5l,3Z,5l,3Z,6R,3A,6V,3B,6V,3B,6o,2q,6o,2q,5S,2q,5S,2P,5n,3o,5n,3o,6u,3o,6u,2h,6u,2h,6u,2h,6u,2h,6u,2h,6u,2h,5n,2h,5n,2h,5S,2h,5S,2h,5S,4P,6o,3o,6V,2h,5l,2P,2Q,2P,2K,2P,3s,2q,3s,2q,3s]}]},{"1b":44,"C":"大分県","1Z":[{"D":[1X,I,H,I,2u,G,4m,G,5d,G,5L,K,4p,K,4p,I,2D,I,2D,I,2D,K,2D,K,2D,K,2D,G,2D,G,2D,S,3m,S,2O,S,1p,S,2H,1n,1a,1n,1a,1W,1a,1A,1J,3c,1J,2a,1J,1z,1u,1z,1u,1z,1u,2c,1J,2c,1u,Z,1u,1v,1u,1v,1u,1v,1u,1v,1J,1I,1a,1V,2H,2g,1p,1V,1p,1I,1p,1I,2H,Z,1p,Z,3q,Z,2s,1I,2s,1V,3m,2g,3m,2l,3m,2i,3m,3Q,2D,2t,2D,2y,2D,2y,2D,2y,4p,2y,5L,2E,4V,2y,5d,2E,4m,3i,2u,3i,H,3s,1X,3s,F,3i,2w,2E,2I,3i,O,3s,O,2K,O,3t,O,3t,O,3t,O,2K,1S,2K,O,2K,1S,2K,1m,3s,1m,3s,1q,3s,1D,3i,1q,2E,1D,2y,1H,2t,2k,2t,1l,2t,1H,2t,1H,2t,1D,4g,1D,2t,1q,4g,1m,4g,1m,3Q,1q,3a,1D,3a,1H,2i,1H,2i,1H,2l,1H,2l,1D,2i,1D,2i,1q,2l,1q,2i,1S,2l,1q,2g,1m,2g,1S,1V,1S,1I,1m,1v,1q,Z,1S,Z,O,Z,2I,Z,2w,1Q,F,1Q,1r,1Q,1r,1z,1r,1z,H,1z,1X,1z,F,1z,F,1z,F,2a,2w,2a,2I,2a,2I,2a,O,1A,O,1n,O,K,2w,I,F,I,1X,I,1X,I]}]},{"1b":45,"C":"宮崎県","1Z":[{"D":[O,3s,O,2K,O,3t,O,3t,O,2Q,2I,2Q,2I,2Q,2w,4q,F,5l,1X,6R,H,6R,1X,6V,H,6o,H,5S,1r,6o,1r,5S,1r,5S,1r,5n,1r,5n,2u,5n,2u,6u,2u,3u,4m,3u,5d,3V,4V,2Y,4p,4U,3m,4E,3m,3H,3m,3H,2D,5D,3m,5F,3m,4Z,2O,3h,2O,3l,2O,3l,2O,3l,2O,3l,3q,5p,3q,2p,3q,2p,4n,2A,4n,2A,1p,4y,4n,5s,1p,5s,2H,4y,2H,4y,2H,4y,1a,2A,1a,2p,1J,2p,1u,5j,1u,5j,1u,5j,1u,5p,1u,5p,1J,5p,1J,4Z,1J,3K,1u,3K,1u,3K,4S,5F,3x,5F,3x,5D,3x,5D,3x,3S,3x,3H,5V,3H,5V,4E,4J,2M,4r,5r,4r,4e,4r,4U,2x,5z,2x,4v,2j,4A,2j,4A,2j,4A,2j,2Y,2j,2Y,2j,2Y,2j,2Y,2j,2Y,2x,2Y,4u,2Y,4r,2Y,4J,2Y,3x,2Y,4S,2Y,1u,5t,1J,5t,1a,5t,1J,2R,1J,3u,2H,6u,1a,5n,1a,5S,1a,6o,1a,6o,1J,6V,1J,5l,1J,4q,1a,2Q,2H,2Q,1p,2Q,1p,3t,4n,2K,4n,2K,3q,2K,2O,3i,2s,2E,3m,2y,2D,2y,2D,2y,4p,2y,5L,2E,4V,2y,5d,2E,4m,3i,2u,3i,H,3s,1X,3s,F,3i,2w,2E,2I,3i,O,3s,O,3s]}]},{"1b":46,"C":"鹿児島県","1Z":[{"D":[2j,4A,2j,4A,2j,4A,2j,2Y,2j,2Y,1e,3V,1N,2R,2e,2R,1K,2R,1C,3V,2m,3V,2n,3V,2n,2R,2n,2R,2n,2R,2n,3u,5a,2R,5a,2R,2X,2R,2X,3V,3Z,2R,3B,2R,3B,3u,3B,3u,3A,3u,3B,6u,3A,5S,3A,6o,3B,5S,3B,5S,3B,5S,3B,5n,2q,5n,2q,5n,2P,5n,2P,6u,2P,2R,2q,2R,2q,2R,3B,5t,3B,2Y,2q,4A,3B,4A,3B,4v,2q,4U,2P,2G,2P,4e,2q,5r,2q,5r,3A,3S,3B,4Z,3o,3l,3o,3l,3o,3h,2h,3h,4s,3h,3o,5j,2h,5j,3o,2p,2h,2p,3o,2A,3o,4y,2P,4y,3B,4y,3Z,5s,2X,4G,2X,3P,5a,3P,2n,3P,2n,8a,2m,8a,2m,3P,2m,3P,2m,3P,3k,4G,1C,5s,3k,4y,2m,2A,2n,3h,2m,4Z,3k,5F,1C,5D,1K,3S,1C,3H,1K,3H,2e,3H,1e,3H,2j,3S,2j,5F,1e,3K,1N,3K,1N,3K,2e,5D,1K,5D,1C,5F,1C,3K,1K,4Z,2e,4Z,2e,3h,2e,3l,2e,5p,1N,2A,1N,5s,2e,3P,1K,6T,1C,5y,3k,5y,3k,4N,3k,4N,3k,4N,2m,4K,1C,4K,1K,4N,2e,4N,1N,4N,2j,4N,2x,5y,4r,6T,4r,8a,4J,8a,5V,3P,3x,3P,4S,4G,3x,4G,3x,4G,3x,5s,4J,4y,5V,2p,4S,5j,1u,5j,1u,5j,1u,5p,1J,5p,1J,4Z,1J,3K,1u,3K,1u,3K,4S,5F,3x,5F,3x,5D,3x,3S,3x,3H,5V,3H,5V,4E,4J,2M,4r,5r,4r,4e,4r,4U,2x,5z,2x,4v,2j,4A,2j,4A]},{"C":"種子島","D":[1K,5H,1K,7A,1C,5H,1C,8h,1K,4a,2e,5Z,1e,5u,2j,3g,2j,3g,2x,4D,2x,4D,4u,4R,4r,4R,4r,3g,4u,5u,4u,5T,2x,5X,2j,5Z,1e,4a,1e,8h,1e,5H,1N,5H,1K,5H,1K,5H]},{"C":"屋久島","D":[2X,7A,3A,6m,2P,6m,2h,5H,2h,4a,3o,4a,2P,4a,2q,5Z,3A,4a,2X,7c,2X,7A,2X,7A]},{"C":"下瓶島","D":[5k,4e,6s,4e,6s,5r,6q,2M,5U,5r,5i,5r,5i,5r,6s,2G,5k,2G,5k,4U,5k,4U,6w,4U,6w,2G,5k,2G,5k,4e,5k,4e,5k,4e]},{"C":"上瓶島","D":[5C,4v,4l,6B,4z,5z,4z,6B,4z,5z,4z,5z,4l,4U,5C,5z,5C,6B,5C,6B,5C,4v,5C,4v]},{"C":"奄美諸島","8u":[{"C":"徳之島","D":[6W,3T,6W,4w,6W,3G,6W,3b,7x,4k,7B,3r,7h,4k,8W,2o,7h,2o,7h,3G,7h,5x,7h,3T,7h,3I,7B,3I,6W,3T,6W,3T,6W,3T]},{"C":"与路島","D":[5I,2S,3U,2S,3U,2B,5I,2B,5I,2S,5I,2S]},{"C":"請島","D":[4Q,3E,4B,2S,4B,2B,4Q,2B,4Q,2S,4x,2S,4Q,3E,4Q,3E]},{"C":"与論島","D":[7U,4t,7U,5v,6U,5v,6U,4t,7U,4t,7U,4t]},{"C":"沖永良部島","D":[83,4d,83,4d,8Y,3p,8q,4d,9E,3p,9N,3y,aF,1k,9C,3p,83,4d,83,4d]},{"C":"加計呂麻島","D":[4Q,2r,4Q,2r,4x,2r,4Q,2r,4Q,2r,4x,1T,4x,2N,7R,1Y,7R,2B,6b,2B,6b,2B,4x,2B,4x,2B,4x,2B,4Q,1Y,4B,2B,4B,1Y,4Q,2N,4B,1T,4B,2r,4Q,2r,4Q,2r]},{"C":"奄美大島","D":[4Q,2C,6b,2C,4x,4M,6b,2W,7R,2W,7b,3N,8j,3N,7i,3N,7Z,3N,7Z,3N,9h,3N,7C,3N,5A,2T,6O,2T,6n,4h,5c,4h,6n,2T,6n,2T,5c,2T,6n,3N,5c,3N,5c,2T,5c,4h,6a,4o,4i,4o,4i,4h,4i,3N,6a,2W,6n,2W,6O,4M,5A,2C,9h,2C,7Z,2C,7Z,3e,7Z,2r,7Z,1T,7i,1T,8j,2N,7b,2N,7b,2N,7b,1Y,7b,2B,7R,1Y,6b,1T,4x,2r,5I,2C,4Q,2C,4Q,2C]},{"C":"喜界島","D":[6k,1T,6G,1T,7k,2r,6k,3e,6f,3e,6z,3e,6f,2r,6f,2r,6k,1T,6k,1T]}]}]},{"1b":47,"C":"沖縄県","1Z":[{"C":"沖縄本島","D":[4Y,4L,3F,5R,9c,4L,7w,3J,aM,3R,8P,6d,8K,6Y,8s,6d,8s,3R,8s,5R,8K,5R,8K,5R,8P,4L,bT,7v,7w,7v,8C,7L,8C,6K,6v,7a,4Y,6K,4Y,6K,3F,7a,3v,7a,3v,6C,6c,6C,8E,6C,7y,6C,7z,6C,7z,5w,7z,6L,7y,7P,7y,7P,7y,9d,7z,7P,7z,6L,a4,6L,a4,7P,a3,9d,b7,aa,b7,bh,a3,9e,8A,9Y,8k,9Y,8k,9V,8k,9e,8k,bh,8k,aa,8k,aa,ay,9d,ay,9d,8A,7P,b5,6F,b5,7a,a3,6C,a4,7a,7z,6K,7y,6K,8E,6K,8E,6K,6c,7L,3v,7L,3v,7v,3v,7v,6c,4L,8E,5R,8E,3J,6c,3J,6c,3R,3v,3R,4Y,5R,4Y,4L,4Y,4L]},{"C":"多良間島","D":[49,7g,51,7g,52,7X,50,8x,49,7g,49,7g]},{"C":"宮古島","D":[66,aq,69,9z,70,7X,72,8v,67,a9,66,7X,65,7g,64,9z,66,aq,66,aq]},{"C":"伊是名島","D":[4Y,5v,4Y,5v,4Y,5m,3F,5v,4Y,5v,4Y,5v]},{"C":"伊平屋島","D":[6v,6j,8C,5N,6v,4F,6v,4F,4Y,4t,4Y,4F,6v,6j,6v,6j]},{"C":"八重山諸島","8u":[{"C":"与那国島","D":[1,8J,4,8J,5,9Z,3,9Z,1,8J,1,8J]},{"C":"波照間島","D":[19,8o,22,8o,22,aZ,20,el,19,8o,19,8o]},{"C":"西表島","D":[22,8x,29,a9,27,9L,25,9L,22,8v,22,8x,22,8x]},{"C":"石垣島","D":[42,7g,40,a9,37,9L,34,9L,31,8x,35,en,36,8x,42,7g,42,7g]}]}]}];1g A={1:"eo",2:"ep",3:"eq",4:"er",5:"es",6:"et",7:"eu",8:"ev",9:"ew",10:"ex",11:"ey",12:"ez",13:"eA",14:"eB",15:"eC",16:"eD",17:"eE",18:"eF",19:"eG",20:"eH",21:"eI",22:"eJ",23:"eK",24:"eL",25:"eM",26:"eN",27:"eO",28:"eP",29:"eQ",30:"eR",31:"eS",32:"eT",33:"eU",34:"eV",35:"eW",36:"eX",37:"eY",38:"eZ",39:"f0",40:"f1",41:"f2",42:"f3",43:"f4",44:"f5",45:"f6",46:"f7",47:"f8"}})(dh);',62,940,'|||||||||||||||||||||||||||||||||||||this|name|coords|318|282|330|280|328|options|329|323|301|295|285|319|305|315|331|300|311|325|306|||341|||||||||||264|code|317|313|253|302|var|321|293|309|503|291|287|332|312|266|288|279|338|299|262|342|324|297|320|337|334|296|249|289|if|322|307|290|343|263|250|function|326|252|316|294|340|314|286|481|298|344|333|281|483|path|||||||||||336|308|339||251|310|345|237|347|254|292|346|247|246|492|392|240|480|270|351|278|504|283|255|352|413|393|484|478|272|353|width|377|265|284|303|356|327|380|482|269|239|358|368|485|474|height|prototype|476|244|371|499|||||||||||348|493|335|506|479|304|412|388|354|220|248|389|271|234|238|501|268|495|355|357|367|151|element|260|502|505|242|241|408|null|486|152|491|382|487|519|386|454|462|475|498|397|349|518|383|488|192|369|429|return|base|243|||||||||||419|469|430|500|378|444|350|473|210|224|494|232|277|267|472|273|359|257|235|510|256|373|489|196|394|233|372|194|428|411|381|509|396|219|451|258|402|521|477|401|496|236|195|409|261|465|376|275|463|case|153|387|||||||||||245|456|208|276|457|471|426|434|226|391|229|360|512|365|435|390|431|379|395|370|414|511|527|490|400|375|205|466|231|384|517|385|433|422|193|break|416|274|in|507|221|447|448|520|364|415|225|259|188|417|455|418|||||||||||209|197|150|516|497|217|461|432|427|508|216|449|425|207|363|190|227|else|228|452|366|154|230|222|453|218|443|374|526|data|464|528|215|212|color|191|524|529|442|445|206|450|211|361|213|399|167|362|187|189|515|467|||||||||||525|199|421|424|514|length|556|184|201|223|214|468|459|460|pointer|404|changedTouches|forEach|405|originalEvent|100|522|157|186|148|147|423|185|204|586|NanseiIslands|617|584|406|458|114|prefectures|523|403|581|hoverColor|530|Array|198|103|102|168|135|getContext|557|410|202||||172|||||||398|437|fillStyle|593|MSPointer|Pointer|124|420|166|200|140|Touch|587|441|567|470|177|size|162|undefined|subpath|561|446|558|105|for|142|407|156|116|149|605|616|138|618|549|161|130|on|area|164|160|585|440|599|597|181|render|183|indexOf|175|594||||||||||||180|155|531|534|movesIslands|436|203|isArea|596|fontColor|hovered|620|619|132|598|165|onSelect|style|selection|borderLineWidth|106|false|areas|borderLineColor|553|122|115|171|typeof|176|document|179|588|649|isNanseiIslands|lineWidth|563|107|174|104|170|169|true|showsPrefectureName|showsAreaName|131|535|129|font|536|551|filter|565|579|145|146|439|128|125|601|560|532|setData|getEnglishName|513|182|brighten|631|english|622|hovering|621|606|602|setProperties|drawPrefecture|beginPath|555|canvas|prefecture|642|a0a0a0|121|101|lineColor|141|stroke|604|113|throw|full|108|173|drawCoords|163|fontSize|628|629|Math|159|fontShadowColor|onHover|new|632|call|replace|134|643|findAreaBelongingToByCode|findPrefectureByCode|136|566|570|isHovering|offsetTop|pageY|offsetLeft|pageX|143|645|144|590|getCenterOfPrefecture|drawText|lineTo|getShortName|getName|595|initializeData|left|533|top|552|568|608|fitSize|607|571|closePath|591|613|while|moveTo|614|css|mousemove|touch|none|589|mousedown|583|582|580|647|578|preventDefault|stopPropagation|setTimeout|navigator|window|off|644|641|639|638|map|635|610|158|546|544|addEvent|540|615|parseInt|539|630|substr|switch|Arial|133|625|default|createElement|areaNameType|139|623|prefectureNameType|apply|fill|137|drawsBoxLine|117|renderAreaMap|123|renderPrefectureMap|626|backgroundColor|119|px|111|No|110|drawIslandsLine|109|strokeStyle|drawName|action|CANVAS|support|not|may|651|browser|Your|use|624|542|mouseleave|touchleave|MSPointerLeave|438|pointerleave|633|kanji|mouseenter|touchenter|MSPointerEnter|pointerenter|mouseup|touchend|romaji|MSPointerUp|634|pointerup|short|restore|touchmove|MSPointerMove|pointermove|fillText|00|shadowBlur|toString|touchstart|shadowColor|MSPointerDown|pointerdown|max|min|round|middle|textBaseline|catch|jQuery|textAlign|576|htmlfile|ActiveXObject|try|650|msPointerEnabled|gi|pointerEnabled|572|564|ontouchstart|String|Japan|areaColor|push|save|cursor|isPointInPath|112|573|575|mouseout|636|defined|is|append|609|550|such|has|603|548|543|600|126|592|541|solid|ms|borderStyle|hasData|borderColor|627|englishName|borderWidth|ShortName|fullName|background|ffffff|537|transparent|clearRect|554|constructor|create|type|extend|Object|hasOwnProperty|okinawaCliclableZone|japanMap|fn|strict|arguments|569|547|559|Hokkaido|Aomori|Iwate|Miyagi|Akita|Yamagata|Fukushima|Ibaraki|Tochigi|Gunma|Saitama|Chiba|Tokyo|Kanagawa|Niigata|Toyama|Ishikawa|Fukui|Yamanashi|Nagano|Gifu|Shizuoka|Aichi|Mie|Shiga|Kyoto|Osaka|Hyogo|Nara|Wakayama|Tottori|Shimane|Okayama|Hiroshima|Yamaguchi|Tokushima|Kagawa|Ehime|Kochi|Fukuoka|Saga|Nagasaki|Kumamoto|Oita|Miyazaki|Kagoshima|Okinawa|center'.split('|'),0,{}))
;
/*
* rwdImageMaps jQuery plugin v1.6
*
* Allows image maps to be used in a responsive design by recalculating the area coordinates to match the actual image size on load and window.resize
*
* Copyright (c) 2016 Matt Stow
* https://github.com/stowball/jQuery-rwdImageMaps
* http://mattstow.com
* Licensed under the MIT license
*/

;(function(a){a.fn.rwdImageMaps=function(){var c=this;var b=function(){c.each(function(){if(typeof(a(this).attr("usemap"))=="undefined"){return}var e=this,d=a(e);a("<img />").on('load',function(){var g="width",m="height",n=d.attr(g),j=d.attr(m);if(!n||!j){var o=new Image();o.src=d.attr("src");if(!n){n=o.width}if(!j){j=o.height}}var f=d.width()/100,k=d.height()/100,i=d.attr("usemap").replace("#",""),l="coords";a('map[name="'+i+'"]').find("area").each(function(){var r=a(this);if(!r.data(l)){r.data(l,r.attr(l))}var q=r.data(l).split(","),p=new Array(q.length);for(var h=0;h<p.length;++h){if(h%2===0){p[h]=parseInt(((q[h]/n)*100)*f)}else{p[h]=parseInt(((q[h]/j)*100)*k)}}r.attr(l,p.toString())})}).attr("src",d.attr("src"))})};a(window).resize(b).trigger("resize");return this}})(jQuery);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//








    /*var areas = [
                    {code : 1, name: "北海道", color:
                    <% if current_user.user_ken.find_by(ken_id:1) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                    hoverColor: "#b3b2ee", prefectures: [1]},
                    
                    {code : 2, name: "青森",
                    color: 
                    <% if current_user.user_ken.find_by(ken_id:2) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                    hoverColor: "#98b9ff", prefectures: [2]},
                    {code : 3, name: "岩手", color: "white", hoverColor: "#98b9ff", prefectures: [3]},
                    {code : 4, name: "宮城", color: "white", hoverColor: "#98b9ff", prefectures: [4]},
                    {code : 5, name: "秋田", color: "white", hoverColor: "#98b9ff", prefectures: [5]},
                    {code : 6, name: "山形", color: "white", hoverColor: "#98b9ff", prefectures: [6]},
                    {code : 7, name: "福島", color: "white", hoverColor: "#98b9ff", prefectures: [7]},
                    {code : 8, name: "茨城", color: "white", hoverColor: "#b7e5f4", prefectures: [8]},
                    {code : 9, name: "栃木", color: "white", hoverColor: "#b7e5f4", prefectures: [9]},
                    {code : 10, name: "群馬", color: "white", hoverColor: "#b7e5f4", prefectures: [10]},
                    {code : 11, name: "埼玉", color: "white", hoverColor: "#b7e5f4", prefectures: [11]},
                    {code : 12, name: "千葉", color: "white", hoverColor: "#b7e5f4", prefectures: [12]},
                    {code : 13, name: "東京", color: "white", hoverColor: "#b7e5f4", prefectures: [13]},
                    {code : 14, name: "神奈川", color: "white", hoverColor: "#b7e5f4", prefectures: [14]},
                    {code : 15, name: "新潟", color: "white", hoverColor: "#aceebb", prefectures: [15]},
                    {code : 16, name: "富山", color: "white", hoverColor: "#aceebb", prefectures: [16]},
                    {code : 17, name: "石川", color: "white", hoverColor: "#aceebb", prefectures: [17]},
                    {code : 18, name: "福井", color: "white", hoverColor: "#aceebb", prefectures: [18]},
                    {code : 19, name: "山梨", color: "white", hoverColor: "#aceebb", prefectures: [19]},
                    {code : 20, name: "長野", color: "white", hoverColor: "#aceebb", prefectures: [20]},
                    {code : 21, name: "岐阜", color: "white", hoverColor: "#aceebb", prefectures: [21]},
                    {code : 22, name: "静岡", color: "white", hoverColor: "#aceebb", prefectures: [22]},
                    {code : 23, name: "愛知", color: "white", hoverColor: "#aceebb", prefectures: [23]},
                    {code : 24, name: "三重", color: "white", hoverColor: "#fff19c", prefectures: [24]},
                    {code : 25, name: "滋賀", color: "white", hoverColor: "#fff19c", prefectures: [25]},
                    {code : 26, name: "京都", color: "white", hoverColor: "#fff19c", prefectures: [26]},
                    {code : 27, name: "大阪", color: "white", hoverColor: "#fff19c", prefectures: [27]},
                    {code : 28, name: "兵庫", color: "white", hoverColor: "#fff19c", prefectures: [28]},
                    {code : 29, name: "奈良", color: "white", hoverColor: "#fff19c", prefectures: [29]},
                    {code : 30, name: "和歌山", color: "white", hoverColor: "#fff19c", prefectures: [30]},
                    {code : 31, name: "鳥取", color: "white", hoverColor: "#ffe0a3", prefectures: [31]},
                    {code : 32, name: "島根", color: "white", hoverColor: "#ffe0a3", prefectures: [32]},
                    {code : 33, name: "岡山", color: "white", hoverColor: "#ffe0a3", prefectures: [33]},
                    {code : 34, name: "広島", color: "white", hoverColor: "#ffe0a3", prefectures: [34]},
                    {code : 35, name: "山口", color: "white", hoverColor: "#ffe0a3", prefectures: [35]},
                    {code : 36, name: "徳島", color: "white", hoverColor: "#ffbb9c", prefectures: [36]},
                    {code : 37, name: "香川", color: "white", hoverColor: "#ffbb9c", prefectures: [37]},
                    {code : 38, name: "愛媛", color: "white", hoverColor: "#ffbb9c", prefectures: [38]},
                    {code : 39, name: "高知", color: "white", hoverColor: "#ffbb9c", prefectures: [39]},
                    {code : 40, name: "福岡", color: "white", hoverColor: "#ffbdbd", prefectures: [40]},
                    {code : 41, name: "佐賀", color: "white", hoverColor: "#ffbdbd", prefectures: [41]},
                    {code : 42, name: "長崎", color: "white", hoverColor: "#ffbdbd", prefectures: [42]},
                    {code : 43, name: "熊本", color: "white", hoverColor: "#ffbdbd", prefectures: [43]},
                    {code : 44, name: "大分", color: "white", hoverColor: "#ffbdbd", prefectures: [44]},
                    {code : 45, name: "宮崎", color: "white", hoverColor: "#ffbdbd", prefectures: [45]},
                    {code : 46, name: "鹿児島", color: "white", hoverColor: "#ffbdbd", prefectures: [46]},
                    {code : 47, name: "沖縄", color:
                    <% if current_user.user_ken.find_by(ken_id:1) %>
                            "red", 
                    <% else %>
                            "white",
                    <% end %>
                     hoverColor: "#f5c9ff", prefectures: [47]},
                ];
    
    var kens = [ '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '山梨県', '長野県', '富山県', '石川県', '福井県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県' ]; 
    var kencode = 1;
    var areas =[];
    
    kens.forEach(function( value ) 
    {
         areas.push( {code : kencode,
                      name: value, 
                      color:"red",
                      hoverColor: "#b3b2ee", 
                      prefectures: [kencode]});
         kencode++;
    });  
                
   $("#map-container").japanMap({
        width: 730,
        selection: "area",
        areas: areas,
        backgroundColor : "#dcdcdc",
        borderLineColor: "#f2fcff",
        borderLineWidth : 0.25,
        lineColor : "#a0a0a0",
        lineWidth: 1,
        drawsBoxLine: true,
        showsPrefectureName: false,
        prefectureNameType: "short",
        movesIslands : true,
        fontSize : 11,
        fontShadowColor : "#fff",
        onSelect : function(data){
            alert(data.name);
        }
    });
*/


$( document ).on('turbolinks:load', function() {
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
 
      reader.onload = function (e) {
        $('#user_img_prev').attr('src', e.target.result);
      }
      reader.readAsDataURL(input.files[0]);
    }
  }
 
  $("#user_img").change(function(){
    $('#user_img_prev').removeClass('hidden');
    $('.user_present_img').remove();
    readURL(this);
  });
});
