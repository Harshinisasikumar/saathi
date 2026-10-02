/**
 * Career Interest Snapshot questions.
 *
 * Explicitly NOT a scientifically validated psychological test — it is a
 * lightweight interest profile for the prototype.
 */

export interface AssessmentQuestion {
  id: string;
  type: 'single' | 'multi';
  prompt: { en: string; ta: string };
  options: Array<{ value: string; label: { en: string; ta: string } }>;
}

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'interests',
    type: 'multi',
    prompt: {
      en: 'Which of these areas does the learner find most interesting? (choose up to 3)',
      ta: 'கற்பவருக்கு எந்தெந்த பகுதிகள் மிகவும் ஆர்வமாக உள்ளன? (அதிகபட்சம் 3)',
    },
    options: [
      { value: 'electronics', label: { en: 'Electronics', ta: 'எலக்ட்ரானிக்ஸ்' } },
      { value: 'mechanical', label: { en: 'Mechanical work / machines', ta: 'இயந்திர வேலை' } },
      { value: 'computers', label: { en: 'Computers', ta: 'கணினி' } },
      { value: 'construction', label: { en: 'Construction / buildings', ta: 'கட்டுமானம்' } },
      { value: 'automotive', label: { en: 'Automotive / vehicles', ta: 'வாகனங்கள்' } },
      { value: 'electrical', label: { en: 'Electrical work', ta: 'மின்சார வேலை' } },
      { value: 'healthcare', label: { en: 'Healthcare support', ta: 'சுகாதார உதவி' } },
      { value: 'agriculture', label: { en: 'Agriculture / farming', ta: 'விவசாயம்' } },
      { value: 'design', label: { en: 'Design / creative', ta: 'வடிவமைப்பு' } },
      { value: 'renewable_energy', label: { en: 'Renewable energy', ta: 'புதுப்பிக்கத்தக்க ஆற்றல்' } },
    ],
  },
  {
    id: 'workpref',
    type: 'multi',
    prompt: {
      en: 'What kind of work does the learner prefer?',
      ta: 'கற்பவர் எந்த வகையான வேலையை விரும்புகிறார்?',
    },
    options: [
      { value: 'hands_on', label: { en: 'Hands-on / practical', ta: 'கைகளால் செய்யும் வேலை' } },
      { value: 'computer_based', label: { en: 'Computer-based', ta: 'கணினி சார்ந்த' } },
      { value: 'field_work', label: { en: 'Field work / outdoors', ta: 'வெளிப்புற வேலை' } },
      { value: 'workshop', label: { en: 'Workshop / factory', ta: 'பட்டறை / தொழிற்சாலை' } },
      { value: 'office', label: { en: 'Office', ta: 'அலுவலகம்' } },
      { value: 'customer_facing', label: { en: 'Customer-facing', ta: 'வாடிக்கையாளர் எதிர் பணி' } },
    ],
  },
  {
    id: 'learning',
    type: 'single',
    prompt: {
      en: 'How does the learner learn best?',
      ta: 'கற்பவர் எப்படி நன்றாக கற்கிறார்?',
    },
    options: [
      { value: 'practical', label: { en: 'Practical / doing', ta: 'நடைமுறை / செய்வது' } },
      { value: 'theory', label: { en: 'Theory / studying', ta: 'கோட்பாடு / படிப்பது' } },
      { value: 'mixed', label: { en: 'Mixed', ta: 'கலவை' } },
    ],
  },
  {
    id: 'toolsmanship',
    type: 'single',
    prompt: {
      en: 'Does the learner enjoy working with tools and machines?',
      ta: 'கற்பவர் கருவிகள் மற்றும் இயந்திரங்களுடன் வேலை செய்ய விரும்புகிறாரா?',
    },
    options: [
      { value: 'yes', label: { en: 'Yes, very much', ta: 'ஆம், மிகவும்' } },
      { value: 'somewhat', label: { en: 'Somewhat', ta: 'ஓரளவு' } },
      { value: 'no', label: { en: 'Not really', ta: 'அதிகம் இல்லை' } },
    ],
  },
  {
    id: 'outdoors',
    type: 'single',
    prompt: {
      en: 'How comfortable is the learner with outdoor or height work?',
      ta: 'கற்பவர் வெளிப்புறம் அல்லது உயரத்தில் வேலை செய்வதில் எவ்வளவு வசதியாக உள்ளார்?',
    },
    options: [
      { value: 'comfortable', label: { en: 'Comfortable', ta: 'வசதியாக' } },
      { value: 'okay', label: { en: 'Okay sometimes', ta: 'சில நேரங்களில்' } },
      { value: 'avoid', label: { en: 'Would prefer to avoid', ta: 'தவிர்க்க விரும்புகிறேன்' } },
    ],
  },
  {
    id: 'priority',
    type: 'single',
    prompt: {
      en: 'What matters most in the first job after training?',
      ta: 'பயிற்சிக்குப் பிறகு முதல் வேலையில் எது முக்கியம்?',
    },
    options: [
      { value: 'salary', label: { en: 'Monthly salary', ta: 'மாத சம்பளம்' } },
      { value: 'regular_job', label: { en: 'A regular, steady job', ta: 'நிலையான வேலை' } },
      { value: 'learning_skills', label: { en: 'Learning new skills', ta: 'புதிய திறன்கள் கற்க' } },
      { value: 'near_home', label: { en: 'Near home', ta: 'வீட்டிற்கு அருகில்' } },
      { value: 'growth', label: { en: 'Growth / promotion chances', ta: 'வளர்ச்சி வாய்ப்பு' } },
    ],
  },
];