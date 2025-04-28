const { getUser } = require("../services/auth_uid");

// authentication
// soft scan
function checkForAuthorization(req, res, next) {
  // Check for token in cookies first
  const tokenCookies = req.cookies?.uid;

  // Check for Bearer token in Authorization header
  const authHeader = req.headers.authorization;
  let token = tokenCookies;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  req.user = null;
  if (!token) {
    console.log("No Authorization token found");
    return next();
  }
  // const token = tokenCookies;

  const user = getUser(token);
  req.user = user;
  next();
}

// authorization
// hard scan
// Role: admin, normal user
function restrictTo(roles) {
  return function (req, res, next) {
    if (!req.user || !req.user.role) {
      return res.redirect("/login");
    }

    if (!roles.includes(req.user.role)) {
      return res.end("unauthorized");
    }

    next();
  };
}

module.exports = {
  checkForAuthorization,
  restrictTo,
};

// ! for learning purpose only now we going with cleaner code
// async function restrictToLoggedInUsers(req, res, next) {
//   console.log("Request Headers:", req.headers);

//   // ! this is the way to get the cookie from the request when you use desktop browser
//   // const userUid = req.cookies?.uid;
//   // const user = getUser(userUid);

//   // ! this is the way to get the token from the request when you use mobile browser
//   const userUid = req.headers["authorization"];

//   // If no Authorization header, check cookies
//   if (!userUid && req.cookies?.uid) {
//     userUid = `Bearer ${req.cookies.uid}`;
//   }

//   if (!userUid) {
//     return res.redirect("/login");
//   }

//   const token = userUid.split("Bearer ")[1].trim();
//   const user = getUser(token);

//   if (!user) {
//     return res.redirect("/login");
//   }
//   req.user = user;
//   next();
// }

// async function checkAuth(req, res, next) {
//   // ! this is the way to get the cookie from the request when you use desktop browser
//   const userUid = req.headers["authorization"];
//   if (!userUid || !userUid.startsWith("Bearer ")) {
//     console.log("No Authorization header, skipping auth check");
//     return next();
//   }

//   const token = userUid.split("Bearer ")[1].trim();
//   const user = getUser(token);
//   req.user = user;
//   next();
// }

// module.exports = {
//   restrictToLoggedInUsers,
//   checkAuth,
// };
