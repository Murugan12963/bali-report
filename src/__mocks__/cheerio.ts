/**
 * Mock implementation of cheerio for Jest tests
 * Provides basic cheerio functionality without ESM issues
 */

interface CheerioElement {
  find: (selector: string) => CheerioElement;
  text: () => string;
  attr: (name: string) => string | undefined;
  each: (callback: (index: number, element: any) => void | false) => void;
  first: () => CheerioElement;
}

interface CheerioAPI extends CheerioElement {
  (selector: string): CheerioElement;
}

let mockHTML = '';
let mockItems: any[] = [];

const createCheerioElement = (data?: any): CheerioElement => {
  return {
    find: jest.fn((selector: string) => {
      if (selector === 'item') {
        // Return items for RSS feed
        return createCheerioElement(mockItems);
      }
      return createCheerioElement();
    }),
    text: jest.fn(() => {
      if (data && data.text) return data.text;
      return '';
    }),
    attr: jest.fn((name: string) => {
      if (data && data.attrs && data.attrs[name]) return data.attrs[name];
      return undefined;
    }),
    each: jest.fn((callback: (index: number, element: any) => void | false) => {
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const result = callback(i, data[i]);
          if (result === false) break;
        }
      }
    }),
    first: jest.fn(() => createCheerioElement()),
  };
};

export const load = jest.fn((html: string, options?: any) => {
  mockHTML = html;
  
  // Parse mock items from HTML for testing
  mockItems = [];
  
  const $ = ((selector: string) => {
    if (selector === 'item') {
      return createCheerioElement(mockItems);
    }
    return createCheerioElement();
  }) as CheerioAPI;
  
  // Add CheerioElement methods to $
  Object.assign($, createCheerioElement());
  
  return $;
});

export default { load };
