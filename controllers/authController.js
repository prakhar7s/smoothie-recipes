const User = require('../models/User');
const jwt = require('jsonwebtoken');
// handle erros
const handleErrors = (err) => {
    let errors = { email: '', password: ''};

    // incorrect email
    if(err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }

    // incorrect password
    if(err.message === 'incorrect password') {
        errors.password = 'that password is incorrect';
    }

    // duplicate error ocde
    if(err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    //validation errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties  }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

const maxAge = 3 * 24 * 60 * 60; //3 days

const createToken = (id) => {
    return jwt.sign({ id }, 'my secret', {
        expiresIn: maxAge,
    });
}

// controller actions
module.exports.signup_get = (req, res) => {
    res.render('signup');
};

module.exports.login_get = (req, res) => {
    res.render('login');
};

module.exports.signup_post = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        res.status(201).json({user: user._id});
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
};

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge*1000});
        res.status(200).json({ user: user._id});
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

module.exports.logout_get = (req, res) => {
    //Can't delete jwt from server but can do this trick
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}