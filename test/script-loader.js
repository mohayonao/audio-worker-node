"use strict";

var assert = require("power-assert");
var ScriptLoader = require("../lib/script-loader");

describe("ScriptLoader", function() {
  describe("load", function() {
    it("(scriptURL: string, callback: function): async void", function(done) {
      ScriptLoader.load("./test_worker.js", function(code) {
        assert(typeof code === "string");
        assert(code.indexOf("onaudioprocess") !== -1);
        done();
      });
    });
  });
});
