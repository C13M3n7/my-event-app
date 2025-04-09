export const formatPhoneNumber = (phone: string, countryCode = '+60') => {
    const digits = phone.replace(/\D/g, '');
    const withCountryCode = digits.startsWith(countryCode.replace(/\D/g, '')) 
      ? digits 
      : countryCode.replace(/\D/g, '') + digits;
    return `+${withCountryCode}`;
  };
  
  export const isValidEmail = (email: string): boolean => 
    /^\S+@\S+\.\S+$/.test(email);
  
  export const isValidPhone = (phone: string): boolean => 
    /^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''));
  
  export const startCountdown = (initialValue = 30, callback?: (count: number) => void) => {
    let count = initialValue;
    const timer = setInterval(() => {
      count--;
      if (callback) callback(count);
      if (count <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  };