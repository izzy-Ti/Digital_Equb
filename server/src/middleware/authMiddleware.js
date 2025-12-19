import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
  const { token } = req.cookies
  if (!token) {
    return res.json({ success: false, message: 'Not authorized please login again' })
  }
  try {
    const tokenDecoded = jwt.verify(token, process.env.HASH_KEY)
    if (tokenDecoded.id) {
      req.body.userId = tokenDecoded.id
    } else {
      return res.json({ success: false, message: 'Not authorized please login again' })
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export default userAuth