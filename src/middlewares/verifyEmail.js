module.exports = (req, res, next) => {
    if(!req.user.verificated){
        return res.status(400).json({ message: "Please verificate your email" });
    } 

    next()
};
  