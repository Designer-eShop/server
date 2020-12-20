const validateInput = function (data) {
  return (
    data.name.match(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i) &&
    data.surname.match(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i) &&
    data.phone.length >= 8 &&
    data.phone.length <= 9 &&
    data.street &&
    data.city &&
    data.zip &&
    data.zip.length <= 6
  );
};

module.exports = { validateInput };
