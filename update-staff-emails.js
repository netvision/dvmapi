/**
 * Update staff login emails from personal emails to official @dalmiatrusts.in emails
 * Data sourced from stafflist.xls (columns: Personal Email Id col 7, Official Email Id col 51)
 */
import { config } from 'dotenv';
config();
import { connectDatabase } from './src/database/connection.js';

// Mapping: current email in DB (lowercase) → official email
// Source: stafflist.xls - Personal Email Id (col 7) and Official Email Id (col 51)
const emailMap = [
  // [currentEmail, officialEmail]
  ['shaktisingh0602@gmail.com',        'shakti.singh@dalmiatrusts.in'],
  ['aditya4mailme@gmail.com',           'kumar.aditya@dalmiatrusts.in'],
  ['rajeshkumar12888@gmail.com',        'rajesh.kumar@dalmiatrusts.in'],
  ['sumitsaini86171@gmail.com',         'sumit.saini@dalmiatrusts.in'],
  ['shaanusir@gmail.com',               'sandeep.sharma1@dalmiatrusts.in'],
  ['nareshsharmans06@gmail.com',        'naresh.sharma@dalmiatrusts.in'],
  ['kamals624@gmail.com',               'kamal.singh@dalmiatrusts.in'],
  ['manojsharma.kumar1989@gmail.com',   'manoj.sharma@dalmiatrusts.in'],
  ['vinodbrijeshpoonia@gmail.com',      'vinod.kumari@dalmiatrusts.in'],
  ['krishankumarsurajgarh@gmail.com',   'krishan.kalirawana@dalmiatrusts.in'],
  ['namitac24@gmail.com',               'namita.choudhary@dalmiatrusts.in'],
  ['abhiramananda2@gmail.com',          'abhirama.nanda@dalmiatrusts.in'],
  ['karan.singhks@hotmail.com',         'karan.singh@dalmiatrusts.in'],
  ['aacharyadharmendra@gmail.com',      'dharmendra.tiwari@dalmiatrusts.in'],
  ['arttodaykids21@gmail.com',          'jaideep.daiya@dalmiatrusts.in'],
  ['sarika.savesh@gmail.com',           'sarika.saxena@dalmiatrusts.in'],
  ['sunna.boran@gmail.com',             'sunita.boran@dalmiatrusts.in'],
  ['sikander.pandey@dalmiatrusts.in',   'sikandar.pandey@dalmiatrusts.in'],   // fix spelling (sikander→sikandar)
  ['aniljha590@gmail.com',              'anil.jha@dalmiatrusts.in'],
  ['ak2255043@gmail.com',               'himanshu.poonia@dalmiatrusts.in'],
  ['ravitapilani@gmail.com',            'ravita.sharma@dalmiatrusts.in'],
  ['balodasonam4u@gmail.com',           'sonam.baloda@dalmiatrusts.in'],
  ['nuniasheela@gmail.com',             'sheela.nunia@dalmiatrusts.in'],
  ['vinitarock7@gmail.com',             'vinita.chaudhary@dalmiatrusts.in'],
  ['anita.sharma130272@gmail.com',      'anita.sharma@dalmiatrusts.in'],
  ['jamuna.saini2009@gamil.com',        'jamuna.saini@dalmiatrusts.in'],
  ['bhattmukesh744@gmail.com',          'mukesh.bhatt@dalmiatrusts.in'],
  ['ranjeet.tiwari@gmail.com',          'ranjeet.tiwari@dalmiatrusts.in'],
  ['soniadvm.15@gmail.com',             'sonia.saini@dalmiatrusts.in'],
  ['pkedia271114@gmail.com',            'priya.kedia@dalmiatrusts.in'],
  ['goswaminishapuri@gmail.com',        'nishapuri.goswami@dalmiatrusts.in'],
  ['nitasharma551985@gmail.com',        'nita.sharma@dalmiatrusts.in'],
  ['asha.skj@gmail.com',                'asha.jahangid@dalmiatrusts.in'],
  ['komal2022anuj@gmail.com',           'komal.sharma@dalmiatrusts.in'],
  ['41@staff.institute.local',          'sunita.kumari@dalmiatrusts.in'],      // SUNITA KUMARI - no personal email
  ['anilkulhar91@gmail.com',            'anil.kulhar@dalmiatrusts.in'],
  ['khushbukanwar268@gmail.com',        'khushbu.kanwar@dalmiatrusts.in'],
  ['anitaramprasadjangir@gmail.com',    'anita.nangalia@dalmiatrusts.in'],
  ['sahlawat24@gmail.com',              'seema.kumari@dalmiatrusts.in'],
  ['anitarana1001@gmail.com',           'anita.rana@dalmiatrusts.in'],
  ['lakshaykumawat2009@gmail.com',      'pareeksha.byadwal@dalmiatrusts.in'],
  ['sonu111949@gmail.com',              'sonu.verma@dalmiatrusts.in'],
  ['abhayharlalka@gmail.com',           'abhay.harlalka@dalmiatrusts.in'],
  ['rakesh@jangid.co.in',               'it@dalmiatrusts.in'],
  ['rakeshsinghje@gmail.com',           'rakesh.singh@dalmiatrusts.in'],
  ['sarvesh.annant@gmail.com',          'sarvesh.saxena@dalmiatrusts.in'],
  // vijaykaushik@dalmiatrusts.in is already correct - skip
  ['rajnunia2@gmail.com',               'krishna.jhajharia@dalmiatrusts.in'],
  ['mukeshkumar10993@gmail.com',        'mukesh.kumar@dalmiatrusts.in'],
  ['sumitkumarsoni544@gmial.com',       'sumit.soni@dalmiatrusts.in'],         // also fixes typo in personal email
  ['ml333026@gmail.com',                'madan.saini@dalmiatrusts.in'],
  ['59@staff.institute.local',          'bala.saini@dalmiatrusts.in'],         // BALA SAINI - no personal email
  ['60@staff.institute.local',          'manju.sharma@dalmiatrusts.in'],       // MANJU - no personal email
  ['61@staff.institute.local',          'seema.bedwal@dalmiatrusts.in'],       // SEEMA - no personal email
  ['payalsaini275@gmail.com',           'payal.saini@dalmiatrusts.in'],
  ['atramminakshi659@gmail.com',        'minakshi.atram@dalmiatrusts.in'],
  ['emp0064@staff.institute.local',     'babulal.jangir@dalmiatrusts.in'],     // BABULAL - no personal email
  ['emp0065@staff.institute.local',     'surendra.kumar@dalmiatrusts.in'],     // SURENDRA KUMAR - no personal email
  ['sami.mishra1972@gmail.com',         'samiksha.mishra@dalmiatrusts.in'],
  ['dagarpartibha12@gmail.com',         'partibha.dagar@dalmiatrusts.in'],
  ['hemlatasomra3@gmail.com',           'hemlata.somra@dalmiatrusts.in'],
  ['mailmesangeeta10@gmail.com',        'sangeeta.rao@dalmiatrusts.in'],
  ['monubittu95@gmail.com',             'monika.gill@dalmiatrusts.in'],
  ['sampatsharma09123@gmail.com',       'sampat.sharma@dalmiatrusts.in'],
];

