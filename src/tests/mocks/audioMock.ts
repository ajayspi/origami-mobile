import { vi } from 'vitest';

export class MockAudioNode {
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
}

export class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn()
  };
}

export class MockBiquadFilterNode extends MockAudioNode {
  frequency = {
    value: 350,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn()
  };
  Q = { value: 1 };
  type = 'bandpass';
}

export class MockAudioBufferSourceNode extends MockAudioNode {
  buffer: any = null;
  loop = false;
  start = vi.fn();
  stop = vi.fn();
}

export class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn()
  };
  start = vi.fn();
  stop = vi.fn();
}

export function setupAudioMock() {
  const MockAudioContext = vi.fn().mockImplementation(() => ({
    state: 'suspended',
    sampleRate: 44100,
    resume: vi.fn().mockResolvedValue(undefined),
    currentTime: 0,
    createGain: () => new MockGainNode(),
    createBiquadFilter: () => new MockBiquadFilterNode(),
    createBufferSource: () => new MockAudioBufferSourceNode(),
    createBuffer: () => ({
      getChannelData: () => new Float32Array(44100 * 2)
    }),
    createOscillator: () => new MockOscillatorNode(),
    destination: new MockAudioNode()
  }));

  vi.stubGlobal('AudioContext', MockAudioContext);
  if (typeof window !== 'undefined') {
    (window as any).AudioContext = MockAudioContext;
  }
}
