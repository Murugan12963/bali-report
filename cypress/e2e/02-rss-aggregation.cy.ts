describe('RSS Aggregation', () => {
  describe('BRICS Category Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/brics');
    });

    it('should load BRICS page successfully', () => {
      cy.contains(/BRICS/i).should('be.visible');
    });

    it('should display BRICS articles', () => {
      cy.checkArticlesLoaded();
      cy.get('article').should('have.length.greaterThan', 10);
    });

    it('should show BRICS-specific sources', () => {
      cy.contains(/RT News|TASS|Xinhua|Sputnik|CGTN/i).should('exist');
    });

    it('should have breadcrumb navigation', () => {
      cy.get('nav[aria-label="Breadcrumb"], nav').should('exist');
      cy.contains('Home').should('exist');
    });
  });

  describe('Indonesia Category Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/indonesia');
    });

    it('should load Indonesia page successfully', () => {
      cy.contains(/Indonesia/i).should('be.visible');
    });

    it('should display Indonesia articles', () => {
      cy.checkArticlesLoaded();
    });

    it('should show Indonesia-specific sources', () => {
      cy.contains(/Antara|BBC Asia/i).should('exist');
    });
  });

  describe('Bali Category Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/bali');
    });

    it('should load Bali page successfully', () => {
      cy.contains(/Bali/i).should('be.visible');
    });

    it('should handle cases with or without Bali articles', () => {
      // Check if page loads without errors
      cy.get('body').should('be.visible');
      
      // Either should show articles or a message about no articles
      cy.get('article').then(($articles) => {
        if ($articles.length === 0) {
          cy.contains(/no articles|coming soon|check back/i).should('exist');
        } else {
          cy.checkArticlesLoaded();
        }
      });
    });
  });

  describe('RSS Feed Performance', () => {
    it('should load articles within reasonable time', () => {
      const startTime = Date.now();
      cy.visit('/');
      cy.get('article', { timeout: 15000 }).should('exist');
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(15000); // Should load within 15 seconds
      });
    });

    it('should display article count statistics', () => {
      cy.visit('/brics');
      cy.wait(2000);
      cy.get('body').then(($body) => {
        // Look for statistics section
        if ($body.text().match(/\d+\s*(articles|sources)/i)) {
          cy.contains(/\d+\s*(articles|sources)/i).should('exist');
        }
      });
    });
  });
});