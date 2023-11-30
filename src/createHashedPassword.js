// createHashedPassword.js
const bcrypt = require('bcryptjs');

const chosenPassword = 'secretariaSECRETARIA1567'; // The password you've decided on for the secretary

bcrypt.hash(chosenPassword, 10, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed Password:', hash);
    // Now you can insert this hash into the 'secretarias' table in your database manually
  }
});


