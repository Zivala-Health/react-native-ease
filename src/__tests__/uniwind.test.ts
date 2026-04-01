const mockWithUniwind = jest.fn((component: unknown) => component);

jest.mock(
  'uniwind',
  () => ({
    withUniwind: mockWithUniwind,
  }),
  { virtual: true },
);

// Import after mock is set up
import { EaseView as BaseEaseView } from '../EaseView';

describe('uniwind entry point', () => {
  it('calls withUniwind with EaseView and exports wrapped component', () => {
    const mod = require('../uniwind');

    expect(mockWithUniwind).toHaveBeenCalledTimes(1);
    expect(mockWithUniwind).toHaveBeenCalledWith(BaseEaseView);
    expect(mod.EaseView).toBe(BaseEaseView);
  });
});
