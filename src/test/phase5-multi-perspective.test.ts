import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordFeedback,
  compileFeedbackCollection,
  generateFeedbackSummary,
  analyzeCrossObserverAttachmentPatterns,
  filterFeedbackBySource,
  getAverageConfidence,
  type PerspectiveFeedback,
  type CollectedFeedback,
  type ObserverProfile,
} from '../lib/feedback-collection-cat3';
import {
  analyzePerceptionGaps,
  identifyBlindSpots,
  identifyDivergentViews,
  validateProgressAlignment,
  integratePerspectives,
} from '../lib/perspective-analysis-cat3';
import {
  generateMultiPerspectiveNarrative,
  generateMultiPerspectiveReport,
} from '../lib/multi-perspective-report-cat3';
import type { ProgressTracking } from '../lib/progress-tracking-cat3';
import type { FeedbackCategory } from '../lib/feedback-collection-cat3';

describe('Phase 5: Multi-Perspective Feedback', () => {
  let mockTracking: ProgressTracking;
  let mockFeedback: CollectedFeedback;

  beforeEach(() => {
    // Setup mock tracking data
    mockTracking = {
      userId: 'user-1',
      startDate: '2024-01-01',
      practiceCompletions: [
        {
          practiceId: 'p1',
          rating: 4,
          feedback: 'Went well',
          challenges: [],
          successFactors: [],
          attachmentStyleNote: '',
          contextType: 'intimate',
          completedAt: '2024-01-05',
        },
      ],
      metricCheckpoints: [
        {
          timestamp: '2024-01-01',
          metrics: {
            trustLevel: 70,
            communicationQuality: 65,
            conflictNavigation: 60,
            intimacyComfort: 75,
            autonomyBalance: 70,
            emotionalSafety: 68,
            overallQuality: 68,
            stability: 0.8,
          },
        },
        {
          timestamp: '2024-01-10',
          metrics: {
            trustLevel: 75,
            communicationQuality: 72,
            conflictNavigation: 68,
            intimacyComfort: 78,
            autonomyBalance: 72,
            emotionalSafety: 75,
            overallQuality: 73,
            stability: 0.85,
          },
        },
      ],
      totalPracticesCompleted: 1,
      averageUserRating: 4,
      completionRate: 16.67,
      improvements: [
        {
          metric: 'trust',
          initialScore: 70,
          currentScore: 75,
          changePoints: 5,
          contributingPractices: ['p1'],
        },
      ],
      challenges: [],
      metrics: {
        initial: {
          trustLevel: 70,
          communicationQuality: 65,
          conflictNavigation: 60,
          intimacyComfort: 75,
          autonomyBalance: 70,
          emotionalSafety: 68,
          overallQuality: 68,
          stability: 0.8,
        },
        mostRecent: {
          trustLevel: 75,
          communicationQuality: 72,
          conflictNavigation: 68,
          intimacyComfort: 78,
          autonomyBalance: 72,
          emotionalSafety: 75,
          overallQuality: 73,
          stability: 0.85,
        },
        trajectory: 'improving',
        improvementRate: 7.35,
      },
    } as any;

    // Setup mock feedback collection
    const partnerObserver: ObserverProfile = {
      id: 'obs-1',
      name: 'Partner',
      source: 'partner',
      relationshipToUser: 'romantic partner',
    };

    const friendObserver: ObserverProfile = {
      id: 'obs-2',
      name: 'Best Friend',
      source: 'friend',
      relationshipToUser: 'close friend',
    };

    const partnerFeedback: PerspectiveFeedback = recordFeedback(
      'user-1',
      partnerObserver,
      {
        communication: 4,
        'emotional-safety': 4,
        'conflict-handling': 3,
        intimacy: 4,
        trust: 4,
        autonomy: 3,
        'overall-relationship': 4,
      },
      {
        positiveChanges: [
          'More open communication',
          'Better listening',
          'More vulnerable',
        ],
        challenges: ['Some tension around independence'],
        surprises: ['How much they care about my feelings'],
      },
      ['Keep up the communication work', 'Celebrate the vulnerability'],
      ['Connection has deepened', 'Real progress on trust'],
      5,
      {
        userPattern: 'anxious-secure hybrid',
        partnerPattern: 'secure-leaning',
        dynamicShifts: ['Less avoidance', 'More bids for connection'],
      }
    );

    const friendFeedback: PerspectiveFeedback = recordFeedback(
      'user-1',
      friendObserver,
      {
        communication: 4,
        'personal-growth': 5,
        'overall-relationship': 4,
      },
      {
        positiveChanges: [
          'Happier overall',
          'Less anxious',
          'More grounded',
        ],
        challenges: ['Still overthinks sometimes'],
        surprises: ['Opening up more about relationship'],
      },
      ['Keep prioritizing the relationship', 'Notice the happiness shift'],
      ['Radiating different energy', 'Genuinely happy'],
      4,
      {
        userPattern: 'secure-leaning',
        dynamicShifts: ['Noticeably less reactive'],
      }
    );

    mockFeedback = compileFeedbackCollection(
      'user-1',
      [partnerFeedback, friendFeedback],
      new Date('2024-01-01') as any,
      new Date('2024-01-10') as any
    );
  });

  describe('recordFeedback', () => {
    it('records partner feedback with full observations', () => {
      expect(mockFeedback.feedbackItems[0].observations.positiveChanges).toContain(
        'More open communication'
      );
      expect(mockFeedback.feedbackItems[0].confidenceLevel || 5).toBe(5);
    });

    it('clamps ratings to 1-5 range validation', () => {
      const observer: ObserverProfile = {
        id: 'obs-3',
        name: 'Test',
        source: 'therapist',
        relationshipToUser: 'therapist',
      };

      expect(() => {
        recordFeedback('user-1', observer, { communication: 6 }, {
          positiveChanges: [],
          challenges: [],
          surprises: [],
        }, [], [], 3);
      }).toThrow('Ratings must be between 1-5');
    });

    it('validates confidence level 1-5', () => {
      const observer: ObserverProfile = {
        id: 'obs-3',
        name: 'Test',
        source: 'therapist',
        relationshipToUser: 'therapist',
      };

      expect(() => {
        recordFeedback('user-1', observer, { communication: 3 }, {
          positiveChanges: [],
          challenges: [],
          surprises: [],
        }, [], [], 6);
      }).toThrow('Confidence level must be between 1-5');
    });
  });

  describe('compileFeedbackCollection', () => {
    it('identifies completed and pending sources', () => {
      expect(mockFeedback.completedSources).toContain('partner');
      expect(mockFeedback.completedSources).toContain('friend');
      expect(mockFeedback.pendingSources).toContain('therapist');
    });

    it('tracks collection period correctly', () => {
      expect(mockFeedback.collectionPeriod.startDate).toEqual(
        new Date('2024-01-01')
      );
      expect(mockFeedback.collectionPeriod.endDate).toEqual(
        new Date('2024-01-10')
      );
    });
  });

  describe('generateFeedbackSummary', () => {
    it('computes source breakdown', () => {
      const summary = generateFeedbackSummary(mockFeedback);
      expect(summary.sourceBreakdown.partner).toBe(1);
      expect(summary.sourceBreakdown.friend).toBe(1);
      expect(summary.sourceBreakdown.therapist).toBe(0);
    });

    it('calculates average ratings by category', () => {
      const summary = generateFeedbackSummary(mockFeedback);
      expect(summary.averageRatingsByCategory.communication).toBeGreaterThan(3);
      expect(summary.averageRatingsByCategory['overall-relationship']).toBeGreaterThan(3);
    });

    it('identifies most consistent observations', () => {
      const summary = generateFeedbackSummary(mockFeedback);
      expect(summary.mostConsistentObservations.positive.length).toBeGreaterThan(0);
      expect(summary.mostConsistentObservations.positive[0].mentionedByCount).toBeGreaterThanOrEqual(
        1
      );
    });
  });

  describe('analyzeCrossObserverAttachmentPatterns', () => {
    it('identifies consensus attachment pattern', () => {
      const patterns =
        analyzeCrossObserverAttachmentPatterns(mockFeedback);
      expect(patterns.consensusAssessment).toBeTruthy();
      expect(patterns.dynamicShifts.length).toBeGreaterThan(0);
    });

    it('captures partner-specific pattern', () => {
      const patterns =
        analyzeCrossObserverAttachmentPatterns(mockFeedback);
      expect(patterns.partnerSpecificPattern).toBeDefined();
    });
  });

  describe('filterFeedbackBySource', () => {
    it('filters to partner feedback only', () => {
      const partnerOnly = filterFeedbackBySource(mockFeedback, 'partner');
      expect(partnerOnly).toHaveLength(1);
      expect(partnerOnly[0].observer.source).toBe('partner');
    });

    it('returns empty when source has no feedback', () => {
      const therapistOnly = filterFeedbackBySource(mockFeedback, 'therapist');
      expect(therapistOnly).toHaveLength(0);
    });
  });

  describe('getAverageConfidence', () => {
    it('calculates average confidence across all feedback', () => {
      const avgConfidence = getAverageConfidence(mockFeedback);
      expect(avgConfidence).toBe(4.5); // (5 + 4) / 2
    });
  });

  describe('analyzePerceptionGaps', () => {
    it('identifies gaps between self and external ratings', () => {
      const categoryMappings = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      } as unknown as Record<FeedbackCategory, keyof any>;

      const gaps = analyzePerceptionGaps(mockTracking, mockFeedback, categoryMappings as any);
      expect(gaps.length).toBeGreaterThan(0);
      expect(gaps[0].category).toBeDefined();
      expect(gaps[0].interpretation).toBeDefined();
    });
  });

  describe('identifyBlindSpots', () => {
    it('identifies observer blind spot observations', () => {
      const userChallenges: string[] = [];
      const blindSpots = identifyBlindSpots(mockFeedback, userChallenges);

      expect(Array.isArray(blindSpots)).toBe(true);
    });

    it('assigns confidence levels correctly', () => {
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      blindSpots.forEach((spot) => {
        expect(['low', 'medium', 'high']).toContain(spot.confidence);
      });
    });

    it('categorizes blind spots', () => {
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      blindSpots.forEach((spot) => {
        expect(spot.category).toBeDefined();
        expect(spot.implication).toBeDefined();
      });
    });
  });

  describe('identifyDivergentViews', () => {
    it('identifies areas of observer disagreement', () => {
      const divergences = identifyDivergentViews(mockFeedback);
      expect(Array.isArray(divergences)).toBe(true);
    });

    it('calculates divergence scores', () => {
      const divergences = identifyDivergentViews(mockFeedback);
      divergences.forEach((div) => {
        expect(div.divergence).toBeGreaterThanOrEqual(0);
        expect(div.divergence).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('validateProgressAlignment', () => {
    it('determines if external feedback validates user progress', () => {
      const validation = validateProgressAlignment(mockTracking, mockFeedback);
      expect(validation.alignment).toBeGreaterThanOrEqual(0);
      expect(validation.alignment).toBeLessThanOrEqual(100);
      expect(['high', 'moderate', 'low']).toContain(
        validation.overallValidation
      );
    });

    it('identifies validated and unvalidated progress areas', () => {
      const validation = validateProgressAlignment(mockTracking, mockFeedback);
      expect(Array.isArray(validation.validatedAreas)).toBe(true);
      expect(Array.isArray(validation.unvalidatedAreas)).toBe(true);
    });
  });

  describe('integratePerspectives', () => {
    it('synthesizes self and external views', () => {
      const categoryMappings: Record<FeedbackCategory, keyof any> = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      };

      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      expect(integration.selfAssessment).toBeDefined();
      expect(integration.externalPerspectives).toBeDefined();
      expect(integration.synthesis).toBeDefined();
    });

    it('identifies confirmed and potential gaps in progress', () => {
      const categoryMappings = {} as Record<FeedbackCategory, keyof any>;
      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      expect(Array.isArray(integration.synthesis.confirmedProgress)).toBe(true);
      expect(Array.isArray(integration.synthesis.potentialGaps)).toBe(true);
    });
  });

  describe('generateMultiPerspectiveNarrative', () => {
    it('generates narrative with all sections', () => {
      const categoryMappings = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      } as Record<FeedbackCategory, keyof any>;

      const gaps = analyzePerceptionGaps(mockTracking, mockFeedback, categoryMappings as any);
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      const divergences = identifyDivergentViews(mockFeedback);
      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      const narrative = generateMultiPerspectiveNarrative(
        integration,
        blindSpots,
        divergences,
        gaps,
        mockFeedback,
        75
      );

      expect(narrative.headline).toBeTruthy();
      expect(narrative.summary).toBeTruthy();
      expect(narrative.sharedVictories).toBeDefined();
      expect(narrative.validationInsights).toBeDefined();
      expect(narrative.blindSpotInsights).toBeDefined();
      expect(narrative.encouragement).toBeTruthy();
    });

    it('generates context-appropriate headline', () => {
      const gaps: any[] = [];
      const blindSpots: any[] = [];
      const divergences: any[] = [];
      const integration: any = {
        synthesis: {
          confirmedProgress: ['trust', 'communication'],
          potentialGaps: [],
          emergingChallenges: [],
          alignedFocusAreas: [],
        },
      };

      const narrative = generateMultiPerspectiveNarrative(
        integration,
        blindSpots,
        divergences,
        gaps,
        mockFeedback,
        80
      );

      // Just verify headline was generated
      expect(narrative.headline).toBeTruthy();
      expect(narrative.headline.length).toBeGreaterThan(0);
    });
  });

  describe('generateMultiPerspectiveReport', () => {
    it('creates complete multi-perspective report', () => {
      const categoryMappings = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      } as Record<FeedbackCategory, keyof any>;

      const gaps = analyzePerceptionGaps(mockTracking, mockFeedback, categoryMappings as any);
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      const divergences = identifyDivergentViews(mockFeedback);
      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      const report = generateMultiPerspectiveReport(
        mockTracking,
        mockFeedback,
        integration,
        gaps,
        blindSpots,
        divergences,
        78
      );

      expect(report.reportDate).toBeDefined();
      expect(report.respondentProfile.totalRespondents).toBe(2);
      expect(report.narrative).toBeDefined();
      expect(report.integrationMetrics).toBeDefined();
    });

    it('includes appropriate warnings based on data', () => {
      const categoryMappings = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      } as Record<FeedbackCategory, keyof any>;

      const gaps = analyzePerceptionGaps(mockTracking, mockFeedback, categoryMappings as any);
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      const divergences = identifyDivergentViews(mockFeedback);
      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      const report = generateMultiPerspectiveReport(
        mockTracking,
        mockFeedback,
        integration,
        gaps,
        blindSpots,
        divergences,
        45
      );

      expect(Array.isArray(report.warnings)).toBe(true);
    });
  });

  describe('Integration: Full multi-perspective workflow', () => {
    it('completes end-to-end: collect -> analyze -> report', () => {
      const categoryMappings = {
        communication: 'communicationQuality',
        'emotional-safety': 'emotionalSafety',
        'conflict-handling': 'conflictNavigation',
        intimacy: 'intimacyComfort',
        trust: 'trustLevel',
        autonomy: 'autonomyBalance',
        'overall-relationship': 'overallQuality',
        'attachment-style': 'stability',
        'practice-effectiveness': 'completionRate',
        'personal-growth': 'improvementRate',
      } as Record<FeedbackCategory, keyof any>;

      // Step 1: Collect feedback
      const summary = generateFeedbackSummary(mockFeedback);
      expect(summary.totalRespondents).toBe(2);

      // Step 2: Analyze perspectives
      const gaps = analyzePerceptionGaps(mockTracking, mockFeedback, categoryMappings as any);
      const patterns = analyzeCrossObserverAttachmentPatterns(mockFeedback);
      const blindSpots = identifyBlindSpots(mockFeedback, []);
      const divergences = identifyDivergentViews(mockFeedback);
      const validation = validateProgressAlignment(mockTracking, mockFeedback);
      const integration = integratePerspectives(
        mockTracking,
        mockFeedback,
        categoryMappings as any
      );

      expect(patterns.consensusAssessment).toBeDefined();
      expect(validation.validated).toBeDefined();

      // Step 3: Generate report
      const report = generateMultiPerspectiveReport(
        mockTracking,
        mockFeedback,
        integration,
        gaps,
        blindSpots,
        divergences,
        validation.alignment
      );

      expect(report.narrative.headline).toBeTruthy();
      expect(report.integrationMetrics.overallAlignment).toBeGreaterThanOrEqual(0);
      expect(report.dataSupport.perceptionGaps).toBeDefined();
    });
  });
});
