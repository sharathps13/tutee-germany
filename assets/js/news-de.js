/* ============================================================================
   THE TUTEE TIMES — GERMANY EDITION. News lines for the ticker + front page.  EDIT THIS FILE ONLY.
   ----------------------------------------------------------------------------
   Every day the page composes a fresh edition from the "pool" below (same edition for everyone
   on the same day). To add a story, copy one { ... } block into the pool.
     section : Visa | Work | Money | Study | Career | Life | Tutee News
     headline: short, shown in the moving news line
     deck    : one-line subtitle
     body    : one or more short paragraphs, in our own words
     source  : who it comes from; url: official page (https://) or ''
     cta     : contact | costs | pathway | unis   (optional button inside the story)
     show    : false hides a story without deleting it
   Rules: only publish what you have checked on an official source (Auswärtiges Amt / German
   missions in India, Make it in Germany, Bundesregierung, DAAD). No exact amounts unless verified.
   ============================================================================ */
window.TC_NEWS = {
  paper: 'The Tutee Times',
  motto: 'All the news a Germany-bound student needs',
  edition: 'Study in Germany',
  pool: [
    { section: 'Work', headline: 'Minimum wage rises to €13.90 an hour',
      deck: 'A further step to €14.60 is planned for January 2027',
      body: ['Germany’s statutory minimum wage went up from €12.82 to €13.90 an hour on 1 January 2026, with a further step to €14.60 planned for January 2027.',
             'It applies to student jobs too, so part-time work while you study now pays more.'],
      source: 'Federal Government', url: 'https://www.bundesregierung.de/' },
    { section: 'Work', headline: 'Students can work 140 full days a year',
      deck: 'Or 280 half days, plus student-assistant jobs at the university',
      body: ['Under the Skilled Immigration Act, international students may work 140 full days or 280 half days a year, up from 120/240.',
             'Jobs as a student assistant at your own university come on top of that.'],
      source: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/' },
    { section: 'Career', headline: '18 months to find a job after graduating',
      deck: 'Graduates may work without restriction while they search',
      body: ['Graduates of German universities can stay up to 18 months to look for a job that matches their degree, and may work without restriction during that time.'],
      source: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/', cta: 'pathway' },
    { section: 'Career', headline: 'Opportunity Card: a year to look for work',
      deck: 'The points-based Chancenkarte for qualified non-EU professionals',
      body: ['The Chancenkarte lets qualified non-EU professionals come to Germany for up to a year to look for work, with part-time work allowed while they search.'],
      source: 'Make it in Germany', url: 'https://www.make-it-in-germany.com/' },
    { section: 'Visa', headline: 'Indian applicants need an APS certificate',
      deck: 'Your academic documents are checked before the student visa',
      body: ['Students from India need a certificate from the Academic Evaluation Centre (APS) at the German Embassy before they can apply for a German student visa.',
             'Start early: the APS check verifies your school and university documents. Tutee Connect helps you prepare the file.'],
      source: 'German Missions in India', url: 'https://india.diplo.de/', cta: 'contact' },
    { section: 'Study', headline: 'Two intakes a year: winter and summer',
      deck: 'Winter semester starts in October, summer semester in April',
      body: ['German universities admit students for the winter semester (starting October) and, for many programmes, the summer semester (starting April).',
             'Deadlines differ by university and programme, so plan your application 9–12 months ahead.'],
      source: 'Tutee Connect counselling team', url: '', cta: 'contact' },
    { section: 'Money', headline: 'Tuition-free at most public universities',
      deck: 'You pay a semester contribution, not tuition',
      body: ['Most public universities in Germany charge no tuition fees for international students; you pay a semester contribution that often includes a public-transport ticket.',
             'Baden-Württemberg is an exception and charges tuition to non-EU students, and private universities set their own fees.'],
      source: 'Tutee Connect counselling team', url: '', cta: 'costs' },
    { section: 'Money', headline: 'Proof of funds: the blocked account',
      deck: 'Most students show living costs with a Sperrkonto',
      body: ['For a student visa you must show you can cover your living costs, usually with a blocked account (Sperrkonto). The required amount is set by the German authorities and can change.',
             'We confirm the current figure with you during your counselling.'],
      source: 'German Federal Foreign Office', url: 'https://www.auswaertiges-amt.de/', cta: 'costs' },
    { section: 'Study', headline: 'English or German? Pick your test',
      deck: 'IELTS or TOEFL for English-taught, TestDaF or DSH for German-taught',
      body: ['Many master’s programmes are taught in English and accept IELTS or TOEFL. German-taught programmes usually ask for TestDaF, DSH or a Goethe certificate. Minimum scores differ by programme.'],
      source: 'Tutee Connect counselling team', url: '', cta: 'unis' },
    { section: 'Study', headline: 'Studienkolleg: the foundation year',
      deck: 'A route to a German bachelor’s degree',
      body: ['If your school qualification does not give direct entry to a German bachelor’s degree, a one-year Studienkolleg prepares you and ends with an assessment exam.'],
      source: 'Tutee Connect counselling team', url: '', cta: 'contact' },
    { section: 'Life', headline: 'Health insurance before you enrol',
      deck: 'Universities ask for it at enrolment',
      body: ['You need health insurance to enrol at a German university and for your residence permit. We explain the options during your pre-departure briefing.'],
      source: 'Tutee Connect counselling team', url: '' },
    { section: 'Tutee News', headline: 'Your first counselling session is free',
      deck: 'Talk to our Chennai and Dubai teams',
      body: ['Your first consultation with Tutee Connect is free. Share your details and a counsellor will map your route to Germany with you: universities, APS, blocked account and visa.'],
      source: 'Tutee Connect', url: '', cta: 'contact' }
  ]
};
