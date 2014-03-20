exports.logout = function(req, res) {
    delete req.session.email;
    delete req.session.siteid;
    req.session.destroy(function () {
        return res.json({message: 'Logged out.'});
    });
};