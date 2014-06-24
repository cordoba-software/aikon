var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('La lista de precios', function () {
    'use strict';

    before(function () {
        browser.get("/lista-de-precios");
    });

    it("debería redireccionar a la página de registro si no hay ninguna empresa logueada.", function () {
        expect(element(by.id('requiereLogin')).isPresent()).to.eventually.be.true;
    });
});