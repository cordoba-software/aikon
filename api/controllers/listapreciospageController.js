/**
 * ListaPreciosController
 *
 * @description :: Server-side logic for managing Listaprecios
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
    index : function (req, res) {
        res.view({ title: 'ListaDePrecios'});
    }
};

