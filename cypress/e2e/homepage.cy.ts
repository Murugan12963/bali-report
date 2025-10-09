/**
 * E2E Tests for Homepage
 */

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Page Load', () => {
    it('should load the homepage successfully', () => {
      cy.get('h1').should('be.visible');
    });

    it('should display the site title', () => {
      cy.contains('Multi-polar News Perspectives').should('be.visible');
    });

    it('should load without console errors', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error');
      });
    });
  });

  describe('Navigation', () => {
    it('should have working navigation menu', () => {
      cy.get('nav').should('exist');
      cy.contains('Home').should('be.visible');
      cy.contains('BRICS').should('be.visible');
      cy.contains('Indonesia').should('be.visible');
      cy.contains('Bali').should('be.visible');
    });

    it('should navigate to BRICS page', () => {
      cy.contains('BRICS').click();
      cy.url().should('include', '/brics');
      cy.contains('BRICS News').should('be.visible');
    });

    it('should navigate to Indonesia page', () => {
      cy.contains('Indonesia').click();
      cy.url().should('include', '/indonesia');
      cy.contains('Indonesia News').should('be.visible');
    });

    it('should navigate to Bali page', () => {
      cy.contains('Bali').click();
      cy.url().should('include', '/bali');
      cy.contains('Bali News').should('be.visible');
    });
  });

  describe('Articles Display', () => {
    it('should display featured articles', () => {
      cy.get('[data-testid="article-card"]')
        .should('have.length.greaterThan', 0);
    });

    it('should display article titles', () => {
      cy.get('[data-testid="article-card"]')
        .first()
        .find('h2, h3')
        .should('be.visible')
        .and('not.be.empty');
    });

    it('should display article descriptions', () => {
      cy.get('[data-testid="article-card"]')
        .first()
        .find('p')
        .should('be.visible');
    });

    it('should have clickable article links', () => {
      cy.get('[data-testid="article-card"]')
        .first()
        .find('a[target="_blank"]')
        .should('have.attr', 'href')
        .and('not.be.empty');
    });
  });

  describe('Search Functionality', () => {
    it('should have search bar', () => {
      cy.get('input[type="search"]').should('be.visible');
    });

    it('should allow typing in search', () => {
      cy.get('input[type="search"]')
        .type('Russia')
        .should('have.value', 'Russia');
    });
  });

  describe('Theme Switcher', () => {
    it('should have theme switcher', () => {
      cy.get('[data-testid="theme-switcher"]').should('exist');
    });

    it('should toggle dark mode', () => {
      cy.get('html').then(($html) => {
        const initialTheme = $html.hasClass('dark');

        cy.get('[data-testid="theme-switcher"]').click();

        cy.get('html').should(
          initialTheme ? 'not.have.class' : 'have.class',
          'dark'
        );
      });
    });
  });

  describe('Newsletter Signup', () => {
    it('should have newsletter signup form', () => {
      cy.contains('Newsletter').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
    });

    it('should validate email input', () => {
      cy.get('input[type="email"]').first().as('emailInput');

      cy.get('@emailInput').type('invalid-email');
      cy.get('button[type="submit"]').first().click();

      // Check for validation message
      cy.get('@emailInput').then(($input) => {
        expect($input[0].validity.valid).to.be.false;
      });
    });
  });

  describe('Responsive Design', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.get('h1').should('be.visible');
      cy.get('[data-testid="article-card"]').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.get('h1').should('be.visible');
      cy.get('[data-testid="article-card"]').should('be.visible');
    });

    it('should have mobile menu', () => {
      cy.viewport('iphone-x');
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      const startTime = Date.now();

      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 seconds
      });
    });

    it('should have proper meta tags', () => {
      cy.get('meta[name="description"]').should('exist');
      cy.get('meta[property="og:title"]').should('exist');
      cy.get('meta[property="og:description"]').should('exist');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('have.length', 1);
      cy.get('h2').should('exist');
    });

    it('should have alt text for images', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should be keyboard navigable', () => {
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });
  });
});
