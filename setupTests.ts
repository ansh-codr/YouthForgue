import '@testing-library/jest-dom';

const suppressedWarningSnippets = ['[firebaseClient] Missing Firebase config values'];

const originalWarn = console.warn;
let warnSpy: jest.SpyInstance | undefined;

beforeAll(() => {
	warnSpy = jest.spyOn(console, 'warn').mockImplementation((message?: unknown, ...rest: unknown[]) => {
		if (typeof message === 'string' && suppressedWarningSnippets.some(snippet => message.includes(snippet))) {
			return;
		}
		originalWarn(message as Parameters<typeof console.warn>[0], ...rest);
	});
});

afterAll(() => {
	warnSpy?.mockRestore();
});
