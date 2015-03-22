"use strict";

var ScriptLoader = {};

ScriptLoader.load = function(scriptURL, callback) {
  var xhr = new global.XMLHttpRequest();
  xhr.open("GET", scriptURL);
  xhr.onload = function() {
    if (xhr.status === 200) {
      callback(xhr.response);
    }
  };
  xhr.send();
};

module.exports = ScriptLoader;
