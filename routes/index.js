const express = require('express');
const router = express.Router();
//require controllers modules
const materia_controller = require('../controllers/materiaController');
const giudice_controller = require('../controllers/giudiceController');
const sede_controller = require('../controllers/sedeController');
const clienti_controller = require('../controllers/clientiController');
const gratuito_controller = require('../controllers/patrocinioController');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.redirect('/catalog');
  res.render('index', {title: 'Free Legal Aid'});
});

/// MATERIA ROUTES ///
router.get('/materia/create', materia_controller.materia_create_get);
router.post('/materia/create', materia_controller.materia_create_post);
router.get('/materia/:id/delete', materia_controller.materia_delete_get);
router.post('/materia/:id/delete', materia_controller.materia_delete_post);
router.get('/materia/:id/update', materia_controller.materia_update_get);
router.post('/materia/:id/update', materia_controller.materia_update_post);
router.get('/materia/:id', materia_controller.materia_detail);
router.get('/materia', materia_controller.materia_list);

/// GIUDICI ROUTES ///
router.get('/giudici/create', giudice_controller.giudice_create_get);
router.post('/giudici/create', giudice_controller.giudice_create_post);
router.get('/giudici/:id/delete', giudice_controller.giudice_delete_get);
router.post('/giudici/:id/delete', giudice_controller.giudice_delete_post);
router.get('/giudici/:id/update', giudice_controller.giudice_update_get);
router.post('/giudici/:id/update', giudice_controller.giudice_update_post);
router.get('/giudici/:id', giudice_controller.giudice_detail);
router.get('/giudici', giudice_controller.giudice_list);

/// SEDE ROUTES ///
router.get('/sede/create', sede_controller.sede_create_get);
router.post('/sede/create', sede_controller.sede_create_post);
router.get('/sede/:id/delete', sede_controller.sede_delete_get);
router.post('/sede/:id/delete', sede_controller.sede_delete_post);
router.get('/sede/:id/update', sede_controller.sede_update_get);
router.post('/sede/:id/update', sede_controller.sede_update_post);
router.get('/sede/:id', sede_controller.sede_detail);
router.get('/sede', sede_controller.sede_list);

/// CLIENTI ROUTES ///
router.get('/clienti/create', clienti_controller.clienti_create_get);
router.post('/clienti/create', clienti_controller.clienti_create_post);
router.get('/clienti/:id/delete', clienti_controller.clienti_delete_get);
router.post('/clienti/:id/delete', clienti_controller.clienti_delete_post);
router.get('/clienti/:id/update', clienti_controller.clienti_update_get);
router.post('/clienti/:id/update', clienti_controller.clienti_update_post);
router.get('/clienti/:id', clienti_controller.clienti_detail);
router.get('/clienti', clienti_controller.clienti_list);

/// GRATUITO ROUTES ///
router.get('/gratuito/create', gratuito_controller.gratuito_create_get);
router.post('/gratuito/create', gratuito_controller.gratuito_create_post);
// router.get('/gratuito/:id/delete', gratuito_controller.gratuito_delete_get);
// router.post('/gratuito/:id/delete', gratuito_controller.gratuito_delete_post);
// router.get('/gratuito/:id/update', gratuito_controller.gratuito_update_get);
// router.post('/gratuito/:id/update', gratuito_controller.gratuito_update_post);
router.get('/gratuito/:id', gratuito_controller.gratuito_detail);
router.get('/gratuito', gratuito_controller.gratuito_list);

module.exports = router;
