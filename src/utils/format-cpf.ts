export function AddCPFmask(value: string) {
  if (!value) return '';
  if (value.length > 14) return value.slice(0, 14);
  return value.replace(/\D/gi, '').replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/gi, '$1.$2.$3-$4')
}

export function removeCPFMask(maskedCPF: string) {
  return maskedCPF.replace(/\./gi, '').replace('-', '')
}