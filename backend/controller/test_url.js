const urlSchema = require("../models/url_Schema");
const shortid = require("shortid");

async function test_geturl(req, res) {
  const allurls = await urlSchema.find({});
  return res.render("test", {
    urls: allurls,
  });
}
module.exports = {
    test_geturl,
};