const getRandomString = (): string => {
  const time = new Date()
  return `SG-ID-${time.getTime()}-${(Math.random() + 1)
    .toString(36)
    .substring(7)}`
}

export default getRandomString
