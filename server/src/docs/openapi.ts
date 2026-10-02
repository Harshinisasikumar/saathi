import type { OpenAPIV3 } from 'openapi-types';

/**
 * OpenAPI 3.0 description of the Saathi API. Served at `/api-docs` via
 * Swagger UI (see `app.ts`). Written by hand so every endpoint, param and
 * schema stays reviewable in the repo.
 */
export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Saathi — Family Career Counselling API',
    version: '1.0.0',
    description:
      'AI-enabled career counselling and family decision-support for vocational education (hackathon prototype).\n\n' +
      'All data shown is synthetic demo data with provenance citations; the counsellor never invents figures.',
  },
  servers: [{ url: '/api', description: 'API root (same-origin in production)' }],
  paths: {
    '/health': {
      get: {
        summary: 'Service health check',
        responses: {
          200: {
            description: 'OK',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Health' },
              },
            },
          },
        },
      },
    },
    '/meta': {
      get: {
        summary: 'Static bootstrap config for the client',
        responses: {
          200: {
            description: 'Meta response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Meta' },
              },
            },
          },
        },
      },
    },
    '/users': {
      post: {
        summary: 'Create a counselling session',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userType', 'lang'],
                properties: {
                  userType: { $ref: '#/components/schemas/UserType' },
                  lang: { $ref: '#/components/schemas/Lang' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Session created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionCreated' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/users/{sessionId}/learner-profile': {
      put: {
        summary: 'Save the learner profile',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LearnerProfile' },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile saved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OkResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/users/{sessionId}/parent-profile': {
      put: {
        summary: 'Save the parent profile',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParentProfile' },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile saved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OkResponse' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/assessment': {
      post: {
        summary: 'Submit assessment answers and get the career-interest snapshot',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'answers'],
                properties: {
                  sessionId: { type: 'string' },
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string' },
                        value: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Snapshot computed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    sessionId: { type: 'string' },
                    snapshot: { $ref: '#/components/schemas/InterestSnapshot' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/parent-concerns': {
      post: {
        summary: 'Classify a parent concern (English or Tamil)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'text'],
                properties: {
                  sessionId: { type: 'string' },
                  text: { type: 'string', example: 'இந்த course படித்த பிறகு வேலை கிடைக்குமா?' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Concern classified and stored',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConcernResult' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/chat': {
      post: {
        summary: 'Ask the AI counsellor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'message'],
                properties: {
                  sessionId: { type: 'string' },
                  message: {
                    type: 'string',
                    example: 'What can someone earn after electrician training?',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Counsellor reply',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatReply' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/chat/{sessionId}': {
      get: {
        summary: 'Chat history for a session',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Message list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatHistory' },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/trades': {
      get: {
        summary: 'List demo trades (optionally filtered by district)',
        parameters: [
          {
            name: 'district',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Trade list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    demoNotice: { $ref: '#/components/schemas/DemoNotice' },
                    trades: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TradeSummary' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/trades/{id}': {
      get: {
        summary: 'Full trade record with outcomes and providers',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Trade record',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    trade: { type: 'object' },
                    outcomes: { type: 'array', items: { type: 'object' } },
                    providers: { type: 'array', items: { type: 'object' } },
                    source: { $ref: '#/components/schemas/Source' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/providers': {
      get: {
        summary: 'List training providers (optionally filtered by district)',
        parameters: [
          {
            name: 'district',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Provider list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    demoNotice: { type: 'string' },
                    providers: { type: 'array', items: { $ref: '#/components/schemas/Provider' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/compare': {
      post: {
        summary: 'Side-by-side trade comparison (never a single best career)',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  snapshot: { $ref: '#/components/schemas/InterestSnapshot' },
                  district: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Comparison view',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    header: { type: 'array', items: { type: 'object' } },
                    rows: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/scorecard': {
      post: {
        summary: 'Family Decision Scorecard (per-factor levels)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['concernCategory'],
                properties: {
                  snapshot: { $ref: '#/components/schemas/InterestSnapshot' },
                  concernCategory: { type: 'string' },
                  district: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Scorecard cells',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Scorecard' },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
        },
      },
    },
    '/pathway': {
      get: {
        summary: 'Possible career pathway for a trade',
        parameters: [
          {
            name: 'tradeId',
            in: 'query',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Pathway view',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    steps: { type: 'array', items: { type: 'object' } },
                    nsqfVerified: { type: 'boolean' },
                    caveat: { type: 'object' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/escalation': {
      post: {
        summary: 'Request a human counsellor follow-up',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId', 'language', 'concernCategory', 'contactMethod', 'preferredTime'],
                properties: {
                  sessionId: { type: 'string' },
                  language: { $ref: '#/components/schemas/Lang' },
                  concernCategory: { type: 'string' },
                  contactMethod: { type: 'string' },
                  preferredTime: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Escalation recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    escalationId: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/dashboard': {
      get: {
        summary: 'Aggregated admin analytics (no PII)',
        security: [{ basicAuth: [] }],
        responses: {
          200: {
            description: 'Aggregated stats',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminStats' },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      basicAuth: { type: 'http', scheme: 'basic' },
    },
    responses: {
      BadRequest: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Missing or invalid credentials',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { error: { type: 'string' } },
            },
          },
        },
      },
    },
    schemas: {
      Lang: { type: 'string', enum: ['en', 'ta'] },
      UserType: { type: 'string', enum: ['learner', 'parent', 'joint'] },
      Health: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          service: { type: 'string' },
          demoMode: { type: 'boolean' },
          ts: { type: 'string' },
        },
      },
      Meta: {
        type: 'object',
        properties: {
          demoMode: { type: 'boolean' },
          demoNotice: { $ref: '#/components/schemas/DemoNotice' },
          districts: { type: 'array', items: { type: 'object' } },
          concernLabels: { type: 'object' },
          assessmentQuestions: { type: 'array', items: { type: 'object' } },
        },
      },
      DemoNotice: {
        type: 'object',
        properties: {
          en: { type: 'string' },
          ta: { type: 'string' },
        },
      },
      SessionCreated: {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          userType: { $ref: '#/components/schemas/UserType' },
          lang: { $ref: '#/components/schemas/Lang' },
        },
      },
      OkResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          sessionId: { type: 'string' },
        },
      },
      LearnerProfile: {
        type: 'object',
        properties: {
          age: { type: 'integer', nullable: true },
          gender: { type: 'string', nullable: true },
          education: { type: 'string', nullable: true },
          academicBackground: { type: 'string', nullable: true },
          interests: { type: 'array', items: { type: 'string' } },
          preferredWorkType: { type: 'array', items: { type: 'string' } },
          learningPreference: { type: 'string', nullable: true },
          preferredLocation: { type: 'string', nullable: true },
          state: { type: 'string' },
          district: { type: 'string' },
          urbanity: { type: 'string', enum: ['urban', 'semiurban', 'rural', 'unspecified'] },
          careerGoals: { type: 'string', nullable: true },
        },
      },
      ParentProfile: {
        type: 'object',
        properties: {
          state: { type: 'string' },
          district: { type: 'string' },
          incomeBracket: { type: 'string', nullable: true },
          primaryConcern: { type: 'string', nullable: true },
          maxDistanceKm: { type: 'integer', nullable: true },
          preference: { type: 'string', nullable: true },
        },
      },
      InterestSnapshot: {
        type: 'object',
        properties: {
          interestWeights: { type: 'object', additionalProperties: { type: 'number' } },
          workPrefs: { type: 'array', items: { type: 'string' } },
          learningPref: { type: 'string', nullable: true },
          tradeScores: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tradeId: { type: 'string' },
                score: { type: 'number', format: 'float' },
                reasons: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
      ConcernResult: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          concernId: { type: 'string' },
          category: { type: 'string' },
          label: { type: 'object' },
          detectedLang: { $ref: '#/components/schemas/Lang' },
          confidence: { type: 'number', format: 'float' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          rawText: { type: 'string' },
        },
      },
      ChatReply: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          reply: { type: 'string' },
          intent: { type: 'string' },
          structured: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              evidence: { type: 'array', items: { type: 'string' } },
              forFamily: { type: 'string' },
              notKnown: { type: 'array', items: { type: 'string' } },
              sources: { type: 'array', items: { $ref: '#/components/schemas/Source' } },
              demoNotice: { type: 'string' },
            },
          },
          detectedLang: { $ref: '#/components/schemas/Lang' },
          escalate: { type: 'boolean' },
          escalateReason: { type: 'string', nullable: true },
        },
      },
      ChatHistory: {
        type: 'object',
        properties: {
          messages: { type: 'array', items: { type: 'object' } },
        },
      },
      TradeSummary: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          code: { type: 'string' },
          name: { $ref: '#/components/schemas/DemoNotice' },
          oneLine: { $ref: '#/components/schemas/DemoNotice' },
          durationMonths: { type: 'integer' },
          nsqfEntry: { type: 'integer' },
          eligibility: { type: 'object' },
          roles: { type: 'array', items: { type: 'object' } },
          earningsDemo: { type: 'string' },
          localOutcome: { type: 'string' },
          providerCountLocal: { type: 'integer' },
        },
      },
      Provider: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          scheme: { type: 'string' },
          nsqfAffiliated: { type: 'boolean' },
          accreditation: { type: 'object' },
          tradeIds: { type: 'array', items: { type: 'string' } },
          districtName: { type: 'object' },
          tradeNames: { type: 'array', items: { type: 'object' } },
          publicPhone: { type: 'string' },
          centreCode: { type: 'string' },
        },
      },
      Source: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          url: { type: 'string', nullable: true },
          dataPeriod: { type: 'string' },
          verificationStatus: { type: 'string' },
          nature: { type: 'string', enum: ['verified', 'demo'] },
        },
      },
      Scorecard: {
        type: 'object',
        properties: {
          learnerInterest: { $ref: '#/components/schemas/ScorecardCell' },
          familyConcerns: { $ref: '#/components/schemas/ScorecardCell' },
          trainingAccessibility: { $ref: '#/components/schemas/ScorecardCell' },
          careerPathwayEvidence: { $ref: '#/components/schemas/ScorecardCell' },
          localOpportunityEvidence: { $ref: '#/components/schemas/ScorecardCell' },
          dataConfidence: { $ref: '#/components/schemas/ScorecardCell' },
          parentConcern: { type: 'object' },
        },
      },
      ScorecardCell: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW', 'LIMITED', 'UNAVAILABLE'] },
          label: { $ref: '#/components/schemas/DemoNotice' },
          explanation: { type: 'array', items: { $ref: '#/components/schemas/DemoNotice' } },
        },
      },
      AdminStats: {
        type: 'object',
        properties: {
          stats: { type: 'object' },
          demoNote: { type: 'string' },
        },
      },
    },
  },
};