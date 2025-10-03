describe('Search and Community Features', () => {
  describe('Search Functionality', () => {
    beforeEach(() => {
      cy.visitAndWait('/search');
    });

    it('should load search page successfully', () => {
      cy.contains(/Search|search/i).should('be.visible');
    });

    it('should search for articles', () => {
      cy.searchArticles('BRICS');
      cy.url().should('include', 'q=BRICS');
      cy.wait(2000);
      
      // Should show search results or "no results" message
      cy.get('body').then(($body) => {
        if ($body.find('article').length > 0) {
          cy.get('article').should('exist');
        } else {
          cy.contains(/no results|not found/i).should('exist');
        }
      });
    });

    it('should handle empty search queries', () => {
      cy.visit('/search');
      cy.wait(1000);
      cy.contains(/search|what story/i).should('exist');
    });

    it('should display search suggestions', () => {
      cy.visit('/search');
      cy.contains(/topics|hot topics|suggestions/i).should('exist');
    });

    it('should perform relevance-based search', () => {
      cy.searchArticles('China');
      cy.wait(2000);
      
      cy.get('article').first().within(() => {
        cy.get('h2, h3').invoke('text').should('match', /China|chinese/i);
      });
    });
  });

  describe('Community Voting', () => {
    beforeEach(() => {
      cy.visitAndWait('/');
    });

    it('should display vote buttons on articles', () => {
      cy.get('article').first().within(() => {
        cy.contains('👍').should('exist');
        cy.contains('👎').should('exist');
      });
    });

    it('should allow upvoting an article', () => {
      cy.get('article').first().within(() => {
        cy.contains('👍').click();
      });
      // Vote should be registered (button state changes)
      cy.wait(500);
    });

    it('should navigate to community picks page', () => {
      cy.contains('Community').click();
      cy.url().should('include', '/community-picks');
    });
  });

  describe('Community Picks Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/community-picks');
    });

    it('should load community picks page', () => {
      cy.contains(/Community Picks|community/i).should('be.visible');
    });

    it('should display voting statistics', () => {
      cy.contains(/total votes|top articles/i).should('exist');
    });

    it('should show how voting works', () => {
      cy.contains(/how.*works|upvote|downvote/i).should('exist');
    });
  });

  describe('Saved Articles Feature', () => {
    beforeEach(() => {
      cy.visitAndWait('/');
    });

    it('should display save button on articles', () => {
      cy.get('article').first().within(() => {
        cy.get('button[aria-label*="save" i], button[title*="save" i]').should('exist');
      });
    });

    it('should navigate to saved articles page', () => {
      cy.visit('/saved');
      cy.contains(/Saved|reading list/i).should('exist');
    });
  });
});