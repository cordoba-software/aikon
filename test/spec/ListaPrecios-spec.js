var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('La lista de precios', function () {
    'use strict';

    before(function () {
        browser.get("/");
    });

    describe('deberia tener un boton de agregar que', function () {
        it('exista', function () {
            expect(element(by.id('agregar')).isPresent()).to.eventually.be.true;
        });
        it('agregue un item nuevo', function () {
            var cantArticulos = element(by.id("lista")).length;
            element(by.id('nuevoNombre')).sendKeys('Genius Automated');
            element(by.id('nuevoPrecio')).sendKeys('150');
            element(by.id('agregar')).click();
            expect(element(by.id('lista')).length).to.eventually.equal(3);
        });

    });
});