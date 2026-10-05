import jwt from 'jsonwebtoken';

/**
 * Middleware that authenticates patient (token), doctor (dtoken), or admin (atoken)
 */
const authAny = async (req, res, next) => {
  try {
    const { token, dtoken, atoken } = req.headers;
    req.body = req.body || {};

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded.id;
        req.userId = decoded.id;
      } catch (e) {
        // invalid user token
      }
    }

    if (dtoken) {
      try {
        const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.body.docId = decoded.id;
        req.docId = decoded.id;
      } catch (e) {
        // invalid doc token
      }
    }

    if (atoken) {
      try {
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
        if (decoded.admin) {
          req.body.isAdmin = true;
        }
      } catch (e) {
        // invalid admin token
      }
    }

    if (!req.body.userId && !req.body.docId && !req.body.isAdmin) {
      return res.status(401).json({ success: false, message: "Unauthorized: No valid token provided" });
    }

    next();
  } catch (error) {
    console.error("AuthAny error:", error);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default authAny;
