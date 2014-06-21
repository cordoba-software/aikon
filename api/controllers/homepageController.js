/**
 * Created by dpamio on 20/06/14.
 */

module.exports = {
    index : function (req, res) {
        res.view('homepage', { title: 'Inicio' });
    }
};
