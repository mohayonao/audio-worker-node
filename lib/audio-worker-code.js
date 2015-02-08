"use strict";

var WORKER_ATTRS = [
  "onaudioprocess",
  "sampleRate",
  "self",
  "onmessage",
  "postMessage",
  "close",
  "importScripts",
];

var AudioWorkerCode = {};

AudioWorkerCode.tokens = function(src) {
  var pos = 0;
  var tokens = [];

  function eat(re) {
    while (pos < src.length) {
      var ch = src.charAt(pos);
      if (!re.test(ch)) {
        break;
      }
      pos += 1;
    }
  }

  function eatString(quote) {
    while (pos < src.length) {
      var ch = src.charAt(pos++);
      if (ch === quote) {
        return;
      }
      if (ch === "\\") {
        pos += 1;
      }
    }
    // istanbul ignore next
    throw new SyntaxError("Unexpected token ILLEGAL");
  }

  function eatMultiLineComment() {
    pos += 1;
    while (pos < src.length) {
      var ch = src.charAt(pos++);
      if (ch === "*" && src.charAt(pos) === "/") {
        pos += 1;
        return;
      }
    }
    // istanbul ignore next
    throw new SyntaxError("Unexpected token ILLEGAL");
  }

  while (pos < src.length) {
    var begin = pos;
    var ch = src.charAt(pos++);

    if (/\s/.test(ch)) {
      eat(/\s/);
    } else if (/[a-zA-Z_$]/.test(ch)) {
      eat(/[\w$]/);
    } else if (/\d/.test(ch)) {
      eat(/[.\d]/);
    } else if (/['"]/.test(ch)) {
      eatString(ch);
    } else if (ch === "/") {
      ch = src.charAt(pos);
      if (ch === "/") {
        eat(/[^\n]/);
      } else if (ch === "*") {
        eatMultiLineComment();
      }
    }

    tokens.push(src.slice(begin, pos));
  }

  return tokens;
};

AudioWorkerCode.filter = function(src) {
  var tokens = AudioWorkerCode.tokens(src);

  function prevToken(index) {
    while (index--) {
      if (/[\S/]/.test(tokens[index].charAt(0))) {
        return tokens[index];
      }
    }
    return "";
  }

  WORKER_ATTRS.forEach(function(attr) {
    var pos = 0;
    var index;

    while ((index = tokens.indexOf(attr, pos)) !== -1) {
      if (prevToken(index) !== ".") {
        tokens[index] = "this." + tokens[index];
      }
      pos = index + 1;
    }
  });

  return tokens.join("");
};

AudioWorkerCode.compile = function(src) {
  var code = [
    "(function() { 'use strict';",
    AudioWorkerCode.filter(src),
    "})"
  ].join("\n");
  return eval.call(null, code);
};

module.exports = AudioWorkerCode;
