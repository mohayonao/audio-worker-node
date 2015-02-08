"use strict";

var assert = require("power-assert");
var AudioWorkerCode = require("../lib/audio-worker-code");

describe("AudioWorkerCode", function() {
  describe("#tokens", function() {
    it("(src: string): string:[]", function() {
      var tokens = AudioWorkerCode.tokens;

      assert.deepEqual(tokens("this.sampleRate * 0.25"), [
        "this", ".", "sampleRate", " ", "*", " ", "0.25"
      ]);

      assert.deepEqual(tokens("this['sample\\\'Rate'] * 0.25"), [
        "this", "[", "'sample\\\'Rate'", "]", " ", "*", " ", "0.25"
      ]);

      assert.deepEqual(tokens("this/*.sample\n/*Rate*/ * 0.25"), [
        "this", "/*.sample\n/*Rate*/", " ", "*", " ", "0.25"
      ]);

      assert.deepEqual(tokens("this.sampleRate// * 0.25\n\t  * 0.25"), [
        "this", ".", "sampleRate", "// * 0.25", "\n\t  ", "*", " ", "0.25"
      ]);
    });
  });
  describe("#filter", function() {
    it("(src: string): string", function() {
      var filter = AudioWorkerCode.filter;

      assert(filter("  onaudioprocess =") === "  this.onaudioprocess =");
      assert(filter("  invsampleRate = 1 / sampleRate") === "  invsampleRate = 1 / this.sampleRate");
      assert(filter("  self.self.self") === "  this.self.self.self");
      assert(filter("  onmessage =") === "  this.onmessage =");
      assert(filter("  postMessage('postMessage')") === "  this.postMessage('postMessage')");
      assert(filter("  close // close\nclose") === "  this.close // close\nthis.close");
      assert(filter("  importScripts()") === "  this.importScripts()");
    });
  });
  describe("#compile", function() {
    it("(src: string): function", function() {
      var compile = AudioWorkerCode.compile;

      assert(typeof compile("10 + 20") === "function");

      var func = compile("var x = 0.5; sampleRate *= x;");
      var self = { sampleRate: 44100 };

      func.call(self);

      assert(self.sampleRate === 22050);
    });
  });
});
