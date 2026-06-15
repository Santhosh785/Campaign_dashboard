export const formatPhone = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const withCountry = digits.startsWith('91') ? digits : `91${digits}`;
  return `+${withCountry}`;
};
