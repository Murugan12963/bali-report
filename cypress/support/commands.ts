/// <reference types="cypress" />

/**
 * Custom Cypress commands for Bali Report E2E testing
 */

// Visit a page and wait for it to fully load
Cypress.Commands.add('visitAndWait', (url: string) => {
  cy.visit(url);
  cy.wait(1000); // Wait for page to stabilize
});

// Check if RSS articles are loaded on the page
Cypress.Commands.add('checkArticlesLoaded', () => {
  cy.get('article', { timeout: 10000 }).should('exist');
  cy.get('article').should('have.length.greaterThan', 0);
});

// Search for articles using the search functionality
Cypress.Commands.add('searchArticles', (query: string) => {
  cy.get('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]')
    .first()
    .clear()
    .type(`${query}{enter}`);
  cy.url().should('include', '/search');
  cy.wait(1000);
});

// Prevent TypeScript errors
export {};