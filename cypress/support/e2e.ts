// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Prevent TypeScript errors
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit a page and wait for it to load
       * @example cy.visitAndWait('/')
       */
      visitAndWait(url: string): Chainable<void>;
      
      /**
       * Custom command to check if RSS articles are loaded
       * @example cy.checkArticlesLoaded()
       */
      checkArticlesLoaded(): Chainable<void>;
      
      /**
       * Custom command to search for articles
       * @example cy.searchArticles('BRICS')
       */
      searchArticles(query: string): Chainable<void>;
    }
  }
}

export {};