exports.logout = function(req, res) {
    delete req.session.email;
    req.session.destroy(function () {
        return res.json({message: 'Logged out.'});
    });
};