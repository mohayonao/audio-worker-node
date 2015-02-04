# AudioWorkerNode
> AudioWorkerNode for legacy Web Audio API

http://webaudio.github.io/web-audio-api/#the-audioworker

## API
### AudioWorkerNode
  - `constructor(audioContext: AudioContext)`

#### Instance Attributes
  - `onmessage: function`

#### Instance Methods
  - `connect(destination: AudioNode | AudioParam) : void`
  - `disconnect() : void`
  - `terminate(): void`
  - `postMessage(message: any, [transfer: any]): void`
  - `addParameter(name: string, [defaultValue: number]): AudioParam`
  - `removeParameter(name:  string): void`

## AudioGraph
```
+----------------------------+  +-----------------------+
| ScriptProcessorNode(inlet) |  | BufferSourceNode(dc1) |
+----------------------------+  | buffer: [ 1, 1 ]      |
  |                             | loop: true            |
  |                             +-----------------------+
  |                               |
  |                               +------------------------+
  |                               |                        |
  |                             +------------------+     +------------------+
  |                             | GainNode(param1) | ... | GainNode(paramN) |
  |                             | gain: 1          |     | gain: 1          |
  |                             +------------------+     +------------------+
  |                               |                        |
  |                             +----------------------------+
  |                             | GainNode(silencer)         |
  |                             | gain: 0                    |
  |                             +----------------------------+
  |                               |
  +-------------------------------+
  |
+------------------+
| GainNode(outlet) |
+------------------+
```

## License
MIT
