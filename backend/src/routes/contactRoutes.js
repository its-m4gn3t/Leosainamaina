const express = require('express');
const router = express.Router();
const {
  getAllContacts,
  createContact,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');

router.get('/', getAllContacts);
router.post('/', createContact);
router.put('/:id', updateContactStatus);
router.delete('/:id', deleteContact);

module.exports = router;