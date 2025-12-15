import { helloWorld } from '../src';

describe('hello world', () => {
  it('Should return hello world', () => {
    expect(helloWorld()).toBe("Hello World")
  })
});