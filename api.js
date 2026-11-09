const express = require('express');
const controller = require('./usercontroller');

const router = express.Router();

router.get('/articles', controller.index);                         // liste paginée (15)
router.get('/articles/:id', controller.show);                      // un article
router.post('/articles', controller.validate, controller.store);   // créer
router.put('/articles/:id', controller.validate, controller.update); // modifier
router.delete('/articles/:id', controller.destroy);                // supprimer (204)

module.exports = router;