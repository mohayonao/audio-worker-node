"use strict";

var assert = require("power-assert");
var utils = require("../lib/utils");

describe("utils", function() {
  describe("defaults", function() {
    it("(value: any, defaultValue: any): any", function() {
      assert(utils.defaults(0, 1) === 0);
      assert(utils.defaults(undefined, 1) === 1);
    });
  });
});
