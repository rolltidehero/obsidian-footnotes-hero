describe('Simple Test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle DOM elements', () => {
    const element = document.createElement('div');
    element.className = 'test';
    expect(element.className).toBe('test');
  });
}); 