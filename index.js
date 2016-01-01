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
  var node = audioContext.createScriptProcessor(1024, numberOfInputs, numberOfOutputs);
  var parameters = {};
  var processor = opts.processor || {};
  var dc1, silencer;

  if (opts.parameters && opts.parameters.length) {
    dc1 = audioContext.createBufferSource();
    silencer = audioContext.createGain();

    dc1.buffer = getDC1(audioContext);
    dc1.loop = true;
    dc1.start(audioContext.currentTime);

    silencer.gain.value = 0;
    silencer.connect(node);

    opts.parameters.forEach(function(param) {
      var paramGain = audioContext.createGain();
      var paramCapture = audioContext.createScriptProcessor(1024, 1, 1);

      paramGain.gain.value = +param.defaultValue || 0;
      node[param.name] = paramGain.gain;

      paramCapture.onaudioprocess = function(e) {
        parameters[param.name] = e.inputBuffer.getChannelData(0);
      };

      dc1.connect(paramGain);
      paramGain.connect(paramCapture);
      paramCapture.connect(silencer);
    });
  }

  node.onaudioprocess = function(e) {
    var inputs = new Array(numberOfInputs);
    var outputs = new Array(numberOfOutputs);
    var i, imax;

    for (i = 0, imax = numberOfInputs; i < imax; i++) {
      inputs[i] = e.inputBuffer.getChannelData(i);
    }

    for (i = 0, imax = numberOfOutputs; i < imax; i++) {
      outputs[i] = e.outputBuffer.getChannelData(i);
    }

    audioprocess({
      type: "audioprocess",
      playbackTime: e.playbackTime,
      node: processor,
      inputs: [ inputs ],
      outputs: [ outputs ],
      parameters: parameters,
    });

    for (i = 0, imax = numberOfOutputs; i < imax; i++) {
      e.outputBuffer.getChannelData(i).set(outputs[i]);
    }
  };

  return node;
}

module.exports = AudioWorkerNode;
