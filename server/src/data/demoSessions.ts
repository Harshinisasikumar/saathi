import type {
  ConcernRecord,
  LearnerProfileRecord,
  ParentProfileRecord,
  SessionRecord,
} from '../domain/types.js';

/**
 * Synthetic sample sessions so the admin dashboard is demonstrable in a
 * 3–5 minute walkthrough. These are clearly demonstration records and are
 * never attributed to real individuals.
 */

function hh(id: string): string {
  const t = Date.now() % 100000;
  return `${id}-${t}`;
}

export function buildDemoSessions() {
  const now = new Date().toISOString();
  const rows: Array<{
    session: SessionRecord;
    learner?: LearnerProfileRecord;
    parent?: ParentProfileRecord;
    concern: ConcernRecord;
  }> = [];

  const de = (id: string, district: string): string => id;

  const add = (
    district: string,
    userType: SessionRecord['userType'],
    category: ConcernRecord['category'],
    lang: ConcernRecord['detectedLang'],
    rawText: string,
    confidence: number,
  ) => {
    const sessionId = de(`demo-${district}-${category}`, district);
    const cid = hh(sessionId);
    rows.push({
      session: {
        id: sessionId,
        userType,
        lang,
        createdAt: now,
      },
      learner:
        userType === 'learner' || userType === 'joint'
          ? {
              sessionId,
              age: 18,
              gender: null,
              education: 'class_12',
              academicBackground: 'science',
              interests: ['electronics', 'computers'],
              preferredWorkType: ['hands-on'],
              learningPreference: 'practical',
              preferredLocation: district,
              state: 'Tamil Nadu',
              district,
              urbanity: 'semiurban',
              careerGoals: 'stable job',
            }
          : undefined,
      parent:
        userType === 'parent' || userType === 'joint'
          ? {
              sessionId,
              state: 'Tamil Nadu',
              district,
              incomeBracket: '15000-25000',
              primaryConcern: category,
              maxDistanceKm: 25,
              preference: 'job_immediate',
            }
          : undefined,
      concern: {
        id: cid,
        sessionId,
        rawText,
        detectedLang: lang,
        category,
        confidence,
        severity: confidence > 0.7 ? 'high' : 'medium',
        createdAt: now,
      },
    });
  };

  add('salem', 'joint', 'career_growth', 'ta', 'Degree இல்லாமல் futureல growth இருக்குமா?', 0.86);
  add('salem', 'parent', 'job_security', 'ta', 'இந்த course படித்த பிறகு வேலை கிடைக்குமா?', 0.92);
  add('erode', 'parent', 'income', 'ta', 'சம்பளம் போதுமானதா?', 0.78);
  add('coimbatore', 'learner', 'job_security', 'en', 'Will I get a job after CNC training?', 0.88);
  add('madurai', 'parent', 'social_perception', 'ta', 'வீட்டில படிப்பு இல்லைன்னு சொல்வாங்களா?', 0.71);
  add('trichy', 'learner', 'further_education', 'en', 'Can I do higher studies after this course?', 0.8);
  add('chennai', 'joint', 'training_quality', 'en', 'Is the training centre quality good?', 0.66);
  add('tirunelveli', 'parent', 'distance', 'ta', 'இந்த ITI ரொம்ப தூரமா இருக்கு', 0.6);
  add('vellore', 'parent', 'safety', 'ta', 'வேலை பாதுகாப்பாக இருக்குமா?', 0.64);
  add('salem', 'learner', 'placement', 'en', 'What placement support is available?', 0.74);
  add('thanjavur', 'parent', 'other', 'ta', 'பொதுவான கேள்வி', 0.5);

  return rows;
}