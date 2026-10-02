import type {
  Metric,
  OutcomeRecord,
  Provider,
  SourceRecord,
  Trade,
} from '../domain/types.js';

/**
 * Seed dataset for the hackathon prototype.
 *
 * Accuracy rule: every figure below is DEMONSTRATION DATA. Nothing here is an
 * official government statistic. All metrics use `synthetic_baseline`
 * provenance and the single DEMO_SOURCE citation, so the UI can never present
 * a synthetic number as verified evidence.
 */

export const DEMO_SOURCE: SourceRecord = {
  id: 'demo-dataset',
  name: 'Hackathon Demo Dataset (synthetic — not official statistics)',
  url: null,
  dataPeriod: '2024 (prototype)',
  nature: 'demo',
  note: 'Demo data — for prototype demonstration only.',
};

export const DEMO_NOTICE = {
  en: 'Demo data — for prototype demonstration only. These figures are synthetic and are NOT official statistics.',
  ta: 'டெமோ தரவு — முன்னோட்ட ஆர்ப்பாட்டத்திற்கு மட்டும். இந்த எண்கள் செயற்கையானவை, அதிகாரப்பூர்வ புள்ளிவிவரங்கள் அல்ல.',
};

const B = {
  en: 'Demo data — for prototype demonstration only',
  ta: 'டெமோ தரவு — முன்னோட்ட ஆர்ப்பாட்டத்திற்கு மட்டும்',
};

/** Build a synthetic demo metric with the mandatory citation strip. */
function M(
  value: number,
  unit: Metric['unit'],
  sampleSize: number,
  window: string,
): Metric {
  return {
    value,
    unit,
    sampleSize,
    window,
    provenance: 'synthetic_baseline',
    sourceLabel: B,
    lastVerified: '2024-12-01',
  };
}

export const SOURCES: SourceRecord[] = [DEMO_SOURCE];

