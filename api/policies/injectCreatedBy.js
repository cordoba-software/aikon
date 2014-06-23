/**
 * Created by dpamio on 28/05/14.
 */
/**
 * Passport Middleware
 *
 * This policy basically makes two things:
 *  1. It makes sure an user is in the session prior to add anything to the database.
 *  2. Adds the "createdBy" attribute to the model's entity being added with the id of the currently logged user.
 *
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
module.exports = function (req, res, next) {
    'use strict';
    if (req.method === "PUT" &&
            req.route.path.split('/').pop() === "create") {
        if (req.session.passport.user) {
            req.body.createdBy = req.user;
            req.body.tenant = req.user.id;
            return next();
        } else {
            return res.forbidden('You are not permitted to perform this action.');
        }
    } else if (req.method === "GET" &&
            req.session.passport.user) {
        req.query = {where : {tenant: req.user.id}};
    }
    return next();
};