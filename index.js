var _dc1 = null;

function getDC1(audioContext) {
  if (_dc1 === null) {
    _dc1 = audioContext.createBuffer(1, 8, audioContext.sampleRate);
    _dc1.getChannelData(0).set([ 1, 1, 1, 1, 1, 1, 1, 1 ]);
  }
  return _dc1;
}

function defaults(value, defaultValue) {
  return typeof value !== "undefined" ? value : defaultValue;
}

function AudioWorkerNode(audioContext, audioprocess, opts) {
  opts = opts || {};

  var numberOfInputs = +defaults(opts.numberOfInputs, 1)|0;
  var numberOfOutputs = +defaults(opts.numberOfOutputs, 1)|0;
  var bufferLength = +defaults(opts.bufferLength, 1024)|0;
  var dspBufLength = +defaults(opts.dspBufLength, 1024)|0;
  var playbackTimeIncr = dspBufLength / audioContext.sampleRate;
  var paramKeys = [], paramBuffers = [], paramCaptures = [];
  var processor = opts.processor || {};
  var dc1, silencer;
  var node = audioContext.createScriptProcessor(bufferLength, numberOfInputs, numberOfOutputs);

  node._onmessage = null;

  Object.defineProperty(node, "onmessage", {
    get: function() {
      return this._onmessage;
    },
    set: function(callback) {
      if (callback === null || typeof callback === "function") {
        this._onmessage = callback;
      }
    },
  });

  node.postMessage = function(message) {
    var _this = this;

    setTimeout(function() {
      if (_this.__target__ && typeof _this.__target__.onmessage === "function") {
        _this.__target__.onmessage({ data: message });
      }
    }, 0);
  };

  if (opts.parameters && opts.parameters.length) {
    dc1 = audioContext.createBufferSource();
    silencer = audioContext.createGain();

    dc1.buffer = getDC1(audioContext);
    dc1.loop = true;
    dc1.start(audioContext.currentTime);

    silencer.gain.value = 0;
    silencer.connect(node);

    opts.parameters.forEach(function(param, index) {
      var paramGain = audioContext.createGain();
      paramCaptures[index] = audioContext.createScriptProcessor(bufferLength, 1, 1);

      paramGain.gain.value = +param.defaultValue || 0;
      node[param.name] = paramGain.gain;

      paramKeys[index] = param.name;

      paramCaptures[index].onaudioprocess = function(e) {
        paramBuffers[index] = e.inputBuffer.getChannelData(0);
      };

      dc1.connect(paramGain);
      paramGain.connect(paramCaptures[index]);
      paramCaptures[index].connect(silencer);
    });
  }

  node.onaudioprocess = function(e) {
    var inputs = new Array(numberOfInputs);
    var outputs = new Array(numberOfOutputs);
    var playbackTime = e.playbackTime;
    var parameters = {};
    var bufferIndex = 0;
    var nextBufferIndex = 0;
    var i, imax;

    while (bufferIndex < bufferLength) {
      nextBufferIndex = bufferIndex + dspBufLength;

      for (i = 0, imax = numberOfInputs; i < imax; i++) {
        inputs[i] = e.inputBuffer.getChannelData(i).subarray(bufferIndex, nextBufferIndex);
      }

      for (i = 0, imax = numberOfOutputs; i < imax; i++) {
        outputs[i] = e.outputBuffer.getChannelData(i).subarray(bufferIndex, nextBufferIndex);
      }

      for (i = 0, imax = paramKeys.length; i < imax; i++) {
        parameters[paramKeys[i]] = paramBuffers[i].subarray(bufferIndex, nextBufferIndex);
      }

      audioprocess({
        type: "audioprocess",
        playbackTime: playbackTime,
        node: processor,
        inputs: [ inputs ],
        outputs: [ outputs ],
        parameters: parameters,
      });

      playbackTime += playbackTimeIncr;
      bufferIndex = nextBufferIndex;
    }
  };

  return node;
}

module.exports = AudioWorkerNode;
