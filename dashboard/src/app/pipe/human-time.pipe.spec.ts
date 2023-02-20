import { HumanTimePipe } from './human-time.pipe';

describe('TimePipe', () => {
  it('create an instance', () => {
    const pipe = new HumanTimePipe();
    expect(pipe).toBeTruthy();
  });
});
