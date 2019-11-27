const isEmpty = string => {
  return string.trim() == "" ? true : false;
};

const validateEmail = email => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

exports.validateSignUpData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty!";
  } else if (!validateEmail(data.email)) {
    errors.email = "Must be a valid email address!";
  }

  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords must match";
  }

  if (isEmpty(data.handle)) errors.handle = "Must not be empty!";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Must not be empty!";
  if (isEmpty(data.password)) errors.password = "Must not be empty!";

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