export const TRADES: Trade[] = [
  {
    id: 'electrician',
    code: 'DGT-DEMO-ELE',
    name: { en: 'Electrician', ta: 'எலக்ட்ரீஷியன் (மின்சார தொழில்நுட்பர்)' },
    category: 'electrical',
    oneLine: {
      en: 'Installs, tests and repairs wiring, switchboards and electrical fittings in homes, shops and buildings.',
      ta: 'வீடுகள், கடைகள், கட்டிடங்களில் மின் வயரிங், சுவிட்ச் பலகை மற்றும் மின் சாதனங்களை அமைத்தல், சோதனை மற்றும் பழுது நீக்குதல்.',
    },
    dayInLife: {
      en: 'A day may involve reading a wiring diagram, fitting a distribution board, checking safety earthing, and repairing a fault in a shop or a newly built house.',
      ta: 'ஒரு நாளில் வயரிங் வரைபடம் படித்தல், டிஸ்ட்ரிபியூஷன் போர்டு பொருத்துதல், பாதுகாப்பு அர்த்திங் சரிபார்த்தல், கடை அல்லது புதிய வீட்டில் கோளாறு சரிசெய்தல் ஆகியவை அடங்கும்.',
    },
    nsqfEntry: 3,
    nsqfCeiling: 5,
    roles: [
      {
        title: { en: 'Electrician / Wireman', ta: 'எலக்ட்ரீஷியன் / வயர்மேன்' },
        nsqfLevel: 4,
        employers: { en: 'Electrical contractors, facility firms, builders', ta: 'மின் ஒப்பந்ததாரர்கள், வசதி நிறுவனங்கள், கட்டுமான நிறுவனங்கள்' },
      },
      {
        title: { en: 'Electrical Supervisor', ta: 'மின் மேற்பார்வையாளர்' },
        nsqfLevel: 5,
        employers: { en: 'Construction firms, maintenance departments', ta: 'கட்டுமான நிறுவனங்கள், பராமரிப்புத் துறைகள்' },
      },
    ],
    ladder: [
      {
        nsqfLevel: 4,
        title: { en: 'Electrician', ta: 'எலக்ட்ரீஷியன்' },
        yearsFromEntry: 0,
        role: { en: 'Trainee → journeyman electrician', ta: 'பயிற்சியாளர் → திறன் மின்சாரத் தொழிலாளி' },
        earnings: M(15000, 'inr_per_month', 120, '6–12 months post-training, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'Supervisor / self-employed contractor', ta: 'மேற்பார்வையாளர் / சுய தொழில் ஒப்பந்ததாரர்' },
        yearsFromEntry: 3,
        role: { en: 'Team lead or own wiring contracts', ta: 'குழு தலைவர் அல்லது சொந்த வயரிங் ஒப்பந்தங்கள்' },
        earnings: M(22000, 'inr_per_month', 60, '3+ years experience, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'Advanced certification / further study', ta: 'மேம்பட்ட சான்றிதழ் / மேல்படிப்பு' },
        yearsFromEntry: 5,
        role: { en: 'Upskill via electrician supervisor course or diploma', ta: 'மின் மேற்பார்வை படிப்பு அல்லது டிப்ளமோ மூலம் மேம்பாடு' },
        earnings: M(26000, 'inr_per_month', 40, '5+ years, demo'),
      },
    ],
    eligibility: {
      minEducation: { en: 'Class 8 or Class 10 pass (varies by centre)', ta: '8ஆம் வகுப்பு அல்லது 10ஆம் வகுப்பு தேர்ச்சி (மையத்திற்கு ஏற்ப மாறும்)' },
      preferredStream: { en: 'Science/Mathematics helpful, not mandatory', ta: 'அறிவியல்/கணிதம் பயனுள்ளதாக இருக்கும், கட்டாயமில்லை' },
    },
    typicalDurationMonths: 12,
    fee: M(8000, 'inr_total', 1, 'typical govt ITI tuition for 1 year, demo'),
    safety: {
      en: 'Working on live or high-voltage systems carries real electrical safety risks. Proper training, PPE and supervision are required.',
      ta: 'மின் அழுத்தமுள்ள அமைப்புகளில் வேலை செய்வது உண்மையான மின் பாதுகாப்பு அபாயங்களை கொண்டுள்ளது. சரியான பயிற்சி, பாதுகாப்பு உபகரணங்கள் மற்றும் மேற்பார்வை தேவை.',
    },
    perceptionNote: {
      en: 'Electrician work is skilled technical work; demand exists in both urban and rural areas through contractors and facility maintenance.',
      ta: 'எலக்ட்ரீஷியன் பணி திறன் வாய்ந்த தொழில்நுட்ப வேலை; நகரம் மற்றும் கிராமங்களில் ஒப்பந்ததாரர்கள் மற்றும் வசதி பராமரிப்பு மூலம் தேவை உள்ளது.',
    },
    sensitiveTo: ['job_security', 'income', 'social_perception', 'safety'],
  },
  {
    id: 'cnc-operator',
    code: 'DGT-DEMO-CNC',
    name: { en: 'CNC Operator', ta: 'CNC இயந்திர இயக்குநர்' },
    category: 'mechanical',
    oneLine: {
      en: 'Sets up and operates computer-controlled machine tools that cut and shape metal parts used in engineering and manufacturing.',
      ta: 'பொறியியல் மற்றும் உற்பத்தியில் பயன்படும் உலோக பாகங்களை வெட்டி வடிவமைக்கும் கணினி கட்டுப்பாட்டு இயந்திரங்களை அமைத்து இயக்குதல்.',
    },
    dayInLife: {
      en: 'Reading a job drawing, loading a program, setting tools, running a production batch of components and checking dimensions for the factory quality team.',
      ta: 'ஜாப் டிராயிங் படித்தல், நிரல் ஏற்றுதல், கருவிகள் அமைத்தல், உற்பத்தி தொகுதி இயக்குதல், தரக் குழுவிற்கு அளவுகளை சரிபார்த்தல்.',
    },
    nsqfEntry: 4,
    nsqfCeiling: 5,
    roles: [
      {
        title: { en: 'CNC Operator', ta: 'CNC இயக்குநர்' },
        nsqfLevel: 4,
        employers: { en: 'Machine shops, auto ancillaries, tool rooms', ta: 'இயந்திர சேவைக் கூடங்கள், ஆட்டோ உதிரி நிறுவனங்கள், கருவி அறைகள்' },
      },
      {
        title: { en: 'CNC Setter / Programmer', ta: 'CNC செட்டர் / புரோகிராமர்' },
        nsqfLevel: 5,
        employers: { en: 'Engineering units, job shops', ta: 'பொறியியல் அலகுகள், சிறு தொழிற்சாலைகள்' },
      },
    ],
    ladder: [
      {
        nsqfLevel: 4,
        title: { en: 'CNC Operator', ta: 'CNC இயக்குநர்' },
        yearsFromEntry: 0,
        role: { en: 'Machine operation in a factory', ta: 'தொழிற்சாலையில் இயந்திர இயக்கம்' },
        earnings: M(16000, 'inr_per_month', 90, '6–12 months post-training, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'CNC Setter / Programmer', ta: 'CNC செட்டர் / புரோகிராமர்' },
        yearsFromEntry: 3,
        role: { en: 'Setting tools, editing programs', ta: 'கருவிகள் அமைத்தல், நிரல்கள் திருத்துதல்' },
        earnings: M(21000, 'inr_per_month', 45, '3+ years, demo'),
      },
    ],
    eligibility: {
      minEducation: { en: 'Class 10 or Class 12 pass', ta: '10ஆம் வகுப்பு அல்லது 12ஆம் வகுப்பு தேர்ச்சி' },
      preferredStream: { en: 'Mathematics/Physics recommended', ta: 'கணிதம்/இயற்பியல் பரிந்துரைக்கப்படுகிறது' },
    },
    typicalDurationMonths: 12,
    fee: M(9000, 'inr_total', 1, 'typical govt ITI tuition for 1 year, demo'),
    safety: {
      en: 'Moving machines, swarf and coolant require factory safety discipline. Retinal injury and crush hazards exist without guards and correct procedure.',
      ta: 'இயங்கும் இயந்திரங்கள், உலோகத் துகள்கள், குளிரூட்டிகள் தொழிற்சாலை பாதுகாப்பு ஒழுக்கம் தேவை. பாதுகாப்பு கவசம் இல்லாமல் காயம் ஏற்படும் ஆபத்து உள்ளது.',
    },
    perceptionNote: {
      en: 'CNC work is factory-based and is seen as a technical, skilled-manufacturing career with structured shifts.',
      ta: 'CNC வேலை தொழிற்சாலை சார்ந்தது; முறையான ஷிப்ட்களுடன் திறன் வாய்ந்த உற்பத்தி தொழிலாக கருதப்படுகிறது.',
    },
    sensitiveTo: ['job_security', 'income', 'further_education'],
  },
  {
    id: 'solar-pv',
    code: 'SSC-DEMO-SOL',
    name: { en: 'Solar PV Technician', ta: 'சோலார் PV தொழில்நுட்பர்' },
    category: 'energy_green',
    oneLine: {
      en: 'Installs, connects and services rooftop solar panels, inverters and battery systems so homes and businesses can use solar power.',
      ta: 'வீடுகள் மற்றும் வணிகங்களில் சூரிய சக்தியை பயன்படுத்தும் வகையில் மேற்கூரை சோலார் பேனல்கள், இன்வெர்ட்டர்கள் மற்றும் பேட்டரி அமைப்புகளை நிறுவுதல், இணைத்தல், பராமரித்தல்.',
    },
    dayInLife: {
      en: 'Measuring a rooftop, mounting panels, wiring strings to the inverter, commissioning a system and explaining the bill saving to the owner.',
      ta: 'மேற்கூரை அளவிடல், பேனல்கள் பொருத்துதல், இன்வெர்ட்டருக்கு வயரிங் செய்தல், அமைப்பை இயக்குதல், உரிமையாளருக்கு மின் கட்டண சேமிப்பை விளக்குதல்.',
    },
    nsqfEntry: 4,
    nsqfCeiling: 5,
    roles: [
      {
        title: { en: 'Solar PV Installer', ta: 'சோலார் PV நிறுவுநர்' },
        nsqfLevel: 4,
        employers: { en: 'Solar EPC installers, renewable energy firms', ta: 'சோலார் EPC நிறுவுநர்கள், புதுப்பிக்கத்தக்க ஆற்றல் நிறுவனங்கள்' },
      },
      {
        title: { en: 'Solar Technician / Site Lead', ta: 'சோலார் தொழில்நுட்பர் / தள தலைவர்' },
        nsqfLevel: 5,
        employers: { en: 'Renewable energy service providers, utilities', ta: 'புதுப்பிக்கத்தக்க ஆற்றல் சேவை வழங்குநர்கள், மின்சார பயனீட்டாளர்கள்' },
      },
    ],
    ladder: [
      {
        nsqfLevel: 4,
        title: { en: 'Solar PV Installer', ta: 'சோலார் PV நிறுவுநர்' },
        yearsFromEntry: 0,
        role: { en: 'Rooftop installation and connection', ta: 'மேற்கூரை நிறுவல் மற்றும் இணைப்பு' },
        earnings: M(15000, 'inr_per_month', 70, '6–12 months post-training, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'Site Lead / commissioning technician', ta: 'தள தலைவர் / டெக்னீஷியன்' },
        yearsFromEntry: 2,
        role: { en: 'System commissioning and service', ta: 'அமைப்பு இயக்கம் மற்றும் சேவை' },
        earnings: M(19500, 'inr_per_month', 35, '2+ years, demo'),
      },
    ],
    eligibility: {
      minEducation: { en: 'Class 10 or Class 12 pass', ta: '10ஆம் வகுப்பு அல்லது 12ஆம் வகுப்பு தேர்ச்சி' },
      preferredStream: { en: 'Science/Physics recommended', ta: 'அறிவியல்/இயற்பியல் பரிந்துரைக்கப்படுகிறது' },
    },
    typicalDurationMonths: 9,
    fee: M(7000, 'inr_total', 1, 'typical short-term scheme course fee, demo'),
    safety: {
      en: 'Working at height on rooftops and handling electrical DC power has fall and shock risks. Helmet, harnesses and DC-safe training are essential.',
      ta: 'மேற்கூரையில் உயரத்தில் வேலை மற்றும் DC மின்சக்தி கையாள்வதில் விழும் மற்றும் மின்சார அதிர்ச்சி ஆபத்துகள் உள்ளன. helmet, ஹார்னஸ் மற்றும் DC-பாதுகாப்பு பயிற்சி அவசியம்.',
    },
    perceptionNote: {
      en: 'Solar is a growing, government-supported green-energy field in India with both installation and service roles.',
      ta: 'சோலார் என்பது இந்தியாவில் வளர்ந்து வரும், அரசு ஆதரவுடன் கூடிய பசுமை ஆற்றல் துறை; நிறுவல் மற்றும் சேவை வேலைகள் இரண்டும் உள்ளன.',
    },
    sensitiveTo: ['job_security', 'income', 'further_education', 'safety'],
  },
  {
    id: 'electronics',
    code: 'DGT-DEMO-ETC',
    name: { en: 'Electronics Technician', ta: 'எலக்ட்ரானிக்ஸ் தொழில்நுட்பர்' },
    category: 'digital',
    oneLine: {
      en: 'Builds, tests and repairs electronic devices and circuits used in appliances, communication equipment and consumer products.',
      ta: 'வீட்டு உபயோகப் பொருட்கள், தகவல் தொடர்பு கருவிகள் மற்றும் நுகர்வோர் பொருட்களில் பயன்படும் மின்னணு சாதனங்கள் மற்றும் சுற்றுகளை உருவாக்குதல், சோதனை, பழுது நீக்குதல்.',
    },
    dayInLife: {
      en: 'Diagnosing a fault on a printed circuit board, using a multimeter, soldering components, and testing a repaired device against specifications.',
      ta: 'பிரிண்டட் சர்க்யூட் போர்டில் கோளாறை கண்டறிதல், மல்டிமீட்டர் பயன்படுத்தல், கூறுகளை சாலிடரிங் செய்தல், பழுது நீக்கப்பட்ட சாதனத்தை சோதித்தல்.',
    },
    nsqfEntry: 4,
    nsqfCeiling: 5,
    roles: [
      {
        title: { en: 'Electronics Technician', ta: 'எலக்ட்ரானிக்ஸ் தொழில்நுட்பர்' },
        nsqfLevel: 4,
        employers: { en: 'Electronics service centres, appliance firms, manufacturing units', ta: 'எலக்ட்ரானிக்ஸ் சேவை மையங்கள், சாதன நிறுவனங்கள், உற்பத்தி அலகுகள்' },
      },
      {
        title: { en: 'Quality / service technician', ta: 'தரம் / சேவை தொழில்நுட்பர்' },
        nsqfLevel: 5,
        employers: { en: 'Consumer electronics brands, EMS units', ta: 'நுகர்வோர் எலக்ட்ரானிக்ஸ் பிராண்டுகள், EMS அலகுகள்' },
      },
    ],
    ladder: [
      {
        nsqfLevel: 4,
        title: { en: 'Electronics Technician', ta: 'எலக்ட்ரானிக்ஸ் தொழில்நுட்பர்' },
        yearsFromEntry: 0,
        role: { en: 'Repair and assembly tasks', ta: 'பழுது நீக்கம் மற்றும் இணைப்பு பணிகள்' },
        earnings: M(14500, 'inr_per_month', 80, '6–12 months post-training, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'Service / quality technician', ta: 'சேவை / தர தொழில்நுட்பர்' },
        yearsFromEntry: 3,
        role: { en: 'Higher-end repair, quality checks', ta: 'உயர் மட்ட பழுது, தர ஆய்வுகள்' },
        earnings: M(18500, 'inr_per_month', 40, '3+ years, demo'),
      },
    ],
    eligibility: {
      minEducation: { en: 'Class 10 or Class 12 pass', ta: '10ஆம் வகுப்பு அல்லது 12ஆம் வகுப்பு தேர்ச்சி' },
      preferredStream: { en: 'Physics/Mathematics recommended', ta: 'இயற்பியல்/கணிதம் பரிந்துரைக்கப்படுகிறது' },
    },
    typicalDurationMonths: 12,
    fee: M(8500, 'inr_total', 1, 'typical govt ITI tuition for 1 year, demo'),
    safety: {
      en: 'Soldering fumes, small parts and electrostatic discharge require bench discipline and basic safety training.',
      ta: 'சாலிடரிங் புகை, சிறிய பாகங்கள் மற்றும் நிலை மின்சாரம் குறித்த மேசை ஒழுக்கம் மற்றும் அடிப்படை பாதுகாப்பு பயிற்சி தேவை.',
    },
    perceptionNote: {
      en: 'Electronics service and assembly skills are used across appliance, telecom and manufacturing industries.',
      ta: 'எலக்ட்ரானிக்ஸ் சேவை மற்றும் இணைப்பு திறன்கள் உபகரண, தகவல் தொடர்பு மற்றும் உற்பத்தி துறைகளில் பயன்படுத்தப்படுகின்றன.',
    },
    sensitiveTo: ['income', 'job_security', 'further_education'],
  },
  {
    id: 'automotive',
    code: 'DGT-DEMO-AMT',
    name: { en: 'Automotive Service Technician', ta: 'ஆட்டோமோட்டிவ் சேவை தொழில்நுட்பர்' },
    category: 'automotive',
    oneLine: {
      en: 'Services and repairs cars, two-wheelers and light vehicles — mechanical systems, brakes, engines and electrical diagnosis.',
      ta: 'கார்கள், இருசக்கர வாகனங்கள் மற்றும் இலகு வாகனங்களில் இயந்திர, பிரேக், எஞ்சின் மற்றும் மின் கண்டறிதல் பழுது சேவைகள்.',
    },
    dayInLife: {
      en: 'Lifting a vehicle, carrying out a scheduled service, diagnosing a starting problem with a scanner, and replacing worn parts to spec.',
      ta: 'வாகனம் தூக்குதல், பரிந்துரைக்கப்பட்ட சேவை செய்தல், ஸ்கேனர் மூலம் ஸ்டார்ட்டிங் பிரச்சனையை கண்டறிதல், தேய்ந்த பாகங்களை மாற்றுதல்.',
    },
    nsqfEntry: 4,
    nsqfCeiling: 5,
    roles: [
      {
        title: { en: 'Automotive Service Technician', ta: 'ஆட்டோமோட்டிவ் சேவை தொழில்நுட்பர்' },
        nsqfLevel: 4,
        employers: { en: 'Dealer service workshops, multi-brand garages', ta: 'டீலர் சேவை பட்டறைகள், பல பிராண்ட் கேரேஜ்கள்' },
      },
      {
        title: { en: 'Senior Technician / Workshop Foreman', ta: 'மூத்த தொழில்நுட்பர் / பட்டறை மேற்பார்வையாளர்' },
        nsqfLevel: 5,
        employers: { en: 'Authorised service centres', ta: 'அங்கீகரிக்கப்பட்ட சேவை மையங்கள்' },
      },
    ],
    ladder: [
      {
        nsqfLevel: 4,
        title: { en: 'Service Technician', ta: 'சேவை தொழில்நுட்பர்' },
        yearsFromEntry: 0,
        role: { en: 'Scheduled service and repairs', ta: 'பரிந்துரைக்கப்பட்ட சேவை மற்றும் பழுதுகள்' },
        earnings: M(15000, 'inr_per_month', 85, '6–12 months post-training, demo'),
      },
      {
        nsqfLevel: 5,
        title: { en: 'Senior Technician / Foreman', ta: 'மூத்த தொழில்நுட்பர் / மேற்பார்வையாளர்' },
        yearsFromEntry: 4,
        role: { en: 'Advanced diagnosis, workshop supervision', ta: 'மேம்பட்ட கண்டறிதல், பட்டறை மேற்பார்வை' },
        earnings: M(21000, 'inr_per_month', 40, '4+ years, demo'),
      },
    ],
    eligibility: {
      minEducation: { en: 'Class 10 or Class 12 pass', ta: '10ஆம் வகுப்பு அல்லது 12ஆம் வகுப்பு தேர்ச்சி' },
      preferredStream: { en: 'No specific stream required', ta: 'குறிப்பிட்ட பிரிவு தேவையில்லை' },
    },
    typicalDurationMonths: 12,
    fee: M(8500, 'inr_total', 1, 'typical govt ITI tuition for 1 year, demo'),
    safety: {
      en: 'Heavy vehicles, hydraulic lifts, oils and spinning parts create real crush, burn and fire risks. Workshop PPE and procedure are mandatory.',
      ta: 'கனரக வாகனங்கள், ஹைட்ராலிக் லிஃப்ட்கள், எண்ணெய்கள் ஆகியவற்றால் காயம் மற்றும் தீ ஆபத்துகள் உள்ளன. பட்டறை பாதுகாப்பு கட்டாயம்.',
    },
    perceptionNote: {
      en: 'Vehicle ownership is rising in small towns, so service technicians are needed in both dealer networks and local workshops.',
      ta: 'சிறிய நகரங்களில் வாகன உரிமை அதிகரித்து வருவதால், டீலர் நெட்வொர்க்குகள் மற்றும் உள்ளூர் பட்டறைகள் இரண்டிலும் சேவை தொழில்நுட்பர்கள் தேவை.',
    },
    sensitiveTo: ['job_security', 'income', 'social_perception'],
  },
];

export const PROVIDERS: Provider[] = [
  {
    id: 'govt-iti-salem',
    name: 'Government ITI, Salem',
    districtId: 'salem',
    type: 'govt_iti',
    scheme: 'nsqf',
    nsqfAffiliated: true,
    accreditation: { en: 'Affiliated to DGT/NCVT (verify with centre)', ta: 'DGT/NCVT இணைப்பு (மையத்துடன் சரிபார்க்கவும்)' },
    tradeIds: ['electrician', 'electronics', 'automotive'],
    verifiedOn: '2024-11-01',
    publicPhone: '0000 000 000',
    centreCode: 'DEMO-TN-SAL-01',
  },
  {
    id: 'pmkvy-salem-solar',
    name: 'PMKVY 4.0 Skill Centre, Salem',
    districtId: 'salem',
    type: 'scheme_centre',
    scheme: 'pmkvy',
    nsqfAffiliated: true,
    accreditation: { en: 'PMKVY scheme centre (verify with centre)', ta: 'PMKVY திட்ட மையம் (மையத்துடன் சரிபார்க்கவும்)' },
    tradeIds: ['solar-pv'],
    verifiedOn: '2024-11-01',
    publicPhone: '0000 000 000',
    centreCode: 'DEMO-PMKVY-SAL',
  },
  {
    id: 'govt-iti-coimbatore',
    name: 'Government ITI, Coimbatore',
    districtId: 'coimbatore',
    type: 'govt_iti',
    scheme: 'nsqf',
    nsqfAffiliated: true,
    accreditation: { en: 'Affiliated to DGT/NCVT (verify with centre)', ta: 'DGT/NCVT இணைப்பு (மையத்துடன் சரிபார்க்கவும்)' },
    tradeIds: ['cnc-operator', 'electrician'],
    verifiedOn: '2024-11-01',
    publicPhone: '0000 000 000',
    centreCode: 'DEMO-TN-CBE-01',
  },
  {
    id: 'govt-iti-chennai',
    name: 'Government ITI, Chennai (Guindy)',
    districtId: 'chennai',
    type: 'govt_iti',
    scheme: 'nsqf',
    nsqfAffiliated: true,
    accreditation: { en: 'Affiliated to DGT/NCVT (verify with centre)', ta: 'DGT/NCVT இணைப்பு (மையத்துடன் சரிபார்க்கவும்)' },
    tradeIds: ['automotive', 'electronics', 'electrician'],
    verifiedOn: '2024-11-01',
    publicPhone: '0000 000 000',
    centreCode: 'DEMO-TN-CHN-01',
  },
  {
    id: 'tmr-industries',
    name: 'TMR Engineering Works (industry partner demo)',
    districtId: 'coimbatore',
    type: 'industry_partner',
    scheme: 'none',
    nsqfAffiliated: false,
    accreditation: { en: 'Industry partner for on-the-job training (demo)', ta: 'இட-அன்று பயிற்சி தொழில் கூட்டாளர் (டெமோ)' },
    tradeIds: ['cnc-operator', 'electronics'],
    verifiedOn: '2024-11-01',
    publicPhone: '0000 000 000',
    centreCode: 'DEMO-IND-CBE',
  },
];

/**
 * Demo outcome records. Only some trades have district-level rows on purpose:
 * a missing district row is the honest "local verified outcome data is
 * unavailable" signal, not something we paper over.
 */
export const OUTCOMES: OutcomeRecord[] = [
  {
    tradeId: 'electrician',
    districtId: null,
    earnings: {
      p25: M(14000, 'inr_per_month', 120, '6–12 months post-training, demo'),
      median: M(16500, 'inr_per_month', 120, '6–12 months post-training, demo'),
      p75: M(21000, 'inr_per_month', 120, '6–12 months post-training, demo'),
    },
    placementWithin90Days: M(62, 'percent', 120, 'demo cohort'),
    overallPlacement: M(71, 'percent', 120, 'demo cohort'),
    wageEmployed: M(68, 'percent', 120, 'demo cohort'),
    selfEmployed: M(18, 'percent', 120, 'demo cohort'),
    governmentSector: M(7, 'percent', 120, 'demo cohort'),
    completionRate: M(78, 'percent', 120, 'demo cohort'),
    medianTimeToFirstJobMonths: M(4, 'months', 120, 'demo cohort'),
    availableIn: 4,
  },
  {
    tradeId: 'electrician',
    districtId: 'salem',
    earnings: {
      p25: M(13000, 'inr_per_month', 35, 'Salem demo cohort'),
      median: M(15500, 'inr_per_month', 35, 'Salem demo cohort'),
      p75: M(19500, 'inr_per_month', 35, 'Salem demo cohort'),
    },
    placementWithin90Days: M(58, 'percent', 35, 'Salem demo cohort'),
    overallPlacement: M(66, 'percent', 35, 'Salem demo cohort'),
    wageEmployed: M(64, 'percent', 35, 'Salem demo cohort'),
    selfEmployed: M(20, 'percent', 35, 'Salem demo cohort'),
    governmentSector: M(6, 'percent', 35, 'Salem demo cohort'),
    completionRate: M(75, 'percent', 35, 'Salem demo cohort'),
    medianTimeToFirstJobMonths: M(5, 'months', 35, 'Salem demo cohort'),
    availableIn: 4,
  },
  {
    tradeId: 'cnc-operator',
    districtId: null,
    earnings: {
      p25: M(15000, 'inr_per_month', 90, '6–12 months post-training, demo'),
      median: M(17500, 'inr_per_month', 90, '6–12 months post-training, demo'),
      p75: M(22000, 'inr_per_month', 90, '6–12 months post-training, demo'),
    },
    placementWithin90Days: M(64, 'percent', 90, 'demo cohort'),
    overallPlacement: M(73, 'percent', 90, 'demo cohort'),
    wageEmployed: M(82, 'percent', 90, 'demo cohort'),
    selfEmployed: M(4, 'percent', 90, 'demo cohort'),
    governmentSector: M(3, 'percent', 90, 'demo cohort'),
    completionRate: M(76, 'percent', 90, 'demo cohort'),
    medianTimeToFirstJobMonths: M(3, 'months', 90, 'demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'cnc-operator',
    districtId: 'coimbatore',
    earnings: {
      p25: M(16000, 'inr_per_month', 40, 'Coimbatore demo cohort'),
      median: M(18500, 'inr_per_month', 40, 'Coimbatore demo cohort'),
      p75: M(23500, 'inr_per_month', 40, 'Coimbatore demo cohort'),
    },
    placementWithin90Days: M(70, 'percent', 40, 'Coimbatore demo cohort'),
    overallPlacement: M(79, 'percent', 40, 'Coimbatore demo cohort'),
    wageEmployed: M(85, 'percent', 40, 'Coimbatore demo cohort'),
    selfEmployed: M(3, 'percent', 40, 'Coimbatore demo cohort'),
    governmentSector: M(3, 'percent', 40, 'Coimbatore demo cohort'),
    completionRate: M(80, 'percent', 40, 'Coimbatore demo cohort'),
    medianTimeToFirstJobMonths: M(3, 'months', 40, 'Coimbatore demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'solar-pv',
    districtId: null,
    earnings: {
      p25: M(14000, 'inr_per_month', 70, '6–12 months post-training, demo'),
      median: M(16000, 'inr_per_month', 70, '6–12 months post-training, demo'),
      p75: M(20000, 'inr_per_month', 70, '6–12 months post-training, demo'),
    },
    placementWithin90Days: M(58, 'percent', 70, 'demo cohort'),
    overallPlacement: M(67, 'percent', 70, 'demo cohort'),
    wageEmployed: M(72, 'percent', 70, 'demo cohort'),
    selfEmployed: M(12, 'percent', 70, 'demo cohort'),
    governmentSector: M(5, 'percent', 70, 'demo cohort'),
    completionRate: M(74, 'percent', 70, 'demo cohort'),
    medianTimeToFirstJobMonths: M(4, 'months', 70, 'demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'solar-pv',
    districtId: 'salem',
    earnings: {
      p25: M(13500, 'inr_per_month', 22, 'Salem demo cohort'),
      median: M(15200, 'inr_per_month', 22, 'Salem demo cohort'),
      p75: M(19000, 'inr_per_month', 22, 'Salem demo cohort'),
    },
    placementWithin90Days: M(52, 'percent', 22, 'Salem demo cohort'),
    overallPlacement: M(61, 'percent', 22, 'Salem demo cohort'),
    wageEmployed: M(70, 'percent', 22, 'Salem demo cohort'),
    selfEmployed: M(14, 'percent', 22, 'Salem demo cohort'),
    governmentSector: M(4, 'percent', 22, 'Salem demo cohort'),
    completionRate: M(71, 'percent', 22, 'Salem demo cohort'),
    medianTimeToFirstJobMonths: M(5, 'months', 22, 'Salem demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'electronics',
    districtId: null,
    earnings: {
      p25: M(13000, 'inr_per_month', 80, '6–12 months post-training, demo'),
      median: M(15200, 'inr_per_month', 80, '6–12 months post-training, demo'),
      p75: M(19000, 'inr_per_month', 80, '6–12 months post-training, demo'),
    },
    placementWithin90Days: M(55, 'percent', 80, 'demo cohort'),
    overallPlacement: M(64, 'percent', 80, 'demo cohort'),
    wageEmployed: M(74, 'percent', 80, 'demo cohort'),
    selfEmployed: M(10, 'percent', 80, 'demo cohort'),
    governmentSector: M(6, 'percent', 80, 'demo cohort'),
    completionRate: M(73, 'percent', 80, 'demo cohort'),
    medianTimeToFirstJobMonths: M(4, 'months', 80, 'demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'automotive',
    districtId: null,
    earnings: {
      p25: M(13500, 'inr_per_month', 85, '6–12 months post-training, demo'),
      median: M(15800, 'inr_per_month', 85, '6–12 months post-training, demo'),
      p75: M(20500, 'inr_per_month', 85, '6–12 months post-training, demo'),
    },
    placementWithin90Days: M(57, 'percent', 85, 'demo cohort'),
    overallPlacement: M(66, 'percent', 85, 'demo cohort'),
    wageEmployed: M(76, 'percent', 85, 'demo cohort'),
    selfEmployed: M(12, 'percent', 85, 'demo cohort'),
    governmentSector: M(5, 'percent', 85, 'demo cohort'),
    completionRate: M(75, 'percent', 85, 'demo cohort'),
    medianTimeToFirstJobMonths: M(4, 'months', 85, 'demo cohort'),
    availableIn: 3,
  },
  {
    tradeId: 'automotive',
    districtId: 'chennai',
    earnings: {
      p25: M(14500, 'inr_per_month', 30, 'Chennai demo cohort'),
      median: M(17000, 'inr_per_month', 30, 'Chennai demo cohort'),
      p75: M(22000, 'inr_per_month', 30, 'Chennai demo cohort'),
    },
    placementWithin90Days: M(62, 'percent', 30, 'Chennai demo cohort'),
    overallPlacement: M(72, 'percent', 30, 'Chennai demo cohort'),
    wageEmployed: M(79, 'percent', 30, 'Chennai demo cohort'),
    selfEmployed: M(10, 'percent', 30, 'Chennai demo cohort'),
    governmentSector: M(5, 'percent', 30, 'Chennai demo cohort'),
    completionRate: M(78, 'percent', 30, 'Chennai demo cohort'),
    medianTimeToFirstJobMonths: M(3, 'months', 30, 'Chennai demo cohort'),
    availableIn: 3,
  },
];