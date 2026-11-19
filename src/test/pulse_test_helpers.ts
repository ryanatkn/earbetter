import { vi, type Mock } from 'vitest';

export interface FakeParam {
	value: number;
	setValueAtTime: Mock<(value: number, time: number) => void>;
	setTargetAtTime: Mock<(target: number, time: number, time_constant: number) => void>;
}

export interface FakeNode {
	connect: Mock<(destination: unknown) => void>;
}

export interface FakeGain extends FakeNode {
	gain: FakeParam;
}

export interface FakeSource extends FakeNode {
	start: Mock<(time?: number) => void>;
	stop: Mock<(time?: number) => void>;
}

export interface FakeOscillator extends FakeSource {
	type: OscillatorType;
	frequency: FakeParam;
}

export interface FakeBuffer {
	length: number;
	sampleRate: number;
	/**
	 * The samples last copied into the buffer.
	 */
	samples: Float32Array | null;
	copyToChannel: (samples: Float32Array, channel: number) => void;
}

export interface FakeBufferSource extends FakeSource {
	buffer: FakeBuffer | null;
	loop: boolean;
}

export interface FakePulseAudio {
	ac: AudioContext;
	/**
	 * Advances the audio clock, which the fake otherwise leaves still.
	 */
	set_time: (time: number) => void;
	gains: Array<FakeGain>;
	oscillators: Array<FakeOscillator>;
	buffer_sources: Array<FakeBufferSource>;
}

/**
 * Creates the slice of `AudioContext` that `start_pulse` touches,
 * recording every node it creates in order so tests can assert the graph and its scheduling.
 */
export const create_fake_pulse_audio = (sample_rate = 48000): FakePulseAudio => {
	const gains: Array<FakeGain> = [];
	const oscillators: Array<FakeOscillator> = [];
	const buffer_sources: Array<FakeBufferSource> = [];
	const create_param = (): FakeParam => ({
		value: 0,
		setValueAtTime: vi.fn(),
		setTargetAtTime: vi.fn()
	});
	const create_source = (): FakeSource => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() });
	const ac = {
		currentTime: 0,
		sampleRate: sample_rate,
		destination: {},
		createGain: () => {
			const node: FakeGain = { gain: create_param(), connect: vi.fn() };
			gains.push(node);
			return node;
		},
		createOscillator: () => {
			const node: FakeOscillator = { ...create_source(), type: 'sine', frequency: create_param() };
			oscillators.push(node);
			return node;
		},
		createBuffer: (_channels: number, length: number, sampleRate: number) => {
			const buffer: FakeBuffer = {
				length,
				sampleRate,
				samples: null,
				copyToChannel: (samples) => {
					buffer.samples = samples;
				}
			};
			return buffer;
		},
		createBufferSource: () => {
			const node: FakeBufferSource = { ...create_source(), buffer: null, loop: false };
			buffer_sources.push(node);
			return node;
		}
	};
	return {
		ac: ac as unknown as AudioContext,
		set_time: (time) => {
			ac.currentTime = time;
		},
		gains,
		oscillators,
		buffer_sources
	};
};
