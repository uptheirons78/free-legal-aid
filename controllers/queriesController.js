const Gratuito = require('../models/gratuito');
const Cliente = require('../models/cliente');
const Materia = require('../models/materia');
const Giudice = require('../models/giudice');
const Sede = require('../models/sede');

// Mostra le pratiche di gratuito patrocinio fatturate
exports.fatturate_duemiladiciotto = async (req, res, next) => {
  try {
    const list_gratuito = await Gratuito.find({
      decreto_liquidazione: 'SI',
      fatturazione: 'SI',
      data_fattura: { $gte: '2018-01-01', $lt: '2018-12-31' }
    })
      .populate('cliente')
      .populate('materia')
      .populate('giudice')
      .populate('sede')
      .sort({ fattura_elettronica: 1 });

    res.render('query_list', {
      title: 'Fascicoli Fatturati',
      gratuito_list: list_gratuito
    });
  } catch (err) {
    err => res.status(400).send(err);
  }
};

exports.fatturate_duemiladiciassette = async (req, res, next) => {
  try {
    const list_gratuito = await Gratuito.find({
      decreto_liquidazione: 'SI',
      fatturazione: 'SI',
      data_fattura: { $gte: '2017-01-01', $lt: '2017-12-31' }
    })
      .populate('cliente')
      .populate('materia')
      .populate('giudice')
      .populate('sede')
      .sort({ fattura_elettronica: 1 });

    res.render('query_list', {
      title: 'Fascicoli Fatturati',
      gratuito_list: list_gratuito
    });
  } catch (err) {
    err => res.status(400).send(err);
  }
};

exports.fatturate_duemilasedici = async (req, res, next) => {
  try {
    const list_gratuito = await Gratuito.find({
      decreto_liquidazione: 'SI',
      fatturazione: 'SI',
      data_fattura: { $gte: '2016-01-01', $lt: '2016-12-31' }
    })
      .populate('cliente')
      .populate('materia')
      .populate('giudice')
      .populate('sede')
      .sort({ fattura_elettronica: 1 });

    res.render('query_list', {
      title: 'Fascicoli Fatturati',
      gratuito_list: list_gratuito
    });
  } catch (err) {
    err => res.status(400).send(err);
  }
};
