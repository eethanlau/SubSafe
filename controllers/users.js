const User = require("../models/user");

module.exports.renderingRegister = (req, res) => {
  res.render("users/register");
};

module.exports.registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Subsafe, ${username}!`);
      res.redirect("/stations");
    });
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("register");
  }
};

module.exports.renderingLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  const { username } = req.body;
  req.flash("success", `Welcome back, ${username}!`);
  const redirectUrl = req.session.returnTo || "/stations";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout(req.user, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out Of Your Account!");
    res.redirect("/stations");
  });
};
