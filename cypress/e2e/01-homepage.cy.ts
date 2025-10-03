describe('Homepage', () => {
  beforeEach(() => {
    cy.visitAndWait('/');
  });

  it('should load the homepage successfully', () => {
    cy.contains('Bali Report').should('be.visible');
  });

  it('should display RSS articles on homepage', () => {
    cy.checkArticlesLoaded();
  });

  it('should have working navigation links', () => {
    // Check main navigation
    cy.contains('BRICS').should('be.visible').click();
    cy.url().should('include', '/brics');
    
    cy.go('back');
    
    cy.contains('Indonesia').should('be.visible').click();
    cy.url().should('include', '/indonesia');
    
    cy.go('back');
    
    cy.contains('Bali').should('be.visible').click();
    cy.url().should('include', '/bali');
  });

  it('should have functioning search bar', () => {
    cy.get('input[type="search"], input[placeholder*="search" i]')
      .first()
      .should('be.visible')
      .type('BRICS{enter}');
    
    cy.url().should('include', '/search');
    cy.contains('Search').should('be.visible');
  });

  it('should display theme toggle', () => {
    cy.get('button[aria-label*="theme" i], button[title*="theme" i]')
      .should('exist');
  });

  it('should show multiple article cards', () => {
    cy.get('article').should('have.length.greaterThan', 5);
  });

  it('should have valid article links', () => {
    cy.get('article a[href^="http"]')
      .first()
      .should('have.attr', 'href')
      .and('include', 'http');
  });

  it('should display article metadata', () => {
    cy.get('article').first().within(() => {
      // Should have title
      cy.get('h2, h3').should('exist');
      // Should have description
      cy.get('p').should('exist');
      // Should have source
      cy.contains(/RT News|TASS|Xinhua|Antara|BBC/i).should('exist');
    });
  });
});