exports.formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

exports.validateInput = (inputObj, requiredFields) => {
  const missingFields = [];
  for (const field of requiredFields) {
    if (inputObj[field] === undefined || inputObj[field] === null || inputObj[field] === '') {
      missingFields.push(field);
    }
  }
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};