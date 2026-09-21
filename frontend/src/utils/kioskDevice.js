const KIOSK_REG_NUM_KEY = 'medikiosk_hospital_registration_number';

export const getHospitalRegistrationNumber = () => {
  try {
    return localStorage.getItem(KIOSK_REG_NUM_KEY) || null;
  } catch (error) {
    console.error('Error reading hospital registration number:', error);
    return null;
  }
};

export const maskRegistrationNumber = (num) => {
  if (!num) return '';
  const clean = String(num).trim();
  if (clean.length <= 8) {
    return clean + 'xxxx';
  }
  return clean.substring(0, 8) + '-xxxx-xxxx-xxxx';
};

export const setHospitalRegistrationNumber = (registrationNumber) => {
  try {
    if (registrationNumber) {
      localStorage.setItem(KIOSK_REG_NUM_KEY, registrationNumber);
    } else {
      localStorage.removeItem(KIOSK_REG_NUM_KEY);
    }
    window.dispatchEvent(new Event('kiosk_device_changed'));
  } catch (error) {
    console.error('Error setting hospital registration number:', error);
  }
};

export const clearHospitalRegistrationNumber = () => {
  try {
    localStorage.removeItem(KIOSK_REG_NUM_KEY);
    window.dispatchEvent(new Event('kiosk_device_changed'));
  } catch (error) {
    console.error('Error clearing hospital registration number:', error);
  }
};
