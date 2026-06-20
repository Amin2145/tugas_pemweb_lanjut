export const formatRupiah = (num) => {
  return 'Rp ' + Number(num || 0).toLocaleString('id-ID')
}
