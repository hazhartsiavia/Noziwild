// 1240 -> "€1,240"
export const formatPrice = (value) => `€${Number(value).toLocaleString('en-US')}`
