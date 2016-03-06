require("web-audio-test-api");

const assert = require("assert");
const sinon = require("sinon");
const AudioWorkerNode = require("../");

function noop() {}

const DC1 = {
  name: "AudioBufferSourceNode",
  buffer: {
    name: "AudioBuffer",
    sampleRate: 44100,
    length: 8,
    duration: 8 / 44100,
    numberOfChannels: 1
  },
  playbackRate: {
    value: 1,
    inputs: []
  },
  loop: true,
  loopStart: 0,
  loopEnd: 0,
  inputs: []
};

describe("AudioWorkerNode", () => {
  var audioContext;

  beforeEach(() => {
    audioContext = new AudioContext();
  });

  describe("constructor(audioContext: AudioContext, audioprocess: function, opts: object): ScriptProcessorNode", () => {
    it("works", () => {
      var node = new AudioWorkerNode(audioContext, noop, {});

      assert(node instanceof ScriptProcessorNode);
    });
  });
  describe("audioprocess", () => {
    it("works", () => {
      var audioprocess = sinon.spy();
      var processor = {};
      var node = new AudioWorkerNode(audioContext, audioprocess, {
        parameters: [
          { name: "frequency", defaultValue: 880 },
          { name: "detune" },
        ],
        processor: processor
      });

      node.connect(audioContext.destination);

      audioContext.$processTo("00:00.500");

      assert(0 < audioprocess.callCount);
      assert(audioprocess.args[0][0].type === "audioprocess");
      assert(audioprocess.args[1][0].type === "audioprocess");
      assert(audioprocess.args[0][0].playbackTime < audioprocess.args[1][0].playbackTime);
      assert(audioprocess.args[0][0].node === processor);
      assert(audioprocess.args[0][0].node === audioprocess.args[1][0].node);
    });
  });
  describe("audio-graph", () => {
    it("works", () => {
      var node = new AudioWorkerNode(audioContext, noop, {});

      node.connect(audioContext.destination);

      assert.deepEqual(audioContext.destination.toJSON(), {
        name: "AudioDestinationNode",
        inputs: [
          {
            name: "ScriptProcessorNode",
            inputs: []
          }
        ]
      });
    });
    it("works with parameters", () => {
      var node = new AudioWorkerNode(audioContext, noop, {
        parameters: [
          { name: "frequency", defaultValue: 880 },
          { name: "detune" }
        ]
      });

      node.connect(audioContext.destination);

      assert.deepEqual(audioContext.destination.toJSON(), {
        name: "AudioDestinationNode",
        inputs: [
          {
            name: "ScriptProcessorNode",
            inputs: [
              {
                name: "ScriptProcessorNode",
                inputs: [
                  {
                    name: "ChannelMergerNode",
                    inputs: [
                      [
                        {
                          name: "GainNode",
                          gain: {
                            value: 880,
                            inputs: []
                          },
                          inputs: [ DC1 ]
                        }
                      ],
                      [
                        {
                          name: "GainNode",
                          gain: {
                            value: 0,
                            inputs: []
                          },
                          inputs: [ DC1 ]
                        }
                      ]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    });
  });
});
