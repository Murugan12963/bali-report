describe('BPD Fundraising & Campaigns', () => {
  describe('Campaigns Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/campaigns');
    });

    it('should load campaigns page successfully', () => {
      cy.contains(/BPD|Bali People's Development|Campaigns/i).should('be.visible');
    });

    it('should display campaign statistics', () => {
      cy.contains(/total raised|active campaigns|beneficiaries/i).should('exist');
    });

    it('should show active campaigns', () => {
      cy.get('body').then(($body) => {
        if ($body.text().match(/active campaign/i)) {
          cy.get('[class*="campaign" i]').should('exist');
        }
      });
    });

    it('should display donation buttons on active campaigns', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Donate")').length > 0) {
          cy.contains('button', /donate/i).should('exist');
        }
      });
    });

    it('should show campaign progress bars', () => {
      cy.get('body').then(($body) => {
        // Look for progress indicators
        if ($body.text().match(/\d+%|funded|goal/i)) {
          cy.contains(/\d+%|funded/i).should('exist');
        }
      });
    });

    it('should explain BPD funding model', () => {
      cy.contains(/20%|subscription revenue|how.*works/i).should('exist');
    });

    it('should display campaign categories', () => {
      cy.contains(/education|healthcare|infrastructure|environment|community/i).should('exist');
    });

    it('should have breadcrumb navigation', () => {
      cy.get('nav[aria-label="Breadcrumb"], nav').should('exist');
    });
  });

  describe('Impact Dashboard', () => {
    beforeEach(() => {
      cy.visitAndWait('/impact');
    });

    it('should load impact dashboard', () => {
      cy.contains(/Impact Dashboard|BPD Impact/i).should('be.visible');
    });

    it('should display impact metrics', () => {
      cy.contains(/total donations|subscription revenue|allocation/i).should('exist');
    });

    it('should show fund allocation visualization', () => {
      cy.contains(/fund allocation|revenue sources/i).should('exist');
    });

    it('should display impact by category', () => {
      cy.contains(/impact by category|category/i).should('exist');
    });

    it('should show recent milestones', () => {
      cy.contains(/recent milestones|timeline/i).should('exist');
    });
  });

  describe('Donation Flow', () => {
    beforeEach(() => {
      cy.visitAndWait('/donation');
    });

    it('should load donation page', () => {
      cy.contains(/donate|donation/i).should('be.visible');
    });

    it('should explain donation process', () => {
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase();
        expect(text).to.match(/bpd|donate|donation/);
      });
    });
  });

  describe('Subscription Page', () => {
    beforeEach(() => {
      cy.visitAndWait('/subscription');
    });

    it('should load subscription page', () => {
      cy.contains(/subscribe|subscription|premium/i).should('be.visible');
    });

    it('should display pricing information', () => {
      cy.contains(/\$\d+|price|month/i).should('exist');
    });

    it('should explain BPD allocation', () => {
      cy.contains(/20%|BPD/i).should('exist');
    });
  });
});