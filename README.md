# AudioWorkerNode
[![Build Status](http://img.shields.io/travis/mohayonao/audio-worker-node.svg?style=flat-square)](https://travis-ci.org/mohayonao/audio-worker-node)
[![NPM Version](http://img.shields.io/npm/v/audio-worker-node.svg?style=flat-square)](https://www.npmjs.org/package/audio-worker-node)
[![Bower](http://img.shields.io/bower/v/audio-worker-node.svg?style=flat-square)](http://bower.io/search/?q=audio-worker-node)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)


> AudioWorkerNode for legacy Web Audio API

http://webaudio.github.io/web-audio-api/#the-audioworker

## Installation

npm:

```
npm install audio-worker-node
```

bower:

```
bower install audio-worker-node
```

downloads:

- [audio-worker-node.js](https://raw.githubusercontent.com/mohayonao/audio-worker-node/master/build/audio-worker-node.js)
- [audio-worker-node.min.js](https://raw.githubusercontent.com/mohayonao/audio-worker-node/master/build/audio-worker-node.min.js)

## API
### AudioWorkerNode
  - `constructor(audioContext: AudioContext, scriptURL: string, numberOfInputChannels: number, numberOfOutputChannels: number)`

#### Instance Attributes
  - `onmessage: function`

#### Instance Methods
  - `connect(destination: AudioNode|AudioParam): void`
  - `disconnect(): void`
  - `postMessage(message: any, [transfer: any]): void`
  - `addParameter(name: string, [defaultValue: number]): AudioParam`
  - `removeParameter(name:  string): void`
  - `terminate(): void`

## Example
http://mohayonao.github.io/audio-worker-node/

## AudioGraph
```
+-----------------------+
| BufferSourceNode(dc1) |
| buffer: [ 1, 1 ]      |
| loop: true            |
+-----------------------+
  |
  +------------------------+-------------------- .. --+
  |                        |                          |
+---------------------+  +---------------------+    +---------------------+
| GainNode(param0)    |  | GainNode(param1)    | .. | GainNode(paramN)    |
+---------------------+  +---------------------+    +---------------------+
  |                        |                          |
+---------------------+  +---------------------+    +---------------------+
| ScriptProcessorNode |  | ScriptProcessorNode | .. | ScriptProcessorNode |
+---------------------+  +---------------------+    +---------------------+
  |                        |                          |
  +------------------------+-------------------- .. --+
  |
+--------------------+
| GainNode(silencer) |
| gain: 0            |
+--------------------+
  |
+-----------------------------------+
| ScriptProcessorNode(inlet/outlet) |
+-----------------------------------+
```

## License
MIT
