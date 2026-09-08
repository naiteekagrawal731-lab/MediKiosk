const KIOSK_REG_NUM_KEY = 'medikiosk_hospital_registration_number';

export const getHospitalRegistrationNumber = () => {
  try {
    console.log("start")
    return localStorage.getItem(KIOSK_REG_NUM_KEY) || null;
  } catch (error) {
    console.error('Error reading hospital registration number:', error);
    return null;
  }
};

export const setHospitalRegistrationNumber = (registrationNumber) => {
  try {
    if (registrationNumber) {
      localStorage.setItem(KIOSK_REG_NUM_KEY, registrationNumber);
    } else {
      localStorage.removeItem(KIOSK_REG_NUM_KEY);
    }
  } catch (error) {
    console.error('Error setting hospital registration number:', error);
  }
};

export const clearHospitalRegistrationNumber = () => {
  try {
    localStorage.removeItem(KIOSK_REG_NUM_KEY);
  } catch (error) {
    console.error('Error clearing hospital registration number:', error);
  }
};
