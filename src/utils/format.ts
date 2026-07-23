export const formatMoney = (amount) => {
  return Number(amount).toLocaleString();
};

export const parseMoney = (formattedString) => {
  if (!formattedString) return 0;
  return parseFloat(formattedString.replace(/,/g, '')) || 0;
};

export const formatTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