const pool = await connectDatabase();

let updated = 0;
let skipped = 0;
const errors = [];

for (const [currentEmail, officialEmail] of emailMap) {
  try {
    // Check if current email exists
    const existing = await pool.query(
      'SELECT id, email FROM users WHERE LOWER(email) = $1',
      [currentEmail.toLowerCase()]
    );

    if (existing.rows.length === 0) {
      console.log(`SKIP  - Not found in DB: ${currentEmail}`);
      skipped++;
      continue;
    }

    // Check if official email already taken by a different user
    const conflict = await pool.query(
      'SELECT id FROM users WHERE LOWER(email) = $1 AND LOWER(email) != $2',
      [officialEmail.toLowerCase(), currentEmail.toLowerCase()]
    );

    if (conflict.rows.length > 0) {
      console.log(`ERROR - Official email already exists: ${officialEmail}`);
      errors.push({ currentEmail, officialEmail, reason: 'conflict' });
      continue;
    }

    const result = await pool.query(
      'UPDATE users SET email = $1, updated_at = NOW() WHERE LOWER(email) = $2',
      [officialEmail, currentEmail.toLowerCase()]
    );

    if (result.rowCount > 0) {
      console.log(`OK    - ${currentEmail} → ${officialEmail}`);
      updated++;
    }
  } catch (err) {
    console.error(`ERROR - ${currentEmail}: ${err.message}`);
    errors.push({ currentEmail, officialEmail, reason: err.message });
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} not found, ${errors.length} errors`);
if (errors.length > 0) {
  console.log('Errors:', errors);
}
process.exit(0);
